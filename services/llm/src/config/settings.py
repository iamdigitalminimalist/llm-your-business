"""
Application Settings

Environment-based configuration using Pydantic Settings.
"""

from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Kafka Configuration
    kafka_bootstrap_servers: str = Field(
        default="localhost:9092",
        description="Kafka bootstrap servers"
    )
    kafka_input_topic: str = Field(
        default="objective.execution.question",
        description="Topic to consume question events from"
    )
    kafka_output_topic: str = Field(
        default="objective.execution.answer", 
        description="Topic to publish answer events to"
    )
    kafka_consumer_group: str = Field(
        default="llm-service-group",
        description="Kafka consumer group ID"
    )
    
    # Database Configuration
    mongodb_url: str = Field(
        default="mongodb://localhost:27017/llm_business",
        alias="DATABASE_URL",
        description="MongoDB connection URL"
    )
    mongodb_database: str = Field(
        default="llm_business",
        description="MongoDB database name"
    )
    
    # LLM API Configuration
    openai_api_key: str = Field(
        default="",
        alias="OPENAI_API_KEY",
        description="OpenAI API key"
    )
    openai_model: str = Field(
        default="gpt-4o-mini",
        description="OpenAI model to use"
    )
    openai_temperature: float = Field(
        default=0.7,
        description="OpenAI model temperature"
    )
    openai_max_tokens: int = Field(
        default=2000,
        description="OpenAI model max tokens"
    )
    
    # Service Configuration
    log_level: str = Field(
        default="INFO",
        description="Logging level (DEBUG, INFO, WARNING, ERROR)"
    )
    max_retries: int = Field(
        default=3,
        description="Maximum number of retry attempts"
    )
    processing_timeout: int = Field(
        default=300,
        description="Processing timeout in seconds"
    )
    
    # Model Configuration
    default_temperature: float = Field(
        default=0.7,
        description="Default temperature for LLM models"
    )
    max_tokens: int = Field(
        default=2000,
        description="Maximum tokens for LLM responses"
    )
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "populate_by_name": True,  # Allow both field name and alias
    }


# Global settings instance
_settings: Settings = None


def get_settings() -> Settings:
    """Get application settings singleton."""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings