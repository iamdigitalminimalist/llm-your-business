package requests

import (
	"encoding/json"
	"fmt"
	"strings"

	models "llm-your-business/services/go/models"
)

// systemPromptForPersonas returns the system prompt text for persona generation.
func (s *Suggestions) systemPromptForPersonas(count int) string {
	return strings.TrimSpace(fmt.Sprintf(`
        You are a market research assistant specializing in user personas.

        Generate EXACTLY %d distinct personas suitable for the product described by the user.

        Response format and validation:
        - Return ONLY a JSON array that conforms to this Persona list schema:
        %s

        Persona content rules:
        - name: 2–3 words, distinctive, no emojis.
        - short_description: <= 10 words summary.
        - description: concrete, detailed narrative including age, education, occupation, seniority,
            location, goals (relevant to the product), pain points, motivations, budget if relevant,
            decision criteria, and typical usage context.
        - Make personas meaningfully different in demographics, needs, and use cases.
        - Avoid marketing fluff; be realistic and specific.
`, count, models.PersonaListSchema))
}

// userPromptForPersonas returns the user prompt text embedding the product JSON and count.
func (s *Suggestions) userPromptForPersonas(product models.ProductDescription, count int) string {
	pdJSON, _ := json.Marshal(product)
	return strings.TrimSpace(fmt.Sprintf(`
        Product description (JSON):
        %s

        Please produce %d personas.
`, string(pdJSON), count))
}
