import express from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const DIST = path.join(ROOT, 'dist/client');
const CONTENT = path.join(ROOT, 'content/articles');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── BUNNY CDN CONFIG ───
const BUNNY_STORAGE_ZONE = 'quiet-medicine';
const BUNNY_STORAGE_HOST = 'ny.storage.bunnycdn.com';
const BUNNY_STORAGE_PASSWORD = '4675df05-785b-4fca-a9e84e666981-5a5c-430d';
const BUNNY_CDN_BASE = 'https://quiet-medicine.b-cdn.net';

// ─── SITE CONFIG ───
const SITE = {
  title: 'The Quiet Medicine',
  subtitle: 'Microdosing, Psychedelics & Conscious Healing',
  tagline: 'The medicine is ancient. The science is catching up.',
  domain: 'https://thequietmedicine.com',
  author: 'The Quiet Medicine Editorial',
  advisorName: 'Kalesh',
  advisorTitle: 'Consciousness Teacher & Writer',
  advisorBio: 'Kalesh is a consciousness teacher and writer whose work explores the intersection of ancient contemplative traditions and modern neuroscience. With decades of practice in meditation, breathwork, and somatic inquiry, he guides others toward embodied awareness.',
  advisorLink: 'https://kalesh.love',
  categories: [
    { slug: 'the-science', name: 'The Science', icon: '&#9883;', color: '#7C4DFF' },
    { slug: 'the-microdose', name: 'The Microdose', icon: '&#10047;', color: '#00BFA5' },
    { slug: 'the-journey', name: 'The Journey', icon: '&#9790;', color: '#FF6D00' },
    { slug: 'the-clinic', name: 'The Clinic', icon: '&#9764;', color: '#2979FF' },
    { slug: 'the-integration', name: 'The Integration', icon: '&#10022;', color: '#E91E63' },
  ],
};

const CAT_DESCRIPTIONS = {
  'the-science': 'Evidence-based research on psychedelics, neuroscience, and the mechanisms behind conscious healing.',
  'the-microdose': 'Protocols, practices, and insights for microdosing psilocybin and other psychedelic compounds.',
  'the-journey': 'Navigating ceremonial experiences, macro-doses, and the deeper territories of psychedelic exploration.',
  'the-clinic': 'Legal psychedelic therapy, ketamine clinics, MDMA-assisted therapy, and clinical frameworks.',
  'the-integration': 'Making sense of psychedelic experiences and weaving insights into daily life and long-term growth.',
};

// ─── MIDDLEWARE ───
app.use(compression());
app.use((req, res, next) => {
  res.setHeader('X-AI-Content-Author', 'Kalesh');
  res.setHeader('X-AI-Content-Site', 'The Quiet Medicine');
  res.setHeader('X-AI-Identity-Endpoint', '/api/ai/identity');
  res.setHeader('X-AI-LLMs-Txt', '/llms.txt');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// ─── ARTICLE LOADING ───
function loadArticles() {
  if (!fs.existsSync(CONTENT)) return [];
  return fs.readdirSync(CONTENT).filter(f => f.endsWith('.json')).map(f => {
    try { return JSON.parse(fs.readFileSync(path.join(CONTENT, f), 'utf8')); } catch { return null; }
  }).filter(Boolean);
}
function filterPublished(articles) {
  const now = new Date();
  return articles.filter(a => {
    if (a.status === 'scheduled') return false;
    return a.status === 'published' || new Date(a.dateISO) <= now;
  }).sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO));
}
function getPublishedArticles() { return filterPublished(loadArticles()); }
function getArticlesByCategory(slug) { return getPublishedArticles().filter(a => a.categorySlug === slug); }
function escapeXml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function escapeHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
function getCatObj(slug) { return SITE.categories.find(c => c.slug === slug) || SITE.categories[0]; }

