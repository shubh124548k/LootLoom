"""Administrator / CEO model.

Completely separate from the user model — different table, different
auth flow, different permissions. Holds the staff-only accounts that
operate the admin / CEO console.

Future-proofing fields (kept as comments / placeholders):
* OTP secret (TOTP)
* Passkey credentials
* Trusted devices
* IP allowlist
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, DateTime, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import db
from core.base_model import BaseModel
from core.enums import AdminRole, AdminStatus


class Administrator(BaseModel):
    """Staff account — CEO, admin, moderator, analyst, or support."""

    __tablename__ = "administrators"
    __table_args__ = (
        UniqueConstraint("username", name="uq_admins_username"),
        UniqueConstraint("email", name="uq_admins_email"),
        Index("ix_admins_role", "role"),
        Index("ix_admins_status", "status"),
    )

    # --- Identity -------------------------------------------------------
    admin_id: Mapped[str] = mapped_column(String(36), nullable=False, unique=True)
    username: Mapped[str] = mapped_column(String(64), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # --- Role / permission ---------------------------------------------
    role: Mapped[str] = mapped_column(
        String(32), default=AdminRole.ADMIN.value, nullable=False
    )
    permission_level: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # --- Status / security ---------------------------------------------
    status: Mapped[str] = mapped_column(
        String(32), default=AdminStatus.ACTIVE.value, nullable=False
    )
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime)
    last_login_ip: Mapped[Optional[str]] = mapped_column(String(64))
    password_changed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # --- Future (placeholders) -----------------------------------------
    # otp_secret: Mapped[Optional[str]] = mapped_column(String(255))
    # passkey_credentials: Mapped[Optional[dict]] (JSON column on PG)
    # trusted_devices: Mapped[Optional[list]] (JSON column on PG)
    # ip_allowlist: Mapped[Optional[list]] (JSON column on PG)

    # --- Relationships --------------------------------------------------
    audit_logs: Mapped[list["AuditLog"]] = relationship(
        "AuditLog", back_populates="admin"
    )
    handled_redeems: Mapped[list["RedeemRequest"]] = relationship(
        "RedeemRequest", back_populates="admin"
    )
    handled_tickets: Mapped[list["SupportTicket"]] = relationship(
        "SupportTicket", back_populates="admin"
    )

    def to_dict(self, exclude: set[str] | None = None) -> dict:
        exclude = (exclude or set()) | {"password_hash"}
        return super().to_dict(exclude=exclude)
