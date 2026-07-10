"""Session repository — manages persistent auth sessions.

Sessions are stored in the DB so they survive server restarts and can
be revoked (logout, logout-all) independently of the JWT itself. The
refresh-token ``jti`` is the natural key.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select, update

from models.system import UserSession
from core.enums import SessionStatus, SessionType
from .base import BaseRepository


class SessionRepository(BaseRepository[UserSession]):
    """CRUD + lifecycle helpers for :class:`UserSession`."""

    def __init__(self) -> None:
        super().__init__(UserSession)

    def get_by_jti(self, jti: str) -> Optional[UserSession]:
        """Return the session owning the given JWT id (``jti``)."""
        return self.get_by(jti=jti)

    def create_session(
        self,
        *,
        jti: str,
        owner_id: str,
        owner_type: SessionType,
        ttl_seconds: int,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> UserSession:
        """Create a new active session row."""
        now = datetime.now(timezone.utc)
        return self.create(
            {
                "jti": jti,
                "owner_id": owner_id,
                "owner_type": owner_type.value if isinstance(owner_type, SessionType) else owner_type,
                "status": SessionStatus.ACTIVE.value,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "issued_at": now,
                "expires_at": now + timedelta(seconds=ttl_seconds),
                "last_seen": now,
            }
        )

    def revoke(self, jti: str) -> None:
        """Mark a session as revoked (logout)."""
        now = datetime.now(timezone.utc)
        stmt = (
            update(UserSession)
            .where(UserSession.jti == jti)
            .values(status=SessionStatus.REVOKED.value, revoked_at=now)
        )
        self.session.execute(stmt)
        self.session.flush()

    def revoke_all_for_owner(self, owner_id: str, owner_type: SessionType) -> int:
        """Revoke every active session owned by ``owner_id``."""
        now = datetime.now(timezone.utc)
        owner_type_value = (
            owner_type.value if isinstance(owner_type, SessionType) else owner_type
        )
        stmt = (
            update(UserSession)
            .where(
                UserSession.owner_id == owner_id,
                UserSession.owner_type == owner_type_value,
                UserSession.status == SessionStatus.ACTIVE.value,
            )
            .values(status=SessionStatus.LOGGED_OUT.value, revoked_at=now)
        )
        result = self.session.execute(stmt)
        self.session.flush()
        return int(result.rowcount or 0)

    def list_active(self, owner_id: str, owner_type: SessionType) -> list[UserSession]:
        """List active sessions for an owner."""
        owner_type_value = (
            owner_type.value if isinstance(owner_type, SessionType) else owner_type
        )
        stmt = (
            select(UserSession)
            .where(
                UserSession.owner_id == owner_id,
                UserSession.owner_type == owner_type_value,
                UserSession.status == SessionStatus.ACTIVE.value,
            )
            .order_by(UserSession.issued_at.desc())
        )
        return list(self.session.scalars(stmt).all())

    def touch(self, jti: str) -> None:
        """Update ``last_seen`` for a session."""
        now = datetime.now(timezone.utc)
        stmt = (
            update(UserSession)
            .where(UserSession.jti == jti)
            .values(last_seen=now)
        )
        self.session.execute(stmt)
        self.session.flush()
