"""Centralised error handler middleware.

Converts any :class:`core.exceptions.AppError` (and a few common
SQLAlchemy / Pydantic exceptions) into the standard JSON envelope via
:func:`core.responses.error`. Uncaught exceptions become a 500 with a
generic message and a full stack trace in the logs.
"""
from __future__ import annotations

from typing import Any

from flask import Flask, jsonify
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from pydantic import ValidationError as PydanticValidationError

from core.exceptions import AppError, DatabaseError, ValidationError
from core.logging import get_logger
from core.responses import _iso_now, _request_id  # type: ignore[attr-defined]

log = get_logger("error_handler")


def register(app: Flask) -> None:
    """Register error handlers on ``app``."""

    @app.errorhandler(AppError)
    def _handle_app_error(exc: AppError) -> tuple[Any, int]:
        log.warning(
            "app.error",
            code=exc.code,
            message=exc.message,
            status=exc.status_code,
            details=exc.details,
        )
        return _envelope(
            code=exc.code,
            message=exc.message,
            details=exc.details,
            status_code=exc.status_code,
        )

    @app.errorhandler(PydanticValidationError)
    def _handle_pydantic_error(
        exc: PydanticValidationError,
    ) -> tuple[Any, int]:
        log.warning("app.error", code="validation_error", message=str(exc))
        return _envelope(
            code="validation_error",
            message="Input validation failed",
            details=exc.errors(),
            status_code=422,
        )

    @app.errorhandler(IntegrityError)
    def _handle_integrity_error(exc: IntegrityError) -> tuple[Any, int]:
        log.error("app.error", code="integrity_error", message=str(exc))
        return _envelope(
            code="conflict",
            message="Database integrity constraint violated",
            details=None,
            status_code=409,
        )

    @app.errorhandler(SQLAlchemyError)
    def _handle_sqlalchemy_error(exc: SQLAlchemyError) -> tuple[Any, int]:
        log.error("app.error", code="database_error", message=str(exc))
        return _envelope(
            code="database_error",
            message="Database operation failed",
            details=None,
            status_code=500,
        )

    @app.errorhandler(404)
    def _handle_404(_exc):  # type: ignore[no-untyped-def]
        return _envelope(
            code="not_found",
            message="Resource not found",
            details=None,
            status_code=404,
        )

    @app.errorhandler(405)
    def _handle_405(_exc):  # type: ignore[no-untyped-def]
        return _envelope(
            code="method_not_allowed",
            message="HTTP method not allowed",
            details=None,
            status_code=405,
        )

    @app.errorhandler(Exception)
    def _handle_unexpected(exc: Exception) -> tuple[Any, int]:
        log.exception("app.error.unexpected", error=str(exc))
        return _envelope(
            code="internal_error",
            message="An unexpected error occurred",
            details=None,
            status_code=500,
        )


def _envelope(
    *,
    code: str,
    message: str,
    details: Any,
    status_code: int,
) -> tuple[Any, int]:
    body = {
        "success": False,
        "data": None,
        "message": message,
        "error": {"code": code, "message": message, "details": details},
        "meta": None,
        "timestamp": _iso_now(),
        "request_id": _request_id(),
    }
    return jsonify(body), status_code
