#!/usr/bin/env python3
"""
Batch regenerate articles to 1800+ words with Paul Voice Gate.
One-time pre-seed operation. NOT to be scheduled.
Uses gpt-4.1-mini via OpenAI API.
5 parallel workers, auto-fix banned words, retry up to 3 times.
Proven approach: 7 sections x 300+ words = 2100+ words target.
"""

import json
import os
import re
import sys
import time
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

# Setup
ARTICLES_DIR = Path(__file__).parent.parent / "content" / "articles"
REGEN_LIST = Path("/tmp/articles_to_regenerate.json")
LOG_FILE = Path("/tmp/regenerate_1800.log")
PROGRESS_FILE = Path("/tmp/regen_progress.json")

WORD_COUNT_MIN = 1800
WORD_COUNT_ACCEPT = 1750  # Accept on final attempt if close
MAX_ATTEMPTS = 3
WORKERS = 5

# Banned words from Paul Voice Gate
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
    "it's important to note that", "it's worth noting that",
    "in conclusion", "in summary", "a holistic approach",
    "in the realm of", "dive deep into", "at the end of the day",
    "in today's fast-paced world", "plays a crucial role"
]

# Replacement map
REPLACEMENTS = {
    'utilize': 'use', 'delve': 'explore', 'tapestry': 'fabric', 'landscape': 'field',
    'paradigm': 'model', 'synergy': 'cooperation', 'leverage': 'use',
    'unlock': 'open', 'empower': 'strengthen', 'pivotal': 'key',
    'embark': 'begin', 'underscore': 'highlight', 'paramount': 'essential',
    'seamlessly': 'smoothly', 'robust': 'strong', 'beacon': 'guide',
    'foster': 'encourage', 'elevate': 'raise', 'curate': 'select',
    'curated': 'selected', 'bespoke': 'custom', 'resonate': 'connect',
    'harness': 'use', 'intricate': 'complex', 'plethora': 'many',
    'myriad': 'many', 'groundbreaking': 'pioneering', 'innovative': 'creative',
    'cutting-edge': 'leading', 'state-of-the-art': 'modern',
    'game-changer': 'breakthrough', 'ever-evolving': 'changing',
    'rapidly-evolving': 'fast-changing', 'stakeholders': 'participants',
    'navigate': 'move through', 'ecosystem': 'environment',
    'framework': 'structure', 'comprehensive': 'thorough',
    'transformative': 'life-changing', 'holistic': 'whole-person',
    'nuanced': 'subtle', 'multifaceted': 'many-sided',
    'profound': 'deep', 'furthermore': 'also'
}

# 27 verified ASINs
ASINS = [
    {"asin": "1594774021", "title": "How to Change Your Mind by Michael Pollan", "cat": "books"},
    {"asin": "0143127748", "title": "The Psychedelic Explorer's Guide by James Fadiman", "cat": "books"},
    {"asin": "0060801719", "title": "Food of the Gods by Terence McKenna", "cat": "books"},
    {"asin": "0062429655", "title": "Stealing Fire by Steven Kotler", "cat": "books"},
    {"asin": "0451494091", "title": "A Really Good Day by Ayelet Waldman", "cat": "books"},
    {"asin": "0525510311", "title": "The Body Keeps the Score by Bessel van der Kolk", "cat": "books"},
    {"asin": "0735224153", "title": "The Molecule of More by Daniel Lieberman", "cat": "books"},
    {"asin": "1451636024", "title": "Mycelium Running by Paul Stamets", "cat": "mushrooms"},
    {"asin": "1646119266", "title": "Radical Mycology by Peter McCoy", "cat": "mushrooms"},
    {"asin": "B01MR4Y0CZ", "title": "Host Defense MyCommunity Capsules", "cat": "supplements"},
    {"asin": "B073429DV2", "title": "Host Defense Lion's Mane Capsules", "cat": "supplements"},
    {"asin": "B074TBYWGS", "title": "Four Sigmatic Lion's Mane Elixir", "cat": "supplements"},
    {"asin": "B078SZX3ML", "title": "Milligram Scale 0.001g Precision", "cat": "tools"},
    {"asin": "B08346DZN9", "title": "Mushroom Growing Kit", "cat": "growing"},
    {"asin": "B0885S1766", "title": "Real Mushrooms 5 Defenders Capsules", "cat": "supplements"},
    {"asin": "B08FR8MPCW", "title": "Meditation Cushion Zafu", "cat": "meditation"},
    {"asin": "B09VK9S4JB", "title": "Journaling Notebook Leather Bound", "cat": "integration"},
    {"asin": "B09XS7JWHH", "title": "Weighted Blanket for Anxiety", "cat": "comfort"},
    {"asin": "B0CGV7GLFL", "title": "Functional Mushroom Gummies", "cat": "supplements"},
    {"asin": "B0CHVYY8P4", "title": "Turkey Tail Mushroom Extract", "cat": "supplements"},
    {"asin": "B0CRKX1VV7", "title": "Cordyceps Mushroom Powder", "cat": "supplements"},
    {"asin": "B0D2K8N8NR", "title": "Reishi Mushroom Tincture", "cat": "supplements"},
    {"asin": "B0D5HNFKVC", "title": "Chaga Mushroom Extract Capsules", "cat": "supplements"},
    {"asin": "B0DK86ZBNJ", "title": "Adaptogenic Mushroom Blend", "cat": "supplements"},
    {"asin": "B0FPML7DJC", "title": "Eye Mask for Ceremony", "cat": "ceremony"},
    {"asin": "B0FWQQGTST", "title": "Sound Bowl for Meditation", "cat": "meditation"},
    {"asin": "B0GRTH9B7J", "title": "Mushroom Foraging Field Guide", "cat": "mushrooms"},
]

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)
# Suppress httpx noise
logging.getLogger("httpx").setLevel(logging.WARNING)


