#!/usr/bin/env python3
"""
Inject In-Body Images into Articles
────────────────────────────────────
Adds 1-2 contextual images within each article body, placed after
the first major section (after the 2nd or 3rd <h2>).

Strategy: Use the article's own hero image as a mid-article visual break,
and for articles with 4+ sections, add a second image from a related article
in the same category.
"""

import json, os, re, random

CONTENT_DIR = 'content/articles'
CDN_BASE = 'https://quiet-medicine.b-cdn.net/images'

files = sorted([f for f in os.listdir(CONTENT_DIR) if f.endswith('.json')])
articles = []
for f in files:
    data = json.load(open(os.path.join(CONTENT_DIR, f)))
    articles.append(data)

# Build category -> articles map for cross-referencing images
cat_map = {}
for a in articles:
    cat = a.get('categorySlug', 'unknown')
    if cat not in cat_map:
        cat_map[cat] = []
    cat_map[cat].append(a)

def get_related_image(article, all_articles, cat_map):
    """Get a hero image from a related article in the same category."""
    cat = article.get('categorySlug', 'unknown')
    candidates = [a for a in cat_map.get(cat, []) 
                  if a['slug'] != article['slug'] and a.get('heroImage')]
    if candidates:
        chosen = random.choice(candidates)
        return chosen['heroImage'], chosen.get('heroAlt', chosen['title'])
    return None, None

def make_img_tag(src, alt, caption=None):
    """Create a responsive image tag with optional caption."""
    tag = f'<figure style="margin:2rem 0;text-align:center;">'
    tag += f'<img src="{src}" alt="{alt}" width="800" height="450" loading="lazy" style="max-width:100%;height:auto;border-radius:8px;">'
    if caption:
        tag += f'<figcaption style="font-size:14px;color:#666;margin-top:8px;font-style:italic;">{caption}</figcaption>'
    tag += '</figure>'
    return tag

injected = 0
already_has = 0

for a in articles:
    body = a.get('body', '')
    
    # Skip if already has body images
    if '<img ' in body and 'figure' in body:
        already_has += 1
        continue
    
    hero = a.get('heroImage', '')
    hero_alt = a.get('heroAlt', a.get('title', ''))
    
    if not hero:
        continue
    
    # Find all <h2> positions
    h2_positions = [m.start() for m in re.finditer(r'<h2[^>]*>', body)]
    
    if len(h2_positions) < 2:
        # Not enough sections, inject after first paragraph
        first_p_end = body.find('</p>')
        if first_p_end > 0:
            insert_pos = first_p_end + 4
            img_tag = make_img_tag(hero, hero_alt)
            body = body[:insert_pos] + '\n' + img_tag + '\n' + body[insert_pos:]
            a['body'] = body
            injected += 1
        continue
    
    # Insert first image before the 2nd h2 (after first section)
    insert1 = h2_positions[1]
    img1 = make_img_tag(hero, hero_alt)
    body = body[:insert1] + '\n' + img1 + '\n' + body[insert1:]
    
    # If 4+ sections, add a second image from a related article before the 4th h2
    if len(h2_positions) >= 4:
        related_img, related_alt = get_related_image(a, articles, cat_map)
        if related_img:
            # Recalculate positions after first insertion
            h2_positions_new = [m.start() for m in re.finditer(r'<h2[^>]*>', body)]
            if len(h2_positions_new) >= 4:
                insert2 = h2_positions_new[3]
                img2 = make_img_tag(related_img, related_alt)
                body = body[:insert2] + '\n' + img2 + '\n' + body[insert2:]
    
    a['body'] = body
    injected += 1

# Save all articles
for a in articles:
    filepath = os.path.join(CONTENT_DIR, a['slug'] + '.json')
    json.dump(a, open(filepath, 'w'), indent=2)

# Verify
total_with_body_img = 0
for f in files:
    data = json.load(open(os.path.join(CONTENT_DIR, f)))
    body = data.get('body', '')
    if '<img ' in body:
        total_with_body_img += 1

print(f'Total articles: {len(articles)}')
print(f'Already had body images: {already_has}')
print(f'Injected images into: {injected}')
print(f'Articles now with body images: {total_with_body_img}/{len(articles)}')
