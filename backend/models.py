from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from datetime import datetime

from backend.database import Base


class Accident(Base):
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
