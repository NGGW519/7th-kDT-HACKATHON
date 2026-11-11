from sqlalchemy.orm import Session

from ..core.security import get_password_hash
from ..models import models
from ..schemas import schemas


def get_user_by_email(db: Session, email: str) -> models.User | None:
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> models.User | None:
    return db.get(models.User, user_id)


def get_user_profile(db: Session, user_id: int) -> models.UserProfile | None:
    return db.get(models.UserProfile, user_id)


def create_user_with_profile(
    db: Session, user: schemas.UserCreate, profile: schemas.UserProfileCreate
) -> models.User:
    """사용자와 프로필을 하나의 트랜잭션으로 생성한다 (프로필 생성 실패 시 사용자도 롤백)."""
    db_user = models.User(
        email=user.email,
        password_hash=get_password_hash(user.password),
        phone=user.phone,
    )
    db_user.profile = models.UserProfile(**profile.model_dump())
    db.add(db_user)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(db_user)
    return db_user


def get_social_account(db: Session, provider: str, provider_uid: str) -> models.SocialAccount | None:
    return (
        db.query(models.SocialAccount)
        .filter(models.SocialAccount.provider == provider, models.SocialAccount.provider_uid == provider_uid)
        .first()
    )


def get_or_create_social_user(
    db: Session, provider: str, provider_uid: str, email: str, display_name: str | None = None
) -> models.User:
    """소셜 로그인 사용자를 찾거나 만든다.

    같은 이메일로 이미 가입한 사용자가 있으면 새로 만들지 않고 그 계정에 소셜 계정을 연결한다.
    (이메일은 Google 이 확인한 값만 쓰도록 호출하는 쪽에서 email_verified 를 확인한다)
    """
    social = get_social_account(db, provider, provider_uid)
    if social is not None:
        return social.user

    user = get_user_by_email(db, email)
    if user is None:
        user = models.User(email=email, password_hash=None)  # 소셜 전용 계정은 비밀번호가 없다
        if display_name:
            user.profile = models.UserProfile(display_name=display_name[:80])
        db.add(user)
        db.flush()
    db.add(models.SocialAccount(user_id=user.id, provider=provider, provider_uid=provider_uid))
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(user)
    return user
