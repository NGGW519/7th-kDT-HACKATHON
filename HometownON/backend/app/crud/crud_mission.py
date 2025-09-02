from sqlalchemy.orm import Session
from .. import models, schemas
import uuid

def create_mission_from_chatbot(db: Session, user_id: int, mission_data: dict):
    """
    Creates a new mission and assigns it to a user based on chatbot-generated data.
    """
    try:
        # 1. Create a new Mission instance
        # Generate a unique code for the mission
        unique_code = f"ai_mission_{uuid.uuid4().hex[:8]}"

        new_mission = models.Mission(
            code=unique_code,
            title=mission_data.get("title", "새로운 AI 미션"),
            mission_type='탐색형',  # Default to '탐색형' for location-based missions
            difficulty=1, # Default difficulty
            description=mission_data.get("instruction"),
            # You might want to add other fields like tags, thumbnail_image etc.
        )
        db.add(new_mission)
        db.flush() # Flush to get the new_mission.id

        # 2. Create a new MissionAssignment for the user
        new_assignment = models.MissionAssignment(
            user_id=user_id,
            mission_id=new_mission.id,
            status='assigned',
            context=mission_data # Store the full AI-generated data for context
        )
        db.add(new_assignment)
        db.commit()
        db.refresh(new_assignment)

        print(f"✅ Successfully created and assigned mission '{new_mission.title}' to user {user_id}")
        return new_assignment

    except Exception as e:
        db.rollback()
        print(f"❌ Error creating mission from chatbot: {e}")
        return None