// ─── DESIGN SYSTEM ───
function css() {
  return `
    @font-face { font-family:'Newsreader'; src:url('${BUNNY_CDN_BASE}/fonts/Newsreader-VariableFont.woff2') format('woff2'); font-weight:300 800; font-style:normal; font-display:swap; }
    @font-face { font-family:'Inter'; src:url('${BUNNY_CDN_BASE}/fonts/Inter-VariableFont.woff2') format('woff2'); font-weight:300 700; font-style:normal; font-display:swap; }

    :root {
      --bg: #0D0B1A;
      --bg-card: #16132B;
      --bg-card-hover: #1E1A38;
      --bg-surface: #1A1730;
      --text: #E8E4F0;
      --text-dim: #9B95AD;
      --text-bright: #FFFFFF;
      --accent-1: #7C4DFF;
      --accent-2: #00E5FF;
      --accent-3: #FF6D00;
      --accent-4: #E91E63;
      --accent-gold: #FFD54F;
      --gradient-hero: linear-gradient(135deg, #0D0B1A 0%, #1A0A2E 30%, #16082A 60%, #0D0B1A 100%);
      --gradient-accent: linear-gradient(135deg, #7C4DFF, #00E5FF, #E91E63);
      --gradient-warm: linear-gradient(135deg, #FF6D00, #E91E63, #7C4DFF);
      --radius: 16px;
      --radius-sm: 8px;
      --shadow: 0 4px 24px rgba(0,0,0,0.4);
      --shadow-glow: 0 0 40px rgba(124,77,255,0.15);
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { scroll-behavior: smooth; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 17px;
      line-height: 1.7;
      color: var(--text);
      background: var(--bg);
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    h1, h2, h3, h4 { font-family: 'Newsreader', Georgia, serif; color: var(--text-bright); font-weight: 600; letter-spacing: -0.02em; }
    a { color: var(--accent-2); text-decoration: none; transition: color 0.2s, opacity 0.2s; }
    a:hover { color: var(--accent-gold); }
    ::selection { background: rgba(124,77,255,0.4); color: white; }

    /* ═══ NAVIGATION ═══ */
    .nav-wrap {
      position: sticky; top: 0; z-index: 100;
      background: rgba(13,11,26,0.85);
      backdrop-filter: blur(20px) saturate(1.5);
      -webkit-backdrop-filter: blur(20px) saturate(1.5);
      border-bottom: 1px solid rgba(124,77,255,0.15);
    }
    nav {
      display: flex; justify-content: space-between; align-items: center;
      max-width: 1200px; margin: 0 auto; padding: 16px 24px;
    }
    .logo {
      font-family: 'Newsreader', Georgia, serif; font-size: 22px; font-weight: 700;
      background: var(--gradient-accent); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text; text-decoration: none;
    }
    .nav-links { display: flex; gap: 28px; align-items: center; }
    .nav-links a { color: var(--text-dim); font-size: 15px; font-weight: 500; letter-spacing: 0.02em; text-transform: uppercase; }
    .nav-links a:hover { color: var(--text-bright); }
    .nav-cta {
      background: var(--accent-1); color: white !important; padding: 8px 20px;
      border-radius: 24px; font-size: 14px !important; font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(124,77,255,0.4); }

    /* ═══ HERO ═══ */
    .hero {
      position: relative; padding: 100px 24px 80px; text-align: center;
      background: var(--gradient-hero); overflow: hidden;
    }
    .hero::before {
      content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
      background: radial-gradient(ellipse at 30% 50%, rgba(124,77,255,0.08) 0%, transparent 50%),
                  radial-gradient(ellipse at 70% 30%, rgba(0,229,255,0.06) 0%, transparent 50%),
                  radial-gradient(ellipse at 50% 80%, rgba(233,30,99,0.05) 0%, transparent 50%);
      animation: heroFloat 20s ease-in-out infinite;
    }
    @keyframes heroFloat {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      33% { transform: translate(2%, -1%) rotate(1deg); }
      66% { transform: translate(-1%, 2%) rotate(-1deg); }
    }
    .hero-content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
    .hero h1 {
      font-size: clamp(36px, 6vw, 64px); line-height: 1.15; margin-bottom: 24px;
      background: linear-gradient(135deg, #FFFFFF 0%, #E8E4F0 50%, #C5B8E8 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .hero .tagline {
      font-family: 'Newsreader', Georgia, serif; font-size: clamp(18px, 2.5vw, 24px);
      color: var(--text-dim); font-style: italic; margin-bottom: 40px; line-height: 1.5;
    }
    .hero-cats {
      display: flex; flex-wrap: wrap; justify-content: center; gap: 12px;
    }
    .hero-cat {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 20px; border-radius: 24px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      color: var(--text); font-size: 14px; font-weight: 500;
      transition: all 0.3s; text-decoration: none;
    }
    .hero-cat:hover {
      background: rgba(124,77,255,0.15); border-color: rgba(124,77,255,0.4);
      color: var(--text-bright); transform: translateY(-2px);
    }
    .hero-cat .cat-icon { font-size: 18px; }

    /* ═══ CONTAINERS ═══ */
    .container { max-width: 760px; margin: 0 auto; padding: 0 24px; }
    .wide { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

    /* ═══ SECTION HEADERS ═══ */
    .section-head {
      display: flex; justify-content: space-between; align-items: baseline;
      margin-bottom: 32px; padding-bottom: 16px;
      border-bottom: 1px solid rgba(124,77,255,0.15);
    }
    .section-head h2 { font-size: 28px; }
    .section-head a { font-size: 14px; color: var(--accent-2); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }

    /* ═══ ARTICLE CARDS ═══ */
    .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 28px; }
    .card {
      background: var(--bg-card); border-radius: var(--radius); overflow: hidden;
      border: 1px solid rgba(255,255,255,0.06);
      transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
      display: flex; flex-direction: column;
    }
    .card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-glow);
      border-color: rgba(124,77,255,0.3);
    }
    .card-img-wrap {
      position: relative; overflow: hidden; aspect-ratio: 16/9;
    }
    .card-img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.5s;
    }
    .card:hover .card-img { transform: scale(1.05); }
    .card-cat-badge {
      position: absolute; top: 12px; left: 12px;
      padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
      background: rgba(13,11,26,0.7); backdrop-filter: blur(8px);
      color: var(--text-bright); letter-spacing: 0.03em; text-transform: uppercase;
    }
    .card-body { padding: 24px; flex: 1; display: flex; flex-direction: column; }
    .card-body h3 { font-size: 20px; line-height: 1.3; margin-bottom: 12px; }
    .card-body h3 a { color: var(--text-bright); }
    .card-body h3 a:hover { color: var(--accent-2); }
    .card-excerpt { color: var(--text-dim); font-size: 15px; line-height: 1.6; flex: 1; margin-bottom: 16px; }
    .card-meta { display: flex; gap: 12px; font-size: 13px; color: var(--text-dim); align-items: center; }
    .card-meta .dot { width: 3px; height: 3px; border-radius: 50%; background: var(--text-dim); }

    /* ═══ FEATURED CARD (large) ═══ */
    .featured {
      position: relative; border-radius: var(--radius); overflow: hidden;
      margin-bottom: 40px; min-height: 420px; display: flex; align-items: flex-end;
    }
    .featured-img {
      position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.5s;
    }
    .featured:hover .featured-img { transform: scale(1.03); }
    .featured-overlay {
      position: relative; z-index: 1; width: 100%;
      padding: 60px 40px 40px;
      background: linear-gradient(to top, rgba(13,11,26,0.95) 0%, rgba(13,11,26,0.6) 60%, transparent 100%);
    }
    .featured-overlay h2 { font-size: clamp(24px, 3.5vw, 36px); line-height: 1.2; margin-bottom: 12px; }
    .featured-overlay h2 a { color: white; }
    .featured-overlay h2 a:hover { color: var(--accent-2); }
    .featured-overlay .card-excerpt { margin-bottom: 12px; }

    /* ═══ ARTICLE LIST ═══ */
    .art-list-item {
      display: flex; gap: 20px; align-items: center;
      padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
      transition: background 0.2s;
    }
    .art-list-item:hover { background: rgba(124,77,255,0.04); }
    .art-list-thumb { width: 80px; height: 56px; border-radius: var(--radius-sm); object-fit: cover; flex-shrink: 0; }
    .art-list-info { flex: 1; }
    .art-list-info h3 { font-size: 17px; margin-bottom: 4px; }
    .art-list-info h3 a { color: var(--text-bright); }
    .art-list-info h3 a:hover { color: var(--accent-2); }
    .art-list-meta { font-size: 13px; color: var(--text-dim); display: flex; gap: 10px; flex-wrap: wrap; }
    .cat-pill {
      display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11px;
      font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
    }

    /* ═══ ARTICLE PAGE ═══ */
    .article-hero-wrap {
      position: relative; width: 100%; max-height: 560px; overflow: hidden;
    }
    .article-hero-img {
      width: 100%; height: 560px; object-fit: cover; display: block;
    }
    .article-hero-gradient {
      position: absolute; bottom: 0; left: 0; right: 0; height: 200px;
      background: linear-gradient(to top, var(--bg) 0%, transparent 100%);
    }
    .article-header {
      max-width: 760px; margin: -60px auto 0; position: relative; z-index: 2; padding: 0 24px;
    }
    .article-header h1 {
      font-size: clamp(28px, 4.5vw, 44px); line-height: 1.2; margin-bottom: 20px;
    }
    .article-header .meta-row {
      display: flex; gap: 16px; flex-wrap: wrap; align-items: center;
      font-size: 14px; color: var(--text-dim); margin-bottom: 40px;
    }
    .article-header .meta-row a { color: var(--accent-2); font-weight: 500; }

    .article-body {
      max-width: 760px; margin: 0 auto; padding: 0 24px;
      font-size: 19px; line-height: 1.85; color: var(--text);
    }
    .article-body p { margin-bottom: 1.6em; }
    .article-body h2 {
      font-size: 28px; margin: 2.5em 0 0.8em;
      padding-bottom: 8px; border-bottom: 1px solid rgba(124,77,255,0.2);
    }
    .article-body h3 { font-size: 22px; margin: 2em 0 0.6em; color: var(--accent-2); }
    .article-body blockquote {
      border-left: 3px solid var(--accent-1); padding: 20px 28px; margin: 2em 0;
      background: rgba(124,77,255,0.08); border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      font-style: italic; color: var(--text); font-size: 18px;
    }
    .article-body ul, .article-body ol { margin: 1em 0 1.8em 1.5em; }
    .article-body li { margin-bottom: 0.6em; }
    .article-body a { color: var(--accent-2); text-decoration: underline; text-underline-offset: 3px; }
    .article-body a:hover { color: var(--accent-gold); }

    /* ═══ AUTHOR BIO ═══ */
    .author-card {
      display: flex; gap: 24px; align-items: flex-start;
      background: var(--bg-card); border: 1px solid rgba(124,77,255,0.15);
      border-radius: var(--radius); padding: 32px; margin: 48px 0;
    }
    .author-avatar {
      width: 72px; height: 72px; border-radius: 50%; flex-shrink: 0;
      background: var(--gradient-accent); display: flex; align-items: center; justify-content: center;
      font-family: 'Newsreader', serif; font-size: 28px; color: white; font-weight: 700;
    }
    .author-info h3 { font-size: 18px; margin-bottom: 8px; }
    .author-info .author-title { font-size: 13px; color: var(--accent-2); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    .author-info p { font-size: 15px; color: var(--text-dim); line-height: 1.6; }

    /* ═══ SHARE BUTTONS ═══ */
    .share-row { display: flex; gap: 12px; margin: 32px 0; flex-wrap: wrap; }
    .share-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 20px; border-radius: 24px; font-size: 14px; font-weight: 500;
      border: 1px solid rgba(255,255,255,0.12); color: var(--text);
      transition: all 0.3s; min-height: 44px; text-decoration: none;
    }
    .share-btn:hover { background: rgba(124,77,255,0.15); border-color: var(--accent-1); color: var(--text-bright); }

    /* ═══ CROSS LINKS ═══ */
    .related-section { margin: 48px 0; }
    .related-section h3 { font-size: 22px; margin-bottom: 24px; }

    /* ═══ NEWSLETTER ═══ */
    .newsletter-section {
      position: relative; padding: 60px 24px; text-align: center; margin: 60px 0;
      border-radius: var(--radius); overflow: hidden;
      background: var(--bg-card); border: 1px solid rgba(124,77,255,0.15);
    }
    .newsletter-section::before {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(ellipse at center, rgba(124,77,255,0.1) 0%, transparent 70%);
    }
    .newsletter-section > * { position: relative; z-index: 1; }
    .newsletter-section h3 { font-size: 24px; margin-bottom: 8px; }
    .newsletter-section p { color: var(--text-dim); margin-bottom: 24px; }
    .nl-form { display: flex; gap: 10px; max-width: 440px; margin: 0 auto; }
    .nl-input {
      flex: 1; padding: 14px 18px; border: 1px solid rgba(255,255,255,0.12);
      border-radius: 24px; background: rgba(255,255,255,0.06); color: var(--text-bright);
      font-size: 15px; min-height: 48px; outline: none; transition: border-color 0.3s;
    }
    .nl-input:focus { border-color: var(--accent-1); }
    .nl-input::placeholder { color: var(--text-dim); }
    .nl-btn {
      padding: 14px 28px; border: none; border-radius: 24px;
      background: var(--accent-1); color: white; font-size: 15px; font-weight: 600;
      cursor: pointer; min-height: 48px; transition: transform 0.2s, box-shadow 0.2s;
    }
    .nl-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(124,77,255,0.4); }

    /* ═══ FOOTER ═══ */
    footer {
      background: var(--bg-surface); border-top: 1px solid rgba(124,77,255,0.1);
      padding: 60px 24px 40px; margin-top: 80px;
    }
    .footer-grid {
      max-width: 1200px; margin: 0 auto;
      display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px;
    }
    .footer-brand .logo { font-size: 20px; display: inline-block; margin-bottom: 12px; }
    .footer-brand p { color: var(--text-dim); font-size: 14px; line-height: 1.6; max-width: 280px; }
    .footer-col h4 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-dim); margin-bottom: 16px; }
    .footer-col a { display: block; color: var(--text-dim); font-size: 14px; padding: 4px 0; }
    .footer-col a:hover { color: var(--text-bright); }
    .footer-bottom {
      max-width: 1200px; margin: 40px auto 0; padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.06);
      font-size: 13px; color: rgba(155,149,173,0.6); line-height: 1.6;
    }

    /* ═══ COOKIE BANNER ═══ */
    .cookie-banner {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 1000;
      background: rgba(22,19,43,0.95); backdrop-filter: blur(16px);
      border-top: 1px solid rgba(124,77,255,0.2);
      padding: 16px 24px; display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 12px;
    }
    .cookie-banner span { color: var(--text-dim); font-size: 14px; }
    .cookie-banner a { color: var(--accent-2); }
    .cookie-accept {
      padding: 8px 24px; border: none; border-radius: 20px;
      background: var(--accent-1); color: white; font-size: 14px; font-weight: 600;
      cursor: pointer; min-height: 40px;
    }

    /* ═══ QUIZ ═══ */
    .quiz-wrap { max-width: 680px; margin: 60px auto; padding: 0 24px; }
    .quiz-progress { height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; margin-bottom: 32px; overflow: hidden; }
    .quiz-bar { height: 100%; background: var(--gradient-accent); border-radius: 2px; transition: width 0.4s ease; }
    .quiz-q h3 { font-size: 14px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px; }
    .quiz-q p { font-size: 22px; font-family: 'Newsreader', serif; color: var(--text-bright); margin-bottom: 24px; line-height: 1.4; }
    .quiz-opt {
      display: block; width: 100%; text-align: left;
      padding: 16px 20px; margin: 10px 0; border-radius: var(--radius-sm);
      background: var(--bg-card); border: 1px solid rgba(255,255,255,0.08);
      color: var(--text); font-size: 16px; cursor: pointer; min-height: 48px;
      transition: all 0.2s;
    }
    .quiz-opt:hover { border-color: var(--accent-1); background: rgba(124,77,255,0.1); color: var(--text-bright); }

    /* ═══ LEGAL CHECK ═══ */
    .legal-wrap { max-width: 720px; margin: 60px auto; padding: 0 24px; }
    .legal-select {
      width: 100%; max-width: 400px; padding: 14px 18px; font-size: 15px;
      border: 1px solid rgba(255,255,255,0.12); border-radius: var(--radius-sm);
      background: var(--bg-card); color: var(--text-bright); min-height: 48px;
    }
    .legal-select option { background: var(--bg-card); }
    .legal-substance {
      padding: 20px; margin: 16px 0; border-radius: var(--radius-sm);
      background: var(--bg-card); border: 1px solid rgba(255,255,255,0.06);
    }
    .legal-badge {
      display: inline-block; padding: 4px 14px; border-radius: 12px; font-size: 12px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .legal-badge.legal { background: rgba(0,229,255,0.15); color: #00E5FF; }
    .legal-badge.illegal { background: rgba(233,30,99,0.15); color: #E91E63; }
    .legal-badge.decriminalized { background: rgba(255,109,0,0.15); color: #FF6D00; }
    .legal-badge.medical { background: rgba(41,121,255,0.15); color: #2979FF; }

    /* ═══ SEARCH ═══ */
    .search-input {
      width: 100%; max-width: 480px; padding: 14px 18px 14px 44px; font-size: 15px;
      border: 1px solid rgba(255,255,255,0.12); border-radius: 24px;
      background: var(--bg-card); color: var(--text-bright); min-height: 48px;
      outline: none; transition: border-color 0.3s;
    }
    .search-input:focus { border-color: var(--accent-1); }
    .search-wrap { position: relative; display: inline-block; }
    .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-dim); font-size: 16px; }

    /* ═══ PAGINATION ═══ */
    .pagination { display: flex; gap: 8px; justify-content: center; padding: 40px 0; }
    .pagination a, .pagination span {
      padding: 10px 18px; border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-sm);
      color: var(--text-dim); font-size: 14px; min-height: 44px; display: inline-flex; align-items: center;
      transition: all 0.2s; text-decoration: none;
    }
    .pagination a:hover { border-color: var(--accent-1); color: var(--text-bright); }
    .pagination .active { background: var(--accent-1); color: white; border-color: var(--accent-1); }

    /* ═══ FAQ ═══ */
    .faq-section { margin: 3em 0; }
    .faq-item {
      margin-bottom: 20px; padding: 24px; border-radius: var(--radius-sm);
      background: var(--bg-card); border: 1px solid rgba(255,255,255,0.06);
    }
    .faq-item h3 { font-size: 17px; margin-bottom: 10px; color: var(--accent-2); }
    .faq-item p { color: var(--text-dim); font-size: 16px; line-height: 1.7; }

    /* ═══ PILLAR ARTICLES ═══ */
    .pillar {
      padding: 28px; margin: 16px 0; border-radius: var(--radius);
      background: var(--bg-card); border: 1px solid rgba(255,255,255,0.06);
      transition: border-color 0.3s, transform 0.3s;
    }
    .pillar:hover { border-color: rgba(124,77,255,0.3); transform: translateY(-2px); }
    .pillar h3 { font-size: 20px; margin-bottom: 10px; }
    .pillar h3 a { color: var(--text-bright); }
    .pillar h3 a:hover { color: var(--accent-2); }
    .pillar p { color: var(--text-dim); font-size: 15px; line-height: 1.6; }

    /* ═══ ADVISOR CARD ═══ */
    .advisor-card {
      background: var(--bg-card); border: 1px solid rgba(124,77,255,0.2);
      border-radius: var(--radius); padding: 40px; margin: 48px 0;
      position: relative; overflow: hidden;
    }
    .advisor-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: var(--gradient-accent);
    }
    .advisor-card h3 { font-size: 22px; margin-bottom: 16px; }
    .advisor-card p { color: var(--text-dim); line-height: 1.7; }

    /* ═══ RESPONSIVE ═══ */
    @media (max-width: 768px) {
      .nav-links { gap: 16px; }
      .nav-links a { font-size: 13px; }
      .hero { padding: 60px 20px 50px; }
      .card-grid { grid-template-columns: 1fr; }
      .footer-grid { grid-template-columns: 1fr 1fr; gap: 24px; }
      .featured { min-height: 320px; }
      .featured-overlay { padding: 40px 24px 24px; }
      .nl-form { flex-direction: column; }
      .author-card { flex-direction: column; text-align: center; align-items: center; }
      .art-list-thumb { width: 60px; height: 42px; }
    }
    @media (max-width: 480px) {
      .footer-grid { grid-template-columns: 1fr; }
      .hero-cats { gap: 8px; }
      .hero-cat { padding: 8px 14px; font-size: 13px; }
    }
  `;
}

