#!/usr/bin/env python3
"""
AI-Flagged Word & Phrase Cleanup
─────────────────────────────────
Scans all 303 articles for AI-flagged words and phrases from the quality gate,
then replaces them with natural alternatives. Also removes em-dashes.
"""

import json, os, re, random

CONTENT_DIR = 'content/articles'

# Full AI-flagged word list from quality gate
AI_FLAGGED_WORDS = [
    'delve', 'tapestry', 'paradigm', 'synergy', 'leverage', 'unlock', 'empower',
    'utilize', 'pivotal', 'embark', 'underscore', 'paramount', 'seamlessly',
    'robust', 'beacon', 'foster', 'elevate', 'curate', 'curated', 'bespoke',
    'resonate', 'harness', 'intricate', 'plethora', 'myriad', 'comprehensive',
    'transformative', 'groundbreaking', 'innovative', 'cutting-edge', 'revolutionary',
    'state-of-the-art', 'ever-evolving', 'game-changing', 'next-level', 'world-class',
    'unparalleled', 'unprecedented', 'remarkable', 'extraordinary', 'exceptional',
    'profound', 'holistic', 'nuanced', 'multifaceted', 'stakeholders',
    'ecosystem', 'landscape', 'realm', 'sphere', 'domain',
    'arguably', 'notably', 'crucially', 'importantly', 'essentially',
    'fundamentally', 'inherently', 'intrinsically', 'substantively',
    'streamline', 'optimize', 'facilitate', 'amplify', 'catalyze',
    'propel', 'spearhead', 'orchestrate', 'navigate', 'traverse',
    'furthermore', 'moreover', 'additionally', 'consequently', 'subsequently',
    'thereby', 'thusly', 'wherein', 'whereby'
]

