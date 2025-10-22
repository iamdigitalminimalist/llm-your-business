package models

import "time"

// RunSchedule enumerates objective run cadence.
type RunSchedule string

const (
    RunScheduleDaily   RunSchedule = "daily"
    RunScheduleWeekly  RunSchedule = "weekly"
    RunScheduleMonthly RunSchedule = "monthly"
)

// Language enumerates supported languages.
type Language string

// Persona holds persona metadata for questions.
type Persona struct {
    Attributes map[string]string `json:"attributes"`
    Type       string            `json:"type"`
}

// ObjectiveV1JsonRunsElem is a single run entry for an objective.
type ObjectiveV1JsonRunsElem struct {
    Timestamp  time.Time `json:"timestamp"`
    ManifestId string    `json:"manifest_id"`
}

// ObjectiveTargets is a single targets object whose fields are slices.
type ObjectiveTargets struct {
    Persona  []string   `json:"persona"`
    Language []Language `json:"language"`
    Location []string   `json:"location"`
}

// ObjectiveV1Json is the persisted objective model used by the scheduler.
type ObjectiveV1Json struct {
    PublicId      string                     `json:"public_id"`
    Title         string                     `json:"title"`
    LlmModels     []string                   `json:"llm_models"`
    ObjectiveType string                     `json:"objective_type"`
    Targets       ObjectiveTargets           `json:"targets"`
    PartnerId     string                     `json:"partner_id"`
    ProductId     string                     `json:"product_id"`
    IsActive      bool                       `json:"is_active"`
    RunSchedule   RunSchedule                `json:"run_schedule"`
    StartDate     time.Time                  `json:"start_date"`
    Runs          []ObjectiveV1JsonRunsElem  `json:"runs"`
    CreatedAt     time.Time                  `json:"created_at"`
    UpdatedAt     time.Time                  `json:"updated_at"`
}

// QuestionV1Json is the question model linked to an objective.
type QuestionV1Json struct {
    QuestionId   string   `json:"question_id"`
    ObjectiveId  string   `json:"objective_id"`
    QuestionText string   `json:"question_text"`
    Persona      Persona  `json:"persona"`
    Language     Language `json:"language"`
}
