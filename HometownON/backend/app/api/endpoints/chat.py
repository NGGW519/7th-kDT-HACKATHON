from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.types import RunnableConfig
import uuid
import logging
from fastapi.security import HTTPAuthorizationCredentials

from ... import crud, models
from ...core.database import get_db
from ...core import security
from ...chatbot.graph import app

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class ChatRequest(BaseModel):
    session_id: int | None = None
    message: str

async def event_stream(request: ChatRequest, db: Session, user_id: int, token: str, session_id: int = None):
    if session_id is None:
        chat_session = crud.crud_chat.create_chat_session(db=db, user_id=user_id)
        db.commit()
        session_id = chat_session.id
        logger.info(f"Created new session: {session_id}")
    else:
        logger.info(f"Using provided session: {session_id}")

    crud.crud_chat.add_chat_message(db=db, session_id=session_id, role="user", content=request.message)
    db.commit()

    chat_history = crud.crud_chat.get_chat_messages(db=db, session_id=session_id)
    formatted_messages = []
    for msg in chat_history:
        if msg.role == "user":
            formatted_messages.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            formatted_messages.append(AIMessage(content=msg.content))

    initial_state = {
        "prompt": request.message,
        "messages": formatted_messages,
        "user_id": user_id,
        "token": token,
    }

    config = RunnableConfig(configurable={"thread_id": f"session_{session_id}"})

    full_response = ""
    stop_streaming = False
    try:
        logger.info("Starting graph execution...")
        async for event in app.astream(initial_state, config=config):
            for node_name, node_data in event.items():
                if isinstance(node_data, dict):
                    if "generation" in node_data and node_data["generation"]:
                        response_text = node_data["generation"]
                        logger.info(f"Got final response from {node_name}: {response_text}")
                        full_response = response_text
                        yield response_text
                        stop_streaming = True
                        break
                    
                    if "messages" in node_data:
                        ai_message = node_data["messages"][-1]
                        if hasattr(ai_message, "content") and ai_message.content and ai_message.content != full_response:
                            logger.info(f"Streaming content from {node_name}")
                            full_response = ai_message.content
                            yield full_response
                            stop_streaming = True
                            break
            if stop_streaming:
                break

        logger.info(f"Stream completed. Full response length: {len(full_response)}")

    except Exception as e:
        logger.error(f"Error during graph execution: {e}", exc_info=True)
        raise

    if full_response:
        crud.crud_chat.add_chat_message(db=db, session_id=session_id, role="assistant", content=full_response)
        db.commit()
        logger.info(f"Saved AI response to session {session_id}")
    else:
        logger.warning(f"No response content to save for session {session_id}")

@router.post("/chat")
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user), credentials: HTTPAuthorizationCredentials = Depends(security.security)):
    user_id = current_user.id # Extract ID here
    session_id = request.session_id
    if not session_id:
        chat_session = crud.crud_chat.create_chat_session(db=db, user_id=user_id)
        db.commit()
        session_id = chat_session.id
    
    async def simple_generator():
        async for chunk in event_stream(request, db, user_id, credentials.credentials, session_id):
            yield chunk
    
    return StreamingResponse(
        simple_generator(), 
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Session-ID": str(session_id)
        }
    )
