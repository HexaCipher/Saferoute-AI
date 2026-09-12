"""
SafeRoute AI — "Fix This First" Prioritization Engine
Implements Step 10: Decision support identifying which road segments
authorities should fix first and which intervention yields the highest expected safety gain.
Uses high-performance vectorized batch inference (<200ms).
"""

from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from backend.services.risk_engine import risk_engine
from backend.services.simulator_engine import INTERVENTION_METADATA
from backend.services.vru_engine import vru_engine


class Prioritizer:
    @staticmethod
    def get_fix_this_first_recommendations(
        corridor_id: Optional[str] = None,
        limit: int = 15
    ) -> Dict[str, Any]:
        """
        Ranks segments by Expected Safety Benefit:
        Priority Score = (100 - Safety Score) * Severity Multiplier * Max Single Intervention Gain.
        """
        df = risk_engine.df_segments.copy()
        if corridor_id:
            df = df[df['corridor_id'] == corridor_id.upper()].copy()

        if df.empty:
            return {
                "total_analyzed_segments": 0,
                "critical_priority_count": 0,
                "high_priority_count": 0,
                "recommendations": []
            }

        # Vectorized feature matrix
        lanes = df['lanes'].fillna(2.0).astype(float)
        speed = df['speed_limit_kph'].fillna(50.0).astype(float)
        junc = df['junction_density_per_km'].astype(float)
        cross = df['crossing_count'].astype(float)
        bus = df['bus_stop_count'].astype(float)
        lit = (df['street_lighting'] == 'yes').astype(float)
        st_tot = df['btp_station_total_cases_2023'].astype(float)
        st_fat = df['btp_station_fatal_cases_2023'].astype(float)

        st_fat_ratio = st_fat / np.maximum(1.0, st_tot)
        night_speed = speed * (1.0 - lit)
        cross_deficit = np.maximum(0.0, bus - cross)
        junc_transit = junc * (bus + 1.0)

        X_base = pd.DataFrame({
            'lanes': lanes,
            'speed_limit_kph': speed,
            'junction_density_per_km': junc,
            'crossing_count': cross,
            'bus_stop_count': bus,
            'lighting_is_verified_yes': lit,
            'station_total_cases': st_tot,
            'station_fatal_cases': st_fat,
            'station_fatality_ratio': st_fat_ratio,
            'night_speed_index': night_speed,
            'crossing_deficit': cross_deficit,
            'junction_transit_conflict': junc_transit
        })

        base_scores = df['safety_score'].values

        # Vectorized evaluation of candidate interventions
        interventions_to_test = [
            "street_lighting_upgrade",
            "speed_enforcement_camera",
            "pedestrian_crossing_refuge",
            "speed_calming_measures",
            "junction_redesign"
        ]
        
        gains_matrix = []
        for it in interventions_to_test:
            X_mod = X_base.copy()
            if it == "street_lighting_upgrade":
                X_mod['lighting_is_verified_yes'] = 1.0
                X_mod['night_speed_index'] = 0.0
            elif it == "speed_enforcement_camera":
                X_mod['speed_limit_kph'] = np.minimum(50.0, X_mod['speed_limit_kph'] * 0.85)
                X_mod['night_speed_index'] = X_mod['speed_limit_kph'] * (1.0 - X_mod['lighting_is_verified_yes'])
            elif it == "pedestrian_crossing_refuge":
                X_mod['crossing_count'] += 2.0
                X_mod['crossing_deficit'] = np.maximum(0.0, X_mod['bus_stop_count'] - X_mod['crossing_count'])
            elif it == "speed_calming_measures":
                X_mod['speed_limit_kph'] = np.maximum(30.0, X_mod['speed_limit_kph'] - 12.0)
                X_mod['night_speed_index'] = X_mod['speed_limit_kph'] * (1.0 - X_mod['lighting_is_verified_yes'])
            elif it == "junction_redesign":
                X_mod['junction_density_per_km'] *= 0.60
                X_mod['junction_transit_conflict'] = X_mod['junction_density_per_km'] * (X_mod['bus_stop_count'] + 1.0)
                
            sim_scores = np.round(np.clip(100.0 * (1.0 - risk_engine.model.predict(X_mod)), 0.0, 100.0), 1)
            gains = np.maximum(0.0, np.round(sim_scores - base_scores, 1))
            gains_matrix.append(gains)

        gains_matrix = np.array(gains_matrix) # shape: (5, num_segments)
        best_indices = np.argmax(gains_matrix, axis=0) # best intervention index per segment
        best_gains = np.max(gains_matrix, axis=0)

        # Compute priority scores
        risk_deficits = 100.0 - base_scores
        station_fatals = df['btp_station_fatal_cases_2023'].fillna(10.0).values
        station_totals = df['btp_station_total_cases_2023'].fillna(50.0).values
        severity_mults = 1.0 + (station_fatals / np.maximum(1.0, station_totals) * 2.5)

        priority_scores = np.round(risk_deficits * severity_mults * (best_gains + 1.0), 2)

        df['best_it_idx'] = best_indices
        df['best_gain'] = best_gains
        df['priority_score'] = priority_scores

        # Sort descending by priority_score
        top_df = df.sort_values(by='priority_score', ascending=False).head(limit)

        recommendations = []
        for rank, (_, row) in enumerate(top_df.iterrows(), start=1):
            it_key = interventions_to_test[int(row['best_it_idx'])]
            it_label = INTERVENTION_METADATA.get(it_key, {}).get('label', it_key)
            best_gain = float(row['best_gain'])
            curr_score = float(row['safety_score'])
            
            vru_info = vru_engine.assess_vulnerability(row)
            justification = (
                f"Segment exhibits high hazard ({row['risk_tier']} tier, Safety Score {curr_score}/100) "
                f"in {row['btp_station']}. Primary risk driven by vulnerable {vru_info['primary_vulnerable_group'].lower()}. "
                f"Implementing {it_label} delivers the highest expected safety gain (+{best_gain:.1f} pts)."
            )

            recommendations.append({
                "priority_rank": rank,
                "segment_id": row['segment_id'],
                "corridor_id": row['corridor_id'],
                "corridor_name": row['corridor_name'],
                "road_name": row['road_name'],
                "current_safety_score": curr_score,
                "current_risk_tier": row['risk_tier'],
                "confidence_level": row['confidence_level'],
                "primary_vulnerable_group": vru_info['primary_vulnerable_group'],
                "recommended_intervention": it_key,
                "recommended_intervention_label": it_label,
                "expected_safety_gain": best_gain,
                "simulated_safety_score": round(min(100.0, curr_score + best_gain), 1),
                "priority_score": float(row['priority_score']),
                "justification": justification
            })

        critical_count = int((df['risk_tier'] == 'CRITICAL').sum())
        high_count = int(df['risk_tier'].isin(['CRITICAL', 'HIGH']).sum())

        return {
            "total_analyzed_segments": len(df),
            "critical_priority_count": critical_count,
            "high_priority_count": high_count,
            "recommendations": recommendations
        }


prioritizer = Prioritizer()
