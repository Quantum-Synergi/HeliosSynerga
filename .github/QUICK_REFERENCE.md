# ⚡ GitHub Secrets & Actions - Quick Reference

## 📋 What Was Created

```
.github/
├── workflows/
│   ├── deploy-bot.yml          # One-time bot deployment
│   └── continuous-bot.yml      # Hourly automated bot runs
├── SECRETS_GUIDE.md            # Complete setup documentation
└── secrets-map.json            # Secret configuration mapping
```

## 🔐 GitHub Secrets to Add

Add these to: **Settings → Secrets and variables → Actions**

| Secret Name | Required | Example Value |
|---|---|---|
| `COLOSSEUM_API_KEY` | ✅ Yes | `abc123def456...` |
| `CHATGPT_KEY` | ✅ Yes | `sk-proj-...` |
| `RAILWAY_API_KEY` | ✅ Yes | `tr_prod_...` |
| `GH_TOKEN` | ✅ Yes | `ghp_...` |
| `PORT` | ❌ No | `4000` |

### How to Add a Secret

1. Go to **GitHub Repository**
2. Click **Settings** (top navigation)
3. Left sidebar: **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Enter **Name** and **Value**
6. Click **Add secret**

Repeat for each secret.

## 🚀 Running Your Bot

### Option 1: Manual Trigger (One-Time)

```
1. Go to repository → Actions tab
2. Select "🐉 HeliosSynerga Bot Deployment"
3. Click "Run workflow"
4. Select "main" branch
5. Click "Run workflow" button
6. Watch logs appear in real-time
```

### Option 2: Automatic Hourly (24/7)

Bot automatically runs every hour:
```
Powered by: .github/workflows/continuous-bot.yml
Schedule: 0 * * * * (every hour at top of hour)
Duration: ~55 minutes per run
Status: Check Actions → continuous-bot.yml
```

### Option 3: On Every Push

Bot runs when you push to `main` branch:
```
1. Make changes locally
2. Commit and push: git push origin main
3. Go to Actions tab
4. Watch workflow run automatically
```

## 📊 Monitoring Bot Runs

### View Logs
```
1. Go to Actions tab
2. Click the workflow run
3. Click "Run Bot" step
4. See all bot output in real-time
```

### Expected Output
```
🐉 Starting HeliosSynerga Bot...
💹 [arbitrage] Trade: 0.05 SOL | PnL: 0.0008
💹 [liquidity] Trade: 0.1 SOL | PnL: -0.0012
💹 [trend] Trade: 0.05 SOL | PnL: 0.0015
📊 Dashboard API running at http://localhost:4000
🤖 ChatGPT Agent: Trading analysis complete
...
```

## 🔧 Customization

### Use Custom Secret Names?

Edit the workflow files and replace secret references:

**Before:**
```yaml
COLOSSEUM_API_KEY: ${{ secrets.COLOSSEUM_API_KEY }}
CHATGPT_KEY: ${{ secrets.CHATGPT_KEY }}
```

**After (with custom names):**
```yaml
COLOSSEUM_API_KEY: ${{ secrets.MY_COLOS_API }}
CHATGPT_KEY: ${{ secrets.OPENAI_SECRET }}
```

### Change Schedule?

Edit `.github/workflows/continuous-bot.yml` and modify:

```yaml
schedule:
  # Every hour (current)
  - cron: '0 * * * *'
  
  # Every 30 minutes
  - cron: '*/30 * * * *'
  
  # Every 6 hours
  - cron: '0 */6 * * *'
  
  # Every hour on weekdays only
  - cron: '0 * * * 1-5'
```

See [cron syntax](https://crontab.guru/) for more options.

## ⚠️ Common Issues

### "Secret not found" Error

**Problem**: Workflow fails with undefined secret
```
Error: Unexpected input 'COLOSSEUM_API_KEY' is not allowed
```

**Solution**:
1. Verify secret name in Settings → Secrets
2. Check spelling matches exactly (case-sensitive)
3. Ensure secret has a value (not empty)
4. Commit and push code again

### "API authentication failed"

**Problem**: Bot runs but API fails to authenticate
```
Error fetching forum: 401 Unauthorized
```

**Solution**:
1. Check API key is correct in GitHub Secrets
2. Verify key hasn't been revoked/expired
3. Test key locally first:
   ```bash
   cp .env.example .env
   # Add your actual keys to .env
   npm run dev
   ```
4. Update GitHub Secret if needed

### Workflow "Queued" or "In Progress" For Long Time

**Problem**: Workflow stuck or hanging

**Solution**:
1. Check runner availability (GitHub Actions might be busy)
2. Click "Cancel" to stop the workflow
3. Re-run the workflow
4. Check latest bot activity in logs

## 📚 Documentation

- **[`.github/SECRETS_GUIDE.md`](.github/SECRETS_GUIDE.md)** - Complete setup guide
- **[`README.md`](README.md)** - Project overview
- **[`QUICKSTART.md`](QUICKSTART.md)** - Local development setup
- **[`CONFIG.md`](CONFIG.md)** - Configuration details

## 💡 Pro Tips

✅ **Always use GitHub Secrets for API keys** - Never commit `.env` file
✅ **Test locally first** - Run `npm run dev` before deploying
✅ **Monitor first run** - Check logs to ensure bot is working
✅ **Rotate keys regularly** - Update GitHub Secrets periodically
✅ **Set up notifications** - GitHub can email you on workflow failures

## 🔗 Quick Links

- Your Repository: https://github.com/Quantum-Synergi/HeliosSynerga
- Actions Tab: https://github.com/Quantum-Synergi/HeliosSynerga/actions
- Settings Secrets: https://github.com/Quantum-Synergi/HeliosSynerga/settings/secrets/actions
- Workflow Syntax: https://docs.github.com/en/actions/using-workflows
- Cron Syntax: https://crontab.guru/

---

**Your bot is configured and ready to deploy! 🚀**

Next step: Add your GitHub Secrets in Settings → Secrets and variables → Actions
