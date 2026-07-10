"""Health + version endpoints.

* ``GET /api/v1/health``   — liveness probe (always 200)
* ``GET /api/v1/version``  — build / version info
"""
from __future__ import annotations

from flask import Blueprint, current_app

from core.responses import success

bp = Blueprint("health", __name__)


@bp.get("/health")
def health() -> tuple[any, int]:  # type: ignore[valid-type]
    """Liveness probe."""
    return success(
        data={"status": "ok", "service": "lootloom-backend"},
        message="Service is healthy",
    )


@bp.get("/version")
def version() -> tuple[any, int]:  # type: ignore[valid-type]
    """Return build / version info."""
    return success(
        data={
            "name": current_app.config.get("APP_NAME"),
            "version": current_app.config.get("APP_VERSION"),
            "env": current_app.config.get("FLASK_ENV"),
            "api_version": current_app.config.get("API_VERSION", "v1"),
        }
    )
