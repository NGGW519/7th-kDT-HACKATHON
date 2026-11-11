import os
from collections.abc import Iterable

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

# 이 파일 위치에서 상위 폴더로 올라가며 .env 를 찾아 로드
load_dotenv()

DB_CONFIG = {
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': int(os.getenv('POSTGRES_PORT', 5432)),
    'user': os.getenv('POSTGRES_USER', 'postgres'),
    'password': os.getenv('POSTGRES_PASSWORD', ''),
    'dbname': os.getenv('POSTGRES_DB', 'hometown_on'),
}


def get_db_config() -> dict:
    return dict(DB_CONFIG)


def get_connection(**overrides) -> psycopg.Connection:
    """행을 dict 로 돌려주는 PostgreSQL 연결. `with get_connection() as conn:` 블록이 끝나면 커밋된다."""
    return psycopg.connect(**{**DB_CONFIG, **overrides}, row_factory=dict_row)


def to_pgvector(values: Iterable[float]) -> str:
    """임베딩(list/numpy 배열)을 pgvector 리터럴 '[0.1,0.2,...]' 로 변환한다. SQL 에서는 %s::vector 로 받는다."""
    return "[" + ",".join(str(float(v)) for v in values) + "]"
