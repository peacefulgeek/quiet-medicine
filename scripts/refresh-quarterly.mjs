#!/usr/bin/env node
/**
 * Quarterly Content Refresh
 * ─────────────────────────
 * Deeper regeneration of underperforming articles.
 * Runs Jan/Apr/Jul/Oct 1st at 04:00 UTC.
 *
 * For flat-file sites: identifies articles with the most quality issues,
 * flags them for regeneration via the article generator.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'articles');

// Extended AI-flagged word list for quarterly deep audit
const AI_FLAGGED_WORDS = [
  'delve', 'tapestry', 'paradigm', 'synergy', 'leverage', 'unlock', 'empower',
  'utilize', 'pivotal', 'embark', 'underscore', 'paramount', 'seamlessly',
  'robust', 'beacon', 'foster', 'elevate', 'curate', 'curated', 'bespoke',
  'resonate', 'harness', 'intricate', 'plethora', 'myriad', 'comprehensive',
  'transformative', 'groundbreaking', 'innovative', 'cutting-edge', 'revolutionary',
  'state-of-the-art', 'ever-evolving', 'profound', 'holistic', 'nuanced',
  'multifaceted', 'stakeholders', 'ecosystem', 'furthermore', 'moreover',
  'additionally', 'consequently', 'subsequently', 'thereby', 'streamline',
  'optimize', 'facilitate', 'amplify', 'catalyze',
];

console.log('[refresh-quarterly] Starting quarterly deep audit at', new Date().toISOString());

const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));
const flagged = [];

for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8'));
    const body = data.body || '';
    const stripped = body.replace(/<[^>]+>/g, ' ').toLowerCase();
    const issues = [];

    // Check AI words
    for (const w of AI_FLAGGED_WORDS) {
      const re = new RegExp(`\\b${w}\\b`, 'i');
      if (re.test(stripped)) {
        issues.push(`ai-word:${w}`);
      }
    }

    // Check em-dashes
    if (body.includes('\u2014')) issues.push('em-dash');

    // Check word count
    const words = stripped.trim().split(/\s+/).length;
    if (words < 1200 || words > 2500) issues.push(`word-count:${words}`);

    // Check Amazon links
    const amazonLinks = (body.match(/amazon\.com\/dp\/[A-Za-z0-9]{10}/g) || []).length;
    if (amazonLinks < 3) issues.push(`amazon-links:${amazonLinks}`);

    if (issues.length > 0) {
      flagged.push({ slug: data.slug, score: issues.length, issues });
    }
  } catch (err) {
    console.error(`[refresh-quarterly] Error processing ${file}:`, err.message);
  }
}

// Sort by most issues first
flagged.sort((a, b) => b.score - a.score);

console.log(`[refresh-quarterly] Audited ${files.length} articles`);
console.log(`[refresh-quarterly] ${flagged.length} articles flagged for refresh`);
if (flagged.length > 0) {
  console.log('[refresh-quarterly] Top 10 worst:', JSON.stringify(flagged.slice(0, 10), null, 2));
}
console.log('[refresh-quarterly] Done at', new Date().toISOString());
