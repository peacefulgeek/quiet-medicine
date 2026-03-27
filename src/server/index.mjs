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
  subtitle: 'Microdosing, Psychedelics, and Conscious Healing',
  tagline: 'The medicine is ancient. The science is catching up.',
  domain: 'https://thequietmedicine.com',
  author: 'The Quiet Medicine Editorial',
  advisorName: 'Kalesh',
  advisorTitle: 'Consciousness Teacher & Writer',
  advisorBio: 'Kalesh is a consciousness teacher and writer whose work explores the intersection of ancient contemplative traditions and modern neuroscience. With decades of practice in meditation, breathwork, and somatic inquiry, he guides others toward embodied awareness.',
  advisorLink: 'https://kalesh.love',
  colors: { primary: '#1B5E20', secondary: '#F5ECD7', accent: '#B8860B' },
  categories: [
    { slug: 'the-science', name: 'The Science' },
    { slug: 'the-microdose', name: 'The Microdose' },
    { slug: 'the-journey', name: 'The Journey' },
    { slug: 'the-clinic', name: 'The Clinic' },
    { slug: 'the-integration', name: 'The Integration' },
  ],
};

// ─── MIDDLEWARE ───
app.use(compression());

// AI HTTP Headers
app.use((req, res, next) => {
  res.setHeader('X-AI-Content-Author', 'Kalesh');
  res.setHeader('X-AI-Content-Site', 'The Quiet Medicine');
  res.setHeader('X-AI-Identity-Endpoint', '/api/ai/identity');
  res.setHeader('X-AI-LLMs-Txt', '/llms.txt');
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// ─── ARTICLE LOADING ───
function loadArticles() {
  const articlesDir = CONTENT;
  if (!fs.existsSync(articlesDir)) return [];
  const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.json'));
  return files.map(f => {
    try {
      return JSON.parse(fs.readFileSync(path.join(articlesDir, f), 'utf8'));
    } catch { return null; }
  }).filter(Boolean);
}

function filterPublished(articles) {
  const now = new Date();
  return articles.filter(a => {
    if (a.status === 'scheduled') return false;
    return a.status === 'published' || new Date(a.dateISO) <= now;
  }).sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO));
}

function getPublishedArticles() {
  return filterPublished(loadArticles());
}

function getArticlesByCategory(slug) {
  return getPublishedArticles().filter(a => a.categorySlug === slug);
}

