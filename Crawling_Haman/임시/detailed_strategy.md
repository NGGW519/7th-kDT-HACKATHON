# 상세 데이터베이스 구축 및 크롤링 실행 계획

CSV 파일들의 실제 컬럼과 내용을 분석한 결과를 바탕으로, 데이터 구축 및 보강을 위한 구체적이고 단계적인 실행 계획을 수립합니다.

## 1. 최종 데이터베이스 스키마

분석한 CSV 파일의 모든 정보를 효율적으로 담기 위해 초기 스키마를 다음과 같이 확장 및 구체화합니다.

*   **`locations` 테이블**: 모든 물리적 장소 정보
    *   `id` (PK, Auto-increment)
    *   `name` (VARCHAR): 장소명 (CSV의 `업소명`, `시설명`, `아파트 단지명` 등)
    *   `category_main` (VARCHAR): 대분류 (예: '식음료', '의료', '공공시설', '주거', '산업')
    *   `category_sub` (VARCHAR): 소분류 (예: '한식', '카페', '병원', '약국', '마을회관', '아파트')
    *   `address` (VARCHAR): 전체 주소 (CSV의 `주소`, `소재지` 등)
    *   `latitude` (DECIMAL): 위도 (데이터가 있는 경우 직접 입력, 없으면 지오코딩)
    *   `longitude` (DECIMAL): 경도 (데이터가 있는 경우 직접 입력, 없으면 지오코딩)
    *   `phone` (VARCHAR): 전화번호
    *   `capacity` (INTEGER): 수용 인원 (예: 지역아동센터의 `정원`)
    *   `area` (FLOAT): 면적 (예: 공동주택의 `연면적합계`)
    *   `opening_date` (DATE): 개업일/설치일 (예: 공동주택의 `사용승인일`)
    *   `haman_url` (VARCHAR): 함안군청 상세페이지 링크 (CSV의 `링크`, `상세페이지 링크`)
    *   `portal_map_url` (VARCHAR): 네이버/카카오 지도 상세페이지 링크 (크롤링으로 수집)
    *   `description` (TEXT): 상세 설명 (크롤링으로 수집)

*   **`culture` 테이블**: 인물, 전설, 공공미술 등 문화 정보
    *   `id` (PK, Auto-increment)
    *   `title` (VARCHAR): 이름 또는 제목 (CSV의 `이름`, `제목`, `작품명`)
    *   `category` (VARCHAR): 유형 ('인물', '전설', '공공미술')
    *   `story` (TEXT): 상세 내용 (CSV의 `설명`, `상세정보`)
    *   `related_location` (VARCHAR): 관련 장소 (공공미술의 `건축물위치` 등)
    *   `haman_url` (VARCHAR): 함안군청 상세페이지 링크 (CSV의 `링크`)

*   **`organizations` 테이블**: 자원봉사 단체 정보
    *   `id` (PK, Auto-increment)
    *   `name` (VARCHAR): 단체명
    *   `representative` (VARCHAR): 대표자명
    *   `member_count` (INTEGER): 회원수

*   **`reviews` 테이블**: 포털 지도 리뷰 정보 (크롤링으로 수집)
    *   `id` (PK, Auto-increment)
    *   `location_id` (FK, `locations.id`)
    *   `rating` (DECIMAL): 평점
    *   `content` (TEXT): 리뷰 내용
    *   `author` (VARCHAR): 작성자
    *   `source` (VARCHAR): 출처 (예: '카카오맵', '네이버지도')
    *   `created_at` (DATETIME): 리뷰 작성일

## 2. 데이터 통합(ETL) 실행 계획

데이터의 품질과 특성을 고려하여, 아래 순서대로 DB에 데이터를 적재(INSERT)합니다.

**Phase 1: 고품질 핵심 데이터 적재** (좌표, URL 정보가 포함된 데이터)

1.  **`맛집리스트.csv`, `카페리스트.csv` 처리**
    *   **Target Table**: `locations`
    *   **Action**: `음식점명`/`카페명` -> `name`, `주소` -> `address`, `위도` -> `latitude`, `경도` -> `longitude`, `상세페이지 링크` -> `haman_url` 컬럼에 직접 INSERT 합니다. `category_main`은 '식음료', `category_sub`는 '맛집'/'카페'로 지정합니다.
    *   **Benefit**: 지오코딩이 필요 없어 가장 빠르고 정확하게 위치 기반 데이터를 확보할 수 있습니다.

