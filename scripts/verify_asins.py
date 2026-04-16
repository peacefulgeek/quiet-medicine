#!/usr/bin/env python3
"""Verify all Amazon ASINs by checking their product pages."""

import requests
import time
import json

ASINS = [
    ('B09KGJHYRL', 'integration journal', 144),
    ('B0BN2KZYRQ', 'guided meditation journal', 100),
    ('0062515675', 'Stealing Fire', 82),
    ('0593473396', 'How to Change Your Mind', 79),
    ('B07WDFT2XC', 'comfort blanket for therapy sessions', 61),
    ('B08BKWN3X5', 'meditation cushion', 58),
    ('1946764531', 'A Really Good Day by Ayelet Waldman', 57),
    ('B0C1H1J3K5', 'precision milligram scale', 56),
    ('B07PXLF6KS', 'essential oil set / aromatherapy diffuser', 31),
    ('0399178570', "The Psychedelic Explorer's Guide", 26),
    ('1623174023', 'The Body Keeps the Score', 25),
    ('B09HGDKFNP', 'acupressure mat', 24),
    ('B0C8JK2MNP', 'therapy notebook', 20),
    ('B0C5KJ8NHQ', 'beeswax candle set', 20),
    ('B0BXQMHGKK', 'mushroom growing kit', 19),
    ('B0BH4JH1YK', 'meditation timer', 19),
    ('B07D7P7WCH', 'noise-canceling headphones', 17),
    ('B08DFCWVZ4', 'weighted blanket', 17),
    ('B07YJLHVTM', 'fasting timer', 15),
    ('B0BN2KZXMV', 'blue light blocking glasses', 14),
    ('B09V5KZYRQ', 'adaptogenic mushroom blend', 9),
    ('B09DFGH123', 'eye mask for meditation', 6),
    ('0062883682', 'Entangled Life', 3),
    ('B0B5F9SZW7', 'smart water bottle', 2),
    ('B0B9HZ1599', 'Precision Milligram Scale', 1),
    ('B076GPJXWZ', 'How to Change Your Mind (alt)', 1),
    ('B005OSSI6C', "The Psychedelic Explorer's Guide (alt)", 1),
    ('B00G3L1C2K', 'The Body Keeps the Score (alt)', 1),
    ('B000SEWWQW', 'The Doors of Perception', 1),
    ('B0082B3Q3E', 'Waking Up by Sam Harris', 1),
    ('B0BDHQK6FJ', 'HRV monitor', 1),
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

results = []

for asin, name, count in ASINS:
    url = f'https://www.amazon.com/dp/{asin}'
    try:
        resp = requests.get(url, headers=headers, timeout=15, allow_redirects=True)
        status = resp.status_code
        # Check for dog page (404)
        is_dog = 'Sorry, we couldn' in resp.text or 'looking for something' in resp.text or 'Page Not Found' in resp.text
        # Check for valid product
        has_title = 'id="productTitle"' in resp.text or 'id="title"' in resp.text or 'a-size-large product-title' in resp.text
        has_price = '$' in resp.text[:50000]
        
        if status == 200 and not is_dog and (has_title or has_price):
            verdict = 'OK'
        elif status == 200 and is_dog:
            verdict = '404-DOG'
        elif status == 200:
            # Could be captcha or redirect
            if 'captcha' in resp.text.lower() or 'robot' in resp.text.lower():
                verdict = 'CAPTCHA'
            elif 'ref=dp_ob_' in resp.url or '/dp/' in resp.url:
                verdict = 'LIKELY-OK'
            else:
                verdict = 'UNKNOWN'
        else:
            verdict = f'HTTP-{status}'
        
        results.append((asin, name, count, verdict, resp.url))
        print(f'  {verdict:12s} | {asin} | {count:3d}x | {name}')
        
    except Exception as e:
        results.append((asin, name, count, f'ERROR', str(e)))
        print(f'  {"ERROR":12s} | {asin} | {count:3d}x | {name} | {e}')
    
    time.sleep(1.5)  # Rate limit

# Save results
with open('/home/ubuntu/quiet-medicine/asin_verification.json', 'w') as f:
    json.dump(results, f, indent=2)

print('\n' + '=' * 60)
ok = sum(1 for r in results if r[3] in ('OK', 'LIKELY-OK'))
bad = [r for r in results if r[3] not in ('OK', 'LIKELY-OK', 'CAPTCHA')]
captcha = sum(1 for r in results if r[3] == 'CAPTCHA')
print(f'Verified OK: {ok}/{len(results)}')
print(f'CAPTCHA (need browser check): {captcha}')
print(f'Broken/404: {len(bad)}')
if bad:
    print('\nBROKEN ASINs:')
    for asin, name, count, verdict, url in bad:
        print(f'  {asin} ({name}) - {verdict} - used {count}x')
