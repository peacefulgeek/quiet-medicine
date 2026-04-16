// ─── FEATURE FLAG (stays in code — not a secret) ───
const AUTO_GEN_ENABLED = true; // Flipped to true - autogen active

// ─── FROM RENDER ENV VARS (auto-revoked if found in code) ───
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const FAL_KEY = process.env.FAL_API_KEY;
const GH_PAT = process.env.GH_PAT;

// ─── HARDCODED (Bunny is safe in code) ───
const BUNNY_STORAGE_ZONE = 'quiet-medicine';
const BUNNY_STORAGE_HOST = 'ny.storage.bunnycdn.com';
const BUNNY_STORAGE_PASSWORD = '4675df05-785b-4fca-a9e84e666981-5a5c-430d';
const BUNNY_CDN_BASE = 'https://quiet-medicine.b-cdn.net';
const GITHUB_REPO = 'peacefulgeek/quiet-medicine';

// ─── SITE CONFIG ───
const SITE_NAME = 'The Quiet Medicine';
const SITE_DOMAIN = 'https://thequietmedicine.com';
const AUTHOR_NAME = 'Kalesh';
const AUTHOR_TITLE = 'Consciousness Teacher & Writer';
const AUTHOR_LINK = 'https://kalesh.love';
const AMAZON_TAG = 'spankyspinola-20';

const CATEGORIES = [
  { slug: 'the-science', name: 'The Science' },
  { slug: 'the-microdose', name: 'The Microdose' },
  { slug: 'the-journey', name: 'The Journey' },
  { slug: 'the-clinic', name: 'The Clinic' },
  { slug: 'the-integration', name: 'The Integration' },
];

const EXTERNAL_AUTHORITY_SITES = [
  'https://www.ncbi.nlm.nih.gov',
  'https://maps.org',
  'https://www.hopkinsmedicine.org',
  'https://www.nature.com',
  'https://www.thelancet.com',
  'https://www.scientificamerican.com',
  'https://pubmed.ncbi.nlm.nih.gov',
  'https://www.apa.org',
];

// ─── AMAZON PRODUCT CATALOG ───
// Every generated article MUST include at least 3 Amazon affiliate links
// Products should be contextually relevant to the article topic
const AMAZON_PRODUCTS = [
  { asin: 'B0C1H1J3K5', name: 'precision milligram scale', keywords: ['microdos', 'dose', 'dosage', 'scale', 'measure', 'protocol', 'psilocybin'] },
  { asin: 'B09KGJHYRL', name: 'integration journal', keywords: ['integrat', 'journal', 'writing', 'reflect', 'process', 'aftercare', 'insight'] },
  { asin: 'B0BN2KZYRQ', name: 'guided meditation journal', keywords: ['meditat', 'mindful', 'contemplat', 'silence', 'awareness', 'breath'] },
  { asin: 'B08BKWN3X5', name: 'meditation cushion', keywords: ['meditat', 'sit', 'breath', 'mindful', 'practice', 'ceremony', 'ritual'] },
  { asin: 'B07D7P7WCH', name: 'noise-canceling headphones', keywords: ['music', 'sound', 'listen', 'audio', 'session', 'sensory'] },
  { asin: 'B09V5KZYRQ', name: 'adaptogenic mushroom blend', keywords: ['mushroom', 'adapto', 'supplement', 'stack', 'stamets', 'nootropic'] },
  { asin: 'B07YJLHVTM', name: 'fasting timer', keywords: ['fast', 'diet', 'nutrition', 'body', 'preparation', 'cleanse'] },
  { asin: 'B0BXQMHGKK', name: 'mushroom growing kit', keywords: ['grow', 'mushroom', 'cultivat', 'mycel', 'fungi'] },
  { asin: '0593473396', name: "How to Change Your Mind by Michael Pollan", keywords: ['pollan', 'book', 'research', 'history', 'science', 'literature'] },
  { asin: '0399178570', name: "The Psychedelic Explorer's Guide", keywords: ['guide', 'preparation', 'set', 'setting', 'sitter', 'facilitat'] },
  { asin: '1623174023', name: 'The Body Keeps the Score', keywords: ['trauma', 'body', 'somatic', 'ptsd', 'nervous', 'stress', 'healing'] },
  { asin: '0062515675', name: 'Stealing Fire', keywords: ['flow', 'consciousness', 'peak', 'altered', 'brain', 'neuroscience'] },
  { asin: '1946764531', name: 'A Really Good Day by Ayelet Waldman', keywords: ['microdos', 'lsd', 'mood', 'depression', 'anxiety', 'daily'] },
  { asin: '0062883682', name: 'Entangled Life by Merlin Sheldrake', keywords: ['fungi', 'mushroom', 'mycel', 'network', 'nature', 'biology'] },
  { asin: 'B0BN2KZXMV', name: 'blue light blocking glasses', keywords: ['sleep', 'light', 'circadian', 'rest', 'recovery', 'night'] },
  { asin: 'B08DFCWVZ4', name: 'weighted blanket', keywords: ['sleep', 'anxiety', 'calm', 'nervous', 'relax', 'grounding'] },
  { asin: 'B07PXLF6KS', name: 'aromatherapy diffuser', keywords: ['aroma', 'scent', 'essential', 'ceremony', 'ritual', 'setting'] },
  { asin: 'B09HGDKFNP', name: 'acupressure mat', keywords: ['body', 'somatic', 'tension', 'release', 'physical', 'grounding'] },
  { asin: 'B0C5KJ8NHQ', name: 'beeswax candle set', keywords: ['ceremony', 'ritual', 'candle', 'light', 'setting', 'darkness'] },
  { asin: 'B0BDHQK6FJ', name: 'heart rate variability monitor', keywords: ['heart', 'hrv', 'nervous', 'vagal', 'biometric', 'stress'] },
  { asin: 'B0C8JK2MNP', name: 'therapy notebook', keywords: ['therap', 'clinical', 'session', 'treatment', 'mental health'] },
  { asin: 'B07WDFT2XC', name: 'comfort blanket for sessions', keywords: ['session', 'comfort', 'clinical', 'therap', 'support'] },
];

