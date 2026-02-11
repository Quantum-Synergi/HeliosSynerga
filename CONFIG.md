# ⚙️ HeliosSynerga Configuration Guide

Detailed configuration and customization options for the HeliosSynerga trading bot.

## Environment Variables (.env)

### Required Variables

#### COLOSSEUM_API_KEY
- **What it is**: API key for Colosseum platform integration
- **Where to get it**: Colosseum dashboard at https://agents.colosseum.com/
- **Format**: Usually a long alphanumeric string
- **Example**: `COLOSSEUM_API_KEY=abc123def456ghi789...`
- **Usage**: For project management and forum integration

#### CHATGPT_KEY
- **What it is**: OpenAI API key for ChatGPT integration
- **Where to get it**: https://platform.openai.com/account/api-keys
- **Format**: Starts with `sk-`
- **Example**: `CHATGPT_KEY=sk-proj-abc123def456...`
- **Usage**: AI-powered trading analysis and decision making
- **Cost**: Pay-per-token (monitor usage!)

#### RAILWAY_API_KEY
- **What it is**: Railway platform API key for deployments and infrastructure
- **Where to get it**: https://railway.app/dashboard/tokens
- **Format**: Usually starts with `tr_prod_` or similar prefix
- **Example**: `RAILWAY_API_KEY=tr_prod_abc123...`
- **Usage**: Deployment management, monitoring, and project configuration
- **Note**: Required for Railway integration and deployment features

#### GH_TOKEN
- **What it is**: GitHub Personal Access Token for repository operations
- **Where to get it**: https://github.com/settings/tokens
- **Format**: Starts with `ghp_`
- **Example**: `GH_TOKEN=ghp_your_personal_token`
- **Usage**: Repository access, branch management, workflow configuration
- **Permissions**: Requires `repo` and `workflow` scopes
- **Note**: Keep this token secure, never commit to repository

#### PORT
- **What it is**: HTTP server port for the API
- **Default**: `4000`
- **Options**: Any unused port (1000-65535)
- **Usage**: Dashboard API server
- **Note**: Change if port is already in use

### Optional Variables

#### CLAWKEY_DEVICE_ID
- **What it is**: ClawKey device identifier for verification
- **Format**: Device ID as provided by ClawKey
- **Usage**: Hardware security verification
- **Required**: Only if using ClawKey integration

---

## Trading Configuration

Edit `heliossynerga/backend/bot.js` to customize trading behavior.

### Trade Amounts

```javascript
// Current settings (Railway-based trading)
await trade('arbitrage', 0.05);    // 0.05 units
await trade('liquidity', 0.1);     // 0.1 units
await trade('trend', 0.05);        // 0.05 units
```

**Modify to change trade sizes**:
```javascript
await trade('arbitrage', 0.5);     // Larger trades
await trade('liquidity', 1.0);
await trade('trend', 0.5);
```

### Trade Frequency

```javascript
// Current: 60000ms = 60 seconds
await new Promise(res=>setTimeout(res, 60000));
```

**Modify to change frequency**:
```javascript
// Every 10 seconds
await new Promise(res=>setTimeout(res, 10000));
// Every 5 minutes
await new Promise(res=>setTimeout(res, 300000));
```

### PnL Calculation

```javascript
// Current: Random ±1% gain/loss
const pnl = parseFloat((Math.random()*0.02-0.01)*amount).toFixed(4);
```

**Modify formula**:
```javascript
// Wider range (±5%)
const pnl = parseFloat((Math.random()*0.10-0.05)*amount).toFixed(4);
// Always profitable (0.5-1.5%)
const pnl = parseFloat((Math.random()*0.01+0.005)*amount).toFixed(4);
```

---

## Dashboard Customization

Edit `heliossynerga/dashboard/index.html` to customize the UI.

### Chart Refresh Rate

```javascript
// Current: 5 seconds
setInterval(render, 5000);
```

**Change to**:
```javascript
setInterval(render, 10000);  // 10 seconds
setInterval(render, 1000);   // 1 second (more updates)
```

### Chart Type

Change from line chart to other types:
```javascript
// Current
type: 'line'

// Alternatives
type: 'bar'
type: 'doughnut'
type: 'radar'
type: 'bubble'
```

### Color Scheme

