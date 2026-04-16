#!/usr/bin/env node
/**
 * Amazon ASIN Health Checker
 * ──────────────────────────
 * Lightweight validation: HTTP GET to Amazon product pages.
 * - Checks if ASINs are still valid (200 vs 404/dog-page)
 * - Scrapes product title from page for name verification
 * - Flags broken links and logs a report
 * - Auto-replaces dead ASINs with fallback products from verified catalog
 * - Commits fixes to GitHub when GH_PAT is available (Render cron)
 *
 * No API keys needed — just HTTP requests with browser-like headers.
 *
 * Usage:
 *   node scripts/check-amazon-links.mjs            # dry-run (report only)
 *   node scripts/check-amazon-links.mjs --fix      # auto-fix broken links
 *   node scripts/check-amazon-links.mjs --fix --push  # fix + push to GitHub
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'articles');
const REPORT_PATH = path.join(__dirname, '..', 'asin-health-report.json');
const TAG = 'spankyspinola-20';
const GH_PAT = process.env.GH_PAT || '';
const GITHUB_REPO = 'peacefulgeek/quiet-medicine';

const DO_FIX = process.argv.includes('--fix');
const DO_PUSH = process.argv.includes('--push');

// ─── RATE LIMITING ───
// Amazon will throttle/block if we hit too fast.
// 2-second delay between requests, randomized ±500ms
const BASE_DELAY_MS = 2000;
const JITTER_MS = 500;

// ─── BROWSER-LIKE HEADERS ───
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'identity',
  'Cache-Control': 'no-cache',
};

// ─── VERIFIED FALLBACK CATALOG ───
// If a product goes dead, replace with the closest match from this catalog.
// All verified 2026-04-16. Grouped by category for smart fallback.
const FALLBACK_CATALOG = {
  journals: [
    { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal' },
    { asin: '1646119266', name: 'a guided meditation journal' },
    { asin: 'B0CHVYY8P4', name: 'a therapy journal with guided prompts' },
  ],
  books: [
    { asin: '0735224153', name: 'How to Change Your Mind by Michael Pollan' },
    { asin: '1594774021', name: "The Psychedelic Explorer's Guide" },
    { asin: '0143127748', name: 'The Body Keeps the Score' },
    { asin: '0062429655', name: 'Stealing Fire' },
    { asin: '0451494091', name: 'A Really Good Day by Ayelet Waldman' },
    { asin: '0525510311', name: 'Entangled Life by Merlin Sheldrake' },
    { asin: '0060801719', name: 'The Doors of Perception by Aldous Huxley' },
    { asin: '1451636024', name: 'Waking Up by Sam Harris' },
  ],
  meditation: [
    { asin: 'B0D2K8N8NR', name: 'a meditation zafu cushion' },
    { asin: 'B0FWQQGTST', name: 'a gentle meditation timer' },
    { asin: 'B074TBYWGS', name: 'a silk sleep eye mask' },
  ],
  wellness: [
    { asin: 'B073429DV2', name: 'a weighted blanket for grounding' },
    { asin: 'B0DK86ZBNJ', name: 'a soft therapy blanket' },
    { asin: 'B0GRTH9B7J', name: 'blue light blocking glasses' },
    { asin: 'B08346DZN9', name: 'an intermittent fasting tracker' },
  ],
  tools: [
    { asin: 'B0885S1766', name: 'precision milligram scale' },
    { asin: 'B09XS7JWHH', name: 'Sony WH-1000XM5 noise-canceling headphones' },
    { asin: 'B0FPML7DJC', name: 'a WHOOP HRV monitor' },
  ],
  supplements: [
    { asin: 'B078SZX3ML', name: "Lion's Mane mushroom capsules" },
    { asin: 'B09VK9S4JB', name: 'a mushroom growing kit' },
  ],
  ceremony: [
    { asin: 'B01MR4Y0CZ', name: 'an aromatherapy essential oil diffuser' },
    { asin: 'B0D5HNFKVC', name: 'a natural beeswax candle set' },
    { asin: 'B08FR8MPCW', name: 'an acupressure mat and pillow set' },
  ],
};

// Map each known ASIN to its category for smart fallback
const ASIN_CATEGORY_MAP = {};
for (const [cat, products] of Object.entries(FALLBACK_CATALOG)) {
  for (const p of products) {
    ASIN_CATEGORY_MAP[p.asin] = cat;
  }
}

// ─── HTTP FETCH WITH RETRY ───
function fetchPage(url, retries = 2) {
  return new Promise((resolve, reject) => {
    const doRequest = (attempt) => {
      const proto = url.startsWith('https') ? https : http;
      const req = proto.get(url, { headers: HEADERS, timeout: 15000 }, (res) => {
        // Follow redirects (up to 3)
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
          const redirectUrl = res.headers.location.startsWith('http')
            ? res.headers.location
            : `https://www.amazon.com${res.headers.location}`;
          res.resume();
          return fetchPage(redirectUrl, 0).then(resolve).catch(reject);
        }

        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body, url: res.url || url });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        if (attempt < retries) {
          setTimeout(() => doRequest(attempt + 1), 3000);
        } else {
          reject(new Error('Timeout after ' + retries + ' retries'));
        }
      });

      req.on('error', (err) => {
        if (attempt < retries) {
          setTimeout(() => doRequest(attempt + 1), 3000);
        } else {
          reject(err);
        }
      });
    };

    doRequest(0);
  });
}

// ─── EXTRACT PRODUCT TITLE FROM HTML ───
function extractProductTitle(html) {
  // Try productTitle span (most common on product pages)
  const titleMatch = html.match(/id="productTitle"[^>]*>\s*([^<]+)/s);
  if (titleMatch) return titleMatch[1].trim();

  // Try <title> tag — Amazon format: "Product Name : Author : Amazon.com: Category"
  const tagMatch = html.match(/<title[^>]*>(.*?)<\/title>/s);
  if (tagMatch) {
    let raw = tagMatch[1].replace(/\s+/g, ' ').trim();
    // Strip everything after first " : Amazon" or ": Amazon"
    raw = raw.replace(/\s*:?\s*Amazon\.com.*$/i, '').trim();
    // Strip trailing " : Category" patterns
    raw = raw.replace(/\s*:\s*[A-Z][a-z]+$/, '').trim();
    if (raw.length > 5) return raw;
  }

  // Try og:title meta tag
  const ogMatch = html.match(/property="og:title"\s+content="([^"]+)"/);
  if (ogMatch) return ogMatch[1].trim();

  return null;
}

// ─── CHECK IF PAGE IS A DOG/404 PAGE ───
function isDogPage(html) {
  // Only flag as 404 if page is small (real product pages are 500KB+)
  if (html.length > 200000) return false; // Definitely a real page
  return (
    html.includes("Sorry, we couldn") ||
    html.includes('looking for something') ||
    html.includes('Page Not Found') ||
    html.includes("we couldn't find that page") ||
    html.includes('dp/error')
  );
}

// ─── CHECK IF PAGE IS A CAPTCHA ───
// Amazon includes 'robot' and 'captcha' in JS bundles on real pages.
// True CAPTCHA pages are small (<50KB) and contain validateCaptcha form.
function isCaptchaPage(html) {
  // Real CAPTCHA pages are small and have a specific form
  if (html.length < 50000 && html.includes('validateCaptcha')) return true;
  if (html.includes('Type the characters you see in this image')) return true;
  // If page is large (>100KB), it's a real product page even if 'robot' appears in JS
  return false;
}

// ─── EXTRACT ALL UNIQUE ASINS FROM ARTICLES ───
function extractAsinsFromArticles() {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));
  const asinMap = new Map(); // asin -> { name, count, files }

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8'));
    const body = data.body || '';

    const regex = /<a[^>]*href="https:\/\/www\.amazon\.com\/dp\/([A-Za-z0-9]+)\?tag=[^"]*"[^>]*>(.*?)<\/a>/g;
    let match;
    while ((match = regex.exec(body)) !== null) {
      const asin = match[1];
      const text = match[2].replace(/\s*\(paid link\)\s*/g, '').trim();
      if (!asinMap.has(asin)) {
        asinMap.set(asin, { name: text, count: 0, files: [] });
      }
      const entry = asinMap.get(asin);
      entry.count++;
      if (!entry.files.includes(file)) {
        entry.files.push(file);
      }
    }
  }

  return asinMap;
}

