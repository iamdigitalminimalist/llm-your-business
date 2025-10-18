from typing import Dict, Any
from langchain_openai import ChatOpenAI

from ..config.settings import Settings
from .base_agent import BaseAgent
from .recommendation_agent import TopRecommendationAgent
from .competitor_agent import CompetitorAnalysisAgent
from .pros_cons_agent import ProsConsAgent


OPENAI_MODELS = {
    "gpt-3.5-turbo",
    "gpt-4",
    "gpt-4-turbo",
    "gpt-4-turbo-preview",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-5",
    "gpt-5-mini",
    "chatgpt-4o-latest",
    "o1-preview",
    "o1-mini",
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
        agent_class = self._agents.get(objective_type)
        if not agent_class:
            raise ValueError(f"Unknown objective type: {objective_type}")
        
        # Create LLM instance
        llm = self._create_llm(model)
        
        # Return agent instance
        return agent_class(llm, self.settings)
    
    def _create_llm(self, model: str):
        if model in OPENAI_MODELS:
            return self._create_openai_llm()
        
        raise ValueError(f"Unsupported model: {model}. Supported models: {sorted(OPENAI_MODELS)}")
    
    def _create_openai_llm(self):
        if not self.settings.openai_api_key:
            raise ValueError("OpenAI API key not configured")
        
        return ChatOpenAI(
            model=self.settings.openai_model,
            api_key=self.settings.openai_api_key,
            temperature=self.settings.openai_temperature,
            max_tokens=self.settings.openai_max_tokens
        )