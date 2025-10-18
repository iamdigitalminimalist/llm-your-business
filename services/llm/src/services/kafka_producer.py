import json
from typing import Optional
import structlog
from aiokafka import AIOKafkaProducer
from aiokafka.errors import KafkaError

from ..config.settings import Settings
from ..models.events import ObjectiveExecutionAnswerEvent

logger = structlog.get_logger(__name__)


class KafkaProducerService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.producer: Optional[AIOKafkaProducer] = None
    
    async def start(self):
        try:
            self.producer = AIOKafkaProducer(
                bootstrap_servers=self.settings.kafka_bootstrap_servers,
                value_serializer=lambda v: json.dumps(v, default=str).encode('utf-8'),
                retry_backoff_ms=1000,
                request_timeout_ms=30000
            )
            
            await self.producer.start()
            logger.info("Kafka producer started", 
                       bootstrap_servers=self.settings.kafka_bootstrap_servers,
                       output_topic=self.settings.kafka_output_topic)
            
        except Exception as e:
            logger.error("Failed to start Kafka producer", error=str(e))
            raise
    
    async def close(self):
        if self.producer:
            try:
                await self.producer.stop()
                logger.info("Kafka producer stopped")
            except Exception as e:
                logger.error("Error stopping Kafka producer", error=str(e))
    
    async def publish_answer(self, answer_event: ObjectiveExecutionAnswerEvent):
        try:
            if not self.producer:
                raise KafkaError("Producer not initialized")
            
            event_dict = answer_event.dict()
            
            await self.producer.send_and_wait(
                self.settings.kafka_output_topic,
                value=event_dict,
                key=str(answer_event.execution_id).encode('utf-8')
            )
            
            success = answer_event.status == "completed"
            logger.info("Answer event published",
                       execution_id=str(answer_event.execution_id),
                       question_id=str(answer_event.question_id),
                       success=success,
                       topic=self.settings.kafka_output_topic)
            
        except Exception as e:
            logger.error("Failed to publish answer event",
                        error=str(e),
                        execution_id=str(answer_event.execution_id))
            raise