"""자유·의뢰·멘토 게시판 공통 CRUD (board_posts 테이블 하나, board_type 으로 구분)."""
from sqlalchemy.orm import Session, joinedload, selectinload

from ..models import models

# 게시판별로 attributes(JSONB)에 저장하는 값
BOARD_ATTRIBUTES = {
    "free": (),
    "request": ("budget", "location", "accepted_by"),
    "mentor": ("experience", "hourly_rate", "location"),
}


def _query(db: Session, board_type: str):
    return (
        db.query(models.BoardPost)
        .options(
            joinedload(models.BoardPost.author).joinedload(models.User.profile),
            selectinload(models.BoardPost.comments)
            .joinedload(models.BoardComment.author)
            .joinedload(models.User.profile),
        )
        .filter(models.BoardPost.board_type == board_type, models.BoardPost.status != "deleted")
    )


def get_posts(db: Session, board_type: str, skip: int = 0, limit: int = 10):
    return (
        _query(db, board_type)
        .order_by(models.BoardPost.created_at.desc(), models.BoardPost.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_post(db: Session, board_type: str, post_id: int):
    return _query(db, board_type).filter(models.BoardPost.id == post_id).first()


def _split_attributes(board_type: str, data: dict) -> dict:
    """요청 데이터에서 게시판별 추가 정보를 떼어 낸다 (data 에서 제거됨)."""
    return {key: data.pop(key) for key in BOARD_ATTRIBUTES[board_type] if key in data}


def create_post(db: Session, board_type: str, data: dict, user_id: int):
    data = dict(data)
    attributes = {k: v for k, v in _split_attributes(board_type, data).items() if v is not None}
    post = models.BoardPost(
        board_type=board_type,
        author_user_id=user_id,
        attributes=attributes or None,
        match_status="pending" if board_type == "request" else None,
        **data,
    )
    db.add(post)
    db.commit()
    return get_post(db, board_type, post.id)


def update_post(db: Session, post: models.BoardPost, data: dict):
    data = dict(data)
    attributes = _split_attributes(post.board_type, data)
    if attributes:
        # JSONB 는 새 dict 를 대입해야 변경이 감지된다
        post.attributes = {**(post.attributes or {}), **attributes}
    if post.board_type == "request" and "status" in data:
        post.match_status = data.pop("status")  # 의뢰 진행 상태
    for key, value in data.items():
        setattr(post, key, value)
    db.commit()
    return get_post(db, post.board_type, post.id)


def delete_post(db: Session, post: models.BoardPost):
    """댓글·좋아요가 남아 있어도 지울 수 있도록 상태만 바꾼다 (목록/조회에서 빠짐)."""
    post.status = "deleted"
    db.commit()
    db.refresh(post)
    return post


def create_comment(db: Session, post: models.BoardPost, content: str, user_id: int, parent_comment_id: int | None = None):
    if parent_comment_id is not None:
        parent = db.get(models.BoardComment, parent_comment_id)
        if parent is None or parent.post_id != post.id:
            raise ValueError("parent comment does not belong to this post")
    comment = models.BoardComment(
        post_id=post.id, author_user_id=user_id, content=content, parent_comment_id=parent_comment_id
    )
    db.add(comment)
    db.query(models.BoardPost).filter(models.BoardPost.id == post.id).update(
        {"comments_count": models.BoardPost.comments_count + 1}
    )
    db.commit()
    return (
        db.query(models.BoardComment)
        .options(joinedload(models.BoardComment.author).joinedload(models.User.profile))
        .filter(models.BoardComment.id == comment.id)
        .first()
    )


def _find_like(db: Session, post_id: int, user_id: int):
    return (
        db.query(models.Like)
        .filter(models.Like.target_type == "post", models.Like.target_id == post_id, models.Like.user_id == user_id)
        .first()
    )


def like_post(db: Session, post_id: int, user_id: int) -> None:
    if _find_like(db, post_id, user_id):
        return
    db.add(models.Like(target_type="post", target_id=post_id, user_id=user_id))
    db.query(models.BoardPost).filter(models.BoardPost.id == post_id).update(
        {"likes_count": models.BoardPost.likes_count + 1}
    )
    db.commit()


def unlike_post(db: Session, post_id: int, user_id: int) -> None:
    like = _find_like(db, post_id, user_id)
    if not like:
        return
    db.delete(like)
    db.query(models.BoardPost).filter(models.BoardPost.id == post_id, models.BoardPost.likes_count > 0).update(
        {"likes_count": models.BoardPost.likes_count - 1}
    )
    db.commit()
