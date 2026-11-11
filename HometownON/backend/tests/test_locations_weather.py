import uuid

import pytest


def test_location_create_and_read(client, user, db_conn):
    headers, _ = user
    category_id = db_conn.execute(
        "insert into location_categories (main, sub) values ('식음료', %s) returning id", (f"맛집-{uuid.uuid4().hex[:6]}",)
    ).fetchone()[0]
    name = f"가야식당-{uuid.uuid4().hex[:6]}"
    body = {"name": name, "category_id": category_id, "address": "경남 함안군 가야읍", "geom": "POINT(128.4064 35.2723)"}

    assert client.post("/api/locations/", json=body).status_code == 401
    assert client.post("/api/locations/", json={**body, "geom": "35.27, 128.40"}, headers=headers).status_code == 422
    created = client.post("/api/locations/", json=body, headers=headers).json()
    # PostGIS 는 POINT(경도 위도) 순서 - 앱도 이 순서로 읽는다
    assert created["geom"] == "POINT(128.4064 35.2723)"
    assert (created["longitude"], created["latitude"]) == (128.4064, 35.2723)

    assert client.get(f"/api/locations/{created['id']}").json()["name"] == name
    assert client.get(f"/api/locations/by_name/{name}").json()["id"] == created["id"]
    assert client.get("/api/locations/by_name/없는장소").status_code == 404
    srid = db_conn.execute("select ST_SRID(geom) from locations where id=%s", (created["id"],)).fetchone()[0]
    assert srid == 4326


# --- 근처 장소 / 카테고리 / 목록 필터 -------------------------------------------------
# 다른 테스트 데이터(함안 부근)와 섞이지 않도록 먼 바다 위 좌표를 기준점으로 쓴다.
ORIGIN_LAT, ORIGIN_LNG = 10.0, 150.0


def _add_category(db_conn, main: str, sub: str) -> int:
    return db_conn.execute(
        "insert into location_categories (main, sub) values (%s, %s) returning id", (main, sub)
    ).fetchone()[0]


def _add_location(db_conn, name: str, category_id: int, lat: float, lng: float, address: str = "테스트 주소") -> int:
    return db_conn.execute(
        "insert into locations (name, category_id, address, geom) "
        "values (%s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326)) returning id",  # POINT(경도 위도)
        (name, category_id, address, lng, lat),
    ).fetchone()[0]


@pytest.fixture
def nearby_places(db_conn):
    tag = uuid.uuid4().hex[:6]
    main = f"테스트대분류-{tag}"
    food = _add_category(db_conn, main, f"맛집-{tag}")
    cafe = _add_category(db_conn, main, f"카페-{tag}")
    ids = {
        "near": _add_location(db_conn, f"가까운식당-{tag}", food, ORIGIN_LAT + 0.005, ORIGIN_LNG),  # 약 0.55km
        "cafe": _add_location(db_conn, f"중간카페-{tag}", cafe, ORIGIN_LAT + 0.01, ORIGIN_LNG),     # 약 1.1km
        "mid": _add_location(db_conn, f"조금먼식당-{tag}", food, ORIGIN_LAT + 0.02, ORIGIN_LNG),    # 약 2.2km
        "far": _add_location(db_conn, f"먼식당-{tag}", food, ORIGIN_LAT + 0.1, ORIGIN_LNG),         # 약 11km
    }
    yield {"tag": tag, "main": main, "food": food, "cafe": cafe, "ids": ids}
    # 같은 좌표에 다음 테스트가 다시 넣으므로 지운다 (테스트 DB 는 세션 동안 공유)
    db_conn.execute("delete from locations where category_id in (%s, %s)", (food, cafe))
    db_conn.execute("delete from location_categories where id in (%s, %s)", (food, cafe))


def _nearby(client, **overrides):
    body = {"latitude": ORIGIN_LAT, "longitude": ORIGIN_LNG, **overrides}
    return client.post("/api/locations/nearby", json=body)


def test_nearby_sorted_by_distance_within_radius(client, nearby_places):
    ids = nearby_places["ids"]
    r = _nearby(client)  # 기본 반경 5km, 인증 없이 사용
    assert r.status_code == 200, r.text
    items = r.json()
    got = [item["id"] for item in items]

    assert got == [ids["near"], ids["cafe"], ids["mid"]]  # 가까운 순, 반경 밖(far) 제외
    distances = [item["distance_km"] for item in items]
    assert distances == sorted(distances)
    assert 0.5 < items[0]["distance_km"] < 0.6

    first = items[0]
    assert first["coordinates"] == {"latitude": ORIGIN_LAT + 0.005, "longitude": ORIGIN_LNG}
    assert (first["latitude"], first["longitude"]) == (ORIGIN_LAT + 0.005, ORIGIN_LNG)
    assert first["category_id"] == nearby_places["food"]
    assert first["category"] == f"맛집-{nearby_places['tag']}"
    assert first["name"].startswith("가까운식당-") and first["address"] == "테스트 주소"
    assert first["phone"] is None

    # 반경을 넓히면 먼 장소도 들어오고, limit 은 가까운 것부터 자른다
    assert [i["id"] for i in _nearby(client, radius_km=15).json()][-1] == ids["far"]
    assert [i["id"] for i in _nearby(client, limit=1).json()] == [ids["near"]]
    # 아무것도 없는 곳
    assert _nearby(client, latitude=-60.0, longitude=-30.0).json() == []


