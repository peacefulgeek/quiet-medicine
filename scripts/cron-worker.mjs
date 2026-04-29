import cron from 'node-cron';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.join(__dirname, '..', 'content', 'articles');

const AUTO_GEN = process.env.AUTO_GEN_ENABLED === 'true';

/** Count published articles to determine phase */
function getPublishedCount() {
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));
  let count = 0;
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf8'));
      if (data.status === 'published') count++;
    } catch (e) { /* skip */ }
  }
  return count;
}

/** Run the article publisher/generator */
function runGenerator() {
  console.log('[cron] Running article publisher at', new Date().toISOString());
  const child = spawn('node', [path.join(__dirname, 'generate-articles.mjs')], {
    stdio: 'inherit',
    env: { ...process.env },
    timeout: 600000,
  });
  child.on('close', (code) => { console.log('[cron] Publisher exited with code ' + code); });
  child.on('error', (err) => { console.error('[cron] Publisher error:', err); });
}

/** Run the product spotlight generator */
function runSpotlightGenerator() {
  console.log('[cron] Running product spotlight at', new Date().toISOString());
  const child = spawn('node', [path.join(__dirname, 'generate-spotlight.mjs')], {
    stdio: 'inherit',
    env: { ...process.env },
    timeout: 600000,
  });
  child.on('close', (code) => { console.log('[cron] Spotlight exited with code ' + code); });
  child.on('error', (err) => { console.error('[cron] Spotlight error:', err); });
}

/** Run ASIN health check */
function runAsinHealthCheck() {
  console.log('[cron] Running ASIN health check at', new Date().toISOString());
  const child = spawn('node', [path.join(__dirname, 'check-amazon-links.mjs'), '--fix', '--push'], {
    stdio: 'inherit',
    env: { ...process.env },
    timeout: 900000,
  });
  child.on('close', (code) => { console.log('[cron] ASIN check exited with code ' + code); });
  child.on('error', (err) => { console.error('[cron] ASIN check error:', err); });
}

/** Monthly refresh */
function runMonthlyRefresh() {
  console.log('[cron] Running monthly refresh at', new Date().toISOString());
  const child = spawn('node', [path.join(__dirname, 'refresh-monthly.mjs')], {
    stdio: 'inherit',
    env: { ...process.env },
    timeout: 1200000,
  });
  child.on('close', (code) => { console.log('[cron] Monthly refresh exited with code ' + code); });
  child.on('error', (err) => { console.error('[cron] Monthly refresh error:', err); });
}

/** Quarterly refresh */
function runQuarterlyRefresh() {
  console.log('[cron] Running quarterly refresh at', new Date().toISOString());
  const child = spawn('node', [path.join(__dirname, 'refresh-quarterly.mjs')], {
    stdio: 'inherit',
    env: { ...process.env },
    timeout: 1800000,
  });
  child.on('close', (code) => { console.log('[cron] Quarterly refresh exited with code ' + code); });
  child.on('error', (err) => { console.error('[cron] Quarterly refresh error:', err); });
}

// ─── SCHEDULE REGISTRATION ───
if (!AUTO_GEN) {
  console.log('[cron] AUTO_GEN_ENABLED != "true" — generation crons disabled');
} else {
  const published = getPublishedCount();
  console.log(`[cron] Published articles: ${published}`);

  if (published < 60) {
    // ── Phase 1: Fire 5x/day, every day ──
    console.log('[cron] PHASE 1 (< 60 published): 5x/day every day');
    cron.schedule('0 7 * * *', runGenerator, { timezone: 'UTC' });
    cron.schedule('0 10 * * *', runGenerator, { timezone: 'UTC' });
    cron.schedule('0 13 * * *', runGenerator, { timezone: 'UTC' });
    cron.schedule('0 16 * * *', runGenerator, { timezone: 'UTC' });
    cron.schedule('0 19 * * *', runGenerator, { timezone: 'UTC' });
  } else {
    // ── Phase 2: Fire 1x/weekday ──
    console.log('[cron] PHASE 2 (>= 60 published): 1x/weekday at 08:00 UTC');
    cron.schedule('0 8 * * 1-5', runGenerator, { timezone: 'UTC' });
  }

  // ── Product Spotlight: Saturday 08:00 UTC ──
  cron.schedule('0 8 * * 6', runSpotlightGenerator, { timezone: 'UTC' });

  // ── Monthly Refresh: 1st of month 03:00 UTC ──
  cron.schedule('0 3 1 * *', runMonthlyRefresh, { timezone: 'UTC' });

  // ── Quarterly Refresh: Jan/Apr/Jul/Oct 1st 04:00 UTC ──
  cron.schedule('0 4 1 1,4,7,10 *', runQuarterlyRefresh, { timezone: 'UTC' });

  console.log('[cron] Generation crons registered (AUTO_GEN_ENABLED=true)');
}

// ── ASIN Health Check: Sunday 05:00 UTC (always runs) ──
cron.schedule('0 5 * * 0', runAsinHealthCheck, { timezone: 'UTC' });

console.log('[cron] All crons scheduled. Waiting...');
