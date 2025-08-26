# 함안군 프로젝트 데이터베이스 스키마 (SQL DDL)

## 1. 개요

이 문서는 함안군 정보 서비스 및 미션 추천 기능 구현을 위한 전체 데이터베이스 테이블을 생성하는 SQL DDL(Data Definition Language)을 포함합니다. 아래의 SQL 코드를 MySQL 환경에서 실행하면 프로젝트에 필요한 모든 테이블이 생성됩니다.

각 `CREATE TABLE` 구문에는 테이블과 주요 컬럼에 대한 설명 주석을 추가하여 이해를 돕도록 했습니다.

## 2. 테이블 생성 SQL

---

### 2.1. `locations` 테이블

함안군의 모든 물리적 장소(맛집, 카페, 병원, 공동주택, 마을회관 등) 정보를 저장하는 핵심 테이블입니다.

```sql
-- 만약 `locations` 테이블이 이미 존재하면 삭제합니다.
DROP TABLE IF EXISTS `locations`;

CREATE TABLE `locations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '장소 고유 ID',
    `name` VARCHAR(255) NOT NULL COMMENT '장소명',
    `category_main` VARCHAR(100) COMMENT '장소 대분류 (예: 식음료, 의료, 공공시설)',
    `category_sub` VARCHAR(100) COMMENT '장소 소분류 (예: 한식, 카페, 병원)',
    `address` VARCHAR(255) COMMENT '전체 주소',
    `geom` POINT NOT NULL COMMENT '좌표 정보 (경도, 위도 순서)',
    `phone` VARCHAR(50) COMMENT '전화번호',
    `haman_url` VARCHAR(255) COMMENT '함안군청 상세페이지 링크',
    `portal_map_url` VARCHAR(255) COMMENT '네이버/카카오 지도 링크 (크롤링 수집)',
    `description` TEXT COMMENT '장소 상세 설명 (크롤링 수집)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '데이터 생성일',
    
    -- 공간 검색 성능 향상을 위한 필수 인덱스
    SPATIAL INDEX `idx_geom` (`geom`)
) ENGINE=InnoDB COMMENT='함안군 모든 장소 정보';
```

---

### 2.2. `culture` 테이블

함안군의 인물, 전설, 공공미술 등 유/무형의 문화 정보를 저장합니다.

```sql
-- 만약 `culture` 테이블이 이미 존재하면 삭제합니다.
DROP TABLE IF EXISTS `culture`;

CREATE TABLE `culture` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '문화 정보 고유 ID',
    `title` VARCHAR(255) NOT NULL COMMENT '인물, 전설, 작품의 이름 또는 제목',
    `category` VARCHAR(100) COMMENT '유형 (인물, 전설, 공공미술)',
    `story` TEXT COMMENT '상세 내용 (인물 설명, 전설 이야기 등)',
    `related_location` VARCHAR(255) COMMENT '관련 장소명 또는 주소',
    `haman_url` VARCHAR(255) COMMENT '함안군청 상세페이지 링크',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '데이터 생성일'
) ENGINE=InnoDB COMMENT='함안군 문화(인물, 전설, 공공미술) 정보';
```

---

### 2.3. `organizations` 테이블

자원봉사단체 등 함안군 내의 다양한 단체 정보를 저장합니다.

```sql
-- 만약 `organizations` 테이블이 이미 존재하면 삭제합니다.
DROP TABLE IF EXISTS `organizations`;

CREATE TABLE `organizations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '단체 고유 ID',
    `name` VARCHAR(255) NOT NULL COMMENT '단체명',
    `representative` VARCHAR(100) COMMENT '대표자명',
    `member_count` INT COMMENT '회원수',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '데이터 생성일'
) ENGINE=InnoDB COMMENT='함안군 자원봉사단체 등 조직 정보';
```

---

### 2.4. `reviews` 테이블

`locations` 테이블의 각 장소에 대한 포털 사이트 리뷰 정보를 저장합니다.

```sql
-- 만약 `reviews` 테이블이 이미 존재하면 삭제합니다.
DROP TABLE IF EXISTS `reviews`;

CREATE TABLE `reviews` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '리뷰 고유 ID',
    `location_id` INT NOT NULL COMMENT 'locations 테이블의 외래키',
    `rating` DECIMAL(2, 1) COMMENT '평점 (예: 4.5)',
    `content` TEXT COMMENT '리뷰 내용',
    `author` VARCHAR(100) COMMENT '작성자',
    `source` VARCHAR(100) COMMENT '리뷰 출처 (예: 카카오맵, 네이버지도)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '데이터 생성일',
    
    -- `locations` 테이블과의 관계 설정
    FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='장소에 대한 리뷰 정보';
```

---

### 2.5. `missions` 테이블

사용자에게 제공될 미션 정보를 저장합니다. (신규 요구사항 반영)

```sql
-- 만약 `missions` 테이블이 이미 존재하면 삭제합니다.
DROP TABLE IF EXISTS `missions`;

CREATE TABLE `missions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '미션 고유 ID',
    `title` VARCHAR(255) NOT NULL COMMENT '미션 제목 (예: 함안 말이산고분군 방문하기)',
    `description` TEXT COMMENT '미션 상세 설명',
    `mission_type` VARCHAR(100) COMMENT '미션 유형 (예: visit, photo, quiz)',
    `location_id` INT COMMENT '미션과 관련된 장소 ID (locations 외래키, 선택사항)',
    `reward_points` INT DEFAULT 0 COMMENT '미션 완료 시 지급되는 포인트',
    `is_active` BOOLEAN DEFAULT TRUE COMMENT '미션 활성화 여부',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '데이터 생성일',

    -- `locations` 테이블과의 관계 설정 (장소 관련 미션일 경우)
    FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='사용자에게 제공될 미션 정보';
```
