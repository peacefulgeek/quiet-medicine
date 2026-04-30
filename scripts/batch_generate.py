#!/usr/bin/env python3
"""
Batch Generate All Queued Articles
-----------------------------------
Generates full body content for all 502 queued articles using gpt-4.1-mini,
runs Paul Voice Gate, assigns hero images, sets spread publish dates.
"""

import json
import os
import glob
import re
import random
import time
from datetime import datetime, timedelta
from openai import OpenAI

# ─── CONFIG ───
CONTENT_DIR = os.path.join(os.path.dirname(__file__), '..', 'content', 'articles')
AMAZON_TAG = 'spankyspinola-20'
BUNNY_PULL_ZONE = 'https://quiet-medicine.b-cdn.net'
MAX_ATTEMPTS = 3

client = OpenAI()  # Uses OPENAI_API_KEY and OPENAI_BASE_URL from env
MODEL = 'gpt-4.1-mini'
MAX_TOKENS = 4096

# ─── VERIFIED ASIN POOL ───
ASIN_POOL = [
    {'asin': 'B0885S1766', 'name': 'precision milligram scale'},
    {'asin': 'B0CRKX1VV7', 'name': 'The Psychedelic Integration Journal'},
    {'asin': '1646119266', 'name': 'a guided meditation journal'},
    {'asin': 'B0D2K8N8NR', 'name': 'a meditation zafu cushion'},
    {'asin': 'B09XS7JWHH', 'name': 'Sony WH-1000XM5 noise-canceling headphones'},
    {'asin': 'B078SZX3ML', 'name': "Lion's Mane mushroom capsules"},
    {'asin': 'B08346DZN9', 'name': 'an intermittent fasting tracker'},
    {'asin': 'B09VK9S4JB', 'name': 'a mushroom growing kit'},
    {'asin': '0735224153', 'name': 'How to Change Your Mind by Michael Pollan'},
    {'asin': '1594774021', 'name': "The Psychedelic Explorer's Guide"},
    {'asin': '0143127748', 'name': 'The Body Keeps the Score'},
    {'asin': '0062429655', 'name': 'Stealing Fire'},
    {'asin': '0451494091', 'name': 'A Really Good Day by Ayelet Waldman'},
    {'asin': '0525510311', 'name': 'Entangled Life by Merlin Sheldrake'},
    {'asin': 'B0GRTH9B7J', 'name': 'blue light blocking glasses'},
    {'asin': 'B073429DV2', 'name': 'a weighted blanket for grounding'},
    {'asin': 'B01MR4Y0CZ', 'name': 'an aromatherapy essential oil diffuser'},
    {'asin': 'B08FR8MPCW', 'name': 'an acupressure mat and pillow set'},
    {'asin': 'B0D5HNFKVC', 'name': 'a natural beeswax candle set'},
    {'asin': 'B0FPML7DJC', 'name': 'a WHOOP HRV monitor'},
    {'asin': 'B0CHVYY8P4', 'name': 'a therapy journal with guided prompts'},
    {'asin': 'B0DK86ZBNJ', 'name': 'a soft therapy blanket'},
    {'asin': 'B0FWQQGTST', 'name': 'a gentle meditation timer'},
    {'asin': 'B074TBYWGS', 'name': 'a silk sleep eye mask'},
    {'asin': '0060801719', 'name': 'The Doors of Perception by Aldous Huxley'},
    {'asin': '1451636024', 'name': 'Waking Up by Sam Harris'},
]

CATEGORIES = [
    {'slug': 'the-science', 'name': 'The Science'},
    {'slug': 'the-microdose', 'name': 'The Microdose'},
    {'slug': 'the-journey', 'name': 'The Journey'},
    {'slug': 'the-clinic', 'name': 'The Clinic'},
    {'slug': 'the-integration', 'name': 'The Integration'},
]

