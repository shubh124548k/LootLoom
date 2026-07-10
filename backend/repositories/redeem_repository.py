"""Redeem request repository (interface-level).

Defines the contract for redeem persistence. The full redeem workflow
(approval, processing, completion) is implemented in later prompts —
this repository provides the data-access primitives.
"""
from __future__ import annotations

from typing import Optional

from sqlalchemy import select, func

from models.redeem import RedeemRequest
from core.enums import RedeemStatus
from .base import BaseRepository


class RedeemRepository(BaseRepository[RedeemRequest]):
    """CRUD + lifecycle queries for :class:`RedeemRequest`."""

    def __init__(self) -> None:
        super().__init__(RedeemRequest)

    def get_by_redeem_id(self, redeem_id: str) -> Optional[RedeemRequest]:
        return self.get_by(redeem_id=redeem_id)

    def list_by_user(
        self,
        user_id: str,
        *,
        status: Optional[RedeemStatus] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[RedeemRequest], int]:
        """Paginated list of a user's redeem requests."""
        stmt = select(RedeemRequest).where(RedeemRequest.user_id == user_id)
        count_stmt = (
            select(func.count()).select_from(RedeemRequest).where(RedeemRequest.user_id == user_id)
        )
        if status:
            stmt = stmt.where(RedeemRequest.status == status.value)
            count_stmt = count_stmt.where(RedeemRequest.status == status.value)
        stmt = stmt.order_by(RedeemRequest.requested_time.desc())
        stmt = stmt.limit(page_size).offset((page - 1) * page_size)
        items = list(self.session.scalars(stmt).all())
        total = int(self.session.scalar(count_stmt) or 0)
        return items, total

    def list_pending(
        self, page: int = 1, page_size: int = 20
    ) -> tuple[list[RedeemRequest], int]:
        """Admin view — list pending redeem requests."""
        stmt = (
            select(RedeemRequest)
            .where(RedeemRequest.status == RedeemStatus.PENDING.value)
            .order_by(RedeemRequest.requested_time.asc())
        )
        count_stmt = (
            select(func.count())
            .select_from(RedeemRequest)
            .where(RedeemRequest.status == RedeemStatus.PENDING.value)
        )
        stmt = stmt.limit(page_size).offset((page - 1) * page_size)
        items = list(self.session.scalars(stmt).all())
        total = int(self.session.scalar(count_stmt) or 0)
        return items, total
