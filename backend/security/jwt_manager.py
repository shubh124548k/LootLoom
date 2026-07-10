"""Low-level JWT encode / decode helpers.

A thin wrapper around :class:`services.jwt_service.JWTService` for use
by middleware / decorators that don't want to import the full service
class.
"""
from __future__ import annotations

from typing import Any, Optional

from services.jwt_service import JWTService
from core.enums import SessionType


def encode_jwt(payload: dict[str, Any]) -> str:
    """Encode an arbitrary JWT payload using the app's secret."""
    import jwt
    from flask import current_app

    return jwt.encode(
        payload,
        current_app.config["JWT_SECRET"],
        algorithm=current_app.config.get("JWT_ALGORITHM", "HS256"),
    )


def decode_jwt(token: str) -> dict[str, Any]:
    """Decode a JWT, raising on invalid / expired tokens."""
    return JWTService.decode(token)


def build_access_claims(
    *,
    subject: str,
    owner_type: SessionType | str,
    role: str,
    permissions: Optional[list[str]] = None,
    session_id: Optional[str] = None,
) -> dict[str, Any]:
    """Build (but do not encode) the access-token claims.

    Convenience for callers that want to inspect / log the claims
    before issuing.
    """
    token, _ = JWTService.create_access_token(
        subject=subject,
        owner_type=owner_type,
        role=role,
        permissions=permissions,
        session_id=session_id,
    )
    return JWTService.validate_access(token)


def build_refresh_claims(
    *,
    subject: str,
    owner_type: SessionType | str,
    role: str,
    session_id: Optional[str] = None,
) -> tuple[str, dict[str, Any]]:
    """Issue a refresh token and return ``(token, claims)``."""
    token, jti, _ = JWTService.create_refresh_token(
        subject=subject,
        owner_type=owner_type,
        role=role,
        session_id=session_id,
    )
    return token, JWTService.validate_refresh(token)