def test_nearby_category_filter(client, nearby_places):
    ids, tag = nearby_places["ids"], nearby_places["tag"]
    by_sub = _nearby(client, category=f"카페-{tag}").json()
    assert [i["id"] for i in by_sub] == [ids["cafe"]]

    by_main = _nearby(client, category=nearby_places["main"]).json()
    assert [i["id"] for i in by_main] == [ids["near"], ids["cafe"], ids["mid"]]

    assert _nearby(client, category="없는카테고리").json() == []
    assert len(_nearby(client, category="").json()) == 3  # 빈 값은 필터 없음


@pytest.mark.parametrize("bad", [
    {"radius_km": 0}, {"radius_km": -1}, {"radius_km": 50.1},
    {"limit": 0}, {"limit": 101},
    {"latitude": 91}, {"latitude": -91}, {"longitude": 181}, {"longitude": -181},
    {"latitude": "abc"},
])
def test_nearby_invalid_input_is_422(client, bad):
    assert _nearby(client, **bad).status_code == 422


def test_nearby_requires_coordinates(client):
    assert client.post("/api/locations/nearby", json={"latitude": ORIGIN_LAT}).status_code == 422
    assert client.post("/api/locations/nearby", json={}).status_code == 422


def _explain_nearby(client, **body):
    """nearby 엔드포인트가 실제로 보낸 SQL 을 잡아 같은 값으로 EXPLAIN 한 실행 계획 문자열."""
    from sqlalchemy import event

    from app.core.database import engine

    captured = []

    def grab(conn, cursor, statement, parameters, context, executemany):
        if "ST_DWithin" in statement:
            captured.append((statement, parameters))

    event.listen(engine, "before_cursor_execute", grab)
    try:
        assert _nearby(client, **body).status_code == 200
    finally:
        event.remove(engine, "before_cursor_execute", grab)
    assert len(captured) == 1, captured
    statement, parameters = captured[0]
    with engine.connect() as conn:
        conn.exec_driver_sql("SET LOCAL enable_seqscan = off")  # 테스트 데이터가 적어 그대로 두면 순차 탐색이 더 싸다
        plan = "\n".join(row[0] for row in conn.exec_driver_sql("EXPLAIN " + statement, parameters))
        conn.rollback()
    return statement, plan


def test_nearby_query_uses_geography_index(client, nearby_places, db_conn):
    """nearby 는 geom::geography 로 거리를 재므로 geometry 인덱스(ix_locations_geom)는 못 쓰고,
    같은 식으로 만든 ix_locations_geom_geography 를 써야 한다."""
    indexdef = db_conn.execute(
        "select indexdef from pg_indexes where indexname='ix_locations_geom_geography'").fetchone()
    assert indexdef and "gist" in indexdef[0] and "geography" in indexdef[0], indexdef

    statement, plan = _explain_nearby(client)
    assert "geography" in statement  # 쿼리가 geography 로 계산하는지 (인덱스 식과 같아야 한다)
    assert "ix_locations_geom_geography" in plan, plan
    assert "Seq Scan on locations" not in plan, plan


def test_location_categories(client, nearby_places):
    r = client.get("/api/locations/categories/")
    assert r.status_code == 200, r.text  # /{location_id} 보다 먼저 정의돼야 422 가 아니다
    items = r.json()
    assert [c["id"] for c in items] == sorted(c["id"] for c in items)
    assert {"id": nearby_places["cafe"], "main": nearby_places["main"], "sub": f"카페-{nearby_places['tag']}"} in items
    assert client.get("/api/locations/categories").json() == items  # 끝 슬래시 없이도 같은 결과


def test_list_locations_filters(client, nearby_places, db_conn):
    ids, tag = nearby_places["ids"], nearby_places["tag"]

    by_cafe = client.get("/api/locations/", params={"category_id": nearby_places["cafe"]}).json()
    assert [i["id"] for i in by_cafe] == [ids["cafe"]]
    by_food = client.get("/api/locations/", params={"category_id": nearby_places["food"]}).json()
    assert [i["id"] for i in by_food] == [ids["near"], ids["mid"], ids["far"]]

    # 이름 부분 일치 + 대소문자 무시
    extra = _add_location(db_conn, f"Gaya Cafe-{tag}", nearby_places["cafe"], ORIGIN_LAT, ORIGIN_LNG,
                          address=f"경남 함안군 가야읍 시장길-{tag}")
    by_name = client.get("/api/locations/", params={"search": f"gaya CAFE-{tag}"}).json()
    assert [i["id"] for i in by_name] == [extra]
    # 주소 부분 일치
    by_address = client.get("/api/locations/", params={"search": f"시장길-{tag}"}).json()
    assert [i["id"] for i in by_address] == [extra]
    # 두 필터 함께
    both = client.get("/api/locations/", params={"search": tag, "category_id": nearby_places["cafe"]}).json()
    assert [i["id"] for i in both] == [ids["cafe"], extra]
    # %, _ 는 글자 그대로 찾는다 (전체 일치로 번지지 않음)
    assert client.get("/api/locations/", params={"search": "%"}).json() == []
    # 필터 없이도 기존처럼 동작
    assert client.get("/api/locations/", params={"limit": 500}).status_code == 200
    assert client.get("/api/locations/", params={"category_id": "abc"}).status_code == 422


def test_weather_without_key_is_503(client):
    r = client.post("/api/weather/current", json={"latitude": 35.27, "longitude": 128.40})
    assert r.status_code == 503
