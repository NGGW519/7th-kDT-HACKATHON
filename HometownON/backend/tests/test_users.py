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


_SIGNUP_PROFILE = {"display_name": "김귀향", "home_region": "경남 함안군", "target_region": "경남 함안군"}


def _signup_profile(client, **profile):
    email = f"p-{uuid.uuid4().hex[:10]}@example.com"
    return email, client.post("/api/users/signup", json=_signup_body(email, profile={**_SIGNUP_PROFILE, **profile}))


def test_signup_profile_rejects_invalid_input_like_patch(client, db_conn):
    """가입 프로필도 PATCH /me/profile 과 같은 규칙. 예전에는 gender 가 DB CHECK 위반으로 500 이었다."""
    this_year = datetime.date.today().year
    bad_profiles = [
        {"gender": "x"}, {"gender": "MALE"}, {"gender": ""}, {"gender": "남"},
        {"birth_year": 1899}, {"birth_year": this_year + 1}, {"birth_year": "옛날"},
        {"display_name": ""}, {"display_name": "   "}, {"display_name": "가" * 81}, {"display_name": None},
        {"home_region": "가" * 121}, {"target_region": "가" * 121},
        {"mentor_hourly_rate": -1}, {"mentor_hourly_rate": 2 ** 31}, {"mentor_available": None},
        {"profile_image": "x" * 501},
    ]
    for profile in bad_profiles:
        email, r = _signup_profile(client, **profile)
        assert r.status_code == 422, (profile, r.status_code, r.text)
        assert isinstance(r.json()["detail"], list) and r.json()["detail"][0]["msg"]
        assert db_conn.execute("select count(*) from users where email=%s", (email,)).fetchone()[0] == 0, profile


def test_signup_birth_year_optional_and_boundaries(client, db_conn):
    this_year = datetime.date.today().year
    # 생년은 선택: 빼거나 null 이면 비워 둔다 (앱이 '올해-30' 같은 가짜 값을 만들지 않도록)
    for profile in ({}, {"birth_year": None}):
        email, r = _signup_profile(client, **profile)
        assert r.status_code == 201, (profile, r.text)
        assert r.json()["profile"]["birth_year"] is None
        row = db_conn.execute("select p.birth_year from user_profiles p join users u on u.id=p.user_id "
                              "where u.email=%s", (email,)).fetchone()
        assert row == (None,)

    ok_profiles = [
        {"birth_year": 1900}, {"birth_year": this_year}, {"gender": "female"}, {"gender": "other"},
        {"gender": None}, {"display_name": "가" * 80}, {"home_region": "가" * 120}, {"target_region": ""},
        {"mentor_available": True, "mentor_hourly_rate": 0}, {"profile_image": "x" * 500},
    ]
    for profile in ok_profiles:
        _, r = _signup_profile(client, **profile)
        assert r.status_code == 201, (profile, r.text)
        assert {k: r.json()["profile"][k] for k in profile} == profile

    # 앞뒤 공백은 PATCH 와 같이 지운다
    _, r = _signup_profile(client, display_name="  김귀향  ", gender="male")
    assert r.status_code == 201 and r.json()["profile"]["display_name"] == "김귀향"
    assert r.json()["profile"]["gender"] == "male"


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


def test_patch_profile_concurrent_creation_retries_as_update(client, monkeypatch, db_conn):
    """프로필이 없는 사용자의 PATCH 두 개가 동시에 오면 늦은 쪽 INSERT 가 PK 충돌(IntegrityError)을 겪는다.
    500 대신 롤백 후 먼저 생긴 프로필을 다시 읽어 수정으로 한 번 재시도해야 한다."""
    from sqlalchemy import event

    from app.core.database import SessionLocal

    headers = _google_login_without_name(client, monkeypatch)
    user_id = client.get("/api/users/me", headers=headers).json()["id"]
    commits = []

    def other_request_commits_first(session):
        # 이 요청의 첫 commit 직전(INSERT 가 나가기 전)에 다른 요청이 같은 user_id 프로필을 먼저 저장한 상황
        commits.append(session)
        if len(commits) == 1:
            db_conn.execute("insert into user_profiles (user_id, display_name, gender) values (%s, '먼저 온 요청', 'male')",
                            (user_id,))

    event.listen(SessionLocal, "before_commit", other_request_commits_first)
    try:
        r = client.patch("/api/users/me/profile", headers=headers, json={"bio": "나중 요청", "birth_year": 1960})
    finally:
        event.remove(SessionLocal, "before_commit", other_request_commits_first)

    assert r.status_code == 200, r.text
    assert len(commits) == 2  # 충돌한 첫 commit + 재시도 한 번
    profile = r.json()["profile"]
    assert profile["user_id"] == user_id
    assert (profile["display_name"], profile["gender"]) == ("먼저 온 요청", "male")   # 먼저 온 요청의 값은 그대로
    assert (profile["bio"], profile["birth_year"]) == ("나중 요청", 1960)             # 늦은 요청의 값도 반영
    assert r.json() == client.get("/api/users/me", headers=headers).json()
    rows = db_conn.execute("select display_name, bio, birth_year from user_profiles where user_id=%s",
                           (user_id,)).fetchall()
    assert rows == [("먼저 온 요청", "나중 요청", 1960)]


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


def _login_status(client, email, password):
    return client.post("/api/users/login", json={"email": email, "password": password}).status_code