// ─── TEMPLATE PARTS ───
function htmlHead(title, description, canonical, ogImage) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="author" content="The Quiet Medicine Editorial">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#0D0B1A">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
  <meta property="article:author" content="The Quiet Medicine Editorial">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  ${ogImage ? `<meta name="twitter:image" content="${ogImage}">` : ''}
  <link rel="alternate" type="application/rss+xml" title="The Quiet Medicine RSS" href="/feed.xml">
  <link rel="preconnect" href="${BUNNY_CDN_BASE}">
  <style>${css()}</style>
</head>`;
}

function navHTML() {
  return `<div class="nav-wrap"><nav>
  <a href="/" class="logo">The Quiet Medicine</a>
  <div class="nav-links">
    <a href="/articles">Articles</a>
    <a href="/start-here">Start Here</a>
    <a href="/about">About</a>
    <a href="/start-here" class="nav-cta">Begin</a>
  </div>
</nav></div>`;
}

function footerHTML() {
  return `<footer>
  <div class="footer-grid">
    <div class="footer-brand">
      <a href="/" class="logo">The Quiet Medicine</a>
      <p>Exploring the intersection of psychedelic wellness, microdosing, and conscious healing through evidence-based research and contemplative wisdom.</p>
    </div>
    <div class="footer-col">
      <h4>Explore</h4>
      ${SITE.categories.map(c => `<a href="/category/${c.slug}">${c.name}</a>`).join('')}
    </div>
    <div class="footer-col">
      <h4>Resources</h4>
      <a href="/start-here">Start Here</a>
      <a href="/legal-check">Legal Check</a>
      <a href="/quiz/microdosing-readiness">Quizzes</a>
      <a href="/feed.xml">RSS Feed</a>
    </div>
    <div class="footer-col">
      <h4>About</h4>
      <a href="/about">About Us</a>
      <a href="${SITE.advisorLink}">Kalesh</a>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </div>
  </div>
  <div class="footer-bottom">
    This site provides educational information about psychedelic research and wellness. It does not promote illegal activity. Psychedelic substances carry risks and are not legal in all jurisdictions. Consult a healthcare provider. Not medical advice.
  </div>
</footer>`;
}

function cookieBannerHTML() {
  return `<div class="cookie-banner" id="cookieBanner" style="display:none;">
  <span>We use cookies to improve your experience. <a href="/privacy">Privacy Policy</a></span>
  <button class="cookie-accept" onclick="document.getElementById('cookieBanner').style.display='none';localStorage.setItem('cookieConsent','true');" aria-label="Accept cookies">Accept</button>
</div>
<script>if(!localStorage.getItem('cookieConsent')){document.getElementById('cookieBanner').style.display='flex';}</script>`;
}

function newsletterHTML(source = 'footer') {
  return `<div class="newsletter-section">
  <h3>Stay in the Current</h3>
  <p>Evidence-based insights on psychedelic wellness, delivered with care.</p>
  <form class="nl-form" id="newsletter-${source}" onsubmit="return handleSubscribe(event, '${source}')">
    <input class="nl-input" type="email" name="email" placeholder="Your email" required aria-label="Email address">
    <button class="nl-btn" type="submit">Subscribe</button>
  </form>
  <p id="newsletter-msg-${source}" style="display:none;color:var(--accent-2);margin-top:16px;">Welcome aboard.</p>
</div>`;
}

function subscribeScript() {
  return `<script>
