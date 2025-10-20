COMMON_SCHEMAS := ../common/language.v1.json \
                  ../common/model.v1.json \
                  ../common/persona.v1.json \
                  ../common/question_type.v1.json \
                  ../common/data_point.v1.json

# Include all event schemas in parent directory (e.g., *.v1.json)
EVENT_SCHEMAS := $(wildcard ../*.v1.json)

SCHEMAS := $(COMMON_SCHEMAS) $(EVENT_SCHEMAS)

PKG := events
OUT := ./events/types_gen.go

.PHONY: gen
gen:
	go-jsonschema -p $(PKG) -o $(OUT) $(SCHEMAS)
	go fmt ./...
