#!/bin/bash
# HeliosSynerga Master Launch – 24/7 Autonomous Trading + Bot

echo "🔥 Booting HeliosSynerga – 3-headed Autonomous Trading Dragon"
echo ""

# Check if .env exists, if not create from template
if [ ! -f .env ]; then
  echo "⚙️ Creating .env file from template..."
  cp .env.example .env
  echo "⚠️ Please update .env with your API keys before running!"
  exit 1
fi

# Load environment variables
export $(cat .env | xargs)

# 1️⃣ Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2️⃣ Create initial dashboard
echo "🎨 Initializing dashboard..."
mkdir -p heliossynerga/data

# 3️⃣ Launch services concurrently
echo ""
echo "✨ Starting HeliosSynerga services..."
echo "  📊 Bot API: http://localhost:${PORT:-4000}"
echo "  🎯 Dashboard: http://localhost:5500"
echo ""

npx concurrently \
  "node heliossynerga/backend/bot.js" \
  "live-server heliossynerga/dashboard --port 5500"

echo "✅ HeliosSynerga services closed."
