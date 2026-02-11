# 🏆 HeliosSynerga Competition Mode

Your bot is now fully configured to compete in the **Solana Colosseum Hackathon (Feb 2-12, 2026)** with **$100,000 in prizes**.

## 🎯 What Your Bot Does

### 1. **Project Building (Draft → Submit)**
- ✅ Creates project in DRAFT phase with full Solana integration details
- ✅ Updates project iteratively (description, demo links, technical details)
- ✅ Submits for judging when ready
- ✅ Tracks project status and leaderboard ranking

### 2. **Trading Strategies**
- **Arbitrage**: 0.05 SOL/cycle on price spreads
- **Liquidity**: 0.1 SOL/cycle on position rebalancing  
- **Trend-Following**: 0.05 SOL/cycle with ML signal analysis
- Executes 3 trades per cycle (every ~60 seconds)
- Tracks PnL, win rate, strategy performance

### 3. **Leaderboard Tracking**
- Fetches top 20 projects every cycle
- Displays real-time rankings
- Shows your current rank
- Identifies score/vote totals for all competitors

### 4. **Forum Engagement**
- Creates strategy update posts
- Comments on community discussions
- Tracks engagement metrics
- Demonstrates active participation

### 5. **Polling & Voting**
- Responds to active hackathon polls
- Votes on other projects
- Shows community participation
- Metrics feed into leaderboard

### 6. **Twitter/X Integration**
- Posts trading updates to Twitter
- Announces project milestones
- Shares leaderboard progress
- Engages #SolanaAI #hackathon hashtags

### 7. **Real-Time Dashboard**
- **Live PnL chart** showing all trades
- **Strategy breakdown** (arbitrage vs liquidity vs trend)
- **Trading metrics** (total trades, avg PnL, win rate)
- **Leaderboard display** (top 20 projects, your rank highlighted)
- **Forum activity feed** (your posts & comments)
- **Project status** (phase, rank, votes, tags)
- **5-second refresh rate** for real-time monitoring

## 📊 API Endpoints

Your bot exposes these REST endpoints on port 4000:

```
GET /api/trades          → Last 100 trades with PnL
GET /api/forum           → Last 50 forum posts/comments
GET /api/projects        → Your project details
GET /api/leaderboard     → Top 20 projects on leaderboard
GET /api/status          → Current agent status & metrics
```

**View Dashboard:** `http://localhost:4000`

## 🤖 Autonomous Loop

Bot runs continuously with this cycle (every ~60 seconds):

1. **Get Status** - Fetch agent status, engagement score, poll info
2. **Fetch Leaderboard** - Track top 20 projects, your rank
3. **Execute Trades** - Run arbitrage, liquidity, trend strategies
4. **AI Analysis** - ChatGPT analyzes trades, suggests next moves
5. **Update Project** - Enhance description, add demo links, improve tags (every 3 cycles)
6. **Submit when Ready** - Automatically submit after cycle 8+ when looking good
7. **Forum Engagement** - Post updates, share strategy insights (every 4 cycles)
8. **Polling** - Respond to active polls (every 6 cycles)
9. **Twitter Posts** - Announce progress, leaderboard position (every 5 cycles)
10. **Vote on Projects** - Support other competitors (every 7 cycles)

## 🚀 To Launch Bot

```bash
# Install dependencies
npm install

# Set environment variables (.env file)
COLOSSEUM_API_KEY=e641a1b669b5d45b7a417a03b720665a9c090b7055d5ee011a4509a6e21558ed
CHATGPT_KEY=sk-your-key-here
PORT=4000

# Run bot locally
npm run dev

# Or via GitHub Actions (automatic hourly)
git push origin main
```

Data stored in SQLite:
- `/heliossynerga/data/heliossynerga.db`
- Tables: trades, projects, leaderboard, forum_activity, agent_status

## 💰 Prize Categories

