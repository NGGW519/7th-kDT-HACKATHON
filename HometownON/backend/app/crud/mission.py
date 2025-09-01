from sqlalchemy.orm import Session

from ..models.models import Mission
from ..schemas.mission import MissionCreate

def get_mission(db: Session, mission_id: int):
    return db.query(Mission).filter(Mission.id == mission_id).first()

def get_missions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Mission).offset(skip).limit(limit).all()

def create_mission(db: Session, mission: MissionCreate):
    db_mission = Mission(**mission.dict())
    db.add(db_mission)
    db.commit()
    db.refresh(db_mission)
    return db_mission

# You can add update and delete functions here as well
