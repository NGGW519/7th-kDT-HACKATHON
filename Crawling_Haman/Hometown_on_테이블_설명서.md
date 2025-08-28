# Hometown_on �����ͺ��̽� ���̺� ����

## ? ����

�� ������ �Ծȱ� ������ ���� ���� �÷��� **Hometown_on**�� MySQL �����ͺ��̽� ��Ű���� ���� �� �����Դϴ�. �� 26���� ���̺�� �����Ǿ� ������, ����� �������� AI ��� �˻����� ��� ���� ����� �����մϴ�.

## ?? ���̺� �з� �� ����

### ? 1. ����� ���� (User Management)

#### `users` - �⺻ ����� ����
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
- **����**: �÷����� �⺻ ����� ���� ����
- **�ٽ� �ʵ�**: �̸���, ��й�ȣ �ؽ�, ��ȭ��ȣ

#### `user_profiles` - ����� �� ������
```sql
CREATE TABLE user_profiles (
  user_id BIGINT PRIMARY KEY,
  display_name VARCHAR(80),
  profile_image VARCHAR(500) NULL,
  birth_year SMALLINT,
  gender ENUM('male','female','other') NULL,
  home_region VARCHAR(120),      -- ����/���� ����
  target_region VARCHAR(120),    -- ���� ��� ����
  preferences JSON NULL,         -- ���ɺо�/��ȣ ī�װ�
  bio TEXT NULL,                 -- �ڱ�Ұ�
  mentor_available BOOLEAN DEFAULT FALSE,
  mentor_hourly_rate INT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```
- **����**: ������� �� ���� �� ���� ���� ����
- **Ư¡**: ����/��������������� ������ Ư�� �ݿ�

#### `social_accounts` - �Ҽ� �α��� ����
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
- **����**: ����, īī��, ���̹��� ���� �Ҽ� �α��� ����

### ? 2. ��ų �� ���� �ý���

#### `skills` - ��ų ������ ���̺�
```sql
CREATE TABLE skills (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(64) UNIQUE,
  name VARCHAR(120),
  category VARCHAR(80)  -- ��: IT, ���, ����, ���� ��
)
```

#### `user_skills` - ����ں� ���� ��ų
```sql
CREATE TABLE user_skills (
  user_id BIGINT,
  skill_id BIGINT,
  level TINYINT,         -- 1~5 ���
  certified BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, skill_id)
)
```

#### `badges` - ���� ������ ���̺�
```sql
CREATE TABLE badges (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(64) UNIQUE,
  name VARCHAR(120),
  description TEXT
)
```

#### `user_badges` - ����ں� ȹ�� ����
```sql
CREATE TABLE user_badges (
  user_id BIGINT,
  badge_id BIGINT,
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, badge_id)
)
```

### ? 3. �̼� �ý��� (Gamification)

#### `missions` - �̼� ����
```sql
CREATE TABLE missions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(64) UNIQUE,
  title VARCHAR(200),
  mission_type ENUM('Ž����','��ȸ������','Ŀ������') NOT NULL,
  difficulty TINYINT DEFAULT 1,
  expected_minutes SMALLINT,
  tags JSON NULL,                 -- ["��δ�","����ȸ��","��ȭü��"] ��
  description TEXT,
  thumbnail_image VARCHAR(500) NULL
)
```
- **Ư¡**: 3���� �̼� �������� �پ��� ���� ��� ����

#### `mission_parts` - �̼� ���� �ܰ�
```sql
CREATE TABLE mission_parts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  mission_id BIGINT NOT NULL,
  step_no TINYINT NOT NULL,
  instruction TEXT,               -- ���� �ܰ� �ȳ�
  checklist JSON NULL,            -- üũ����Ʈ(����)
  UNIQUE KEY uq_mission_step(mission_id, step_no)
)
```

#### `mission_assignments` - ����ں� �̼� ����
```sql
CREATE TABLE mission_assignments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  mission_id BIGINT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATE NULL,
  status ENUM('assigned','in_progress','completed','skipped','canceled') DEFAULT 'assigned',
  context JSON NULL              -- ��õ �ٰ�
)
```

#### `mission_progress` - �̼� ���� ��Ȳ
```sql
CREATE TABLE mission_progress (
  assignment_id BIGINT PRIMARY KEY,
  progress_pct TINYINT DEFAULT 0,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  feedback TEXT NULL
)
```

#### `mission_part_progress` - ���� �ܰ躰 ���� ��Ȳ
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

