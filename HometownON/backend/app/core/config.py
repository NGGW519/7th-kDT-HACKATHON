import os
from pathlib import Path
from dotenv import load_dotenv

# 현 파일(config.py)의 위치를 기준으로 프로젝트 루트 디렉토리 경로를 계산합니다.
# (backend/app/core/ -> backend/app/ -> backend/ -> project root)
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

# .env 파일이 존재하면 로드합니다.
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
else:
    print(f"Warning: .env file not found at {ENV_PATH}")

# 환경 변수에서 데이터베이스 연결 정보를 가져옵니다.
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_NAME = os.getenv("DB_NAME", "hometown")

# SQLAlchemy 데이터베이스 URL을 구성합니다.
DATABASE_URL = f"mysql+mysqlclient://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

