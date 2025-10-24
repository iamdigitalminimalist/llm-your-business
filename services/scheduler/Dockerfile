# syntax=docker/dockerfile:1

# Builder stage: generate Go types from JSON Schemas and build the scheduler
FROM golang:1.23-bookworm AS builder

ARG TARGETOS=linux
ARG TARGETARCH=amd64

WORKDIR /workspace

# Install build dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends make ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install go-jsonschema tool and provide a hyphenated alias used by Makefile
RUN go install github.com/atombender/go-jsonschema@v0.20.0 \
    && ln -s "$(go env GOPATH)/bin/gojsonschema" /usr/local/bin/go-jsonschema

# Bring in only the modules needed for this build
COPY schemas ./schemas
COPY services/go/models ./services/go/models
COPY services/scheduler ./services/scheduler

# Generate schema types for the Go module under schemas/go
RUN make -C schemas/go gen

# Build the scheduler binary (static). Build from the module dir using -C so we
# don't depend on a workspace at the repository root.
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} \
    go -C ./services/scheduler build -o /out/scheduler ./cmd/scheduler

# Runtime stage: minimal image with CA certs
FROM gcr.io/distroless/base-debian12

WORKDIR /
COPY --from=builder /out/scheduler /usr/local/bin/scheduler

USER nonroot:nonroot
ENTRYPOINT ["/usr/local/bin/scheduler"]
