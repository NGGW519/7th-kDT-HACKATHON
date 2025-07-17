-- MySQL용 DDL (DummyDB의 01~13번 insert SQL 파일과 호환)
-- 데이터베이스 생성 (필요시 주석 해제)
-- CREATE DATABASE hometown_on DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE hometown_on;

-- USERS
CREATE TABLE users (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255)    NOT NULL UNIQUE,
  name          VARCHAR(100)    NOT NULL,
  birth_year    INT             NOT NULL,
  region        VARCHAR(100)    NOT NULL,
  adapt_score   FLOAT           NOT NULL DEFAULT 0.0,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- SOCIAL ACCOUNTS
CREATE TABLE social_accounts (
  id                BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id           BIGINT          NOT NULL,
  provider          VARCHAR(50)     NOT NULL,
  provider_user_id  VARCHAR(255)    NOT NULL,
  access_token      TEXT            NOT NULL,
  refresh_token     TEXT,
  expires_at        DATETIME,
  created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX idx_sa_user ON social_accounts (user_id);

-- USER SKILLS
CREATE TABLE user_skills (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT          NOT NULL,
  skill         VARCHAR(100)    NOT NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_skill (user_id, skill),
  FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX idx_us_user ON user_skills (user_id);

-- SKILL CERTIFICATIONS
CREATE TABLE skill_certifications (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT          NOT NULL,
  skill         VARCHAR(100)    NOT NULL,
  status        VARCHAR(50)     NOT NULL DEFAULT '대기',
  verified_at   DATETIME,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX idx_sc_user ON skill_certifications (user_id);
CREATE INDEX idx_sc_status ON skill_certifications (status);

-- MISSIONS
CREATE TABLE missions (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(200)    NOT NULL,
  type          VARCHAR(50)     NOT NULL,
  description   TEXT,
  start_at      DATETIME,
  end_at        DATETIME,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- MISSION PARTS
CREATE TABLE mission_parts (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  mission_id    BIGINT          NOT NULL,
  part_order    INT             NOT NULL,
  title         VARCHAR(200)    NOT NULL,
  description   TEXT,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mission_id) REFERENCES missions(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX idx_mp_mission ON mission_parts (mission_id);

-- USER MISSION PROGRESS
CREATE TABLE user_mission_progress (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT          NOT NULL,
  mission_id    BIGINT          NOT NULL,
  status        VARCHAR(50)     NOT NULL DEFAULT 'pending',
  started_at    DATETIME,
  completed_at  DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (mission_id) REFERENCES missions(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX idx_ump_user ON user_mission_progress (user_id);
CREATE INDEX idx_ump_mission ON user_mission_progress (mission_id);

-- USER PART PROGRESS
CREATE TABLE user_part_progress (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT          NOT NULL,
  part_id       BIGINT          NOT NULL,
  status        VARCHAR(50)     NOT NULL DEFAULT 'pending',
  started_at    DATETIME,
  completed_at  DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (part_id) REFERENCES mission_parts(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX idx_upp_user ON user_part_progress (user_id);
CREATE INDEX idx_upp_part ON user_part_progress (part_id);

-- USER MISSIONS
CREATE TABLE user_missions (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT          NOT NULL,
  mission_id    BIGINT          NOT NULL,
  status        VARCHAR(50)     NOT NULL DEFAULT '진행중',
  feedback      TEXT,
  completed_at  DATETIME,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_mission (user_id, mission_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (mission_id) REFERENCES missions(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX idx_um_user ON user_missions (user_id);
CREATE INDEX idx_um_mission ON user_missions (mission_id);

-- BADGES
CREATE TABLE badges (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT          NOT NULL,
  title         VARCHAR(200)    NOT NULL,
  issued_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX idx_bd_user ON badges (user_id);

-- LOCATION LOGS
CREATE TABLE location_logs (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT          NOT NULL,
  mission_id    BIGINT,
  latitude      DECIMAL(10,7)   NOT NULL,
  longitude     DECIMAL(10,7)   NOT NULL,
  recorded_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (mission_id) REFERENCES missions(id) ON UPDATE CASCADE ON DELETE SET NULL
);
CREATE INDEX idx_ll_user ON location_logs (user_id);
CREATE INDEX idx_ll_mission ON location_logs (mission_id);

-- CHAT SESSIONS
CREATE TABLE chat_sessions (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT          NOT NULL,
  session_start DATETIME        NOT NULL,
  session_end   DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX idx_cs_user ON chat_sessions (user_id);

-- CHAT MESSAGES
CREATE TABLE chat_messages (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  session_id    BIGINT          NOT NULL,
  sender        VARCHAR(50)     NOT NULL,
  message_text  TEXT            NOT NULL,
  message_order INT             NOT NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX idx_cm_session ON chat_messages (session_id);
