"""HTTP middlewares (before / after request hooks)."""
from __future__ import annotations

from .request_id import register as register_request_id
from .logging import register as register_logging
from .auth import register as register_auth
from .error_handler import register as register_error_handler

__all__ = [
    "register_request_id",
    "register_logging",
    "register_auth",
    "register_error_handler",
]
