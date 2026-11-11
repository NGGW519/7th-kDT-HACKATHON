from enum import Enum
from typing import Any, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

MissionType = Literal["exploration", "bonding", "career"]  # 탐색형 / 사회유대형 / 커리어형


class MissionStatus(str, Enum):
    """앱에 보이는 미션 상태 (사용자별로 계산한다)."""
    TODAY = "today"
    LOCKED = "locked"
    COMPLETED = "completed"


class MissionCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    difficulty: int = Field(1, ge=1, le=3)
    mission_type: MissionType
    expected_minutes: Optional[int] = Field(None, ge=1)
    tags: Optional[list[str] | str] = None  # "시장,교류" 처럼 쉼표 문자열도 받는다
    thumbnail_image: Optional[str] = Field(None, max_length=500)


class MissionUpdateStatus(BaseModel):
    status: MissionStatus


class Mission(BaseModel):
    id: int
    code: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[int] = None
    mission_type: str
    expected_minutes: Optional[int] = None
    tags: Optional[Any] = None
    thumbnail_image: Optional[str] = None
    created_by_user_id: Optional[int] = None
    status: MissionStatus = MissionStatus.TODAY

    model_config = ConfigDict(from_attributes=True)


class UserMissionStats(BaseModel):
    total_exp: int
    level: int
    current_level_exp: int
    exp_for_next_level: int
    exp_needed: int
    completed_missions_count: int
    progress_percentage: float
