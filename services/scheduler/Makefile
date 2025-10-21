APP := scheduler

.PHONY: build run tidy

build:
	GOFLAGS=-workfile=../../go.work go build -o bin/$(APP) ./cmd/scheduler

run:
	GOFLAGS=-workfile=../../go.work go run ./cmd/scheduler

tidy:
	GOFLAGS=-workfile=../../go.work go mod tidy

