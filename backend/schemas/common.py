"""Common shared schema primitives."""
from __future__ import annotations

from typing import Generic, TypeVar, Optional, Any

from pydantic import BaseModel, Field

T = TypeVar("T")


class IdSchema(BaseModel):
    """Schema for endpoints that only return an id."""

    id: str


class PaginationSchema(BaseModel):
    """Query-string pagination + filter params."""

    page: int = Field(default=1, ge=1, description="Page number (1-indexed)")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page")
    sort_by: Optional[str] = Field(default=None, description="Column to sort by")
    sort_dir: Optional[str] = Field(default="asc", pattern="^(asc|desc)$")
    search: Optional[str] = Field(default=None, description="Free-text search term")


class PaginationMeta(BaseModel):
    """Pagination metadata returned in the ``meta`` envelope."""

    page: int
    page_size: int
    total: int
    pages: int
    has_next: bool
    has_prev: bool


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response envelope (used for type-checking only)."""

    success: bool = True
    data: list[T]
    meta: PaginationMeta
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    """Standard error response envelope."""

    success: bool = False
    error: dict[str, Any]
    message: Optional[str] = None
