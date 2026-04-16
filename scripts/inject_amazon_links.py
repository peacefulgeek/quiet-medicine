#!/usr/bin/env python3
"""
Inject at least 3 contextually relevant Amazon affiliate links into every article.
Each link uses the spankyspinola-20 tag, rel="nofollow sponsored", and (paid link) label.
Products are matched to article content by keyword relevance.
"""

import json, os, re, random

CONTENT_DIR = os.path.join(os.path.dirname(__file__), '..', 'content', 'articles')
TAG = 'spankyspinola-20'

# ── COMPREHENSIVE PRODUCT CATALOG ──
# Each product: (ASIN, display_name, keywords_that_make_it_relevant, natural_recommendation_phrase)
PRODUCTS = [
    # ── Scales & Measurement ──
    ('B0C1H1J3K5', 'precision milligram scale',
     ['microdos', 'dose', 'dosage', 'milligram', 'scale', 'weigh', 'measure', 'protocol', 'psilocybin', 'mushroom', 'sub-perceptual'],
     'a reliable milligram scale for accurate dosing'),
    
    # ── Journals & Writing ──
    ('B09KGJHYRL', 'integration journal',
     ['integrat', 'journal', 'writing', 'reflect', 'process', 'aftercare', 'routine', 'daily', 'practice', 'insight', 'meaning'],
     'a dedicated integration journal to track your process'),
    ('B0BN2KZYRQ', 'guided meditation journal',
     ['meditat', 'mindful', 'contemplat', 'silence', 'quiet', 'inner', 'awareness', 'breath', 'stillness'],
     'a guided meditation journal for daily practice'),
    
    # ── Meditation & Mindfulness ──
    ('B08BKWN3X5', 'meditation cushion',
     ['meditat', 'sit', 'breath', 'mindful', 'contemplat', 'practice', 'cushion', 'posture', 'ceremony', 'ritual'],
     'a quality meditation cushion for your practice'),
    ('B07D7P7WCH', 'noise-canceling headphones',
     ['music', 'sound', 'listen', 'audio', 'noise', 'silence', 'session', 'playlist', 'headphone', 'sensory'],
     'noise-canceling headphones for immersive sessions'),
    ('B0BH4JH1YK', 'meditation timer',
     ['timer', 'meditat', 'session', 'practice', 'breath', 'mindful', 'routine', 'daily'],
     'a gentle meditation timer for structured practice'),
    
    # ── Supplements & Stacks ──
    ('B09V5KZYRQ', 'adaptogenic mushroom blend',
     ['mushroom', 'adapto', 'lion', 'supplement', 'stack', 'stamets', 'niacin', 'blend', 'nootropic', 'cognitive'],
     'an adaptogenic mushroom blend for daily support'),
    ('B07YJLHVTM', 'fasting timer',
     ['fast', 'diet', 'nutrition', 'food', 'eat', 'body', 'preparation', 'ceremony', 'cleanse', 'gut'],
     'a fasting tracker to support your preparation'),
    ('B0BXQMHGKK', 'mushroom growing kit',
     ['grow', 'mushroom', 'cultivat', 'mycel', 'substrate', 'psilocybin', 'fungi', 'spore'],
     'a beginner-friendly mushroom growing kit'),
    
    # ── Books ──
    ('0593473396', 'How to Change Your Mind by Michael Pollan',
     ['pollan', 'book', 'read', 'research', 'history', 'psychedelic', 'science', 'study', 'literature'],
     'Michael Pollan\'s How to Change Your Mind'),
    ('0399178570', 'The Psychedelic Explorer\'s Guide',
     ['guide', 'explorer', 'preparation', 'set', 'setting', 'session', 'sitter', 'facilitat', 'protocol'],
     'The Psychedelic Explorer\'s Guide by James Fadiman'),
    ('1623174023', 'The Body Keeps the Score',
     ['trauma', 'body', 'somatic', 'ptsd', 'nervous', 'stress', 'healing', 'stored', 'memory', 'van der kolk'],
     'The Body Keeps the Score by Bessel van der Kolk'),
    ('0062515675', 'Stealing Fire',
     ['flow', 'state', 'consciousness', 'peak', 'performance', 'altered', 'brain', 'neuroscience'],
     'Stealing Fire by Steven Kotler and Jamie Wheal'),
    ('1946764531', 'A Really Good Day by Ayelet Waldman',
     ['microdos', 'lsd', 'day', 'mood', 'depression', 'anxiety', 'daily', 'experiment', 'personal'],
     'A Really Good Day by Ayelet Waldman'),
    ('0062883682', 'Entangled Life by Merlin Sheldrake',
     ['fungi', 'mushroom', 'mycel', 'network', 'nature', 'biology', 'ecology', 'organism'],
     'Entangled Life by Merlin Sheldrake'),
    
    # ── Wellness & Body ──
    ('B0BN2KZXMV', 'blue light blocking glasses',
     ['sleep', 'light', 'circadian', 'rest', 'recovery', 'night', 'screen', 'eye', 'relax'],
     'blue light blocking glasses for better sleep'),
    ('B08DFCWVZ4', 'weighted blanket',
     ['sleep', 'anxiety', 'calm', 'nervous', 'relax', 'comfort', 'grounding', 'rest', 'body'],
     'a weighted blanket for grounding and calm'),
    ('B07PXLF6KS', 'aromatherapy diffuser',
     ['aroma', 'scent', 'essential', 'oil', 'ceremony', 'ritual', 'environment', 'setting', 'space', 'room'],
     'an aromatherapy diffuser for setting intention'),
    ('B09HGDKFNP', 'acupressure mat',
     ['body', 'somatic', 'tension', 'release', 'physical', 'pain', 'relax', 'nervous system', 'grounding'],
     'an acupressure mat for somatic release'),
    
    # ── Ceremony & Setting ──
    ('B07PXLF6KS', 'essential oil set',
     ['ceremony', 'ritual', 'sacred', 'tradition', 'setting', 'environment', 'intention', 'preparation', 'plant'],
     'a curated essential oil set for ceremony preparation'),
    ('B0C5KJ8NHQ', 'beeswax candle set',
     ['ceremony', 'ritual', 'candle', 'light', 'setting', 'environment', 'sacred', 'intention', 'darkness', 'night'],
     'natural beeswax candles for your setting'),
    ('B09DFGH123', 'eye mask for meditation',
     ['dark', 'eye', 'mask', 'blind', 'visual', 'inner', 'session', 'sensory', 'deprivation', 'retreat'],
     'a comfortable eye mask for inner exploration'),
    
    # ── Tech & Tracking ──
    ('B0BDHQK6FJ', 'heart rate variability monitor',
     ['heart', 'hrv', 'nervous', 'vagal', 'autonomic', 'biometric', 'track', 'monitor', 'stress', 'recovery'],
     'an HRV monitor to track nervous system recovery'),
    ('B0B5F9SZW7', 'smart water bottle',
     ['water', 'hydrat', 'body', 'preparation', 'ceremony', 'health', 'daily', 'routine'],
     'a smart water bottle for staying hydrated'),
    
    # ── Therapy & Clinical ──
    ('B0C8JK2MNP', 'therapy notebook',
     ['therap', 'clinical', 'session', 'notes', 'treatment', 'provider', 'mental health', 'counseling'],
     'a therapy-focused notebook for session notes'),
    ('B07WDFT2XC', 'comfort blanket for sessions',
     ['session', 'comfort', 'clinical', 'therap', 'treatment', 'patient', 'setting', 'support'],
     'a soft comfort blanket for therapy sessions'),
]

