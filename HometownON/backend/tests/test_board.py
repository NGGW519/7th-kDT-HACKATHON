import pytest

BOARDS = {
    "/api/board": {"title": "가야읍 산책", "content": "말이산 고분군 산책 좋아요", "category": "자유"},
    "/api/requests": {"title": "보일러 수리", "content": "보일러가 안 켜져요", "category": "repair",
                      "budget": 50000, "location": "가야읍"},
    "/api/mentors": {"title": "스마트폰 알려드려요", "content": "IT 30년 경력", "category": "technical",
                     "experience": "30년", "hourly_rate": "20000", "location": "칠원읍"},
}


@pytest.mark.parametrize("base", BOARDS)
def test_crud_comments_likes(client, user, other_user, base):
    headers, user_id = user
    other_headers, _ = other_user
    body = BOARDS[base]

    assert client.post(f"{base}/", json=body).status_code == 401
    r = client.post(f"{base}/", json=body, headers=headers)
    assert r.status_code == 200, r.text
    post = r.json()
    assert post["author"]["id"] == user_id and post["author"]["profile"]["display_name"] == "김귀향"
    assert post["likes_count"] == 0 and post["comments_count"] == 0
    post_id = post["id"]

    assert any(p["id"] == post_id for p in client.get(f"{base}/").json())
    assert client.get(f"{base}/{post_id}").json()["title"] == body["title"]

    # 댓글 / 대댓글
    c = client.post(f"{base}/{post_id}/comments", json={"content": "좋아요"}, headers=other_headers)
    assert c.status_code == 200 and c.json()["author"]["profile"]["display_name"] == "이주민"
    reply = client.post(f"{base}/{post_id}/comments",
                        json={"content": "감사합니다", "parent_comment_id": c.json()["id"]}, headers=headers)
    assert reply.status_code == 200
    detail = client.get(f"{base}/{post_id}").json()
    assert detail["comments_count"] == 2 and len(detail["comments"]) == 2

    # 좋아요는 한 사람당 한 번
    for _ in range(2):
        assert client.post(f"{base}/{post_id}/like", headers=other_headers).status_code == 204
    assert client.get(f"{base}/{post_id}").json()["likes_count"] == 1
    for _ in range(2):
        assert client.post(f"{base}/{post_id}/unlike", headers=other_headers).status_code == 204
    assert client.get(f"{base}/{post_id}").json()["likes_count"] == 0

    # 수정/삭제는 작성자만, 삭제하면 목록·조회에서 빠짐 (댓글이 있어도 삭제 가능)
    assert client.put(f"{base}/{post_id}", json={"title": "남의 글"}, headers=other_headers).status_code == 403
    assert client.put(f"{base}/{post_id}", json={"title": "수정됨"}, headers=headers).json()["title"] == "수정됨"
    assert client.delete(f"{base}/{post_id}", headers=other_headers).status_code == 403
    assert client.delete(f"{base}/{post_id}", headers=headers).status_code == 200
    assert client.get(f"{base}/{post_id}").status_code == 404
    assert all(p["id"] != post_id for p in client.get(f"{base}/").json())


def test_boards_are_separate(client, user):
    headers, _ = user
    free_id = client.post("/api/board/", json=BOARDS["/api/board"], headers=headers).json()["id"]
    req_id = client.post("/api/requests/", json=BOARDS["/api/requests"], headers=headers).json()["id"]
    assert client.get(f"/api/requests/{free_id}").status_code == 404
    assert client.get(f"/api/board/{req_id}").status_code == 404
    assert all(p["id"] != free_id for p in client.get("/api/requests/?limit=100").json())


def test_request_fields_and_status(client, user, db_conn):
    headers, _ = user
    post = client.post("/api/requests/", json=BOARDS["/api/requests"], headers=headers).json()
    assert post["budget"] == "50000" and post["location"] == "가야읍"
    assert post["status"] == "pending" and post["accepted_by"] is None and post["views"] == 0

    updated = client.put(f"/api/requests/{post['id']}", json={"status": "completed", "accepted_by": "이주민"},
                         headers=headers).json()
    assert updated["status"] == "completed" and updated["accepted_by"] == "이주민" and updated["budget"] == "50000"
    row = db_conn.execute("select board_type, match_status, status, attributes from board_posts where id=%s",
                          (post["id"],)).fetchone()
    assert row[0] == "request" and row[1] == "completed" and row[2] == "active"
    assert row[3] == {"budget": "50000", "location": "가야읍", "accepted_by": "이주민"}
    assert client.put(f"/api/requests/{post['id']}", json={"status": "unknown"}, headers=headers).status_code == 422


def test_mentor_fields(client, user):
    headers, _ = user
    post = client.post("/api/mentors/", json=BOARDS["/api/mentors"], headers=headers).json()
    assert (post["experience"], post["hourly_rate"], post["location"], post["status"]) == ("30년", "20000", "칠원읍", "active")


def test_comment_parent_must_be_same_post(client, user):
    headers, _ = user
    a = client.post("/api/board/", json=BOARDS["/api/board"], headers=headers).json()["id"]
    b = client.post("/api/board/", json=BOARDS["/api/board"], headers=headers).json()["id"]
    c = client.post(f"/api/board/{a}/comments", json={"content": "a"}, headers=headers).json()["id"]
    assert client.post(f"/api/board/{b}/comments", json={"content": "x", "parent_comment_id": c},
                       headers=headers).status_code == 400
