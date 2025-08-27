#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ChromaDB SQLite 파일에 저장된 실제 데이터 내용 분석
"""

import sqlite3
import json
from pathlib import Path

def analyze_chroma_data():
    """ChromaDB에 저장된 실제 데이터 내용 분석"""
    db_path = Path("chroma_db/chroma.sqlite3")
    
    if not db_path.exists():
        print(f"❌ 파일을 찾을 수 없습니다: {db_path}")
        return
    
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        print("🔍 ChromaDB 저장된 데이터 분석")
        print("=" * 60)
        
        # 1. 컬렉션 정보 확인
        print("\n📂 컬렉션 정보:")
        cursor.execute("SELECT name, dimension FROM collections")
        collections = cursor.fetchall()
        for name, dimension in collections:
            print(f"   - 컬렉션명: {name}")
            print(f"   - 벡터 차원: {dimension}")
        
        # 2. 임베딩 큐에서 실제 데이터 확인
        print("\n📋 저장된 문서 데이터:")
        cursor.execute("""
            SELECT id, metadata, operation 
            FROM embeddings_queue 
            ORDER BY seq_id 
            LIMIT 10
        """)
        
        embeddings_data = cursor.fetchall()
        
        for i, (doc_id, metadata_json, operation) in enumerate(embeddings_data, 1):
            print(f"\n📄 문서 {i}:")
            print(f"   ID: {doc_id}")
            print(f"   작업: {operation}")
            
            # 메타데이터 파싱
            if metadata_json:
                try:
                    metadata = json.loads(metadata_json)
                    print(f"   메타데이터:")
                    for key, value in metadata.items():
                        if key == 'title':
                            print(f"     📝 제목: {value}")
                        elif key == 'category':
                            print(f"     🏷️  카테고리: {value}")
                        elif key == 'source':
                            print(f"     📊 출처: {value}")
                        elif key == 'mysql_id':
                            print(f"     🆔 MySQL ID: {value}")
                        else:
                            print(f"     {key}: {value}")
                except json.JSONDecodeError:
                    print(f"   메타데이터 파싱 오류: {metadata_json[:100]}...")
        
        # 3. 전문 검색 테이블에서 실제 텍스트 내용 확인
        print(f"\n📖 저장된 텍스트 내용 (처음 5개):")
        cursor.execute("""
            SELECT string_value 
            FROM embedding_fulltext_search 
            LIMIT 5
        """)
        
        texts = cursor.fetchall()
        for i, (text,) in enumerate(texts, 1):
            print(f"\n📄 텍스트 {i}:")
            # 텍스트가 너무 길면 앞부분만 표시
            if len(text) > 200:
                print(f"   {text[:200]}...")
            else:
                print(f"   {text}")
        
        # 4. 카테고리별 통계
        print(f"\n📊 카테고리별 통계:")
        cursor.execute("""
            SELECT metadata 
            FROM embeddings_queue
        """)
        
        all_metadata = cursor.fetchall()
        category_count = {}
        
        for (metadata_json,) in all_metadata:
            if metadata_json:
                try:
                    metadata = json.loads(metadata_json)
                    category = metadata.get('category', '미분류')
                    category_count[category] = category_count.get(category, 0) + 1
                except:
                    pass
        
        for category, count in category_count.items():
            print(f"   - {category}: {count}개")
        
        # 5. 총 데이터 요약
        cursor.execute("SELECT COUNT(*) FROM embeddings_queue")
        total_docs = cursor.fetchone()[0]
        
        print(f"\n📈 전체 요약:")
        print(f"   - 총 문서 수: {total_docs}개")
        print(f"   - 벡터 차원: {dimension}차원")
        print(f"   - 카테고리 수: {len(category_count)}개")
        
        conn.close()
        print("\n✅ 데이터 분석 완료")
        
    except Exception as e:
        print(f"❌ 데이터 분석 오류: {e}")

if __name__ == "__main__":
    analyze_chroma_data()