def get_client():
    from openai import OpenAI
    return OpenAI()


def count_words(html_text):
    text = re.sub(r'<[^>]+>', ' ', html_text)
    text = re.sub(r'\s+', ' ', text).strip()
    return len(text.split()) if text else 0


def auto_fix_banned(text):
    """Replace banned words and remove banned phrases."""
    for word in BANNED_WORDS:
        replacement = REPLACEMENTS.get(word, '')
        if replacement:
            pattern = re.compile(r'\b' + re.escape(word) + r'\b', re.IGNORECASE)
            text = pattern.sub(replacement, text)
    for phrase in BANNED_PHRASES:
        pattern = re.compile(re.escape(phrase), re.IGNORECASE)
        text = pattern.sub('', text)
    # Fix em-dashes
    text = text.replace('\u2014', ' - ').replace('\u2013', ' - ')
    # Clean double spaces
    text = re.sub(r'  +', ' ', text)
    return text


def select_asins_for_article(title):
    """Select 3 relevant ASINs based on article title keywords."""
    title_lower = title.lower()
    selected = []
    seen = set()
    
    # Keyword matching
    matches = [
        (['microdos', 'dose', 'dosage', 'scale', 'measure'], 'B078SZX3ML'),
        (['lion', 'cognitive', 'brain', 'memory', 'focus', 'neuro'], 'B073429DV2'),
        (['meditat', 'mindful', 'breath', 'awareness'], 'B08FR8MPCW'),
        (['journal', 'integrat', 'reflect', 'writing'], 'B09VK9S4JB'),
        (['ceremony', 'ritual', 'set and setting', 'sacred'], 'B0FPML7DJC'),
        (['grow', 'cultivat', 'mycelium', 'substrate', 'spawn'], 'B08346DZN9'),
        (['reishi', 'sleep', 'calm', 'relax', 'stress', 'anxiety'], 'B0D2K8N8NR'),
        (['cordyceps', 'energy', 'athletic', 'stamina', 'endurance'], 'B0CRKX1VV7'),
        (['turkey tail', 'immune', 'cancer', 'immunity'], 'B0CHVYY8P4'),
        (['chaga', 'antioxid', 'inflamm'], 'B0D5HNFKVC'),
        (['pollan', 'book', 'read', 'research', 'science', 'study'], '1594774021'),
        (['trauma', 'ptsd', 'body', 'somatic', 'nervous system'], '0525510311'),
        (['stamets', 'mycelium', 'fungal', 'fungi', 'mushroom'], '1451636024'),
        (['comfort', 'grounding', 'safe', 'blanket'], 'B09XS7JWHH'),
        (['sound', 'music', 'singing bowl', 'frequency'], 'B0FWQQGTST'),
        (['forag', 'identif', 'wild', 'field guide'], 'B0GRTH9B7J'),
        (['mckenna', 'history', 'ancient', 'ethnobotany'], '0060801719'),
        (['flow', 'peak', 'performance', 'optimal'], '0062429655'),
    ]
    
    for keywords, asin in matches:
        if any(kw in title_lower for kw in keywords):
            if asin not in seen:
                seen.add(asin)
                selected.append(next(a for a in ASINS if a['asin'] == asin))
    
    # Fill to 3 with contextually appropriate defaults
    fallback_order = ['0525510311', '1594774021', 'B09VK9S4JB', '0143127748', 'B073429DV2', 'B0D2K8N8NR']
    for asin in fallback_order:
        if len(selected) >= 3:
            break
        if asin not in seen:
            seen.add(asin)
            selected.append(next(a for a in ASINS if a['asin'] == asin))
    
    return selected[:3]


