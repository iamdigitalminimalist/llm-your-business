import asyncio
import json
from typing import Any, Dict, Optional
from datetime import datetime
import logging


def setup_logging(level: str = "INFO") -> logging.Logger:
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    return logging.getLogger(__name__)


def serialize_datetime(obj: Any) -> Any:
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


def safe_json_loads(data: str, default: Any = None) -> Any:
    try:
        return json.loads(data)
    except (json.JSONDecodeError, TypeError):
        return default


def safe_json_dumps(data: Any, default: Any = serialize_datetime) -> str:
    try:
        return json.dumps(data, default=default)
    except (TypeError, ValueError) as e:
        logging.error(f"JSON serialization error: {e}")
        return "{}"


async def retry_async(
    func,
    max_retries: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: tuple = (Exception,)
) -> Any:
    last_exception = None
    
    for attempt in range(max_retries + 1):
        try:
            return await func()
        except exceptions as e:
            last_exception = e
            if attempt == max_retries:
                break
            
            await asyncio.sleep(delay * (backoff ** attempt))
    
    raise last_exception


def extract_error_message(error: Exception) -> str:
    if hasattr(error, 'message'):
        return str(error.message)
    return str(error)


def validate_required_env_vars(*var_names: str) -> Dict[str, str]:
    import os
    
    missing_vars = []
    env_vars = {}
    
    for var_name in var_names:
        value = os.getenv(var_name)
        if not value:
            missing_vars.append(var_name)
        else:
            env_vars[var_name] = value
    
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    return env_vars


class AsyncContextManager:
    """Base class for async context managers."""
    
    async def __aenter__(self):
        await self.start()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.stop()
    
    async def start(self):
        """Start the context manager."""
        pass
    
    async def stop(self):
        """Stop the context manager."""
        pass