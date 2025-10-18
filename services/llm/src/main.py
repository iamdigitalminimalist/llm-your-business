import signal
import sys
from contextlib import asynccontextmanager
from typing import Optional
import structlog
from fastapi import FastAPI, Depends

from .config.settings import get_settings
from .services.kafka_consumer import KafkaConsumerService
from .services.kafka_producer import KafkaProducerService
from .services.llm_processor import LLMProcessorService
from .services.database_service import DatabaseService
from .utils.logger import setup_logging


class AppState:
    """Application state container for dependency injection."""
    
    def __init__(self):
        self.kafka_consumer: Optional[KafkaConsumerService] = None
        self.kafka_producer: Optional[KafkaProducerService] = None
        self.llm_processor: Optional[LLMProcessorService] = None
        self.database_service: Optional[DatabaseService] = None


# Global app state instance
app_state = AppState()

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info("Starting LLM Service", version="1.0.0")
    
    settings = get_settings()
    
    app_state.database_service = DatabaseService(settings)
    if not await app_state.database_service.ping():
        logger.error("Database connection failed")
        raise Exception("Database connection failed")
    
    app_state.kafka_producer = KafkaProducerService(settings)
    await app_state.kafka_producer.start()
    
    app_state.llm_processor = LLMProcessorService(settings, app_state.kafka_producer)
    app_state.kafka_consumer = KafkaConsumerService(settings, app_state.llm_processor)
    await app_state.kafka_consumer.start()
    
    logger.info("All services started successfully")
    
    try:
        yield
    except Exception as e:
        logger.error("Application error during runtime", error=str(e))
        sys.exit(1)
    finally:
        logger.info("Shutting down services...")
        
        if app_state.kafka_consumer:
            await app_state.kafka_consumer.stop()
        if app_state.kafka_producer:
            await app_state.kafka_producer.close()
        if app_state.database_service:
            await app_state.database_service.close()
            
        logger.info("All services stopped")


app = FastAPI(
    title="LLM Service",
    description="Processes objective questions and produces answers",
    version="1.0.0",
    lifespan=lifespan
)


def get_kafka_consumer() -> Optional[KafkaConsumerService]:
    """Dependency injection for Kafka consumer."""
    return app_state.kafka_consumer


def get_llm_processor() -> Optional[LLMProcessorService]:
    """Dependency injection for LLM processor."""
    return app_state.llm_processor


def get_database_service() -> Optional[DatabaseService]:
    """Dependency injection for database service."""
    return app_state.database_service


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "llm-service", "version": "1.0.0"}


@app.get("/metrics")
async def metrics(
    kafka_consumer: Optional[KafkaConsumerService] = Depends(get_kafka_consumer),
    llm_processor: Optional[LLMProcessorService] = Depends(get_llm_processor)
):
    consumer_stats = kafka_consumer.get_stats() if kafka_consumer else {}
    processor_stats = llm_processor.get_stats() if llm_processor else {}
    
    return {"consumer": consumer_stats, "processor": processor_stats}


def handle_shutdown(signum, frame):
    logger.info("Received shutdown signal", signal=signum)
    sys.exit(0)


if __name__ == "__main__":
    setup_logging()
    signal.signal(signal.SIGTERM, handle_shutdown)
    signal.signal(signal.SIGINT, handle_shutdown)
    
    import uvicorn
    settings = get_settings()
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, log_config=None, access_log=False)