#!/bin/bash
# GitHub Secrets Configuration Helper
# Maps your custom GitHub secrets to required environment variables

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🐉 HeliosSynerga - GitHub Secrets Configuration         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "This script helps you map your GitHub secrets to environment variables."
echo "You'll need to have these secrets configured in your GitHub repository:"
echo "  Settings → Secrets and variables → Actions"
echo ""

# Check if .github/workflows exists
if [ ! -d ".github/workflows" ]; then
  echo "❌ Error: .github/workflows directory not found."
  echo "Run this script from the project root."
  exit 1
fi

# Configuration file
CONFIG_FILE=".github/secrets-map.json"

# Create default configuration
cat > "$CONFIG_FILE" << 'EOF'
{
  "secrets_map": {
    "COLOSSEUM_API_KEY": {
      "description": "API key for Colosseum platform",
      "example": "abc123def456...",
      "required": true,
      "github_secret_name": "COLOSSEUM_API_KEY"
    },
    "CHATGPT_KEY": {
      "description": "OpenAI API key for ChatGPT",
      "example": "sk-proj-...",
      "required": true,
      "github_secret_name": "CHATGPT_KEY"
    },
    "SOLANA_RPC": {
      "description": "Solana RPC endpoint",
      "default": "https://api.mainnet-beta.solana.com",
      "required": false,
      "github_secret_name": "SOLANA_RPC"
    },
    "PORT": {
      "description": "Server port",
      "default": "4000",
      "required": false,
      "github_secret_name": "PORT"
    }
  }
}
EOF

echo "📋 Secret Configuration Map Created"
echo ""
echo "Required GitHub Secrets (must be set in your repository):"
echo ""
echo "1️⃣ COLOSSEUM_API_KEY"
echo "   Description: API key for Colosseum platform"
echo "   Action: Go to Settings → Secrets → New repository secret"
echo "   Name: COLOSSEUM_API_KEY"
echo ""

echo "2️⃣ CHATGPT_KEY"
echo "   Description: OpenAI API key"
echo "   Action: Go to Settings → Secrets → New repository secret"
echo "   Name: CHATGPT_KEY"
echo ""

echo "3️⃣ SOLANA_RPC (Optional)"
echo "   Description: Solana RPC endpoint"
echo "   Default: https://api.mainnet-beta.solana.com"
echo "   Action: If custom, add as repository secret"
echo ""

echo "4️⃣ PORT (Optional)"
echo "   Description: Server port"
echo "   Default: 4000"
echo "   Action: Only set if you need a different port"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ Configuration files created:"
echo "   • .github/workflows/deploy-bot.yml (one-time run)"
echo "   • .github/workflows/continuous-bot.yml (hourly schedule)"
echo "   • .github/secrets-map.json (configuration map)"
echo ""

echo "🔒 IMPORTANT: GitHub Secrets Setup"
echo ""
echo "To enable the bot to run:"
echo "1. Go to your GitHub repository"
echo "2. Navigate to Settings → Secrets and variables → Actions"
echo "3. Click 'New repository secret' for each required secret"
echo "4. Add these secrets:"
echo "   - Name: COLOSSEUM_API_KEY    Value: your_api_key"
echo "   - Name: CHATGPT_KEY          Value: sk-your_key"
echo "   - Name: SOLANA_RPC           (optional, defaults to mainnet)"
echo "   - Name: PORT                 (optional, defaults to 4000)"
echo ""

echo "🚀 Using Custom Secret Names?"
echo ""
echo "If your GitHub secrets use different names, edit:"
echo "   .github/workflows/deploy-bot.yml"
echo "   .github/workflows/continuous-bot.yml"
echo ""
echo "Replace the secret references with your custom names:"
echo "   \${{ secrets.YOUR_SECRET_NAME }}"
echo ""

echo "📊 Running the Bot"
echo ""
echo "Option 1 - Manual Trigger:"
echo "   Go to Actions tab → HeliosSynerga Bot Deployment → Run workflow"
echo ""
echo "Option 2 - Automatic (Hourly):"
echo "   The 'continuous-bot.yml' runs automatically every hour"
echo ""
echo "Option 3 - On Push:"
echo "   Bot runs every time you push to main branch"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "✨ Configuration complete! Your bot is ready to deploy."