async function handleSubscribe(e, source) {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('input[name="email"]').value;
  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({email, source})
    });
    if (res.ok) {
      form.style.display = 'none';
      document.getElementById('newsletter-msg-' + source).style.display = 'block';
    }
  } catch(err) { console.error(err); }
  return false;
}
</script>`;
}

function articleCard(a) {
  const cat = getCatObj(a.categorySlug);
  return `<div class="card">
  <a href="/articles/${a.slug}" class="card-img-wrap">
    <img class="card-img" src="${a.heroImage}" alt="${escapeHtml(a.heroAlt || a.title)}" width="680" height="383" loading="lazy">
    <span class="card-cat-badge" style="border-left:3px solid ${cat.color};">${a.categoryName || ''}</span>
  </a>
  <div class="card-body">
    <h3><a href="/articles/${a.slug}">${a.title}</a></h3>
    <p class="card-excerpt">${(a.excerpt || '').slice(0, 140)}${(a.excerpt || '').length > 140 ? '...' : ''}</p>
    <div class="card-meta">
      <span>${new Date(a.dateISO).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      <span class="dot"></span>
      <span>${a.readingTime || '10 min read'}</span>
    </div>
  </div>
</div>`;
}

function featuredCard(a) {
  return `<a href="/articles/${a.slug}" class="featured">
  <img class="featured-img" src="${a.heroImage}" alt="${escapeHtml(a.heroAlt || a.title)}" width="1200" height="560" loading="eager">
  <div class="featured-overlay">
    <span class="card-cat-badge" style="margin-bottom:12px;display:inline-block;">${a.categoryName || ''}</span>
    <h2><span style="color:white;">${a.title}</span></h2>
    <p class="card-excerpt">${(a.excerpt || '').slice(0, 180)}${(a.excerpt || '').length > 180 ? '...' : ''}</p>
    <div class="card-meta">
      <span>${new Date(a.dateISO).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
      <span class="dot"></span>
      <span>${a.readingTime || '10 min read'}</span>
    </div>
  </div>
</a>`;
}

// ─── API ROUTES ───
app.use(express.json());

app.post('/api/subscribe', async (req, res) => {
  const { email, source } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const entry = JSON.stringify({ email, date: new Date().toISOString(), source: source || 'unknown' }) + '\n';
  try {
    const url = `https://${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/data/subscribers.jsonl`;
    let existing = '';
    try {
      const getRes = await fetch(url, { headers: { 'AccessKey': BUNNY_STORAGE_PASSWORD } });
      if (getRes.ok) existing = await getRes.text();
    } catch {}
    const putRes = await fetch(url, {
      method: 'PUT',
      headers: { 'AccessKey': BUNNY_STORAGE_PASSWORD, 'Content-Type': 'application/octet-stream' },
      body: existing + entry,
    });
    if (putRes.ok) return res.json({ success: true });
    return res.status(500).json({ error: 'Storage error' });
  } catch (err) {
    console.error('Subscribe error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// AI Endpoints
app.get('/llms.txt', (req, res) => {
  const articles = getPublishedArticles();
  res.type('text/plain').send(`# The Quiet Medicine
## Microdosing, Psychedelics, and Conscious Healing
## Author: Kalesh — Consciousness Teacher & Writer
## URL: https://thequietmedicine.com
## Topics: psychedelic wellness, microdosing, psilocybin, ketamine therapy, MDMA therapy, ayahuasca, psychedelic integration, consciousness, meditation
## Articles: ${articles.length} published
## Contact: Visit https://kalesh.love
## License: All rights reserved`);
});

app.get('/.well-known/ai.json', (req, res) => {
  const articles = getPublishedArticles();
  res.json({
    name: 'The Quiet Medicine',
    description: 'Microdosing, Psychedelics, and Conscious Healing',
    url: 'https://thequietmedicine.com',
    author: { name: 'Kalesh', title: 'Consciousness Teacher & Writer', url: 'https://kalesh.love' },
    topics: ['psychedelic wellness', 'microdosing', 'psilocybin', 'ketamine therapy', 'MDMA therapy', 'ayahuasca', 'psychedelic integration', 'consciousness', 'meditation'],
    articleCount: articles.length,
    endpoints: { identity: '/api/ai/identity', topics: '/api/ai/topics', ask: '/api/ai/ask', articles: '/api/ai/articles', sitemap: '/api/ai/sitemap' },
  });
});

app.get('/api/ai/identity', (req, res) => {
  res.json({
    site: 'The Quiet Medicine',
    author: { name: 'Kalesh', title: 'Consciousness Teacher & Writer', url: 'https://kalesh.love' },
    niche: 'Psychedelic wellness — microdosing, legal ketamine, MDMA therapy, ayahuasca, psychedelic integration',
    editorial: 'The Quiet Medicine Editorial',
  });
});

app.get('/api/ai/topics', (req, res) => {
  const articles = getPublishedArticles();
  const topics = {};
  articles.forEach(a => { const cat = a.categoryName || 'Uncategorized'; if (!topics[cat]) topics[cat] = []; topics[cat].push({ title: a.title, slug: a.slug }); });
  res.json({ topics, totalArticles: articles.length });
});

app.get('/api/ai/ask', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  if (!q) return res.json({ answer: 'Please provide a query parameter ?q=your+question', articles: [] });
  const articles = getPublishedArticles();
  const matches = articles.filter(a => a.title.toLowerCase().includes(q) || (a.excerpt || '').toLowerCase().includes(q) || (a.body || '').toLowerCase().includes(q)).slice(0, 5);
  res.json({ query: q, answer: matches.length ? `Found ${matches.length} relevant articles.` : 'No matching articles found.', articles: matches.map(a => ({ title: a.title, url: `https://thequietmedicine.com/articles/${a.slug}`, excerpt: a.excerpt })) });
});

app.get('/api/ai/articles', (req, res) => {
  const articles = getPublishedArticles();
  res.json({ total: articles.length, articles: articles.map(a => ({ title: a.title, slug: a.slug, url: `https://thequietmedicine.com/articles/${a.slug}`, category: a.categoryName, date: a.dateISO, excerpt: a.excerpt, readingTime: a.readingTime })) });
});

app.get('/api/ai/sitemap', (req, res) => {
  const articles = getPublishedArticles();
  const pages = [{ url: '/', title: 'Home' }, { url: '/articles', title: 'Articles' }, { url: '/about', title: 'About' }, { url: '/start-here', title: 'Start Here' }, { url: '/legal-check', title: 'Legal Check' }, { url: '/privacy', title: 'Privacy Policy' }, { url: '/terms', title: 'Terms of Service' }];
  SITE.categories.forEach(c => pages.push({ url: `/category/${c.slug}`, title: c.name }));
  articles.forEach(a => pages.push({ url: `/articles/${a.slug}`, title: a.title }));
  res.json({ pages });
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *
Allow: /
Allow: /llms.txt
Allow: /.well-known/ai.json
Allow: /api/ai/
Allow: /feed.xml
Allow: /sitemap-index.xml
Disallow: /api/subscribe
Disallow: /api/cron/

Sitemap: https://thequietmedicine.com/sitemap-index.xml

User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Anthropic-AI
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: CCBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: YouBot
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: Bytespider
Allow: /
User-agent: Diffbot
Allow: /
User-agent: FacebookBot
Allow: /
User-agent: FriendlyCrawler
Allow: /
User-agent: ImagesiftBot
Allow: /
User-agent: Kangaroo Bot
Allow: /
User-agent: Meta-ExternalAgent
Allow: /
User-agent: Meta-ExternalFetcher
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: PetalBot
Allow: /
User-agent: Scrapy
Allow: /
User-agent: Timpibot
Allow: /
User-agent: VelenPublicWebCrawler
Allow: /
User-agent: Webzio-Extended
Allow: /
User-agent: cohere-ai
Allow: /
User-agent: omgili
Allow: /
User-agent: omgilibot
Allow: /
User-agent: peer39_crawler
Allow: /
User-agent: peer39_crawler/1.0
Allow: /
User-agent: Amazonbot
Allow: /
User-agent: Bingbot
Allow: /
User-agent: Slurp
Allow: /
User-agent: DuckDuckBot
Allow: /
User-agent: Baiduspider
Allow: /
User-agent: YandexBot
Allow: /
User-agent: Sogou
Allow: /
User-agent: Exabot
Allow: /
User-agent: facebot
Allow: /
User-agent: ia_archiver
Allow: /
User-agent: MJ12bot
Allow: /
User-agent: AhrefsBot
Allow: /
User-agent: SemrushBot
Allow: /
User-agent: DotBot
Allow: /
User-agent: Rogerbot
Allow: /
User-agent: TurnitinBot
Allow: /
User-agent: Twitterbot
Allow: /
User-agent: LinkedInBot
Allow: /
User-agent: WhatsApp
Allow: /
User-agent: Slackbot
Allow: /
User-agent: Discordbot
Allow: /
User-agent: TelegramBot
Allow: /
`);
});

// Sitemaps
app.get('/sitemap-index.xml', (req, res) => {
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://thequietmedicine.com/sitemap.xml</loc></sitemap>
  <sitemap><loc>https://thequietmedicine.com/sitemap-images.xml</loc></sitemap>
</sitemapindex>`);
});

app.get('/sitemap.xml', (req, res) => {
  const articles = getPublishedArticles();
  const urls = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/articles', priority: '0.9', changefreq: 'daily' },
    { loc: '/about', priority: '0.7', changefreq: 'monthly' },
    { loc: '/start-here', priority: '0.8', changefreq: 'monthly' },
    { loc: '/legal-check', priority: '0.7', changefreq: 'monthly' },
    { loc: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { loc: '/terms', priority: '0.3', changefreq: 'yearly' },
  ];
  SITE.categories.forEach(c => urls.push({ loc: `/category/${c.slug}`, priority: '0.8', changefreq: 'weekly' }));
  articles.forEach(a => urls.push({ loc: `/articles/${a.slug}`, priority: '0.6', changefreq: 'monthly', lastmod: a.dateISO }));
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>https://thequietmedicine.com${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    ${u.lastmod ? `<lastmod>${u.lastmod.split('T')[0]}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`);
});

app.get('/sitemap-images.xml', (req, res) => {
  const articles = getPublishedArticles();
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${articles.map(a => `  <url>
    <loc>https://thequietmedicine.com/articles/${a.slug}</loc>
    <image:image>
      <image:loc>${a.heroImage}</image:loc>
      <image:title>${escapeXml(a.title)}</image:title>
    </image:image>
  </url>`).join('\n')}
</urlset>`);
});

// RSS Feed
app.get('/feed.xml', (req, res) => {
  const articles = getPublishedArticles().slice(0, 20);
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>The Quiet Medicine</title>
  <link>https://thequietmedicine.com</link>
  <description>Microdosing, Psychedelics, and Conscious Healing</description>
  <language>en-us</language>
  <atom:link href="https://thequietmedicine.com/feed.xml" rel="self" type="application/rss+xml"/>
  ${articles.map(a => `<item>
    <title>${escapeXml(a.title)}</title>
    <link>https://thequietmedicine.com/articles/${a.slug}</link>
    <guid>https://thequietmedicine.com/articles/${a.slug}</guid>
    <pubDate>${new Date(a.dateISO).toUTCString()}</pubDate>
    <description>${escapeXml(a.excerpt || '')}</description>
  </item>`).join('\n')}
</channel>
</rss>`);
});

