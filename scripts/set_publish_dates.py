#!/usr/bin/env python3
"""
Set publish dates and status for all 300 articles.
- 30 articles: published, backdated from Jan 1 to build day (Mar 27, 2026)
- 270 articles: scheduled at 5/day for 54 days starting Mar 28, 2026
- After the 270 are exhausted, cron switches to 5/week (Mon-Fri, 1/day)
"""

import json
from pathlib import Path
from datetime import datetime, timedelta
import random

ARTICLES_DIR = Path("/home/ubuntu/quiet-medicine/content/articles")
BUILD_DATE = datetime(2026, 3, 27)

# Get all articles sorted by slug
articles = []
for f in sorted(ARTICLES_DIR.glob("*.json")):
    with open(f) as fp:
        data = json.load(fp)
    articles.append((f, data))

# Shuffle for variety in categories across dates
random.seed(42)
random.shuffle(articles)

# Phase 1: First 30 articles are published, backdated
# Spread across Jan 1 - Mar 27 (86 days), roughly every 2.87 days
published_count = 30
backdate_start = datetime(2026, 1, 1)
backdate_days = (BUILD_DATE - backdate_start).days  # 85 days
backdate_interval = backdate_days / published_count

for i in range(published_count):
    f, data = articles[i]
    pub_date = backdate_start + timedelta(days=int(i * backdate_interval))
    data["status"] = "published"
    data["publishDate"] = pub_date.strftime("%Y-%m-%dT10:00:00.000Z")
    data["dateISO"] = data["publishDate"]
    with open(f, "w") as fp:
        json.dump(data, fp, indent=2)

print(f"Published: {published_count} articles (Jan 1 - Mar 27, 2026)")

# Phase 2: Next 270 articles scheduled at 5/day starting Mar 28
schedule_start = BUILD_DATE + timedelta(days=1)  # Mar 28
scheduled_count = 270
day_offset = 0
articles_per_day = 5

for i in range(scheduled_count):
    idx = published_count + i
    f, data = articles[idx]
    
    # 5 articles per day
    day_num = i // articles_per_day
    pub_date = schedule_start + timedelta(days=day_num)
    
    # Stagger times within the day (6am, 8am, 10am, 12pm, 2pm MDT = 12, 14, 16, 18, 20 UTC)
    hour_offset = (i % articles_per_day) * 2
    pub_time = pub_date.replace(hour=12 + hour_offset)
    
    data["status"] = "scheduled"
    data["publishDate"] = pub_time.strftime("%Y-%m-%dT%H:00:00.000Z")
    data["dateISO"] = data["publishDate"]
    
    with open(f, "w") as fp:
        json.dump(data, fp, indent=2)

last_day = schedule_start + timedelta(days=(scheduled_count - 1) // articles_per_day)
print(f"Scheduled: {scheduled_count} articles at 5/day")
print(f"Schedule: Mar 28 - {last_day.strftime('%b %d')}, 2026 ({(scheduled_count + articles_per_day - 1) // articles_per_day} days)")

# Summary
print(f"\nTotal: {len(articles)} articles")
print(f"  Published (live now): {published_count}")
print(f"  Scheduled (5/day): {scheduled_count}")
print(f"  Days of content: {(scheduled_count + articles_per_day - 1) // articles_per_day}")
