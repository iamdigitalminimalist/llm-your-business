package requests

import (
    "context"
    "encoding/json"
    "fmt"
    "sort"
    "strings"

    models "llm-your-business/services/go/models"
    "llm-your-business/services/suggestions/internal/chatgpt"
)

// Suggestions wraps high-level request methods backed by a ChatGPT client.
type Suggestions struct {
    cg *chatgpt.Client
}

func New(cg *chatgpt.Client) *Suggestions { return &Suggestions{cg: cg} }

// GetProductDescription takes a product/company name or website and asks the model
// to return a JSON object that decodes into models.ProductDescription.
// It generates the requested output format from the Go struct using reflection,
// instructs the model to conform exactly, and returns the parsed ProductDescription.
func (s *Suggestions) GetDescription(ctx context.Context, identifier string, model string) (models.ProductDescription, chatgpt.Usage, error) {
    var result models.ProductDescription

	// Provide optional category hints from known constants to improve accuracy.
	catList := models.ProductCategoryValues()
	sort.Strings(catList)

	sys := chatgpt.Message{Role: "system", Content: strings.TrimSpace(fmt.Sprintf(`
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
`, models.ProductDescriptionSchema, strings.Join(catList, ", ")))}

	// User should only include product/company name, website, or other brief details.
	user := chatgpt.Message{Role: "user", Content: strings.TrimSpace(identifier)}

    text, usage, err := s.cg.ChatWithCache(ctx, []chatgpt.Message{sys, user}, model, 0, 300, "")
    if err != nil {
        return result, usage, err
    }

    // Decode into the target struct.
    norm := normalizeJSON(text, false)
    if err := json.Unmarshal([]byte(norm), &result); err != nil {
        return result, usage, fmt.Errorf("parse ProductDescription: %w; raw=%s", err, text)
    }
    return result, usage, nil
}

// GetPersonas generates N personas tailored to the product.
// - count defaults to 3 when <= 0
// - Returns a slice of models.Persona (name, short_description, description)
// GetPersonas generates N personas tailored to the provided product description.
// The description must be supplied by the caller; this method does not call GetDescription.
func (s *Suggestions) GetPersonas(ctx context.Context, product models.ProductDescription, model string, count int) ([]models.Persona, chatgpt.Usage, error) {
    if count <= 0 {
        count = 3
    }

    // Anchor persona generation to provided product description
    pdJSON, _ := json.Marshal(product)

    // Categories guidance
    catList := models.ProductCategoryValues()
    sort.Strings(catList)

    sys := chatgpt.Message{Role: "system", Content: strings.TrimSpace(fmt.Sprintf(`
You are a market research assistant specializing in user personas.

Generate EXACTLY %d distinct personas suitable for the product described by the user.

Response format and validation:
- Return ONLY a JSON array that conforms to this Persona list schema:
%s

Persona content rules:
- name: 2–3 words, distinctive, no emojis.
- short_description: <= 10 words summary.
- description: concrete, detailed narrative including age, education, occupation, seniority, location, goals (relevant to the product), pain points, motivations, budget if relevant, decision criteria, and typical usage context.
- Make personas meaningfully different in demographics, needs, and use cases.
- Avoid marketing fluff; be realistic and specific.
`, count, models.PersonaListSchema))}

    user := chatgpt.Message{Role: "user", Content: strings.TrimSpace(fmt.Sprintf(`
Product description (JSON):
%s

Please produce %d personas.
`, string(pdJSON), count))}

    text, usage, err := s.cg.ChatWithCache(ctx, []chatgpt.Message{sys, user}, model, 0.7, 0, "")
    if err != nil {
        return nil, usage, err
    }

    var personas []models.Persona
    norm := normalizeJSON(text, true)
    if err := json.Unmarshal([]byte(norm), &personas); err != nil {
        return nil, usage, fmt.Errorf("parse personas: %w; raw=%s", err, text)
    }
    // Basic sanity: ensure requested count
    if len(personas) != count {
        // Do not fail hard; return what we have.
    }
    return personas, usage, nil
}

// GetQuestions generates N questions to ask an LLM about the product's
// category or usage, without mentioning the product or company directly.
// Returns a list of question strings.
func (s *Suggestions) GetQuestions(ctx context.Context, product models.ProductDescription, model string, count int, qType models.QuestionTypeInfo) ([]string, chatgpt.Usage, error) {
    if count <= 0 {
        count = 3
    }

    pdJSON, _ := json.Marshal(product)

    // Schema: array of strings
    const questionsListSchema = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "QuestionsList",
  "type": "array",
  "minItems": 1,
  "items": { "type": "string" }
}`

    // Determine question type prompt; if empty, default to first catalog
    qt := qType
    if qt.Key == "" && len(models.QuestionTypeCatalog) > 0 {
        qt = models.QuestionTypeCatalog[0]
    }

    sys := chatgpt.Message{Role: "system", Content: strings.TrimSpace(fmt.Sprintf(`
You are a market research assistant.

Generate EXACTLY %d distinct, insightful questions that one could ask an LLM about this product's category or usage.

Constraints:
- Do NOT mention the product or company names directly.
- Focus on the broader category, pain points, use cases, evaluation criteria, best practices, adoption barriers, ROI, security/compliance, integration, and alternatives.
- Keep questions concise and unambiguous.
- Avoid duplicates and superficial rewording.

Emphasis for this question set:
%s

Response format:
- Return ONLY a JSON array of strings that validates against this schema:
%s
`, count, qt.Prompt, questionsListSchema))}

    user := chatgpt.Message{Role: "user", Content: strings.TrimSpace(fmt.Sprintf(`
Product description (JSON):
%s

Please produce %d questions.
`, string(pdJSON), count))}

    text, usage, err := s.cg.ChatWithCache(ctx, []chatgpt.Message{sys, user}, model, 0.7, 0, "")
    if err != nil {
        return nil, usage, err
    }
    norm := normalizeJSON(text, true)
    var questions []string
    if err := json.Unmarshal([]byte(norm), &questions); err != nil {
        return nil, usage, fmt.Errorf("parse questions: %w; raw=%s", err, text)
    }
    return questions, usage, nil
}
