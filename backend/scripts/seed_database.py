"""
SafeRoute AI — Database Seeding Script
Populates the relational SQLite/PostgreSQL database with:
1. 48 Official BTP Police Stations & Crash Records (2020–2023)
2. 428 Calibrated Road Segments with Physical Infrastructure & Safety Scores
3. Initial Municipal Action Projects & Saved Simulation Scenarios
"""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime

from backend.database import engine, SessionLocal, Base
from backend.models import (
    BTPStationRecord,
    RoadSegmentRecord,
    SavedSimulation,
    ActionTracker
)
from backend.services.risk_engine import risk_engine


def seed_database():
    print("=" * 60)
    print("  SAFE ROUTE AI — DATABASE SEEDING PROCESS")
    print("=" * 60)

    # 1. Create tables if not present
    print("[1/4] Ensuring database schema and tables are created...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 2. Seed BTP Police Stations
        print("[2/4] Seeding BTP Police Station statistics...")
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        btp_2023_path = os.path.join(base_dir, "data", "raw", "btp", "btp_station_accidents_2023.csv")
        btp_hist_path = os.path.join(base_dir, "data", "raw", "btp", "btp_station_accidents_2020_2022.csv")

        if os.path.exists(btp_2023_path):
            df_2023 = pd.read_csv(btp_2023_path)
            df_hist = pd.read_csv(btp_hist_path) if os.path.exists(btp_hist_path) else pd.DataFrame()

            # Merge historical if available
            hist_map = {}
            if not df_hist.empty:
                for _, hrow in df_hist.iterrows():
                    sname = str(hrow.get('Station', '')).strip()
                    try:
                        t22 = int(hrow.get('2022 - Total Cases', 0)) if not pd.isna(hrow.get('2022 - Total Cases')) else 0
                        f22 = int(hrow.get('2022 - Fatal', 0)) if not pd.isna(hrow.get('2022 - Fatal')) else 0
                        t21 = int(hrow.get('2021 - Total Cases', 0)) if not pd.isna(hrow.get('2021 - Total Cases')) else 0
                        f21 = int(hrow.get('2021 - Fatal', 0)) if not pd.isna(hrow.get('2021 - Fatal')) else 0
                    except Exception:
                        t22, f22, t21, f21 = 0, 0, 0, 0
                    hist_map[sname] = {
                        'total_2022': t22,
                        'fatal_2022': f22,
                        'total_2021': t21,
                        'fatal_2021': f21,
                    }

            station_count = 0
            for _, row in df_2023.iterrows():
                sname = str(row.get('Station', '')).strip()
                if not sname or sname.lower() in ['total', 'nan']:
                    continue

                existing = db.query(BTPStationRecord).filter(BTPStationRecord.station_name == sname).first()
                hdata = hist_map.get(sname, {})

                if not existing:
                    try:
                        tot23 = int(row.get('2023 - Total Cases', 0)) if not pd.isna(row.get('2023 - Total Cases')) else 0
                        fat23 = int(row.get('2023 - Fatal Cases', 0)) if not pd.isna(row.get('2023 - Fatal Cases')) else 0
                        kill23 = int(row.get('2023 - Killed People', 0)) if not pd.isna(row.get('2023 - Killed People')) else 0
                        nonfat23 = int(row.get('2023 - Non-Fatal', 0)) if not pd.isna(row.get('2023 - Non-Fatal')) else 0
                        inj23 = int(row.get('2023 - Injured People', 0)) if not pd.isna(row.get('2023 - Injured People')) else 0
                    except Exception:
                        tot23, fat23, kill23, nonfat23, inj23 = 0, 0, 0, 0, 0

                    station = BTPStationRecord(
                        station_name=sname,
                        clean_name=sname.replace(' ', '_').lower(),
                        total_cases_2023=tot23,
                        fatal_cases_2023=fat23,
                        killed_people_2023=kill23,
                        nonfatal_cases_2023=nonfat23,
                        injuries_2023=inj23,
                        total_cases_2022=hdata.get('total_2022', 0),
                        fatal_cases_2022=hdata.get('fatal_2022', 0),
                        total_cases_2021=hdata.get('total_2021', 0),
                        fatal_cases_2021=hdata.get('fatal_2021', 0),
                    )
                    db.add(station)
                    station_count += 1

            db.commit()
            print(f"      -> Successfully seeded {station_count} BTP Traffic Police Stations.")

        # 3. Seed Road Segments
        print("[3/4] Seeding 428 road segments with calibrated Safety Scores...")
        df_segs = risk_engine.df_segments
        if df_segs is not None and not df_segs.empty:
            seg_count = 0
            for _, row in df_segs.iterrows():
                sid = str(row['segment_id'])
                existing = db.query(RoadSegmentRecord).filter(RoadSegmentRecord.segment_id == sid).first()

                lanes_val = float(row['lanes']) if not pd.isna(row.get('lanes')) else None
                speed_val = float(row['speed_limit_kph']) if not pd.isna(row.get('speed_limit_kph')) else None

                if not existing:
                    seg = RoadSegmentRecord(
                        segment_id=sid,
                        corridor_id=str(row.get('corridor_id', '')),
                        corridor_name=str(row.get('corridor_name', '')),
                        road_name=str(row.get('road_name', '')),
                        road_type=str(row.get('road_type', '')),
                        segment_length_m=float(row.get('segment_length_m', 0.0)),
                        safety_score=float(row.get('safety_score', 50.0)),
                        risk_tier=str(row.get('risk_tier', 'MEDIUM')),
                        risk_score=float(row.get('risk_score', 0.5)),
                        night_risk_multiplier=float(row.get('night_risk_multiplier', 1.45)),
                        primary_vulnerable_group=str(row.get('primary_vulnerable_group', 'Two-Wheelers')),
                        btp_station=str(row.get('btp_station', '')) if row.get('btp_station') else None,
                        street_lighting=str(row.get('street_lighting', 'unverified')),
                        lanes=lanes_val,
                        speed_limit_kph=speed_val,
                        crossing_count=int(row.get('crossing_count', 0)),
                        bus_stop_count=int(row.get('bus_stop_count', 0)),
                        junction_count=int(row.get('junction_count', 0)),
                        confidence_level=str(row.get('confidence_level', 'MEDIUM')),
                        start_lat=float(row['start_lat']) if 'start_lat' in row and not pd.isna(row['start_lat']) else None,
                        start_lon=float(row['start_lon']) if 'start_lon' in row and not pd.isna(row['start_lon']) else None,
                        end_lat=float(row['end_lat']) if 'end_lat' in row and not pd.isna(row['end_lat']) else None,
                        end_lon=float(row['end_lon']) if 'end_lon' in row and not pd.isna(row['end_lon']) else None,
                    )
                    db.add(seg)
                    seg_count += 1

            db.commit()
            print(f"      -> Successfully seeded {seg_count} road segments.")

        # 4. Seed Saved Simulations & Action Items
        print("[4/4] Seeding initial municipal saved scenarios & action tracker items...")
        
        # Saved Simulation Samples
        if db.query(SavedSimulation).count() == 0:
            sample_sims = [
                SavedSimulation(
                    segment_id="BLR_ORR_006_2",
                    scenario_name="BBMP FY26 Bellandur Night Safety Overhaul",
                    original_safety_score=29.1,
                    simulated_safety_score=44.5,
                    score_gain=15.4,
                    original_risk_tier="CRITICAL",
                    simulated_risk_tier="HIGH",
                    expected_fatality_reduction_pct=20.8,
                    applied_interventions=json.dumps([
                        "street_lighting_upgrade",
                        "speed_enforcement_camera",
                        "pedestrian_crossing_refuge"
                    ]),
                    created_by="BBMP Traffic Engineering Cell"
                ),
                SavedSimulation(
                    segment_id="BLR_OMR_012_1",
                    scenario_name="Tin Factory Pedestrian Protection Corridor",
                    original_safety_score=34.2,
                    simulated_safety_score=58.6,
                    score_gain=24.4,
                    original_risk_tier="CRITICAL",
                    simulated_risk_tier="HIGH",
                    expected_fatality_reduction_pct=32.9,
                    applied_interventions=json.dumps([
                        "street_lighting_upgrade",
                        "pedestrian_crossing_refuge",
                        "speed_calming_measures"
                    ]),
                    created_by="DULT Urban Mobility Directorate"
                )
            ]
            db.add_all(sample_sims)
            db.commit()
            print(f"      -> Seeded {len(sample_sims)} saved What-If simulation scenarios.")

        # Action Tracker Samples
        if db.query(ActionTracker).count() == 0:
            sample_actions = [
                ActionTracker(
                    segment_id="BLR_ORR_006_2",
                    corridor_name="Outer Ring Road (Silk Board to Hebbal)",
                    road_name="Outer Ring Road (Bellandur Ecospace)",
                    intervention_type="street_lighting_upgrade",
                    intervention_label="High-Mast Smart LED Lighting Upgrade",
                    status="IN_PROGRESS",
                    priority_tier="CRITICAL",
                    assigned_agency="BBMP",
                    allocated_budget_lakhs=45.0,
                    notes="Smart LED installation tender awarded; poles delivery scheduled for next week.",
                    target_date="2026-10-30"
                ),
                ActionTracker(
                    segment_id="BLR_OMR_012_1",
                    corridor_name="Old Madras Road / Whitefield Corridor",
                    road_name="Old Madras Road (Tin Factory Junction)",
                    intervention_type="pedestrian_crossing_refuge",
                    intervention_label="High-Visibility Zebra Crossing with Median Refuge",
                    status="PLANNED",
                    priority_tier="CRITICAL",
                    assigned_agency="BBMP",
                    allocated_budget_lakhs=18.5,
                    notes="Pedestrian refuge design approved by DULT; waiting for road surfacing.",
                    target_date="2026-11-15"
                ),
                ActionTracker(
                    segment_id="BLR_ORR_014_1",
                    corridor_name="Outer Ring Road (Silk Board to Hebbal)",
                    road_name="Outer Ring Road (Kadubeesanahalli)",
                    intervention_type="speed_enforcement_camera",
                    intervention_label="Automated Speed Violation Radar (ANPR)",
                    status="PLANNED",
                    priority_tier="CRITICAL",
                    assigned_agency="BTP",
                    allocated_budget_lakhs=12.0,
                    notes="BTP approved speed radar placement to curb nighttime overspeeding.",
                    target_date="2026-10-15"
                )
            ]
            db.add_all(sample_actions)
            db.commit()
            print(f"      -> Seeded {len(sample_actions)} initial action tracker items.")

        print("=" * 60)
        print("  DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
