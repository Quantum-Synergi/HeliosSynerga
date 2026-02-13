import axios from 'axios';

const API_BASE = 'https://agents.colosseum.com/api';
const API_KEY = process.env.COLOSSEUM_API_KEY;
const PROBE_FORUM = process.argv.includes('--probe-forum');
const PROBE_PROJECT_VOTE = process.argv.includes('--probe-vote');

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

if (API_KEY) {
  client.defaults.headers.Authorization = `Bearer ${API_KEY}`;
}

const checks = {
  Registration: { color: '🟡', notes: 'Not verified yet' },
  'API Auth': { color: '🟡', notes: 'Not verified yet' },
  'Posting/Voting': { color: '🟡', notes: 'Not verified yet' },
  'Project Build': { color: '🟡', notes: 'Not verified yet' },
  Submission: { color: '🟡', notes: 'Not verified yet' },
  Leaderboard: { color: '🟡', notes: 'Not verified yet' }
};

function setCheck(name, color, notes) {
  checks[name] = { color, notes };
}

function hasRequiredSubmissionFields(project) {
  const required = [
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

  const missing = required.filter((field) => {
    const value = project?.[field];
    if (field === 'tags') return !Array.isArray(value) || value.length < 1 || value.length > 3;
    return value === undefined || value === null || String(value).trim() === '';
  });

  return { ok: missing.length === 0, missing };
}

async function run() {
  console.log('🔎 Colosseum Hackathon Audit (Node/Railway ready)');

  try {
    try {
      await client.get('/health');
      setCheck('Registration', '🟢', 'Platform reachable via /api/health');
    } catch {
      await axios.get('https://agents.colosseum.com/health', { timeout: 15000 });
      setCheck('Registration', '🟢', 'Platform reachable via /health');
    }
  } catch (error) {
    try {
      const leaderboardFallback = await client.get('/leaderboard');
      if (leaderboardFallback.data) {
        setCheck('Registration', '🟡', 'Health endpoint unavailable, but public API is reachable');
      }
    } catch {
      setCheck('Registration', '🔴', `Platform unreachable: ${error.message}`);
    }
  }

  if (!API_KEY) {
    setCheck('API Auth', '🔴', 'Missing COLOSSEUM_API_KEY');
    setCheck('Posting/Voting', '🔴', 'No auth token for protected forum/project endpoints');
    setCheck('Project Build', '🔴', 'Cannot verify /my-project without API key');
    setCheck('Submission', '🔴', 'Cannot verify submit readiness without API key');
    setCheck('Leaderboard', checks.Leaderboard.color, 'Public leaderboard can still be checked');
  } else {
    try {
      const statusRes = await client.get('/agents/status');
      const status = statusRes.data || {};

      const claimState = status.claimUrl ? 'UNCLAIMED (claimUrl present)' : 'CLAIMED or claim hidden';
      setCheck('API Auth', '🟢', `Authenticated as ${status.agent?.name || 'agent'} | ${claimState}`);
    } catch (error) {
      setCheck('API Auth', '🔴', `Auth failed: ${error.response?.status || ''} ${error.response?.data?.error || error.message}`);
    }

    let project = null;
    try {
      const projectRes = await client.get('/my-project');
      project = projectRes.data?.project;

      if (!project) {
        setCheck('Project Build', '🔴', 'No project found at /my-project');
        setCheck('Submission', '🔴', 'Cannot submit without creating project first');
      } else {
        const requiredCheck = hasRequiredSubmissionFields(project);
        const deprecatedFieldUsed = Object.prototype.hasOwnProperty.call(project, 'technicalDemoLink');

        if (!requiredCheck.ok) {
          setCheck('Project Build', '🟡', `Project exists but missing required fields: ${requiredCheck.missing.join(', ')}`);
        } else if (deprecatedFieldUsed) {
          setCheck('Project Build', '🟡', 'Project includes deprecated technicalDemoLink; use liveAppLink + presentationLink');
        } else {
          setCheck('Project Build', '🟢', `Project '${project.name}' has required submission fields`);
        }

        if (project.status === 'submitted') {
          setCheck('Submission', '🟢', 'Project status is submitted');
        } else if (!requiredCheck.ok) {
          setCheck('Submission', '🔴', 'Draft and missing required fields for submit');
        } else {
          setCheck('Submission', '🟡', 'Draft project; ready to submit when you decide');
        }
      }
    } catch (error) {
      setCheck('Project Build', '🔴', `Project check failed: ${error.response?.status || ''} ${error.response?.data?.error || error.message}`);
      setCheck('Submission', '🔴', 'Submission readiness unknown due to project check failure');
    }

    try {
      if (!PROBE_FORUM && !PROBE_PROJECT_VOTE) {
        setCheck('Posting/Voting', '🟡', 'Auth verified; run with --probe-forum and/or --probe-vote for mutation test');
      } else {
        const notes = [];

        if (PROBE_FORUM) {
          const post = await client.post('/forum/posts', {
            title: `Audit probe ${new Date().toISOString()}`.slice(0, 60),
            body: 'Automated audit probe for posting/voting readiness.',
            tags: ['progress-update', 'ai']
          });

          const postId = post.data?.post?.id;
          if (!postId) throw new Error('Forum post probe failed: missing postId');

          await client.post(`/forum/posts/${postId}/comments`, { body: 'Audit comment probe.' });
          await client.post(`/forum/posts/${postId}/vote`, { value: 1 });
          await client.delete(`/forum/posts/${postId}/vote`);
          await client.delete(`/forum/posts/${postId}`);
          notes.push('Forum post/comment/vote/delete probe passed');
        }

        if (PROBE_PROJECT_VOTE) {
          const projectsRes = await client.get('/projects?limit=10&includeDrafts=true');
          const target = (projectsRes.data?.projects || []).find((p) => p?.id && p?.status);

          if (!target?.id) {
            notes.push('No target project found for vote probe');
          } else {
            await client.post(`/projects/${target.id}/vote`, { value: 1 });
            await client.delete(`/projects/${target.id}/vote`);
            notes.push(`Project vote probe passed on id ${target.id}`);
          }
        }

        setCheck('Posting/Voting', '🟢', notes.join(' | '));
      }
    } catch (error) {
      setCheck('Posting/Voting', '🔴', `Posting/voting probe failed: ${error.response?.status || ''} ${error.response?.data?.error || error.message}`);
    }
  }

  try {
    const lb = await client.get('/leaderboard');
    const rows = lb.data?.entries || lb.data?.leaderboard || lb.data?.projects || [];
    if (rows.length > 0) {
      setCheck('Leaderboard', '🟢', `Fetched ${rows.length} leaderboard rows`);
    } else {
      setCheck('Leaderboard', '🟡', 'Leaderboard reachable but empty/unknown payload');
    }
  } catch (error) {
    setCheck('Leaderboard', '🔴', `Leaderboard check failed: ${error.response?.status || ''} ${error.response?.data?.error || error.message}`);
  }

  console.log('\nSTATUS TABLE');
  console.table(
    Object.entries(checks).map(([name, result]) => ({
      Area: name,
      Status: result.color,
      Notes: result.notes
    }))
  );
}

run().catch((error) => {
  console.error('Audit script failure:', error);
  process.exit(1);
});
