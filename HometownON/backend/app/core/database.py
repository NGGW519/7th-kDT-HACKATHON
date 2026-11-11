from sqlalchemy import MetaData, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import settings

# pool_pre_ping: DB 가 유휴 연결을 끊은 뒤에도 요청이 실패하지 않도록 연결을 확인
engine = create_engine(settings.database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 제약/인덱스 이름 규칙 (Hometown_on.sql 과 동일한 이름이 생성되도록 함)
# PK/FK 는 PostgreSQL 기본 이름(<table>_pkey, <table>_<col>_fkey)을 그대로 쓴다.
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
}

Base = declarative_base(metadata=MetaData(naming_convention=NAMING_CONVENTION))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
