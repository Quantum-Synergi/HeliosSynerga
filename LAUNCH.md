#!/bin/bash
# 🚀 HeliosSynerga GitHub Actions Launch Script

cat << 'EOF'

╔═══════════════════════════════════════════════════════════════╗
║           🐉 HeliosSynerga Bot Launch Sequence               ║
║             GitHub Actions Deployment Mode                   ║
╚═══════════════════════════════════════════════════════════════╝

🔐 STEP 1: ADD GITHUB SECRETS (MUST DO FIRST!)
═══════════════════════════════════════════════════════════════

Go to your GitHub repository:
→ Settings → Secrets and variables → Actions
→ Click "New repository secret"

Add these 4 secrets one by one:

📌 Secret #1: COLOSSEUM_API_KEY
   Name:  COLOSSEUM_API_KEY
   Value: (your Colosseum API key)

📌 Secret #2: CHATGPT_KEY
   Name:  CHATGPT_KEY
   Value: (your OpenAI API key, starts with sk-)

📌 Secret #3: RAILWAY_API_KEY
   Name:  RAILWAY_API_KEY
   Value: (your Railway API token)

📌 Secret #4: GH_TOKEN
   Name:  GH_TOKEN
   Value: (your GitHub Personal Access Token, starts with ghp_)

═══════════════════════════════════════════════════════════════

✅ STEP 2: COMMIT & PUSH CODE
═══════════════════════════════════════════════════════════════

Run these commands:

$ git add .
$ git commit -m "Configure Railway and GitHub Actions for 24/7 trading bot"
$ git push origin main

This will:
  ✓ Upload bot code to repository
  ✓ Trigger GitHub Actions workflows
  ✓ Bot will automatically start running

═══════════════════════════════════════════════════════════════

⏱️ STEP 3: MONITOR EXECUTION (Real-time)
═══════════════════════════════════════════════════════════════

After pushing code:

1. Go to your GitHub repository
2. Click "Actions" tab (top navigation)
3. Watch workflows execute in real-time

You should see:

📊 Workflow 1: "🐉 HeliosSynerga Bot Deployment"
   → Triggered by git push
   → Runs once when you push

📊 Workflow 2: "🚀 HeliosSynerga 24/7 Continuous Bot"
   → Runs automatically every hour
   → Will continue indefinitely

═══════════════════════════════════════════════════════════════

📈 STEP 4: VIEW BOT LOGS
═══════════════════════════════════════════════════════════════

Click on a workflow run to see:

   ✅ Checking out code
   ✅ Setting up Node.js
   ✅ Installing dependencies
   ✅ Creating .env from secrets
   ✅ Running bot...

Look for output like:

   🐉 Starting HeliosSynerga Bot...
   💹 [arbitrage] Trade: 0.05 SOL | PnL: 0.0008
   💹 [liquidity] Trade: 0.1 SOL | PnL: -0.0012
   💹 [trend] Trade: 0.05 SOL | PnL: 0.0015
   🤖 ChatGPT Agent: Trading analysis complete
   ✅ Bot completed cycle

═══════════════════════════════════════════════════════════════

🎯 STEP 5: AUTOMATION CONFIRMED
═══════════════════════════════════════════════════════════════

Once running, your bot will:

🔄 RUN EVERY HOUR AUTOMATICALLY
   → No manual intervention needed
   → Check Actions tab to monitor

⚡ EXECUTE 3 TRADING STRATEGIES
   → Arbitrage (0.05 units)
   → Liquidity (0.1 units)
   → Trend following (0.05 units)

💬 ENGAGE WITH FORUM
   → Post comments on hot discussions
   → Track engagement in database

🤖 USE CHATGPT FOR ANALYSIS
   → Analyze recent trades
   → Suggest new strategies
   → Auto-execute recommendations

📊 STORE ALL DATA
   → Trading history
   → Forum activity
   → Project status

═══════════════════════════════════════════════════════════════

📋 LAUNCH CHECKLIST
═══════════════════════════════════════════════════════════════

Before launching, verify:

☐ GitHub secrets added (all 4)
☐ Secrets have correct values
☐ Repository is on main branch
☐ Code is committed locally

When launching:

☐ Run: git add .
☐ Run: git commit -m "..."
☐ Run: git push origin main
☐ Go to Actions tab
☐ Watch workflows execute

After launch:

☐ Check initial run logs
☐ Verify no errors
☐ Bot runs hourly automatically
☐ Monitor via Actions tab

═══════════════════════════════════════════════════════════════

🚀 LAUNCH COMMANDS (Ready to Copy & Paste)
═══════════════════════════════════════════════════════════════

# Stage all changes
git add .

# Commit with message
git commit -m "🚀 Launch HeliosSynerga with Railway & GitHub Actions"

# Push to main branch
git push origin main

# Then check Actions tab for live execution!

═══════════════════════════════════════════════════════════════

⚠️ IMPORTANT: VERIFY SECRETS FIRST!
═══════════════════════════════════════════════════════════════

If workflows fail with "Secret not found" error:

1. Check GitHub Settings → Secrets
2. Verify all 4 secrets exist
3. Check secret names (case-sensitive):
   - COLOSSEUM_API_KEY
   - CHATGPT_KEY
   - RAILWAY_API_KEY
   - GH_TOKEN

4. Check secret values are not empty

5. Try running workflow again

═══════════════════════════════════════════════════════════════

💡 USEFUL LINKS
═══════════════════════════════════════════════════════════════

Repository:   https://github.com/Quantum-Synergi/HeliosSynerga
Actions:      https://github.com/Quantum-Synergi/HeliosSynerga/actions
Secrets:      https://github.com/Quantum-Synergi/HeliosSynerga/settings/secrets/actions
Railway:      https://railway.app/dashboard
GitHub Docs:  https://docs.github.com/en/actions

═══════════════════════════════════════════════════════════════

📚 DOCUMENTATION
═══════════════════════════════════════════════════════════════

See these files for detailed info:

  .github/RAILWAY_SETUP.md      → Railway + GitHub integration
  .github/SECRETS_GUIDE.md      → Complete secrets setup
  .github/QUICK_REFERENCE.md    → Quick reference guide
  README.md                     → Project overview
  CONFIG.md                     → Configuration details

═══════════════════════════════════════════════════════════════

✨ YOU'RE ABOUT TO LAUNCH!
═══════════════════════════════════════════════════════════════

Your bot is configured for:
  ✅ Colosseum API integration
  ✅ ChatGPT analysis
  ✅ Railway deployment
  ✅ GitHub Actions automation
  ✅ 24/7 hourly execution
  ✅ Forum engagement
  ✅ Autonomous trading

Ready to begin? Run the launch commands above! 🚀

═══════════════════════════════════════════════════════════════

Built for autonomous trading 🔥
Made by HeliosSynerga Team

EOF
