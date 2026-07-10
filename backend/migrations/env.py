"""Alembic migration environment for LootLoom.

Auto-detects model changes via Flask-Migrate / SQLAlchemy autogenerate.
"""
from __future__ import annotations

import logging
from logging.config import fileConfig

from alembic import context
from flask import current_app

# this is the Alembic Config object
config = context.config

# Interpret config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

logger = logging.getLogger("alembic.env")


def get_engine():
    """Get the SQLAlchemy engine from the Flask app."""
    try:
        return current_app.extensions["migrate"].db.get_engine()
    except (TypeError, AttributeError):
        return current_app.extensions["migrate"].db.engine


def get_engine_url():
    """Get the database URL for migrations."""
    try:
        return get_engine().url.render_as_string(hide_password=False).replace(
            "%", "%%"
        )
    except AttributeError:
        return str(get_engine().url).replace("%", "%%")


# Set the SQLAlchemy URL in alembic config
config.set_main_option("sqlalchemy.url", get_engine_url())
target_metadata = current_app.extensions["migrate"].db.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (emit SQL to a file)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode (connected to the DB)."""
    def process_revision_directives(context, revision, directives):
        if getattr(config.cmd_opts, "autogenerate", False):
            script = directives[0]
            if script.upgrade_ops.is_empty():
                directives[:] = []
                logger.info("No changes in schema detected.")

    connectable = get_engine()

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            process_revision_directives=process_revision_directives,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
