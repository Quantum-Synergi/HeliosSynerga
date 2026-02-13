import axios from 'axios';
import 'dotenv/config';

const API_KEY = process.env.COLOSSEUM_API_KEY;
const API_BASE = 'https://agents.colosseum.com/api';

const LIVE_DEMO = 'https://literate-adventure-97vxgq6rjjvp379v4-4000.app.github.dev/';
const GITHUB_URL = 'https://github.com/Quantum-Synergi/HeliosSynerga';
const DESCRIPTION = 'Autonomous institutional trading agent executing BTC/SOL strategies with enterprise-grade analytics dashboard. Real-time P&L tracking, risk management, and transparent decision logging via Node.js + Solana web3.js. Production-ready architecture built 100% by AI.';
const MINIMAL_SOLANA_TEXT = 'Integration details are intentionally minimal in this submission; implementation is documented in the public GitHub repository.';
const UPDATE_SOURCE = 'workflow-push';

if (!API_KEY) {
  console.error('❌ Missing COLOSSEUM_API_KEY');
  process.exit(1);
}

const client = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

async function run() {
  const currentRes = await client.get('/my-project');
  const currentProject = currentRes.data?.project;

  if (!currentProject?.name) {
    console.error('❌ No project found at /my-project. Create project first.');
    process.exit(1);
  }

  const payload = {
    ...currentProject,
    description: DESCRIPTION,
    liveAppLink: LIVE_DEMO,
    liveDemo: LIVE_DEMO,
    repoLink: GITHUB_URL,
    github: GITHUB_URL,
    solanaIntegration: MINIMAL_SOLANA_TEXT,
    tags: Array.isArray(currentProject.tags) && currentProject.tags.length
      ? currentProject.tags.slice(0, 3)
      : ['defi', 'ai', 'trading']
  };

  delete payload.id;
  delete payload.createdAt;
  delete payload.updatedAt;
  delete payload.score;
  delete payload.rank;
  delete payload.agentUpvotes;
  delete payload.humanUpvotes;
  delete payload.agentName;
  delete payload.status;

  const response = await client.put('/my-project', payload);
  const updated = response.data?.project || {};

  console.log('✅ Colosseum project updated successfully');
  console.log(`- Project: ${updated.name || currentProject.name}`);
  console.log(`- Live demo: ${updated.liveAppLink || LIVE_DEMO}`);
  console.log(`- GitHub: ${updated.repoLink || GITHUB_URL}`);
  console.log(`- Solana integration section: ${(updated.solanaIntegration || '').trim() ? 'present' : 'removed/empty'}`);
  console.log(`- Update source: ${UPDATE_SOURCE}`);
}

run().catch((error) => {
  console.error('❌ update-colosseum failed:', error.response?.data || error.message);
  process.exit(1);
});
