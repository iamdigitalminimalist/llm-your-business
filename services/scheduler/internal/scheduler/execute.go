package scheduler

import (
    "context"
    "crypto/rand"
    "encoding/hex"
    "encoding/json"
    "fmt"
    "log"
    "time"

    "llm-your-business/schemas/events"
    model "llm-your-business/services/go/models"
)

// executeObjective gathers questions for the objective, builds a manifest event,
// and publishes it to Kafka. Returns the manifest_id on success.
func (s *Service) executeObjective(ctx context.Context, id string, obj model.ObjectiveV1Json) (string, error) {
    // Load questions from DB
    questions, err := s.DB.FindQuestionsByObjective(ctx, id)
    if err != nil {
        return "", fmt.Errorf("load questions: %w", err)
    }
    if len(questions) == 0 {
        log.Printf("scheduler: no questions found for objective id=%s; skipping manifest", id)
        return "", nil
    }

    // Build manifest event (questions array contains only question_id)
    manifestID := uuidV4()
    executionID := uuidV4()
    type manifestMeta struct {
        SchemaVersion int    `json:"schema_version"`
        CreatedAt     int    `json:"created_at"`
        Producer      string `json:"producer"`
        ManifestId    string `json:"manifest_id"`
        ExecutionId   string `json:"execution_id"`
        ObjectiveId   string `json:"objective_id"`
    }
    type manifestQuestion struct { QuestionId string `json:"question_id"` }
    type manifestData struct { Questions []manifestQuestion `json:"questions"` }
    type manifestEvent struct { Meta manifestMeta `json:"meta"`; Data manifestData `json:"data"` }

    mevt := manifestEvent{
        Meta: manifestMeta{
            SchemaVersion: 1,
            CreatedAt:     int(time.Now().UTC().UnixMilli()),
            Producer:      "scheduler",
            ManifestId:    manifestID,
            ExecutionId:   executionID,
            ObjectiveId:   id,
        },
        Data: manifestData{Questions: make([]manifestQuestion, 0, len(questions))},
    }
    for _, q := range questions {
        mevt.Data.Questions = append(mevt.Data.Questions, manifestQuestion{QuestionId: q.QuestionId})
    }
    payload, err := json.Marshal(mevt)
    if err != nil { return "", fmt.Errorf("marshal manifest: %w", err) }
    if err := s.Producer.PublishObjectiveManifestRaw(ctx, executionID, payload); err != nil { return "", fmt.Errorf("publish manifest: %w", err) }

    // After manifest, emit one ObjectiveExecutionQuestion per question
    nowMillis := int(time.Now().UTC().UnixMilli())
    for _, q := range questions {
        mdl, err := deriveModel(obj)
        if err != nil {
            return "", fmt.Errorf("derive model: %w", err)
        }
        qtype, err := deriveQuestionType(obj)
        if err != nil {
            return "", fmt.Errorf("derive question type: %w", err)
        }
        loc := deriveLocation(obj, q)
        qe := events.ObjectiveExecutionQuestionV1Json{
            Meta: events.ObjectiveExecutionQuestionV1JsonMeta{
                SchemaVersion: 1,
                CreatedAt:     nowMillis,
                Producer:      "scheduler",
                RunAttempt:    1,
                ManifestId:    manifestID,
                ExecutionId:   executionID,
                ObjectiveId:   id,
                QuestionId:    q.QuestionId,
                QuestionType:  qtype,
                Persona:       q.Persona.Type,
                Language:      events.Language(q.Language),
                Location:      loc,
                Model:         mdl,
            },
            Data: events.ObjectiveExecutionQuestionV1JsonData{
                Prompt: q.QuestionText,
            },
        }
        if err := s.Producer.PublishObjectiveExecutionQuestion(ctx, qe); err != nil {
            log.Printf("scheduler: failed to publish question event: objective_id=%s question_id=%s err=%v", id, q.QuestionId, err)
        }
    }

    log.Printf("scheduler: published manifest: objective_id=%s manifest_id=%s execution_id=%s questions=%d", id, manifestID, executionID, len(questions))
    return manifestID, nil
}

