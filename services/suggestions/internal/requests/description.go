package requests

import (
	"fmt"
	"sort"
	"strings"

	models "llm-your-business/services/go/models"
)

// systemPromptForDescription builds the system prompt for product description extraction.
func (s *Suggestions) systemPromptForDescription() string {
	// Provide optional category hints from known constants to improve accuracy.
	catList := models.ProductCategoryValues()
	sort.Strings(catList)

	return strings.TrimSpace(fmt.Sprintf(`
        You are a data extraction assistant.
        Validate your output against this JSON Schema for ProductDescription and produce ONLY a JSON object instance conforming to it:
        %s
        Constraints:
        - Do not add any extra keys.
        - Do not include comments or markdown fences.
        - If a field is unknown, use an empty string.
        - For ProductCategory, choose the most relevant from this list if possible: %s.
        - If the user provides a website, visit or infer its business purpose from the domain and page context. Prefer factual, specific descriptions of what the company actually does rather than generic AI/tech phrases.
        - The "product_name" should describe the main product or service the company provides.
        - The "product_short_description" must clearly explain what the product or service does, who it helps, and how it works, in one or two concise sentences.
        - Keep the style factual, neutral, and technically descriptive (no marketing language).
        - If the company provides a service, treat that service as the product.
        - Use industry-relevant terms (e.g., “debt management,” “payment automation,” “customer analytics”) when appropriate.
        `, models.ProductDescriptionSchema, strings.Join(catList, ", ")))
}

// userPromptForDescription builds the user prompt from the identifier (name/website/details).
func (s *Suggestions) userPromptForDescription(identifier string) string {
	return strings.TrimSpace(identifier)
}
