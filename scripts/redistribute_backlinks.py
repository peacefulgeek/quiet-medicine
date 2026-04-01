#!/usr/bin/env python3
"""
Redistribute backlinks across all 300 articles to new distribution:
- 14% kalesh.love (advisor link, no rel, no target)
- 33% Amazon product links (rel="nofollow sponsored", tag=spankyspinola-20)
- 23% External org links (rel="nofollow")
- 30% Internal only (no external links at all)

Total: 300 articles
- 42 articles get kalesh.love link
- 99 articles get Amazon product link
- 69 articles get external org link
- 90 articles get internal-only links
"""

import json, os, random, re

CONTENT_DIR = '/home/ubuntu/quiet-medicine/content/articles'
AMAZON_TAG = 'spankyspinola-20'

# Real Amazon products relevant to psychedelic wellness
AMAZON_PRODUCTS = [
    {'name': 'Precision Milligram Scale', 'asin': 'B0B9HZ1599'},
    {'name': 'Size 00 Vegetarian Capsules', 'asin': 'B09NBCNHXP'},
    {'name': 'Capsule Filling Machine', 'asin': 'B07RXYNT9N'},
    {'name': 'Coffee Grinder for Mushrooms', 'asin': 'B001804CLY'},
    {'name': 'Amber Glass Storage Jars', 'asin': 'B07Y2KSFNJ'},
    {'name': 'Moleskin Dot Grid Journal', 'asin': 'B015NG45GW'},
    {'name': 'Leuchtturm1917 A5 Notebook', 'asin': 'B002TSIMW4'},
    {'name': 'Silk Eye Mask for Ceremonies', 'asin': 'B07KC5DWCC'},
    {'name': 'Bose QuietComfort Earbuds', 'asin': 'B0D5XM5M4M'},
    {'name': 'Tibetan Singing Bowl Set', 'asin': 'B07V2JLHX4'},
    {'name': 'Organic Cacao Ceremonial Grade', 'asin': 'B0BXMVHWMB'},
    {'name': 'Meditation Cushion Zafu', 'asin': 'B01E6JR1CO'},
    {'name': 'Wim Hof Method Book', 'asin': 'B0916VWZCF'},
    {'name': 'How to Change Your Mind', 'asin': 'B076GPJXWZ'},
    {'name': "The Psychedelic Explorer's Guide", 'asin': 'B005OSSI6C'},
    {'name': 'Stealing Fire', 'asin': 'B01HNJIJB2'},
    {'name': 'The Body Keeps the Score', 'asin': 'B00G3L1C2K'},
    {'name': 'Waking Up by Sam Harris', 'asin': 'B00GEEB9YC'},
    {'name': "Lion's Mane Mushroom Capsules", 'asin': 'B078SZX3ML'},
    {'name': 'Niacin (Vitamin B3) 500mg', 'asin': 'B00068TJIG'},
    {'name': 'Magnesium Glycinate', 'asin': 'B000BD0RT0'},
    {'name': 'Weighted Blanket 15 lbs', 'asin': 'B07L2RGQL5'},
    {'name': 'Essential Oil Diffuser', 'asin': 'B07L4LHSSP'},
    {'name': 'Organic Peppermint Tea', 'asin': 'B000E63LFC'},
    {'name': 'Yoga Mat Premium', 'asin': 'B01LP0V3MU'},
]

# External org links (nofollow) - research orgs, journals, institutions
EXTERNAL_ORGS = [
    {'name': 'MAPS (Multidisciplinary Association for Psychedelic Studies)', 'url': 'https://maps.org'},
    {'name': 'Johns Hopkins Center for Psychedelic and Consciousness Research', 'url': 'https://hopkinspsychedelic.org'},
    {'name': 'Beckley Foundation', 'url': 'https://www.beckleyfoundation.org'},
    {'name': 'Usona Institute', 'url': 'https://www.usonainstitute.org'},
    {'name': 'Heffter Research Institute', 'url': 'https://hfrg.org'},
    {'name': 'Imperial College London Centre for Psychedelic Research', 'url': 'https://www.imperial.ac.uk/psychedelic-research-centre'},
    {'name': 'National Institute on Drug Abuse', 'url': 'https://nida.nih.gov'},
    {'name': 'PubMed Central', 'url': 'https://www.ncbi.nlm.nih.gov/pmc'},
    {'name': 'The Lancet Psychiatry', 'url': 'https://www.thelancet.com/journals/lanpsy'},
    {'name': 'Nature Neuroscience', 'url': 'https://www.nature.com/neuro'},
    {'name': 'Psychedelic Science Review', 'url': 'https://psychedelicreview.com'},
    {'name': 'Erowid', 'url': 'https://www.erowid.org'},
    {'name': 'Drug Policy Alliance', 'url': 'https://drugpolicy.org'},
    {'name': 'Chacruna Institute', 'url': 'https://chacruna.net'},
    {'name': 'Psychedelic Alpha', 'url': 'https://psychedelicalpha.com'},
]

