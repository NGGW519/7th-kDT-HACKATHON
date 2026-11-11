# 🏆 고향으로 ON - 고용노동부 장관상 수상작
> **2025년 제7회 K-디지털 트레이닝 해커톤 고용노동부 장관상 수상**

<div align="center">
  <img src="https://img.shields.io/badge/Award-고용노동부%20장관상-gold?style=for-the-badge&logo=trophy" alt="Award">
  <img src="https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
</div>

## 📖 프로젝트 소개

**고향으로 ON**은 RAG 기반 AI 정착 코디네이터를 활용하여 퇴직 후 고향으로 돌아가는 장년층의 정착을 지원하는 디지털 플랫폼입니다.

**Gamification 기반 정착 시스템**을 통해 장년층이 고향 귀향 후 체계적인 미션 수행을 통해 지역사회에 자연스럽게 적응하고 안정적으로 정착할 수 있도록 돕습니다. 지역 소멸 위기에 대응하여 디지털 기술을 활용한 인구 유입·정착 유도, 생활 인프라 강화, 지역 활력 회복을 실현합니다.

### 🎯 핵심 목표
- **정서적 연결**: 다양한 지역 탐방 미션을 통한 지역적 이질감 해소
- **사회적 소속**: 지역 주민과의 친밀한 소통을 통한 관계망 형성
- **직업적 역량 활용**: 귀향자의 경력을 활용한 새로운 진로 기회 제공
- **디지털 접근성**: 장년층을 위한 음성 인식 기반 사용자 친화적 인터페이스

## 👥 팀 구성

| 이름 | 역할 | 담당 업무 |
|------|------|-----------|
| **남궁건우** | 팀장, PM | 프로젝트 총괄, 기획 조율, 발표 |
| **강지윤** | 프론트엔드 | React Native 개발, UI/UX 구현 |
| **김지민** | 데이터베이스, AI | DB 설계, AI 모델 구축 |
| **박현아** | 프론트엔드 | 모바일 앱 개발, 사용자 경험 설계 |
| **우지훈** | 백엔드, AI | FastAPI 서버, RAG 시스템 구현 |

## 🏗️ 시스템 아키텍처

```
📱 Frontend (React Native)
    ↕️
🌐 Backend (FastAPI)
    ↕️
🗄️ Database (PostgreSQL + PostGIS + pgvector)
    ↕️
🤖 AI Services (MonoGPT 라우터 + LangGraph 에이전트 + RAG)
```

### 🛠️ 기술 스택

**Frontend**
- React Native (JavaScript)
- Expo SDK 53
- React Navigation

**Backend**
- FastAPI (Python)
- LangGraph 챗봇 에이전트 (질문 분류 → 일반 대화 / 장소 검색 / 미션 생성 / 게시글 작성)
- RAG (Retrieval-Augmented Generation)

**Database**
- PostgreSQL (주 데이터베이스)
- PostGIS (위치 데이터, 반경 검색)
- pgvector (임베딩 저장 및 벡터 검색)

**AI/ML**
- MonoGPT 라우터 (OpenAI 호환 API: 채팅 gpt-5.4-mini + 대체 claude-haiku-4.5, 임베딩 text-embedding-3-small)
- Google AI Studio (이미지 생성, 예정)
- Whisper API (음성 인식)
- TensorFlow/PyTorch

**Infrastructure**
- Docker
- AWS
- GitHub

## 🚀 주요 기능

### 1. 🎯 AI 기반 맞춤형 미션 추천
- RAG 기술을 활용한 개인 맞춤형 미션 생성
- 3가지 미션 유형: 탐색형, 사회유대형, 커리어형
- 사용자 활동 이력 기반 균형 잡힌 추천

### 2. 🗣️ 음성 기반 대화형 인터페이스
- STT(Speech-to-Text) 기반 음성 인식
- 자연어 처리를 통한 직관적인 상호작용
- 장년층 친화적 UI/UX 설계

### 3. 🏅 배지 및 리워드 시스템
- 미션 완료별 배지 획득
- 기술 인증 시스템
- 지역 상점 연계 실질적 보상

### 4. 👥 멘토링 및 커뮤니티
- 지역 선배와의 멘토-멘티 매칭
- 의뢰 게시판을 통한 기술 매칭
- 실시간 채팅 및 평가 시스템

### 5. 📍 위치 기반 서비스
- 지도 기반 장소 검색 및 추천
- 공간 데이터 인덱싱 (PostGIS)

## 📊 데이터베이스 설계

PostgreSQL 한 곳에 **34개 테이블** (PostGIS 로 위치, pgvector 로 임베딩까지 함께 저장):

