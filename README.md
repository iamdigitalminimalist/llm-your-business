# LLM Your Business

## Prerequisites

1. **Install Bun**

   ```bash
   # macOS and Linux
   curl -fsSL https://bun.sh/install | bash

   # Windows (PowerShell)
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```

2. **Install Docker**
   - Download and install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)

## Setup Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd llm-your-business
   ```

2. **Get environment variables**
   - Contact Or for the `.env` file with API keys
   - Required: `DATABASE_URL`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`

3. **Start with Docker**
   ```bash
   bun run docker
   ```

That's it! All services will be running:

- **Client**: http://localhost:3000
- **API**: http://localhost:4000
- **LLM Service**: http://localhost:8000
- **Kafka UI**: http://localhost:8080

## Additional Commands

```bash
# Database tools
bun run db:generate  # Generate Prisma client
bun run db:studio    # Database GUI

# Local development (without Docker)
bun install
bun run dev
```

**Support**: Contact Or for help
