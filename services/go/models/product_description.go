package models


type ProductDescription struct {
	Name                    string          `json:"name"`
	Website                 string          `json:"website"`
	ProductName             string          `json:"product_name"`
	ProductShortDescription string          `json:"product_short_description"`
	ProductCategory         ProductCategory `json:"product_category"`
}

// JSON Schema for models.ProductDescription
const ProductDescriptionSchema = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ProductDescription",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "name": { "type": "string" },
    "website": { "type": "string" },
    "product_name": { "type": "string" },
    "product_short_description": { "type": "string" },
    "product_category": { "type": "string" }
},
  "required": ["Name", "Website", "ProductCategory"]
}`
