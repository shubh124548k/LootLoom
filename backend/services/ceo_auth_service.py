"""CEO / Administrator authentication service.

Completely separate from user auth — different table, different
session type, different role domain. Provides:

* :meth:`bootstrap_ceo`  — create the initial CEO account
* :meth:`login`          — admin login with username-or-email + password
* :meth:`logout`         — revoke the refresh session
* :meth:`refresh`        — rotate the token pair
* :meth:`me`             — return the admin's profile

Future prompts will extend this with OTP / passkey / trusted-device
checks (the model already has placeholder slots).
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from flask import request

from core.database import db
from core.enums import (
    AdminRole,
    AdminStatus,
    SessionType,
    SecurityEventType,
    Role,
)
from core.exceptions import (
    AuthError,
    ConflictError,
    InvalidCredentialsError,
    NotFoundError,
    PermissionDeniedError,
)
from core.logging import get_logger
from models.administrator import Administrator
from models.security_event import SecurityEvent
from repositories.admin_repository import AdministratorRepository
from .password_service import PasswordService
from .jwt_service import JWTService
from .session_service import SessionService

log = get_logger("ceo_auth_service")


class CEOAuthService:
    """Authentication for the CEO / admin console."""

    def __init__(
        self,
        admin_repo: Optional[AdministratorRepository] = None,
        session_service: Optional[SessionService] = None,
    ) -> None:
        self.admin_repo = admin_repo or AdministratorRepository()
        self.session_service = session_service or SessionService()

    # -----------------------------------------------------------------
    # Bootstrap
    # -----------------------------------------------------------------
    def bootstrap_ceo(
        self, *, username: str, email: str, password: str
    ) -> Optional[Administrator]:
        """Create the initial CEO account if one does not yet exist."""
        existing = self.admin_repo.get_ceo()
        if existing is not None:
            return existing
        if self.admin_repo.email_exists(email) or self.admin_repo.username_exists(username):
            log.warning("ceo.bootstrap.conflict", username=username, email=email)
            return None
        admin = self.admin_repo.create(
            {
                "admin_id": f"ADM-{username.upper()}",
                "username": username.lower(),
                "email": email.lower(),
                "password_hash": PasswordService.hash(password),
                "role": AdminRole.CEO.value,
                "permission_level": 100,
                "status": AdminStatus.ACTIVE.value,
            }
        )
        self.admin_repo.commit()
        log.info("ceo.bootstrap.created", admin_id=admin.id, username=admin.username)
        return admin

    # -----------------------------------------------------------------
    # Login
    # -----------------------------------------------------------------
    def login(self, identifier: str, password: str) -> tuple[Administrator, str, str]:
        """Authenticate an administrator.

        Returns ``(admin, access_token, refresh_token)``.
        """
        admin = self.admin_repo.get_by_identifier(identifier)
        if admin is None or not PasswordService.verify(password, admin.password_hash):
            self._record_security(
                admin_id=admin.id if admin else None,
                event_type=SecurityEventType.LOGIN_FAILED.value,
                description=f"Failed admin login for identifier={identifier}",
            )
            raise InvalidCredentialsError("Invalid credentials")

        if admin.status != AdminStatus.ACTIVE.value:
            raise AuthError(
                f"Admin account is {admin.status}",
                code="admin_not_active",
                status_code=403,
            )

        self.admin_repo.update(
            admin,
            {
                "last_login": datetime.now(timezone.utc),
                "last_login_ip": self._client_ip(),
            },
        )

        # CEO gets the full permission set; everyone else gets their role set
        permissions = (
            list(self._permissions_for_role(admin.role))
            if admin.role != AdminRole.CEO.value
            else ["*"]  # wildcard — short-circuit checks
        )

        access_token, _ = JWTService.create_access_token(
            subject=admin.id,
            owner_type=SessionType.ADMIN,
            role=admin.role,
            permissions=permissions,
        )
        refresh_token, jti, refresh_ttl = JWTService.create_refresh_token(
            subject=admin.id,
            owner_type=SessionType.ADMIN,
            role=admin.role,
        )
        self.session_service.create(
            jti=jti,
            owner_id=admin.id,
            owner_type=SessionType.ADMIN,
            ttl_seconds=refresh_ttl,
            ip_address=self._client_ip(),
            user_agent=self._user_agent(),
        )

        self.admin_repo.commit()
        self._record_security(
            admin_id=admin.id,
            event_type=SecurityEventType.LOGIN_SUCCESS.value,
            description=f"Admin {admin.username} logged in",
        )
        log.info("ceo.login", admin_id=admin.id, username=admin.username, role=admin.role)
        return admin, access_token, refresh_token

    # -----------------------------------------------------------------
    # Logout / refresh
    # -----------------------------------------------------------------
    def logout(self, refresh_token: Optional[str]) -> None:
        """Revoke the admin refresh session."""
        if not refresh_token:
            return
        try:
            claims = JWTService.validate_refresh(refresh_token)
            if claims.get("owner_type") != SessionType.ADMIN.value:
                raise PermissionDeniedError("Not an admin token")
            self.session_service.revoke(claims["jti"])
            log.info("ceo.logout", admin_id=claims.get("sub"))
        except Exception as exc:  # pragma: no cover - best-effort
            log.warning("ceo.logout.failed", error=str(exc))

    def refresh(self, refresh_token: str) -> tuple[str, str, int]:
        """Rotate the admin refresh-token pair.

        Returns ``(new_access, new_refresh, access_ttl_seconds)``.
        """
        claims, new_access, access_ttl, new_refresh, new_jti, refresh_ttl = (
            JWTService.rotate(refresh_token)
        )
        if claims.get("owner_type") != SessionType.ADMIN.value:
            raise PermissionDeniedError("Not an admin token")
        self.session_service.validate(claims["jti"])
        self.session_service.create(
            jti=new_jti,
            owner_id=claims["sub"],
            owner_type=SessionType.ADMIN,
            ttl_seconds=refresh_ttl,
            ip_address=self._client_ip(),
            user_agent=self._user_agent(),
        )
        self.session_service.revoke(claims["jti"])
        log.info("ceo.refresh", admin_id=claims.get("sub"))
        return new_access, new_refresh, access_ttl

    # -----------------------------------------------------------------
    # Profile
    # -----------------------------------------------------------------
    def get_admin(self, admin_id: str) -> Administrator:
        """Return the admin profile or raise :class:`NotFoundError`."""
        admin = self.admin_repo.get_by_id(admin_id)
        if admin is None:
            raise NotFoundError("Administrator not found", code="admin_not_found")
        return admin

    # -----------------------------------------------------------------
    # Helpers
    # -----------------------------------------------------------------
    @staticmethod
    def _permissions_for_role(role: str) -> list[str]:
        from services.permission_service import PermissionService

        return sorted(PermissionService.permissions_for(role))

    @staticmethod
    def _client_ip() -> Optional[str]:
        try:
            return request.remote_addr if request else None
        except RuntimeError:
            return None

    @staticmethod
    def _user_agent() -> Optional[str]:
        try:
            return request.headers.get("User-Agent") if request else None
        except RuntimeError:
            return None

    def _record_security(
        self, *, admin_id: Optional[str], event_type: str, description: str
    ) -> None:
        try:
            event = SecurityEvent(
                admin_id=admin_id,
                type=event_type,
                description=description,
                ip_address=self._client_ip(),
                user_agent=self._user_agent(),
            )
            db.session.add(event)
            db.session.commit()
        except Exception as exc:  # pragma: no cover - logging best-effort
            db.session.rollback()
            log.warning("security_event.record_failed", error=str(exc))
