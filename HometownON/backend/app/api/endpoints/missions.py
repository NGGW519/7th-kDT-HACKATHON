from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...crud.mission import get_missions, create_mission, get_mission # Added get_mission
from ...schemas.mission import Mission, MissionCreate
from ...core.database import get_db

router = APIRouter()

@router.get("/", response_model=List[Mission]) # Use imported Mission
def read_missions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    missions = get_missions(db, skip=skip, limit=limit)
    return missions

@router.post("/", response_model=Mission) # Use imported Mission
def create_mission(
    mission: MissionCreate, # Use imported MissionCreate
    db: Session = Depends(get_db)
):
    return create_mission(db=db, mission=mission)

@router.get("/{mission_id}", response_model=Mission)
def read_mission(
    mission_id: int,
    db: Session = Depends(get_db)
):
    db_mission = get_mission(db, mission_id=mission_id)
    if db_mission is None:
        raise HTTPException(status_code=404, detail="Mission not found")
    return db_mission
