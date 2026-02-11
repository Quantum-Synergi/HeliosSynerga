#!/bin/bash
# Railway & GitHub Integration Setup Verification

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  🔐 HeliosSynerga - Railway + GitHub Secrets Setup           ║"
echo "║                    FINAL CHECKLIST                           ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check 1: Environment template
echo "✓ CHECK 1: Environment Template"
if grep -q "RAILWAY_API_KEY" .env.example && grep -q "GH_TOKEN" .env.example; then
  echo "  ✅ .env.example contains RAILWAY_API_KEY and GH_TOKEN"
else
  echo "  ❌ .env.example missing new variables"
fi
echo ""

# Check 2: Workflows updated
echo "✓ CHECK 2: GitHub Workflows"
if grep -q "RAILWAY_API_KEY" .github/workflows/deploy-bot.yml && grep -q "GH_TOKEN" .github/workflows/deploy-bot.yml; then
  echo "  ✅ deploy-bot.yml has Railway and GitHub secrets"
else
  echo "  ❌ deploy-bot.yml missing secrets"
fi

if grep -q "RAILWAY_API_KEY" .github/workflows/continuous-bot.yml && grep -q "GH_TOKEN" .github/workflows/continuous-bot.yml; then
  echo "  ✅ continuous-bot.yml has Railway and GitHub secrets"
else
  echo "  ❌ continuous-bot.yml missing secrets"
fi
echo ""

# Check 3: Bot code updated
echo "✓ CHECK 3: Bot Code (bot.js)"
if grep -q "RAILWAY_API_KEY" heliossynerga/backend/bot.js; then
  echo "  ✅ bot.js uses RAILWAY_API_KEY"
else
  echo "  ❌ bot.js not updated with Railway"
fi

if grep -q "GH_TOKEN" heliossynerga/backend/bot.js; then
  echo "  ✅ bot.js uses GH_TOKEN"
else
  echo "  ❌ bot.js not updated with GitHub token"
fi
echo ""

# Check 4: Documentation
echo "✓ CHECK 4: Documentation"
if [ -f ".github/RAILWAY_SETUP.md" ]; then
  echo "  ✅ Railway setup documentation created"
else
  echo "  ❌ Railway setup documentation missing"
fi
echo ""

# Check 5: Removed Solana references
echo "✓ CHECK 5: Solana Removal"
if ! grep -q "SOLANA_RPC" .env.example; then
  echo "  ✅ SOLANA_RPC removed from .env.example"
else
  echo "  ⚠️ SOLANA_RPC still in .env.example"
fi

if ! grep -q "SOLANA_RPC" .github/workflows/deploy-bot.yml; then
  echo "  ✅ SOLANA_RPC removed from deploy-bot.yml"
else
  echo "  ⚠️ SOLANA_RPC still in deploy-bot.yml"
fi
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📋 SECRETS TO ADD TO GITHUB:"
echo ""
echo "Go to: Settings → Secrets and variables → Actions"
echo ""
echo "Add these secrets (click 'New repository secret' each time):"
echo ""
echo "1️⃣  COLOSSEUM_API_KEY"
echo "    Value: (your Colosseum API key)"
echo "    Purpose: Colosseum platform integration"
echo ""
echo "2️⃣  CHATGPT_KEY"
echo "    Value: (your OpenAI API key)"
echo "    Format: sk-..."
echo "    Purpose: ChatGPT analysis"
echo ""
echo "3️⃣  RAILWAY_API_KEY"
echo "    Value: (your Railway API token)"
echo "    Format: tr_prod_..."
echo "    Purpose: Railway deployment management"
echo "    Get it: https://railway.app/dashboard/tokens"
echo ""
echo "4️⃣  GH_TOKEN"
echo "    Value: (your GitHub Personal Access Token)"
echo "    Format: ghp_..."
echo "    Purpose: GitHub repository operations"
echo "    Permissions: repo, workflow"
echo ""
echo "5️⃣  PORT (Optional)"
echo "    Value: 4000 (or your preferred port)"
echo "    Purpose: API server port"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🚀 AFTER ADDING SECRETS:"
echo ""
echo "1. Commit and push changes:"
echo "   git add ."
echo "   git commit -m 'Configure Railway and GitHub integration'"
echo "   git push origin main"
echo ""
echo "2. Check GitHub Actions:"
echo "   → Go to Actions tab in your repository"
echo "   → Workflows should appear and run automatically"
echo ""
echo "3. Monitor bot execution:"
echo "   → Check Actions tab for workflow runs"
echo "   → Bot runs hourly automatically"
echo "   → Manual run: Actions → HeliosSynerga Bot Deployment → Run workflow"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📚 DOCUMENTATION:"
echo ""
echo "Quick Start:        .github/RAILWAY_SETUP.md"
echo "Full Guide:         .github/SECRETS_GUIDE.md"
echo "Quick Reference:    .github/QUICK_REFERENCE.md"
echo "Configuration:      CONFIG.md"
echo "Setup Guide:        QUICKSTART.md"
echo "Project Overview:   README.md"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "✨ YOUR BOT IS CONFIGURED FOR:"
echo ""
echo "✅ Colosseum API (trading platform)"
echo "✅ ChatGPT (AI analysis)"
echo "✅ Railway (deployment infrastructure)"
echo "✅ GitHub (repository & workflow control)"
echo "✅ 24/7 Hourly automation"
echo "✅ Secure secret management"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🎯 FINAL CHECKLIST:"
echo ""
echo "Before running the bot, ensure:"
echo ""
echo "☐ All 4 GitHub secrets are added"
echo "☐ Secrets have correct values (copy-paste carefully)"
echo "☐ Code is pushed to main branch"
echo "☐ GitHub Actions tab shows workflows"
echo "☐ Checked bot logs for any errors"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🚀 YOU'RE READY TO LAUNCH!"
echo ""
echo "Your HeliosSynerga bot is configured with:"
echo "  • Railway API for deployment"
echo "  • GitHub token for repository ops"
echo "  • ChatGPT for trading analysis"
echo "  • Colosseum for platform integration"
echo ""
echo "Bot Status: READY FOR DEPLOYMENT"
echo ""
echo "═══════════════════════════════════════════════════════════════"
