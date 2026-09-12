import json
import os
import sys
from datetime import datetime

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database import SessionLocal, engine, Base
from backend.models import Accident

def seed():
    print("Initializing Database Schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    data_path = os.path.join(os.path.dirname(__file__), "bangalore_blackspots.json")
    if not os.path.exists(data_path):
        print(f"Data file not found at {data_path}")
        return

    with open(data_path, "r", encoding="utf-8") as f:
        spots = json.load(f)

    # Check if records already exist
    existing_count = db.query(Accident).count()
    if existing_count > 0:
        print(f"Database already has {existing_count} records. Clearing for fresh seed...")
        db.query(Accident).delete()
        db.commit()

    print(f"Seeding {len(spots)} curated Bangalore blackspots...")
    for item in spots:
        accident = Accident(
            location=item["name"],
            latitude=item["latitude"],
            longitude=item["longitude"],
            severity=item["risk_level"],
            date_time=datetime.utcnow(),
            weather_condition="Monsoon / Clear Night",
            road_condition=item.get("corridor_type", "Arterial Road"),
            traffic_density="High / Congested",
            vehicle_type="Two-Wheeler / Pedestrian / Bus",
            casualties=item.get("fatalities_2023", 0),
            injuries=item.get("injuries_2023", 0),
            description=item.get("primary_cause", ""),
            risk_score=float(item.get("risk_score", 50.0)),
            is_predicted=False
        )
        db.add(accident)

    db.commit()
    print(f"Successfully seeded {len(spots)} blackspots into road_safety.db!")
    db.close()

if __name__ == "__main__":
    seed()
