"""Auth middleware.

Light-weight before-request hook that:

* Leaves ``g.current_*`` unset if no Authorization header is present
  (so public endpoints still work).
* Validates the bearer token when one is supplied and populates
  ``g.current_claims`` / ``g.current_user_id`` / ``g.current_admin_id``
  / ``g.current_role`` / ``g.current_permissions``.

Route-level enforcement is done by the
:mod:`security.decorators` decorators; this middleware just makes the
principal available globally so any handler can read it without
re-parsing the token.

On a malformed / expired token we **do not** abort the request — we
simply leave ``g.current_*`` unset. The route decorator will raise a
401 if the endpoint actually requires auth.
"""
from __future__ import annotations

from flask import Flask, g, request

from core.enums import SessionType
from core.exceptions import TokenExpiredError, TokenInvalidError
from core.logging import get_logger
from services.jwt_service import JWTService

log = get_logger("auth_middleware")


def register(app: Flask) -> None:
    """Register the auth before-request hook on ``app``."""

    @app.before_request
    def _decode_token_if_present() -> None:
        g.current_claims = None
        g.current_user_id = None
        g.current_admin_id = None
        g.current_role = None
        g.current_permissions = []

        header = request.headers.get("Authorization", "")
        parts = header.split(None, 1)
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return
        token = parts[1].strip()
        try:
            claims = JWTService.validate_access(token)
        except (TokenExpiredError, TokenInvalidError):
            # Leave principal unset; the route decorator will reject if needed.
            return
        g.current_claims = claims
        if claims.get("owner_type") == SessionType.USER.value:
            g.current_user_id = claims["sub"]
        elif claims.get("owner_type") == SessionType.ADMIN.value:
            g.current_admin_id = claims["sub"]
        g.current_role = claims.get("role")
        g.current_permissions = claims.get("permissions", []) or []
