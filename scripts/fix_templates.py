#!/usr/bin/env python3
"""
Fix the server file by rewriting the broken route handlers (lines 1011+)
with properly structured code that avoids nested template literal issues.
"""

# Read the first 1010 lines (everything up to and including the homepage route)
with open('/home/ubuntu/quiet-medicine/src/server/index.mjs', 'r') as f:
    lines = f.readlines()

# Keep lines 1-1009 (the homepage route ends with `});` at line 1009)
good_part = ''.join(lines[:1009])

# Now write the fixed route handlers
fixed_routes = r'''
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
'''

with open('/home/ubuntu/quiet-medicine/src/server/index.mjs', 'w') as f:
    f.write(good_part + fixed_routes)

print("Done! File rewritten with fixed templates.")
