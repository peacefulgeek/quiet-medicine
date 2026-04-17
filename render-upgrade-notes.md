# Render Upgrade Addendum - Key Tasks

## Context
This is an UPGRADE, not a rebuild. Patch existing code. The site is quiet-medicine (flat-file JSON, no DB).

## What applies to quiet-medicine (flat-file site):
1. render.yaml - add/update
2. Fix setTimeout overflow (check if exists)
3. Cron schedule alignment (already have 4 phases, addendum wants 5)
4. Quality gate library (src/lib/article-quality-gate.mjs)
5. Amazon verify library (src/lib/amazon-verify.mjs) 
6. Image handling - ensure every article has images, WebP on Bunny CDN
7. AI-flagged words/phrases cleanup on existing articles
8. Voice signals enforcement
9. Design tokens CSS
10. Pre-push verification

## What does NOT apply (DB-dependent, we use flat JSON files):
- DB tables (verified_asins, failed_asins)
- DB queries in refresh crons
- matchProducts from DB catalog
- psql verification commands

## Adaptation strategy:
- All DB operations -> flat JSON file operations
- verified_asins table -> asin-health-report.json (already exists)
- Article storage -> content/articles/*.json (already exists)
- Quality gate -> run against JSON article bodies
- Image pipeline -> check existing images, fix broken ones via Bunny CDN
