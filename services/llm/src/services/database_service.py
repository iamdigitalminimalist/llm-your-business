from typing import Dict, Any, Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from bson import ObjectId
import structlog

logger = structlog.get_logger(__name__)


class DatabaseService:
    def __init__(self, settings):
        self.client = AsyncIOMotorClient(settings.mongodb_url)
        self.db: AsyncIOMotorDatabase = self.client[settings.mongodb_database]
        
    async def close(self):
        self.client.close()
        
    async def ping(self):
        try:
            await self.client.admin.command('ping')
            logger.info("Database connection successful")
            return True
        except Exception as e:
            logger.error("Database connection failed", error=str(e))
            return False
    
    async def get_objective(self, objective_id: str) -> Optional[Dict[str, Any]]:
        try:
            obj_id = ObjectId(objective_id)
            objective_doc = await self.db.objectives.find_one({"_id": obj_id})
            
            if objective_doc:
                objective_doc["_id"] = str(objective_doc["_id"])
                logger.info("Objective retrieved successfully", 
                          objective_id=objective_id, 
                          title=objective_doc.get("title", "Unknown"))
                return objective_doc
            else:
                logger.warning("Objective not found", objective_id=objective_id)
                return None
                
        except Exception as e:
            logger.error("Error retrieving objective", objective_id=objective_id, error=str(e))
            return None
