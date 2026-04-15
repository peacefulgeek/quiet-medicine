#!/usr/bin/env python3
"""Post-rewrite cleanup: fix banned phrases, 'This is where', backlinks, lived experience."""

import json, os, re, random

CONTENT_DIR = os.path.join(os.path.dirname(__file__), '..', 'content', 'articles')

# ── Fix 2: Replace "This is where" ──
THIS_IS_WHERE_REPLACEMENTS = [
    "That's the moment when", "And right there,", "This is the point where",
    "Here's where it gets interesting:", "And that's when", "Right here is where",
    "This is how", "And so,", "That's exactly when", "Which brings us to",
    "And in that space,", "Something shifts here.", "Notice what happens next.",
]

# ── Fix 9: Banned phrases ──
BANNED_REPLACEMENTS = {
    'manifest': 'emerge', 'manifests': 'emerges', 'manifesting': 'emerging',
    'manifestation': 'expression', 'manifestations': 'expressions',
    'lean into': 'move toward', 'leaning into': 'moving toward',
    'safe space': 'supportive environment', 'safe spaces': 'supportive environments',
    'hold space': 'stay present', 'holding space': 'staying present',
    'held space': 'stayed present',
    'sacred container': 'protected setting', 'sacred containers': 'protected settings',
    'deep dive': 'close look', 'deep diving': 'looking closely',
    'unpack': 'examine', 'unpacking': 'examining',
    'at the end of the day': 'when it comes down to it',
    'on a deeper level': 'more closely',
    'inner work': 'personal practice', 'the work': 'the practice',
}

# ── Fix 5: Backlink targets ──
KALESH_LINK = '<a href="https://kalesh.love" target="_blank">Kalesh</a>'
AMAZON_TAG = 'spankyspinola-20'
AMAZON_PRODUCTS = [
    ('B0C1H1J3K5', 'precision milligram scale'),
    ('B08BKWN3X5', 'meditation cushion'),
    ('B09KGJHYRL', 'integration journal'),
    ('0593473396', 'Michael Pollan\'s How to Change Your Mind'),
    ('B0BXQMHGKK', 'mushroom growing kit'),
    ('B07YJLHVTM', 'fasting timer'),
    ('0399178570', 'The Psychedelic Explorer\'s Guide'),
    ('B0BN2KZXMV', 'blue light blocking glasses'),
    ('B09V5KZYRQ', 'adaptogenic mushroom blend'),
    ('B07D7P7WCH', 'noise-canceling headphones'),
]

EXTERNAL_ORGS = [
    ('https://maps.org', 'MAPS'),
    ('https://www.hopkinsmedicine.org/research/psychedelics', 'Johns Hopkins Center'),
    ('https://www.nature.com/subjects/psychopharmacology', 'Nature'),
    ('https://pubmed.ncbi.nlm.nih.gov', 'PubMed'),
    ('https://www.thelancet.com', 'The Lancet'),
    ('https://www.scientificamerican.com', 'Scientific American'),
    ('https://www.apa.org', 'American Psychological Association'),
    ('https://www.ncbi.nlm.nih.gov', 'NIH'),
]

INTERNAL_CATEGORIES = [
    '/the-science', '/the-microdose', '/the-journey', '/the-clinic', '/the-integration',
]

# ── Fix 8: Lived experience markers ──
LIVED_EXPERIENCE_PHRASES = [
    "I remember the first time", "In my own experience,", "When I first encountered this,",
    "I've sat with this question myself.", "Years ago, I noticed", "I'll be honest here.",
    "Speaking from my own practice,", "I've watched this unfold in my own life.",
    "There was a season when I", "I've seen this pattern in my own journey.",
    "Something I've learned firsthand:", "I can tell you from experience,",
    "This is something I've lived through.", "In my years of practice,",
    "I've been on both sides of this.", "What I've found personally is",
]

