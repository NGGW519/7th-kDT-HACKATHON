import uuid


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


def test_weather_without_key_is_503(client):
    r = client.post("/api/weather/current", json={"latitude": 35.27, "longitude": 128.40})
    assert r.status_code == 503
