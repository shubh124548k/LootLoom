"""RBAC definitions and permission matrix.

Mirrors :class:`services.permission_service.PermissionService` but is
kept in ``security/`` so middleware / decorators can import it without
pulling in the service layer.
"""
from __future__ import annotations

from typing import Iterable

from core.enums import Permission, Role


# Role → permission set. CEO = superset of all; admin ⊃ moderator ⊃
# (analyst, support); user has no admin permissions.
ROLE_PERMISSIONS: dict[str, frozenset[str]] = {
    Role.USER.value: frozenset(),
    Role.SUPPORT.value: frozenset({
        Permission.USER_VIEW.value,
        Permission.TICKET_VIEW.value,
        Permission.TICKET_REPLY.value,
        Permission.TICKET_CLOSE.value,
        Permission.REDEEM_VIEW.value,
        Permission.WALLET_VIEW.value,
        Permission.ANNOUNCEMENT_CREATE.value,
    }),
    Role.ANALYST.value: frozenset({
        Permission.USER_VIEW.value,
        Permission.WALLET_VIEW.value,
        Permission.WALLET_AUDIT.value,
        Permission.REDEEM_VIEW.value,
        Permission.TICKET_VIEW.value,
        Permission.SETTINGS_VIEW.value,
        Permission.AUDIT_VIEW.value,
    }),
    Role.MODERATOR.value: frozenset({
        Permission.USER_VIEW.value,
        Permission.USER_UPDATE.value,
        Permission.USER_SUSPEND.value,
        Permission.WALLET_VIEW.value,
        Permission.REDEEM_VIEW.value,
        Permission.REDEEM_APPROVE.value,
        Permission.REDEEM_REJECT.value,
        Permission.TICKET_VIEW.value,
        Permission.TICKET_REPLY.value,
        Permission.TICKET_CLOSE.value,
        Permission.REWARD_VIEW.value,
        Permission.ANNOUNCEMENT_CREATE.value,
        Permission.ANNOUNCEMENT_PUBLISH.value,
    }),
    Role.ADMIN.value: frozenset({
        Permission.USER_CREATE.value,
        Permission.USER_BAN.value,
        Permission.USER_DELETE.value,
        Permission.WALLET_ADJUST.value,
        Permission.WALLET_FREEZE.value,
        Permission.WALLET_AUDIT.value,
        Permission.REDEEM_COMPLETE.value,
        Permission.REWARD_CREATE.value,
        Permission.REWARD_UPDATE.value,
        Permission.REWARD_DELETE.value,
        Permission.ANNOUNCEMENT_DELETE.value,
        Permission.SETTINGS_UPDATE.value,
        Permission.FEATUREFLAG_MANAGE.value,
        Permission.AUDIT_VIEW.value,
    }),
    Role.CEO.value: frozenset({p.value for p in Permission}),
}


# Numeric rank used for "at-least-role-X" comparisons.
ROLE_RANK: dict[str, int] = {
    Role.USER.value: 0,
    Role.SUPPORT.value: 1,
    Role.ANALYST.value: 1,
    Role.MODERATOR.value: 2,
    Role.ADMIN.value: 3,
    Role.CEO.value: 4,
}


def permissions_for(role: str) -> frozenset[str]:
    """Return the permission set for ``role``."""
    return ROLE_PERMISSIONS.get(role, frozenset())


def has_permission(role: str, permission: str | Permission) -> bool:
    """Return ``True`` if ``role`` grants ``permission``."""
    perm_value = permission.value if isinstance(permission, Permission) else permission
    return perm_value in permissions_for(role)


def has_any_permission(role: str, permissions: Iterable[str | Permission]) -> bool:
    return any(has_permission(role, p) for p in permissions)


def has_all_permissions(role: str, permissions: Iterable[str | Permission]) -> bool:
    return all(has_permission(role, p) for p in permissions)


def has_role(role: str, required: str | Role) -> bool:
    """Return ``True`` if ``role`` is at-or-above ``required``."""
    required_value = required.value if isinstance(required, Role) else required
    return ROLE_RANK.get(role, 0) >= ROLE_RANK.get(required_value, 0)


def is_ceo(role: str) -> bool:
    """Return ``True`` if ``role`` is the CEO role."""
    return role == Role.CEO.value
