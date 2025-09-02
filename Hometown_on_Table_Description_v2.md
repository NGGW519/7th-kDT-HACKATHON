
# Hometown_on 데이터베이스 테이블 설명서 v2 (2025-09-02)

>本文서는 최신 `Hometown_on.sql`을 기준으로 전 테이블(총 **36개**)의 목적/컬럼/키/인덱스/관계/운영 팁을 **아주 상세히** 정리한 업그레이드 문서입니다. v1 문서가 명시한 26개 테이블 대비 기능 범위가 크게 확장되었습니다.

---

## 0) 변경 요약 (v1 → v2)

- **테이블 수**: 26 → **36** (게시판/메신저/알림/리뷰/목표/날씨/공지 등 대폭 확장)
- **미션 스키마 보강**
  - `missions.mission_type`: `'exploration'|'bonding'|'career'` 3종
  - `missions.difficulty`: `'easy'|'medium'|'hard'` 3단계
  - `missions.status`: `'locked'|'today'|'completed'`
  - `mission_parts`/`mission_assignments`/`mission_progress`/`mission_part_progress` 연동 및 인덱스 정비
- **공간 데이터 강화**
  - `locations.geom`(SRID 4326) 및 `SPATIAL INDEX`, `location_logs.geom` 공간 인덱스
- **새로 추가된 기능성 테이블**
  - 커뮤니티: `board_posts`, `board_comments`, `likes`
  - 알림: `notifications`
  - 1:1 메신저: `conversations`, `conversation_messages`
  - 멘토 평가: `mentor_reviews`
  - 개인 목표: `user_goals`
  - 캐시/운영: `weather_cache`, `announcements`

> 본문 각 섹션은 “목적 → 컬럼 → 키/인덱스 → 비고/운영 팁 → 예시 쿼리” 순으로 요약합니다.

---

## 1) 사용자 & 프로필 & 계정 연동

### 1.1 `users` — 기본 계정
- **목적**: 로그인 계정 마스터
- **주요 컬럼**
  - `id` BIGINT PK (AUTO_INCREMENT)
  - `email` VARCHAR(255) **UNIQUE**
  - `password_hash` VARCHAR(255)
  - `phone` VARCHAR(30)
  - `created_at`, `updated_at` TIMESTAMP
- **운영 팁**
  - 이메일 **UNIQUE** 를 기준 인증/중복 체크
  - PII 열에 대한 마스킹/암호화 고려

### 1.2 `user_profiles` — 상세 프로필
- **목적**: 사용자 상세 속성, 멘토링 설정
- **주요 컬럼**: `user_id`(PK=FK→users), `display_name`, `profile_image`, `birth_year`, `gender('male'|'female'|'other')`, `home_region`, `target_region`, `preferences(JSON)`, `bio`, `mentor_available`, `mentor_hourly_rate`
- **키/인덱스**: PK=`user_id` (users FK)
- **운영 팁**: 가용 시간/관심사 등은 `preferences(JSON)`로 유연 확장

### 1.3 `social_accounts` — 소셜 로그인
- **목적**: Google/Kakao/Naver/Apple 연동
- **주요 컬럼**: `user_id`(FK), `provider('google'|'kakao'|'naver'|'apple')`, `provider_uid`
- **키/인덱스**: `UNIQUE(provider, provider_uid)`, FK→`users`

---

## 2) 스킬 & 배지

### 2.1 `skills` — 스킬 마스터
- **주요 컬럼**: `id` PK, `code` UNIQUE, `name`, `category`

### 2.2 `user_skills` — 사용자 보유 스킬 매핑
- **주요 컬럼**: `(user_id, skill_id)` **복합 PK**, `level`(1~5), `certified`
- **키/인덱스**: FK→`users`,`skills`

### 2.3 `badges` / 2.4 `user_badges`
- **주요 컬럼**
  - `badges`: `id` PK, `code` UNIQUE, `name`, `description`
  - `user_badges`: `(user_id, badge_id)` **복합 PK**, `awarded_at`

