# syntax=docker/dockerfile:1

FROM golang:1.23-bookworm AS builder

ARG TARGETOS=linux
ARG TARGETARCH=amd64

WORKDIR /workspace

# Copy only the modules needed to build this service.
# We intentionally avoid using the workspace (go.work) to keep the build context minimal
# and prevent missing-modules errors during Docker builds.
COPY services/go/models ./services/go/models
COPY services/suggestions ./services/suggestions

# Build the suggestions service in module mode. Use -C to build from module dir
# to avoid relying on a workspace at repository root.
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} \
    go -C ./services/suggestions build -o /out/suggestions ./cmd

FROM gcr.io/distroless/base-debian12

WORKDIR /
COPY --from=builder /out/suggestions /usr/local/bin/suggestions
# Copy static UI assets (resides under cmd/ui in this repo)
COPY --from=builder /workspace/services/suggestions/cmd/ui /ui

ENV PORT=8085
USER nonroot:nonroot
ENTRYPOINT ["/usr/local/bin/suggestions"]
