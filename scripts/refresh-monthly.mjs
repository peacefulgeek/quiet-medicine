#!/usr/bin/env node
/**
 * Monthly Content Refresh
 * ───────────────────────
 * Re-audits the oldest articles for quality gate compliance.
 * Runs on the 1st of every month at 03:00 UTC.
 *
 * For flat-file sites: reads JSON articles, runs quality checks,
 * flags articles that need regeneration.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'articles');

console.log('[refresh-monthly] Starting monthly content audit at', new Date().toISOString());

const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));
const issues = [];

for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8'));
    const body = data.body || '';
    const stripped = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = stripped.split(/\s+/).length;

    // Check word count
    if (words < 1200 || words > 2500) {
      issues.push({ slug: data.slug, issue: `word-count:${words}` });
    }

    // Check for em-dashes
    if (body.includes('\u2014')) {
      issues.push({ slug: data.slug, issue: 'em-dash' });
    }

    // Check Amazon links
    const amazonLinks = (body.match(/amazon\.com\/dp\/[A-Za-z0-9]{10}/g) || []).length;
    if (amazonLinks < 3) {
      issues.push({ slug: data.slug, issue: `amazon-links:${amazonLinks}` });
    }
  } catch (err) {
    console.error(`[refresh-monthly] Error processing ${file}:`, err.message);
  }
}

console.log(`[refresh-monthly] Audited ${files.length} articles, found ${issues.length} issues`);
if (issues.length > 0) {
  console.log('[refresh-monthly] Issues:', JSON.stringify(issues.slice(0, 20)));
}
console.log('[refresh-monthly] Done at', new Date().toISOString());
