FROM python:3.11-slim

WORKDIR /app

# Install system dependencies and uv
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir uv

# Copy dependency files first for better Docker layer caching
COPY pyproject.toml .

# Install dependencies using uv (much faster than pip)
RUN uv pip install --system --no-cache .

# Copy source code
COPY src/ ./src/

# Create non-root user for security
RUN useradd -m -u 1000 llmuser && chown -R llmuser:llmuser /app
USER llmuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

CMD ["python", "-m", "src.main"]