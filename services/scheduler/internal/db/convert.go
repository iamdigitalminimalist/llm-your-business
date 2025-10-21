package db

import (
	"encoding/json"

	"go.mongodb.org/mongo-driver/bson"
)

// ToBSONM converts any JSON-serializable struct/value into a bson.M using JSON tags.
func ToBSONM(v any) (bson.M, error) {
	b, err := json.Marshal(v)
	if err != nil {
		return nil, err
	}
	var m bson.M
	if err := json.Unmarshal(b, &m); err != nil {
		return nil, err
	}
	return m, nil
}
