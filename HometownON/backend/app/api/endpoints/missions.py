from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...crud import mission as crud
from ...schemas.mission import Mission, MissionCreate, MissionUpdateStatus
from ...core.database import get_db

router = APIRouter()

@router.get("/", response_model=List[Mission]) # Use imported Mission
def read_missions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    missions = crud.get_missions(db, skip=skip, limit=limit)
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
    db_mission = crud.get_mission(db, mission_id=mission_id)
    if db_mission is None:
        raise HTTPException(status_code=404, detail="Mission not found")
    return db_mission

@router.patch("/{mission_id}", response_model=Mission)
def update_mission_status(
    mission_id: int,
    mission_status_update: MissionUpdateStatus,
    db: Session = Depends(get_db)
):
    db_mission = crud.update_mission_status(db, mission_id=mission_id, new_status=mission_status_update.status.value)
    if db_mission is None:
        raise HTTPException(status_code=404, detail="Mission not found or status not 'today'")
    return db_mission