def build_prompt(title):
    """Build the proven 7-section prompt that reliably produces 2000+ words."""
    asins = select_asins_for_article(title)
    
    links_text = "\n".join([
        f'- <a href="https://www.amazon.com/dp/{a["asin"]}?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored">{a["title"]}</a> (paid link)'
        for a in asins
    ])
    
    return f"""Write a 2200-word article titled "{title}" for The Quiet Medicine (psychedelic therapy/mushroom wellness site).

MANDATORY LENGTH: Write EXACTLY 7 sections. Each section MUST be 300+ words (that is 2100+ words total). Count your words carefully. Do NOT write short sections.

SECTION STRUCTURE (7 sections, each 300+ words):
1. Opening hook - personal anecdote or provocative question (300+ words)
2. Core concept explanation with scientific backing (300+ words)
3. Research and evidence - cite specific studies by name (300+ words)
4. Practical application - how readers can apply this (300+ words)
5. Common challenges and how to work through them (300+ words)
6. Integration with daily life - long-term perspective (300+ words)
7. Closing reflection - NOT a summary, a new thought to sit with (300+ words)

VOICE: First person, contractions, conversational. Reference researchers by name (Griffiths, Carhart-Harris, Grof, Stamets, Fadiman, etc). Mix short punchy sentences with longer flowing ones.

BANNED WORDS (NEVER use): {', '.join(BANNED_WORDS)}

BANNED PHRASES: "it's important to note", "worth noting", "in conclusion", "in summary", "holistic approach", "in the realm of", "dive deep", "at the end of the day", "in today's fast-paced world", "plays a crucial role"

NO em-dashes (—) or en-dashes (–). Use hyphens (-) or commas.

Include these 3 Amazon links naturally woven into relevant paragraphs (not bunched together):
{links_text}

FORMAT: HTML only (<h2>, <h3>, <p>, <blockquote>). No markdown. No code fences. Start with <h2> or <p>.

REMEMBER: 7 sections x 300+ words each = 2100+ words minimum. Write LONG detailed sections."""


SYSTEM_MSG = "You are Paul, a veteran psychedelic therapy writer with 15 years of personal experience. You write in first person, conversationally, with deep knowledge of mushroom medicine, neuroscience, and integration practices. You never use corporate jargon or AI-speak. Your writing feels like a wise friend sharing hard-won wisdom. You ALWAYS write long, detailed articles - minimum 2000 words. You expand every point thoroughly with examples and evidence."


def generate_article(title, slug, client):
    """Generate a single article with retries."""
    prompt = build_prompt(title)
    
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            response = client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": SYSTEM_MSG},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=8192,
                temperature=0.85
            )
            
            body = response.choices[0].message.content.strip()
            
            # Strip markdown code fences if present
            if body.startswith("```"):
                body = re.sub(r'^```(?:html)?\n?', '', body)
                body = re.sub(r'\n?```$', '', body)
            
            # Auto-fix banned words/phrases and em-dashes
            body = auto_fix_banned(body)
            
            # Check word count
            wc = count_words(body)
            if wc < WORD_COUNT_MIN:
                if attempt < MAX_ATTEMPTS:
                    logger.warning(f"  Attempt {attempt}: {slug} = {wc}w (need {WORD_COUNT_MIN}+), retrying...")
                    continue
                elif wc >= WORD_COUNT_ACCEPT:
                    logger.warning(f"  Accepting {slug} at {wc}w on final attempt")
                else:
                    return None, f"Only {wc} words after {MAX_ATTEMPTS} attempts"
            
            # Verify Amazon links
            amazon_count = len(re.findall(r'amazon\.com/dp/[A-Z0-9]{10}', body))
            if amazon_count < 3:
                logger.warning(f"  {slug}: {amazon_count} Amazon links (want 3)")
            
            return body, None
            
        except Exception as e:
            logger.error(f"  Attempt {attempt} error for {slug}: {e}")
            if attempt < MAX_ATTEMPTS:
                time.sleep(2 ** attempt)
            else:
                return None, str(e)
    
    return None, "Max attempts reached"