---

## 3) 미션 (Gamification)

### 3.1 `missions` — 미션 정의
- **목적**: 추천/수행 가능한 미션 카탈로그
- **주요 컬럼**
  - `id` PK, `code` UNIQUE, `title`
  - `mission_type` **ENUM**: `'exploration'|'bonding'|'career'`
  - `difficulty` **ENUM**: `'easy'|'medium'|'hard'`
  - `expected_minutes` SMALLINT, `tags` TEXT, `description` TEXT, `thumbnail_image` VARCHAR(500)
  - `status` **ENUM**: `'locked'|'today'|'completed'`
- **비고**: 상태 필드는 프론트의 “오늘의 미션/완료/잠금” 표현과 직결

### 3.2 `mission_parts` — 세부 단계
- **주요 컬럼**: `id` PK, `mission_id`(FK), `step_no`(TINYINT), `instruction`, `checklist(JSON)`
- **키/인덱스**: `UNIQUE(mission_id, step_no)`

### 3.3 `mission_assignments` — 사용자별 배정
- **주요 컬럼**: `id` PK, `user_id`(FK), `mission_id`(FK), `assigned_at`, `due_date`, `status('assigned'|'in_progress'|'completed'|'skipped'|'canceled')`, `context(JSON)`
- **인덱스**: `(user_id, status)`

### 3.4 `mission_progress` — 진행 집계(헤더)
- **주요 컬럼**: `assignment_id` **PK=FK→mission_assignments**, `progress_pct`, `started_at`, `completed_at`, `feedback`

### 3.5 `mission_part_progress` — 단계별 체크
- **주요 컬럼**: `(assignment_id, part_id)` **복합 PK**, `done`, `memo`, `done_at`
- **키/인덱스**: FK→`mission_assignments`, `mission_parts`

---

## 4) 지역 데이터 (Location & Culture)

### 4.1 `location_categories`
- **주요 컬럼**: `id` PK, `main`, `sub`; **UNIQUE(main, sub)**

### 4.2 `locations`
- **주요 컬럼**: `id` PK, `name`, `category_id`(FK), `address`, `phone`, `geom POINT SRID 4326`, `extra(JSON)`
- **인덱스**: `SPATIAL INDEX(geom)`, `idx_cat(category_id)`, `idx_name(name)`

### 4.3 `location_hours`
- **주요 컬럼**: `(location_id, weekday)` **복합 PK**, `open_time`, `close_time`, `is_24h`
- **키/인덱스**: FK→`locations`

### 4.4 `location_tags`
- **주요 컬럼**: `(location_id, tag)` **복합 PK**
- **인덱스**: `(tag)` 일반 인덱스, FK→`locations`

### 4.5 `culture`
- **주요 컬럼**: `id` PK, `category('인물'|'전설'|'유래'|'역사'|'문화재')`, `title`, `story`, `haman_url`, `created_at`
- **비고**: 임베딩 소스(의미 검색)로 활용

---

## 5) 커뮤니티 매칭

### 5.1 `community_requests` — 의뢰
- **주요 컬럼**: `id` PK, `author_user_id`(nullable FK), `title`, `detail`, `region`, `required_skills(JSON)`, `budget`, `deadline`, `status('open'|'matched'|'closed'|'canceled')`, `created_at`

### 5.2 `mentoring_offers` — 멘토 제안
- **주요 컬럼**: `id` PK, `mentor_user_id`(FK), `title`, `intro`, `skills(JSON)`, `status('open'|'full'|'closed')`, `created_at`

### 5.3 `matches` — 매칭 기록
- **주요 컬럼**: `id` PK, `request_id`(FK), `offer_id`(FK), `user_id`(FK), `status('proposed'|'accepted'|'rejected'|'completed')`, `created_at`

---

## 6) 상호작용/로그/메신저

