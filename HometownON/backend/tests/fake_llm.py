"""ChatOpenAI 대신 쓰는 가짜 LLM. 테스트가 미리 정한 답을 순서대로 돌려준다."""
from langchain_core.messages import AIMessage


class FakeProvider:
    def __init__(self):
        self.chat_replies: list = []       # str 또는 AIMessage (도구 호출 포함 가능)
        self.structured: dict = {}         # 스키마 이름 -> dict 목록
        self.calls: list = []              # LLM 에 전달된 메시지 기록
        self.fail = False                  # True 면 모든 호출이 예외

    # app.chatbot.llm.get_chat_llm 대체
    def get_chat_llm(self, temperature: float = 0.7, max_tokens: int | None = None):
        return _FakeChat(self)

    # app.chatbot.llm.get_structured_llm 대체
    def get_structured_llm(self, schema, temperature: float = 0):
        return _FakeStructured(self, schema)

    def tool_call(self, name: str, args: dict, call_id: str | None = None) -> AIMessage:
        return AIMessage(content="", tool_calls=[{"name": name, "args": args, "id": call_id or f"call_{name}"}])


class _FakeChat:
    def __init__(self, provider: FakeProvider):
        self.p = provider

    def bind_tools(self, tools):
        return self

    def invoke(self, messages):
        self.p.calls.append(messages)
        if self.p.fail:
            raise RuntimeError("simulated LLM outage")
        reply = self.p.chat_replies.pop(0) if self.p.chat_replies else "기본 답변입니다."
        return reply if isinstance(reply, AIMessage) else AIMessage(content=reply)

    async def ainvoke(self, messages):
        return self.invoke(messages)


class _FakeStructured:
    def __init__(self, provider: FakeProvider, schema):
        self.p, self.schema = provider, schema

    def invoke(self, messages):
        self.p.calls.append(messages)
        if self.p.fail:
            raise RuntimeError("simulated LLM outage")
        queue = self.p.structured.get(self.schema.__name__)
        if not queue:
            raise RuntimeError(f"no fake output for {self.schema.__name__}")
        return self.schema(**(queue.pop(0) if len(queue) > 1 else queue[0]))