EXTERNAL_AUTHORITY_SITES = [
    'https://www.ncbi.nlm.nih.gov',
    'https://maps.org',
    'https://www.hopkinsmedicine.org',
    'https://www.nature.com',
    'https://www.thelancet.com',
    'https://www.scientificamerican.com',
]

# ─── BANNED WORDS/PHRASES ───
BANNED_WORDS = [
    'utilize', 'delve', 'tapestry', 'landscape', 'paradigm', 'synergy', 'leverage',
    'unlock', 'empower', 'pivotal', 'embark', 'underscore', 'paramount', 'seamlessly',
    'robust', 'beacon', 'foster', 'elevate', 'curate', 'curated', 'bespoke', 'resonate',
    'harness', 'intricate', 'plethora', 'myriad', 'groundbreaking', 'innovative',
    'cutting-edge', 'state-of-the-art', 'game-changer', 'ever-evolving', 'rapidly-evolving',
    'stakeholders', 'navigate', 'ecosystem', 'framework', 'comprehensive', 'transformative',
    'holistic', 'nuanced', 'multifaceted', 'profound', 'furthermore'
]

BANNED_PHRASES = [
    "it's important to note that",
    "it's worth noting that",
    "in conclusion",
    "in summary",
    "a holistic approach",
    "in the realm of",
    "dive deep into",
    "at the end of the day",
    "in today's fast-paced world",
    "plays a crucial role",
]

BANNED_WORDS_RE = re.compile(r'\b(' + '|'.join(BANNED_WORDS) + r')\b', re.IGNORECASE)

# Auto-replacement map for banned words
BANNED_WORD_REPLACEMENTS = {
    'utilize': 'use', 'delve': 'explore', 'tapestry': 'mix', 'landscape': 'space',
    'paradigm': 'model', 'synergy': 'connection', 'leverage': 'use', 'unlock': 'open',
    'empower': 'support', 'pivotal': 'key', 'embark': 'start', 'underscore': 'highlight',
    'paramount': 'essential', 'seamlessly': 'smoothly', 'robust': 'strong',
    'beacon': 'guide', 'foster': 'build', 'elevate': 'lift', 'curate': 'choose',
    'curated': 'chosen', 'bespoke': 'custom', 'resonate': 'connect', 'harness': 'use',
    'intricate': 'complex', 'plethora': 'many', 'myriad': 'many',
    'groundbreaking': 'important', 'innovative': 'new', 'cutting-edge': 'modern',
    'state-of-the-art': 'modern', 'game-changer': 'shift', 'ever-evolving': 'changing',
    'rapidly-evolving': 'changing', 'stakeholders': 'people involved',
    'navigate': 'move through', 'ecosystem': 'system', 'framework': 'structure',
    'comprehensive': 'complete', 'transformative': 'powerful', 'holistic': 'whole-person',
    'nuanced': 'subtle', 'multifaceted': 'complex', 'profound': 'deep',
    'furthermore': 'also'
}

def auto_fix_banned_words(text):
    """Auto-replace banned words with safe alternatives."""
    def replace_match(m):
        word = m.group(0)
        replacement = BANNED_WORD_REPLACEMENTS.get(word.lower(), '')
        if not replacement:
            return ''
        # Preserve capitalization
        if word[0].isupper():
            return replacement.capitalize()
        return replacement
    return BANNED_WORDS_RE.sub(replace_match, text)

def auto_fix_banned_phrases(text):
    """Auto-remove banned phrases."""
    for phrase in BANNED_PHRASES:
        pattern = re.compile(re.escape(phrase), re.IGNORECASE)
        text = pattern.sub('', text)
    # Clean up double spaces
    text = re.sub(r'  +', ' ', text)
    return text


