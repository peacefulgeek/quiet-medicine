// ─── PRODUCT SPOTLIGHT GENERATOR ───
// Runs Saturday 08:00 UTC — generates 1 product spotlight, publishes directly
// Uses DeepSeek V4-Pro via OpenAI SDK

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.join(__dirname, '..', 'content', 'articles');

// ─── FEATURE FLAG ───
const AUTO_GEN_ENABLED = process.env.AUTO_GEN_ENABLED === 'true';

// ─── DEEPSEEK V4-PRO CLIENT ───
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
});
const MODEL = process.env.OPENAI_MODEL || 'deepseek-v4-pro';

// ─── GIT ───
const GH_PAT = process.env.GH_PAT;
const GITHUB_REPO = 'peacefulgeek/quiet-medicine';

// ─── BUNNY CDN (HARDCODED) ───
const BUNNY_STORAGE_ZONE = 'quiet-medicine';
const BUNNY_API_KEY = '4675df05-785b-4fca-a9e84e666981-5a5c-430d';
const BUNNY_PULL_ZONE = 'https://quiet-medicine.b-cdn.net';
const BUNNY_HOSTNAME = 'ny.storage.bunnycdn.com';

// ─── CONFIG ───
const AMAZON_TAG = 'spankyspinola-20';
const AUTHOR_LINK = 'https://kalesh.love';

// ─── VERIFIED ASIN POOL ───
const ASIN_POOL = [
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

// ─── PAUL VOICE GATE ───
const BANNED_WORDS = /\b(utilize|delve|tapestry|landscape|paradigm|synergy|leverage|unlock|empower|pivotal|embark|underscore|paramount|seamlessly|robust|beacon|foster|elevate|curate|curated|bespoke|resonate|harness|intricate|plethora|myriad|groundbreaking|innovative|cutting-edge|state-of-the-art|game-changer|ever-evolving|rapidly-evolving|stakeholders|navigate|ecosystem|framework|comprehensive|transformative|holistic|nuanced|multifaceted|profound|furthermore)\b/gi;

const BANNED_PHRASES = [
  "it's important to note that",
  "it's worth noting that",
  "in conclusion",
  "in summary",
  "a holistic approach",
  "in the realm of",
  "dive deep into",
  "at the end of the day",
  "in today's fast-paced world",
  "plays a crucial role",
];

function runPaulVoiceGate(text) {
  const failures = [];
  const wordMatches = text.match(BANNED_WORDS);
  if (wordMatches) failures.push(`banned-words: ${[...new Set(wordMatches.map(w => w.toLowerCase()))].join(', ')}`);
  const lowerText = text.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lowerText.includes(phrase.toLowerCase())) failures.push(`banned-phrase: "${phrase}"`);
  }
  let cleaned = text.replace(/\u2014/g, ' - ').replace(/\u2013/g, ' - ');
  if (cleaned !== text) text = cleaned;
  const words = text.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
  if (words < 1200) failures.push(`word-count-too-low: ${words}`);
  if (words > 2500) failures.push(`word-count-too-high: ${words}`);
  const amazonLinks = (text.match(/amazon\.com\/dp\/[A-Z0-9]{10}/g) || []).length;
  if (amazonLinks < 3 || amazonLinks > 4) failures.push(`amazon-links: ${amazonLinks} (need 3-4)`);
  return { passed: failures.length === 0, failures, wordCount: words, amazonLinks, text };
}

// ─── BUNNY CDN IMAGE LIBRARY ───
async function assignHeroImage(slug) {
  const sourceFile = `lib-${String(Math.floor(Math.random() * 40) + 1).padStart(2, '0')}.webp`;
  const destFile = `${slug}.webp`;
  try {
    const sourceUrl = `${BUNNY_PULL_ZONE}/library/${sourceFile}`;
    const downloadRes = await fetch(sourceUrl);
    if (!downloadRes.ok) throw new Error('Download failed');
    const imageBuffer = await downloadRes.arrayBuffer();
    const uploadUrl = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/images/${destFile}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'AccessKey': BUNNY_API_KEY, 'Content-Type': 'image/webp' },
      body: imageBuffer,
    });
    if (!uploadRes.ok) throw new Error('Upload failed');
    return `${BUNNY_PULL_ZONE}/images/${destFile}`;
  } catch (err) {
    return `${BUNNY_PULL_ZONE}/library/${sourceFile}`;
  }
}

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