- **사용자 관리**: users, user_profiles, social_accounts, skills, badges 등
- **미션 시스템**: missions, mission_parts, mission_assignments(사용자별 완료 여부) 등
- **지역 데이터**: locations(PostGIS 좌표), location_categories, culture 등
- **커뮤니티**: board_posts(자유·의뢰·멘토 게시판 통합), board_comments, likes, matches 등
- **AI/기타**: rag_documents(pgvector), chat_sessions, chat_messages, notifications 등

상세한 데이터베이스 스키마는 [`Hometown_on_테이블_설명서.md`](./HometownON/Hometown_on_테이블_설명서.md)와 생성 SQL [`Hometown_on.sql`](./Crawling_Haman/Hometown_on.sql)을 참고하세요.

## 🎨 화면 설계

### 메인 화면 구성
- **대시보드**: 사용자 프로필 및 활동 현황
- **오각형 레이더 차트**: 활동성, 사회성, 적응력, 도전성, 연대감 시각화
- **추천 미션 카드**: 일일 3~6개 맞춤형 미션 제공
- **챗봇 인터페이스**: 음성/텍스트 기반 자연어 상호작용

## 🌟 혁신성 및 차별화

### vs 기존 귀농귀촌 서비스
- ❌ **기존**: 단순 정보 제공, AI 추천 부재
- ✅ **고향으로 ON**: RAG 기반 개인 맞춤형 추천

### vs 일반 커뮤니티 플랫폼
- ❌ **기존**: 단방향 정보 전달
- ✅ **고향으로 ON**: 양방향 멘토링 및 기술 매칭

### vs 기존 장년층 서비스
- ❌ **기존**: 복잡한 UI, 키보드 입력 중심
- ✅ **고향으로 ON**: 음성 인식 기반 직관적 인터페이스

## 📈 기대효과

### 🏘️ 지역사회 측면
- **인구 소멸 위기 완화**: 장년층 유입을 통한 활력 증진
- **지역경제 활성화**: 소비 주체 증가 및 일자리 창출
- **세대간 지식 전수**: 멘토링을 통한 경험 공유

### 👤 개인 측면
- **제2의 인생 설계**: 새로운 삶의 기회 제공
- **경제활동 연계**: 재능 기부에서 소득 창출로 발전
- **사회적 유대감 회복**: 지역 커뮤니티 참여를 통한 소속감

### 💼 비즈니스 측면
- **B2B**: 금융기관 대상 귀향 준비도 리포트 (연 5-7억원)
- **B2G**: 지자체 인력 매칭 컨설팅 (연 2-3억원)
- **교육사업**: 평생교육원 연계 프로그램 (연 1.5-2.5억원)

## 📅 개발 일정

| 주차 | 기간 | 주요 작업 |
|------|------|-----------|
| 1주차 | 6.25-6.30 | 아키텍처 확정, ERD 설계, OpenAI API 연동 |
| 2주차 | 7.1-7.7 | 가입/프로파일링 구현, 지도 API 연동 |
| 3주차 | 7.8-7.14 | 미션 시스템, 적응도 알고리즘 구현 |
| 4주차 | 7.15-7.21 | 매칭 시스템, 기술 인증 흐름 구현 |
| 5주차 | 7.22-7.28 | 기능 통합 점검, 배지 자동화 테스트 |
| ... | ... | ... |
| 11주차 | 9.1-9.7 | 최종 발표 및 시상 |

## 📂 프로젝트 구조

```
7th-kDT-HACKATHON/
├── HometownON/                    # 서비스 본체
│   ├── frontend/                  # React Native(Expo) 모바일 앱
│   │   └── src/
│   │       ├── screens/           # 화면 (귀향자/지역주민/멘토, 미션, 게시판, 챗봇 등)
│   │       ├── navigation/        # 스택 + 역할별 하단 탭 네비게이션
│   │       ├── services/          # 백엔드 API 호출 (AuthService, LocationService, WeatherService)
│   │       ├── config/            # API 주소 설정 (apiConfig.js)
│   │       ├── components/  utils/  assets/
│   ├── backend/                   # FastAPI 서버
│   │   ├── app/  (api · core · crud · models · schemas · chatbot)
│   │   ├── tests/                 # pytest (실제 PostgreSQL + 가짜 LLM)
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── db/                        # PostgreSQL + PostGIS + pgvector 이미지
│   └── Hometown_on_테이블_설명서.md
├── Ai_llm/mission_suggest/        # RAG 기반 미션 추천 (임베딩 + pgvector + LangGraph)
├── Crawling_Haman/                # 함안군 공공데이터 CSV, DB 스키마(SQL), 적재·임베딩 스크립트
├── proposal/  memorial/  images/  # 기획서, 발표 자료, 디자인 이미지
├── docker-compose.yml             # backend + PostgreSQL
├── scripts/                       # check_llm_models.py(모델 점검), insert_sample_missions.py(기본 미션)
├── .github/workflows/             # 백엔드 테스트, MonoGPT 모델 주간 점검 (실패 시 Discord 알림)
├── .claude/                       # Claude Code 개발 하네스 (에이전트·스킬, CLAUDE.md 참고)
├── requirements.txt               # Crawling_Haman · Ai_llm 스크립트용 Python 패키지
└── .env                           # 모든 환경 변수 (직접 생성, Git 에 올라가지 않음)
```

