CREATE DATABASE Hometown_on;
USE Hometown_on;
#########################################################
-- 사람/계정/역량/배지 
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  phone VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_profiles (
  user_id BIGINT PRIMARY KEY,
  display_name VARCHAR(80),
  profile_image VARCHAR(500) NULL,
  birth_year SMALLINT,
  gender ENUM('male','female','other') NULL,
  home_region VARCHAR(120),      -- 고향/귀향 지역(예: 경남 함안군)
  target_region VARCHAR(120),    -- 정착 희망 지역
  preferences JSON NULL,         -- 관심분야/선호 카테고리/가용시간 등
  bio TEXT NULL,
  mentor_available BOOLEAN DEFAULT FALSE,
  mentor_hourly_rate INT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE social_accounts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  provider ENUM('google','kakao','naver','apple') NOT NULL,
  provider_uid VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_provider_user(provider, provider_uid),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE skills (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(64) UNIQUE,
  name VARCHAR(120),
  category VARCHAR(80)  -- 예: IT, 농업, 돌봄, 교육 등
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_skills (
  user_id BIGINT,
  skill_id BIGINT,
  level TINYINT,         -- 1~5 등급
  certified BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, skill_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (skill_id) REFERENCES skills(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE badges (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(64) UNIQUE,
  name VARCHAR(120),
  description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_badges (
  user_id BIGINT,
  badge_id BIGINT,
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, badge_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (badge_id) REFERENCES badges(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
#########################################################
--  미션(추천/수행)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE mission_parts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  mission_id BIGINT NOT NULL,
  step_no TINYINT NOT NULL,
  instruction TEXT,               -- 세부 단계 안내
  checklist JSON NULL,            -- 체크리스트(선택)
  UNIQUE KEY uq_mission_step(mission_id, step_no),
  FOREIGN KEY (mission_id) REFERENCES missions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
#########################################################
-- 사용자에게 실제로 배정된 미션 인스턴스
CREATE TABLE mission_assignments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  mission_id BIGINT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATE NULL,
  status ENUM('assigned','in_progress','completed','skipped','canceled') DEFAULT 'assigned',
  context JSON NULL,              -- 추천 근거(장소/문화/이전행동 등)
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (mission_id) REFERENCES missions(id),
  INDEX (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE mission_progress (
  assignment_id BIGINT PRIMARY KEY,
  progress_pct TINYINT DEFAULT 0,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  feedback TEXT NULL,
  FOREIGN KEY (assignment_id) REFERENCES mission_assignments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE mission_part_progress (
  assignment_id BIGINT,
  part_id BIGINT,
  done BOOLEAN DEFAULT FALSE,
  memo TEXT NULL,
  done_at TIMESTAMP NULL,
  PRIMARY KEY (assignment_id, part_id),
  FOREIGN KEY (assignment_id) REFERENCES mission_assignments(id),
  FOREIGN KEY (part_id) REFERENCES mission_parts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
#########################################################
-- 지역 데이터(함안군 자료)
-- 카테고리 사전(대/소분류)
CREATE TABLE location_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  main VARCHAR(50),           -- 예: '식음료','의료','공공시설'
  sub  VARCHAR(80),           -- 예: '맛집','카페','병원/의원','경로당','마을회관'
  UNIQUE KEY uq_main_sub(main, sub)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 공간 포인트 (MySQL Spatial)
CREATE TABLE locations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  category_id INT NOT NULL,
  address VARCHAR(300) NOT NULL,
  phone VARCHAR(40) NULL,
  geom POINT NOT NULL SRID 4326,     -- WGS84
  extra JSON NULL,                   -- 원시칼럼 보관(출처/링크 등)
  FOREIGN KEY (category_id) REFERENCES location_categories(id),
  SPATIAL INDEX sidx_geom (geom),
  INDEX idx_cat (category_id),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE location_hours (
  location_id BIGINT,
  weekday TINYINT,                   -- 0(일)~6(토)
  open_time TIME NULL,
  close_time TIME NULL,
  is_24h BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (location_id, weekday),
  FOREIGN KEY (location_id) REFERENCES locations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE location_tags (
  location_id BIGINT,
  tag VARCHAR(60),
  PRIMARY KEY (location_id, tag),
  FOREIGN KEY (location_id) REFERENCES locations(id),
  INDEX (tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 스토리성 텍스트(임베딩 대상)
CREATE TABLE culture (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  category ENUM('인물','전설','유래','역사','문화재') NOT NULL,
  title VARCHAR(300) NOT NULL,
  story MEDIUMTEXT NOT NULL,
  haman_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 커뮤니티 매칭
CREATE TABLE community_requests (         -- 주민/지자체 의뢰
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  author_user_id BIGINT NULL,             -- 비회원 가능 시 NULL
  title VARCHAR(200) NOT NULL,
  detail TEXT NOT NULL,
  region VARCHAR(120),
  required_skills JSON NULL,              -- ["농업","간단 수리"] 등
  budget INT NULL,
  deadline DATE NULL,
  status ENUM('open','matched','closed','canceled') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE mentoring_offers (           -- 멘토 제안
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  mentor_user_id BIGINT NOT NULL,
  title VARCHAR(200),
  intro TEXT,
  skills JSON NULL,
  status ENUM('open','full','closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mentor_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE matches (                     -- 매칭 기록
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  request_id BIGINT NULL,
  offer_id BIGINT NULL,
  user_id BIGINT NULL,                     -- 특정 사용자 매칭(의뢰↔사용자)
  status ENUM('proposed','accepted','rejected','completed') DEFAULT 'proposed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES community_requests(id),
  FOREIGN KEY (offer_id)   REFERENCES mentoring_offers(id),
  FOREIGN KEY (user_id)    REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
#########################################################
-- 상호작용/로그
CREATE TABLE chat_sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSON NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE chat_messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id BIGINT NOT NULL,
  role ENUM('user','assistant','tool') NOT NULL,
  content MEDIUMTEXT NOT NULL,
  tokens INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id),
  INDEX (session_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE activity_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  event_type VARCHAR(80) NOT NULL,    -- e.g., 'mission_completed','search','login'
  payload JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX (event_type, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE location_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  geom POINT NOT NULL SRID 4326,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  SPATIAL INDEX sidx_loc (geom),
  INDEX (user_id, recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
#########################################################
-- RAG/임베딩 메타
CREATE TABLE data_sources (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) UNIQUE,              -- 'haman_csv','haman_site','etc'
  description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SQL 레코드 ↔ Chroma 문서ID 매핑(재색인/삭제/감사에 필요)
CREATE TABLE rag_documents (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  source_table ENUM('culture','locations') NOT NULL,
  source_id BIGINT NOT NULL,             -- 해당 테이블의 PK
  collection_name VARCHAR(120) NOT NULL, -- 예: 'haman_culture','haman_locations'
  chroma_doc_id VARCHAR(120) NOT NULL,
  embedding_model VARCHAR(160) NOT NULL, -- 사용 모델명
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_src (source_table, source_id, collection_name),
  INDEX (collection_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

#########################################################
-- 추가 필요 테이블들 (프론트엔드 요구사항 반영)

-- 1) 자유게시판 (일상/맛집/추억 카테고리)
CREATE TABLE board_posts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  author_user_id BIGINT NOT NULL,
  category ENUM('일상','맛집','추억','기타') NOT NULL,
  title VARCHAR(200) NOT NULL,
  content MEDIUMTEXT NOT NULL,
  images JSON NULL,                      -- 첨부 이미지 URL 배열
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  status ENUM('active','hidden','deleted') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_user_id) REFERENCES users(id),
  INDEX (category, created_at),
  INDEX (author_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) 게시글 댓글
CREATE TABLE board_comments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  author_user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id BIGINT NULL,         -- 대댓글용
  likes_count INT DEFAULT 0,
  status ENUM('active','hidden','deleted') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES board_posts(id),
  FOREIGN KEY (author_user_id) REFERENCES users(id),
  FOREIGN KEY (parent_comment_id) REFERENCES board_comments(id),
  INDEX (post_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) 좋아요 시스템
CREATE TABLE likes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  target_type ENUM('post','comment') NOT NULL,
  target_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_target (user_id, target_type, target_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4) 알림 시스템
CREATE TABLE notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  type ENUM('mission_complete','badge_earned','mentor_match','request_match','comment','like','weather','system') NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSON NULL,                        -- 관련 데이터 (ID, URL 등)
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX (user_id, is_read, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5) 1:1 메신저 시스템
CREATE TABLE conversations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user1_id BIGINT NOT NULL,
  user2_id BIGINT NOT NULL,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user1_unread_count INT DEFAULT 0,
  user2_unread_count INT DEFAULT 0,
  status ENUM('active','blocked','deleted') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users (user1_id, user2_id),
  FOREIGN KEY (user1_id) REFERENCES users(id),
  FOREIGN KEY (user2_id) REFERENCES users(id),
  INDEX (user1_id, last_message_at),
  INDEX (user2_id, last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE conversation_messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  conversation_id BIGINT NOT NULL,
  sender_id BIGINT NOT NULL,
  message_type ENUM('text','image','file','system') DEFAULT 'text',
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (sender_id) REFERENCES users(id),
  INDEX (conversation_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6) 멘토 평가 시스템
CREATE TABLE mentor_reviews (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  mentor_user_id BIGINT NOT NULL,
  reviewer_user_id BIGINT NOT NULL,
  match_id BIGINT NULL,                  -- 어떤 매칭에서 나온 리뷰인지
  rating TINYINT NOT NULL,               -- 1-5점
  comment TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mentor_user_id) REFERENCES users(id),
  FOREIGN KEY (reviewer_user_id) REFERENCES users(id),
  FOREIGN KEY (match_id) REFERENCES matches(id),
  INDEX (mentor_user_id, rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7) 사용자 목표 설정
CREATE TABLE user_goals (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  goal_type ENUM('mission_count','skill_level','community_participation','mentor_sessions') NOT NULL,
  target_value INT NOT NULL,
  current_value INT DEFAULT 0,
  period ENUM('daily','weekly','monthly','yearly') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('active','completed','paused','canceled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8) 날씨 정보 (캐시용)
CREATE TABLE weather_cache (
  id INT PRIMARY KEY AUTO_INCREMENT,
  region VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  temperature_min DECIMAL(4,1),
  temperature_max DECIMAL(4,1),
  weather_condition VARCHAR(50),
  description VARCHAR(200),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_region_date (region, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9) 앱 공지사항
CREATE TABLE announcements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content MEDIUMTEXT NOT NULL,
  type ENUM('notice','update','event','maintenance') NOT NULL,
  is_important BOOLEAN DEFAULT FALSE,
  start_date DATETIME NOT NULL,
  end_date DATETIME NULL,
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

#####################################################################################
-- 1) 카테고리별 건수
-- SELECT c.main, c.sub, COUNT(*) cnt
-- FROM locations l JOIN location_categories c ON l.category_id=c.id
-- GROUP BY c.main, c.sub;

-- -- 2) 좌표가 제대로 들어갔는지 (lat≈35.x, lon≈128.x)
-- SELECT l.name, ST_Latitude(l.geom)  AS lat, ST_Longitude(l.geom) AS lon
-- FROM locations l JOIN location_categories c ON l.category_id=c.id
-- WHERE c.sub IN ('카페','맛집') LIMIT 10;

-- -- 3) 전체 합계
-- SELECT (SELECT COUNT(*) FROM locations) AS locations_cnt,
--        (SELECT COUNT(*) FROM culture)   AS culture_cnt;