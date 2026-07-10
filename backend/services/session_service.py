"""Session service — create, validate, expire, logout-all.

Sessions back JWT refresh tokens: every refresh token's ``jti`` is
persisted as a row in :class:`models.system.UserSession`. Revoking a
session invalidates the refresh token even though the JWT itself is
stateless.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from repositories.session_repository import SessionRepository
from models.system import UserSession
from core.enums import SessionStatus, SessionType
from core.exceptions import AuthError, NotFoundError
from core.logging import get_logger

log = get_logger("session_service")


class SessionService:
    """Lifecycle manager for auth sessions."""

    def __init__(self, repo: Optional[SessionRepository] = None) -> None:
        self.repo = repo or SessionRepository()

    # -----------------------------------------------------------------
    # Create / validate
    # -----------------------------------------------------------------
    def create(
        self,
        *,
        jti: str,
        owner_id: str,
        owner_type: SessionType,
        ttl_seconds: int,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> UserSession:
        """Persist a new session row for a freshly issued refresh token."""
        session = self.repo.create_session(
            jti=jti,
            owner_id=owner_id,
            owner_type=owner_type,
            ttl_seconds=ttl_seconds,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        self.repo.commit()
        log.info(
            "session.create",
            owner_id=owner_id,
            owner_type=owner_type.value if isinstance(owner_type, SessionType) else owner_type,
            jti=jti[:8] + "...",
        )
        return session

    def validate(self, jti: str) -> UserSession:
        """Return the active session for ``jti`` or raise :class:`AuthError`.

        Used by refresh-token rotation to ensure the session has not
        been revoked.
        """
        session = self.repo.get_by_jti(jti)
        if session is None:
            raise AuthError("Session not found", code="session_not_found")
        if session.status != SessionStatus.ACTIVE.value:
            raise AuthError("Session is no longer active", code="session_inactive")
        if session.expires_at <= datetime.now(timezone.utc):
            # Mark expired and refuse
            session.status = SessionStatus.EXPIRED.value
            self.repo.commit()
            raise AuthError("Session has expired", code="session_expired")
        return session

    def touch(self, jti: str) -> None:
        """Update ``last_seen`` for a session (best-effort)."""
        try:
            self.repo.touch(jti)
            self.repo.commit()
        except Exception as exc:  # pragma: no cover - logging best-effort
            log.warning("session.touch.failed", error=str(exc))

    # -----------------------------------------------------------------
    # Revoke / logout
    # -----------------------------------------------------------------
    def revoke(self, jti: str) -> None:
        """Revoke a single session (logout)."""
        self.repo.revoke(jti)
        self.repo.commit()
        log.info("session.revoke", jti=jti[:8] + "...")

    def revoke_all(self, owner_id: str, owner_type: SessionType) -> int:
        """Revoke every active session for an owner (logout-all)."""
        count = self.repo.revoke_all_for_owner(owner_id, owner_type)
        self.repo.commit()
        log.info(
            "session.revoke_all",
            owner_id=owner_id,
            owner_type=owner_type.value if isinstance(owner_type, SessionType) else owner_type,
            count=count,
        )
        return count

    def list_active(self, owner_id: str, owner_type: SessionType) -> list[UserSession]:
        """List currently active sessions for an owner."""
        return self.repo.list_active(owner_id, owner_type)
