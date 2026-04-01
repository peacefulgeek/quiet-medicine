#!/usr/bin/env python3
"""Generate 3 product spotlight articles for The Quiet Medicine."""

import json, os, asyncio
from openai import OpenAI

client = OpenAI()
CONTENT_DIR = '/home/ubuntu/quiet-medicine/content/articles'
AMAZON_TAG = 'spankyspinola-20'

SPOTLIGHTS = [
    {
        'slug': 'best-milligram-scales-microdosing',
        'title': 'The Best Milligram Scales for Microdosing: A Practical Guide',
        'category': 'the-microdose',
        'products': [
            {'name': 'Precision Milligram Scale', 'asin': 'B0B9HZ1599', 'price': '$12.99'},
            {'name': 'Capsule Filling Machine', 'asin': 'B07RXYNT9N', 'price': '$24.99'},
            {'name': 'Size 00 Vegetarian Capsules', 'asin': 'B09NBCNHXP', 'price': '$8.99'},
        ],
        'prompt': 'Write a 2500-word product spotlight article about choosing the right milligram scale for microdosing. Cover why precision matters (0.001g accuracy), how to calibrate, common mistakes, and how capsule filling machines complement the process. Include practical tips from someone who has used these tools extensively. Weave in the science of dose-response curves and why consistency matters for microdosing protocols.'
    },
    {
        'slug': 'essential-books-psychedelic-journey',
        'title': 'Five Essential Books Before Your First Psychedelic Journey',
        'category': 'the-journey',
        'products': [
            {'name': 'How to Change Your Mind by Michael Pollan', 'asin': 'B076GPJXWZ', 'price': '$14.99'},
            {'name': "The Psychedelic Explorer's Guide by James Fadiman", 'asin': 'B005OSSI6C', 'price': '$13.99'},
            {'name': 'The Body Keeps the Score by Bessel van der Kolk', 'asin': 'B00G3L1C2K', 'price': '$11.99'},
            {'name': 'Waking Up by Sam Harris', 'asin': 'B00GEEB9YC', 'price': '$13.99'},
            {'name': 'Stealing Fire by Kotler & Wheal', 'asin': 'B01HNJIJB2', 'price': '$15.99'},
        ],
        'prompt': 'Write a 2500-word product spotlight article recommending five essential books to read before a first psychedelic experience. For each book, explain what it offers, who it is best for, and how it prepares the reader. Include personal reflections on how each book shaped your own understanding. Discuss the importance of intellectual preparation alongside set and setting.'
    },
    {
        'slug': 'stamets-stack-complete-guide-supplements',
        'title': 'The Stamets Stack: A Complete Guide to the Supplements You Need',
        'category': 'the-microdose',
        'products': [
            {'name': "Lion's Mane Mushroom Capsules", 'asin': 'B078SZX3ML', 'price': '$23.95'},
            {'name': 'Niacin (Vitamin B3) 500mg', 'asin': 'B00068TJIG', 'price': '$9.99'},
            {'name': 'Precision Milligram Scale', 'asin': 'B0B9HZ1599', 'price': '$12.99'},
            {'name': 'Amber Glass Storage Jars', 'asin': 'B07Y2KSFNJ', 'price': '$13.99'},
        ],
        'prompt': "Write a 2500-word product spotlight article about Paul Stamets' microdosing stack (psilocybin + lion's mane + niacin). Explain the science behind each component, the proposed synergistic mechanism, recommended dosing protocols, and what to look for in quality supplements. Include practical guidance on sourcing, storage, and cycling. Reference Stamets' research and public talks."
    },
]

def generate_article(spotlight):
    system_prompt = """You are Kalesh, a consciousness teacher and writer. Your voice is warm, direct, grounded in lived experience, and informed by both ancient contemplative traditions and modern neuroscience. You write in long, flowing paragraphs — never bullet points. You use metaphor from nature, the body, and daily life. You reference researchers by name. You never use the phrases "This is where", "lean into", "hold space", "manifest", or "sacred journey". Your conclusions are either a gentle challenge or a tender closing. This is a product spotlight article — you are recommending specific tools you have personally used and trust. Include Amazon affiliate links naturally within the text."""

    product_links = '\n'.join([
        f'- {p["name"]}: https://www.amazon.com/dp/{p["asin"]}?tag={AMAZON_TAG} (price: {p["price"]}) — use rel="nofollow sponsored" and include "(paid link)" after the link text'
        for p in spotlight['products']
    ])

    user_prompt = f"""{spotlight['prompt']}

Title: {spotlight['title']}

Products to feature (include these as HTML links in the article body):
{product_links}

Format the article as HTML with proper <h2>, <h3>, <p>, <blockquote> tags. Do NOT include <html>, <head>, or <body> tags — just the article body content. Start with the first paragraph (no title tag). Include 2-3 FAQs at the end in <h3> format. End with a reflective conclusion. Target 2500 words."""

    response = client.chat.completions.create(
        model='gpt-4.1-mini',
        messages=[
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_prompt}
        ],
        max_tokens=8000,
        temperature=0.8,
    )
    return response.choices[0].message.content

for spotlight in SPOTLIGHTS:
    print(f"Generating: {spotlight['title']}...")
    body = generate_article(spotlight)
    
    # Clean up any markdown code fences
    body = body.replace('```html', '').replace('```', '').strip()
    
    article = {
        'slug': spotlight['slug'],
        'title': spotlight['title'],
        'category': spotlight['category'],
        'body': body,
        'publishDate': '2026-04-01T12:00:00Z',
        'status': 'published',
        'isSpotlight': True,
        'linkType': 'amazon',
        'openerType': 'first-person',
        'conclusionType': 'tender',
        'heroPrompt': f"Product photography style image related to {spotlight['title']}",
    }
    
    path = os.path.join(CONTENT_DIR, f"{spotlight['slug']}.json")
    with open(path, 'w') as f:
        json.dump(article, f, indent=2)
    print(f"  Saved: {path}")

print("\nDone! 3 product spotlight articles generated.")
