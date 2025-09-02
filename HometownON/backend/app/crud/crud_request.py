from sqlalchemy.orm import Session, joinedload
from ..models import models
from ..schemas import request as schemas

def get_post(db: Session, post_id: int):
    return db.query(models.RequestPost).options(
        joinedload(models.RequestPost.author).joinedload(models.User.profile)
    ).filter(models.RequestPost.id == post_id).first()

def get_posts(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.RequestPost).options(
        joinedload(models.RequestPost.author).joinedload(models.User.profile)
    ).order_by(models.RequestPost.created_at.desc()).offset(skip).limit(limit).all()

def create_post(db: Session, post: schemas.RequestPostCreate, user_id: int):
    db_post = models.RequestPost(**post.model_dump(), author_user_id=user_id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    # ���� �����͸� �ε��Ͽ� ��ȯ
    return db.query(models.RequestPost).options(
        joinedload(models.RequestPost.author).joinedload(models.User.profile)
    ).filter(models.RequestPost.id == db_post.id).first()

def update_post(db: Session, post_id: int, post: schemas.RequestPostUpdate):
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

def create_comment(db: Session, comment: schemas.RequestCommentCreate, user_id: int):
    db_comment = models.RequestComment(**comment.model_dump(), author_user_id=user_id)
    db.add(db_comment)
    db.query(models.RequestPost).filter(models.RequestPost.id == comment.post_id).update({'comments_count': models.RequestPost.comments_count + 1})
    db.commit()
    db.refresh(db_comment)
    return db_comment

def like_post(db: Session, post_id: int, user_id: int):
    db_like = db.query(models.Like).filter(models.Like.target_id == post_id, models.Like.user_id == user_id, models.Like.target_type == 'post').first()
    if not db_like:
        db_like = models.Like(target_id=post_id, user_id=user_id, target_type='post')
        db.add(db_like)
        db.query(models.RequestPost).filter(models.RequestPost.id == post_id).update({'likes_count': models.RequestPost.likes_count + 1})
        db.commit()
        db.refresh(db_like)
    return db_like

def unlike_post(db: Session, post_id: int, user_id: int):
    db_like = db.query(models.Like).filter(models.Like.target_id == post_id, models.Like.user_id == user_id, models.Like.target_type == 'post').first()
    if db_like:
        db.delete(db_like)
        db.query(models.RequestPost).filter(models.RequestPost.id == post_id).update({'likes_count': models.RequestPost.likes_count - 1})
        db.commit()
    return db_like