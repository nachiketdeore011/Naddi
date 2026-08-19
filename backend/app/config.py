"""Application configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://nadi:nadi@localhost:5432/nadi_db"
    ml_service_url: str = "http://localhost:8001"
    debug: bool = False

    class Config:
        env_file = ".env"


settings = Settings()
