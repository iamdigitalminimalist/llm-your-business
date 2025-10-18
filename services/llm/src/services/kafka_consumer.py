"""
Kafka Consumer Service

Consumes 'objective.execution.question' events and routes them to the LLM processor.
"""

import asyncio
import json
from typing import Optional
from uuid import UUID

import structlog
from aiokafka import AIOKafkaConsumer
from aiokafka.errors import KafkaError

from ..config.settings import Settings
from ..models.events import ObjectiveExecutionQuestionEvent
from ..services.llm_processor import LLMProcessorService
from ..utils.exceptions import ProcessingError

logger = structlog.get_logger(__name__)


class KafkaConsumerService:
    """
    Kafka consumer that processes objective execution questions.
    """
    
    def __init__(self, settings: Settings, llm_processor: LLMProcessorService):
        self.settings = settings
        self.llm_processor = llm_processor
        self.consumer: Optional[AIOKafkaConsumer] = None
        self._running = False
        self._stats = {
            "messages_processed": 0,
            "messages_failed": 0,
            "last_processed_at": None
        }
    
    async def start(self):
        """Start the Kafka consumer."""
        try:
            self.consumer = AIOKafkaConsumer(
                self.settings.kafka_input_topic,
                bootstrap_servers=self.settings.kafka_bootstrap_servers,
                group_id=self.settings.kafka_consumer_group,
                auto_offset_reset='latest',  # Start from latest messages
                enable_auto_commit=True,
                auto_commit_interval_ms=1000,
                value_deserializer=lambda m: json.loads(m.decode('utf-8'))
            )
            
            await self.consumer.start()
            self._running = True
            
            logger.info(
                "Kafka consumer started",
                topic=self.settings.kafka_input_topic,
                group_id=self.settings.kafka_consumer_group
            )
            
            # Start consuming in background
            asyncio.create_task(self._consume_loop())
            
        except Exception as e:
            logger.error("Failed to start Kafka consumer", error=str(e))
            raise
    
    async def stop(self):
        """Stop the Kafka consumer."""
        self._running = False
        
        if self.consumer:
            try:
                await self.consumer.stop()
                logger.info("Kafka consumer stopped")
            except Exception as e:
                logger.error("Error stopping Kafka consumer", error=str(e))
    
    async def _consume_loop(self):
        """Main consumption loop."""
        logger.info("Starting message consumption loop")
        
        try:
            async for message in self.consumer:
                if not self._running:
                    break
                
                try:
                    await self._process_message(message)
                except Exception as e:
                    logger.error(
                        "Error processing message",
                        error=str(e),
                        topic=message.topic,
                        partition=message.partition,
                        offset=message.offset
                    )
                    self._stats["messages_failed"] += 1
                
        except Exception as e:
            logger.error("Error in consumption loop", error=str(e))
            if self._running:
                # Try to restart after a delay
                await asyncio.sleep(5)
                asyncio.create_task(self._consume_loop())
    
    async def _process_message(self, message):
        """Process a single Kafka message."""
        try:
            # Parse the event
            event_data = message.value
            event = ObjectiveExecutionQuestionEvent(**event_data)
            
            logger.info(
                "Processing question event",
                manifest_id=event.manifest_id,
                execution_id=event.execution_id,
                objective_id=event.objective_id,
                question_id=event.question_id,
                model=event.model,
                language=event.language
            )
            
            # Process with LLM service
            await self.llm_processor.process_question(event)
            
            self._stats["messages_processed"] += 1
            self._stats["last_processed_at"] = message.timestamp
            
        except Exception as e:
            logger.error(
                "Failed to process message",
                error=str(e),
                message_value=message.value
            )
            raise ProcessingError(f"Message processing failed: {str(e)}")
    
    def get_stats(self) -> dict:
        """Get consumer statistics."""
        return {
            "running": self._running,
            "topic": self.settings.kafka_input_topic,
            "consumer_group": self.settings.kafka_consumer_group,
            **self._stats
        }