// ─── FIND A FALLBACK PRODUCT ───
function findFallback(deadAsin, allHealthy) {
  const category = ASIN_CATEGORY_MAP[deadAsin] || 'books'; // default to books
  const candidates = FALLBACK_CATALOG[category] || FALLBACK_CATALOG.books;

  // Pick a healthy product from the same category that isn't the dead one
  for (const c of candidates) {
    if (c.asin !== deadAsin && allHealthy.has(c.asin)) {
      return c;
    }
  }

  // If all in category are dead, pick from books (always has many)
  for (const c of FALLBACK_CATALOG.books) {
    if (c.asin !== deadAsin && allHealthy.has(c.asin)) {
      return c;
    }
  }

  return null;
}

// ─── REPLACE ASIN IN ALL ARTICLES ───
function replaceAsinInArticles(oldAsin, newAsin, newName) {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));
  let replaced = 0;

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf8');

    if (!raw.includes(oldAsin)) continue;

    let data = JSON.parse(raw);
    let body = data.body || '';

    // Replace ASIN in URL
    body = body.replaceAll(
      `amazon.com/dp/${oldAsin}?tag=${TAG}`,
      `amazon.com/dp/${newAsin}?tag=${TAG}`
    );

    // Update link text
    const linkRegex = new RegExp(
      `(<a[^>]*href="https://www\\.amazon\\.com/dp/${newAsin}\\?tag=${TAG}"[^>]*>)(.*?)(</a>)`,
      'g'
    );
    body = body.replace(linkRegex, (_, open, text, close) => {
      const hasPaidLabel = text.includes('(paid link)');
      return `${open}${newName}${hasPaidLabel ? ' (paid link)' : ''}${close}`;
    });

    data.body = body;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    replaced++;
  }

  return replaced;
}

