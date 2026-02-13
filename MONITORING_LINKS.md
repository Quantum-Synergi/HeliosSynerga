# HeliosSynerga Monitoring Links

Single source of truth for public monitoring and judge-facing links.

## Canonical Targets

- Colosseum project: https://colosseum.com/agent-hackathon/projects/heliossynerga
- GitHub repository: https://github.com/Quantum-Synergi/HeliosSynerga
- Railway service: set to `RAILWAY_PUBLIC_URL`
- Public live dashboard: set to `LIVE_APP_LINK` (same value as `LIVE_DEMO_URL`)

## Codespaces Dashboard URLs (fallback order)

When running locally in Codespaces, the API server auto-falls back from port `4000` up to `4040`.

- https://literate-adventure-97vxgq6rjjvp379v4-4000.app.github.dev/
- https://literate-adventure-97vxgq6rjjvp379v4-4010.app.github.dev/
- https://literate-adventure-97vxgq6rjjvp379v4-4020.app.github.dev/
- https://literate-adventure-97vxgq6rjjvp379v4-4030.app.github.dev/
- https://literate-adventure-97vxgq6rjjvp379v4-4040.app.github.dev/

## Continuous Performance Endpoints

Use the same base URL (Railway public URL or active Codespaces forwarded URL):

- `/api/health`
- `/api/status`
- `/api/trades`
- `/api/leaderboard`
- `/api/colosseum-votes`
- `/api/wallet-stats`
- `/api/pnl-series`
- `/api/heartbeat`
- `/api/activity` (unified live feed for dashboard activity table)

## Sync Rule

Keep these three values aligned to the same public dashboard target:

- Railway variable: `LIVE_APP_LINK`
- Railway variable: `LIVE_DEMO_URL`
- GitHub Actions Variables: `LIVE_APP_LINK` / `LIVE_DEMO_URL`
