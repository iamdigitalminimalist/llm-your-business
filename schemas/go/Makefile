EVENT_SCHEMAS := $(wildcard ../event/*.v1.json)

EVENTS_OUT := ./events/types_gen.go

.PHONY: gen clean regen gen-events

gen: gen-events
	go fmt ./...

gen-events:
	mkdir -p ./events
	go-jsonschema -p events -o $(EVENTS_OUT) $(EVENT_SCHEMAS)

clean:
	rm -rf ./events

regen: clean gen
