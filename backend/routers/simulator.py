"""
SafeRoute AI — Simulator Router
Endpoint for What-If safety intervention simulations.
"""

from fastapi import APIRouter, HTTPException, status
from backend.services.risk_engine import risk_engine
from backend.services.simulator_engine import simulator_engine, INTERVENTION_METADATA
from backend.schemas import SimulationRequest, SimulationResponse

router = APIRouter()


@router.post("", response_model=SimulationResponse)
def simulate_interventions(req: SimulationRequest):
    """
    Simulates the safety impact of applied road interventions on a segment.
    Returns recalculated safety score, score gain, and isolated contribution breakdown.
    """
    df = risk_engine.df_segments
    match = df[df['segment_id'] == req.segment_id]
    if match.empty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Segment with ID '{req.segment_id}' not found"
        )
        
    # Validate intervention keys
    valid_keys = set(INTERVENTION_METADATA.keys())
    for it in req.interventions:
        if it not in valid_keys:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid intervention key: '{it}'. Supported: {sorted(list(valid_keys))}"
            )
            
    row_dict = match.iloc[0].to_dict()
    result = simulator_engine.simulate_interventions(row_dict, req.interventions)
    return result
