package api

import (
	models "llm-your-business/services/go/models"
)

// ProductDescriptionRequest is the request body for POST /api/suggestions/product-description
type ProductDescriptionRequest struct {
	Identifier string `json:"identifier"`
}

// PersonasRequest is the request body for POST /api/suggestions/personas
type PersonasRequest struct {
	Product models.ProductDescription `json:"product"`
	Count   int                       `json:"count,omitempty"`
}

// QuestionsRequest is the request body for POST /api/suggestions/questions
// Note: the UI sends `question_type` as a string key; this maps to the enum.
type QuestionsRequest struct {
	Product      models.ProductDescription `json:"product"`
	Count        int                       `json:"count,omitempty"`
	QuestionType models.QuestionType       `json:"question_type"`
}
