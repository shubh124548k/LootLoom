"""LootLoom backend settings.

Environment-driven configuration. Three concrete subclasses
(``DevelopmentConfig``, ``TestingConfig``, ``ProductionConfig``) tune the
base :class:`Config` for each runtime. ``get_config()`` picks the right
one based on ``FLASK_ENV``.

No secrets are hardcoded — every sensitive value is read from the
environment via :mod:`os`.
"""
from __future__ import annotations

import os
from typing import Type

from dotenv import load_dotenv

# Load .env once when the module is imported so all later ``os.environ``
# lookups are populated.
load_dotenv()


def _env_bool(name: str, default: bool = False) -> bool:
    """Parse a boolean environment variable."""
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _env_int(name: str, default: int) -> int:
    """Parse an integer environment variable with a safe default."""
    try:
        return int(os.environ.get(name, default))
    except (TypeError, ValueError):
        return default


def _env_list(name: str, default: str = "") -> list[str]:
    """Parse a comma-separated environment variable into a list."""
    raw = os.environ.get(name, default) or ""
    return [item.strip() for item in raw.split(",") if item.strip()]


class Config:
    """Base configuration shared by every environment."""

    # --- Application -----------------------------------------------------
    APP_NAME: str = os.environ.get("APP_NAME", "LootLoom Backend")
    APP_VERSION: str = os.environ.get("APP_VERSION", "1.0.0")
    FLASK_ENV: str = os.environ.get("FLASK_ENV", "development")
    DEBUG: bool = _env_bool("FLASK_DEBUG", False)
    HOST: str = os.environ.get("HOST", "0.0.0.0")
    PORT: int = _env_int("PORT", 5000)
    API_VERSION: str = "v1"

    # --- Security --------------------------------------------------------
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "dev-only-do-not-use-in-prod")
    JWT_SECRET: str = os.environ.get("JWT_SECRET", "dev-only-jwt-secret")
    JWT_ALGORITHM: str = os.environ.get("JWT_ALGORITHM", "HS256")
    JWT_ISSUER: str = os.environ.get("JWT_ISSUER", "lootloom")
    JWT_AUDIENCE: str = os.environ.get("JWT_AUDIENCE", "lootloom-clients")
    JWT_ACCESS_TTL_MINUTES: int = _env_int("JWT_ACCESS_TTL_MINUTES", 15)
    JWT_REFRESH_TTL_DAYS: int = _env_int("JWT_REFRESH_TTL_DAYS", 30)
    BCRYPT_ROUNDS: int = _env_int("BCRYPT_ROUNDS", 12)

    # --- Database --------------------------------------------------------
    SQLALCHEMY_DATABASE_URI: str = os.environ.get(
        "DATABASE_URL", "sqlite:///lootloom.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False
    SQLALCHEMY_ENGINE_OPTIONS: dict = {"pool_pre_ping": True}

    # --- CORS ------------------------------------------------------------
    CORS_ORIGINS: list[str] = _env_list(
        "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
    )
    CORS_ALLOW_CREDENTIALS: bool = _env_bool("CORS_ALLOW_CREDENTIALS", True)

    # --- Rate limiting ---------------------------------------------------
    RATELIMIT_ENABLED: bool = _env_bool("RATELIMIT_ENABLED", True)
    RATELIMIT_DEFAULT: str = os.environ.get("RATELIMIT_DEFAULT", "200 per hour")
    RATELIMIT_AUTH: str = os.environ.get("RATELIMIT_AUTH", "5 per minute")
    RATELIMIT_STORAGE_URI: str = os.environ.get(
        "RATELIMIT_STORAGE_URI", "memory://"
    )

    # --- Logging ---------------------------------------------------------
    LOG_LEVEL: str = os.environ.get("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = os.environ.get("LOG_FORMAT", "json")
    LOG_FILE: str = os.environ.get("LOG_FILE", "logs/lootloom.log")

    # --- CEO bootstrap ---------------------------------------------------
    CEO_BOOTSTRAP_ENABLED: bool = _env_bool("CEO_BOOTSTRAP_ENABLED", True)
    CEO_BOOTSTRAP_USERNAME: str = os.environ.get(
        "CEO_BOOTSTRAP_USERNAME", "admin"
    )
    CEO_BOOTSTRAP_EMAIL: str = os.environ.get(
        "CEO_BOOTSTRAP_EMAIL", "admin@lootloom.local"
    )
    CEO_BOOTSTRAP_PASSWORD: str = os.environ.get(
        "CEO_BOOTSTRAP_PASSWORD", "ChangeMe!2025"
    )

    # --- Misc ------------------------------------------------------------
    JSON_SORT_KEYS: bool = False
    PROPAGATE_EXCEPTIONS: bool = True


class DevelopmentConfig(Config):
    """Developer-friendly config (verbose, auto-reload)."""

    DEBUG: bool = True
    FLASK_ENV: str = "development"
    LOG_LEVEL: str = os.environ.get("LOG_LEVEL", "DEBUG")
    LOG_FORMAT: str = "console"
    SQLALCHEMY_ECHO: bool = _env_bool("SQLALCHEMY_ECHO", False)


class TestingConfig(Config):
    """Config for the pytest suite — in-memory SQLite, no rate limits."""

    TESTING: bool = True
    DEBUG: bool = False
    FLASK_ENV: str = "testing"
    SQLALCHEMY_DATABASE_URI: str = os.environ.get(
        "TEST_DATABASE_URL", "sqlite:///:memory:"
    )
    RATELIMIT_ENABLED: bool = False
    WTF_CSRF_ENABLED: bool = False
    BCRYPT_ROUNDS: int = 4  # speed up tests
    LOG_LEVEL: str = "WARNING"


class ProductionConfig(Config):
    """Hardened config for production deployments."""

    DEBUG: bool = False
    FLASK_ENV: str = "production"
    LOG_LEVEL: str = os.environ.get("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = "json"
    PREFERRED_URL_SCHEME: str = "https"


_CONFIG_MAP: dict[str, Type[Config]] = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "prod": ProductionConfig,
    "default": DevelopmentConfig,
}


def get_config(env: str | None = None) -> Type[Config]:
    """Return the config class for the requested or current environment."""
    name = (env or os.environ.get("FLASK_ENV", "development")).lower()
    return _CONFIG_MAP.get(name, DevelopmentConfig)
