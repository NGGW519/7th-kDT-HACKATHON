
import chromadb
from sentence_transformers import SentenceTransformer
import os

# --- 설정 ---
# ChromaDB 설정 (데이터를 저장했던 경로와 동일해야 함)
CHROMA_PERSIST_DIR = os.path.join(os.getcwd(), "chroma_db")
CHROMA_COLLECTION_NAME = "haman_culture"

# 사용할 임베딩 모델 설정 (데이터를 임베딩했던 모델과 동일해야 함)
EMBEDDING_MODEL = 'jhgan/ko-sroberta-multitask'

def query_chroma_db():
    """
    사용자로부터 검색어를 입력받아 ChromaDB에서 의미적으로 가장 유사한
    문화 데이터를 검색하여 보여줍니다.
    """
    # 1. ChromaDB 클라이언트 준비
    print("1. ChromaDB 클라이언트 준비 중...")
    if not os.path.exists(CHROMA_PERSIST_DIR):
        print(f"오류: ChromaDB 데이터 디렉터리({CHROMA_PERSIST_DIR})를 찾을 수 없습니다.")
        print("`embed_and_load_to_chroma.py`를 먼저 실행하여 데이터를 생성해주세요.")
        return
    
    try:
        client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        collection = client.get_collection(name=CHROMA_COLLECTION_NAME)
        print(f"성공: '{CHROMA_COLLECTION_NAME}' 컬렉션에 연결되었습니다.")
    except Exception as e:
        print(f"오류: ChromaDB에 연결하는 데 실패했습니다. {e}")
        return

    # 2. 임베딩 모델 불러오기
    print(f"2. 임베딩 모델({EMBEDDING_MODEL}) 로딩 중...")
    try:
        model = SentenceTransformer(EMBEDDING_MODEL)
        print("성공: 임베딩 모델을 성공적으로 불러왔습니다.")
    except Exception as e:
        print(f"오류: 임베딩 모델을 불러오는 데 실패했습니다. {e}")
        return

    print("\n--- 함안군 문화 데이터 의미 검색 --- (종료하려면 'exit' 입력)")

    # 3. 사용자 입력 및 검색 루프
    while True:
        query_text = input("\n검색어를 입력하세요: ")

        if query_text.lower() == 'exit':
            print("프로그램을 종료합니다.")
            break

        if not query_text.strip():
            print("검색어를 입력해주세요.")
            continue

        # 4. 사용자 검색어를 벡터로 변환
        query_embedding = model.encode(query_text).tolist()

        # 5. ChromaDB에 쿼리 실행
        try:
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=3  # 상위 3개 결과 요청
            )
            
            print("\n--- 검색 결과 ---")
            if not results['ids'][0]:
                print("관련된 내용을 찾지 못했습니다.")
                continue

            # 6. 결과 출력
            for i, doc_id in enumerate(results['ids'][0]):
                distance = results['distances'][0][i]
                metadata = results['metadatas'][0][i]
                document = results['documents'][0][i]
                
                print(f"\n[결과 {i+1}] (유사도 점수: {1-distance:.4f}) ")
                print(f"  - ID: {doc_id}")
                print(f"  - 원본: {metadata['source']} 테이블 (MySQL ID: {metadata['mysql_id']})")
                print(f"  - 카테고리: {metadata['category']}")
                # document의 내용이 너무 길면 일부만 출력
                print(f"  - 내용: {document[:150]}...")

        except Exception as e:
            print(f"검색 중 오류가 발생했습니다: {e}")

if __name__ == "__main__":
    query_chroma_db()
