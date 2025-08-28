# Hometown_on 데이터베이스 테이블 설명서

## 📋 개요

이 문서는 함안군 귀향자 정착 지원 플랫폼 **Hometown_on**의 MySQL 데이터베이스 스키마에 대한 상세 설명서입니다. 총 26개의 테이블로 구성되어 있으며, 사용자 관리부터 AI 기반 검색까지 모든 서비스 기능을 지원합니다.

## 🗂️ 테이블 분류 및 구조

### 🔹 1. 사용자 관리 (User Management)

#### `users` - 기본 사용자 계정
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  phone VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```
- **역할**: 플랫폼의 기본 사용자 계정 정보
- **핵심 필드**: 이메일, 비밀번호 해시, 전화번호

#### `user_profiles` - 사용자 상세 프로필
```sql
CREATE TABLE user_profiles (
  user_id BIGINT PRIMARY KEY,
  display_name VARCHAR(80),
  profile_image VARCHAR(500) NULL,
  birth_year SMALLINT,
  gender ENUM('male','female','other') NULL,
  home_region VARCHAR(120),      -- 고향/귀향 지역
  target_region VARCHAR(120),    -- 정착 희망 지역
  preferences JSON NULL,         -- 관심분야/선호 카테고리
  bio TEXT NULL,                 -- 자기소개
  mentor_available BOOLEAN DEFAULT FALSE,
  mentor_hourly_rate INT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```
- **역할**: 사용자의 상세 정보 및 멘토 관련 설정
- **특징**: 고향/정착희망지역으로 귀향자 특성 반영

#### `social_accounts` - 소셜 로그인 연동
```sql
CREATE TABLE social_accounts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  provider ENUM('google','kakao','naver','apple') NOT NULL,
  provider_uid VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_provider_user(provider, provider_uid),
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```
- **역할**: 구글, 카카오, 네이버와 같은 소셜 로그인 지원

### 🔹 2. 스킬 및 배지 시스템

#### `skills` - 스킬 마스터 테이블
```sql
CREATE TABLE skills (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(64) UNIQUE,
  name VARCHAR(120),
  category VARCHAR(80)  -- 예: IT, 농업, 돌봄, 교육 등
)
```

#### `user_skills` - 사용자별 보유 스킬
```sql
CREATE TABLE user_skills (
  user_id BIGINT,
  skill_id BIGINT,
  level TINYINT,         -- 1~5 등급
  certified BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, skill_id)
)
```

#### `badges` - 배지 마스터 테이블
```sql
CREATE TABLE badges (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(64) UNIQUE,
  name VARCHAR(120),
  description TEXT
)
```

#### `user_badges` - 사용자별 획득 배지
```sql
CREATE TABLE user_badges (
  user_id BIGINT,
  badge_id BIGINT,
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, badge_id)
)
```

### 🔹 3. 미션 시스템 (Gamification)

#### `missions` - 미션 정의
```sql
CREATE TABLE missions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(64) UNIQUE,
  title VARCHAR(200),
  mission_type ENUM('탐색형','사회유대형','커리어형') NOT NULL,
  difficulty TINYINT DEFAULT 1,
  expected_minutes SMALLINT,
  tags JSON NULL,                 -- ["경로당","마을회관","문화체험"] 등
  description TEXT,
  thumbnail_image VARCHAR(500) NULL
)
```
- **특징**: 3가지 미션 유형으로 다양한 참여 방식 제공

#### `mission_parts` - 미션 세부 단계
```sql
CREATE TABLE mission_parts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  mission_id BIGINT NOT NULL,
  step_no TINYINT NOT NULL,
  instruction TEXT,               -- 세부 단계 안내
  checklist JSON NULL,            -- 체크리스트(선택)
  UNIQUE KEY uq_mission_step(mission_id, step_no)
)
```

#### `mission_assignments` - 사용자별 미션 배정
```sql
CREATE TABLE mission_assignments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  mission_id BIGINT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATE NULL,
  status ENUM('assigned','in_progress','completed','skipped','canceled') DEFAULT 'assigned',
  context JSON NULL              -- 추천 근거
)
```

#### `mission_progress` - 미션 진행 상황
```sql
CREATE TABLE mission_progress (
  assignment_id BIGINT PRIMARY KEY,
  progress_pct TINYINT DEFAULT 0,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  feedback TEXT NULL
)
```

#### `mission_part_progress` - 세부 단계별 진행 상황
```sql
CREATE TABLE mission_part_progress (
  assignment_id BIGINT,
  part_id BIGINT,
  done BOOLEAN DEFAULT FALSE,
  memo TEXT NULL,
  done_at TIMESTAMP NULL,
  PRIMARY KEY (assignment_id, part_id)
)
```

### 🔹 4. 지역 데이터 (Location & Culture)

#### `location_categories` - 장소 분류 체계
```sql
CREATE TABLE location_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  main VARCHAR(50),           -- 예: '식음료','의료','공공시설'
  sub  VARCHAR(80),           -- 예: '맛집','카페','병원/의원','경로당'
  UNIQUE KEY uq_main_sub(main, sub)
)
```

#### `locations` - 지역 장소 정보
```sql
CREATE TABLE locations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  category_id INT NOT NULL,
  address VARCHAR(300) NOT NULL,
  phone VARCHAR(40) NULL,
  geom POINT NOT NULL SRID 4326,     -- WGS84 좌표
  extra JSON NULL,                   -- 원시칼럼 보관
  SPATIAL INDEX sidx_geom (geom)
)
```
- **특징**: MySQL의 공간 데이터 타입(POINT) 사용으로 지도 기반 검색 지원

#### `location_hours` - 운영시간 정보
```sql
CREATE TABLE location_hours (
  location_id BIGINT,
  weekday TINYINT,                   -- 0(일)~6(토)
  open_time TIME NULL,
  close_time TIME NULL,
  is_24h BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (location_id, weekday)
)
```

#### `location_tags` - 장소 태그 시스템
```sql
CREATE TABLE location_tags (
  location_id BIGINT,
  tag VARCHAR(60),                   -- "청년친화", "할인", "전통시장" 등
  PRIMARY KEY (location_id, tag)
)
```

#### `culture` - 문화 자산 데이터
```sql
CREATE TABLE culture (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  category ENUM('인물','전설','유래','역사','문화재') NOT NULL,
  title VARCHAR(300) NOT NULL,
  story MEDIUMTEXT NOT NULL,         -- 스토리텔링 콘텐츠
  haman_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```
- **역할**: AI 검색의 핵심 데이터, ChromaDB로 임베딩되어 의미 기반 검색 지원

### 🔹 5. 커뮤니티 시스템

#### `board_posts` - 자유게시판
```sql
CREATE TABLE board_posts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  author_user_id BIGINT NOT NULL,
  category ENUM('일상','맛집','추억','기타') NOT NULL,
  title VARCHAR(200) NOT NULL,
  content MEDIUMTEXT NOT NULL,
  images JSON NULL,                  -- 첨부 이미지 URL 배열
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  status ENUM('active','hidden','deleted') DEFAULT 'active'
)
```

#### `board_comments` - 댓글 시스템
```sql
CREATE TABLE board_comments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  author_user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id BIGINT NULL,     -- 대댓글 지원
  likes_count INT DEFAULT 0,
  status ENUM('active','hidden','deleted') DEFAULT 'active'
)
```

#### `likes` - 좋아요 시스템
```sql
CREATE TABLE likes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  target_type ENUM('post','comment') NOT NULL,
  target_id BIGINT NOT NULL,
  UNIQUE KEY uq_user_target (user_id, target_type, target_id)
)
```

### 🔹 6. 멘토링 및 의뢰 매칭

#### `community_requests` - 지역 의뢰 요청
```sql
CREATE TABLE community_requests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  author_user_id BIGINT NULL,        -- 비회원도 가능
  title VARCHAR(200) NOT NULL,
  detail TEXT NOT NULL,
  region VARCHAR(120),
  required_skills JSON NULL,         -- ["농업","간단 수리"] 등
  budget INT NULL,
  deadline DATE NULL,
  status ENUM('open','matched','closed','canceled') DEFAULT 'open'
)
```

#### `mentoring_offers` - 멘토링 제안
```sql
CREATE TABLE mentoring_offers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  mentor_user_id BIGINT NOT NULL,
  title VARCHAR(200),
  intro TEXT,
  skills JSON NULL,
  status ENUM('open','full','closed') DEFAULT 'open'
)
```

#### `matches` - 매칭 결과
```sql
CREATE TABLE matches (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  request_id BIGINT NULL,
  offer_id BIGINT NULL,
  user_id BIGINT NULL,
  status ENUM('proposed','accepted','rejected','completed') DEFAULT 'proposed'
)
```

#### `mentor_reviews` - 멘토 평가 시스템
```sql
CREATE TABLE mentor_reviews (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  mentor_user_id BIGINT NOT NULL,
  reviewer_user_id BIGINT NOT NULL,
  match_id BIGINT NULL,
  rating TINYINT NOT NULL,           -- 1-5점
  comment TEXT NULL
)
```

### 🔹 7. 메신저 시스템

#### `conversations` - 1:1 대화방
```sql
CREATE TABLE conversations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user1_id BIGINT NOT NULL,
  user2_id BIGINT NOT NULL,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user1_unread_count INT DEFAULT 0,
  user2_unread_count INT DEFAULT 0,
  status ENUM('active','blocked','deleted') DEFAULT 'active',
  UNIQUE KEY uq_users (user1_id, user2_id)
)
```

#### `conversation_messages` - 메시지 내용
```sql
CREATE TABLE conversation_messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  conversation_id BIGINT NOT NULL,
  sender_id BIGINT NOT NULL,
  message_type ENUM('text','image','file','system') DEFAULT 'text',
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE
)
```

### 🔹 8. 알림 시스템

#### `notifications` - 통합 알림 관리
```sql
CREATE TABLE notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  type ENUM('mission_complete','badge_earned','mentor_match','request_match','comment','like','weather','system') NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSON NULL,                    -- 관련 데이터 (ID, URL 등)
  is_read BOOLEAN DEFAULT FALSE
)
```

### 🔹 9. 목표 관리

#### `user_goals` - 사용자별 목표 설정
```sql
CREATE TABLE user_goals (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  goal_type ENUM('mission_count','skill_level','community_participation','mentor_sessions') NOT NULL,
  target_value INT NOT NULL,
  current_value INT DEFAULT 0,
  period ENUM('daily','weekly','monthly','yearly') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('active','completed','paused','canceled') DEFAULT 'active'
)
```

### 🔹 10. AI 챗봇 시스템

#### `chat_sessions` - 챗봇 대화 세션
```sql
CREATE TABLE chat_sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSON NULL
)
```

#### `chat_messages` - 챗봇 대화 내용
```sql
CREATE TABLE chat_messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id BIGINT NOT NULL,
  role ENUM('user','assistant','tool') NOT NULL,
  content MEDIUMTEXT NOT NULL,
  tokens INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### 🔹 11. 활동 로그 및 추적

