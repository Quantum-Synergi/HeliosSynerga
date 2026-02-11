# 🔐 GitHub Secrets Integration Guide

Configure your HeliosSynerga bot to run on GitHub Actions using your stored secrets.

## Overview

GitHub Secrets securely store sensitive information (API keys) that your bot needs to run. The workflows use these secrets to:
1. Create `.env` file at runtime
2. Pass credentials to the bot safely
3. Run the bot on schedule or on-demand

## Setting Up GitHub Secrets

### Step 1: Navigate to Repository Settings

1. Go to your GitHub repository
2. Click **Settings** (top right)
3. In the left sidebar, click **Secrets and variables** → **Actions**

### Step 2: Create Required Secrets

Click **New repository secret** and add these:

#### Secret 1: COLOSSEUM_API_KEY
- **Name**: `COLOSSEUM_API_KEY`
- **Value**: Your Colosseum API key (from agents.colosseum.com)
- **Required**: ✅ Yes

#### Secret 2: CHATGPT_KEY
- **Name**: `CHATGPT_KEY`
- **Value**: Your OpenAI API key (starts with `sk-`)
- **Required**: ✅ Yes

#### Secret 3: RAILWAY_API_KEY
- **Name**: `RAILWAY_API_KEY`
- **Value**: Your Railway API key (from https://railway.app/dashboard/tokens)
- **Required**: ✅ Yes

#### Secret 4: GH_TOKEN
- **Name**: `GH_TOKEN`
- **Value**: Your GitHub Personal Access Token (starts with `ghp_`)
- **Required**: ✅ Yes
- **Permissions**: Needs `repo` and `workflow` scopes

#### Secret 5: PORT (Optional)
- **Name**: `PORT`
- **Value**: `4000` (or your preferred port)
- **Required**: ❌ No (has default)

### Step 3: Verify Secrets Are Set

```bash
# You can verify in GitHub Actions logs (secrets are masked)
# Go to Actions tab → Select a workflow run
# Check the step "Create .env from Secrets"
```

## Using Workflows

### Workflow 1: One-Time Deployment

**File**: `.github/workflows/deploy-bot.yml`

**What it does**:
- Installs dependencies
- Creates `.env` from secrets
- Runs bot once

**How to trigger**:
1. Go to **Actions** tab
2. Select **🐉 HeliosSynerga Bot Deployment**
3. Click **Run workflow**

**Manual trigger locations**:
- Workflow dispatch via GitHub UI
- On push to `main` or `develop` branches
- Can be triggered via GitHub API

### Workflow 2: Continuous 24/7 Bot (Recommended)

**File**: `.github/workflows/continuous-bot.yml`

**What it does**:
- Runs bot every hour automatically
- Creates new `.env` from secrets each run
- Logs trading activity

**Schedule**:
- Runs every hour (top of the hour)
- Runs on push to `main` branch
- Can be manually triggered

**Runs each cycle for**: ~55 minutes (then stops to allow interval)

## Custom Secret Names

If your secrets use different names, edit the workflow files:

### Find:
```yaml
COLOSSEUM_API_KEY: ${{ secrets.COLOSSEUM_API_KEY }}
CHATGPT_KEY: ${{ secrets.CHATGPT_KEY }}
RAILWAY_API_KEY: ${{ secrets.RAILWAY_API_KEY }}
GH_TOKEN: ${{ secrets.GH_TOKEN }}
```

### Replace with your secret names:
```yaml
COLOSSEUM_API_KEY: ${{ secrets.YOUR_CUSTOM_COLOSSEUM_KEY }}
CHATGPT_KEY: ${{ secrets.YOUR_CHATGPT_SECRET }}
RAILWAY_API_KEY: ${{ secrets.YOUR_RAILWAY_KEY }}
GH_TOKEN: ${{ secrets.YOUR_GH_TOKEN }}
```

## Testing Your Setup

### Test 1: Verify Secrets Exist

GitHub will fail the workflow if a secret is missing. Check logs:
1. Go to **Actions** tab
2. Click the failed workflow
3. Look for error: `secrets are undefined`

### Test 2: Manual Workflow Run

1. Go to **Actions** → **HeliosSynerga Bot Deployment**
2. Click **Run workflow** button
3. Watch the logs in real-time

### Test 3: Check Bot Output

Logs appear in the **Run Bot** step:
```
🤖 Starting HeliosSynerga Bot...
💹 [arbitrage] Trade: 0.05 SOL | PnL: 0.0008
💹 [liquidity] Trade: 0.1 SOL | PnL: -0.0012
...
```

## Monitoring Bot Runs

### View Execution Logs

1. Go to **Actions** tab
2. Select the workflow run
3. Click **Run Bot** step
4. View all console output

### Check Run History

- Go to **Actions** → **Workflow name**
- See all past runs with:
  - Status (✅ passed, ❌ failed)
  - Duration
  - Timestamp

### Set Up Notifications

GitHub can notify you when workflows:
- Complete successfully
- Fail
- Request approval

Go to **Settings** → **Notifications** to configure.

## Troubleshooting

### Issue: "Secret not found"

**Solution**:
1. Verify secret name in Settings → Secrets
2. Ensure secret value is not empty
3. Check for typos in workflow file
4. Redeploy after adding/fixing secret

### Issue: "API authentication failed"

**Solution**:
1. Verify API key is correct
2. Check key has required permissions
3. Ensure key hasn't been revoked
4. Try the key locally first: `npm run dev`

### Issue: Workflow shows "No logs"

**Solution**:
1. Check workflow is running (might be queued)
2. GitHub Actions runners might be busy
3. Try re-running the workflow
4. Check repository size (large repos can be slow)

### Issue: Bot exits immediately

**Problem**: Setting `timeout 3300` to allow longer cycle
**Solution**: Increase timeout in workflow files if needed

```yaml
# Current: 3300 seconds (55 minutes)
timeout 3300 node heliossynerga/backend/bot.js

# For longer runs:
timeout 7200 node heliossynerga/backend/bot.js  # 2 hours
```

## Security Best Practices

✅ **DO**:
- Store API keys as GitHub Secrets
- Rotate keys regularly
- Use read-only API keys where possible
- Keep secrets in `.gitignore`
- Review workflow logs for sensitive data

❌ **DON'T**:
- Commit `.env` file to repository
- Share API keys in messages or logs
- Use same key across projects
- Commit secrets in code comments
- Leave secrets visible in workflow output

## Advanced Configuration

### Environment-Specific Workflows

Create separate workflows for different environments:

```yaml
# .github/workflows/dev-bot.yml
jobs:
  deploy-to-dev:
    environment: development
    # Uses dev secrets

# .github/workflows/prod-bot.yml
jobs:
  deploy-to-prod:
    environment: production
    # Uses prod secrets
```

### Conditional Execution

Run bot only on specific conditions:

```yaml
if: ${{ secrets.ENABLE_BOT == 'true' }}
```

### Slack Notifications

Notify Slack when bot completes:

```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "HeliosSynerga bot completed"
      }
```

## Reference Links

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Actions Workflows](https://docs.github.com/en/actions/using-workflows)
- [OpenAI API Keys](https://platform.openai.com/account/api-keys)
- [Colosseum Platform](https://agents.colosseum.com/)
- [Solana RPC Endpoints](https://docs.solana.com/rpc/http)

---

**Need help?** Check `.github/workflows/` for example configurations or run `bash setup-github-secrets.sh` for interactive setup.
