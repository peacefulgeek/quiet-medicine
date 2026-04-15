#!/usr/bin/env python3
"""Rewrite all articles: 1200-1800 words, Kalesh voice, no emdash, no AI words, 
2 conversational interjections, varied sentences, truly human."""

import json, os, asyncio, re, random, time
from openai import AsyncOpenAI

client = AsyncOpenAI()
CONTENT_DIR = os.path.join(os.path.dirname(__file__), '..', 'content', 'articles')

INTERJECTIONS = [
    "Stay with me here.",
    "I know, I know.",
    "Wild, right?",
    "Think about that for a second.",
    "Sit with that for a moment.",
    "Here's the thing, though.",
    "Bear with me on this one.",
    "Sounds strange, I know.",
    "Not what you expected, right?",
    "Let that land for a second.",
    "Worth pausing on, honestly.",
    "Weird as that sounds.",
]

KALESH_PHRASES = [
    "The mind is not the enemy. The identification with it is.",
    "Most of what passes for healing is just rearranging the furniture in a burning house.",
    "Awareness doesn't need to be cultivated. It needs to be uncovered.",
    "The nervous system doesn't respond to what you believe. It responds to what it senses.",
    "You cannot think your way into a felt sense of safety. The body has its own logic.",
    "Every resistance is information. The question is whether you're willing to read it.",
    "The gap between stimulus and response is where your entire life lives.",
    "Consciousness doesn't arrive. It's what's left when everything else quiets down.",
    "The brain is prediction machinery. Anxiety is just prediction running without a stop button.",
    "There is no version of growth that doesn't involve the dissolution of something you thought was permanent.",
    "Sit with it long enough and even the worst feeling reveals its edges.",
    "Silence is not the absence of noise. It's the presence of attention.",
    "The breath doesn't need your management. It needs your companionship.",
    "We are not our thoughts, but we are responsible for our relationship to them.",
    "The body remembers what the mind would prefer to file away.",
    "Information without integration is just intellectual hoarding.",
    "Your nervous system doesn't care about your philosophy. It cares about what happened at three years old.",
    "Reading about meditation is to meditation what reading the menu is to eating.",
    "The wellness industry sells solutions to problems it helps you believe you have.",
    "Complexity is the ego's favorite hiding place.",
    "The research is clear on this, and it contradicts almost everything popular culture teaches.",
    "Stop pathologizing normal human suffering. Not everything requires a diagnosis.",
    "The body has a grammar. Most of us never learned to read it.",
    "You are not a problem to be solved. You are a process to be witnessed.",
    "Freedom is not the absence of constraint. It's the capacity to choose your relationship to it.",
]

BANNED_AI_WORDS = [
    "profound", "profoundly", "transformative", "holistic", "nuanced", "multifaceted",
    "delve", "delving", "tapestry", "leverage", "leveraging", "paradigm", "paradigm shift",
    "synergy", "synergistic", "robust", "robustly", "comprehensive", "comprehensively",
    "facilitate", "facilitating", "optimize", "optimizing", "utilize", "utilizing",
    "innovative", "groundbreaking", "cutting-edge", "state-of-the-art",
    "embark", "embarking", "journey of", "realm", "realm of",
    "pivotal", "crucial", "vital", "essential", "fundamental",
    "moreover", "furthermore", "additionally", "consequently",
    "in conclusion", "it is important to note", "it's worth noting",
    "manifest", "manifestation", "lean into", "hold space", "sacred journey",
    "divine feminine", "divine masculine", "twin flame", "starseed", "lightworker",
    "ascension", "raise your vibration", "authentic self", "safe space", "sacred container",
    "showing up for",
]

BANNED_ENDINGS = [
    "your healing matters", "you are not alone", "the journey continues",
    "take the first step", "begin today", "start your journey",
]

