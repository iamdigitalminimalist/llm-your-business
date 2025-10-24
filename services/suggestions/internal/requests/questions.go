package requests

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	models "llm-your-business/services/go/models"
)

// QuestionTypeInfo is the public shape returned by the API to describe
// supported question types. Prompt text is intentionally not exposed here.
type QuestionTypeInfo struct {
	Key         string `json:"key"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

// QuestionTypeCatalog returns the available question types with metadata
// suitable for driving a UI. The authoritative prompts are internal.
func (s *Suggestions) QuestionTypeCatalog() []QuestionTypeInfo {
	return []QuestionTypeInfo{
		{
			Key:         string(models.QuestionTypeTop10),
			Title:       "Top 10 in Category",
			Description: "Generate questions that elicit a list of the top 10 companies/products in the category (general, not brand-specific).",
		},
		{
			Key:         string(models.QuestionTypeProductKeyFeatures),
			Title:       "Product Key Features",
			Description: "Generate questions that elicit the key features of the specific product using the provided product details.",
		},
	}
}

// Schema: array of strings
const questionsListSchema = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "QuestionsList",
  "type": "array",
  "minItems": 1,
  "items": { "type": "string" }
}`

func (s *Suggestions) systemPromptForQuestions(questionType models.QuestionType) (string, error) {
	switch questionType {
	case models.QuestionTypeTop10:
		return `You are an AI that generates realistic user questions to help people compare and choose
				similar products or services. Given a product description and product category, create
				natural-sounding user prompts that someone might ask when deciding between similar options.
				Each generated prompt must explicitly include the phrase "give me 10 options for X", where X
				is the type of product / service. The prompts must never mention or reference the specific
				product itself, but should relate to the general category and touch on different aspects
 				such as quality, features, value, design, reliability, availability, reputation, or
				experience. Make each prompt sound natural and conversational. Assume each prompt will be asked
				by a different person, they should be a question a user could ask as the first interaction with the llm.
				return results in the provided json schema: ` + questionsListSchema, nil

	case models.QuestionTypeProductKeyFeatures:
		return "Questions should ask for the key features and capabilities of the product described in the provided details. Avoid using brand names; refer to it generically as 'the product' if needed.", nil
	default:
		return "", errors.New(fmt.Sprintf("Missing question type: %s", questionType))
	}
}

// userPromptForQuestions builds the user prompt for question generation and
// mirrors error behavior for unknown question types.
func (s *Suggestions) userPromptForQuestions(questionType models.QuestionType, product models.ProductDescription, count int) (string, error) {
	switch questionType {
	case models.QuestionTypeTop10, models.QuestionTypeProductKeyFeatures:
		pdJSON, _ := json.Marshal(product)
		return strings.TrimSpace(fmt.Sprintf(`
Product description (JSON):
%s

You must produce %d questions.
`, string(pdJSON), count)), nil
	default:
		return "", errors.New(fmt.Sprintf("Missing question type: %s", questionType))
	}
}
