# 🚀 HeliosSynerga - Quick Start Guide

Welcome to the HeliosSynerga autonomous trading bot! Follow these steps to get up and running.

## Step 1: Setup Environment Variables

1. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API keys:
   ```bash
   nano .env
   # or use your preferred editor
   ```

3. Required variables:
   - **COLOSSEUM_API_KEY**: Your API key from Colosseum
   - **CHATGPT_KEY**: Your OpenAI API key (sk-...)
   - **RAILWAY_API_KEY**: Your Railway deployment API key
   - **GH_TOKEN**: Your GitHub Personal Access Token (ghp-...)
   - **PORT**: Server port (defaults to 4000)

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express (API server)
- SQLite3 (database)
- Railway API (deployment integration)
- OpenAI (ChatGPT)
- Chart.js (dashboard visualization)

## Step 3: Launch HeliosSynerga

### Option A: Using npm scripts

```bash
npm run dev        # Run bot + dashboard concurrently
npm run start      # Run bot only
npm run dashboard  # Run dashboard only
```

### Option B: Using launch script

```bash
bash launch.sh     # Interactive launch with checks
```

## Step 4: Access the Dashboard

Once running, open your browser and navigate to:
- **Dashboard**: http://localhost:5500
- **API**: http://localhost:4000

The dashboard will show:
- Real-time P&L chart
- Trading history
- Forum activity log
- Bot status

## What Happens Next?

The bot will automatically:

1. **Initialize**: Update project metadata on Colosseum
2. **Trade**: Execute 3 trading strategies every 60 seconds:
   - Arbitrage (0.05 SOL)
   - Liquidity (0.1 SOL)
   - Trend following (0.05 SOL)
3. **Engage**: Post comments on forum discussions
4. **Analyze**: Use ChatGPT to review trades and suggest improvements
5. **Track**: Store all data in SQLite database

## Troubleshooting

### Bot API not responding
- Check that bot is running on port 4000
- Verify `.env` configuration
- Check API keys are valid

### "Cannot find module" errors
- Run `npm install` again
- Delete `node_modules` and reinstall
- Check Node.js version (16+)

### Database errors
- Ensure no other instance is running
- Delete `heliossynerga/data/heliossynerga.db` to reset

### API authentication failures
- Validate your API keys in `.env`
- Check Colosseum and OpenAI account status
- Ensure keys have necessary permissions

## File Structure

```
HeliosSynerga/
├── .env                          # Environment variables (YOU CREATE THIS)
├── .env.example                  # Template
├── .gitignore                    # Git exclusions
├── package.json                  # Dependencies
├── launch.sh                     # Launch script
├── README.md                     # Documentation
├── heliossynerga/
│   ├── backend/
│   │   └── bot.js               # Main trading bot
│   ├── dashboard/
│   │   └── index.html           # Dashboard UI
│   └── data/
│       └── heliossynerga.db     # Auto-created database
```

## Database Schema

The SQLite database includes 3 tables:

### trades
- id (INTEGER PRIMARY KEY)
- strategy (TEXT)
- amount (REAL)
- pnl (REAL)
- timestamp (DATETIME)

### forum
- id (INTEGER PRIMARY KEY)
- postId (INTEGER)
- comment (TEXT)
- timestamp (DATETIME)

### project
- status (TEXT)
- updatedAt (DATETIME)

## API Endpoints

All endpoints return JSON:

```bash
# Get trading history
curl http://localhost:4000/api/trades

# Get forum activity
curl http://localhost:4000/api/forum

# Get project status
curl http://localhost:4000/api/project
```

## Security Reminders

⚠️ **Important**:
- Never commit `.env` to git
- Don't share API keys in messages/chats
- Keep backup of valid API keys
- Monitor API usage for unexpected activity
- Consider rotating keys regularly

## Next Steps

1. Customize trading strategies in `bot.js`
2. Enhance dashboard with additional metrics
3. Add more forum engagement logic
4. Integrate with additional exchanges
5. Deploy to production server

---

**Need help?** Check the README.md for detailed documentation!
