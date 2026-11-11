"""미션 API. 로그인 토큰이 있으면 그 사용자 기준의 상태(완료 여부)를 돌려준다.

토큰 없이 부르면 기본 미션만 '오늘 할 미션' 상태로 보인다.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ...core import security
from ...core.database import get_db
from ...crud import crud_mission as crud
from ...models import models
from ...schemas.mission import Mission, MissionCreate, MissionStatus, MissionUpdateStatus, UserMissionStats

router = APIRouter()

EXP_PER_DIFFICULTY = 50
EXP_PER_LEVEL = 500


def _out(mission: models.Mission, status: str) -> Mission:
    data = Mission.model_validate(mission, from_attributes=True).model_dump()
    return Mission(**{**data, "status": status})


def _user_id(user) -> int | None:
    return user.id if user is not None else None


# 고정 경로는 /{mission_id} 보다 먼저 정의해야 한다
@router.get("/user-stats", response_model=UserMissionStats)
def get_user_mission_stats(
    db: Session = Depends(get_db), user=Depends(security.get_current_user_optional)
):
    """사용자의 미션 경험치/레벨 (미션 난이도 x 50 경험치, 500 경험치마다 레벨업)."""
    completed = crud.get_completed_missions(db, _user_id(user))
    total_exp = sum((m.difficulty or 1) * EXP_PER_DIFFICULTY for m in completed)
    current = total_exp % EXP_PER_LEVEL
    return UserMissionStats(
        total_exp=total_exp,
        level=total_exp // EXP_PER_LEVEL + 1,
        current_level_exp=current,
        exp_for_next_level=EXP_PER_LEVEL,
        exp_needed=EXP_PER_LEVEL - current,
        completed_missions_count=len(completed),
        progress_percentage=current / EXP_PER_LEVEL * 100,
    )


@router.get("/completed_missions_with_difficulty", response_model=List[Mission])
def read_completed_missions(
    db: Session = Depends(get_db), user=Depends(security.get_current_user_optional)
):
    """사용자가 완료한 미션 목록 (미션 대시보드 화면용)."""
    return [_out(m, "completed") for m in crud.get_completed_missions(db, _user_id(user))]


@router.get("/", response_model=List[Mission])
def read_missions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    user=Depends(security.get_current_user_optional),
):
    return [_out(m, status) for m, status in crud.list_missions(db, _user_id(user), skip=skip, limit=limit)]


@router.post("/", response_model=Mission)
def create_mission(
    mission: MissionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    """로그인한 사용자가 직접 미션을 만든다 (만든 사람에게만 보인다)."""
    return _out(crud.create_mission(db, current_user.id, mission.model_dump()), "today")


@router.get("/{mission_id}", response_model=Mission)
def read_mission(
    mission_id: int, db: Session = Depends(get_db), user=Depends(security.get_current_user_optional)
):
    found = crud.get_mission(db, mission_id, _user_id(user))
    if found is None:
        raise HTTPException(status_code=404, detail="Mission not found")
    return _out(*found)


@router.patch("/{mission_id}", response_model=Mission)
def update_mission_status(
    mission_id: int,
    update: MissionUpdateStatus,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    """미션 완료 처리 ('completed') 또는 되돌리기 ('today'). 로그인한 사용자 본인 기록만 바뀐다."""
    if update.status == MissionStatus.LOCKED:
        raise HTTPException(status_code=400, detail="'locked' 상태로는 바꿀 수 없습니다.")
    found = crud.get_mission(db, mission_id, current_user.id)
    if found is None:
        raise HTTPException(status_code=404, detail="Mission not found")
    mission, _ = found
    return _out(mission, crud.set_mission_status(db, mission, current_user.id, update.status.value))
