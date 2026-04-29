// ─── PAUL VOICE GATE (NON-NEGOTIABLE) ───
// Every article must pass. If it fails, regenerate (up to 4 attempts).
// Do not store failed articles.

// 1. Banned Words (regex, case-insensitive)
const BANNED_WORDS = [
  'utilize', 'delve', 'tapestry', 'landscape', 'paradigm', 'synergy', 'leverage',
  'unlock', 'empower', 'pivotal', 'embark', 'underscore', 'paramount', 'seamlessly',
  'robust', 'beacon', 'foster', 'elevate', 'curate', 'curated', 'bespoke', 'resonate',
  'harness', 'intricate', 'plethora', 'myriad', 'groundbreaking', 'innovative',
  'cutting-edge', 'state-of-the-art', 'game-changer', 'ever-evolving', 'rapidly-evolving',
  'stakeholders', 'navigate', 'ecosystem', 'framework', 'comprehensive', 'transformative',
  'holistic', 'nuanced', 'multifaceted', 'profound', 'furthermore'
];

// 2. Banned Phrases (string match, case-insensitive)
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
  "plays a crucial role"
];

export function countWords(text) {
  const stripped = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return stripped ? stripped.split(/\s+/).length : 0;
}

export function countAmazonLinks(text) {
  return (text.match(/amazon\.com\/dp\/[A-Z0-9]{10}/gi) || []).length;
}

export function extractAsinsFromText(text) {
  return [...new Set((text.match(/amazon\.com\/dp\/([A-Z0-9]{10})/gi) || []).map(m => m.slice(-10)))];
}

/**
 * Run the Paul Voice Gate.
 * Returns { passed, failures, wordCount, amazonLinks, text }
 * `text` is the em-dash-cleaned version.
 */
export function runQualityGate(articleBody) {
  const failures = [];

  // 1. Banned words
  const bannedRegex = new RegExp(`\\b(${BANNED_WORDS.join('|')})\\b`, 'gi');
  const wordMatches = articleBody.match(bannedRegex);
  if (wordMatches) {
    const unique = [...new Set(wordMatches.map(w => w.toLowerCase()))];
    failures.push(`banned-words: ${unique.join(', ')}`);
  }

  // 2. Banned phrases
  const lowerText = articleBody.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lowerText.includes(phrase.toLowerCase())) {
      failures.push(`banned-phrase: "${phrase}"`);
    }
  }

  // 3. Em-dashes: auto-replace then verify
  articleBody = articleBody.replace(/\u2014/g, ' - ').replace(/\u2013/g, ' - ');
  if (/[\u2014\u2013]/.test(articleBody)) {
    failures.push('em-dash-survived');
  }

  // 4. Word count (1,200 floor, 2,500 ceiling)
  const words = countWords(articleBody);
  if (words < 1200) failures.push(`word-count-too-low: ${words}`);
  if (words > 2500) failures.push(`word-count-too-high: ${words}`);

  // 5. Amazon affiliate links (exactly 3 or 4)
  const amazonLinks = countAmazonLinks(articleBody);
  if (amazonLinks < 3 || amazonLinks > 4) {
    failures.push(`amazon-links: ${amazonLinks} (need 3-4)`);
  }

  return {
    passed: failures.length === 0,
    failures,
    wordCount: words,
    amazonLinks,
    asins: extractAsinsFromText(articleBody),
    text: articleBody
  };
}

export { BANNED_WORDS, BANNED_PHRASES };
