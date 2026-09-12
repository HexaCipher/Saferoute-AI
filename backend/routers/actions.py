"""
SafeRoute AI — Municipal Action Tracker Router
Manages operational safety improvement projects (BBMP, BTP, NHAI, DULT).
Turns AI recommendations into trackable, funded, and verifiable engineering works.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.database import get_db
from backend.models import ActionTracker
from backend.schemas import (
    ActionItemCreate,
    ActionItemUpdate,
    ActionItemResponse
)

router = APIRouter()


@router.get("", response_model=List[ActionItemResponse])
def list_action_items(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (PLANNED, IN_PROGRESS, COMPLETED, ON_HOLD)"),
    agency: Optional[str] = Query(None, description="Filter by agency (BBMP, BTP, NHAI, DULT)"),
    db: Session = Depends(get_db)
):
    """
    Lists all municipal safety projects tracked across Bengaluru road corridors.
    """
    query = db.query(ActionTracker)
    if status_filter:
        query = query.filter(ActionTracker.status == status_filter.upper())
    if agency:
        query = query.filter(ActionTracker.assigned_agency == agency.upper())

    return query.order_by(ActionTracker.id.desc()).all()


@router.post("", response_model=ActionItemResponse, status_code=status.HTTP_201_CREATED)
def create_action_item(item: ActionItemCreate, db: Session = Depends(get_db)):
    """
    Creates a new municipal road safety project (e.g. from a 'Fix This First' recommendation).
    """
    action = ActionTracker(
        segment_id=item.segment_id,
        corridor_name=item.corridor_name,
        road_name=item.road_name,
        intervention_type=item.intervention_type,
        intervention_label=item.intervention_label,
        priority_tier=item.priority_tier or "CRITICAL",
        assigned_agency=item.assigned_agency or "BBMP",
        allocated_budget_lakhs=item.allocated_budget_lakhs or 0.0,
        notes=item.notes,
        target_date=item.target_date,
        status="PLANNED"
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    return action


@router.patch("/{action_id}", response_model=ActionItemResponse)
def update_action_item(action_id: int, update_data: ActionItemUpdate, db: Session = Depends(get_db)):
    """
    Updates status, budget, or progress notes for an existing municipal project.
    """
    action = db.query(ActionTracker).filter(ActionTracker.id == action_id).first()
    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action item with ID {action_id} not found"
        )

    if update_data.status is not None:
        action.status = update_data.status.upper()
    if update_data.assigned_agency is not None:
        action.assigned_agency = update_data.assigned_agency.upper()
    if update_data.allocated_budget_lakhs is not None:
        action.allocated_budget_lakhs = update_data.allocated_budget_lakhs
    if update_data.notes is not None:
        action.notes = update_data.notes
    if update_data.target_date is not None:
        action.target_date = update_data.target_date

    db.commit()
    db.refresh(action)
    return action


@router.delete("/{action_id}", status_code=status.HTTP_200_OK)
def delete_action_item(action_id: int, db: Session = Depends(get_db)):
    """
    Deletes an action item from the tracker.
    """
    action = db.query(ActionTracker).filter(ActionTracker.id == action_id).first()
    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action item with ID {action_id} not found"
        )

    db.delete(action)
    db.commit()
    return {"message": f"Action item {action_id} deleted successfully"}
