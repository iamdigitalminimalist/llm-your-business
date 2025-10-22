Scheduler Service (Go)

Overview
- Consumes Kafka topics and dispatches to handlers per event type.
- Uses generated types from `schemas/go/events` and Go data models from `services/go/models`.
- Handlers currently do not write to DB; they are TODO stubs.

Layout
- `cmd/scheduler/main.go` – entrypoint wiring config, DB, Kafka consumer.
- `internal/config` – environment-driven config loader.
- `internal/db` – MongoDB client (optional; handlers do not persist yet).
- `internal/handlers` – one handler per event type (TODO stubs).
- `internal/kafka` – Kafka consumer and producer connectors.
- `internal/scheduler` – scheduler service struct (holds Kafka producer + DB client).
- `internal/topics` – Kafka topic names as constants.
- Types
  - Events: generated from JSON Schemas → `schemas/go/events` (import `llm-your-business/schemas/events`).
  - Models: hand-written Go structs → `services/go/models` (import `llm-your-business/services/go/models`).

Environment
- `KAFKA_BOOTSTRAP_SERVERS` (required) – CSV, e.g. `localhost:9092`.
- `KAFKA_CONSUMER_GROUP` (required) – consumer group id.
- `KAFKA_CLIENT_ID` (optional) – default `scheduler`.
- `KAFKA_TOPICS` (optional) – CSV; default subscribes to:
  - `objective.execution.question`
  - `objective.execution.answer`
  - `objective.datapoint`
  - `objective.manifest`
- `DB_ENABLED` (optional) – when `true`, enables MongoDB connection (default: `false`).
- `MONGODB_URI` (required when DB_ENABLED=true) – connection string.
- `MONGODB_DATABASE` (required when DB_ENABLED=true) – database name.
- `APP_ENV` (optional) – default `development`.
- `LOG_LEVEL` (optional) – default `info`.

Workspace
- Root `go.work` includes these modules so local imports work:
  - `./schemas/go`
  - `./services/go/models`
  - `./services/scheduler`

Run locally
- Ensure Kafka and MongoDB are running (docker-compose provides both).
- From repo root:
  - `export KAFKA_BOOTSTRAP_SERVERS=localhost:9092`
  - `export KAFKA_CONSUMER_GROUP=scheduler-group`
  - `export DB_ENABLED=false` # set to true to connect to Mongo
  - `export MONGODB_URI=mongodb://localhost:27017` # required if DB_ENABLED=true
  - `export MONGODB_DATABASE=llm`                  # required if DB_ENABLED=true
  - `go run ./services/scheduler/cmd/scheduler`

Notes
- Handlers are placeholders; no DB insertions occur yet.
- Extend handlers to implement scheduling logic, persistence, or follow-up publishing.
