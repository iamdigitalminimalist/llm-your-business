# LLM Your Business

**AI-Powered Business Objective Processing** - A modern microservices architecture for processing business objectives using Large Language Models, built with Python FastAPI, Node.js, React, and Kafka.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │   Node.js API   │    │  Python LLM     │
│   (Frontend)    │◄───┤   (Server)      │◄───┤  Service        │
│   Port: 3000    │    │   Port: 5000    │    │  Port: 8000     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐            │
                       │   MongoDB       │◄───────────┘
                       │   (Database)    │
                       │   Atlas/Local   │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │     Kafka       │◄───────────────────┐
                       │  (Messaging)    │                    │
                       │   Port: 9092    │                    │
                       └─────────────────┘                    │
                                │                             │
                       ┌─────────────────┐                    │
                       │   Kafka UI      │                    │
                       │  (Monitoring)   │                    │
                       │   Port: 8080    │                    │
                       └─────────────────┘                    │
                                                              │
                       Event-driven processing ──────────────┘
```

## �️ Development

### LLM Service (Python)

```bash
cd services/llm

# Quick setup with uv (recommended)
./setup.sh

# Manual development run
source .venv/bin/activate
python -m src.main
```

### Client (React)

````bash
cd services/client
npm install
npm run dev
```ClintAPI

### Server (cli.nt-apis)

```bash
cd services/client-api
npm install
npm run dev
````

## �🚀 Quick Start

### Prerequisites

This application requires [Bun](https://bun.com) - a fast all-in-one JavaScript runtime.

#### Install Bun

```bash
# macOS and Linux
curl -fsSL https://bun.sh/install | bash

# Or using Homebrew (macOS)
brew install bun

# Windows (using PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd llm-your-business
   ```

2. **Install dependencies**

   ```bash
   # Install all dependencies (root, client, and server)
   bun install
   ```

3. **Environment Variables**

   **For environment variables and API keys, please contact Or for the required configuration files.**

   You'll need:
   - MongoDB connection string (cluster API key)
   - LLM API keys (OpenAI, Anthropic, etc.)

4. **Database Setup**

   Generate Prisma client and push schema to MongoDB:

   ```bash
   # Generate Prisma client
   bun run db:generate

   # Push schema to database
   bun run db:push
   ```

### Running the Application

#### Development Mode

```bash
# Starts both client and server concurrently
bun run dev
```

- Server: `http://localhost:3000`
- Client: `http://localhost:5173`

## 🗄️ Database Commands

The application includes convenient database management commands:

```bash
# Generate Prisma client (run after schema changes)
bun run db:generate

# Push schema changes to database
bun run db:push

# Open Prisma Studio (database GUI)
bun run db:studio

# Create and apply migrations (for production)
bun run db:migrate

# Reset database (development only)
bun run db:reset
```

## 🛠 Technology Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **ShadcnUI** for component library
- **React Router** for navigation
- **TanStack Query** for server state management
- **React Hook Form + Zod** for form handling

### Backend

- **Node.js** with TypeScript
- **Express.js** for API server
- **Prisma** for database ORM
- **MongoDB** for primary database
- **JWT** for authentication
- **OpenAI/Anthropic APIs** for LLM integrations

## 📊 Key Features

- **Dashboard**: Overview metrics, recent evaluations, and quick actions
- **Partner Management**: Comprehensive directory with filtering and search
- **Evaluation Workflow**: Multi-LLM testing with results analysis
- **Real-time Updates**: Live data refresh and notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting (`bun run lint`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Submit a pull request

## 📞 Support

For environment variables, setup assistance, or questions, contact **Or**.

## 📄 License

This project is private and proprietary. All rights reserved.
