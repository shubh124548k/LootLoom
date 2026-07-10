"""JWT encode / decode / rotate service.

Issues short-lived **access** tokens and long-lived **refresh** tokens.
Refresh tokens carry a ``jti`` that is also persisted in
:class:`models.system.UserSession` so the service can revoke them
independently of the JWT.

Claims layout::

    {
        "sub": "<owner id>",
        "type": "access" | "refresh",
        "owner_type": "user" | "admin",
        "role": "<role>",
        "permissions": ["<perm>", ...],   # access only
        "session_id": "<session row id>",
        "jti": "<token id>",               # refresh only
        "iat": <epoch>,
        "exp": <epoch>,
        "iss": "lootloom",
        "aud": "lootloom-clients",
    }
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import jwt
from flask import current_app

from core.exceptions import (
    TokenExpiredError,
    TokenInvalidError,
    AuthError,
)
from core.enums import SessionType


class JWTService:
    """Encode / decode / rotate JWTs."""

    # -----------------------------------------------------------------
    # Config helpers
    # -----------------------------------------------------------------
    @staticmethod
    def _secret() -> str:
        return current_app.config["JWT_SECRET"]

    @staticmethod
    def _algorithm() -> str:
        return current_app.config.get("JWT_ALGORITHM", "HS256")

    @staticmethod
    def _issuer() -> str:
        return current_app.config.get("JWT_ISSUER", "lootloom")

    @staticmethod
    def _audience() -> str:
        return current_app.config.get("JWT_AUDIENCE", "lootloom-clients")

    @staticmethod
    def _access_ttl_seconds() -> int:
        return int(current_app.config.get("JWT_ACCESS_TTL_MINUTES", 15)) * 60

    @staticmethod
    def _refresh_ttl_seconds() -> int:
        return int(current_app.config.get("JWT_REFRESH_TTL_DAYS", 30)) * 86400

    # -----------------------------------------------------------------
    # Token factories
    # -----------------------------------------------------------------
    @classmethod
    def create_access_token(
        cls,
        *,
        subject: str,
        owner_type: SessionType | str,
        role: str,
        permissions: Optional[list[str]] = None,
        session_id: Optional[str] = None,
    ) -> tuple[str, int]:
        """Create an access token. Returns ``(token, ttl_seconds)``."""
        now = datetime.now(timezone.utc)
        ttl = cls._access_ttl_seconds()
        owner_type_value = (
            owner_type.value if isinstance(owner_type, SessionType) else owner_type
        )
        payload: dict[str, Any] = {
            "sub": subject,
            "type": "access",
            "owner_type": owner_type_value,
            "role": role,
            "permissions": permissions or [],
            "session_id": session_id,
            "jti": str(uuid.uuid4()),
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(seconds=ttl)).timestamp()),
            "iss": cls._issuer(),
            "aud": cls._audience(),
        }
        token = jwt.encode(payload, cls._secret(), algorithm=cls._algorithm())
        return token, ttl

    @classmethod
    def create_refresh_token(
        cls,
        *,
        subject: str,
        owner_type: SessionType | str,
        role: str,
        session_id: Optional[str] = None,
    ) -> tuple[str, str, int]:
        """Create a refresh token.

        Returns ``(token, jti, ttl_seconds)`` — the ``jti`` must be
        persisted via :class:`SessionService` so the token can be
        revoked.
        """
        now = datetime.now(timezone.utc)
        ttl = cls._refresh_ttl_seconds()
        jti = str(uuid.uuid4())
        owner_type_value = (
            owner_type.value if isinstance(owner_type, SessionType) else owner_type
        )
        payload: dict[str, Any] = {
            "sub": subject,
            "type": "refresh",
            "owner_type": owner_type_value,
            "role": role,
            "session_id": session_id,
            "jti": jti,
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(seconds=ttl)).timestamp()),
            "iss": cls._issuer(),
            "aud": cls._audience(),
        }
        token = jwt.encode(payload, cls._secret(), algorithm=cls._algorithm())
        return token, jti, ttl

    # -----------------------------------------------------------------
    # Decode / validate
    # -----------------------------------------------------------------
    @classmethod
    def decode(cls, token: str) -> dict[str, Any]:
        """Decode and validate a JWT.

        Raises :class:`TokenExpiredError` or :class:`TokenInvalidError`.
        """
        try:
            return jwt.decode(
                token,
                cls._secret(),
                algorithms=[cls._algorithm()],
                issuer=cls._issuer(),
                audience=cls._audience(),
                options={"require": ["exp", "iat", "iss", "sub", "type"]},
            )
        except jwt.ExpiredSignatureError as exc:
            raise TokenExpiredError("Token has expired") from exc
        except jwt.InvalidTokenError as exc:
            raise TokenInvalidError(f"Token is invalid: {exc}") from exc

    @classmethod
    def validate_access(cls, token: str) -> dict[str, Any]:
        """Validate an access token and return its claims."""
        claims = cls.decode(token)
        if claims.get("type") != "access":
            raise TokenInvalidError("Not an access token")
        return claims

    @classmethod
    def validate_refresh(cls, token: str) -> dict[str, Any]:
        """Validate a refresh token and return its claims."""
        claims = cls.decode(token)
        if claims.get("type") != "refresh":
            raise TokenInvalidError("Not a refresh token")
        return claims

    # -----------------------------------------------------------------
    # Rotation
    # -----------------------------------------------------------------
    @classmethod
    def rotate(
        cls, refresh_token: str
    ) -> tuple[dict[str, Any], str, int, str, str, int]:
        """Validate a refresh token and issue a new token pair.

        Returns ``(old_claims, new_access, access_ttl, new_refresh,
        new_jti, refresh_ttl)``. The caller is responsible for
        persisting the new ``jti`` and revoking the old one.
        """
        claims = cls.validate_refresh(refresh_token)
        # Issue a new pair
        new_access, access_ttl = cls.create_access_token(
            subject=claims["sub"],
            owner_type=claims.get("owner_type", SessionType.USER.value),
            role=claims.get("role", "user"),
            permissions=claims.get("permissions", []),
            session_id=claims.get("session_id"),
        )
        new_refresh, new_jti, refresh_ttl = cls.create_refresh_token(
            subject=claims["sub"],
            owner_type=claims.get("owner_type", SessionType.USER.value),
            role=claims.get("role", "user"),
            session_id=claims.get("session_id"),
        )
        return claims, new_access, access_ttl, new_refresh, new_jti, refresh_ttl
