import time
from datetime import datetime
import structlog

from ..config.settings import Settings
from ..models.events import ObjectiveExecutionQuestionEvent, ObjectiveExecutionAnswerEvent
from ..services.kafka_producer import KafkaProducerService
from ..services.database_service import DatabaseService
from ..utils.exceptions import ProcessingError

logger = structlog.get_logger(__name__)


class LLMProcessorService:
    def __init__(self, settings: Settings, kafka_producer: KafkaProducerService):
        self.settings = settings
        self.kafka_producer = kafka_producer
        self.database = DatabaseService(settings)
        self._stats = {
            "questions_processed": 0,
            "questions_failed": 0,
            "total_processing_time_ms": 0,
            "average_processing_time_ms": 0
        }
    
    async def process_question(self, event: ObjectiveExecutionQuestionEvent):
        start_time = time.time()
        
        try:
            logger.info("Starting question processing",
                       manifest_id=event.manifest_id,
                       execution_id=event.execution_id,
                       objective_id=event.objective_id,
                       question_id=event.question_id,
                       model=event.model)
            
            objective_doc = await self.database.get_objective(event.objective_id)
            if not objective_doc:
                raise ProcessingError(f"Objective not found: {event.objective_id}")
            
            logger.info("Objective retrieved",
                       objective_id=event.objective_id,
                       objective_title=objective_doc.get("title", "Unknown"),
                       objective_type=objective_doc.get("type", "Unknown"))
            
            answer_text = f"Processed objective '{objective_doc.get('title', 'Unknown')}' " \
                         f"for question {event.question_id} using {event.model} model. " \
                         f"Language: {event.language}. " \
                         f"Objective content: {str(objective_doc.get('content', 'No content'))[:200]}..."
            
            processing_time_ms = int((time.time() - start_time) * 1000)
            answer_event = ObjectiveExecutionAnswerEvent(
                manifest_id=event.manifest_id,
                execution_id=event.execution_id,
                objective_id=event.objective_id,
                question_id=event.question_id,
                persona=event.persona,
                language=event.language,
                model=event.model,
                answer=answer_text,
                status="completed",
                processed_at=datetime.utcnow(),
                processing_time_ms=processing_time_ms
            )
            
            await self.kafka_producer.publish_answer(answer_event)
            self._update_stats(processing_time_ms, success=True)
            
            logger.info("Question processed successfully",
                       question_id=event.question_id,
                       processing_time_ms=processing_time_ms,
                       objective_title=objective_doc.get("title", "Unknown"))
            
        except Exception as e:
            processing_time_ms = int((time.time() - start_time) * 1000)
            await self._handle_processing_error(event, e, processing_time_ms)
            self._update_stats(processing_time_ms, success=False)
            raise
    
    async def _handle_processing_error(self, event: ObjectiveExecutionQuestionEvent, error: Exception, processing_time_ms: int):
        try:
            error_event = ObjectiveExecutionAnswerEvent(
                manifest_id=event.manifest_id,
                execution_id=event.execution_id,
                objective_id=event.objective_id,
                question_id=event.question_id,
                persona=event.persona,
                language=event.language,
                model=event.model,
                answer="",
                status="failed",
                processed_at=datetime.utcnow(),
                processing_time_ms=processing_time_ms
            )
            
            await self.kafka_producer.publish_answer(error_event)
            logger.error("Published error event", execution_id=str(event.execution_id), error=str(error))
            
        except Exception as publish_error:
            logger.error("Failed to publish error event", 
                        original_error=str(error), 
                        publish_error=str(publish_error))
    
    def _update_stats(self, processing_time_ms: int, success: bool):
        if success:
            self._stats["questions_processed"] += 1
        else:
            self._stats["questions_failed"] += 1
        
        self._stats["total_processing_time_ms"] += processing_time_ms
        
        total_questions = self._stats["questions_processed"] + self._stats["questions_failed"]
        if total_questions > 0:
            self._stats["average_processing_time_ms"] = (
                self._stats["total_processing_time_ms"] // total_questions
            )
    
    def get_stats(self) -> dict:
        return dict(self._stats)