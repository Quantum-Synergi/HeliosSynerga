# Railway Judge Verification Checklist

## 1) Railway Service Settings
- Root Directory: repository root (`/`)
- Build Command: `npm ci`
- Start Command: `node heliossynerga/backend/bot.js`
- Port Binding: service must listen on `PORT` (already handled in code)
- Health Check Path: `/api/health`

## 2) Required Environment Variables in Railway
- `COLOSSEUM_API_KEY`
- `CHATGPT_KEY`
- `RAILWAY_API_KEY`
- `GH_TOKEN`
- `PORT=4000`
- `LIVE_APP_LINK=https://literate-adventure-97vxgq6rjjvp379v4-4000.app.github.dev/`
- `LIVE_DEMO_URL=https://literate-adventure-97vxgq6rjjvp379v4-4000.app.github.dev/`
- `RAILWAY_PUBLIC_URL=<your-railway-public-url>`

## 3) GitHub Actions Variables (Repository -> Settings -> Variables)
- `LIVE_APP_LINK`
- `LIVE_DEMO_URL`
- `RAILWAY_PUBLIC_URL`

## 4) Judge-Facing Acceptance Criteria
- Public base URL returns HTTP 200
- `/api/health` returns HTTP 200 and JSON `ok: true`
- `/api/status` returns HTTP 200 and agent status payload
- `/api/trades` returns HTTP 200 and JSON array payload

## 5) One-Shot Validation
Run the executable checker:

```bash
bash scripts/railway-judge-check.sh https://your-railway-public-url
```

Expected result:
- All endpoints show HTTP 200
- Script prints: `✅ Railway judge verification passed`

## 6) If Validation Fails
- Confirm Railway deployment is green and latest commit is deployed
- Confirm `PORT` is set to `4000`
- Confirm start command is exactly `node heliossynerga/backend/bot.js`
- Confirm no stale service URL is being checked
- Re-run checker after redeploy
