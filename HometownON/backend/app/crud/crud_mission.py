from sqlalchemy.orm import Session
from .. import models, schemas
import uuid
import logging

logger = logging.getLogger(__name__)

def create_mission_from_chatbot(db: Session, user_id: int, mission_data: dict):
    """
    Creates a new mission and assigns it to a user based on chatbot-generated data.
    """
    try:
        logger.info(f"Attempting to create mission with data: {mission_data}")
        
        # Map Korean mission types to English ENUM values
        mission_type_map = {
            '탐색형': 'exploration',
            '사회유대형': 'bonding',
            '커리어형': 'career'
        }
        # Ensure mission_type is provided and mapped, default to 'exploration' if not valid
        mission_type_korean = mission_data.get("mission_type", "탐색형")
        mission_type_enum = mission_type_map.get(mission_type_korean, 'exploration')
        if mission_type_enum not in ['exploration', 'bonding', 'career']:
            logger.warning(f"Invalid mission_type '{mission_type_korean}'. Defaulting to 'exploration'.")
            mission_type_enum = "exploration"

        # Directly use integer difficulty, default to 1 (easy) if not valid
        difficulty_int = mission_data.get("difficulty", 1)
        if not isinstance(difficulty_int, int) or not (1 <= difficulty_int <= 3):
            logger.warning(f"Invalid difficulty '{mission_data.get("difficulty")}'. Defaulting to 1.")
            difficulty_int = 1

        mission_type_code_prefix = {
            'exploration': 'EXP',
            'bonding': 'BND',
            'career': 'CAR'
        }.get(mission_type_enum, 'GEN') # Default to GEN for general if not found
        unique_code = f"{mission_type_code_prefix}{uuid.uuid4().hex[:5].upper()}" # Using first 5 chars of UUID for uniqueness

        new_mission = models.Mission(
            code=unique_code,
            title=mission_data.get("title", "새로운 AI 미션"),
            mission_type=mission_type_enum,
            difficulty=difficulty_int,
            expected_minutes=mission_data.get("expected_minutes", 30),
            tags=mission_data.get("tags"),
            description=mission_data.get("description"), # Renamed from instruction
            thumbnail_image=mission_data.get("thumbnail_image"),
            status=mission_data.get("status", "today"), # Default to 'today' for new missions
        )
        
        db.add(new_mission)
        db.flush() # Use flush to get the mission ID before commit

        logger.info(f"Successfully created Mission object (ID: {new_mission.id}). Now creating assignment.")

        new_assignment = models.MissionAssignment(
            user_id=user_id,
            mission_id=new_mission.id,
            status='assigned',
            context=mission_data
        )
        db.add(new_assignment)
        db.commit() # Commit both Mission and MissionAssignment
        db.refresh(new_assignment)

        logger.info(f"✅ Successfully created and assigned mission '{new_mission.title}' to user {user_id}")
        return new_assignment

    except Exception as e:
        logger.error(f"❌ Error creating mission from chatbot: {e}", exc_info=True)
        db.rollback()
        return None

def get_missions(db: Session, skip: int = 0, limit: int = 100):
    """모든 미션을 가져옵니다."""
    return db.query(models.Mission).offset(skip).limit(limit).all()

def get_mission(db: Session, mission_id: int):
    """특정 미션을 가져옵니다."""
    return db.query(models.Mission).filter(models.Mission.id == mission_id).first()

def get_completed_missions(db: Session):
    """완료된 미션들을 가져옵니다."""
    return db.query(models.Mission).filter(models.Mission.status == 'completed').all()

def update_mission_status(db: Session, mission_id: int, new_status: str):
    """미션 상태를 업데이트합니다."""
    mission = db.query(models.Mission).filter(models.Mission.id == mission_id).first()
    if mission and mission.status == 'today':  # 'today' 상태인 미션만 업데이트 가능
        mission.status = new_status
        db.commit()
        db.refresh(mission)
        return mission
    return None
