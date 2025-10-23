package models

type Persona struct {
	Name             string `json:"name"`
	ShortDescription string `json:"short_description"`
	Description      string `json:"description"`
}


// JSON Schema for a list of Persona objects.
// Each persona must include name (2–3 words), short_description (<=10 words), and a detailed description.
const PersonaListSchema = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PersonaList",
  "type": "array",
  "minItems": 1,
  "items": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "name": { "type": "string" },
      "short_description": { "type": "string" },
      "description": { "type": "string" }
    },
    "required": ["name", "short_description", "description"]
  }
}`