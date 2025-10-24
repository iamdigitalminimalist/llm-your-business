package models

// QuestionType is an enum of supported question generation types.
type QuestionType string

const (
    // QuestionTypeTop10 asks for questions eliciting top-10 lists in the category
    QuestionTypeTop10 QuestionType = "top_10"
    // QuestionTypeProductKeyFeatures asks about key features of the specific product
    QuestionTypeProductKeyFeatures QuestionType = "product_key_features"
)

// QuestionTypeValues returns all supported enum values as strings.
func QuestionTypeValues() []string {
    return []string{
        string(QuestionTypeTop10),
        string(QuestionTypeProductKeyFeatures),
    }
}
