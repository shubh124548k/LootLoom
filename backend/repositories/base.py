"""Generic CRUD base repository.

Wraps SQLAlchemy session-scoped queries with type-safe helpers so
domain repositories can focus on business queries, not boilerplate.

Subclass and pass the model class as ``model``::

    class UserRepository(BaseRepository[User]):
        def __init__(self):
            super().__init__(User)

Then ``user_repo.create({...})``, ``user_repo.get_by_id(uid)``,
``user_repo.paginate(page=1, page_size=20)`` work out of the box.
"""
from __future__ import annotations

from typing import Any, Generic, Iterable, Optional, Type, TypeVar

from sqlalchemy import desc, asc, func, or_, select
from sqlalchemy.exc import SQLAlchemyError

from core.database import db
from core.exceptions import DatabaseError, NotFoundError
from core.logging import get_logger

T = TypeVar("T")

log = get_logger("repository")


class BaseRepository(Generic[T]):
    """Generic SQLAlchemy CRUD repository."""

    model: Type[T]

    def __init__(self, model: Type[T] | None = None) -> None:
        if model is not None:
            self.model = model
        if not hasattr(self, "model") or self.model is None:
            raise TypeError(f"{self.__class__.__name__} requires a model class")

    # -----------------------------------------------------------------
    # Session helpers
    # -----------------------------------------------------------------
    @property
    def session(self):  # type: ignore[no-untyped-def]
        return db.session

    # -----------------------------------------------------------------
    # Single-row reads
    # -----------------------------------------------------------------
    def get_by_id(self, entity_id: str, *, raise_if_missing: bool = False) -> Optional[T]:
        """Return one row by primary key, optionally raising if missing."""
        obj = self.session.get(self.model, entity_id)
        if obj is None and raise_if_missing:
            raise NotFoundError(
                f"{self.model.__name__} with id={entity_id} not found"
            )
        return obj

    def get_by(self, **filters: Any) -> Optional[T]:
        """Return the first row matching ``filters``."""
        stmt = select(self.model).filter_by(**filters)
        return self.session.scalars(stmt).first()

    def first(self) -> Optional[T]:
        """Return any one row (for bootstrap / sanity checks)."""
        return self.session.scalars(select(self.model).limit(1)).first()

    # -----------------------------------------------------------------
    # Multi-row reads
    # -----------------------------------------------------------------
    def list(
        self,
        *,
        filters: dict | None = None,
        order_by: str | None = None,
        desc_order: bool = False,
        limit: int | None = None,
        offset: int | None = None,
    ) -> list[T]:
        """Return a list of rows matching ``filters``."""
        stmt = select(self.model)
        if filters:
            stmt = stmt.filter_by(**filters)
        if order_by:
            col = getattr(self.model, order_by, None)
            if col is not None:
                stmt = stmt.order_by(desc(col) if desc_order else asc(col))
        if limit is not None:
            stmt = stmt.limit(limit)
        if offset is not None:
            stmt = stmt.offset(offset)
        return list(self.session.scalars(stmt).all())

    def count(self, filters: dict | None = None) -> int:
        """Return the number of rows matching ``filters``."""
        stmt = select(func.count()).select_from(self.model)
        if filters:
            stmt = stmt.filter_by(**filters)
        return int(self.session.scalar(stmt) or 0)

    def paginate(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        filters: dict | None = None,
        order_by: str | None = None,
        desc_order: bool = False,
        search: str | None = None,
        search_fields: Iterable[str] | None = None,
    ) -> tuple[list[T], int]:
        """Return ``(items, total)`` for the requested page.

        ``search`` performs a case-insensitive LIKE on each column in
        ``search_fields`` (OR-ed together).
        """
        page = max(page, 1)
        page_size = max(min(page_size, 100), 1)

        stmt = select(self.model)
        count_stmt = select(func.count()).select_from(self.model)

        if filters:
            stmt = stmt.filter_by(**filters)
            count_stmt = count_stmt.filter_by(**filters)

        if search and search_fields:
            clauses = []
            for field_name in search_fields:
                col = getattr(self.model, field_name, None)
                if col is None:
                    continue
                clauses.append(col.ilike(f"%{search}%"))
            if clauses:
                stmt = stmt.filter(or_(*clauses))
                count_stmt = count_stmt.filter(or_(*clauses))

        if order_by:
            col = getattr(self.model, order_by, None)
            if col is not None:
                stmt = stmt.order_by(desc(col) if desc_order else asc(col))
        else:
            stmt = stmt.order_by(desc(self.model.created_at))

        stmt = stmt.limit(page_size).offset((page - 1) * page_size)

        items = list(self.session.scalars(stmt).all())
        total = int(self.session.scalar(count_stmt) or 0)
        return items, total

    # -----------------------------------------------------------------
    # Writes
    # -----------------------------------------------------------------
    def create(self, data: dict) -> T:
        """Insert a new row from a dict of column values."""
        try:
            obj = self.model(**data)
            self.session.add(obj)
            self.session.flush()
            self.session.refresh(obj)
            return obj
        except SQLAlchemyError as exc:
            self.session.rollback()
            log.error("repository.create.failed", model=self.model.__name__, error=str(exc))
            raise DatabaseError("Failed to create record", details={"model": self.model.__name__}) from exc

    def update(self, entity: T, data: dict) -> T:
        """Patch an existing row with the values in ``data``."""
        try:
            for key, value in data.items():
                if hasattr(entity, key):
                    setattr(entity, key, value)
            self.session.flush()
            self.session.refresh(entity)
            return entity
        except SQLAlchemyError as exc:
            self.session.rollback()
            log.error("repository.update.failed", model=self.model.__name__, error=str(exc))
            raise DatabaseError("Failed to update record") from exc

    def delete(self, entity: T, *, hard: bool = False) -> None:
        """Delete (or soft-delete) a row."""
        try:
            if hard:
                self.session.delete(entity)
            else:
                if hasattr(entity, "soft_delete"):
                    entity.soft_delete()  # type: ignore[attr-defined]
                else:
                    self.session.delete(entity)
            self.session.flush()
        except SQLAlchemyError as exc:
            self.session.rollback()
            log.error("repository.delete.failed", model=self.model.__name__, error=str(exc))
            raise DatabaseError("Failed to delete record") from exc

    def commit(self) -> None:
        """Commit the current transaction."""
        try:
            self.session.commit()
        except SQLAlchemyError as exc:
            self.session.rollback()
            log.error("repository.commit.failed", error=str(exc))
            raise DatabaseError("Transaction commit failed") from exc
