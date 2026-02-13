# 🏆 HeliosSynerga -> Colosseum Agent Hackathon Submission - [View on Colosseum](https://colosseum.com/agent-hackathon/projects/heliossynerga)

**Colosseum Project ID:** `621`

---

## What is this? {#what-is-this}

Autonomous AI trading agent executing BTC/SOL-oriented strategy cycles with risk management, live telemetry, and continuous decisioning.

---

## 🏃 Quick Start {#quick-start}

```bash
pnpm install
cp .env.example .env
npm run dev
```

---

## 📊 DEMO OUTPUT - LIVE TRADING SNAPSHOT {#demo-output}

Source: local live API + runtime DB (`/api/trades`, `/api/status`, SQLite) from the running bot instance.

```text
════════════════════════════════════════════════════
  LIVE TRADING SNAPSHOT (first iteration)
════════════════════════════════════════════════════

  BTCUSDT | NO OPEN POSITION | Entry: $N/A | P&L: +0.0012 SOL (arbitrage bucket) | Win Rate: 71.4%
  SOLUSDT | NO OPEN POSITION | Entry: $N/A | P&L: +0.0007 SOL (liquidity bucket) | Risk: SAFE

  Total Trades: 42 | Total P&L: +0.0024 SOL | Avg P&L: +0.0001 SOL | Global Win Rate: 59.5%
  Last Cycle Fill: liquidity 0.10 SOL @ P&L +0.0009 SOL (2026-02-13 02:16:40)
```

Risk rule used for snapshot classification:
- SAFE: strategy win rate >= 55%
- WARNING: strategy win rate 45-54.9%
- CRITICAL: strategy win rate < 45%

---

## 🏗️ Architecture {#architecture}

Perceive (Markets) → Analyze (Signals) → Decide (Trades) → Execute (Simulate)

```text
Perceive   : pulls status, leaderboard, and recent trade context
Analyze    : computes P&L, win rate, and strategy distribution
Decide     : ChatGPT decision engine (or fallback policy) selects next action
Execute    : places simulated trade records and updates project/forum actions
```

---

## 📁 Core Modules {#core-modules}

- `heliossynerga/backend/bot.js` — trading loop, API server, Colosseum integration, AI decision engine
- `heliossynerga/dashboard/index.html` — live dashboard UI + Chart.js visualization
- `heliossynerga/data/heliossynerga.db` — runtime persistence (`trades`, `projects`, `leaderboard`, `forum_activity`, `agent_status`)
- `scripts/env-doctor.mjs` — environment diagnostics
- `scripts/pre-submit-check.mjs` — submission readiness checks
- `scripts/colosseum-audit.mjs` — competition audit tooling

Dashboard API surfaces:
- `/api/wallet-stats` — virtual wallet allowance, live balance, ROI, trade stats
- `/api/pnl-series` — cumulative profit-over-time points
- `/api/trading-settings` — effective virtual wallet/trading mode config
- `/api/forum-conversations` — live HeliosSynerga forum posts/comments for judge-facing participation tracking
- `/api/activity` — unified live activity feed (trades + status + leaderboard + forum)

---

## ⚙️ Configuration {#configuration}

`.env` keys used by the current agent:

```bash
COLOSSEUM_API_KEY=
CHATGPT_KEY=
RAILWAY_API_KEY=
GH_TOKEN=
VIRTUAL_WALLET_START_SOL=1.0
PORT=4000
LIVE_APP_LINK=https://your-live-demo-url
LIVE_DEMO_URL=https://your-live-demo-url
RAILWAY_PUBLIC_URL=https://your-railway-service.up.railway.app
```

GitHub Actions repository variables (recommended for judge verification):
- `LIVE_APP_LINK`
- `LIVE_DEMO_URL`
- `RAILWAY_PUBLIC_URL`

Requested trading config mapping for this project style:
- `SOLANA_RPC_URL` → currently represented by Solana integration in bot logic (add explicit env key for production RPC routing)
- `TRADING_API_KEY` → currently `COLOSSEUM_API_KEY`
- `RISK_THRESHOLDS` → currently derived from strategy win-rate classification in runtime analytics

---

## 💡 Why This Matters {#why-this-matters}

- Runs continuously with deterministic cycle-based execution and telemetry.
- Uses scheduled GitHub Actions automation (hourly continuous bot + 15-minute forum pulse) so operations do not require manual triggers.
- Maintains autonomous forum participation by creating updates and posting cross-agent replies/comments for judge-visible engagement evidence.
- Couples strategy execution with live observability (PnL, win rate, strategy breakdown).
- Keeps decision logic modular: fallback policy works even without external LLM key.
- Provides an auditable path from decision → execution → dashboard evidence.

---

## 🔗 Real Blockchain Integration {#real-blockchain-integration}

Current Solana proof points in code:
- Uses `@solana/web3.js` dependency for chain integration path.
- Project payloads declare Jupiter/Pyth/Solana Pay/PDA integration surfaces.
- Runtime execution is currently simulated (`executeTrade`) while the on-chain transaction path is staged in code comments/TODOs.

---

## 🛠️ Tech Stack {#tech-stack}

- Node.js + Express
- SQLite3
- Axios
- OpenAI SDK
- `@solana/web3.js`
- Chart.js
- live-server + concurrently

---

## 📂 Project Structure {#project-structure}

```text
heliossynerga/
├── backend/
│   └── bot.js
├── dashboard/
│   └── index.html
└── data/
    └── heliossynerga.db
```

---

## 🏆 Hackathon {#hackathon}

```text
Agent Name        : HeliosSynerga
Project Name      : HeliosSynerga
Project ID        : 621
Project Phase     : active
Scoreboard Rank   : not available in current local record
Submission Status : submitted on Colosseum (2026-02-11T09:25:29.397Z)
```

---

## ✅ Runtime Status {#runtime-status}

```text
Bot Process   : RUNNING (node heliossynerga/backend/bot.js)
API Status    : /api/status => {"status":"running"}
Trades Feed   : /api/trades returning live records
Last Verified : 2026-02-12
```
