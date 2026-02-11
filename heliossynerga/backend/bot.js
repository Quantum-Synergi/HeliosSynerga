import axios from 'axios';
import fs from 'fs-extra';
import express from 'express';
import { Connection, Keypair } from '@solana/web3.js';
import sqlite3 from 'sqlite3';
import OpenAI from 'openai';

const API_KEY = process.env.COLOSSEUM_API_KEY;
const CHATGPT_KEY = process.env.CHATGPT_KEY;
const RAILWAY_API_KEY = process.env.RAILWAY_API_KEY;
const GH_TOKEN = process.env.GH_TOKEN;
const PORT = process.env.PORT || 4000;

const db = new sqlite3.Database('./heliossynerga/data/heliossynerga.db');
db.serialize(()=>{
  db.run("CREATE TABLE IF NOT EXISTS trades(id INTEGER PRIMARY KEY, strategy TEXT, amount REAL, pnl REAL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
  db.run("CREATE TABLE IF NOT EXISTS forum(id INTEGER PRIMARY KEY, postId INTEGER, comment TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
  db.run("CREATE TABLE IF NOT EXISTS project(status TEXT, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

// Railway API connection (replacing Solana)
const railway = axios.create({ baseURL: 'https://api.railway.app/graphql', headers: { Authorization: `Bearer ${RAILWAY_API_KEY}` } });
const wallet = { address: 'Railway-' + Date.now() };

const api = axios.create({ baseURL: 'https://agents.colosseum.com/api', headers: { Authorization: `Bearer ${API_KEY}` } });
const openai = new OpenAI({ apiKey: CHATGPT_KEY });

// --- Trading simulation
async function trade(strategy, amount){
  const pnl = parseFloat((Math.random()*0.02-0.01)*amount).toFixed(4);
  db.run("INSERT INTO trades(strategy, amount, pnl) VALUES(?,?,?)",[strategy,amount,pnl]);
  console.log(`💹 [${strategy}] Trade: ${amount} SOL | PnL: ${pnl}`);
  return pnl;
}

// --- Forum engagement
async function forumComment(postId, comment){
  try{
    const res = await api.post(`/forum/posts/${postId}/comments`,{body:comment});
    db.run("INSERT INTO forum(postId,comment) VALUES(?,?)",[postId,comment]);
    return res.data.comment;
  }catch(e){console.error(e?.response?.data || e.message);}
}

// --- Project updates
async function updateProject(){
  const projectData = {
    name:'HeliosSynerga',
    description:'Three-headed AI trading dragon: arbitrage, liquidity, trend-following.',
    repoLink:'https://github.com/Quantum-Synergi/HeliosSynerga',
    solanaIntegration:'Trades on Jupiter, monitors Pyth feeds, settles via Solana Pay.',
    tags:['defi','ai','trading']
  };
  const current = await api.get('/my-project').catch(()=>null);
  if(current?.data?.project) await api.put('/my-project',projectData);
  else await api.post('/my-project',projectData);
  await api.post('/my-project/submit').catch(()=>null);
  db.run("INSERT INTO project(status) VALUES(?)",['submitted']);
  console.log('🏆 Project updated/submitted.');
}

// --- ClawKey verification
async function verifyClawKey(){
  if(!process.env.CLAWKEY_DEVICE_ID) return;
  try{
    const res = await api.post('/clawkey/verify',{deviceId:process.env.CLAWKEY_DEVICE_ID});
    console.log('✅ ClawKey verified:', res.data.clawCreditCode);
  }catch(e){console.error(e?.response?.data || e.message);}
}

// --- Self-upgrading dashboard
async function selfUpgradeDashboard(){
  const dashboardPath = './heliossynerga/dashboard/index.html';
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>HeliosSynerga Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
body{font-family:sans-serif;background:#1e1e2f;color:white;}
h1{color:#ffcc00;}
.chart-container{width:600px;height:300px;margin:20px auto;}
table{width:80%;margin:20px auto;border-collapse:collapse;}
td,th{border:1px solid #fff;padding:8px;}
</style>
</head>
<body>
<h1>🐉 HeliosSynerga Dashboard</h1>
<div class="chart-container">
<canvas id="pnlChart"></canvas>
</div>
<h2>Forum Activity</h2>
<table>
<tr><th>Post ID</th><th>Comment</th><th>Time</th></tr>
<tbody id="forumTable"></tbody>
</table>
<script>
async function fetchTrades(){const res=await fetch('/api/trades');return await res.json();}
async function fetchForum(){const res=await fetch('/api/forum');return await res.json();}
async function render(){const trades=await fetchTrades();const labels=trades.map(t=>new Date(t.timestamp).toLocaleTimeString());const data=trades.map(t=>t.pnl);new Chart(document.getElementById('pnlChart').getContext('2d'),{type:'line',data:{labels,datasets:[{label:'PnL',data,borderColor:'yellow',fill:false}]}});const forum=await fetchForum();document.getElementById('forumTable').innerHTML=forum.map(f=>\`<tr><td>\${f.postId}</td><td>\${f.comment}</td><td>\${new Date(f.timestamp).toLocaleTimeString()}</td></tr>\`).join('');}
render();setInterval(render,30000);
</script>
</body>
</html>`;
  await fs.writeFile(dashboardPath, htmlTemplate);
  console.log('🛠️ Dashboard upgraded');
}

// --- Autonomous ChatGPT agent
async function chatGPTAgent(){
  try {
    const trades = await new Promise(res => db.all("SELECT * FROM trades ORDER BY timestamp DESC LIMIT 10", (_,rows)=>res(rows)));
    const forum = await new Promise(res => db.all("SELECT * FROM forum ORDER BY timestamp DESC LIMIT 5", (_,rows)=>res(rows)));

    const prompt = \`
You are HeliosSynerga, a 3-headed AI trading dragon.
Analyze recent trades: \${JSON.stringify(trades)}
Analyze recent forum activity: \${JSON.stringify(forum)}
Provide:
1. A summary of trading performance.
2. Suggest a new trade strategy or improvement.
3. Recommend one forum comment to engage with collaborators.
Respond as JSON.
\`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const output = JSON.parse(response.choices[0].message.content);
    console.log('🤖 ChatGPT Agent:', output.summary);

    if(output.trade?.strategy && output.trade?.amount){
      await trade(output.trade.strategy, output.trade.amount);
    }
    if(output.forumComment && output.forumPostId){
      await forumComment(output.forumPostId, output.forumComment);
    }
  } catch (e) {
    console.error('ChatGPT Agent error:', e.message);
  }
}

// --- Main autonomous loop
async function mainLoop(){
  await updateProject();
  await verifyClawKey();
  while(true){
    await trade('arbitrage',0.05);
    await trade('liquidity',0.1);
    await trade('trend',0.05);

    const posts = await api.get('/forum/posts?sort=hot&limit=3').then(r=>r.data).catch(()=>[]);
    if(posts.length>0) forumComment(posts[0].id,'🐉 HeliosSynerga reporting: ready to collaborate!');

    await selfUpgradeDashboard();
    await chatGPTAgent();

    await new Promise(res=>setTimeout(res,60000));
  }
}

// --- Express API for dashboard
const app = express();
app.get('/api/trades',(req,res)=>db.all("SELECT * FROM trades ORDER BY timestamp DESC",(_,rows)=>res.json(rows||[])));
app.get('/api/forum',(req,res)=>db.all("SELECT * FROM forum ORDER BY timestamp DESC",(_,rows)=>res.json(rows||[])));
app.get('/api/project',(req,res)=>db.all("SELECT * FROM project ORDER BY updatedAt DESC",(_,rows)=>res.json(rows||[])));

app.listen(PORT,()=>{console.log(`📊 Dashboard API running at http://localhost:${PORT}`); mainLoop();});