#### `activity_logs` - 전체 활동 로그
```sql
CREATE TABLE activity_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  event_type VARCHAR(80) NOT NULL,    -- 'mission_completed','search','login'
  payload JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### `location_logs` - 위치 기록
```sql
CREATE TABLE location_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  geom POINT NOT NULL SRID 4326,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  SPATIAL INDEX sidx_loc (geom)
)
```

### 🔹 12. RAG 및 AI 검색

#### `data_sources` - 데이터 출처 관리
```sql
CREATE TABLE data_sources (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) UNIQUE,          -- 'haman_csv','haman_site','etc'
  description TEXT
)
```

#### `rag_documents` - ChromaDB 연동 매핑
```sql
CREATE TABLE rag_documents (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  source_table ENUM('culture','locations') NOT NULL,
  source_id BIGINT NOT NULL,         -- 해당 테이블의 PK
  collection_name VARCHAR(120) NOT NULL,
  chroma_doc_id VARCHAR(120) NOT NULL,
  embedding_model VARCHAR(160) NOT NULL,
  UNIQUE KEY uq_src (source_table, source_id, collection_name)
)
```

### 🔹 13. 기타 서비스 기능

#### `weather_cache` - 날씨 정보 캐시
```sql
CREATE TABLE weather_cache (
  id INT PRIMARY KEY AUTO_INCREMENT,
  region VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  temperature_min DECIMAL(4,1),
  temperature_max DECIMAL(4,1),
  weather_condition VARCHAR(50),
  description VARCHAR(200),
  UNIQUE KEY uq_region_date (region, date)
)
```

#### `announcements` - 앱 공지사항
```sql
CREATE TABLE announcements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content MEDIUMTEXT NOT NULL,
  type ENUM('notice','update','event','maintenance') NOT NULL,
  is_important BOOLEAN DEFAULT FALSE,
  start_date DATETIME NOT NULL,
  end_date DATETIME NULL,
  status ENUM('active','inactive') DEFAULT 'active'
)
```

## 🔗 주요 관계도

### 사용자 중심 관계
```
users (1) ←→ (1) user_profiles
users (1) ←→ (N) user_skills
users (1) ←→ (N) user_badges
users (1) ←→ (N) mission_assignments
```

### 미션 시스템 관계
```
missions (1) ←→ (N) mission_parts
missions (1) ←→ (N) mission_assignments
mission_assignments (1) ←→ (1) mission_progress
mission_assignments (1) ←→ (N) mission_part_progress
```

### 지역 데이터 관계
```
location_categories (1) ←→ (N) locations
locations (1) ←→ (N) location_hours
locations (1) ←→ (N) location_tags
```

### 커뮤니티 관계
```
board_posts (1) ←→ (N) board_comments
users (1) ←→ (N) likes
community_requests (1) ←→ (N) matches
mentoring_offers (1) ←→ (N) matches
```

## 🎯 핵심 특징

### 1. **하이브리드 DB 아키텍처**
- **MySQL**: 구조화된 데이터의 마스터 저장소
- **ChromaDB**: 의미 기반 검색을 위한 벡터 인덱스
- **연동**: `rag_documents` 테이블로 두 DB 간 매핑

### 2. **공간 데이터 지원**
- MySQL의 SPATIAL 인덱스 활용
- WGS84 좌표계(SRID 4326) 사용
- 지도 기반 검색 및 위치 서비스 지원

### 3. **유연한 확장성**
- JSON 필드 활용으로 스키마 변경 최소화
- ENUM 타입으로 데이터 무결성 보장
- 모듈화된 테이블 구조로 기능별 독립성

### 4. **성능 최적화**
- 적절한 인덱스 설계
- 외래키 제약조건으로 데이터 무결성
- 복합 인덱스로 쿼리 성능 향상

## 📊 통계

- **총 테이블 수**: 26개
- **사용자 관련**: 6개 테이블
- **미션 시스템**: 5개 테이블  
- **지역 데이터**: 5개 테이블
- **커뮤니티**: 4개 테이블
- **기타 서비스**: 6개 테이블

이 데이터베이스 구조는 함안군 귀향자 정착 지원 플랫폼의 모든 기능을 완벽하게 지원하며, 향후 확장에도 유연하게 대응할 수 있도록 설계되었습니다.