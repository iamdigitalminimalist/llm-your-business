"""
Top Recommendation Agent

Specialized agent for "top_5_recommendation" objectives.
"""

from typing import Dict, Any, Optional

from .base_agent import BaseAgent


class TopRecommendationAgent(BaseAgent):
    """Agent for processing top 5 recommendation questions."""
    
    def build_prompt(
        self,
        question: str,
        target_product: Optional[str] = None,
        target_category: Optional[str] = None,
        persona: Optional[Dict[str, Any]] = None,
        language: str = "EN"
    ) -> str:
        """Build prompt for top 5 recommendations."""
        
        persona_str = self._format_persona(persona)
        
        # Base prompt template
        prompt_parts = []
        
        if persona_str:
            prompt_parts.append(f"As a {persona_str},")
        
        prompt_parts.append(question)
        
        if target_category:
            prompt_parts.append(f"Give me a list of top 5 {target_category}.")
        else:
            prompt_parts.append("Give me a list of top 5 recommendations.")
        
        # Language-specific instructions
        if language.upper() != "EN":
            prompt_parts.append(f"Please respond in {language}.")
        
        # Format requirements
        prompt_parts.append(
            "Format your response as a clear ranked list (1-5) with brief explanations."
        )
        
        return " ".join(prompt_parts)