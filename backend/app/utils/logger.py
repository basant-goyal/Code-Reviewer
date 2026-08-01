"""
logger.py — Structured Application Logger
==========================================
WHY THIS FILE EXISTS:
    Python's built-in `print()` is useless in production.
    A proper logger gives you:
    - Timestamps on every message.
    - Log levels (DEBUG/INFO/WARNING/ERROR) so you can filter noise.
    - A single config point — change LOG_LEVEL in .env and all modules adjust.

HOW IT INTERACTS:
    Every other module does:
        from app.utils.logger import logger
        logger.info("Something happened")
    This file creates and configures that shared logger instance.

KEY CONCEPT — logging.getLogger(__name__):
    Using __name__ as the logger name means each module gets a logger named
    after its own path (e.g. "app.services.gemini_service").
    This lets you enable DEBUG only for one module in production if needed.
"""

import logging
import sys
from app.config.settings import settings


def _setup_logger() -> logging.Logger:
    """Configure and return the application-wide logger."""

    log = logging.getLogger("ai_code_reviewer")

    # Prevent adding duplicate handlers if this function is called more than once.
    if log.handlers:
        return log

    log.setLevel(settings.LOG_LEVEL.upper())

    # Handler: stream to stdout so logs show in the terminal and in Docker.
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(settings.LOG_LEVEL.upper())

    # Format: timestamp | level | logger name | message
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    log.addHandler(handler)

    return log


# Module-level singleton. Import this everywhere: `from app.utils.logger import logger`
logger = _setup_logger()
