from sqlalchemy.orm import Session

from ..core.security import get_password_hash
from ..models import models
from ..schemas import schemas

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, password_hash=hashed_password, phone=user.phone)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_user_profile(db: Session, user_id: int, profile: schemas.UserProfileCreate):
    db_profile = models.UserProfile(user_id=user_id, **profile.model_dump())
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile
