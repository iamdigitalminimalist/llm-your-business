package handlers

import (
	"context"
	"log"

	"llm-your-business/schemas/events"
)

type Handlers struct{}

func New() *Handlers { return &Handlers{} }

func (h *Handlers) HandleObjectiveExecutionQuestion(ctx context.Context, e events.ObjectiveExecutionQuestionV1Json) error {
	// TODO: implement scheduling logic for ObjectiveExecutionQuestion events
	// - validate payload
	// - enqueue downstream job if needed
	// - emit follow-up events
	log.Printf("received ObjectiveExecutionQuestion: execution_id=%s question_id=%s", e.Meta.ExecutionId, e.Meta.QuestionId)
	return nil
}

func (h *Handlers) HandleObjectiveExecutionAnswer(ctx context.Context, e events.ObjectiveExecutionAnswerV1Json) error {
	// TODO: implement scheduling logic for ObjectiveExecutionAnswer events
	log.Printf("received ObjectiveExecutionAnswer: execution_id=%s question_id=%s", e.Meta.ExecutionId, e.Meta.QuestionId)
	return nil
}

func (h *Handlers) HandleObjectiveDatapoint(ctx context.Context, e events.ObjectiveDatapointV1Json) error {
	// TODO: implement scheduling logic for ObjectiveDatapoint events
	log.Printf("received ObjectiveDatapoint: manifest_id=%s question_id=%s", e.Meta.ManifestId, e.Meta.QuestionId)
	return nil
}

func (h *Handlers) HandleObjectiveManifest(ctx context.Context, e events.ObjectiveManifestV1Json) error {
	// TODO: implement scheduling logic for ObjectiveManifest events
	log.Printf("received ObjectiveManifest: execution_id=%s manifest_id=%s", e.Meta.ExecutionId, e.Meta.ManifestId)
	return nil
}
