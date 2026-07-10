"""Flask application entry point.

Run with::

    flask --app wsgi run --debug
    # or
    python wsgi.py
"""
from __future__ import annotations

from app import create_app

app = create_app()


if __name__ == "__main__":
    config = app.config
    app.run(
        host=config.get("HOST", "0.0.0.0"),
        port=int(config.get("PORT", 5000)),
        debug=config.get("DEBUG", False),
    )
