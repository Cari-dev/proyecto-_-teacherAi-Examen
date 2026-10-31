from functools import lru_cache
from pathlib import Path

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Configuración leída desde backend/.env y variables de entorno."""

    app_name: str = "TeacherAI"
    app_version: str = "0.1.0"
    environment: str = "development"
    database_url: str = f"sqlite:///{(BASE_DIR / 'teacherai.db').as_posix()}"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    teacher_name: str = "Docente"
    seed_demo_data: bool = True
    gemini_api_key: SecretStr = SecretStr("")
    gemini_model: str = "gemini-3.6-flash"

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def resolved_database_url(self) -> str:
        """Ancla las rutas SQLite relativas a la carpeta backend/."""
        prefix = "sqlite:///"
        if self.database_url.startswith(prefix):
            raw_path = self.database_url[len(prefix) :]
            if raw_path and raw_path != ":memory:" and not Path(raw_path).is_absolute():
                return f"{prefix}{(BASE_DIR / raw_path).as_posix()}"
        return self.database_url

    @property
    def gemini_api_key_value(self) -> str:
        return self.gemini_api_key.get_secret_value().strip()

    @property
    def assistant_mode(self) -> str:
        return "gemini" if self.gemini_api_key_value else "demo"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
