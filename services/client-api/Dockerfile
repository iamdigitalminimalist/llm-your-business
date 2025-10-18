# Client API (Bun) Dockerfile
FROM oven/bun:1-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy source code (including package.json and bun.lockb)
COPY . ./

# Remove workspace dependency from package.json and install with bun
RUN sed -i '/"@shared\/db":/d' package.json && bun install

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start development server
CMD ["bun", "run", "dev"]