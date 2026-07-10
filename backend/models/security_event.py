"""SecurityEvent model — security-relevant audit trail.

Records suspicious or notable security events (failed logins, password
changes, account locks, etc.). Distinct from :class:`AuditLog` which
tracks privileged admin actions.

Future placeholders:
* IP / device fingerprint
* geolocation
* risk score
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import Mapped, mapped_column

from core.database import db
from core.base_model import BaseModel
from core.enums import SecurityEventType, Severity


class SecurityEvent(BaseModel):
    """Security-relevant audit entry."""

    __tablename__ = "security_events"
    __table_args__ = (
        Index("ix_security_user", "user_id"),
        Index("ix_security_admin", "admin_id"),
        Index("ix_security_type", "type"),
        Index("ix_security_severity", "severity"),
        Index("ix_security_timestamp", "timestamp"),
    )

    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id"))
    admin_id: Mapped[Optional[str]] = mapped_column(ForeignKey("administrators.id"))

    type: Mapped[str] = mapped_column(String(64), nullable=False)
    severity: Mapped[str] = mapped_column(
        String(16), default=Severity.LOW.value, nullable=False
    )
    description: Mapped[Optional[str]] = mapped_column(Text)
    ip_address: Mapped[Optional[str]] = mapped_column(String(64))
    user_agent: Mapped[Optional[str]] = mapped_column(String(255))
    metadata_json: Mapped[Optional[str]] = mapped_column(Text)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    # --- Future placeholders -------------------------------------------
    # geolocation: Mapped[Optional[str]] = mapped_column(String(255))
    # risk_score: Mapped[Optional[int]] = mapped_column(Integer)
