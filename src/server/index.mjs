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
// 301 redirect www → non-www (canonical domain for SEO)
app.use((req, res, next) => {
  const host = req.hostname || req.headers.host;
  if (host && host.startsWith('www.')) {
    const bare = host.replace(/^www\./, '');
    return res.redirect(301, `${req.protocol}://${bare}${req.originalUrl}`);
  }
  next();
});
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
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-YXL1WC9X7D"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-YXL1WC9X7D');
  </script>
  <!-- Grow.me -->
  <script data-grow-initializer="">!(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id","U2l0ZTpkYmZiYzM0ZS04Zjk1LTRmNmItYjIxMi01YTIwM2Y0NGM0ZGQ=");var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();</script>
</head>`;
}

function navHTML() {
  return `<div class="nav-wrap"><nav>
  <a href="/" class="logo">The Quiet Medicine</a>
  <div class="nav-links">
    <a href="/articles">Articles</a>
    <a href="/quizzes">Quizzes</a>
    <a href="/assessments">Assessments</a>
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
      <a href="/quizzes">Quizzes</a>
      <a href="/assessments">Assessments</a>
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
<div class="hero" style="background:linear-gradient(180deg, rgba(13,11,26,0.3) 0%, rgba(13,11,26,0.7) 50%, rgba(13,11,26,0.95) 100%), url('https://quiet-medicine.b-cdn.net/images/homepage-hero-mushroom.webp') center/cover no-repeat;min-height:520px;display:flex;align-items:center;">
  <div class="hero-content">
    <h1>The Quiet Medicine</h1>
    <p class="tagline">${SITE.tagline}</p>
    <div class="hero-cats">${catCards}</div>
  </div>
</div>

<div class="wide" style="padding-top:60px;">
  ${featured ? `<div class="section-head"><h2>Featured</h2></div>${featuredCard(featured)}` : ''}

  <div style="margin:40px auto;max-width:900px;"><img src="https://quiet-medicine.b-cdn.net/images/mushroom-psychedelic-pattern.webp" alt="Psychedelic mushroom art" style="width:100%;height:200px;object-fit:cover;border-radius:16px;opacity:0.7;" loading="lazy"></div>
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

  <img src="https://quiet-medicine.b-cdn.net/images/about-team-mushroom.webp" alt="Medicinal mushrooms and botanical research" style="width:100%;height:280px;object-fit:cover;border-radius:16px;margin:40px 0 32px;" loading="lazy">
  <h2 style="font-size:clamp(24px,3.5vw,32px);margin:24px 0 12px;font-family:'Newsreader',serif;">Our Editorial Team</h2>
  <p style="margin:0 0 32px;line-height:1.85;font-size:17px;color:var(--text-dim);">Every piece we publish passes through the hands of researchers, clinicians, and practitioners who live this work. Our team brings decades of combined experience across mycology, neuroscience, clinical psychology, indigenous plant medicine traditions, and harm reduction advocacy.</p>

  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;margin-bottom:48px;">

    <div class="advisor-card" style="margin:0;">
      <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;">
        <div class="author-avatar" style="width:56px;height:56px;font-size:20px;background:linear-gradient(135deg,#7C4DFF,#B388FF);">DR</div>
        <div>
          <h3 style="margin:0;font-size:18px;">Dr. Reina Matsuda</h3>
          <div style="font-size:12px;color:var(--accent-2);text-transform:uppercase;letter-spacing:0.05em;">Chief Science Editor</div>
        </div>
      </div>
      <p style="font-size:15px;line-height:1.7;color:var(--text-dim);margin:0;">Neuropharmacologist with 14 years of psilocybin research at Johns Hopkins and Imperial College London. Reina translates dense clinical data into writing that respects both the science and the reader. She holds a PhD in molecular neuroscience from Columbia and has co-authored 23 peer-reviewed papers on serotonergic psychedelics.</p>
    </div>

    <div class="advisor-card" style="margin:0;">
      <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;">
        <div class="author-avatar" style="width:56px;height:56px;font-size:20px;background:linear-gradient(135deg,#00BFA5,#64FFDA);">MO</div>
        <div>
          <h3 style="margin:0;font-size:18px;">Marcus Okafor-Reeves</h3>
          <div style="font-size:12px;color:var(--accent-2);text-transform:uppercase;letter-spacing:0.05em;">Mycology & Cultivation Editor</div>
        </div>
      </div>
      <p style="font-size:15px;line-height:1.7;color:var(--text-dim);margin:0;">Certified mycologist and permaculture designer who has spent 11 years studying fungal networks across three continents. Marcus brings deep field knowledge of both gourmet and functional mushroom species, cultivation techniques, and the emerging science of mycelial intelligence. He trained under Paul Stamets and runs a small-batch mushroom farm in the Pacific Northwest.</p>
    </div>

    <div class="advisor-card" style="margin:0;">
      <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;">
        <div class="author-avatar" style="width:56px;height:56px;font-size:20px;background:linear-gradient(135deg,#FF6D00,#FFAB40);">LS</div>
        <div>
          <h3 style="margin:0;font-size:18px;">Dr. Luna Solano</h3>
          <div style="font-size:12px;color:var(--accent-2);text-transform:uppercase;letter-spacing:0.05em;">Clinical Psychology Editor</div>
        </div>
      </div>
      <p style="font-size:15px;line-height:1.7;color:var(--text-dim);margin:0;">Licensed clinical psychologist specializing in psychedelic-assisted therapy with over 200 guided sessions. Luna brings a trauma-informed lens to every assessment and quiz we create, making sure our tools are both clinically grounded and genuinely helpful. She completed her PsyD at the California Institute of Integral Studies and serves on the MAPS therapist training faculty.</p>
    </div>

    <div class="advisor-card" style="margin:0;">
      <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;">
        <div class="author-avatar" style="width:56px;height:56px;font-size:20px;background:linear-gradient(135deg,#E040FB,#EA80FC);">JT</div>
        <div>
          <h3 style="margin:0;font-size:18px;">Jade Thornton</h3>
          <div style="font-size:12px;color:var(--accent-2);text-transform:uppercase;letter-spacing:0.05em;">Harm Reduction & Safety Editor</div>
        </div>
      </div>
      <p style="font-size:15px;line-height:1.7;color:var(--text-dim);margin:0;">Former DanceSafe chapter director and Zendo Project volunteer with 9 years in psychedelic harm reduction. Jade reviews every piece of content for safety accuracy and ensures our disclaimers, contraindication warnings, and dosing guidance meet the highest standards. She holds a Masters in Public Health from Boston University with a focus on substance use policy.</p>
    </div>

    <div class="advisor-card" style="margin:0;">
      <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;">
        <div class="author-avatar" style="width:56px;height:56px;font-size:20px;background:linear-gradient(135deg,#00E5FF,#84FFFF);">AW</div>
        <div>
          <h3 style="margin:0;font-size:18px;">Dr. Alistair Whitfield</h3>
          <div style="font-size:12px;color:var(--accent-2);text-transform:uppercase;letter-spacing:0.05em;">Ethnobotany & Traditions Editor</div>
        </div>
      </div>
      <p style="font-size:15px;line-height:1.7;color:var(--text-dim);margin:0;">Ethnobotanist and anthropologist who has documented indigenous mushroom traditions across Oaxaca, the Amazon Basin, and Southeast Asia for 18 years. Alistair ensures our coverage of traditional practices is respectful, accurate, and free from cultural appropriation. He holds a PhD in ethnobotany from the University of Kent and has published two books on sacred fungi in Mesoamerican cultures.</p>
    </div>

    <div class="advisor-card" style="margin:0;">
      <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;">
        <div class="author-avatar" style="width:56px;height:56px;font-size:20px;background:linear-gradient(135deg,#76FF03,#B2FF59);">SP</div>
        <div>
          <h3 style="margin:0;font-size:18px;">Suki Park</h3>
          <div style="font-size:12px;color:var(--accent-2);text-transform:uppercase;letter-spacing:0.05em;">Nutrition & Functional Mushrooms Editor</div>
        </div>
      </div>
      <p style="font-size:15px;line-height:1.7;color:var(--text-dim);margin:0;">Registered dietitian and functional medicine practitioner who specializes in adaptogenic and medicinal mushrooms. Suki reviews all content related to lion's mane, reishi, chaga, cordyceps, turkey tail, and mushroom supplement stacking. She holds an MS in Clinical Nutrition from NYU and consults for three major functional mushroom brands on formulation and bioavailability.</p>
    </div>

    <div class="advisor-card" style="margin:0;">
      <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;">
        <div class="author-avatar" style="width:56px;height:56px;font-size:20px;background:linear-gradient(135deg,#FFD600,#FFFF00);">RK</div>
        <div>
          <h3 style="margin:0;font-size:18px;">Rohan Kapoor</h3>
          <div style="font-size:12px;color:var(--accent-2);text-transform:uppercase;letter-spacing:0.05em;">Integration & Mindfulness Editor</div>
        </div>
      </div>
      <p style="font-size:15px;line-height:1.7;color:var(--text-dim);margin:0;">Meditation teacher and psychedelic integration specialist with 12 years of practice in Vipassana and Zen traditions. Rohan bridges the contemplative and the clinical, ensuring our integration content honors both the inner journey and the evidence base. He trained at Spirit Rock Meditation Center and holds a certification in psychedelic-assisted therapy from CIIS.</p>
    </div>

  </div>

  <h2 style="font-size:clamp(24px,3.5vw,32px);margin:16px 0 24px;font-family:'Newsreader',serif;">Our Advisor</h2>

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
  <img src="https://quiet-medicine.b-cdn.net/images/start-here-mushroom.webp" alt="A single mushroom growing from rich soil" style="width:100%;max-width:700px;height:300px;object-fit:cover;border-radius:16px;margin:24px auto;display:block;" loading="lazy">
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
  {
    "slug": "which-mushroom-is-right-for-you",
    "title": "Which Mushroom Is Right for You?",
    "desc": "Based on your health goals, lifestyle, and experience level, discover which functional or psychedelic mushroom species aligns with your needs.",
    "heroImage": "https://quiet-medicine.b-cdn.net/images/mushroom-hero-quizzes.webp",
    "questions": [
      {
        "q": "What is your primary wellness goal right now?",
        "opts": [
          "Sharper focus and mental clarity",
          "Better sleep and stress relief",
          "Immune system support",
          "Deep emotional or spiritual work"
        ]
      },
      {
        "q": "How would you describe your experience with mushrooms?",
        "opts": [
          "Complete beginner, never tried any",
          "I take basic supplements sometimes",
          "I cook with gourmet mushrooms regularly",
          "I have experience with psychedelic mushrooms"
        ]
      },
      {
        "q": "What format do you prefer for supplements?",
        "opts": [
          "Capsules I can take quickly",
          "Powder I can add to coffee or smoothies",
          "Tinctures and liquid extracts",
          "Whole mushrooms I can cook with"
        ]
      },
      {
        "q": "How do you feel about earthy, mushroom-y flavors?",
        "opts": [
          "Not a fan at all",
          "I can tolerate them",
          "I actually enjoy them",
          "I love strong umami flavors"
        ]
      },
      {
        "q": "What time of day do you want to take your mushroom supplement?",
        "opts": [
          "Morning for energy and focus",
          "Afternoon for sustained performance",
          "Evening for wind-down and recovery",
          "I want something I can take any time"
        ]
      },
      {
        "q": "How important is scientific research backing to you?",
        "opts": [
          "Very important, I want clinical evidence",
          "Somewhat important",
          "I trust traditional use as much as studies",
          "I go by personal experience above all"
        ]
      }
    ],
    "results": [
      {
        "title": "Lion's Mane: The Brain Mushroom",
        "text": "Your focus on mental clarity and cognitive performance points straight to Lion's Mane (Hericium erinaceus). This remarkable fungus contains compounds called hericenones and erinacines that stimulate nerve growth factor (NGF) production in the brain. Research from Tohoku University showed significant cognitive improvement in adults who took Lion's Mane daily for 16 weeks. Start with 500mg twice daily and give it at least 4 weeks to notice effects.",
        "products": [
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms Lion's Mane Capsules"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life by Merlin Sheldrake"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "The Psychedelic Integration Journal"
          }
        ]
      },
      {
        "title": "Reishi: The Calming Adaptogen",
        "text": "Your need for stress relief and better sleep makes Reishi (Ganoderma lucidum) your ideal match. Known as the \"mushroom of immortality\" in traditional Chinese medicine, Reishi contains triterpenes and beta-glucans that modulate the immune system and calm the nervous system. A 2012 study in the Journal of Ethnopharmacology found that Reishi extract significantly improved sleep quality and reduced fatigue. Take it in the evening, about an hour before bed, starting with 1-2 grams daily.",
        "products": [
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms Organic Capsules"
          },
          {
            "asin": "B074TBYWGS",
            "name": "Silk Sleep Eye Mask"
          },
          {
            "asin": "1646119266",
            "name": "Guided Meditation Journal"
          }
        ]
      },
      {
        "title": "Turkey Tail: The Immune Warrior",
        "text": "Your focus on immune support leads to Turkey Tail (Trametes versicolor), one of the most researched medicinal mushrooms on the planet. Turkey Tail contains polysaccharide-K (PSK) and polysaccharopeptide (PSP), both of which have been studied extensively for immune modulation. Japan has used PSK as an adjunct cancer therapy since the 1980s. Take 2-3 grams daily with food.",
        "products": [
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms Organic Capsules"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life by Merlin Sheldrake"
          },
          {
            "asin": "B09VK9S4JB",
            "name": "Mushroom Growing Kit"
          }
        ]
      },
      {
        "title": "Psilocybin Mushrooms: The Deep Explorer",
        "text": "Your orientation toward emotional depth and spiritual work aligns with psilocybin-containing mushrooms. These are not supplements you take casually. Psilocybin is a powerful serotonergic compound that can produce profound shifts in consciousness, emotional processing, and sense of meaning. Johns Hopkins research has shown lasting positive effects from even a single guided session. If you are considering this path, preparation is everything: set, setting, intention, and ideally professional support.",
        "products": [
          {
            "asin": "B0885S1866",
            "name": "Precision Milligram Scale 50g/0.001g"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "The Psychedelic Integration Journal"
          },
          {
            "asin": "0735224153",
            "name": "How to Change Your Mind by Michael Pollan"
          },
          {
            "asin": "1594774021",
            "name": "The Psychedelic Explorer's Guide"
          }
        ]
      }
    ]
  },
  {
    "slug": "mushroom-safety-iq",
    "title": "Mushroom Safety IQ Quiz",
    "desc": "Test your knowledge of mushroom safety, identification basics, contraindications, and harm reduction. How much do you really know?",
    "heroImage": "https://quiet-medicine.b-cdn.net/images/mushroom-science-lab.webp",
    "questions": [
      {
        "q": "What is the single most important rule of wild mushroom foraging?",
        "opts": [
          "Always cook mushrooms before eating",
          "Never eat a mushroom you cannot identify with 100% certainty",
          "Only forage in forests, never in fields",
          "Taste a small piece first to check"
        ]
      },
      {
        "q": "Which of these is a dangerous lookalike for edible mushrooms?",
        "opts": [
          "Shiitake",
          "Death Cap (Amanita phalloides)",
          "Oyster mushroom",
          "Maitake"
        ]
      },
      {
        "q": "What medication category has the most dangerous interaction with psilocybin?",
        "opts": [
          "Blood pressure medications",
          "Lithium and MAOIs",
          "Antihistamines",
          "Antibiotics"
        ]
      },
      {
        "q": "How should you store dried mushrooms for maximum potency and safety?",
        "opts": [
          "In a plastic bag at room temperature",
          "In the refrigerator in an open container",
          "In an airtight container with desiccant, away from light",
          "Frozen in water"
        ]
      },
      {
        "q": "What does \"set and setting\" mean in psychedelic safety?",
        "opts": [
          "The dose and the mushroom species",
          "Your mindset and your physical environment",
          "The time of day and season",
          "Your diet and exercise routine"
        ]
      },
      {
        "q": "Which population should absolutely avoid psilocybin mushrooms?",
        "opts": [
          "People over 60",
          "People with a personal or family history of psychosis",
          "People who exercise regularly",
          "People who drink coffee"
        ]
      },
      {
        "q": "What is the purpose of a reagent test kit for mushrooms?",
        "opts": [
          "To measure exact dosage",
          "To identify the species by color reaction",
          "To check for contamination and verify presence of psilocybin",
          "To improve potency"
        ]
      }
    ],
    "results": [
      {
        "title": "Safety Novice: Time to Study Up",
        "text": "Your safety knowledge has some significant gaps that need addressing before you go further. This is not a criticism. It is genuinely important information that could prevent serious harm. Start with the basics: identification, contraindications, and proper storage.",
        "products": [
          {
            "asin": "1594774021",
            "name": "The Psychedelic Explorer's Guide"
          },
          {
            "asin": "0735224153",
            "name": "How to Change Your Mind"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "The Psychedelic Integration Journal"
          }
        ]
      },
      {
        "title": "Developing Awareness: Getting There",
        "text": "You have a foundation of safety knowledge but there are gaps worth filling. You understand some key principles but may be fuzzy on drug interactions, storage best practices, or identification red flags.",
        "products": [
          {
            "asin": "B0885S1866",
            "name": "Precision Milligram Scale"
          },
          {
            "asin": "1594774021",
            "name": "The Psychedelic Explorer's Guide"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "The Psychedelic Integration Journal"
          }
        ]
      },
      {
        "title": "Safety Conscious: Solid Foundation",
        "text": "You demonstrate strong safety awareness across identification, contraindications, and harm reduction principles. You understand the key risks and how to mitigate them.",
        "products": [
          {
            "asin": "B0885S1866",
            "name": "Precision Milligram Scale"
          },
          {
            "asin": "B09VK9S4JB",
            "name": "Mushroom Growing Kit"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life by Merlin Sheldrake"
          }
        ]
      },
      {
        "title": "Safety Expert: You Know Your Stuff",
        "text": "Your mushroom safety knowledge is thorough and practical. You are well-positioned to not only keep yourself safe but to be a resource for others in your community.",
        "products": [
          {
            "asin": "B09VK9S4JB",
            "name": "Mushroom Growing Kit"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life by Merlin Sheldrake"
          },
          {
            "asin": "0060801719",
            "name": "The Doors of Perception by Aldous Huxley"
          }
        ]
      }
    ]
  },
  {
    "slug": "functional-mushroom-stack-finder",
    "title": "Find Your Functional Mushroom Stack",
    "desc": "Discover the ideal combination of functional mushrooms for your specific health goals. Lion's Mane, Reishi, Cordyceps, Chaga, Turkey Tail, and more.",
    "heroImage": "https://quiet-medicine.b-cdn.net/images/mushroom-hero-assessments.webp",
    "questions": [
      {
        "q": "What do you need most right now?",
        "opts": [
          "Mental performance and focus",
          "Physical energy and endurance",
          "Immune resilience",
          "Calm and emotional balance"
        ]
      },
      {
        "q": "How is your energy throughout the day?",
        "opts": [
          "Crashes hard in the afternoon",
          "Steady but could be better",
          "Generally good with occasional dips",
          "High energy most of the time"
        ]
      },
      {
        "q": "Do you exercise regularly?",
        "opts": [
          "Rarely",
          "A few times a month",
          "Three to four times a week",
          "Daily intense training"
        ]
      },
      {
        "q": "How is your gut health?",
        "opts": [
          "Frequent digestive issues",
          "Occasional bloating or discomfort",
          "Generally fine",
          "Excellent, I prioritize gut health"
        ]
      },
      {
        "q": "Are you dealing with any inflammation or chronic pain?",
        "opts": [
          "Yes, significant chronic pain",
          "Some inflammation or joint stiffness",
          "Minor occasional issues",
          "No inflammation concerns"
        ]
      },
      {
        "q": "How much are you willing to spend monthly on mushroom supplements?",
        "opts": [
          "Under $30",
          "$30 to $60",
          "$60 to $100",
          "Whatever it takes"
        ]
      }
    ],
    "results": [
      {
        "title": "The Focus Stack: Lion's Mane + Cordyceps",
        "text": "Your profile calls for a cognitive-performance stack. Lion's Mane for nerve growth factor and neuroplasticity, paired with Cordyceps for sustained energy without the jitters. Take Lion's Mane (1000mg) in the morning with breakfast and Cordyceps (500mg) before your afternoon slump.",
        "products": [
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms Lion's Mane Capsules"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "The Psychedelic Integration Journal"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life by Merlin Sheldrake"
          }
        ]
      },
      {
        "title": "The Athlete Stack: Cordyceps + Chaga + Reishi",
        "text": "Your active lifestyle needs mushrooms that support performance and recovery. Cordyceps boosts oxygen utilization and ATP production. Chaga fights exercise-induced oxidative stress. Reishi in the evening supports deep recovery sleep.",
        "products": [
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms Organic Capsules"
          },
          {
            "asin": "B0FPML7DJC",
            "name": "WHOOP 5.0 HRV Monitor"
          },
          {
            "asin": "B08FR8MPCW",
            "name": "Acupressure Mat for Recovery"
          }
        ]
      },
      {
        "title": "The Immunity Stack: Turkey Tail + Chaga + Maitake",
        "text": "Your immune system needs reinforcement. Turkey Tail is the most researched immune mushroom. Chaga provides massive antioxidant protection. Maitake contains D-fraction, studied for immune activation.",
        "products": [
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms Organic Capsules"
          },
          {
            "asin": "B09VK9S4JB",
            "name": "Mushroom Growing Kit"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life by Merlin Sheldrake"
          }
        ]
      },
      {
        "title": "The Calm Stack: Reishi + Lion's Mane + Tremella",
        "text": "Your need for emotional balance calls for the adaptogenic trio. Reishi is the master calming mushroom. Lion's Mane supports emotional resilience through neuroplasticity. Tremella is deeply hydrating and nourishing.",
        "products": [
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms Organic Capsules"
          },
          {
            "asin": "B01MR4Y0CZ",
            "name": "Aromatherapy Essential Oil Diffuser"
          },
          {
            "asin": "1646119266",
            "name": "Guided Meditation Journal"
          },
          {
            "asin": "B074TBYWGS",
            "name": "Silk Sleep Eye Mask"
          }
        ]
      }
    ]
  },
  {
    "slug": "microdosing-mushroom-quiz",
    "title": "Microdosing Mushrooms: Are You Ready?",
    "desc": "An honest assessment of your readiness, knowledge, and preparation for a psilocybin microdosing practice. No judgment, just clarity.",
    "heroImage": "https://quiet-medicine.b-cdn.net/images/mushroom-science-lab.webp",
    "questions": [
      {
        "q": "Why are you interested in microdosing?",
        "opts": [
          "I heard it helps with depression or anxiety",
          "I want to boost creativity and flow states",
          "I am curious after reading about it",
          "I have macro-dose experience and want a subtler practice"
        ]
      },
      {
        "q": "Do you understand what a microdose actually is?",
        "opts": [
          "Not really, I just know it is a small amount",
          "I think it is about 0.1 to 0.3 grams of dried psilocybin mushrooms",
          "I know the dose range and that it should be sub-perceptual",
          "I understand dose ranges, protocols, and individual variation"
        ]
      },
      {
        "q": "Are you currently taking any psychiatric medications?",
        "opts": [
          "Yes, SSRIs or SNRIs",
          "Yes, other psychiatric medications",
          "I recently stopped medications",
          "No psychiatric medications"
        ]
      },
      {
        "q": "Do you have access to a precision scale that measures to 0.01g or better?",
        "opts": [
          "No, I would just eyeball it",
          "I have a kitchen scale",
          "I have a scale that measures to 0.01g",
          "I have a milligram scale (0.001g)"
        ]
      },
      {
        "q": "How would you track your microdosing experience?",
        "opts": [
          "I probably would not track it",
          "Mental notes",
          "A simple journal or app",
          "Detailed daily journal with mood, sleep, creativity, and physical metrics"
        ]
      },
      {
        "q": "Do you understand the legal status of psilocybin where you live?",
        "opts": [
          "No idea",
          "I think it might be illegal",
          "I know the general legal status",
          "I have researched the specific laws in my jurisdiction thoroughly"
        ]
      }
    ],
    "results": [
      {
        "title": "Not Ready Yet: Build Your Foundation First",
        "text": "Honest answer: you are not ready to start microdosing, and that is completely fine. There are some important knowledge gaps and preparation steps to address first. If you are on SSRIs, consult a doctor. If you are eyeballing doses, you need a precision scale. Start with education and preparation.",
        "products": [
          {
            "asin": "0735224153",
            "name": "How to Change Your Mind by Michael Pollan"
          },
          {
            "asin": "1594774021",
            "name": "The Psychedelic Explorer's Guide"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "The Psychedelic Integration Journal"
          }
        ]
      },
      {
        "title": "Getting Closer: A Few More Steps",
        "text": "You have some foundation but there are practical gaps to address. A milligram scale is not optional. It is essential safety equipment. And a structured journal turns a vague experiment into actionable data about what works for your specific brain chemistry.",
        "products": [
          {
            "asin": "B0885S1866",
            "name": "Precision Milligram Scale"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "The Psychedelic Integration Journal"
          },
          {
            "asin": "0735224153",
            "name": "How to Change Your Mind"
          }
        ]
      },
      {
        "title": "Well Prepared: Ready to Begin Carefully",
        "text": "Your knowledge, tools, and approach suggest you are in a good position to explore microdosing thoughtfully. Start with the Fadiman Protocol (one day on, two days off) at the lowest dose you think might work, then adjust.",
        "products": [
          {
            "asin": "B0885S1866",
            "name": "Precision Milligram Scale"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "The Psychedelic Integration Journal"
          },
          {
            "asin": "B078SZX3ML",
            "name": "Lion's Mane Capsules (Stamets Stack)"
          }
        ]
      },
      {
        "title": "Deeply Prepared: Experienced and Equipped",
        "text": "You bring significant knowledge, proper equipment, and a structured approach to microdosing. Consider the Stamets Stack (psilocybin + Lion's Mane + niacin) for enhanced neurogenesis.",
        "products": [
          {
            "asin": "B078SZX3ML",
            "name": "Lion's Mane Capsules (Stamets Stack)"
          },
          {
            "asin": "B0885S1866",
            "name": "Precision Milligram Scale"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "The Psychedelic Integration Journal"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life by Merlin Sheldrake"
          }
        ]
      }
    ]
  },
  {
    "slug": "edible-mushroom-personality",
    "title": "What's Your Edible Mushroom Personality?",
    "desc": "A fun quiz to discover which gourmet and culinary mushroom matches your cooking style, flavor preferences, and kitchen confidence.",
    "heroImage": "https://quiet-medicine.b-cdn.net/images/mushroom-hero-assessments.webp",
    "questions": [
      {
        "q": "How adventurous are you in the kitchen?",
        "opts": [
          "I stick to recipes I know",
          "I try new things occasionally",
          "I experiment regularly",
          "I treat cooking as creative expression"
        ]
      },
      {
        "q": "What flavor profile do you gravitate toward?",
        "opts": [
          "Mild and familiar",
          "Rich and savory (umami)",
          "Bold and earthy",
          "Complex and layered"
        ]
      },
      {
        "q": "How do you feel about foraging your own food?",
        "opts": [
          "That sounds terrifying",
          "Interesting but I would need a guide",
          "I have done it or would love to try",
          "I forage regularly"
        ]
      },
      {
        "q": "What is your go-to cooking method?",
        "opts": [
          "Quick stir-fry or saute",
          "Slow-cooked soups and stews",
          "Grilling or roasting",
          "Raw or lightly prepared"
        ]
      },
      {
        "q": "How important is the health benefit of what you eat?",
        "opts": [
          "I eat for taste, not health",
          "I think about it sometimes",
          "I actively choose nutrient-dense foods",
          "Food is medicine to me"
        ]
      }
    ],
    "results": [
      {
        "title": "Button & Cremini: The Reliable Classic",
        "text": "You are the white button and cremini mushroom. Approachable, versatile, and more interesting than people give you credit for. Cremini mushrooms have a deeper flavor than white buttons and work in everything from pasta to pizza.",
        "products": [
          {
            "asin": "B09VK9S4JB",
            "name": "Mushroom Growing Kit"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life by Merlin Sheldrake"
          },
          {
            "asin": "B078SZX3ML",
            "name": "Lion's Mane Supplement"
          }
        ]
      },
      {
        "title": "Shiitake: The Umami Master",
        "text": "You are the shiitake mushroom. Rich, deeply savory, and packed with lentinan. Shiitakes bring that deep umami backbone to stir-fries, ramen, risotto, and dashi broth.",
        "products": [
          {
            "asin": "B09VK9S4JB",
            "name": "Mushroom Growing Kit"
          },
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms Supplement"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life"
          }
        ]
      },
      {
        "title": "Maitake: The Wild Forager",
        "text": "You are the maitake, also called Hen of the Woods. Found growing at the base of oak trees in autumn, maitake is prized by foragers and chefs alike.",
        "products": [
          {
            "asin": "B09VK9S4JB",
            "name": "Mushroom Growing Kit"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life by Merlin Sheldrake"
          },
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms Supplement"
          }
        ]
      },
      {
        "title": "Lion's Mane: The Culinary Innovator",
        "text": "You are Lion's Mane. When sliced thick and seared in butter, this mushroom develops a texture and flavor remarkably similar to crab or lobster. It is the mushroom that makes non-mushroom-lovers reconsider everything.",
        "products": [
          {
            "asin": "B09VK9S4JB",
            "name": "Mushroom Growing Kit"
          },
          {
            "asin": "B078SZX3ML",
            "name": "Lion's Mane Capsules"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life"
          }
        ]
      }
    ]
  },
  {
    "slug": "mushroom-blend-builder",
    "title": "Build Your Custom Mushroom Blend",
    "desc": "Answer questions about your daily routine, health priorities, and preferences to get a personalized mushroom supplement blend recommendation.",
    "heroImage": "https://quiet-medicine.b-cdn.net/images/mushroom-forest-magical.webp",
    "questions": [
      {
        "q": "What time do you wake up?",
        "opts": [
          "Before 6 AM",
          "6 to 8 AM",
          "8 to 10 AM",
          "After 10 AM"
        ]
      },
      {
        "q": "How would you describe your stress level?",
        "opts": [
          "Constantly overwhelmed",
          "High but manageable",
          "Moderate, comes and goes",
          "Low, I manage stress well"
        ]
      },
      {
        "q": "Do you drink coffee or tea?",
        "opts": [
          "Multiple cups of coffee daily",
          "One cup of coffee in the morning",
          "I prefer tea",
          "Neither, I avoid caffeine"
        ]
      },
      {
        "q": "How is your skin health?",
        "opts": [
          "Problematic, frequent breakouts or dryness",
          "Okay but could be better",
          "Generally fine",
          "Great, I invest in skin health"
        ]
      },
      {
        "q": "What is your biggest health concern right now?",
        "opts": [
          "Brain fog and poor concentration",
          "Low energy and fatigue",
          "Frequent illness or slow recovery",
          "Anxiety and poor sleep"
        ]
      },
      {
        "q": "How do you feel about taking multiple supplements?",
        "opts": [
          "I want one simple product",
          "Two to three is fine",
          "I do not mind a full protocol",
          "I already take many supplements"
        ]
      }
    ],
    "results": [
      {
        "title": "The Morning Clarity Blend: Lion's Mane + Cordyceps",
        "text": "Your early mornings and brain fog point to a clean cognitive-energy stack. Add Lion's Mane powder to your morning coffee for focus without anxiety, and Cordyceps for sustained physical energy.",
        "products": [
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms Lion's Mane Capsules"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "Wellness Tracking Journal"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life"
          }
        ]
      },
      {
        "title": "The Resilience Blend: Chaga + Turkey Tail + Cordyceps",
        "text": "Your immune concerns and energy needs call for the resilience trio. Chaga brings the highest antioxidant load. Turkey Tail provides proven beta-glucan immune support. Cordyceps fills the energy gap.",
        "products": [
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms Organic Capsules"
          },
          {
            "asin": "B09VK9S4JB",
            "name": "Mushroom Growing Kit"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life"
          }
        ]
      },
      {
        "title": "The Beauty + Brain Blend: Tremella + Lion's Mane + Reishi",
        "text": "Your skin concerns and stress levels point to the beauty-brain-calm trio. Tremella holds 500 times its weight in water, deeply hydrating skin from within.",
        "products": [
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms Organic Capsules"
          },
          {
            "asin": "B01MR4Y0CZ",
            "name": "Aromatherapy Diffuser"
          },
          {
            "asin": "1646119266",
            "name": "Guided Meditation Journal"
          }
        ]
      },
      {
        "title": "The Full Spectrum Protocol: 5-Mushroom Daily Stack",
        "text": "You are ready for the comprehensive approach. Lion's Mane (1000mg morning), Cordyceps (500mg morning), Chaga (500mg midday), Turkey Tail (1000mg with meals), and Reishi (1500mg evening). Cycle 5 days on, 2 days off.",
        "products": [
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms Organic Capsules"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "Wellness Tracking Journal"
          },
          {
            "asin": "B0FPML7DJC",
            "name": "WHOOP 5.0 HRV Monitor"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life"
          }
        ]
      }
    ]
  },
  {
    "slug": "mushroom-myths-vs-facts",
    "title": "Mushroom Myths vs. Facts",
    "desc": "Can you separate mushroom science from mushroom folklore? Test your knowledge of common misconceptions about both culinary and psychedelic mushrooms.",
    "heroImage": "https://quiet-medicine.b-cdn.net/images/mushroom-psychedelic-pattern.webp",
    "questions": [
      {
        "q": "True or false: All brightly colored mushrooms are poisonous.",
        "opts": [
          "True, bright colors always mean danger",
          "False, color alone does not determine toxicity",
          "True, but only red and orange ones",
          "It depends on the season"
        ]
      },
      {
        "q": "Can you build a tolerance to psilocybin mushrooms?",
        "opts": [
          "No, each experience is the same",
          "Yes, tolerance builds rapidly within days",
          "Only if you take very high doses",
          "Tolerance takes months to develop"
        ]
      },
      {
        "q": "Are mushroom supplements all created equal?",
        "opts": [
          "Yes, a mushroom is a mushroom",
          "No, many supplements use mycelium on grain, not actual fruiting bodies",
          "Only organic ones matter",
          "Price determines quality"
        ]
      },
      {
        "q": "Can you overdose fatally on psilocybin mushrooms alone?",
        "opts": [
          "Yes, easily",
          "Yes, at high doses",
          "The lethal dose is estimated at 1.7 kg of dried mushrooms, making fatal overdose practically impossible",
          "There is no lethal dose"
        ]
      },
      {
        "q": "Do cooking mushrooms destroy their nutritional value?",
        "opts": [
          "Yes, always eat them raw",
          "Cooking actually makes many mushroom nutrients more bioavailable",
          "It does not matter either way",
          "Only microwaving destroys nutrients"
        ]
      },
      {
        "q": "Is the \"Stamets Stack\" for microdosing scientifically proven?",
        "opts": [
          "Yes, multiple clinical trials confirm it",
          "It has theoretical backing and anecdotal support but lacks large-scale clinical trials",
          "It has been debunked",
          "It only works with specific mushroom strains"
        ]
      }
    ],
    "results": [
      {
        "title": "Myth Believer: Time for a Reality Check",
        "text": "You have absorbed some common mushroom myths that could lead you astray. The biggest misconception: color does not indicate toxicity, and not all supplements are the same.",
        "products": [
          {
            "asin": "0735224153",
            "name": "How to Change Your Mind"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life"
          },
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms (Fruiting Body Extract)"
          }
        ]
      },
      {
        "title": "Mixed Knowledge: Some Myths Still Lingering",
        "text": "You got some right and some wrong. The supplement quality question trips up most people. Many products labeled \"mushroom\" are actually mycelium grown on grain.",
        "products": [
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms (Fruiting Body)"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "The Psychedelic Integration Journal"
          }
        ]
      },
      {
        "title": "Fact-Based Thinker: Well Informed",
        "text": "You have a strong grasp of mushroom science versus folklore. Your critical thinking serves you well in a space full of marketing hype and misinformation.",
        "products": [
          {
            "asin": "B09VK9S4JB",
            "name": "Mushroom Growing Kit"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life"
          },
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms Supplement"
          }
        ]
      },
      {
        "title": "Mycology Scholar: You Know Your Fungi",
        "text": "You can separate science from folklore with precision. Your knowledge base is solid enough to help others cut through the noise in the mushroom wellness space.",
        "products": [
          {
            "asin": "B09VK9S4JB",
            "name": "Mushroom Growing Kit"
          },
          {
            "asin": "0060801719",
            "name": "The Doors of Perception"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life"
          },
          {
            "asin": "B0885S1866",
            "name": "Precision Milligram Scale"
          }
        ]
      }
    ]
  }
];

