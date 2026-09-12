"""
SafeRoute AI — SQLAlchemy Database Models
Defines schema for BTP station records, road segments, saved simulations, and action items.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from datetime import datetime

from backend.database import Base


class Accident(Base):
    """Legacy accident model (backward compatibility)."""
    __tablename__ = "accidents"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String(255), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    severity = Column(String(50), nullable=False)
    date_time = Column(DateTime, nullable=False, default=datetime.utcnow)
    weather_condition = Column(String(100))
    road_condition = Column(String(100))
    traffic_density = Column(String(50))
    vehicle_type = Column(String(100))
    casualties = Column(Integer, default=0)
    injuries = Column(Integer, default=0)
    description = Column(Text)
    risk_score = Column(Float)
    is_predicted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Accident(id={self.id}, location={self.location}, severity={self.severity})>"


class BTPStationRecord(Base):
    """Official Bengaluru Traffic Police Station records and crash statistics."""
    __tablename__ = "btp_stations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    station_name = Column(String(255), unique=True, index=True, nullable=False)
    clean_name = Column(String(255), index=True)
    total_cases_2023 = Column(Integer, default=0)
    fatal_cases_2023 = Column(Integer, default=0)
    killed_people_2023 = Column(Integer, default=0)
    nonfatal_cases_2023 = Column(Integer, default=0)
    injuries_2023 = Column(Integer, default=0)
    total_cases_2022 = Column(Integer, default=0)
    fatal_cases_2022 = Column(Integer, default=0)
    total_cases_2021 = Column(Integer, default=0)
    fatal_cases_2021 = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<BTPStation(name={self.station_name}, fatal={self.fatal_cases_2023}, total={self.total_cases_2023})>"


class RoadSegmentRecord(Base):
    """Calibrated ~500m road segments with physical infrastructure and Safety Scores."""
    __tablename__ = "road_segments"

    segment_id = Column(String(100), primary_key=True, index=True)
    corridor_id = Column(String(50), index=True, nullable=False)
    corridor_name = Column(String(255), nullable=False)
    road_name = Column(String(255), nullable=False)
    road_type = Column(String(50), nullable=False)
    segment_length_m = Column(Float, nullable=False)
    safety_score = Column(Float, index=True, nullable=False)
    risk_tier = Column(String(50), index=True, nullable=False)
    risk_score = Column(Float, nullable=False)
    night_risk_multiplier = Column(Float, default=1.45)
    primary_vulnerable_group = Column(String(100), default="Two-Wheelers")
    btp_station = Column(String(255), index=True, nullable=True)
    street_lighting = Column(String(50), default="unverified")
    lanes = Column(Float, nullable=True)
    speed_limit_kph = Column(Float, nullable=True)
    crossing_count = Column(Integer, default=0)
    bus_stop_count = Column(Integer, default=0)
    junction_count = Column(Integer, default=0)
    confidence_level = Column(String(50), default="MEDIUM")
    start_lat = Column(Float, nullable=True)
    start_lon = Column(Float, nullable=True)
    end_lat = Column(Float, nullable=True)
    end_lon = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<RoadSegment(id={self.segment_id}, road={self.road_name}, score={self.safety_score})>"


class SavedSimulation(Base):
    """Saved What-If intervention scenarios created by city planners & traffic police."""
    __tablename__ = "saved_simulations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    segment_id = Column(String(100), index=True, nullable=False)
    scenario_name = Column(String(255), nullable=False)
    original_safety_score = Column(Float, nullable=False)
    simulated_safety_score = Column(Float, nullable=False)
    score_gain = Column(Float, nullable=False)
    original_risk_tier = Column(String(50), nullable=False)
    simulated_risk_tier = Column(String(50), nullable=False)
    expected_fatality_reduction_pct = Column(Float, nullable=False)
    applied_interventions = Column(Text, nullable=False)  # JSON-encoded array of intervention keys
    created_by = Column(String(100), default="Municipal Authority")
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<SavedSimulation(id={self.id}, scenario={self.scenario_name}, gain=+{self.score_gain})>"


class ActionTracker(Base):
    """Municipal project tracker turning 'Fix This First' priorities into implemented road improvements."""
    __tablename__ = "action_tracker"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    segment_id = Column(String(100), index=True, nullable=False)
    corridor_name = Column(String(255), nullable=False)
    road_name = Column(String(255), nullable=False)
    intervention_type = Column(String(100), nullable=False)
    intervention_label = Column(String(255), nullable=False)
    status = Column(String(50), default="PLANNED", index=True)  # PLANNED, IN_PROGRESS, COMPLETED, ON_HOLD
    priority_tier = Column(String(50), default="CRITICAL")
    assigned_agency = Column(String(100), default="BBMP")  # BBMP, BTP, NHAI, DULT
    allocated_budget_lakhs = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    target_date = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<ActionTracker(id={self.id}, segment={self.segment_id}, status={self.status})>"