## 🚀 실행 방법

### 0. 환경 변수 (`.env` 하나로 관리)
백엔드, Docker, 데이터 스크립트, 모바일 앱이 모두 **저장소 루트의 `.env` 파일 하나**를 같이 읽습니다.
아래 내용으로 루트에 `.env` 를 만들고 값을 채우세요. `.env` 는 `.gitignore` 에 등록되어 있어 Git 에 올라가지 않습니다.

```bash
# LLM — MonoGPT 라우터 (OpenAI 호환). 챗봇·미션 추천·임베딩 등 모든 LLM 호출에 사용
MONOGPT_API_KEY=
LLM_MODEL=gpt-5.4-mini
LLM_FALLBACK_MODELS=claude-haiku-4.5
EMBEDDING_MODEL=text-embedding-3-small
# LLM_MAX_TOKENS=1024                # 답변 최대 길이 (기본 1024)

# 이미지 생성 — Google AI Studio (https://aistudio.google.com/apikey). 백엔드에서만 사용
GOOGLE_API_KEY=

# PostgreSQL (PostGIS + pgvector)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change-me
POSTGRES_DB=hometown_on

# 백엔드
SECRET_KEY=32자-이상의-임의-문자열      # JWT 서명 키 (필수)
CORS_ORIGINS=*
WEATHER_API_KEY=                     # 공공데이터포털 기상청 단기예보 서비스키 (날씨)
GOOGLEMAP_API_KEY=                   # Google Geocoding (좌표 → 동네 이름)

# 모바일 앱 (앱 번들에 포함되는 값 — 비밀값을 넣지 말 것). GOOGLE_CLIENT_ID_WEB 은 서버도 토큰 검증에 사용
GOOGLE_CLIENT_ID_WEB=....apps.googleusercontent.com
GOOGLE_CLIENT_ID_IOS=....apps.googleusercontent.com
# API_URL=http://<PC의 IP>:8000      # 실기기 테스트 시에만. 생략하면 에뮬레이터 기본 주소 사용
```

| 변수 | 필수 | 사용처 |
|---|---|---|
| `MONOGPT_API_KEY` | ✅ | 백엔드 챗봇, 미션 추천, 문화 데이터 임베딩, 모델 점검 (유료) |
| `LLM_MODEL`, `EMBEDDING_MODEL` | | 위와 동일 (기본값: 위 예시) |
| `LLM_FALLBACK_MODELS` | | 기본 모델 호출이 실패하면 순서대로 대신 시도할 모델 (쉼표 구분, 다른 회사 모델 권장) |
| `LLM_MAX_TOKENS` | | 답변 최대 길이 (기본 1024, 비용 상한 역할) |
| `GOOGLE_API_KEY` | 이미지 생성 시 ✅ | 이미지 생성 (예정). **앱 코드에서 import 금지** — 앱 번들에 그대로 들어감 |
| `POSTGRES_PASSWORD` | ✅ | 백엔드, Docker DB, 데이터 스크립트 |
| `POSTGRES_HOST` / `PORT` / `USER` / `DB` | | 위와 동일 (기본값: 위 예시. Docker 안에서는 HOST 가 자동으로 `db`) |
| `SECRET_KEY` | ✅ | 백엔드 로그인 토큰 서명 (기본값 없음) |
| `CORS_ORIGINS` | | 백엔드 |
| `WEATHER_API_KEY`, `GOOGLEMAP_API_KEY` | 날씨 기능 시 ✅ | 백엔드 날씨 API (없으면 날씨 API 가 503, 위치 이름은 '알 수 없는 위치') |
| `GOOGLE_CLIENT_ID_WEB`, `GOOGLE_CLIENT_ID_IOS` | 구글 로그인 시 ✅ | 모바일 앱, 백엔드(ID 토큰 검증) |
| `API_URL` | | 모바일 앱 (기본값: Android 에뮬레이터 `http://10.0.2.2:8000`, iOS 시뮬레이터 `http://localhost:8000`) |

