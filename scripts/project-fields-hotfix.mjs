import axios from 'axios';

const API_KEY = process.env.COLOSSEUM_API_KEY;

if (!API_KEY) {
  console.error('❌ Missing COLOSSEUM_API_KEY');
  process.exit(1);
}

const client = axios.create({
  baseURL: 'https://agents.colosseum.com/api',
  timeout: 20000,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

const payload = {
  description:
    process.env.PROJECT_DESCRIPTION ||
    'HeliosSynerga is an autonomous Solana trading agent that runs arbitrage, liquidity, and trend-following strategies with continuous monitoring and execution telemetry.',
  repoLink: 'https://github.com/Quantum-Synergi/HeliosSynerga',
  solanaIntegration:
    process.env.SOLANA_INTEGRATION ||
    'Uses Solana ecosystem integrations for trading execution workflows, strategy orchestration, and transaction-aware monitoring designed for autonomous operation.',
  problemStatement:
    process.env.PROBLEM_STATEMENT ||
    'Independent Solana traders and builders cannot monitor markets 24/7, so they miss short-lived opportunities and react late to volatility. HeliosSynerga automates strategy execution and monitoring so decisions can be acted on continuously.',
  technicalApproach:
    process.env.TECHNICAL_APPROACH ||
    'A Node.js agent loop executes strategy cycles, reads market/context signals, and triggers action pipelines while persisting state in SQLite for deterministic recovery. Colosseum APIs are used for project lifecycle, community activity, and voting engagement.',
  targetAudience:
    process.env.TARGET_AUDIENCE ||
    'Primary users are active Solana DeFi participants and small quant teams that currently execute strategies manually and need an autonomous assistant for continuous operation.',
  businessModel:
    process.env.BUSINESS_MODEL ||
    'Freemium model: free baseline automation with paid advanced strategy packs, priority execution analytics, and hosted reliability tooling for power users.',
  competitiveLandscape:
    process.env.COMPETITIVE_LANDSCAPE ||
    'Many bots focus on one strategy or one venue. HeliosSynerga focuses on multi-strategy orchestration, transparent activity telemetry, and rapid public iteration within the Colosseum ecosystem.',
  futureVision:
    process.env.FUTURE_VISION ||
    'Next milestones include stronger on-chain execution adapters, richer risk controls, and production hardening for long-running autonomous operations beyond hackathon scope.',
  liveAppLink: process.env.LIVE_APP_LINK || 'https://heliossynerga-production.up.railway.app',
  presentationLink:
    process.env.PRESENTATION_LINK ||
    'https://github.com/Quantum-Synergi/HeliosSynerga/blob/main/README.md',
  tags: ['defi', 'ai', 'trading']
};

async function run() {
  const current = await client.get('/my-project').catch(() => ({ data: {} }));
  const name = current.data?.project?.name;
  if (!name) {
    console.error('❌ No existing project found at /my-project. Create project first.');
    process.exit(1);
  }

  const res = await client.put('/my-project', payload);
  const updated = res.data?.project;

  console.log('✅ Project fields hotfix applied');
  console.log(`- Project: ${updated?.name || name}`);
  console.log(`- Status: ${updated?.status || 'unknown'}`);
  console.log(`- Tags: ${(updated?.tags || payload.tags).join(', ')}`);
}

run().catch((error) => {
  console.error('❌ Project fields hotfix failed:', error.response?.data || error.message);
  process.exit(1);
});
