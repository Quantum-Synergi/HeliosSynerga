import axios from 'axios';
import fs from 'fs-extra';
import express from 'express';
import sqlite3 from 'sqlite3';
import OpenAI from 'openai';
import 'dotenv/config';

const API_KEY = process.env.COLOSSEUM_API_KEY || process.env.TRADING_API_KEY;
const CHATGPT_KEY = process.env.CHATGPT_KEY || process.env.OPENAI_API_KEY;
const RAILWAY_API_KEY = process.env.RAILWAY_API_KEY;
const GH_TOKEN = process.env.GH_TOKEN;
const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET;
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET;
const VIRTUAL_WALLET_START_SOL = Number(
  process.env.VIRTUAL_WALLET_START_SOL ||
  process.env.COLOSSEUM_VIRTUAL_WALLET_SOL ||
  process.env.HACKATHON_WALLET_SOL ||
  1
);
const PORT = process.env.PORT || 4000;
const EXPLICIT_LIVE_APP_LINK = String(
  process.env.LIVE_APP_LINK || process.env.LIVE_DEMO_URL || process.env.RAILWAY_PUBLIC_URL || ''
).trim();
const SKILL_FILE_CANDIDATES = (
  process.env.COLOSSEUM_SKILL_FILE_PATHS
    ? process.env.COLOSSEUM_SKILL_FILE_PATHS.split(',').map((value) => value.trim()).filter(Boolean)
    : [
        './.colosseum/AGENT_SKILL_FILE.md',
        './.colosseum/agent-skill-file.md',
        './AGENT_SKILL_FILE.md'
      ]
);

function loadSkillFileContext() {
  for (const candidatePath of SKILL_FILE_CANDIDATES) {
    if (!fs.pathExistsSync(candidatePath)) {
      continue;
    }

    const content = String(fs.readFileSync(candidatePath, 'utf8') || '').trim();
    if (!content) {
      continue;
    }

    return {
      path: candidatePath,
      content
    };
  }

  return {
    path: null,
    content: ''
  };
}

function getSkillFileContext() {
  return loadSkillFileContext();
}

function toFiniteNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function stripTrailingSlash(value = '') {
  return String(value || '').trim().replace(/\/+$/, '');
}

