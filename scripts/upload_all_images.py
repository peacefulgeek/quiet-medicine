#!/usr/bin/env python3
"""Upload all 300 hero + 300 OG AI-generated images to Bunny CDN as WEBP."""

import asyncio
import aiohttp
from pathlib import Path
from PIL import Image
from io import BytesIO

BUNNY_STORAGE_ZONE = "quiet-medicine"
BUNNY_STORAGE_HOST = "ny.storage.bunnycdn.com"
BUNNY_STORAGE_PASSWORD = "4675df05-785b-4fca-a9e84e666981-5a5c-430d"

HERO_DIR = Path("/home/ubuntu/final_images/hero")
OG_DIR = Path("/home/ubuntu/final_images/og")

async def upload_file(session, local_path, remote_path):
    """Upload a file to Bunny CDN, resizing to target dimensions."""
    url = f"https://{BUNNY_STORAGE_HOST}/{BUNNY_STORAGE_ZONE}/{remote_path}"
    headers = {
        "AccessKey": BUNNY_STORAGE_PASSWORD,
        "Content-Type": "application/octet-stream",
    }
    
    # Read and resize the image
    img = Image.open(local_path)
    img = img.convert("RGB")
    
    # Determine target size based on type
    if "og/" in remote_path:
        target = (1200, 630)
    else:
        target = (1200, 675)
    
    img = img.resize(target, Image.LANCZOS)
    buf = BytesIO()
    img.save(buf, format="WEBP", quality=82)
    data = buf.getvalue()
    
    try:
        async with session.put(url, data=data, headers=headers) as resp:
            if resp.status in (200, 201):
                return True
            else:
                print(f"  FAIL {resp.status}: {remote_path}")
                return False
    except Exception as e:
        print(f"  ERROR: {remote_path}: {e}")
        return False

async def main():
    connector = aiohttp.TCPConnector(limit=20)
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = []
        
        # Upload heroes
        hero_files = sorted(HERO_DIR.glob("*.webp"))
        print(f"Uploading {len(hero_files)} hero images...")
        for f in hero_files:
            tasks.append(upload_file(session, f, f"images/{f.name}"))
        
        # Upload OGs
        og_files = sorted(OG_DIR.glob("*.webp"))
        print(f"Uploading {len(og_files)} OG images...")
        for f in og_files:
            tasks.append(upload_file(session, f, f"og/{f.name}"))
        
        results = await asyncio.gather(*tasks)
        
        hero_ok = sum(1 for r in results[:len(hero_files)] if r)
        og_ok = sum(1 for r in results[len(hero_files):] if r)
        
        print(f"\nHero uploads: {hero_ok}/{len(hero_files)}")
        print(f"OG uploads: {og_ok}/{len(og_files)}")
        print(f"Total: {hero_ok + og_ok}/{len(hero_files) + len(og_files)}")

if __name__ == "__main__":
    asyncio.run(main())
