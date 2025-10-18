import signal
import sys
from contextlib import asynccontextmanager
import structlog
from fastapi import FastAPI

from .config.settings import get_settings
from .services.kafka_consumer import KafkaConsumerService
from .services.kafka_producer import KafkaProducerService
from .services.llm_processor import LLMProcessorService
from .services.database_service import DatabaseService
from .utils.logger import setup_logging

kafka_consumer: KafkaConsumerService = None
kafka_producer: KafkaProducerService = None
llm_processor: LLMProcessorService = None
database_service: DatabaseService = None

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info("Starting LLM Service", version="1.0.0")
    
    global kafka_consumer, kafka_producer, llm_processor, database_service
    settings = get_settings()
    
    database_service = DatabaseService(settings)
    if not await database_service.ping():
        logger.error("Database connection failed")
        raise Exception("Database connection failed")
    
    kafka_producer = KafkaProducerService(settings)
    await kafka_producer.start()
    
    llm_processor = LLMProcessorService(settings, kafka_producer)
    kafka_consumer = KafkaConsumerService(settings, llm_processor)
    await kafka_consumer.start()
    
    logger.info("All services started successfully")
    
    try:
        yield
    except Exception as e:
        logger.error("Application error during runtime", error=str(e))
        sys.exit(1)
    finally:
        logger.info("Shutting down services...")
        
        if kafka_consumer:
            await kafka_consumer.stop()
        if kafka_producer:
            await kafka_producer.close()
        if database_service:
            await database_service.close()
            
        logger.info("All services stopped")


app = FastAPI(
    title="LLM Service",
    description="Processes objective questions and produces answers",
    version="1.0.0",
    lifespan=lifespan
)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "llm-service", "version": "1.0.0"}


@app.get("/metrics")
async def metrics():
    global kafka_consumer, llm_processor
    
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