#!/usr/bin/env python3
"""
Upgrade quizzes and assessments in the server file:
1. Replace old quizzes array with 7 new mushroom-focused quizzes
2. Replace old assessments array with 6 new mushroom-focused assessments
3. Update nav to include Quizzes and Assessments links
4. Update quiz/assessment result rendering to show Amazon product recommendations
5. Add hero images to quiz/assessment index pages
6. Add disclaimers to assessment pages
"""
import json, re

SERVER = 'src/server/index.mjs'
BUNNY = 'https://quiet-medicine.b-cdn.net/images'
TAG = 'spankyspinola-20'

# ─── NEW QUIZZES ───
NEW_QUIZZES = [
  {
    "slug": "which-mushroom-is-right-for-you",
    "title": "Which Mushroom Is Right for You?",
    "desc": "Based on your health goals, lifestyle, and experience level, discover which functional or psychedelic mushroom species aligns with your needs.",
    "heroImage": f"{BUNNY}/mushroom-hero-quizzes.webp",
    "questions": [
      {"q": "What is your primary wellness goal right now?", "opts": ["Sharper focus and mental clarity", "Better sleep and stress relief", "Immune system support", "Deep emotional or spiritual work"]},
      {"q": "How would you describe your experience with mushrooms?", "opts": ["Complete beginner, never tried any", "I take basic supplements sometimes", "I cook with gourmet mushrooms regularly", "I have experience with psychedelic mushrooms"]},
      {"q": "What format do you prefer for supplements?", "opts": ["Capsules I can take quickly", "Powder I can add to coffee or smoothies", "Tinctures and liquid extracts", "Whole mushrooms I can cook with"]},
      {"q": "How do you feel about earthy, mushroom-y flavors?", "opts": ["Not a fan at all", "I can tolerate them", "I actually enjoy them", "I love strong umami flavors"]},
      {"q": "What time of day do you want to take your mushroom supplement?", "opts": ["Morning for energy and focus", "Afternoon for sustained performance", "Evening for wind-down and recovery", "I want something I can take any time"]},
      {"q": "How important is scientific research backing to you?", "opts": ["Very important, I want clinical evidence", "Somewhat important", "I trust traditional use as much as studies", "I go by personal experience above all"]},
    ],
    "results": [
      {"title": "Lion's Mane: The Brain Mushroom", "text": "Your focus on mental clarity and cognitive performance points straight to Lion's Mane (Hericium erinaceus). This remarkable fungus contains compounds called hericenones and erinacines that stimulate nerve growth factor (NGF) production in the brain. Research from Tohoku University showed significant cognitive improvement in adults who took Lion's Mane daily for 16 weeks. Start with 500mg twice daily and give it at least 4 weeks to notice effects.", "products": [{"asin": "B078SZX3ML", "name": "Real Mushrooms Lion's Mane Capsules"}, {"asin": "0525510311", "name": "Entangled Life by Merlin Sheldrake"}, {"asin": "B0CRKX1VV7", "name": "The Psychedelic Integration Journal"}]},
      {"title": "Reishi: The Calming Adaptogen", "text": "Your need for stress relief and better sleep makes Reishi (Ganoderma lucidum) your ideal match. Known as the \"mushroom of immortality\" in traditional Chinese medicine, Reishi contains triterpenes and beta-glucans that modulate the immune system and calm the nervous system. A 2012 study in the Journal of Ethnopharmacology found that Reishi extract significantly improved sleep quality and reduced fatigue. Take it in the evening, about an hour before bed, starting with 1-2 grams daily.", "products": [{"asin": "B078SZX3ML", "name": "Real Mushrooms Organic Capsules"}, {"asin": "B074TBYWGS", "name": "Silk Sleep Eye Mask"}, {"asin": "1646119266", "name": "Guided Meditation Journal"}]},
      {"title": "Turkey Tail: The Immune Warrior", "text": "Your focus on immune support leads to Turkey Tail (Trametes versicolor), one of the most researched medicinal mushrooms on the planet. Turkey Tail contains polysaccharide-K (PSK) and polysaccharopeptide (PSP), both of which have been studied extensively for immune modulation. Japan has used PSK as an adjunct cancer therapy since the 1980s. Take 2-3 grams daily with food.", "products": [{"asin": "B078SZX3ML", "name": "Real Mushrooms Organic Capsules"}, {"asin": "0525510311", "name": "Entangled Life by Merlin Sheldrake"}, {"asin": "B09VK9S4JB", "name": "Mushroom Growing Kit"}]},
      {"title": "Psilocybin Mushrooms: The Deep Explorer", "text": "Your orientation toward emotional depth and spiritual work aligns with psilocybin-containing mushrooms. These are not supplements you take casually. Psilocybin is a powerful serotonergic compound that can produce profound shifts in consciousness, emotional processing, and sense of meaning. Johns Hopkins research has shown lasting positive effects from even a single guided session. If you are considering this path, preparation is everything: set, setting, intention, and ideally professional support.", "products": [{"asin": "B0885S1866", "name": "Precision Milligram Scale 50g/0.001g"}, {"asin": "B0CRKX1VV7", "name": "The Psychedelic Integration Journal"}, {"asin": "0735224153", "name": "How to Change Your Mind by Michael Pollan"}, {"asin": "1594774021", "name": "The Psychedelic Explorer's Guide"}]},
    ]
  },
  {
    "slug": "mushroom-safety-iq",
    "title": "Mushroom Safety IQ Quiz",
    "desc": "Test your knowledge of mushroom safety, identification basics, contraindications, and harm reduction. How much do you really know?",
    "heroImage": f"{BUNNY}/mushroom-science-lab.webp",
    "questions": [
      {"q": "What is the single most important rule of wild mushroom foraging?", "opts": ["Always cook mushrooms before eating", "Never eat a mushroom you cannot identify with 100% certainty", "Only forage in forests, never in fields", "Taste a small piece first to check"]},
      {"q": "Which of these is a dangerous lookalike for edible mushrooms?", "opts": ["Shiitake", "Death Cap (Amanita phalloides)", "Oyster mushroom", "Maitake"]},
      {"q": "What medication category has the most dangerous interaction with psilocybin?", "opts": ["Blood pressure medications", "Lithium and MAOIs", "Antihistamines", "Antibiotics"]},
      {"q": "How should you store dried mushrooms for maximum potency and safety?", "opts": ["In a plastic bag at room temperature", "In the refrigerator in an open container", "In an airtight container with desiccant, away from light", "Frozen in water"]},
      {"q": "What does \"set and setting\" mean in psychedelic safety?", "opts": ["The dose and the mushroom species", "Your mindset and your physical environment", "The time of day and season", "Your diet and exercise routine"]},
      {"q": "Which population should absolutely avoid psilocybin mushrooms?", "opts": ["People over 60", "People with a personal or family history of psychosis", "People who exercise regularly", "People who drink coffee"]},
      {"q": "What is the purpose of a reagent test kit for mushrooms?", "opts": ["To measure exact dosage", "To identify the species by color reaction", "To check for contamination and verify presence of psilocybin", "To improve potency"]},
    ],
    "results": [
      {"title": "Safety Novice: Time to Study Up", "text": "Your safety knowledge has some significant gaps that need addressing before you go further. This is not a criticism. It is genuinely important information that could prevent serious harm. Start with the basics: identification, contraindications, and proper storage.", "products": [{"asin": "1594774021", "name": "The Psychedelic Explorer's Guide"}, {"asin": "0735224153", "name": "How to Change Your Mind"}, {"asin": "B0CRKX1VV7", "name": "The Psychedelic Integration Journal"}]},
      {"title": "Developing Awareness: Getting There", "text": "You have a foundation of safety knowledge but there are gaps worth filling. You understand some key principles but may be fuzzy on drug interactions, storage best practices, or identification red flags.", "products": [{"asin": "B0885S1866", "name": "Precision Milligram Scale"}, {"asin": "1594774021", "name": "The Psychedelic Explorer's Guide"}, {"asin": "B0CRKX1VV7", "name": "The Psychedelic Integration Journal"}]},
      {"title": "Safety Conscious: Solid Foundation", "text": "You demonstrate strong safety awareness across identification, contraindications, and harm reduction principles. You understand the key risks and how to mitigate them.", "products": [{"asin": "B0885S1866", "name": "Precision Milligram Scale"}, {"asin": "B09VK9S4JB", "name": "Mushroom Growing Kit"}, {"asin": "0525510311", "name": "Entangled Life by Merlin Sheldrake"}]},
      {"title": "Safety Expert: You Know Your Stuff", "text": "Your mushroom safety knowledge is thorough and practical. You are well-positioned to not only keep yourself safe but to be a resource for others in your community.", "products": [{"asin": "B09VK9S4JB", "name": "Mushroom Growing Kit"}, {"asin": "0525510311", "name": "Entangled Life by Merlin Sheldrake"}, {"asin": "0060801719", "name": "The Doors of Perception by Aldous Huxley"}]},
    ]
  },
  {
    "slug": "functional-mushroom-stack-finder",
    "title": "Find Your Functional Mushroom Stack",
    "desc": "Discover the ideal combination of functional mushrooms for your specific health goals. Lion's Mane, Reishi, Cordyceps, Chaga, Turkey Tail, and more.",
    "heroImage": f"{BUNNY}/mushroom-hero-assessments.webp",
    "questions": [
      {"q": "What do you need most right now?", "opts": ["Mental performance and focus", "Physical energy and endurance", "Immune resilience", "Calm and emotional balance"]},
      {"q": "How is your energy throughout the day?", "opts": ["Crashes hard in the afternoon", "Steady but could be better", "Generally good with occasional dips", "High energy most of the time"]},
      {"q": "Do you exercise regularly?", "opts": ["Rarely", "A few times a month", "Three to four times a week", "Daily intense training"]},
      {"q": "How is your gut health?", "opts": ["Frequent digestive issues", "Occasional bloating or discomfort", "Generally fine", "Excellent, I prioritize gut health"]},
      {"q": "Are you dealing with any inflammation or chronic pain?", "opts": ["Yes, significant chronic pain", "Some inflammation or joint stiffness", "Minor occasional issues", "No inflammation concerns"]},
      {"q": "How much are you willing to spend monthly on mushroom supplements?", "opts": ["Under $30", "$30 to $60", "$60 to $100", "Whatever it takes"]},
    ],
    "results": [
      {"title": "The Focus Stack: Lion's Mane + Cordyceps", "text": "Your profile calls for a cognitive-performance stack. Lion's Mane for nerve growth factor and neuroplasticity, paired with Cordyceps for sustained energy without the jitters. Take Lion's Mane (1000mg) in the morning with breakfast and Cordyceps (500mg) before your afternoon slump.", "products": [{"asin": "B078SZX3ML", "name": "Real Mushrooms Lion's Mane Capsules"}, {"asin": "B0CRKX1VV7", "name": "The Psychedelic Integration Journal"}, {"asin": "0525510311", "name": "Entangled Life by Merlin Sheldrake"}]},
      {"title": "The Athlete Stack: Cordyceps + Chaga + Reishi", "text": "Your active lifestyle needs mushrooms that support performance and recovery. Cordyceps boosts oxygen utilization and ATP production. Chaga fights exercise-induced oxidative stress. Reishi in the evening supports deep recovery sleep.", "products": [{"asin": "B078SZX3ML", "name": "Real Mushrooms Organic Capsules"}, {"asin": "B0FPML7DJC", "name": "WHOOP 5.0 HRV Monitor"}, {"asin": "B08FR8MPCW", "name": "Acupressure Mat for Recovery"}]},
      {"title": "The Immunity Stack: Turkey Tail + Chaga + Maitake", "text": "Your immune system needs reinforcement. Turkey Tail is the most researched immune mushroom. Chaga provides massive antioxidant protection. Maitake contains D-fraction, studied for immune activation.", "products": [{"asin": "B078SZX3ML", "name": "Real Mushrooms Organic Capsules"}, {"asin": "B09VK9S4JB", "name": "Mushroom Growing Kit"}, {"asin": "0525510311", "name": "Entangled Life by Merlin Sheldrake"}]},
      {"title": "The Calm Stack: Reishi + Lion's Mane + Tremella", "text": "Your need for emotional balance calls for the adaptogenic trio. Reishi is the master calming mushroom. Lion's Mane supports emotional resilience through neuroplasticity. Tremella is deeply hydrating and nourishing.", "products": [{"asin": "B078SZX3ML", "name": "Real Mushrooms Organic Capsules"}, {"asin": "B01MR4Y0CZ", "name": "Aromatherapy Essential Oil Diffuser"}, {"asin": "1646119266", "name": "Guided Meditation Journal"}, {"asin": "B074TBYWGS", "name": "Silk Sleep Eye Mask"}]},
    ]
  },
  {
    "slug": "microdosing-mushroom-quiz",
    "title": "Microdosing Mushrooms: Are You Ready?",
    "desc": "An honest assessment of your readiness, knowledge, and preparation for a psilocybin microdosing practice. No judgment, just clarity.",
    "heroImage": f"{BUNNY}/mushroom-science-lab.webp",
    "questions": [
      {"q": "Why are you interested in microdosing?", "opts": ["I heard it helps with depression or anxiety", "I want to boost creativity and flow states", "I am curious after reading about it", "I have macro-dose experience and want a subtler practice"]},
      {"q": "Do you understand what a microdose actually is?", "opts": ["Not really, I just know it is a small amount", "I think it is about 0.1 to 0.3 grams of dried psilocybin mushrooms", "I know the dose range and that it should be sub-perceptual", "I understand dose ranges, protocols, and individual variation"]},
      {"q": "Are you currently taking any psychiatric medications?", "opts": ["Yes, SSRIs or SNRIs", "Yes, other psychiatric medications", "I recently stopped medications", "No psychiatric medications"]},
      {"q": "Do you have access to a precision scale that measures to 0.01g or better?", "opts": ["No, I would just eyeball it", "I have a kitchen scale", "I have a scale that measures to 0.01g", "I have a milligram scale (0.001g)"]},
      {"q": "How would you track your microdosing experience?", "opts": ["I probably would not track it", "Mental notes", "A simple journal or app", "Detailed daily journal with mood, sleep, creativity, and physical metrics"]},
      {"q": "Do you understand the legal status of psilocybin where you live?", "opts": ["No idea", "I think it might be illegal", "I know the general legal status", "I have researched the specific laws in my jurisdiction thoroughly"]},
    ],
    "results": [
      {"title": "Not Ready Yet: Build Your Foundation First", "text": "Honest answer: you are not ready to start microdosing, and that is completely fine. There are some important knowledge gaps and preparation steps to address first. If you are on SSRIs, consult a doctor. If you are eyeballing doses, you need a precision scale. Start with education and preparation.", "products": [{"asin": "0735224153", "name": "How to Change Your Mind by Michael Pollan"}, {"asin": "1594774021", "name": "The Psychedelic Explorer's Guide"}, {"asin": "B0CRKX1VV7", "name": "The Psychedelic Integration Journal"}]},
      {"title": "Getting Closer: A Few More Steps", "text": "You have some foundation but there are practical gaps to address. A milligram scale is not optional. It is essential safety equipment. And a structured journal turns a vague experiment into actionable data about what works for your specific brain chemistry.", "products": [{"asin": "B0885S1866", "name": "Precision Milligram Scale"}, {"asin": "B0CRKX1VV7", "name": "The Psychedelic Integration Journal"}, {"asin": "0735224153", "name": "How to Change Your Mind"}]},
      {"title": "Well Prepared: Ready to Begin Carefully", "text": "Your knowledge, tools, and approach suggest you are in a good position to explore microdosing thoughtfully. Start with the Fadiman Protocol (one day on, two days off) at the lowest dose you think might work, then adjust.", "products": [{"asin": "B0885S1866", "name": "Precision Milligram Scale"}, {"asin": "B0CRKX1VV7", "name": "The Psychedelic Integration Journal"}, {"asin": "B078SZX3ML", "name": "Lion's Mane Capsules (Stamets Stack)"}]},
      {"title": "Deeply Prepared: Experienced and Equipped", "text": "You bring significant knowledge, proper equipment, and a structured approach to microdosing. Consider the Stamets Stack (psilocybin + Lion's Mane + niacin) for enhanced neurogenesis.", "products": [{"asin": "B078SZX3ML", "name": "Lion's Mane Capsules (Stamets Stack)"}, {"asin": "B0885S1866", "name": "Precision Milligram Scale"}, {"asin": "B0CRKX1VV7", "name": "The Psychedelic Integration Journal"}, {"asin": "0525510311", "name": "Entangled Life by Merlin Sheldrake"}]},
    ]
  },
  {
    "slug": "edible-mushroom-personality",
    "title": "What's Your Edible Mushroom Personality?",
    "desc": "A fun quiz to discover which gourmet and culinary mushroom matches your cooking style, flavor preferences, and kitchen confidence.",
    "heroImage": f"{BUNNY}/mushroom-hero-assessments.webp",
    "questions": [
      {"q": "How adventurous are you in the kitchen?", "opts": ["I stick to recipes I know", "I try new things occasionally", "I experiment regularly", "I treat cooking as creative expression"]},
      {"q": "What flavor profile do you gravitate toward?", "opts": ["Mild and familiar", "Rich and savory (umami)", "Bold and earthy", "Complex and layered"]},
      {"q": "How do you feel about foraging your own food?", "opts": ["That sounds terrifying", "Interesting but I would need a guide", "I have done it or would love to try", "I forage regularly"]},
      {"q": "What is your go-to cooking method?", "opts": ["Quick stir-fry or saute", "Slow-cooked soups and stews", "Grilling or roasting", "Raw or lightly prepared"]},
      {"q": "How important is the health benefit of what you eat?", "opts": ["I eat for taste, not health", "I think about it sometimes", "I actively choose nutrient-dense foods", "Food is medicine to me"]},
    ],
    "results": [
      {"title": "Button & Cremini: The Reliable Classic", "text": "You are the white button and cremini mushroom. Approachable, versatile, and more interesting than people give you credit for. Cremini mushrooms have a deeper flavor than white buttons and work in everything from pasta to pizza.", "products": [{"asin": "B09VK9S4JB", "name": "Mushroom Growing Kit"}, {"asin": "0525510311", "name": "Entangled Life by Merlin Sheldrake"}, {"asin": "B078SZX3ML", "name": "Lion's Mane Supplement"}]},
      {"title": "Shiitake: The Umami Master", "text": "You are the shiitake mushroom. Rich, deeply savory, and packed with lentinan. Shiitakes bring that deep umami backbone to stir-fries, ramen, risotto, and dashi broth.", "products": [{"asin": "B09VK9S4JB", "name": "Mushroom Growing Kit"}, {"asin": "B078SZX3ML", "name": "Real Mushrooms Supplement"}, {"asin": "0525510311", "name": "Entangled Life"}]},
      {"title": "Maitake: The Wild Forager", "text": "You are the maitake, also called Hen of the Woods. Found growing at the base of oak trees in autumn, maitake is prized by foragers and chefs alike.", "products": [{"asin": "B09VK9S4JB", "name": "Mushroom Growing Kit"}, {"asin": "0525510311", "name": "Entangled Life by Merlin Sheldrake"}, {"asin": "B078SZX3ML", "name": "Real Mushrooms Supplement"}]},
      {"title": "Lion's Mane: The Culinary Innovator", "text": "You are Lion's Mane. When sliced thick and seared in butter, this mushroom develops a texture and flavor remarkably similar to crab or lobster. It is the mushroom that makes non-mushroom-lovers reconsider everything.", "products": [{"asin": "B09VK9S4JB", "name": "Mushroom Growing Kit"}, {"asin": "B078SZX3ML", "name": "Lion's Mane Capsules"}, {"asin": "0525510311", "name": "Entangled Life"}]},
    ]
  },
  {
    "slug": "mushroom-blend-builder",
    "title": "Build Your Custom Mushroom Blend",
    "desc": "Answer questions about your daily routine, health priorities, and preferences to get a personalized mushroom supplement blend recommendation.",
    "heroImage": f"{BUNNY}/mushroom-forest-magical.webp",
    "questions": [
      {"q": "What time do you wake up?", "opts": ["Before 6 AM", "6 to 8 AM", "8 to 10 AM", "After 10 AM"]},
      {"q": "How would you describe your stress level?", "opts": ["Constantly overwhelmed", "High but manageable", "Moderate, comes and goes", "Low, I manage stress well"]},
      {"q": "Do you drink coffee or tea?", "opts": ["Multiple cups of coffee daily", "One cup of coffee in the morning", "I prefer tea", "Neither, I avoid caffeine"]},
      {"q": "How is your skin health?", "opts": ["Problematic, frequent breakouts or dryness", "Okay but could be better", "Generally fine", "Great, I invest in skin health"]},
      {"q": "What is your biggest health concern right now?", "opts": ["Brain fog and poor concentration", "Low energy and fatigue", "Frequent illness or slow recovery", "Anxiety and poor sleep"]},
      {"q": "How do you feel about taking multiple supplements?", "opts": ["I want one simple product", "Two to three is fine", "I do not mind a full protocol", "I already take many supplements"]},
    ],
    "results": [
      {"title": "The Morning Clarity Blend: Lion's Mane + Cordyceps", "text": "Your early mornings and brain fog point to a clean cognitive-energy stack. Add Lion's Mane powder to your morning coffee for focus without anxiety, and Cordyceps for sustained physical energy.", "products": [{"asin": "B078SZX3ML", "name": "Real Mushrooms Lion's Mane Capsules"}, {"asin": "B0CRKX1VV7", "name": "Wellness Tracking Journal"}, {"asin": "0525510311", "name": "Entangled Life"}]},
      {"title": "The Resilience Blend: Chaga + Turkey Tail + Cordyceps", "text": "Your immune concerns and energy needs call for the resilience trio. Chaga brings the highest antioxidant load. Turkey Tail provides proven beta-glucan immune support. Cordyceps fills the energy gap.", "products": [{"asin": "B078SZX3ML", "name": "Real Mushrooms Organic Capsules"}, {"asin": "B09VK9S4JB", "name": "Mushroom Growing Kit"}, {"asin": "0525510311", "name": "Entangled Life"}]},
      {"title": "The Beauty + Brain Blend: Tremella + Lion's Mane + Reishi", "text": "Your skin concerns and stress levels point to the beauty-brain-calm trio. Tremella holds 500 times its weight in water, deeply hydrating skin from within.", "products": [{"asin": "B078SZX3ML", "name": "Real Mushrooms Organic Capsules"}, {"asin": "B01MR4Y0CZ", "name": "Aromatherapy Diffuser"}, {"asin": "1646119266", "name": "Guided Meditation Journal"}]},
      {"title": "The Full Spectrum Protocol: 5-Mushroom Daily Stack", "text": "You are ready for the comprehensive approach. Lion's Mane (1000mg morning), Cordyceps (500mg morning), Chaga (500mg midday), Turkey Tail (1000mg with meals), and Reishi (1500mg evening). Cycle 5 days on, 2 days off.", "products": [{"asin": "B078SZX3ML", "name": "Real Mushrooms Organic Capsules"}, {"asin": "B0CRKX1VV7", "name": "Wellness Tracking Journal"}, {"asin": "B0FPML7DJC", "name": "WHOOP 5.0 HRV Monitor"}, {"asin": "0525510311", "name": "Entangled Life"}]},
    ]
  },
  {
    "slug": "mushroom-myths-vs-facts",
    "title": "Mushroom Myths vs. Facts",
    "desc": "Can you separate mushroom science from mushroom folklore? Test your knowledge of common misconceptions about both culinary and psychedelic mushrooms.",
    "heroImage": f"{BUNNY}/mushroom-psychedelic-pattern.webp",
    "questions": [
      {"q": "True or false: All brightly colored mushrooms are poisonous.", "opts": ["True, bright colors always mean danger", "False, color alone does not determine toxicity", "True, but only red and orange ones", "It depends on the season"]},
      {"q": "Can you build a tolerance to psilocybin mushrooms?", "opts": ["No, each experience is the same", "Yes, tolerance builds rapidly within days", "Only if you take very high doses", "Tolerance takes months to develop"]},
      {"q": "Are mushroom supplements all created equal?", "opts": ["Yes, a mushroom is a mushroom", "No, many supplements use mycelium on grain, not actual fruiting bodies", "Only organic ones matter", "Price determines quality"]},
      {"q": "Can you overdose fatally on psilocybin mushrooms alone?", "opts": ["Yes, easily", "Yes, at high doses", "The lethal dose is estimated at 1.7 kg of dried mushrooms, making fatal overdose practically impossible", "There is no lethal dose"]},
      {"q": "Do cooking mushrooms destroy their nutritional value?", "opts": ["Yes, always eat them raw", "Cooking actually makes many mushroom nutrients more bioavailable", "It does not matter either way", "Only microwaving destroys nutrients"]},
      {"q": "Is the \"Stamets Stack\" for microdosing scientifically proven?", "opts": ["Yes, multiple clinical trials confirm it", "It has theoretical backing and anecdotal support but lacks large-scale clinical trials", "It has been debunked", "It only works with specific mushroom strains"]},
    ],
    "results": [
      {"title": "Myth Believer: Time for a Reality Check", "text": "You have absorbed some common mushroom myths that could lead you astray. The biggest misconception: color does not indicate toxicity, and not all supplements are the same.", "products": [{"asin": "0735224153", "name": "How to Change Your Mind"}, {"asin": "0525510311", "name": "Entangled Life"}, {"asin": "B078SZX3ML", "name": "Real Mushrooms (Fruiting Body Extract)"}]},
      {"title": "Mixed Knowledge: Some Myths Still Lingering", "text": "You got some right and some wrong. The supplement quality question trips up most people. Many products labeled \"mushroom\" are actually mycelium grown on grain.", "products": [{"asin": "B078SZX3ML", "name": "Real Mushrooms (Fruiting Body)"}, {"asin": "0525510311", "name": "Entangled Life"}, {"asin": "B0CRKX1VV7", "name": "The Psychedelic Integration Journal"}]},
      {"title": "Fact-Based Thinker: Well Informed", "text": "You have a strong grasp of mushroom science versus folklore. Your critical thinking serves you well in a space full of marketing hype and misinformation.", "products": [{"asin": "B09VK9S4JB", "name": "Mushroom Growing Kit"}, {"asin": "0525510311", "name": "Entangled Life"}, {"asin": "B078SZX3ML", "name": "Real Mushrooms Supplement"}]},
      {"title": "Mycology Scholar: You Know Your Fungi", "text": "You can separate science from folklore with precision. Your knowledge base is solid enough to help others cut through the noise in the mushroom wellness space.", "products": [{"asin": "B09VK9S4JB", "name": "Mushroom Growing Kit"}, {"asin": "0060801719", "name": "The Doors of Perception"}, {"asin": "0525510311", "name": "Entangled Life"}, {"asin": "B0885S1866", "name": "Precision Milligram Scale"}]},
    ]
  },
]

