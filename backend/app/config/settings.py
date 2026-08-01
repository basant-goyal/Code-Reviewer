"""
settings.py — Application Configuration
========================================
WHY THIS FILE EXISTS:
    Centralises every configurable value in one place.
    No other file should read from os.environ directly.
    If you need a new setting, add it here — one change, everywhere works.

HOW IT INTERACTS:
    - Imported by gemini_service.py to get GEMINI_API_KEY and REQUEST_TIMEOUT_SECONDS.
    - Imported by main.py to configure CORS and logging.
    - The module-level `settings` singleton is created once at startup.

KEY CONCEPT — pydantic-settings:
    pydantic-settings extends Pydantic's BaseModel so that field values
    are automatically read from environment variables (case-insensitive).
    When you write `settings.GEMINI_API_KEY`, Pydantic has already read
    the GEMINI_API_KEY variable from your .env file via python-dotenv.

    This means:
        1. You get automatic type coercion  (e.g. "60" → int).
        2. You get validation at startup     (missing key → crash immediately, not later).
        3. You get IDE autocompletion        (typed attributes, not dict lookups).
"""

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    All application settings.

    Pydantic reads these from environment variables automatically.
    The `model_config` block tells it to also load a .env file.
    """

    # ── Gemini ────────────────────────────────────────────────────────────
    GEMINI_API_KEY: str  # Required — will raise at startup if missing.
    GEMINI_MODEL: str = "gemini-flash-latest"  # Model alias pointing to stable Flash model quota pool.

    # ── CORS ──────────────────────────────────────────────────────────────
    # Stored as a comma-separated string in .env.
    # The validator below splits it into a Python list.
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v: str) -> str:
        # Keep as str here; we expose a property for the parsed list.
        return v

    @property
    def allowed_origins_list(self) -> list[str]:
        """Returns ALLOWED_ORIGINS as a Python list, splitting on commas."""
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    # ── Logging ───────────────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"

    # ── Request ───────────────────────────────────────────────────────────
    REQUEST_TIMEOUT_SECONDS: int = 60

    # ── Pydantic-settings config ──────────────────────────────────────────
    model_config = SettingsConfigDict(
        env_file=".env",          # Load from .env in the working directory.
        env_file_encoding="utf-8",
        case_sensitive=False,     # GEMINI_API_KEY and gemini_api_key are the same.
        extra="ignore",           # Silently ignore unknown env vars.
    )


# Module-level singleton.
# Import this object anywhere: `from app.config.settings import settings`
settings = Settings()
