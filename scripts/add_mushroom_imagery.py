#!/usr/bin/env python3
"""Add mushroom imagery to key pages: homepage hero, about, quizzes, assessments, start-here."""

SERVER = 'src/server/index.mjs'

with open(SERVER, 'r') as f:
    content = f.read()

CDN = 'https://quiet-medicine.b-cdn.net/images'

# 1. Homepage hero - add background image
old_hero = '<div class="hero">'
new_hero = f'<div class="hero" style="background:linear-gradient(180deg, rgba(13,11,26,0.3) 0%, rgba(13,11,26,0.7) 50%, rgba(13,11,26,0.95) 100%), url(\'{CDN}/homepage-hero-mushroom.webp\') center/cover no-repeat;min-height:520px;display:flex;align-items:center;">'

# Only replace the FIRST occurrence (homepage)
idx = content.find(old_hero)
if idx >= 0:
    content = content[:idx] + new_hero + content[idx + len(old_hero):]
    print("1. Added homepage hero mushroom background image")
else:
    print("1. SKIP - homepage hero not found")

# 2. Quizzes hero - add background image
old_quiz_hero = """'<div class="hero" style="padding:60px 24px 40px;">\\n' +
    '  <div class="hero-content"><h1>Quizzes</h1>"""
new_quiz_hero = f"""'<div class="hero" style="padding:60px 24px 40px;background:linear-gradient(180deg, rgba(13,11,26,0.4) 0%, rgba(13,11,26,0.85) 100%), url(\\'{CDN}/mushroom-hero-quizzes.webp\\') center/cover no-repeat;min-height:300px;display:flex;align-items:center;">\\n' +
    '  <div class="hero-content"><h1>Quizzes</h1>"""

if old_quiz_hero in content:
    content = content.replace(old_quiz_hero, new_quiz_hero)
    print("2. Added quizzes hero mushroom background image")
else:
    print("2. SKIP - quizzes hero not found")

# 3. Assessments hero - add background image
old_assess_hero = """'<div class="hero" style="padding:60px 24px 40px;">\\n' +
    '  <div class="hero-content"><h1>Assessments</h1>"""
new_assess_hero = f"""'<div class="hero" style="padding:60px 24px 40px;background:linear-gradient(180deg, rgba(13,11,26,0.4) 0%, rgba(13,11,26,0.85) 100%), url(\\'{CDN}/mushroom-hero-assessments.webp\\') center/cover no-repeat;min-height:300px;display:flex;align-items:center;">\\n' +
    '  <div class="hero-content"><h1>Assessments</h1>"""

if old_assess_hero in content:
    content = content.replace(old_assess_hero, new_assess_hero)
    print("3. Added assessments hero mushroom background image")
else:
    print("3. SKIP - assessments hero not found")

# 4. About page - add mushroom image near editorial team section
old_about_team = '<h2 style="font-size:clamp(24px,3.5vw,32px);margin:56px 0 12px;font-family:\'Newsreader\',serif;">Our Editorial Team</h2>'
new_about_team = f'<img src="{CDN}/about-team-mushroom.webp" alt="Medicinal mushrooms and botanical research" style="width:100%;height:280px;object-fit:cover;border-radius:16px;margin:40px 0 32px;" loading="lazy">\n  <h2 style="font-size:clamp(24px,3.5vw,32px);margin:24px 0 12px;font-family:\'Newsreader\',serif;">Our Editorial Team</h2>'

if old_about_team in content:
    content = content.replace(old_about_team, new_about_team)
    print("4. Added about page mushroom image above editorial team")
else:
    print("4. SKIP - about editorial team header not found")

# 5. Add a decorative mushroom section divider on the homepage between featured and latest
old_section = '<div class="section-head"><h2>Latest</h2><a href="/articles">View All &rarr;</a></div>'
new_section = f'<div style="margin:40px auto;max-width:900px;"><img src="{CDN}/mushroom-psychedelic-pattern.webp" alt="Psychedelic mushroom art" style="width:100%;height:200px;object-fit:cover;border-radius:16px;opacity:0.7;" loading="lazy"></div>\n  <div class="section-head"><h2>Latest</h2><a href="/articles">View All &rarr;</a></div>'

if old_section in content:
    content = content.replace(old_section, new_section, 1)  # Only first occurrence
    print("5. Added mushroom section divider on homepage")
else:
    print("5. SKIP - latest section head not found")

# 6. Add CSS for hero background animation
old_hero_css = '.hero {'
new_hero_css = """.hero {
      background-size: cover !important;
      background-position: center !important;"""

# Only add once - check if already there
if 'background-size: cover !important' not in content:
    idx = content.find(old_hero_css)
    if idx >= 0:
        content = content[:idx] + new_hero_css + content[idx + len(old_hero_css):]
        print("6. Added hero CSS background properties")
    else:
        print("6. SKIP - hero CSS not found")
else:
    print("6. SKIP - hero CSS already has background properties")

# 7. Start Here page - check if it exists and add mushroom image
if '/start-here' in content:
    old_start = "Start Here</h1>"
    if old_start in content:
        new_start = f'Start Here</h1>\n  <img src="{CDN}/start-here-mushroom.webp" alt="A single mushroom growing from rich soil" style="width:100%;max-width:700px;height:300px;object-fit:cover;border-radius:16px;margin:24px auto;display:block;" loading="lazy">'
        content = content.replace(old_start, new_start, 1)
        print("7. Added start-here page mushroom image")
    else:
        print("7. SKIP - start-here h1 not found")
else:
    print("7. SKIP - no start-here page")

with open(SERVER, 'w') as f:
    f.write(content)

print("\nDone! Mushroom imagery integrated across the site.")
