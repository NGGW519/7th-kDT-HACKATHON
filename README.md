# 7th-kDT-HACKATHON

다섯이 내고향



\# 전체 프로젝트 디렉토리 구조 상세 설계



```

gohyangon-project/

├── backend/                           # Django 기반 백엔드 전체 코드
│   ├── gohyangon/                    # Django 프로젝트 설정 및 공통 구성
│   │   ├── settings.py               # 전체 설정 (DB, Static, Middleware 등)
│   │   ├── urls.py                   # 전역 URL 라우팅
│   │   ├── asgi.py                   # ASGI 서버 설정
│   │   └── wsgi.py                   # WSGI 서버 설정
│   ├── users/                        # 사용자 관리 앱
│   │   ├── models.py                # 사용자 모델 (CustomUser)
│   │   ├── serializers.py          # 사용자 직렬화 로직
│   │   ├── views.py                # 사용자 관련 API 뷰
│   │   ├── urls.py                 # 사용자 엔드포인트
│   │   └── admin.py               # 관리자 설정
│   ├── missions/                     # 미션 관리 앱
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tasks.py            # 비동기 작업 처리
│   ├── badges/                       # 배지 및 로그 앱
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── utils.py
│   ├── community/                  # 커뮤니티 앱
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── consumers.py     # 실시간 WebSocket 처리
│   ├── certifications/            # 기술 인증 앱
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── ai\_utils.py      # AI 판독 유틸
│   ├── utils/                      # 공통 유틸 함수
│   ├── static/                     # 정적 파일(css, js 등)
│   ├── templates/               # 템플릿 파일
│   ├── manage.py              # Django 관리 명령어
│   └── requirements.txt     # 패키지 목록
│
├── frontend/
│   └── mobile/                     # React Native 모바일 앱
│       ├── src/
│       │   ├── components/    # 공통 컴포넌트
│       │   ├── screens/      # 화면 구성
│       │   ├── navigation/   # 네비게이션 구조
│       │   ├── services/    # API 연동
│       │   ├── hooks/       # 커스텀 훅
│       │   └── App.js    # 앱 엔트리
│       ├── assets/       # 이미지, 폰트 등
│       ├── index.js     # 앱 실행 진입점
│       └── package.json # 모바일 패키지 설정
│
├── ai\_engine/                      # AI 추천 엔진 및 분석 모듈
│   ├── rag\_pipeline/            # RAG 파이프라인
│   │   ├── data\_ingest.py
│   │   ├── vector\_store.py
│   │   ├── prompt\_templates.py
│   │   └── utils.py
│   ├── llm\_service/         # LLM 관련 서비스
│   │   ├── langchain\_integration.py
│   │   ├── gpt\_interface.py
│   │   └── evaluator.py
│   └── requirements.txt
│
├── scripts/                        # 초기화 및 배치 스크립트
│   ├── data\_migration.sql
│   ├── init\_admin.py
│   └── batch\_tasks.py
│
├── docs/                           # 문서
│   ├── architecture\_diagram.md
│   ├── api\_spec.md
│   ├── erd\_design.md
│   └── sequence\_diagram.md
│
├── deployment/                  # 배포 및 인프라 설정
│   ├── docker-compose.yml
│   ├── nginx/
│   │   └── default.conf
│   ├── gunicorn\_config.py
│   └── terraform/
│       ├── main.tf
│       └── variables.tf
│
├── tests/                         # 테스트 코드
│   ├── backend/
│   ├── frontend/
│   └── ai\_engine/
│
└── README.md                # 프로젝트 개요 및 실행 가이드
```



