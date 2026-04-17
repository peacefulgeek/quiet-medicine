import cron from 'node-cron';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.join(__dirname, '..', 'content', 'articles');

const runNow = process.argv.includes('--run-now');
const AUTO_GEN = process.env.AUTO_GEN_ENABLED === 'true';

/** Publish any scheduled articles whose publishDate has passed */
function publishScheduledArticles() {
  const now = new Date();
  console.log('[cron] Checking for scheduled articles at', now.toISOString());

  let published = 0;
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(contentDir, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (data.status === 'scheduled' && data.publishDate) {
        const pubDate = new Date(data.publishDate);
        if (pubDate <= now) {
          data.status = 'published';
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          published++;
          console.log('  [cron] Published:', data.slug);
        }
      }
    } catch (err) {
      console.error('  [cron] Error processing ' + file + ':', err.message);
    }
  }

  console.log('[cron] Published ' + published + ' articles this run.');
}

/** Run the auto-gen pipeline (when enabled) */
function runGenerator() {
  console.log('[cron] Running article generator at', new Date().toISOString());
  const child = spawn('node', [path.join(__dirname, 'generate-articles.mjs')], {
    stdio: 'inherit',
    env: { ...process.env },
    timeout: 600000,
  });

  child.on('close', (code) => {
    console.log('[cron] Generator exited with code ' + code);
  });

  child.on('error', (err) => {
    console.error('[cron] Generator error:', err);
  });
}

/** Run the Amazon ASIN health checker (Sundays) */
function runAsinHealthCheck() {
  console.log('[cron] Running ASIN health check at', new Date().toISOString());
  const child = spawn('node', [path.join(__dirname, 'check-amazon-links.mjs'), '--fix', '--push'], {
    stdio: 'inherit',
    env: { ...process.env },
    timeout: 900000, // 15 min — checks ~30 ASINs at 2s each + buffer
  });

  child.on('close', (code) => {
    console.log('[cron] ASIN health check exited with code ' + code);
  });

  child.on('error', (err) => {
    console.error('[cron] ASIN health check error:', err);
  });
}

/** Monthly content refresh — re-audit quality of oldest articles */
function runMonthlyRefresh() {
  console.log('[cron] Running monthly content refresh at', new Date().toISOString());
  const child = spawn('node', [path.join(__dirname, 'refresh-monthly.mjs')], {
    stdio: 'inherit',
    env: { ...process.env },
    timeout: 1200000, // 20 min
  });
  child.on('close', (code) => { console.log('[cron] Monthly refresh exited with code ' + code); });
  child.on('error', (err) => { console.error('[cron] Monthly refresh error:', err); });
}

/** Quarterly content refresh — deeper regeneration of underperforming articles */
function runQuarterlyRefresh() {
  console.log('[cron] Running quarterly content refresh at', new Date().toISOString());
  const child = spawn('node', [path.join(__dirname, 'refresh-quarterly.mjs')], {
    stdio: 'inherit',
    env: { ...process.env },
    timeout: 1800000, // 30 min
  });
  child.on('close', (code) => { console.log('[cron] Quarterly refresh exited with code ' + code); });
  child.on('error', (err) => { console.error('[cron] Quarterly refresh error:', err); });
}

/** Run the product spotlight generator on Saturdays */
function runSpotlightGenerator() {
  console.log('[cron] Running product spotlight generator at', new Date().toISOString());
  const child = spawn('node', [path.join(__dirname, 'generate-spotlight.mjs')], {
    stdio: 'inherit',
    env: { ...process.env },
    timeout: 600000,
  });

  child.on('close', (code) => {
    console.log('[cron] Spotlight generator exited with code ' + code);
  });

  child.on('error', (err) => {
    console.error('[cron] Spotlight generator error:', err);
  });
}

if (runNow) {
  publishScheduledArticles();
} else {
  // ── Phase 1: Publish pre-scheduled articles ──
  // Runs every hour to check for articles whose publishDate has passed
  // 270 articles scheduled at 5/day (Mar 28 – May 20, 2026)
  cron.schedule('0 * * * *', () => {
    publishScheduledArticles();
  }, { timezone: 'UTC' });

  if (!AUTO_GEN) {
    console.log('[cron] AUTO_GEN_ENABLED != "true" — generation crons disabled');
  } else {
    // ── Cron 1: Article generation — Mon-Fri 06:00 UTC (5/week) ──
    cron.schedule('0 6 * * 1-5', () => {
      runGenerator();
    }, { timezone: 'UTC' });

    // ── Cron 2: Product spotlight — Saturday 08:00 UTC (1/week) ──
    cron.schedule('0 8 * * 6', () => {
      runSpotlightGenerator();
    }, { timezone: 'UTC' });

    // ── Cron 3: Monthly content refresh — 1st of month 03:00 UTC ──
    cron.schedule('0 3 1 * *', () => {
      runMonthlyRefresh();
    }, { timezone: 'UTC' });

    // ── Cron 4: Quarterly content refresh — Jan/Apr/Jul/Oct 1st 04:00 UTC ──
    cron.schedule('0 4 1 1,4,7,10 *', () => {
      runQuarterlyRefresh();
    }, { timezone: 'UTC' });

    console.log('[cron] Generation crons registered (AUTO_GEN_ENABLED=true)');
  }

  // ── Cron 5: ASIN health check — Sunday 05:00 UTC (always runs) ──
  cron.schedule('0 5 * * 0', () => {
    runAsinHealthCheck();
  }, { timezone: 'UTC' });

  console.log('[cron] Scheduled:');
  console.log('  Phase 1: Hourly publish check');
  if (AUTO_GEN) {
    console.log('  Cron 1: Mon-Fri 06:00 UTC article gen (5/week)');
    console.log('  Cron 2: Saturday 08:00 UTC product spotlight');
    console.log('  Cron 3: 1st of month 03:00 UTC monthly refresh');
    console.log('  Cron 4: Jan/Apr/Jul/Oct 1st 04:00 UTC quarterly refresh');
  }
  console.log('  Cron 5: Sunday 05:00 UTC ASIN health check');

  // Run publish check immediately on startup
  publishScheduledArticles();
}
