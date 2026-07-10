"""Custom exception hierarchy.

Each subclass carries a stable ``code`` (machine-readable), an HTTP
status code, and a human message. The centralised error handler in
:mod:`middlewares.error_handler` converts any instance of
:class:`AppError` into a JSON response using
:func:`core.responses.error`.

Raise these from services / controllers; never leak raw SQLAlchemy or
Pydantic exceptions to the client.
"""
from __future__ import annotations

from typing import Any


class AppError(Exception):
    """Base class for all expected, app-level errors."""

    code: str = "app_error"
    status_code: int = 500
    default_message: str = "An unexpected error occurred"

    def __init__(
        self,
        message: str | None = None,
        *,
        code: str | None = None,
        status_code: int | None = None,
        details: Any = None,
    ) -> None:
        self.message = message or self.default_message
        if code is not None:
            self.code = code
        if status_code is not None:
            self.status_code = status_code
        self.details = details
        super().__init__(self.message)

    def to_dict(self) -> dict:
        return {
            "code": self.code,
            "message": self.message,
            "details": self.details,
        }


class ValidationError(AppError):
    code = "validation_error"
    status_code = 422
    default_message = "Input validation failed"


class AuthError(AppError):
    code = "auth_error"
    status_code = 401
    default_message = "Authentication required"


class InvalidCredentialsError(AuthError):
    code = "invalid_credentials"
    default_message = "Invalid credentials"


class TokenExpiredError(AuthError):
    code = "token_expired"
    default_message = "Token has expired"


class TokenInvalidError(AuthError):
    code = "token_invalid"
    default_message = "Token is invalid"


class PermissionDeniedError(AppError):
    code = "permission_denied"
    status_code = 403
    default_message = "You do not have permission to perform this action"


class RoleRequiredError(PermissionDeniedError):
    code = "role_required"
    default_message = "A higher role is required"


class NotFoundError(AppError):
    code = "not_found"
    status_code = 404
    default_message = "Resource not found"


class ConflictError(AppError):
    code = "conflict"
    status_code = 409
    default_message = "Resource already exists"


class BusinessError(AppError):
    code = "business_error"
    status_code = 400
    default_message = "Business rule violation"


class WalletError(BusinessError):
    code = "wallet_error"
    default_message = "Wallet operation failed"


class InsufficientBalanceError(WalletError):
    code = "insufficient_balance"
    default_message = "Insufficient coin balance"


class WalletFrozenError(WalletError):
    code = "wallet_frozen"
    default_message = "Wallet is frozen and cannot be used"


class RateLimitExceededError(AppError):
    code = "rate_limit_exceeded"
    status_code = 429
    default_message = "Rate limit exceeded"


class DatabaseError(AppError):
    code = "database_error"
    status_code = 500
    default_message = "Database operation failed"


class ServiceUnavailableError(AppError):
    code = "service_unavailable"
    status_code = 503
    default_message = "Service temporarily unavailable"
