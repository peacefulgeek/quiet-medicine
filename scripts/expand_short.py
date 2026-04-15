#!/usr/bin/env python3
"""Expand articles under 1200 words to 1200-1500 range."""

import json, os, asyncio, re
from openai import AsyncOpenAI

client = AsyncOpenAI()
CONTENT_DIR = os.path.join(os.path.dirname(__file__), '..', 'content', 'articles')

SHORT_SLUGS = [
    "brain-imaging-ketamine", "bufo-alvarius-toad-medicine", "bwiti-tradition-iboga",
    "claustrum-psychedelic-consciousness", "consistency-matters-more-than-dose",
    "contraindications-psychedelic-treatment", "dose-vs-depth",
    "ego-dissolution-therapeutic-outcomes", "entropic-brain-hypothesis-explained",
    "first-week-microdosing-feels-strange", "fmri-studies-psychedelic-states",
    "genetics-psychedelic-sensitivity", "gut-brain-axis-psychedelic-medicine",
    "integration-meditation-practice", "ketamine-glutamate-different-mechanism",
    "ketamine-repairs-synaptic-connections", "lsd-entropy-neural-networks",
    "microdosing-addiction-recovery", "microdosing-chronic-fatigue",
    "microdosing-mushrooms-vs-truffles", "microdosing-protocol-duration",
    "microdosing-psilocybin-ptsd", "music-clinical-psychedelic-sessions",
    "music-psychedelic-neuroscience", "nature-in-integration",
    "neuroscience-psychedelic-visual-phenomena", "preparing-first-psychedelic-experience",
    "psilocybin-prefrontal-cortex", "psilocybin-sleep-architecture",
    "psychedelic-death-awareness", "psychedelic-experiences-feminine",
    "psychedelic-experiences-forgiveness", "psychedelic-microdosing-placebo-effects",
    "psychedelic-therapy-social-anxiety", "psychedelics-affect-amygdala",
    "psychedelics-autoimmune-early-research", "psychedelics-thalamic-filter-theory",
    "some-days-feel-different-microdosing", "spiritual-dimension-microdosing",
    "why-some-journeys-silent",
]

SYSTEM_PROMPT = """You are expanding an article for The Quiet Medicine by Kalesh, a consciousness teacher.

RULES:
1. Keep the EXACT same HTML structure, headings, and topic.
2. Add 200-400 more words of content by deepening existing sections - add more examples, analogies, Kalesh voice phrases, and conversational depth.
3. Do NOT add new H2 sections. Expand within existing sections.
4. ZERO em-dashes. Use ..., -, or ~ instead.
5. ZERO AI words: profound, transformative, holistic, nuanced, multifaceted, delve, tapestry, leverage, paradigm, synergy, robust, comprehensive, facilitate, optimize, utilize, innovative, groundbreaking, cutting-edge, embark, realm, pivotal, crucial, vital, essential, fundamental, moreover, furthermore, additionally, consequently, manifest, manifestation.
6. Write like Kalesh: long unfolding sentences (18-28 words avg), then short drops. Intellectual warmth. Cross-traditional references. Uses "we" more than "you."
7. Target: 1250-1500 words total.
8. Return the COMPLETE expanded article body in HTML."""

async def expand_article(slug, semaphore):
    async with semaphore:
        path = os.path.join(CONTENT_DIR, f"{slug}.json")
        with open(path) as f:
            data = json.load(f)
        
        body = data.get('body', '')
        title = data.get('title', '')
        text = re.sub(r'<[^>]+>', ' ', body)
        current_wc = len(text.split())
        
        for attempt in range(3):
            try:
                response = await client.chat.completions.create(
                    model="gpt-4.1-mini",
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": f"Expand this article (currently {current_wc} words, need 1250-1500) titled \"{title}\":\n\n{body}"}
                    ],
                    temperature=0.8,
                    max_tokens=4000,
                )
                new_body = response.choices[0].message.content.strip()
                if new_body.startswith('```html'):
                    new_body = new_body[7:]
                if new_body.endswith('```'):
                    new_body = new_body[:-3]
                new_body = new_body.strip()
                
                # Force cleanup
                new_body = new_body.replace('\u2014', '...')
                new_body = new_body.replace('\u2013', '-')
                
                for word, repl in [('profound','deep'),('profoundly','deeply'),('transformative','life-changing'),
                    ('holistic','whole-person'),('nuanced','subtle'),('multifaceted','layered'),
                    ('delve','dig'),('delving','digging'),('tapestry','fabric'),
                    ('leverage','use'),('paradigm','framework'),('synergy','connection'),
                    ('robust','strong'),('comprehensive','thorough'),('facilitate','support'),
                    ('optimize','improve'),('utilize','use'),('innovative','new'),
                    ('groundbreaking','pioneering'),('embark','begin'),('realm','area'),
                    ('pivotal','key'),('crucial','critical'),('vital','important'),
                    ('essential','necessary'),('fundamental','core'),('moreover','and'),
                    ('furthermore','also'),('additionally','also'),('consequently','so'),
                    ('manifest','emerge'),('manifestation','expression')]:
                    pattern = re.compile(r'\b' + re.escape(word) + r'\b', re.IGNORECASE)
                    new_body = pattern.sub(repl, new_body)
                
                new_text = re.sub(r'<[^>]+>', ' ', new_body)
                new_wc = len(new_text.split())
                
                print(f"  [{slug}] {current_wc} -> {new_wc} words")
                
                if new_wc >= 1200:
                    data['body'] = new_body
                    data['wordCount'] = new_wc
                    with open(path, 'w') as f:
                        json.dump(data, f, indent=2)
                    return new_wc
                else:
                    print(f"  [{slug}] Still too short ({new_wc}), retrying...")
                    
            except Exception as e:
                print(f"  [{slug}] Error: {e}")
                await asyncio.sleep(5)
        
        print(f"  [{slug}] FAILED to expand")
        return current_wc

async def main():
    print(f"Expanding {len(SHORT_SLUGS)} articles")
    semaphore = asyncio.Semaphore(2)
    results = []
    # Process in small batches with delays to avoid rate limits
    for i in range(0, len(SHORT_SLUGS), 4):
        batch = SHORT_SLUGS[i:i+4]
        tasks = [expand_article(slug, semaphore) for slug in batch]
        batch_results = await asyncio.gather(*tasks)
        results.extend(batch_results)
        if i + 4 < len(SHORT_SLUGS):
            print(f'  Waiting 30s before next batch...')
            await asyncio.sleep(30)
    
    in_range = sum(1 for wc in results if 1200 <= wc <= 1800)
    print(f"\nDone. In range: {in_range}/{len(SHORT_SLUGS)}")

asyncio.run(main())