// ─── TEMPLATE ENGINE ───
function htmlHead(title, description, canonical, ogImage) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="author" content="The Quiet Medicine Editorial">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#1B5E20">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
  <meta property="article:author" content="The Quiet Medicine Editorial">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  ${ogImage ? `<meta name="twitter:image" content="${ogImage}">` : ''}
  <link rel="alternate" type="application/rss+xml" title="The Quiet Medicine RSS" href="/feed.xml">
  <link rel="preconnect" href="${BUNNY_CDN_BASE}">
  <style>
    @font-face {
      font-family: 'Newsreader';
      src: url('${BUNNY_CDN_BASE}/fonts/Newsreader-VariableFont.woff2') format('woff2');
      font-weight: 300 800;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Inter';
      src: url('${BUNNY_CDN_BASE}/fonts/Inter-VariableFont.woff2') format('woff2');
      font-weight: 300 700;
      font-style: normal;
      font-display: swap;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 18px;
      line-height: 1.7;
      color: #1a1a1a;
      background: #FAFAF7;
    }
    h1, h2, h3, h4 { font-family: 'Newsreader', Georgia, serif; color: #1B5E20; }
    a { color: #1B5E20; text-decoration: underline; }
    a:hover { color: #B8860B; }
    .container { max-width: 720px; margin: 0 auto; padding: 0 20px; }
    .wide-container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
    /* NAV */
    nav { display: flex; justify-content: space-between; align-items: center; padding: 20px; max-width: 1100px; margin: 0 auto; }
    nav .site-name { font-family: 'Newsreader', Georgia, serif; font-size: 24px; color: #1B5E20; text-decoration: none; font-weight: 600; }
    nav .nav-links { display: flex; gap: 24px; }
    nav .nav-links a { text-decoration: none; color: #1a1a1a; font-size: 16px; }
    nav .nav-links a:hover { color: #1B5E20; }
    /* HERO QUOTE */
    .hero-quote { padding: 80px 20px; text-align: center; background: #F5ECD7; }
    .hero-quote blockquote { font-family: 'Newsreader', Georgia, serif; font-size: clamp(32px, 5vw, 56px); line-height: 1.3; color: #1B5E20; max-width: 900px; margin: 0 auto; font-style: italic; }
    /* ARTICLE CARDS */
    .article-block { border-bottom: 1px solid #e0ddd5; padding: 32px 0; }
    .article-block h2 { font-size: 28px; margin-bottom: 8px; }
    .article-block h2 a { text-decoration: none; color: #1B5E20; }
    .article-block .meta { font-size: 14px; color: #666; margin-bottom: 12px; }
    .article-block .excerpt { color: #444; line-height: 1.6; }
    /* CATEGORY LINKS */
    .category-links { padding: 40px 0; }
    .category-links h3 { font-size: 20px; margin-bottom: 16px; color: #1B5E20; }
    .category-links ul { list-style: none; }
    .category-links li { padding: 8px 0; border-bottom: 1px solid #eee; }
    .category-links li a { text-decoration: none; color: #1a1a1a; font-size: 17px; }
    .category-links li a:hover { color: #1B5E20; }
    .category-links .count { color: #999; font-size: 14px; }
    /* ARTICLE PAGE */
    .article-hero { width: 100%; max-height: 500px; object-fit: cover; }
    .article-content { max-width: 720px; margin: 0 auto; padding: 0 20px; }
    .article-content h1 { font-size: clamp(28px, 4vw, 42px); margin: 24px 0 16px; line-height: 1.2; }
    .article-content .article-meta { font-size: 14px; color: #666; margin-bottom: 32px; display: flex; gap: 16px; flex-wrap: wrap; }
    .article-content .article-meta a { color: #B8860B; }
    .article-body { font-size: 20px; line-height: 1.8; }
    .article-body p { margin-bottom: 1.5em; }
    .article-body h2 { font-size: 28px; margin: 2em 0 0.8em; }
    .article-body h3 { font-size: 22px; margin: 1.5em 0 0.6em; }
    .article-body blockquote { border-left: 3px solid #B8860B; padding: 16px 24px; margin: 1.5em 0; background: #F5ECD7; font-style: italic; }
    .article-body ul, .article-body ol { margin: 1em 0 1.5em 1.5em; }
    .article-body li { margin-bottom: 0.5em; }
    /* AUTHOR BIO */
    .author-bio { border-top: 2px solid #e0ddd5; margin-top: 48px; padding-top: 32px; }
    .author-bio h3 { font-size: 20px; margin-bottom: 12px; }
    .author-bio p { color: #444; }
    .author-bio a { color: #1B5E20; }
    /* CROSS LINKS */
    .cross-links { margin-top: 48px; padding-top: 32px; border-top: 1px solid #e0ddd5; }
    .cross-links h3 { font-size: 20px; margin-bottom: 16px; }
    .cross-links ul { list-style: none; }
    .cross-links li { padding: 8px 0; }
    .cross-links li a { text-decoration: none; color: #1B5E20; font-size: 17px; }
    /* SHARE BUTTONS */
    .share-buttons { display: flex; gap: 12px; margin-top: 32px; }
    .share-buttons a { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid #1B5E20; border-radius: 4px; text-decoration: none; color: #1B5E20; font-size: 14px; min-height: 44px; }
    .share-buttons a:hover { background: #1B5E20; color: white; }
    /* FOOTER */
    footer { background: #1B5E20; color: #F5ECD7; padding: 40px 20px; margin-top: 60px; }
    footer .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
    footer a { color: #F5ECD7; }
    footer .disclaimer { font-size: 13px; color: rgba(245,236,215,0.7); margin-top: 20px; max-width: 1100px; margin-left: auto; margin-right: auto; }
    /* NEWSLETTER */
    .newsletter { background: #F5ECD7; padding: 40px 20px; text-align: center; margin: 40px 0; border-radius: 8px; }
    .newsletter h3 { margin-bottom: 12px; }
    .newsletter form { display: flex; gap: 8px; max-width: 400px; margin: 16px auto 0; }
    .newsletter input[type="email"] { flex: 1; padding: 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; min-height: 44px; }
    .newsletter button { padding: 12px 24px; background: #1B5E20; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; min-height: 44px; }
    .newsletter button:hover { background: #B8860B; }
    /* LISTING */
    .article-list-item { display: flex; justify-content: space-between; align-items: baseline; padding: 16px 0; border-bottom: 1px solid #eee; flex-wrap: wrap; gap: 8px; }
    .article-list-item a { text-decoration: none; color: #1a1a1a; font-size: 17px; flex: 1; }
    .article-list-item a:hover { color: #1B5E20; }
    .article-list-item .list-meta { font-size: 13px; color: #999; white-space: nowrap; display: flex; gap: 12px; }
    .article-list-item .cat-tag { background: #F5ECD7; color: #B8860B; padding: 2px 8px; border-radius: 3px; font-size: 12px; }
    /* PAGINATION */
    .pagination { display: flex; gap: 8px; justify-content: center; padding: 32px 0; }
    .pagination a, .pagination span { padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; text-decoration: none; color: #1a1a1a; min-height: 44px; display: inline-flex; align-items: center; }
    .pagination .active { background: #1B5E20; color: white; border-color: #1B5E20; }
    /* COOKIE BANNER */
    .cookie-banner { position: fixed; bottom: 0; left: 0; right: 0; background: #1B5E20; color: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; flex-wrap: wrap; gap: 12px; }
    .cookie-banner button { padding: 8px 20px; background: #B8860B; color: white; border: none; border-radius: 4px; cursor: pointer; min-height: 44px; }
    /* FAQ */
    .faq-section { margin: 2em 0; }
    .faq-item { margin-bottom: 1.5em; }
    .faq-item h3 { font-size: 18px; margin-bottom: 8px; color: #1B5E20; }
    /* QUIZ */
    .quiz-container { max-width: 720px; margin: 40px auto; padding: 0 20px; }
    .quiz-question { margin-bottom: 24px; }
    .quiz-question h3 { margin-bottom: 12px; }
    .quiz-option { display: block; padding: 12px 16px; margin: 8px 0; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; min-height: 44px; }
    .quiz-option:hover { border-color: #1B5E20; background: #f0f8f0; }
    .quiz-option.selected { border-color: #1B5E20; background: #e8f5e9; }
    .quiz-progress { height: 4px; background: #eee; border-radius: 2px; margin-bottom: 24px; }
    .quiz-progress-bar { height: 100%; background: #1B5E20; border-radius: 2px; transition: width 0.3s; }
    /* LEGAL CHECK */
    .legal-check { max-width: 720px; margin: 40px auto; padding: 0 20px; }
    .legal-select { padding: 12px; font-size: 16px; border: 1px solid #ccc; border-radius: 4px; width: 100%; max-width: 400px; min-height: 44px; }
    .legal-results { margin-top: 24px; }
    .legal-substance { padding: 16px; margin: 12px 0; background: #F5ECD7; border-radius: 8px; }
    .legal-status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 14px; font-weight: 600; }
    .legal-status.legal { background: #e8f5e9; color: #1B5E20; }
    .legal-status.illegal { background: #fce4ec; color: #c62828; }
    .legal-status.decriminalized { background: #fff3e0; color: #e65100; }
    .legal-status.medical { background: #e3f2fd; color: #1565c0; }
    /* START HERE */
    .pillar-article { padding: 24px; margin: 16px 0; background: white; border: 1px solid #e0ddd5; border-radius: 8px; }
    .pillar-article h3 { margin-bottom: 8px; }
    .pillar-article h3 a { text-decoration: none; }
    .pillar-article p { color: #666; font-size: 15px; }
    /* ABOUT */
    .advisor-card { background: #F5ECD7; padding: 32px; border-radius: 8px; margin-top: 40px; }
    .advisor-card h3 { margin-bottom: 12px; }
    @media (max-width: 768px) {
      nav { flex-direction: column; gap: 12px; }
      .share-buttons { flex-wrap: wrap; }
      .footer-inner { flex-direction: column; }
      .article-list-item { flex-direction: column; }
    }
  </style>
</head>`;
}

function navHTML() {
  return `<nav>
  <a href="/" class="site-name">The Quiet Medicine</a>
  <div class="nav-links">
    <a href="/articles">Articles</a>
    <a href="/about">About</a>
  </div>
</nav>`;
}

function footerHTML() {
  return `<footer>
  <div class="footer-inner">
    <div>
      <strong>The Quiet Medicine</strong><br>
      <small>Microdosing, Psychedelics, and Conscious Healing</small>
    </div>
    <div>
      <a href="/privacy">Privacy Policy</a> &middot;
      <a href="/terms">Terms of Service</a> &middot;
      <a href="/start-here">Start Here</a>
    </div>
  </div>
  <div class="disclaimer">
    <em>This site provides educational information about psychedelic research and wellness. It does not promote illegal activity. Psychedelic substances carry risks and are not legal in all jurisdictions. Consult a healthcare provider. Not medical advice.</em>
  </div>
</footer>`;
}

function cookieBannerHTML() {
  return `<div class="cookie-banner" id="cookieBanner" style="display:none;">
  <span>We use cookies to improve your experience. By continuing, you agree to our <a href="/privacy" style="color:#F5ECD7;text-decoration:underline;">Privacy Policy</a>.</span>
  <button onclick="document.getElementById('cookieBanner').style.display='none';localStorage.setItem('cookieConsent','true');" aria-label="Accept cookies">Accept</button>
</div>
<script>if(!localStorage.getItem('cookieConsent')){document.getElementById('cookieBanner').style.display='flex';}</script>`;
}

function newsletterHTML(source = 'footer') {
  return `<div class="newsletter">
  <h3>Stay Connected</h3>
  <p>Join our community for insights on psychedelic wellness and conscious healing.</p>
  <form id="newsletter-${source}" onsubmit="return handleSubscribe(event, '${source}')">
    <input type="email" name="email" placeholder="Your email" required aria-label="Email address">
    <button type="submit">Subscribe</button>
  </form>
  <p id="newsletter-msg-${source}" style="display:none;color:#1B5E20;margin-top:12px;">Thanks for subscribing!</p>
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

// ─── API ROUTES ───

// Subscribe endpoint — writes to Bunny CDN JSONL
app.use(express.json());

app.post('/api/subscribe', async (req, res) => {
  const { email, source } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const entry = JSON.stringify({ email, date: new Date().toISOString(), source: source || 'unknown' }) + '\n';
  try {
    // Append to Bunny CDN storage
    const url = `https://${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/data/subscribers.jsonl`;
    // Read existing, append, write back
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
  articles.forEach(a => {
    const cat = a.categoryName || 'Uncategorized';
    if (!topics[cat]) topics[cat] = [];
    topics[cat].push({ title: a.title, slug: a.slug });
  });
  res.json({ topics, totalArticles: articles.length });
});

app.get('/api/ai/ask', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  if (!q) return res.json({ answer: 'Please provide a query parameter ?q=your+question', articles: [] });
  const articles = getPublishedArticles();
  const matches = articles.filter(a =>
    a.title.toLowerCase().includes(q) || (a.excerpt || '').toLowerCase().includes(q) || (a.body || '').toLowerCase().includes(q)
  ).slice(0, 5);
  res.json({
    query: q,
    answer: matches.length ? `Found ${matches.length} relevant articles.` : 'No matching articles found.',
    articles: matches.map(a => ({ title: a.title, url: `https://thequietmedicine.com/articles/${a.slug}`, excerpt: a.excerpt })),
  });
});

app.get('/api/ai/articles', (req, res) => {
  const articles = getPublishedArticles();
  res.json({
    total: articles.length,
    articles: articles.map(a => ({
      title: a.title, slug: a.slug, url: `https://thequietmedicine.com/articles/${a.slug}`,
      category: a.categoryName, date: a.dateISO, excerpt: a.excerpt, readingTime: a.readingTime,
    })),
  });
});

app.get('/api/ai/sitemap', (req, res) => {
  const articles = getPublishedArticles();
  const pages = [
    { url: '/', title: 'Home' },
    { url: '/articles', title: 'Articles' },
    { url: '/about', title: 'About' },
    { url: '/start-here', title: 'Start Here' },
    { url: '/legal-check', title: 'Legal Check' },
    { url: '/privacy', title: 'Privacy Policy' },
    { url: '/terms', title: 'Terms of Service' },
  ];
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

# AI Crawlers
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

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>https://thequietmedicine.com${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    ${u.lastmod ? `<lastmod>${u.lastmod.split('T')[0]}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;
  res.type('application/xml').send(xml);
});

app.get('/sitemap-images.xml', (req, res) => {
  const articles = getPublishedArticles();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${articles.map(a => `  <url>
    <loc>https://thequietmedicine.com/articles/${a.slug}</loc>
    <image:image>
      <image:loc>${a.heroImage}</image:loc>
      <image:title>${a.title}</image:title>
    </image:image>
  </url>`).join('\n')}
</urlset>`;
  res.type('application/xml').send(xml);
});

// RSS Feed
app.get('/feed.xml', (req, res) => {
  const articles = getPublishedArticles().slice(0, 20);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
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
</rss>`;
  res.type('application/xml').send(xml);
});

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── PAGE ROUTES ───

// Homepage
app.get('/', (req, res) => {
  const articles = getPublishedArticles();
  const latest = articles.slice(0, 3);
  const quote = latest[0] ? (latest[0].pullQuote || latest[0].excerpt || SITE.tagline) : SITE.tagline;

  const categoryLinks = SITE.categories.map(c => {
    const count = articles.filter(a => a.categorySlug === c.slug).length;
    return `<li><a href="/category/${c.slug}">${c.name}</a> <span class="count">(${count})</span></li>`;
  }).join('');

  const articleBlocks = latest.map(a => `
    <div class="article-block">
      <h2><a href="/articles/${a.slug}">${a.title}</a></h2>
      <div class="meta">${a.readingTime || '10 min read'} &middot; ${new Date(a.dateISO).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <p class="excerpt">${a.excerpt || ''}</p>
    </div>`).join('');

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "The Quiet Medicine",
        "url": "https://thequietmedicine.com",
        "description": "Microdosing, Psychedelics, and Conscious Healing"
      },
      {
        "@type": "WebSite",
        "name": "The Quiet Medicine",
        "url": "https://thequietmedicine.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://thequietmedicine.com/articles?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  });

  res.send(`${htmlHead('The Quiet Medicine — Microdosing, Psychedelics, and Conscious Healing', 'Explore the intersection of psychedelic wellness, microdosing, and conscious healing through evidence-based research and contemplative wisdom.', 'https://thequietmedicine.com/', `${BUNNY_CDN_BASE}/og/homepage.webp`)}
<body>
${navHTML()}
<div class="hero-quote">
  <blockquote>${escapeXml(quote)}</blockquote>
</div>
<div class="container">
  ${articleBlocks}
  <div class="category-links">
    <h3>Explore</h3>
    <ul>${categoryLinks}</ul>
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
  const perPage = 20;
  const total = articles.length;
  const totalPages = Math.ceil(total / perPage);
  const paged = articles.slice((page - 1) * perPage, page * perPage);

  const listItems = paged.map(a => `
    <div class="article-list-item">
      <a href="/articles/${a.slug}">${a.title}</a>
      <div class="list-meta">
        <span class="cat-tag">${a.categoryName || ''}</span>
        <span>${a.readingTime || '10 min'}</span>
        <span>${new Date(a.dateISO).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>
    </div>`).join('');

  let pagination = '<div class="pagination">';
  for (let i = 1; i <= totalPages; i++) {
    if (i === page) pagination += `<span class="active">${i}</span>`;
    else pagination += `<a href="/articles?page=${i}${q ? '&q=' + encodeURIComponent(q) : ''}">${i}</a>`;
  }
  pagination += '</div>';

  res.send(`${htmlHead(`Articles — The Quiet Medicine`, `Browse ${total} articles on psychedelic wellness, microdosing, and conscious healing.`, 'https://thequietmedicine.com/articles')}
<body>
${navHTML()}
<div class="container" style="padding-top:40px;">
  <h1>Articles</h1>
  <p style="color:#666;margin:8px 0 24px;">${total} articles published</p>
  <form method="get" action="/articles" style="margin-bottom:24px;">
    <input type="text" name="q" placeholder="Search articles..." value="${escapeXml(q)}" style="padding:12px;border:1px solid #ccc;border-radius:4px;width:100%;max-width:400px;font-size:16px;min-height:44px;" aria-label="Search articles">
  </form>
  ${listItems}
  ${pagination}
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

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": cat.name,
    "url": `https://thequietmedicine.com/category/${cat.slug}`,
    "description": `Articles about ${cat.name.toLowerCase()} — The Quiet Medicine`,
    "numberOfItems": articles.length
  });

  const listItems = articles.map(a => `
    <div class="article-list-item">
      <a href="/articles/${a.slug}">${a.title}</a>
      <div class="list-meta">
        <span>${a.readingTime || '10 min'}</span>
        <span>${new Date(a.dateISO).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>
    </div>`).join('');

  const descriptions = {
    'the-science': 'Evidence-based research on psychedelics, neuroscience, and the mechanisms behind conscious healing.',
    'the-microdose': 'Protocols, practices, and insights for microdosing psilocybin and other psychedelic compounds.',
    'the-journey': 'Navigating ceremonial experiences, macro-doses, and the deeper territories of psychedelic exploration.',
    'the-clinic': 'Legal psychedelic therapy, ketamine clinics, MDMA-assisted therapy, and clinical frameworks.',
    'the-integration': 'Making sense of psychedelic experiences and weaving insights into daily life and long-term growth.',
  };

  res.send(`${htmlHead(`${cat.name} — The Quiet Medicine`, descriptions[cat.slug] || `Articles about ${cat.name}`, `https://thequietmedicine.com/category/${cat.slug}`)}
<body>
${navHTML()}
<div class="container" style="padding-top:40px;">
  <h1>${cat.name}</h1>
  <p style="color:#666;margin:8px 0 24px;">${articles.length} articles &middot; ${descriptions[cat.slug] || ''}</p>
  ${listItems}
</div>
${footerHTML()}
${cookieBannerHTML()}
<script type="application/ld+json">${jsonLd}</script>
</body></html>`);
});

// Article page
app.get('/articles/:slug', (req, res) => {
  const articles = getPublishedArticles();
  const article = articles.find(a => a.slug === req.params.slug);
  if (!article) return render404(req, res);

  const sameCat = articles.filter(a => a.categorySlug === article.categorySlug && a.slug !== article.slug).slice(0, 3);
  const crossLinks = sameCat.map(a => `<li><a href="/articles/${a.slug}">${a.title}</a></li>`).join('');

  const faqHtml = article.faqs && article.faqs.length > 0 ? `
    <div class="faq-section">
      <h2>Frequently Asked Questions</h2>
      ${article.faqs.map(f => `<div class="faq-item"><h3>${f.question}</h3><p>${f.answer}</p></div>`).join('')}
    </div>` : '';

  const faqSchema = article.faqs && article.faqs.length > 0 ? JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": article.faqs.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": { "@type": "Answer", "text": f.answer }
    }))
  }) : '';

  const articleSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "image": article.heroImage,
    "datePublished": article.dateISO,
    "dateModified": article.dateISO,
    "author": { "@type": "Person", "name": "Kalesh" },
    "publisher": { "@type": "Organization", "name": "The Quiet Medicine", "url": "https://thequietmedicine.com" },
    "mainEntityOfPage": `https://thequietmedicine.com/articles/${article.slug}`,
    "speakable": { "@type": "SpeakableSpecification", "cssSelector": [".article-body p:first-of-type", ".article-body h2"] }
  });

  const breadcrumbSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://thequietmedicine.com" },
      { "@type": "ListItem", "position": 2, "name": article.categoryName, "item": `https://thequietmedicine.com/category/${article.categorySlug}` },
      { "@type": "ListItem", "position": 3, "name": article.title, "item": `https://thequietmedicine.com/articles/${article.slug}` }
    ]
  });

  const shareUrl = encodeURIComponent(`https://thequietmedicine.com/articles/${article.slug}`);
  const shareTitle = encodeURIComponent(article.title);

  res.send(`${htmlHead(`${article.title} — The Quiet Medicine`, article.excerpt || '', `https://thequietmedicine.com/articles/${article.slug}`, article.ogImage || article.heroImage)}
<body>
${navHTML()}
<img src="${article.heroImage}" alt="${article.heroAlt || article.title}" width="1200" height="675" class="article-hero" style="width:100%;display:block;">
<div class="article-content">
  <h1>${article.title}</h1>
  <div class="article-meta">
    <a href="/category/${article.categorySlug}">${article.categoryName}</a>
    <span>${new Date(article.dateISO).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
    <span>${article.readingTime || '10 min read'}</span>
  </div>
  <div class="article-body">
    ${article.body}
  </div>
  ${faqHtml}
  <div class="share-buttons">
    <a href="https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}" rel="nofollow" aria-label="Share on X/Twitter">Share on X</a>
    <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" rel="nofollow" aria-label="Share on Facebook">Share on Facebook</a>
    <a href="#" onclick="navigator.clipboard.writeText(window.location.href);this.textContent='Copied!';return false;" aria-label="Copy link">Copy Link</a>
  </div>
  <div class="author-bio">
    <h3>About Kalesh</h3>
    <p>${SITE.advisorBio} <a href="${SITE.advisorLink}">Visit Kalesh's Website</a></p>
  </div>
  <div class="cross-links">
    <h3>More from ${article.categoryName}</h3>
    <ul>${crossLinks}</ul>
  </div>
</div>
<div class="container">${newsletterHTML('article')}</div>
<div class="container" style="margin-bottom:20px;font-size:13px;color:#666;font-style:italic;">
  <em>This site provides educational information about psychedelic research and wellness. It does not promote illegal activity. Psychedelic substances carry risks and are not legal in all jurisdictions. Consult a healthcare provider. Not medical advice.</em>
</div>
${footerHTML()}
${cookieBannerHTML()}
${subscribeScript()}
<script type="application/ld+json">${articleSchema}</script>
<script type="application/ld+json">${breadcrumbSchema}</script>
${faqSchema ? `<script type="application/ld+json">${faqSchema}</script>` : ''}
</body></html>`);
});

// About page
app.get('/about', (req, res) => {
  const articles = getPublishedArticles();
  const profileSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": "Kalesh",
      "jobTitle": "Consciousness Teacher & Writer",
      "url": "https://kalesh.love",
      "description": SITE.advisorBio
    }
  });

  res.send(`${htmlHead('About — The Quiet Medicine', 'Learn about The Quiet Medicine and our commitment to evidence-based psychedelic wellness education.', 'https://thequietmedicine.com/about')}
<body>
${navHTML()}
<div class="container" style="padding-top:40px;">
  <h1>About The Quiet Medicine</h1>
  <p style="margin:24px 0;line-height:1.8;font-size:18px;">The Quiet Medicine exists at the intersection of ancient plant wisdom and modern neuroscience. We publish evidence-based, contemplative writing on psychedelic wellness — from microdosing protocols and clinical research to integration practices and the deeper philosophical questions that arise when consciousness begins to shift.</p>
  <p style="margin:24px 0;line-height:1.8;font-size:18px;">Our editorial approach honors both the rigor of clinical research and the depth of contemplative traditions. Every article is grounded in peer-reviewed science while acknowledging that some of the most important dimensions of psychedelic experience resist quantification. We write for people who want to understand what the research actually says — and what it doesn't.</p>
  <p style="margin:24px 0;line-height:1.8;font-size:18px;">With ${articles.length} published articles across five categories, we cover the full spectrum of psychedelic wellness: the neuroscience, the protocols, the ceremonial traditions, the clinical frameworks, and the essential work of integration that makes any of it meaningful.</p>

  <div class="advisor-card">
    <h3>Kalesh — Consciousness Teacher & Writer</h3>
    <p>${SITE.advisorBio} <a href="${SITE.advisorLink}">Visit Kalesh's Website</a></p>
  </div>
</div>
${footerHTML()}
${cookieBannerHTML()}
<script type="application/ld+json">${profileSchema}</script>
</body></html>`);
});

// Start Here
app.get('/start-here', (req, res) => {
  const articles = getPublishedArticles();
  // Pick pillar articles — one from each category if available
  const pillars = [];
  for (const cat of SITE.categories) {
    const catArticles = articles.filter(a => a.categorySlug === cat.slug);
    if (catArticles.length > 0) pillars.push(catArticles[0]);
    if (pillars.length >= 6) break;
  }
  // Fill remaining with latest if needed
  while (pillars.length < 4 && articles.length > pillars.length) {
    const next = articles.find(a => !pillars.find(p => p.slug === a.slug));
    if (next) pillars.push(next);
    else break;
  }

  const pillarHtml = pillars.map(a => `
    <div class="pillar-article">
      <h3><a href="/articles/${a.slug}">${a.title}</a></h3>
      <p>${a.excerpt || ''}</p>
    </div>`).join('');

  res.send(`${htmlHead('Start Here — The Quiet Medicine', 'New to The Quiet Medicine? Start with these essential articles on psychedelic wellness and conscious healing.', 'https://thequietmedicine.com/start-here')}
<body>
${navHTML()}
<div class="container" style="padding-top:40px;">
  <h1>Start Here</h1>
  <p style="margin:24px 0;line-height:1.8;font-size:18px;">Welcome to The Quiet Medicine. Whether you're exploring microdosing for the first time, researching legal psychedelic therapy, or integrating a transformative experience, these foundational articles will orient you.</p>
  <p style="margin:24px 0;line-height:1.8;font-size:18px;">The medicine is ancient. The science is catching up. And the most important work — the integration, the embodiment, the willingness to let what you've seen actually change how you live — that's what we write about here.</p>
  ${pillarHtml}
  <p style="margin:32px 0;"><a href="/articles">Browse all ${articles.length} articles →</a></p>
</div>
${footerHTML()}
${cookieBannerHTML()}
</body></html>`);
});

// Privacy Policy
app.get('/privacy', (req, res) => {
  res.send(`${htmlHead('Privacy Policy — The Quiet Medicine', 'Privacy policy for The Quiet Medicine.', 'https://thequietmedicine.com/privacy')}
<body>
${navHTML()}
<div class="container" style="padding-top:40px;">
  <h1>Privacy Policy</h1>
  <p style="margin:16px 0;"><em>Last updated: March 27, 2026</em></p>

  <h2>Information We Collect</h2>
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
  res.send(`${htmlHead('Terms of Service — The Quiet Medicine', 'Terms of service for The Quiet Medicine.', 'https://thequietmedicine.com/terms')}
<body>
${navHTML()}
<div class="container" style="padding-top:40px;">
  <h1>Terms of Service</h1>
  <p style="margin:16px 0;"><em>Last updated: March 27, 2026</em></p>

  <h2>Educational Purpose</h2>
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
  res.send(`${htmlHead("What's Legal Where You Are — The Quiet Medicine", 'Check the legal status of psychedelic substances in your state or country.', 'https://thequietmedicine.com/legal-check')}
<body>
${navHTML()}
<div class="legal-check">
  <h1>What's Legal Where You Are</h1>
  <p style="margin:16px 0 24px;color:#666;">Select your location to see the current legal status of psychedelic substances. This information is for educational purposes only and is updated quarterly.</p>

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

  <div id="legalResults" class="legal-results"></div>
</div>
${footerHTML()}
${cookieBannerHTML()}
<script>
const legalData = {
  "us-or": {
    name: "Oregon",
    substances: [
      { name: "Psilocybin", status: "legal", note: "Legal for supervised therapeutic use under Measure 109 (2023). Licensed service centers operating." },
      { name: "Ketamine", status: "medical", note: "Legal with prescription. Multiple ketamine clinics operating statewide." },
      { name: "MDMA", status: "illegal", note: "Schedule I federally. FDA breakthrough therapy designation for PTSD." },
      { name: "Cannabis", status: "legal", note: "Recreational and medical use legal since 2014." },
      { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule I. Religious exemptions exist (UDV, Santo Daime)." }
    ]
  },
  "us-co": {
    name: "Colorado",
    substances: [
      { name: "Psilocybin", status: "decriminalized", note: "Proposition 122 (2022) decriminalized personal use. Healing centers framework in development." },
      { name: "Ketamine", status: "medical", note: "Legal with prescription. Growing number of ketamine-assisted therapy clinics." },
      { name: "MDMA", status: "illegal", note: "Schedule I federally. Clinical trials ongoing." },
      { name: "Cannabis", status: "legal", note: "Recreational and medical use legal since 2012." },
      { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule I. Religious exemptions may apply." }
    ]
  },
  "us-ca": {
    name: "California",
    substances: [
      { name: "Psilocybin", status: "illegal", note: "Schedule I. Decriminalization bills introduced but not yet passed at state level. Decriminalized in Oakland, Santa Cruz, San Francisco." },
      { name: "Ketamine", status: "medical", note: "Legal with prescription. Major hub for ketamine therapy clinics." },
      { name: "MDMA", status: "illegal", note: "Schedule I. Active clinical trial sites." },
      { name: "Cannabis", status: "legal", note: "Recreational and medical use legal." },
      { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule I. Underground ceremonies exist." }
    ]
  },
  "us-wa": {
    name: "Washington",
    substances: [
      { name: "Psilocybin", status: "illegal", note: "Legislation for therapeutic framework under consideration." },
      { name: "Ketamine", status: "medical", note: "Legal with prescription." },
      { name: "MDMA", status: "illegal", note: "Schedule I federally." },
      { name: "Cannabis", status: "legal", note: "Recreational and medical use legal since 2012." },
      { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule I." }
    ]
  },
  "us-ma": {
    name: "Massachusetts",
    substances: [
      { name: "Psilocybin", status: "decriminalized", note: "Decriminalized in Somerville, Cambridge, Northampton, and other municipalities." },
      { name: "Ketamine", status: "medical", note: "Legal with prescription." },
      { name: "MDMA", status: "illegal", note: "Schedule I federally." },
      { name: "Cannabis", status: "legal", note: "Recreational and medical use legal." },
      { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule I." }
    ]
  },
  "us-ny": {
    name: "New York",
    substances: [
      { name: "Psilocybin", status: "illegal", note: "Therapeutic use bills introduced. Not yet passed." },
      { name: "Ketamine", status: "medical", note: "Legal with prescription. Many clinics in NYC." },
      { name: "MDMA", status: "illegal", note: "Schedule I federally." },
      { name: "Cannabis", status: "legal", note: "Recreational and medical use legal." },
      { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule I." }
    ]
  },
  "us-tx": {
    name: "Texas",
    substances: [
      { name: "Psilocybin", status: "illegal", note: "HB 1802 funded psilocybin research for veterans. Personal use remains illegal." },
      { name: "Ketamine", status: "medical", note: "Legal with prescription." },
      { name: "MDMA", status: "illegal", note: "Schedule I." },
      { name: "Cannabis", status: "illegal", note: "Limited medical program (Compassionate Use). Recreational illegal." },
      { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule I." }
    ]
  },
  "us-fl": {
    name: "Florida",
    substances: [
      { name: "Psilocybin", status: "illegal", note: "No decriminalization. Research interest growing." },
      { name: "Ketamine", status: "medical", note: "Legal with prescription. Multiple clinics." },
      { name: "MDMA", status: "illegal", note: "Schedule I." },
      { name: "Cannabis", status: "medical", note: "Medical use legal. Recreational remains illegal." },
      { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule I." }
    ]
  },
  "us-other": {
    name: "Other US States",
    substances: [
      { name: "Psilocybin", status: "illegal", note: "Schedule I in most states. Check local decriminalization measures." },
      { name: "Ketamine", status: "medical", note: "Legal with prescription nationwide." },
      { name: "MDMA", status: "illegal", note: "Schedule I federally." },
      { name: "Cannabis", status: "illegal", note: "Varies by state. Check local laws." },
      { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule I. Religious exemptions limited." }
    ]
  },
  "ca": {
    name: "Canada",
    substances: [
      { name: "Psilocybin", status: "medical", note: "Special Access Program allows therapeutic use. Section 56 exemptions granted." },
      { name: "Ketamine", status: "medical", note: "Legal with prescription. Clinics operating in major cities." },
      { name: "MDMA", status: "illegal", note: "Schedule I. Special Access Program exemptions possible." },
      { name: "Cannabis", status: "legal", note: "Fully legal since 2018." },
      { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule III. Religious exemptions under review." }
    ]
  },
  "nl": {
    name: "Netherlands",
    substances: [
      { name: "Psilocybin Truffles", status: "legal", note: "Magic truffles (sclerotia) are legal and sold in smart shops. Mushrooms banned since 2008." },
      { name: "Ketamine", status: "medical", note: "Prescription only." },
      { name: "MDMA", status: "illegal", note: "Illegal but widely studied. Netherlands is major research hub." },
      { name: "Cannabis", status: "decriminalized", note: "Tolerated in licensed coffee shops. Technically illegal." },
      { name: "Ayahuasca", status: "decriminalized", note: "Legal gray area. Ceremonies operate openly." }
    ]
  },
  "pt": {
    name: "Portugal",
    substances: [
      { name: "Psilocybin", status: "decriminalized", note: "All drugs decriminalized for personal use since 2001. Not legal." },
      { name: "Ketamine", status: "decriminalized", note: "Decriminalized for personal use." },
      { name: "MDMA", status: "decriminalized", note: "Decriminalized for personal use." },
      { name: "Cannabis", status: "decriminalized", note: "Decriminalized for personal use." },
      { name: "Ayahuasca", status: "decriminalized", note: "Decriminalized for personal use." }
    ]
  },
  "br": {
    name: "Brazil",
    substances: [
      { name: "Psilocybin", status: "illegal", note: "Not explicitly scheduled but generally considered illegal." },
      { name: "Ketamine", status: "medical", note: "Prescription controlled substance." },
      { name: "MDMA", status: "illegal", note: "Prohibited." },
      { name: "Cannabis", status: "decriminalized", note: "Personal use decriminalized. Medical use expanding." },
      { name: "Ayahuasca", status: "legal", note: "Legal for religious use. Santo Daime and UDV recognized." }
    ]
  },
  "jm": {
    name: "Jamaica",
    substances: [
      { name: "Psilocybin", status: "legal", note: "Not scheduled. Mushroom retreats operate legally." },
      { name: "Ketamine", status: "medical", note: "Prescription controlled." },
      { name: "MDMA", status: "illegal", note: "Prohibited." },
      { name: "Cannabis", status: "decriminalized", note: "Decriminalized for personal use and Rastafarian religious use." },
      { name: "Ayahuasca", status: "illegal", note: "DMT is controlled." }
    ]
  },
  "cr": {
    name: "Costa Rica",
    substances: [
      { name: "Psilocybin", status: "legal", note: "Not explicitly scheduled. Retreat centers operate." },
      { name: "Ketamine", status: "medical", note: "Medical use only." },
      { name: "MDMA", status: "illegal", note: "Prohibited." },
      { name: "Cannabis", status: "decriminalized", note: "Personal use tolerated. Not fully legal." },
      { name: "Ayahuasca", status: "legal", note: "Not scheduled. Ceremonies operate openly." }
    ]
  },
  "pe": {
    name: "Peru",
    substances: [
      { name: "Psilocybin", status: "illegal", note: "Controlled substance." },
      { name: "Ketamine", status: "medical", note: "Medical use only." },
      { name: "MDMA", status: "illegal", note: "Prohibited." },
      { name: "Cannabis", status: "medical", note: "Medical use legal since 2017." },
      { name: "Ayahuasca", status: "legal", note: "Legal and recognized as cultural heritage. Major destination for ceremonial use." }
    ]
  },
  "uk": {
    name: "United Kingdom",
    substances: [
      { name: "Psilocybin", status: "illegal", note: "Class A. Research exemptions exist. Growing advocacy for rescheduling." },
      { name: "Ketamine", status: "medical", note: "Class B but available on prescription. Off-label therapeutic use growing." },
      { name: "MDMA", status: "illegal", note: "Class A. Clinical trials underway." },
      { name: "Cannabis", status: "medical", note: "Medical cannabis legal since 2018. Recreational illegal." },
      { name: "Ayahuasca", status: "illegal", note: "DMT is Class A." }
    ]
  },
  "au": {
    name: "Australia",
    substances: [
      { name: "Psilocybin", status: "medical", note: "TGA approved for treatment-resistant depression (2023). Authorized prescribers only." },
      { name: "Ketamine", status: "medical", note: "Available on prescription." },
      { name: "MDMA", status: "medical", note: "TGA approved for PTSD treatment (2023). Authorized prescribers only." },
      { name: "Cannabis", status: "medical", note: "Medical use legal. Recreational illegal except ACT." },
      { name: "Ayahuasca", status: "illegal", note: "DMT is Schedule 9." }
    ]
  },
  "other": {
    name: "Other Countries",
    substances: [
      { name: "General", status: "illegal", note: "Most countries classify psilocybin, MDMA, and DMT as controlled substances. Ketamine is typically available by prescription. Laws are changing rapidly — verify current status with local authorities." }
    ]
  }
};

function showLegalStatus() {
  const select = document.getElementById('locationSelect');
  const results = document.getElementById('legalResults');
  const loc = legalData[select.value];
  if (!loc) { results.innerHTML = ''; return; }

  results.innerHTML = '<h2 style="margin:24px 0 16px;">' + loc.name + '</h2>' +
    loc.substances.map(s =>
      '<div class="legal-substance">' +
      '<strong>' + s.name + '</strong> ' +
      '<span class="legal-status ' + s.status + '">' + s.status.charAt(0).toUpperCase() + s.status.slice(1) + '</span>' +
      '<p style="margin-top:8px;font-size:15px;color:#444;">' + s.note + '</p>' +
      '</div>'
    ).join('');
}
</script>
</body></html>`);
});

// 9 Quiz pages
const QUIZZES = [
  { slug: 'microdosing-readiness', title: 'Are You Ready to Microdose?', description: 'Assess your readiness for a microdosing practice.' },
  { slug: 'psychedelic-integration-style', title: 'What\'s Your Integration Style?', description: 'Discover how you naturally process psychedelic experiences.' },
  { slug: 'which-modality', title: 'Which Psychedelic Modality Fits You?', description: 'Find the therapeutic approach that matches your needs.' },
  { slug: 'set-and-setting', title: 'How\'s Your Set and Setting?', description: 'Evaluate your mental and environmental readiness.' },
  { slug: 'nervous-system-check', title: 'Nervous System Check-In', description: 'Understand your nervous system state before a journey.' },
  { slug: 'meditation-psychedelics', title: 'Meditation or Psychedelics First?', description: 'Explore which path might serve you better right now.' },
  { slug: 'shadow-work-readiness', title: 'Shadow Work Readiness Assessment', description: 'Are you prepared for what might surface?' },
  { slug: 'ceremony-vs-clinic', title: 'Ceremony or Clinic?', description: 'Discover whether a ceremonial or clinical setting suits you.' },
  { slug: 'integration-needs', title: 'What Do You Need to Integrate?', description: 'Identify the areas of your experience that need attention.' },
];

QUIZZES.forEach(quiz => {
  app.get(`/quiz/${quiz.slug}`, (req, res) => {
    const articles = getPublishedArticles().slice(0, 3);
    const recLinks = articles.map(a => `<li><a href="/articles/${a.slug}">${a.title}</a></li>`).join('');

    res.send(`${htmlHead(`${quiz.title} — The Quiet Medicine`, quiz.description, `https://thequietmedicine.com/quiz/${quiz.slug}`, `${BUNNY_CDN_BASE}/og/quiz-${quiz.slug}.webp`)}
<body>
${navHTML()}
<div class="quiz-container">
  <h1>${quiz.title}</h1>
  <p style="margin:16px 0 24px;color:#666;">${quiz.description}</p>
  <div class="quiz-progress"><div class="quiz-progress-bar" id="progressBar" style="width:0%"></div></div>
  <div id="quizContent"></div>
  <div id="quizResult" style="display:none;">
    <h2 id="resultTitle"></h2>
    <p id="resultText" style="margin:16px 0;line-height:1.8;"></p>
    <div class="share-buttons" style="margin:24px 0;">
      <a href="#" id="shareTwitter" rel="nofollow" aria-label="Share result on X">Share on X</a>
      <a href="#" id="shareFB" rel="nofollow" aria-label="Share result on Facebook">Share on Facebook</a>
      <a href="#" onclick="navigator.clipboard.writeText(window.location.href);this.textContent='Copied!';return false;" aria-label="Copy link">Copy Link</a>
    </div>
    ${newsletterHTML('quiz-' + quiz.slug)}
    <h3 style="margin-top:32px;">Recommended Reading</h3>
    <ul>${recLinks}</ul>
  </div>
</div>
${footerHTML()}
${cookieBannerHTML()}
${subscribeScript()}
<script>
const questions = [
  { q: "How would you describe your current relationship with your inner life?", opts: ["I rarely think about it", "I'm curious but haven't explored much", "I have a regular contemplative practice", "I've done significant inner work"] },
  { q: "When difficult emotions arise, what's your typical response?", opts: ["I avoid or distract", "I try to think my way through", "I can usually sit with them", "I welcome them as information"] },
  { q: "How familiar are you with the research on this topic?", opts: ["Not at all", "I've read a few articles", "I've studied it seriously", "I'm deeply informed"] },
  { q: "What's your primary motivation?", opts: ["Curiosity", "Healing something specific", "Spiritual growth", "Professional development"] },
  { q: "How would you rate your current support system?", opts: ["Minimal", "A few trusted people", "Strong community", "Professional support in place"] },
];
let current = 0, scores = [];
function renderQ() {
  if (current >= questions.length) return showResult();
  const q = questions[current];
  document.getElementById('progressBar').style.width = ((current/questions.length)*100)+'%';
  document.getElementById('quizContent').innerHTML =
    '<div class="quiz-question"><h3>Question ' + (current+1) + ' of ' + questions.length + '</h3><p>' + q.q + '</p>' +
    q.opts.map((o,i) => '<div class="quiz-option" tabindex="0" role="button" onclick="selectOpt('+i+')" onkeydown="if(event.key===\x27Enter\x27)selectOpt('+i+')">' + o + '</div>').join('') + '</div>';
}
function selectOpt(i) { scores.push(i); current++; renderQ(); }
function showResult() {
  document.getElementById('progressBar').style.width = '100%';
  document.getElementById('quizContent').style.display = 'none';
  document.getElementById('quizResult').style.display = 'block';
  const avg = scores.reduce((a,b)=>a+b,0) / scores.length;
  let title, text;
  if (avg < 1) { title = "The Beginning"; text = "You're at the start of this exploration, and that's exactly where you should be. The most important thing right now isn't action — it's education. Read widely, talk to people who've walked this path, and trust that readiness has its own timeline."; }
  else if (avg < 2) { title = "The Threshold"; text = "You're standing at the edge of something, curious enough to look but wise enough to pause. This is the territory where preparation matters most. Consider deepening your contemplative practice before going further. The medicine works best when it has something to work with."; }
  else if (avg < 3) { title = "The Practitioner"; text = "You've done meaningful inner work and you understand that these experiences aren't shortcuts — they're amplifiers. Your preparation positions you well, but remember: the most transformative experiences often come when we think we're ready and discover we're not. Stay humble."; }
  else { title = "The Integrator"; text = "You bring depth, experience, and a mature relationship with consciousness to this work. Your challenge isn't preparation — it's integration. The question for you isn't whether to go deeper, but how to bring what you've already seen into the fabric of daily life."; }
  document.getElementById('resultTitle').textContent = title;
  document.getElementById('resultText').textContent = text;
  const url = encodeURIComponent(window.location.href);
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
  const links = articles.map(a => `<li style="padding:8px 0;"><a href="/articles/${a.slug}">${a.title}</a></li>`).join('');

  res.status(404).send(`${htmlHead('Page Not Found — The Quiet Medicine', 'The page you are looking for does not exist.', 'https://thequietmedicine.com/404')}
<body>
${navHTML()}
<div class="container" style="padding-top:60px;text-align:center;">
  <h1>Page Not Found</h1>
  <blockquote style="font-family:'Newsreader',Georgia,serif;font-size:24px;color:#1B5E20;margin:32px auto;max-width:600px;font-style:italic;">"The most important things in life cannot be understood — only experienced."</blockquote>
  <p style="margin:24px 0;color:#666;">The page you're looking for doesn't exist, but these might be what you need:</p>
  <ul style="list-style:none;max-width:500px;margin:0 auto;text-align:left;">${links}</ul>
  <p style="margin:32px 0;"><a href="/">Return Home</a></p>
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
  console.log(`[quiet-medicine] Server running on port ${PORT}`);
  const articles = loadArticles();
  const published = filterPublished(articles);
  console.log(`[quiet-medicine] ${articles.length} total articles, ${published.length} published`);
});

export default app;
