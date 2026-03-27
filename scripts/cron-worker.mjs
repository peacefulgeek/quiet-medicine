import cron from 'node-cron';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.join(__dirname, '..', 'content', 'articles');

const runNow = process.argv.includes('--run-now');

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
          console.log(`  [cron] Published: ${data.slug}`);
        }
      }
    } catch (err) {
      console.error(`  [cron] Error processing ${file}:`, err.message);
    }
  }

  console.log(`[cron] Published ${published} articles this run.`);
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
    console.log(`[cron] Generator exited with code ${code}`);
  });

  child.on('error', (err) => {
    console.error('[cron] Generator error:', err);
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

  // ── Phase 2: Auto-generate new articles ──
  // Mon-Fri at 12:00 UTC — generates 1 article/day = 5/week
  // Only runs when AUTO_GEN_ENABLED=true in generate-articles.mjs
  cron.schedule('0 12 * * 1-5', () => {
    runGenerator();
  }, { timezone: 'UTC' });

  console.log('[cron] Scheduled:');
  console.log('  Phase 1: Hourly publish check (5/day for 54 days)');
  console.log('  Phase 2: Mon-Fri 12:00 UTC auto-gen (5/week, when enabled)');

  // Run publish check immediately on startup
  publishScheduledArticles();
}