### 6.1 `chat_sessions`
- **주요 컬럼**: `id` PK, `user_id`(nullable FK), `started_at`, `metadata(JSON)`

### 6.2 `chat_messages`
- **주요 컬럼**: `id` PK, `session_id`(FK), `role('user'|'assistant'|'tool')`, `content`, `tokens`, `created_at`
- **인덱스**: `(session_id, created_at)`

### 6.3 `activity_logs`
- **주요 컬럼**: `id` PK, `user_id`(FK), `event_type`, `payload(JSON)`, `created_at`
- **인덱스**: `(event_type, created_at)`

### 6.4 `location_logs`
- **주요 컬럼**: `id` PK, `user_id`(FK), `geom POINT SRID 4326`, `recorded_at`
- **인덱스**: `SPATIAL(geom)`, `(user_id, recorded_at)`

---

## 7) 게시판/알림/메신저(1:1)/리뷰/목표/운영

### 7.1 `board_posts` — 게시글
- **주요 컬럼**: `id` PK, `author_user_id`(FK), `category('일상'|'맛집'|'추억'|'기타')`, `title`, `content`, `images(JSON)`, `likes_count`, `comments_count`, `status('active'|'hidden'|'deleted')`, `created_at`, `updated_at`
- **인덱스**: `(category, created_at)`, `(author_user_id)`

### 7.2 `board_comments` — 댓글/대댓글
- **주요 컬럼**: `id` PK, `post_id`(FK), `author_user_id`(FK), `content`, `parent_comment_id`(self FK), `likes_count`, `status`, `created_at`
- **인덱스**: `(post_id, created_at)`

### 7.3 `likes` — 좋아요
- **주요 컬럼**: `id` PK, `user_id`(FK), `target_type('post'|'comment')`, `target_id`, `created_at`
- **키/인덱스**: `UNIQUE(user_id, target_type, target_id)`, `(target_type, target_id)`

### 7.4 `notifications` — 통합 알림
- **주요 컬럼**: `id` PK, `user_id`(FK), `type('mission_complete'|'badge_earned'|'mentor_match'|'request_match'|'comment'|'like'|'weather'|'system')`, `title`, `message`, `data(JSON)`, `is_read`, `created_at`
- **인덱스**: `(user_id, is_read, created_at)`

### 7.5 `conversations` / 7.6 `conversation_messages` — 1:1 메신저
- **conversations 주요 컬럼**: `id` PK, `user1_id`(FK), `user2_id`(FK), `last_message_at`, `user1_unread_count`, `user2_unread_count`, `status('active'|'blocked'|'deleted')`, `created_at`
- **키/인덱스**: `UNIQUE(user1_id, user2_id)`, `(user1_id, last_message_at)`, `(user2_id, last_message_at)`
- **conversation_messages 주요 컬럼**: `id` PK, `conversation_id`(FK), `sender_id`(FK), `message_type('text'|'image'|'file'|'system')`, `content`, `is_read`, `created_at`
- **인덱스**: `(conversation_id, created_at)`

### 7.7 `mentor_reviews` — 멘토 리뷰
- **주요 컬럼**: `id` PK, `mentor_user_id`(FK), `reviewer_user_id`(FK), `match_id`(nullable FK), `rating`(1~5), `comment`, `created_at`
- **인덱스**: `(mentor_user_id, rating)`

### 7.8 `user_goals` — 목표 관리
- **주요 컬럼**: `id` PK, `user_id`(FK), `goal_type('mission_count'|'skill_level'|'community_participation'|'mentor_sessions')`, `target_value`, `current_value`, `period('daily'|'weekly'|'monthly'|'yearly')`, `start_date`, `end_date`, `status('active'|'completed'|'paused'|'canceled')`

### 7.9 `weather_cache` — 날씨 캐시
- **주요 컬럼**: `id` PK, `region`, `date`, `temperature_min`, `temperature_max`, `weather_condition`, `description`
- **키/인덱스**: `UNIQUE(region, date)`

