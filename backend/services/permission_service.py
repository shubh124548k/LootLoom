"""Permission service — RBAC engine.

Maps roles → permissions and answers ``has_permission`` /
``has_role`` checks. Used by the security decorators.
"""
from __future__ import annotations

from typing import Iterable

from core.enums import AdminRole, Permission, Role


class PermissionService:
    """Role-Based Access Control helper."""

    # Role → set of permissions. CEO is a strict superset of every
    # other role; admin is a superset of moderator; and so on.
    ROLE_PERMISSIONS: dict[str, frozenset[str]] = {
        Role.USER.value: frozenset(),  # users have no admin permissions
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
            # Everything a moderator can do, plus:
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
        Role.CEO.value: frozenset({p.value for p in Permission}),  # all
    }

    # -----------------------------------------------------------------
    # Queries
    # -----------------------------------------------------------------
    @classmethod
    def permissions_for(cls, role: str) -> frozenset[str]:
        """Return the permission set granted to ``role``."""
        return cls.ROLE_PERMISSIONS.get(role, frozenset())

    @classmethod
    def has_permission(cls, role: str, permission: str | Permission) -> bool:
        """Return ``True`` if ``role`` grants ``permission``."""
        perm_value = permission.value if isinstance(permission, Permission) else permission
        return perm_value in cls.permissions_for(role)

    @classmethod
    def has_any_permission(cls, role: str, permissions: Iterable[str | Permission]) -> bool:
        """Return ``True`` if ``role`` grants any of ``permissions``."""
        return any(cls.has_permission(role, p) for p in permissions)

    @classmethod
    def has_all_permissions(cls, role: str, permissions: Iterable[str | Permission]) -> bool:
        """Return ``True`` if ``role`` grants every one of ``permissions``."""
        return all(cls.has_permission(role, p) for p in permissions)

    @classmethod
    def has_role(cls, role: str, required: str | Role | AdminRole) -> bool:
        """Return ``True`` if ``role`` is at-or-above ``required``.

        Ordering (ascending): user < support < analyst < moderator <
        admin < ceo.
        """
        rank = {
            Role.USER.value: 0,
            Role.SUPPORT.value: 1,
            Role.ANALYST.value: 1,
            Role.MODERATOR.value: 2,
            Role.ADMIN.value: 3,
            Role.CEO.value: 4,
        }
        required_value = (
            required.value if isinstance(required, (Role, AdminRole)) else required
        )
        return rank.get(role, 0) >= rank.get(required_value, 0)

    @classmethod
    def is_ceo(cls, role: str) -> bool:
        """Convenience check for the CEO role."""
        return role == Role.CEO.value or role == AdminRole.CEO.value
