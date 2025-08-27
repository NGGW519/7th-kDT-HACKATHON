#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Step 1 (SRID fix): ensures WKT points are saved with SRID 4326.
"""

import csv
import pymysql
import sys
from pathlib import Path
from typing import Dict, Tuple, Optional

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "1111",
    "database": "hometown_on",
    "charset": "utf8mb4",
    "cursorclass": pymysql.cursors.DictCursor,
}

BASE_DIR = Path(__file__).parent

def get_conn():
    try:
        return pymysql.connect(**DB_CONFIG)
    except Exception as e:
        print(f"❌ DB connection failed: {e}")
        sys.exit(1)

def table_has_column(cursor, table: str, column: str) -> bool:
    cursor.execute("SHOW COLUMNS FROM `{}` LIKE %s".format(table), (column,))
    return cursor.fetchone() is not None

def ensure_location_categories_seed(conn):
    seeds = [
        ("식음료", "맛집"),
        ("식음료", "카페"),
        ("의료", "병원/의원"),
        ("공공시설", "경로당"),
        ("공공시설", "마을회관"),
    ]
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) AS c FROM location_categories")
        if cur.fetchone()["c"] == 0:
            cur.executemany(
                "INSERT INTO location_categories (main, sub) VALUES (%s, %s)",
                seeds,
            )
            print(f"🌱 Seeded location_categories: {len(seeds)} rows")

def build_category_map(conn) -> Dict[Tuple[str, str], int]:
    with conn.cursor() as cur:
        cur.execute("SELECT id, main, sub FROM location_categories")
        rows = cur.fetchall()
    return {(r["main"], r["sub"]): r["id"] for r in rows}

def file_exists(path: Path) -> bool:
    if not path.exists():
        print(f"⚠️  File not found: {path}")
        return False
    return True

def to_point_wkt(lat: Optional[str], lon: Optional[str]) -> str:
    DEFAULT_WKT = "POINT(35.5 128.4)"
    if not lat or not lon:
        return DEFAULT_WKT
    try:
        lat_f = float(lat)
        lon_f = float(lon)
        if 33 <= lat_f <= 39 and 124 <= lon_f <= 132:
            return f"POINT({lat_f} {lon_f})"
        else:
            print("   ⚠️  coord outside KR bounds → using default center")
            return DEFAULT_WKT
    except Exception:
        print("   ⚠️  invalid coord → using default center")
        return DEFAULT_WKT

def load_locations_csv(
    conn,
    file_name: str,
    main_cat: str,
    sub_cat: str,
    colmap: dict,
    use_category_id: bool,
    cat_map: Dict[Tuple[str, str], int],
):
    path = BASE_DIR / file_name
    if not file_exists(path):
        return 0

    print(f"\n📍 Loading: {file_name}  ({main_cat} / {sub_cat})")
    inserted = 0
    errors = 0
    category_id = cat_map.get((main_cat, sub_cat))
    if category_id is None and use_category_id:
        raise RuntimeError(f"Category not found in location_categories: ({main_cat}, {sub_cat})")

    with conn.cursor() as cur, open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader, 1):
            try:
                name = (row.get(colmap["name"]) or "").strip()
                address = (row.get(colmap["address"]) or "").strip()
                if not name or not address:
                    print(f"   ⚠️ row {i}: name/address missing → skip")
                    errors += 1
                    continue

                phone = (row.get(colmap.get("phone", "")) or "").strip() or None
                lat = (row.get(colmap.get("lat", "")) or "").strip()
                lon = (row.get(colmap.get("lon", "")) or "").strip()
                wkt = to_point_wkt(lon, lat)  # 'POINT(lon lat)'

                if use_category_id:
                    sql = (
                        "INSERT INTO locations (name, category_id, address, phone, geom) "
                        "VALUES (%s, %s, %s, %s, ST_GeomFromText(%s, 4326))"
                    )
                    cur.execute(sql, (name, category_id, address, phone, wkt))
                else:
                    sql = (
                        "INSERT INTO locations (name, category_main, category_sub, address, phone, geom) "
                        "VALUES (%s, %s, %s, %s, %s, ST_GeomFromText(%s, 4326))"
                    )
                    cur.execute(sql, (name, main_cat, sub_cat, address, phone, wkt))

                inserted += 1
            except Exception as e:
                print(f"   ❌ row {i} failed: {e}")
                errors += 1

    print(f"   ✅ inserted: {inserted}, errors: {errors}")
    return inserted

def load_culture_csv(conn, file_name: str, category: str, colmap: dict):
    path = BASE_DIR / file_name
    if not file_exists(path):
        return 0

    print(f"\n📚 Loading: {file_name}  (category={category})")
    inserted = 0
    errors = 0

    with conn.cursor() as cur, open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader, 1):
            try:
                title = (row.get(colmap["title"]) or "").strip()
                story = (row.get(colmap["story"]) or "").strip()
                url = (row.get(colmap.get("url", "")) or "").strip() or None
                if not title or not story:
                    print(f"   ⚠️ row {i}: title/story missing → skip")
                    errors += 1
                    continue
                sql = "INSERT INTO culture (title, category, story, haman_url) VALUES (%s, %s, %s, %s)"
                cur.execute(sql, (title, category, story, url))
                inserted += 1
            except Exception as e:
                print(f"   ❌ row {i} failed: {e}")
                errors += 1

    print(f"   ✅ inserted: {inserted}, errors: {errors}")
    return inserted

def main():
    print("🚀 Step 1 (SRID fix): Load Haman CSVs")
    conn = get_conn()
    total = 0
    try:
        with conn.cursor() as cur:
            has_cat_id = table_has_column(cur, "locations", "category_id")
            print(f"🔎 locations.category_id present? {has_cat_id}")

        cat_map = {}
        if has_cat_id:
            ensure_location_categories_seed(conn)
            cat_map = build_category_map(conn)

        print("\n📍 Loading location datasets...")
        total += load_locations_csv(
            conn,
            "경상남도_함안군_맛집리스트.csv",
            "식음료", "맛집",
            {"name": "음식점명", "address": "주소", "lat":"위도", "lon": "경도"},
            has_cat_id, cat_map
        )
        total += load_locations_csv(
            conn,
            "경상남도_함안군_카페리스트.csv",
            "식음료", "카페",
            {"name": "카페명", "address": "주소", "lat": "경도", "lon": "위도"},
            has_cat_id, cat_map
        )
        total += load_locations_csv(
            conn,
            "경상남도_함안군_병의원정보.csv",
            "의료", "병원/의원",
            {"name": "의료기관명", "address": "의료기관주소(도로명)", "phone": "의료기관전화번호"},
            has_cat_id, cat_map
        )
        total += load_locations_csv(
            conn,
            "경상남도_함안군_경로당 현황.csv",
            "공공시설", "경로당",
            {"name": "경로당명", "address": "주 소"},
            has_cat_id, cat_map
        )
        total += load_locations_csv(
            conn,
            "경상남도_함안군_마을회관 현황.csv",
            "공공시설", "마을회관",
            {"name": "마을회관명", "address": "주 소"},
            has_cat_id, cat_map
        )

        print("\n📚 Loading culture datasets...")
        total += load_culture_csv(
            conn,
            "경상남도_함안군_인물.csv",
            "인물",
            {"title": "이름", "story": "설명", "url": "링크"}
        )
        total += load_culture_csv(
            conn,
            "경상남도_함안군_전설.csv",
            "전설",
            {"title": "제목", "story": "상세정보", "url": "링크"}
        )

        conn.commit()
        print("\n🎉 Done. Inserted total rows:", total)
    except Exception as e:
        conn.rollback()
        print("❌ Error:", e)
        sys.exit(1)
    finally:
        conn.close()
        print("🔌 MySQL connection closed.")

if __name__ == "__main__":
    main()
