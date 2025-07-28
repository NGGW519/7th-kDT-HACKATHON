# 해당 파일 실행시 폴더 바깥으로 꺼낸 후 실행 하시면 될듯

import chromadb
import os
import re
import pandas as pd

# --- 설정 ---
# CSV 파일이 있는 디렉토리 (load_to_chroma.py와 동일하게 설정)
CSV_DIRECTORY = 'C:\\SKN13_Documnet\\SKN_KDT\\지민 개인작업\\Haman'
# ChromaDB 컬렉션 이름
COLLECTION_NAME = "haman_data"
# 저장할 CSV 파일 이름
OUTPUT_CSV_FILE = "크로마파일확인.CSV"

# --- ChromaDB 클라이언트 초기화 ---
client = chromadb.PersistentClient(path="./chroma_db")

# 컬렉션 가져오기
collection = client.get_collection(name=COLLECTION_NAME)

print(f"컬렉션에 저장된 총 문서 수: {collection.count()}")

def get_category_from_filename(filename):
    """파일 이름에서 데이터 카테고리를 추출합니다."""
    # '경상남도 함안군_' 접두사 제거
    category = re.sub(r'^경상남도 함안군_', '', filename)
    # '_날짜.csv' 또는 '.csv' 확장자 제거
    category = re.sub(r'_\\d{8,}\\.csv$', '', category)
    category = re.sub(r'\\.csv$', '', category)
    # '_'를 공백으로 변환
    category = category.replace('_', ' ')
    return category.strip()

def save_all_data_to_csv():
    print("\n--- 모든 ChromaDB 데이터 CSV로 저장 시작 ---")
    
    # 모든 문서와 메타데이터 가져오기
    all_results = collection.get(
        ids=collection.get()['ids'], # 모든 ID를 가져와서 쿼리
        include=['documents', 'metadatas']
    )

    data_for_df = []
    if all_results['documents']:
        for i in range(len(all_results['documents'])):
            doc = all_results['documents'][i]
            meta = all_results['metadatas'][i]
            
            row_data = {"document": doc}
            row_data.update(meta)
            data_for_df.append(row_data)

    if data_for_df:
        df = pd.DataFrame(data_for_df)
        # CSV 파일 저장 (인코딩을 utf-8-sig로 설정하여 엑셀에서 한글 깨짐 방지)
        df.to_csv(OUTPUT_CSV_FILE, index=False, encoding='utf-8-sig')
        print(f"성공적으로 모든 데이터를 '{OUTPUT_CSV_FILE}' 파일로 저장했습니다.")
    else:
        print("저장할 데이터가 없습니다.")

if __name__ == '__main__':
    save_all_data_to_csv()