2.  **`인물.csv`, `전설.csv` 처리**
    *   **Target Table**: `culture`
    *   **Action**: `이름`/`제목` -> `title`, `설명`/`상세정보` -> `story`, `링크` -> `haman_url` 컬럼에 INSERT 합니다. `category`는 '인물'/'전설'로 지정합니다.

**Phase 2: 주소 기반 데이터 적재 및 지오코딩**

1.  **위치 기반 CSV 파일 그룹 처리**
    *   **Target Files**: `모범식당.csv`, `안심식당.csv`, `병의원정보.csv`, `주유소업.csv`, `이미용업체 현황.csv`, `안경업소 정보.csv`, `부동산중개업소 현황.csv`, `공동주택 현황.csv`, `경로당 현황.csv`, `마을회관 현황.csv`, `지역아동센터 정보.csv` 등
    *   **Target Table**: `locations`
    *   **Action**:
        1.  각 파일의 `업소명`, `주소`, `전화번호` 등 기본 정보를 `locations` 테이블의 해당 컬럼에 맞게 INSERT 합니다. 파일 종류에 따라 `category_main`, `category_sub`를 지정합니다. (예: `병의원정보.csv` -> '의료', '병원')
        2.  INSERT된 데이터 중 `latitude`가 NULL인 모든 행에 대해 `address` 컬럼을 기반으로 **지오코딩(Geocoding)**을 실행하여 위도, 경도 값을 UPDATE 합니다.

**Phase 3: 기타 데이터 적재**

1.  **`자원봉사단체현황.csv` 처리**
    *   **Target Table**: `organizations`
    *   **Action**: `단체명`, `단체대표`, `회원수`를 해당 컬럼에 INSERT 합니다.

2.  **`공공미술 현황.csv` 처리**
    *   **Target Table**: `culture`
    *   **Action**: `작품명` -> `title`, `건축물위치` -> `related_location`에 INSERT하고, `category`를 '공공미술'로 지정합니다.

**Phase 4: 데이터 중복 제거**

*   **Action**: `locations` 테이블에서 `name`과 `address`가 유사한 데이터를 검색하여 중복 여부를 확인합니다. (예: '대박식당'이 `맛집리스트`와 `안심식당`에 모두 있을 수 있음). 중복 확인 시, 하나의 레코드로 통합하고 정보를 합칩니다.

## 3. 데이터 보강을 위한 크롤링 전략

기본 데이터를 DB에 구축한 후, 아래 전략에 따라 데이터를 풍부하게 만듭니다.

**1순위: 함안군청 공식 페이지 크롤링 (상세 정보 확보)**

*   **Target**: `locations` 및 `culture` 테이블의 `haman_url` 컬럼에 값이 있는 모든 데이터.
*   **Action**: 해당 URL로 접속하여, 본문 내용을 크롤링한 후 `locations.description` 또는 `culture.story` 필드를 업데이트하여 상세 설명을 보강합니다.
*   **Benefit**: 공신력 있는 기관의 상세 정보를 확보하여 데이터의 질을 높입니다.

**2순위: 포털 지도 사이트 크롤링 (사용자 경험 데이터 확보)**

*   **Target**: `locations` 테이블의 모든 데이터.
*   **Action**:
    1.  `name`과 `address`를 조합하여 네이버 지도 또는 카카오 지도에서 검색합니다.
    2.  검색 결과 첫 번째 항목의 상세페이지로 이동하여 아래 정보를 크롤링합니다.
        *   **평점, 방문자 리뷰**: `reviews` 테이블에 저장합니다.
        *   **영업시간, 메뉴 정보**: `locations` 테이블의 `description`에 추가하거나 별도 컬럼을 만들어 저장합니다.
        *   **포털 지도 URL**: `locations.portal_map_url`에 저장하여 앱/웹에서 바로 연결할 수 있도록 합니다.
*   **Benefit**: 사용자의 실제 경험(리뷰, 평점) 데이터를 확보하여 서비스의 가치를 극대화합니다.

**3순위: `사이트맵.csv` 활용 (누락된 정보 탐색)**

*   **Target**: `사이트맵.csv` 또는 `사이트맵_링크만.csv`의 모든 URL.
*   **Action**: 해당 URL들을 순회하며, 아직 DB에 저장되지 않은 새로운 장소나 문화 정보가 있는지 확인하고, 발견 시 신규 데이터로 추가합니다.
