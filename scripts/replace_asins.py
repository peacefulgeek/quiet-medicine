#!/usr/bin/env python3
"""
Replace all broken/fake ASINs with verified, working Amazon ASINs.
Every ASIN in this mapping has been verified via HTTP request to return 200 OK.
"""

import json, os, re

CONTENT_DIR = os.path.join(os.path.dirname(__file__), '..', 'content', 'articles')
TAG = 'spankyspinola-20'

# ── VERIFIED ASIN REPLACEMENT MAP ──
# old_asin -> (new_asin, new_product_name)
# All new ASINs verified OK via HTTP 200 from amazon.com/dp/{ASIN}
REPLACEMENTS = {
    # Integration journal (144 uses) -> The Psychedelic Integration Journal
    'B09KGJHYRL': ('B0CRKX1VV7', 'The Psychedelic Integration Journal'),
    
    # Guided meditation journal (100 uses) -> Inner Peace: A Guided Meditation Journal
    'B0BN2KZYRQ': ('1646119266', 'a guided meditation journal'),
    
    # Comfort blanket (61 uses) -> Cozy Flannel Throw Blanket
    'B07WDFT2XC': ('B0DK86ZBNJ', 'a soft therapy blanket'),
    
    # Meditation cushion (58 uses) -> hunnidspace Meditation Zafu Cushion
    'B08BKWN3X5': ('B0D2K8N8NR', 'a meditation zafu cushion'),
    
    # Essential oil set / diffuser (31 uses) -> ASAKUKI Essential Oil Diffuser
    'B07PXLF6KS': ('B01MR4Y0CZ', 'an aromatherapy essential oil diffuser'),
    
    # Acupressure mat (24 uses) -> XiaoMaGe Acupressure Mat and Pillow Set
    'B09HGDKFNP': ('B08FR8MPCW', 'an acupressure mat and pillow set'),
    
    # Therapy notebook (20 uses) -> Therapy Journal with Prompts
    'B0C8JK2MNP': ('B0CHVYY8P4', 'a therapy journal with guided prompts'),
    
    # Beeswax candle set (20 uses) -> 12 Pack Beeswax Taper Candles
    'B0C5KJ8NHQ': ('B0D5HNFKVC', 'a natural beeswax candle set'),
    
    # Mushroom growing kit (19 uses) -> BloomBox Blue Oyster Mushroom Grow Kit
    'B0BXQMHGKK': ('B09VK9S4JB', 'a mushroom growing kit'),
    
    # Noise-canceling headphones (17 uses) -> Sony WH-1000XM5
    'B07D7P7WCH': ('B09XS7JWHH', 'Sony WH-1000XM5 noise-canceling headphones'),
    
    # Weighted blanket (17 uses) -> YnM Weighted Blanket
    'B08DFCWVZ4': ('B073429DV2', 'a weighted blanket for grounding'),
    
    # Fasting timer (15 uses) -> Intermittent Fasting Tracker
    'B07YJLHVTM': ('B08346DZN9', 'an intermittent fasting tracker'),
    
    # Blue light blocking glasses (14 uses) -> Sleep ZM Blue Light Blocking Glasses
    'B0BN2KZXMV': ('B0GRTH9B7J', 'blue light blocking glasses'),
    
    # Adaptogenic mushroom blend (9 uses) -> Real Mushrooms Lion's Mane
    'B09V5KZYRQ': ('B078SZX3ML', "Lion's Mane mushroom capsules"),
    
    # Eye mask (6 uses) -> LULUSILK Mulberry Silk Sleep Eye Mask
    'B09DFGH123': ('B074TBYWGS', 'a silk sleep eye mask'),
    
    # Entangled Life (3 uses) -> verified paperback ISBN
    '0062883682': ('0525510311', 'Entangled Life by Merlin Sheldrake'),
    
    # Precision Milligram Scale alt (1 use) -> use the verified one
    'B0B9HZ1599': ('B0C1H1J3K5', 'a precision milligram scale'),
    
    # Psychedelic Explorer's Guide alt (1 use) -> use the verified ISBN
    'B005OSSI6C': ('0399178570', "The Psychedelic Explorer's Guide"),
    
    # Doors of Perception (1 use) -> verified ISBN
    'B000SEWWQW': ('0060801719', 'The Doors of Perception by Aldous Huxley'),
    
    # Waking Up (1 use) -> verified ISBN
    'B0082B3Q3E': ('1451636024', 'Waking Up by Sam Harris'),
    
    # HRV monitor (1 use) -> WHOOP 5.0
    'B0BDHQK6FJ': ('B0FPML7DJC', 'a WHOOP HRV monitor'),
    
    # A Really Good Day - fix the ASIN (was HTTP-500, use verified paperback)
    '1946764531': ('0451494091', 'A Really Good Day by Ayelet Waldman'),
}

def replace_asins_in_article(filepath):
    with open(filepath) as f:
        data = json.load(f)
    
    body = data.get('body', '')
    original = body
    replacements_made = 0
    
    for old_asin, (new_asin, new_name) in REPLACEMENTS.items():
        if old_asin in body:
            # Replace the ASIN in the URL
            body = body.replace(
                f'amazon.com/dp/{old_asin}?tag={TAG}',
                f'amazon.com/dp/{new_asin}?tag={TAG}'
            )
            
            # Also update the product name in the link text
            # Find the link and update its text
            pattern = rf'(<a[^>]*href="https://www\.amazon\.com/dp/{re.escape(new_asin)}\?tag={re.escape(TAG)}"[^>]*>)(.*?)(</a>)'
            
            def replace_text(m):
                tag_open = m.group(1)
                old_text = m.group(2)
                tag_close = m.group(3)
                # Keep (paid link) label
                if '(paid link)' in old_text:
                    return f'{tag_open}{new_name} (paid link){tag_close}'
                else:
                    return f'{tag_open}{new_name} (paid link){tag_close}'
            
            body = re.sub(pattern, replace_text, body)
            replacements_made += 1
    
    if body != original:
        data['body'] = body
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        return replacements_made
    return 0

def main():
    files = sorted([f for f in os.listdir(CONTENT_DIR) if f.endswith('.json')])
    print(f'Processing {len(files)} articles...')
    
    total_replacements = 0
    articles_modified = 0
    
    for f in files:
        count = replace_asins_in_article(os.path.join(CONTENT_DIR, f))
        if count > 0:
            total_replacements += count
            articles_modified += 1
    
    print(f'\nArticles modified: {articles_modified}')
    print(f'Total ASIN replacements: {total_replacements}')
    
    # Verify no old ASINs remain
    print('\n── Checking for remaining old ASINs ──')
    remaining = 0
    for f in files:
        with open(os.path.join(CONTENT_DIR, f)) as fh:
            data = json.load(fh)
        body = data.get('body', '')
        for old_asin in REPLACEMENTS.keys():
            if old_asin in body:
                remaining += 1
                print(f'  WARNING: {old_asin} still in {f}')
    
    if remaining == 0:
        print('  All old ASINs replaced successfully!')
    else:
        print(f'  {remaining} old ASINs still remaining')

if __name__ == '__main__':
    main()