### 7.10 `announcements` — 공지
- **주요 컬럼**: `id` PK, `title`, `content`, `type('notice'|'update'|'event'|'maintenance')`, `is_important`, `start_date`, `end_date`, `status('active'|'inactive')`

---

## 8) RAG/임베딩 메타

### 8.1 `data_sources`
- **주요 컬럼**: `id` PK, `name` UNIQUE, `description`

### 8.2 `rag_documents`
- **주요 컬럼**: `id` PK, `source_table('culture'|'locations')`, `source_id`, `collection_name`, `chroma_doc_id`, `embedding_model`, `created_at`
- **키/인덱스**: `UNIQUE(source_table, source_id, collection_name)`, `(collection_name)`
- **운영 팁**: 재색인/삭제 추적 및 소스-벡터 매핑의 단일 진실원천(SSOT)

---

## 9) 관계 다이어그램(텍스트 표현)

- **사용자 중심**
  - `users` 1↔1 `user_profiles`
  - `users` 1↔N `user_skills`, `user_badges`, `mission_assignments`, `activity_logs`, `chat_sessions`, `likes`, `notifications`, `user_goals`, `mentor_reviews(mentor|reviewer)`

- **미션**
  - `missions` 1↔N `mission_parts`, `mission_assignments`
  - `mission_assignments` 1↔1 `mission_progress`, 1↔N `mission_part_progress`

- **지역**
  - `location_categories` 1↔N `locations`
  - `locations` 1↔N `location_hours`, `location_tags`

- **커뮤니티/메신저**
  - `board_posts` 1↔N `board_comments`
  - `conversations` 1↔N `conversation_messages`

- **매칭**
  - `community_requests` 1↔N `matches`
  - `mentoring_offers` 1↔N `matches`

---

## 10) 인덱싱 & 성능 팁 (실전)

- **시간순 정렬 최적화**
  - `board_posts(category, created_at)`, `conversation_messages(conversation_id, created_at)`, `notifications(user_id, is_read, created_at)`
- **공간 질의**
  - `locations`, `location_logs`의 `SPATIAL INDEX`를 활용해 반경 검색(예: ST_Distance_Sphere)
- **카운터 컬럼**
  - 게시글의 `likes_count`/`comments_count`는 이벤트 기반 증감(트리거나 애플리케이션 레벨 집계) 권장
- **파티셔닝/보관 정책**
  - `activity_logs`/`location_logs`는 보관 주기(예: 180일)와 아카이브 테이블 고려
- **JSON 필드 전략**
  - 스키마 변경 비용을 줄이되, 자주 조회하는 키는 정규화/인덱스 전환

---

## 11) 샘플 쿼리 (핵심 시나리오)

```sql
-- 1) 오늘의 미션 카드(미완료) 조회
SELECT m.id, m.title, m.difficulty, a.status
FROM mission_assignments a
JOIN missions m ON m.id = a.mission_id
WHERE a.user_id = ?
  AND m.status = 'today'
  AND a.status IN ('assigned','in_progress')
ORDER BY a.assigned_at DESC
LIMIT 10;

-- 2) 좌표 반경 2km 내 '맛집' 장소
SELECT l.id, l.name, l.address
FROM locations l
JOIN location_categories c ON c.id = l.category_id
WHERE c.sub = '맛집'
  AND ST_Distance_Sphere(l.geom, ST_SRID(Point(?, ?), 4326)) <= 2000;

-- 3) 1:1 대화 최근 메시지 목록
SELECT cm.conversation_id, MAX(cm.created_at) AS last_at, COUNT(*) AS cnt
FROM conversation_messages cm
WHERE cm.conversation_id IN (
  SELECT id FROM conversations WHERE user1_id = ? OR user2_id = ?
)
GROUP BY cm.conversation_id
ORDER BY last_at DESC;

-- 4) 공지(진행중) 노출
SELECT id, title, type, is_important
FROM announcements
WHERE status = 'active'
  AND NOW() BETWEEN start_date AND COALESCE(end_date, '2099-12-31')
ORDER BY is_important DESC, start_date DESC;
```

