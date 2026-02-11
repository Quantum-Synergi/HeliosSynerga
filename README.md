# 🐉 HeliosSynerga - Autonomous Hackathon Trading Bot

**Three-headed AI focus: Arbitrage, Liquidity, Trend-following** 

A 24/7 autonomous trading bot integrated with Solana, featuring:
- **Automated Trading**: Real-time simulated trading with multiple strategies
- **Forum Engagement**: Auto-comment on community discussions
- **AI Agent**: ChatGPT-powered analysis and decision making
- **Live Dashboard**: Real-time performance tracking and visualization
- **Self-Upgrading**: Dynamic dashboard updates and project management

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- API keys for:
  - Colosseum API
  - OpenAI/ChatGPT
  - Railway API (for deployment)
  - GitHub Personal Access Token

### Setup

1. **Clone and navigate to the project:**
   ```bash
   cd /workspaces/HeliosSynerga
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your API keys:
   ```
   COLOSSEUM_API_KEY=your_api_key_here
   CHATGPT_KEY=sk-your_openai_key_here
   RAILWAY_API_KEY=your_railway_api_key
   
   PORT=4000
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Launch the bot:**
   ```bash
   npm run dev
   ```
   or
   ```bash
   bash launch.sh
   ```

---

## � Deploy with GitHub Actions

Run the bot 24/7 on GitHub's infrastructure using your stored GitHub secrets:

### Quick Start (GitHub Actions)

1. **Add GitHub Secrets:**
   - Go to repository **Settings** → **Secrets and variables** → **Actions**
   - Add secrets: `COLOSSEUM_API_KEY`, `CHATGPT_KEY`, (optionally `SOLANA_RPC`, `PORT`)

2. **Enable Workflows:**
   - Go to **Actions** tab
   - Approve the workflows from the `.github/workflows/` directory

3. **Run Bot:**
   - Manual: Go to **Actions** → Select workflow → **Run workflow**
   - Automatic: Bot runs every hour via `continuous-bot.yml`
   - On Push: Triggered on any push to `main` branch

### Available Workflows

- **`deploy-bot.yml`**: One-time bot run (manual trigger or on push)
- **`continuous-bot.yml`**: Automatic hourly runs (24/7 operation)

### Documentation

See [`.github/SECRETS_GUIDE.md`](./.github/SECRETS_GUIDE.md) for:
- Step-by-step GitHub Secrets setup
- Custom secret name mapping
- Workflow customization
- Troubleshooting

---

## �📊 Access Points

Once running:
- **Dashboard**: http://localhost:5500
- **API**: http://localhost:4000
  - `/api/trades` - Trading history
  - `/api/forum` - Forum activity
  - `/api/project` - Project status

---

## 🏗️ Project Structure

```
heliossynerga/
├── backend/
│   └── bot.js                  # Main trading bot logic
├── dashboard/
│   └── index.html              # Real-time performance dashboard
└── data/
    └── heliossynerga.db        # SQLite database (auto-created)
```

---

## 🤖 Features

### Trading Module
- **Arbitrage Strategy**: 0.05 SOL trades
- **Liquidity Strategy**: 0.1 SOL trades  
- **Trend Folding**: 0.05 SOL trades
- Real-time P&L calculation and logging

### Forum Integration
- Auto-detect hot posts
- Intelligent comment posting
- Comment tracking in database

### ChatGPT Agent
- Analyzes recent trades (last 10)
- Reviews forum activity (last 5 posts)
- Suggests new strategies
- Auto-executes trades based on AI recommendations

### Dashboard
- Live P&L chart with Chart.js
- Trade history table
- Forum activity log
- Real-time status updates

### Project Management
- Auto-submit project to Colosseum
- Update project metadata
- ClawKey verification (optional)

---

## 📝 Running in Development

Start with watch mode:
```bash
npm run start       # Run bot only
npm run dashboard   # Run dashboard only
npm run dev         # Run both concurrently
```

---

## 🔧 Configuration

### Database
SQLite database is auto-created at `heliossynerga/data/heliossynerga.db` with three tables:
- `trades`: Trading history with strategy, amount, and P&L
- `forum`: Forum engagement logs
- `project`: Project update status

### API Integration
- **Colosseum API**: For project management and forum interaction
- **OpenAI API**: For ChatGPT analysis (model: gpt-4.1-mini)
- **Solana Web3.js**: For blockchain integration (currently generating local keypair)

---

## ⚠️ Security Notes

- **Never commit `.env`** with real API keys
- Store API keys securely in environment
- Use read-only API keys where possible
- Consider key rotation for production use

---

## 🐉 The 3-Headed Dragon

1. **Arbitrage Head**: Exploits price discrepancies
2. **Liquidity Head**: Provides market depth
3. **Trend Head**: Follows momentum patterns

All three trade autonomously on 60-second cycles while AI learns and improves strategy.

---

## 📦 Dependencies

Key packages:
- `express` - REST API server
- `sqlite3` - Database
- `axios` - HTTP client
- `@solana/web3.js` - Solana blockchain
- `openai` - ChatGPT integration
- `chart.js` - Dashboard visualization
- `concurrently` - Run multiple processes
- `live-server` - Dashboard hosting

---

## 🐛 Troubleshooting

**Dashboard shows "Waiting for bot API":**
- Ensure bot is running on port 4000
- Check `.env` configuration
- Verify API keys are valid

**API authentication failures:**
- Validate API keys in `.env`
- Check Colosseum/OpenAI account status

**Database locked errors:**
- Ensure only one bot instance is running
- Close any database viewers

---

## 📄 License

MIT - Open source and free to use

---

**Built with 🔥 for autonomous trading** | Made by HeliosSynerga Team
