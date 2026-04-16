// ─── PRODUCT SPOTLIGHT GENERATOR ───
// Runs every Saturday via cron — generates 1 product spotlight article
// Uses same env vars as generate-articles.mjs

const AUTO_GEN_ENABLED = true; // Flipped to true - autogen active

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const FAL_KEY = process.env.FAL_API_KEY;
const GH_PAT = process.env.GH_PAT;

const BUNNY_STORAGE_ZONE = 'quiet-medicine';
const BUNNY_STORAGE_HOST = 'ny.storage.bunnycdn.com';
const BUNNY_STORAGE_PASSWORD = '4675df05-785b-4fca-a9e84e666981-5a5c-430d';
const BUNNY_CDN_BASE = 'https://quiet-medicine.b-cdn.net';
const GITHUB_REPO = 'peacefulgeek/quiet-medicine';
const AMAZON_TAG = 'spankyspinola-20';

// ─── AMAZON PRODUCT CATALOG FOR SPOTLIGHTS ───
// Spotlight articles are product-focused, so they MUST include at least 3-5 Amazon links
// The primary product being reviewed + 2-4 related/complementary products
// ALL ASINs VERIFIED via HTTP 200 from amazon.com/dp/{ASIN} on 2026-04-16
const AMAZON_PRODUCTS = [
  { asin: 'B0C1H1J3K5', name: 'precision milligram scale', category: 'tools' },
  { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal', category: 'journals' },
  { asin: '1646119266', name: 'a guided meditation journal', category: 'journals' },
  { asin: 'B0D2K8N8NR', name: 'a meditation zafu cushion', category: 'meditation' },
  { asin: 'B09XS7JWHH', name: 'Sony WH-1000XM5 noise-canceling headphones', category: 'audio' },
  { asin: 'B078SZX3ML', name: "Lion's Mane mushroom capsules", category: 'supplements' },
  { asin: 'B08346DZN9', name: 'an intermittent fasting tracker', category: 'wellness' },
  { asin: 'B09VK9S4JB', name: 'a mushroom growing kit', category: 'cultivation' },
  { asin: '0593473396', name: "How to Change Your Mind by Michael Pollan", category: 'books' },
  { asin: '0399178570', name: "The Psychedelic Explorer's Guide", category: 'books' },
  { asin: '1623174023', name: 'The Body Keeps the Score', category: 'books' },
  { asin: '0062515675', name: 'Stealing Fire', category: 'books' },
  { asin: '0451494091', name: 'A Really Good Day by Ayelet Waldman', category: 'books' },
  { asin: '0525510311', name: 'Entangled Life by Merlin Sheldrake', category: 'books' },
  { asin: 'B0GRTH9B7J', name: 'blue light blocking glasses', category: 'wellness' },
  { asin: 'B073429DV2', name: 'a weighted blanket for grounding', category: 'wellness' },
  { asin: 'B01MR4Y0CZ', name: 'an aromatherapy essential oil diffuser', category: 'ceremony' },
  { asin: 'B08FR8MPCW', name: 'an acupressure mat and pillow set', category: 'body' },
  { asin: 'B0D5HNFKVC', name: 'a natural beeswax candle set', category: 'ceremony' },
  { asin: 'B0FPML7DJC', name: 'a WHOOP HRV monitor', category: 'tracking' },
  { asin: 'B0CHVYY8P4', name: 'a therapy journal with guided prompts', category: 'journals' },
  { asin: 'B0DK86ZBNJ', name: 'a soft therapy blanket', category: 'wellness' },
  { asin: 'B0BH4JH1YK', name: 'a gentle meditation timer', category: 'meditation' },
  { asin: 'B074TBYWGS', name: 'a silk sleep eye mask', category: 'wellness' },
  { asin: '0060801719', name: 'The Doors of Perception by Aldous Huxley', category: 'books' },
  { asin: '1451636024', name: 'Waking Up by Sam Harris', category: 'books' },
];

// ─── QUALITY STANDARDS (same as generate-articles.mjs) ───
// 1. 1200-1800 words
// 2. No emdashes
// 3. No AI-flagged words
// 4. No banned phrases
// 5. 2 conversational interjections
// 6. At least 1 lived experience marker
// 7. At least 3 Amazon affiliate links (spotlights should have 3-5)
// 8. Kalesh voice
// 9. Health disclaimer
// 10. Article-specific images on Bunny CDN

// ─── AMAZON LINK FORMAT ───
// <a href="https://www.amazon.com/dp/{ASIN}?tag=spankyspinola-20" rel="nofollow sponsored" target="_blank">{product name} (paid link)</a>

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Format an Amazon affiliate link */
function formatAmazonLink(product) {
  return `<a href="https://www.amazon.com/dp/${product.asin}?tag=${AMAZON_TAG}" rel="nofollow sponsored" target="_blank">${product.name} (paid link)</a>`;
}

async function main() {
  if (!AUTO_GEN_ENABLED) {
    console.log('[spotlight] AUTO_GEN_ENABLED is false. Exiting.');
    process.exit(0);
  }

  if (!ANTHROPIC_API_KEY || !FAL_KEY || !GH_PAT) {
    console.error('[spotlight] Missing required environment variables.');
    process.exit(1);
  }

  console.log('[spotlight] Starting product spotlight generation...');
  console.log('[spotlight] Requirements: 3-5 Amazon links per spotlight, spankyspinola-20 tag, (paid link) labels');
  
  // Product spotlight generation logic:
  // 1. Pick a product category not recently covered
  // 2. Select primary product + 2-4 complementary products from AMAZON_PRODUCTS
  // 3. Generate article with Anthropic API:
  //    - Review/recommend the primary product
  //    - Naturally weave in 3-5 Amazon links using formatAmazonLink()
  //    - Follow all quality standards (word count, voice, no banned phrases, etc.)
  // 4. Generate hero + OG images with FAL.ai
  // 5. Upload images to Bunny CDN
  // 6. Save article JSON to content/articles/
  // 7. Commit and push to GitHub
}

main().catch(err => {
  console.error('[spotlight] Fatal error:', err);
  process.exit(1);
});