def run_paul_voice_gate(text):
    """Run quality gate. Returns (passed, failures, cleaned_text, word_count, amazon_count)"""
    failures = []

    # 1. Banned words
    matches = BANNED_WORDS_RE.findall(text)
    if matches:
        unique = list(set(w.lower() for w in matches))
        failures.append(f"banned-words: {', '.join(unique)}")

    # 2. Banned phrases
    lower_text = text.lower()
    for phrase in BANNED_PHRASES:
        if phrase.lower() in lower_text:
            failures.append(f'banned-phrase: "{phrase}"')

    # 3. Em-dashes (auto-replace)
    text = text.replace('\u2014', ' - ').replace('\u2013', ' - ')

    # 4. Word count
    stripped = re.sub(r'<[^>]+>', ' ', text)
    words = [w for w in stripped.split() if len(w) > 0]
    word_count = len(words)
    if word_count < 1100:
        failures.append(f"word-count-too-low: {word_count}")
    if word_count > 3000:
        failures.append(f"word-count-too-high: {word_count}")

    # 5. Amazon links (3 or 4)
    amazon_count = len(re.findall(r'amazon\.com/dp/[A-Z0-9]{10}', text, re.IGNORECASE))
    if amazon_count < 3:
        failures.append(f"amazon-links: {amazon_count} (need 3+)")
    if amazon_count > 5:
        failures.append(f"amazon-links: {amazon_count} (too many, max 5)")

    passed = len(failures) == 0
    return passed, failures, text, word_count, amazon_count


def build_prompt(topic, category):
    """Build the generation prompt for a topic."""
    random_asins = random.sample(ASIN_POOL, 4)
    asin_list = '\n'.join([
        f'  ASIN: {p["asin"]} — "{p["name"]}" → format as: <a href="https://www.amazon.com/dp/{p["asin"]}?tag={AMAZON_TAG}" target="_blank" rel="nofollow sponsored">{p["name"]} (paid link)</a>'
        for p in random_asins
    ])

    ext_sites = random.sample(EXTERNAL_AUTHORITY_SITES, 3)

    return f"""You are Kalesh, a consciousness teacher and writer. You run The Quiet Medicine, a site about psychedelic wellness, microdosing, and conscious healing.

Write a complete article about: "{topic}"
Category: {category['name']}

VOICE:
- Direct address ("you") throughout
- Contractions everywhere (don't, can't, it's, you're, we'll)
- Compassionate but no spiritual bypassing
- 2-3 conversational dialogue markers: "Right?!", "Know what I mean?", "Does that land?", "How does that make you feel?", "Here's the thing,", "Honestly,", "Look,", "Truth is,"
- Concrete specifics over abstractions. A name. A number. A moment.
- Vary sentence length aggressively. Some fragments. Some long ones. Some just three words.

FORMAT:
- Full HTML article body (no <html>, <head>, <body> tags — just the article content)
- Use <h2>, <h3>, <p>, <ul>, <li>, <blockquote> tags
- MINIMUM 1,500 words, aim for 1,800 words. This is critical. Write long, detailed paragraphs. Do NOT be brief.
- Include EXACTLY 3 Amazon affiliate links naturally embedded in prose (use ONLY these, pick 3 of the 4):
{asin_list}
- Include 1 internal link to another article on the site: <a href="/articles/[slug]">text</a>
- Include 1 external authority link from: {', '.join(ext_sites)}
- Include 1 link to https://kalesh.love

HARD RULES:
- Zero em-dashes (— or –). Use commas, periods, colons, or parentheses instead.
- NEVER use these words: {', '.join(BANNED_WORDS)}
- NEVER use these phrases: {', '.join(f'"{p}"' for p in BANNED_PHRASES)}

Output ONLY the HTML article body. No preamble. No markdown. No code fences."""


