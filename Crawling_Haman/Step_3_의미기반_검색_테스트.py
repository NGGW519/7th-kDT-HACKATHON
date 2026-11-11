#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
rag_documents(pgvector)에 저장된 함안군 문화 데이터를 의미 기반으로 검색하는 테스트 스크립트
자연어 질의를 통해 관련 정보를 찾아주는 대화형 검색 시스템

실행 전: Step 2 로 임베딩이 저장되어 있어야 합니다.
"""

import os
import sys

import psycopg
from dotenv import load_dotenv
from openai import OpenAI
from psycopg.rows import dict_row

load_dotenv()

# Step 2 와 같은 MonoGPT 임베딩 모델 (.env 의 EMBEDDING_MODEL)
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
MONOGPT_BASE_URL = os.getenv("MONOGPT_BASE_URL", "https://monogpt.kr/api/monorouter/v1")

# === 설정 ===
DB_CONFIG = {
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': int(os.getenv('POSTGRES_PORT', 5432)),
    'user': os.getenv('POSTGRES_USER', 'postgres'),
    'password': os.getenv('POSTGRES_PASSWORD', ''),
    'dbname': os.getenv('POSTGRES_DB', 'hometown_on'),
}
COLLECTION_NAME = "haman_culture"

# 검색 예시 질문들
SAMPLE_QUERIES = [
    "함안의 유명한 인물은 누구인가요?",
    "함안에 전해지는 전설이나 이야기가 있나요?",
    "조선시대 함안과 관련된 이야기",
    "함안의 역사적 인물",
    "함안 지역의 민담이나 설화"
]

def to_pgvector(values) -> str:
    return "[" + ",".join(str(float(v)) for v in values) + "]"


def connect_vector_db():
    """DB 연결 후 저장된 문서 수와 임베딩 모델명을 확인한다."""
    print("🗄️  PostgreSQL 연결 중...")
    try:
        conn = psycopg.connect(**DB_CONFIG, row_factory=dict_row)
    except psycopg.Error as e:
        print(f"❌ 데이터베이스 연결 실패: {e}")
        sys.exit(1)

    row = conn.execute(
        """
        SELECT count(*) AS n, min(embedding_model) AS model, count(DISTINCT embedding_model) AS models
        FROM rag_documents WHERE collection_name = %s
        """,
        (COLLECTION_NAME,),
    ).fetchone()
    if row["n"] == 0:
        print("⚠️  저장된 데이터가 없습니다. 먼저 'Step_2_문화데이터_임베딩.py'를 실행해주세요.")
        sys.exit(1)
    if row["models"] > 1:
        print("⚠️  컬렉션에 여러 임베딩 모델이 섞여 있습니다. Step 2 를 다시 실행해주세요.")
        sys.exit(1)
    print(f"✅ 연결 성공 - 저장된 문서 수: {row['n']}")
    return conn, row["model"]


class ApiEmbedder:
    """질문을 MonoGPT 임베딩 모델로 벡터화한다."""

    def __init__(self, client: OpenAI, model: str):
        self.client, self.model = client, model

    def encode(self, text: str) -> list[float]:
        return self.client.embeddings.create(model=self.model, input=[text]).data[0].embedding


def load_embedding_model(stored_model):
    """저장된 벡터와 같은 모델인지 확인하고 임베딩 클라이언트를 만든다 (모델이 다르면 벡터를 비교할 수 없음)."""
    if stored_model != EMBEDDING_MODEL:
        print(f"⚠️  저장된 벡터의 모델({stored_model})이 현재 EMBEDDING_MODEL({EMBEDDING_MODEL})과 다릅니다.")
        print("    'Step_2_문화데이터_임베딩.py' 를 다시 실행해 현재 모델로 임베딩해주세요.")
        sys.exit(1)
    api_key = os.getenv("MONOGPT_API_KEY")
    if not api_key:
        print("❌ MONOGPT_API_KEY 가 설정되지 않았습니다. 루트 .env 를 확인하세요.")
        sys.exit(1)
    print(f"🤖 임베딩 모델: {EMBEDDING_MODEL} (MonoGPT)")
    return ApiEmbedder(OpenAI(api_key=api_key, base_url=MONOGPT_BASE_URL), EMBEDDING_MODEL)


def search_similar_content(conn, model, query_text, n_results=5):
    """의미 기반 검색 (코사인 거리 기준, 가까운 순)"""
    try:
        query_vector = to_pgvector(model.encode(query_text))
        return conn.execute(
            """
            SELECT source_id, content, doc_metadata, embedding <=> %s::vector AS distance
            FROM rag_documents
            WHERE collection_name = %s
            ORDER BY distance
            LIMIT %s
            """,
            (query_vector, COLLECTION_NAME, n_results),
        ).fetchall()
    except Exception as e:
        print(f"❌ 검색 중 오류 발생: {e}")
        return None


def display_search_results(results, query_text):
    """검색 결과를 보기 좋게 출력"""
    print(f"\n🔍 검색어: '{query_text}'")
    print("=" * 60)

    if not results:
        print("😔 관련된 내용을 찾지 못했습니다.")
        return

    for i, row in enumerate(results, 1):
        similarity_score = 1 - row['distance']  # 코사인 거리 → 코사인 유사도
        metadata = row['doc_metadata'] or {}

        print(f"\n📄 결과 {i} (유사도: {similarity_score:.3f})")
        print(f"   🏷️  카테고리: {metadata.get('category')}")
        print(f"   📝 제목: {metadata.get('title')}")
        print(f"   🆔 ID: culture_{row['source_id']}")

        # 문서 내용 출력 (너무 길면 줄임)
        for line in row['content'].split('\n'):
            if line.strip():
                print(f"   📖 {line[:100]}..." if len(line) > 100 else f"   📖 {line}")
        print("-" * 40)


def show_sample_queries():
    """예시 검색어 표시"""
    print("\n💡 검색 예시:")
    for i, query in enumerate(SAMPLE_QUERIES, 1):
        print(f"   {i}. {query}")
    print()

def interactive_search(conn, model):
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
            results = search_similar_content(conn, model, query)
            
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

def run_sample_searches(conn, model):
    """샘플 검색 실행"""
    print("\n🧪 샘플 검색 테스트 실행")
    print("=" * 60)
    
    for i, query in enumerate(SAMPLE_QUERIES[:3], 1):  # 처음 3개만 테스트
        print(f"\n🔍 샘플 검색 {i}/{3}")
        results = search_similar_content(conn, model, query, n_results=2)
        if results:
            display_search_results(results, query)
        
        input("\n⏸️  다음 검색을 보려면 Enter를 누르세요...")

def main():
    """메인 실행 함수"""
    print("🚀 함안군 문화 데이터 검색 시스템 시작")
    print("=" * 60)
    
    try:
        # 1. DB 연결 (저장된 임베딩 모델명 확인)
        conn, model_name = connect_vector_db()

        # 2. 같은 임베딩 모델 로드
        model = load_embedding_model(model_name)

        # 3. 실행 모드 선택
        print("\n📋 실행 모드를 선택하세요:")
        print("   1. 대화형 검색 (추천)")
        print("   2. 샘플 검색 테스트")
        print("   3. 둘 다 실행")
        
        while True:
            try:
                choice = input("\n선택 (1-3): ").strip()
                
                if choice == '1':
                    interactive_search(conn, model)
                    break
                elif choice == '2':
                    run_sample_searches(conn, model)
                    break
                elif choice == '3':
                    run_sample_searches(conn, model)
                    interactive_search(conn, model)
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