# Word replacements (multiple options for variety)
WORD_REPLACEMENTS = {
    'delve': ['explore', 'look at', 'dig into', 'examine'],
    'tapestry': ['mix', 'web', 'blend', 'collection'],
    'paradigm': ['model', 'framework', 'approach', 'way of thinking'],
    'synergy': ['connection', 'combination', 'interplay', 'overlap'],
    'leverage': ['use', 'draw on', 'work with', 'tap into'],
    'unlock': ['open', 'access', 'reach', 'find'],
    'empower': ['support', 'strengthen', 'help', 'encourage'],
    'utilize': ['use', 'apply', 'work with', 'rely on'],
    'pivotal': ['key', 'central', 'critical', 'important'],
    'embark': ['begin', 'start', 'set out on', 'take on'],
    'underscore': ['highlight', 'point to', 'show', 'reinforce'],
    'paramount': ['critical', 'essential', 'vital', 'key'],
    'seamlessly': ['smoothly', 'naturally', 'easily', 'without friction'],
    'robust': ['strong', 'solid', 'reliable', 'thorough'],
    'beacon': ['guide', 'signal', 'light', 'marker'],
    'foster': ['build', 'grow', 'encourage', 'support'],
    'elevate': ['lift', 'raise', 'improve', 'boost'],
    'curate': ['choose', 'select', 'gather', 'put together'],
    'curated': ['chosen', 'selected', 'gathered', 'hand-picked'],
    'bespoke': ['custom', 'tailored', 'personalized', 'made-to-order'],
    'resonate': ['connect', 'land', 'hit home', 'ring true'],
    'harness': ['use', 'channel', 'direct', 'work with'],
    'intricate': ['complex', 'detailed', 'layered', 'involved'],
    'plethora': ['range', 'variety', 'number', 'plenty'],
    'myriad': ['many', 'countless', 'a range of', 'all kinds of'],
    'comprehensive': ['thorough', 'complete', 'full', 'detailed'],
    'transformative': ['life-changing', 'powerful', 'significant', 'meaningful'],
    'groundbreaking': ['new', 'pioneering', 'original', 'fresh'],
    'innovative': ['new', 'creative', 'original', 'fresh'],
    'cutting-edge': ['latest', 'modern', 'current', 'advanced'],
    'revolutionary': ['radical', 'dramatic', 'major', 'game-changing'],
    'state-of-the-art': ['modern', 'current', 'latest', 'advanced'],
    'ever-evolving': ['changing', 'shifting', 'growing', 'developing'],
    'game-changing': ['significant', 'major', 'important', 'big'],
    'next-level': ['advanced', 'better', 'stronger', 'higher'],
    'world-class': ['top-tier', 'excellent', 'first-rate', 'outstanding'],
    'unparalleled': ['rare', 'unusual', 'unique', 'uncommon'],
    'unprecedented': ['rare', 'unusual', 'new', 'first-of-its-kind'],
    'remarkable': ['striking', 'notable', 'interesting', 'worth noting'],
    'extraordinary': ['unusual', 'rare', 'striking', 'surprising'],
    'exceptional': ['unusual', 'rare', 'strong', 'impressive'],
    'profound': ['deep', 'significant', 'meaningful', 'real'],
    'holistic': ['whole-person', 'integrated', 'full-picture', 'complete'],
    'nuanced': ['subtle', 'layered', 'complex', 'detailed'],
    'multifaceted': ['complex', 'layered', 'many-sided', 'varied'],
    'stakeholders': ['people involved', 'participants', 'those affected', 'interested parties'],
    'ecosystem': ['system', 'network', 'community', 'environment'],
    'landscape': ['field', 'scene', 'space', 'territory'],
    'realm': ['area', 'field', 'space', 'world'],
    'sphere': ['area', 'field', 'space', 'circle'],
    'domain': ['area', 'field', 'space', 'territory'],
    'arguably': ['some would say', 'by some measures', 'in many ways', 'possibly'],
    'notably': ['especially', 'in particular', 'specifically', 'particularly'],
    'crucially': ['critically', 'most importantly', 'the key point is', 'what matters most is'],
    'importantly': ['what matters here is', 'the key thing is', 'worth noting', 'significantly'],
    'essentially': ['basically', 'at its core', 'in practice', 'really'],
    'fundamentally': ['at its core', 'basically', 'at the root', 'in essence'],
    'inherently': ['by nature', 'naturally', 'at its core', 'by default'],
    'intrinsically': ['by nature', 'naturally', 'at its core', 'deeply'],
    'substantively': ['meaningfully', 'significantly', 'in real terms', 'concretely'],
    'streamline': ['simplify', 'clean up', 'tighten', 'make easier'],
    'optimize': ['improve', 'fine-tune', 'adjust', 'refine'],
    'facilitate': ['help', 'support', 'enable', 'make possible'],
    'amplify': ['increase', 'boost', 'strengthen', 'intensify'],
    'catalyze': ['trigger', 'spark', 'kick off', 'set off'],
    'propel': ['push', 'drive', 'move', 'carry'],
    'spearhead': ['lead', 'drive', 'champion', 'push forward'],
    'orchestrate': ['organize', 'coordinate', 'arrange', 'manage'],
    'navigate': ['work through', 'move through', 'handle', 'deal with'],
    'traverse': ['cross', 'move through', 'pass through', 'cover'],
    'furthermore': ['also', 'and', 'on top of that', 'beyond that'],
    'moreover': ['also', 'and', 'plus', 'on top of that'],
    'additionally': ['also', 'and', 'plus', 'on top of that'],
    'consequently': ['so', 'as a result', 'because of this', 'that means'],
    'subsequently': ['then', 'after that', 'later', 'next'],
    'thereby': ['which', 'and so', 'in doing so', 'this way'],
    'thusly': ['this way', 'like this', 'in this way', 'so'],
    'wherein': ['where', 'in which', 'and there', 'and in it'],
    'whereby': ['where', 'through which', 'by which', 'so that'],
}