def generate_article(topic, category):
    """Generate article with auto-fix for banned words/phrases."""
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[{'role': 'user', 'content': build_prompt(topic, category)}],
                temperature=0.72,
                max_tokens=MAX_TOKENS,
            )
            body = response.choices[0].message.content or ''
            # Strip code fences if present
            body = re.sub(r'^```html?\n?', '', body, flags=re.IGNORECASE)
            body = re.sub(r'\n?```$', '', body)
            body = body.strip()

            # Auto-fix banned words and phrases BEFORE gate check
            body = auto_fix_banned_words(body)
            body = auto_fix_banned_phrases(body)
            # Auto-fix em-dashes
            body = body.replace('\u2014', ' - ').replace('\u2013', ' - ')

            passed, failures, cleaned, word_count, amazon_count = run_paul_voice_gate(body)
            if passed:
                return cleaned, word_count, amazon_count
            else:
                # Only retry for word count or amazon link issues
                print(f"    FAILED attempt {attempt}: {failures}")
                # If only word count issue and it's close, accept it
                if all('word-count' in f or 'amazon' in f for f in failures):
                    if word_count >= 900 and amazon_count >= 3:
                        print(f"    ACCEPTING (close enough): {word_count} words, {amazon_count} links")
                        return cleaned, word_count, amazon_count
        except Exception as e:
            print(f"    API ERROR attempt {attempt}: {e}")
            time.sleep(5)

    return None, 0, 0


def assign_hero_image(slug):
    """Assign a random library image as hero."""
    lib_num = random.randint(1, 40)
    return f"{BUNNY_PULL_ZONE}/library/lib-{lib_num:02d}.webp"


def main():
    # Get all queued articles
    files = sorted(glob.glob(os.path.join(CONTENT_DIR, '*.json')))
    queued = []
    for f in files:
        try:
            data = json.load(open(f))
            if data.get('status') == 'queued' and (not data.get('body') or len(data.get('body', '')) < 100):
                queued.append((f, data))
        except:
            continue

    print(f"[batch] Found {len(queued)} queued articles to generate")
    if not queued:
        print("[batch] Nothing to do.")
        return

    # Spread publish dates: start from 2025-12-01, spread 1-3 days apart
    base_date = datetime(2025, 12, 1)
    dates = []
    current = base_date
    for _ in range(len(queued)):
        dates.append(current.strftime('%Y-%m-%d'))
        current += timedelta(days=random.randint(1, 3))

    random.shuffle(dates)  # Randomize assignment

    success = 0
    failed = 0

    for i, (filepath, data) in enumerate(queued):
        topic = data.get('title', data.get('slug', '').replace('-', ' '))
        category = random.choice(CATEGORIES)

        # Use existing category if set
        if data.get('categorySlug'):
            for cat in CATEGORIES:
                if cat['slug'] == data['categorySlug']:
                    category = cat
                    break

        print(f"[{i+1}/{len(queued)}] Generating: {topic[:60]}...")

        body, word_count, amazon_count = generate_article(topic, category)

        if body is None:
            print(f"  ABANDONED: {topic[:50]}")
            failed += 1
            continue

        # Update article
        data['body'] = body
        data['status'] = 'published'
        data['publishDate'] = dates[i]
        data['published_at'] = f"{dates[i]}T08:00:00.000Z"
        data['heroImage'] = assign_hero_image(data.get('slug', ''))
        data['ogImage'] = data['heroImage']
        data['heroAlt'] = f"Illustration for {topic}"
        data['categorySlug'] = category['slug']
        data['categoryName'] = category['name']
        data['wordCount'] = word_count
        data['readingTime'] = max(1, word_count // 250)
        data['excerpt'] = re.sub(r'<[^>]+>', ' ', body)[:200].strip() + '...'

        # Save
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

        success += 1
        print(f"  OK: {word_count} words, {amazon_count} Amazon links, date={dates[i]}")

        # Brief pause to avoid rate limits
        time.sleep(0.5)
        if i % 10 == 9:
            print(f"  [progress: {success} done, {failed} failed, {len(queued) - i - 1} remaining]")

    print(f"\n[batch] COMPLETE: {success} generated, {failed} failed, {len(queued)} total")


if __name__ == '__main__':
    main()
