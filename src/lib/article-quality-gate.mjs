/**
 * Article Quality Gate
 * ────────────────────
 * Every article must pass ALL checks before storage.
 * Enforces word count, Amazon links, em-dash ban, AI-flagged words/phrases,
 * and voice signals (contractions, sentence variance, conversational markers).
 */

import { countAmazonLinks, extractAsinsFromText } from './amazon-verify.mjs';

// Words that flag content as AI-generated. Pulled from public AI-detection research
// (Originality.ai, GPTZero, Copyleaks) and Google's Helpful Content Update patterns.
const AI_FLAGGED_WORDS = [
  // The classic AI tells
  'delve', 'tapestry', 'paradigm', 'synergy', 'leverage', 'unlock', 'empower',
  'utilize', 'pivotal', 'embark', 'underscore', 'paramount', 'seamlessly',
  'robust', 'beacon', 'foster', 'elevate', 'curate', 'curated', 'bespoke',
  'resonate', 'harness', 'intricate', 'plethora', 'myriad', 'comprehensive',
  // Marketing fluff that AI loves
  'transformative', 'groundbreaking', 'innovative', 'cutting-edge', 'revolutionary',
  'state-of-the-art', 'ever-evolving', 'game-changing', 'next-level', 'world-class',
  'unparalleled', 'unprecedented', 'remarkable', 'extraordinary', 'exceptional',
  // Abstract filler
  'profound', 'holistic', 'nuanced', 'multifaceted', 'stakeholders',
  'ecosystem', 'landscape', 'realm', 'sphere', 'domain',
  // AI hedging
  'arguably', 'notably', 'crucially', 'importantly', 'essentially',
  'fundamentally', 'inherently', 'intrinsically', 'substantively',
  // Bullshit verbs
  'streamline', 'optimize', 'facilitate', 'amplify', 'catalyze',
  'propel', 'spearhead', 'orchestrate', 'navigate', 'traverse',
  // AI-favorite connectors
  'furthermore', 'moreover', 'additionally', 'consequently', 'subsequently',
  'thereby', 'thusly', 'wherein', 'whereby'
];

// Phrases that scream AI even if the words are fine in isolation
const AI_FLAGGED_PHRASES = [
  "it's important to note that",
  "it's worth noting that",
  "it's worth mentioning",
  "it's crucial to",
  "it is essential to",
  "in conclusion,",
  "in summary,",
  "to summarize,",
  "a holistic approach",
  "unlock your potential",
  "unlock the power",
  "in the realm of",
  "in the world of",
  "dive deep into",
  "dive into",
  "delve into",
  "at the end of the day",
  "in today's fast-paced world",
  "in today's digital age",
  "in today's modern world",
  "in this digital age",
  "when it comes to",
  "navigate the complexities",
  "a testament to",
  "speaks volumes",
  "the power of",
  "the beauty of",
  "the art of",
  "the journey of",
  "the key lies in",
  "plays a crucial role",
  "plays a vital role",
  "plays a significant role",
  "plays a pivotal role",
  "a wide array of",
  "a wide range of",
  "a plethora of",
  "a myriad of",
  "stands as a",
  "serves as a",
  "acts as a",
  "has emerged as",
  "continues to evolve",
  "has revolutionized",
  "cannot be overstated",
  "it goes without saying",
  "needless to say",
  "last but not least",
  "first and foremost"
];

export { AI_FLAGGED_WORDS, AI_FLAGGED_PHRASES };

export function countWords(text) {
  const stripped = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return stripped ? stripped.split(/\s+/).length : 0;
}

export function hasEmDash(text) {
  return text.includes('\u2014');  // em-dash U+2014
}

