# LLM Service

# LLM Service Setup and Deployment Guide

## Overview

The LLM Service is a Python-based microservice that processes objective questions using LangChain agents and OpenAI. It communicates via Kafka and stores results in MongoDB.

## Prerequisites

### Required Software

- Docker & Docker Compose
- Python 3.11+ (for local development)
- OpenAI API Key

### Required Services

- Kafka (for event messaging)
- MongoDB (for data storage)
- Zookeeper (for Kafka coordination)

## Quick Start with Docker

### 1. Environment Setup

```bash
# Copy the centralized environment template
cp .env.example .env

# Edit .env with your actual values (especially OPENAI_API_KEY and DATABASE_URL)
nano .env
```

### 2. Start Services

```bash
# From the root directory - start core services (Kafka + LLM Service)
docker-compose up -d

# Optional: Start with local MongoDB instead of Atlas
docker-compose --profile local-db up -d

# Optional: Start full stack (includes Client + Server)
docker-compose --profile full-stack up -d
```

### 3. Verify Setup

```bash
# Check service status
docker-compose ps

# Check LLM service logs
docker-compose logs -f llm-service

# Check Kafka topics
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Test API health
curl http://localhost:8000/health

# View Kafka UI (optional)
open http://localhost:8080
```

## Manual Setup (Development)

### Prerequisites

**Important**: This project requires Python 3.10+ due to LangChain 1.0.0 dependencies.

### Option 1: Quick Setup with uv (Recommended)

```bash
cd services/llm

# Run the setup script (handles Python version automatically)
./setup.sh

# Activate the virtual environment
source .venv/bin/activate
```

### Option 2: Manual Setup with uv

```bash
cd services/llm

# Install uv if not already installed
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment with specific Python version
uv venv --python 3.11
source .venv/bin/activate

# Install dependencies (from pyproject.toml)
uv pip install -e .

# Install development dependencies
uv pip install -e ".[dev]"
```

### Option 3: Alternative with pip (if you have Python 3.10+)

```bash
cd services/llm

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (from pyproject.toml)
pip install -e .

# Install development dependencies
pip install -e ".[dev]"
```

### 2. Start Infrastructure Services

```bash
# Start only Kafka and MongoDB
docker-compose up -d zookeeper kafka mongodb
```

### 3. Configure Environment

```bash
# Make sure DATABASE_URL is set in root .env file
# Example: DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority"

# Copy and edit local environment file if needed
cp .env.example .env

# Update .env with your settings:
# - OPENAI_API_KEY=your_actual_key
# - KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

### 4. Test Database Connection

```bash
# Database connection is tested automatically during Docker startup
# Check service logs to verify connectivity
docker-compose logs llm-service

# Or test manually if needed
docker-compose exec llm-service python -c "from src.services.database import DatabaseService; import asyncio; asyncio.run(DatabaseService().ping())"
```

### 5. Run Service

```bash
# Start the service
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

## Configuration

### Environment Variables

| Variable                  | Description               | Default                     |
| ------------------------- | ------------------------- | --------------------------- |
| `OPENAI_API_KEY`          | OpenAI API key (required) | -                           |
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka broker addresses    | `localhost:9092`            |
| `MONGODB_URL`             | MongoDB connection string | `mongodb://localhost:27017` |
| `OPENAI_MODEL`            | OpenAI model to use       | `gpt-4`                     |
| `MAX_CONCURRENT_REQUESTS` | Max parallel processing   | `10`                        |

### Kafka Topics

- **Input**: `objective.execution.question` - Receives questions to process
- **Output**: `objective.execution.answer` - Sends processed answers

## Testing the Service

### 1. Health Check

```bash
curl http://localhost:8000/health
```

### 2. Send Test Question (Manual)

```bash
# Create test message for Kafka
docker-compose exec kafka kafka-console-producer \
  --bootstrap-server localhost:9092 \
  --topic objective.execution.question

# Send JSON message:
{
  "execution_id": "test-123",
  "question_id": "q1",
  "question": "What are the top 5 project management tools?",
  "objective_type": "top_5_recommendation",
  "context": {
    "target_category": "project management tools"
  }
}
```

### 3. Check Answer

```bash
# Listen for answers
docker-compose exec kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic objective.execution.answer \
  --from-beginning
```

## Service Architecture

### Components

- **FastAPI Server**: HTTP API and health checks
- **Kafka Consumer**: Processes incoming questions
- **Agent Factory**: Routes questions to specialized LangChain agents
- **Database Service**: MongoDB operations
- **LLM Processor**: OpenAI integration

### Supported Objective Types

- `top_5_recommendation`: Top 5 recommendations for a category
- `main_competitors`: Main competitors for a product/service
- `pros_and_cons`: Pros and cons analysis

## Monitoring

### Logs

```bash
# Service logs
docker-compose logs -f llm-service

# All services
docker-compose logs -f
```

### Database

```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh \
  mongodb://admin:password@localhost:27017/llm_business?authSource=admin
```

### Kafka

```bash
# List topics
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Monitor messages
docker-compose exec kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic objective.execution.question \
  --from-beginning
```

## Troubleshooting

### Common Issues

1. **Service won't start**
   - Check Docker is running
   - Verify ports 8000, 9092, 27017 are available
   - Check OpenAI API key is set

2. **Kafka connection errors**
   - Ensure Kafka is running: `docker-compose ps kafka`
   - Check network connectivity: `docker network ls`

3. **MongoDB connection errors**
   - Verify MongoDB is running: `docker-compose ps mongodb`
   - Check connection string format

4. **OpenAI API errors**
   - Verify API key is correct
   - Check API usage limits
   - Ensure internet connectivity

### Debug Mode

```bash
# Enable debug logging
export DEBUG=true

# Or in .env file
DEBUG=true
```

## Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Next Steps

1. **Integration**: Connect your main application to send questions via Kafka
2. **Scaling**: Add more LLM service instances for higher throughput
3. **Monitoring**: Add Prometheus/Grafana for production monitoring
4. **Custom Agents**: Extend the agent system for new objective types

## Architecture

```
Scheduler → objective.execution.question → LLM Service → objective.execution.answer → Analytics
```

## Event Flow

1. **Consumes**: `objective.execution.question` events
2. **Processes**: Questions using specialized LangChain agents
3. **Produces**: `objective.execution.answer` events

## Service Responsibilities

- ✅ Consume question events from Kafka
- ✅ Route questions to appropriate LangChain agents
- ✅ Execute LLM queries with proper prompts
- ✅ Validate and format responses
- ✅ Publish answer events back to Kafka
- ✅ Handle errors and retries gracefully

## Quick Start

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or run locally (requires Kafka + MongoDB)
pip install -r requirements.txt
python -m src.main
```
