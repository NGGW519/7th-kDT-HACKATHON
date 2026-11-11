from sqlalchemy.orm import Session

from ..models import models


def get_chat_session(db: Session, session_id: int) -> models.ChatSession | None:
    return db.query(models.ChatSession).filter(models.ChatSession.id == session_id).first()


def create_chat_session(db: Session, user_id: int | None = None) -> models.ChatSession:
    db_session = models.ChatSession(user_id=user_id)
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


def get_chat_messages(db: Session, session_id: int, limit: int = 20) -> list[models.ChatMessage]:
    """최근 `limit` 개의 메시지를 시간순(오래된 것 → 최신)으로 반환한다."""
    recent = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.session_id == session_id)
        .order_by(models.ChatMessage.id.desc())  # created_at 은 초 단위라 같은 초의 순서가 섞일 수 있음
        .limit(limit)
        .all()
    )
    return recent[::-1]


def add_chat_message(db: Session, session_id: int, role: str, content: str) -> models.ChatMessage:
    db_message = models.ChatMessage(session_id=session_id, role=role, content=content)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message
