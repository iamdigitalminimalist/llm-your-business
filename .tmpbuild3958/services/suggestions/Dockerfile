# syntax=docker/dockerfile:1

FROM golang:1.23-bookworm AS builder

ARG TARGETOS=linux
ARG TARGETARCH=amd64

WORKDIR /workspace

ENV GOWORK=/workspace/go.work

# Copy workspace files and relevant sources
COPY go.work ./go.work
COPY go.work.sum ./go.work.sum
COPY services/go/models ./services/go/models
COPY services/suggestions ./services/suggestions

# Build the suggestions service
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} \
    go build -o /out/suggestions ./services/suggestions/cmd

FROM gcr.io/distroless/base-debian12

WORKDIR /
COPY --from=builder /out/suggestions /usr/local/bin/suggestions
COPY --from=builder /workspace/services/suggestions/ui /ui

ENV PORT=8085
USER nonroot:nonroot
ENTRYPOINT ["/usr/local/bin/suggestions"]
