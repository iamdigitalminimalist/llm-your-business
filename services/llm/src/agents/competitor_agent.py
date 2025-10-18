"""
Competitor Analysis Agent

Specialized agent for "main_competitors" objectives.
"""

from typing import Dict, Any, Optional

from .base_agent import BaseAgent


class CompetitorAnalysisAgent(BaseAgent):
    """Agent for analyzing main competitors."""
    
    def build_prompt(
        self,
        question: str,
        target_product: Optional[str] = None,
        target_category: Optional[str] = None,
        persona: Optional[Dict[str, Any]] = None,
        language: str = "EN"
    ) -> str:
        """Build prompt for competitor analysis."""
        
        persona_str = self._format_persona(persona)
        
        prompt_parts = []
        
        if persona_str:
            prompt_parts.append(f"As a {persona_str},")
        
        prompt_parts.append(question)
        
        if target_product and target_category:
            prompt_parts.append(
                f"Who are the main competitors of {target_product} in the {target_category} space?"
            )
        elif target_category:
            prompt_parts.append(f"Who are the main players in the {target_category} market?")
        
        if language.upper() != "EN":
            prompt_parts.append(f"Please respond in {language}.")
        
        prompt_parts.append(
            "Provide a comprehensive analysis including market position, "
            "strengths, and competitive advantages of each competitor."
        )
        
        return " ".join(prompt_parts)