---

## 12) 데이터 사전 요약표 (컬럼 수/키만 집계)

> 상세 스키마는 각 섹션을 참조하세요.

| 테이블 | 주요 키/인덱스 요약 |
|---|---|
| users | PK(id), UNIQUE(email) |
| user_profiles | PK/FK(user_id→users) |
| social_accounts | PK(id), UNIQUE(provider, provider_uid), FK(user_id) |
| skills | PK(id), UNIQUE(code) |
| user_skills | PK(user_id, skill_id), FK(user_id, skill_id) |
| badges | PK(id), UNIQUE(code) |
| user_badges | PK(user_id, badge_id), FK(user_id, badge_id) |
| missions | PK(id), UNIQUE(code) |
| mission_parts | PK(id), UNIQUE(mission_id, step_no), FK(mission_id) |
| mission_assignments | PK(id), IDX(user_id, status), FK(user_id, mission_id) |
| mission_progress | PK/FK(assignment_id→mission_assignments) |
| mission_part_progress | PK(assignment_id, part_id), FK(assignment_id, part_id) |
| location_categories | PK(id), UNIQUE(main, sub) |
| locations | PK(id), SPATIAL(geom), IDX(category_id, name), FK(category_id) |
| location_hours | PK(location_id, weekday), FK(location_id) |
| location_tags | PK(location_id, tag), IDX(tag), FK(location_id) |
| culture | PK(id) |
| community_requests | PK(id), FK(author_user_id) |
| mentoring_offers | PK(id), FK(mentor_user_id) |
| matches | PK(id), FK(request_id, offer_id, user_id) |
| chat_sessions | PK(id), FK(user_id) |
| chat_messages | PK(id), IDX(session_id, created_at), FK(session_id) |
| activity_logs | PK(id), IDX(event_type, created_at), FK(user_id) |
| location_logs | PK(id), SPATIAL(geom), IDX(user_id, recorded_at), FK(user_id) |
| data_sources | PK(id), UNIQUE(name) |
| rag_documents | PK(id), UNIQUE(source_table, source_id, collection_name), IDX(collection_name) |
| board_posts | PK(id), IDX(category, created_at), IDX(author_user_id), FK(author_user_id) |
| board_comments | PK(id), IDX(post_id, created_at), FK(post_id, author_user_id, parent_comment_id) |
| likes | PK(id), UNIQUE(user_id, target_type, target_id), IDX(target_type, target_id), FK(user_id) |
| notifications | PK(id), IDX(user_id, is_read, created_at), FK(user_id) |
| conversations | PK(id), UNIQUE(user1_id, user2_id), IDX(user1_id, last_message_at), IDX(user2_id, last_message_at), FK(user1_id, user2_id) |
| conversation_messages | PK(id), IDX(conversation_id, created_at), FK(conversation_id, sender_id) |
| mentor_reviews | PK(id), IDX(mentor_user_id, rating), FK(mentor_user_id, reviewer_user_id, match_id) |
| user_goals | PK(id), FK(user_id) |
| weather_cache | PK(id), UNIQUE(region, date) |
| announcements | PK(id) |

---

## 13) 운영 체크리스트

- [ ] DDL 스키마 버전 태깅 및 마이그레이션 스크립트 분리
- [ ] 외래키 제약의 ON DELETE/UPDATE 정책 검토(현재는 기본 동작)
- [ ] 로그/메시지/알림 테이블 보관주기 설정
- [ ] 개인정보(전화, 위치, 대화) 최소보관 원칙 및 접근 로깅
- [ ] RAG 재색인 배치와 `rag_documents` 동기화 모니터링

---

**끝.**

