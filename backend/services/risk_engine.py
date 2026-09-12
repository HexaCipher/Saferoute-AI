"""
SafeRoute AI — Hybrid Risk & Safety Score Engine
Implements Step 5 (Risk Target), Step 6 (Safety Score), and Step 7 (Explainability).

Target Formulation:
  Macro Risk: BTP 2023 Station Crash Intensity + Fatality Severity Ratio
  Micro Risk: Junction Density + Speed Exposure + Transit/Crossing Deficit + Lanes
  Night Multiplier: 1.45x (unverified/unlit) vs 1.15x (verified lit) based on MoRTH data.
Model: Explainable Random Forest Regressor with 5-Fold Cross-Validation.
"""

import os
import joblib
import pandas as pd
import geopandas as gpd
import numpy as np
from typing import Dict, List, Tuple, Any, Optional
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import KFold, cross_val_score

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARQUET_PATH = os.path.join(BASE_DIR, "data", "processed", "bengaluru_500m_segments.parquet")
MODEL_PATH = os.path.join(BASE_DIR, "data", "processed", "risk_model.joblib")


class RiskEngine:
    def __init__(self):
        self.model: Optional[RandomForestRegressor] = None
        self.feature_cols = [
            'lanes', 'speed_limit_kph', 'junction_density_per_km',
            'crossing_count', 'bus_stop_count', 'lighting_is_verified_yes',
            'station_total_cases', 'station_fatal_cases'
        ]
        self.feature_importances: Dict[str, float] = {}
        self.cv_metrics: Dict[str, float] = {}
        self.df_segments: Optional[pd.DataFrame] = None
        self._initialize()

    def _compute_hybrid_target(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """Formulates the composite risk index grounded in BTP stats and OSM features."""
        # 1. Macro Signal from BTP 2023
        tot_max = df['btp_station_total_cases_2023'].max()
        fat_ratio = df['btp_station_fatal_cases_2023'] / np.maximum(1.0, df['btp_station_total_cases_2023'])
        fat_max = fat_ratio.max()
        macro = 0.5 * (df['btp_station_total_cases_2023'] / tot_max) + 0.5 * (fat_ratio / fat_max)

        # 2. Micro Signal from OSM Infrastructure
        junc_max = df['junction_density_per_km'].max()
        junc_norm = df['junction_density_per_km'] / max(1e-5, junc_max)
        speed_eff = df['speed_limit_kph'].fillna(50.0) / 80.0
        
        # Conflict between transit stops and safe crossings
        transit_conflict = df['bus_stop_count'] / (df['crossing_count'] + 1.0)
        transit_norm = transit_conflict / max(1e-5, transit_conflict.max())
        lane_norm = df['lanes'].fillna(2.0) / 5.0

        infra = 0.30 * junc_norm + 0.30 * speed_eff + 0.25 * transit_norm + 0.15 * lane_norm
        
        # 3. Night Multiplier (MoRTH calibration)
        night_mult = np.where(df['street_lighting'] == 'yes', 1.15, 1.45)

        raw_target = macro * infra * night_mult
        target = (raw_target - raw_target.min()) / (raw_target.max() - raw_target.min() + 1e-5)

        # Build feature matrix
        X = pd.DataFrame({
            'lanes': df['lanes'].fillna(2.0).astype(float),
            'speed_limit_kph': df['speed_limit_kph'].fillna(50.0).astype(float),
            'junction_density_per_km': df['junction_density_per_km'].astype(float),
            'crossing_count': df['crossing_count'].astype(float),
            'bus_stop_count': df['bus_stop_count'].astype(float),
            'lighting_is_verified_yes': (df['street_lighting'] == 'yes').astype(float),
            'station_total_cases': df['btp_station_total_cases_2023'].astype(float),
            'station_fatal_cases': df['btp_station_fatal_cases_2023'].astype(float)
        })
        return X, target

    def _initialize(self):
        """Loads data, trains or loads the model, and enriches segment data."""
        if not os.path.exists(PARQUET_PATH):
            raise FileNotFoundError(f"Missing processed segments: {PARQUET_PATH}")
            
        df = gpd.read_parquet(PARQUET_PATH)
        X, y = self._compute_hybrid_target(df)

        if os.path.exists(MODEL_PATH):
            saved = joblib.load(MODEL_PATH)
            self.model = saved['model']
            self.cv_metrics = saved['cv_metrics']
            self.feature_importances = saved['feature_importances']
        else:
            rf = RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)
            cv_scores = cross_val_score(rf, X, y, cv=5, scoring='r2')
            rf.fit(X, y)
            
            self.model = rf
            self.cv_metrics = {
                "mean_cv_r2": float(round(cv_scores.mean(), 3)),
                "fold_r2_scores": [float(round(s, 3)) for s in cv_scores]
            }
            self.feature_importances = {
                col: float(round(imp, 4))
                for col, imp in zip(self.feature_cols, rf.feature_importances_)
            }
            joblib.dump({
                'model': self.model,
                'cv_metrics': self.cv_metrics,
                'feature_importances': self.feature_importances
            }, MODEL_PATH)

        # Enrich segments with model predictions
        predicted_risk = self.model.predict(X)
        safety_scores = np.round(np.clip(100.0 * (1.0 - predicted_risk), 0.0, 100.0), 1)
        
        df['risk_score'] = np.round(predicted_risk, 4)
        df['safety_score'] = safety_scores
        df['risk_tier'] = df['safety_score'].apply(self.get_risk_tier)
        df['confidence_level'] = df.apply(self.get_confidence_level, axis=1)
        df['night_risk_multiplier'] = np.where(df['street_lighting'] == 'yes', 1.15, 1.45)
        
        self.df_segments = df

    @staticmethod
    def get_risk_tier(safety_score: float) -> str:
        """Maps 0-100 safety score to standard risk categories."""
        if safety_score < 40.0:
            return "CRITICAL"
        elif safety_score < 60.0:
            return "HIGH"
        elif safety_score < 75.0:
            return "MEDIUM"
        else:
            return "LOW"

    @staticmethod
    def get_confidence_level(row: pd.Series) -> str:
        """Determines confidence based on spatial overlap ratio and feature availability."""
        overlap = row.get('btp_overlap_ratio', 1.0)
        has_speed = bool(row.get('speed_limit_available', 0))
        has_lanes = bool(row.get('lane_count_available', 0))
        
        if overlap >= 0.85 and (has_speed or has_lanes):
            return "HIGH"
        elif overlap >= 0.50:
            return "MEDIUM"
        else:
            return "LOW"

    def predict_features(self, feature_row: Dict[str, Any]) -> Tuple[float, float, str]:
        """Predicts (risk_score, safety_score, risk_tier) from a single feature dictionary."""
        x_vec = pd.DataFrame([{
            'lanes': float(feature_row.get('lanes') or 2.0),
            'speed_limit_kph': float(feature_row.get('speed_limit_kph') or 50.0),
            'junction_density_per_km': float(feature_row.get('junction_density_per_km') or 0.0),
            'crossing_count': float(feature_row.get('crossing_count') or 0.0),
            'bus_stop_count': float(feature_row.get('bus_stop_count') or 0.0),
            'lighting_is_verified_yes': 1.0 if feature_row.get('street_lighting') == 'yes' else 0.0,
            'station_total_cases': float(feature_row.get('btp_station_total_cases_2023') or 100.0),
            'station_fatal_cases': float(feature_row.get('btp_station_fatal_cases_2023') or 20.0)
        }])
        
        pred_risk = float(np.clip(self.model.predict(x_vec)[0], 0.0, 1.0))
        safety_score = round(float(np.clip(100.0 * (1.0 - pred_risk), 0.0, 100.0)), 1)
        risk_tier = self.get_risk_tier(safety_score)
        return pred_risk, safety_score, risk_tier

    def explain_segment(self, segment_row: pd.Series) -> Dict[str, Any]:
        """
        Step 7 Explainability: Computes feature attribution explaining why this segment is risky.
        Derived directly from feature values and tree model importance weights.
        """
        factors = []
        
        # 1. Station Fatal Crash Baseline
        fatal_cases = segment_row.get('btp_station_fatal_cases_2023', 0)
        if fatal_cases >= 25:
            factors.append({
                "factor": "high_historical_fatalities",
                "label": f"High Station Fatality History ({int(fatal_cases)} fatal crashes in 2023)",
                "direction": "increases_risk",
                "raw_value": float(fatal_cases),
                "weight": self.feature_importances.get('station_fatal_cases', 0.5)
            })

        # 2. Junction Density Conflict Points
        junc_density = segment_row.get('junction_density_per_km', 0.0)
        if junc_density >= 3.0:
            factors.append({
                "factor": "high_junction_density",
                "label": f"Frequent Intersection Friction ({junc_density:.1f} junctions/km)",
                "direction": "increases_risk",
                "raw_value": float(junc_density),
                "weight": self.feature_importances.get('junction_density_per_km', 0.25)
            })

        # 3. Speed Limit Exposure
        speed = segment_row.get('speed_limit_kph') or 50.0
        if speed >= 50.0:
            factors.append({
                "factor": "high_operating_speed",
                "label": f"Elevated Corridor Speed Limit ({int(speed)} km/h)",
                "direction": "increases_risk",
                "raw_value": float(speed),
                "weight": self.feature_importances.get('speed_limit_kph', 0.16)
            })

        # 4. Bus Stop vs Crossing Deficit
        bus_stops = segment_row.get('bus_stop_count', 0)
        crossings = segment_row.get('crossing_count', 0)
        if bus_stops >= 1 and crossings == 0:
            factors.append({
                "factor": "transit_stops_without_crossing",
                "label": f"Bus Transit Friction ({int(bus_stops)} stops) with Zero Pedestrian Crossings",
                "direction": "increases_risk",
                "raw_value": float(bus_stops),
                "weight": self.feature_importances.get('bus_stop_count', 0.05)
            })
        elif crossings >= 3:
            factors.append({
                "factor": "safe_crossings_available",
                "label": f"Multiple Pedestrian Crossings Mapped ({int(crossings)} crossings)",
                "direction": "reduces_risk",
                "raw_value": float(crossings),
                "weight": self.feature_importances.get('crossing_count', 0.02)
            })

        # 5. Night Street Lighting
        lighting = segment_row.get('street_lighting', 'unverified')
        if lighting == 'unverified':
            factors.append({
                "factor": "unverified_night_lighting",
                "label": "Unverified Ambient Street Lighting (Night Dark Spot Risk)",
                "direction": "increases_risk",
                "raw_value": 0.0,
                "weight": 0.08
            })
        elif lighting == 'yes':
            factors.append({
                "factor": "verified_street_lighting",
                "label": "Verified Continuous Street Lighting",
                "direction": "reduces_risk",
                "raw_value": 1.0,
                "weight": 0.08
            })

        # Normalize relative contributions
        total_weight = sum(f['weight'] for f in factors) or 1.0
        for f in factors:
            f['relative_contribution_pct'] = round((f['weight'] / total_weight) * 100.0, 1)

        # Generate readable summary
        top_factor_labels = [f['label'] for f in factors if f['direction'] == 'increases_risk'][:2]
        if top_factor_labels:
            summary = f"Risk driven primarily by {top_factor_labels[0]}"
            if len(top_factor_labels) > 1:
                summary += f" and {top_factor_labels[1]}."
            else:
                summary += "."
        else:
            summary = "Corridor exhibits standard baseline risk characteristics."

        return {
            "summary": summary,
            "top_contributing_factors": factors
        }


# Global singleton instance
risk_engine = RiskEngine()