# ─── NEW ASSESSMENTS ───
NEW_ASSESSMENTS = [
  {
    "slug": "mushroom-supplement-readiness",
    "title": "Mushroom Supplement Readiness Assessment",
    "desc": "A thorough evaluation of your health background, current medications, and goals to determine which functional mushroom supplements are safe and appropriate for you.",
    "heroImage": f"{BUNNY}/mushroom-hero-assessments.webp",
    "questions": [
      {"q": "Are you currently taking any blood-thinning medications (warfarin, aspirin, heparin)?", "opts": ["Yes", "No", "I am not sure"]},
      {"q": "Do you have any autoimmune conditions (lupus, rheumatoid arthritis, MS, etc.)?", "opts": ["Yes, diagnosed", "Suspected but not diagnosed", "No"]},
      {"q": "Are you pregnant, breastfeeding, or planning to become pregnant?", "opts": ["Yes", "Possibly", "No"]},
      {"q": "Do you have any known allergies to molds or fungi?", "opts": ["Yes, confirmed allergy", "I have had reactions but not tested", "No known allergies"]},
      {"q": "Are you currently taking immunosuppressant medications?", "opts": ["Yes", "I was recently but stopped", "No"]},
      {"q": "Have you had any organ transplants?", "opts": ["Yes", "No"]},
      {"q": "Do you have low blood pressure or take blood pressure medication?", "opts": ["Yes, both", "Low blood pressure only", "Blood pressure medication only", "Neither"]},
      {"q": "Are you scheduled for surgery in the next two weeks?", "opts": ["Yes", "No"]},
    ],
    "results": [
      {"title": "Proceed with Caution: Medical Consultation Required", "text": "Based on your responses, there are potential contraindications that require professional medical guidance before starting mushroom supplements. Several functional mushrooms can interact with blood thinners, affect blood sugar, and modulate immune function. Please bring this assessment to your doctor.", "products": [{"asin": "0143127748", "name": "The Body Keeps the Score"}, {"asin": "1646119266", "name": "Guided Meditation Journal"}, {"asin": "B0CHVYY8P4", "name": "Therapy Journal with Guided Prompts"}]},
      {"title": "Low Risk: Start Slowly with Basic Species", "text": "Your health profile suggests a low-risk starting point for functional mushroom supplements. Begin with well-researched species like Lion's Mane or Turkey Tail. Start at half the recommended dose for the first week.", "products": [{"asin": "B078SZX3ML", "name": "Real Mushrooms Lion's Mane Capsules"}, {"asin": "B0CRKX1VV7", "name": "Wellness Tracking Journal"}, {"asin": "0525510311", "name": "Entangled Life by Merlin Sheldrake"}]},
      {"title": "Good to Go: Full Spectrum Available", "text": "Your health profile shows no major contraindications. You have a wide range of species available to you. Quality matters enormously: look for fruiting body supplements with verified beta-glucan content.", "products": [{"asin": "B078SZX3ML", "name": "Real Mushrooms Organic Capsules"}, {"asin": "B09VK9S4JB", "name": "Mushroom Growing Kit"}, {"asin": "0525510311", "name": "Entangled Life"}, {"asin": "B0CRKX1VV7", "name": "Wellness Tracking Journal"}]},
    ]
  },
  {
    "slug": "psychedelic-readiness-assessment",
    "title": "Psychedelic Mushroom Readiness Assessment",
    "desc": "A comprehensive evaluation of your mental health history, support system, and preparation level for a psychedelic mushroom experience. Honest, clinical, no hype.",
    "heroImage": f"{BUNNY}/mushroom-psychedelic-pattern.webp",
    "questions": [
      {"q": "Do you have a personal or family history of schizophrenia, schizoaffective disorder, or psychotic episodes?", "opts": ["Yes, personal history", "Yes, family history", "Not that I know of", "No"]},
      {"q": "Are you currently taking lithium, tramadol, or MAO inhibitors?", "opts": ["Yes, one or more of these", "I recently stopped one of these", "No"]},
      {"q": "Do you have a trusted person who could serve as a sitter or guide?", "opts": ["No, I would do it alone", "I have friends but none with experience", "I have someone willing but inexperienced", "I have an experienced sitter or professional guide"]},
      {"q": "How would you describe your current mental health?", "opts": ["In active crisis or severe distress", "Struggling but stable", "Generally okay with some challenges", "Stable and grounded"]},
      {"q": "What is your experience with meditation or mindfulness practices?", "opts": ["None", "I have tried it a few times", "Regular but inconsistent practice", "Established daily practice"]},
      {"q": "Have you researched what a psychedelic experience actually involves?", "opts": ["Not really", "I have read some articles", "I have read multiple books and trip reports", "I have extensive research and/or personal experience"]},
      {"q": "Do you have a clear intention for why you want this experience?", "opts": ["Not really, just curious", "Vague sense of wanting growth", "Specific intention I can articulate", "Deep, well-considered intention with preparation work done"]},
      {"q": "Are you in a stable life situation (housing, relationships, work)?", "opts": ["Multiple areas of instability", "Some instability", "Mostly stable", "Very stable"]},
    ],
    "results": [
      {"title": "Not Recommended at This Time", "text": "Based on your responses, a psychedelic mushroom experience is not recommended right now. If you have a history of psychosis or are taking lithium/MAOIs, psilocybin carries serious risks. Please prioritize conventional mental health support first.", "products": [{"asin": "0143127748", "name": "The Body Keeps the Score"}, {"asin": "B0CHVYY8P4", "name": "Therapy Journal"}, {"asin": "1646119266", "name": "Guided Meditation Journal"}]},
      {"title": "More Preparation Needed", "text": "You have some readiness factors in place but important gaps remain. Focus on: having an experienced sitter, building a meditation practice, and clarifying your intention. Spend 2-3 months on preparation.", "products": [{"asin": "0735224153", "name": "How to Change Your Mind"}, {"asin": "1594774021", "name": "The Psychedelic Explorer's Guide"}, {"asin": "B0CRKX1VV7", "name": "The Psychedelic Integration Journal"}, {"asin": "B0D2K8N8NR", "name": "Meditation Cushion"}]},
      {"title": "Approaching Readiness", "text": "Your profile shows meaningful preparation and a solid foundation. Consider a low-dose experience (1-1.5g dried) as your first step rather than a full dose.", "products": [{"asin": "B0885S1866", "name": "Precision Milligram Scale"}, {"asin": "B0CRKX1VV7", "name": "The Psychedelic Integration Journal"}, {"asin": "B09XS7JWHH", "name": "Sony WH-1000XM5 Headphones"}, {"asin": "B0DK86ZBNJ", "name": "Cozy Therapy Blanket"}]},
      {"title": "Well Prepared: Strong Foundation", "text": "Your assessment indicates thorough preparation across all key dimensions. The remaining steps are practical: confirm your sitter, prepare your space, prepare a playlist, and set aside 8 hours with no obligations the following day.", "products": [{"asin": "B09XS7JWHH", "name": "Sony WH-1000XM5 Headphones"}, {"asin": "B0DK86ZBNJ", "name": "Cozy Therapy Blanket"}, {"asin": "B0CRKX1VV7", "name": "The Psychedelic Integration Journal"}, {"asin": "B074TBYWGS", "name": "Silk Sleep Eye Mask"}]},
    ]
  },
  {
    "slug": "mushroom-growing-readiness",
    "title": "Home Mushroom Cultivation Readiness",
    "desc": "Assess whether you have the space, patience, and knowledge to successfully grow mushrooms at home. From oyster mushrooms to lion's mane.",
    "heroImage": f"{BUNNY}/mushroom-forest-magical.webp",
    "questions": [
      {"q": "Do you have a clean, temperature-controlled indoor space you can dedicate to growing?", "opts": ["No dedicated space", "A closet or small area I could use", "A spare room or basement", "I have a dedicated growing area already set up"]},
      {"q": "How patient are you with slow processes?", "opts": ["I want results fast", "I can wait a few weeks", "I enjoy slow, methodical processes", "I find waiting meditative"]},
      {"q": "How comfortable are you with sterile technique?", "opts": ["Not very", "I can follow instructions", "I am naturally careful and detail-oriented", "I have lab or medical experience with sterile technique"]},
      {"q": "What is your budget for getting started?", "opts": ["Under $25", "$25 to $75", "$75 to $200", "Over $200"]},
      {"q": "Which mushrooms are you most interested in growing?", "opts": ["Oyster mushrooms (easiest)", "Shiitake", "Lion's Mane", "Multiple species including more challenging ones"]},
      {"q": "How do you handle setbacks and failed experiments?", "opts": ["I get frustrated and quit", "Disappointed but I try again", "I analyze what went wrong and adjust", "Failure is part of the process, I expect it"]},
    ],
    "results": [
      {"title": "Start with a Ready-Made Kit", "text": "Your current setup points to starting with a pre-made mushroom growing kit. These come with fully colonized substrate. Just open, mist daily, and harvest in 7-14 days. Oyster mushroom kits have the highest success rate for beginners.", "products": [{"asin": "B09VK9S4JB", "name": "Mushroom Growing Kit"}, {"asin": "0525510311", "name": "Entangled Life by Merlin Sheldrake"}, {"asin": "B0CRKX1VV7", "name": "Growing Journal"}]},
      {"title": "Ready for Intermediate Growing", "text": "You have the patience, space, and mindset for intermediate mushroom cultivation. Start with oyster mushrooms on straw (very forgiving) and progress to shiitake on supplemented sawdust.", "products": [{"asin": "B09VK9S4JB", "name": "Mushroom Growing Kit"}, {"asin": "0525510311", "name": "Entangled Life"}, {"asin": "B0CRKX1VV7", "name": "Cultivation Journal"}]},
      {"title": "Advanced Cultivator Potential", "text": "Your combination of dedicated space, patience, sterile technique comfort, and resilience positions you for serious mushroom cultivation. Consider building a still-air box or investing in a laminar flow hood.", "products": [{"asin": "B09VK9S4JB", "name": "Mushroom Growing Kit"}, {"asin": "B0885S1866", "name": "Precision Scale"}, {"asin": "0525510311", "name": "Entangled Life"}, {"asin": "B078SZX3ML", "name": "Lion's Mane Supplement"}]},
    ]
  },
  {
    "slug": "integration-readiness-assessment",
    "title": "Psychedelic Integration Readiness",
    "desc": "After a psychedelic mushroom experience, integration is where the real work happens. Assess your readiness to process and apply what you experienced.",
    "heroImage": f"{BUNNY}/mushroom-psychedelic-pattern.webp",
    "questions": [
      {"q": "How soon after your experience are you taking this assessment?", "opts": ["During or immediately after", "Within the first week", "One to four weeks after", "More than a month after"]},
      {"q": "Can you articulate what happened during your experience?", "opts": ["It is completely overwhelming and confusing", "I have fragments but cannot make sense of them", "I can describe the main themes and feelings", "I have a clear narrative with specific insights"]},
      {"q": "Do you have someone you can talk to about your experience?", "opts": ["No one who would understand", "Friends but they have no psychedelic experience", "A friend or partner with psychedelic experience", "A therapist or integration specialist"]},
      {"q": "How are you sleeping since your experience?", "opts": ["Barely sleeping, racing thoughts", "Disrupted but functional", "About the same as before", "Better than before"]},
      {"q": "Are you experiencing persistent anxiety, depersonalization, or intrusive thoughts?", "opts": ["Yes, significantly", "Mildly", "Briefly but they passed", "No"]},
      {"q": "Do you have a journaling or reflective practice?", "opts": ["No", "I have tried but do not stick with it", "Occasional journaling", "Regular journaling or contemplative practice"]},
      {"q": "Have you made any impulsive major life decisions since your experience?", "opts": ["Yes, several", "I am considering major changes", "I have ideas but I am sitting with them", "No, I am letting things settle"]},
    ],
    "results": [
      {"title": "Seek Professional Support", "text": "Your responses suggest you may be experiencing challenging after-effects that would benefit from professional support. The Fireside Project (62-FIRESIDE) offers free peer support. MAPS maintains a directory of integration therapists.", "products": [{"asin": "0143127748", "name": "The Body Keeps the Score"}, {"asin": "B0CHVYY8P4", "name": "Therapy Journal with Guided Prompts"}, {"asin": "B0CRKX1VV7", "name": "The Psychedelic Integration Journal"}]},
      {"title": "Active Integration Phase", "text": "You are in the active integration window. Write everything down before it fades, avoid major life decisions for at least two weeks, and find someone to talk to who can hold space without judgment.", "products": [{"asin": "B0CRKX1VV7", "name": "The Psychedelic Integration Journal"}, {"asin": "B0D2K8N8NR", "name": "Meditation Cushion"}, {"asin": "1646119266", "name": "Guided Meditation Journal"}]},
      {"title": "Grounded Integration", "text": "You are processing your experience from a stable, grounded place. The work now is translating insight into action. What specific changes did the experience point toward?", "products": [{"asin": "B0CRKX1VV7", "name": "The Psychedelic Integration Journal"}, {"asin": "B0D2K8N8NR", "name": "Meditation Cushion"}, {"asin": "0062429655", "name": "Stealing Fire by Steven Kotler"}]},
    ]
  },
  {
    "slug": "mushroom-knowledge-level",
    "title": "Your Mushroom Knowledge Level",
    "desc": "A comprehensive assessment of your mycological knowledge across identification, cultivation, pharmacology, history, and ecology.",
    "heroImage": f"{BUNNY}/mushroom-hero-quizzes.webp",
    "questions": [
      {"q": "Can you name the five parts of a typical mushroom fruiting body?", "opts": ["I could not name any", "I know cap and stem", "I know cap, stem, gills, and maybe one more", "Cap, stem, gills, ring (annulus), and volva"]},
      {"q": "What is mycelium?", "opts": ["The mushroom cap", "The underground root-like network of fungal threads", "A type of mushroom spore", "The soil mushrooms grow in"]},
      {"q": "What role do fungi play in forest ecosystems?", "opts": ["They are parasites that harm trees", "They decompose dead matter only", "They form mycorrhizal networks that connect and nourish trees, decompose organic matter, and cycle nutrients", "They compete with plants for sunlight"]},
      {"q": "What is the difference between a spore print and a spore syringe?", "opts": ["No idea", "I know what a spore print is but not a syringe", "I understand both conceptually", "I can explain both and have made or used them"]},
      {"q": "Who is Paul Stamets and why is he significant?", "opts": ["Never heard of him", "I think he is a mushroom scientist", "He is a prominent mycologist and advocate for fungal solutions", "I know his work in detail including patents, books, and the Stamets Stack"]},
      {"q": "What is the Wood Wide Web?", "opts": ["A website about trees", "The mycorrhizal network connecting trees through fungal threads underground", "A type of spider web found in forests", "I am not sure"]},
      {"q": "Can you explain saprotrophic, mycorrhizal, and parasitic fungi?", "opts": ["No", "I know one of these terms", "I understand two of the three", "I can explain all three and give examples of each"]},
    ],
    "results": [
      {"title": "Mushroom Curious: Welcome to the Kingdom", "text": "You are at the beginning of what could become a lifelong fascination. Fungi are the hidden kingdom that makes life on Earth possible. Start with Merlin Sheldrake's Entangled Life for a mind-expanding introduction.", "products": [{"asin": "0525510311", "name": "Entangled Life by Merlin Sheldrake"}, {"asin": "B09VK9S4JB", "name": "Mushroom Growing Kit"}, {"asin": "0735224153", "name": "How to Change Your Mind"}]},
      {"title": "Developing Mycophile: Building Knowledge", "text": "You have a foundation that puts you ahead of most people. The next level involves hands-on experience: growing mushrooms, learning spore printing, and understanding ecological relationships.", "products": [{"asin": "B09VK9S4JB", "name": "Mushroom Growing Kit"}, {"asin": "0525510311", "name": "Entangled Life"}, {"asin": "B078SZX3ML", "name": "Real Mushrooms Supplement"}]},
      {"title": "Knowledgeable Mycophile: Solid Understanding", "text": "Your mycological knowledge is substantial. Your next growth edge might be in specialized areas: medicinal mushroom pharmacology, advanced cultivation techniques, or fungal taxonomy.", "products": [{"asin": "B09VK9S4JB", "name": "Mushroom Growing Kit"}, {"asin": "0525510311", "name": "Entangled Life"}, {"asin": "0060801719", "name": "The Doors of Perception"}, {"asin": "B0885S1866", "name": "Precision Scale"}]},
      {"title": "Advanced Mycologist: Deep Expertise", "text": "Your knowledge spans fungal biology, ecology, pharmacology, cultivation, and cultural history. You are the kind of person who could teach others or contribute to citizen science projects.", "products": [{"asin": "0525510311", "name": "Entangled Life"}, {"asin": "0060801719", "name": "The Doors of Perception"}, {"asin": "B09VK9S4JB", "name": "Advanced Growing Kit"}]},
    ]
  },
  {
    "slug": "mushroom-interaction-risk",
    "title": "Mushroom-Drug Interaction Risk Assessment",
    "desc": "Evaluate potential interactions between mushroom supplements or psilocybin and your current medications. Safety first, always.",
    "heroImage": f"{BUNNY}/mushroom-science-lab.webp",
    "questions": [
      {"q": "Which category best describes your current medications?", "opts": ["SSRIs or SNRIs (antidepressants)", "Lithium, MAOIs, or tricyclic antidepressants", "Blood thinners (warfarin, Eliquis, Xarelto)", "Blood pressure or heart medications", "Immunosuppressants", "Diabetes medications", "I take no prescription medications"]},
      {"q": "What type of mushroom product are you considering?", "opts": ["Functional supplements only (Lion's Mane, Reishi, etc.)", "Psilocybin microdosing", "Psilocybin macro-dose experience", "Both functional supplements and psilocybin"]},
      {"q": "How many different medications do you take daily?", "opts": ["None", "One to two", "Three to five", "More than five"]},
      {"q": "Do you consume alcohol regularly?", "opts": ["Daily", "Several times a week", "Occasionally", "Rarely or never"]},
      {"q": "Have you ever had an adverse reaction to a supplement or herbal product?", "opts": ["Yes, serious reaction", "Yes, mild reaction", "Not that I recall", "No"]},
      {"q": "Are you taking any serotonin-affecting supplements (St. John's Wort, 5-HTP, SAMe)?", "opts": ["Yes, one or more", "I am not sure", "No"]},
    ],
    "results": [
      {"title": "HIGH RISK: Do Not Proceed Without Medical Supervision", "text": "Your medication profile indicates HIGH RISK for dangerous interactions. Lithium + psilocybin can trigger seizures. MAOIs + psilocybin can cause serotonin syndrome. DO NOT combine any mushroom product with your current medications without explicit physician approval.", "products": [{"asin": "0143127748", "name": "The Body Keeps the Score"}, {"asin": "B0CHVYY8P4", "name": "Therapy Journal"}, {"asin": "1646119266", "name": "Guided Meditation Journal"}]},
      {"title": "MODERATE RISK: Medical Consultation Required", "text": "Your profile shows moderate interaction risk. SSRIs significantly reduce psilocybin effects and there are theoretical serotonin risks. Reishi and Maitake can affect blood pressure and blood sugar. Schedule a conversation with your doctor.", "products": [{"asin": "0735224153", "name": "How to Change Your Mind"}, {"asin": "B0CRKX1VV7", "name": "The Psychedelic Integration Journal"}, {"asin": "B078SZX3ML", "name": "Real Mushrooms Supplement"}]},
      {"title": "LOW RISK: Proceed Mindfully", "text": "Your medication profile suggests low interaction risk. Start with low doses, introduce one new product at a time, and monitor your response for at least a week before adjusting.", "products": [{"asin": "B078SZX3ML", "name": "Real Mushrooms Lion's Mane"}, {"asin": "B0885S1866", "name": "Precision Milligram Scale"}, {"asin": "B0CRKX1VV7", "name": "Wellness Tracking Journal"}, {"asin": "0525510311", "name": "Entangled Life"}]},
    ]
  },
]

