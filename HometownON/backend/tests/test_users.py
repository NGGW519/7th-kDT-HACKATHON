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