# Load all articles
files = sorted([f for f in os.listdir(CONTENT_DIR) if f.endswith('.json')])
articles = []
for f in files:
    path = os.path.join(CONTENT_DIR, f)
    with open(path) as fh:
        data = json.load(fh)
        data['_path'] = path
        articles.append(data)

print(f"Loaded {len(articles)} articles")

# Shuffle for random assignment
random.seed(62)  # deterministic
indices = list(range(len(articles)))
random.shuffle(indices)

# Assign link types: 14% kalesh, 33% amazon, 23% external, 30% internal
n = len(articles)
n_kalesh = round(n * 0.14)   # 42
n_amazon = round(n * 0.33)   # 99
n_external = round(n * 0.23) # 69
n_internal = n - n_kalesh - n_amazon - n_external  # 90

print(f"Distribution: kalesh={n_kalesh}, amazon={n_amazon}, external={n_external}, internal={n_internal}")

kalesh_indices = set(indices[:n_kalesh])
amazon_indices = set(indices[n_kalesh:n_kalesh+n_amazon])
external_indices = set(indices[n_kalesh+n_amazon:n_kalesh+n_amazon+n_external])
internal_indices = set(indices[n_kalesh+n_amazon+n_external:])

# Get list of all article slugs for internal links
all_slugs = [a.get('slug', '') for a in articles]

def get_internal_link(current_slug):
    """Pick a random internal article link"""
    candidates = [s for s in all_slugs if s != current_slug]
    slug = random.choice(candidates)
    return f'<a href="/articles/{slug}">related reading on The Quiet Medicine</a>'

def get_kalesh_link():
    """Kalesh advisor link - no rel, no target"""
    phrases = [
        'Kalesh explores this further',
        'as Kalesh has written about',
        'Kalesh discusses this in depth',
        'this is something Kalesh addresses',
        'Kalesh offers perspective on this',
    ]
    return f'<a href="https://kalesh.love">{random.choice(phrases)}</a>'

def get_amazon_link():
    """Amazon product link - rel="nofollow sponsored" """
    product = random.choice(AMAZON_PRODUCTS)
    return f'<a href="https://www.amazon.com/dp/{product["asin"]}?tag={AMAZON_TAG}" rel="nofollow sponsored" target="_blank">{product["name"]} <span style="font-size:11px">(paid link)</span></a>'

def get_external_link():
    """External org link - rel="nofollow" """
    org = random.choice(EXTERNAL_ORGS)
    return f'<a href="{org["url"]}" rel="nofollow" target="_blank">{org["name"]}</a>'

# Process each article
updated = 0
for i, article in enumerate(articles):
    body = article.get('body', '')
    if not body:
        continue
    
    # Remove ALL existing external links first (clean slate)
    # Keep internal links
    body = re.sub(r'<a\s+href="https?://kalesh\.love[^"]*"[^>]*>[^<]*</a>', lambda m: m.group(0).split('>')[1].split('<')[0], body)
    body = re.sub(r'<a\s+href="https?://[^"]*amazon[^"]*"[^>]*>[^<]*(?:<[^/][^>]*>[^<]*)*</a>', lambda m: re.sub(r'<[^>]+>', '', m.group(0)), body)
    
    # Find good insertion points (after a paragraph that discusses a concept)
    paragraphs = body.split('</p>')
    
    if len(paragraphs) < 3:
        continue
    
    # Insert link in the middle third of the article
    mid_start = len(paragraphs) // 3
    mid_end = 2 * len(paragraphs) // 3
    insert_idx = random.randint(mid_start, min(mid_end, len(paragraphs) - 2))
    
    slug = article.get('slug', '')
    
    if i in kalesh_indices:
        link = get_kalesh_link()
        article['linkType'] = 'kalesh'
    elif i in amazon_indices:
        link = get_amazon_link()
        article['linkType'] = 'amazon'
    elif i in external_indices:
        link = get_external_link()
        article['linkType'] = 'external'
    else:
        link = get_internal_link(slug)
        article['linkType'] = 'internal'
    
    # Insert the link naturally into the paragraph
    if paragraphs[insert_idx].strip():
        # Add the link as a natural sentence at the end of the paragraph
        paragraphs[insert_idx] = paragraphs[insert_idx].rstrip() + ' ' + link
    
    body = '</p>'.join(paragraphs)
    article['body'] = body
    
    # Save
    save_data = {k: v for k, v in article.items() if k != '_path'}
    with open(article['_path'], 'w') as fh:
        json.dump(save_data, fh, indent=2)
    updated += 1

# Verify distribution
counts = {'kalesh': 0, 'amazon': 0, 'external': 0, 'internal': 0}
for a in articles:
    lt = a.get('linkType', 'internal')
    counts[lt] = counts.get(lt, 0) + 1

print(f"\nUpdated {updated} articles")
print(f"Final distribution:")
for k, v in counts.items():
    pct = round(v / n * 100)
    print(f"  {k}: {v} ({pct}%)")
