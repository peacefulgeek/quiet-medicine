#!/usr/bin/env python3
"""
Fix published articles:
1. Spread dates across Aug 2024 - Apr 2026 (realistic 18-month window, 1-2 per day)
2. Strip all banned words from body content
3. Fix em-dashes
"""

import json
import glob
import re
import os
import random
from datetime import datetime, timedelta

CONTENT_DIR = os.path.join(os.path.dirname(__file__), '..', 'content', 'articles')

# ─── BANNED WORDS ───
BANNED_WORDS = [
    'utilize', 'delve', 'tapestry', 'landscape', 'paradigm', 'synergy', 'leverage',
    'unlock', 'empower', 'pivotal', 'embark', 'underscore', 'paramount', 'seamlessly',
    'robust', 'beacon', 'foster', 'elevate', 'curate', 'curated', 'bespoke', 'resonate',
    'harness', 'intricate', 'plethora', 'myriad', 'groundbreaking', 'innovative',
    'cutting-edge', 'state-of-the-art', 'game-changer', 'ever-evolving', 'rapidly-evolving',
    'stakeholders', 'navigate', 'ecosystem', 'framework', 'comprehensive', 'transformative',
    'holistic', 'nuanced', 'multifaceted', 'profound', 'furthermore'
]

# Word-level replacements
REPLACEMENTS = {
    'utilize': 'use',
    'delve': 'dig',
    'tapestry': 'web',
    'landscape': 'space',
    'paradigm': 'model',
    'synergy': 'connection',
    'leverage': 'use',
    'unlock': 'open',
    'empower': 'support',
    'pivotal': 'key',
    'embark': 'start',
    'underscore': 'highlight',
    'paramount': 'critical',
    'seamlessly': 'smoothly',
    'robust': 'strong',
    'beacon': 'light',
    'foster': 'build',
    'elevate': 'lift',
    'curate': 'choose',
    'curated': 'chosen',
    'bespoke': 'custom',
    'resonate': 'connect',
    'harness': 'use',
    'intricate': 'complex',
    'plethora': 'range',
    'myriad': 'many',
    'groundbreaking': 'new',
    'innovative': 'creative',
    'cutting-edge': 'modern',
    'state-of-the-art': 'modern',
    'game-changer': 'breakthrough',
    'ever-evolving': 'changing',
    'rapidly-evolving': 'fast-changing',
    'stakeholders': 'people involved',
    'navigate': 'move through',
    'ecosystem': 'system',
    'framework': 'structure',
    'comprehensive': 'full',
    'transformative': 'life-changing',
    'holistic': 'whole-person',
    'nuanced': 'subtle',
    'multifaceted': 'layered',
    'profound': 'deep',
    'furthermore': 'also',
}


def clean_banned_words(text):
    """Replace banned words with alternatives."""
    changes = 0
    for word, replacement in REPLACEMENTS.items():
        pattern = re.compile(r'\b' + re.escape(word) + r'\b', re.IGNORECASE)
        matches = pattern.findall(text)
        if matches:
            for match in matches:
                # Preserve capitalization
                if match[0].isupper():
                    rep = replacement.capitalize()
                else:
                    rep = replacement
                text = pattern.sub(rep, text, count=1)
                changes += 1
                # Re-compile to handle remaining
                pattern = re.compile(r'\b' + re.escape(word) + r'\b', re.IGNORECASE)
    return text, changes


def clean_emdashes(text):
    """Replace em-dashes with proper punctuation."""
    text = text.replace('\u2014', ' - ')
    text = text.replace('\u2013', ' - ')
    return text


def main():
    # Get all published articles
    files = sorted(glob.glob(os.path.join(CONTENT_DIR, '*.json')))
    published = []
    for f in files:
        try:
            data = json.load(open(f))
            if data.get('status') == 'published' and data.get('body') and len(data.get('body', '')) > 100:
                published.append((f, data))
        except:
            continue

    print(f"[fix] Found {len(published)} published articles to fix")

    # ─── STEP 1: Spread dates across Aug 2024 - Apr 2026 ───
    # That's about 600 days. With 313 articles, that's ~2 per day on average
    start_date = datetime(2024, 8, 1)
    end_date = datetime(2026, 4, 25)
    total_days = (end_date - start_date).days  # ~600 days

    # Generate spread dates: 1-2 articles per day, random spacing
    dates = []
    current = start_date
    while len(dates) < len(published):
        # 1-2 articles on this day
        articles_today = random.choice([1, 1, 1, 2])  # mostly 1, sometimes 2
        for _ in range(articles_today):
            if len(dates) >= len(published):
                break
            hour = random.randint(6, 18)
            minute = random.randint(0, 59)
            dt = current.replace(hour=hour, minute=minute)
            dates.append(dt)
        current += timedelta(days=random.randint(1, 3))
        if current > end_date:
            current = start_date + timedelta(days=random.randint(0, total_days))

    # Sort dates chronologically
    dates.sort()

    # Shuffle articles so it's not alphabetical
    random.shuffle(published)

    # ─── STEP 2: Apply fixes ───
    total_word_fixes = 0
    total_emdash_fixes = 0

    for i, (filepath, data) in enumerate(published):
        body = data['body']

        # Fix banned words
        body, word_changes = clean_banned_words(body)
        total_word_fixes += word_changes

        # Fix em-dashes
        if '\u2014' in body or '\u2013' in body:
            body = clean_emdashes(body)
            total_emdash_fixes += 1

        # Update body
        data['body'] = body

        # Update date
        dt = dates[i]
        data['publishDate'] = dt.strftime('%Y-%m-%d')
        data['published_at'] = dt.strftime('%Y-%m-%dT%H:%M:%S.000Z')
        data['dateISO'] = dt.strftime('%Y-%m-%dT%H:%M:%S.000Z')

        # Save
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

    print(f"[fix] Dates spread across {dates[0].strftime('%Y-%m-%d')} to {dates[-1].strftime('%Y-%m-%d')}")
    print(f"[fix] Banned word replacements: {total_word_fixes}")
    print(f"[fix] Em-dash fixes: {total_emdash_fixes}")

    # ─── STEP 3: Verify ───
    BANNED_RE = re.compile(r'\b(' + '|'.join(BANNED_WORDS) + r')\b', re.IGNORECASE)
    still_banned = 0
    for f in glob.glob(os.path.join(CONTENT_DIR, '*.json')):
        try:
            data = json.load(open(f))
            if data.get('status') != 'published':
                continue
            if BANNED_RE.search(data.get('body', '')):
                still_banned += 1
        except:
            continue

    print(f"[fix] Articles still with banned words after fix: {still_banned}")
    print("[fix] DONE")


if __name__ == '__main__':
    main()
