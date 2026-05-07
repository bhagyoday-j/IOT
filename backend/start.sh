#!/bin/bash

# Smart Agriculture API - Quick Start Script

echo "🌾 Smart Agriculture API - Setup & Run 🌾"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js 16+ first."
  exit 1
fi

echo "✅ Node.js detected: $(node --version)"
echo "✅ npm detected: $(npm --version)"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env from .env.example..."
  cp .env.example .env
  echo "✅ .env file created. Please edit it with your configuration."
else
  echo "✅ .env file already exists"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
  echo "❌ Failed to install dependencies"
  exit 1
fi

echo ""
echo "✅ Dependencies installed"
echo ""
echo "🚀 Starting server in development mode..."
echo ""
echo "Server will run on: http://localhost:5000"
echo "Health check: http://localhost:5000/health"
echo "API docs: http://localhost:5000/api"
echo ""
echo "To stop server: Press Ctrl+C"
echo ""

npm run dev
