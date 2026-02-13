import 'dotenv/config';
import fs from 'fs';
import net from 'net';

const requiredVars = ['COLOSSEUM_API_KEY', 'CHATGPT_KEY'];
const optionalVars = ['RAILWAY_API_KEY', 'GH_TOKEN'];
const port = Number(process.env.PORT || 4000);

function checkPortAvailability(targetPort) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(targetPort, '0.0.0.0');
  });
}

async function run() {
  let hasFailure = false;

  console.log('🩺 HeliosSynerga Environment Doctor');

  const envExists = fs.existsSync('.env');
  console.log(`- .env file: ${envExists ? 'found' : 'missing'}`);
  if (!envExists) {
    hasFailure = true;
    console.log('  Fix: cp .env.example .env');
  }

  for (const key of requiredVars) {
    const isSet = Boolean(process.env[key]);
    console.log(`- ${key}: ${isSet ? 'set' : 'missing (required)'}`);
    if (!isSet) hasFailure = true;
  }

  for (const key of optionalVars) {
    const isSet = Boolean(process.env[key]);
    console.log(`- ${key}: ${isSet ? 'set' : 'missing (optional)'}`);
  }

  const isPortFree = await checkPortAvailability(port);
  console.log(`- PORT ${port}: ${isPortFree ? 'available' : 'in use'}`);
  if (!isPortFree) {
    hasFailure = true;
    console.log('  Fix: stop the running process or set a different PORT in .env');
  }

  if (hasFailure) {
    console.log('\n❌ Doctor result: issues found');
    process.exit(1);
  }

  console.log('\n✅ Doctor result: environment looks good');
}

run().catch((error) => {
  console.error('❌ Doctor crashed:', error.message);
  process.exit(1);
});
