"""
TechPulse Newsletter — Configuration
All settings loaded from environment variables / .env file.
"""
from __future__ import annotations

from pathlib import Path
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict

# Look for .env in current directory or parent directory (root of project)
_ROOT_DIR = Path(__file__).resolve().parent.parent
_ENV_PATH = _ROOT_DIR / ".env" if (_ROOT_DIR / ".env").exists() else ".env"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_ENV_PATH,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── YouTube ───────────────────────────────────────────────────────────
    youtube_api_key: str = ""
    youtube_playlist_ids: str = ""   # comma-separated list
    youtube_playlist_names: str = "" # comma-separated, matches order above

    @property
    def playlist_ids(self) -> List[str]:
        return [p.strip() for p in self.youtube_playlist_ids.split(",") if p.strip()]

    @property
    def playlist_names(self) -> List[str]:
        return [n.strip() for n in self.youtube_playlist_names.split(",") if n.strip()]

    # ── Gemini ────────────────────────────────────────────────────────────
    gemini_api_key: str = ""

    # ── Database ─────────────────────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/techpulse"

    # ── Email ─────────────────────────────────────────────────────────────
    resend_api_key: str = ""
    from_email: str = "newsletter@example.com"
    from_name: str = "TechPulse Newsletter"

    # ── App ───────────────────────────────────────────────────────────────
    admin_password: str = "admin"
    frontend_url: str = "http://localhost:3000"

    # ── Scheduler ─────────────────────────────────────────────────────────
    # Default: every Friday at 11:30 UTC (5 PM IST)
    newsletter_cron_default: str = "30 11 * * 5"
    scheduler_timezone: str = "Asia/Kolkata"

    # ── Feature Flags ─────────────────────────────────────────────────────
    max_videos_per_edition: int = 20
    playlist_lookback_days: int = 7


@lru_cache
def get_settings() -> Settings:
    return Settings()