DISCLAIMER_HTML = '''<div style="margin-top:24px;padding:16px 20px;background:rgba(255,107,107,0.08);border-left:3px solid #ff6b6b;border-radius:8px;font-size:13px;line-height:1.7;color:var(--text-dim);"><strong style="color:#ff6b6b;">Important Disclaimer:</strong> This assessment is for educational and informational purposes only. It is not medical advice, diagnosis, or treatment. Mushroom supplements and psychedelic substances carry risks including drug interactions, allergic reactions, and psychological effects. Always consult a qualified healthcare provider before starting any new supplement regimen or considering psychedelic use. Psilocybin remains a controlled substance in most jurisdictions. The Quiet Medicine does not encourage or condone illegal activity. Individual results vary. You assume all responsibility for your own health decisions.</div>'''

# Read the server file
with open(SERVER, 'r') as f:
    content = f.read()

# 1. Replace quizzes array (lines 1489-1589)
quiz_start = content.find('var quizzes = [')
quiz_end = content.find('];', quiz_start) + 2
old_quizzes = content[quiz_start:quiz_end]
new_quizzes_js = 'var quizzes = ' + json.dumps(NEW_QUIZZES, indent=2) + ';'
content = content.replace(old_quizzes, new_quizzes_js)

# 2. Replace assessments array (lines 1684-1792)
assess_start = content.find('var assessments = [')
assess_end = content.find('];', assess_start) + 2
old_assessments = content[assess_start:assess_end]
new_assessments_js = 'var assessments = ' + json.dumps(NEW_ASSESSMENTS, indent=2) + ';'
content = content.replace(old_assessments, new_assessments_js)

