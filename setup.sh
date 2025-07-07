#!/bin/bash

# LocalBoof.io Development Environment Setup
# This script prepares the environment for Codex agents

set -e

echo "🎮 Setting up LocalBoof.io development environment..."

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js found: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js 16+ first."
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✓ npm found: $NPM_VERSION"
else
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Verify installation
echo "🧪 Running validation tests..."
npm run validate

# Check if ports are available
echo "🔍 Checking port availability..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 is in use. You may need to stop existing processes."
else
    echo "✓ Port 3000 is available"
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5173 is in use. You may need to stop existing processes."
else
    echo "✓ Port 5173 is available"
fi

echo ""
echo "🚀 Setup complete! You can now:"
echo "   • Run 'npm run dev' to start the client dev server"
echo "   • Run 'npm start' to start the WebSocket server"
echo "   • Run 'npm run dev:full' to start both servers"
echo "   • Run 'npm test' to run the test suite"
echo "   • Run 'npm run test:coverage' to see test coverage"
echo ""
echo "📖 See AGENTS.md for detailed development guidelines." 