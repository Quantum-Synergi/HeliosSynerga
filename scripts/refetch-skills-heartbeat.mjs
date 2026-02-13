import axios from 'axios';
import fs from 'fs-extra';
import 'dotenv/config';

const API_KEY = process.env.COLOSSEUM_API_KEY;
const API_BASE = 'https://agents.colosseum.com/api';
const HACKATHON_UPDATE_NOTE = process.env.HACKATHON_UPDATE_NOTE || 'Submission deadline extension acknowledged. Refreshed heartbeat + skills context.';

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

async function tryGet(endpoint) {
  try {
    const response = await client.get(endpoint);
    return { ok: true, endpoint, data: response.data };
  } catch (error) {
    return {
      ok: false,
      endpoint,
      status: error?.response?.status,
      message: error?.response?.data?.error || error.message
    };
  }
}

function toSkillText(sourceData) {
  if (!sourceData) return '';

  if (typeof sourceData === 'string') {
    return sourceData.trim();
  }

  const direct = sourceData?.content || sourceData?.skillFile || sourceData?.skill || sourceData?.data?.content;
  if (typeof direct === 'string') {
    return direct.trim();
  }

  return JSON.stringify(sourceData, null, 2);
}

async function run() {
  const statusResult = await tryGet('/agents/status');
  if (!statusResult.ok) {
    console.error('❌ Failed heartbeat fetch from /agents/status:', statusResult);
    process.exit(1);
  }

  const projectResult = await tryGet('/my-project');

  const skillEndpoints = [
    '/agents/skills',
    '/agents/skill-file',
    '/agents/skillfile',
    '/agents/skill'
  ];

  let chosenSkill = null;
  for (const endpoint of skillEndpoints) {
    const result = await tryGet(endpoint);
    if (result.ok) {
      const text = toSkillText(result.data);
      if (text) {
        chosenSkill = {
          endpoint,
          text
        };
        break;
      }
    }
  }

  const status = statusResult.data || {};
  const project = projectResult.ok ? (projectResult.data?.project || {}) : {};

  const heartbeatSnapshot = {
    fetchedAt: new Date().toISOString(),
    source: '/agents/status',
    note: HACKATHON_UPDATE_NOTE,
    agent: {
      id: status?.agent?.id || null,
      name: status?.agent?.name || null,
      status: status?.agent?.status || null
    },
    hackathon: status?.hackathon || null,
    engagement: status?.engagement || null,
    projects: status?.projects || null,
    votes: status?.votes || null,
    hasActivePoll: Boolean(status?.hasActivePoll),
    claimUrl: status?.claimUrl || null,
    project: {
      name: project?.name || null,
      status: project?.status || null,
      updatedAt: project?.updatedAt || null,
      submittedAt: project?.submittedAt || null,
      liveAppLink: project?.liveAppLink || null
    }
  };

  await fs.ensureDir('./.colosseum');
  await fs.writeJson('./.colosseum/heartbeat.json', heartbeatSnapshot, { spaces: 2 });

  const generatedSkill = [
    '# HeliosSynerga Runtime Skill Context',
    '',
    `Refetched at: ${heartbeatSnapshot.fetchedAt}`,
    `Heartbeat source: ${heartbeatSnapshot.source}`,
    `Hackathon note: ${HACKATHON_UPDATE_NOTE}`,
    '',
    '## Submission Process Snapshot',
    `- Agent status: ${heartbeatSnapshot.agent.status || 'unknown'}`,
    `- Project status: ${heartbeatSnapshot.project.status || 'unknown'}`,
    `- Claim URL present: ${heartbeatSnapshot.claimUrl ? 'yes' : 'no'}`,
    `- Active poll: ${heartbeatSnapshot.hasActivePoll ? 'yes' : 'no'}`,
    '',
    '## Live Ops Guidance',
    '- Keep project metadata and demo links current.',
    '- Use API-backed telemetry and avoid fabricated metrics.',
    '- Continue safe fallback behavior when external APIs degrade.',
    ''
  ];

  if (chosenSkill) {
    generatedSkill.push('## Colosseum Skill Payload', '', `Source endpoint: ${chosenSkill.endpoint}`, '', chosenSkill.text, '');
  } else {
    generatedSkill.push('## Colosseum Skill Payload', '', 'No dedicated skills endpoint payload returned; continue using local skill rules.', '');
  }

  await fs.writeFile('./.colosseum/AGENT_SKILL_FILE.md', generatedSkill.join('\n'), 'utf8');

  console.log('✅ Refetched heartbeat + skills context');
  console.log(`- Heartbeat: ./.colosseum/heartbeat.json`);
  console.log(`- Skill file: ./.colosseum/AGENT_SKILL_FILE.md`);
  console.log(`- Project status: ${heartbeatSnapshot.project.status || 'unknown'}`);
  console.log(`- Agent status: ${heartbeatSnapshot.agent.status || 'unknown'}`);
}

run().catch((error) => {
  console.error('❌ refetch-skills-heartbeat failed:', error?.response?.data || error.message);
  process.exit(1);
});
