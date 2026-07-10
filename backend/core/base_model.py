"""Shared :class:`BaseModel` mixin.

Every domain model inherits from this to get:
* UUID primary key (string-stored for SQLite / PostgreSQL portability)
* ``created_at`` / ``updated_at`` timestamps (UTC)
* A soft-delete placeholder column (``is_deleted``) — soft-delete
  behaviour is intentionally a placeholder; per-domain logic can opt in.
* A ``to_dict`` helper used by serializers.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from .database import db


def _utcnow() -> datetime:
    """UTC now helper (avoids the deprecated ``datetime.utcnow``)."""
    return datetime.now(timezone.utc)


def _generate_uuid() -> str:
    """Return a new UUID4 as a string."""
    return str(uuid.uuid4())


class BaseModel(db.Model):
    """Abstract base model — not a real table.

    Inherit from this in domain models to inherit the shared columns
    below. Subclasses must declare ``__tablename__`` and
    ``__abstract__ = False`` (the latter is the default).
    """

    __abstract__ = True

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=_generate_uuid,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=_utcnow,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=_utcnow,
        onupdate=_utcnow,
        nullable=False,
    )

    # Soft-delete placeholder — kept here so every table has it and
    # future soft-delete filters can be applied uniformly.
    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
    )

    # ---- Convenience helpers -----------------------------------------
    def to_dict(self, exclude: set[str] | None = None) -> dict:
        """Serialise the model to a plain ``dict``.

        Datetimes are emitted as ISO-8601 strings; relationships are
        not expanded by default (callers can override).
        """
        exclude = exclude or set()
        result: dict = {}
        for column in self.__table__.columns:
            if column.name in exclude:
                continue
            value = getattr(self, column.name, None)
            if isinstance(value, datetime):
                value = value.isoformat()
            result[column.name] = value
        return result

    def soft_delete(self) -> None:
        """Mark this row as soft-deleted (does not commit)."""
        self.is_deleted = True
        self.updated_at = _utcnow()

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"<{self.__class__.__name__} id={self.id}>"
