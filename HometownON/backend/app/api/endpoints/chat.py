from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage

from ... import crud
from ...core.database import get_db
from ...chatbot.graph import app # Import the compiled LangGraph app

router = APIRouter()

class ChatRequest(BaseModel):
    session_id: int | None = None
    message: str

async def event_stream(request: ChatRequest, db: Session):
    """The main async generator that streams the agent's response."""
    
    # In a real app, you would get the user_id from the auth token
    user_id = None 

    # 1. Get or create a chat session
    session_id = request.session_id
    if session_id:
        chat_session = crud.crud_chat.get_chat_session(db=db, session_id=session_id)
        if not chat_session:
            raise HTTPException(status_code=404, detail="Chat session not found.")
    else:
        chat_session = crud.crud_chat.create_chat_session(db=db, user_id=user_id)
        session_id = chat_session.id
    
    # 2. Save the user's message
    crud.crud_chat.add_chat_message(
        db=db, session_id=session_id, role="user", content=request.message
    )
    db.commit()

    # 3. Prepare the initial state for the graph
    # Fetch chat history for the session
    chat_history = crud.crud_chat.get_chat_messages(db=db, session_id=session_id)
    
    # Format history for LangGraph
    formatted_messages = []
    for msg in chat_history:
        if msg.role == "user":
            formatted_messages.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            formatted_messages.append(AIMessage(content=msg.content))
    
    # Add the current message to the history
    formatted_messages.append(HumanMessage(content=request.message))

    initial_state = {
        "prompt": request.message,
        "messages": formatted_messages,
    }

    # 4. Stream the graph execution
    # astream() returns an async iterator of all state changes
    full_response = ""
    async for event in app.astream(initial_state):
        print(f"LangGraph Event: {event}") # Debugging line
        if "GeneralChatAgent" in event:
            # Get the full AI message from the GeneralChatAgent's output
            ai_message = event["GeneralChatAgent"]["messages"][-1]
            if hasattr(ai_message, 'content') and ai_message.content:
                # Simulate streaming by yielding character by character
                for char in ai_message.content:
                    yield char
                    full_response += char

    # 5. Save the final assistant response after the stream is complete
    if full_response:
        crud.crud_chat.add_chat_message(
            db=db, session_id=session_id, role="assistant", content=full_response
        )
        db.commit()


@router.post("/chat")
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    """Receives a user message, runs the agent graph, and streams the response."""
    generator = event_stream(request, db)
    return StreamingResponse(generator, media_type="text/event-stream")