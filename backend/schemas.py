"""
SafeRoute AI — Pydantic API Schemas
Definitions for GeoJSON features, segment details, simulations, and recommendations.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0"
    dataset_loaded: bool
    total_segments: int


class GeometryLineString(BaseModel):
    type: str = "LineString"
    coordinates: List[List[float]]


class SegmentProperties(BaseModel):
    segment_id: str
    corridor_id: str
    corridor_name: str
    road_name: str
    road_type: str
    segment_length_m: float
    safety_score: float
    risk_tier: str
    risk_score: float
    night_risk_multiplier: float
    primary_vulnerable_group: str
    btp_station: Optional[str]
    street_lighting: str
    crossing_count: int
    bus_stop_count: int
    junction_count: int


class SegmentFeature(BaseModel):
    type: str = "Feature"
    id: str
    geometry: GeometryLineString
    properties: SegmentProperties


class SegmentsGeoJSONResponse(BaseModel):
    type: str = "FeatureCollection"
    metadata: Dict[str, Any]
    features: List[SegmentFeature]


class InfrastructureDetails(BaseModel):
    road_type: str
    lanes: Optional[int] = None
    lane_count_available: bool
    speed_limit_kph: Optional[int] = None
    speed_limit_available: bool
    street_lighting: str
    street_lighting_verified: bool
    junction_count: int
    junction_density_per_km: float
    crossing_count: int
    bus_stop_count: int


class BTPJurisdictionDetails(BaseModel):
    station_name: Optional[str] = None
    overlap_ratio: float
    historical_signals: Dict[str, Any]


class RiskFactor(BaseModel):
    factor: str
    label: str
    direction: str
    relative_contribution_pct: float


class RiskExplanation(BaseModel):
    summary: str
    top_contributing_factors: List[RiskFactor]


class VulnerableRoadUsers(BaseModel):
    primary_vulnerable_group: str
    two_wheeler_risk: str
    pedestrian_risk: str
    justification: str


class SegmentDetailResponse(BaseModel):
    segment_id: str
    corridor_id: str
    corridor_name: str
    road_name: str
    geometry: Dict[str, Any]
    metrics: Dict[str, Any]
    infrastructure: InfrastructureDetails
    btp_jurisdiction: BTPJurisdictionDetails
    risk_explanation: RiskExplanation
    vulnerable_road_users: VulnerableRoadUsers


class SimulationRequest(BaseModel):
    segment_id: str
    interventions: List[str] = Field(
        ...,
        description="List of intervention keys (e.g., 'street_lighting_upgrade', 'speed_enforcement_camera')"
    )


class InterventionBreakdownItem(BaseModel):
    intervention: str
    label: str
    isolated_score_gain: float


class SimulationResponse(BaseModel):
    segment_id: str
    original_safety_score: float
    simulated_safety_score: float
    score_gain: float
    original_risk_tier: str
    simulated_risk_tier: str
    expected_fatality_reduction_pct: float
    applied_interventions: List[str]
    simulated_features: Dict[str, Any]
    intervention_breakdown: List[InterventionBreakdownItem]


class RecommendationItem(BaseModel):
    priority_rank: int
    segment_id: str
    corridor_id: str
    corridor_name: str
    road_name: str
    current_safety_score: float
    current_risk_tier: str
    confidence_level: str
    primary_vulnerable_group: str
    recommended_intervention: str
    recommended_intervention_label: str
    expected_safety_gain: float
    simulated_safety_score: float
    priority_score: float
    justification: str


class RecommendationsResponse(BaseModel):
    total_analyzed_segments: int
    critical_priority_count: int
    high_priority_count: int
    recommendations: List[RecommendationItem]


class RiskTierStat(BaseModel):
    segment_count: int
    percentage: float
    total_km: float


class CorridorStat(BaseModel):
    corridor_id: str
    corridor_name: str
    segment_count: int
    length_km: float
    average_safety_score: float
    critical_segments: int
    high_segments: int


class AnalyticsSummaryResponse(BaseModel):
    total_corridors_analyzed: int
    total_road_network_km: float
    total_segments: int
    average_city_safety_score: float
    risk_distribution: Dict[str, RiskTierStat]
    corridor_breakdown: List[CorridorStat]
    vru_vulnerability_breakdown: Dict[str, float]
    infrastructure_highlights: Dict[str, Any]
    projected_impact: Dict[str, Any]


# Legacy Accident CRUD Schemas (backward compatibility)
from datetime import datetime

class AccidentBase(BaseModel):
    location: str
    latitude: float
    longitude: float
    severity: str
    date_time: datetime = Field(default_factory=datetime.utcnow)
    weather_condition: Optional[str] = None
    road_condition: Optional[str] = None
    traffic_density: Optional[str] = None
    vehicle_type: Optional[str] = None
    casualties: int = 0
    injuries: int = 0
    description: Optional[str] = None
    risk_score: Optional[float] = None
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


# Persistent Municipal Planning & Action Tracker Schemas
class SaveSimulationRequest(BaseModel):
    segment_id: str
    scenario_name: str
    interventions: List[str]
    created_by: Optional[str] = "Municipal Authority"


class SavedSimulationResponse(BaseModel):
    id: int
    segment_id: str
    scenario_name: str
    original_safety_score: float
    simulated_safety_score: float
    score_gain: float
    original_risk_tier: str
    simulated_risk_tier: str
    expected_fatality_reduction_pct: float
    applied_interventions: List[str]
    created_by: str
    created_at: datetime

    class Config:
        from_attributes = True


class ActionItemCreate(BaseModel):
    segment_id: str
    corridor_name: str
    road_name: str
    intervention_type: str
    intervention_label: str
    priority_tier: Optional[str] = "CRITICAL"
    assigned_agency: Optional[str] = "BBMP"
    allocated_budget_lakhs: Optional[float] = 0.0
    notes: Optional[str] = None
    target_date: Optional[str] = None


class ActionItemUpdate(BaseModel):
    status: Optional[str] = None  # PLANNED, IN_PROGRESS, COMPLETED, ON_HOLD
    assigned_agency: Optional[str] = None
    allocated_budget_lakhs: Optional[float] = None
    notes: Optional[str] = None
    target_date: Optional[str] = None


class ActionItemResponse(BaseModel):
    id: int
    segment_id: str
    corridor_name: str
    road_name: str
    intervention_type: str
    intervention_label: str
    status: str
    priority_tier: str
    assigned_agency: str
    allocated_budget_lakhs: float
    notes: Optional[str] = None
    target_date: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

