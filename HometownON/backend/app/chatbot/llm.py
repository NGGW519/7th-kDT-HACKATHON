"""챗봇 에이전트가 함께 쓰는 LLM 설정 (MonoGPT 라우터, OpenAI 호환 API).

- 모델/대체 모델/최대 토큰은 루트 .env 의 LLM_MODEL, LLM_FALLBACK_MODELS, LLM_MAX_TOKENS 를 따른다.
- 기본 모델 호출이 실패하면 대체 모델로 자동으로 다시 시도한다 (도구 호출/구조화 출력 포함).
- 구조화 출력은 여러 회사 모델에서 모두 동작하는 함수 호출 방식을 쓴다.
"""
import json
import logging
from typing import Callable

from langchain_core.messages import AIMessage, BaseMessage, SystemMessage, ToolMessage
from langchain_core.tools import BaseTool
from langchain_openai import ChatOpenAI

from ..core.config import settings

logger = logging.getLogger(__name__)


def _chat_model(model: str, temperature: float, max_tokens: int | None) -> ChatOpenAI:
    return ChatOpenAI(
        model=model,
        api_key=settings.MONOGPT_API_KEY,
        base_url=settings.MONOGPT_BASE_URL,
        temperature=temperature,
        max_tokens=max_tokens or settings.LLM_MAX_TOKENS,
        timeout=60,
        max_retries=1,
    )


def get_chat_llm(temperature: float = 0.7, max_tokens: int | None = None):
    """기본 모델 + 대체 모델. bind_tools / with_structured_output 도 그대로 쓸 수 있다."""
    primary = _chat_model(settings.LLM_MODEL, temperature, max_tokens)
    fallbacks = [_chat_model(m, temperature, max_tokens) for m in settings.llm_fallback_models]
    return primary.with_fallbacks(fallbacks) if fallbacks else primary


def get_structured_llm(schema, temperature: float = 0):
    """pydantic 모델 형태로 답을 받는 LLM (함수 호출 방식)."""
    return get_chat_llm(temperature=temperature).with_structured_output(schema, method="function_calling")


def run_tool_agent(
    system_prompt: str,
    messages: list[BaseMessage],
    tools: list[BaseTool],
    temperature: float = 0.3,
    max_steps: int = 6,
    on_tool_result: Callable[[str, object], None] | None = None,
) -> str:
    """도구를 쓰는 에이전트 루프. 모델이 도구 호출을 멈추고 답한 내용을 돌려준다.

    on_tool_result(tool_name, result): 도구 결과를 호출한 쪽에서 따로 모을 때 사용.
    """
    llm = get_chat_llm(temperature=temperature).bind_tools(tools)
    by_name = {t.name: t for t in tools}
    history: list[BaseMessage] = [SystemMessage(content=system_prompt), *messages]

    for _ in range(max_steps):
        ai: AIMessage = llm.invoke(history)
        history.append(ai)
        if not ai.tool_calls:
            return ai.content if isinstance(ai.content, str) else str(ai.content)
        for call in ai.tool_calls:
            tool = by_name.get(call["name"])
            if tool is None:
                result = f"Error: unknown tool '{call['name']}'"
            else:
                try:
                    result = tool.invoke(call["args"])
                except Exception as e:  # 도구 오류도 모델에게 알려 다시 시도하게 한다
                    logger.warning("tool %s failed: %s", call["name"], e)
                    result = f"Error: {e}"
            if on_tool_result:
                on_tool_result(call["name"], result)
            content = result if isinstance(result, str) else json.dumps(result, ensure_ascii=False, default=str)
            history.append(ToolMessage(content=content, tool_call_id=call["id"]))
    return ""
