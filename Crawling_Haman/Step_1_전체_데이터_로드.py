#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Step 1: 함안군 CSV(장소/문화)를 PostgreSQL(PostGIS)에 적재한다.

- 장소 좌표는 geometry(Point, 4326) 로 저장한다. PostGIS 의 좌표 순서는 POINT(경도 위도).
- 일부 CSV 는 '위도'/'경도' 헤더가 서로 뒤바뀌어 있어(예: 맛집 리스트의 '위도' 열에 128.x),
  열 이름 대신 값의 범위(위도 33~39, 경도 124~132)로 위도/경도를 판별한다.
- 좌표가 없는 데이터(병원·경로당·마을회관)는 함안군 중심 좌표로 저장한다.
"""

import csv
import os
import sys
from pathlib import Path
from typing import Dict, Optional, Tuple

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

load_dotenv()

# DB 접속 정보는 .env 의 POSTGRES_* 값을 사용 (비밀번호를 코드에 넣지 않음)
DB_CONFIG = {
    "host": os.getenv("POSTGRES_HOST", "localhost"),
    "port": int(os.getenv("POSTGRES_PORT", 5432)),
    "user": os.getenv("POSTGRES_USER", "postgres"),
    "password": os.getenv("POSTGRES_PASSWORD", ""),
    "dbname": os.getenv("POSTGRES_DB", "hometown_on"),
}

BASE_DIR = Path(__file__).parent

# 좌표가 없거나 잘못된 경우 사용할 함안군 중심 (경도, 위도)
DEFAULT_LNG_LAT = (128.4, 35.5)
LAT_RANGE = (33.0, 39.0)    # 대한민국 위도 범위
LNG_RANGE = (124.0, 132.0)  # 대한민국 경도 범위

LOCATION_CATEGORIES = [
    ("식음료", "맛집"),
    ("식음료", "카페"),
    ("의료", "병원/의원"),
    ("공공시설", "경로당"),
    ("공공시설", "마을회관"),
]


def get_conn() -> psycopg.Connection:
    try:
        return psycopg.connect(**DB_CONFIG, row_factory=dict_row)
    except Exception as e:
        print(f"❌ DB connection failed: {e}")
        sys.exit(1)


def ensure_location_categories(conn) -> Dict[Tuple[str, str], int]:
    """필요한 카테고리를 (없으면) 만들고 (대분류, 소분류) → id 사전을 돌려준다."""
    with conn.cursor() as cur:
        cur.executemany(
            "INSERT INTO location_categories (main, sub) VALUES (%s, %s) ON CONFLICT (main, sub) DO NOTHING",
            LOCATION_CATEGORIES,
        )
        rows = cur.execute("SELECT id, main, sub FROM location_categories").fetchall()
    return {(r["main"], r["sub"]): r["id"] for r in rows}


def file_exists(path: Path) -> bool:
    if not path.exists():
        print(f"⚠️  File not found: {path}")
        return False
    return True


def parse_lng_lat(a: Optional[str], b: Optional[str]) -> Tuple[float, float]:
    """두 좌표 값 중 어느 쪽이 위도/경도인지 범위로 판별해 (경도, 위도)를 돌려준다."""
    if not a or not b:
        return DEFAULT_LNG_LAT
    try:
        x, y = float(a), float(b)
    except ValueError:
        print("   ⚠️  invalid coord → using default center")
        return DEFAULT_LNG_LAT

    def in_range(v, r):
        return r[0] <= v <= r[1]

    for lng, lat in ((x, y), (y, x)):
        if in_range(lng, LNG_RANGE) and in_range(lat, LAT_RANGE):
            return lng, lat
    print("   ⚠️  coord outside KR bounds → using default center")
    return DEFAULT_LNG_LAT


def load_locations_csv(conn, file_name: str, main_cat: str, sub_cat: str, colmap: dict,
                       cat_map: Dict[Tuple[str, str], int]) -> int:
    """colmap: name/address(필수), phone/coord_a/coord_b(선택) → CSV 열 이름."""
    path = BASE_DIR / file_name
    if not file_exists(path):
        return 0

    print(f"\n📍 Loading: {file_name}  ({main_cat} / {sub_cat})")
    category_id = cat_map[(main_cat, sub_cat)]
    inserted = errors = 0

    with conn.cursor() as cur, open(path, "r", encoding="utf-8-sig") as f:
        for i, row in enumerate(csv.DictReader(f), 1):
            name = (row.get(colmap["name"]) or "").strip()
            address = (row.get(colmap["address"]) or "").strip()
            if not name or not address:
                print(f"   ⚠️ row {i}: name/address missing → skip")
                errors += 1
                continue

            phone = (row.get(colmap.get("phone", "")) or "").strip() or None
            lng, lat = parse_lng_lat(row.get(colmap.get("coord_a", "")), row.get(colmap.get("coord_b", "")))
            try:
                with conn.transaction():  # 한 행이 실패해도 나머지는 계속 적재
                    cur.execute(
                        "INSERT INTO locations (name, category_id, address, phone, geom) "
                        "VALUES (%s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326))",
                        (name, category_id, address, phone, lng, lat),
                    )
                inserted += 1
            except Exception as e:
                print(f"   ❌ row {i} failed: {e}")
                errors += 1

    print(f"   ✅ inserted: {inserted}, errors: {errors}")
    return inserted


def load_culture_csv(conn, file_name: str, category: str, colmap: dict) -> int:
    path = BASE_DIR / file_name
    if not file_exists(path):
        return 0

    print(f"\n📚 Loading: {file_name}  (category={category})")
    inserted = errors = 0

    with conn.cursor() as cur, open(path, "r", encoding="utf-8-sig") as f:
        for i, row in enumerate(csv.DictReader(f), 1):
            title = (row.get(colmap["title"]) or "").strip()
            story = (row.get(colmap["story"]) or "").strip()
            url = (row.get(colmap.get("url", "")) or "").strip() or None
            if not title or not story:
                print(f"   ⚠️ row {i}: title/story missing → skip")
                errors += 1
                continue
            try:
                with conn.transaction():
                    cur.execute(
                        "INSERT INTO culture (title, category, story, haman_url) VALUES (%s, %s, %s, %s)",
                        (title, category, story, url),
                    )
                inserted += 1
            except Exception as e:
                print(f"   ❌ row {i} failed: {e}")
                errors += 1

    print(f"   ✅ inserted: {inserted}, errors: {errors}")
    return inserted


def main():
    print("🚀 Step 1: Load Haman CSVs into PostgreSQL")
    conn = get_conn()
    total = 0
    try:
        cat_map = ensure_location_categories(conn)

        print("\n📍 Loading location datasets...")
        # coord_a / coord_b: 좌표가 들어 있는 두 열 (순서 무관, 값 범위로 위도/경도 판별)
        total += load_locations_csv(
            conn, "경상남도_함안군_맛집리스트.csv", "식음료", "맛집",
            {"name": "음식점명", "address": "주소", "coord_a": "위도", "coord_b": "경도"}, cat_map,
        )
        total += load_locations_csv(
            conn, "경상남도_함안군_카페리스트.csv", "식음료", "카페",
            {"name": "카페명", "address": "주소", "coord_a": "위도", "coord_b": "경도"}, cat_map,
        )
        total += load_locations_csv(
            conn, "경상남도_함안군_병의원정보.csv", "의료", "병원/의원",
            {"name": "의료기관명", "address": "의료기관주소(도로명)", "phone": "의료기관전화번호"}, cat_map,
        )
        total += load_locations_csv(
            conn, "경상남도_함안군_경로당 현황.csv", "공공시설", "경로당",
            {"name": "경로당명", "address": "주 소"}, cat_map,
        )
        total += load_locations_csv(
            conn, "경상남도_함안군_마을회관 현황.csv", "공공시설", "마을회관",
            {"name": "마을회관명", "address": "주 소"}, cat_map,
        )

        print("\n📚 Loading culture datasets...")
        total += load_culture_csv(
            conn, "경상남도_함안군_인물.csv", "인물", {"title": "이름", "story": "설명", "url": "링크"},
        )
        total += load_culture_csv(
            conn, "경상남도_함안군_전설.csv", "전설", {"title": "제목", "story": "상세정보", "url": "링크"},
        )

        conn.commit()
        print("\n🎉 Done. Inserted total rows:", total)
    except Exception as e:
        conn.rollback()
        print("❌ Error:", e)
        sys.exit(1)
    finally:
        conn.close()
        print("🔌 PostgreSQL connection closed.")


if __name__ == "__main__":
    main()