export function findFlaggedWords(text) {
  const stripped = text.replace(/<[^>]+>/g, ' ').toLowerCase();
  const found = [];
  for (const w of AI_FLAGGED_WORDS) {
    if (new RegExp(`\\b${w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(stripped)) {
      found.push(w);
    }
  }
  return found;
}

export function findFlaggedPhrases(text) {
  const stripped = text.replace(/<[^>]+>/g, ' ').toLowerCase().replace(/\s+/g, ' ');
  return AI_FLAGGED_PHRASES.filter(p => stripped.includes(p));
}

export function voiceSignals(text) {
  const stripped = text.replace(/<[^>]+>/g, ' ');
  const lower = stripped.toLowerCase();

  // Contractions (you're, don't, it's, can't, etc.)
  const contractions = (lower.match(/\b\w+'(s|re|ve|d|ll|m|t)\b/g) || []).length;

  // Direct address (you, your, you're)
  const directAddress = (lower.match(/\byou('re|r|rself|)?\b/g) || []).length;

  // First person singular (I, I'm, I've, my, me)
  const firstPerson = (lower.match(/\b(i|i'm|i've|i'd|i'll|my|me|mine)\b/g) || []).length;

  // Sentence length variance
  const sentences = stripped.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const avg = lengths.reduce((a, b) => a + b, 0) / (lengths.length || 1);
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / (lengths.length || 1);
  const stdDev = Math.sqrt(variance);
  const shortSentences = lengths.filter(l => l <= 6).length;
  const longSentences = lengths.filter(l => l >= 25).length;

  // Conversational markers
  const conversationalMarkers = [
    /\bhere's the thing\b/i, /\blook,\s/i, /\bhonestly,?\s/i, /\btruth is\b/i,
    /\bthe truth\b/i, /\bi'll tell you\b/i, /\bthink about it\b/i,
    /\bthat said\b/i, /\bbut here's\b/i, /\bso yeah\b/i, /\bkind of\b/i,
    /\bsort of\b/i, /\byou know\b/i
  ];
  const markerCount = conversationalMarkers.filter(r => r.test(stripped)).length;

  return {
    contractions,
    directAddress,
    firstPerson,
    sentenceCount: sentences.length,
    avgSentenceLength: +avg.toFixed(1),
    sentenceStdDev: +stdDev.toFixed(1),
    shortSentences,
    longSentences,
    conversationalMarkers: markerCount
  };
}

export function runQualityGate(body) {
  const failures = [];
  const warnings = [];

  // Word count
  const words = countWords(body);
  if (words < 1200) failures.push(`words-too-low:${words}`);
  if (words > 2500) failures.push(`words-too-high:${words}`);

  // Amazon links
  const links = countAmazonLinks(body);
  if (links < 3) failures.push(`amazon-links-too-few:${links}`);
  if (links > 4) warnings.push(`amazon-links-high:${links}`);

  // Em-dash
  if (hasEmDash(body)) failures.push('contains-em-dash');

  // AI-flagged words
  const bw = findFlaggedWords(body);
  if (bw.length > 0) failures.push(`ai-flagged-words:${bw.join(',')}`);

  // AI-flagged phrases
  const bp = findFlaggedPhrases(body);
  if (bp.length > 0) failures.push(`ai-flagged-phrases:${bp.join('|')}`);

  // Voice signals
  const voice = voiceSignals(body);
  const per1k = (n) => (n / words) * 1000;

  // Contractions: at least 4 per 1000 words
  if (per1k(voice.contractions) < 4) {
    warnings.push(`contractions-low:${voice.contractions}(${per1k(voice.contractions).toFixed(1)}/1k)`);
  }

  // Direct address OR first person must be present
  if (voice.directAddress === 0 && voice.firstPerson === 0) {
    warnings.push('no-direct-address-or-first-person');
  }

  // Sentence length variance
  if (voice.sentenceStdDev < 4) {
    warnings.push(`sentence-variance-low:${voice.sentenceStdDev}`);
  }

  // Short sentences
  if (voice.shortSentences < 2) {
    warnings.push(`too-few-short-sentences:${voice.shortSentences}`);
  }

  // Conversational markers
  if (voice.conversationalMarkers < 2) {
    warnings.push(`conversational-markers-low:${voice.conversationalMarkers}`);
  }

  return {
    passed: failures.length === 0,
    failures,
    warnings,
    wordCount: words,
    amazonLinks: links,
    asins: extractAsinsFromText(body),
    voice
  };
}