// ─── PAGE ROUTES ───

// Homepage
app.get('/', (req, res) => {
  const articles = getPublishedArticles();
  const featured = articles[0];
  const latest = articles.slice(1, 7);

  const catCards = SITE.categories.map(c => {
    const count = articles.filter(a => a.categorySlug === c.slug).length;
    return `<a href="/category/${c.slug}" class="hero-cat"><span class="cat-icon">${c.icon}</span> ${c.name} <span style="color:var(--text-dim);font-size:12px;">(${count})</span></a>`;
  }).join('');

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "name": "The Quiet Medicine", "url": "https://thequietmedicine.com", "description": "Microdosing, Psychedelics, and Conscious Healing" },
      { "@type": "WebSite", "name": "The Quiet Medicine", "url": "https://thequietmedicine.com", "potentialAction": { "@type": "SearchAction", "target": "https://thequietmedicine.com/articles?q={search_term_string}", "query-input": "required name=search_term_string" } }
    ]
  });

  res.send(`${htmlHead('The Quiet Medicine — Microdosing, Psychedelics & Conscious Healing', 'Explore the intersection of psychedelic wellness, microdosing, and conscious healing through evidence-based research and contemplative wisdom.', 'https://thequietmedicine.com/', `${BUNNY_CDN_BASE}/og/homepage.webp`)}
<body>
${navHTML()}
<div class="hero">
  <div class="hero-content">
    <h1>The Quiet Medicine</h1>
    <p class="tagline">${SITE.tagline}</p>
    <div class="hero-cats">${catCards}</div>
  </div>
</div>

<div class="wide" style="padding-top:60px;">
  ${featured ? `<div class="section-head"><h2>Featured</h2></div>${featuredCard(featured)}` : ''}

  <div class="section-head"><h2>Latest</h2><a href="/articles">View All &rarr;</a></div>
  <div class="card-grid">
    ${latest.map(a => articleCard(a)).join('')}
  </div>

  ${newsletterHTML('homepage')}
</div>

${footerHTML()}
${cookieBannerHTML()}
${subscribeScript()}
<script type="application/ld+json">${jsonLd}</script>
</body></html>`);
});

// Articles listing
app.get('/articles', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const q = req.query.q || '';
  let articles = getPublishedArticles();
  if (q) articles = articles.filter(a => a.title.toLowerCase().includes(q.toLowerCase()) || (a.excerpt || '').toLowerCase().includes(q.toLowerCase()));
  const perPage = 18;
  const total = articles.length;
  const totalPages = Math.ceil(total / perPage);
  const paged = articles.slice((page - 1) * perPage, page * perPage);

  let pagination = '<div class="pagination">';
  for (let i = 1; i <= totalPages; i++) {
    if (i === page) pagination += '<span class="active">' + i + '</span>';
    else pagination += '<a href="/articles?page=' + i + (q ? '&q=' + encodeURIComponent(q) : '') + '">' + i + '</a>';
  }
  pagination += '</div>';

  const desc = 'Browse ' + total + ' articles on psychedelic wellness, microdosing, and conscious healing.';

  res.send(htmlHead('Articles — The Quiet Medicine', desc, 'https://thequietmedicine.com/articles') + `
<body>
${navHTML()}
<div class="wide" style="padding-top:60px;">
  <div class="section-head">
    <h2>Articles</h2>
    <span style="color:var(--text-dim);font-size:14px;">` + total + ` published</span>
  </div>
  <div style="margin-bottom:32px;">
    <form method="get" action="/articles">
      <div class="search-wrap">
        <span class="search-icon">&#128269;</span>
        <input class="search-input" type="text" name="q" placeholder="Search articles..." value="` + escapeHtml(q) + `" aria-label="Search articles">
      </div>
    </form>
  </div>
  <div class="card-grid">
    ` + paged.map(a => articleCard(a)).join('') + `
  </div>
  ` + pagination + `
</div>
${footerHTML()}
${cookieBannerHTML()}
</body></html>`);
});

// Category pages
app.get('/category/:slug', (req, res) => {
  const cat = SITE.categories.find(c => c.slug === req.params.slug);
  if (!cat) return render404(req, res);
  const articles = getArticlesByCategory(cat.slug);
  const desc = CAT_DESCRIPTIONS[cat.slug] || ('Articles about ' + cat.name);
  const catUrl = 'https://thequietmedicine.com/category/' + cat.slug;

  const jsonLd = JSON.stringify({ "@context": "https://schema.org", "@type": "CollectionPage", "name": cat.name, "url": catUrl, "description": desc, "numberOfItems": articles.length });

  res.send(htmlHead(cat.name + ' — The Quiet Medicine', desc, catUrl) + `
<body>
${navHTML()}
<div class="wide" style="padding-top:60px;">
  <div style="margin-bottom:40px;">
    <span style="font-size:40px;">` + cat.icon + `</span>
    <h1 style="margin-top:12px;">` + cat.name + `</h1>
    <p style="color:var(--text-dim);margin-top:8px;max-width:600px;">` + desc + `</p>
    <p style="color:var(--text-dim);font-size:14px;margin-top:8px;">` + articles.length + ` articles</p>
  </div>
  <div class="card-grid">
    ` + articles.map(a => articleCard(a)).join('') + `
  </div>
</div>
${footerHTML()}
${cookieBannerHTML()}
<script type="application/ld+json">` + jsonLd + `</script>
</body></html>`);
});

