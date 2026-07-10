"""Structured logging configuration (structlog).

Provides a single :func:`get_logger` helper that returns a configured
``structlog`` logger. Two renderers are supported via ``LOG_FORMAT``:

* ``json`` — machine-readable, one JSON object per line (production).
* ``console`` — colourised, human-readable (development).

Call :func:`configure_logging` once from the Flask app factory before
the first log message is emitted.
"""
from __future__ import annotations

import logging
import sys
from typing import Any

import structlog
from structlog.types import EventDict, Processor


def _add_request_id(
    _logger: Any, _method_name: str, event_dict: EventDict
) -> EventDict:
    """Inject the current Flask ``g.request_id`` into every log event."""
    try:
        from flask import g, has_app_context

        if has_app_context():
            rid = getattr(g, "request_id", None)
            if rid:
                event_dict["request_id"] = rid
    except Exception:  # pragma: no cover - logging must never raise
        pass
    return event_dict


def configure_logging(level: str = "INFO", fmt: str = "json") -> None:
    """Configure structlog + stdlib logging once at app startup.

    Parameters
    ----------
    level:
        Logging level name (``DEBUG``, ``INFO``, ...).
    fmt:
        ``json`` or ``console``.
    """
    log_level = getattr(logging, level.upper(), logging.INFO)

    shared_processors: list[Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso", utc=True),
        _add_request_id,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]

    if fmt == "console":
        renderer: Processor = structlog.dev.ConsoleRenderer(colors=True)
    else:
        renderer = structlog.processors.JSONRenderer()

    structlog.configure(
        processors=[*shared_processors, renderer],
        wrapper_class=structlog.make_filtering_bound_logger(log_level),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Bridge stdlib logging into structlog so libraries (SQLAlchemy,
    # Flask, ...) also produce structured output.
    logging.basicConfig(
        level=log_level,
        stream=sys.stdout,
        format="%(message)s",
        force=True,
    )
    for name in ("sqlalchemy", "flask", "werkzeug"):
        logging.getLogger(name).setLevel(logging.WARNING)


def get_logger(name: str | None = None) -> Any:
    """Return a configured structlog logger."""
    return structlog.get_logger(name)
