import axios from 'axios';
import 'dotenv/config';

const API_KEY = process.env.COLOSSEUM_API_KEY;
const API_BASE = 'https://agents.colosseum.com/api';

function stripTrailingSlash(value = '') {
  return String(value || '').trim().replace(/\/+$/, '');
}

function resolveLiveDemoUrl() {
  const explicit = stripTrailingSlash(
    process.env.LIVE_DEMO_URL || process.env.LIVE_APP_LINK || process.env.RAILWAY_PUBLIC_URL || ''
  );

  if (explicit) {
    return explicit;
  }

  const codespaceName = String(process.env.CODESPACE_NAME || '').trim();
  const forwardingDomain = String(process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev').trim();
  const forwardedPort = Number(process.env.LIVE_APP_PORT || process.env.PORT || 4000);

  if (codespaceName && forwardingDomain && Number.isFinite(forwardedPort) && forwardedPort > 0) {
    return `https://${codespaceName}-${forwardedPort}.${forwardingDomain}`;
  }

  return `http://localhost:${Number.isFinite(forwardedPort) && forwardedPort > 0 ? forwardedPort : 4000}`;
}

const LIVE_DEMO = resolveLiveDemoUrl();
const GITHUB_URL = 'https://github.com/Quantum-Synergi/HeliosSynerga';
const DESCRIPTION = 'Autonomous AI trading agent executing BTC/SOL-oriented strategy cycles with risk management, live telemetry, and continuous decisioning.';
const MINIMAL_SOLANA_TEXT = 'Integration details are intentionally minimal in this submission; implementation is documented in the public GitHub repository.';
const UPDATE_SOURCE = 'workflow-push';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(error) {
  const status = Number(error?.response?.status || 0);
  const message = String(error?.response?.data?.error || error?.message || '').toLowerCase();

  if (status === 429 || status === 503) return true;
  return message.includes('too many project operations') || message.includes('try again later');
}

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

  let response = null;
  const maxAttempts = 6;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      response = await client.put('/my-project', payload);
      break;
    } catch (error) {
      if (!shouldRetry(error) || attempt === maxAttempts) {
        throw error;
      }

      const waitMs = attempt * 15000;
      console.log(`⏳ Colosseum throttle detected, retrying in ${Math.round(waitMs / 1000)}s (attempt ${attempt}/${maxAttempts})...`);
      await sleep(waitMs);
    }
  }

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