// Article page
app.get('/articles/:slug', (req, res) => {
  const articles = getPublishedArticles();
  const article = articles.find(a => a.slug === req.params.slug);
  if (!article) return render404(req, res);

  const sameCat = articles.filter(a => a.categorySlug === article.categorySlug && a.slug !== article.slug).slice(0, 3);

  let faqHtml = '';
  if (article.faqs && article.faqs.length > 0) {
    faqHtml = '<div class="faq-section"><h2>Frequently Asked Questions</h2>' +
      article.faqs.map(f => '<div class="faq-item"><h3>' + f.question + '</h3><p>' + f.answer + '</p></div>').join('') +
      '</div>';
  }

  const faqSchema = article.faqs && article.faqs.length > 0 ? JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": article.faqs.map(f => ({ "@type": "Question", "name": f.question, "acceptedAnswer": { "@type": "Answer", "text": f.answer } })) }) : '';

  const articleUrl = 'https://thequietmedicine.com/articles/' + article.slug;
  const catUrl = 'https://thequietmedicine.com/category/' + article.categorySlug;

  const articleSchema = JSON.stringify({
    "@context": "https://schema.org", "@type": "Article",
    "headline": article.title, "description": article.excerpt, "image": article.heroImage,
    "datePublished": article.dateISO, "dateModified": article.dateISO,
    "author": { "@type": "Person", "name": "Kalesh" },
    "publisher": { "@type": "Organization", "name": "The Quiet Medicine", "url": "https://thequietmedicine.com" },
    "mainEntityOfPage": articleUrl,
    "speakable": { "@type": "SpeakableSpecification", "cssSelector": [".article-body p:first-of-type", ".article-body h2"] }
  });

  const breadcrumbSchema = JSON.stringify({
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://thequietmedicine.com" },
      { "@type": "ListItem", "position": 2, "name": article.categoryName, "item": catUrl },
      { "@type": "ListItem", "position": 3, "name": article.title, "item": articleUrl }
    ]
  });

  const shareUrl = encodeURIComponent(articleUrl);
  const shareTitle = encodeURIComponent(article.title);
  const cat = getCatObj(article.categorySlug);
  const dateStr = new Date(article.dateISO).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  let relatedHtml = '';
  if (sameCat.length > 0) {
    relatedHtml = '<div class="related-section"><h3>More from ' + article.categoryName + '</h3><div class="card-grid">' + sameCat.map(a => articleCard(a)).join('') + '</div></div>';
  }

  res.send(htmlHead(article.title + ' — The Quiet Medicine', article.excerpt || '', articleUrl, article.ogImage || article.heroImage) + `
<body>
` + navHTML() + `
<div class="article-hero-wrap">
  <img class="article-hero-img" src="` + article.heroImage + `" alt="` + escapeHtml(article.heroAlt || article.title) + `" width="1200" height="560">
  <div class="article-hero-gradient"></div>
</div>
<div class="article-header">
  <a href="/category/` + article.categorySlug + `" style="display:inline-block;margin-bottom:16px;">
    <span class="cat-pill" style="background:` + cat.color + `22;color:` + cat.color + `;">` + article.categoryName + `</span>
  </a>
  <h1>` + article.title + `</h1>
  <div class="meta-row">
    <span>By <a href="` + SITE.advisorLink + `">Kalesh</a></span>
    <span>` + dateStr + `</span>
    <span>` + (article.readingTime || '10 min read') + `</span>
  </div>
</div>
<div class="article-body">
  ` + article.body + `
</div>
<div class="container">
  ` + faqHtml + `
  <div class="share-row">
    <a href="https://twitter.com/intent/tweet?url=` + shareUrl + `&text=` + shareTitle + `" rel="nofollow" class="share-btn" aria-label="Share on X">Share on X</a>
    <a href="https://www.facebook.com/sharer/sharer.php?u=` + shareUrl + `" rel="nofollow" class="share-btn" aria-label="Share on Facebook">Share on Facebook</a>
    <a href="#" onclick="navigator.clipboard.writeText(window.location.href);this.textContent='Copied!';return false;" class="share-btn" aria-label="Copy link">Copy Link</a>
  </div>
  <div class="author-card">
    <div class="author-avatar">K</div>
    <div class="author-info">
      <h3>Kalesh</h3>
      <div class="author-title">Consciousness Teacher & Writer</div>
      <p>` + SITE.advisorBio + ` <a href="` + SITE.advisorLink + `">Visit Kalesh</a></p>
    </div>
  </div>
  ` + relatedHtml + `
  ` + newsletterHTML('article') + `
  <div style="margin:20px 0;font-size:13px;color:var(--text-dim);font-style:italic;">
    This site provides educational information about psychedelic research and wellness. It does not promote illegal activity. Not medical advice.
  </div>
</div>
` + footerHTML() + `
` + cookieBannerHTML() + `
` + subscribeScript() + `
<script type="application/ld+json">` + articleSchema + `</script>
<script type="application/ld+json">` + breadcrumbSchema + `</script>
` + (faqSchema ? '<script type="application/ld+json">' + faqSchema + '</script>' : '') + `
</body></html>`);
});

// About page
app.get('/about', (req, res) => {
  const articles = getPublishedArticles();
  const profileSchema = JSON.stringify({
    "@context": "https://schema.org", "@type": "ProfilePage",
    "mainEntity": { "@type": "Person", "name": "Kalesh", "jobTitle": "Consciousness Teacher & Writer", "url": "https://kalesh.love", "description": SITE.advisorBio }
  });

  res.send(htmlHead('About — The Quiet Medicine', 'Learn about The Quiet Medicine and our commitment to evidence-based psychedelic wellness education.', 'https://thequietmedicine.com/about') + `
<body>
${navHTML()}
<div class="container" style="padding-top:60px;">
  <h1>About The Quiet Medicine</h1>
  <p style="margin:32px 0;line-height:1.85;font-size:18px;color:var(--text);">The Quiet Medicine exists at the intersection of ancient plant wisdom and modern neuroscience. We publish evidence-based, contemplative writing on psychedelic wellness — from microdosing protocols and clinical research to integration practices and the deeper philosophical questions that arise when consciousness begins to shift.</p>
  <p style="margin:32px 0;line-height:1.85;font-size:18px;color:var(--text);">Our editorial approach honors both the rigor of clinical research and the depth of contemplative traditions. Every article is grounded in peer-reviewed science while acknowledging that some of the most important dimensions of psychedelic experience resist quantification. We write for people who want to understand what the research actually says — and what it doesn't.</p>
  <p style="margin:32px 0;line-height:1.85;font-size:18px;color:var(--text);">With ` + articles.length + ` published articles across five categories, we cover the full spectrum of psychedelic wellness: the neuroscience, the protocols, the ceremonial traditions, the clinical frameworks, and the essential work of integration that makes any of it meaningful.</p>

  <div class="advisor-card">
    <div style="display:flex;gap:20px;align-items:center;margin-bottom:20px;">
      <div class="author-avatar" style="width:64px;height:64px;font-size:24px;">K</div>
      <div>
        <h3 style="margin:0;">Kalesh</h3>
        <div style="font-size:13px;color:var(--accent-2);text-transform:uppercase;letter-spacing:0.05em;">Consciousness Teacher & Writer</div>
      </div>
    </div>
    <p>` + SITE.advisorBio + ` <a href="` + SITE.advisorLink + `">Visit Kalesh</a></p>
  </div>
</div>
${footerHTML()}
${cookieBannerHTML()}
<script type="application/ld+json">` + profileSchema + `</script>
</body></html>`);
});

// Start Here
app.get('/start-here', (req, res) => {
  const articles = getPublishedArticles();
  const pillars = [];
  for (const cat of SITE.categories) {
    const catArticles = articles.filter(a => a.categorySlug === cat.slug);
    if (catArticles.length > 0) pillars.push(catArticles[0]);
  }

  const pillarHtml = pillars.map(a => '<div class="pillar"><h3><a href="/articles/' + a.slug + '">' + a.title + '</a></h3><p>' + (a.excerpt || '').slice(0, 200) + '...</p></div>').join('');

  res.send(htmlHead('Start Here — The Quiet Medicine', 'New to The Quiet Medicine? Start with these essential articles on psychedelic wellness and conscious healing.', 'https://thequietmedicine.com/start-here') + `
<body>
${navHTML()}
<div class="container" style="padding-top:60px;">
  <h1>Start Here</h1>
  <p style="margin:24px 0;line-height:1.85;font-size:18px;color:var(--text);">Welcome to The Quiet Medicine. Whether you're exploring microdosing for the first time, researching legal psychedelic therapy, or integrating a transformative experience, these foundational articles will orient you.</p>
  <p style="margin:24px 0;line-height:1.85;font-size:18px;color:var(--text);">The medicine is ancient. The science is catching up. And the most important work — the integration, the embodiment, the willingness to let what you've seen actually change how you live — that's what we write about here.</p>
  ` + pillarHtml + `
  <p style="margin:40px 0;"><a href="/articles" style="font-weight:600;">Browse all ` + articles.length + ` articles &rarr;</a></p>
</div>
${footerHTML()}
${cookieBannerHTML()}
</body></html>`);
});

// Privacy Policy
app.get('/privacy', (req, res) => {
  res.send(htmlHead('Privacy Policy — The Quiet Medicine', 'Privacy policy for The Quiet Medicine.', 'https://thequietmedicine.com/privacy') + `
<body>
${navHTML()}
<div class="container" style="padding-top:60px;">
  <h1>Privacy Policy</h1>
  <p style="margin:16px 0;color:var(--text-dim);"><em>Last updated: March 27, 2026</em></p>
  <h2 style="margin-top:32px;">Information We Collect</h2>
  <p>If you subscribe to our newsletter, we collect your email address and the date and page from which you subscribed. This information is stored securely on our content delivery network (Bunny CDN) in an append-only log file.</p>
  <h2>How We Use Your Information</h2>
  <p>Email addresses collected through our subscription form are stored for potential future communications. We do not currently send any emails. We do not sell, trade, or share your email address with third parties.</p>
  <h2>Cookies</h2>
  <p>We use a single cookie to remember your cookie consent preference. We do not use analytics cookies, tracking pixels, or third-party advertising cookies.</p>
  <h2>Third-Party Services</h2>
  <p>We use Bunny CDN for content delivery and data storage. No other third-party services process your personal information.</p>
  <h2>Your Rights</h2>
  <p>You may request deletion of your email address at any time. Under GDPR, you have the right to access, rectify, or erase your personal data.</p>
  <h2>Data Retention</h2>
  <p>Subscription data is retained indefinitely unless you request deletion.</p>
  <h2>Contact</h2>
  <p>For privacy-related inquiries, visit <a href="https://kalesh.love">kalesh.love</a>.</p>
</div>
${footerHTML()}
${cookieBannerHTML()}
</body></html>`);
});

