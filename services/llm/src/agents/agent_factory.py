"""
Agent Factory

Creates appropriate LangChain agents based on objective type and model.
"""

from typing import Dict, Any
from langchain_openai import ChatOpenAI

from ..config.settings import Settings
from .base_agent import BaseAgent
from .recommendation_agent import TopRecommendationAgent
from .competitor_agent import CompetitorAnalysisAgent
from .pros_cons_agent import ProsConsAgent


OPENAI_MODELS = {
    "gpt-3.5-turbo",
    "gpt-3.5-turbo-16k", 
    "gpt-4",
    "gpt-4-turbo",
    "gpt-4o",
    "gpt-4o-mini",
}


class AgentFactory:
    """Factory for creating LangChain agents based on objective type."""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self._agents: Dict[str, type] = {
            "top_5_recommendation": TopRecommendationAgent,
            "main_competitors": CompetitorAnalysisAgent,
            "pros_and_cons": ProsConsAgent,
        }
    
    def get_agent(self, objective_type: str, model: str) -> BaseAgent:
        """Get appropriate agent for objective type and model."""
        
        # Get agent class
        agent_class = self._agents.get(objective_type)
        if not agent_class:
            raise ValueError(f"Unknown objective type: {objective_type}")
        
        # Create LLM instance
        llm = self._create_llm(model)
        
        # Return agent instance
        return agent_class(llm, self.settings)
    
    def _create_llm(self, model: str):
        """Create LLM instance - currently supports OpenAI models only."""
        # Check if it's a supported OpenAI model
        if model in OPENAI_MODELS or model.startswith(("gpt-", "chatgpt-")):
            return self._create_openai_llm()
        
        raise ValueError(f"Unsupported model: {model}. Supported models: {sorted(OPENAI_MODELS)}")
    
    def _create_openai_llm(self):
        """Create OpenAI LLM instance."""
        if not self.settings.openai_api_key:
            raise ValueError("OpenAI API key not configured")
        
        return ChatOpenAI(
            model=self.settings.openai_model,
            api_key=self.settings.openai_api_key,
            temperature=self.settings.openai_temperature,
            max_tokens=self.settings.openai_max_tokens
        )