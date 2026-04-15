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

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  // Article generation logic would go here
  // Uses Anthropic API for content, FAL.ai for images, Bunny CDN for storage, GitHub for commits
}

main().catch(err => {
  console.error('[generate] Fatal error:', err);
  process.exit(1);
});
