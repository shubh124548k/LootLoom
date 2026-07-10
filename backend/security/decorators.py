"""Flask route decorators for authentication and authorization.

* :func:`require_auth`        — any valid access token (user or admin)
* :func:`require_ceo`         — admin token whose role is ``ceo``
* :func:`require_role`        — admin token at-or-above the given role
* :func:`require_permission`  — admin token granting the permission

Decorated endpoints have the validated claims available on
``g.current_claims`` and a typed view of the principal on
``g.current_user_id`` / ``g.current_admin_id`` / ``g.current_role``.
"""
from __future__ import annotations

from functools import wraps
from typing import Callable, Iterable

from flask import g, request

from core.enums import SessionType
from core.exceptions import (
    AuthError,
    PermissionDeniedError,
    RoleRequiredError,
    TokenExpiredError,
    TokenInvalidError,
)
from services.jwt_service import JWTService
from .rbac import has_permission, has_role, is_ceo


def _extract_bearer() -> str:
    """Extract the bearer token from the Authorization header."""
    header = request.headers.get("Authorization", "")
    parts = header.split(None, 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise AuthError("Missing or malformed Authorization header", code="missing_token")
    return parts[1].strip()


def _set_principal(claims: dict) -> None:
    """Stash the validated claims + principal fields on ``g``."""
    g.current_claims = claims
    g.current_user_id = claims["sub"] if claims.get("owner_type") == SessionType.USER.value else None
    g.current_admin_id = claims["sub"] if claims.get("owner_type") == SessionType.ADMIN.value else None
    g.current_role = claims.get("role")
    g.current_permissions = claims.get("permissions", []) or []


def require_auth(fn: Callable) -> Callable:
    """Allow any valid access token (user or admin)."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = _extract_bearer()
        try:
            claims = JWTService.validate_access(token)
        except (TokenExpiredError, TokenInvalidError) as exc:
            raise AuthError(str(exc), code=exc.code) from exc
        _set_principal(claims)
        return fn(*args, **kwargs)

    return wrapper


def require_ceo(fn: Callable) -> Callable:
    """Require an admin access token whose role is ``ceo``."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = _extract_bearer()
        try:
            claims = JWTService.validate_access(token)
        except (TokenExpiredError, TokenInvalidError) as exc:
            raise AuthError(str(exc), code=exc.code) from exc
        if claims.get("owner_type") != SessionType.ADMIN.value:
            raise PermissionDeniedError("Administrator access required")
        if not is_ceo(claims.get("role", "")):
            raise RoleRequiredError("CEO role required")
        _set_principal(claims)
        return fn(*args, **kwargs)

    return wrapper


def require_role(required_role: str) -> Callable:
    """Require an admin access token at-or-above ``required_role``."""

    def decorator(fn: Callable) -> Callable:
        @wraps(fn)
        def wrapper(*args, **kwargs):
            token = _extract_bearer()
            try:
                claims = JWTService.validate_access(token)
            except (TokenExpiredError, TokenInvalidError) as exc:
                raise AuthError(str(exc), code=exc.code) from exc
            if claims.get("owner_type") != SessionType.ADMIN.value:
                raise PermissionDeniedError("Administrator access required")
            if not has_role(claims.get("role", ""), required_role):
                raise RoleRequiredError(
                    f"Role '{required_role}' or higher required"
                )
            _set_principal(claims)
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def require_permission(permission: str) -> Callable:
    """Require an admin access token granting ``permission``."""

    def decorator(fn: Callable) -> Callable:
        @wraps(fn)
        def wrapper(*args, **kwargs):
            token = _extract_bearer()
            try:
                claims = JWTService.validate_access(token)
            except (TokenExpiredError, TokenInvalidError) as exc:
                raise AuthError(str(exc), code=exc.code) from exc
            if claims.get("owner_type") != SessionType.ADMIN.value:
                raise PermissionDeniedError("Administrator access required")
            perms = claims.get("permissions", []) or []
            if "*" not in perms and not has_permission(claims.get("role", ""), permission):
                raise PermissionDeniedError(
                    f"Permission '{permission}' required"
                )
            _set_principal(claims)
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def require_permissions_any(permissions: Iterable[str]) -> Callable:
    """Require an admin access token granting any of ``permissions``."""

    def decorator(fn: Callable) -> Callable:
        @wraps(fn)
        def wrapper(*args, **kwargs):
            token = _extract_bearer()
            try:
                claims = JWTService.validate_access(token)
            except (TokenExpiredError, TokenInvalidError) as exc:
                raise AuthError(str(exc), code=exc.code) from exc
            if claims.get("owner_type") != SessionType.ADMIN.value:
                raise PermissionDeniedError("Administrator access required")
            perms = claims.get("permissions", []) or []
            role = claims.get("role", "")
            granted = "*" in perms or any(
                has_permission(role, p) for p in permissions
            )
            if not granted:
                raise PermissionDeniedError(
                    f"One of {list(permissions)} permissions required"
                )
            _set_principal(claims)
            return fn(*args, **kwargs)

        return wrapper

    return decorator
