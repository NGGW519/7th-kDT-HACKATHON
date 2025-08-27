#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ChromaDB SQLite 파일 내용 확인 스크립트
"""

import sqlite3
import os
from pathlib import Path

def check_chroma_db():
    """ChromaDB SQLite 파일 내용 확인"""
    db_path = Path("chroma_db/chroma.sqlite3")
    
    if not db_path.exists():
        print(f"❌ 파일을 찾을 수 없습니다: {db_path}")
        return
    
    print(f"📁 파일 경로: {db_path.absolute()}")
    print(f"📊 파일 크기: {db_path.stat().st_size:,} bytes")
    
    try:
        # SQLite 연결
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # 테이블 목록 확인
        print("\n📋 테이블 목록:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        for table in tables:
            table_name = table[0]
            print(f"   - {table_name}")
            
            # 각 테이블의 레코드 수 확인
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"     레코드 수: {count:,}")
            
            # 테이블 스키마 확인
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            print(f"     컬럼: {[col[1] for col in columns]}")
        
        # collections 테이블이 있다면 컬렉션 정보 확인
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='collections';")
        if cursor.fetchone():
            print("\n🗂️  컬렉션 정보:")
            cursor.execute("SELECT * FROM collections")
            collections = cursor.fetchall()
            for collection in collections:
                print(f"   컬렉션: {collection}")
        
        # embeddings 관련 테이블 확인
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%embedding%';")
        embedding_tables = cursor.fetchall()
        if embedding_tables:
            print("\n🧠 임베딩 테이블:")
            for table in embedding_tables:
                table_name = table[0]
                cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                count = cursor.fetchone()[0]
                print(f"   - {table_name}: {count:,} 레코드")
        
        conn.close()
        print("\n✅ 데이터베이스 확인 완료")
        
    except Exception as e:
        print(f"❌ 데이터베이스 읽기 오류: {e}")

if __name__ == "__main__":
    check_chroma_db()