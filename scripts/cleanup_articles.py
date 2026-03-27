#!/usr/bin/env python3
"""
Clean up all 300 articles:
- Remove all "This is where" transitions
- Remove all banned phrases
- Fix any remaining issues
"""

import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
ARTICLES_DIR = ROOT / "content" / "articles"

# Banned phrase replacements
REPLACEMENTS = {
    # "This is where" replacements - context-aware
    "This is where ": "Here, ",
    "this is where ": "here, ",
    "This is where the ": "The ",
    "this is where the ": "the ",
    # Banned phrases
    "manifestation": "emergence",
    "manifest ": "emerge ",
    "manifests": "emerges",
    "manifested": "emerged",
    "manifesting": "emerging",
    "lean into": "move toward",
    "leaning into": "moving toward",
    "leaned into": "moved toward",
    "showing up for": "being present with",
    "show up for": "be present with",
    "shows up for": "is present with",
    "authentic self": "deeper nature",
    "safe space": "supportive environment",
    "safe spaces": "supportive environments",
    "hold space": "remain present",
    "holding space": "remaining present",
    "holds space": "remains present",
    "held space": "remained present",
    "sacred container": "intentional framework",
    "raise your vibration": "deepen your awareness",
    "raising your vibration": "deepening your awareness",
    "raise vibration": "deepen awareness",
}

# Case-insensitive replacements for "This is where"
THIS_IS_WHERE_PATTERNS = [
    (re.compile(r'This is where\b', re.IGNORECASE), lambda m: "Here" if m.group().startswith("T") else "here"),
]

fixed_count = 0
total_replacements = 0

for f in sorted(ARTICLES_DIR.iterdir()):
    if f.suffix != ".json":
        continue
    
    with open(f) as fp:
        article = json.load(fp)
    
    body = article.get("body", "")
    original = body
    
    # Fix "This is where" - multiple patterns
    # Pattern 1: "This is where [noun] [verb]" -> "[Noun] [verb]"
    body = re.sub(
        r'This is where\s+',
        lambda m: '',
        body,
        flags=re.IGNORECASE
    )
    
    # Clean up any double spaces or awkward starts after removal
    body = re.sub(r'<p>\s*,', '<p>', body)
    body = re.sub(r'<p>\s*([a-z])', lambda m: '<p>' + m.group(1).upper(), body)
    
    # Fix banned phrases
    for old, new in REPLACEMENTS.items():
        if old.lower() in ["this is where ", "this is where the "]:
            continue  # Already handled above
        body = body.replace(old, new)
        # Also handle capitalized versions
        if old[0].islower():
            cap_old = old[0].upper() + old[1:]
            cap_new = new[0].upper() + new[1:]
            body = body.replace(cap_old, cap_new)
    
    if body != original:
        article["body"] = body
        with open(f, "w") as fp:
            json.dump(article, fp, indent=2)
        fixed_count += 1
        
        # Count changes
        changes = sum(1 for a, b in zip(original, body) if a != b)
        total_replacements += changes

print(f"Fixed {fixed_count} articles with {total_replacements} character changes")
