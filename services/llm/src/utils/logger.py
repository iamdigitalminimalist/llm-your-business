import logging
import sys
from typing import Any, Dict

import structlog


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
                level_styles={
                    "debug": "\033[36m",     # Cyan
                    "info": "\033[32m",      # Green  
                    "warning": "\033[33m",   # Yellow
                    "error": "\033[31m",     # Red
                    "critical": "\033[35m",  # Magenta
                },
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