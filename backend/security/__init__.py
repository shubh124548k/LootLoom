"""Security primitives package.

* :mod:`security.jwt_manager`  — low-level JWT encode / decode helpers
* :mod:`security.rbac`         — role / permission matrix & checks
* :mod:`security.decorators`   — Flask route decorators
"""
from __future__ import annotations

from .jwt_manager import (
    encode_jwt,
    decode_jwt,
    build_access_claims,
    build_refresh_claims,
)
from .rbac import ROLE_PERMISSIONS, ROLE_RANK, has_permission, has_role, is_ceo
from .decorators import require_auth, require_ceo, require_permission, require_role

__all__ = [
    "encode_jwt",
    "decode_jwt",
    "build_access_claims",
    "build_refresh_claims",
    "ROLE_PERMISSIONS",
    "ROLE_RANK",
    "has_permission",
    "has_role",
    "is_ceo",
    "require_auth",
    "require_ceo",
    "require_permission",
    "require_role",
]
