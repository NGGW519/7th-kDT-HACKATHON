from sqlalchemy.orm import Session
from ..models import models
from ..schemas import schemas

def get_chat_session(db: Session, session_id: int) -> models.ChatSession | None:
    """Get a single chat session by its ID."""
    return db.query(models.ChatSession).filter(models.ChatSession.id == session_id).first()

def create_chat_session(db: Session, user_id: int = None) -> models.ChatSession:
    db_session = models.ChatSession(user_id=user_id)
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def get_chat_messages(db: Session, session_id: int, limit: int = 20) -> list[models.ChatMessage]:
    return (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.session_id == session_id)
        .order_by(models.ChatMessage.created_at.desc())
        .limit(limit)
        .all()[::-1]  # Reverse to get chronological order
    )

def add_chat_message(
    db: Session, session_id: int, role: str, content: str
) -> models.ChatMessage:
    db_message = models.ChatMessage(session_id=session_id, role=role, content=content)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message