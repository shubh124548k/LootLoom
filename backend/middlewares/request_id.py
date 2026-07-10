"""Request-id / correlation-id middleware.

Generates a UUID per request (or honours an inbound ``X-Request-Id``
header), stores it on ``g.request_id``, and echoes it back in the
response headers so downstream systems can correlate logs.
"""
from __future__ import annotations

import uuid

from flask import Flask, g, request, response


REQUEST_ID_HEADER = "X-Request-Id"


def register(app: Flask) -> None:
    """Register before/after request hooks on ``app``."""

    @app.before_request
    def _set_request_id() -> None:
        rid = request.headers.get(REQUEST_ID_HEADER) or str(uuid.uuid4())
        g.request_id = rid

    @app.after_request
    def _echo_request_id(resp: response) -> response:  # type: ignore[valid-type]
        resp.headers[REQUEST_ID_HEADER] = getattr(g, "request_id", "")
        return resp