# 3. Update nav to include Quizzes and Assessments
old_nav = '''    <a href="/articles">Articles</a>
    <a href="/start-here">Start Here</a>
    <a href="/about">About</a>
    <a href="/start-here" class="nav-cta">Begin</a>'''
new_nav = '''    <a href="/articles">Articles</a>
    <a href="/quizzes">Quizzes</a>
    <a href="/assessments">Assessments</a>
    <a href="/about">About</a>
    <a href="/start-here" class="nav-cta">Begin</a>'''
content = content.replace(old_nav, new_nav)

# 4. Update quiz result rendering to show Amazon product recommendations
# Find the showResult function in quiz pages and add product rendering
old_quiz_result_display = "document.getElementById(\"resultText\").textContent = r.text;"
new_quiz_result_display = '''document.getElementById("resultText").textContent = r.text;
      // Show Amazon product recommendations
      if (r.products && r.products.length > 0) {
        var prodHtml = '<div style="margin-top:32px;text-align:left;"><h3 style="font-size:18px;color:var(--accent);margin-bottom:16px;">Recommended Products</h3>';
        r.products.forEach(function(p) {
          prodHtml += '<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;margin-bottom:8px;background:rgba(124,77,255,0.06);border-radius:8px;border:1px solid rgba(124,77,255,0.15);"><span style="font-size:20px;">\\ud83c\\udf44</span><div><a href=\\"https://www.amazon.com/dp/' + p.asin + '?tag=spankyspinola-20\\" target=\\"_blank\\" rel=\\"nofollow sponsored\\" style=\\"color:var(--accent);text-decoration:none;font-weight:600;\\">' + p.name + '</a><span style=\\"font-size:11px;color:var(--text-dim);margin-left:8px;\\">(paid link)</span></div></div>';
        });
        prodHtml += '</div>';
        document.getElementById("resultText").insertAdjacentHTML("afterend", prodHtml);
      }'''

