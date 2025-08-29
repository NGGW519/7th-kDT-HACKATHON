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

def get_social_account_by_provider_uid(db: Session, provider: str, provider_uid: str):
    return db.query(models.SocialAccount).filter(
        models.SocialAccount.provider == provider,
        models.SocialAccount.provider_uid == provider_uid
    ).first()

def create_social_account(db: Session, user_id: int, provider: str, provider_uid: str):
    db_social_account = models.SocialAccount(user_id=user_id, provider=provider, provider_uid=provider_uid)
    db.add(db_social_account)
    db.commit()
    db.refresh(db_social_account)
    return db_social_account

def create_user_with_social_account(db: Session, provider: str, provider_uid: str, email: str, display_name: str = None):
    # Create a dummy password for social login users if needed, or handle differently
    # For simplicity, let's create a user without password for now, or generate a random one
    # If password is required by model, generate a random secure one
    # For now, assuming password_hash can be nullable or handled by security.py for social users
    db_user = models.User(email=email, password_hash=None) # Assuming password_hash can be None for social users
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    create_social_account(db, db_user.id, provider, provider_uid)

    # Create a basic profile for social users
    if display_name:
        db_profile = models.UserProfile(user_id=db_user.id, display_name=display_name, home_region="Unknown", target_region="Unknown")
        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)

    return db_user