# ---------------- POST /api/users/me/password ----------------
def test_change_password_then_login_with_new_only(client, other_user):
    email = f"pw-{uuid.uuid4().hex[:8]}@example.com"
    headers, _ = signup_and_login(client, email=email)

    r = client.post("/api/users/me/password", headers=headers,
                    json={"current_password": "secret123", "new_password": "newpass456"})
    assert r.status_code == 204, r.text
    assert r.content == b""
    assert _login_status(client, email, "newpass456") == 200
    assert _login_status(client, email, "secret123") == 401
    assert client.get("/api/users/me", headers=headers).status_code == 200   # 기존 토큰은 그대로 유효

    # 다른 사용자의 비밀번호는 바뀌지 않는다
    other_headers, _ = other_user
    other_email = client.get("/api/users/me", headers=other_headers).json()["email"]
    assert _login_status(client, other_email, "secret123") == 200

    # 경계값: 6자, 128자
    for current, new in (("newpass456", "a" * 6), ("a" * 6, "b" * 128)):
        r = client.post("/api/users/me/password", headers=headers,
                        json={"current_password": current, "new_password": new})
        assert r.status_code == 204, (new, r.text)
    assert _login_status(client, email, "b" * 128) == 200


def test_change_password_rejects_wrong_or_same_password(client, db_conn):
    email = f"pw-{uuid.uuid4().hex[:8]}@example.com"
    headers, user_id = signup_and_login(client, email=email)
    old_hash = db_conn.execute("select password_hash from users where id=%s", (user_id,)).fetchone()[0]

    r = client.post("/api/users/me/password", headers=headers,
                    json={"current_password": "wrong-pw", "new_password": "newpass456"})
    assert r.status_code == 400 and r.json() == {"detail": "현재 비밀번호가 일치하지 않습니다."}

    r = client.post("/api/users/me/password", headers=headers,
                    json={"current_password": "secret123", "new_password": "secret123"})
    assert r.status_code == 400 and r.json() == {"detail": "새 비밀번호가 현재 비밀번호와 같습니다."}

    assert db_conn.execute("select password_hash from users where id=%s", (user_id,)).fetchone()[0] == old_hash
    assert _login_status(client, email, "secret123") == 200


def test_change_password_same_after_bcrypt_72_bytes_is_rejected(client):
    """bcrypt 는 앞 72바이트만 쓴다. 그 뒤만 다른 새 비밀번호는 실제로는 같은 비밀번호이므로 거부한다."""
    email = f"pw72-{uuid.uuid4().hex[:8]}@example.com"
    current = "가" * 24 + "a"          # 한글 24자 = 72바이트, 그 뒤 'a' 는 해시에 쓰이지 않는다
    assert client.post("/api/users/signup", json=_signup_body(email, password=current)).status_code == 201
    token = client.post("/api/users/login", json={"email": email, "password": current}).json()["access_token"]
    r = client.post("/api/users/me/password", headers={"Authorization": f"Bearer {token}"},
                    json={"current_password": current, "new_password": "가" * 24 + "b"})
    assert r.status_code == 400 and r.json() == {"detail": "새 비밀번호가 현재 비밀번호와 같습니다."}


def test_change_password_google_only_account(client, monkeypatch, db_conn):
    headers = _google_login_without_name(client, monkeypatch)
    user_id = client.get("/api/users/me", headers=headers).json()["id"]
    for current in ("", "anything"):
        r = client.post("/api/users/me/password", headers=headers,
                        json={"current_password": current, "new_password": "newpass456"})
        assert r.status_code == 400 and r.json() == {"detail": "Google 로 가입한 계정은 비밀번호가 없습니다."}
    assert db_conn.execute("select password_hash from users where id=%s", (user_id,)).fetchone()[0] is None


def test_change_password_requires_login_and_valid_body(client, user):
    body = {"current_password": "secret123", "new_password": "newpass456"}
    assert client.post("/api/users/me/password", json=body).status_code == 401
    assert client.post("/api/users/me/password", json=body,
                       headers={"Authorization": "Bearer garbage"}).status_code == 401

    headers, _ = user
    bad_bodies = [
        {"current_password": "secret123", "new_password": "12345"},        # 6자 미만
        {"current_password": "secret123", "new_password": "a" * 129},      # 128자 초과
        {"current_password": "secret123"}, {"new_password": "newpass456"}, {},
        {"current_password": "secret123", "new_password": None},
        {"current_password": None, "new_password": "newpass456"},
    ]
    for bad in bad_bodies:
        r = client.post("/api/users/me/password", headers=headers, json=bad)
        assert r.status_code == 422, (bad, r.status_code, r.text)
    email = client.get("/api/users/me", headers=headers).json()["email"]
    assert _login_status(client, email, "secret123") == 200   # 거절된 요청은 비밀번호를 바꾸지 않는다


def test_profile_response_tolerates_values_saved_before_validation(client, user, db_conn):
    """요청 검증 규칙이 응답 스키마에 번지면 기존 DB 값 때문에 GET /me 가 500 이 난다."""
    headers, user_id = user
    db_conn.execute("update user_profiles set display_name='', birth_year=1850 where user_id=%s", (user_id,))
    r = client.get("/api/users/me", headers=headers)
    assert r.status_code == 200 and r.json()["profile"]["birth_year"] == 1850
