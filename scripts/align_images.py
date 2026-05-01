#!/usr/bin/env python3
"""
Align hero images to article topics.
Maps each article to the most relevant library image based on title/content keywords.
Only updates articles that currently use random /library/ images (the 502 new ones).
Original 303 articles keep their slug-specific /images/ URLs.
"""

import json
import os
import re
import glob
from pathlib import Path

ARTICLES_DIR = Path(__file__).parent.parent / "content" / "articles"
CDN_BASE = "https://quiet-medicine.b-cdn.net/library"

# Image topic mapping based on visual inspection of all 40 library images
# Groups of images by visual theme/topic
IMAGE_GROUPS = {
    "psychedelic_visionary": {
        # Colorful psychedelic art, sacred geometry, cosmic, visionary
        "images": [f"lib-{i:02d}.webp" for i in [5, 6, 7, 8, 9]],
        "keywords": [
            "psychedelic", "trip", "journey", "visionary", "cosmic", "sacred geometry",
            "dmt", "ayahuasca", "lsd", "experience", "consciousness", "mystical",
            "ego death", "transcend", "altered state", "peak experience", "heroic dose",
            "set and setting", "music", "art", "creative", "visual"
        ]
    },
    "spiritual_ceremony": {
        # Art nouveau, spiritual, ceremony, ritual
        "images": [f"lib-{i:02d}.webp" for i in [10, 11, 12, 13, 14]],
        "keywords": [
            "ceremony", "ritual", "spiritual", "sacred", "prayer", "intention",
            "shaman", "guide", "facilitator", "container", "space", "altar",
            "ancient", "indigenous", "tradition", "wisdom", "ancestors", "plant medicine",
            "feminine", "goddess", "divine", "soul"
        ]
    },
    "nature_forest": {
        # Bioluminescent mushrooms, forest scenes, natural settings
        "images": [f"lib-{i:02d}.webp" for i in [1, 2, 3, 4]],
        "keywords": [
            "nature", "forest", "outdoor", "wild", "psilocybin", "magic mushroom",
            "grow", "cultivat", "mycelium", "spore", "substrate", "fruiting",
            "habitat", "ecology", "environment", "biodiversity", "species",
            "bioluminesc", "glow"
        ]
    },
    "foraging_practical": {
        # Hands-on, foraging, practical mushroom work
        "images": [f"lib-{i:02d}.webp" for i in [15, 16, 17, 18, 19]],
        "keywords": [
            "forag", "identif", "field guide", "harvest", "practical", "hands-on",
            "recipe", "cook", "prepare", "extract", "tincture", "tea", "powder",
            "supplement", "capsule", "dose", "protocol", "schedule", "stack",
            "microdos", "sub-perceptual", "fadiman", "stamets protocol"
        ]
    },
    "medicinal_functional": {
        # Turkey tail, medicinal mushrooms, supplements
        "images": [f"lib-{i:02d}.webp" for i in [20, 21, 22, 23, 24]],
        "keywords": [
            "turkey tail", "lion's mane", "reishi", "cordyceps", "chaga",
            "medicinal", "functional", "adaptogen", "immune", "cancer",
            "cognitive", "brain", "memory", "focus", "neuroprotect",
            "anti-inflamm", "antioxid", "gut health", "prebiotic",
            "supplement", "extract", "beta-glucan", "polysaccharide"
        ]
    },
    "integration_reflection": {
        # Journaling, integration, reflection, aftercare
        "images": [f"lib-{i:02d}.webp" for i in [25, 26, 27, 28, 29]],
        "keywords": [
            "integrat", "journal", "reflect", "aftercare", "process",
            "meaning", "insight", "lesson", "growth", "change",
            "therapy", "therapist", "counselor", "support", "group",
            "community", "share", "story", "narrative", "writing",
            "meditation", "mindful", "breathwork", "yoga", "somatic"
        ]
    },
    "science_research": {
        # Clean scientific imagery, research, clinical
        "images": [f"lib-{i:02d}.webp" for i in [30, 31, 32, 33, 34]],
        "keywords": [
            "research", "study", "clinical", "trial", "science",
            "neuroscience", "brain", "serotonin", "receptor", "5-ht2a",
            "fmri", "default mode", "pharmacol", "mechanism", "dose-response",
            "evidence", "data", "meta-analysis", "peer-review", "publication",
            "johns hopkins", "imperial college", "maps", "fda", "dea"
        ]
    },
    "resilience_adaptogenic": {
        # Chaga, winter, resilience, adaptogenic
        "images": [f"lib-{i:02d}.webp" for i in [35, 36, 37, 38, 39]],
        "keywords": [
            "resilience", "stress", "anxiety", "depression", "ptsd", "trauma",
            "heal", "recovery", "addiction", "alcohol", "smoking", "ocd",
            "end of life", "palliative", "grief", "loss", "fear",
            "chronic", "pain", "fatigue", "autoimmune", "inflammation"
        ]
    },
    "diversity_education": {
        # Mushroom variety, education, general
        "images": [f"lib-{i:02d}.webp" for i in [40]],
        "keywords": [
            "variety", "types", "species", "education", "beginner", "guide",
            "overview", "introduction", "history", "culture", "society",
            "legal", "policy", "decriminal", "access", "equity"
        ]
    }
}


