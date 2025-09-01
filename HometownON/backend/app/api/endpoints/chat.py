from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.types import RunnableConfig  # 추가
import uuid  # 추가
import logging  # 디버깅용

from ... import crud
from ...core.database import get_db
from ...chatbot.graph import app  # Import the compiled LangGraph app

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


class ChatRequest(BaseModel):
    session_id: int | None = None
    message: str


async def event_stream(request: ChatRequest, db: Session, session_id: int = None):
    """Async generator to stream LangGraph response."""
    user_id = None  # Auth token에서 가져올 수 있음

    # 1. session_id가 이미 전달된 경우 사용, 아니면 기존 로직
    if session_id is None:
        session_id = request.session_id
        if session_id:
            chat_session = crud.crud_chat.get_chat_session(db=db, session_id=session_id)
            if not chat_session:
                raise HTTPException(status_code=404, detail="Chat session not found.")
            logger.info(f"🔍 Using existing session: {session_id}")
        else:
            chat_session = crud.crud_chat.create_chat_session(db=db, user_id=user_id)
            db.commit()
            session_id = chat_session.id
            logger.info(f"🆕 Created new session: {session_id}")
    else:
        logger.info(f"📌 Using provided session: {session_id}")

    # 2. Save user message to DB
    crud.crud_chat.add_chat_message(
        db=db, session_id=session_id, role="user", content=request.message
    )
    db.flush()
    db.commit()
    logger.info(f"💾 Saved user message to session {session_id}")

    # 3. Fetch full chat history for LangGraph memory
    chat_history = crud.crud_chat.get_chat_messages(db=db, session_id=session_id)
    logger.info(f"📚 Retrieved {len(chat_history)} messages from DB for session {session_id}")
    
    # 디버깅: 각 메시지 내용 확인
    for i, msg in enumerate(chat_history):
        logger.info(f"   Message {i+1}: {msg.role} - {msg.content[:50]}...")

    formatted_messages = []
    for msg in chat_history:
        if msg.role == "user":
            formatted_messages.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            formatted_messages.append(AIMessage(content=msg.content))
    
    logger.info(f"🔄 Formatted {len(formatted_messages)} messages for LangGraph")
    
    # 디버깅: 포맷된 메시지들 확인
    for i, msg in enumerate(formatted_messages):
        logger.info(f"   Formatted Message {i+1}: {type(msg).__name__} - {msg.content[:50]}...")

    # 4. Prepare initial state
    initial_state = {
        "prompt": request.message,
        "messages": formatted_messages,
    }
    logger.info(f"🎯 Initial state prepared with {len(initial_state['messages'])} messages")

    # 5. ✨ RunnableConfig 설정 - 세션 ID를 thread_id로 사용 ✨
    thread_id = f"session_{session_id}"  # 더 명확한 thread_id
    config = RunnableConfig(
        configurable={
            "thread_id": thread_id
        }
    )
    logger.info(f"⚙️ Config created with thread_id: {thread_id}")

    # 6. 체크포인터 상태 확인 및 기존 상태 로드
    try:
        from ...chatbot.graph import memory
        existing_checkpoints = list(memory.list(config))
        logger.info(f"🗄️ Found {len(existing_checkpoints)} existing checkpoints for thread {thread_id}")
        
        # 기존 상태가 있다면 로드해서 확인
        if existing_checkpoints:
            latest_checkpoint = memory.get(config)
            if latest_checkpoint and latest_checkpoint.checkpoint:
                logger.info(f"📖 Latest checkpoint has state keys: {list(latest_checkpoint.checkpoint.keys())}")
                if "messages" in latest_checkpoint.checkpoint:
                    checkpoint_messages = latest_checkpoint.checkpoint["messages"]
                    logger.info(f"🧠 Checkpoint contains {len(checkpoint_messages)} messages")
    except Exception as e:
        logger.warning(f"⚠️ Could not check existing checkpoints: {e}")

    # 7. LangGraph 상태와 DB 상태 비교
    logger.info(f"🔍 State comparison:")
    logger.info(f"   DB messages: {len(formatted_messages)}")
    logger.info(f"   Initial state messages: {len(initial_state['messages'])}")
    logger.info(f"   Current prompt: {request.message[:50]}...")

    # 8. Stream the graph execution with config
    full_response = ""
    event_count = 0
    try:
        logger.info(f"🚀 Starting graph execution...")
        async for event in app.astream(initial_state, config=config):  # config 추가!
            event_count += 1
            logger.info(f"📨 Event {event_count}: {list(event.keys())}")
            
            # 각 이벤트의 상태도 로깅
            for node_name, node_data in event.items():
                if "messages" in node_data:
                    logger.info(f"   {node_name} has {len(node_data['messages'])} messages in state")
            
            # 모든 에이전트의 응답을 확인
            for agent_name in ["GeneralChatAgent", "AnswerGenerationAgent", "GeneratePostAgent", "GenerateMissionAgent"]:
                if agent_name in event:
                    logger.info(f"🤖 {agent_name} responded")
                    ai_message = event[agent_name]["messages"][-1]
                    if hasattr(ai_message, "content") and ai_message.content:
                        logger.info(f"💬 {agent_name} content length: {len(ai_message.content)}")
                        # SSE-safe format
                        for char in ai_message.content:
                            yield char
                            full_response += char
                        break  # 하나의 에이전트만 처리
        
        logger.info(f"✅ Stream completed. Total events: {event_count}, Response length: {len(full_response)}")
                        
    except Exception as e:
        logger.error(f"❌ Error during graph execution: {e}")
        raise

    # 9. Save AI response to DB
    if full_response:
        crud.crud_chat.add_chat_message(
            db=db, session_id=session_id, role="assistant", content=full_response
        )
        db.commit()
        logger.info(f"💾 Saved AI response to session {session_id}")
        
        # 최종 확인: DB에 저장된 총 메시지 수
        final_count = len(crud.crud_chat.get_chat_messages(db=db, session_id=session_id))
        logger.info(f"📊 Final message count in DB for session {session_id}: {final_count}")
    else:
        logger.warning(f"⚠️ No response content to save for session {session_id}")


@router.post("/chat")
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    """Chat endpoint that returns session_id in response header"""
    
    # 세션 ID 미리 가져오기/생성
    session_id = request.session_id
    if session_id:
        chat_session = crud.crud_chat.get_chat_session(db=db, session_id=session_id)
        if not chat_session:
            raise HTTPException(status_code=404, detail="Chat session not found.")
    else:
        chat_session = crud.crud_chat.create_chat_session(db=db, user_id=None)
        db.commit()
        session_id = chat_session.id
    
    # 단순 텍스트 스트리밍
    async def simple_generator():
        async for chunk in event_stream(request, db, session_id):
            yield chunk
    
    return StreamingResponse(
        simple_generator(), 
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Session-ID": str(session_id)  # 헤더로 session_id 전달
        }
    )