"""AuditLog model — every privileged admin action lands here.

Rows are append-only. The :class:`Administrator` who performed the
action is recorded via ``admin_id``. ``module`` is the affected feature
area (``wallet``, ``redeem``, ``user``, ``settings``, ...) and
``severity`` follows :class:`core.enums.Severity`.

Future placeholders:
* IP address
* device fingerprint / user-agent
* before/after payload (JSON)
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import String, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import db
from core.base_model import BaseModel
from core.enums import Severity, AuditAction


class AuditLog(BaseModel):
    """Append-only audit trail entry for an admin action."""

    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_admin", "admin_id"),
        Index("ix_audit_action", "action"),
        Index("ix_audit_module", "module"),
        Index("ix_audit_severity", "severity"),
        Index("ix_audit_timestamp", "timestamp"),
    )

    admin_id: Mapped[Optional[str]] = mapped_column(ForeignKey("administrators.id"))
    action: Mapped[str] = mapped_column(
        String(32), default=AuditAction.UPDATE.value, nullable=False
    )
    module: Mapped[str] = mapped_column(String(64), nullable=False)
    severity: Mapped[str] = mapped_column(
        String(16), default=Severity.INFO.value, nullable=False
    )
    target_type: Mapped[Optional[str]] = mapped_column(String(64))
    target_id: Mapped[Optional[str]] = mapped_column(String(36))
    description: Mapped[Optional[str]] = mapped_column(Text)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    # --- Future placeholders -------------------------------------------
    # ip_address: Mapped[Optional[str]] = mapped_column(String(64))
    # user_agent: Mapped[Optional[str]] = mapped_column(String(255))
    # before_state: Mapped[Optional[dict]] (JSON column on PG)
    # after_state:  Mapped[Optional[dict]] (JSON column on PG)

    # --- Relationships --------------------------------------------------
    admin: Mapped[Optional["Administrator"]] = relationship(
        "Administrator", back_populates="audit_logs"
    )