function buildSpotlightPrompt(primary, related) {
  const allProducts = [primary, ...related];
  const asinList = allProducts.map(p =>
    `  ASIN: ${p.asin} — "${p.name}" → <a href="https://www.amazon.com/dp/${p.asin}?tag=${AMAZON_TAG}" target="_blank" rel="nofollow sponsored">${p.name} (paid link)</a>`
  ).join('\n');

  return `You are Kalesh, a consciousness teacher and writer at The Quiet Medicine.

Write a product spotlight/review article about: "${primary.name}"
This is a genuine, experience-based review that helps readers decide if this product supports their psychedelic wellness practice.

VOICE:
- Direct address ("you") throughout
- Contractions everywhere (don't, can't, it's, you're)
- 2-3 conversational markers: "Right?!", "Know what I mean?", "Here's the thing,", "Honestly,"
- Concrete specifics. Real scenarios. Real use cases.
- Vary sentence length aggressively.

FORMAT:
- Full HTML article body only (no wrapper tags)
- Use <h2>, <h3>, <p>, <ul>, <li> tags
- 1,400 to 2,000 words
- Include 3 or 4 Amazon affiliate links (primary + related products):
${asinList}
- Include 1 link to ${AUTHOR_LINK}
- End with disclaimer card

HARD RULES:
- Zero em-dashes (— or –). Use commas, periods, colons instead.
- NEVER use: utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore
- NEVER use: "it's important to note that", "in conclusion", "in summary", "a holistic approach", "in the realm of", "dive deep into", "at the end of the day", "in today's fast-paced world", "plays a crucial role"

Output ONLY the HTML. No preamble. No code fences.`;
}

async function main() {
  if (!AUTO_GEN_ENABLED) {
    console.log('[spotlight] AUTO_GEN_ENABLED is false. Exiting.');
    process.exit(0);
  }
  if (!process.env.OPENAI_API_KEY) {
    console.error('[spotlight] Missing OPENAI_API_KEY. Exiting.');
    process.exit(1);
  }

  // Pick a product not recently spotlighted
  const existingSlugs = new Set(fs.readdirSync(contentDir).map(f => f.replace('.json', '')));
  const shuffled = [...ASIN_POOL].sort(() => Math.random() - 0.5);
  const primary = shuffled[0];
  const related = shuffled.slice(1, 4);

  console.log(`[spotlight] Generating spotlight for: ${primary.name}`);

  const MAX_ATTEMPTS = 4;
  let body = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`[spotlight] Attempt ${attempt}/${MAX_ATTEMPTS}`);
    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: buildSpotlightPrompt(primary, related) }],
        temperature: 0.72,
      });
      let text = response.choices[0].message.content || '';
      text = text.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim();
      const gate = runPaulVoiceGate(text);
      if (gate.passed) {
        console.log(`[spotlight] PASSED (words: ${gate.wordCount}, amazon: ${gate.amazonLinks})`);
        body = gate.text;
        break;
      }
      console.warn(`[spotlight] FAILED:`, gate.failures);
    } catch (err) {
      console.error(`[spotlight] API error:`, err.message);
    }
  }

  if (!body) {
    console.error('[spotlight] ABANDONED. Exiting.');
    process.exit(1);
  }

  const slug = slugify(`spotlight-${primary.name}`);
  const heroUrl = await assignHeroImage(slug);

  const article = {
    slug,
    title: `Product Spotlight: ${primary.name}`,
    categorySlug: 'the-microdose',
    categoryName: 'The Microdose',
    dateISO: new Date().toISOString(),
    body,
    excerpt: body.replace(/<[^>]+>/g, ' ').slice(0, 200).trim() + '...',
    heroImage: heroUrl,
    ogImage: heroUrl,
    heroAlt: `${primary.name} product review`,
    readingTime: Math.ceil(body.replace(/<[^>]+>/g, ' ').split(/\s+/).length / 250),
    status: 'published',
    published_at: new Date().toISOString(),
    publishDate: new Date().toISOString().split('T')[0],
    wordCount: body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 0).length,
  };

  fs.writeFileSync(path.join(contentDir, `${slug}.json`), JSON.stringify(article, null, 2));
  console.log(`[spotlight] Published: ${slug}`);

  // Git push
  if (GH_PAT) {
    const { execSync } = await import('child_process');
    try {
      execSync('git add -A', { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      execSync(`git commit -m "Spotlight: ${primary.name}"`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      execSync(`git push https://${GH_PAT}@github.com/${GITHUB_REPO}.git main`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
      console.log('[spotlight] Pushed to GitHub.');
    } catch (err) {
      console.warn('[spotlight] Git push failed:', err.message);
    }
  }
}

main().catch(err => {
  console.error('[spotlight] Fatal:', err);
  process.exit(1);
});
