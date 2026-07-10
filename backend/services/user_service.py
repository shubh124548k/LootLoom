"""User profile + settings service.

Handles authenticated profile reads/updates and the JSON-backed
settings blob. Profile updates are intentionally restrictive —
``username`` and ``email`` cannot be changed here (they have dedicated
verification flows).
"""
from __future__ import annotations

from typing import Any, Optional

from core.exceptions import NotFoundError, ValidationError
from core.logging import get_logger
from models.user import User
from repositories.user_repository import UserRepository
from .auth_service import AuthService

log = get_logger("user_service")


# Default settings applied on first access
DEFAULT_SETTINGS: dict[str, Any] = {
    "email_notifications": True,
    "push_notifications": True,
    "sms_notifications": False,
    "marketing_emails": False,
    "public_profile": True,
    "show_in_leaderboard": True,
    "language": "en",
    "theme": "system",
}


class UserService:
    """Profile + settings service."""

    def __init__(
        self,
        user_repo: Optional[UserRepository] = None,
        auth_service: Optional[AuthService] = None,
    ) -> None:
        self.user_repo = user_repo or UserRepository()
        self.auth_service = auth_service or AuthService(
            user_repo=self.user_repo,
        )

    # -----------------------------------------------------------------
    # Profile
    # -----------------------------------------------------------------
    def get_profile(self, user_id: str) -> dict:
        """Return the user's profile as a dict."""
        user = self._require_user(user_id)
        return user.to_dict()

    def update_profile(self, user_id: str, updates: dict) -> dict:
        """Patch the user's profile with the values in ``updates``.

        Only the keys present in :data:`UPDATABLE_FIELDS` are applied.
        """
        user = self._require_user(user_id)
        cleaned = self._filter_updatable(updates)
        if not cleaned:
            raise ValidationError("No updatable fields supplied")
        user = self.user_repo.update(user, cleaned)
        self.user_repo.commit()
        log.info("user.profile.update", user_id=user.id, fields=list(cleaned.keys()))
        return user.to_dict()

    UPDATABLE_FIELDS: frozenset[str] = frozenset({
        "display_name",
        "bio",
        "profile_image",
        "cover_image",
        "country",
        "language",
        "timezone",
        "date_of_birth",
        "phone",
    })

    def _filter_updatable(self, updates: dict) -> dict:
        return {k: v for k, v in updates.items() if k in self.UPDATABLE_FIELDS and v is not None}

    # -----------------------------------------------------------------
    # Settings (JSON-blob style — stored on the user row for now)
    # -----------------------------------------------------------------
    def get_settings(self, user_id: str) -> dict:
        """Return the user's settings, merged with defaults.

        Settings are stored as JSON in ``User.bio`` is NOT used; instead
        the scaffold keeps settings in-memory / on the user row via a
        dedicated column added in a future migration. For now, we
        return defaults so the contract is in place.
        """
        self._require_user(user_id)
        # Future: load from a user_settings table or JSON column.
        return dict(DEFAULT_SETTINGS)

    def update_settings(self, user_id: str, updates: dict) -> dict:
        """Patch the user's settings with the values in ``updates``."""
        self._require_user(user_id)
        merged = dict(DEFAULT_SETTINGS)
        merged.update({k: v for k, v in updates.items() if k in DEFAULT_SETTINGS and v is not None})
        log.info("user.settings.update", user_id=user_id, fields=list(updates.keys()))
        # Future: persist merged back to the user's settings column.
        return merged

    # -----------------------------------------------------------------
    # Password / sessions
    # -----------------------------------------------------------------
    def change_password(
        self, user_id: str, current_password: str, new_password: str
    ) -> None:
        """Delegate to :class:`AuthService.change_password`."""
        user = self._require_user(user_id)
        self.auth_service.change_password(user, current_password, new_password)

    def list_sessions(self, user_id: str) -> list[dict]:
        """Return the user's active sessions."""
        from core.enums import SessionType

        sessions = self.auth_service.session_service.list_active(
            user_id, SessionType.USER
        )
        return [
            {
                "id": s.id,
                "jti": s.jti,
                "ip_address": s.ip_address,
                "user_agent": s.user_agent,
                "issued_at": s.issued_at.isoformat() if s.issued_at else None,
                "last_seen": s.last_seen.isoformat() if s.last_seen else None,
                "expires_at": s.expires_at.isoformat() if s.expires_at else None,
            }
            for s in sessions
        ]

    def revoke_session(self, user_id: str, jti: str) -> None:
        """Revoke a single session by ``jti`` (must belong to the user)."""
        session = self.auth_service.session_service.repo.get_by_jti(jti)
        if session is None or session.owner_id != user_id:
            raise NotFoundError("Session not found", code="session_not_found")
        self.auth_service.session_service.revoke(jti)

    def revoke_all_sessions(self, user_id: str) -> int:
        """Revoke every active session for the user."""
        return self.auth_service.logout_all(user_id)

    def get_status(self, user_id: str) -> dict:
        """Return the user's status snapshot (level, XP, streak, status)."""
        user = self._require_user(user_id)
        return {
            "id": user.id,
            "status": user.status,
            "verification_status": user.verification_status,
            "level": user.level,
            "xp": user.xp,
            "daily_streak": user.daily_streak,
            "last_login": user.last_login.isoformat() if user.last_login else None,
        }

    def get_preferences(self, user_id: str) -> dict:
        """Alias for ``get_settings`` (semantically clearer for the API)."""
        return self.get_settings(user_id)

    # -----------------------------------------------------------------
    # Internal
    # -----------------------------------------------------------------
    def _require_user(self, user_id: str) -> User:
        user = self.user_repo.get_by_id(user_id)
        if user is None:
            raise NotFoundError("User not found", code="user_not_found")
        return user
