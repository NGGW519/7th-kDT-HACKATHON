"""Crawling_Haman/Hometown_on.sql 과 SQLAlchemy 모델이 만드는 스키마가 똑같은지 확인한다.

둘 중 하나만 고치면 이 테스트가 실패한다 (테이블·컬럼·제약·인덱스·트리거 비교).
"""
from pathlib import Path

from app.core.config import settings

from .conftest import admin_connect, recreate_database

SQL_FILE = Path(__file__).resolve().parents[3] / "Crawling_Haman" / "Hometown_on.sql"

QUERIES = {
    "tables": """SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
                 WHERE n.nspname='public' AND c.relkind='r' AND c.relname <> 'spatial_ref_sys'""",
    "columns": """SELECT c.relname, a.attname, format_type(a.atttypid, a.atttypmod), a.attnotnull,
                         a.attidentity, pg_get_expr(d.adbin, d.adrelid)
                  FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid
                  JOIN pg_namespace n ON n.oid=c.relnamespace
                  LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
                  WHERE n.nspname='public' AND c.relkind='r' AND a.attnum>0 AND NOT a.attisdropped
                    AND c.relname <> 'spatial_ref_sys'""",
    "constraints": """SELECT c.relname, con.conname, pg_get_constraintdef(con.oid)
                      FROM pg_constraint con JOIN pg_class c ON c.oid=con.conrelid
                      JOIN pg_namespace n ON n.oid=c.relnamespace
                      WHERE n.nspname='public' AND c.relname <> 'spatial_ref_sys'""",
    "indexes": """SELECT tablename, indexname, indexdef FROM pg_indexes
                  WHERE schemaname='public' AND tablename <> 'spatial_ref_sys'""",
    "triggers": """SELECT event_object_table, trigger_name, action_timing, event_manipulation, action_statement
                   FROM information_schema.triggers WHERE trigger_schema='public'""",
}


def _snapshot(dbname: str) -> dict:
    with admin_connect(dbname) as conn:
        return {key: set(map(tuple, conn.execute(q).fetchall())) for key, q in QUERIES.items()}


def test_sql_file_matches_models(client):
    sql_db = f"{settings.POSTGRES_DB}_sqlfile"
    recreate_database(sql_db)
    try:
        with admin_connect(sql_db) as conn:
            conn.execute(SQL_FILE.read_text(encoding="utf-8"))
        from_sql, from_models = _snapshot(sql_db), _snapshot(settings.POSTGRES_DB)  # 후자는 앱 시작 시 create_all
    finally:
        with admin_connect() as conn:
            conn.execute(f'DROP DATABASE IF EXISTS "{sql_db}" WITH (FORCE)')

    assert len(from_sql["tables"]) == 34
    for key in QUERIES:
        assert from_sql[key] - from_models[key] == set(), f"{key}: SQL 파일에만 있음"
        assert from_models[key] - from_sql[key] == set(), f"{key}: 모델에만 있음"
