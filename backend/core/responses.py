"""Standardised API response helpers.

Every controller returns a payload produced by one of these helpers so
the wire format stays consistent across all endpoints:

    {
        "success": bool,
        "data":    <any> | null,
        "message": str | null,
        "error":   {"code": str, "details": any} | null,
        "meta":    {"page": int, "page_size": int, "total": int, ...} | null,
        "timestamp": "<iso-8601>",
        "request_id": "<uuid>"
    }
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Iterable

from flask import jsonify, request, g


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _request_id() -> str | None:
    """Return the current request id (set by ``request_id`` middleware)."""
    return getattr(g, "request_id", None) or request.headers.get("X-Request-Id")


def _payload(
    success: bool,
    data: Any = None,
    message: str | None = None,
    error: dict | None = None,
    meta: dict | None = None,
    status_code: int = 200,
    extra: dict | None = None,
) -> tuple[Any, int]:
    """Build the standardised envelope and (json, status_code) tuple."""
    body: dict[str, Any] = {
        "success": success,
        "data": data,
        "message": message,
        "error": error,
        "meta": meta,
        "timestamp": _iso_now(),
        "request_id": _request_id(),
    }
    if extra:
        body.update(extra)
    return jsonify(body), status_code


def success(data: Any = None, message: str | None = None, status_code: int = 200) -> tuple[Any, int]:
    """200-class success response."""
    return _payload(True, data=data, message=message, status_code=status_code)


def created(data: Any = None, message: str | None = "Created") -> tuple[Any, int]:
    """201 Created response."""
    return _payload(True, data=data, message=message, status_code=201)


def accepted(data: Any = None, message: str | None = "Accepted") -> tuple[Any, int]:
    """202 Accepted response (async / queued work)."""
    return _payload(True, data=data, message=message, status_code=202)


def no_content() -> tuple[Any, int]:
    """204 No Content response (empty body)."""
    return jsonify(None), 204


def error(
    code: str,
    message: str,
    status_code: int = 400,
    details: Any = None,
) -> tuple[Any, int]:
    """Error response — ``code`` is a stable machine-readable string."""
    return _payload(
        False,
        data=None,
        error={"code": code, "message": message, "details": details},
        status_code=status_code,
    )


def paginated(
    items: Iterable[Any],
    page: int,
    page_size: int,
    total: int,
    message: str | None = None,
    extra_meta: dict | None = None,
) -> tuple[Any, int]:
    """Paginated list response with a populated ``meta`` block."""
    items_list = list(items)
    pages = (total + page_size - 1) // page_size if page_size else 1
    meta: dict[str, Any] = {
        "page": page,
        "page_size": page_size,
        "total": total,
        "pages": pages,
        "has_next": page < pages,
        "has_prev": page > 1,
    }
    if extra_meta:
        meta.update(extra_meta)
    return _payload(
        True,
        data=items_list,
        message=message,
        meta=meta,
        status_code=200,
    )


def validation_error(field_errors: dict[str, Any]) -> tuple[Any, int]:
    """Helper for input validation errors."""
    return error(
        code="validation_error",
        message="Input validation failed",
        status_code=422,
        details=field_errors,
    )
