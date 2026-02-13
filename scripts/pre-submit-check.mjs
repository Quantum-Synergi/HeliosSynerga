import axios from 'axios';
import 'dotenv/config';

const API_KEY = process.env.COLOSSEUM_API_KEY;

console.log(
  `🔐 Env check | COLOSSEUM_API_KEY: ${API_KEY ? 'set' : 'missing'}`
);

if (!API_KEY) {
  console.error('❌ Missing COLOSSEUM_API_KEY');
  process.exit(1);
}

const client = axios.create({
  baseURL: 'https://agents.colosseum.com/api',
  timeout: 15000,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

const requiredFields = [
  'name',
  'description',
  'repoLink',
  'solanaIntegration',
  'problemStatement',
  'technicalApproach',
  'targetAudience',
  'businessModel',
  'competitiveLandscape',
  'futureVision',
  'tags'
];

function getMissingFields(project) {
  return requiredFields.filter((field) => {
    const value = project?.[field];
    if (field === 'tags') return !Array.isArray(value) || value.length < 1 || value.length > 3;
    return value === undefined || value === null || String(value).trim() === '';
  });
}

async function run() {
  const failures = [];

  let status;
  try {
    const statusRes = await client.get('/agents/status');
    status = statusRes.data || {};
  } catch (error) {
    console.error('❌ Failed to fetch /agents/status:', error.response?.data || error.message);
    process.exit(1);
  }

  if (status.claimUrl) {
    failures.push('Agent appears unclaimed (`claimUrl` present). Claim is required for prize eligibility and submission.');
  }

  let project;
  try {
    const projectRes = await client.get('/my-project');
    project = projectRes.data?.project;
  } catch (error) {
    console.error('❌ Failed to fetch /my-project:', error.response?.data || error.message);
    process.exit(1);
  }

  if (!project) {
    failures.push('No project found at /my-project.');
  } else {
    const missing = getMissingFields(project);
    if (missing.length > 0) {
      failures.push(`Missing required submission fields: ${missing.join(', ')}`);
    }
  }

  if (failures.length > 0) {
    console.error('❌ Pre-submit guard failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('✅ Pre-submit guard passed: claim + required project fields are present.');
}

run().catch((error) => {
  console.error('❌ Pre-submit guard crashed:', error.message);
  process.exit(1);
});
