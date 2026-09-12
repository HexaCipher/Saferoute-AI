"""
SafeRoute AI — Segments Router
Endpoints for GeoJSON map layer and individual segment detail inspections.
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List, Dict, Any
import pandas as pd
import shapely.geometry
from backend.services.risk_engine import risk_engine
from backend.services.vru_engine import vru_engine
from backend.schemas import (
    SegmentsGeoJSONResponse,
    SegmentDetailResponse,
    InfrastructureDetails,
    BTPJurisdictionDetails,
    RiskExplanation,
    VulnerableRoadUsers
)

router = APIRouter()


@router.get("", response_model=Dict[str, Any])
def get_segments(
    corridor_id: Optional[str] = Query(None, description="Filter by corridor (e.g. 'ORR', 'HOSUR', 'OMR_WHITEFIELD')"),
    risk_tier: Optional[str] = Query(None, description="Filter by risk band ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')"),
    min_safety_score: Optional[float] = Query(None, description="Minimum safety score (0-100)"),
    max_safety_score: Optional[float] = Query(None, description="Maximum safety score (0-100)")
):
    """
    Returns ~500m road segments as a standard GeoJSON FeatureCollection.
    Directly consumable by Leaflet, Mapbox GL, Deck.gl.
    """
    df = risk_engine.df_segments.copy()
    
    if corridor_id:
        df = df[df['corridor_id'] == corridor_id.upper()]
    if risk_tier:
        df = df[df['risk_tier'] == risk_tier.upper()]
    if min_safety_score is not None:
        df = df[df['safety_score'] >= min_safety_score]
    if max_safety_score is not None:
        df = df[df['safety_score'] <= max_safety_score]

    features = []
    for _, row in df.iterrows():
        geom = row['geometry']
        if geom is None:
            continue
        if isinstance(geom, (bytes, bytearray)):
            geom = shapely.wkb.loads(geom)
        elif isinstance(geom, str):
            geom = shapely.wkt.loads(geom)
            
        if geom.is_empty:
            continue
            
        coords = [list(c) for c in geom.coords]
        vru_info = vru_engine.assess_vulnerability(row)
        
        feature = {
            "type": "Feature",
            "id": row['segment_id'],
            "geometry": {
                "type": "LineString",
                "coordinates": coords
            },
            "properties": {
                "segment_id": row['segment_id'],
                "corridor_id": row['corridor_id'],
                "corridor_name": row['corridor_name'],
                "road_name": row['road_name'],
                "road_type": row['road_type'],
                "segment_length_m": float(row['segment_length_m']),
                "safety_score": float(row['safety_score']),
                "risk_tier": row['risk_tier'],
                "risk_score": float(row['risk_score']),
                "night_risk_multiplier": float(row['night_risk_multiplier']),
                "primary_vulnerable_group": vru_info['primary_vulnerable_group'],
                "btp_station": row.get('btp_station'),
                "street_lighting": row['street_lighting'],
                "crossing_count": int(row['crossing_count']),
                "bus_stop_count": int(row['bus_stop_count']),
                "junction_count": int(row['junction_count'])
            }
        }
        features.append(feature)

    return {
        "type": "FeatureCollection",
        "metadata": {
            "total_features": len(features),
            "corridors": sorted(df['corridor_id'].unique().tolist()),
            "score_scale": "0 to 100 (0 = Extreme Hazard, 100 = Optimal Safety)"
        },
        "features": features
    }


@router.get("/{segment_id}", response_model=SegmentDetailResponse)
def get_segment_details(segment_id: str):
    """
    Returns full infrastructure breakdown, risk explanation, and vulnerable user details
    for a specific road segment.
    """
    df = risk_engine.df_segments
    match = df[df['segment_id'] == segment_id]
    if match.empty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Segment with ID '{segment_id}' not found"
        )
        
    row = match.iloc[0]
    geom = row['geometry']
    if isinstance(geom, (bytes, bytearray)):
        geom = shapely.wkb.loads(geom)
    elif isinstance(geom, str):
        geom = shapely.wkt.loads(geom)
    coords = [list(c) for c in geom.coords] if geom else []
    
    explanation = risk_engine.explain_segment(row)
    vru_info = vru_engine.assess_vulnerability(row)
    
    infra = InfrastructureDetails(
        road_type=str(row['road_type']),
        lanes=int(row['lanes']) if pd.notna(row['lanes']) else None,
        lane_count_available=bool(row['lane_count_available']),
        speed_limit_kph=int(row['speed_limit_kph']) if pd.notna(row['speed_limit_kph']) else None,
        speed_limit_available=bool(row['speed_limit_available']),
        street_lighting=str(row['street_lighting']),
        street_lighting_verified=bool(row['street_lighting_verified']),
        junction_count=int(row['junction_count']),
        junction_density_per_km=float(row['junction_density_per_km']),
        crossing_count=int(row['crossing_count']),
        bus_stop_count=int(row['bus_stop_count'])
    )
    
    btp = BTPJurisdictionDetails(
        station_name=row.get('btp_station'),
        overlap_ratio=float(row.get('btp_overlap_ratio', 1.0)),
        historical_signals={
            "total_crashes_2023": int(row.get('btp_station_total_cases_2023') or 0),
            "fatal_crashes_2023": int(row.get('btp_station_fatal_cases_2023') or 0),
            "fatalities_2023": int(row.get('btp_station_killed_people_2023') or 0),
            "injuries_2023": int(row.get('btp_station_injuries_2023') or 0),
            "total_crashes_2022": int(row.get('btp_station_total_cases_2022') or 0)
        }
    )

    return SegmentDetailResponse(
        segment_id=str(row['segment_id']),
        corridor_id=str(row['corridor_id']),
        corridor_name=str(row['corridor_name']),
        road_name=str(row['road_name']),
        geometry={
            "type": "LineString",
            "coordinates": coords
        },
        metrics={
            "safety_score": float(row['safety_score']),
            "risk_score": float(row['risk_score']),
            "risk_tier": str(row['risk_tier']),
            "confidence_level": str(row['confidence_level']),
            "segment_length_m": float(row['segment_length_m'])
        },
        infrastructure=infra,
        btp_jurisdiction=btp,
        risk_explanation=RiskExplanation(**explanation),
        vulnerable_road_users=VulnerableRoadUsers(**vru_info)
    )
