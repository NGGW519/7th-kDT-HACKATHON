# MySQL을 활용한 함안군 데이터베이스 구축 가이드

## 1. 개요

이 문서는 **MySQL**을 사용하여 함안군 데이터 프로젝트의 데이터베이스를 구축하는 방법을 상세히 안내하는 가이드입니다. MySQL의 특징과 기능을 최대한 활용하여, 수집된 데이터를 효율적으로 저장하고 특히 핵심 요구사항인 **위치 기반 검색 기능**을 효과적으로 구현하는 데 초점을 맞춥니다.

## 2. 왜 MySQL인가? (프로젝트 적합성 분석)

MySQL은 다음과 같은 이유로 이 프로젝트에 매우 적합한 선택입니다.

*   **압도적인 범용성과 생태계**: 세계에서 가장 널리 쓰이는 오픈소스 RDBMS로, 방대한 문서, 커뮤니티, 튜토리얼을 쉽게 찾아볼 수 있습니다. 문제 발생 시 해결책을 찾기 용이하며, 대부분의 클라우드 및 호스팅 환경에서 표준으로 지원합니다.

*   **검증된 안정성과 성능**: 수많은 대규모 서비스에서 검증된 안정성과 신뢰도를 바탕으로, 프로젝트의 정형 데이터를 다루는 데 전혀 부족함이 없습니다.

*   **충분한 공간 데이터 처리 능력**: MySQL은 버전 5.7부터 내장 공간 데이터 타입과 관련 함수를 지원합니다. 이를 통해 PostGIS와 같은 전문적인 확장을 설치하지 않고도, 프로젝트의 핵심적인 위치 기반 검색 기능을 충분히 구현할 수 있습니다.

    *   **예시 SQL 쿼리**: 특정 좌표(예: 함안군청) 반경 2km 내에 있는 모든 병원을 찾는 쿼리
    ```sql
    SELECT name, address, phone
    FROM locations
    WHERE category_sub = '병원' AND
          ST_Distance_Sphere(
              geom, -- POINT 타입의 좌표 저장 컬럼
              ST_PointFromText('POINT(128.4091 35.2762)') -- 기준점 (함안군청)
          ) <= 2000; -- 거리 (미터 단위)
    ```

## 3. MySQL 기반 테이블 스키마 설계

MySQL의 데이터 타입에 맞춰 스키마를 구체화합니다. 가장 큰 특징은 위치 좌표를 저장하기 위해 **`POINT`** 타입을 사용하는 것입니다.

*   **`locations` 테이블**
    *   `id` (INT, PK, AUTO_INCREMENT)
    *   `name` (VARCHAR(255))
    *   `category_main` (VARCHAR(100))
    *   `category_sub` (VARCHAR(100))
    *   `address` (VARCHAR(255))
    *   `geom` (**POINT**): 위도, 경도 좌표를 저장할 컬럼
    *   `phone` (VARCHAR(50))
    *   `haman_url` (VARCHAR(255))
    *   `description` (TEXT)
    *   ... (기타 필요한 컬럼들)

*   **`culture`, `organizations`, `reviews` 테이블**: 기존 스키마와 거의 동일하게 설계합니다.

## 4. 데이터베이스 구축 실행 계획

MySQL을 사용하여 데이터베이스를 구축하는 구체적인 절차는 다음과 같습니다.

**1단계: MySQL 서버 준비**
*   로컬 PC 또는 서버에 MySQL 서버를 설치하고 실행합니다.
*   데이터베이스 클라이언트(예: MySQL Workbench, DBeaver)를 설치하면 작업이 편리해집니다.

**2단계: 데이터베이스 및 테이블 생성**
*   프로젝트에서 사용할 데이터베이스를 생성합니다.
    ```sql
    CREATE DATABASE haman_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ```
*   `detailed_strategy.md`에 명시된 테이블들을 생성합니다. 이때, **공간 데이터 검색 성능 향상을 위해 `SPATIAL INDEX`를 반드시 추가해야 합니다.**

*   **`locations` 테이블 생성 예시 SQL**:
    ```sql
    CREATE TABLE locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category_main VARCHAR(100),
        category_sub VARCHAR(100),
        address VARCHAR(255),
        geom POINT NOT NULL, -- 좌표를 POINT 타입으로 지정
        phone VARCHAR(50),
        haman_url VARCHAR(255),
        description TEXT,
        SPATIAL INDEX(geom) -- 공간 인덱스 추가
    ) ENGINE=InnoDB;
    ```

**3단계: 데이터 적재 (ETL)**
*   `detailed_strategy.md`에 수립된 ETL 계획에 따라 CSV 데이터를 파싱하여 DB에 적재합니다.
*   데이터를 `locations` 테이블에 INSERT 할 때, 위도/경도 데이터를 `POINT()` 함수를 이용해 변환해야 합니다.
    *   **데이터 INSERT 예시 SQL**:
    ```sql
    -- 예시: 맛집리스트.csv의 한 행을 locations 테이블에 넣는 경우
    INSERT INTO locations (name, address, geom, ...)
    VALUES (
        '어떤 맛집', 
        '경상남도 함안군 ...', 
        POINT(128.4214, 35.2732), -- 경도(longitude), 위도(latitude) 순서
        ...
    );
    ```
*   **지오코딩**: 위/경도 좌표가 없는 데이터는 주소(`address`)를 기반으로 지오코딩을 수행하여 `POINT` 값을 계산하고, UPDATE 쿼리를 통해 채워 넣습니다.

**4단계: 데이터 활용**
*   데이터 적재가 완료되면, 위에서 소개한 `ST_Distance_Sphere`와 같은 공간 함수를 활용하여 다양한 위치 기반 검색 기능을 구현할 수 있습니다.

## 5. 결론

MySQL은 이 프로젝트의 요구사항을 충분히 만족시키는 **현실적이고 강력한 솔루션**입니다. 특히 내장된 공간 데이터 기능을 잘 활용하고 **공간 인덱스(`SPATIAL INDEX`)를 적용**한다면, 사용자에게 만족스러운 성능의 위치 기반 서비스를 제공할 수 있을 것입니다. 방대한 커뮤니티와 자료를 바탕으로 안정적으로 프로젝트를 완성해 나가시길 바랍니다.