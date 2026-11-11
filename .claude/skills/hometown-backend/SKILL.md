---
name: hometown-backend
description: "고향으로 ON 백엔드(FastAPI + SQLAlchemy + PostgreSQL/PostGIS/pgvector) 작업 규칙. 엔드포인트·CRUD·스키마 추가, DB 테이블/컬럼 변경, Hometown_on.sql 수정, 인증·게시판·미션 API 수정, 백엔드 pytest 작성 시 반드시 따른다. 앱 화면 작업은 hometown-mobile, 챗봇/임베딩은 hometown-ai를 쓴다."
---

# 고향으로 ON 백엔드 규칙

## 구조
- 앱: `HometownON/backend/app/` (api/endpoints, crud, models, schemas, core, chatbot)
- 스키마 원본 두 개: `app/models/models.py`(서버 시작 시 create_all) 와 `Crawling_Haman/Hometown_on.sql`(데이터 스크립트/수동 설치)
- 테이블 설명서: `HometownON/Hometown_on_테이블_설명서.md`, `Crawling_Haman/Hometown_on_테이블_설명서.md` (두 파일은 같은 내용)
- 설정: 저장소 루트 `.env` 하나 (`app/core/config.py`가 상위 폴더로 올라가며 찾는다). `.env.example`은 만들지 않고 변수 설명은 README "0. 환경 변수"에 적는다.

## DB 변경 규칙 (가장 자주 깨지는 부분)
1. 모델과 SQL 파일을 **항상 같이** 고친다. `tests/test_schema_sql.py`가 둘을 실제 DB로 만들어 테이블·컬럼·제약·인덱스·트리거까지 비교한다. 한쪽만 고치면 실패한다.
   - 예: `updated_at` 컬럼을 추가하면 SQL의 `CREATE TRIGGER trg_<table>_updated_at`과 models.py 맨 아래 트리거 등록 목록 둘 다 추가해야 한다.
2. 선택지 컬럼은 `choice('이름', '값1', ...)`(VARCHAR + CHECK)로 만든다. SQL 쪽 길이는 가장 긴 값의 글자 수(`VARCHAR(n)`)와 같아야 한다.
3. 시간은 `TIMESTAMPTZ`(created_at_col/updated_at_col), JSON은 `JSONB`, PK는 `pk_bigint()`(IDENTITY).
4. 좌표는 PostGIS `POINT(경도 위도)`, SRID 4326. MySQL 시절의 위도/경도 뒤집기 보정 코드를 다시 넣지 않는다.
5. 무작위 정렬은 `func.random()` (MySQL의 `func.rand()` 아님).
6. 이미 운영 중인 DB에는 create_all이 새 컬럼을 추가하지 않는다. 컬럼을 바꾸면 보고서에 "기존 DB는 수동 변경 필요"를 적는다.
7. 모델을 바꾸면 테이블 설명서 두 파일의 해당 DDL 블록도 SQL 파일과 같게 고친다.

## API 규칙
- 앱이 쓰는 주소와 필드 이름을 바꾸지 않는다. 게시판 3종은 테이블 하나(`board_posts`, `board_type`)지만 주소는 `/api/board`, `/api/requests`, `/api/mentors` 그대로다(`api/endpoints/board.py`의 `build_router`).
- 의뢰 게시판 응답의 `status`는 의뢰 진행 상태(`match_status`: pending/matched/completed/cancelled)다. 자유·멘토는 글 상태(active/hidden/deleted).
- 미션 완료 여부는 사용자별(`mission_assignments.status`)이다. `missions` 테이블에 공용 상태 칸을 다시 만들지 않는다.
- 고정 경로(`/user-stats` 등)는 `/{id}` 경로보다 **먼저** 정의한다. 뒤에 두면 정수 변환 실패로 422가 난다.
- 인증: 필수는 `Depends(security.get_current_user)`, 선택은 `get_current_user_optional`. 작성자 확인(403)과 존재 확인(404)을 구분한다.
- 응답 스키마에서 프로필 같은 연관 객체는 비어 있을 수 있게 둔다(`Optional`). Google 로그인 직후 사용자는 이름만 있다.
- 삭제는 댓글/좋아요 FK 때문에 상태 변경(soft delete)으로 처리하고, 목록/조회에서 제외한다.
- 스트리밍 응답(StreamingResponse) 안에서는 요청의 `db` 세션을 쓰지 말고 `SessionLocal()`을 새로 연다.

## 보안
- 비밀값은 루트 `.env`에만. 코드에 키·비밀번호 기본값을 넣지 않는다(`SECRET_KEY`는 기본값 없음).
- 비밀번호는 `core/security.py`의 bcrypt 함수만 사용(72바이트 처리 포함). passlib/python-jose를 다시 들이지 않는다.

## 테스트
- 위치: `HometownON/backend/tests/` (pytest, 실제 PostgreSQL + 가짜 LLM). 테스트는 `hometown_test` DB를 매번 새로 만든다.
- 실행: `cd HometownON/backend && pytest` (아래 "테스트 DB"가 떠 있어야 한다)
- 테스트 DB: `docker compose up -d db`(루트) 후 루트 `.env`의 접속 정보를 쓴다. Docker가 없으면 `POSTGRES_HOST/PORT/USER/PASSWORD` 환경 변수로 다른 PostGIS+pgvector 서버를 지정한다.
- 새 엔드포인트마다: 정상, 인증 없음(401), 남의 데이터(403/404), 잘못된 입력(422)을 최소한 확인한다.
- 사용자 만들기는 `tests/conftest.py`의 `signup_and_login()`을 쓴다.
