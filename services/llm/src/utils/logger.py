import logging
import sys
from typing import Any, Dict

import structlog


# ANSI Color Constants for better maintainability
class Colors:
    """ANSI color codes for terminal output."""
    CYAN = "\033[36m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    RED = "\033[31m"
    MAGENTA = "\033[35m"
    RESET = "\033[0m"

LOG_LEVEL_COLORS: Dict[str, str] = {
    "debug": Colors.CYAN, 
    "info": Colors.GREEN,
    "warning": Colors.YELLOW,
    "error": Colors.RED,
    "critical": Colors.MAGENTA,
}


def setup_logging(level: str = "INFO", json_logs: bool = False) -> None:
    numeric_level = getattr(logging, level.upper(), logging.INFO)
    
    processors = [
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
    ]
    
    if json_logs:
        processors.append(structlog.processors.JSONRenderer())
    else:
        processors.extend([
            structlog.dev.ConsoleRenderer(
                colors=True,
                level_styles=LOG_LEVEL_COLORS,
                pad_level=4  # Reduce padding for level names
            ),
        ])
    
    structlog.configure(
        processors=processors,
        wrapper_class=structlog.stdlib.BoundLogger,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )
    
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=numeric_level,
    )
    
    logging.getLogger("kafka").setLevel(logging.WARNING)
    logging.getLogger("aiokafka").setLevel(logging.WARNING)
    logging.getLogger("motor").setLevel(logging.WARNING)
    logging.getLogger("pymongo").setLevel(logging.WARNING)


def get_logger(name: str) -> Any:
    """Get a logger instance."""
    return structlog.get_logger(name)