> `EMBEDDING_MODEL` 을 바꾸면 기존 벡터와 섞어 검색할 수 없으므로 문화 데이터(Step 2)와 미션 임베딩을 다시 만들어야 합니다.

### 1. 백엔드 + DB (Docker, 저장소 루트에서)
```bash
docker compose up -d --build  # backend :8000, PostgreSQL :5432
```
API 문서: http://localhost:8000/docs

> **이미 만들어 둔 DB 가 있다면:** 서버는 시작할 때 **없는 테이블만** 만들고, 있는 테이블에 새 컬럼·인덱스를 추가하지 않습니다.
> 개발용 DB 는 지우고 다시 만드는 것이 가장 간단합니다 (`docker compose down -v` 후 `docker compose up -d --build`, 데이터도 지워짐).
> 데이터를 남겨야 하면 최근 추가된 인덱스만 직접 만드세요:
> ```sql
> CREATE INDEX IF NOT EXISTS ix_locations_geom_geography ON locations USING gist ((geom::geography));  -- 근처 장소 검색
> ANALYZE locations;
> ```

Docker 없이 백엔드만 실행하려면 (PostGIS·pgvector 확장이 설치된 로컬 PostgreSQL 필요):
```bash
cd HometownON/backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. 모바일 앱 (Expo)
```bash
cd HometownON/frontend
npm install
npx expo start -c   # -c: .env 를 바꾼 뒤에는 캐시를 지워야 새 값이 반영됨
```
- 챗봇은 백엔드(`/api/chatbot/chat`)에 연결됩니다. 로그인하면 챗봇에게 미션 만들기·게시글 올리기도 부탁할 수 있습니다.

### 3. 데이터 적재 · AI 추천 스크립트 (저장소 루트에서)
```bash
pip install -r requirements.txt
psql -h localhost -U postgres -d hometown_on -f Crawling_Haman/Hometown_on.sql  # 스키마 생성 (백엔드를 먼저 실행했다면 생략)
python Crawling_Haman/Step_1_전체_데이터_로드.py           # CSV → PostgreSQL(PostGIS)
python Crawling_Haman/Step_2_문화데이터_임베딩.py          # 문화 데이터 → pgvector
python scripts/insert_sample_missions.py                 # 기본 미션 9개 (다시 실행해도 중복 없음)
python Ai_llm/mission_suggest/mission_graph.py 1         # 1번 사용자 미션 추천
```

### 4. 백엔드 테스트
실제 PostgreSQL(PostGIS + pgvector)에 테스트 전용 DB(`hometown_test`)를 만들어 돌리고, LLM 은 가짜 응답을 써서 비용이 들지 않습니다.
SQL 파일(`Hometown_on.sql`)과 DB 모델이 어긋나도 실패합니다.
```bash
docker compose up -d db            # 저장소 루트에서 DB 만 실행
cd HometownON/backend && pip install -r requirements.txt pytest && pytest
```
GitHub 에 push 하면 Actions 가 같은 테스트를 자동으로 실행합니다.

### 5. MonoGPT 모델 상태 점검
설정된 채팅·대체·임베딩 모델이 MonoGPT 목록에 있고 응답하는지 매주 월요일 09:00(KST)에 GitHub Actions 가 자동 점검합니다.
기본 채팅 모델이나 임베딩 모델을 쓸 수 없으면 실패로 끝나고 Discord 로 알리며, 바꿔 쓸 모델 후보를 결과에 보여줍니다.
```bash
python scripts/check_llm_models.py            # 로컬에서 바로 점검 (루트 .env 의 키 사용)
python scripts/check_llm_models.py --no-live  # 실제 호출 없이 모델 목록만 확인
```
GitHub 에서 실행되려면 저장소 Settings → Secrets 에 `MONOGPT_API_KEY` 를 등록하세요.

## 📋 MVP 검증 계획

**대상 지역**: 경상남도 함안군
**목표 사용자**: 500명 이상
**핵심 KPI**:
- 미션 참여 전환율 30% 이상
- 함안군청 연계 공식 미션 10개 이상 출시
- 연간 5억원 규모의 지역 내 소비 유발

## 🏆 수상 실적

- **2025년 제7회 K-디지털 트레이닝 해커톤**
- **고용노동부 장관상** 수상
- **지역 균형 발전을 위한 디지털 사회서비스 개발** 부문

---

<div align="center">
  <strong>고향으로 ON</strong> - 다섯이 내고향 팀<br>
  <em>2025년 제7회 K-디지털 트레이닝 해커톤 고용노동부 장관상 수상작</em>
</div>