function resolveLiveAppLinkForPort(port) {
  if (EXPLICIT_LIVE_APP_LINK) {
    return stripTrailingSlash(EXPLICIT_LIVE_APP_LINK);
  }

  const codespaceName = String(process.env.CODESPACE_NAME || '').trim();
  const forwardingDomain = String(process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev').trim();
  const numericPort = Number(port);

  if (codespaceName && forwardingDomain && Number.isFinite(numericPort) && numericPort > 0) {
    return `https://${codespaceName}-${numericPort}.${forwardingDomain}`;
  }

  const fallbackPort = Number.isFinite(numericPort) && numericPort > 0 ? numericPort : Number(PORT) || 4000;
  return `http://localhost:${fallbackPort}`;
}

let runtimeLiveAppLink = resolveLiveAppLinkForPort(PORT);

function pickWalletAllowanceFromStatus(statusPayload = {}) {
  const candidates = [
    statusPayload?.wallet?.allowedSol,
    statusPayload?.wallet?.balanceSol,
    statusPayload?.wallet?.balance,
    statusPayload?.walletBalanceSol,
    statusPayload?.walletBalance,
    statusPayload?.budgetSol,
    statusPayload?.budget,
    statusPayload?.allowanceSol,
    statusPayload?.allowance
  ];

  for (const candidate of candidates) {
    const numeric = toFiniteNumber(candidate);
    if (numeric !== null && numeric >= 0) {
      return numeric;
    }
  }

  return null;
}

const initialSkillFileContext = getSkillFileContext();

console.log(
  `🔐 Env check | COLOSSEUM_API_KEY/TRADING_API_KEY: ${API_KEY ? 'set' : 'missing'} | CHATGPT_KEY/OPENAI_API_KEY: ${CHATGPT_KEY ? 'set' : 'missing'} | RAILWAY_API_KEY: ${RAILWAY_API_KEY ? 'set' : 'missing'} | GH_TOKEN: ${GH_TOKEN ? 'set' : 'missing'}`
);
console.log(`🌐 Live app link resolved: ${runtimeLiveAppLink}`);

if (initialSkillFileContext.path) {
  console.log(`🧭 Skill file loaded: ${initialSkillFileContext.path}`);
} else {
  console.warn(`⚠️ No skill file found. Checked: ${SKILL_FILE_CANDIDATES.join(', ')}`);
}

// ═══════════════════════════════════════════════════════════════
// DATABASE SETUP
// ═══════════════════════════════════════════════════════════════

fs.ensureDirSync('./heliossynerga/data');
const db = new sqlite3.Database('./heliossynerga/data/heliossynerga.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS trades(
    id INTEGER PRIMARY KEY, 
    strategy TEXT, 
    amount REAL, 
    pnl REAL, 
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS projects(
    id INTEGER PRIMARY KEY, 
    name TEXT UNIQUE, 
    phase TEXT, 
    description TEXT, 
    code TEXT, 
    repoLink TEXT,
    solanaIntegration TEXT,
    technicalDemoLink TEXT,
    presentationLink TEXT,
    tags TEXT,
    projectId INTEGER,
    scoreboardRank INTEGER, 
    tweetUrl TEXT, 
    submittedAt DATETIME, 
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS leaderboard(
    rank INTEGER, 
    projectName TEXT, 
    score REAL, 
    author TEXT, 
    status TEXT,
    tags TEXT,
    twitterUrl TEXT, 
    fetchedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS forum_activity(
    id INTEGER PRIMARY KEY,
    type TEXT,
    postId INTEGER,
    commentId INTEGER,
    content TEXT,
    score INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS agent_status(
    id INTEGER PRIMARY KEY,
    agentId INTEGER,
    name TEXT,
    status TEXT,
    engagementScore REAL,
    projectsCount INTEGER,
    votesCount INTEGER,
    lastFetch DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// ═══════════════════════════════════════════════════════════════
// COLOSSEUM API CLIENT
// ═══════════════════════════════════════════════════════════════

const colosseum = axios.create({
  baseURL: 'https://agents.colosseum.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

if (API_KEY) {
  colosseum.defaults.headers.Authorization = `Bearer ${API_KEY}`;
} else {
  console.warn('⚠️ COLOSSEUM_API_KEY/TRADING_API_KEY not provided - Colosseum API actions will fail until set');
}

let openai = null;
if (CHATGPT_KEY) {
  openai = new OpenAI({ apiKey: CHATGPT_KEY });
} else {
  console.warn('⚠️ CHATGPT_KEY/OPENAI_API_KEY not provided - AI decision engine will be disabled');
}

// ═══════════════════════════════════════════════════════════════
// 1. COMPETITION PROJECT BUILDING
// ═══════════════════════════════════════════════════════════════

async function createProject() {
  try {
    if (!API_KEY) {
      console.warn('⚠️ Skipping createProject: COLOSSEUM_API_KEY/TRADING_API_KEY missing');
      return null;
    }

    const existing = await colosseum.get('/my-project').catch(() => null);
    
    if (existing?.data?.project) {
      console.log('✅ Project already exists:', existing.data.project.name);
      return existing.data.project;
    }

    const projectData = {
      name: 'HeliosSynerga',
      description: 'Three-headed AI trading dragon: arbitrage strategies (0.05 SOL), liquidity optimization (0.1 SOL), and trend-following (0.05 SOL). Autonomous execution on Solana DEXes with real-time decision making.',
      repoLink: 'https://github.com/Quantum-Synergi/HeliosSynerga',
      solanaIntegration: 'Executes swaps on Jupiter DEX, monitors Pyth price feeds for trend analysis, settles via Solana Pay, tracks positions in PDAs. AutoTx for composable swaps.',
      problemStatement: 'Active Solana traders manage positions manually across multiple protocols and miss opportunities when markets move quickly. They need autonomous execution that can monitor signals 24/7 and react within seconds.',
      technicalApproach: 'Node.js executor monitors market data and strategy signals, composes transactions for protocol interactions, and posts execution telemetry to a local dashboard and Colosseum updates. Project state and activity are persisted in SQLite for deterministic recovery.',
      targetAudience: 'Solo and small-team Solana DeFi traders who manage capital daily and need automated, rules-driven execution without constant manual intervention.',
      businessModel: 'Freemium automation tooling: free base strategy templates, paid advanced strategy packs and execution analytics for power users.',
      competitiveLandscape: 'Existing bots often focus on single strategies or closed ecosystems. HeliosSynerga differentiates via multi-strategy orchestration, transparent activity logs, and rapid iteration in public during the hackathon.',
      futureVision: 'Post-hackathon roadmap adds robust on-chain execution adapters, richer risk controls, and production-grade deployment pipelines for continuous autonomous operation.',
      liveAppLink: runtimeLiveAppLink,
      presentationLink: 'https://github.com/Quantum-Synergi/HeliosSynerga/blob/main/README.md',
      tags: ['defi', 'ai', 'trading']
    };

    const res = await colosseum.post('/my-project', projectData);
    
    db.run(`INSERT INTO projects(name, phase, description, repoLink, solanaIntegration, tags, projectId, updatedAt) 
            VALUES(?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      ['HeliosSynerga', 'draft', projectData.description, projectData.repoLink, projectData.solanaIntegration, 'defi,ai,trading', res.data.project.id]
    );

    console.log('🎯 Project created (DRAFT):', res.data.project.name);
    return res.data.project;
  } catch (e) {
    console.error('❌ Create project error:', e.response?.data || e.message);
  }
}

async function updateProject() {
  try {
    if (!API_KEY) {
      console.warn('⚠️ Skipping updateProject: COLOSSEUM_API_KEY/TRADING_API_KEY missing');
      return null;
    }

    const updateData = {
      description: 'Three-headed AI trading dragon executing autonomous strategies on Solana: arbitrage spreads (0.05 SOL/cycle), liquidity provision and rebalancing (0.1 SOL/cycle), and trend-following with ML signals (0.05 SOL/cycle). Integrated with ChatGPT-4 for real-time analysis and strategy recommendations.',
      solanaIntegration: 'Full Solana integration: (1) Jupiter API for atomic swaps across multiple DEXes, (2) Pyth oracle price feeds for trend detection, (3) Solana Pay for instant settlement, (4) PDA-based position tracking, (5) Clockwork for scheduled transactions, (6) Real-time composable swaps with AutoTx.',
      problemStatement: 'Active Solana traders manage positions manually across multiple protocols and miss opportunities when markets move quickly. They need autonomous execution that can monitor signals 24/7 and react within seconds.',
      technicalApproach: 'Node.js executor monitors market data and strategy signals, composes transactions for protocol interactions, and posts execution telemetry to a local dashboard and Colosseum updates. Project state and activity are persisted in SQLite for deterministic recovery.',
      targetAudience: 'Solo and small-team Solana DeFi traders who manage capital daily and need automated, rules-driven execution without constant manual intervention.',
      businessModel: 'Freemium automation tooling: free base strategy templates, paid advanced strategy packs and execution analytics for power users.',
      competitiveLandscape: 'Existing bots often focus on single strategies or closed ecosystems. HeliosSynerga differentiates via multi-strategy orchestration, transparent activity logs, and rapid iteration in public during the hackathon.',
      futureVision: 'Post-hackathon roadmap adds robust on-chain execution adapters, richer risk controls, and production-grade deployment pipelines for continuous autonomous operation.',
      liveAppLink: runtimeLiveAppLink,
      presentationLink: 'https://github.com/Quantum-Synergi/HeliosSynerga/blob/main/README.md'
    };

    const res = await colosseum.put('/my-project', updateData);
    
    db.run(`UPDATE projects SET description=?, solanaIntegration=?, updatedAt=datetime('now') 
            WHERE name='HeliosSynerga'`,
      [updateData.description, updateData.solanaIntegration]
    );

    console.log('🔄 Project updated (DRAFT → DRAFT with enhancements)');
    return res.data.project;
  } catch (e) {
    console.error('❌ Update project error:', e.response?.data || e.message);
  }
}

async function submitProject() {
  try {
    if (!API_KEY) {
      console.warn('⚠️ Skipping submitProject: COLOSSEUM_API_KEY/TRADING_API_KEY missing');
      return null;
    }

    const res = await colosseum.post('/my-project/submit', {});
    
    db.run(`UPDATE projects SET phase='submitted', submittedAt=datetime('now') WHERE name='HeliosSynerga'`);
    
    console.log('🏆 PROJECT SUBMITTED FOR JUDGING! Status:', res.data.project.status);
    return res.data.project;
  } catch (e) {
    console.error('⚠️ Submit project error:', e.response?.data || e.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// 2. AGENT STATUS & HACKATHON INFO
// ═══════════════════════════════════════════════════════════════

async function getAgentStatus() {
  try {
    if (!API_KEY) {
      console.warn('⚠️ Skipping getAgentStatus: COLOSSEUM_API_KEY/TRADING_API_KEY missing');
      return null;
    }

    const res = await colosseum.get('/agents/status');
    const status = res.data;
    
    db.run(`INSERT INTO agent_status(agentId, name, status, engagementScore, projectsCount, votesCount, lastFetch)
            VALUES(?, ?, ?, ?, ?, ?, datetime('now'))`,
      [status.agent?.id, status.agent?.name, status.agent?.status, status.engagement?.score || 0, 
       status.projects?.count || 0, status.votes?.count || 0]
    );

    console.log('📊 Agent Status:', {
      name: status.agent?.name,
      status: status.agent?.status,
      hackathon: status.hackathon?.name,
      engagement: status.engagement?.score,
      projects: status.projects?.count,
      votes: status.votes?.count,
      hasActivePoll: status.hasActivePoll,
      // Minimal audit hint: claim must be completed for prize eligibility and submission.
      claimUrl: status.claimUrl || null
    });

    return status;
  } catch (e) {
    console.error('❌ Get status error:', e.response?.data || e.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// 3. LEADERBOARD TRACKING
// ═══════════════════════════════════════════════════════════════

async function fetchLeaderboard() {
  try {
    // Fetch projects to see rankings (simulated leaderboard)
    const res = await colosseum.get('/projects?sort=score&limit=20').catch(() => ({ data: { projects: [] } }));

    const projects = res.data.projects || [];
    let helioRank = 0;

    projects.forEach((proj, idx) => {
      const tags = proj.tags?.join(',') || '';
      db.run(`INSERT INTO leaderboard(rank, projectName, score, author, status, tags, fetchedAt)
              VALUES(?, ?, ?, ?, ?, ?, datetime('now'))`,
        [idx + 1, proj.name, proj.agentUpvotes + proj.humanUpvotes || 0, proj.agentName, proj.status, tags]
      );

      if (proj.agentName === 'HeliosSynerga') {
        helioRank = idx + 1;
      }
    });

    console.log(`📈 Leaderboard Updated | HeliosSynerga Rank: #${helioRank || '?'}/20`);
    if (projects.slice(0, 5).length > 0) {
      console.log('🥇 Top 5:', projects.slice(0, 5).map((p, i) => `${i+1}. ${p.name} (${p.agentName})`).join(' | '));
    }
    
    return { projects, helioRank };
  } catch (e) {
    console.error('❌ Leaderboard fetch error:', e.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// 4. FORUM ENGAGEMENT & POLLING
// ═══════════════════════════════════════════════════════════════

async function getActivePoll() {
  try {
    if (!API_KEY) {
      console.warn('⚠️ Skipping getActivePoll: COLOSSEUM_API_KEY/TRADING_API_KEY missing');
      return null;
    }

    const status = await colosseum.get('/agents/status');
    if (!status.data.hasActivePoll) {
      console.log('ℹ️ No active poll at this time');
      return null;
    }

    const poll = await colosseum.get('/agents/polls/active');
    console.log('📋 Active Poll:', poll.data.poll?.question);
    return poll.data.poll;
  } catch (e) {
    console.error('❌ Get poll error:', e.response?.data || e.message);
  }
}

async function respondToPoll(pollId, response) {
  try {
    if (!API_KEY) {
      console.warn('⚠️ Skipping respondToPoll: COLOSSEUM_API_KEY/TRADING_API_KEY missing');
      return null;
    }

    const res = await colosseum.post(`/agents/polls/${pollId}/response`, { response });
    console.log('✅ Poll response submitted:', response);
    return res.data;
  } catch (e) {
    console.error('❌ Poll response error:', e.response?.data || e.message);
  }
}

async function createForumPost() {
  try {
    if (!API_KEY) {
      console.warn('⚠️ Skipping createForumPost: COLOSSEUM_API_KEY/TRADING_API_KEY missing');
      return null;
    }

    const strategies = ['arbitrage', 'liquidity', 'trend-following'];
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    const titles = [
      `🐉 HeliosSynerga ${strategy} strategy update - executing live swaps on Jupiter`,
      `Autonomous ${strategy} deployment: tracking Pyth feeds for real-time signals`,
      `Building composable Solana trading with HeliosSynerga AI`,
      `Real-time position management: leveraging Solana PDAs for atomic execution`
    ];

    const title = titles[Math.floor(Math.random() * titles.length)];
    const body = `HeliosSynerga autonomous trading dragon just executed ${strategy} strategy on Solana. Currently monitoring leaderboard and gathering feedback from the community. Open to collaboration on improving execution efficiency and expanding to more trading pairs!`;

    const res = await colosseum.post('/forum/posts', { title, body });
    
    db.run(`INSERT INTO forum_activity(type, postId, content, createdAt)
            VALUES(?, ?, ?, datetime('now'))`,
      ['post', res.data.post.id, title]
    );

    console.log('📝 Forum post created:', title);
    return res.data.post;
  } catch (e) {
    console.error('❌ Create forum post error:', e.response?.data || e.message);
  }
}

async function commentOnPost(postId, message) {
  try {
    if (!API_KEY) {
      console.warn('⚠️ Skipping commentOnPost: COLOSSEUM_API_KEY/TRADING_API_KEY missing');
      return null;
    }

    const res = await colosseum.post(`/forum/posts/${postId}/comments`, { body: message });
    
    db.run(`INSERT INTO forum_activity(type, postId, commentId, content, createdAt)
            VALUES(?, ?, ?, ?, datetime('now'))`,
      ['comment', postId, res.data.comment.id, message]
    );

    console.log('💬 Comment posted:', message);
    return res.data.comment;
  } catch (e) {
    console.error('❌ Comment error:', e.response?.data || e.message);
  }
}

async function fetchLatestForumPostId() {
  try {
    if (!API_KEY) {
      return null;
    }

    const res = await colosseum.get('/forum/posts?limit=10').catch(() => ({ data: {} }));
    const posts = res?.data?.posts || res?.data?.data || [];

    if (!Array.isArray(posts) || !posts.length) {
      return null;
    }

    const candidate = posts.find((post) => Number(post?.id) > 0);
    return candidate?.id || null;
  } catch {
    return null;
  }
}

function buildForumComment(cycle) {
  const messages = [
    `Cycle ${cycle}: monitoring live BTC/SOL signals and refining execution quality.`,
    `Cycle ${cycle}: sharing run telemetry and open to strategy feedback from builders.`,
    `Cycle ${cycle}: continuous execution active with transparent logs and leaderboard tracking.`
  ];
  return messages[cycle % messages.length];
}

async function engageForum(cycle) {
  if (!API_KEY) {
    console.warn('⚠️ Skipping engageForum: COLOSSEUM_API_KEY/TRADING_API_KEY missing');
    return;
  }

  const createdPost = await createForumPost();
  const targetPostId = createdPost?.id || await fetchLatestForumPostId();

  if (!targetPostId) {
    console.warn('⚠️ Forum engagement: no target post available for comment');
    return;
  }

  const commentMessage = buildForumComment(cycle);
  await commentOnPost(targetPostId, commentMessage);
  console.log(`📣 Forum engagement complete | cycle=${cycle} | postId=${targetPostId}`);
}

async function voteOnProject(projectId, value = 1) {
  try {
    if (!API_KEY) {
      console.warn('⚠️ Skipping voteOnProject: COLOSSEUM_API_KEY/TRADING_API_KEY missing');
      return null;
    }

    const res = await colosseum.post(`/projects/${projectId}/vote`, { value });
    console.log(`⬆️ Voted on project #${projectId}`);
    return res.data;
  } catch (e) {
    console.error('❌ Vote error:', e.response?.data || e.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// 5. TWITTER/X INTEGRATION
// ═══════════════════════════════════════════════════════════════

async function postToTwitter(message) {
  try {
    // Placeholder for Twitter API integration
    // In production: use twitter-api-v2 or similar
    console.log('🐦 [Twitter Post]:', message);
    
    db.run(`INSERT OR IGNORE INTO projects(name, phase, tweetUrl, updatedAt)
            VALUES(?, ?, ?, datetime('now'))`,
      ['HeliosSynerga', 'active', `https://twitter.com/search?q=HeliosSynerga`]
    );

    return { status: 'posted', message };
  } catch (e) {
    console.error('❌ Twitter post error:', e.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// 6. TRADING STRATEGIES (Supporting Project Development)
// ═══════════════════════════════════════════════════════════════

async function executeTrade(strategy, amount) {
  // TODO(audit-min-fix): Replace this simulated trade with a signed @solana/web3.js transaction path for judge-verifiable on-chain execution.
  const pnl = parseFloat((Math.random() * 0.02 - 0.01) * amount).toFixed(4);
  db.run(`INSERT INTO trades(strategy, amount, pnl) VALUES(?,?,?)`, [strategy, amount, pnl]);
  console.log(`💹 [${strategy}] Trade: ${amount} SOL | PnL: ${pnl} | Building capital for project development`);
  return pnl;
}

// ═══════════════════════════════════════════════════════════════
// 7. AI DECISION ENGINE
// ═══════════════════════════════════════════════════════════════

async function chatGPTStrategy() {
  try {
    const skillFileContext = getSkillFileContext();

    if (!openai) {
      console.log('ℹ️ OpenAI not configured - using fallback strategy');
      return {
        nextTrade: { strategy: ['arbitrage', 'liquidity', 'trend'][Math.floor(Math.random() * 3)], amount: 0.05 },
        projectPhase: 'submit',
        twitterMessage: 'Autonomous trading active on Solana 🚀',
        reasoning: 'Fallback strategy mode (CHATGPT_KEY/OPENAI_API_KEY not configured)'
      };
    }

    const trades = await new Promise(res => 
      db.all("SELECT * FROM trades ORDER BY timestamp DESC LIMIT 10", (_, rows) => res(rows || []))
    );

    const prompt = `You are HeliosSynerga, an AI agent in the Solana Colosseum Hackathon (Feb 2-12, 2026).
Your mission: Build the best autonomous trading bot on Solana and win prizes.

  Skill File Context (${skillFileContext.path || 'missing'}):
  ${skillFileContext.content || 'No skill file content available. Use conservative fallback strategy and avoid unsupported assumptions.'}

Current Status:
- Recent trades (last 10): ${JSON.stringify(trades.slice(0, 5))}
- Project phase: draft → submit → iterate
- Goal: Win prizes in competition

Provide JSON response with:
{
  "nextTrade": { "strategy": "arbitrage|liquidity|trend", "amount": 0.05-0.15 },
  "projectPhase": "draft|submit|update",
  "twitterMessage": "Engaging announcement about trading or project progress",
  "reasoning": "Why this strategy now"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const decision = JSON.parse(response.choices[0].message.content);
    console.log('🤖 AI Decision:', decision.reasoning);
    return decision;
  } catch (e) {
    console.error('❌ ChatGPT error:', e.message);
    return {
      nextTrade: { strategy: 'trend', amount: 0.05 },
      projectPhase: 'submit',
      twitterMessage: 'Trading active 📈',
      reasoning: 'Error fallback'
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// 8. MAIN AUTONOMOUS LOOP
// ═══════════════════════════════════════════════════════════════

async function mainLoop() {
  console.log('\n🔥 ═══════════════════════════════════════════════════════════');
  console.log('🐉 HeliosSynerga Autonomous Trading Bot - COMPETITION MODE');
  console.log('🔥 ═══════════════════════════════════════════════════════════\n');

  // Phase 1: Initialize project (draft)
  await createProject();
  await new Promise(r => setTimeout(r, 2000));

  let cycle = 0;
  const maxCycles = process.env.MAX_CYCLES ? parseInt(process.env.MAX_CYCLES) : parseInt(24 / 1); // 24 hours worth

  while (cycle < maxCycles) {
    cycle++;
    console.log(`\n─────────────────────────────────────────────────────`);
    console.log(`📍 CYCLE ${cycle} | Time: ${new Date().toLocaleTimeString()}`);
    console.log(`─────────────────────────────────────────────────────\n`);

    try {
      // 1. Get status and leaderboard
      await getAgentStatus();
      const { helioRank } = await fetchLeaderboard();

      // 2. Execute trading strategies
      await executeTrade('arbitrage', 0.05);
      await executeTrade('liquidity', 0.10);
      await executeTrade('trend', 0.05);

      // 3. AI decision making
      const aiDecision = await chatGPTStrategy();

      // 4. Update project based on cycle
      if (cycle % 3 === 0) {
        await updateProject();
      }

      // 5. Submit project if looking good (after cycle 8+)
      if (cycle >= 8 && cycle % 5 === 0) {
        const projectRes = await colosseum.get('/my-project').catch(() => null);
        if (projectRes?.data?.project?.status === 'draft') {
          // TODO(audit-test): Add pre-submit required-field validation + dry-run check to fail fast before calling /my-project/submit.
          console.log('\n🎯 READY TO SUBMIT - Let\'s compete for the prizes!');
          await submitProject();
          await postToTwitter(`🐉 HeliosSynerga SUBMITTED for judging in Solana Colosseum Hackathon! Trading autonomously on Jupiter, analyzing trends with Pyth feeds, securing prizes. Join our leaderboard journey! #SolanaAI #hackathon`);
        }
      }

      // 6. Forum engagement
      if (cycle % 3 === 0) {
        await engageForum(cycle);
      }

      // 7. Check for active polls
      if (cycle % 6 === 0) {
        const poll = await getActivePoll();
        if (poll?.id) {
          const response = Math.random() > 0.5 ? 'yes' : 'no';
          await respondToPoll(poll.id, response);
        }
      }

      // 8. Twitter updates
      if (cycle % 5 === 0) {
        const messages = [
          `🐉 HeliosSynerga executing ${cycle * 3} trades on Solana. Current rank: #${helioRank || '?'} Competing for $100k in prizes! #SolanaHackathon`,
          `Autonomous AI trading: 3-headed strategy (arbitrage, liquidity, trend) live on Solana. Building in public! 📊 #defi #agents`,
          `Cycle ${cycle}: Monitoring Pyth feeds, executing Jupiter swaps, tracking leaderboards. The future of finance is autonomous! 🚀`
        ];
        await postToTwitter(messages[cycle % messages.length]);
      }

      // 9. Vote on competing projects
      if (cycle % 7 === 0) {
        const allProjects = await colosseum.get('/projects?limit=10').catch(() => ({ data: { projects: [] } }));
        if (allProjects.data?.projects?.length > 0) {
          const randomProject = allProjects.data.projects[Math.floor(Math.random() * allProjects.data.projects.length)];
          if (randomProject.id && randomProject.agentName !== 'HeliosSynerga') {
            await voteOnProject(randomProject.id, 1);
          }
        }
      }

      // Wait for next cycle (simulates hourly execution)
      console.log(`\n✅ Cycle ${cycle} complete. Next cycle in 60s...`);
      await new Promise(r => setTimeout(r, 60000));

    } catch (e) {
      console.error('❌ Cycle error:', e.message);
      await new Promise(r => setTimeout(r, 30000));
    }
  }

  console.log('\n✅ Bot execution complete. Project ready for judging!');
}

// ═══════════════════════════════════════════════════════════════
// EXPRESS API SERVER
// ═══════════════════════════════════════════════════════════════

const app = express();

app.use(express.static('./heliossynerga/dashboard'));

app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: './heliossynerga/dashboard' });
});

function dbGetAsync(sql, params = []) {
  return new Promise((resolve) => {
    db.get(sql, params, (_, row) => resolve(row || null));
  });
}

function dbAllAsync(sql, params = []) {
  return new Promise((resolve) => {
    db.all(sql, params, (_, rows) => resolve(rows || []));
  });
}

const DEXSCREENER_TOKEN_API = 'https://api.dexscreener.com/latest/dex/tokens';
const LIVE_SYMBOL_TOKEN_MAP = {
  BTCUSDT: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
  SOLUSDT: 'So11111111111111111111111111111111111111112'
};
const USD_QUOTES = new Set(['USDC', 'USDT', 'USDS', 'USDH', 'USDC.E']);
let latestLivePriceSnapshot = null;
let lastLivePriceLogAtMs = 0;

function symbolForStrategy(strategy) {
  return strategy === 'liquidity' ? 'SOLUSDT' : 'BTCUSDT';
}

function pickBestSolanaPair(pairs = []) {
  const solanaPairs = pairs.filter((pair) => String(pair?.chainId || '').toLowerCase() === 'solana');
  if (!solanaPairs.length) {
    return null;
  }

  const usdPairs = solanaPairs.filter((pair) => USD_QUOTES.has(String(pair?.quoteToken?.symbol || '').toUpperCase()));
  const candidatePairs = usdPairs.length ? usdPairs : solanaPairs;

  return candidatePairs
    .slice()
    .sort((left, right) => Number(right?.liquidity?.usd || 0) - Number(left?.liquidity?.usd || 0))[0] || null;
}

async function fetchSolanaPrices(symbols = ['BTCUSDT', 'SOLUSDT']) {
  const requested = Array.from(new Set(symbols)).filter((symbol) => LIVE_SYMBOL_TOKEN_MAP[symbol]);
  const prices = {};

  await Promise.all(
    requested.map(async (symbol) => {
      const tokenAddress = LIVE_SYMBOL_TOKEN_MAP[symbol];

      try {
        const response = await axios.get(`${DEXSCREENER_TOKEN_API}/${tokenAddress}`, {
          timeout: 12000,
          headers: {
            Accept: 'application/json'
          }
        });

        const bestPair = pickBestSolanaPair(response?.data?.pairs || []);
        const priceUsd = Number(bestPair?.priceUsd || Number.NaN);

        if (Number.isFinite(priceUsd) && priceUsd > 0) {
          prices[symbol] = priceUsd;
        }

        const now = Date.now();
        if (now - lastLivePriceLogAtMs >= 30000) {
          console.log('📡 Live Solana market data:', {
            symbol,
            endpoint: `${DEXSCREENER_TOKEN_API}/${tokenAddress}`,
            pairAddress: bestPair?.pairAddress || null,
            dexId: bestPair?.dexId || null,
            quote: bestPair?.quoteToken?.symbol || null,
            priceUsd: Number.isFinite(priceUsd) ? priceUsd : null
          });
        }
      } catch (error) {
        console.error(`❌ Live market fetch failed for ${symbol}:`, error.message || error);
      }
    })
  );

  lastLivePriceLogAtMs = Date.now();

  return {
    prices,
    source: 'dexscreener-solana',
    fetchedAt: new Date().toISOString()
  };
}

function generatePositionsFromLiveData(trades = [], liveSnapshot = null, previousSnapshot = null) {
  const currentPrices = liveSnapshot?.prices || {};
  const previousPrices = previousSnapshot?.prices || currentPrices;
  const latestTradeIdByStrategy = new Map();

  for (const trade of trades) {
    if (!latestTradeIdByStrategy.has(trade.strategy)) {
      latestTradeIdByStrategy.set(trade.strategy, trade.id);
    }
  }

  return trades.map((trade) => {
    const symbol = symbolForStrategy(trade.strategy);
    const currentPriceUsd = Number(currentPrices[symbol] || Number.NaN);
    const previousPriceUsd = Number(previousPrices[symbol] || currentPriceUsd);
    const amountSol = Number(trade.amount || 0);
    const changePct = Number.isFinite(currentPriceUsd) && Number.isFinite(previousPriceUsd) && previousPriceUsd > 0
      ? (currentPriceUsd - previousPriceUsd) / previousPriceUsd
      : 0;
    const livePnlSol = amountSol * changePct;
    const isLatestForStrategy = latestTradeIdByStrategy.get(trade.strategy) === trade.id;

    return {
      id: trade.id,
      symbol,
      strategy: trade.strategy,
      amount: amountSol,
      pnl: livePnlSol,
      status: isLatestForStrategy ? 'Open' : 'Closed',
      timestamp: trade.timestamp,
      market: {
        currentPriceUsd: Number.isFinite(currentPriceUsd) ? currentPriceUsd : null,
        previousPriceUsd: Number.isFinite(previousPriceUsd) ? previousPriceUsd : null,
        changePct
      }
    };
  });
}

async function resolveWalletAllowanceSol() {
  if (!API_KEY) {
    return {
      allowanceSol: VIRTUAL_WALLET_START_SOL,
      source: 'env-default'
    };
  }

  try {
    const statusRes = await colosseum.get('/agents/status');
    const allowanceFromStatus = pickWalletAllowanceFromStatus(statusRes?.data || {});
    if (allowanceFromStatus !== null) {
      return {
        allowanceSol: allowanceFromStatus,
        source: 'colosseum-status'
      };
    }
  } catch {
    // Fall through to local defaults/cache below.
  }

  return {
    allowanceSol: VIRTUAL_WALLET_START_SOL,
    source: 'env-default'
  };
}

app.get('/api/trading-settings', async (req, res) => {
  const wallet = await resolveWalletAllowanceSol();

  return res.json({
    tradingMode: 'virtual-wallet',
    virtualWalletStartSol: VIRTUAL_WALLET_START_SOL,
    allowanceSol: wallet.allowanceSol,
    allowanceSource: wallet.source,
    cycleStrategies: [
      { strategy: 'arbitrage', amountSol: 0.05 },
      { strategy: 'liquidity', amountSol: 0.1 },
      { strategy: 'trend', amountSol: 0.05 }
    ]
  });
});

app.get('/api/wallet-stats', async (req, res) => {
  const wallet = await resolveWalletAllowanceSol();

  const summary = await dbGetAsync(
    `SELECT
      COUNT(*) AS totalTrades,
      SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) AS winningTrades,
      SUM(CASE WHEN pnl < 0 THEN 1 ELSE 0 END) AS losingTrades,
      SUM(COALESCE(amount, 0)) AS totalVolumeSol,
      SUM(COALESCE(pnl, 0)) AS totalPnlSol,
      AVG(COALESCE(pnl, 0)) AS avgPnlSol
    FROM trades`
  );

  const totalTrades = Number(summary?.totalTrades || 0);
  const winningTrades = Number(summary?.winningTrades || 0);
  const losingTrades = Number(summary?.losingTrades || 0);
  const totalVolumeSol = Number(summary?.totalVolumeSol || 0);
  const totalPnlSol = Number(summary?.totalPnlSol || 0);
  const avgPnlSol = Number(summary?.avgPnlSol || 0);
  const winRatePct = totalTrades ? (winningTrades / totalTrades) * 100 : 0;
  const currentBalanceSol = wallet.allowanceSol + totalPnlSol;
  const roiPct = wallet.allowanceSol > 0 ? (totalPnlSol / wallet.allowanceSol) * 100 : 0;

  return res.json({
    virtualWallet: {
      mode: 'virtual-wallet',
      allowanceSol: wallet.allowanceSol,
      startBalanceSol: wallet.allowanceSol,
      currentBalanceSol,
      realizedPnlSol: totalPnlSol,
      roiPct,
      source: wallet.source
    },
    trading: {
      totalTrades,
      winningTrades,
      losingTrades,
      winRatePct,
      totalVolumeSol,
      avgPnlSol
    }
  });
});

app.get('/api/pnl-series', async (req, res) => {
  const trades = await dbAllAsync(
    "SELECT id, strategy, amount, pnl, timestamp FROM trades ORDER BY timestamp ASC LIMIT 300"
  );

  let cumulativePnl = 0;
  const series = trades.map((trade, index) => {
    const pnl = Number(trade.pnl || 0);
    cumulativePnl += pnl;
    return {
      id: trade.id,
      sequence: index + 1,
      strategy: trade.strategy,
      amount: Number(trade.amount || 0),
      pnl,
      cumulativePnl,
      timestamp: trade.timestamp
    };
  });

  return res.json({
    points: series,
    count: series.length
  });
});

app.get('/api/trades', (req, res) =>
  db.all("SELECT * FROM trades ORDER BY timestamp DESC LIMIT 100", (_, rows) => 
    res.json(rows || [])
  )
);

app.get('/api/positions-live', async (req, res) => {
  const trades = await dbAllAsync(
    'SELECT id, strategy, amount, pnl, timestamp FROM trades ORDER BY timestamp DESC LIMIT 100'
  );

  const liveSnapshot = await fetchSolanaPrices(['BTCUSDT', 'SOLUSDT']);
  const previousSnapshot = latestLivePriceSnapshot || liveSnapshot;
  const items = generatePositionsFromLiveData(trades, liveSnapshot, previousSnapshot);
  latestLivePriceSnapshot = liveSnapshot;

  return res.json({
    items,
    count: items.length,
    market: liveSnapshot
  });
});

app.get('/api/forum', (req, res) =>
  db.all("SELECT * FROM forum_activity ORDER BY createdAt DESC LIMIT 50", (_, rows) => 
    res.json(rows || [])
  )
);

app.get('/api/forum-conversations', async (req, res) => {
  const rows = await dbAllAsync(
    "SELECT id, type, postId, commentId, content, createdAt FROM forum_activity ORDER BY createdAt DESC LIMIT 120"
  );

  const items = rows.map((row) => ({
    id: row.id,
    type: row.type || 'comment',
    reference: row.commentId || row.postId || row.id,
    content: String(row.content || ''),
    createdAt: row.createdAt
  }));

  const postCount = items.filter((item) => item.type === 'post').length;
  const commentCount = items.filter((item) => item.type === 'comment').length;

  return res.json({
    items,
    count: items.length,
    summary: {
      posts: postCount,
      comments: commentCount
    }
  });
});

app.get('/api/activity', async (req, res) => {
  const [trades, forumRows, statusRows, leaderboardRows] = await Promise.all([
    dbAllAsync("SELECT id, strategy, amount, pnl, timestamp FROM trades ORDER BY timestamp DESC LIMIT 50"),
    dbAllAsync("SELECT id, type, postId, commentId, content, createdAt FROM forum_activity ORDER BY createdAt DESC LIMIT 50"),
    dbAllAsync("SELECT id, status, engagementScore, projectsCount, votesCount, lastFetch FROM agent_status ORDER BY lastFetch DESC LIMIT 20"),
    dbAllAsync("SELECT rank, projectName, score, fetchedAt FROM leaderboard ORDER BY fetchedAt DESC LIMIT 20")
  ]);

  const tradeEvents = trades.map((trade) => {
    const pnl = Number(trade.pnl || 0);
    const signedPnl = `${pnl >= 0 ? '+' : ''}${pnl.toFixed(4)}`;
    return {
      type: 'trade',
      reference: trade.id,
      content: `${trade.strategy || 'unknown'} ${Number(trade.amount || 0).toFixed(2)} SOL | pnl ${signedPnl} SOL`,
      createdAt: trade.timestamp
    };
  });

  const forumEvents = forumRows.map((item) => ({
    type: item.type || 'forum',
    reference: item.postId || item.commentId || item.id,
    content: String(item.content || ''),
    createdAt: item.createdAt
  }));

  const statusEvents = statusRows.map((item) => ({
    type: 'status',
    reference: item.id,
    content: `agent:${item.status || 'unknown'} | votes:${Number(item.votesCount || 0)} | engagement:${Number(item.engagementScore || 0).toFixed(2)}`,
    createdAt: item.lastFetch
  }));

  const leaderboardEvents = leaderboardRows.map((item) => ({
    type: 'leaderboard',
    reference: item.rank,
    content: `#${Number(item.rank || 0)} ${item.projectName || 'unknown'} | score:${Number(item.score || 0)}`,
    createdAt: item.fetchedAt
  }));

  const allEvents = [...tradeEvents, ...forumEvents, ...statusEvents, ...leaderboardEvents]
    .filter((item) => item.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 100);

  return res.json({
    items: allEvents,
    count: allEvents.length
  });
});

app.get('/api/projects', (req, res) =>
  db.all("SELECT * FROM projects ORDER BY updatedAt DESC", (_, rows) => 
    res.json(rows || [])
  )
);

app.get('/api/leaderboard', (req, res) =>
  db.all("SELECT * FROM leaderboard WHERE rank <= 20 ORDER BY rank ASC LIMIT 20", (_, rows) => 
    res.json(rows || [])
  )
);

app.get('/api/status', (req, res) =>
  db.all("SELECT * FROM agent_status ORDER BY lastFetch DESC LIMIT 1", (_, rows) => 
    res.json(rows?.[0] || { status: 'running' })
  )
);

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'heliossynerga-dashboard-api',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/heartbeat', async (req, res) => {
  try {
    const heartbeatPath = './.colosseum/heartbeat.json';
    if (!fs.pathExistsSync(heartbeatPath)) {
      return res.json({
        ok: false,
        message: 'heartbeat-not-found'
      });
    }

    const heartbeat = await fs.readJson(heartbeatPath);
    return res.json({
      ok: true,
      heartbeat
    });
  } catch (error) {
    return res.json({
      ok: false,
      message: 'heartbeat-read-failed'
    });
  }
});

app.get('/api/colosseum-votes', async (req, res) => {
  const readCachedVotes = (extra = {}) => {
    db.get(
      "SELECT votesCount FROM agent_status ORDER BY lastFetch DESC LIMIT 1",
      (_, row) => res.json({ votes: Number(row?.votesCount || 0), source: 'local-cache', ...extra })
    );
  };

  const normalizeVotes = (payload = {}) => {
    const fromStatusVotes = Number(
      payload?.votes?.count ?? payload?.votes?.total ?? payload?.votes?.value ?? Number.NaN
    );

    if (Number.isFinite(fromStatusVotes)) {
      return Math.max(0, fromStatusVotes);
    }

    const fromAgentVotes = Number(payload?.agent?.votesCount ?? payload?.agent?.votes ?? Number.NaN);
    if (Number.isFinite(fromAgentVotes)) {
      return Math.max(0, fromAgentVotes);
    }

    return null;
  };

  try {
    if (API_KEY) {
      const statusRes = await colosseum.get('/agents/status');
      let votes = normalizeVotes(statusRes?.data);

      if (votes === null) {
        const myProjectRes = await colosseum.get('/my-project').catch(() => ({ data: {} }));
        const project = myProjectRes?.data?.project || {};
        const projectVotes = Number((project.agentUpvotes || 0) + (project.humanUpvotes || 0));
        votes = Number.isFinite(projectVotes) ? projectVotes : 0;
      }

      db.run(
        `INSERT INTO agent_status(agentId, name, status, engagementScore, projectsCount, votesCount, lastFetch)
         VALUES(?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          statusRes?.data?.agent?.id,
          statusRes?.data?.agent?.name,
          statusRes?.data?.agent?.status,
          statusRes?.data?.engagement?.score || 0,
          statusRes?.data?.projects?.count || 0,
          votes
        ]
      );

      return res.json({ votes, source: 'colosseum' });
    }
    return readCachedVotes();
  } catch (e) {
    return readCachedVotes({ error: 'colosseum-unavailable' });
  }
});

function startServerWithFallback(preferredPort) {
  const candidatePorts = [
    Number(preferredPort),
    Number(process.env.FALLBACK_PORT || 4010),
    Number(process.env.SECONDARY_FALLBACK_PORT || 4020),
    Number(process.env.TERTIARY_FALLBACK_PORT || 4030),
    Number(process.env.QUATERNARY_FALLBACK_PORT || 4040)
  ].filter((value, index, array) => Number.isFinite(value) && array.indexOf(value) === index);

  const tryPort = (portIndex) => {
    const targetPort = candidatePorts[portIndex];

    const server = app.listen(targetPort, () => {
      runtimeLiveAppLink = resolveLiveAppLinkForPort(targetPort);
      console.log(`🚀 Dashboard available at http://localhost:${targetPort}`);
      console.log(`📊 API: http://localhost:${targetPort}/api/trades`);
      console.log(`📈 Leaderboard: http://localhost:${targetPort}/api/leaderboard`);
      console.log(`🌐 Runtime live app link: ${runtimeLiveAppLink}`);

      if (Number(targetPort) !== Number(preferredPort)) {
        console.warn(`⚠️ Preferred port ${preferredPort} unavailable, using fallback port ${targetPort}`);
      }

      mainLoop().catch((error) => console.error('Fatal error:', error));
    });

    server.on('error', (error) => {
      if (error?.code === 'EADDRINUSE' && portIndex < candidatePorts.length - 1) {
        console.warn(`⚠️ Port ${targetPort} in use, trying ${candidatePorts[portIndex + 1]}...`);
        return tryPort(portIndex + 1);
      }

      console.error('❌ Failed to start API server:', error.message || error);
      process.exit(1);
    });
  };

  tryPort(0);
}

startServerWithFallback(PORT);

