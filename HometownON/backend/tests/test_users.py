import datetime
import uuid

from app.api.endpoints import users as users_endpoint

from .conftest import signup_and_login


def _signup_body(email, password="secret123", profile=None):
    return {"email": email, "password": password, "phone": "010-0000-0000",
            "profile": profile or {"display_name": "김귀향", "birth_year": 1962,
                                   "home_region": "경남 함안군", "target_region": "경남 함안군"}}


def test_health_and_startup_created_schema(client, db_conn):
    assert client.get("/health").json() == {"status": "ok"}
    n_tables = db_conn.execute(
        "select count(*) from pg_tables where schemaname='public' and tablename <> 'spatial_ref_sys'").fetchone()[0]
    exts = {r[0] for r in db_conn.execute("select extname from pg_extension")}
    assert n_tables == 34
    assert {"postgis", "vector"} <= exts


def test_signup_login_me(client):
    email = f"kim-{uuid.uuid4().hex[:8]}@example.com"
    r = client.post("/api/users/signup", json=_signup_body(email))
    assert r.status_code == 201 and r.json()["profile"]["display_name"] == "김귀향"
    assert "password_hash" not in r.json()
    assert client.post("/api/users/signup", json=_signup_body(email)).status_code == 400

    assert client.post("/api/users/login", json={"email": email, "password": "wrong-pw"}).status_code == 401
    token = client.post("/api/users/login", json={"email": email, "password": "secret123"}).json()["access_token"]
    me = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200 and me.json()["email"] == email
    assert client.get("/api/users/me").status_code == 401
    assert client.get("/api/users/me", headers={"Authorization": "Bearer garbage"}).status_code == 401


def test_signup_validation_and_no_orphan(client, db_conn):
    email = f"short-{uuid.uuid4().hex[:8]}@example.com"
    assert client.post("/api/users/signup", json=_signup_body(email, password="123")).status_code == 422
    assert client.post("/api/users/signup", json=_signup_body(email, profile={"display_name": "x"})).status_code == 422
    assert db_conn.execute("select count(*) from users where email=%s", (email,)).fetchone()[0] == 0


def test_long_unicode_password(client):
    email = f"long-{uuid.uuid4().hex[:8]}@example.com"
    assert client.post("/api/users/signup", json=_signup_body(email, password="가" * 40)).status_code == 201
    assert client.post("/api/users/login", json={"email": email, "password": "가" * 40}).status_code == 200


def test_google_login_creates_then_reuses_user(client, monkeypatch, db_conn):
    sub, email = uuid.uuid4().hex, f"g-{uuid.uuid4().hex[:8]}@gmail.com"
    monkeypatch.setattr(users_endpoint, "verify_google_id_token",
                        lambda token: {"sub": sub, "email": email, "email_verified": True, "name": "구글사용자"})
    first = client.post("/api/users/google-login", json={"id_token": "t"})
    second = client.post("/api/users/google-login", json={"id_token": "t"})
    assert first.status_code == second.status_code == 200
    me = client.get("/api/users/me", headers={"Authorization": f"Bearer {second.json()['access_token']}"}).json()
    assert me["email"] == email and me["profile"]["display_name"] == "구글사용자"
    assert db_conn.execute("select count(*) from users where email=%s", (email,)).fetchone()[0] == 1


def test_google_login_links_existing_email_account(client, monkeypatch, db_conn):
    email = f"both-{uuid.uuid4().hex[:8]}@gmail.com"
    signup_and_login(client, email=email)
    monkeypatch.setattr(users_endpoint, "verify_google_id_token",
                        lambda token: {"sub": uuid.uuid4().hex, "email": email, "email_verified": True})
    assert client.post("/api/users/google-login", json={"id_token": "t"}).status_code == 200
    assert db_conn.execute("select count(*) from users where email=%s", (email,)).fetchone()[0] == 1
    linked = db_conn.execute("select count(*) from social_accounts s join users u on u.id=s.user_id where u.email=%s",
                             (email,)).fetchone()[0]
    assert linked == 1


def test_google_login_rejects_bad_or_unverified_token(client, monkeypatch):
    def bad(token):
        raise ValueError("bad token")

    monkeypatch.setattr(users_endpoint, "verify_google_id_token", bad)
    assert client.post("/api/users/google-login", json={"id_token": "t"}).status_code == 401
    monkeypatch.setattr(users_endpoint, "verify_google_id_token",
                        lambda token: {"sub": "x", "email": "u@gmail.com", "email_verified": False})
    assert client.post("/api/users/google-login", json={"id_token": "t"}).status_code == 401


