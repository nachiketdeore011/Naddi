"""Application configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./nadi.db"
    ml_service_url: str = "http://localhost:8001"
    debug: bool = False
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
