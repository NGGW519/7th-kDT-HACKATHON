#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ChromaDB에 저장된 함안군 문화 데이터를 의미 기반으로 검색하는 테스트 스크립트
자연어 질의를 통해 관련 정보를 찾아주는 대화형 검색 시스템
"""

import chromadb
from sentence_transformers import SentenceTransformer
import os
import sys
from pathlib import Path
import json

# === 설정 ===
CHROMA_PERSIST_DIR = Path(__file__).parent / "chroma_db"
CHROMA_COLLECTION_NAME = "haman_culture"

# 임베딩 모델들 (Step 2와 동일한 순서)
EMBEDDING_MODELS = [
    'jhgan/ko-sroberta-multitask',
    'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2',
    'sentence-transformers/all-MiniLM-L6-v2'
]

# 검색 예시 질문들
SAMPLE_QUERIES = [
    "함안의 유명한 인물은 누구인가요?",
    "함안에 전해지는 전설이나 이야기가 있나요?",
    "조선시대 함안과 관련된 이야기",
    "함안의 역사적 인물",
    "함안 지역의 민담이나 설화"
]

def load_embedding_model():
    """임베딩 모델 로드"""
    for model_name in EMBEDDING_MODELS:
        try:
            print(f"🤖 임베딩 모델 로딩: {model_name}")
            model = SentenceTransformer(model_name)
            print(f"✅ 모델 로드 성공")
            return model, model_name
        except Exception as e:
            print(f"⚠️  모델 로드 실패: {e}")
            continue
    
    print("❌ 모든 임베딩 모델 로드 실패")
    sys.exit(1)

def setup_chromadb():
    """ChromaDB 연결 설정"""
    print("🗄️  ChromaDB 연결 중...")
    
    if not CHROMA_PERSIST_DIR.exists():
        print(f"❌ ChromaDB 데이터 디렉토리를 찾을 수 없습니다: {CHROMA_PERSIST_DIR}")
        print("먼저 'Step_2_ChromaDB에_데이터_임베딩.py'를 실행해주세요.")
        sys.exit(1)
    
    try:
        client = chromadb.PersistentClient(path=str(CHROMA_PERSIST_DIR))
        collection = client.get_collection(name=CHROMA_COLLECTION_NAME)
        
        # 컬렉션 정보 확인
        count = collection.count()
        print(f"✅ ChromaDB 연결 성공 - 저장된 문서 수: {count}")
        
        if count == 0:
            print("⚠️  저장된 데이터가 없습니다.")
            sys.exit(1)
            
        return client, collection
        
    except Exception as e:
        print(f"❌ ChromaDB 연결 실패: {e}")
        sys.exit(1)

def search_similar_content(collection, model, query_text, n_results=5):
    """의미 기반 검색 수행"""
    try:
        # 검색어를 벡터로 변환
        query_embedding = model.encode(query_text).tolist()
        
        # ChromaDB에서 유사한 문서 검색
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            include=['documents', 'metadatas', 'distances']
        )
        
        return results
        
    except Exception as e:
        print(f"❌ 검색 중 오류 발생: {e}")
        return None

def display_search_results(results, query_text):
    """검색 결과를 보기 좋게 출력"""
    print(f"\n🔍 검색어: '{query_text}'")
    print("=" * 60)
    
    if not results or not results['ids'][0]:
        print("😔 관련된 내용을 찾지 못했습니다.")
        return
    
    for i, doc_id in enumerate(results['ids'][0]):
        distance = results['distances'][0][i]
        similarity_score = 1 - distance  # 거리를 유사도로 변환
        metadata = results['metadatas'][0][i]
        document = results['documents'][0][i]
        
        print(f"\n📄 결과 {i+1} (유사도: {similarity_score:.3f})")
        print(f"   🏷️  카테고리: {metadata['category']}")
        print(f"   📝 제목: {metadata['title']}")
        print(f"   🆔 ID: {doc_id}")
        
        # 문서 내용 출력 (너무 길면 줄임)
        content_lines = document.split('\n')
        for line in content_lines:
            if line.strip():
                if len(line) > 100:
                    print(f"   📖 {line[:100]}...")
                else:
                    print(f"   📖 {line}")
        print("-" * 40)

def show_sample_queries():
    """예시 검색어 표시"""
    print("\n💡 검색 예시:")
    for i, query in enumerate(SAMPLE_QUERIES, 1):
        print(f"   {i}. {query}")
    print()

def interactive_search(collection, model):
    """대화형 검색 인터페이스"""
    print("\n🎯 함안군 문화 데이터 의미 검색 시스템")
    print("=" * 60)
    print("자연어로 질문해보세요! (종료: 'exit' 또는 'quit')")
    
    show_sample_queries()
    
    search_count = 0
    
    while True:
        try:
            # 사용자 입력 받기
            query = input("\n❓ 검색어를 입력하세요: ").strip()
            
            # 종료 조건
            if query.lower() in ['exit', 'quit', '종료', '나가기']:
                print("👋 검색을 종료합니다.")
                break
            
            # 빈 입력 처리
            if not query:
                print("⚠️  검색어를 입력해주세요.")
                continue
            
            # 도움말 표시
            if query.lower() in ['help', '도움말', '예시']:
                show_sample_queries()
                continue
            
            # 검색 수행
            print("🔄 검색 중...")
            results = search_similar_content(collection, model, query)
            
            if results:
                display_search_results(results, query)
                search_count += 1
            else:
                print("❌ 검색에 실패했습니다.")
                
        except KeyboardInterrupt:
            print("\n\n👋 검색을 종료합니다.")
            break
        except Exception as e:
            print(f"❌ 오류 발생: {e}")
    
    print(f"\n📊 총 {search_count}번의 검색을 수행했습니다.")

def run_sample_searches(collection, model):
    """샘플 검색 실행"""
    print("\n🧪 샘플 검색 테스트 실행")
    print("=" * 60)
    
    for i, query in enumerate(SAMPLE_QUERIES[:3], 1):  # 처음 3개만 테스트
        print(f"\n🔍 샘플 검색 {i}/{3}")
        results = search_similar_content(collection, model, query, n_results=2)
        if results:
            display_search_results(results, query)
        
        input("\n⏸️  다음 검색을 보려면 Enter를 누르세요...")

def main():
    """메인 실행 함수"""
    print("🚀 함안군 문화 데이터 검색 시스템 시작")
    print("=" * 60)
    
    try:
        # 1. ChromaDB 연결
        client, collection = setup_chromadb()
        
        # 2. 임베딩 모델 로드
        model, model_name = load_embedding_model()
        print(f"🤖 사용 모델: {model_name}")
        
        # 3. 실행 모드 선택
        print("\n📋 실행 모드를 선택하세요:")
        print("   1. 대화형 검색 (추천)")
        print("   2. 샘플 검색 테스트")
        print("   3. 둘 다 실행")
        
        while True:
            try:
                choice = input("\n선택 (1-3): ").strip()
                
                if choice == '1':
                    interactive_search(collection, model)
                    break
                elif choice == '2':
                    run_sample_searches(collection, model)
                    break
                elif choice == '3':
                    run_sample_searches(collection, model)
                    interactive_search(collection, model)
                    break
                else:
                    print("⚠️  1, 2, 3 중에서 선택해주세요.")
                    
            except KeyboardInterrupt:
                print("\n👋 프로그램을 종료합니다.")
                break
        
        print("\n🎉 검색 시스템 종료")
        
    except Exception as e:
        print(f"❌ 시스템 오류: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()