"""백엔드 테스트 공통 설정.

실제 PostgreSQL(PostGIS + pgvector)에 테스트 전용 DB(POSTGRES_DB=hometown_test)를 만들어 쓰고,
LLM 은 가짜로 바꿔 네트워크 없이 실행한다.

DB 접속 정보는 환경 변수 POSTGRES_HOST/PORT/USER/PASSWORD (없으면 루트 .env) 를 따른다.
예) docker compose up -d db 후:  cd HometownON/backend && pytest
"""
import os
import uuid

import psycopg
import pytest

os.environ["POSTGRES_DB"] = os.environ.get("TEST_POSTGRES_DB", "hometown_test")  # 개발 DB 를 건드리지 않도록
os.environ.setdefault("MONOGPT_API_KEY", "test-key")
os.environ.setdefault("SECRET_KEY", "test-secret-key-that-is-long-enough-32b")
os.environ["GOOGLE_CLIENT_ID_WEB"] = "test-client.apps.googleusercontent.com"
os.environ["WEATHER_API_KEY"] = ""     # 테스트에서 외부 날씨/지도 API 를 부르지 않도록
os.environ["GOOGLEMAP_API_KEY"] = ""

from app.core.config import settings  # noqa: E402  (환경 변수를 정한 뒤 import)

from .fake_llm import FakeProvider  # noqa: E402


def admin_connect(dbname: str = "postgres"):
    return psycopg.connect(
        host=settings.POSTGRES_HOST, port=settings.POSTGRES_PORT, user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD, dbname=dbname, autocommit=True, connect_timeout=10,
    )


def recreate_database(name: str) -> None:
    with admin_connect() as conn:
        conn.execute(f'DROP DATABASE IF EXISTS "{name}" WITH (FORCE)')
        conn.execute(f'CREATE DATABASE "{name}"')


@pytest.fixture(scope="session")
def client():
    """빈 DB 에서 앱을 시작한다 (시작 시 확장/테이블 생성까지 확인)."""
    recreate_database(settings.POSTGRES_DB)
    from fastapi.testclient import TestClient

    from app.core.database import engine
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client
    engine.dispose()


@pytest.fixture
def db_conn(client):
    with admin_connect(settings.POSTGRES_DB) as conn:
        yield conn


@pytest.fixture(autouse=True)
def fake_llm(monkeypatch):
    """모든 테스트에서 실제 LLM 호출을 막고 가짜 응답을 쓴다."""
    from app.chatbot import llm

    provider = FakeProvider()
    monkeypatch.setattr(llm, "get_chat_llm", provider.get_chat_llm)
    monkeypatch.setattr(llm, "get_structured_llm", provider.get_structured_llm)
    return provider


def signup_and_login(client, email: str | None = None, name: str = "김귀향") -> tuple[dict, int]:
    """새 사용자를 만들고 (인증 헤더, 사용자 id) 를 돌려준다."""
    email = email or f"user-{uuid.uuid4().hex[:10]}@example.com"
    body = {
        "email": email, "password": "secret123", "phone": "010-0000-0000",
        "profile": {"display_name": name, "birth_year": 1962, "home_region": "경남 함안군", "target_region": "경남 함안군"},
    }
    r = client.post("/api/users/signup", json=body)
    assert r.status_code == 201, r.text
    token = client.post("/api/users/login", json={"email": email, "password": "secret123"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}, r.json()["id"]


@pytest.fixture
def user(client):
    return signup_and_login(client)


@pytest.fixture
def other_user(client):
    return signup_and_login(client, name="이주민")
