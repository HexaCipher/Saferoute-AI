from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class AccidentBase(BaseModel):
    location: str = Field(..., description="Location of the accident")
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    severity: str = Field(..., description="Severity level (Low, Medium, High, Critical)")
    date_time: datetime = Field(default_factory=datetime.utcnow)
    weather_condition: Optional[str] = None
    road_condition: Optional[str] = None
    traffic_density: Optional[str] = None
    vehicle_type: Optional[str] = None
    casualties: int = Field(default=0, ge=0)
    injuries: int = Field(default=0, ge=0)
    description: Optional[str] = None
    risk_score: Optional[float] = Field(None, ge=0, le=100)
    is_predicted: bool = False


class AccidentCreate(AccidentBase):
    pass


class AccidentUpdate(BaseModel):
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    severity: Optional[str] = None
    date_time: Optional[datetime] = None
    weather_condition: Optional[str] = None
    road_condition: Optional[str] = None
    traffic_density: Optional[str] = None
    vehicle_type: Optional[str] = None
    casualties: Optional[int] = None
    injuries: Optional[int] = None
    description: Optional[str] = None
    risk_score: Optional[float] = None
    is_predicted: Optional[bool] = None


class AccidentResponse(AccidentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