def fix_article(filepath):
    with open(filepath) as f:
        data = json.load(f)
    
    body = data.get('body', '')
    slug = data.get('slug', '')
    changes = []
    
    # ── Fix 2: Remove "This is where" ──
    pattern = re.compile(r'This is where\b', re.IGNORECASE)
    matches = list(pattern.finditer(body))
    if matches:
        for m in reversed(matches):
            repl = random.choice(THIS_IS_WHERE_REPLACEMENTS)
            body = body[:m.start()] + repl + body[m.end():]
        changes.append(f'fix2: {len(matches)} "This is where" replaced')
    
    # ── Fix 9: Banned phrases ──
    banned_fixed = 0
    for phrase, replacement in BANNED_REPLACEMENTS.items():
        pat = re.compile(r'\b' + re.escape(phrase) + r'\b', re.IGNORECASE)
        count = len(pat.findall(body))
        if count > 0:
            body = pat.sub(replacement, body)
            banned_fixed += count
    if banned_fixed:
        changes.append(f'fix9: {banned_fixed} banned phrases replaced')
    
    # ── Fix 5: Re-inject backlinks ──
    # Check if article has any links at all
    link_count = len(re.findall(r'<a\s+href=', body))
    if link_count == 0:
        # Need to inject backlinks based on distribution
        # 14% kalesh, 33% amazon, 23% external, 30% internal
        r = random.random()
        if r < 0.14:
            # Kalesh link
            body = inject_link_at_paragraph(body, KALESH_LINK)
            changes.append('fix5: kalesh link injected')
        elif r < 0.47:
            # Amazon product link
            asin, name = random.choice(AMAZON_PRODUCTS)
            link = f'<a href="https://www.amazon.com/dp/{asin}?tag={AMAZON_TAG}" rel="nofollow sponsored" target="_blank">{name} (paid link)</a>'
            body = inject_link_at_paragraph(body, link)
            changes.append('fix5: amazon link injected')
        elif r < 0.70:
            # External org link
            url, name = random.choice(EXTERNAL_ORGS)
            link = f'<a href="{url}" rel="nofollow" target="_blank">{name}</a>'
            body = inject_link_at_paragraph(body, link)
            changes.append('fix5: external link injected')
        else:
            # Internal link
            cat = random.choice(INTERNAL_CATEGORIES)
            name = cat.replace('/', '').replace('the-', 'The ').title()
            link = f'<a href="{cat}">{name}</a>'
            body = inject_link_at_paragraph(body, link)
            changes.append('fix5: internal link injected')
    
    # ── Fix 8: Ensure lived experience marker ──
    text_lower = re.sub(r'<[^>]+>', ' ', body).lower()
    has_lived = any(phrase.lower() in text_lower for phrase in [
        "i remember", "in my own", "when i first", "i've sat", "years ago, i",
        "i'll be honest", "speaking from my", "i've watched", "there was a season",
        "i've seen this pattern", "something i've learned", "i can tell you from",
        "i've lived through", "in my years", "i've been on both", "what i've found",
        "my own experience", "my own practice", "my own journey", "i noticed",
        "personally", "firsthand",
    ])
    if not has_lived:
        marker = random.choice(LIVED_EXPERIENCE_PHRASES)
        body = inject_lived_experience(body, marker)
        changes.append('fix8: lived experience marker added')
    
    if changes:
        data['body'] = body
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        print(f'  [{slug}] {", ".join(changes)}')
    
    return len(changes) > 0

def inject_link_at_paragraph(body, link_html):
    """Inject a link into a random paragraph in the article body."""
    paragraphs = list(re.finditer(r'<p>(.*?)</p>', body, re.DOTALL))
    if len(paragraphs) < 3:
        return body
    
    # Pick a paragraph in the middle third
    mid_start = len(paragraphs) // 3
    mid_end = 2 * len(paragraphs) // 3
    target = random.choice(paragraphs[mid_start:mid_end])
    
    content = target.group(1)
    sentences = re.split(r'(?<=[.!?])\s+', content)
    if len(sentences) > 1:
        insert_point = random.randint(0, len(sentences) - 1)
        sentences[insert_point] = sentences[insert_point].rstrip('.') + ' (as noted by ' + link_html + ').'
        new_content = ' '.join(sentences)
    else:
        new_content = content.rstrip('.') + ' (see ' + link_html + ').'
    
    body = body[:target.start()] + '<p>' + new_content + '</p>' + body[target.end():]
    return body

def inject_lived_experience(body, marker):
    """Inject a lived experience marker into a paragraph."""
    paragraphs = list(re.finditer(r'<p>(.*?)</p>', body, re.DOTALL))
    if len(paragraphs) < 3:
        return body
    
    # Pick a paragraph in the first half
    target_idx = random.randint(1, min(3, len(paragraphs) - 1))
    target = paragraphs[target_idx]
    content = target.group(1)
    
    new_content = marker + ' ' + content
    body = body[:target.start()] + '<p>' + new_content + '</p>' + body[target.end():]
    return body

def main():
    files = sorted([f for f in os.listdir(CONTENT_DIR) if f.endswith('.json')])
    print(f'Processing {len(files)} articles...')
    
    fixed_count = 0
    for f in files:
        if fix_article(os.path.join(CONTENT_DIR, f)):
            fixed_count += 1
    
    print(f'\nTotal articles modified: {fixed_count}')

if __name__ == '__main__':
    main()
