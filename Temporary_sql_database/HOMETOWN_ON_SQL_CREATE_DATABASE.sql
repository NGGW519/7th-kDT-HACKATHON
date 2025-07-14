-- 1. 기존 데이터베이스 삭제
-- DROP DATABASE IF EXISTS hometown_on;

-- 2. 데이터베이스 새로 생성
-- CREATE DATABASE  hometown_on
--   CHARACTER SET utf8mb4
--   COLLATE utf8mb4_unicode_ci;
-- USE hometown_on;

-- 3. 테이블 생성

-- USERS
CREATE TABLE users (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255)    NOT NULL UNIQUE,
  name          VARCHAR(100)    NOT NULL,
  birth_year    INT             NOT NULL,
  region        VARCHAR(100)    NOT NULL,
  adapt_score   FLOAT           NOT NULL DEFAULT 0.0,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SOCIAL ACCOUNTS
CREATE TABLE social_accounts (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id           BIGINT UNSIGNED NOT NULL,
  provider          VARCHAR(50)    NOT NULL,
  provider_user_id  VARCHAR(255)   NOT NULL,
  access_token      TEXT           NOT NULL,
  refresh_token     TEXT,
  expires_at        TIMESTAMP,
  created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sa_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- USER SKILLS
CREATE TABLE user_skills (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  skill         VARCHAR(100)    NOT NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_skill (user_id, skill),
  INDEX idx_us_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SKILL CERTIFICATIONS
CREATE TABLE skill_certifications (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  skill         VARCHAR(100)    NOT NULL,
  status        ENUM('승인','대기','거절') NOT NULL DEFAULT '대기',
  verified_at   TIMESTAMP,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sc_user (user_id),
  INDEX idx_sc_status (status),
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MISSIONS
CREATE TABLE missions (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(200)    NOT NULL,
  type          ENUM('탐색','유대','기부') NOT NULL,
  description   TEXT,
  start_at      TIMESTAMP,
  end_at        TIMESTAMP,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MISSION PARTS
CREATE TABLE mission_parts (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  mission_id    BIGINT UNSIGNED NOT NULL,
  part_order    INT             NOT NULL,
  title         VARCHAR(200)    NOT NULL,
  description   TEXT,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_mp_mission (mission_id),
  FOREIGN KEY (mission_id) REFERENCES missions(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- USER MISSION PROGRESS
CREATE TABLE user_mission_progress (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  mission_id    BIGINT UNSIGNED NOT NULL,
  status        ENUM('pending','active','completed') NOT NULL DEFAULT 'pending',
  started_at    TIMESTAMP,
  completed_at  TIMESTAMP,
  INDEX idx_ump_user (user_id),
  INDEX idx_ump_mission (mission_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (mission_id) REFERENCES missions(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- USER PART PROGRESS
CREATE TABLE user_part_progress (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  part_id       BIGINT UNSIGNED NOT NULL,
  status        ENUM('pending','completed') NOT NULL DEFAULT 'pending',
  started_at    TIMESTAMP,
  completed_at  TIMESTAMP,
  INDEX idx_upp_user (user_id),
  INDEX idx_upp_part (part_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (part_id) REFERENCES mission_parts(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- USER MISSIONS
CREATE TABLE user_missions (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  mission_id    BIGINT UNSIGNED NOT NULL,
  status        ENUM('완료','진행중') NOT NULL DEFAULT '진행중',
  feedback      TEXT,
  completed_at  TIMESTAMP,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_um_user_mission (user_id, mission_id),
  INDEX idx_um_user (user_id),
  INDEX idx_um_mission (mission_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (mission_id) REFERENCES missions(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BADGES
CREATE TABLE badges (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  title         VARCHAR(200)    NOT NULL,
  issued_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_bd_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- LOCATION LOGS
CREATE TABLE location_logs (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  mission_id    BIGINT UNSIGNED,
  latitude      DECIMAL(10,7)   NOT NULL,
  longitude     DECIMAL(10,7)   NOT NULL,
  recorded_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ll_user (user_id),
  INDEX idx_ll_mission (mission_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (mission_id) REFERENCES missions(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CHAT SESSIONS
CREATE TABLE chat_sessions (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  session_start TIMESTAMP       NOT NULL,
  session_end   TIMESTAMP,
  INDEX idx_cs_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CHAT MESSAGES
CREATE TABLE chat_messages (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  session_id    BIGINT UNSIGNED NOT NULL,
  sender        ENUM('user','ai') NOT NULL,
  message_text  TEXT           NOT NULL,
  message_order INT            NOT NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cm_session (session_id),
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

USE hometown_on;

SELECT * FROM users;
SELECT * FROM social_accounts;
SELECT * FROM user_skills;
SELECT * FROM skill_certifications;
SELECT * FROM missions;
SELECT * FROM mission_parts;
SELECT * FROM user_mission_progress;
SELECT * FROM user_part_progress;
SELECT * FROM user_missions;
SELECT * FROM badges;
SELECT * FROM location_logs;
SELECT * FROM chat_sessions;
SELECT * FROM chat_messages;