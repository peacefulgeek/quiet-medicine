// ─── ARTICLE PUBLISHER / GENERATOR ───
// Queue-based: publishes from queue first, generates new if queue empty
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

// ─── BUNNY CDN (HARDCODED — safe in code) ───
const BUNNY_STORAGE_ZONE = 'quiet-medicine';
const BUNNY_API_KEY = '4675df05-785b-4fca-a9e84e666981-5a5c-430d';
const BUNNY_PULL_ZONE = 'https://quiet-medicine.b-cdn.net';
const BUNNY_HOSTNAME = 'ny.storage.bunnycdn.com';

// ─── SITE CONFIG ───
const SITE_NAME = 'The Quiet Medicine';
const SITE_DOMAIN = 'https://thequietmedicine.com';
const AUTHOR_NAME = 'Kalesh';
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

// ─── VERIFIED ASIN POOL ───
const ASIN_POOL = [
  { asin: 'B0885S1766', name: 'precision milligram scale' },
  { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal' },
  { asin: '1646119266', name: 'a guided meditation journal' },
  { asin: 'B0D2K8N8NR', name: 'a meditation zafu cushion' },
  { asin: 'B09XS7JWHH', name: 'Sony WH-1000XM5 noise-canceling headphones' },
  { asin: 'B078SZX3ML', name: "Lion's Mane mushroom capsules" },
  { asin: 'B08346DZN9', name: 'an intermittent fasting tracker' },
  { asin: 'B09VK9S4JB', name: 'a mushroom growing kit' },
  { asin: '0735224153', name: "How to Change Your Mind by Michael Pollan" },
  { asin: '1594774021', name: "The Psychedelic Explorer's Guide" },
  { asin: '0143127748', name: 'The Body Keeps the Score' },
  { asin: '0062429655', name: 'Stealing Fire' },
  { asin: '0451494091', name: 'A Really Good Day by Ayelet Waldman' },
  { asin: '0525510311', name: 'Entangled Life by Merlin Sheldrake' },
  { asin: 'B0GRTH9B7J', name: 'blue light blocking glasses' },
  { asin: 'B073429DV2', name: 'a weighted blanket for grounding' },
  { asin: 'B01MR4Y0CZ', name: 'an aromatherapy essential oil diffuser' },
  { asin: 'B08FR8MPCW', name: 'an acupressure mat and pillow set' },
  { asin: 'B0D5HNFKVC', name: 'a natural beeswax candle set' },
  { asin: 'B0FPML7DJC', name: 'a WHOOP HRV monitor' },
  { asin: 'B0CHVYY8P4', name: 'a therapy journal with guided prompts' },
  { asin: 'B0DK86ZBNJ', name: 'a soft therapy blanket' },
  { asin: 'B0FWQQGTST', name: 'a gentle meditation timer' },
  { asin: 'B074TBYWGS', name: 'a silk sleep eye mask' },
  { asin: '0060801719', name: 'The Doors of Perception by Aldous Huxley' },
  { asin: '1451636024', name: 'Waking Up by Sam Harris' },
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

  // 1. Banned words
  const wordMatches = text.match(BANNED_WORDS);
  if (wordMatches) failures.push(`banned-words: ${[...new Set(wordMatches.map(w => w.toLowerCase()))].join(', ')}`);

  // 2. Banned phrases
  const lowerText = text.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lowerText.includes(phrase.toLowerCase())) failures.push(`banned-phrase: "${phrase}"`);
  }

  // 3. Em-dashes (auto-replace first)
  let cleaned = text.replace(/\u2014/g, ' - ').replace(/\u2013/g, ' - ');
  if (cleaned !== text) {
    text = cleaned; // use cleaned version going forward
  }
  // If any survive after replacement (shouldn't happen, but check)
  if (/[\u2014\u2013]/.test(text)) failures.push('em-dash-survived');

  // 4. Word count
  const words = text.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
  if (words < 1200) failures.push(`word-count-too-low: ${words}`);
  if (words > 2500) failures.push(`word-count-too-high: ${words}`);

  // 5. Amazon links (exactly 3 or 4)
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
    console.warn(`[generate] Image assign failed for ${slug}: ${err.message}`);
    return `${BUNNY_PULL_ZONE}/library/${sourceFile}`;
  }
}