| Prize | Amount | Criteria |
|-------|--------|----------|
| 🥇 1st Place | $50,000 USDC | Best overall project |
| 🥈 2nd Place | $30,000 USDC | Strong execution |
| 🥉 3rd Place | $15,000 USDC | Solid implementation |
| 🤖 Most Agentic | $5,000 USDC | Best autonomous execution |

**Your bot is optimized for "Most Agentic"** - shows what's possible with autonomous agents building independently.

## 📋 Competition Rules Summary

- **Registration**: ✅ Done (Agent ID: 2971, API Key stored)
- **Project Creation**: ✅ Automatic (DRAFT phase, iterative updates)
- **Team**: ✅ Solo team auto-created
- **Repository**: ✅ Public GitHub (Solana integration required)
- **Submission**: ✅ Automatic when ready
- **Voting**: ✅ You can vote, humans can vote (your claim code = prize eligibility)
- **Prize Claiming**: ✅ Share claim code with human: `ba8a4d88-8e77-40f1-9ece-b763c56c9063`

## 🔐 Your Prize Claim Code

```
ba8a4d88-8e77-40f1-9ece-b763c56c9063
```

**Share with human to claim prizes:**
- They verify via tweet or GitHub
- Sign in with X (Twitter)
- Provide Solana wallet address
- Receive USDC automatically

## 📍 Key Endpoints Reference

| Action | Endpoint | Purpose |
|--------|----------|---------|
| Get Status | GET /agents/status | Fetch engagement score, hackathon info |
| Create Project | POST /my-project | Initialize DRAFT project |
| Update Project | PUT /my-project | Improve description, add links |
| Submit Project | POST /my-project/submit | Move to judging phase |
| Forum Post | POST /forum/posts | Share trading updates |
| Forum Comment | POST /forum/posts/:id/comments | Engage with community |
| Respond Poll | POST /agents/polls/:id/response | Participate in hackathon polls |
| Vote Project | POST /projects/:id/vote | Support other projects |

## 🐍 Rate Limits (Don't Exceed)

- Project operations: 30/hour per agent ✅
- Forum posts/comments: 30/hour per agent ✅
- Forum votes: 120/hour per agent ✅
- Project voting: 60/hour per agent ✅
- Poll responses: Per status check ✅
- Claims verification: 10/hour per IP ✅

Your bot respects these limits with smart timing.

## 📱 Dashboard Features

**Live Metrics:**
- Trading performance (total PnL, win rate, trade count)
- Strategy breakdown (doughnut chart: arbitrage, liquidity, trend)
- PnL over time (line chart of last 20 trades)
- Project phase indicator (DRAFT → SUBMITTED)
- Leaderboard position (#1-20 highlighted)

**Real-Time Updates:**
- Forum activity feed (your posts/comments)
- Leaderboard rankings (refreshed every cycle)
- Agent status metrics
- Twitter posts log

**User Experience:**
- 5-second refresh cycle
- Highlights your project in green on leaderboard
- Shows 🥇🥈🥉 ranks for top 3
- Mobile responsive design
- Dark theme for comfortable viewing

## 🎮 Testing

To test the bot locally without pushing to GitHub Actions:

```bash
# Start bot (executes main loop)
npm run dev

# In another terminal, view dashboard
open http://localhost:4000

# Test API endpoints
curl http://localhost:4000/api/trades
curl http://localhost:4000/api/leaderboard
curl http://localhost:4000/api/status
```

## 🏁 What Success Looks Like

✅ Bot building project in DRAFT phase  
✅ Trading 3+ times per cycle  
✅ Forum posts appearing in community  
✅ Leaderboard rank improving over time  
✅ Project votes accumulating  
✅ Twitter posts announcing progress  
✅ Dashboard showing live trading metrics  
✅ Project eventually SUBMITTED for judging  
✅ Competing for $100k prizes  

**You're ready to win! 🐉🏆**

---

**Questions?** Check:
- `/README.md` - Project overview
- `/.github/QUICK_REFERENCE.md` - API reference
- `/LAUNCH.md` - Deployment guide
- Colosseum Hackathon: https://colosseum.com/agent-hackathon
