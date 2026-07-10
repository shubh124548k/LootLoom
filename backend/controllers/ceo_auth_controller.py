"""CEO / Admin auth controller — HTTP layer for the admin console.

Completely separate from the user auth controller; mounts under
``/api/v1/ceo/auth/*``.
"""
from __future__ import annotations

from typing import Any

from flask import g, request

from core.responses import success, error, no_content
from core.exceptions import AppError
from core.logging import get_logger
from schemas.auth import LoginSchema, RefreshTokenSchema, LogoutSchema
from services.ceo_auth_service import CEOAuthService

log = get_logger("ceo_auth_controller")


class CEOAuthController:
    """HTTP handlers for ``/api/v1/ceo/auth/*``."""

    def __init__(self, service: CEOAuthService | None = None) -> None:
        self.service = service or CEOAuthService()

    # -----------------------------------------------------------------
    # POST /api/v1/ceo/auth/login
    # -----------------------------------------------------------------
    def login(self) -> tuple[Any, int]:
        try:
            payload = LoginSchema.model_validate(request.get_json(force=True))
        except Exception as exc:
            return error("validation_error", "Invalid input", 422, details=str(exc))
        try:
            admin, access, refresh = self.service.login(
                payload.identifier, payload.password
            )
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)
        data = {
            "admin": admin.to_dict(),
            "tokens": {
                "access_token": access,
                "refresh_token": refresh,
                "token_type": "Bearer",
            },
        }
        return success(data, message="Admin login successful")

    # -----------------------------------------------------------------
    # POST /api/v1/ceo/auth/logout
    # -----------------------------------------------------------------
    def logout(self) -> tuple[Any, int]:
        try:
            payload = LogoutSchema.model_validate(request.get_json(silent=True) or {})
        except Exception:
            payload = LogoutSchema()  # type: ignore[call-arg]
        self.service.logout(payload.refresh_token)
        return no_content()

    # -----------------------------------------------------------------
    # POST /api/v1/ceo/auth/refresh
    # -----------------------------------------------------------------
    def refresh(self) -> tuple[Any, int]:
        try:
            payload = RefreshTokenSchema.model_validate(request.get_json(force=True))
        except Exception as exc:
            return error("validation_error", "Invalid input", 422, details=str(exc))
        try:
            access, refresh, ttl = self.service.refresh(payload.refresh_token)
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)
        return success(
            {
                "access_token": access,
                "refresh_token": refresh,
                "token_type": "Bearer",
                "expires_in": ttl,
            },
            message="Token refreshed",
        )

    # -----------------------------------------------------------------
    # GET /api/v1/ceo/auth/me
    # -----------------------------------------------------------------
    def me(self) -> tuple[Any, int]:
        admin_id = getattr(g, "current_admin_id", None)
        if not admin_id:
            return error("auth_error", "Not an admin token", 401)
        try:
            admin = self.service.get_admin(admin_id)
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)
        return success({"admin": admin.to_dict()})