def get_relevance_score(product, body_lower, title_lower, slug_lower):
    """Score how relevant a product is to an article based on keyword matching."""
    _, _, keywords, _ = product
    score = 0
    combined = body_lower + ' ' + title_lower + ' ' + slug_lower
    for kw in keywords:
        # Title/slug matches worth more
        if kw in title_lower or kw in slug_lower:
            score += 3
        if kw in combined:
            score += 1
    return score

def make_link(product):
    """Create an Amazon affiliate link HTML."""
    asin, name, _, rec_phrase = product
    return f'<a href="https://www.amazon.com/dp/{asin}?tag={TAG}" rel="nofollow sponsored" target="_blank">{rec_phrase} (paid link)</a>'

def count_amazon_links(body):
    """Count existing Amazon links in body."""
    return len(re.findall(r'<a[^>]*href="[^"]*amazon\.com[^"]*"', body))

def get_existing_asins(body):
    """Get ASINs already linked in the body."""
    return set(re.findall(r'amazon\.com/dp/([A-Z0-9]+)', body))

# Natural insertion phrases that weave the link into the text
INSERTION_TEMPLATES = [
    'Many people find {link} helpful during this phase.',
    'If you\'re looking for practical support, consider {link}.',
    'One resource worth considering is {link}.',
    'For those who want to go deeper, {link} can make a real difference.',
    'A practical tool that pairs well with this is {link}.',
    'Something I often recommend at this stage is {link}.',
    'Worth noting: {link} has been a solid companion for many in this process.',
    'If you want to support this work practically, {link} is a good starting point.',
    'On the practical side, {link} is something many people swear by.',
    'For hands-on support, {link} is worth a look.',
]