# AI-flagged phrases and their replacements
PHRASE_REPLACEMENTS = {
    "it's important to note that": ["keep in mind that", "worth knowing:", "one thing to remember:"],
    "it's worth noting that": ["keep in mind that", "here's something:", "one thing:"],
    "it's worth mentioning": ["here's something", "one more thing", "also worth knowing"],
    "it's crucial to": ["you'll want to", "it helps to", "the key is to"],
    "it is essential to": ["you'll want to", "it helps to", "make sure to"],
    "in conclusion,": ["so,", "all told,", "to wrap up,", "looking at the full picture,"],
    "in summary,": ["so,", "all told,", "pulling it together,"],
    "to summarize,": ["so,", "all told,", "putting it all together,"],
    "a holistic approach": ["a whole-person approach", "a full-picture approach", "an integrated approach"],
    "unlock your potential": ["grow into what you're capable of", "reach further", "push past your limits"],
    "unlock the power": ["tap into", "access the strength of", "make use of"],
    "in the realm of": ["in", "when it comes to", "within"],
    "in the world of": ["in", "across", "within"],
    "dive deep into": ["get into", "look closely at", "really explore"],
    "dive into": ["get into", "look at", "explore"],
    "delve into": ["get into", "look at", "explore"],
    "at the end of the day": ["when it comes down to it", "ultimately", "what matters most is"],
    "in today's fast-paced world": ["right now", "these days", "in the current moment"],
    "in today's digital age": ["right now", "these days", "in our current moment"],
    "in today's modern world": ["right now", "these days", "today"],
    "in this digital age": ["right now", "these days", "today"],
    "when it comes to": ["with", "for", "regarding", "around"],
    "navigate the complexities": ["work through the challenges", "handle the complexity", "sort through"],
    "a testament to": ["proof of", "evidence of", "a sign of", "a reflection of"],
    "speaks volumes": ["says a lot", "tells you something", "makes it clear"],
    "the power of": ["what happens with", "the effect of", "the strength of"],
    "the beauty of": ["what's good about", "the appeal of", "the strength of"],
    "the art of": ["the practice of", "the skill of", "how to"],
    "the journey of": ["the process of", "the path of", "the experience of"],
    "the key lies in": ["what matters is", "the answer is in", "it comes down to"],
    "plays a crucial role": ["matters a lot", "is central", "carries real weight"],
    "plays a vital role": ["matters a lot", "is central", "carries real weight"],
    "plays a significant role": ["matters", "is important", "has real influence"],
    "plays a pivotal role": ["matters a lot", "is central", "is key"],
    "a wide array of": ["many", "a range of", "all kinds of"],
    "a wide range of": ["many", "a range of", "all kinds of"],
    "a plethora of": ["many", "plenty of", "a lot of"],
    "a myriad of": ["many", "countless", "a range of"],
    "stands as a": ["is", "remains", "works as"],
    "serves as a": ["is", "works as", "acts as"],
    "acts as a": ["is", "works as", "functions as"],
    "has emerged as": ["has become", "is now", "turned into"],
    "continues to evolve": ["keeps changing", "is still developing", "keeps growing"],
    "has revolutionized": ["has changed", "has reshaped", "has shifted"],
    "cannot be overstated": ["is hard to overstate", "matters more than you'd think", "is significant"],
    "it goes without saying": ["obviously", "clearly", "of course"],
    "needless to say": ["obviously", "clearly", "of course"],
    "last but not least": ["and finally", "one more thing", "also"],
    "first and foremost": ["first", "above all", "most importantly"],
}

AI_FLAGGED_PHRASES = list(PHRASE_REPLACEMENTS.keys())


def replace_word(match, word):
    """Replace a word preserving case."""
    original = match.group(0)
    replacements = WORD_REPLACEMENTS.get(word, [word])
    replacement = random.choice(replacements)
    
    # Preserve capitalization
    if original[0].isupper():
        replacement = replacement[0].upper() + replacement[1:]
    return replacement


def clean_article(body):
    """Clean AI-flagged words and phrases from article body."""
    cleaned = body
    changes = []
    
    # 1. Replace phrases first (longer matches before shorter)
    for phrase, replacements in sorted(PHRASE_REPLACEMENTS.items(), key=lambda x: -len(x[0])):
        pattern = re.compile(re.escape(phrase), re.IGNORECASE)
        matches = pattern.findall(cleaned)
        if matches:
            for m in matches:
                replacement = random.choice(replacements)
                # Preserve capitalization of first char
                if m[0].isupper():
                    replacement = replacement[0].upper() + replacement[1:]
                cleaned = cleaned.replace(m, replacement, 1)
                changes.append(f'phrase: "{phrase}" -> "{replacement}"')
    
    # 2. Replace flagged words
    for word in AI_FLAGGED_WORDS:
        if word not in WORD_REPLACEMENTS:
            continue
        pattern = re.compile(r'\b' + re.escape(word) + r'\b', re.IGNORECASE)
        found = pattern.findall(cleaned)
        if found:
            for match_text in found:
                replacement = random.choice(WORD_REPLACEMENTS[word])
                if match_text[0].isupper():
                    replacement = replacement[0].upper() + replacement[1:]
                cleaned = cleaned.replace(match_text, replacement, 1)
                changes.append(f'word: "{word}" -> "{replacement}"')
    
    # 3. Remove em-dashes (replace with comma or period)
    if '\u2014' in cleaned:
        # Replace " — " with ", " (most common context)
        cleaned = cleaned.replace(' \u2014 ', ', ')
        # Replace remaining em-dashes
        cleaned = cleaned.replace('\u2014', ', ')
        changes.append('em-dash removal')
    
    return cleaned, changes


