"""Administrator / CEO repository."""
from __future__ import annotations

from typing import Optional

from sqlalchemy import or_, select

from models.administrator import Administrator
from .base import BaseRepository


class AdministratorRepository(BaseRepository[Administrator]):
    """CRUD + lookup helpers for :class:`Administrator`."""

    def __init__(self) -> None:
        super().__init__(Administrator)

    def get_by_email(self, email: str) -> Optional[Administrator]:
        """Case-insensitive email lookup."""
        stmt = select(Administrator).where(Administrator.email.ilike(email))
        return self.session.scalars(stmt).first()

    def get_by_username(self, username: str) -> Optional[Administrator]:
        """Case-insensitive username lookup."""
        stmt = select(Administrator).where(Administrator.username.ilike(username))
        return self.session.scalars(stmt).first()

    def get_by_identifier(self, identifier: str) -> Optional[Administrator]:
        """Return the admin matching the given username or email."""
        stmt = select(Administrator).where(
            or_(
                Administrator.email.ilike(identifier),
                Administrator.username.ilike(identifier),
            )
        )
        return self.session.scalars(stmt).first()

    def get_ceo(self) -> Optional[Administrator]:
        """Return any CEO-row (there should be exactly one)."""
        return self.get_by(role="ceo")

    def list_by_role(self, role: str) -> list[Administrator]:
        """List every admin with the given role."""
        return self.list(filters={"role": role})
