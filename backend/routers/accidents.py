from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.models import Accident
from backend.schemas import AccidentCreate, AccidentUpdate, AccidentResponse

router = APIRouter()


@router.post("/", response_model=AccidentResponse, status_code=status.HTTP_201_CREATED)
def create_accident(accident: AccidentCreate, db: Session = Depends(get_db)):
    """Create a new accident record"""
    db_accident = Accident(**accident.model_dump())
    db.add(db_accident)
    db.commit()
    db.refresh(db_accident)
    return db_accident


@router.get("", response_model=List[AccidentResponse])
@router.get("/", response_model=List[AccidentResponse])
def get_accidents(
    skip: int = 0,
    limit: int = 100,
    severity: str = None,
    location: str = None,
    db: Session = Depends(get_db)
):
    """Get all accident records with optional filtering"""
    query = db.query(Accident)
    
    if severity:
        query = query.filter(Accident.severity == severity)
    if location:
        query = query.filter(Accident.location.contains(location))
    
    accidents = query.offset(skip).limit(limit).all()
    return accidents


@router.get("/{accident_id}", response_model=AccidentResponse)
def get_accident(accident_id: int, db: Session = Depends(get_db)):
    """Get a specific accident record by ID"""
    accident = db.query(Accident).filter(Accident.id == accident_id).first()
    if not accident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Accident with id {accident_id} not found"
        )
    return accident


@router.put("/{accident_id}", response_model=AccidentResponse)
def update_accident(
    accident_id: int,
    accident_update: AccidentUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing accident record"""
    db_accident = db.query(Accident).filter(Accident.id == accident_id).first()
    if not db_accident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Accident with id {accident_id} not found"
        )
    
    update_data = accident_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_accident, field, value)
    
    db.commit()
    db.refresh(db_accident)
    return db_accident


@router.delete("/{accident_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_accident(accident_id: int, db: Session = Depends(get_db)):
    """Delete an accident record"""
    db_accident = db.query(Accident).filter(Accident.id == accident_id).first()
    if not db_accident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Accident with id {accident_id} not found"
        )
    
    db.delete(db_accident)
    db.commit()
    return None
