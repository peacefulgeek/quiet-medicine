#!/usr/bin/env python3
"""Fix 7 ASINs that were verified as live but pointed to wrong products."""

import json, os, re

CONTENT_DIR = os.path.join(os.path.dirname(__file__), '..', 'content', 'articles')
TAG = 'spankyspinola-20'

# old_asin -> (new_asin, new_product_name)
# All new ASINs verified via HTTP 200 + title scraping on 2026-04-16
FIXES = {
    # Stealing Fire — was pointing to "The Monk Who Sold His Ferrari"
    '0062515675': ('0062429655', 'Stealing Fire by Steven Kotler'),
    
    # How to Change Your Mind — was pointing to "The Night of the Storm"
    '0593473396': ('0735224153', 'How to Change Your Mind by Michael Pollan'),
    
    # Milligram scale — was pointing to "LED Mirror"
    'B0C1H1J3K5': ('B0885S1766', 'a precision milligram scale'),
    
    # Psychedelic Explorer's Guide — was pointing to "I Give You My Body"
    '0399178570': ('1594774021', "The Psychedelic Explorer's Guide by James Fadiman"),
    
    # Body Keeps the Score — was pointing to "The Great Bay"
    '1623174023': ('0143127748', 'The Body Keeps the Score by Bessel van der Kolk'),
    
    # Meditation timer — was pointing to "Rear View Mirror"
    'B0BH4JH1YK': ('B0FWQQGTST', 'a meditation bell for mindfulness practice'),
    
    # Smart water bottle — was pointing to "Fitbit Inspire 3"
    'B0B5F9SZW7': ('B0CGV7GLFL', 'a smart water bottle with hydration tracker'),
}

def main():
    files = sorted([f for f in os.listdir(CONTENT_DIR) if f.endswith('.json')])
    print(f'Processing {len(files)} articles...')
    
    total_fixes = 0
    articles_modified = 0
    
    for f in files:
        filepath = os.path.join(CONTENT_DIR, f)
        with open(filepath) as fh:
            data = json.load(fh)
        
        body = data.get('body', '')
        original = body
        
        for old_asin, (new_asin, new_name) in FIXES.items():
            if old_asin not in body:
                continue
            
            # Replace ASIN in URL
            body = body.replace(
                f'amazon.com/dp/{old_asin}?tag={TAG}',
                f'amazon.com/dp/{new_asin}?tag={TAG}'
            )
            
            # Update link text
            pattern = rf'(<a[^>]*href="https://www\.amazon\.com/dp/{re.escape(new_asin)}\?tag={re.escape(TAG)}"[^>]*>)(.*?)(</a>)'
            
            def make_replacer(name):
                def replacer(m):
                    tag_open = m.group(1)
                    old_text = m.group(2)
                    tag_close = m.group(3)
                    has_paid = '(paid link)' in old_text
                    return f'{tag_open}{name}{" (paid link)" if has_paid else ""}{tag_close}'
                return replacer
            
            body = re.sub(pattern, make_replacer(new_name), body)
            total_fixes += 1
        
        if body != original:
            data['body'] = body
            with open(filepath, 'w') as fh:
                json.dump(data, fh, indent=2)
            articles_modified += 1
    
    print(f'Articles modified: {articles_modified}')
    print(f'Total ASIN fixes: {total_fixes}')
    
    # Verify no old ASINs remain
    remaining = 0
    for f in files:
        with open(os.path.join(CONTENT_DIR, f)) as fh:
            body = json.load(fh).get('body', '')
        for old_asin in FIXES.keys():
            if old_asin in body:
                remaining += 1
                print(f'  WARNING: {old_asin} still in {f}')
    
    if remaining == 0:
        print('All mismatched ASINs replaced successfully!')
    else:
        print(f'{remaining} old ASINs still remaining')

if __name__ == '__main__':
    main()
