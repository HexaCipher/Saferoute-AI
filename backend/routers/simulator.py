from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import List
import json

from backend.database import get_db
from backend.models import SavedSimulation
from backend.services.risk_engine import risk_engine
from backend.services.simulator_engine import simulator_engine, INTERVENTION_METADATA
from backend.schemas import (
    SimulationRequest,
    SimulationResponse,
    SaveSimulationRequest,
    SavedSimulationResponse
)

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


@router.post("/save", response_model=SavedSimulationResponse, status_code=status.HTTP_201_CREATED)
def save_simulation(req: SaveSimulationRequest, db: Session = Depends(get_db)):
    """
    Persists a What-If simulation scenario into the municipal planning database.
    Allows traffic authorities and urban planners to reference and compare proposed budgets.
    """
    df = risk_engine.df_segments
    match = df[df['segment_id'] == req.segment_id]
    if match.empty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Segment with ID '{req.segment_id}' not found"
        )

    valid_keys = set(INTERVENTION_METADATA.keys())
    for it in req.interventions:
        if it not in valid_keys:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid intervention key: '{it}'. Supported: {sorted(list(valid_keys))}"
            )

    row_dict = match.iloc[0].to_dict()
    sim = simulator_engine.simulate_interventions(row_dict, req.interventions)

    saved_obj = SavedSimulation(
        segment_id=req.segment_id,
        scenario_name=req.scenario_name,
        original_safety_score=sim['original_safety_score'],
        simulated_safety_score=sim['simulated_safety_score'],
        score_gain=sim['score_gain'],
        original_risk_tier=sim['original_risk_tier'],
        simulated_risk_tier=sim['simulated_risk_tier'],
        expected_fatality_reduction_pct=sim['expected_fatality_reduction_pct'],
        applied_interventions=json.dumps(req.interventions),
        created_by=req.created_by or "Municipal Authority"
    )
    db.add(saved_obj)
    db.commit()
    db.refresh(saved_obj)

    return {
        "id": saved_obj.id,
        "segment_id": saved_obj.segment_id,
        "scenario_name": saved_obj.scenario_name,
        "original_safety_score": saved_obj.original_safety_score,
        "simulated_safety_score": saved_obj.simulated_safety_score,
        "score_gain": saved_obj.score_gain,
        "original_risk_tier": saved_obj.original_risk_tier,
        "simulated_risk_tier": saved_obj.simulated_risk_tier,
        "expected_fatality_reduction_pct": saved_obj.expected_fatality_reduction_pct,
        "applied_interventions": json.loads(saved_obj.applied_interventions),
        "created_by": saved_obj.created_by,
        "created_at": saved_obj.created_at
    }


@router.get("/saved", response_model=List[SavedSimulationResponse])
def get_saved_simulations(db: Session = Depends(get_db)):
    """
    Retrieves all saved simulation scenarios from the municipal database.
    """
    items = db.query(SavedSimulation).order_by(SavedSimulation.id.desc()).all()
    res = []
    for item in items:
        res.append({
            "id": item.id,
            "segment_id": item.segment_id,
            "scenario_name": item.scenario_name,
            "original_safety_score": item.original_safety_score,
            "simulated_safety_score": item.simulated_safety_score,
            "score_gain": item.score_gain,
            "original_risk_tier": item.original_risk_tier,
            "simulated_risk_tier": item.simulated_risk_tier,
            "expected_fatality_reduction_pct": item.expected_fatality_reduction_pct,
            "applied_interventions": json.loads(item.applied_interventions),
            "created_by": item.created_by,
            "created_at": item.created_at
        })
    return res
