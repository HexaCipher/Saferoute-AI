"""
SafeRoute AI — Vulnerable Road Users (VRU) Engine
Implements Step 8: Identifying specific road-user vulnerability profiles (Two-wheelers vs Pedestrians).

Grounded in MoRTH & NCRB empirical findings for Bengaluru:
- Two-wheelers represent 45.3% of road deaths in Bengaluru.
- Pedestrians represent 36.8% of road deaths.
- This component generates an estimated vulnerability profile based on physical roadway evidence.
"""

from typing import Dict, Any
import pandas as pd


class VRUEngine:
    @staticmethod
    def assess_vulnerability(segment_row: pd.Series) -> Dict[str, Any]:
        """
        Assesses two-wheeler and pedestrian vulnerability tiers based on
        speed limits, lane configuration, intersection frequency, and transit friction.
        """
        speed = segment_row.get('speed_limit_kph') or 50.0
        lanes = segment_row.get('lanes') or 2.0
        junc_density = segment_row.get('junction_density_per_km', 0.0)
        bus_stops = segment_row.get('bus_stop_count', 0)
        crossings = segment_row.get('crossing_count', 0)

        # 1. Two-Wheeler Vulnerability Assessment
        # High speeds + multi-lane roads + junction weaving create extreme risks for two-wheelers
        if speed >= 60.0 and junc_density >= 3.0:
            two_wheeler_risk = "CRITICAL"
        elif speed >= 50.0 or lanes >= 3.0 or junc_density >= 2.0:
            two_wheeler_risk = "HIGH"
        else:
            two_wheeler_risk = "MODERATE"

        # 2. Pedestrian Vulnerability Assessment
        # Commuters alighting at bus stops without zebra/grade-separated crossings face critical danger
        if bus_stops >= 1 and crossings == 0:
            pedestrian_risk = "CRITICAL"
        elif bus_stops >= 1 and crossings <= 1:
            pedestrian_risk = "HIGH"
        elif crossings == 0 and lanes >= 3.0:
            pedestrian_risk = "HIGH"
        else:
            pedestrian_risk = "MODERATE"

        # 3. Determine Primary Vulnerable Group
        if pedestrian_risk == "CRITICAL":
            primary_group = "Pedestrians"
            justification = (
                f"Segment has {int(bus_stops)} active transit stops with zero mapped pedestrian crossings. "
                f"Commuters crossing multi-lane roadways on foot face critical collision exposure."
            )
        elif two_wheeler_risk == "CRITICAL":
            primary_group = "Two-Wheelers"
            justification = (
                f"High corridor speed ({int(speed)} km/h) combined with frequent junction weaving "
                f"({junc_density:.1f} junctions/km) poses severe rear-end and merging crash hazard for two-wheelers."
            )
        elif two_wheeler_risk == "HIGH" and pedestrian_risk == "HIGH":
            primary_group = "Two-Wheelers & Pedestrians"
            justification = (
                f"Dual vulnerability: High vehicle speeds threaten both motorized two-wheelers and pedestrians "
                f"navigating transit stops along this arterial corridor."
            )
        else:
            primary_group = "Two-Wheelers"
            justification = (
                "MoRTH Bengaluru benchmark: Two-wheelers account for 45.3% of urban road fatalities, "
                "representing the primary baseline vulnerable cohort."
            )

        return {
            "primary_vulnerable_group": primary_group,
            "two_wheeler_risk": two_wheeler_risk,
            "pedestrian_risk": pedestrian_risk,
            "justification": justification
        }


vru_engine = VRUEngine()
