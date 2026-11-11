---
name: hometown-ai
description: "고향으로 ON의 LLM·AI 작업 규칙. 챗봇 에이전트(LangGraph, app/chatbot) 추가/수정, 프롬프트·도구 변경, MonoGPT 모델 설정, 임베딩·의미 검색(pgvector), 미션 추천(Ai_llm), 데이터 적재(Crawling_Haman Step 1~3), 이미지 생성 연동 시 반드시 따른다. 일반 API/DB 작업은 hometown-backend를 쓴다."
---

# 고향으로 ON AI 규칙

## 제공사 (사용자가 정한 원칙)
- **모든 LLM 호출(채팅, 구조화 출력, 도구 호출, 임베딩)은 MonoGPT 라우터로 한다.** OpenAI 호환 API: `MONOGPT_BASE_URL`(기본 `https://monogpt.kr/api/monorouter/v1`), 키 `MONOGPT_API_KEY`.
- 이미지 생성만 Google AI Studio(`GOOGLE_API_KEY`)를 쓴다.
- 다른 제공사(OpenRouter 등)로 바꾸거나 추가하려면 사용자 승인이 필요하다.
- MonoGPT는 유료다. 실제 호출 테스트는 꼭 필요할 때만, 짧은 응답(max_tokens 작게)으로 한다. 사용 가능한 모델은 `GET {base}/models`로 확인한다.

## 설정 위치
- 백엔드: `app/core/config.py`의 `LLM_MODEL`(기본 gpt-5.4-mini), `LLM_FALLBACK_MODELS`(기본 claude-haiku-4.5, 다른 회사 모델), `LLM_MAX_TOKENS`.
- 스크립트: `Ai_llm/mission_suggest/mission_rag.py`, `Crawling_Haman/Step_2/3`는 같은 이름의 환경 변수(`LLM_MODEL`, `EMBEDDING_MODEL` 등)를 읽는다.
- 모델 이름을 바꾸면 루트 `.env`, config.py 기본값, mission_rag.py 기본값, README 표를 함께 바꾼다. `scripts/check_llm_models.py`가 매주 이 설정을 점검한다.

## 챗봇 구조 (`app/chatbot/`)
- `llm.py`가 유일한 LLM 생성 지점이다: `get_chat_llm()`(대체 모델 자동 전환 포함), `get_structured_llm(schema)`(함수 호출 방식), `run_tool_agent()`(도구 호출 루프).
- 에이전트는 `from . import llm` 후 `llm.get_chat_llm()`처럼 **모듈을 통해** 호출한다. 테스트가 이 모듈 함수만 가짜로 바꾸기 때문이다.
- 그래프(`graph.py`): RoutingAgent가 `work_plan`을 정하고 각 에이전트가 `current_task_index`를 1씩 올린다. 사용자에게 보일 답은 `generation`에 넣는다. 대화 기록은 DB에 있으므로 체크포인터를 쓰지 않는다.
- 새 작업 종류를 추가하면: RoutingAgent의 `Literal` 목록, `ROUTING_PROMPT`, `graph.NODES`를 함께 고친다.

## 안전 규칙
- 로그인 토큰·비밀번호·전화번호·이메일을 프롬프트에 넣지 않는다. 외부 모델 제공사로 전송된다.
- 사용자에 묶인 쓰기 작업(미션 생성, 글 작성)은 도구 팩토리(`make_mission_tools(user_id)`처럼)로 서버가 user_id를 넣는다. LLM이 user_id나 토큰을 인자로 받게 만들지 않는다.
- 도구는 HTTP로 자기 서버를 부르지 말고 crud 함수를 직접 쓴다.

## 출력 형식 다루기
- 모델이 허용되지 않은 값을 내면 프롬프트 문장을 늘리기보다 pydantic `Literal`/`Field`로 허용 값을 제한한다(gpt-5.4-mini는 설명문만으로는 값 목록을 지키지 않았다).
- 장소 분류는 실제 DB 값(`맛집`, `카페`, `병원/의원`, `경로당`, `마을회관`)을 쓴다. Step 1이 넣는 값과 다르면 검색이 항상 빈 결과가 된다.

## 임베딩
- 모델: `EMBEDDING_MODEL`(기본 `text-embedding-3-small`, 1536차원). `rag_documents.embedding`은 차원 제한 없는 vector 컬럼이고 `embedding_model` 컬럼으로 모델을 구분한다.
- 모델을 바꾸면 기존 벡터와 섞어 검색하면 안 된다. 같은 컬렉션을 다시 임베딩한다(Step 2는 컬렉션을 지우고 다시 넣는다).
- 같은 PostgreSQL 연결에서 트랜잭션을 쓸 때는 `autocommit=True` 연결에서 `with conn.transaction()`을 쓴다(암묵 트랜잭션 안의 savepoint는 커밋되지 않는다).

## 테스트
- `HometownON/backend/tests/fake_llm.py`의 FakeProvider로 응답을 미리 정한다: `structured["WorkPlan"]`, `chat_replies`(문자열 또는 `tool_call(...)`).
- 프롬프트에 비밀값이 안 들어갔는지 `fake_llm.calls`로 확인하는 테스트를 유지한다.
