import os
from dotenv import load_dotenv

# .env 파일 자동 로드
load_dotenv()

DB_CONFIG = {
    'host': os.getenv('MYSQL_HOST'),
    'user': os.getenv('MYSQL_USER'),
    'password': os.getenv('MYSQL_PASSWORD'),
    'database': os.getenv('MYSQL_DATABASE'),
    'port': int(os.getenv('MYSQL_PORT', 3306)),
    'charset': 'utf8mb4'
}

def get_db_config():
    return DB_CONFIG 