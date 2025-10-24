package requests

import (
	"context"
	"encoding/json"
	"fmt"

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
func (s *Suggestions) GetDescription(ctx context.Context, identifier string) (models.ProductDescription, chatgpt.Usage, error) {
	var result models.ProductDescription

	// Build prompts via helpers and force model to gpt-5
	sys := chatgpt.Message{Role: "system", Content: s.systemPromptForDescription()}
	user := chatgpt.Message{Role: "user", Content: s.userPromptForDescription(identifier)}

	text, usage, err := s.cg.ChatWithCache(ctx, []chatgpt.Message{sys, user}, "gpt-5", 0, 2000, "")
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
func (s *Suggestions) GetPersonas(ctx context.Context, product models.ProductDescription, count int) ([]models.Persona, chatgpt.Usage, error) {
	if count <= 0 {
		count = 3
	}

	// Build prompts via helpers and force model to gpt-5
	sys := chatgpt.Message{Role: "system", Content: s.systemPromptForPersonas(count)}
	user := chatgpt.Message{Role: "user", Content: s.userPromptForPersonas(product, count)}

	text, usage, err := s.cg.ChatWithCache(ctx, []chatgpt.Message{sys, user}, "gpt-5", 0.7, 0, "")
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
func (s *Suggestions) GetQuestions(ctx context.Context, product models.ProductDescription, count int, questionType models.QuestionType) ([]string, chatgpt.Usage, error) {
	if count <= 0 || count >= 50 {
		count = 3
	}

	systemPrompt, err := s.systemPromptForQuestions(questionType)
	if err != nil {
		return nil, chatgpt.Usage{}, err
	}

	sys := chatgpt.Message{Role: "system", Content: systemPrompt}
	userText, err := s.userPromptForQuestions(questionType, product, count)
	if err != nil {
		return nil, chatgpt.Usage{}, err
	}
	user := chatgpt.Message{Role: "user", Content: userText}

	text, usage, err := s.cg.ChatWithCache(ctx, []chatgpt.Message{sys, user}, "gpt-5", 0.7, 0, "")
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
