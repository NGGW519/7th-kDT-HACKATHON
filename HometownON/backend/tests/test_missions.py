import uuid

import pytest


@pytest.fixture
def catalog(db_conn):
    """모두에게 보이는 기본 미션 2개."""
    ids = []
    for title, mtype, diff in [("함안군청 방문하기", "exploration", 1), ("경로당 어르신과 차 한 잔", "bonding", 2)]:
        ids.append(db_conn.execute(
            "insert into missions (code, title, mission_type, difficulty, expected_minutes, tags, description) "
            "values (%s, %s, %s, %s, 30, '[\"함안\"]', '설명') returning id",
            (f"T{uuid.uuid4().hex[:8]}", title, mtype, diff)).fetchone()[0])
    return ids


def _status(client, mission_id, headers=None):
    return {m["id"]: m["status"] for m in client.get("/api/missions/?limit=500", headers=headers).json()}[mission_id]


def test_completion_is_per_user(client, user, other_user, catalog):
    headers, _ = user
    other_headers, _ = other_user
    mission_id = catalog[1]

    assert client.patch(f"/api/missions/{mission_id}", json={"status": "completed"}).status_code == 401
    r = client.patch(f"/api/missions/{mission_id}", json={"status": "completed"}, headers=headers)
    assert r.status_code == 200 and r.json()["status"] == "completed"
    # 같은 요청을 다시 보내도 그대로 완료 상태
    assert client.patch(f"/api/missions/{mission_id}", json={"status": "completed"}, headers=headers).status_code == 200

    assert _status(client, mission_id, headers) == "completed"
    assert _status(client, mission_id, other_headers) == "today"   # 다른 사용자는 영향 없음
    assert _status(client, mission_id) == "today"                  # 로그인 안 한 화면도 영향 없음
    assert client.get(f"/api/missions/{mission_id}", headers=headers).json()["status"] == "completed"

    stats = client.get("/api/missions/user-stats", headers=headers).json()
    assert stats["completed_missions_count"] == 1 and stats["total_exp"] == 100 and stats["level"] == 1
    assert client.get("/api/missions/user-stats", headers=other_headers).json()["completed_missions_count"] == 0
    done = client.get("/api/missions/completed_missions_with_difficulty", headers=headers).json()
    assert [(m["id"], m["difficulty"]) for m in done] == [(mission_id, 2)]

    # 되돌리기, 잘못된 상태
    assert client.patch(f"/api/missions/{mission_id}", json={"status": "today"}, headers=headers).json()["status"] == "today"
    assert client.patch(f"/api/missions/{mission_id}", json={"status": "locked"}, headers=headers).status_code == 400
    assert client.patch(f"/api/missions/{mission_id}", json={"status": "nope"}, headers=headers).status_code == 422


def test_today_missions_listed_before_completed(client, user, catalog):
    headers, _ = user
    client.patch(f"/api/missions/{catalog[0]}", json={"status": "completed"}, headers=headers)
    statuses = [m["status"] for m in client.get("/api/missions/?limit=500", headers=headers).json()]
    assert statuses == sorted(statuses, key=lambda s: s == "completed")


def test_personal_missions_are_private(client, user, other_user):
    headers, user_id = user
    other_headers, _ = other_user
    body = {"title": "나만의 미션", "mission_type": "career", "difficulty": 3, "tags": "IT,교육"}
    created = client.post("/api/missions/", json=body, headers=headers).json()
    assert created["created_by_user_id"] == user_id and created["tags"] == ["IT", "교육"]
    assert created["code"].startswith("CAR")

    assert client.get(f"/api/missions/{created['id']}", headers=headers).status_code == 200
    assert client.get(f"/api/missions/{created['id']}", headers=other_headers).status_code == 404
    assert client.get(f"/api/missions/{created['id']}").status_code == 404
    assert all(m["id"] != created["id"] for m in client.get("/api/missions/?limit=500", headers=other_headers).json())
    assert client.patch(f"/api/missions/{created['id']}", json={"status": "completed"},
                        headers=other_headers).status_code == 404
    assert client.post("/api/missions/", json=body).status_code == 401
    assert client.post("/api/missions/", json={**body, "mission_type": "탐색형"}, headers=headers).status_code == 422
