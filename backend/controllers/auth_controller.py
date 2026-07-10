"""Auth controller — HTTP layer for user authentication.

Maps each auth endpoint to a service call and returns the standard
response envelope. Validation is delegated to Pydantic schemas.
"""
from __future__ import annotations

from typing import Any

from flask import request

from core.responses import (
    success,
    created,
    error,
    no_content,
)
from core.exceptions import AppError, ValidationError
from core.logging import get_logger
from schemas.auth import (
    RegistrationSchema,
    LoginSchema,
    RefreshTokenSchema,
    LogoutSchema,
    EmailVerifySchema,
    PasswordResetRequestSchema,
    PasswordResetSchema,
)
from services.auth_service import AuthService

log = get_logger("auth_controller")


class AuthController:
    """HTTP handlers for ``/api/v1/auth/*``."""

    def __init__(self, service: AuthService | None = None) -> None:
        self.service = service or AuthService()

    # -----------------------------------------------------------------
    # POST /api/v1/auth/register
    # -----------------------------------------------------------------
    def register(self) -> tuple[Any, int]:
        try:
            payload = RegistrationSchema.model_validate(request.get_json(force=True))
        except Exception as exc:
            return error("validation_error", "Invalid input", 422, details=str(exc))
        try:
            user, access, refresh = self.service.register(
                username=payload.username,
                email=payload.email,
                password=payload.password,
                display_name=payload.display_name,
                referral_code=payload.referral_code,
            )
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)

        data = {
            "user": user.to_dict(),
            "tokens": {
                "access_token": access,
                "refresh_token": refresh,
                "token_type": "Bearer",
            },
        }
        return created(data, message="Account created")

    # -----------------------------------------------------------------
    # POST /api/v1/auth/login
    # -----------------------------------------------------------------
    def login(self) -> tuple[Any, int]:
        try:
            payload = LoginSchema.model_validate(request.get_json(force=True))
        except Exception as exc:
            return error("validation_error", "Invalid input", 422, details=str(exc))
        try:
            user, access, refresh = self.service.login(
                payload.identifier, payload.password
            )
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)

        data = {
            "user": user.to_dict(),
            "tokens": {
                "access_token": access,
                "refresh_token": refresh,
                "token_type": "Bearer",
            },
        }
        return success(data, message="Login successful")

    # -----------------------------------------------------------------
    # POST /api/v1/auth/logout
    # -----------------------------------------------------------------
    def logout(self) -> tuple[Any, int]:
        try:
            payload = LogoutSchema.model_validate(request.get_json(silent=True) or {})
        except Exception:
            payload = LogoutSchema()  # type: ignore[call-arg]
        self.service.logout(payload.refresh_token)
        return no_content()

    # -----------------------------------------------------------------
    # POST /api/v1/auth/refresh
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
    # GET /api/v1/auth/me
    # -----------------------------------------------------------------
    def me(self) -> tuple[Any, int]:
        from flask import g

        claims = getattr(g, "current_claims", None)
        if not claims:
            return error("auth_error", "Not authenticated", 401)
        user_id = g.current_user_id
        if not user_id:
            return error("auth_error", "Not a user token", 401)
        user = self.service.user_repo.get_by_id(user_id)
        if user is None:
            return error("not_found", "User not found", 404)
        wallet = self.service.wallet_repo.get_by_user_id(user.id)
        data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "display_name": user.display_name,
            "role": user.role,
            "status": user.status,
            "verification_status": user.verification_status,
            "level": user.level,
            "xp": user.xp,
            "has_wallet": wallet is not None,
        }
        return success(data)

    # -----------------------------------------------------------------
    # POST /api/v1/auth/forgot-password
    # -----------------------------------------------------------------
    def forgot_password(self) -> tuple[Any, int]:
        try:
            payload = PasswordResetRequestSchema.model_validate(
                request.get_json(force=True)
            )
        except Exception as exc:
            return error("validation_error", "Invalid input", 422, details=str(exc))
        # Always return 200 to avoid leaking which emails are registered
        self.service.forgot_password(payload.email)
        return success(
            {"email": payload.email},
            message="If the email exists, a reset link has been sent",
        )

    # -----------------------------------------------------------------
    # POST /api/v1/auth/reset-password
    # -----------------------------------------------------------------
    def reset_password(self) -> tuple[Any, int]:
        try:
            payload = PasswordResetSchema.model_validate(request.get_json(force=True))
        except Exception as exc:
            return error("validation_error", "Invalid input", 422, details=str(exc))
        try:
            self.service.reset_password(payload.token, payload.new_password)
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)
        return success(message="Password has been reset")

    # -----------------------------------------------------------------
    # POST /api/v1/auth/verify-email
    # -----------------------------------------------------------------
    def verify_email(self) -> tuple[Any, int]:
        try:
            payload = EmailVerifySchema.model_validate(request.get_json(force=True))
        except Exception as exc:
            return error("validation_error", "Invalid input", 422, details=str(exc))
        try:
            user = self.service.verify_email(payload.email, payload.code)
        except AppError as exc:
            return error(exc.code, exc.message, exc.status_code, details=exc.details)
        return success({"user": user.to_dict()}, message="Email verified")
