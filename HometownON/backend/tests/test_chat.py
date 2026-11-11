"""챗봇 API + 에이전트 그래프 (가짜 LLM 사용)."""
import uuid

import pytest
from langchain_core.messages import AIMessage

from app.api.endpoints.chat import FALLBACK_ERROR_MESSAGE


def plan(fake, *tasks):
    fake.structured["WorkPlan"] = [{"tasks": list(tasks), "reasoning": "test"}]


@pytest.fixture
def place(db_conn):
    """장소 검색/미션 생성에 쓸 실제 장소 하나 (분류: 식음료 / 맛집)."""
    db_conn.execute("insert into location_categories (main, sub) values ('식음료', '맛집') on conflict do nothing")
    cat = db_conn.execute("select id from location_categories where main='식음료' and sub='맛집'").fetchone()[0]
    name = f"가야국밥-{uuid.uuid4().hex[:6]}"
    db_conn.execute("insert into locations (name, category_id, address, phone, geom) values "
                    "(%s, %s, '경남 함안군 가야읍 함안대로 1', '055-000-0000', ST_SetSRID(ST_MakePoint(128.4064, 35.2723), 4326))",
                    (name, cat))
    return {"name": name, "address": "경남 함안군 가야읍 함안대로 1"}


def test_general_chat_streams_and_keeps_history(client, fake_llm):
    plan(fake_llm, "GeneralChat")
    fake_llm.chat_replies = ["안녕하세요! 고향이입니다."]
    r = client.post("/api/chatbot/chat", json={"message": "안녕"})
    assert r.status_code == 200 and r.text == "안녕하세요! 고향이입니다."
    sid = r.headers["x-session-id"]

    fake_llm.chat_replies = ["네, 말씀하세요."]
    r = client.post("/api/chatbot/chat", json={"message": "질문 있어요", "session_id": int(sid)})
    assert r.headers["x-session-id"] == sid
    # 두 번째 요청에서 LLM 은 이전 대화 + 현재 질문을 받는다
    last_chat_call = fake_llm.calls[-1]
    assert [type(m).__name__ for m in last_chat_call][-3:] == ["HumanMessage", "AIMessage", "HumanMessage"]

    history = client.get(f"/api/chatbot/sessions/{sid}/messages").json()
    assert [m["role"] for m in history] == ["user", "assistant", "user", "assistant"]


def test_llm_failure_returns_fallback_and_is_not_stored(client, fake_llm):
    fake_llm.fail = True  # 라우팅 실패 -> 일반 대화로, 일반 대화도 실패
    r = client.post("/api/chatbot/chat", json={"message": "실패 테스트"})
    assert r.status_code == 200 and r.text == FALLBACK_ERROR_MESSAGE
    history = client.get(f"/api/chatbot/sessions/{r.headers['x-session-id']}/messages").json()
    assert [m["role"] for m in history] == ["user"]


def test_sessions_are_private(client, user, fake_llm):
    headers, _ = user
    plan(fake_llm, "GeneralChat")
    sid = client.post("/api/chatbot/chat", json={"message": "내 세션"}, headers=headers).headers["x-session-id"]
    assert client.get(f"/api/chatbot/sessions/{sid}/messages").status_code == 404
    assert client.post("/api/chatbot/chat", json={"message": "끼어들기", "session_id": int(sid)}).status_code == 404
    assert client.get(f"/api/chatbot/sessions/{sid}/messages", headers=headers).status_code == 200
    assert client.post("/api/chatbot/chat", json={"message": ""}).status_code == 422


def test_database_search_answers_with_real_place(client, fake_llm, place):
    plan(fake_llm, "DatabaseSearch")
    fake_llm.structured["LocationQuery"] = [{"category": "맛집", "region": "가야읍"}]
    fake_llm.chat_replies = ["가야읍에 있는 식당을 추천해요."]
    r = client.post("/api/chatbot/chat", json={"message": "가야읍 맛집 알려줘"})
    assert r.text == "가야읍에 있는 식당을 추천해요."
    # 답변을 만들 때 DB 에서 찾은 장소 정보가 LLM 에 전달됐는지
    assert any("맛집:" in str(m) and "가야읍" in str(m) for m in fake_llm.calls[-1])


def test_mission_generation_saves_for_current_user_only(client, user, other_user, fake_llm, place):
    headers, user_id = user
    other_headers, _ = other_user
    plan(fake_llm, "GenerateMission")
    fake_llm.chat_replies = [
        fake_llm.tool_call("find_location_category_tool", {"user_prompt": "배고파요"}),
        fake_llm.tool_call("search_location_by_category_tool", {"category": "맛집", "region": "가야읍"}),
        fake_llm.tool_call("create_mission_and_save_tool", {"location_info": place, "user_prompt": "배고파요"}),
        "미션을 만들었어요!",
    ]
    fake_llm.structured["MissionDraft"] = [{
        "title": "국밥 한 그릇의 여유", "description": "식당에서 점심을 드세요", "mission_type": "exploration",
        "difficulty": 1, "expected_minutes": 40, "tags": ["맛집", "가야읍"]}]
    r = client.post("/api/chatbot/chat", json={"message": "배고파요 미션 만들어줘"}, headers=headers)
    assert r.text == "미션을 만들었어요!"

    mine = [m for m in client.get("/api/missions/?limit=500", headers=headers).json() if m["created_by_user_id"] == user_id]
    assert len(mine) == 1
    # 앱은 제목 앞부분(장소 이름)으로 장소를 찾는다
    assert mine[0]["title"].startswith(place["name"] + ", ") and mine[0]["status"] == "today"
    assert client.get(f"/api/missions/{mine[0]['id']}", headers=other_headers).status_code == 404


def test_mission_and_post_need_login(client, fake_llm):
    plan(fake_llm, "GenerateMission", "GeneratePost")
    r = client.post("/api/chatbot/chat", json={"message": "미션 만들고 글도 써줘"})
    assert "로그인이 필요해요" in r.text and r.text.count("로그인") == 2


def test_post_generation_uses_server_side_user_and_never_sends_token(client, user, fake_llm):
    headers, user_id = user
    plan(fake_llm, "GeneratePost")
    title = f"함안 봄나들이 {uuid.uuid4().hex[:4]}"
    fake_llm.chat_replies = [
        fake_llm.tool_call("create_post_tool", {"title": title, "content": "꽃이 피었어요", "category": "일상"}),
        AIMessage(content="게시글을 올렸어요."),
    ]
    r = client.post("/api/chatbot/chat", json={"message": "봄나들이 글 써서 올려줘"}, headers=headers)
    assert "게시글" in r.text
    post = next(p for p in client.get("/api/board/?limit=100").json() if p["title"] == title)
    assert post["author"]["id"] == user_id and post["category"] == "일상"
    token = headers["Authorization"].split()[1]
    assert all(token not in str(call) for call in fake_llm.calls)  # 로그인 토큰이 LLM 으로 가지 않는다