// ─── GIT COMMIT & PUSH ───
function gitCommitAndPush(message) {
  if (!GH_PAT) {
    console.log('[asin-check] No GH_PAT — skipping git push');
    return false;
  }

  try {
    execSync('git add -A', { cwd: path.join(__dirname, '..'), stdio: 'pipe' });

    // Check if there are changes to commit
    const status = execSync('git status --porcelain', { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
    if (!status.trim()) {
      console.log('[asin-check] No changes to commit');
      return false;
    }

    execSync(`git commit -m "${message}"`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });

    const remoteUrl = `https://x-access-token:${GH_PAT}@github.com/${GITHUB_REPO}.git`;
    execSync(`git push ${remoteUrl} main`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });

    console.log('[asin-check] Pushed to GitHub: ' + message);
    return true;
  } catch (err) {
    console.error('[asin-check] Git error:', err.message);
    return false;
  }
}

// ─── SLEEP HELPER ───
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── MAIN ───
async function main() {
  console.log('[asin-check] Amazon ASIN Health Check starting at', new Date().toISOString());
  console.log('[asin-check] Mode:', DO_FIX ? (DO_PUSH ? 'FIX + PUSH' : 'FIX (local only)') : 'DRY RUN (report only)');

  // 1. Extract all ASINs from articles
  const asinMap = extractAsinsFromArticles();
  const asins = [...asinMap.entries()].sort((a, b) => b[1].count - a[1].count);
  console.log(`[asin-check] Found ${asins.length} unique ASINs across ${asinMap.size > 0 ? [...asinMap.values()].reduce((s, v) => s + v.count, 0) : 0} total links`);

  // 2. Check each ASIN
  const results = [];
  const healthy = new Set();
  const broken = [];
  let captchaCount = 0;

  for (const [asin, info] of asins) {
    const url = `https://www.amazon.com/dp/${asin}`;

    try {
      const delay = BASE_DELAY_MS + Math.floor(Math.random() * JITTER_MS * 2) - JITTER_MS;
      await sleep(delay);

      const { statusCode, body } = await fetchPage(url);

      if (isCaptchaPage(body)) {
        // Hit rate limit — stop checking, report what we have
        console.log(`[asin-check] CAPTCHA detected at ASIN ${asin} — stopping to avoid ban`);
        captchaCount++;
        results.push({
          asin,
          name: info.name,
          uses: info.count,
          status: 'captcha',
          httpCode: statusCode,
          scrapedTitle: null,
        });
        // Wait longer and continue with remaining
        await sleep(10000);
        continue;
      }

      const isDog = isDogPage(body);
      const scrapedTitle = extractProductTitle(body);

      let status;
      if (statusCode === 404 || isDog) {
        status = 'dead';
      } else if (statusCode === 200 && !isDog) {
        status = 'ok';
      } else if (statusCode >= 500) {
        status = 'server-error';
      } else {
        status = `http-${statusCode}`;
      }

      const result = {
        asin,
        name: info.name,
        uses: info.count,
        status,
        httpCode: statusCode,
        scrapedTitle: scrapedTitle || null,
        titleMatch: scrapedTitle ? 'scraped' : 'no-title',
      };

      results.push(result);

      if (status === 'ok') {
        healthy.add(asin);
        const titleInfo = scrapedTitle ? ` — "${scrapedTitle.substring(0, 60)}"` : '';
        console.log(`  ✓ ${asin} (${info.count}x) OK${titleInfo}`);
      } else if (status === 'dead') {
        broken.push({ asin, info, result });
        console.log(`  ✗ ${asin} (${info.count}x) DEAD — ${info.name}`);
      } else {
        console.log(`  ? ${asin} (${info.count}x) ${status}`);
      }

    } catch (err) {
      results.push({
        asin,
        name: info.name,
        uses: info.count,
        status: 'error',
        error: err.message,
      });
      console.log(`  ! ${asin} (${info.count}x) ERROR: ${err.message}`);
    }
  }

  // 3. Report
  console.log('\n[asin-check] ═══════════════════════════════════');
  console.log(`[asin-check] RESULTS: ${healthy.size} OK / ${broken.length} DEAD / ${captchaCount} CAPTCHA`);

  // 4. Auto-fix broken links
  let fixedCount = 0;
  const fixes = [];

  if (DO_FIX && broken.length > 0) {
    console.log('\n[asin-check] Auto-fixing broken ASINs...');

    for (const { asin, info } of broken) {
      const fallback = findFallback(asin, healthy);
      if (fallback) {
        const articlesFixed = replaceAsinInArticles(asin, fallback.asin, fallback.name);
        fixes.push({
          oldAsin: asin,
          oldName: info.name,
          newAsin: fallback.asin,
          newName: fallback.name,
          articlesFixed,
        });
        fixedCount += articlesFixed;
        healthy.add(fallback.asin); // new ASIN is known-good
        console.log(`  → Replaced ${asin} with ${fallback.asin} (${fallback.name}) in ${articlesFixed} articles`);
      } else {
        console.log(`  ⚠ No fallback available for ${asin} (${info.name})`);
      }
    }
  }

  // 5. Save report
  const report = {
    timestamp: new Date().toISOString(),
    mode: DO_FIX ? (DO_PUSH ? 'fix+push' : 'fix') : 'dry-run',
    totalAsins: asins.length,
    totalLinks: [...asinMap.values()].reduce((s, v) => s + v.count, 0),
    healthy: healthy.size,
    broken: broken.length,
    captcha: captchaCount,
    fixesApplied: fixes.length,
    articlesModified: fixedCount,
    results,
    fixes,
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\n[asin-check] Report saved to ${REPORT_PATH}`);

  // 6. Push to GitHub if fixes were made
  if (DO_PUSH && fixes.length > 0) {
    const msg = `[auto] ASIN health check: replaced ${fixes.length} dead product link(s) in ${fixedCount} articles`;
    gitCommitAndPush(msg);
  }

  // 7. Summary
  console.log('\n[asin-check] ═══════════════════════════════════');
  console.log('[asin-check] SUMMARY');
  console.log(`  Total ASINs checked: ${asins.length}`);
  console.log(`  Healthy:             ${healthy.size}`);
  console.log(`  Dead/404:            ${broken.length}`);
  console.log(`  CAPTCHA blocked:     ${captchaCount}`);
  if (DO_FIX) {
    console.log(`  Fixes applied:       ${fixes.length}`);
    console.log(`  Articles modified:   ${fixedCount}`);
  }
  console.log(`  Completed at:        ${new Date().toISOString()}`);
  console.log('[asin-check] Done.');

  // Exit with error code if broken links remain unfixed
  if (broken.length > 0 && !DO_FIX) {
    process.exit(1); // Signal that action is needed
  }
}

main().catch(err => {
  console.error('[asin-check] Fatal error:', err);
  process.exit(1);
});