// ─── SLUG GENERATOR ───
function slugify(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

// ─── GENERATION PROMPT ───
function buildPrompt(topic, category) {
  const randomAsins = [...ASIN_POOL].sort(() => Math.random() - 0.5).slice(0, 4);
  const asinList = randomAsins.map(p =>
    `  ASIN: ${p.asin} — "${p.name}" → format as: <a href="https://www.amazon.com/dp/${p.asin}?tag=${AMAZON_TAG}" target="_blank" rel="nofollow sponsored">${p.name} (paid link)</a>`
  ).join('\n');

  return `You are Kalesh, a consciousness teacher and writer. You run The Quiet Medicine, a site about psychedelic wellness, microdosing, and conscious healing.

Write a complete article about: "${topic}"
Category: ${category.name}

VOICE:
- Direct address ("you") throughout
- Contractions everywhere (don't, can't, it's, you're, we'll)
- Compassionate but no spiritual bypassing
- 2-3 conversational dialogue markers: "Right?!", "Know what I mean?", "Does that land?", "How does that make you feel?", "Here's the thing,", "Honestly,", "Look,", "Truth is,"
- Concrete specifics over abstractions. A name. A number. A moment.
- Vary sentence length aggressively. Some fragments. Some long ones. Some just three words.

FORMAT:
- Full HTML article body (no <html>, <head>, <body> tags — just the article content)
- Use <h2>, <h3>, <p>, <ul>, <li>, <blockquote> tags
- 1,400 to 2,000 words
- Include 3 or 4 Amazon affiliate links naturally embedded in prose (use ONLY these):
${asinList}
- Include 1 internal link to another article on the site: <a href="/articles/[slug]">text</a>
- Include 1 external authority link from: ${EXTERNAL_AUTHORITY_SITES.slice(0, 3).join(', ')}
- Include 1 link to ${AUTHOR_LINK}
- End with a health disclaimer card: <div class="disclaimer-card"><p><strong>Disclaimer:</strong> This content is for educational purposes only...</p></div>

HARD RULES:
- Zero em-dashes (— or –). Use commas, periods, colons, or parentheses instead.
- NEVER use these words: utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, rapidly-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore
- NEVER use these phrases: "it's important to note that", "it's worth noting that", "in conclusion", "in summary", "a holistic approach", "in the realm of", "dive deep into", "at the end of the day", "in today's fast-paced world", "plays a crucial role"

Output ONLY the HTML article body. No preamble. No markdown. No code fences.`;
}

// ─── QUEUE MANAGEMENT ───
function getQueuedArticles() {
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));
  const queued = [];
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf8'));
      if (data.status === 'queued') queued.push({ file, data });
    } catch (e) { /* skip corrupted */ }
  }
  // Sort by queued_at (oldest first)
  queued.sort((a, b) => new Date(a.data.queued_at || 0) - new Date(b.data.queued_at || 0));
  return queued;
}

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

// ─── PUBLISH FROM QUEUE ───
async function publishFromQueue() {
  const queued = getQueuedArticles();
  if (queued.length === 0) return false;

  const { file, data } = queued[0];
  console.log(`[generate] Publishing from queue: ${data.slug}`);

  // Assign hero image from library
  const heroUrl = await assignHeroImage(data.slug);
  data.heroImage = heroUrl;
  data.ogImage = heroUrl;
  data.status = 'published';
  data.published_at = new Date().toISOString();
  data.publishDate = new Date().toISOString().split('T')[0];

  fs.writeFileSync(path.join(contentDir, file), JSON.stringify(data, null, 2));
  console.log(`[generate] Published: ${data.slug} (hero: ${heroUrl})`);

  await gitCommitAndPush(`Publish: ${data.title}`);
  return true;
}

// ─── GENERATE NEW ARTICLE ───
async function generateNewArticle(topic, category) {
  const MAX_ATTEMPTS = 4;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`[generate] Attempt ${attempt}/${MAX_ATTEMPTS}: "${topic}"`);

    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: buildPrompt(topic, category) }],
        temperature: 0.72,
      });

      let body = response.choices[0].message.content || '';
      // Strip code fences if present
      body = body.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim();

      const gate = runPaulVoiceGate(body);
      if (gate.passed) {
        console.log(`[generate] PASSED on attempt ${attempt} (words: ${gate.wordCount}, amazon: ${gate.amazonLinks})`);
        return gate.text; // return em-dash-cleaned version
      }

      console.warn(`[generate] FAILED attempt ${attempt}:`, gate.failures);
    } catch (err) {
      console.error(`[generate] API error attempt ${attempt}:`, err.message);
    }
  }

  console.error(`[generate] ABANDONED after ${MAX_ATTEMPTS} attempts: "${topic}"`);
  return null;
}