# Replace in quiz showResult (first occurrence)
content = content.replace(old_quiz_result_display, new_quiz_result_display, 1)

# 5. Update assessment result rendering similarly
# The assessment showResult also sets resultText
old_assess_result = '''document.getElementById("resultText").textContent = r.text;
      var breakdown'''
new_assess_result = '''document.getElementById("resultText").textContent = r.text;
      // Show Amazon product recommendations
      if (r.products && r.products.length > 0) {
        var prodHtml = '<div style="margin-top:32px;text-align:left;"><h3 style="font-size:18px;color:var(--accent);margin-bottom:16px;">Recommended Products</h3>';
        r.products.forEach(function(p) {
          prodHtml += '<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;margin-bottom:8px;background:rgba(124,77,255,0.06);border-radius:8px;border:1px solid rgba(124,77,255,0.15);"><span style="font-size:20px;">\\ud83c\\udf44</span><div><a href=\\"https://www.amazon.com/dp/' + p.asin + '?tag=spankyspinola-20\\" target=\\"_blank\\" rel=\\"nofollow sponsored\\" style=\\"color:var(--accent);text-decoration:none;font-weight:600;\\">' + p.name + '</a><span style=\\"font-size:11px;color:var(--text-dim);margin-left:8px;\\">(paid link)</span></div></div>';
        });
        prodHtml += '</div>';
        document.getElementById("resultText").insertAdjacentHTML("afterend", prodHtml);
      }
      // Show disclaimer
      document.getElementById("resultText").insertAdjacentHTML("afterend", \'''' + DISCLAIMER_HTML.replace("'", "\\'") + '''\');
      var breakdown'''