// Terms of Service
app.get('/terms', (req, res) => {
  res.send(htmlHead('Terms of Service — The Quiet Medicine', 'Terms of service for The Quiet Medicine.', 'https://thequietmedicine.com/terms') + `
<body>
${navHTML()}
<div class="container" style="padding-top:60px;">
  <h1>Terms of Service</h1>
  <p style="margin:16px 0;color:var(--text-dim);"><em>Last updated: March 27, 2026</em></p>
  <h2 style="margin-top:32px;">Educational Purpose</h2>
  <p>The content on The Quiet Medicine is provided for educational and informational purposes only. It does not constitute medical, legal, or professional advice. Psychedelic substances carry risks and are regulated differently across jurisdictions. Always consult qualified healthcare providers before making decisions about your health.</p>
  <h2>No Professional Advice</h2>
  <p>Nothing on this site should be interpreted as a recommendation to use, possess, or distribute any controlled substance. We do not promote illegal activity.</p>
  <h2>Intellectual Property</h2>
  <p>All content, including articles, images, and design elements, is the property of The Quiet Medicine and is protected by copyright law. You may share links to our content but may not reproduce it without permission.</p>
  <h2>Limitation of Liability</h2>
  <p>The Quiet Medicine and its contributors shall not be held liable for any damages arising from the use of information on this site. You use this information at your own risk.</p>
  <h2>Changes to Terms</h2>
  <p>We reserve the right to update these terms at any time. Continued use of the site constitutes acceptance of any changes.</p>
</div>
${footerHTML()}
${cookieBannerHTML()}
</body></html>`);
});

// Legal Check interactive page
app.get('/legal-check', (req, res) => {
  res.send(htmlHead("What's Legal Where You Are — The Quiet Medicine", 'Check the legal status of psychedelic substances in your state or country.', 'https://thequietmedicine.com/legal-check') + `
<body>
${navHTML()}
<div class="legal-wrap">
  <h1>What's Legal Where You Are</h1>
  <p style="margin:16px 0 28px;color:var(--text-dim);">Select your location to see the current legal status of psychedelic substances. This information is for educational purposes only and is updated quarterly.</p>

  <select class="legal-select" id="locationSelect" onchange="showLegalStatus()" aria-label="Select your location">
    <option value="">Select your state or country...</option>
    <optgroup label="United States">
      <option value="us-or">Oregon</option>
      <option value="us-co">Colorado</option>
      <option value="us-ca">California</option>
      <option value="us-wa">Washington</option>
      <option value="us-ma">Massachusetts</option>
      <option value="us-ny">New York</option>
      <option value="us-tx">Texas</option>
      <option value="us-fl">Florida</option>
      <option value="us-other">Other US States</option>
    </optgroup>
    <optgroup label="International">
      <option value="ca">Canada</option>
      <option value="nl">Netherlands</option>
      <option value="pt">Portugal</option>
      <option value="br">Brazil</option>
      <option value="jm">Jamaica</option>
      <option value="cr">Costa Rica</option>
      <option value="pe">Peru</option>
      <option value="uk">United Kingdom</option>
      <option value="au">Australia</option>
      <option value="other">Other Countries</option>
    </optgroup>
  </select>

  <div id="legalResults"></div>
</div>
${footerHTML()}
${cookieBannerHTML()}
<script>
var legalData = {
  "us-or": { name: "Oregon", substances: [{ name: "Psilocybin", status: "legal", note: "Legal for supervised therapeutic use under Measure 109 (2023)." }, { name: "Ketamine", status: "medical", note: "Legal with prescription. Multiple clinics statewide." }, { name: "MDMA", status: "illegal", note: "Schedule I federally. FDA breakthrough therapy designation for PTSD." }, { name: "Cannabis", status: "legal", note: "Recreational and medical use legal since 2014." }, { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule I. Religious exemptions exist." }] },
  "us-co": { name: "Colorado", substances: [{ name: "Psilocybin", status: "decriminalized", note: "Proposition 122 (2022) decriminalized personal use." }, { name: "Ketamine", status: "medical", note: "Legal with prescription." }, { name: "MDMA", status: "illegal", note: "Schedule I federally." }, { name: "Cannabis", status: "legal", note: "Recreational and medical use legal since 2012." }, { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule I." }] },
  "us-ca": { name: "California", substances: [{ name: "Psilocybin", status: "illegal", note: "Schedule I. Decriminalized in Oakland, Santa Cruz, San Francisco." }, { name: "Ketamine", status: "medical", note: "Legal with prescription. Major hub for clinics." }, { name: "MDMA", status: "illegal", note: "Schedule I. Active clinical trial sites." }, { name: "Cannabis", status: "legal", note: "Recreational and medical use legal." }, { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule I." }] },
  "us-wa": { name: "Washington", substances: [{ name: "Psilocybin", status: "illegal", note: "Therapeutic framework legislation under consideration." }, { name: "Ketamine", status: "medical", note: "Legal with prescription." }, { name: "MDMA", status: "illegal", note: "Schedule I federally." }, { name: "Cannabis", status: "legal", note: "Recreational and medical use legal since 2012." }, { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule I." }] },
  "us-ma": { name: "Massachusetts", substances: [{ name: "Psilocybin", status: "decriminalized", note: "Decriminalized in Somerville, Cambridge, Northampton." }, { name: "Ketamine", status: "medical", note: "Legal with prescription." }, { name: "MDMA", status: "illegal", note: "Schedule I federally." }, { name: "Cannabis", status: "legal", note: "Recreational and medical use legal." }, { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule I." }] },
  "us-ny": { name: "New York", substances: [{ name: "Psilocybin", status: "illegal", note: "Therapeutic use bills introduced. Not yet passed." }, { name: "Ketamine", status: "medical", note: "Legal with prescription. Many clinics in NYC." }, { name: "MDMA", status: "illegal", note: "Schedule I federally." }, { name: "Cannabis", status: "legal", note: "Recreational and medical use legal." }, { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule I." }] },
  "us-tx": { name: "Texas", substances: [{ name: "Psilocybin", status: "illegal", note: "HB 1802 funded research for veterans. Personal use illegal." }, { name: "Ketamine", status: "medical", note: "Legal with prescription." }, { name: "MDMA", status: "illegal", note: "Schedule I." }, { name: "Cannabis", status: "illegal", note: "Limited medical program. Recreational illegal." }, { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule I." }] },
  "us-fl": { name: "Florida", substances: [{ name: "Psilocybin", status: "illegal", note: "No decriminalization. Research interest growing." }, { name: "Ketamine", status: "medical", note: "Legal with prescription. Multiple clinics." }, { name: "MDMA", status: "illegal", note: "Schedule I." }, { name: "Cannabis", status: "medical", note: "Medical use legal. Recreational remains illegal." }, { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule I." }] },
  "us-other": { name: "Other US States", substances: [{ name: "Psilocybin", status: "illegal", note: "Schedule I in most states." }, { name: "Ketamine", status: "medical", note: "Legal with prescription nationwide." }, { name: "MDMA", status: "illegal", note: "Schedule I federally." }, { name: "Cannabis", status: "illegal", note: "Varies by state." }, { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule I." }] },
  "ca": { name: "Canada", substances: [{ name: "Psilocybin", status: "medical", note: "Special Access Programme allows therapeutic use." }, { name: "Ketamine", status: "medical", note: "Legal with prescription." }, { name: "MDMA", status: "illegal", note: "Schedule I. Clinical trials active." }, { name: "Cannabis", status: "legal", note: "Fully legal since 2018." }, { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule III." }] },
  "nl": { name: "Netherlands", substances: [{ name: "Psilocybin Truffles", status: "legal", note: "Magic truffles legal and sold in smart shops." }, { name: "Ketamine", status: "medical", note: "Available by prescription." }, { name: "MDMA", status: "illegal", note: "Illegal but widely available. Pill testing services operate legally." }, { name: "Cannabis", status: "decriminalized", note: "Tolerated in licensed coffee shops." }, { name: "Ayahuasca", status: "decriminalized", note: "Legal grey area. Ceremonies operate openly." }] },
  "pt": { name: "Portugal", substances: [{ name: "All Substances", status: "decriminalized", note: "All drugs decriminalized for personal use since 2001." }] },
  "br": { name: "Brazil", substances: [{ name: "Psilocybin", status: "illegal", note: "Legal grey area." }, { name: "Ketamine", status: "medical", note: "Available by prescription." }, { name: "Ayahuasca", status: "legal", note: "Legal for religious use. CONAD resolution protects ceremonial use." }, { name: "Cannabis", status: "illegal", note: "Medical use recently authorized." }] },
  "jm": { name: "Jamaica", substances: [{ name: "Psilocybin", status: "legal", note: "Not controlled. Retreat centers operate legally." }, { name: "Cannabis", status: "decriminalized", note: "Decriminalized for personal use." }] },
  "cr": { name: "Costa Rica", substances: [{ name: "Psilocybin", status: "legal", note: "Not explicitly controlled. Retreat centers operate." }, { name: "Ayahuasca", status: "legal", note: "Not explicitly controlled." }] },
  "pe": { name: "Peru", substances: [{ name: "Ayahuasca", status: "legal", note: "Protected as cultural patrimony. Retreat centers operate legally." }, { name: "Psilocybin", status: "illegal", note: "Technically illegal but not enforced." }] },
  "uk": { name: "United Kingdom", substances: [{ name: "Psilocybin", status: "illegal", note: "Class A drug. Research exemptions available." }, { name: "Ketamine", status: "medical", note: "Class B. Available by prescription for treatment-resistant depression." }, { name: "MDMA", status: "illegal", note: "Class A. Clinical trials active." }, { name: "Cannabis", status: "medical", note: "Medical cannabis legal since 2018." }] },
  "au": { name: "Australia", substances: [{ name: "Psilocybin", status: "medical", note: "TGA rescheduled for treatment-resistant depression (July 2023)." }, { name: "MDMA", status: "medical", note: "TGA rescheduled for treatment-resistant PTSD (July 2023)." }, { name: "Ketamine", status: "medical", note: "Available by prescription." }, { name: "Cannabis", status: "medical", note: "Medical cannabis legal." }] },
  "other": { name: "Other Countries", substances: [{ name: "General", status: "illegal", note: "Most countries classify psilocybin, MDMA, and DMT as controlled substances. Ketamine is typically available by prescription. Laws are changing rapidly." }] }
};

function showLegalStatus() {
  var select = document.getElementById('locationSelect');
  var results = document.getElementById('legalResults');
  var loc = legalData[select.value];
  if (!loc) { results.innerHTML = ''; return; }
  results.innerHTML = '<h2 style="margin:28px 0 16px;font-family:Newsreader,Georgia,serif;color:#fff;">' + loc.name + '</h2>' +
    loc.substances.map(function(s) {
      return '<div class="legal-substance"><div style="display:flex;justify-content:space-between;align-items:center;"><strong style="color:#E8E4F0;">' + s.name + '</strong><span class="legal-badge ' + s.status + '">' + s.status.charAt(0).toUpperCase() + s.status.slice(1) + '</span></div><p style="margin-top:10px;font-size:15px;color:#9B95AD;">' + s.note + '</p></div>';
    }).join('');
}
</script>
</body></html>`);
});

