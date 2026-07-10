"""User controller — profile + settings HTTP layer.

All endpoints require an authenticated user token (``@require_auth``).
"""
from __future__ import annotations

from typing import Any

from flask import g, request

from core.responses import success, error, no_content
from core.exceptions import AppError
from core.logging import get_logger
from schemas.user import ProfileUpdateSchema, SettingsSchema
from schemas.auth import PasswordChangeSchema
from services.user_service import UserService

log = get_logger("user_controller")


class UserController:
    """HTTP handlers for ``/api/v1/user/*``."""

    def __init__(self, service: UserService | None = None) -> None:
        self.service = service or UserService()

    # -----------------------------------------------------------------
    # Helpers
    # -----------------------------------------------------------------
    def _user_id(self) -> str | None:
        return getattr(g, "current_user_id", None)

    # -----------------------------------------------------------------
    # GET /api/v1/user/profile
    # PUT /api/v1/user/profile
    # -----------------------------------------------------------------
    def get_profile(self) -> tuple[Any, int]:
        user_id = self._user_id()
        if not user_id:
            return error("auth_error", "Not authenticated", 401)
        try:
            return success({"profile": self.service.get_profile(user_id)})
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)

    def update_profile(self) -> tuple[Any, int]:
        user_id = self._user_id()
        if not user_id:
            return error("auth_error", "Not authenticated", 401)
        try:
            payload = ProfileUpdateSchema.model_validate(request.get_json(force=True))
        except Exception as exc:
            return error("validation_error", "Invalid input", 422, details=str(exc))
        try:
            updated = self.service.update_profile(user_id, payload.model_dump(exclude_unset=True))
            return success({"profile": updated}, message="Profile updated")
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)

    # -----------------------------------------------------------------
    # GET /api/v1/user/settings
    # PUT /api/v1/user/settings
    # -----------------------------------------------------------------
    def get_settings(self) -> tuple[Any, int]:
        user_id = self._user_id()
        if not user_id:
            return error("auth_error", "Not authenticated", 401)
        try:
            return success({"settings": self.service.get_settings(user_id)})
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)

    def update_settings(self) -> tuple[Any, int]:
        user_id = self._user_id()
        if not user_id:
            return error("auth_error", "Not authenticated", 401)
        try:
            payload = SettingsSchema.model_validate(request.get_json(force=True))
        except Exception as exc:
            return error("validation_error", "Invalid input", 422, details=str(exc))
        try:
            updated = self.service.update_settings(user_id, payload.model_dump(exclude_unset=True))
            return success({"settings": updated}, message="Settings updated")
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)

    def get_preferences(self) -> tuple[Any, int]:
        user_id = self._user_id()
        if not user_id:
            return error("auth_error", "Not authenticated", 401)
        try:
            return success({"preferences": self.service.get_preferences(user_id)})
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)

    # -----------------------------------------------------------------
    # POST /api/v1/user/password
    # -----------------------------------------------------------------
    def change_password(self) -> tuple[Any, int]:
        user_id = self._user_id()
        if not user_id:
            return error("auth_error", "Not authenticated", 401)
        try:
            payload = PasswordChangeSchema.model_validate(request.get_json(force=True))
        except Exception as exc:
            return error("validation_error", "Invalid input", 422, details=str(exc))
        try:
            self.service.change_password(
                user_id, payload.current_password, payload.new_password
            )
            return success(message="Password changed; all sessions revoked")
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)

    # -----------------------------------------------------------------
    # GET /api/v1/user/sessions
    # DELETE /api/v1/user/sessions
    # DELETE /api/v1/user/sessions/<jti>
    # -----------------------------------------------------------------
    def list_sessions(self) -> tuple[Any, int]:
        user_id = self._user_id()
        if not user_id:
            return error("auth_error", "Not authenticated", 401)
        try:
            return success({"sessions": self.service.list_sessions(user_id)})
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)

    def revoke_session(self, jti: str) -> tuple[Any, int]:
        user_id = self._user_id()
        if not user_id:
            return error("auth_error", "Not authenticated", 401)
        try:
            self.service.revoke_session(user_id, jti)
            return no_content()
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)

    def revoke_all_sessions(self) -> tuple[Any, int]:
        user_id = self._user_id()
        if not user_id:
            return error("auth_error", "Not authenticated", 401)
        try:
            count = self.service.revoke_all_sessions(user_id)
            return success({"revoked_count": count}, message="All sessions revoked")
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)

    # -----------------------------------------------------------------
    # GET /api/v1/user/status
    # -----------------------------------------------------------------
    def get_status(self) -> tuple[Any, int]:
        user_id = self._user_id()
        if not user_id:
            return error("auth_error", "Not authenticated", 401)
        try:
            return success({"status": self.service.get_status(user_id)})
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)
