# 고향으로 ON

2025년 제7회 K-디지털 트레이닝 해커톤 고용노동부 장관상 수상작 (지역 균형 발전을 위한 디지털 사회서비스 개발 부문, 다섯이 내고향 팀)

퇴직 후 고향(경상남도 함안군)으로 돌아온 장년층의 정착을 돕는 앱입니다. 지역 탐방·주민 교류·경력 활용 미션과 AI 챗봇으로 지역에 자연스럽게 적응하도록 돕습니다.

## 주요 기능

- **미션**: 탐색형·사회유대형·커리어형 미션, 사용자별 완료 기록과 경험치·레벨
- **AI 챗봇**: 일반 대화, 함안 장소 검색, 맞춤 미션 만들기, 게시글 대신 올리기 (LangGraph 에이전트)
- **커뮤니티**: 자유·의뢰·멘토 게시판, 댓글·좋아요, 멘토 매칭
- **위치**: 근처 장소 검색 (PostGIS 반경 검색), 날씨
- **회원**: 이메일·Google 로그인, 귀향자·지역주민·멘토 역할별 가입

## 팀

| 이름 | 역할 |
|---|---|
| 남궁건우 | 팀장, PM |
| 강지윤 | 프론트엔드 |
| 김지민 | 데이터베이스, AI |
| 박현아 | 프론트엔드 |
| 우지훈 | 백엔드, AI |

## 기술 스택

- 앱: React Native (Expo SDK 53), React Navigation
- 서버: FastAPI, SQLAlchemy, LangGraph
- DB: PostgreSQL + PostGIS(위치) + pgvector(임베딩), 테이블 34개
- AI: MonoGPT 라우터 (OpenAI 호환 API). 채팅 gpt-5.4-mini, 대체 claude-haiku-4.5, 임베딩 text-embedding-3-small
- 기타: Docker, GitHub Actions

DB 구조는 [`Hometown_on_테이블_설명서.md`](./HometownON/Hometown_on_테이블_설명서.md), 생성 SQL은 [`Hometown_on.sql`](./Crawling_Haman/Hometown_on.sql)에 있습니다.

## 폴더 구조

```
HometownON/frontend/   React Native 앱
HometownON/backend/    FastAPI 서버 (app/, tests/)
HometownON/db/         PostgreSQL + PostGIS + pgvector 이미지
Ai_llm/                미션 추천 (임베딩 + pgvector)
Crawling_Haman/        함안군 공공데이터 CSV, DB 스키마, 적재·임베딩 스크립트
scripts/               모델 점검, 기본 미션 넣기
proposal/ memorial/    기획서, 발표 자료
.claude/               Claude Code 개발 하네스 (CLAUDE.md 참고)
docker-compose.yml     서버 + DB 실행
.env                   모든 환경 변수 (직접 만듦, Git 에 올라가지 않음)
```

## 실행 방법

### 1. 환경 변수

서버, Docker, 데이터 스크립트, 앱이 모두 저장소 루트의 `.env` 하나를 읽습니다.

```bash
# LLM (MonoGPT). 챗봇·미션 추천·임베딩에 사용
MONOGPT_API_KEY=
LLM_MODEL=gpt-5.4-mini
LLM_FALLBACK_MODELS=claude-haiku-4.5
EMBEDDING_MODEL=text-embedding-3-small

# 이미지 생성 (Google AI Studio, 예정)
GOOGLE_API_KEY=

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change-me
POSTGRES_DB=hometown_on

# 서버
SECRET_KEY=32자-이상의-임의-문자열
CORS_ORIGINS=*
WEATHER_API_KEY=        # 공공데이터포털 기상청 단기예보 (없으면 날씨 기능만 꺼짐)
GOOGLEMAP_API_KEY=      # Google Geocoding (좌표 -> 동네 이름)

# 앱 (앱 파일에 그대로 들어가므로 비밀값을 넣지 말 것)
GOOGLE_CLIENT_ID_WEB=....apps.googleusercontent.com
GOOGLE_CLIENT_ID_IOS=....apps.googleusercontent.com
# API_URL=http://<PC의 IP>:8000   # 실제 기기에서 테스트할 때만
```

- 필수: `MONOGPT_API_KEY`, `POSTGRES_PASSWORD`, `SECRET_KEY`. Google 로그인에는 `GOOGLE_CLIENT_ID_*`가 필요합니다.
- 앱은 `API_URL`, `GOOGLE_CLIENT_ID_*`만 읽을 수 있습니다 (그 밖의 키는 앱에 들어가지 않도록 막혀 있음).
- `EMBEDDING_MODEL`을 바꾸면 문화 데이터(Step 2)와 미션 임베딩을 다시 만들어야 합니다.

### 2. 서버 + DB

```bash
docker compose up -d --build   # 서버 :8000, PostgreSQL :5432
```

API 문서: http://localhost:8000/docs

서버는 시작할 때 없는 테이블만 만듭니다. 예전에 만든 DB에는 새 인덱스가 생기지 않으므로, 개발용 DB는 `docker compose down -v`로 지우고 다시 만들거나 아래를 한 번 실행하세요.

```sql
CREATE INDEX IF NOT EXISTS ix_locations_geom_geography ON locations USING gist ((geom::geography));
```

### 3. 앱

```bash
cd HometownON/frontend
npm install
npx expo start -c   # .env 를 바꾼 뒤에는 -c 로 캐시를 지워야 반영됨
```

### 4. 데이터 넣기

```bash
pip install -r requirements.txt
python Crawling_Haman/Step_1_전체_데이터_로드.py     # CSV -> PostgreSQL
python Crawling_Haman/Step_2_문화데이터_임베딩.py    # 문화 데이터 -> pgvector
python scripts/insert_sample_missions.py           # 기본 미션 9개
python Ai_llm/mission_suggest/mission_graph.py 1   # 1번 사용자 미션 추천
```

### 5. 테스트

실제 PostgreSQL에 테스트용 DB를 만들어 돌리고, LLM은 가짜 응답을 씁니다 (비용 없음). push하면 GitHub Actions가 같은 테스트를 실행합니다.

```bash
docker compose up -d db
cd HometownON/backend && pip install -r requirements.txt pytest && pytest
```

### 6. 모델 점검 (선택)

MonoGPT에서 지금 쓰는 모델이 사라지거나 응답하지 않는지 확인합니다. 필요할 때 직접 실행하거나, GitHub Actions 탭에서 "LLM 모델 점검 (MonoGPT)"을 수동으로 실행하세요.

```bash
python scripts/check_llm_models.py
```