// 9 Quiz pages
const QUIZZES = [
  { slug: 'microdosing-readiness', title: 'Are You Ready to Microdose?', description: 'Assess your readiness for a microdosing practice.' },
  { slug: 'psychedelic-integration-style', title: 'What Is Your Integration Style?', description: 'Discover how you naturally process psychedelic experiences.' },
  { slug: 'which-modality', title: 'Which Psychedelic Modality Fits You?', description: 'Find the therapeutic approach that matches your needs.' },
  { slug: 'set-and-setting', title: 'How Is Your Set and Setting?', description: 'Evaluate your mental and environmental readiness.' },
  { slug: 'nervous-system-check', title: 'Nervous System Check-In', description: 'Understand your nervous system state before a journey.' },
  { slug: 'meditation-psychedelics', title: 'Meditation or Psychedelics First?', description: 'Explore which path might serve you better right now.' },
  { slug: 'shadow-work-readiness', title: 'Shadow Work Readiness Assessment', description: 'Are you prepared for what might surface?' },
  { slug: 'ceremony-vs-clinic', title: 'Ceremony or Clinic?', description: 'Discover whether a ceremonial or clinical setting suits you.' },
  { slug: 'integration-needs', title: 'What Do You Need to Integrate?', description: 'Identify the areas of your experience that need attention.' },
];

QUIZZES.forEach(quiz => {
  app.get('/quiz/' + quiz.slug, (req, res) => {
    const articles = getPublishedArticles().slice(0, 3);
    const recLinks = articles.map(a => '<div class="pillar"><h3><a href="/articles/' + a.slug + '">' + a.title + '</a></h3></div>').join('');

    res.send(htmlHead(quiz.title + ' — The Quiet Medicine', quiz.description, 'https://thequietmedicine.com/quiz/' + quiz.slug) + `
<body>
` + navHTML() + `
<div class="quiz-wrap">
  <h1>` + quiz.title + `</h1>
  <p style="margin:16px 0 28px;color:var(--text-dim);">` + quiz.description + `</p>
  <div class="quiz-progress"><div class="quiz-bar" id="progressBar" style="width:0%"></div></div>
  <div id="quizContent"></div>
  <div id="quizResult" style="display:none;">
    <h2 id="resultTitle" style="margin-bottom:16px;"></h2>
    <p id="resultText" style="line-height:1.85;color:var(--text);margin-bottom:24px;"></p>
    <div class="share-row">
      <a href="#" id="shareTwitter" rel="nofollow" class="share-btn" aria-label="Share on X">Share on X</a>
      <a href="#" id="shareFB" rel="nofollow" class="share-btn" aria-label="Share on Facebook">Share on Facebook</a>
      <a href="#" onclick="navigator.clipboard.writeText(window.location.href);this.textContent='Copied!';return false;" class="share-btn" aria-label="Copy link">Copy Link</a>
    </div>
    ` + newsletterHTML('quiz-' + quiz.slug) + `
    <h3 style="margin-top:32px;">Recommended Reading</h3>
    ` + recLinks + `
  </div>
</div>
` + footerHTML() + `
` + cookieBannerHTML() + `
` + subscribeScript() + `
<script>
var questions = [
  { q: "How would you describe your current relationship with your inner life?", opts: ["I rarely think about it", "I am curious but have not explored much", "I have a regular contemplative practice", "I have done significant inner work"] },
  { q: "When difficult emotions arise, what is your typical response?", opts: ["I avoid or distract", "I try to think my way through", "I can usually sit with them", "I welcome them as information"] },
  { q: "How familiar are you with the research on this topic?", opts: ["Not at all", "I have read a few articles", "I have studied it seriously", "I am deeply informed"] },
  { q: "What is your primary motivation?", opts: ["Curiosity", "Healing something specific", "Spiritual growth", "Professional development"] },
  { q: "How would you rate your current support system?", opts: ["Minimal", "A few trusted people", "Strong community", "Professional support in place"] }
];
var current = 0, scores = [];
function renderQ() {
  if (current >= questions.length) return showResult();
  var q = questions[current];
  document.getElementById('progressBar').style.width = ((current/questions.length)*100)+'%';
  var html = '<div class="quiz-q"><h3>Question ' + (current+1) + ' of ' + questions.length + '</h3><p>' + q.q + '</p>';
  q.opts.forEach(function(o, i) {
    html += '<div class="quiz-opt" tabindex="0" role="button" onclick="selectOpt('+i+')">' + o + '</div>';
  });
  html += '</div>';
  document.getElementById('quizContent').innerHTML = html;
}
function selectOpt(i) { scores.push(i); current++; renderQ(); }
function showResult() {
  document.getElementById('progressBar').style.width = '100%';
  document.getElementById('quizContent').style.display = 'none';
  document.getElementById('quizResult').style.display = 'block';
  var avg = scores.reduce(function(a,b){return a+b;},0) / scores.length;
  var title, text;
  if (avg < 1) { title = "The Beginning"; text = "You are at the start of this exploration, and that is exactly where you should be. The most important thing right now is not action but education. Read widely, talk to people who have walked this path, and trust that readiness has its own timeline."; }
  else if (avg < 2) { title = "The Threshold"; text = "You are standing at the edge of something, curious enough to look but wise enough to pause. This is the territory where preparation matters most. Consider deepening your contemplative practice before going further."; }
  else if (avg < 3) { title = "The Practitioner"; text = "You have done meaningful inner work and you understand that these experiences are not shortcuts but amplifiers. Your preparation positions you well, but remember: the most transformative experiences often come when we think we are ready and discover we are not."; }
  else { title = "The Integrator"; text = "You bring depth, experience, and a mature relationship with consciousness to this work. Your challenge is not preparation but integration. The question for you is not whether to go deeper, but how to bring what you have already seen into the fabric of daily life."; }
  document.getElementById('resultTitle').textContent = title;
  document.getElementById('resultText').textContent = text;
  var url = encodeURIComponent(window.location.href);
  document.getElementById('shareTwitter').href = 'https://twitter.com/intent/tweet?url='+url+'&text='+encodeURIComponent('I got "'+title+'" on The Quiet Medicine quiz');
  document.getElementById('shareFB').href = 'https://www.facebook.com/sharer/sharer.php?u='+url;
}
renderQ();
</script>
</body></html>`);
  });
});

// 404 handler
function render404(req, res) {
  const articles = getPublishedArticles().slice(0, 6);
  const links = articles.map(a => '<div class="pillar"><h3><a href="/articles/' + a.slug + '">' + a.title + '</a></h3></div>').join('');

  res.status(404).send(htmlHead('Page Not Found — The Quiet Medicine', 'The page you are looking for does not exist.', 'https://thequietmedicine.com/404') + `
<body>
${navHTML()}
<div class="container" style="padding-top:80px;text-align:center;">
  <h1 style="font-size:clamp(36px,5vw,56px);margin-bottom:24px;">Page Not Found</h1>
  <blockquote style="font-family:Newsreader,Georgia,serif;font-size:22px;color:var(--accent-2);margin:32px auto;max-width:600px;font-style:italic;border:none;background:none;padding:0;">The most important things in life cannot be understood — only experienced.</blockquote>
  <p style="margin:24px 0;color:var(--text-dim);">The page you are looking for does not exist, but these might be what you need:</p>
  <div style="max-width:600px;margin:32px auto;text-align:left;">` + links + `</div>
  <p style="margin:40px 0;"><a href="/" style="font-weight:600;">Return Home &rarr;</a></p>
</div>
${footerHTML()}
${cookieBannerHTML()}
</body></html>`);
}

// Static files from dist
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
}

app.use((req, res) => render404(req, res));

app.listen(PORT, '0.0.0.0', () => {
  console.log('[quiet-medicine] Server running on port ' + PORT);
  const articles = loadArticles();
  const published = filterPublished(articles);
  console.log('[quiet-medicine] ' + articles.length + ' total articles, ' + published.length + ' published');
});

export default app;
