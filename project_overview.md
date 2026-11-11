# 프로젝트 "HometownON" 개요

"HometownON"은 제7회 K-디지털 트레이닝 해커톤에 출품된 프로젝트로, 귀향자가 고향에 성공적으로 정착할 수 있도록 돕는 것을 목표로 하는 종합 플랫폼입니다.

## 주요 기능

*   **사용자 맞춤형 미션 시스템**: 사용자의 유형(귀향자, 지역주민, 멘토)과 관심사에 따라 맞춤형 미션을 제공하여 지역 사회에 자연스럽게 적응할 수 있도록 유도합니다.
*   **AI 기반 미션 추천**: LangChain, GPT-4o, ChromaDB를 활용한 RAG(Retrieval-Augmented Generation) 파이프라인을 구축하여 사용자의 프로필과 활동 이력을 기반으로 개인화된 미션을 추천합니다.
*   **커뮤니티 및 소셜 기능**: 귀향자와 지역주민, 멘토가 소통할 수 있는 커뮤니티 공간을 제공하여 정보 교류와 유대감 형성을 돕습니다.
*   **배지 및 인증 시스템**: 미션 완료에 따른 배지 획득과 기술 인증을 통해 사용자의 성취감을 높이고 적극적인 참여를 유도합니다.

## 기술 스택

*   **Backend**: FastAPI, SQLAlchemy, Pydantic
*   **Frontend**: React Native (Expo), TypeScript
*   **AI Engine**: LangChain, GPT-4o, ChromaDB, OpenAI Embeddings
*   **Database**: MySQL, ChromaDB
*   **DevOps**: Docker, Nginx, GitHub Actions

---

## `HometownON` 폴더 상세 설명

### Backend (`HometownON/backend`)

FastAPI를 기반으로 한 API 서버로, 비동기 처리를 통해 높은 성능을 목표로 합니다.

*   **주요 라이브러리**:
    *   `fastapi`: API 서버 구축
    *   `uvicorn`: ASGI 서버
    *   `sqlalchemy`: ORM을 통한 데이터베이스 연동
    *   `pymysql`: MySQL 드라이버
    *   `pydantic`: 데이터 유효성 검사 및 설정 관리
    *   `python-jose[cryptography]`, `passlib[bcrypt]`: JWT 기반 인증 및 비밀번호 해싱
    *   `google-auth`: Google 소셜 로그인 연동
    *   `geoalchemy2`: 위치 기반 데이터 처리

*   **구현 정도**:
    *   사용자 인증(회원가입, 로그인, 소셜 로그인) 및 프로필 관리 기능이 구현되어 있습니다.
    *   미션 조회, 생성, 수정, 삭제 등 기본적인 CRUD API가 구현되어 있습니다.
    *   AI 엔진과 연동하여 미션을 추천하는 API가 구현되어 있습니다.
    *   데이터베이스 모델(User, Mission, Badge 등)이 정의되어 있고, SQLAlchemy를 통해 데이터베이스와 연동됩니다.

### Frontend (`HometownON/frontend`)

React Native와 Expo를 사용하여 개발된 크로스플랫폼 모바일 애플리케이션입니다.

*   **주요 라이브러리**:
    *   `expo`: React Native 앱 개발 프레임워크
    *   `@react-navigation/*`: 화면 전환 및 내비게이션
    *   `@react-native-firebase/app`, `@react-native-firebase/auth`: Firebase 연동
    *   `@react-native-google-signin/google-signin`: Google 소셜 로그인
    *   `react-native-maps`: 지도 표시
    *   `typescript`: 정적 타입 지원

*   **구현 정도**:
    *   로그인, 회원가입, 소셜 로그인 등 사용자 인증 관련 화면 및 기능이 구현되어 있습니다.
    *   메인 화면, 미션 목록, 미션 상세, 프로필 등 주요 화면의 UI가 구성되어 있습니다.
    *   Backend API와 연동하여 데이터를 주고받는 로직이 구현되어 있습니다.
    *   지도에 위치 정보를 표시하는 기능이 구현되어 있습니다.
