#!/usr/bin/env python3
"""Upload all images to Bunny CDN - resize first, then upload in batches."""

import subprocess
import os
from pathlib import Path
from PIL import Image
from io import BytesIO
import time

BUNNY_STORAGE_ZONE = "quiet-medicine"
BUNNY_STORAGE_HOST = "ny.storage.bunnycdn.com"
BUNNY_STORAGE_PASSWORD = "4675df05-785b-4fca-a9e84e666981-5a5c-430d"

HERO_DIR = Path("/home/ubuntu/final_images/hero")
OG_DIR = Path("/home/ubuntu/final_images/og")
RESIZED_DIR = Path("/home/ubuntu/resized_images")

def resize_and_save(src, dst, target_size):
    """Resize image and save as optimized WEBP."""
    img = Image.open(src).convert("RGB")
    img = img.resize(target_size, Image.LANCZOS)
    img.save(dst, format="WEBP", quality=78, method=4)

def upload_file(local_path, remote_path):
    """Upload file using curl with timeout."""
    url = f"https://{BUNNY_STORAGE_HOST}/{BUNNY_STORAGE_ZONE}/{remote_path}"
    cmd = [
        "curl", "-s", "--connect-timeout", "10", "--max-time", "30",
        "-X", "PUT",
        "-H", f"AccessKey: {BUNNY_STORAGE_PASSWORD}",
        "-H", "Content-Type: application/octet-stream",
        "--data-binary", f"@{local_path}",
        "-w", "%{http_code}",
        "-o", "/dev/null",
        url
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=45)
        code = result.stdout.strip()
        return code in ("200", "201")
    except Exception as e:
        return False

def main():
    # Step 1: Resize all images
    hero_resized = RESIZED_DIR / "hero"
    og_resized = RESIZED_DIR / "og"
    hero_resized.mkdir(parents=True, exist_ok=True)
    og_resized.mkdir(parents=True, exist_ok=True)
    
    hero_files = sorted(HERO_DIR.glob("*.webp"))
    og_files = sorted(OG_DIR.glob("*.webp"))
    
    print(f"Resizing {len(hero_files)} hero images...")
    for i, f in enumerate(hero_files):
        dst = hero_resized / f.name
        if not dst.exists():
            resize_and_save(f, dst, (1200, 675))
        if (i + 1) % 50 == 0:
            print(f"  Resized {i+1}/{len(hero_files)} heroes")
    print(f"  Done: {len(hero_files)} heroes resized")
    
    print(f"Resizing {len(og_files)} OG images...")
    for i, f in enumerate(og_files):
        dst = og_resized / f.name
        if not dst.exists():
            resize_and_save(f, dst, (1200, 630))
        if (i + 1) % 50 == 0:
            print(f"  Resized {i+1}/{len(og_files)} OGs")
    print(f"  Done: {len(og_files)} OGs resized")
    
    # Step 2: Upload all
    print(f"\nUploading hero images...")
    hero_ok = 0
    hero_fail = 0
    for i, f in enumerate(sorted(hero_resized.glob("*.webp"))):
        ok = upload_file(f, f"images/{f.name}")
        if ok:
            hero_ok += 1
        else:
            hero_fail += 1
            # Retry once
            time.sleep(1)
            ok = upload_file(f, f"images/{f.name}")
            if ok:
                hero_ok += 1
                hero_fail -= 1
        if (i + 1) % 25 == 0:
            print(f"  Uploaded {i+1} heroes ({hero_ok} ok, {hero_fail} fail)")
    print(f"  Hero final: {hero_ok} ok, {hero_fail} fail")
    
    print(f"\nUploading OG images...")
    og_ok = 0
    og_fail = 0
    for i, f in enumerate(sorted(og_resized.glob("*.webp"))):
        ok = upload_file(f, f"og/{f.name}")
        if ok:
            og_ok += 1
        else:
            og_fail += 1
            time.sleep(1)
            ok = upload_file(f, f"og/{f.name}")
            if ok:
                og_ok += 1
                og_fail -= 1
        if (i + 1) % 25 == 0:
            print(f"  Uploaded {i+1} OGs ({og_ok} ok, {og_fail} fail)")
    print(f"  OG final: {og_ok} ok, {og_fail} fail")
    
    print(f"\n=== TOTALS ===")
    print(f"Hero: {hero_ok}/300")
    print(f"OG: {og_ok}/300")
    print(f"Grand total: {hero_ok + og_ok}/600")

if __name__ == "__main__":
    main()
