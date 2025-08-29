from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # .env 파일에 정의된 변수명과 일치시킵니다.
    OPENAI_API_KEY: str

    # DB 관련 변수명 변경
    mysql_host: str
    mysql_port: int
    mysql_user: str
    mysql_password: str
    mysql_database: str

    # ChromaDB
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8000

    # JWT Settings
    SECRET_KEY: str = "a_very_secret_key_for_jwt"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # One week

    # model_config를 사용하여 추가 설정을 정의합니다 (Pydantic v2 스타일).
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra='ignore'  # .env 파일에 정의된 추가 변수들을 무시합니다.
    )

settings = Settings()