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

# Ensure workspace mode picks up the root go.work
ENV GOWORK=/workspace/go.work

# Install go-jsonschema tool and provide a hyphenated alias used by Makefile
RUN go install github.com/atombender/go-jsonschema@v0.20.0 \
    && ln -s "$(go env GOPATH)/bin/gojsonschema" /usr/local/bin/go-jsonschema

# Bring in the workspace and sources needed for build
COPY go.work ./go.work
COPY go.work.sum ./go.work.sum
COPY schemas ./schemas
COPY services/scheduler ./services/scheduler

# Generate schema types for the Go module under schemas/go
RUN make -C schemas/go gen

# Build the scheduler binary (static)
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} \
    go build -o /out/scheduler ./services/scheduler/cmd/scheduler

# Runtime stage: minimal image with CA certs
FROM gcr.io/distroless/base-debian12

WORKDIR /
COPY --from=builder /out/scheduler /usr/local/bin/scheduler

USER nonroot:nonroot
ENTRYPOINT ["/usr/local/bin/scheduler"]
