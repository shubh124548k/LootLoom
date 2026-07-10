"""Core infrastructure package.

Houses cross-cutting primitives: the SQLAlchemy database instance, the
shared :class:`BaseModel` mixin, enums, response helpers, custom
exceptions, and structured logging setup.
"""
from __future__ import annotations

from .database import db
from .base_model import BaseModel
from . import enums
from . import responses
from . import exceptions

__all__ = ["db", "BaseModel", "enums", "responses", "exceptions"]