### ? 4. ���� ������ (Location & Culture)

#### `location_categories` - ��� �з� ü��
```sql
CREATE TABLE location_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  main VARCHAR(50),           -- ��: '������','�Ƿ�','�����ü�'
  sub  VARCHAR(80),           -- ��: '����','ī��','����/�ǿ�','��δ�'
  UNIQUE KEY uq_main_sub(main, sub)
)
```

#### `locations` - ���� ��� ����
```sql
CREATE TABLE locations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  category_id INT NOT NULL,
  address VARCHAR(300) NOT NULL,
  phone VARCHAR(40) NULL,
  geom POINT NOT NULL SRID 4326,     -- WGS84 ��ǥ
  extra JSON NULL,                   -- ����Į�� ����
  SPATIAL INDEX sidx_geom (geom)
)
```
- **Ư¡**: MySQL�� ���� ������ Ÿ��(POINT) ������� ���� ��� �˻� ����

#### `location_hours` - ��ð� ����
```sql
CREATE TABLE location_hours (
  location_id BIGINT,
  weekday TINYINT,                   -- 0(��)~6(��)
  open_time TIME NULL,
  close_time TIME NULL,
  is_24h BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (location_id, weekday)
)
```

#### `location_tags` - ��� �±� �ý���
```sql
CREATE TABLE location_tags (
  location_id BIGINT,
  tag VARCHAR(60),                   -- "û��ģȭ", "����", "�������" ��
  PRIMARY KEY (location_id, tag)
)
```

#### `culture` - ��ȭ �ڻ� ������
```sql
CREATE TABLE culture (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  category ENUM('�ι�','����','����','����','��ȭ��') NOT NULL,
  title VARCHAR(300) NOT NULL,
  story MEDIUMTEXT NOT NULL,         -- ���丮�ڸ� ������
  haman_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```
- **����**: AI �˻��� �ٽ� ������, ChromaDB�� �Ӻ����Ǿ� �ǹ� ��� �˻� ����

### ? 5. Ŀ�´�Ƽ �ý���

#### `board_posts` - �����Խ���
```sql
CREATE TABLE board_posts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  author_user_id BIGINT NOT NULL,
  category ENUM('�ϻ�','����','�߾�','��Ÿ') NOT NULL,
  title VARCHAR(200) NOT NULL,
  content MEDIUMTEXT NOT NULL,
  images JSON NULL,                  -- ÷�� �̹��� URL �迭
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  status ENUM('active','hidden','deleted') DEFAULT 'active'
)
```

#### `board_comments` - ��� �ý���
```sql
CREATE TABLE board_comments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  author_user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id BIGINT NULL,     -- ���� ����
  likes_count INT DEFAULT 0,
  status ENUM('active','hidden','deleted') DEFAULT 'active'
)
```

#### `likes` - ���ƿ� �ý���
```sql
CREATE TABLE likes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  target_type ENUM('post','comment') NOT NULL,
  target_id BIGINT NOT NULL,
  UNIQUE KEY uq_user_target (user_id, target_type, target_id)
)
```

### ? 6. ���丵 �� �Ƿ� ��Ī

#### `community_requests` - ���� �Ƿ� ��û
```sql
CREATE TABLE community_requests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  author_user_id BIGINT NULL,        -- ��ȸ���� ����
  title VARCHAR(200) NOT NULL,
  detail TEXT NOT NULL,
  region VARCHAR(120),
  required_skills JSON NULL,         -- ["���","���� ����"] ��
  budget INT NULL,
  deadline DATE NULL,
  status ENUM('open','matched','closed','canceled') DEFAULT 'open'
)
```

#### `mentoring_offers` - ���丵 ����
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

#### `matches` - ��Ī ���
```sql
CREATE TABLE matches (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  request_id BIGINT NULL,
  offer_id BIGINT NULL,
  user_id BIGINT NULL,
  status ENUM('proposed','accepted','rejected','completed') DEFAULT 'proposed'
)
```

#### `mentor_reviews` - ���� �� �ý���
```sql
CREATE TABLE mentor_reviews (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  mentor_user_id BIGINT NOT NULL,
  reviewer_user_id BIGINT NOT NULL,
  match_id BIGINT NULL,
  rating TINYINT NOT NULL,           -- 1-5��
  comment TEXT NULL
)
```

### ? 7. �޽��� �ý���

#### `conversations` - 1:1 ��ȭ��
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

#### `conversation_messages` - �޽��� ����
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