SYSTEM_PROMPT = """You are rewriting an article for The Quiet Medicine, a psychedelic wellness publication. 
The author is Kalesh, a consciousness teacher and writer.

VOICE RULES (non-negotiable):
1. Write in long, unfolding sentences that build and turn. Average 18-28 words per sentence. Write 3-4 flowing sentences, then drop a short one like a stone. Paragraphs breathe - open wide, explore, close sharply.
2. Lead with intellectual warmth. 40% teaching, 30% tender, 20% philosophical, 10% fierce.
3. Cross-traditional: reference Buddhism, Taoism, Vedanta, and neuroscience equally. Comfortable with paradox. Never say "the divine" or "God" - say "awareness" or "consciousness" or "what's always been here."
4. Use "we" and "one" more than "you." Rarely use direct address. Never "my friend" or "sweetheart."
5. Build analogies across 2-3 sentences before revealing the point.
6. End sections with questions that open rather than close.
7. Use triads: "not the thought, not the thinker, but the space in which both appear"

FORMATTING RULES (non-negotiable):
1. ZERO em-dashes (—). Use ..., -, or ~ instead for pauses and asides.
2. ZERO of these AI-flagged words: profound, profoundly, transformative, holistic, nuanced, multifaceted, delve, delving, tapestry, leverage, paradigm, synergy, robust, comprehensive, facilitate, optimize, utilize, innovative, groundbreaking, cutting-edge, embark, realm, pivotal, crucial, vital, essential, fundamental, moreover, furthermore, additionally, consequently, manifest, manifestation, lean into, hold space, sacred journey, authentic self, safe space
3. Include EXACTLY 2 conversational interjections from this list (place them naturally in the flow, not at the start of paragraphs): "Stay with me here.", "I know, I know.", "Wild, right?", "Think about that for a second.", "Sit with that for a moment.", "Here's the thing, though.", "Bear with me on this one.", "Sounds strange, I know."
4. Vary sentence lengths aggressively. Mix 5-word punches with 30-word flowing sentences.
5. No repetitive starters like "This is/means/creates." Start sentences differently every time.
6. Write in HTML with <h2>, <h3>, <p> tags. No markdown.
7. Include 3-5 Kalesh voice phrases naturally woven into the text (not as standalone quotes).
8. Target: 1200-1800 words. Not one word over 1800.
9. Keep the same topic, title, category, and key information. Just rewrite the prose.
10. Do NOT end with banned phrases like "your healing matters", "you are not alone", "the journey continues", "take the first step", "begin today", "start your journey."
11. The final H2 should be unique and specific to the article topic - not generic.
12. Include the same number of FAQs as the original (in the same FAQ section format).
13. Write like a real human who has sat with these topics for decades. Google should never flag this as AI."""

