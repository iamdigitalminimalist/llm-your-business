"""
Custom Exceptions

Exception classes for the LLM service.
"""


class LLMServiceError(Exception):
    """Base exception for LLM service errors."""
    pass


class ProcessingError(LLMServiceError):
    """Exception raised when processing a question fails."""
    pass


class LLMError(LLMServiceError):
    """Exception raised when LLM API calls fail."""
    pass


class KafkaError(LLMServiceError):
    """Exception raised when Kafka operations fail."""
    pass


class DatabaseError(LLMServiceError):
    """Exception raised when database operations fail."""
    pass


class ConfigurationError(LLMServiceError):
    """Exception raised when configuration is invalid."""
    pass