### ? 8. �˸� �ý���

#### `notifications` - ���� �˸� ����
```sql
CREATE TABLE notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  type ENUM('mission_complete','badge_earned','mentor_match','request_match','comment','like','weather','system') NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSON NULL,                    -- ���� ������ (ID, URL ��)
  is_read BOOLEAN DEFAULT FALSE
)
```

### ? 9. ��ǥ ����

#### `user_goals` - ����ں� ��ǥ ����
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

### ? 10. AI ê�� �ý���

#### `chat_sessions` - ê�� ��ȭ ����
```sql
CREATE TABLE chat_sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSON NULL
)
```

#### `chat_messages` - ê�� ��ȭ ����
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

### ? 11. Ȱ�� �α� �� ����

#### `activity_logs` - ��ü Ȱ�� �α�
```sql
CREATE TABLE activity_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  event_type VARCHAR(80) NOT NULL,    -- 'mission_completed','search','login'
  payload JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### `location_logs` - ��ġ ���
```sql
CREATE TABLE location_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  geom POINT NOT NULL SRID 4326,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  SPATIAL INDEX sidx_loc (geom)
)
```

### ? 12. RAG �� AI �˻�

#### `data_sources` - ������ ��ó ����
```sql
CREATE TABLE data_sources (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) UNIQUE,          -- 'haman_csv','haman_site','etc'
  description TEXT
)
```

#### `rag_documents` - ChromaDB ���� ����
```sql
CREATE TABLE rag_documents (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  source_table ENUM('culture','locations') NOT NULL,
  source_id BIGINT NOT NULL,         -- �ش� ���̺��� PK
  collection_name VARCHAR(120) NOT NULL,
  chroma_doc_id VARCHAR(120) NOT NULL,
  embedding_model VARCHAR(160) NOT NULL,
  UNIQUE KEY uq_src (source_table, source_id, collection_name)
)
```

### ? 13. ��Ÿ ���� ���

#### `weather_cache` - ���� ���� ĳ��
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

#### `announcements` - �� ��������
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

## ? �ֿ� ���赵

### ����� �߽� ����
```
users (1) ��� (1) user_profiles
users (1) ��� (N) user_skills
users (1) ��� (N) user_badges
users (1) ��� (N) mission_assignments
```

### �̼� �ý��� ����
```
missions (1) ��� (N) mission_parts
missions (1) ��� (N) mission_assignments
mission_assignments (1) ��� (1) mission_progress
mission_assignments (1) ��� (N) mission_part_progress
```

### ���� ������ ����
```
location_categories (1) ��� (N) locations
locations (1) ��� (N) location_hours
locations (1) ��� (N) location_tags
```

### Ŀ�´�Ƽ ����
```
board_posts (1) ��� (N) board_comments
users (1) ��� (N) likes
community_requests (1) ��� (N) matches
mentoring_offers (1) ��� (N) matches
```

## ? �ٽ� Ư¡

### 1. **���̺긮�� DB ��Ű��ó**
- **MySQL**: ����ȭ�� �������� ������ �����
- **ChromaDB**: �ǹ� ��� �˻��� ���� ���� �ε���
- **����**: `rag_documents` ���̺�� �� DB �� ����

### 2. **���� ������ ����**
- MySQL�� SPATIAL �ε��� Ȱ��
- WGS84 ��ǥ��(SRID 4326) ���
- ���� ��� �˻� �� ��ġ ���� ����

### 3. **������ Ȯ�强**
- JSON �ʵ� Ȱ������ ��Ű�� ���� �ּ�ȭ
- ENUM Ÿ������ ������ ���Ἲ ����
- ���ȭ�� ���̺� ������ ��ɺ� ������

### 4. **���� ����ȭ**
- ������ �ε��� ����
- �ܷ�Ű ������������ ������ ���Ἲ
- ���� �ε����� ���� ���� ���

## ? ���

- **�� ���̺� ��**: 26��
- **����� ����**: 6�� ���̺�
- **�̼� �ý���**: 5�� ���̺�  
- **���� ������**: 5�� ���̺�
- **Ŀ�´�Ƽ**: 4�� ���̺�
- **��Ÿ ����**: 6�� ���̺�

�� �����ͺ��̽� ������ �Ծȱ� ������ ���� ���� �÷����� ��� ����� �Ϻ��ϰ� �����ϸ�, ���� Ȯ�忡�� �����ϰ� ������ �� �ֵ��� ����Ǿ����ϴ�.