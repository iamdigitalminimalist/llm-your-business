EVENT_SCHEMAS := $(wildcard ../event/*.v1.json)
MODEL_SCHEMAS := $(wildcard ../model/*.v1.json)

EVENTS_OUT := ./events/types_gen.go
MODEL_OUT := ./model/types_gen.go

.PHONY: gen clean regen gen-events gen-models

gen: gen-events gen-models
	go fmt ./...

gen-events:
	mkdir -p ./events
	go-jsonschema -p events -o $(EVENTS_OUT) $(EVENT_SCHEMAS)

gen-models:
	mkdir -p ./model
	go-jsonschema -p model -o $(MODEL_OUT) $(MODEL_SCHEMAS)

clean:
	rm -rf ./events ./model

regen: clean gen
