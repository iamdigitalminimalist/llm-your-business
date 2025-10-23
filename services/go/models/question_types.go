package models

// QuestionTypeInfo describes an available question type and its generation prompt.
type QuestionTypeInfo struct {
    Key         string `json:"key"`
    Title       string `json:"title"`
    Description string `json:"description"`
    Prompt      string `json:"prompt"`
}

// QuestionTypeCatalog lists supported question types.
var QuestionTypeCatalog = []QuestionTypeInfo{
    {
        Key:   "top_10",
        Title: "Top 10 in Category",
        Description: "Generate questions that elicit a list of the top 10 companies/products in the category (general, not brand-specific).",
        Prompt: "Each question must explicitly ask for a list of exactly 10 companies or products in the category. Do not reference the specific product or company; keep it general.",
    },
    {
        Key:   "product_key_features",
        Title: "Product Key Features",
        Description: "Generate questions that elicit the key features of the specific product using the provided product details.",
        Prompt: "Questions should ask for the key features and capabilities of the product described in the provided details. Avoid using brand names; refer to it generically as 'the product' if needed.",
    },
}

// QuestionTypeKeys returns the list of available type keys.
func QuestionTypeKeys() []string {
    out := make([]string, 0, len(QuestionTypeCatalog))
    for _, it := range QuestionTypeCatalog {
        out = append(out, it.Key)
    }
    return out
}

// QuestionTypeByKey finds a type by key.
func QuestionTypeByKey(key string) (QuestionTypeInfo, bool) {
    for _, it := range QuestionTypeCatalog {
        if it.Key == key {
            return it, true
        }
    }
    return QuestionTypeInfo{}, false
}