def score_article(title, body_preview=""):
    """Score an article against each image group and return the best match."""
    title_lower = title.lower()
    # Use first 500 chars of body for additional context
    context = (title_lower + " " + body_preview.lower())[:800]
    
    scores = {}
    for group_name, group_data in IMAGE_GROUPS.items():
        score = 0
        for keyword in group_data["keywords"]:
            if keyword in context:
                # Title matches are worth more
                if keyword in title_lower:
                    score += 3
                else:
                    score += 1
        scores[group_name] = score
    
    # Get best match
    best_group = max(scores, key=scores.get)
    best_score = scores[best_group]
    
    # If no strong match, default to diversity_education or nature_forest
    if best_score == 0:
        best_group = "nature_forest"
    
    return best_group, best_score


def select_image_from_group(group_name, slug):
    """Select a specific image from the group using slug hash for distribution."""
    images = IMAGE_GROUPS[group_name]["images"]
    # Use slug hash to distribute evenly across images in the group
    hash_val = sum(ord(c) for c in slug)
    idx = hash_val % len(images)
    return images[idx]


def main():
    # Read list of new 502 articles (the ones with library images)
    with open('/tmp/new_502.txt') as f:
        new_articles = set(f.read().strip().split('\n'))
    
    updated = 0
    group_counts = {}
    
    for fname in sorted(os.listdir(ARTICLES_DIR)):
        if fname not in new_articles:
            continue  # Skip original 303 - they have slug-specific images
        
        filepath = ARTICLES_DIR / fname
        with open(filepath) as f:
            data = json.load(f)
        
        # Only update if currently using a library image
        current_img = data.get('heroImage', '')
        if '/library/' not in current_img:
            continue
        
        title = data.get('title', '')
        body = data.get('body', '')
        # Strip HTML for keyword matching
        body_text = re.sub(r'<[^>]+>', ' ', body)[:500]
        
        # Score and select best image group
        best_group, score = score_article(title, body_text)
        image_file = select_image_from_group(best_group, data.get('slug', fname))
        
        # Update hero image URL
        new_url = f"{CDN_BASE}/{image_file}"
        if data['heroImage'] != new_url:
            data['heroImage'] = new_url
            with open(filepath, 'w') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            updated += 1
        
        group_counts[best_group] = group_counts.get(best_group, 0) + 1
    
    print(f"Updated {updated} articles with topic-aligned images")
    print(f"\nImage group distribution:")
    for group, count in sorted(group_counts.items(), key=lambda x: -x[1]):
        print(f"  {group}: {count} articles")


if __name__ == "__main__":
    main()