def process_article(article_info, client):
    """Process a single article: regenerate body, update JSON."""
    slug = article_info['slug']
    title = article_info['title']
    filename = article_info['file']
    
    filepath = ARTICLES_DIR / filename
    
    # Read existing article
    with open(filepath) as f:
        data = json.load(f)
    
    # Generate new body
    body, error = generate_article(title, slug, client)
    
    if error:
        return {'slug': slug, 'status': 'failed', 'error': error, 'words': 0}
    
    # Update article
    data['body'] = body
    wc = count_words(body)
    data['wordCount'] = wc
    
    # Write back
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    return {'slug': slug, 'status': 'success', 'words': wc}


def main():
    # Load articles to regenerate
    with open(REGEN_LIST) as f:
        articles = json.load(f)
    
    logger.info(f"=" * 60)
    logger.info(f"REGENERATION: {len(articles)} articles at 1800+ words")
    logger.info(f"Workers: {WORKERS}, Model: gpt-4.1-mini, Min: {WORD_COUNT_MIN}w")
    logger.info(f"=" * 60)
    
    # Load progress if resuming
    completed = set()
    failed_list = []
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE) as f:
            progress = json.load(f)
        completed = set(progress.get('completed', []))
        failed_list = progress.get('failed_list', [])
        logger.info(f"Resuming: {len(completed)} already completed, {len(failed_list)} failed")
    
    # Filter out already completed
    remaining = [a for a in articles if a['slug'] not in completed]
    logger.info(f"Remaining to process: {len(remaining)}")
    
    if not remaining:
        logger.info("All articles already regenerated!")
        return
    
    client = get_client()
    
    success_count = len(completed)
    fail_count = len(failed_list)
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futures = {
            executor.submit(process_article, article, client): article
            for article in remaining
        }
        
        for future in as_completed(futures):
            article = futures[future]
            try:
                result = future.result()
                if result['status'] == 'success':
                    success_count += 1
                    completed.add(result['slug'])
                    elapsed = time.time() - start_time
                    rate = success_count / (elapsed / 60) if elapsed > 0 else 0
                    eta = (len(articles) - success_count) / rate if rate > 0 else 0
                    logger.info(f"[{success_count}/{len(articles)}] {result['slug']}: {result['words']}w | {rate:.1f}/min | ETA {eta:.0f}min")
                else:
                    fail_count += 1
                    failed_list.append({'slug': result['slug'], 'error': result.get('error', '')})
                    logger.error(f"[FAIL {fail_count}] {result['slug']}: {result.get('error', 'unknown')}")
            except Exception as e:
                fail_count += 1
                failed_list.append({'slug': article['slug'], 'error': str(e)})
                logger.error(f"[EXCEPTION] {article['slug']}: {e}")
            
            # Save progress every 5 articles
            if (success_count + fail_count) % 5 == 0:
                with open(PROGRESS_FILE, 'w') as f:
                    json.dump({
                        'completed': list(completed),
                        'failed_list': failed_list,
                        'success_count': success_count,
                        'fail_count': fail_count,
                        'elapsed_min': (time.time() - start_time) / 60
                    }, f)
    
    elapsed = time.time() - start_time
    logger.info(f"\n{'=' * 60}")
    logger.info(f"COMPLETE: {success_count} success, {fail_count} failed")
    logger.info(f"Time: {elapsed/60:.1f} minutes ({elapsed/3600:.1f} hours)")
    logger.info(f"{'=' * 60}")
    
    # Final progress save
    with open(PROGRESS_FILE, 'w') as f:
        json.dump({
            'completed': list(completed),
            'failed_list': failed_list,
            'success_count': success_count,
            'fail_count': fail_count,
            'elapsed_min': elapsed / 60
        }, f)
    
    if failed_list:
        logger.info(f"\nFailed articles:")
        for item in failed_list:
            logger.info(f"  - {item['slug']}: {item['error']}")


if __name__ == "__main__":
    main()
