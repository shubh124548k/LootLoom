"""User repository — domain-specific queries on :class:`User`."""
from __future__ import annotations

from typing import Optional

from sqlalchemy import or_, select
from sqlalchemy.orm import selectinload

from models.user import User
from .base import BaseRepository


class UserRepository(BaseRepository[User]):
    """CRUD + lookup helpers for :class:`User`."""

    def __init__(self) -> None:
        super().__init__(User)

    # -----------------------------------------------------------------
    # Lookups
    # -----------------------------------------------------------------
    def get_by_email(self, email: str) -> Optional[User]:
        """Case-insensitive email lookup."""
        stmt = select(User).where(User.email.ilike(email))
        return self.session.scalars(stmt).first()

    def get_by_username(self, username: str) -> Optional[User]:
        """Case-insensitive username lookup."""
        stmt = select(User).where(User.username.ilike(username))
        return self.session.scalars(stmt).first()

    def get_by_identifier(self, identifier: str) -> Optional[User]:
        """Return the user matching the given username or email."""
        stmt = select(User).where(
            or_(User.email.ilike(identifier), User.username.ilike(identifier))
        )
        return self.session.scalars(stmt).first()

    def get_by_referral_code(self, code: str) -> Optional[User]:
        """Return the user owning ``code`` (exact match)."""
        return self.get_by(referral_code=code)

    def get_with_wallet(self, user_id: str) -> Optional[User]:
        """Eager-load the user's wallet."""
        stmt = select(User).options(selectinload(User.wallet)).where(User.id == user_id)
        return self.session.scalars(stmt).first()

    # -----------------------------------------------------------------
    # Existence checks
    # -----------------------------------------------------------------
    def email_exists(self, email: str) -> bool:
        return self.get_by_email(email) is not None

    def username_exists(self, username: str) -> bool:
        return self.get_by_username(username) is not None

    def referral_code_exists(self, code: str) -> bool:
        return self.get_by_referral_code(code) is not None
