from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...crud import crud_mission as crud
from ...schemas.mission import Mission, MissionCreate, MissionUpdateStatus
from ...core.database import get_db

router = APIRouter()

@router.get("/user-stats")
def get_user_mission_stats(db: Session = Depends(get_db)):
    """사용자의 미션 통계 및 경험치 정보를 반환합니다."""
    completed_missions = crud.get_completed_missions(db)
    
    # 완료된 미션들의 경험치 계산 (difficulty * 50)
    total_exp = sum(mission.difficulty * 50 for mission in completed_missions)
    
    # 레벨 계산 (1000 경험치당 1레벨)
    level = max(1, total_exp // 500 + 1)
    
    # 현재 레벨에서의 경험치
    current_level_exp = total_exp % 500
    
    # 다음 레벨까지 필요한 경험치
    exp_for_next_level = 500
    exp_needed = exp_for_next_level - current_level_exp
    
    return {
        "total_exp": total_exp,
        "level": level,
        "current_level_exp": current_level_exp,
        "exp_for_next_level": exp_for_next_level,
        "exp_needed": exp_needed,
        "completed_missions_count": len(completed_missions),
        "progress_percentage": (current_level_exp / exp_for_next_level) * 100
    }

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
