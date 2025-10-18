"""
Pros and Cons Agent

Specialized agent for "pros_and_cons" objectives.
"""

from typing import Dict, Any, Optional

from .base_agent import BaseAgent


class ProsConsAgent(BaseAgent):
    """Agent for analyzing pros and cons."""
    
    def build_prompt(
        self,
        question: str,
        target_product: Optional[str] = None,
        target_category: Optional[str] = None,
        persona: Optional[Dict[str, Any]] = None,
        language: str = "EN"
    ) -> str:
        """Build prompt for pros and cons analysis."""
        
        persona_str = self._format_persona(persona)
        
        prompt_parts = []
        
        if persona_str:
            prompt_parts.append(f"As a {persona_str},")
        
        prompt_parts.append(question)
        
        if target_product:
            prompt_parts.append(f"What are the pros and cons of using {target_product}?")
        
        if language.upper() != "EN":
            prompt_parts.append(f"Please respond in {language}.")
        
        prompt_parts.append(
            "Please structure your response with clear 'Pros:' and 'Cons:' sections, "
            "providing specific, actionable insights for each point."
        )
        
        return " ".join(prompt_parts)