async def rewrite_article(article_data, semaphore):
    slug = article_data.get('slug', 'unknown')
    async with semaphore:
        title = article_data.get('title', '')
        body = article_data.get('body', '')
        category = article_data.get('category', '')
        faqs = article_data.get('faqs', [])
        
        # Count FAQs in original
        faq_count = len(faqs) if faqs else 0
        # Also check body for FAQ sections
        faq_body_count = body.count('<h3>') if '<h3>' in body else 0
        
        user_prompt = f"""Rewrite this article completely in Kalesh's voice. Same topic, same category ({category}), same title: "{title}"

Keep {faq_count} FAQs if the original has them (in an FAQ section at the end with <h2> and <h3> tags).

Original article body (rewrite this entirely - don't copy phrases):
{body[:6000]}

Remember: 1200-1800 words. Zero em-dashes. Zero AI words. 2 interjections. Kalesh voice throughout. HTML format."""

        for attempt in range(3):
            try:
                response = await client.chat.completions.create(
                    model="gpt-4.1-mini",
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.85,
                    max_tokens=4000,
                )
                new_body = response.choices[0].message.content.strip()
                
                # Clean up any markdown artifacts
                if new_body.startswith('```html'):
                    new_body = new_body[7:]
                if new_body.endswith('```'):
                    new_body = new_body[:-3]
                new_body = new_body.strip()
                
                # Force remove any em-dashes that slipped through
                new_body = new_body.replace('—', '...')
                new_body = new_body.replace('–', '-')
                
                # Force remove banned AI words
                for word in ['profound', 'profoundly', 'transformative', 'holistic', 'nuanced', 
                             'multifaceted', 'delve', 'delving', 'tapestry', 'leverage', 'leveraging',
                             'paradigm', 'synergy', 'robust', 'comprehensive', 'facilitate', 'optimize',
                             'utilize', 'innovative', 'groundbreaking', 'cutting-edge', 'embark',
                             'embarking', 'realm', 'pivotal', 'crucial', 'vital', 'essential',
                             'fundamental', 'moreover', 'furthermore', 'additionally', 'consequently',
                             'manifest', 'manifestation', 'lean into', 'hold space', 'sacred journey',
                             'authentic self', 'safe space', 'sacred container', 'showing up for',
                             'raise your vibration']:
                    pattern = re.compile(r'\b' + re.escape(word) + r'\b', re.IGNORECASE)
                    replacements = {
                        'profound': 'deep', 'profoundly': 'deeply', 'transformative': 'life-changing',
                        'holistic': 'whole-person', 'nuanced': 'subtle', 'multifaceted': 'layered',
                        'delve': 'dig', 'delving': 'digging', 'tapestry': 'fabric',
                        'leverage': 'use', 'leveraging': 'using', 'paradigm': 'framework',
                        'synergy': 'connection', 'robust': 'strong', 'comprehensive': 'thorough',
                        'facilitate': 'support', 'optimize': 'improve', 'utilize': 'use',
                        'innovative': 'new', 'groundbreaking': 'pioneering', 'cutting-edge': 'leading',
                        'embark': 'begin', 'embarking': 'beginning', 'realm': 'area',
                        'pivotal': 'key', 'crucial': 'critical', 'vital': 'important',
                        'essential': 'necessary', 'fundamental': 'core', 'moreover': 'and',
                        'furthermore': 'also', 'additionally': 'also', 'consequently': 'so',
                        'manifest': 'emerge', 'manifestation': 'expression',
                        'lean into': 'move toward', 'hold space': 'be present',
                        'sacred journey': 'personal path', 'authentic self': 'real self',
                        'safe space': 'supportive environment', 'sacred container': 'supportive setting',
                        'showing up for': 'being present for', 'raise your vibration': 'shift your state',
                    }
                    replacement = replacements.get(word.lower(), 'notable')
                    new_body = pattern.sub(replacement, new_body)
                
                # Word count check
                text_only = re.sub(r'<[^>]+>', ' ', new_body)
                word_count = len(text_only.split())
                
                print(f"  [{slug}] {word_count} words (attempt {attempt+1})")
                return new_body, word_count
                
            except Exception as e:
                print(f"  [{slug}] Error attempt {attempt+1}: {e}")
                await asyncio.sleep(5 * (attempt + 1))
        
        print(f"  [{slug}] FAILED after 3 attempts - keeping original")
        return None, 0

async def main():
    files = sorted([f for f in os.listdir(CONTENT_DIR) if f.endswith('.json')])
    print(f"Found {len(files)} articles to rewrite")
    
    semaphore = asyncio.Semaphore(8)  # 8 concurrent rewrites
    
    # Process in batches of 50
    batch_size = 50
    total_done = 0
    total_in_range = 0
    total_words = 0
    
    for batch_start in range(0, len(files), batch_size):
        batch_files = files[batch_start:batch_start + batch_size]
        print(f"\n=== Batch {batch_start//batch_size + 1}: articles {batch_start+1}-{batch_start+len(batch_files)} ===")
        
        tasks = []
        articles = []
        for f in batch_files:
            path = os.path.join(CONTENT_DIR, f)
            with open(path) as fh:
                data = json.load(fh)
            articles.append((f, path, data))
            tasks.append(rewrite_article(data, semaphore))
        
        results = await asyncio.gather(*tasks)
        
        for (f, path, data), (new_body, word_count) in zip(articles, results):
            if new_body:
                data['body'] = new_body
                data['wordCount'] = word_count
                with open(path, 'w') as fh:
                    json.dump(data, fh, indent=2)
                total_done += 1
                total_words += word_count
                if 1200 <= word_count <= 1800:
                    total_in_range += 1
            else:
                total_done += 1
        
        print(f"  Batch complete. Total: {total_done}/{len(files)}")
    
    avg = total_words // total_done if total_done else 0
    print(f"\n=== REWRITE COMPLETE ===")
    print(f"Total rewritten: {total_done}")
    print(f"In range (1200-1800): {total_in_range}/{total_done}")
    print(f"Average words: {avg}")

asyncio.run(main())
