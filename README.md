# 🏆 고향으로 ON - 고용노동부 장관상 수상작
> **2025년 제7회 K-디지털 트레이닝 해커톤 고용노동부 장관상 수상**

<div align="center">
  <img src="https://img.shields.io/badge/Award-고용노동부%20장관상-gold?style=for-the-badge&logo=trophy" alt="Award">
  <img src="https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI">
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
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
| **김지민** | 데이터베이스, AI | MySQL 설계, AI 모델 구축 |
| **박현아** | 프론트엔드 | 모바일 앱 개발, 사용자 경험 설계 |
| **우지훈** | 백엔드, AI | FastAPI 서버, RAG 시스템 구현 |

## 🏗️ 시스템 아키텍처

```
📱 Frontend (React Native)
    ↕️
🌐 Backend (FastAPI)
    ↕️
🗄️ Database (MySQL + ChromaDB)
    ↕️
🤖 AI Services (OpenAI + RAG)
```

### 🛠️ 기술 스택

**Frontend**
- React Native
- TypeScript
- Expo

**Backend**
- FastAPI (Python)
- LangChain
- RAG (Retrieval-Augmented Generation)

**Database**
- MySQL (주 데이터베이스)
- ChromaDB (벡터 검색)
- Pinecone (임베딩 저장)

**AI/ML**
- OpenAI GPT API
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
- 공간 데이터 인덱싱 (MySQL SPATIAL)

## 📊 데이터베이스 설계

총 **26개 테이블**로 구성된 체계적인 데이터베이스:

- **사용자 관리**: 6개 테이블 (users, user_profiles, social_accounts 등)
- **미션 시스템**: 5개 테이블 (missions, mission_assignments 등)
- **지역 데이터**: 5개 테이블 (locations, culture, location_categories 등)
- **커뮤니티**: 4개 테이블 (board_posts, comments, likes 등)
- **기타 서비스**: 6개 테이블 (notifications, chat_sessions 등)

상세한 데이터베이스 스키마는 [`Hometown_on_테이블_설명서.md`](./Hometown_on_테이블_설명서.md)를 참고하세요.

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
HometownON/
├── frontend/                 # React Native 앱
│   ├── src/
│   ├── assets/
│   └── package.json
├── backend/                  # FastAPI 서버
│   ├── app/
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml        # 통합 배포 설정
└── Hometown_on_테이블_설명서.md  # DB 스키마 문서
```

## 🚀 실행 방법

### 개발 환경 설정

1. **저장소 클론**
```bash
git clone <repository-url>
cd HometownON
```

2. **Docker 컨테이너 실행**
```bash
docker-compose up -d
```

3. **프론트엔드 실행**
```bash
cd frontend
npm install
npm start
```

4. **백엔드 실행**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 환경 변수 설정
```bash
OPENAI_API_KEY=your_openai_api_key
MYSQL_ROOT_PASSWORD=your_mysql_password
CHROMADB_HOST=localhost
CHROMADB_PORT=8000
```

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