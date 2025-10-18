# Client (React/Vite) Dockerfile
FROM oven/bun:1-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy shared db package (workspace dependency)
COPY services/db /app/node_modules/@shared/db

# Copy package files
COPY services/client/package.json ./

# Remove workspace dependency from package.json and install
RUN sed -i '/"@shared\/db":/d' package.json && bun install

# Copy source code
COPY services/client .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start development server
CMD ["bun", "run", "dev", "--host", "0.0.0.0", "--port", "3000"]