# 해당 파일 실행시 폴더 바깥으로 꺼낸 후 실행 하시면 될듯
# -*- coding: utf-8 -*-
import os
import pandas as pd
import chromadb
import re

# --- 설정 ---
# CSV 파일이 있는 디렉토리
CSV_DIRECTORY = 'C:\SKN13_Documnet\SKN_KDT\7th-kDT-HACKATHON\Crawling_Haman'
# ChromaDB 컬렉션 이름
COLLECTION_NAME = "haman_data"

# --- ChromaDB 클라이언트 초기화 ---
# 기본 설정으로 로컬 디스크에 데이터를 저장합니다.
client = chromadb.PersistentClient(path="./chroma_db")
# 컬렉션 생성 또는 가져오기
collection = client.get_or_create_collection(name=COLLECTION_NAME)

def get_category_from_filename(filename):
    """파일 이름에서 데이터 카테고리를 추출합니다."""
    # '경상남도 함안군_' 접두사 제거
    category = re.sub(r'^경상남도 함안군_', '', filename)
    # '_날짜.csv' 또는 '.csv' 확장자 제거
    category = re.sub(r'_\d{8,}\\.csv$', '', category)
    category = re.sub(r'\\.csv$', '', category)
    # '_'를 공백으로 변환
    category = category.replace('_', ' ')
    return category.strip()

def process_csv_files():
    """디렉토리의 모든 CSV 파일을 처리하여 ChromaDB에 저장합니다."""
    # 현재 디렉토리에서 .csv 파일 목록을 가져옵니다.
    csv_files = [f for f in os.listdir(CSV_DIRECTORY) if f.endswith('.csv')]
    print("Found CSV files:", csv_files)

    for filename in csv_files:
        file_path = os.path.join(CSV_DIRECTORY, filename)
        print(f"--- 처리 시작: {filename} ---")

        try:
            # 한글 인코딩 문제 해결을 위해 cp949와 utf-8을 모두 시도합니다.
            try:
                df = pd.read_csv(file_path, encoding='cp949')
            except UnicodeDecodeError:
                df = pd.read_csv(file_path, encoding='utf-8')
        except Exception as e:
            print(f"파일 읽기 오류: {filename}, 오류: {e}")
            continue

        # 데이터가 비어있는 경우 건너뜁니다.
        if df.empty:
            print("파일이 비어있어 건너뜁니다.")
            continue
            
        print(f"파일 {filename} 읽기 성공. 행 수: {len(df)}")

        # 컬럼 이름을 공백 제거 등 정리
        df.columns = [col.strip() for col in df.columns]

        documents = []
        metadatas = []
        ids = []
        
        category = get_category_from_filename(filename)

        for i, row in df.iterrows():
            # 문서(Document) 생성: 행의 모든 텍스트 정보를 결합하여 검색 대상이 될 문서를 만듭니다.
            # '명칭', '상호', '이름' 등 주요 식별자 컬럼을 우선적으로 사용합니다.
            main_identifier = ''
            for col_name in ['명칭', '상호', '이름', '음식점명', '카페명', '업소명']:
                if col_name in df.columns and pd.notna(row[col_name]):
                    main_identifier = str(row[col_name])
                    break
            
            # 주요 식별자가 없으면 첫 번째 컬럼을 사용
            if not main_identifier and pd.notna(row.iloc[0]):
                 main_identifier = str(row.iloc[0])

            document_text = f"{main_identifier} ({category})"
            
            # 메타데이터(Metadata) 생성: 검색 결과와 함께 제공될 추가 정보입니다.
            metadata = {str(k): str(v) for k, v in row.to_dict().items() if pd.notna(v)}
            metadata['source_file'] = filename
            metadata['category'] = category
            
            # 고유 ID 생성
            unique_id = f"{filename}_{i}"

            documents.append(document_text)
            metadatas.append(metadata)
            ids.append(unique_id)

        print(f"파일 {filename}에서 생성된 문서 수: {len(documents)}")

        # ChromaDB에 데이터 추가 (배치 처리)
        BATCH_SIZE = 5000  # ChromaDB의 최대 배치 크기보다 작게 설정
        if documents:
            for i in range(0, len(documents), BATCH_SIZE):
                batch_documents = documents[i:i + BATCH_SIZE]
                batch_metadatas = metadatas[i:i + BATCH_SIZE]
                batch_ids = ids[i:i + BATCH_SIZE]

                collection.add(
                    documents=batch_documents,
                    metadatas=batch_metadatas,
                    ids=batch_ids
                )
                print(f"성공적으로 {len(batch_documents)}개의 데이터를 추가했습니다. (배치 {i//BATCH_SIZE + 1})")
        else:
            print("추가할 데이터가 없습니다.")

if __name__ == '__main__':
    process_csv_files()
    print("\n--- 모든 작업이 완료되었습니다. ---")
    print(f"총 {collection.count()}개의 데이터가 '{COLLECTION_NAME}' 컬렉션에 저장되었습니다.")