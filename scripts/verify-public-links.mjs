import axios from 'axios';
import 'dotenv/config';

const demoUrl = process.env.LIVE_DEMO_URL || process.env.LIVE_APP_LINK || '';
const railwayUrl = process.env.RAILWAY_PUBLIC_URL || '';

const targets = [
  { label: 'live-demo', url: demoUrl },
  { label: 'railway-public', url: railwayUrl }
].filter((entry) => Boolean(entry.url));

if (!targets.length) {
  console.error('❌ No public URL configured. Set LIVE_DEMO_URL and/or RAILWAY_PUBLIC_URL.');
  process.exit(1);
}

function normalize(base, path = '') {
  const cleaned = String(base).replace(/\/$/, '');
  return `${cleaned}${path}`;
}

async function probe(url) {
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      validateStatus: () => true
    });

    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      bytes: JSON.stringify(response.data || '').length
    };
  } catch (error) {
    return {
      ok: false,
      status: error?.response?.status || 0,
      bytes: 0,
      error: error.message
    };
  }
}

async function checkTarget(target) {
  const checks = [
    { path: '/', required: true },
    { path: '/api/health', required: true },
    { path: '/api/status', required: true },
    { path: '/api/trades', required: true },
    { path: '/api/wallet-stats', required: true },
    { path: '/api/pnl-series', required: true },
    { path: '/api/trading-settings', required: true }
  ];

  console.log(`\n🔎 Checking ${target.label}: ${target.url}`);

  let failed = false;
  for (const check of checks) {
    const fullUrl = normalize(target.url, check.path);
    const result = await probe(fullUrl);
    const summary = `${check.path} => ${result.status}${result.ok ? ' ✅' : ' ❌'}`;
    console.log(`- ${summary}`);

    if (!result.ok && check.required) {
      failed = true;
    }
  }

  return !failed;
}

async function run() {
  const outcomes = [];
  for (const target of targets) {
    outcomes.push(await checkTarget(target));
  }

  const allOk = outcomes.every(Boolean);
  if (!allOk) {
    console.error('\n❌ Public link verification failed. Judges may not be able to verify the app.');
    process.exit(1);
  }

  console.log('\n✅ Public link verification passed.');
}

run().catch((error) => {
  console.error('❌ verify-public-links failed:', error.message);
  process.exit(1);
});
