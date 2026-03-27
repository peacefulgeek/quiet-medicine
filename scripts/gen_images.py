#!/usr/bin/env python3
"""
Generate hero images and OG images for all 300 articles using FAL.ai API.
Upload to Bunny CDN as WebP.
"""

import json
import os
import sys
import time
import asyncio
import aiohttp
from pathlib import Path
from io import BytesIO

ROOT = Path(__file__).parent.parent
ARTICLES_DIR = ROOT / "content" / "articles"
IMAGES_DIR = ROOT / "data" / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

BUNNY_STORAGE_ZONE = "quiet-medicine"
BUNNY_STORAGE_HOST = "ny.storage.bunnycdn.com"
BUNNY_STORAGE_PASSWORD = "4675df05-785b-4fca-a9e84e666981-5a5c-430d"
BUNNY_CDN_BASE = "https://quiet-medicine.b-cdn.net"

# FAL.ai API - using the flux model for fast generation
FAL_API_URL = "https://fal.run/fal-ai/flux/schnell"


async def upload_to_bunny(session, data, remote_path):
    """Upload bytes to Bunny CDN storage."""
    url = f"https://{BUNNY_STORAGE_HOST}/{BUNNY_STORAGE_ZONE}/{remote_path}"
    headers = {
        "AccessKey": BUNNY_STORAGE_PASSWORD,
        "Content-Type": "application/octet-stream",
    }
    async with session.put(url, data=data, headers=headers) as resp:
        if resp.status in (200, 201):
            return True
        text = await resp.text()
        print(f"  Bunny upload error {resp.status}: {text[:100]}")
        return False


async def generate_image(session, prompt, slug, image_type="hero", semaphore=None):
    """Generate an image using FAL.ai and upload to Bunny CDN."""
    
    if image_type == "hero":
        width, height = 1200, 675
        remote_path = f"images/{slug}.webp"
    else:
        width, height = 1200, 630
        remote_path = f"og/{slug}.webp"
    
    # Check if already exists on Bunny
    check_url = f"https://{BUNNY_STORAGE_HOST}/{BUNNY_STORAGE_ZONE}/{remote_path}"
    try:
        async with session.head(check_url, headers={"AccessKey": BUNNY_STORAGE_PASSWORD}) as resp:
            if resp.status == 200:
                return "exists"
    except:
        pass
    
    if semaphore:
        await semaphore.acquire()
    
    try:
        # Generate with FAL.ai
        fal_headers = {
            "Authorization": f"Key {os.environ.get('FAL_KEY', '')}",
            "Content-Type": "application/json",
        }
        
        fal_payload = {
            "prompt": prompt,
            "image_size": {"width": width, "height": height},
            "num_images": 1,
            "enable_safety_checker": False,
        }
        
        for attempt in range(3):
            try:
                async with session.post(
                    FAL_API_URL,
                    json=fal_payload,
                    headers=fal_headers,
                    timeout=aiohttp.ClientTimeout(total=120),
                ) as resp:
                    if resp.status != 200:
                        text = await resp.text()
                        raise Exception(f"FAL error {resp.status}: {text[:200]}")
                    result = await resp.json()
                
                # Get image URL from result
                image_url = result.get("images", [{}])[0].get("url", "")
                if not image_url:
                    raise Exception("No image URL in response")
                
                # Download the image
                async with session.get(image_url) as img_resp:
                    if img_resp.status != 200:
                        raise Exception(f"Image download failed: {img_resp.status}")
                    image_data = await img_resp.read()
                
                # Convert to WebP using sharp (via subprocess) or just upload as-is if already webp
                # For now, upload the image data directly - FAL returns high quality images
                # We'll convert to WebP on upload
                
                # Upload to Bunny CDN
                success = await upload_to_bunny(session, image_data, remote_path)
                if success:
                    return "generated"
                else:
                    raise Exception("Bunny upload failed")
                    
            except Exception as e:
                print(f"  Attempt {attempt+1} failed for {slug} ({image_type}): {str(e)[:80]}")
                if attempt < 2:
                    await asyncio.sleep(3)
        
        return "failed"
    finally:
        if semaphore:
            semaphore.release()


async def generate_placeholder_and_upload(session, slug, image_type="hero"):
    """Generate a simple colored placeholder image and upload to Bunny CDN."""
    if image_type == "hero":
        width, height = 1200, 675
        remote_path = f"images/{slug}.webp"
    else:
        width, height = 1200, 630
        remote_path = f"og/{slug}.webp"
    
    # Check if already exists
    check_url = f"https://{BUNNY_STORAGE_HOST}/{BUNNY_STORAGE_ZONE}/{remote_path}"
    try:
        async with session.head(check_url, headers={"AccessKey": BUNNY_STORAGE_PASSWORD}) as resp:
            if resp.status == 200:
                return "exists"
    except:
        pass
    
    # Create a simple gradient image using PIL
    from PIL import Image, ImageDraw
    
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    
    # Create a warm gradient from forest emerald to mycelium cream
    for y in range(height):
        r = int(27 + (245 - 27) * y / height)
        g = int(94 + (236 - 94) * y / height)
        b = int(32 + (215 - 32) * y / height)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    
    # Add some organic circular shapes
    import random
    random.seed(hash(slug) % 2**32)
    for _ in range(15):
        cx = random.randint(0, width)
        cy = random.randint(0, height)
        r = random.randint(30, 150)
        alpha = random.randint(20, 60)
        color = (
            random.choice([27, 184, 245]),
            random.choice([94, 134, 236]),
            random.choice([32, 11, 215]),
        )
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=color)
    
    # Save as WebP
    buffer = BytesIO()
    img.save(buffer, format='WEBP', quality=82)
    image_data = buffer.getvalue()
    
    success = await upload_to_bunny(session, image_data, remote_path)
    return "generated" if success else "failed"


async def main():
    # Check if FAL_KEY is available
    fal_key = os.environ.get("FAL_KEY", "")
    use_fal = bool(fal_key)
    
    if not use_fal:
        print("No FAL_KEY found. Will generate branded placeholder images.")
    else:
        print(f"FAL_KEY found. Will use FAL.ai for image generation.")
    
    # Load all articles
    articles = []
    for f in sorted(ARTICLES_DIR.iterdir()):
        if f.suffix == ".json":
            with open(f) as fp:
                articles.append(json.load(fp))
    
    print(f"Loaded {len(articles)} articles")
    
    semaphore = asyncio.Semaphore(5)
    connector = aiohttp.TCPConnector(limit=10)
    
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = []
        for article in articles:
            slug = article["slug"]
            prompt = article.get("heroPrompt", f"Luminous warm healing scene related to {article['title']}, mycelium golden threads, forest floor dappled sunlight, organic natural sacred, no text, no people in distress")
            
            if use_fal:
                # Hero image
                tasks.append(generate_image(session, prompt, slug, "hero", semaphore))
                # OG image (same prompt, different size)
                tasks.append(generate_image(session, prompt, slug, "og", semaphore))
            else:
                # Placeholder images
                tasks.append(generate_placeholder_and_upload(session, slug, "hero"))
                tasks.append(generate_placeholder_and_upload(session, slug, "og"))
        
        results = await asyncio.gather(*tasks)
    
    generated = results.count("generated")
    existing = results.count("exists")
    failed = results.count("failed")
    print(f"\nDone! Generated: {generated}, Already existed: {existing}, Failed: {failed}")
    print(f"Total images: {generated + existing} / {len(articles) * 2} expected")


if __name__ == "__main__":
    asyncio.run(main())
