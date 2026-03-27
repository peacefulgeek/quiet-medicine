import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Start web server
const web = spawn('node', [path.join(__dirname, '../src/server/index.mjs')], {
  stdio: 'inherit',
  env: { ...process.env },
});

web.on('error', (err) => {
  console.error('[start-with-cron] Web server error:', err);
  process.exit(1);
});

// Start cron worker
const cron = spawn('node', [path.join(__dirname, 'cron-worker.mjs')], {
  stdio: 'inherit',
  env: { ...process.env },
});

cron.on('error', (err) => {
  console.error('[start-with-cron] Cron worker error:', err);
});

process.on('SIGTERM', () => {
  web.kill('SIGTERM');
  cron.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGINT', () => {
  web.kill('SIGINT');
  cron.kill('SIGINT');
  process.exit(0);
});