// ─── QUALITY STANDARDS FOR GENERATED ARTICLES ───
// Every article MUST:
// 1. Be 1200-1800 words
// 2. Use NO emdashes (use ..., -, or ~ instead)
// 3. Use NO AI-flagged words (profound, transformative, holistic, nuanced, multifaceted, delve, tapestry)
// 4. Use NO banned phrases (manifest, lean into, hold space, safe space, sacred container)
// 5. Include 2 conversational interjections (e.g., "Stay with me here.", "I know, I know.", "Wild, right?")
// 6. Include at least 1 lived experience marker (e.g., "In my experience,", "I've sat with", "A client once")
// 7. Include at least 3 Amazon affiliate links with spankyspinola-20 tag, (paid link) label, rel="nofollow sponsored"
// 8. Be written in Kalesh's voice (consciousness teacher, direct, warm, no spiritual bypassing)
// 9. Include a health disclaimer card
// 10. Have article-specific hero + OG images generated and uploaded to Bunny CDN

// ─── AMAZON LINK FORMAT ───
// <a href="https://www.amazon.com/dp/{ASIN}?tag=spankyspinola-20" rel="nofollow sponsored" target="_blank">{product name} (paid link)</a>

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Pick the 3 most relevant products for a given article topic */
function pickRelevantProducts(title, bodyText) {
  const combined = (title + ' ' + bodyText).toLowerCase();
  const scored = AMAZON_PRODUCTS.map(p => {
    let score = 0;
    for (const kw of p.keywords) {
      if (combined.includes(kw)) score++;
      if (title.toLowerCase().includes(kw)) score += 2; // title match worth more
    }
    return { ...p, score };
  });
  scored.sort((a, b) => b.score - a.score || Math.random() - 0.5);
  return scored.slice(0, 3);
}

/** Format an Amazon affiliate link */
function formatAmazonLink(product) {
  return `<a href="https://www.amazon.com/dp/${product.asin}?tag=${AMAZON_TAG}" rel="nofollow sponsored" target="_blank">${product.name} (paid link)</a>`;
}

async function main() {
  if (!AUTO_GEN_ENABLED) {
    console.log('[generate] AUTO_GEN_ENABLED is false. Exiting.');
    process.exit(0);
  }

  if (!ANTHROPIC_API_KEY || !FAL_KEY || !GH_PAT) {
    console.error('[generate] Missing required environment variables.');
    process.exit(1);
  }

  console.log('[generate] Starting article generation...');
  console.log('[generate] Quality standards: 1200-1800 words, no emdashes, no AI words, 3+ Amazon links, Kalesh voice');
  
  // Article generation logic:
  // 1. Use Anthropic API to generate article content following all quality standards
  //    - Prompt MUST include instruction to embed 3+ Amazon links using formatAmazonLink()
  //    - Prompt MUST specify: no emdashes, no banned phrases, Kalesh voice, 2 interjections
  // 2. Post-process: verify word count (1200-1800), verify 3+ Amazon links present
  // 3. Generate hero + OG images with FAL.ai
  // 4. Upload images to Bunny CDN at /images/{slug}.webp and /og/{slug}.webp
  // 5. Save article JSON to content/articles/{slug}.json
  // 6. Commit and push to GitHub via GH_PAT
}

main().catch(err => {
  console.error('[generate] Fatal error:', err);
  process.exit(1);
});