// deriveModel picks a model to use for a question based on the objective's
// llm_models config. Falls back to CHAT_GPT5 if not present.
func deriveModel(obj model.ObjectiveV1Json) (events.Model, error) {
    // Prefer typed access if available
    if len(obj.LlmModels) > 0 {
        s := string(obj.LlmModels[0])
        switch s {
        case string(events.ModelCHATGPT5), string(events.ModelCLAUDE35), string(events.ModelGEMINI2), string(events.ModelLLAMA4):
            return events.Model(s), nil
        default:
            return "", fmt.Errorf("unsupported model: %s", s)
        }
    }
    // Fallback: attempt dynamic extraction
    var m map[string]interface{}
    if b, err := json.Marshal(obj); err == nil {
        if json.Unmarshal(b, &m) == nil {
            if arr, ok := m["llm_models"].([]interface{}); ok && len(arr) > 0 {
                if s, ok := arr[0].(string); ok && s != "" {
                    switch s {
                    case string(events.ModelCHATGPT5), string(events.ModelCLAUDE35), string(events.ModelGEMINI2), string(events.ModelLLAMA4):
                        return events.Model(s), nil
                    default:
                        return "", fmt.Errorf("unsupported model: %s", s)
                    }
                }
            }
        }
    }
    return "", fmt.Errorf("no llm_models configured")
}

func deriveQuestionType(obj model.ObjectiveV1Json) (events.QuestionType, error) {
    // Prefer typed access
    s := string(obj.ObjectiveType)
    switch s {
    case "top_5_in_category":
        return events.QuestionTypeTop5, nil
    case "top_10_in_category":
        return events.QuestionTypeTop10, nil
    case "":
        // try dynamic extraction if empty
    default:
        return "", fmt.Errorf("unsupported objective_type: %s", s)
    }
    var m map[string]interface{}
    if b, err := json.Marshal(obj); err == nil {
        if json.Unmarshal(b, &m) == nil {
            if s2, ok := m["objective_type"].(string); ok {
                switch s2 {
                case "top_5_in_category":
                    return events.QuestionTypeTop5, nil
                case "top_10_in_category":
                    return events.QuestionTypeTop10, nil
                default:
                    return "", fmt.Errorf("unsupported objective_type: %s", s2)
                }
            }
        }
    }
    return "", fmt.Errorf("objective_type not set")
}

// deriveLocation attempts to find a location from the objective's targets
// that matches the question's persona and language. Returns empty string if none.
func deriveLocation(obj model.ObjectiveV1Json, q model.QuestionV1Json) string {
    // With the new model, targets is a single object with slice fields.
    // We match if the question persona and language are present; then pick the first location.
    if len(obj.Targets.Location) == 0 && len(obj.Targets.Persona) == 0 && len(obj.Targets.Language) == 0 {
        return ""
    }
    qLang := string(q.Language)
    qPersona := q.Persona.Type

    containsStr := func(list []string, s string) bool {
        for _, v := range list {
            if v == s { return true }
        }
        return false
    }
    containsLang := func(list []model.Language, s string) bool {
        for _, v := range list {
            if string(v) == s { return true }
        }
        return false
    }

    // Prefer both persona and language present
    if (len(obj.Targets.Persona) == 0 || containsStr(obj.Targets.Persona, qPersona)) &&
       (len(obj.Targets.Language) == 0 || containsLang(obj.Targets.Language, qLang)) {
        if len(obj.Targets.Location) > 0 { return obj.Targets.Location[0] }
    }

    // Fallback: language only
    if len(obj.Targets.Language) == 0 || containsLang(obj.Targets.Language, qLang) {
        if len(obj.Targets.Location) > 0 { return obj.Targets.Location[0] }
    }

    // Last resort: any configured location
    if len(obj.Targets.Location) > 0 { return obj.Targets.Location[0] }
    return ""
}

// uuidV4 generates a random RFC4122 version 4 UUID as a string.
func uuidV4() string {
    b := make([]byte, 16)
    if _, err := rand.Read(b); err != nil {
        // fallback to timestamp-based pseudo if rand fails
        return fmt.Sprintf("%x", time.Now().UnixNano())
    }
    // Set version (4) and variant (RFC4122)
    b[6] = (b[6] & 0x0f) | 0x40
    b[8] = (b[8] & 0x3f) | 0x80
    // encode as 8-4-4-4-12
    dst := make([]byte, 36)
    hex.Encode(dst[0:8], b[0:4])
    dst[8] = '-'
    hex.Encode(dst[9:13], b[4:6])
    dst[13] = '-'
    hex.Encode(dst[14:18], b[6:8])
    dst[18] = '-'
    hex.Encode(dst[19:23], b[8:10])
    dst[23] = '-'
    hex.Encode(dst[24:36], b[10:16])
    return string(dst)
}
