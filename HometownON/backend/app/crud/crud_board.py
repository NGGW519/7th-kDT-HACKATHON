from sqlalchemy.orm import Session, joinedload
from ..models import models
from ..schemas import board as schemas

def get_post(db: Session, post_id: int):
    return db.query(models.BoardPost).options(
        joinedload(models.BoardPost.author).joinedload(models.User.profile),
        joinedload(models.BoardPost.comments).joinedload(models.BoardComment.author).joinedload(models.User.profile)
    ).filter(models.BoardPost.id == post_id).first()

def get_posts(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.BoardPost).options(
        joinedload(models.BoardPost.author).joinedload(models.User.profile),
        joinedload(models.BoardPost.comments).joinedload(models.BoardComment.author).joinedload(models.User.profile)
    ).order_by(models.BoardPost.created_at.desc()).offset(skip).limit(limit).all()

def create_post(db: Session, post: schemas.BoardPostCreate, user_id: int):
    db_post = models.BoardPost(**post.model_dump(), author_user_id=user_id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    # 관계 데이터를 로드하여 반환
    return db.query(models.BoardPost).options(
        joinedload(models.BoardPost.author).joinedload(models.User.profile),
        joinedload(models.BoardPost.comments).joinedload(models.BoardComment.author).joinedload(models.User.profile)
    ).filter(models.BoardPost.id == db_post.id).first()

def update_post(db: Session, post_id: int, post: schemas.BoardPostUpdate):
    db_post = get_post(db, post_id)
    if db_post:
        update_data = post.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_post, key, value)
        db.commit()
        db.refresh(db_post)
    return db_post

def delete_post(db: Session, post_id: int):
    db_post = get_post(db, post_id)
    if db_post:
        db.delete(db_post)
        db.commit()
    return db_post

def create_comment(db: Session, comment: schemas.BoardCommentCreate, user_id: int):
    db_comment = models.BoardComment(**comment.model_dump(), author_user_id=user_id)
    db.add(db_comment)
    db.query(models.BoardPost).filter(models.BoardPost.id == comment.post_id).update({'comments_count': models.BoardPost.comments_count + 1})
    db.commit()
    db.refresh(db_comment)
    # 관계 데이터를 로드하여 반환
    return db.query(models.BoardComment).options(
        joinedload(models.BoardComment.author).joinedload(models.User.profile)
    ).filter(models.BoardComment.id == db_comment.id).first()

def like_post(db: Session, post_id: int, user_id: int):
    db_like = db.query(models.Like).filter(models.Like.target_id == post_id, models.Like.user_id == user_id, models.Like.target_type == 'post').first()
    if not db_like:
        db_like = models.Like(target_id=post_id, user_id=user_id, target_type='post')
        db.add(db_like)
        db.query(models.BoardPost).filter(models.BoardPost.id == post_id).update({'likes_count': models.BoardPost.likes_count + 1})
        db.commit()
        db.refresh(db_like)
    return db_like

def unlike_post(db: Session, post_id: int, user_id: int):
    db_like = db.query(models.Like).filter(models.Like.target_id == post_id, models.Like.user_id == user_id, models.Like.target_type == 'post').first()
    if db_like:
        db.delete(db_like)
        db.query(models.BoardPost).filter(models.BoardPost.id == post_id).update({'likes_count': models.BoardPost.likes_count - 1})
        db.commit()
    return db_like