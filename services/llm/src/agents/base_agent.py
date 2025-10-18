"""
Base Agent

Abstract base class for all LangChain agents.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

from langchain_core.language_models.base import BaseLanguageModel
from langchain_core.prompts import PromptTemplate

from ..config.settings import Settings


class BaseAgent(ABC):
    """Base class for all objective processing agents."""
    
    def __init__(self, llm: BaseLanguageModel, settings: Settings):
        self.llm = llm
        self.settings = settings
    
    @abstractmethod
    def build_prompt(
        self,
        question: str,
        target_product: Optional[str] = None,
        target_category: Optional[str] = None,
        persona: Optional[Dict[str, Any]] = None,
        language: str = "EN"
    ) -> str:
        """Build the prompt for this agent type."""
        pass
    
    async def execute(self, prompt: str) -> str:
        """Execute the LLM with the given prompt."""
        try:
            response = await self.llm.ainvoke(prompt)
            return response.content
        except Exception as e:
            raise Exception(f"LLM execution failed: {str(e)}")
    
    def _format_persona(self, persona: Optional[Dict[str, Any]]) -> str:
        """Format persona for inclusion in prompts."""
        if not persona:
            return ""
        
        persona_parts = []
        for key, value in persona.items():
            if value:
                persona_parts.append(f"{key}: {value}")
        
        return " ".join(persona_parts) if persona_parts else ""