// ─── GIT COMMIT & PUSH ───
async function gitCommitAndPush(message) {
  if (!GH_PAT) {
    console.warn('[generate] No GH_PAT — skipping push');
    return;
  }

  const { execSync } = await import('child_process');
  try {
    execSync('git add -A', { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
    execSync(`git commit -m "${message}" --allow-empty`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
    execSync(`git push https://${GH_PAT}@github.com/${GITHUB_REPO}.git main`, { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
    console.log(`[generate] Pushed: ${message}`);
  } catch (err) {
    console.warn('[generate] Git push failed:', err.message);
  }
}

// ─── TOPIC PICKER (for when queue is empty) ───
const FALLBACK_TOPICS = [
  'The neuroscience of psilocybin and default mode network disruption',
  'How microdosing affects creativity and problem-solving',
  'Building a safe container for your first psychedelic experience',
  'Integration practices for the week after a ceremony',
  'The relationship between breathwork and psychedelic states',
  'Why set and setting matter more than dose',
  'Microdosing protocols compared: Fadiman vs Stamets vs intuitive',
  'The role of community in psychedelic healing',
  'Ketamine therapy: what the clinical research actually shows',
  'How trauma lives in the body and how psychedelics help release it',
];

function pickTopic() {
  // Check which topics have already been used
  const existingSlugs = new Set(fs.readdirSync(contentDir).map(f => f.replace('.json', '')));
  for (const topic of FALLBACK_TOPICS) {
    const slug = slugify(topic);
    if (!existingSlugs.has(slug)) return topic;
  }
  // If all used, pick random with date suffix
  const topic = FALLBACK_TOPICS[Math.floor(Math.random() * FALLBACK_TOPICS.length)];
  return `${topic} (${new Date().toISOString().split('T')[0]})`;
}

// ─── MAIN ───
async function main() {
  if (!AUTO_GEN_ENABLED) {
    console.log('[generate] AUTO_GEN_ENABLED is false. Exiting.');
    process.exit(0);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('[generate] Missing OPENAI_API_KEY. Exiting.');
    process.exit(1);
  }

  const publishedCount = getPublishedCount();
  console.log(`[generate] Published: ${publishedCount} | Queue check...`);

  // Try to publish from queue first
  const published = await publishFromQueue();
  if (published) {
    console.log('[generate] Published from queue. Done.');
    return;
  }

  // Queue empty — generate a new article
  console.log('[generate] Queue empty. Generating new article...');
  const topic = pickTopic();
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

  const body = await generateNewArticle(topic, category);
  if (!body) {
    console.error('[generate] Failed to generate. Exiting.');
    process.exit(1);
  }

  // Build article JSON
  const slug = slugify(topic);
  const heroUrl = await assignHeroImage(slug);

  const article = {
    slug,
    title: topic.replace(/\s*\(.*?\)\s*$/, ''), // strip date suffix if present
    categorySlug: category.slug,
    categoryName: category.name,
    dateISO: new Date().toISOString(),
    body,
    excerpt: body.replace(/<[^>]+>/g, ' ').slice(0, 200).trim() + '...',
    heroImage: heroUrl,
    ogImage: heroUrl,
    heroAlt: `Illustration for ${topic}`,
    readingTime: Math.ceil(body.replace(/<[^>]+>/g, ' ').split(/\s+/).length / 250),
    status: 'published',
    published_at: new Date().toISOString(),
    publishDate: new Date().toISOString().split('T')[0],
    wordCount: body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 0).length,
  };

  fs.writeFileSync(path.join(contentDir, `${slug}.json`), JSON.stringify(article, null, 2));
  console.log(`[generate] Saved: ${slug} (${article.wordCount} words)`);

  await gitCommitAndPush(`New article: ${article.title}`);
}

main().catch(err => {
  console.error('[generate] Fatal error:', err);
  process.exit(1);
});