# ---------------- PATCH /api/users/me/profile ----------------
def _google_login_without_name(client, monkeypatch):
    """Google 이 이름을 주지 않아 프로필 없이 만들어진 사용자의 인증 헤더."""
    sub, email = uuid.uuid4().hex, f"noname-{uuid.uuid4().hex[:8]}@gmail.com"
    monkeypatch.setattr(users_endpoint, "verify_google_id_token",
                        lambda token: {"sub": sub, "email": email, "email_verified": True})
    token = client.post("/api/users/google-login", json={"id_token": "t"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_patch_profile_changes_only_sent_fields(client, user, other_user):
    headers, user_id = user
    r = client.patch("/api/users/me/profile", headers=headers, json={"bio": "  함안에서 농사  ", "gender": "male"})
    assert r.status_code == 200, r.text
    profile = r.json()["profile"]
    assert profile["bio"] == "함안에서 농사" and profile["gender"] == "male"
    assert profile["display_name"] == "김귀향" and profile["birth_year"] == 1962   # 보내지 않은 칸은 그대로
    assert r.json() == client.get("/api/users/me", headers=headers).json()      # GET /me 와 같은 형식·값

    r = client.patch("/api/users/me/profile", headers=headers,
                     json={"birth_year": 1970, "mentor_available": True, "mentor_hourly_rate": 0, "bio": None})
    profile = r.json()["profile"]
    assert r.status_code == 200 and profile["birth_year"] == 1970 and profile["mentor_available"] is True
    assert profile["mentor_hourly_rate"] == 0 and profile["bio"] is None and profile["gender"] == "male"

    assert client.patch("/api/users/me/profile", headers=headers, json={}).json()["profile"] == profile

    other_headers, _ = other_user
    other = client.get("/api/users/me", headers=other_headers).json()["profile"]
    assert other["display_name"] == "이주민" and other["bio"] is None and other["birth_year"] == 1962


def test_patch_profile_creates_missing_profile_for_google_user(client, monkeypatch, db_conn):
    headers = _google_login_without_name(client, monkeypatch)
    me = client.get("/api/users/me", headers=headers).json()
    assert me["profile"] is None

    body = {"display_name": "구글멘토", "birth_year": 1958, "home_region": "경남 함안군", "target_region": "경남 함안군",
            "mentor_available": True, "mentor_hourly_rate": 20000}
    r = client.patch("/api/users/me/profile", headers=headers, json=body)
    assert r.status_code == 200, r.text
    assert r.json()["id"] == me["id"] and r.json()["profile"]["user_id"] == me["id"]
    assert {k: r.json()["profile"][k] for k in body} == body
    assert db_conn.execute("select count(*) from user_profiles where user_id=%s", (me["id"],)).fetchone()[0] == 1

    # 이름 없이 다른 칸만 보내도 프로필이 생기고 mentor_available 은 DB 기본값(false)
    headers2 = _google_login_without_name(client, monkeypatch)
    r = client.patch("/api/users/me/profile", headers=headers2, json={"bio": "안녕하세요"})
    assert r.status_code == 200 and r.json()["profile"]["mentor_available"] is False
    assert r.json()["profile"]["display_name"] is None


def test_patch_profile_rejects_invalid_input(client, user, db_conn):
    headers, user_id = user
    this_year = datetime.date.today().year
    bad_bodies = [
        {"gender": "x"}, {"gender": "MALE"},
        {"birth_year": 1899}, {"birth_year": this_year + 1}, {"birth_year": "옛날"},
        {"display_name": ""}, {"display_name": "   "}, {"display_name": "가" * 81}, {"display_name": None},
        {"home_region": "가" * 121}, {"target_region": "가" * 121},
        {"mentor_hourly_rate": -1}, {"mentor_hourly_rate": 2 ** 31}, {"mentor_available": None},
        {"profile_image": "x" * 501},
    ]
    for body in bad_bodies:
        r = client.patch("/api/users/me/profile", headers=headers, json={**body, "bio": "바뀌면 안 됨"})
        assert r.status_code == 422, (body, r.status_code, r.text)
        assert isinstance(r.json()["detail"], list) and r.json()["detail"][0]["msg"]
    row = db_conn.execute("select bio, gender, birth_year, display_name from user_profiles where user_id=%s",
                          (user_id,)).fetchone()
    assert row == (None, None, 1962, "김귀향")   # 거절된 요청은 아무것도 바꾸지 않는다

    # 경계값은 통과
    for body in ({"birth_year": 1900}, {"birth_year": this_year}, {"display_name": "가" * 80},
                 {"gender": "other"}, {"gender": None}):
        assert client.patch("/api/users/me/profile", headers=headers, json=body).status_code == 200, body


def test_patch_profile_requires_login(client):
    body = {"display_name": "누구"}
    assert client.patch("/api/users/me/profile", json=body).status_code == 401
    assert client.patch("/api/users/me/profile", json=body,
                        headers={"Authorization": "Bearer garbage"}).status_code == 401


def test_profile_response_tolerates_values_saved_before_validation(client, user, db_conn):
    """요청 검증 규칙이 응답 스키마에 번지면 기존 DB 값 때문에 GET /me 가 500 이 난다."""
    headers, user_id = user
    db_conn.execute("update user_profiles set display_name='', birth_year=1850 where user_id=%s", (user_id,))
    r = client.get("/api/users/me", headers=headers)
    assert r.status_code == 200 and r.json()["profile"]["birth_year"] == 1850
