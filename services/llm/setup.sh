#!/bin/bash
# LLM Service Setup Script using uv

set -e

echo "🚀 LLM Service Setup"
echo "===================="

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "❌ uv is not installed. Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    source $HOME/.local/bin/env
    echo "✅ uv installed successfully!"
else
    echo "✅ uv is already installed"
fi

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1-2)
echo "🐍 Detected Python version: $PYTHON_VERSION"

# Proper version check for Python 3.10+
PYTHON_MAJOR=$(echo "$PYTHON_VERSION" | cut -d'.' -f1)
PYTHON_MINOR=$(echo "$PYTHON_VERSION" | cut -d'.' -f2)
if [ "$PYTHON_MAJOR" -lt 3 ] || { [ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 10 ]; }; then
    echo "❌ Python $PYTHON_VERSION detected. LangChain 1.0.0 requires Python 3.10+"
    echo "💡 Installing Python 3.11 with uv..."
    uv venv --python 3.11
else
    echo "✅ Python $PYTHON_VERSION is compatible"
    echo "📦 Creating virtual environment..."
    uv venv --python 3.11
fi

echo "📚 Installing dependencies with uv..."
source .venv/bin/activate
uv pip install -e .

echo "🧪 Installing development dependencies..."
uv pip install -e ".[dev]"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Python version in virtual environment:"
python --version
echo ""
echo "📋 Next steps:"
echo "  1. Activate environment: source .venv/bin/activate"
echo "  2. Set environment variables in root .env file"
echo "  3. Start services: docker-compose up -d (from root)"
echo "  4. Run service: python -m src.main"
echo ""