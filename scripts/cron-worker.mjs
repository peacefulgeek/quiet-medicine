import cron from 'node-cron';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runNow = process.argv.includes('--run-now');

function runGenerator() {
  console.log('[cron] Running article generator at', new Date().toISOString());
  const child = spawn('node', [path.join(__dirname, 'generate-articles.mjs')], {
    stdio: 'inherit',
    env: { ...process.env },
    timeout: 600000, // 600s timeout
  });

  child.on('close', (code) => {
    console.log(`[cron] Generator exited with code ${code}`);
  });

  child.on('error', (err) => {
    console.error('[cron] Generator error:', err);
  });
}

if (runNow) {
  runGenerator();
} else {
  // Mon-Fri at 12:00 UTC (6AM MDT)
  cron.schedule('0 12 * * 1-5', () => {
    runGenerator();
  }, { timezone: 'UTC' });

  console.log('[cron] Scheduled: Mon-Fri 12:00 UTC');
}
