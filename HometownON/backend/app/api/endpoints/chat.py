from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from openai import OpenAI
import asyncio

from ... import crud
from ...schemas import schemas
from ...core.database import get_db
from ...core.config import settings

router = APIRouter()

client = OpenAI(api_key=settings.OPENAI_API_KEY)

class ChatRequest(schemas.BaseModel):
    session_id: int | None = None
    message: str

async def stream_openai_response(session_id: int, history: list, db: Session):
    """Async generator to stream responses from OpenAI and save the full response."""
    stream = client.chat.completions.create(
        model="gpt-4o",
        messages=history,
        stream=True,
    )
    
    full_response = ""
    for chunk in stream:
        content = chunk.choices[0].delta.content or ""
        full_response += content
        yield content
        await asyncio.sleep(0) # Yield control to the event loop

    # Save the assistant's full response to the database
    crud.crud_chat.add_chat_message(
        db=db, session_id=session_id, role="assistant", content=full_response
    )

@router.post("/chat", response_class=StreamingResponse)
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    session_id = request.session_id

    # If a session_id is provided, verify it exists.
    if session_id is not None:
        chat_session = crud.crud_chat.get_chat_session(db=db, session_id=session_id)
        if not chat_session:
            raise HTTPException(
                status_code=404, 
                detail=f"Chat session with id {session_id} not found."
            )
    # If no session_id is provided, create a new session.
    else:
        # In a real app, you'd associate the session with the logged-in user
        chat_session = crud.crud_chat.create_chat_session(db=db)
        session_id = chat_session.id

    # Save user message
    crud.crud_chat.add_chat_message(
        db=db, session_id=session_id, role="user", content=request.message
    )

    # Get conversation history
    db_messages = crud.crud_chat.get_chat_messages(db=db, session_id=session_id)
    
    # Format for OpenAI API
    history = [
        {"role": msg.role, "content": msg.content} for msg in db_messages
    ]

    return StreamingResponse(
        stream_openai_response(session_id, history, db),
        media_type="text/event-stream",
        headers={"X-Session-Id": str(session_id)}
    )