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
  { asin: 'B0885S1766', name: 'precision milligram scale', category: 'tools' },
  { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal', category: 'journals' },
  { asin: '1646119266', name: 'a guided meditation journal', category: 'journals' },
  { asin: 'B0D2K8N8NR', name: 'a meditation zafu cushion', category: 'meditation' },
  { asin: 'B09XS7JWHH', name: 'Sony WH-1000XM5 noise-canceling headphones', category: 'audio' },
  { asin: 'B078SZX3ML', name: "Lion's Mane mushroom capsules", category: 'supplements' },
  { asin: 'B08346DZN9', name: 'an intermittent fasting tracker', category: 'wellness' },
  { asin: 'B09VK9S4JB', name: 'a mushroom growing kit', category: 'cultivation' },
  { asin: '0735224153', name: "How to Change Your Mind by Michael Pollan", category: 'books' },
  { asin: '1594774021', name: "The Psychedelic Explorer's Guide", category: 'books' },
  { asin: '0143127748', name: 'The Body Keeps the Score', category: 'books' },
  { asin: '0062429655', name: 'Stealing Fire', category: 'books' },
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
  { asin: 'B0FWQQGTST', name: 'a gentle meditation timer', category: 'meditation' },
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

// ─── HARD RULES (appended to every Anthropic generation prompt) ───
const HARD_RULES = `
HARD RULES for this article:
- 1,600 to 2,000 words (strict)
- Zero em-dashes. Use commas, periods, colons, or parentheses instead.
- Never use these words: delve, tapestry, paradigm, synergy, leverage, unlock, empower, utilize, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, comprehensive, transformative, groundbreaking, innovative, cutting-edge, revolutionary, state-of-the-art, ever-evolving, profound, holistic, nuanced, multifaceted, stakeholders, ecosystem, furthermore, moreover, additionally, consequently, subsequently, thereby, streamline, optimize, facilitate, amplify, catalyze, landscape, realm, sphere, domain, arguably, notably, crucially, importantly, essentially, fundamentally, inherently, intrinsically, substantively, propel, spearhead, orchestrate, navigate, traverse, thusly, wherein, whereby, remarkable, extraordinary, exceptional, unprecedented, unparalleled, game-changing, next-level, world-class.
- Never use these phrases: "it's important to note," "in conclusion," "in summary," "in the realm of," "dive deep into," "dive into," "delve into," "at the end of the day," "in today's fast-paced world," "plays a crucial role," "a testament to," "when it comes to," "cannot be overstated," "it goes without saying," "needless to say," "last but not least," "first and foremost," "the power of," "the beauty of," "the art of," "the journey of," "serves as a," "stands as a," "acts as a," "has emerged as," "continues to evolve," "speaks volumes."
- Contractions throughout. You're. Don't. It's. That's. I've. We'll.
- Vary sentence length aggressively. Some fragments. Some long ones that stretch across a full breath. Some just three words.
- Direct address ("you") throughout OR first-person ("I / my") throughout. Pick one.
- Include at least 2 conversational openers somewhere in the piece: "Here's the thing," "Honestly," "Look," "Truth is," "But here's what's interesting," "Think about it," "That said."
- Concrete specifics over abstractions. A name. A number. A moment.
- 3 to 5 Amazon product links embedded naturally in prose, each followed by "(paid link)" in plain text. Use only ASINs from the provided catalog.
- No em-dashes. No em-dashes. No em-dashes.
`;

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runQualityGate } from '../src/lib/article-quality-gate.mjs';

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
  console.log('[spotlight] Quality gate: 1200-2500 words, 0 em-dashes, 0 AI words, 3-5 Amazon links, voice signals');

  // ─── GENERATION WITH QUALITY GATE (3-attempt loop) ───
  async function generateSpotlightWithQualityGate(product, relatedProducts) {
    const MAX_ATTEMPTS = 3;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      console.log(`[spotlight] Attempt ${attempt}/${MAX_ATTEMPTS} for: ${product.name}`);

      // TODO: Call Anthropic API with HARD_RULES appended to prompt
      // const body = await callAnthropic(product, relatedProducts, HARD_RULES);
      const body = ''; // placeholder until Anthropic call is wired

      const gate = runQualityGate(body);
      if (gate.passed) {
        console.log(`[spotlight] Quality gate PASSED on attempt ${attempt}`);
        console.log(`[spotlight]   Words: ${gate.wordCount}, Amazon: ${gate.amazonLinks}, Voice: contractions=${gate.voice.contractions}, stdDev=${gate.voice.sentenceStdDev}`);
        return body;
      }

      console.warn(`[spotlight] Quality gate FAILED attempt ${attempt}:`, gate.failures);
    }

    console.error(`[spotlight] ABANDONED after ${MAX_ATTEMPTS} failed attempts: ${product.name}`);
    return null; // never store a broken article
  }

  // TODO: Wire generateSpotlightWithQualityGate into the full pipeline
  // 1. Pick product category not recently covered
  // 2. Select primary + 2-4 complementary products
  // 3. const body = await generateSpotlightWithQualityGate(primary, related);
  // 4. if (!body) return; // abandoned
  // 5. Generate images with FAL.ai -> process through image-pipeline.mjs
  // 6. Save JSON, commit, push
}

main().catch(err => {
  console.error('[spotlight] Fatal error:', err);
  process.exit(1);
});