def inject_links_into_article(filepath):
    """Inject Amazon links into an article until it has at least 3."""
    with open(filepath) as f:
        data = json.load(f)
    
    body = data.get('body', '')
    slug = data.get('slug', '')
    title = data.get('title', '')
    
    current_count = count_amazon_links(body)
    if current_count >= 3:
        return 0  # Already has enough
    
    needed = 3 - current_count
    existing_asins = get_existing_asins(body)
    
    body_lower = re.sub(r'<[^>]+>', ' ', body).lower()
    title_lower = title.lower()
    slug_lower = slug.lower().replace('-', ' ')
    
    # Score all products by relevance
    scored = []
    for product in PRODUCTS:
        asin = product[0]
        if asin in existing_asins:
            continue  # Skip already-linked products
        score = get_relevance_score(product, body_lower, title_lower, slug_lower)
        scored.append((score, product))
    
    # Sort by relevance (highest first), with some randomness for ties
    scored.sort(key=lambda x: (-x[0], random.random()))
    
    # Pick the top N most relevant products
    selected = [p for _, p in scored[:needed]]
    
    if len(selected) < needed:
        # If not enough unique products, just use what we have
        selected = [p for _, p in scored[:needed]]
    
    # Find paragraphs to inject into (spread across the article)
    paragraphs = list(re.finditer(r'<p>(.*?)</p>', body, re.DOTALL))
    if len(paragraphs) < 4:
        return 0  # Too short to inject into
    
    # Distribute links across the article: early-middle, middle, late-middle
    total_p = len(paragraphs)
    injection_zones = []
    if needed >= 1:
        injection_zones.append(random.randint(max(1, total_p // 5), total_p // 3))
    if needed >= 2:
        injection_zones.append(random.randint(total_p // 3, 2 * total_p // 3))
    if needed >= 3:
        injection_zones.append(random.randint(2 * total_p // 3, total_p - 2))
    
    # Sort zones in reverse order so we can inject without offset issues
    injection_zones.sort(reverse=True)
    
    injected = 0
    for i, zone_idx in enumerate(injection_zones):
        if i >= len(selected):
            break
        
        product = selected[i]
        link_html = make_link(product)
        template = random.choice(INSERTION_TEMPLATES)
        sentence = template.format(link=link_html)
        
        target = paragraphs[zone_idx]
        # Insert after the target paragraph
        insert_pos = target.end()
        new_paragraph = f'<p>{sentence}</p>'
        body = body[:insert_pos] + new_paragraph + body[insert_pos:]
        injected += 1
    
    if injected > 0:
        data['body'] = body
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
    
    return injected

def main():
    files = sorted([f for f in os.listdir(CONTENT_DIR) if f.endswith('.json')])
    print(f'Processing {len(files)} articles...')
    
    total_injected = 0
    articles_modified = 0
    
    for f in files:
        added = inject_links_into_article(os.path.join(CONTENT_DIR, f))
        if added > 0:
            total_injected += added
            articles_modified += 1
    
    print(f'\nArticles modified: {articles_modified}')
    print(f'Total links injected: {total_injected}')
    
    # Verify
    print('\n── Post-injection verification ──')
    under_3 = 0
    for f in files:
        with open(os.path.join(CONTENT_DIR, f)) as fh:
            data = json.load(fh)
        body = data.get('body', '')
        count = count_amazon_links(body)
        if count < 3:
            under_3 += 1
            print(f'  WARNING: {f} has only {count} Amazon links')
    
    if under_3 == 0:
        print(f'  All {len(files)} articles have 3+ Amazon links!')
    else:
        print(f'  {under_3} articles still under 3 links')

if __name__ == '__main__':
    main()
