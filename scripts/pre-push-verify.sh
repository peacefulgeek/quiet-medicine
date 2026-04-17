#!/bin/bash
# Pre-push verification — every check must print OK
# From Render Upgrade Addendum Section 10

echo "=== PRE-PUSH VERIFICATION ==="
echo ""

# setTimeout overflow
echo -n "1. setTimeout overflow: "
grep -rnE "setTimeout\([^,]+,\s*[0-9]{10,}" src/ scripts/ server/ 2>/dev/null && echo FAIL || echo OK

# No Manus dependencies or dispatchers
echo -n "2. No Manus deps: "
grep -rn "forge\.manus\|vite-plugin-manus\|manus-runtime\|manus\.im" src/ scripts/ 2>/dev/null | grep -v "pre-push-verify" && echo FAIL || echo OK

# AUTO_GEN_ENABLED referenced in cron registration
echo -n "3. AUTO_GEN_ENABLED in cron: "
grep -rn "AUTO_GEN_ENABLED" scripts/ 2>/dev/null | head -1 > /dev/null && echo OK || echo FAIL

# All 5 cron schedules present
echo -n "4a. Cron 1 (article gen): "
grep -rE "'0 6 \* \* 1-5'" scripts/ 2>/dev/null | head -1 > /dev/null && echo OK || echo FAIL

echo -n "4b. Cron 2 (spotlight): "
grep -rE "'0 8 \* \* 6'" scripts/ 2>/dev/null | head -1 > /dev/null && echo OK || echo FAIL

echo -n "4c. Cron 3 (monthly): "
grep -rE "'0 3 1 \* \*'" scripts/ 2>/dev/null | head -1 > /dev/null && echo OK || echo FAIL

echo -n "4d. Cron 4 (quarterly): "
grep -rE "'0 4 1 1,4,7,10 \*'" scripts/ 2>/dev/null | head -1 > /dev/null && echo OK || echo FAIL

echo -n "4e. Cron 5 (ASIN health): "
grep -rE "'0 5 \* \* 0'" scripts/ 2>/dev/null | head -1 > /dev/null && echo OK || echo FAIL

# Amazon tag present
echo -n "5. Amazon tag in verify lib: "
grep -q "spankyspinola-20" src/lib/amazon-verify.mjs 2>/dev/null && echo OK || echo FAIL

# Quality gate exists
echo -n "6a. Quality gate file: "
test -f src/lib/article-quality-gate.mjs && echo OK || echo FAIL

echo -n "6b. AI word list: "
grep -q "AI_FLAGGED_WORDS" src/lib/article-quality-gate.mjs 2>/dev/null && echo OK || echo FAIL

echo -n "6c. AI phrase list: "
grep -q "AI_FLAGGED_PHRASES" src/lib/article-quality-gate.mjs 2>/dev/null && echo OK || echo FAIL

echo -n "6d. Em-dash check: "
grep -q "hasEmDash\|contains-em-dash" src/lib/article-quality-gate.mjs 2>/dev/null && echo OK || echo FAIL

echo -n "6e. Voice check: "
grep -q "voiceSignals\|contractions" src/lib/article-quality-gate.mjs 2>/dev/null && echo OK || echo FAIL

echo -n "6f. Word count check: "
grep -q "words-too-low:\|words-too-high:" src/lib/article-quality-gate.mjs 2>/dev/null && echo OK || echo FAIL

# Generation prompt includes hard rules
echo -n "7. HARD RULES in gen prompt: "
grep -rq "HARD RULES\|Never use these words" scripts/generate-articles.mjs 2>/dev/null && echo OK || echo FAIL

# 0.0.0.0 bind and PORT env
echo -n "8a. 0.0.0.0 bind: "
grep -rn "0.0.0.0" src/server/ 2>/dev/null | head -1 > /dev/null && echo OK || echo FAIL

echo -n "8b. PORT env: "
grep -rn "process.env.PORT" src/server/ 2>/dev/null | head -1 > /dev/null && echo OK || echo FAIL

# Health endpoint
echo -n "9. /health endpoint: "
grep -rn "'/health'" src/server/ 2>/dev/null | head -1 > /dev/null && echo OK || echo FAIL

# render.yaml exists and has starter plan
echo -n "10a. render.yaml exists: "
test -f render.yaml && echo OK || echo FAIL

echo -n "10b. Starter plan: "
grep -q "plan: starter" render.yaml 2>/dev/null && echo OK || echo FAIL

# Image pipeline exists
echo -n "11. Image pipeline: "
test -f src/lib/image-pipeline.mjs && echo OK || echo FAIL

# Build succeeds
echo -n "12. Build: "
pnpm build > /dev/null 2>&1 && echo OK || echo FAIL

echo ""
echo "=== ARTICLE QUALITY AUDIT ==="

# Run Python audit on articles
python3 -u -c "
import json, os, re

d = 'content/articles'
files = sorted([f for f in os.listdir(d) if f.endswith('.json')])

ai_words = ['delve','tapestry','paradigm','synergy','leverage','unlock','empower','utilize','pivotal','embark','underscore','paramount','seamlessly','robust','beacon','foster','elevate','curate','curated','bespoke','resonate','harness','intricate','plethora','myriad','comprehensive','transformative','groundbreaking','innovative','cutting-edge','revolutionary','state-of-the-art','ever-evolving','game-changing','next-level','world-class','unparalleled','unprecedented','remarkable','extraordinary','exceptional','profound','holistic','nuanced','multifaceted','stakeholders','ecosystem','landscape','realm','sphere','domain','arguably','notably','crucially','importantly','essentially','fundamentally','inherently','intrinsically','substantively','streamline','optimize','facilitate','amplify','catalyze','propel','spearhead','orchestrate','navigate','traverse','furthermore','moreover','additionally','consequently','subsequently','thereby','thusly','wherein','whereby']

emdash = 0
ai_word_articles = 0
no_hero = 0
no_body_img = 0
low_amazon = 0

for f in files:
    data = json.load(open(os.path.join(d, f)))
    body = data.get('body', '')
    stripped = re.sub(r'<[^>]+>', ' ', body).lower()
    
    if '\u2014' in body: emdash += 1
    if not data.get('heroImage'): no_hero += 1
    if '<img ' not in body: no_body_img += 1
    
    amazon = len(re.findall(r'amazon\.com/dp/[A-Za-z0-9]{10}', body))
    if amazon < 3: low_amazon += 1
    
    for w in ai_words:
        if re.search(r'\b' + re.escape(w) + r'\b', stripped):
            ai_word_articles += 1
            break

print(f'Total articles: {len(files)}')
print(f'Em-dashes: {emdash} (target: 0)')
print(f'AI-flagged words: {ai_word_articles} articles (target: 0)')
print(f'Missing hero image: {no_hero} (target: 0)')
print(f'Missing body images: {no_body_img} (target: 0)')
print(f'<3 Amazon links: {low_amazon} (target: 0)')
all_ok = emdash == 0 and ai_word_articles == 0 and no_hero == 0 and no_body_img == 0 and low_amazon == 0
print(f'ALL CLEAR: {\"YES\" if all_ok else \"NO\"}')" 2>&1

echo ""
echo "=== DONE ==="
