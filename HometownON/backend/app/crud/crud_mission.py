"""미션 CRUD.

- 기본 미션(created_by_user_id 가 NULL)은 모두에게, 챗봇이 만든 미션은 만든 사용자에게만 보인다.
- 완료 여부는 사용자별로 mission_assignments.status 에 저장한다 (한 사람이 완료해도 다른 사람에겐 그대로).
"""
import logging
import uuid

from sqlalchemy import case, or_, select
from sqlalchemy.orm import Session

from ..models import models

logger = logging.getLogger(__name__)

MISSION_TYPES = ("exploration", "bonding", "career")
_KOREAN_TYPES = {"탐색형": "exploration", "사회유대형": "bonding", "유대형": "bonding", "커리어형": "career"}
_CODE_PREFIX = {"exploration": "EXP", "bonding": "BND", "career": "CAR"}


def mission_type_key(value) -> str:
    """'탐색형' 같은 한글 이름도 받아 영문 키로 바꾼다. 모르는 값이면 exploration."""
    value = (value or "").strip()
    key = _KOREAN_TYPES.get(value, value)
    return key if key in MISSION_TYPES else "exploration"


def normalize_tags(tags):
    """"시장,교류" 같은 쉼표 문자열을 ["시장", "교류"] 로 바꾼다."""
    if isinstance(tags, str):
        return [t.strip() for t in tags.split(",") if t.strip()] or None
    return tags or None


def _new_code(mission_type: str) -> str:
    return f"{_CODE_PREFIX.get(mission_type, 'GEN')}{uuid.uuid4().hex[:8].upper()}"


def _difficulty(value) -> int:
    try:
        value = int(value)
    except (TypeError, ValueError):
        return 1
    return value if 1 <= value <= 3 else 1


# ---------------- 조회 ----------------
def _visible(query, user_id: int | None):
    if user_id is None:
        return query.filter(models.Mission.created_by_user_id.is_(None))
    return query.filter(
        or_(models.Mission.created_by_user_id.is_(None), models.Mission.created_by_user_id == user_id)
    )


def _completed_ids_subquery(user_id: int | None):
    return select(models.MissionAssignment.mission_id).where(
        models.MissionAssignment.user_id == user_id,
        models.MissionAssignment.status == "completed",
    )


def completed_mission_ids(db: Session, user_id: int | None) -> set[int]:
    if user_id is None:
        return set()
    return set(db.scalars(_completed_ids_subquery(user_id)))


def list_missions(db: Session, user_id: int | None, skip: int = 0, limit: int = 100):
    """(미션, 상태) 목록. 오늘 할 미션이 먼저, 완료한 미션이 뒤에 온다."""
    done_first_last = case((models.Mission.id.in_(_completed_ids_subquery(user_id)), 1), else_=0)
    missions = (
        _visible(db.query(models.Mission), user_id)
        .order_by(done_first_last, models.Mission.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    done = completed_mission_ids(db, user_id)
    return [(m, "completed" if m.id in done else "today") for m in missions]


def get_mission(db: Session, mission_id: int, user_id: int | None):
    """사용자에게 보이는 미션이면 (미션, 상태), 아니면 None."""
    mission = _visible(db.query(models.Mission), user_id).filter(models.Mission.id == mission_id).first()
    if mission is None:
        return None
    return mission, ("completed" if mission.id in completed_mission_ids(db, user_id) else "today")


def get_completed_missions(db: Session, user_id: int | None) -> list[models.Mission]:
    if user_id is None:
        return []
    return (
        db.query(models.Mission)
        .filter(models.Mission.id.in_(_completed_ids_subquery(user_id)))
        .order_by(models.Mission.id)
        .all()
    )


# ---------------- 상태 변경 ----------------
def set_mission_status(db: Session, mission: models.Mission, user_id: int, status: str) -> str:
    """사용자의 미션 상태를 바꾸고 바뀐 상태를 돌려준다 ('completed' 또는 'today')."""
    assignment = (
        db.query(models.MissionAssignment)
        .filter(models.MissionAssignment.user_id == user_id, models.MissionAssignment.mission_id == mission.id)
        .order_by(models.MissionAssignment.id.desc())
        .first()
    )
    if status == "completed":
        if assignment is None:
            assignment = models.MissionAssignment(user_id=user_id, mission_id=mission.id)
            db.add(assignment)
        assignment.status = "completed"
    elif assignment is not None and assignment.status == "completed":  # 'today' 로 되돌리기
        assignment.status = "assigned"
    db.commit()
    return "completed" if status == "completed" else "today"


# ---------------- 생성 ----------------
def create_mission(db: Session, user_id: int, data: dict) -> models.Mission:
    """사용자가 직접 만든 미션 (만든 사람에게만 보인다)."""
    mission_type = mission_type_key(data.get("mission_type"))
    mission = models.Mission(
        code=_new_code(mission_type),
        title=data.get("title"),
        description=data.get("description"),
        mission_type=mission_type,
        difficulty=_difficulty(data.get("difficulty")),
        expected_minutes=data.get("expected_minutes"),
        tags=normalize_tags(data.get("tags")),
        thumbnail_image=data.get("thumbnail_image"),
        created_by_user_id=user_id,
    )
    db.add(mission)
    db.commit()
    db.refresh(mission)
    return mission


def create_mission_from_chatbot(db: Session, user_id: int, mission_data: dict):
    """챗봇이 만든 미션을 저장하고 그 사용자에게 배정한다. 실패하면 None."""
    try:
        mission = models.Mission(
            code=_new_code(mission_type_key(mission_data.get("mission_type"))),
            title=(mission_data.get("title") or "새로운 AI 미션")[:200],
            description=mission_data.get("description"),
            mission_type=mission_type_key(mission_data.get("mission_type")),
            difficulty=_difficulty(mission_data.get("difficulty")),
            expected_minutes=mission_data.get("expected_minutes") or 30,
            tags=normalize_tags(mission_data.get("tags")),
            thumbnail_image=mission_data.get("thumbnail_image"),
            created_by_user_id=user_id,
        )
        db.add(mission)
        db.flush()
        assignment = models.MissionAssignment(
            user_id=user_id, mission_id=mission.id, status="assigned", context=mission_data
        )
        db.add(assignment)
        db.commit()
        db.refresh(assignment)
        logger.info("Created mission %s for user %s", mission.id, user_id)
        return assignment
    except Exception:
        logger.exception("Error creating mission from chatbot")
        db.rollback()
        return None
