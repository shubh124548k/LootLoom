"""Support ticket + ticket message models.

A :class:`SupportTicket` is owned by a user and may be assigned to an
administrator. The conversation is a list of :class:`TicketMessage`
rows written by the user, an admin, or the system (auto-replies).
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import String, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import db
from core.base_model import BaseModel
from core.enums import (
    SupportStatus,
    SupportCategory,
    SupportPriority,
    TicketMessageSender,
)


class SupportTicket(BaseModel):
    """A support ticket opened by a user."""

    __tablename__ = "support_tickets"
    __table_args__ = (
        Index("ix_tickets_user", "user_id"),
        Index("ix_tickets_admin", "admin_id"),
        Index("ix_tickets_status", "status"),
        Index("ix_tickets_priority", "priority"),
        Index("ix_tickets_category", "category"),
    )

    ticket_id: Mapped[str] = mapped_column(String(36), nullable=False, unique=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    admin_id: Mapped[Optional[str]] = mapped_column(ForeignKey("administrators.id"))

    category: Mapped[str] = mapped_column(
        String(32), default=SupportCategory.OTHER.value, nullable=False
    )
    priority: Mapped[str] = mapped_column(
        String(16), default=SupportPriority.NORMAL.value, nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(32), default=SupportStatus.OPEN.value, nullable=False
    )

    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    created_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    resolved_time: Mapped[Optional[datetime]] = mapped_column(DateTime)
    last_reply_time: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # --- Relationships --------------------------------------------------
    user: Mapped["User"] = relationship("User", back_populates="tickets")
    admin: Mapped[Optional["Administrator"]] = relationship(
        "Administrator", back_populates="handled_tickets"
    )
    messages: Mapped[list["TicketMessage"]] = relationship(
        "TicketMessage",
        back_populates="ticket",
        cascade="all, delete-orphan",
        order_by="TicketMessage.created_time",
    )


class TicketMessage(BaseModel):
    """A single message in a support ticket thread."""

    __tablename__ = "ticket_messages"
    __table_args__ = (
        Index("ix_ticket_msgs_ticket", "ticket_id"),
        Index("ix_ticket_msgs_created", "created_time"),
    )

    ticket_id: Mapped[str] = mapped_column(
        ForeignKey("support_tickets.id"), nullable=False
    )
    sender: Mapped[str] = mapped_column(
        String(16), default=TicketMessageSender.USER.value, nullable=False
    )
    sender_id: Mapped[Optional[str]] = mapped_column(String(36))
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    # --- Relationships --------------------------------------------------
    ticket: Mapped["SupportTicket"] = relationship(
        "SupportTicket", back_populates="messages"
    )
