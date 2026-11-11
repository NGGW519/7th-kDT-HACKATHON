from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL


def _find_env_file() -> Path | None:
    """이 파일에서 상위 폴더로 올라가며 프로젝트 루트의 .env 를 찾는다.

    로컬에서는 저장소 루트의 .env 하나를 쓰고, Docker 에서는 파일이 없으므로
    (docker compose 가 넣어준 환경 변수를 사용) None 을 돌려준다.
    """
    for directory in Path(__file__).resolve().parents:
        candidate = directory / ".env"
        if candidate.is_file():
            return candidate
    return None


class Settings(BaseSettings):
    # LLM: MonoGPT 라우터 (OpenAI 호환 API). 앱의 모든 LLM 호출(챗봇, 미션 추천, 임베딩)이 여기를 쓴다.
    MONOGPT_API_KEY: str
    MONOGPT_BASE_URL: str = "https://monogpt.kr/api/monorouter/v1"
    LLM_MODEL: str = "gpt-5.4-mini"
    # 기본 모델 호출이 실패하면 순서대로 대신 시도할 모델 (쉼표 구분). 함께 장애가 나지 않도록 다른 회사 모델로 고른다.
    LLM_FALLBACK_MODELS: str = "claude-haiku-4.5"
    # 응답 최대 길이 (비용 상한 역할도 함)
    LLM_MAX_TOKENS: int = 1024

    # PostgreSQL (PostGIS + pgvector). 변수명은 공식 postgres 도커 이미지와 동일
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str = "hometown_on"

    # JWT (기본값 없음: 루트 .env 에 반드시 설정. 예: python -c "import secrets; print(secrets.token_urlsafe(48))")
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1주일

    # CORS (쉼표로 구분, "*" 이면 전체 허용)
    CORS_ORIGINS: str = "*"

    # Google 로그인: 앱의 GOOGLE_CLIENT_ID_WEB 과 같은 값. 서버는 앱이 보낸 ID 토큰을 이 값으로 검증한다.
    GOOGLE_CLIENT_ID_WEB: str = ""

    # 날씨(기상청 단기예보, 공공데이터포털 서비스키) / 좌표 -> 주소 변환(Google Geocoding API)
    # 비어 있으면 날씨 API 는 503 을 돌려주고, 주소는 '알 수 없는 위치' 로 표시된다.
    WEATHER_API_KEY: str = ""
    GOOGLEMAP_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=_find_env_file(),
        env_file_encoding="utf-8",
        extra="ignore",  # 같은 .env 에 있는 프론트엔드/스크립트용 변수는 무시
    )

    @property
    def database_url(self) -> URL:
        # URL.create 는 비밀번호의 특수문자(@, / 등)를 안전하게 처리한다
        return URL.create(
            drivername="postgresql+psycopg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_HOST,
            port=self.POSTGRES_PORT,
            database=self.POSTGRES_DB,
        )

    @property
    def llm_fallback_models(self) -> list[str]:
        """기본 모델을 뺀 대체 모델 목록 (중복 제거, 순서 유지)"""
        seen, out = {self.LLM_MODEL}, []
        for m in (m.strip() for m in self.LLM_FALLBACK_MODELS.split(",")):
            if m and m not in seen:
                seen.add(m)
                out.append(m)
        return out

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
