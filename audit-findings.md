# Audit Findings

## Server
- Binds 0.0.0.0 ✓ (line 1867)
- Reads process.env.PORT ✓ (defaults to 3000)
- NO /health endpoint - NEEDS ADDING
- No Manus dependencies ✓
- No matchProducts function ✓ (not needed, flat-file)
- No setTimeout overflow ✓
- No setInterval overflow ✓

## render.yaml
- EXISTS but needs upgrade: plan free->starter, PORT 3000->10000, healthCheckPath /->health, add env vars

## Crons (current)
1. Hourly publish check (0 * * * *)
2. Mon-Fri 12:00 UTC article gen (0 12 * * 1-5)
3. Saturday 14:00 UTC spotlight (0 14 * * 6)
4. Sunday 06:00 UTC ASIN health check (0 6 * * 0)

## Crons (addendum wants)
1. Mon-Fri 06:00 UTC article gen (0 6 * * 1-5)
2. Saturday 08:00 UTC spotlight (0 8 * * 6)
3. 1st of month 03:00 UTC monthly refresh (0 3 1 * *)
4. Jan/Apr/Jul/Oct 1st 04:00 UTC quarterly refresh (0 4 1 1,4,7,10 *)
5. Sunday 05:00 UTC ASIN health check (0 5 * * 0)

## Images
- 300/303 have hero images on Bunny CDN ✓
- 3 missing hero images: best-milligram-scales, essential-books, stamets-stack
- 0/303 have body images (in-article images)
- All hero images are .webp on b-cdn.net ✓

## Libraries needed
- src/lib/ directory doesn't exist - needs creating
- Need: amazon-verify.mjs, article-quality-gate.mjs, image-pipeline.mjs
- Need: design tokens CSS

## AI word/phrase cleanup
- Need to audit all 303 articles for expanded AI word/phrase lists