app.get('/quizzes', (req, res) => {
  res.send(htmlHead('Quizzes — ' + SITE.title, 'Interactive quizzes to explore your readiness, preferences, and path in psychedelic wellness.', SITE.domain + '/quizzes') + '\n' +
    '<body>\n' + navHTML() + '\n' +
    '<div class="hero" style="padding:60px 24px 40px;background:linear-gradient(180deg, rgba(13,11,26,0.4) 0%, rgba(13,11,26,0.85) 100%), url(\'https://quiet-medicine.b-cdn.net/images/mushroom-hero-quizzes.webp\') center/cover no-repeat;min-height:300px;display:flex;align-items:center;">\n' +
    '  <div class="hero-content"><h1>Quizzes</h1><p class="tagline">Explore your readiness, discover your path, and deepen your understanding.</p></div>\n' +
    '</div>\n' +
    '<main class="wide" style="padding-top:40px;">\n' +
    '<div class="quiz-index-grid">\n' +
    quizzes.map(function(q) {
      return '<div class="quiz-index-card">' + (q.heroImage ? '<img src="' + q.heroImage + '" alt="' + q.title + '" style="width:100%;height:180px;object-fit:cover;border-radius:12px 12px 0 0;margin:-20px -20px 16px;width:calc(100% + 40px);">' : '') + '<h3><a href="/quiz/' + q.slug + '">' + q.title + '</a></h3><p>' + q.desc + '</p></div>';
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
      '  if (r.products && r.products.length > 0) {\n' +
      '    var prodHtml = \'<div style="margin-top:32px;text-align:left;"><h3 style="font-size:18px;color:var(--accent);margin-bottom:16px;">Recommended Products</h3>\';\n' +
      '    r.products.forEach(function(p) {\n' +
      '      prodHtml += \'<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;margin-bottom:8px;background:rgba(124,77,255,0.06);border-radius:8px;border:1px solid rgba(124,77,255,0.15);"><span style="font-size:20px;">\\ud83c\\udf44</span><div><a href="https://www.amazon.com/dp/\' + p.asin + \'?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored" style="color:var(--accent);text-decoration:none;font-weight:600;">\' + p.name + \'</a><span style="font-size:11px;color:var(--text-dim);margin-left:8px;">(paid link)</span></div></div>\';\n' +
      '    });\n' +
      '    prodHtml += \'</div>\';\n' +
      '    document.getElementById("resultText").insertAdjacentHTML("afterend", prodHtml);\n' +
      '  }\n' +
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
  {
    "slug": "mushroom-supplement-readiness",
    "title": "Mushroom Supplement Readiness Assessment",
    "desc": "A thorough evaluation of your health background, current medications, and goals to determine which functional mushroom supplements are safe and appropriate for you.",
    "heroImage": "https://quiet-medicine.b-cdn.net/images/mushroom-hero-assessments.webp",
    "questions": [
      {
        "q": "Are you currently taking any blood-thinning medications (warfarin, aspirin, heparin)?",
        "opts": [
          "Yes",
          "No",
          "I am not sure"
        ]
      },
      {
        "q": "Do you have any autoimmune conditions (lupus, rheumatoid arthritis, MS, etc.)?",
        "opts": [
          "Yes, diagnosed",
          "Suspected but not diagnosed",
          "No"
        ]
      },
      {
        "q": "Are you pregnant, breastfeeding, or planning to become pregnant?",
        "opts": [
          "Yes",
          "Possibly",
          "No"
        ]
      },
      {
        "q": "Do you have any known allergies to molds or fungi?",
        "opts": [
          "Yes, confirmed allergy",
          "I have had reactions but not tested",
          "No known allergies"
        ]
      },
      {
        "q": "Are you currently taking immunosuppressant medications?",
        "opts": [
          "Yes",
          "I was recently but stopped",
          "No"
        ]
      },
      {
        "q": "Have you had any organ transplants?",
        "opts": [
          "Yes",
          "No"
        ]
      },
      {
        "q": "Do you have low blood pressure or take blood pressure medication?",
        "opts": [
          "Yes, both",
          "Low blood pressure only",
          "Blood pressure medication only",
          "Neither"
        ]
      },
      {
        "q": "Are you scheduled for surgery in the next two weeks?",
        "opts": [
          "Yes",
          "No"
        ]
      }
    ],
    "results": [
      {
        "title": "Proceed with Caution: Medical Consultation Required",
        "text": "Based on your responses, there are potential contraindications that require professional medical guidance before starting mushroom supplements. Several functional mushrooms can interact with blood thinners, affect blood sugar, and modulate immune function. Please bring this assessment to your doctor.",
        "products": [
          {
            "asin": "0143127748",
            "name": "The Body Keeps the Score"
          },
          {
            "asin": "1646119266",
            "name": "Guided Meditation Journal"
          },
          {
            "asin": "B0CHVYY8P4",
            "name": "Therapy Journal with Guided Prompts"
          }
        ]
      },
      {
        "title": "Low Risk: Start Slowly with Basic Species",
        "text": "Your health profile suggests a low-risk starting point for functional mushroom supplements. Begin with well-researched species like Lion's Mane or Turkey Tail. Start at half the recommended dose for the first week.",
        "products": [
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms Lion's Mane Capsules"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "Wellness Tracking Journal"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life by Merlin Sheldrake"
          }
        ]
      },
      {
        "title": "Good to Go: Full Spectrum Available",
        "text": "Your health profile shows no major contraindications. You have a wide range of species available to you. Quality matters enormously: look for fruiting body supplements with verified beta-glucan content.",
        "products": [
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms Organic Capsules"
          },
          {
            "asin": "B09VK9S4JB",
            "name": "Mushroom Growing Kit"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "Wellness Tracking Journal"
          }
        ]
      }
    ]
  },
  {
    "slug": "psychedelic-readiness-assessment",
    "title": "Psychedelic Mushroom Readiness Assessment",
    "desc": "A comprehensive evaluation of your mental health history, support system, and preparation level for a psychedelic mushroom experience. Honest, clinical, no hype.",
    "heroImage": "https://quiet-medicine.b-cdn.net/images/mushroom-psychedelic-pattern.webp",
    "questions": [
      {
        "q": "Do you have a personal or family history of schizophrenia, schizoaffective disorder, or psychotic episodes?",
        "opts": [
          "Yes, personal history",
          "Yes, family history",
          "Not that I know of",
          "No"
        ]
      },
      {
        "q": "Are you currently taking lithium, tramadol, or MAO inhibitors?",
        "opts": [
          "Yes, one or more of these",
          "I recently stopped one of these",
          "No"
        ]
      },
      {
        "q": "Do you have a trusted person who could serve as a sitter or guide?",
        "opts": [
          "No, I would do it alone",
          "I have friends but none with experience",
          "I have someone willing but inexperienced",
          "I have an experienced sitter or professional guide"
        ]
      },
      {
        "q": "How would you describe your current mental health?",
        "opts": [
          "In active crisis or severe distress",
          "Struggling but stable",
          "Generally okay with some challenges",
          "Stable and grounded"
        ]
      },
      {
        "q": "What is your experience with meditation or mindfulness practices?",
        "opts": [
          "None",
          "I have tried it a few times",
          "Regular but inconsistent practice",
          "Established daily practice"
        ]
      },
      {
        "q": "Have you researched what a psychedelic experience actually involves?",
        "opts": [
          "Not really",
          "I have read some articles",
          "I have read multiple books and trip reports",
          "I have extensive research and/or personal experience"
        ]
      },
      {
        "q": "Do you have a clear intention for why you want this experience?",
        "opts": [
          "Not really, just curious",
          "Vague sense of wanting growth",
          "Specific intention I can articulate",
          "Deep, well-considered intention with preparation work done"
        ]
      },
      {
        "q": "Are you in a stable life situation (housing, relationships, work)?",
        "opts": [
          "Multiple areas of instability",
          "Some instability",
          "Mostly stable",
          "Very stable"
        ]
      }
    ],
    "results": [
      {
        "title": "Not Recommended at This Time",
        "text": "Based on your responses, a psychedelic mushroom experience is not recommended right now. If you have a history of psychosis or are taking lithium/MAOIs, psilocybin carries serious risks. Please prioritize conventional mental health support first.",
        "products": [
          {
            "asin": "0143127748",
            "name": "The Body Keeps the Score"
          },
          {
            "asin": "B0CHVYY8P4",
            "name": "Therapy Journal"
          },
          {
            "asin": "1646119266",
            "name": "Guided Meditation Journal"
          }
        ]
      },
      {
        "title": "More Preparation Needed",
        "text": "You have some readiness factors in place but important gaps remain. Focus on: having an experienced sitter, building a meditation practice, and clarifying your intention. Spend 2-3 months on preparation.",
        "products": [
          {
            "asin": "0735224153",
            "name": "How to Change Your Mind"
          },
          {
            "asin": "1594774021",
            "name": "The Psychedelic Explorer's Guide"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "The Psychedelic Integration Journal"
          },
          {
            "asin": "B0D2K8N8NR",
            "name": "Meditation Cushion"
          }
        ]
      },
      {
        "title": "Approaching Readiness",
        "text": "Your profile shows meaningful preparation and a solid foundation. Consider a low-dose experience (1-1.5g dried) as your first step rather than a full dose.",
        "products": [
          {
            "asin": "B0885S1866",
            "name": "Precision Milligram Scale"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "The Psychedelic Integration Journal"
          },
          {
            "asin": "B09XS7JWHH",
            "name": "Sony WH-1000XM5 Headphones"
          },
          {
            "asin": "B0DK86ZBNJ",
            "name": "Cozy Therapy Blanket"
          }
        ]
      },
      {
        "title": "Well Prepared: Strong Foundation",
        "text": "Your assessment indicates thorough preparation across all key dimensions. The remaining steps are practical: confirm your sitter, prepare your space, prepare a playlist, and set aside 8 hours with no obligations the following day.",
        "products": [
          {
            "asin": "B09XS7JWHH",
            "name": "Sony WH-1000XM5 Headphones"
          },
          {
            "asin": "B0DK86ZBNJ",
            "name": "Cozy Therapy Blanket"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "The Psychedelic Integration Journal"
          },
          {
            "asin": "B074TBYWGS",
            "name": "Silk Sleep Eye Mask"
          }
        ]
      }
    ]
  },
  {
    "slug": "mushroom-growing-readiness",
    "title": "Home Mushroom Cultivation Readiness",
    "desc": "Assess whether you have the space, patience, and knowledge to successfully grow mushrooms at home. From oyster mushrooms to lion's mane.",
    "heroImage": "https://quiet-medicine.b-cdn.net/images/mushroom-forest-magical.webp",
    "questions": [
      {
        "q": "Do you have a clean, temperature-controlled indoor space you can dedicate to growing?",
        "opts": [
          "No dedicated space",
          "A closet or small area I could use",
          "A spare room or basement",
          "I have a dedicated growing area already set up"
        ]
      },
      {
        "q": "How patient are you with slow processes?",
        "opts": [
          "I want results fast",
          "I can wait a few weeks",
          "I enjoy slow, methodical processes",
          "I find waiting meditative"
        ]
      },
      {
        "q": "How comfortable are you with sterile technique?",
        "opts": [
          "Not very",
          "I can follow instructions",
          "I am naturally careful and detail-oriented",
          "I have lab or medical experience with sterile technique"
        ]
      },
      {
        "q": "What is your budget for getting started?",
        "opts": [
          "Under $25",
          "$25 to $75",
          "$75 to $200",
          "Over $200"
        ]
      },
      {
        "q": "Which mushrooms are you most interested in growing?",
        "opts": [
          "Oyster mushrooms (easiest)",
          "Shiitake",
          "Lion's Mane",
          "Multiple species including more challenging ones"
        ]
      },
      {
        "q": "How do you handle setbacks and failed experiments?",
        "opts": [
          "I get frustrated and quit",
          "Disappointed but I try again",
          "I analyze what went wrong and adjust",
          "Failure is part of the process, I expect it"
        ]
      }
    ],
    "results": [
      {
        "title": "Start with a Ready-Made Kit",
        "text": "Your current setup points to starting with a pre-made mushroom growing kit. These come with fully colonized substrate. Just open, mist daily, and harvest in 7-14 days. Oyster mushroom kits have the highest success rate for beginners.",
        "products": [
          {
            "asin": "B09VK9S4JB",
            "name": "Mushroom Growing Kit"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life by Merlin Sheldrake"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "Growing Journal"
          }
        ]
      },
      {
        "title": "Ready for Intermediate Growing",
        "text": "You have the patience, space, and mindset for intermediate mushroom cultivation. Start with oyster mushrooms on straw (very forgiving) and progress to shiitake on supplemented sawdust.",
        "products": [
          {
            "asin": "B09VK9S4JB",
            "name": "Mushroom Growing Kit"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "Cultivation Journal"
          }
        ]
      },
      {
        "title": "Advanced Cultivator Potential",
        "text": "Your combination of dedicated space, patience, sterile technique comfort, and resilience positions you for serious mushroom cultivation. Consider building a still-air box or investing in a laminar flow hood.",
        "products": [
          {
            "asin": "B09VK9S4JB",
            "name": "Mushroom Growing Kit"
          },
          {
            "asin": "B0885S1866",
            "name": "Precision Scale"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life"
          },
          {
            "asin": "B078SZX3ML",
            "name": "Lion's Mane Supplement"
          }
        ]
      }
    ]
  },
  {
    "slug": "integration-readiness-assessment",
    "title": "Psychedelic Integration Readiness",
    "desc": "After a psychedelic mushroom experience, integration is where the real work happens. Assess your readiness to process and apply what you experienced.",
    "heroImage": "https://quiet-medicine.b-cdn.net/images/mushroom-psychedelic-pattern.webp",
    "questions": [
      {
        "q": "How soon after your experience are you taking this assessment?",
        "opts": [
          "During or immediately after",
          "Within the first week",
          "One to four weeks after",
          "More than a month after"
        ]
      },
      {
        "q": "Can you articulate what happened during your experience?",
        "opts": [
          "It is completely overwhelming and confusing",
          "I have fragments but cannot make sense of them",
          "I can describe the main themes and feelings",
          "I have a clear narrative with specific insights"
        ]
      },
      {
        "q": "Do you have someone you can talk to about your experience?",
        "opts": [
          "No one who would understand",
          "Friends but they have no psychedelic experience",
          "A friend or partner with psychedelic experience",
          "A therapist or integration specialist"
        ]
      },
      {
        "q": "How are you sleeping since your experience?",
        "opts": [
          "Barely sleeping, racing thoughts",
          "Disrupted but functional",
          "About the same as before",
          "Better than before"
        ]
      },
      {
        "q": "Are you experiencing persistent anxiety, depersonalization, or intrusive thoughts?",
        "opts": [
          "Yes, significantly",
          "Mildly",
          "Briefly but they passed",
          "No"
        ]
      },
      {
        "q": "Do you have a journaling or reflective practice?",
        "opts": [
          "No",
          "I have tried but do not stick with it",
          "Occasional journaling",
          "Regular journaling or contemplative practice"
        ]
      },
      {
        "q": "Have you made any impulsive major life decisions since your experience?",
        "opts": [
          "Yes, several",
          "I am considering major changes",
          "I have ideas but I am sitting with them",
          "No, I am letting things settle"
        ]
      }
    ],
    "results": [
      {
        "title": "Seek Professional Support",
        "text": "Your responses suggest you may be experiencing challenging after-effects that would benefit from professional support. The Fireside Project (62-FIRESIDE) offers free peer support. MAPS maintains a directory of integration therapists.",
        "products": [
          {
            "asin": "0143127748",
            "name": "The Body Keeps the Score"
          },
          {
            "asin": "B0CHVYY8P4",
            "name": "Therapy Journal with Guided Prompts"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "The Psychedelic Integration Journal"
          }
        ]
      },
      {
        "title": "Active Integration Phase",
        "text": "You are in the active integration window. Write everything down before it fades, avoid major life decisions for at least two weeks, and find someone to talk to who can hold space without judgment.",
        "products": [
          {
            "asin": "B0CRKX1VV7",
            "name": "The Psychedelic Integration Journal"
          },
          {
            "asin": "B0D2K8N8NR",
            "name": "Meditation Cushion"
          },
          {
            "asin": "1646119266",
            "name": "Guided Meditation Journal"
          }
        ]
      },
      {
        "title": "Grounded Integration",
        "text": "You are processing your experience from a stable, grounded place. The work now is translating insight into action. What specific changes did the experience point toward?",
        "products": [
          {
            "asin": "B0CRKX1VV7",
            "name": "The Psychedelic Integration Journal"
          },
          {
            "asin": "B0D2K8N8NR",
            "name": "Meditation Cushion"
          },
          {
            "asin": "0062429655",
            "name": "Stealing Fire by Steven Kotler"
          }
        ]
      }
    ]
  },
  {
    "slug": "mushroom-knowledge-level",
    "title": "Your Mushroom Knowledge Level",
    "desc": "A comprehensive assessment of your mycological knowledge across identification, cultivation, pharmacology, history, and ecology.",
    "heroImage": "https://quiet-medicine.b-cdn.net/images/mushroom-hero-quizzes.webp",
    "questions": [
      {
        "q": "Can you name the five parts of a typical mushroom fruiting body?",
        "opts": [
          "I could not name any",
          "I know cap and stem",
          "I know cap, stem, gills, and maybe one more",
          "Cap, stem, gills, ring (annulus), and volva"
        ]
      },
      {
        "q": "What is mycelium?",
        "opts": [
          "The mushroom cap",
          "The underground root-like network of fungal threads",
          "A type of mushroom spore",
          "The soil mushrooms grow in"
        ]
      },
      {
        "q": "What role do fungi play in forest ecosystems?",
        "opts": [
          "They are parasites that harm trees",
          "They decompose dead matter only",
          "They form mycorrhizal networks that connect and nourish trees, decompose organic matter, and cycle nutrients",
          "They compete with plants for sunlight"
        ]
      },
      {
        "q": "What is the difference between a spore print and a spore syringe?",
        "opts": [
          "No idea",
          "I know what a spore print is but not a syringe",
          "I understand both conceptually",
          "I can explain both and have made or used them"
        ]
      },
      {
        "q": "Who is Paul Stamets and why is he significant?",
        "opts": [
          "Never heard of him",
          "I think he is a mushroom scientist",
          "He is a prominent mycologist and advocate for fungal solutions",
          "I know his work in detail including patents, books, and the Stamets Stack"
        ]
      },
      {
        "q": "What is the Wood Wide Web?",
        "opts": [
          "A website about trees",
          "The mycorrhizal network connecting trees through fungal threads underground",
          "A type of spider web found in forests",
          "I am not sure"
        ]
      },
      {
        "q": "Can you explain saprotrophic, mycorrhizal, and parasitic fungi?",
        "opts": [
          "No",
          "I know one of these terms",
          "I understand two of the three",
          "I can explain all three and give examples of each"
        ]
      }
    ],
    "results": [
      {
        "title": "Mushroom Curious: Welcome to the Kingdom",
        "text": "You are at the beginning of what could become a lifelong fascination. Fungi are the hidden kingdom that makes life on Earth possible. Start with Merlin Sheldrake's Entangled Life for a mind-expanding introduction.",
        "products": [
          {
            "asin": "0525510311",
            "name": "Entangled Life by Merlin Sheldrake"
          },
          {
            "asin": "B09VK9S4JB",
            "name": "Mushroom Growing Kit"
          },
          {
            "asin": "0735224153",
            "name": "How to Change Your Mind"
          }
        ]
      },
      {
        "title": "Developing Mycophile: Building Knowledge",
        "text": "You have a foundation that puts you ahead of most people. The next level involves hands-on experience: growing mushrooms, learning spore printing, and understanding ecological relationships.",
        "products": [
          {
            "asin": "B09VK9S4JB",
            "name": "Mushroom Growing Kit"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life"
          },
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms Supplement"
          }
        ]
      },
      {
        "title": "Knowledgeable Mycophile: Solid Understanding",
        "text": "Your mycological knowledge is substantial. Your next growth edge might be in specialized areas: medicinal mushroom pharmacology, advanced cultivation techniques, or fungal taxonomy.",
        "products": [
          {
            "asin": "B09VK9S4JB",
            "name": "Mushroom Growing Kit"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life"
          },
          {
            "asin": "0060801719",
            "name": "The Doors of Perception"
          },
          {
            "asin": "B0885S1866",
            "name": "Precision Scale"
          }
        ]
      },
      {
        "title": "Advanced Mycologist: Deep Expertise",
        "text": "Your knowledge spans fungal biology, ecology, pharmacology, cultivation, and cultural history. You are the kind of person who could teach others or contribute to citizen science projects.",
        "products": [
          {
            "asin": "0525510311",
            "name": "Entangled Life"
          },
          {
            "asin": "0060801719",
            "name": "The Doors of Perception"
          },
          {
            "asin": "B09VK9S4JB",
            "name": "Advanced Growing Kit"
          }
        ]
      }
    ]
  },
  {
    "slug": "mushroom-interaction-risk",
    "title": "Mushroom-Drug Interaction Risk Assessment",
    "desc": "Evaluate potential interactions between mushroom supplements or psilocybin and your current medications. Safety first, always.",
    "heroImage": "https://quiet-medicine.b-cdn.net/images/mushroom-science-lab.webp",
    "questions": [
      {
        "q": "Which category best describes your current medications?",
        "opts": [
          "SSRIs or SNRIs (antidepressants)",
          "Lithium, MAOIs, or tricyclic antidepressants",
          "Blood thinners (warfarin, Eliquis, Xarelto)",
          "Blood pressure or heart medications",
          "Immunosuppressants",
          "Diabetes medications",
          "I take no prescription medications"
        ]
      },
      {
        "q": "What type of mushroom product are you considering?",
        "opts": [
          "Functional supplements only (Lion's Mane, Reishi, etc.)",
          "Psilocybin microdosing",
          "Psilocybin macro-dose experience",
          "Both functional supplements and psilocybin"
        ]
      },
      {
        "q": "How many different medications do you take daily?",
        "opts": [
          "None",
          "One to two",
          "Three to five",
          "More than five"
        ]
      },
      {
        "q": "Do you consume alcohol regularly?",
        "opts": [
          "Daily",
          "Several times a week",
          "Occasionally",
          "Rarely or never"
        ]
      },
      {
        "q": "Have you ever had an adverse reaction to a supplement or herbal product?",
        "opts": [
          "Yes, serious reaction",
          "Yes, mild reaction",
          "Not that I recall",
          "No"
        ]
      },
      {
        "q": "Are you taking any serotonin-affecting supplements (St. John's Wort, 5-HTP, SAMe)?",
        "opts": [
          "Yes, one or more",
          "I am not sure",
          "No"
        ]
      }
    ],
    "results": [
      {
        "title": "HIGH RISK: Do Not Proceed Without Medical Supervision",
        "text": "Your medication profile indicates HIGH RISK for dangerous interactions. Lithium + psilocybin can trigger seizures. MAOIs + psilocybin can cause serotonin syndrome. DO NOT combine any mushroom product with your current medications without explicit physician approval.",
        "products": [
          {
            "asin": "0143127748",
            "name": "The Body Keeps the Score"
          },
          {
            "asin": "B0CHVYY8P4",
            "name": "Therapy Journal"
          },
          {
            "asin": "1646119266",
            "name": "Guided Meditation Journal"
          }
        ]
      },
      {
        "title": "MODERATE RISK: Medical Consultation Required",
        "text": "Your profile shows moderate interaction risk. SSRIs significantly reduce psilocybin effects and there are theoretical serotonin risks. Reishi and Maitake can affect blood pressure and blood sugar. Schedule a conversation with your doctor.",
        "products": [
          {
            "asin": "0735224153",
            "name": "How to Change Your Mind"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "The Psychedelic Integration Journal"
          },
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms Supplement"
          }
        ]
      },
      {
        "title": "LOW RISK: Proceed Mindfully",
        "text": "Your medication profile suggests low interaction risk. Start with low doses, introduce one new product at a time, and monitor your response for at least a week before adjusting.",
        "products": [
          {
            "asin": "B078SZX3ML",
            "name": "Real Mushrooms Lion's Mane"
          },
          {
            "asin": "B0885S1866",
            "name": "Precision Milligram Scale"
          },
          {
            "asin": "B0CRKX1VV7",
            "name": "Wellness Tracking Journal"
          },
          {
            "asin": "0525510311",
            "name": "Entangled Life"
          }
        ]
      }
    ]
  }
];

