from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── Database ──────────────────────────────────────────
    DATABASE_URL: str

    # ── JWT Auth ──────────────────────────────────────────
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Gemini ────────────────────────────────────────────
    GEMINI_API_KEY: str

    # ── App ───────────────────────────────────────────────
    APP_NAME: str = "UCRIS API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]

    # ── Models ────────────────────────────────────────────
    MODELS_DIR: str = "../../models"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()