def audit_article(body):
    """Audit an article body for AI-flagged content."""
    stripped = body.replace('<', ' <').lower()
    stripped_clean = re.sub(r'<[^>]+>', ' ', stripped)
    
    found_words = []
    for word in AI_FLAGGED_WORDS:
        if re.search(r'\b' + re.escape(word) + r'\b', stripped_clean, re.IGNORECASE):
            found_words.append(word)
    
    found_phrases = []
    stripped_norm = re.sub(r'\s+', ' ', stripped_clean)
    for phrase in AI_FLAGGED_PHRASES:
        if phrase.lower() in stripped_norm:
            found_phrases.append(phrase)
    
    has_emdash = '\u2014' in body
    
    return found_words, found_phrases, has_emdash


# Main execution
files = sorted([f for f in os.listdir(CONTENT_DIR) if f.endswith('.json')])
print(f'Scanning {len(files)} articles...\n')

# First pass: audit
total_words_found = {}
total_phrases_found = {}
articles_with_issues = 0
emdash_count = 0

for f in files:
    data = json.load(open(os.path.join(CONTENT_DIR, f)))
    body = data.get('body', '')
    words, phrases, has_emdash = audit_article(body)
    
    if words or phrases or has_emdash:
        articles_with_issues += 1
    if has_emdash:
        emdash_count += 1
    for w in words:
        total_words_found[w] = total_words_found.get(w, 0) + 1
    for p in phrases:
        total_phrases_found[p] = total_phrases_found.get(p, 0) + 1

print(f'=== PRE-CLEANUP AUDIT ===')
print(f'Articles with issues: {articles_with_issues}/{len(files)}')
print(f'Articles with em-dashes: {emdash_count}')
print(f'Unique AI words found: {len(total_words_found)}')
print(f'Unique AI phrases found: {len(total_phrases_found)}')
print()

if total_words_found:
    print('Top AI words:')
    for w, c in sorted(total_words_found.items(), key=lambda x: -x[1])[:30]:
        print(f'  {w}: {c}')
    print()

if total_phrases_found:
    print('AI phrases:')
    for p, c in sorted(total_phrases_found.items(), key=lambda x: -x[1]):
        print(f'  "{p}": {c}')
    print()

# Second pass: clean
print('=== CLEANING ===')
total_changes = 0
articles_cleaned = 0

for f in files:
    filepath = os.path.join(CONTENT_DIR, f)
    data = json.load(open(filepath))
    body = data.get('body', '')
    
    cleaned, changes = clean_article(body)
    
    if changes:
        data['body'] = cleaned
        json.dump(data, open(filepath, 'w'), indent=2)
        articles_cleaned += 1
        total_changes += len(changes)

print(f'Articles cleaned: {articles_cleaned}')
print(f'Total replacements: {total_changes}')
print()

# Third pass: verify
print('=== POST-CLEANUP VERIFICATION ===')
remaining_words = {}
remaining_phrases = {}
remaining_emdash = 0

for f in files:
    data = json.load(open(os.path.join(CONTENT_DIR, f)))
    body = data.get('body', '')
    words, phrases, has_emdash = audit_article(body)
    
    if has_emdash:
        remaining_emdash += 1
    for w in words:
        remaining_words[w] = remaining_words.get(w, 0) + 1
    for p in phrases:
        remaining_phrases[p] = remaining_phrases.get(p, 0) + 1

print(f'Remaining AI words: {len(remaining_words)} types, {sum(remaining_words.values())} total')
print(f'Remaining AI phrases: {len(remaining_phrases)} types, {sum(remaining_phrases.values())} total')
print(f'Remaining em-dashes: {remaining_emdash} articles')

if remaining_words:
    print('\nRemaining words (need manual review):')
    for w, c in sorted(remaining_words.items(), key=lambda x: -x[1]):
        print(f'  {w}: {c}')

if remaining_phrases:
    print('\nRemaining phrases:')
    for p, c in sorted(remaining_phrases.items(), key=lambda x: -x[1]):
        print(f'  "{p}": {c}')

print('\nDone.')
