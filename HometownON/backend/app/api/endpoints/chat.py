import asyncio
import openai
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.core.config import OPENAI_API_KEY
from app.schemas.chat_schema import ChatRequest

router = APIRouter()

# OpenAI API 키가 설정되지 않았을 경우를 대비
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다.")

client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)

async def sse_openai_stream(messages: list):
    """OpenAI 스트리밍 응답을 Server-Sent Events (SSE) 형식으로 변환하는 비동기 제너레이터"""
    try:
        stream = await client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            stream=True,
        )
        async for chunk in stream:
            content = chunk.choices[0].delta.content
            if content:
                # SSE 형식: "data: <json_string>\n\n"
                yield f"data: {content}\n\n"
                await asyncio.sleep(0.01)  # 클라이언트 부하 방지를 위한 약간의 딜레이
    except Exception as e:
        print(f"OpenAI 스트림 중 오류 발생: {e}")
        yield f"data: [INTERNAL_SERVER_ERROR] {str(e)}\n\n"

@router.post("/chat/stream")
async def chat_stream_endpoint(chat_request: ChatRequest):
    """
    클라이언트로부터 대화 내역을 받아 OpenAI의 GPT-4o 모델로부터의 스트리밍 응답을 SSE로 전송합니다.
    """
    # Pydantic 모델을 dictionary 리스트로 변환
    message_dicts = [message.dict() for message in chat_request.messages]
    return StreamingResponse(sse_openai_stream(message_dicts), media_type="text/event-stream")
