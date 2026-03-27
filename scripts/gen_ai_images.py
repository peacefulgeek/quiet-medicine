#!/usr/bin/env python3
"""
Generate unique, article-specific AI images for all 300 articles.
Uses OpenAI image generation API, converts to WEBP, uploads to Bunny CDN.
Each image directly represents the article's topic — no generic scenery or repeats.
"""

import asyncio
import aiohttp
import json
import os
import base64
import hashlib
from pathlib import Path
from io import BytesIO
from PIL import Image
from openai import OpenAI

ROOT = Path(__file__).parent.parent
ARTICLES_DIR = ROOT / "content" / "articles"

BUNNY_STORAGE_ZONE = "quiet-medicine"
BUNNY_STORAGE_HOST = "ny.storage.bunnycdn.com"
BUNNY_STORAGE_PASSWORD = "4675df05-785b-4fca-a9e84e666981-5a5c-430d"
BUNNY_CDN_BASE = "https://quiet-medicine.b-cdn.net"

client = OpenAI()

# Category visual themes for consistent but varied imagery
CATEGORY_THEMES = {
    "the-science": "scientific illustration style, neuroscience imagery, brain scans, molecular structures, laboratory setting, cool blue and green tones, clinical precision",
    "the-microdose": "botanical illustration style, tiny mushrooms, precise measurements, morning light, journal and pen, warm earth tones, intimate scale",
    "the-journey": "visionary art style, expansive landscapes, sacred geometry, flowing colors, ceremonial elements, deep purples and golds, transcendent atmosphere",
    "the-clinic": "modern medical illustration, clean clinical spaces, therapeutic setting, warm professional lighting, calming neutrals with green accents",
    "the-integration": "contemplative art style, meditation scenes, nature integration, journaling, sunrise/sunset, grounding earth tones, peaceful atmosphere",
}

def build_prompt(article):
    """Build a specific, non-generic image prompt from article content."""
    title = article["title"]
    cat = article.get("categorySlug", "the-science")
    theme = CATEGORY_THEMES.get(cat, CATEGORY_THEMES["the-science"])
    
    # Use the article's own hero prompt if available, otherwise build from title
    hero_prompt = article.get("heroPrompt", "")
    
    if hero_prompt and len(hero_prompt) > 20:
        base = hero_prompt
    else:
        base = f"A visually compelling illustration representing: {title}"
    
    prompt = (
        f"{base}. "
        f"Style: {theme}. "
        f"Professional editorial illustration for a psychedelic wellness publication. "
        f"No text, no words, no letters, no watermarks. "
        f"Photorealistic with artistic touches. 16:9 aspect ratio composition."
    )
    
    return prompt[:900]  # Keep under API limit


def generate_image(prompt, size="1792x1024"):
    """Generate an image using OpenAI's API."""
    try:
        response = client.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            n=1,
            size=size,
            quality="medium",
        )
        # gpt-image-1 returns base64
        b64 = response.data[0].b64_json
        img_bytes = base64.b64decode(b64)
        return img_bytes
    except Exception as e:
        print(f"  Image gen error: {e}")
        return None


def convert_to_webp(img_bytes, width, height, quality=82):
    """Convert image bytes to WEBP at specified dimensions."""
    try:
        img = Image.open(BytesIO(img_bytes))
        img = img.convert("RGB")
        img = img.resize((width, height), Image.LANCZOS)
        buffer = BytesIO()
        img.save(buffer, format="WEBP", quality=quality)
        return buffer.getvalue()
    except Exception as e:
        print(f"  WEBP conversion error: {e}")
        return None


async def upload_to_bunny(session, data, remote_path):
    """Upload bytes to Bunny CDN storage."""
    url = f"https://{BUNNY_STORAGE_HOST}/{BUNNY_STORAGE_ZONE}/{remote_path}"
    headers = {
        "AccessKey": BUNNY_STORAGE_PASSWORD,
        "Content-Type": "application/octet-stream",
    }
    try:
        async with session.put(url, data=data, headers=headers) as resp:
            return resp.status in (200, 201)
    except Exception as e:
        print(f"  Upload error for {remote_path}: {e}")
        return False


async def process_article(article, session, idx, total):
    """Generate hero + OG images for one article."""
    slug = article["slug"]
    title = article["title"]
    
    print(f"[{idx+1}/{total}] {slug}")
    
    # Build article-specific prompt
    prompt = build_prompt(article)
    
    # Generate the image
    img_bytes = generate_image(prompt)
    if not img_bytes:
        print(f"  FAILED: Could not generate image for {slug}")
        return False
    
    # Convert to hero (1200x675) and OG (1200x630) WEBP
    hero_webp = convert_to_webp(img_bytes, 1200, 675)
    og_webp = convert_to_webp(img_bytes, 1200, 630)
    
    if not hero_webp or not og_webp:
        print(f"  FAILED: Could not convert to WEBP for {slug}")
        return False
    
    # Upload both
    hero_ok = await upload_to_bunny(session, hero_webp, f"images/{slug}.webp")
    og_ok = await upload_to_bunny(session, og_webp, f"og/{slug}.webp")
    
    if hero_ok and og_ok:
        print(f"  OK: hero={len(hero_webp)}b og={len(og_webp)}b")
        return True
    else:
        print(f"  UPLOAD FAILED: hero={hero_ok} og={og_ok}")
        return False


async def main():
    # Load all articles
    articles = []
    for f in sorted(ARTICLES_DIR.iterdir()):
        if f.suffix == ".json":
            with open(f) as fp:
                articles.append(json.load(fp))
    
    print(f"Generating AI images for {len(articles)} articles...")
    
    connector = aiohttp.TCPConnector(limit=10)
    async with aiohttp.ClientSession(connector=connector) as session:
        success = 0
        failed = 0
        
        # Process in batches of 5 (rate limit friendly)
        batch_size = 5
        for i in range(0, len(articles), batch_size):
            batch = articles[i:i+batch_size]
            tasks = []
            for j, article in enumerate(batch):
                tasks.append(process_article(article, session, i+j, len(articles)))
            
            results = await asyncio.gather(*tasks)
            success += sum(1 for r in results if r)
            failed += sum(1 for r in results if not r)
            
            # Brief pause between batches
            if i + batch_size < len(articles):
                await asyncio.sleep(1)
    
    print(f"\nDone! Success: {success}, Failed: {failed}")
    print(f"Expected: {len(articles)} hero + {len(articles)} OG = {len(articles)*2} images")


if __name__ == "__main__":
    asyncio.run(main())
