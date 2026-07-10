"""SQLAlchemy database instance and session helpers.

Exposes a single shared :class:`Flask-SQLAlchemy` ``db`` object used by
every model, repository, and migration. ``ScopedSession`` is provided
for use outside Flask request context (CLI / background jobs).
"""
from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker, scoped_session

# The single SQLAlchemy instance used across the backend.
db = SQLAlchemy()


# A scoped session for use outside Flask request handlers (CLI scripts,
# background workers, migrations). Inside a request, prefer ``db.session``.
_engine = None
_SessionFactory: sessionmaker | None = None
_ScopedSession: scoped_session | None = None


def init_scoped_session(database_uri: str) -> None:
    """Initialise the scoped session for out-of-request usage."""
    global _engine, _SessionFactory, _ScopedSession
    if _engine is not None:
        return
    _engine = create_engine(database_uri, future=True)
    _SessionFactory = sessionmaker(bind=_engine, expire_on_commit=False)
    _ScopedSession = scoped_session(_SessionFactory)


@contextmanager
def session_scope() -> Iterator[Session]:
    """Context manager that yields a fresh SQLAlchemy session.

    Commits on success, rolls back on exception, and always closes the
    session. Used by repositories / services when running outside a
    Flask request lifecycle.
    """
    if _ScopedSession is None:
        raise RuntimeError("init_scoped_session() must be called first")
    session = _ScopedSession()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
        _ScopedSession.remove()
