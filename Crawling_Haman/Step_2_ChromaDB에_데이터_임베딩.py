#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MySQL의 culture 테이블 데이터를 ChromaDB에 임베딩하여 저장하는 스크립트
한국어 특화 임베딩 모델을 사용하여 의미 기반 검색이 가능하도록 함
"""

import pymysql
import chromadb
from sentence_transformers import SentenceTransformer
import os
import sys
from pathlib import Path
import numpy as np

# === 설정 ===
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '1111',  # 실제 비밀번호로 변경하세요
    'database': 'hometown_on',
    'charset': 'utf8mb4'
}

# ChromaDB 설정
CHROMA_PERSIST_DIR = Path(__file__).parent / "chroma_db"
CHROMA_COLLECTION_NAME = "haman_culture"

# 한국어 특화 임베딩 모델들 (우선순위 순)
EMBEDDING_MODELS = [
    'jhgan/ko-sroberta-multitask',
    'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2',
    'sentence-transformers/all-MiniLM-L6-v2'
]

def get_db_connection():
    """데이터베이스 연결 생성"""
    try:
        connection = pymysql.connect(**DB_CONFIG)
        print("✅ MySQL 데이터베이스 연결 성공")
        return connection
    except pymysql.Error as e:
        print(f"❌ 데이터베이스 연결 실패: {e}")
        sys.exit(1)

def load_embedding_model():
    """임베딩 모델 로드 (여러 모델 시도)"""
    for model_name in EMBEDDING_MODELS:
        try:
            print(f"🤖 임베딩 모델 로딩 시도: {model_name}")
            model = SentenceTransformer(model_name)
            print(f"✅ 임베딩 모델 로드 성공: {model_name}")
            return model, model_name
        except Exception as e:
            print(f"⚠️  모델 로드 실패: {model_name} - {e}")
            continue
    
    print("❌ 모든 임베딩 모델 로드 실패")
    sys.exit(1)

def fetch_culture_data(connection):
    """MySQL에서 culture 데이터 가져오기"""
    print("📚 MySQL에서 culture 데이터 로딩...")
    
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = """
                SELECT id, title, story, category 
                FROM culture 
                WHERE story IS NOT NULL 
                AND story != '' 
                AND CHAR_LENGTH(story) > 10
                ORDER BY id
            """
            cursor.execute(sql)
            culture_data = cursor.fetchall()
            
        print(f"✅ 총 {len(culture_data)}개의 문화 데이터 로드 완료")
        return culture_data
        
    except pymysql.Error as e:
        print(f"❌ 데이터 조회 실패: {e}")
        sys.exit(1)

def setup_chromadb():
    """ChromaDB 클라이언트 및 컬렉션 설정"""
    print("🗄️  ChromaDB 설정 중...")
    
    try:
        # 디렉토리 생성
        CHROMA_PERSIST_DIR.mkdir(exist_ok=True)
        
        # 클라이언트 생성
        client = chromadb.PersistentClient(path=str(CHROMA_PERSIST_DIR))
        
        # 기존 컬렉션이 있으면 삭제 후 새로 생성
        try:
            client.delete_collection(name=CHROMA_COLLECTION_NAME)
            print("🗑️  기존 컬렉션 삭제")
        except:
            pass
        
        collection = client.create_collection(name=CHROMA_COLLECTION_NAME)
        print(f"✅ ChromaDB 컬렉션 '{CHROMA_COLLECTION_NAME}' 생성 완료")
        
        return client, collection
        
    except Exception as e:
        print(f"❌ ChromaDB 설정 실패: {e}")
        sys.exit(1)

def process_and_embed_data(culture_data, model, collection):
    """데이터 처리 및 임베딩 후 ChromaDB에 저장"""
    print("🔄 데이터 임베딩 및 저장 중...")
    
    documents = []
    metadatas = []
    ids = []
    
    # 데이터 전처리
    for item in culture_data:
        # 임베딩할 텍스트 생성 (제목과 내용 결합)
        full_text = f"제목: {item['title']}\n내용: {item['story']}"
        documents.append(full_text)
        
        # 메타데이터 생성
        metadatas.append({
            "source": "culture",
            "category": item['category'],
            "mysql_id": str(item['id']),
            "title": item['title']
        })
        
        # 고유 ID 생성
        ids.append(f"culture_{item['id']}")
    
    if not documents:
        print("⚠️  처리할 데이터가 없습니다.")
        return 0
    
    try:
        # 배치 단위로 임베딩 처리 (메모리 효율성)
        batch_size = 50
        total_processed = 0
        
        for i in range(0, len(documents), batch_size):
            batch_docs = documents[i:i+batch_size]
            batch_metas = metadatas[i:i+batch_size]
            batch_ids = ids[i:i+batch_size]
            
            print(f"   📊 배치 {i//batch_size + 1}/{(len(documents)-1)//batch_size + 1} 처리 중...")
            
            # 임베딩 생성
            embeddings = model.encode(batch_docs, show_progress_bar=False)
            
            # ChromaDB에 추가
            collection.add(
                embeddings=embeddings.tolist(),
                documents=batch_docs,
                metadatas=batch_metas,
                ids=batch_ids
            )
            
            total_processed += len(batch_docs)
            print(f"   ✅ {total_processed}/{len(documents)} 완료")
        
        print(f"🎉 총 {total_processed}개 벡터 데이터 저장 완료")
        return total_processed
        
    except Exception as e:
        print(f"❌ 임베딩 처리 실패: {e}")
        return 0

def verify_data(collection):
    """저장된 데이터 검증"""
    print("🔍 저장된 데이터 검증 중...")
    
    try:
        # 컬렉션 정보 확인
        count = collection.count()
        print(f"✅ 저장된 문서 수: {count}")
        
        # 샘플 데이터 확인
        if count > 0:
            sample = collection.peek(limit=3)
            print("📋 샘플 데이터:")
            for i, doc_id in enumerate(sample['ids']):
                metadata = sample['metadatas'][i]
                print(f"   - ID: {doc_id}")
                print(f"     제목: {metadata['title']}")
                print(f"     카테고리: {metadata['category']}")
        
        return count > 0
        
    except Exception as e:
        print(f"❌ 데이터 검증 실패: {e}")
        return False

def main():
    """메인 실행 함수"""
    print("🚀 ChromaDB 임베딩 작업 시작")
    print("=" * 50)
    
    # 1. 데이터베이스 연결
    connection = get_db_connection()
    
    try:
        # 2. 문화 데이터 로드
        culture_data = fetch_culture_data(connection)
        
        if not culture_data:
            print("⚠️  처리할 데이터가 없습니다.")
            return
        
        # 3. 임베딩 모델 로드
        model, model_name = load_embedding_model()
        
        # 4. ChromaDB 설정
        client, collection = setup_chromadb()
        
        # 5. 데이터 임베딩 및 저장
        processed_count = process_and_embed_data(culture_data, model, collection)
        
        # 6. 데이터 검증
        if verify_data(collection):
            print("\n" + "=" * 50)
            print(f"🎉 임베딩 작업 완료!")
            print(f"📊 처리된 데이터: {processed_count}개")
            print(f"🤖 사용된 모델: {model_name}")
            print(f"💾 저장 위치: {CHROMA_PERSIST_DIR}")
            print("=" * 50)
        else:
            print("❌ 데이터 검증 실패")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ 작업 중 오류 발생: {e}")
        sys.exit(1)
        
    finally:
        connection.close()
        print("🔌 데이터베이스 연결 종료")

if __name__ == "__main__":
    main()