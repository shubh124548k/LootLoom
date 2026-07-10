"""Authentication request / response schemas."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# ---------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------
class RegistrationSchema(BaseModel):
    """Body for ``POST /api/v1/auth/register``."""

    username: str = Field(min_length=3, max_length=64)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: Optional[str] = Field(default=None, max_length=128)
    referral_code: Optional[str] = Field(default=None, max_length=32)
    accept_terms: bool = Field(default=False)

    @field_validator("username")
    @classmethod
    def _username_safe(cls, v: str) -> str:
        if not v.isalnum() and not all(c.isalnum() or c in {"_", "-"} for c in v):
            raise ValueError("username may only contain letters, digits, _ or -")
        return v.lower()

    @field_validator("accept_terms")
    @classmethod
    def _terms_must_be_accepted(cls, v: bool) -> bool:
        if not v:
            raise ValueError("You must accept the terms of service")
        return v


# ---------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------
class LoginSchema(BaseModel):
    """Body for ``POST /api/v1/auth/login``.

    ``identifier`` may be the username OR the email.
    """

    identifier: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=128)


# ---------------------------------------------------------------------
# Refresh / logout
# ---------------------------------------------------------------------
class RefreshTokenSchema(BaseModel):
    """Body for ``POST /api/v1/auth/refresh``."""

    refresh_token: str = Field(min_length=10)


class LogoutSchema(BaseModel):
    """Body for ``POST /api/v1/auth/logout`` (optional refresh token)."""

    refresh_token: Optional[str] = None


# ---------------------------------------------------------------------
# Email verify / forgot / reset / change
# ---------------------------------------------------------------------
class EmailVerifySchema(BaseModel):
    """Body for ``POST /api/v1/auth/verify-email``."""

    email: EmailStr
    code: str = Field(min_length=4, max_length=12)


class PasswordResetRequestSchema(BaseModel):
    """Body for ``POST /api/v1/auth/forgot-password``."""

    email: EmailStr


class PasswordResetSchema(BaseModel):
    """Body for ``POST /api/v1/auth/reset-password``."""

    token: str = Field(min_length=10)
    new_password: str = Field(min_length=8, max_length=128)


class PasswordChangeSchema(BaseModel):
    """Body for ``POST /api/v1/user/password`` (authenticated change)."""

    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


# ---------------------------------------------------------------------
# Responses
# ---------------------------------------------------------------------
class TokenResponseSchema(BaseModel):
    """Returned after login / register / refresh."""

    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int  # seconds until access token expires


class AuthMeSchema(BaseModel):
    """Returned by ``GET /api/v1/auth/me``."""

    id: str
    username: str
    email: str
    display_name: Optional[str] = None
    role: str
    status: str
    verification_status: str
    level: int = 1
    xp: int = 0
    has_wallet: bool = False
