"""챗봇 API. 요청마다 에이전트 그래프(app/chatbot/graph.py)를 실행하고 답을 텍스트로 스트리밍한다.

- 로그인하지 않아도 대화·장소 검색은 되고, 미션/게시글 만들기는 로그인이 필요하다.
- 새 세션이 만들어지면 응답 헤더 X-Session-Id 로 세션 ID 를 알려준다.
"""
import logging
from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from langchain_core.messages import AIMessage, HumanMessage
from sqlalchemy.orm import Session

from ... import crud, schemas
from ...chatbot.graph import app as chatbot_graph
from ...core.database import SessionLocal, get_db
from ...core.security import get_current_user_optional
from ...models import models

logger = logging.getLogger(__name__)

router = APIRouter()

FALLBACK_ERROR_MESSAGE = "죄송합니다. 지금은 답변을 생성할 수 없어요. 잠시 후 다시 시도해주세요."


def _get_owned_session(db: Session, session_id: int, user) -> models.ChatSession:
    chat_session = crud.crud_chat.get_chat_session(db=db, session_id=session_id)
    owner_id = chat_session.user_id if chat_session else None
    # 다른 사용자의 세션은 존재 여부도 노출하지 않는다
    if not chat_session or (owner_id is not None and (user is None or user.id != owner_id)):
        raise HTTPException(status_code=404, detail=f"Chat session with id {session_id} not found.")
    return chat_session


def _to_langchain(messages: list[models.ChatMessage]):
    return [HumanMessage(content=m.content) if m.role == "user" else AIMessage(content=m.content)
            for m in messages if m.role in ("user", "assistant")]


async def run_chatbot(session_id: int, prompt: str, history, user_id: int | None) -> AsyncIterator[str]:
    """그래프를 실행하며 각 에이전트의 답(generation)을 순서대로 보낸다. 끝나면 전체 답을 DB 에 저장한다.

    StreamingResponse 는 요청 의존성(get_db)의 세션이 닫힌 뒤에도 실행될 수 있으므로
    저장용 DB 세션은 여기서 직접 연다.
    """
    parts: list[str] = []
    state = {"prompt": prompt, "messages": history, "user_id": user_id}
    try:
        async for update in chatbot_graph.astream(state, stream_mode="updates"):
            for node_output in update.values():
                text = (node_output or {}).get("generation")
                if text:
                    yield ("\n\n" if parts else "") + text
                    parts.append(text)
    except Exception:
        logger.exception("chatbot graph failed (session_id=%s)", session_id)
        if not parts:
            # 안내 문구는 화면에만 보내고 대화 기록에는 남기지 않는다
            # (기록에 남기면 다음 질문 때 모델이 이 문구를 자기 답변으로 보고 따라 하게 됨)
            yield FALLBACK_ERROR_MESSAGE
            return
    if not parts:
        yield FALLBACK_ERROR_MESSAGE
        return
    with SessionLocal() as db:
        crud.crud_chat.add_chat_message(db=db, session_id=session_id, role="assistant", content="\n\n".join(parts))


@router.post("/chat", response_class=StreamingResponse)
async def chat_endpoint(
    request: schemas.ChatRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),
):
    if request.session_id is not None:
        chat_session = _get_owned_session(db, request.session_id, current_user)
    else:
        chat_session = crud.crud_chat.create_chat_session(
            db=db, user_id=current_user.id if current_user else None
        )
    session_id = chat_session.id

    crud.crud_chat.add_chat_message(db=db, session_id=session_id, role="user", content=request.message)
    history = _to_langchain(crud.crud_chat.get_chat_messages(db=db, session_id=session_id))

    return StreamingResponse(
        run_chatbot(session_id, request.message, history, current_user.id if current_user else None),
        media_type="text/plain; charset=utf-8",
        headers={"X-Session-Id": str(session_id), "Cache-Control": "no-cache"},
    )


@router.get("/sessions/{session_id}/messages", response_model=list[schemas.ChatMessage])
def read_session_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),
):
    """세션의 대화 기록(최근 50개)을 시간순으로 반환한다."""
    _get_owned_session(db, session_id, current_user)
    return crud.crud_chat.get_chat_messages(db=db, session_id=session_id, limit=50)