content = content.replace(old_assess_result, new_assess_result)

# 6. Update quiz index page to show hero images
old_quiz_index_card = "return '<div class=\"quiz-index-card\"><h3><a href=\"/quiz/' + q.slug + '\">' + q.title + '</a></h3><p>' + q.desc + '</p></div>';"
new_quiz_index_card = "return '<div class=\"quiz-index-card\">' + (q.heroImage ? '<img src=\"' + q.heroImage + '\" alt=\"' + q.title + '\" style=\"width:100%;height:180px;object-fit:cover;border-radius:12px 12px 0 0;margin:-20px -20px 16px;width:calc(100% + 40px);\">' : '') + '<h3><a href=\"/quiz/' + q.slug + '\">' + q.title + '</a></h3><p>' + q.desc + '</p></div>';"
content = content.replace(old_quiz_index_card, new_quiz_index_card)

# Same for assessment index
old_assess_index_card = "return '<div class=\"quiz-index-card\"><h3><a href=\"/assessment/' + a.slug + '\">' + a.title + '</a></h3><p>' + a.desc + '</p></div>';"
new_assess_index_card = "return '<div class=\"quiz-index-card\">' + (a.heroImage ? '<img src=\"' + a.heroImage + '\" alt=\"' + a.title + '\" style=\"width:100%;height:180px;object-fit:cover;border-radius:12px 12px 0 0;margin:-20px -20px 16px;width:calc(100% + 40px);\">' : '') + '<h3><a href=\"/assessment/' + a.slug + '\">' + a.title + '</a></h3><p>' + a.desc + '</p></div>';"
content = content.replace(old_assess_index_card, new_assess_index_card)

# 7. Update footer links
old_footer_quiz = '<a href="/quiz/microdosing-readiness">Quizzes</a>'
new_footer_quiz = '<a href="/quizzes">Quizzes</a>\n      <a href="/assessments">Assessments</a>'
content = content.replace(old_footer_quiz, new_footer_quiz)

# Write the updated file
with open(SERVER, 'w') as f:
    f.write(content)

print("Server file updated successfully!")
print(f"  - Replaced {len(NEW_QUIZZES)} quizzes")
print(f"  - Replaced {len(NEW_ASSESSMENTS)} assessments")
print("  - Updated nav with Quizzes + Assessments links")
print("  - Added Amazon product recs to quiz results")
print("  - Added Amazon product recs + disclaimers to assessment results")
print("  - Added hero images to index cards")
print("  - Updated footer links")
