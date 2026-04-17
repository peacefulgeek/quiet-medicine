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
  advisorImage: 'https://quiet-medicine.b-cdn.net/images/kalesh-author.webp',
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
      /* Design tokens (addendum 9A) */
      --body-font-size-desktop: 18px;
      --body-font-size-mobile: 16px;
      --line-height-body: 1.75;
      --max-content-width: 720px;
      --tap-target-min: 44px;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { scroll-behavior: smooth; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: var(--body-font-size-desktop);
      line-height: var(--line-height-body);
      color: var(--text);
      background: var(--bg);
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    h1, h2, h3, h4 { font-family: 'Newsreader', Georgia, serif; color: var(--text-bright); font-weight: 600; letter-spacing: -0.02em; }
    a { color: var(--accent-2); text-decoration: none; transition: color 0.2s, opacity 0.2s; }
    a:hover { color: var(--accent-gold); }
    ::selection { background: rgba(124,77,255,0.4); color: white; }
    @media (max-width: 768px) { body { font-size: var(--body-font-size-mobile); } }
    article p, article li { max-width: 72ch; }
    button, a.button, .cta { min-height: var(--tap-target-min); min-width: var(--tap-target-min); }
    img { max-width: 100%; height: auto; display: block; }

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

function articleHasAmazonLinks(article) {
  return (article.body || '').indexOf('amazon.com') !== -1 || (article.body || '').indexOf('amzn.to') !== -1;
}

function sidebarBioHTML() {
  return '<div style="background:var(--bg-card);border:1px solid rgba(255,255,255,0.06);border-radius:var(--radius);padding:24px;margin-bottom:24px;text-align:center;">\n' +
    '<img src="' + SITE.advisorImage + '" alt="Kalesh" width="100" height="100" style="border-radius:50%;margin-bottom:12px;" loading="lazy">\n' +
    '<h4 style="margin-bottom:4px;">Kalesh</h4>\n' +
    '<p style="font-size:13px;color:var(--text-dim);margin-bottom:12px;">Consciousness Teacher &amp; Writer</p>\n' +
    '<p style="font-size:14px;color:var(--text-dim);line-height:1.6;margin-bottom:16px;">' + SITE.advisorBio + '</p>\n' +
    '<a href="' + SITE.advisorLink + '" style="display:inline-block;padding:10px 24px;border-radius:20px;background:var(--accent-1);color:white;font-size:14px;font-weight:600;text-decoration:none;">Book a Session</a>\n' +
    '</div>';
}

function healthDisclaimerHTML() {
  return '<div style="background:rgba(255,82,82,0.08);border:1px solid rgba(255,82,82,0.2);border-radius:var(--radius);padding:20px;margin:32px 0;">\n' +
    '<p style="font-size:14px;color:#FF8A80;font-weight:600;margin-bottom:8px;">Health Disclaimer</p>\n' +
    '<p style="font-size:13px;color:var(--text-dim);line-height:1.7;">This article is for educational purposes only and does not constitute medical advice. Psychedelic substances carry real risks and are illegal in many jurisdictions. Always consult a qualified healthcare provider before making decisions about your health. If you are in crisis, contact the 988 Suicide &amp; Crisis Lifeline (call or text 988).</p>\n' +
    '</div>';
}

function affiliateDisclosureHTML() {
  return '<div class="affiliate-disclosure" style="background:rgba(124,77,255,0.08);border:1px solid rgba(124,77,255,0.2);border-radius:var(--radius);padding:16px;margin-bottom:24px;">\n' +
    '<p style="font-size:13px;color:var(--text-dim);line-height:1.6;">This article contains affiliate links. If you purchase through these links, we may earn a small commission at no extra cost to you. We only recommend products we genuinely trust. <span style="font-size:12px;">(paid link)</span></p>\n' +
    '</div>';
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

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

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

// ─── TOOLS WE RECOMMEND ───
const AMAZON_TAG = 'spankyspinola-20';
const PRODUCTS = [
  { name: 'Precision Milligram Scale', asin: 'B0B9HZ1599', price: '$12.99', cat: 'Microdosing Essentials', desc: 'Accurate to 0.001g. Essential for consistent microdosing protocols.' },
  { name: 'Size 00 Vegetarian Capsules', asin: 'B09NBCNHXP', price: '$8.99', cat: 'Microdosing Essentials', desc: 'Empty capsules for precise, tasteless microdose preparation.' },
  { name: 'Capsule Filling Machine (00)', asin: 'B07RXYNT9N', price: '$24.99', cat: 'Microdosing Essentials', desc: 'Fill 100 capsules at once. Saves hours of manual preparation.' },
  { name: 'Coffee Grinder for Mushrooms', asin: 'B001804CLY', price: '$19.99', cat: 'Microdosing Essentials', desc: 'Dedicated grinder for consistent powder consistency.' },
  { name: 'Amber Glass Storage Jars', asin: 'B07Y2KSFNJ', price: '$13.99', cat: 'Microdosing Essentials', desc: 'UV-protective storage to preserve potency.' },
  { name: 'Moleskin Dot Grid Journal', asin: 'B015NG45GW', price: '$19.95', cat: 'Journaling & Integration', desc: 'Premium journal for tracking microdosing protocols and integration insights.' },
  { name: 'Leuchtturm1917 A5 Notebook', asin: 'B002TSIMW4', price: '$21.50', cat: 'Journaling & Integration', desc: 'Numbered pages and index for organized reflection.' },
  { name: 'Silk Eye Mask for Ceremonies', asin: 'B07KC5DWCC', price: '$9.99', cat: 'Ceremony & Journey', desc: 'Complete darkness for inward-focused psychedelic sessions.' },
  { name: 'Bose QuietComfort Earbuds', asin: 'B0D5XM5M4M', price: '$179.00', cat: 'Ceremony & Journey', desc: 'Noise-cancelling earbuds for curated psychedelic playlists.' },
  { name: 'Tibetan Singing Bowl Set', asin: 'B07V2JLHX4', price: '$29.99', cat: 'Ceremony & Journey', desc: 'Sound healing tool for ceremony opening and closing.' },
  { name: 'Organic Cacao Ceremonial Grade', asin: 'B0BXMVHWMB', price: '$24.99', cat: 'Ceremony & Journey', desc: 'Heart-opening ceremonial cacao for intention-setting rituals.' },
  { name: 'Meditation Cushion Zafu', asin: 'B01E6JR1CO', price: '$39.99', cat: 'Meditation & Breathwork', desc: 'Buckwheat-filled zafu for comfortable seated meditation.' },
  { name: 'Insight Timer Premium', asin: 'B08YNQBFPX', price: '$59.99', cat: 'Meditation & Breathwork', desc: 'Timer and guided meditations for daily practice.' },
  { name: 'Wim Hof Method Book', asin: 'B0916VWZCF', price: '$16.99', cat: 'Meditation & Breathwork', desc: 'Breathwork fundamentals that complement psychedelic practice.' },
  { name: 'How to Change Your Mind', asin: 'B076GPJXWZ', price: '$14.99', cat: 'Books & Education', desc: 'Michael Pollan\'s essential guide to the psychedelic renaissance.' },
  { name: 'The Psychedelic Explorer\'s Guide', asin: 'B005OSSI6C', price: '$13.99', cat: 'Books & Education', desc: 'James Fadiman\'s foundational text on safe psychedelic use.' },
  { name: 'Stealing Fire', asin: 'B01HNJIJB2', price: '$15.99', cat: 'Books & Education', desc: 'Kotler & Wheal on altered states and peak performance.' },
  { name: 'The Body Keeps the Score', asin: 'B00G3L1C2K', price: '$11.99', cat: 'Books & Education', desc: 'Bessel van der Kolk on trauma and the body — essential context for psychedelic healing.' },
  { name: 'Waking Up by Sam Harris', asin: 'B00GEEB9YC', price: '$13.99', cat: 'Books & Education', desc: 'Spirituality without religion — a framework for understanding psychedelic insights.' },
  { name: 'Lions Mane Mushroom Capsules', asin: 'B078SZX3ML', price: '$23.95', cat: 'Supplements & Stacking', desc: 'Organic lion\'s mane for the Stamets Stack protocol.' },
  { name: 'Niacin (Vitamin B3) 500mg', asin: 'B00068TJIG', price: '$9.99', cat: 'Supplements & Stacking', desc: 'Flush niacin for the Stamets Stack microdosing protocol.' },
  { name: 'Magnesium Glycinate', asin: 'B000BD0RT0', price: '$14.99', cat: 'Supplements & Stacking', desc: 'Calming magnesium form. Supports nervous system during integration.' },
  { name: 'Weighted Blanket 15 lbs', asin: 'B07L2RGQL5', price: '$39.99', cat: 'Integration & Comfort', desc: 'Grounding comfort during integration days and difficult experiences.' },
  { name: 'Essential Oil Diffuser', asin: 'B07L4LHSSP', price: '$15.99', cat: 'Integration & Comfort', desc: 'Aromatherapy support for set and setting preparation.' },
  { name: 'Organic Peppermint Tea', asin: 'B000E63LFC', price: '$4.99', cat: 'Integration & Comfort', desc: 'Gentle stomach support during and after psychedelic experiences.' },
];

app.get('/tools', (req, res) => {
  const categories = [...new Set(PRODUCTS.map(p => p.cat))];
  const productCards = categories.map(cat => {
    const items = PRODUCTS.filter(p => p.cat === cat);
    return '<div style="margin-bottom:48px;"><h2 style="font-family:Newsreader,Georgia,serif;font-size:28px;margin-bottom:24px;color:#E8E4F0;">' + cat + '</h2><div class="card-grid">' +
      items.map(p => '<div class="card" style="padding:24px;"><h3 style="font-size:18px;margin-bottom:8px;"><a href="https://www.amazon.com/dp/' + p.asin + '?tag=' + AMAZON_TAG + '" target="_blank" rel="nofollow sponsored" style="color:var(--accent-2);">' + p.name + ' <span style="font-size:12px;color:var(--text-dim);">(paid link)</span></a></h3><p style="font-size:14px;color:var(--text-dim);line-height:1.6;margin-bottom:12px;">' + p.desc + '</p><span style="font-size:15px;font-weight:600;color:var(--accent-1);">' + p.price + '</span></div>').join('') +
      '</div></div>';
  }).join('');

  res.send(htmlHead('Tools We Recommend — The Quiet Medicine', 'Carefully selected tools, books, and supplies for microdosing, ceremony, integration, and contemplative practice.', SITE.domain + '/tools') +
    '<body>' + navHTML() +
    '<main class="container" style="padding:80px 24px 60px;">\n' +
    '<h1 style="font-family:Newsreader,Georgia,serif;font-size:clamp(36px,5vw,52px);margin-bottom:16px;">Tools We Recommend</h1>\n' +
    '<p style="font-size:17px;color:var(--text-dim);max-width:700px;line-height:1.7;margin-bottom:48px;">Every tool on this page has been personally vetted. We only recommend products we have used or would use ourselves. Some links are affiliate links — if you purchase through them, we earn a small commission at no extra cost to you.</p>\n' +
    affiliateDisclosureHTML() +
    productCards +
    '</main>' + footerHTML() + cookieBannerHTML() +
    '</body></html>');
});

// ─── QUIZZES INDEX ───
var quizzes = [
  { slug: 'microdosing-readiness', title: 'Microdosing Readiness Quiz', desc: 'Assess whether your current life circumstances, mental health, and intentions align with a microdosing practice.', questions: [
    { q: 'How would you describe your current mental health baseline?', opts: ['Struggling significantly', 'Some challenges but managing', 'Generally stable', 'Strong and resilient'] },
    { q: 'What is your primary intention for exploring microdosing?', opts: ['Escape from pain', 'Curiosity without direction', 'Specific personal growth goal', 'Deepening an existing practice'] },
    { q: 'How comfortable are you with uncertainty and non-linear experiences?', opts: ['Very uncomfortable', 'Somewhat anxious about it', 'Open but cautious', 'Comfortable with ambiguity'] },
    { q: 'Do you have a meditation or contemplative practice?', opts: ['No practice at all', 'Occasional and inconsistent', 'Regular but relatively new', 'Established daily practice'] },
    { q: 'How would you rate your current support system?', opts: ['Minimal support', 'A few trusted people', 'Strong community', 'Professional support in place'] },
    { q: 'Are you currently taking psychiatric medications?', opts: ['Yes, multiple', 'Yes, one medication', 'Recently discontinued', 'No psychiatric medications'] },
  ], results: [
    { title: 'Not Yet Ready', text: 'Your current circumstances suggest that now may not be the right time to begin a microdosing practice. Focus first on stabilizing your mental health foundation, building a support network, and developing a contemplative practice. The medicine will still be there when the timing is right.' },
    { title: 'Approaching Readiness', text: 'You are moving toward readiness but would benefit from more preparation. Consider deepening your meditation practice, clarifying your intentions, and consulting with a healthcare provider about your specific situation before proceeding.' },
    { title: 'Well Prepared', text: 'Your preparation, intentions, and support system suggest you are in a good position to explore microdosing thoughtfully. Remember that preparation is ongoing, not a checkbox. Continue building your practice alongside any protocol.' },
    { title: 'Deeply Ready', text: 'You bring significant preparation, clarity of intention, and support to this exploration. Your challenge is not whether to begin but how to approach it with the reverence and rigor it deserves. Trust your preparation and stay curious.' },
  ]},
  { slug: 'substance-match', title: 'Which Substance Might Suit You?', desc: 'Based on your goals, temperament, and circumstances, discover which psychedelic modality aligns with your needs.', questions: [
    { q: 'What draws you most to psychedelic exploration?', opts: ['Relief from depression or anxiety', 'Creative enhancement and flow', 'Spiritual depth and meaning', 'Processing trauma or grief'] },
    { q: 'How do you prefer to explore consciousness?', opts: ['Gentle and gradual', 'Structured clinical setting', 'Deep ceremonial immersion', 'Self-directed with precision'] },
    { q: 'What is your relationship with nature?', opts: ['Mostly indoors', 'Appreciate it occasionally', 'Regular time outdoors', 'Deep ecological connection'] },
    { q: 'How long of a commitment feels right?', opts: ['A few hours maximum', 'A full day experience', 'Multiple days of ceremony', 'Ongoing daily practice'] },
    { q: 'What matters most in your approach?', opts: ['Clinical safety and oversight', 'Ancient tradition and lineage', 'Scientific evidence base', 'Personal autonomy and control'] },
  ], results: [
    { title: 'Ketamine-Assisted Therapy', text: 'Your preferences point toward ketamine-assisted therapy. It offers clinical safety, shorter duration, and legal accessibility. The dissociative experience can provide profound perspective shifts while remaining in a controlled medical environment.' },
    { title: 'Psilocybin Microdosing', text: 'A psilocybin microdosing protocol aligns well with your goals. The sub-perceptual approach allows integration into daily life while supporting creativity, emotional processing, and neuroplasticity over time.' },
    { title: 'Ceremonial Ayahuasca', text: 'Your orientation toward depth, tradition, and transformative experience suggests ceremonial ayahuasca. This path requires significant preparation and the right ceremonial container, but offers unparalleled depth of insight.' },
    { title: 'MDMA-Assisted Therapy', text: 'Your focus on emotional processing and trauma work aligns with MDMA-assisted therapy. The empathogenic qualities of MDMA create a unique window for processing difficult experiences with self-compassion and clarity.' },
  ]},
  { slug: 'integration-style', title: 'Your Integration Style', desc: 'Discover how you naturally process and integrate transformative experiences into daily life.', questions: [
    { q: 'After a powerful experience, what do you do first?', opts: ['Talk to someone immediately', 'Write or journal about it', 'Sit in silence and feel', 'Move your body'] },
    { q: 'How do you make sense of things that defy logic?', opts: ['Research and read about it', 'Create art or music', 'Meditate and sit with it', 'Discuss with others'] },
    { q: 'What helps you feel grounded?', opts: ['Physical exercise', 'Time in nature', 'Structured routine', 'Creative expression'] },
    { q: 'When insights arise, how do you capture them?', opts: ['Voice memos and notes', 'Drawing or visual art', 'Body-based practices', 'Conversation with a guide'] },
    { q: 'What does integration mean to you?', opts: ['Understanding what happened', 'Changing daily habits', 'Deepening spiritual practice', 'Healing relationships'] },
  ], results: [
    { title: 'The Verbal Processor', text: 'You integrate through language and dialogue. Working with an integration therapist, joining a psychedelic integration circle, or maintaining a detailed journal will serve you well. Your insights crystallize through articulation.' },
    { title: 'The Somatic Integrator', text: 'Your body is your primary integration tool. Yoga, breathwork, dance, and somatic experiencing will help you process what the mind cannot yet articulate. Trust the wisdom of your nervous system.' },
    { title: 'The Contemplative', text: 'Silence and stillness are your integration allies. A deepened meditation practice, time in nature, and periods of deliberate solitude will allow your experiences to unfold at their own pace.' },
    { title: 'The Creative Channel', text: 'You integrate through creation. Art, music, writing, and movement allow you to express what cannot be spoken. Your integration practice is inherently creative and non-linear.' },
  ]},
  { slug: 'set-and-setting', title: 'Set & Setting Assessment', desc: 'Evaluate whether your current mindset and environment are conducive to a meaningful psychedelic experience.', questions: [
    { q: 'How would you describe your emotional state this week?', opts: ['Turbulent and unstable', 'Somewhat anxious', 'Calm and centered', 'Deeply peaceful'] },
    { q: 'Is your physical space clean, safe, and comfortable?', opts: ['Chaotic environment', 'Somewhat cluttered', 'Clean and organized', 'Intentionally prepared'] },
    { q: 'Do you have a trusted person available if needed?', opts: ['No one available', 'Someone I could call', 'A friend who understands', 'An experienced sitter confirmed'] },
    { q: 'Have you set a clear intention?', opts: ['No intention set', 'Vague sense of purpose', 'Written intention', 'Intention refined through meditation'] },
    { q: 'How is your physical health right now?', opts: ['Unwell or depleted', 'Minor issues', 'Generally healthy', 'Well-rested and nourished'] },
    { q: 'Are there unresolved conflicts in your life right now?', opts: ['Major ongoing conflicts', 'Some tension present', 'Minor issues only', 'Relationships feel clear'] },
  ], results: [
    { title: 'Wait and Prepare', text: 'Your current set and setting suggest waiting. There is no rush. Use this time to resolve what can be resolved, prepare your space, secure support, and cultivate the inner stability that will serve as your foundation.' },
    { title: 'Almost There', text: 'You are close but a few elements need attention. Focus on the specific areas that scored lower — whether that is your physical space, emotional state, or support system. Small adjustments can make a significant difference.' },
    { title: 'Good Foundation', text: 'Your set and setting are solid. You have done the preparation work and your circumstances support a meaningful experience. Stay present with your intention and trust the container you have created.' },
    { title: 'Optimal Conditions', text: 'Your preparation is thorough and your circumstances are aligned. The care you have taken with set and setting reflects the respect this work deserves. Proceed with confidence and surrender.' },
  ]},
  { slug: 'psychedelic-knowledge', title: 'Psychedelic Literacy Quiz', desc: 'Test your understanding of psychedelic science, history, and harm reduction principles.', questions: [
    { q: 'What does "set and setting" refer to?', opts: ['Drug dosage and timing', 'Mindset and environment', 'Legal status and location', 'Music and lighting'] },
    { q: 'Which researcher pioneered modern psilocybin research at Johns Hopkins?', opts: ['Timothy Leary', 'Roland Griffiths', 'Alexander Shulgin', 'Stanislav Grof'] },
    { q: 'What is the default mode network?', opts: ['A social media platform', 'A brain network active during self-referential thought', 'A type of neural pathway', 'A meditation technique'] },
    { q: 'What does "integration" mean in psychedelic therapy?', opts: ['Mixing substances together', 'Processing and applying insights from experiences', 'Combining therapy modalities', 'Returning to normal consciousness'] },
    { q: 'Which substance is currently FDA-approved for treatment-resistant depression?', opts: ['Psilocybin', 'MDMA', 'Esketamine (Spravato)', 'LSD'] },
    { q: 'What is a common microdose of psilocybin?', opts: ['5 grams', '0.1 to 0.3 grams', '1 to 2 grams', '3.5 grams'] },
  ], results: [
    { title: 'Beginner Explorer', text: 'You are at the beginning of your psychedelic education, and that is a perfectly valid place to be. Start with foundational reading — Michael Pollan\'s "How to Change Your Mind" is an excellent entry point. Knowledge is the first form of harm reduction.' },
    { title: 'Developing Understanding', text: 'You have some foundational knowledge but there are gaps worth filling. Dive deeper into the neuroscience and harm reduction literature. Understanding the mechanisms helps you approach these experiences with appropriate respect.' },
    { title: 'Well Informed', text: 'Your knowledge base is solid. You understand the key concepts, researchers, and principles that inform responsible psychedelic use. Continue staying current with emerging research and clinical developments.' },
    { title: 'Deep Literacy', text: 'You demonstrate sophisticated understanding of psychedelic science and practice. Your knowledge positions you to be a resource for others in your community. Consider how you might share what you know responsibly.' },
  ]},
  { slug: 'harm-reduction', title: 'Harm Reduction Awareness', desc: 'Evaluate your understanding of safety practices and risk mitigation in psychedelic use.', questions: [
    { q: 'What should you do if someone is having a difficult psychedelic experience?', opts: ['Give them more substances', 'Leave them alone', 'Stay calm, reassure them, change the setting', 'Call 911 immediately'] },
    { q: 'Which combination is considered most dangerous?', opts: ['Psilocybin and meditation', 'MDMA and SSRIs', 'Cannabis and breathwork', 'Microdosing and journaling'] },
    { q: 'How long should you wait between macro-dose experiences?', opts: ['No waiting needed', 'At least 24 hours', 'At least 2-4 weeks minimum', 'Exactly 7 days'] },
    { q: 'What is the purpose of testing substances?', opts: ['To increase potency', 'To verify identity and detect adulterants', 'To measure exact dosage', 'Testing is unnecessary'] },
    { q: 'When should you NOT use psychedelics?', opts: ['During a full moon', 'If you have a family history of psychosis', 'If you are over 40', 'If you have not fasted'] },
  ], results: [
    { title: 'Safety First', text: 'Your harm reduction knowledge needs strengthening before proceeding with any psychedelic use. This is not a judgment — it is an invitation to learn the practices that keep people safe. Start with resources from DanceSafe and the Zendo Project.' },
    { title: 'Building Awareness', text: 'You have some safety awareness but important gaps remain. Focus on drug interactions, contraindications, and crisis support techniques. These are not abstract concepts — they are practical skills that matter.' },
    { title: 'Safety Conscious', text: 'You demonstrate good harm reduction awareness. You understand the key risks and how to mitigate them. Continue refining your knowledge, especially around drug interactions and medical contraindications.' },
    { title: 'Harm Reduction Advocate', text: 'Your understanding of harm reduction is thorough and practical. You are well-positioned to not only keep yourself safe but to support others. Consider training as a peer support volunteer or trip sitter.' },
  ]},
  { slug: 'meditation-depth', title: 'Meditation Practice Depth', desc: 'Assess the depth and consistency of your contemplative practice as it relates to psychedelic exploration.', questions: [
    { q: 'How often do you meditate?', opts: ['Never or rarely', 'A few times per month', 'Several times per week', 'Daily practice'] },
    { q: 'What is your typical session length?', opts: ['Under 5 minutes', '5-15 minutes', '15-30 minutes', '30+ minutes'] },
    { q: 'Can you maintain focused attention for extended periods?', opts: ['Very difficult', 'Challenging but improving', 'Reasonably stable', 'Strong concentration ability'] },
    { q: 'Have you experienced states of deep stillness or absorption?', opts: ['Never', 'Brief glimpses', 'Occasionally', 'Regularly'] },
    { q: 'How do you relate to difficult emotions during meditation?', opts: ['Avoid or suppress them', 'Get caught up in them', 'Observe with some distance', 'Welcome them with equanimity'] },
  ], results: [
    { title: 'The Seed', text: 'Your meditation practice is just beginning, and that is beautiful. Even five minutes of daily sitting will transform your relationship with your own mind over time. Start small, be consistent, and let the practice teach you.' },
    { title: 'The Sprout', text: 'Your practice is developing roots. The consistency you are building matters more than the depth of any single session. Consider working with a teacher or structured program to deepen your foundation.' },
    { title: 'The Flowering', text: 'You have a meaningful practice that provides real stability and insight. This foundation will serve you well in psychedelic exploration, where the skills of observation and equanimity become profoundly relevant.' },
    { title: 'The Fruit', text: 'Your contemplative practice is mature and deep. The qualities you have cultivated — concentration, equanimity, and open awareness — are precisely what allow psychedelic experiences to be most transformative.' },
  ]},
  { slug: 'psychedelic-personality', title: 'Your Psychedelic Personality', desc: 'Discover your natural orientation toward psychedelic experience based on your temperament and values.', questions: [
    { q: 'What aspect of consciousness interests you most?', opts: ['How the brain creates experience', 'The nature of self and identity', 'Connection to something larger', 'Healing emotional wounds'] },
    { q: 'How do you approach the unknown?', opts: ['With careful analysis', 'With creative curiosity', 'With spiritual reverence', 'With therapeutic intention'] },
    { q: 'What would a breakthrough experience look like for you?', opts: ['Understanding a scientific mechanism', 'Dissolving creative blocks', 'Experiencing unity consciousness', 'Releasing stored trauma'] },
    { q: 'Who would you most want to guide your experience?', opts: ['A neuroscientist', 'An artist or musician', 'A spiritual teacher', 'A trained therapist'] },
    { q: 'What do you want to bring back from the experience?', opts: ['Knowledge and understanding', 'Inspiration and vision', 'Peace and connection', 'Healing and wholeness'] },
  ], results: [
    { title: 'The Scientist', text: 'You approach psychedelics through the lens of understanding. You want to know how and why these compounds work. Your path is through research, measurement, and careful observation. The mystery does not diminish with understanding — it deepens.' },
    { title: 'The Artist', text: 'You approach psychedelics as a creative catalyst. You are drawn to the aesthetic dimensions of altered states — the visual, the musical, the poetic. Your integration is inherently creative, and your experiences want to be expressed.' },
    { title: 'The Mystic', text: 'You approach psychedelics as a doorway to the sacred. You are drawn to the transpersonal dimensions of experience — unity, interconnection, and the dissolution of the separate self. Your path is devotional and contemplative.' },
    { title: 'The Healer', text: 'You approach psychedelics as medicine for the soul. You are drawn to their therapeutic potential — the ability to process trauma, release patterns, and restore wholeness. Your path is through the body and the heart.' },
  ]},
];

app.get('/quizzes', (req, res) => {
  res.send(htmlHead('Quizzes — ' + SITE.title, 'Interactive quizzes to explore your readiness, preferences, and path in psychedelic wellness.', SITE.domain + '/quizzes') + '\n' +
    '<body>\n' + navHTML() + '\n' +
    '<div class="hero" style="padding:60px 24px 40px;">\n' +
    '  <div class="hero-content"><h1>Quizzes</h1><p class="tagline">Explore your readiness, discover your path, and deepen your understanding.</p></div>\n' +
    '</div>\n' +
    '<main class="wide" style="padding-top:40px;">\n' +
    '<div class="quiz-index-grid">\n' +
    quizzes.map(function(q) {
      return '<div class="quiz-index-card"><h3><a href="/quiz/' + q.slug + '">' + q.title + '</a></h3><p>' + q.desc + '</p></div>';
    }).join('\n') + '\n' +
    '</div>\n' +
    '</main>\n' + footerHTML() + '\n' + cookieBannerHTML() + '\n' +
    '</body></html>');
});


// ─── INDIVIDUAL QUIZ PAGES ───
quizzes.forEach(function(quiz) {
  app.get('/quiz/' + quiz.slug, (req, res) => {
    var questionsJson = JSON.stringify(quiz.questions);
    var resultsJson = JSON.stringify(quiz.results);

    res.send(htmlHead(quiz.title + ' — ' + SITE.title, quiz.desc, SITE.domain + '/quiz/' + quiz.slug) + '\n' +
      '<body>\n' + navHTML() + '\n' +
      '<div class="quiz-wrap">\n' +
      '  <h1 style="font-size:clamp(24px,4vw,36px);margin-bottom:8px;">' + quiz.title + '</h1>\n' +
      '  <p style="color:var(--text-dim);margin-bottom:32px;">' + quiz.desc + '</p>\n' +
      '  <div class="quiz-progress"><div class="quiz-bar" id="progressBar" style="width:0%;"></div></div>\n' +
      '  <div id="quizContent"></div>\n' +
      '  <div id="quizResult" style="display:none;">\n' +
      '    <div style="background:var(--bg-card);border:1px solid rgba(124,77,255,0.3);border-radius:var(--radius);padding:40px;text-align:center;">\n' +
      '      <h2 id="resultTitle" style="font-size:28px;margin-bottom:16px;"></h2>\n' +
      '      <p id="resultText" style="color:var(--text-dim);font-size:17px;line-height:1.7;max-width:600px;margin:0 auto 24px;"></p>\n' +
      '      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">\n' +
      '        <a id="shareTwitter" href="#" class="share-btn" target="_blank" rel="noopener">Share on X</a>\n' +
      '        <a id="shareFB" href="#" class="share-btn" target="_blank" rel="noopener">Share on Facebook</a>\n' +
      '        <button class="pdf-btn" onclick="exportPDF()">Download PDF</button>\n' +
      '      </div>\n' +
      '    </div>\n' +
      '  </div>\n' +
      '</div>\n' +
      footerHTML() + '\n' + cookieBannerHTML() + '\n' +
      '<script>\n' +
      'var questions = ' + questionsJson + ';\n' +
      'var results = ' + resultsJson + ';\n' +
      'var current = 0, scores = [];\n' +
      'function renderQ() {\n' +
      '  if (current >= questions.length) return showResult();\n' +
      '  var q = questions[current];\n' +
      '  document.getElementById("progressBar").style.width = ((current/questions.length)*100)+"%";\n' +
      '  var html = \'<div class="quiz-q"><h3>Question \' + (current+1) + \' of \' + questions.length + \'</h3><p>\' + q.q + \'</p>\';\n' +
      '  q.opts.forEach(function(o, i) {\n' +
      '    html += \'<div class="quiz-opt" tabindex="0" role="button" onclick="selectOpt(\'+i+\')">\' + o + \'</div>\';\n' +
      '  });\n' +
      '  html += "</div>";\n' +
      '  document.getElementById("quizContent").innerHTML = html;\n' +
      '}\n' +
      'function selectOpt(i) { scores.push(i); current++; renderQ(); }\n' +
      'function showResult() {\n' +
      '  document.getElementById("progressBar").style.width = "100%";\n' +
      '  document.getElementById("quizContent").style.display = "none";\n' +
      '  document.getElementById("quizResult").style.display = "block";\n' +
      '  var avg = scores.reduce(function(a,b){return a+b;},0) / scores.length;\n' +
      '  var idx = Math.min(Math.floor(avg), results.length - 1);\n' +
      '  var r = results[idx];\n' +
      '  document.getElementById("resultTitle").textContent = r.title;\n' +
      '  document.getElementById("resultText").textContent = r.text;\n' +
      '  var url = encodeURIComponent(window.location.href);\n' +
      '  document.getElementById("shareTwitter").href = "https://twitter.com/intent/tweet?url="+url+"&text="+encodeURIComponent("I got \\\""+r.title+"\\\" on "+document.title);\n' +
      '  document.getElementById("shareFB").href = "https://www.facebook.com/sharer/sharer.php?u="+url;\n' +
      '}\n' +
      'function exportPDF() {\n' +
      '  var title = document.getElementById("resultTitle").textContent;\n' +
      '  var text = document.getElementById("resultText").textContent;\n' +
      '  var w = window.open("","_blank");\n' +
      '  w.document.write("<html><head><title>"+document.title+" — Results</title><style>body{font-family:Georgia,serif;max-width:600px;margin:40px auto;padding:20px;color:#333;line-height:1.8;}h1{font-size:28px;color:#4A148C;margin-bottom:8px;}h2{font-size:22px;color:#7C4DFF;margin:24px 0 12px;}p{font-size:16px;margin-bottom:16px;}.footer{margin-top:40px;padding-top:16px;border-top:1px solid #ddd;font-size:12px;color:#999;}</style></head><body>");\n' +
      '  w.document.write("<h1>' + escapeHtml(quiz.title) + '</h1>");\n' +
      '  w.document.write("<p style=\\"color:#666;\\">The Quiet Medicine — thequietmedicine.com</p>");\n' +
      '  w.document.write("<h2>Your Result: "+title+"</h2>");\n' +
      '  w.document.write("<p>"+text+"</p>");\n' +
      '  w.document.write("<div class=\\"footer\\">Generated by The Quiet Medicine. For educational purposes only. Visit <a href=\\"https://kalesh.love\\">kalesh.love</a> for guidance.</div>");\n' +
      '  w.document.write("</body></html>");\n' +
      '  w.document.close();\n' +
      '  setTimeout(function(){ w.print(); }, 500);\n' +
      '}\n' +
      'renderQ();\n' +
      '</script>\n' +
      '</body></html>');
  });
});

// ─── ASSESSMENTS ───
var assessments = [
  { slug: 'psychedelic-readiness', title: 'Psychedelic Readiness Assessment', desc: 'A comprehensive evaluation of your physical, psychological, and social readiness for a psychedelic experience.', questions: [
    { q: 'How stable has your mood been over the past 3 months?', opts: ['Very unstable — frequent swings', 'Somewhat unstable', 'Mostly stable with occasional dips', 'Consistently stable'] },
    { q: 'Do you have a personal or family history of psychotic disorders?', opts: ['Yes, personal history', 'Yes, close family history', 'Distant family history only', 'No known history'] },
    { q: 'How would you rate your physical health?', opts: ['Significant health concerns', 'Some chronic issues', 'Generally healthy', 'Excellent health'] },
    { q: 'Are you currently using any substances regularly?', opts: ['Heavy use of multiple substances', 'Regular use of one substance', 'Occasional recreational use', 'No substance use'] },
    { q: 'How developed is your emotional regulation capacity?', opts: ['Frequently overwhelmed', 'Sometimes struggle with emotions', 'Usually able to self-regulate', 'Strong emotional regulation skills'] },
    { q: 'Do you have access to professional mental health support?', opts: ['No access', 'Could find someone if needed', 'Have a therapist but not psychedelic-informed', 'Have a psychedelic-informed therapist'] },
    { q: 'How clear are your intentions for this experience?', opts: ['No clear intention', 'Vague sense of wanting change', 'Specific but untested intention', 'Well-refined intention through reflection'] },
    { q: 'How comfortable are you with surrendering control?', opts: ['Very uncomfortable', 'Anxious but willing', 'Reasonably comfortable', 'Practiced at letting go'] },
  ], results: [
    { title: 'Significant Preparation Needed', text: 'This assessment indicates several areas that need attention before proceeding with a psychedelic experience. This is not a failure — it is valuable information. Focus on building your foundation: stabilize your mental health, develop a contemplative practice, and establish professional support. The most courageous thing you can do right now is wait and prepare.' },
    { title: 'Moderate Preparation Recommended', text: 'You have some foundation in place but important areas need strengthening. Consider working with a therapist to address the specific areas that scored lower. Building emotional regulation skills and clarifying your intentions will significantly improve both the safety and depth of any future experience.' },
    { title: 'Good Readiness Level', text: 'Your assessment suggests a solid foundation for psychedelic exploration. You have addressed many of the key preparation areas and your circumstances support a meaningful experience. Continue refining your intentions and ensure your support system is in place before proceeding.' },
    { title: 'High Readiness', text: 'Your preparation is thorough across physical, psychological, and social dimensions. You demonstrate the kind of thoughtful, informed approach that leads to the most meaningful experiences. Trust your preparation while remaining humble before the unknown.' },
  ]},
  { slug: 'integration-needs', title: 'Integration Needs Assessment', desc: 'Identify what kind of integration support would serve you best after a psychedelic experience.', questions: [
    { q: 'How do you typically process intense emotional experiences?', opts: ['Suppress or avoid them', 'Ruminate and overthink', 'Talk them through with others', 'Sit with them in contemplation'] },
    { q: 'What is your relationship with your body?', opts: ['Disconnected from body sensations', 'Aware but uncomfortable', 'Growing body awareness', 'Strong somatic awareness'] },
    { q: 'How do you handle experiences that challenge your worldview?', opts: ['Reject and return to familiar', 'Feel destabilized for extended periods', 'Process gradually over time', 'Welcome paradigm shifts'] },
    { q: 'What creative outlets do you have?', opts: ['None currently', 'Occasional creative activity', 'Regular creative practice', 'Multiple creative outlets'] },
    { q: 'How is your relationship with sleep and rest?', opts: ['Chronic sleep issues', 'Irregular sleep patterns', 'Generally good sleep', 'Excellent sleep hygiene'] },
    { q: 'Do you have a community that understands this work?', opts: ['No one who understands', 'One or two people', 'A small supportive circle', 'Active integration community'] },
  ], results: [
    { title: 'Intensive Support Recommended', text: 'Your integration needs are significant and would benefit from professional support. Consider working with a psychedelic integration therapist who can provide the structured container you need. Somatic therapy may be particularly valuable given your relationship with body awareness. Building community connections will also be essential.' },
    { title: 'Structured Support Beneficial', text: 'You would benefit from a structured integration approach that combines professional guidance with personal practice. A regular therapy schedule, journaling practice, and gradual community building will create the support network your integration needs.' },
    { title: 'Self-Directed with Check-ins', text: 'You have good internal resources for integration but would benefit from periodic check-ins with a therapist or integration circle. Your existing practices and awareness provide a solid foundation. Focus on deepening what is already working.' },
    { title: 'Strong Self-Integration Capacity', text: 'You have well-developed integration resources — body awareness, creative outlets, community, and contemplative practice. Your integration path can be largely self-directed with the support of your existing network. Trust your process while remaining open to professional support when needed.' },
  ]},
  { slug: 'trauma-sensitivity', title: 'Trauma Sensitivity Screen', desc: 'A gentle assessment to help you understand how trauma may interact with psychedelic experiences.', questions: [
    { q: 'Do you experience flashbacks or intrusive memories?', opts: ['Frequently and intensely', 'Sometimes', 'Rarely', 'Not at all'] },
    { q: 'How do you respond to unexpected loud noises or surprises?', opts: ['Extreme startle response', 'Noticeable but manageable', 'Mild reaction', 'Calm response'] },
    { q: 'Do you experience physical tension or pain without clear cause?', opts: ['Constant tension', 'Frequent unexplained tension', 'Occasional', 'Rarely'] },
    { q: 'How safe do you generally feel in your body?', opts: ['Rarely feel safe', 'Safety comes and goes', 'Usually feel safe', 'Strong sense of embodied safety'] },
    { q: 'Are you currently working with a trauma-informed therapist?', opts: ['No, and have significant trauma', 'No, but considering it', 'Yes, early in the process', 'Yes, with significant progress'] },
    { q: 'How do you respond to loss of control?', opts: ['Panic or dissociation', 'Significant anxiety', 'Discomfort but manageable', 'Can surrender with practice'] },
  ], results: [
    { title: 'High Sensitivity — Professional Support Essential', text: 'This assessment suggests significant trauma sensitivity that requires professional support before considering psychedelic experiences. Psychedelics can amplify trauma responses, and without proper preparation and support, this could be retraumatizing rather than healing. Work with a trauma-informed therapist to build your window of tolerance before proceeding.' },
    { title: 'Moderate Sensitivity — Careful Preparation Needed', text: 'You show moderate trauma sensitivity that warrants careful preparation. Working with a trauma-informed therapist to develop grounding techniques and expand your window of tolerance will be important. If you proceed with psychedelic work, ensure you have experienced, trauma-aware support present.' },
    { title: 'Manageable Sensitivity — Proceed with Awareness', text: 'Your trauma sensitivity is present but manageable. You have developed some capacity to work with difficult material. Ensure your set and setting account for the possibility of trauma material arising, and have grounding techniques readily available.' },
    { title: 'Low Sensitivity — Standard Preparation Sufficient', text: 'Your trauma sensitivity screen suggests a relatively stable baseline. Standard preparation practices — intention setting, set and setting optimization, and having support available — should be sufficient. Remain aware that psychedelics can surface material you did not know was there.' },
  ]},
  { slug: 'microdosing-protocol', title: 'Microdosing Protocol Assessment', desc: 'Determine which microdosing protocol and approach best fits your lifestyle and goals.', questions: [
    { q: 'What is your primary goal for microdosing?', opts: ['Treating depression or anxiety', 'Enhancing creativity and flow', 'Improving focus and productivity', 'Spiritual development'] },
    { q: 'How structured is your daily routine?', opts: ['Very unstructured', 'Somewhat flexible', 'Moderately structured', 'Highly structured'] },
    { q: 'How sensitive are you to substances in general?', opts: ['Very sensitive', 'Somewhat sensitive', 'Average sensitivity', 'Low sensitivity'] },
    { q: 'How much time can you dedicate to tracking your experience?', opts: ['Minimal time', 'A few minutes daily', '10-15 minutes daily', 'Detailed daily journaling'] },
    { q: 'What is your experience with psychedelics?', opts: ['No experience', 'One or two experiences', 'Several experiences', 'Extensive experience'] },
    { q: 'How important is scientific evidence in your decision-making?', opts: ['Not very important', 'Somewhat important', 'Important', 'Essential'] },
  ], results: [
    { title: 'Fadiman Protocol Recommended', text: 'Based on your goals and circumstances, the Fadiman Protocol (one day on, two days off) is your best starting point. It is the most researched protocol, provides clear structure, and allows adequate time to observe effects. Start with the lowest effective dose and adjust gradually. Your sensitivity profile suggests beginning conservatively.' },
    { title: 'Stamets Stack Recommended', text: 'Your goals and experience level align well with the Stamets Stack (psilocybin + lion\'s mane + niacin). This protocol emphasizes neurogenesis and is taken five days on, two days off. The combination may support your cognitive and creative goals while the niacin helps with distribution.' },
    { title: 'Intuitive Protocol Recommended', text: 'Your experience and self-awareness suggest you may benefit from an intuitive approach — dosing when you feel called to rather than on a fixed schedule. This requires honest self-assessment and strong tracking habits, both of which you appear to have. Listen to your body and adjust accordingly.' },
    { title: 'Custom Protocol Recommended', text: 'Your specific goals and circumstances suggest a customized approach. Consider working with a knowledgeable guide to design a protocol tailored to your needs. Your extensive experience and structured approach position you well for a more nuanced protocol.' },
  ]},
  { slug: 'emotional-baseline', title: 'Emotional Baseline Assessment', desc: 'Establish a clear picture of your current emotional landscape before beginning any psychedelic practice.', questions: [
    { q: 'How often do you feel genuinely content?', opts: ['Rarely or never', 'Occasionally', 'Often', 'Most of the time'] },
    { q: 'How do you handle disappointment?', opts: ['Devastated for extended periods', 'Significantly affected', 'Process and move through it', 'Accept and adapt quickly'] },
    { q: 'How connected do you feel to others?', opts: ['Deeply isolated', 'Somewhat disconnected', 'Reasonably connected', 'Deeply connected'] },
    { q: 'How present are you in daily activities?', opts: ['Constantly distracted or dissociated', 'Frequently lost in thought', 'Usually present', 'Deeply present and engaged'] },
    { q: 'How do you relate to anxiety?', opts: ['Overwhelming and constant', 'Frequent and disruptive', 'Occasional and manageable', 'Rare and informative'] },
    { q: 'How meaningful does your life feel?', opts: ['Deeply meaningless', 'Searching for meaning', 'Sense of emerging purpose', 'Clear sense of meaning'] },
    { q: 'How well do you sleep?', opts: ['Severe insomnia', 'Frequent sleep disruption', 'Generally adequate', 'Consistently restorative'] },
  ], results: [
    { title: 'Baseline: Struggling', text: 'Your emotional baseline suggests you are currently in a difficult period. This is important information — not a judgment. Before exploring psychedelics, focus on stabilizing your foundation: sleep, nutrition, movement, and professional support. These basics matter more than any substance.' },
    { title: 'Baseline: Rebuilding', text: 'You are in a period of rebuilding and growth. Your emotional landscape shows both challenges and emerging strengths. This is a good time to deepen your self-awareness practices and build the support systems that will serve you in any future exploration.' },
    { title: 'Baseline: Stable', text: 'Your emotional baseline is stable and provides a good foundation for psychedelic exploration. You have the emotional resources to navigate challenging experiences and the self-awareness to recognize when you need support.' },
    { title: 'Baseline: Flourishing', text: 'Your emotional baseline reflects genuine well-being and resilience. From this foundation, psychedelic experiences are more likely to deepen what is already working rather than attempting to fix what is broken. This is the ideal starting point.' },
  ]},
  { slug: 'relationship-impact', title: 'Relationship Impact Assessment', desc: 'Understand how psychedelic experiences might affect your relationships and how to navigate that.', questions: [
    { q: 'Does your partner or close family know about your interest in psychedelics?', opts: ['No, and they would disapprove', 'No, unsure how they would react', 'Yes, they are cautiously supportive', 'Yes, they are fully supportive'] },
    { q: 'How do your relationships handle periods of personal change?', opts: ['Poorly — change creates conflict', 'With difficulty', 'Reasonably well', 'Growth is welcomed and supported'] },
    { q: 'Do you have relationships that feel authentic and honest?', opts: ['Very few or none', 'One or two', 'Several', 'Most of my relationships'] },
    { q: 'How do you handle disagreements about values?', opts: ['Avoid or suppress', 'Argue and defend', 'Discuss with some difficulty', 'Navigate with mutual respect'] },
    { q: 'Are there relationships you are avoiding dealing with?', opts: ['Several significant ones', 'One or two important ones', 'Minor avoidances only', 'Relationships feel current'] },
  ], results: [
    { title: 'High Relationship Risk', text: 'Your relationship landscape suggests that psychedelic experiences could create significant interpersonal challenges. Consider addressing relationship dynamics before proceeding. Couples therapy or honest conversations about your interests may be necessary first steps.' },
    { title: 'Moderate Relationship Considerations', text: 'There are relationship dynamics that deserve attention before or alongside any psychedelic exploration. Having honest conversations with key people in your life about your interests and intentions will reduce the risk of misunderstanding and conflict.' },
    { title: 'Supportive Relationship Context', text: 'Your relationships provide a generally supportive context for psychedelic exploration. Continue nurturing open communication with your close circle and be prepared for the ways that personal transformation can shift relationship dynamics.' },
    { title: 'Strong Relational Foundation', text: 'Your relationships are characterized by honesty, support, and mutual growth. This relational foundation is one of the most important factors in having positive psychedelic experiences and successful integration.' },
  ]},
  { slug: 'spiritual-orientation', title: 'Spiritual Orientation Assessment', desc: 'Explore your relationship with spirituality and how it might inform your psychedelic journey.', questions: [
    { q: 'How would you describe your relationship with spirituality?', opts: ['Skeptical or dismissive', 'Curious but uncommitted', 'Active personal practice', 'Deep devotional life'] },
    { q: 'Have you had experiences that felt transcendent or mystical?', opts: ['Never', 'Once or twice', 'Several times', 'Regularly'] },
    { q: 'How do you relate to the concept of ego dissolution?', opts: ['Frightening', 'Intellectually interesting', 'Curious and open', 'Familiar territory'] },
    { q: 'What role does gratitude play in your daily life?', opts: ['Rarely think about it', 'Occasional appreciation', 'Regular gratitude practice', 'Pervasive sense of gratitude'] },
    { q: 'How do you relate to suffering?', opts: ['Avoid it at all costs', 'Endure it reluctantly', 'Accept it as part of life', 'See it as a teacher'] },
    { q: 'Do you have a relationship with silence?', opts: ['Uncomfortable with silence', 'Tolerate it briefly', 'Enjoy periods of silence', 'Silence is home'] },
  ], results: [
    { title: 'The Rational Explorer', text: 'You approach these territories through reason and evidence, and that is a perfectly valid orientation. You do not need to adopt spiritual language to benefit from psychedelic experiences. The neuroscience alone is profound. Your skepticism can serve as a grounding force.' },
    { title: 'The Curious Seeker', text: 'You are in a beautiful place of openness without attachment to any particular framework. This flexibility allows you to receive whatever arises without forcing it into a predetermined narrative. Stay curious and let your experience inform your understanding.' },
    { title: 'The Practicing Devotee', text: 'Your existing spiritual practice provides a rich container for psychedelic exploration. The skills you have developed — presence, surrender, devotion — are precisely what allow these experiences to reach their deepest potential.' },
    { title: 'The Mystic', text: 'You have a mature and deep spiritual orientation that will profoundly inform your psychedelic experiences. The territory of ego dissolution and unity consciousness is not foreign to you. Your challenge is integration — bringing the transcendent into the ordinary.' },
  ]},
  { slug: 'lifestyle-readiness', title: 'Lifestyle Readiness Assessment', desc: 'Evaluate whether your current lifestyle supports safe and meaningful psychedelic exploration.', questions: [
    { q: 'How would you rate your current diet?', opts: ['Poor — mostly processed food', 'Inconsistent', 'Generally healthy', 'Intentional and nourishing'] },
    { q: 'How much physical exercise do you get?', opts: ['Sedentary', 'Occasional movement', 'Regular exercise', 'Daily movement practice'] },
    { q: 'How much screen time do you have daily?', opts: ['Excessive — 8+ hours non-work', 'High — 4-8 hours non-work', 'Moderate — 2-4 hours', 'Minimal — under 2 hours'] },
    { q: 'How often do you spend time in nature?', opts: ['Rarely or never', 'Monthly', 'Weekly', 'Daily'] },
    { q: 'How would you describe your work-life balance?', opts: ['Severely imbalanced', 'Struggling', 'Mostly balanced', 'Well balanced'] },
    { q: 'Do you have a regular sleep schedule?', opts: ['Very irregular', 'Somewhat irregular', 'Mostly consistent', 'Consistent and prioritized'] },
    { q: 'How much unstructured time do you have?', opts: ['None — constantly busy', 'Very little', 'Some free time', 'Adequate spaciousness'] },
  ], results: [
    { title: 'Lifestyle Overhaul Recommended', text: 'Your current lifestyle may not support the kind of experience you are seeking. Psychedelics amplify what is already present, and a depleted foundation leads to depleted experiences. Focus on the basics first: sleep, nutrition, movement, and reducing overstimulation. These changes alone can be transformative.' },
    { title: 'Lifestyle Adjustments Needed', text: 'Your lifestyle has some supportive elements but key areas need attention. Focus on the lowest-scoring areas — they represent the weakest links in your preparation. Even small improvements in sleep, diet, or nature time can significantly impact the quality of psychedelic experiences.' },
    { title: 'Supportive Lifestyle', text: 'Your lifestyle provides a good foundation for psychedelic exploration. You have established many of the habits that support both preparation and integration. Continue strengthening these practices and consider them part of your ongoing integration work.' },
    { title: 'Optimal Lifestyle Foundation', text: 'Your lifestyle reflects the kind of intentional living that creates the best conditions for psychedelic work. The care you take with your body, mind, and daily rhythms is itself a form of practice. This foundation will serve you well.' },
  ]},
];

app.get('/assessments', (req, res) => {
  res.send(htmlHead('Assessments — ' + SITE.title, 'In-depth self-assessments with downloadable PDF results for your psychedelic wellness journey.', SITE.domain + '/assessments') + '\n' +
    '<body>\n' + navHTML() + '\n' +
    '<div class="hero" style="padding:60px 24px 40px;">\n' +
    '  <div class="hero-content"><h1>Assessments</h1><p class="tagline">In-depth evaluations with detailed results you can download and keep.</p></div>\n' +
    '</div>\n' +
    '<main class="wide" style="padding-top:40px;">\n' +
    '<div class="quiz-index-grid">\n' +
    assessments.map(function(a) {
      return '<div class="quiz-index-card"><h3><a href="/assessment/' + a.slug + '">' + a.title + '</a></h3><p>' + a.desc + '</p></div>';
    }).join('\n') + '\n' +
    '</div>\n' +
    '</main>\n' + footerHTML() + '\n' + cookieBannerHTML() + '\n' +
    '</body></html>');
});

// ─── INDIVIDUAL ASSESSMENT PAGES ───
assessments.forEach(function(assess) {
  app.get('/assessment/' + assess.slug, (req, res) => {
    var questionsJson = JSON.stringify(assess.questions);
    var resultsJson = JSON.stringify(assess.results);

    res.send(htmlHead(assess.title + ' — ' + SITE.title, assess.desc, SITE.domain + '/assessment/' + assess.slug) + '\n' +
      '<body>\n' + navHTML() + '\n' +
      '<div class="quiz-wrap">\n' +
      '  <h1 style="font-size:clamp(24px,4vw,36px);margin-bottom:8px;">' + assess.title + '</h1>\n' +
      '  <p style="color:var(--text-dim);margin-bottom:32px;">' + assess.desc + '</p>\n' +
      '  <div class="quiz-progress"><div class="quiz-bar" id="progressBar" style="width:0%;"></div></div>\n' +
      '  <div id="quizContent"></div>\n' +
      '  <div id="quizResult" style="display:none;">\n' +
      '    <div style="background:var(--bg-card);border:1px solid rgba(124,77,255,0.3);border-radius:var(--radius);padding:40px;">\n' +
      '      <h2 id="resultTitle" style="font-size:28px;margin-bottom:16px;text-align:center;"></h2>\n' +
      '      <p id="resultText" style="color:var(--text-dim);font-size:17px;line-height:1.7;max-width:600px;margin:0 auto 24px;"></p>\n' +
      '      <div id="scoreBreakdown" style="margin:24px 0;"></div>\n' +
      '      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">\n' +
      '        <button class="pdf-btn" onclick="exportAssessmentPDF()">Download Detailed PDF Report</button>\n' +
      '        <a id="shareTwitter" href="#" class="share-btn" target="_blank" rel="noopener">Share on X</a>\n' +
      '      </div>\n' +
      '    </div>\n' +
      '  </div>\n' +
      '</div>\n' +
      footerHTML() + '\n' + cookieBannerHTML() + '\n' +
      '<script>\n' +
      'var questions = ' + questionsJson + ';\n' +
      'var results = ' + resultsJson + ';\n' +
      'var current = 0, scores = [], answers = [];\n' +
      'function renderQ() {\n' +
      '  if (current >= questions.length) return showResult();\n' +
      '  var q = questions[current];\n' +
      '  document.getElementById("progressBar").style.width = ((current/questions.length)*100)+"%";\n' +
      '  var html = \'<div class="quiz-q"><h3>Question \' + (current+1) + \' of \' + questions.length + \'</h3><p>\' + q.q + \'</p>\';\n' +
      '  q.opts.forEach(function(o, i) {\n' +
       '    html += \'<div class="quiz-opt" tabindex="0" role="button" onclick="selectOpt(\'+i+\')">\'+ o + \'</div>\';\n' + +
      '  });\n' +
      '  html += "</div>";\n' +
      '  document.getElementById("quizContent").innerHTML = html;\n' +
      '}\n' +
      'function selectOpt(i) { scores.push(i); answers.push({q: questions[current].q, a: questions[current].opts[i], score: i}); current++; renderQ(); }\n' +
      'function showResult() {\n' +
      '  document.getElementById("progressBar").style.width = "100%";\n' +
      '  document.getElementById("quizContent").style.display = "none";\n' +
      '  document.getElementById("quizResult").style.display = "block";\n' +
      '  var avg = scores.reduce(function(a,b){return a+b;},0) / scores.length;\n' +
      '  var idx = Math.min(Math.floor(avg), results.length - 1);\n' +
      '  var r = results[idx];\n' +
      '  document.getElementById("resultTitle").textContent = r.title;\n' +
      '  document.getElementById("resultText").textContent = r.text;\n' +
      '  var breakdown = "<h3 style=\\"font-size:18px;margin-bottom:16px;color:#00E5FF;\\">Your Responses</h3>";\n' +
      '  answers.forEach(function(a, i) {\n' +
      '    var pct = (a.score / 3) * 100;\n' +
      '    breakdown += "<div style=\\"margin-bottom:16px;\\"><p style=\\"font-size:14px;color:#9B95AD;margin-bottom:4px;\\">" + a.q + "</p><p style=\\"font-size:15px;color:#E8E4F0;margin-bottom:6px;\\">" + a.a + "</p><div style=\\"height:4px;background:rgba(255,255,255,0.08);border-radius:2px;\\"><div style=\\"height:100%;width:" + pct + "%;background:linear-gradient(90deg,#7C4DFF,#00E5FF);border-radius:2px;\\"></div></div></div>";\n' +
      '  });\n' +
      '  document.getElementById("scoreBreakdown").innerHTML = breakdown;\n' +
      '  var url = encodeURIComponent(window.location.href);\n' +
      '  document.getElementById("shareTwitter").href = "https://twitter.com/intent/tweet?url="+url+"&text="+encodeURIComponent("My result: "+r.title+" — "+document.title);\n' +
      '}\n' +
      'function exportAssessmentPDF() {\n' +
      '  var title = document.getElementById("resultTitle").textContent;\n' +
      '  var text = document.getElementById("resultText").textContent;\n' +
      '  var w = window.open("","_blank");\n' +
      '  w.document.write("<html><head><title>' + escapeHtml(assess.title) + ' — Results</title><style>body{font-family:Georgia,serif;max-width:650px;margin:40px auto;padding:20px;color:#333;line-height:1.8;}h1{font-size:24px;color:#4A148C;margin-bottom:4px;}h2{font-size:20px;color:#7C4DFF;margin:24px 0 12px;}h3{font-size:16px;color:#666;margin:20px 0 8px;}p{font-size:15px;margin-bottom:12px;}.q-item{margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #eee;}.q-label{font-size:13px;color:#999;}.q-answer{font-size:15px;color:#333;font-weight:600;}.footer{margin-top:40px;padding-top:16px;border-top:1px solid #ddd;font-size:12px;color:#999;}</style></head><body>");\n' +
      '  w.document.write("<h1>' + escapeHtml(assess.title) + '</h1>");\n' +
      '  w.document.write("<p style=\\"color:#666;font-size:13px;\\">The Quiet Medicine — thequietmedicine.com<br>Date: " + new Date().toLocaleDateString() + "</p>");\n' +
      '  w.document.write("<h2>Result: " + title + "</h2>");\n' +
      '  w.document.write("<p>" + text + "</p>");\n' +
      '  w.document.write("<h3>Detailed Responses</h3>");\n' +
      '  answers.forEach(function(a) {\n' +
      '    w.document.write("<div class=\\"q-item\\"><p class=\\"q-label\\">" + a.q + "</p><p class=\\"q-answer\\">" + a.a + "</p></div>");\n' +
      '  });\n' +
      '  w.document.write("<div class=\\"footer\\"><p>This assessment is for educational purposes only and does not constitute medical or psychological advice. For professional guidance, visit <a href=\\"https://kalesh.love\\">kalesh.love</a></p><p>Generated by The Quiet Medicine &copy; " + new Date().getFullYear() + "</p></div>");\n' +
      '  w.document.write("</body></html>");\n' +
      '  w.document.close();\n' +
      '  setTimeout(function(){ w.print(); }, 500);\n' +
      '}\n' +
      'renderQ();\n' +
      '</script>\n' +
      '</body></html>');
  });
});


// ─── LEGAL CHECK PAGE ───
app.get('/legal-check', (req, res) => {
  var jurisdictions = {
    "United States (Federal)": { psilocybin: "Schedule I — Illegal", mdma: "Schedule I — Illegal (FDA breakthrough therapy)", ketamine: "Schedule III — Legal with prescription", lsd: "Schedule I — Illegal", ayahuasca: "Schedule I — Illegal (religious exemptions exist)" },
    "Oregon, USA": { psilocybin: "Legal — regulated therapeutic use (Measure 109)", mdma: "Schedule I — Illegal federally", ketamine: "Legal with prescription", lsd: "Schedule I — Illegal", ayahuasca: "Schedule I — Illegal federally" },
    "Colorado, USA": { psilocybin: "Decriminalized — regulated access in development", mdma: "Schedule I — Illegal federally", ketamine: "Legal with prescription", lsd: "Schedule I — Illegal", ayahuasca: "Schedule I — Illegal federally" },
    "California, USA": { psilocybin: "Decriminalized in several cities", mdma: "Schedule I — Illegal", ketamine: "Legal with prescription", lsd: "Schedule I — Illegal", ayahuasca: "Legal for religious use (specific churches)" },
    "Canada": { psilocybin: "Controlled — Special Access Program available", mdma: "Controlled — Special Access Program", ketamine: "Legal with prescription", lsd: "Controlled substance", ayahuasca: "Legal — not specifically scheduled" },
    "Netherlands": { psilocybin: "Truffles legal — mushrooms illegal", mdma: "Illegal but tolerated in research", ketamine: "Prescription only", lsd: "Illegal", ayahuasca: "Legal gray area" },
    "Portugal": { psilocybin: "Decriminalized (personal use)", mdma: "Decriminalized (personal use)", ketamine: "Prescription only", lsd: "Decriminalized (personal use)", ayahuasca: "Decriminalized" },
    "Jamaica": { psilocybin: "Legal — not scheduled", mdma: "Illegal", ketamine: "Prescription only", lsd: "Illegal", ayahuasca: "Not specifically regulated" },
    "Brazil": { psilocybin: "Legal gray area", mdma: "Illegal", ketamine: "Prescription only", lsd: "Illegal", ayahuasca: "Legal for religious use" },
    "Costa Rica": { psilocybin: "Legal gray area — not enforced", mdma: "Illegal", ketamine: "Prescription only", lsd: "Illegal", ayahuasca: "Not specifically regulated" },
    "United Kingdom": { psilocybin: "Class A — Illegal", mdma: "Class A — Illegal", ketamine: "Class B — Prescription available", lsd: "Class A — Illegal", ayahuasca: "Class A — Illegal" },
    "Australia": { psilocybin: "Schedule 8 — Authorized prescribers only (2023)", mdma: "Schedule 8 — Authorized prescribers only (2023)", ketamine: "Prescription only", lsd: "Prohibited", ayahuasca: "Prohibited" },
    "Germany": { psilocybin: "Illegal — research permitted", mdma: "Illegal — clinical trials active", ketamine: "Prescription (esketamine approved)", lsd: "Illegal", ayahuasca: "Illegal" },
    "Switzerland": { psilocybin: "Illegal — compassionate use exceptions", mdma: "Illegal — compassionate use exceptions", ketamine: "Prescription only", lsd: "Illegal — compassionate use exceptions", ayahuasca: "Illegal" },
    "Mexico": { psilocybin: "Traditional use tolerated", mdma: "Illegal", ketamine: "Prescription only", lsd: "Illegal", ayahuasca: "Traditional use tolerated" },
    "Peru": { psilocybin: "Not specifically regulated", mdma: "Illegal", ketamine: "Prescription only", lsd: "Illegal", ayahuasca: "Legal — cultural heritage" },
    "Thailand": { psilocybin: "Illegal", mdma: "Illegal — severe penalties", ketamine: "Controlled", lsd: "Illegal — severe penalties", ayahuasca: "Not specifically regulated" },
  };

  var optionsHTML = Object.keys(jurisdictions).map(function(j) { return '<option value="' + j + '">' + j + '</option>'; }).join('');

  res.send(htmlHead('Legal Status Check — ' + SITE.title, 'Check the legal status of psychedelic substances in your jurisdiction. Educational reference only.', SITE.domain + '/legal-check') + '\n' +
    '<body>\n' + navHTML() + '\n' +
    '<div class="hero" style="padding:60px 24px 40px;">\n' +
    '  <div class="hero-content"><h1>Legal Status Check</h1><p class="tagline">Educational reference for psychedelic substance legality across jurisdictions. This is not legal advice.</p></div>\n' +
    '</div>\n' +
    '<main class="container" style="padding-top:40px;max-width:800px;">\n' +
    '<div style="background:var(--bg-card);border:1px solid rgba(255,255,255,0.06);border-radius:var(--radius);padding:32px;">\n' +
    '  <label for="jurisdictionSelect" style="display:block;font-size:14px;color:var(--text-dim);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em;">Select Jurisdiction</label>\n' +
    '  <select id="jurisdictionSelect" onchange="showLegal()" style="width:100%;padding:12px 16px;background:var(--bg-deep);color:var(--text);border:1px solid rgba(255,255,255,0.1);border-radius:8px;font-size:16px;font-family:Inter,sans-serif;cursor:pointer;">\n' +
    '    <option value="">Choose a location...</option>\n' +
    '    ' + optionsHTML + '\n' +
    '  </select>\n' +
    '  <div id="legalResults" style="margin-top:24px;"></div>\n' +
    '</div>\n' +
    healthDisclaimerHTML() + '\n' +
    '</main>\n' + footerHTML() + '\n' + cookieBannerHTML() + '\n' +
    '<script>\n' +
    'var data = ' + JSON.stringify(jurisdictions) + ';\n' +
    'function showLegal() {\n' +
    '  var sel = document.getElementById("jurisdictionSelect").value;\n' +
    '  if (!sel || !data[sel]) { document.getElementById("legalResults").innerHTML = ""; return; }\n' +
    '  var d = data[sel];\n' +
    '  var html = "<table style=\\"width:100%;border-collapse:collapse;margin-top:16px;\\">";\n' +
    '  html += "<tr style=\\"border-bottom:1px solid rgba(255,255,255,0.08);\\"><th style=\\"text-align:left;padding:12px 8px;color:#00E5FF;font-size:14px;\\">Substance</th><th style=\\"text-align:left;padding:12px 8px;color:#00E5FF;font-size:14px;\\">Status</th></tr>";\n' +
    '  var substances = {psilocybin:"Psilocybin",mdma:"MDMA",ketamine:"Ketamine",lsd:"LSD",ayahuasca:"Ayahuasca"};\n' +
    '  Object.keys(substances).forEach(function(k) {\n' +
    '    var status = d[k] || "Unknown";\n' +
    '    var color = status.toLowerCase().indexOf("legal") === 0 ? "#00E676" : status.toLowerCase().indexOf("decrim") === 0 ? "#FFD740" : status.toLowerCase().indexOf("schedule") >= 0 || status.toLowerCase().indexOf("illegal") >= 0 || status.toLowerCase().indexOf("class") >= 0 || status.toLowerCase().indexOf("prohibited") >= 0 ? "#FF5252" : "#B0BEC5";\n' +
    '    html += "<tr style=\\"border-bottom:1px solid rgba(255,255,255,0.04);\\"><td style=\\"padding:12px 8px;font-weight:600;\\">" + substances[k] + "</td><td style=\\"padding:12px 8px;color:" + color + ";\\">" + status + "</td></tr>";\n' +
    '  });\n' +
    '  html += "</table>";\n' +
    '  html += "<p style=\\"margin-top:16px;font-size:13px;color:#9B95AD;line-height:1.6;\\">This information is for educational purposes only and may not reflect the most current legal status. Laws change frequently. Always verify with a qualified legal professional in your jurisdiction before making any decisions.</p>";\n' +
    '  document.getElementById("legalResults").innerHTML = html;\n' +
    '}\n' +
    '</script>\n' +
    '</body></html>');
});

// ─── 404 HANDLER ───
function render404(req, res) {
  var articles = getPublishedArticles();
  var suggested = articles.sort(function() { return 0.5 - Math.random(); }).slice(0, 6);
  res.status(404).send(htmlHead('Page Not Found — ' + SITE.title, 'The page you are looking for does not exist.', SITE.domain) + '\n' +
    '<body>\n' + navHTML() + '\n' +
    '<main class="container" style="padding:80px 24px;text-align:center;">\n' +
    '  <h1 style="font-size:clamp(48px,8vw,96px);background:var(--grad-1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px;">404</h1>\n' +
    '  <h2 style="font-size:24px;margin-bottom:16px;">The path you sought is not here</h2>\n' +
    '  <p style="color:var(--text-dim);font-size:17px;max-width:500px;margin:0 auto 40px;line-height:1.7;">Sometimes the most valuable discoveries happen when we wander off the expected path. These articles might be what you were actually looking for.</p>\n' +
    '  <div class="card-grid">\n' +
    suggested.map(function(a) { return articleCard(a); }).join('\n') + '\n' +
    '  </div>\n' +
    '  <a href="/" style="display:inline-block;margin-top:40px;padding:14px 32px;background:var(--accent-1);color:white;border-radius:24px;font-weight:600;text-decoration:none;">Return Home</a>\n' +
    '</main>\n' + footerHTML() + '\n' + cookieBannerHTML() + '\n' +
    '</body></html>');
}

app.use(function(req, res) { render404(req, res); });

// ─── START SERVER ───
app.listen(PORT, '0.0.0.0', function() {
  console.log('The Quiet Medicine running on port ' + PORT);
  console.log('Published articles: ' + getPublishedArticles().length + ' / ' + loadArticles().length);
});
