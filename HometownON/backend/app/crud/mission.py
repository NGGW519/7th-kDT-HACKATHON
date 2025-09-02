from sqlalchemy.orm import Session
from sqlalchemy import case

from ..models.models import Mission
from ..schemas.mission import MissionCreate

def get_mission(db: Session, mission_id: int):
    return db.query(Mission).filter(Mission.id == mission_id).first()

def get_missions(db: Session, skip: int = 0, limit: int = 100):
    # Define the custom order for status
    status_order = case(
        (Mission.status == "today", 1),
        (Mission.status == "locked", 2),
        (Mission.status == "completed", 3),
        else_=4 # For any other unexpected status
    )
    return db.query(Mission).order_by(status_order).offset(skip).limit(limit).all()

def create_mission(db: Session, mission: MissionCreate):
    db_mission = Mission(**mission.dict())
    db.add(db_mission)
    db.commit()
    db.refresh(db_mission)
    return db_mission

# You can add update and delete functions here as well
