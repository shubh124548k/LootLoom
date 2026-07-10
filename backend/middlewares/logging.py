"""Request logging middleware.

Logs every request with method, path, status, latency, and the
correlation id set by :mod:`middlewares.request_id`.
"""
from __future__ import annotations

from time import perf_counter

from flask import Flask, g, request
from flask import Response as FlaskResponse

from core.logging import get_logger

log = get_logger("http")


def register(app: Flask) -> None:
    """Register before/after request logging hooks on ``app``."""

    @app.before_request
    def _start_timer() -> None:
        g._req_start = perf_counter()  # type: ignore[attr-defined]

    @app.after_request
    def _log_request(resp: FlaskResponse) -> FlaskResponse:
        elapsed_ms = (perf_counter() - getattr(g, "_req_start", perf_counter())) * 1000.0
        log.info(
            "http.request",
            method=request.method,
            path=request.path,
            status=resp.status_code,
            latency_ms=round(elapsed_ms, 2),
            request_id=getattr(g, "request_id", None),
            ip=request.remote_addr,
        )
        return resp
