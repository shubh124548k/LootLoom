"""Pydantic schemas for request/response validation.

Re-export the most commonly used schemas so callers can write::

    from schemas import RegistrationSchema, LoginSchema
"""
from __future__ import annotations

from .common import PaginationSchema, PaginationMeta, IdSchema
from .auth import (
    RegistrationSchema,
    LoginSchema,
    RefreshTokenSchema,
    PasswordResetRequestSchema,
    PasswordResetSchema,
    PasswordChangeSchema,
    EmailVerifySchema,
    TokenResponseSchema,
    AuthMeSchema,
)
from .user import (
    ProfileUpdateSchema,
    SettingsSchema,
    ProfileResponseSchema,
)
from .wallet import (
    WalletResponseSchema,
    WalletSummarySchema,
    TransactionResponseSchema,
    CreditCoinsSchema,
    DebitCoinsSchema,
)

__all__ = [
    "PaginationSchema",
    "PaginationMeta",
    "IdSchema",
    "RegistrationSchema",
    "LoginSchema",
    "RefreshTokenSchema",
    "PasswordResetRequestSchema",
    "PasswordResetSchema",
    "PasswordChangeSchema",
    "EmailVerifySchema",
    "TokenResponseSchema",
    "AuthMeSchema",
    "ProfileUpdateSchema",
    "SettingsSchema",
    "ProfileResponseSchema",
    "WalletResponseSchema",
    "WalletSummarySchema",
    "TransactionResponseSchema",
    "CreditCoinsSchema",
    "DebitCoinsSchema",
]