```javascript
// Current theme
--primary-color: #ffcc00
--bg-dark: #1e1e2f
--bg-light: #2d2d44

// Edit in <style> section to customize
```

---

## Database Configuration

The SQLite database is automatically created at `heliossynerga/data/heliossynerga.db`.

### Reset Database

```bash
rm heliossynerga/data/heliossynerga.db
npm run start   # Will recreate empty database
```

### Custom Tables

Add new tables in `bot.js`:

```javascript
db.run(`
  CREATE TABLE IF NOT EXISTS alerts(
    id INTEGER PRIMARY KEY,
    type TEXT,
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
```

### Query Data

```bash
# Install sqlite3 CLI (if needed)
npm install -g sqlite3

# Query database
sqlite3 heliossynerga/data/heliossynerga.db
# SQL> SELECT * FROM trades;
```

---

## API Configuration

### Express Server Port

The API runs on the port specified in `.env`:

```javascript
app.listen(PORT, ()=>{
  console.log(`📊 Dashboard API running at http://localhost:${PORT}`);
});
```

### Add Custom Endpoints

Add routes for new features:

```javascript
// Example: Get total PnL
app.get('/api/pnl-summary', (req, res) => {
  db.get(
    "SELECT SUM(pnl) as total FROM trades",
    (_, row) => res.json(row)
  );
});
```

---

## ChatGPT Configuration

### Model Selection

```javascript
// Current
model: "gpt-4.1-mini"

// Alternatives (less expensive)
model: "gpt-3.5-turbo"

// More powerful (more expensive)
model: "gpt-4"
model: "gpt-4-turbo"
```

### Temperature Setting

```javascript
// Current: Creative (0.7)
temperature: 0.7

// More deterministic (0-0.3)
temperature: 0.1

// More creative (0.8-1.0)
temperature: 0.9
```

### Prompt Customization

Edit the `chatGPTAgent()` function to modify AI analysis:

```javascript
const prompt = `
Your custom instructions here...
${JSON.stringify(trades)}
Respond as JSON with your analysis.
`;
```

---

## Performance Tuning

### Database Optimization

Limit query results:

```javascript
// Get only recent trades
"SELECT * FROM trades ORDER BY timestamp DESC LIMIT 50"

// Get trades from last 24 hours
"SELECT * FROM trades WHERE timestamp > datetime('now', '-1 day')"
```

### Memory Management

Monitor database size:

```bash
du -h heliossynerga/data/heliossynerga.db
```

Archive old data if needed:

```sql
DELETE FROM trades WHERE timestamp < datetime('now', '-30 days');
DELETE FROM forum WHERE timestamp < datetime('now', '-30 days');
```

---

## Security Settings

### API Key Rotation

1. Generate new keys on Colosseum/OpenAI
2. Update `.env` with new values
3. Restart bot
4. Revoke old keys

### Rate Limiting

Add rate limiting to API:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // 100 requests per windowMs
});

app.use(limiter);
```

### CORS Configuration

Restrict dashboard access:

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:5500']
}));
```

---

## Monitoring & Logging

### Enable Debug Logging

Add to `bot.js`:

```javascript
const DEBUG = true;

function log(msg) {
  if(DEBUG) console.log(`[DEBUG] ${new Date().toISOString()} ${msg}`);
}
```

### Log to File

```javascript
const fs = require('fs-extra');
const logPath = './heliossynerga/data/bot.log';

function logToFile(msg) {
  fs.appendFileSync(logPath, `${msg}\n`);
}
```

---

## Deployment Configuration

### Production Environment

```bash
# Use environment-specific settings
export NODE_ENV=production
export PORT=8080
npm run start
```

### Process Management

Use PM2:

```bash
npm install -g pm2

pm2 start heliossynerga/backend/bot.js --name "helios-bot"
pm2 save
pm2 startup
```

---

## Troubleshooting Configuration Issues

### Bot won't start
- Check `.env` exists and has required keys
- Verify Node.js version (16+)
- Check port availability

### Dashboard not updating
- Verify bot is running on PORT
- Check browser console for errors
- Clear browser cache

### API errors
- Validate API keys in `.env`
- Check API usage on Colosseum/OpenAI
- Ensure RPC endpoint is accessible

---

For more help, refer to README.md and QUICKSTART.md!
