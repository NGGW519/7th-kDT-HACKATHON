# PostgreSQL 17 + PostGIS 3.7(위치) + pgvector(임베딩 검색)
# 공식 postgis 이미지(postgres:17-trixie 기반)에 PGDG apt 저장소의 pgvector 패키지를 추가한다.
# 참고: postgis/postgis 이미지는 amd64 전용이라 Apple Silicon 에서는 에뮬레이션으로 실행된다.
FROM postgis/postgis:17-3.7

RUN apt-get update \
    && apt-get install -y --no-install-recommends "postgresql-${PG_MAJOR}-pgvector" \
    && rm -rf /var/lib/apt/lists/*

# 최초 기동 시 기본 DB 에 확장 모듈 생성 (postgis 는 베이스 이미지가 이미 생성)
COPY init-extensions.sql /docker-entrypoint-initdb.d/20-extensions.sql