app.get('/assessments', (req, res) => {
  res.send(htmlHead('Assessments — ' + SITE.title, 'In-depth self-assessments with downloadable PDF results for your psychedelic wellness journey.', SITE.domain + '/assessments') + '\n' +
    '<body>\n' + navHTML() + '\n' +
    '<div class="hero" style="padding:60px 24px 40px;background:linear-gradient(180deg, rgba(13,11,26,0.4) 0%, rgba(13,11,26,0.85) 100%), url(\'https://quiet-medicine.b-cdn.net/images/mushroom-hero-assessments.webp\') center/cover no-repeat;min-height:300px;display:flex;align-items:center;">\n' +
    '  <div class="hero-content"><h1>Assessments</h1><p class="tagline">In-depth evaluations with detailed results you can download and keep.</p></div>\n' +
    '</div>\n' +
    '<main class="wide" style="padding-top:40px;">\n' +
    '<div class="quiz-index-grid">\n' +
    assessments.map(function(a) {
      return '<div class="quiz-index-card">' + (a.heroImage ? '<img src="' + a.heroImage + '" alt="' + a.title + '" style="width:100%;height:180px;object-fit:cover;border-radius:12px 12px 0 0;margin:-20px -20px 16px;width:calc(100% + 40px);">' : '') + '<h3><a href="/assessment/' + a.slug + '">' + a.title + '</a></h3><p>' + a.desc + '</p></div>';
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
      '  if (r.products && r.products.length > 0) {\n' +
      '    var prodHtml = \'<div style="margin-top:32px;text-align:left;"><h3 style="font-size:18px;color:var(--accent);margin-bottom:16px;">Recommended Products</h3>\';\n' +
      '    r.products.forEach(function(p) {\n' +
      '      prodHtml += \'<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;margin-bottom:8px;background:rgba(124,77,255,0.06);border-radius:8px;border:1px solid rgba(124,77,255,0.15);"><span style="font-size:20px;">\\ud83c\\udf44</span><div><a href="https://www.amazon.com/dp/\' + p.asin + \'?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored" style="color:var(--accent);text-decoration:none;font-weight:600;">\' + p.name + \'</a><span style="font-size:11px;color:var(--text-dim);margin-left:8px;">(paid link)</span></div></div>\';\n' +
      '    });\n' +
      '    prodHtml += \'</div>\';\n' +
      '    document.getElementById("resultText").insertAdjacentHTML("afterend", prodHtml);\n' +
      '  }\n' +
      '  var disclaimer = \'<div style="margin-top:24px;padding:16px 20px;background:rgba(255,107,107,0.08);border-left:3px solid #ff6b6b;border-radius:8px;font-size:13px;line-height:1.7;color:var(--text-dim);"><strong style="color:#ff6b6b;">Important Disclaimer:</strong> This assessment is for educational and informational purposes only. It is not medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before starting any supplement or considering psychedelic use. You assume all responsibility for your own health decisions.</div>\';\n' +
      '  document.getElementById("scoreBreakdown").insertAdjacentHTML("afterend", disclaimer);\n' +
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
