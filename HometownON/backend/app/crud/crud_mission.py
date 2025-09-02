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
        
        # Ensure mission_type is provided, default to '탐색형' if not
        mission_type = mission_data.get("mission_type", "탐색형")
        if mission_type not in ['탐색형', '사회유대형', '커리어형']:
            logger.warning(f"Invalid mission_type '{mission_type}'. Defaulting to '탐색형'.")
            mission_type = "탐색형"

        unique_code = f"ai_mission_{uuid.uuid4().hex[:8]}"

        new_mission = models.Mission(
            code=unique_code,
            title=mission_data.get("title", "새로운 AI 미션"),
            mission_type=mission_type,
            difficulty=1,
            description=mission_data.get("instruction"),
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
