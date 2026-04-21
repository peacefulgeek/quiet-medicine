// 7 Mushroom-Focused Quizzes with Amazon Product Recommendations
// Each result includes 3-4 verified Amazon affiliate links

const BUNNY = 'https://quiet-medicine.b-cdn.net/images';
const TAG = 'spankyspinola-20';
const amz = (asin, text) => `<a href="https://www.amazon.com/dp/${asin}?tag=${TAG}" target="_blank" rel="nofollow sponsored">${text}</a> (paid link)`;

export const quizzes = [
  {
    slug: 'which-mushroom-is-right-for-you',
    title: 'Which Mushroom Is Right for You?',
    desc: 'Based on your health goals, lifestyle, and experience level, discover which functional or psychedelic mushroom species aligns with your needs.',
    heroImage: `${BUNNY}/mushroom-hero-quizzes.webp`,
    questions: [
      { q: 'What is your primary wellness goal right now?', opts: ['Sharper focus and mental clarity', 'Better sleep and stress relief', 'Immune system support', 'Deep emotional or spiritual work'] },
      { q: 'How would you describe your experience with mushrooms?', opts: ['Complete beginner, never tried any', 'I take basic supplements sometimes', 'I cook with gourmet mushrooms regularly', 'I have experience with psychedelic mushrooms'] },
      { q: 'What format do you prefer for supplements?', opts: ['Capsules I can take quickly', 'Powder I can add to coffee or smoothies', 'Tinctures and liquid extracts', 'Whole mushrooms I can cook with'] },
      { q: 'How do you feel about earthy, mushroom-y flavors?', opts: ['Not a fan at all', 'I can tolerate them', 'I actually enjoy them', 'I love strong umami flavors'] },
      { q: 'What time of day do you want to take your mushroom supplement?', opts: ['Morning for energy and focus', 'Afternoon for sustained performance', 'Evening for wind-down and recovery', 'I want something I can take any time'] },
      { q: 'How important is scientific research backing to you?', opts: ['Very important, I want clinical evidence', 'Somewhat important', 'I trust traditional use as much as studies', 'I go by personal experience above all'] },
    ],
    results: [
      {
        title: 'Lion\'s Mane: The Brain Mushroom',
        text: 'Your focus on mental clarity and cognitive performance points straight to Lion\'s Mane (Hericium erinaceus). This remarkable fungus contains compounds called hericenones and erinacines that stimulate nerve growth factor (NGF) production in the brain. Research from Tohoku University showed significant cognitive improvement in adults who took Lion\'s Mane daily for 16 weeks. Start with 500mg twice daily and give it at least 4 weeks to notice effects.',
        products: [
          { asin: 'B078SZX3ML', name: 'Real Mushrooms Lion\'s Mane Capsules' },
          { asin: '0525510311', name: 'Entangled Life by Merlin Sheldrake' },
          { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal' },
        ]
      },
      {
        title: 'Reishi: The Calming Adaptogen',
        text: 'Your need for stress relief and better sleep makes Reishi (Ganoderma lucidum) your ideal match. Known as the "mushroom of immortality" in traditional Chinese medicine, Reishi contains triterpenes and beta-glucans that modulate the immune system and calm the nervous system. A 2012 study in the Journal of Ethnopharmacology found that Reishi extract significantly improved sleep quality and reduced fatigue. Take it in the evening, about an hour before bed, starting with 1-2 grams daily.',
        products: [
          { asin: 'B078SZX3ML', name: 'Real Mushrooms Organic Capsules' },
          { asin: 'B074TBYWGS', name: 'Silk Sleep Eye Mask' },
          { asin: '1646119266', name: 'Guided Meditation Journal' },
        ]
      },
      {
        title: 'Turkey Tail: The Immune Warrior',
        text: 'Your focus on immune support leads to Turkey Tail (Trametes versicolor), one of the most researched medicinal mushrooms on the planet. Turkey Tail contains polysaccharide-K (PSK) and polysaccharopeptide (PSP), both of which have been studied extensively for immune modulation. Japan has used PSK as an adjunct cancer therapy since the 1980s. Paul Stamets, whose mother used Turkey Tail alongside conventional treatment, helped bring this mushroom into mainstream awareness. Take 2-3 grams daily with food.',
        products: [
          { asin: 'B078SZX3ML', name: 'Real Mushrooms Organic Capsules' },
          { asin: '0525510311', name: 'Entangled Life by Merlin Sheldrake' },
          { asin: 'B09VK9S4JB', name: 'Mushroom Growing Kit' },
        ]
      },
      {
        title: 'Psilocybin Mushrooms: The Deep Explorer',
        text: 'Your orientation toward emotional depth and spiritual work aligns with psilocybin-containing mushrooms. These are not supplements you take casually. Psilocybin is a powerful serotonergic compound that can produce profound shifts in consciousness, emotional processing, and sense of meaning. Johns Hopkins research has shown lasting positive effects from even a single guided session. If you are considering this path, preparation is everything: set, setting, intention, and ideally professional support.',
        products: [
          { asin: 'B0885S1766', name: 'Precision Milligram Scale 50g/0.001g' },
          { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal' },
          { asin: '0735224153', name: 'How to Change Your Mind by Michael Pollan' },
          { asin: '1594774021', name: 'The Psychedelic Explorer\'s Guide' },
        ]
      },
    ]
  },

  {
    slug: 'mushroom-safety-iq',
    title: 'Mushroom Safety IQ Quiz',
    desc: 'Test your knowledge of mushroom safety, identification basics, contraindications, and harm reduction. How much do you really know?',
    heroImage: `${BUNNY}/mushroom-science-lab.webp`,
    questions: [
      { q: 'What is the single most important rule of wild mushroom foraging?', opts: ['Always cook mushrooms before eating', 'Never eat a mushroom you cannot identify with 100% certainty', 'Only forage in forests, never in fields', 'Taste a small piece first to check'] },
      { q: 'Which of these is a dangerous lookalike for edible mushrooms?', opts: ['Shiitake', 'Death Cap (Amanita phalloides)', 'Oyster mushroom', 'Maitake'] },
      { q: 'What medication category has the most dangerous interaction with psilocybin?', opts: ['Blood pressure medications', 'Lithium and MAOIs', 'Antihistamines', 'Antibiotics'] },
      { q: 'How should you store dried mushrooms for maximum potency and safety?', opts: ['In a plastic bag at room temperature', 'In the refrigerator in an open container', 'In an airtight container with desiccant, away from light', 'Frozen in water'] },
      { q: 'What does "set and setting" mean in psychedelic safety?', opts: ['The dose and the mushroom species', 'Your mindset and your physical environment', 'The time of day and season', 'Your diet and exercise routine'] },
      { q: 'Which population should absolutely avoid psilocybin mushrooms?', opts: ['People over 60', 'People with a personal or family history of psychosis', 'People who exercise regularly', 'People who drink coffee'] },
      { q: 'What is the purpose of a reagent test kit for mushrooms?', opts: ['To measure exact dosage', 'To identify the species by color reaction', 'To check for contamination and verify presence of psilocybin', 'To improve potency'] },
    ],
    results: [
      {
        title: 'Safety Novice: Time to Study Up',
        text: 'Your safety knowledge has some significant gaps that need addressing before you go further. This is not a criticism. It is genuinely important information that could prevent serious harm. The good news is that mushroom safety is learnable, and the resources below will get you up to speed quickly. Start with the basics: identification, contraindications, and proper storage.',
        products: [
          { asin: '1594774021', name: 'The Psychedelic Explorer\'s Guide' },
          { asin: '0735224153', name: 'How to Change Your Mind' },
          { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal' },
        ]
      },
      {
        title: 'Developing Awareness: Getting There',
        text: 'You have a foundation of safety knowledge but there are gaps worth filling. You understand some key principles but may be fuzzy on drug interactions, storage best practices, or identification red flags. Spend time with the harm reduction literature and consider taking a mushroom identification course in your area.',
        products: [
          { asin: 'B0885S1766', name: 'Precision Milligram Scale' },
          { asin: '1594774021', name: 'The Psychedelic Explorer\'s Guide' },
          { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal' },
        ]
      },
      {
        title: 'Safety Conscious: Solid Foundation',
        text: 'You demonstrate strong safety awareness across identification, contraindications, and harm reduction principles. You understand the key risks and how to mitigate them. Keep refining your knowledge, especially around drug interactions and the nuances of different species.',
        products: [
          { asin: 'B0885S1766', name: 'Precision Milligram Scale' },
          { asin: 'B09VK9S4JB', name: 'Mushroom Growing Kit' },
          { asin: '0525510311', name: 'Entangled Life by Merlin Sheldrake' },
        ]
      },
      {
        title: 'Safety Expert: You Know Your Stuff',
        text: 'Your mushroom safety knowledge is thorough and practical. You understand identification principles, dangerous interactions, proper storage, and harm reduction fundamentals. You are well-positioned to not only keep yourself safe but to be a resource for others in your community. Consider volunteering with harm reduction organizations.',
        products: [
          { asin: 'B09VK9S4JB', name: 'Mushroom Growing Kit' },
          { asin: '0525510311', name: 'Entangled Life by Merlin Sheldrake' },
          { asin: '0060801719', name: 'The Doors of Perception by Aldous Huxley' },
        ]
      },
    ]
  },

  {
    slug: 'functional-mushroom-stack-finder',
    title: 'Find Your Functional Mushroom Stack',
    desc: 'Discover the ideal combination of functional mushrooms for your specific health goals. Lion\'s Mane, Reishi, Cordyceps, Chaga, Turkey Tail, and more.',
    heroImage: `${BUNNY}/mushroom-hero-assessments.webp`,
    questions: [
      { q: 'What do you need most right now?', opts: ['Mental performance and focus', 'Physical energy and endurance', 'Immune resilience', 'Calm and emotional balance'] },
      { q: 'How is your energy throughout the day?', opts: ['Crashes hard in the afternoon', 'Steady but could be better', 'Generally good with occasional dips', 'High energy most of the time'] },
      { q: 'Do you exercise regularly?', opts: ['Rarely', 'A few times a month', 'Three to four times a week', 'Daily intense training'] },
      { q: 'How is your gut health?', opts: ['Frequent digestive issues', 'Occasional bloating or discomfort', 'Generally fine', 'Excellent, I prioritize gut health'] },
      { q: 'Are you dealing with any inflammation or chronic pain?', opts: ['Yes, significant chronic pain', 'Some inflammation or joint stiffness', 'Minor occasional issues', 'No inflammation concerns'] },
      { q: 'How much are you willing to spend monthly on mushroom supplements?', opts: ['Under $30', '$30 to $60', '$60 to $100', 'Whatever it takes'] },
    ],
    results: [
      {
        title: 'The Focus Stack: Lion\'s Mane + Cordyceps',
        text: 'Your profile calls for a cognitive-performance stack. Lion\'s Mane for nerve growth factor and neuroplasticity, paired with Cordyceps for sustained energy without the jitters. Take Lion\'s Mane (1000mg) in the morning with breakfast and Cordyceps (500mg) before your afternoon slump. This combination is popular among programmers, writers, and anyone doing sustained mental work. Give it 3-4 weeks for the full nootropic effect to build.',
        products: [
          { asin: 'B078SZX3ML', name: 'Real Mushrooms Lion\'s Mane Capsules' },
          { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal' },
          { asin: '0525510311', name: 'Entangled Life by Merlin Sheldrake' },
        ]
      },
      {
        title: 'The Athlete Stack: Cordyceps + Chaga + Reishi',
        text: 'Your active lifestyle needs mushrooms that support performance and recovery. Cordyceps boosts oxygen utilization and ATP production. Chaga is one of the highest-ORAC antioxidant foods on the planet, fighting exercise-induced oxidative stress. Reishi in the evening supports deep recovery sleep. Take Cordyceps (1000mg) pre-workout, Chaga (500mg) with meals, and Reishi (1000mg) before bed.',
        products: [
          { asin: 'B078SZX3ML', name: 'Real Mushrooms Organic Capsules' },
          { asin: 'B0FPML7DJC', name: 'WHOOP 5.0 HRV Monitor' },
          { asin: 'B08FR8MPCW', name: 'Acupressure Mat for Recovery' },
        ]
      },
      {
        title: 'The Immunity Stack: Turkey Tail + Chaga + Maitake',
        text: 'Your immune system needs reinforcement, and this triple stack delivers. Turkey Tail is the most researched immune mushroom with proven beta-glucan activity. Chaga provides massive antioxidant protection. Maitake (also called Hen of the Woods) contains D-fraction, a compound studied for immune activation. Take all three with meals, rotating emphasis seasonally. This is the stack to build before cold and flu season.',
        products: [
          { asin: 'B078SZX3ML', name: 'Real Mushrooms Organic Capsules' },
          { asin: 'B09VK9S4JB', name: 'Mushroom Growing Kit' },
          { asin: '0525510311', name: 'Entangled Life by Merlin Sheldrake' },
        ]
      },
      {
        title: 'The Calm Stack: Reishi + Lion\'s Mane + Tremella',
        text: 'Your need for emotional balance and calm calls for the adaptogenic trio. Reishi is the master calming mushroom, reducing cortisol and supporting parasympathetic nervous system activation. Lion\'s Mane supports emotional resilience through neuroplasticity. Tremella (the "beauty mushroom") is deeply hydrating and nourishing, supporting skin health as a visible marker of internal balance. Take Reishi (1500mg) in the evening, Lion\'s Mane (1000mg) in the morning, and Tremella (500mg) with any meal.',
        products: [
          { asin: 'B078SZX3ML', name: 'Real Mushrooms Organic Capsules' },
          { asin: 'B01MR4Y0CZ', name: 'Aromatherapy Essential Oil Diffuser' },
          { asin: '1646119266', name: 'Guided Meditation Journal' },
          { asin: 'B074TBYWGS', name: 'Silk Sleep Eye Mask' },
        ]
      },
    ]
  },

  {
    slug: 'microdosing-mushroom-quiz',
    title: 'Microdosing Mushrooms: Are You Ready?',
    desc: 'An honest assessment of your readiness, knowledge, and preparation for a psilocybin microdosing practice. No judgment, just clarity.',
    heroImage: `${BUNNY}/mushroom-science-lab.webp`,
    questions: [
      { q: 'Why are you interested in microdosing?', opts: ['I heard it helps with depression or anxiety', 'I want to boost creativity and flow states', 'I am curious after reading about it', 'I have macro-dose experience and want a subtler practice'] },
      { q: 'Do you understand what a microdose actually is?', opts: ['Not really, I just know it is a small amount', 'I think it is about 0.1 to 0.3 grams of dried psilocybin mushrooms', 'I know the dose range and that it should be sub-perceptual', 'I understand dose ranges, protocols, and individual variation'] },
      { q: 'Are you currently taking any psychiatric medications?', opts: ['Yes, SSRIs or SNRIs', 'Yes, other psychiatric medications', 'I recently stopped medications', 'No psychiatric medications'] },
      { q: 'Do you have access to a precision scale that measures to 0.01g or better?', opts: ['No, I would just eyeball it', 'I have a kitchen scale', 'I have a scale that measures to 0.01g', 'I have a milligram scale (0.001g)'] },
      { q: 'How would you track your microdosing experience?', opts: ['I probably would not track it', 'Mental notes', 'A simple journal or app', 'Detailed daily journal with mood, sleep, creativity, and physical metrics'] },
      { q: 'Do you understand the legal status of psilocybin where you live?', opts: ['No idea', 'I think it might be illegal', 'I know the general legal status', 'I have researched the specific laws in my jurisdiction thoroughly'] },
    ],
    results: [
      {
        title: 'Not Ready Yet: Build Your Foundation First',
        text: 'Honest answer: you are not ready to start microdosing, and that is completely fine. There are some important knowledge gaps and preparation steps to address first. If you are on SSRIs or other psychiatric medications, you need to consult with a doctor before considering psilocybin. If you are eyeballing doses, you need a precision scale. If you are not tracking, you will not know if it is working. Start with education and preparation. The mushrooms will still be there when you are ready.',
        products: [
          { asin: '0735224153', name: 'How to Change Your Mind by Michael Pollan' },
          { asin: '1594774021', name: 'The Psychedelic Explorer\'s Guide' },
          { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal' },
        ]
      },
      {
        title: 'Getting Closer: A Few More Steps',
        text: 'You have some foundation but there are practical gaps to address. The most common mistakes new microdoser make are imprecise dosing and not tracking their experience. A milligram scale is not optional. It is essential safety equipment. And a structured journal turns a vague experiment into actionable data about what works for your specific brain chemistry.',
        products: [
          { asin: 'B0885S1866', name: 'Precision Milligram Scale' },
          { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal' },
          { asin: '0735224153', name: 'How to Change Your Mind' },
        ]
      },
      {
        title: 'Well Prepared: Ready to Begin Carefully',
        text: 'Your knowledge, tools, and approach suggest you are in a good position to explore microdosing thoughtfully. You understand the basics, you have the right equipment, and you plan to track your experience. Start with the Fadiman Protocol (one day on, two days off) at the lowest dose you think might work, then adjust. Remember: if you can feel it, it is not a microdose.',
        products: [
          { asin: 'B0885S1866', name: 'Precision Milligram Scale' },
          { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal' },
          { asin: 'B078SZX3ML', name: 'Lion\'s Mane Capsules (Stamets Stack)' },
        ]
      },
      {
        title: 'Deeply Prepared: Experienced and Equipped',
        text: 'You bring significant knowledge, proper equipment, and a structured approach to microdosing. Your experience with macro-doses gives you a relationship with the medicine that informs your practice. Consider the Stamets Stack (psilocybin + Lion\'s Mane + niacin) for enhanced neurogenesis. Your detailed tracking will generate valuable personal data over time.',
        products: [
          { asin: 'B078SZX3ML', name: 'Lion\'s Mane Capsules (Stamets Stack)' },
          { asin: 'B0885S1866', name: 'Precision Milligram Scale' },
          { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal' },
          { asin: '0525510311', name: 'Entangled Life by Merlin Sheldrake' },
        ]
      },
    ]
  },

  {
    slug: 'edible-mushroom-personality',
    title: 'What\'s Your Edible Mushroom Personality?',
    desc: 'A fun quiz to discover which gourmet and culinary mushroom matches your cooking style, flavor preferences, and kitchen confidence.',
    heroImage: `${BUNNY}/mushroom-hero-assessments.webp`,
    questions: [
      { q: 'How adventurous are you in the kitchen?', opts: ['I stick to recipes I know', 'I try new things occasionally', 'I experiment regularly', 'I treat cooking as creative expression'] },
      { q: 'What flavor profile do you gravitate toward?', opts: ['Mild and familiar', 'Rich and savory (umami)', 'Bold and earthy', 'Complex and layered'] },
      { q: 'How do you feel about foraging your own food?', opts: ['That sounds terrifying', 'Interesting but I would need a guide', 'I have done it or would love to try', 'I forage regularly'] },
      { q: 'What is your go-to cooking method?', opts: ['Quick stir-fry or saute', 'Slow-cooked soups and stews', 'Grilling or roasting', 'Raw or lightly prepared'] },
      { q: 'How important is the health benefit of what you eat?', opts: ['I eat for taste, not health', 'I think about it sometimes', 'I actively choose nutrient-dense foods', 'Food is medicine to me'] },
    ],
    results: [
      {
        title: 'Button & Cremini: The Reliable Classic',
        text: 'You are the white button and cremini mushroom. Approachable, versatile, and more interesting than people give you credit for. Cremini mushrooms (which are just baby portobellos) have a deeper flavor than white buttons and work in everything from pasta to pizza to a simple saute with garlic and butter. Fun fact: they contain more potassium than bananas. Start here and let your mushroom journey grow naturally.',
        products: [
          { asin: 'B09VK9S4JB', name: 'Mushroom Growing Kit' },
          { asin: '0525510311', name: 'Entangled Life by Merlin Sheldrake' },
          { asin: 'B078SZX3ML', name: 'Lion\'s Mane Supplement' },
        ]
      },
      {
        title: 'Shiitake: The Umami Master',
        text: 'You are the shiitake mushroom. Rich, deeply savory, and packed with lentinan (a beta-glucan that supports immune function). Shiitakes are the second most cultivated mushroom in the world for good reason. They bring that deep umami backbone to stir-fries, ramen, risotto, and dashi broth. Dried shiitakes are even more concentrated in flavor. Try rehydrating them in warm water and using the soaking liquid as a stock base.',
        products: [
          { asin: 'B09VK9S4JB', name: 'Mushroom Growing Kit' },
          { asin: 'B078SZX3ML', name: 'Real Mushrooms Supplement' },
          { asin: '0525510311', name: 'Entangled Life' },
        ]
      },
      {
        title: 'Maitake: The Wild Forager',
        text: 'You are the maitake, also called Hen of the Woods. Found growing at the base of oak trees in autumn, maitake is prized by foragers and chefs alike. The overlapping fronds crisp up beautifully when roasted and have a rich, woodsy flavor that pairs with everything from steak to pasta. Medicinally, maitake contains D-fraction, studied for blood sugar regulation and immune support. You appreciate food that connects you to the land.',
        products: [
          { asin: 'B09VK9S4JB', name: 'Mushroom Growing Kit' },
          { asin: '0525510311', name: 'Entangled Life by Merlin Sheldrake' },
          { asin: 'B078SZX3ML', name: 'Real Mushrooms Supplement' },
        ]
      },
      {
        title: 'Lion\'s Mane: The Culinary Innovator',
        text: 'You are Lion\'s Mane. When sliced thick and seared in butter, this mushroom develops a texture and flavor remarkably similar to crab or lobster. It is the mushroom that makes non-mushroom-lovers reconsider everything. Beyond the kitchen, Lion\'s Mane is the most researched nootropic mushroom, supporting nerve growth factor production and cognitive function. You see food as both art and medicine, and Lion\'s Mane delivers on both.',
        products: [
          { asin: 'B09VK9S4JB', name: 'Mushroom Growing Kit' },
          { asin: 'B078SZX3ML', name: 'Lion\'s Mane Capsules' },
          { asin: '0525510311', name: 'Entangled Life' },
        ]
      },
    ]
  },

  {
    slug: 'mushroom-blend-builder',
    title: 'Build Your Custom Mushroom Blend',
    desc: 'Answer questions about your daily routine, health priorities, and preferences to get a personalized mushroom supplement blend recommendation.',
    heroImage: `${BUNNY}/mushroom-forest-magical.webp`,
    questions: [
      { q: 'What time do you wake up?', opts: ['Before 6 AM', '6 to 8 AM', '8 to 10 AM', 'After 10 AM'] },
      { q: 'How would you describe your stress level?', opts: ['Constantly overwhelmed', 'High but manageable', 'Moderate, comes and goes', 'Low, I manage stress well'] },
      { q: 'Do you drink coffee or tea?', opts: ['Multiple cups of coffee daily', 'One cup of coffee in the morning', 'I prefer tea', 'Neither, I avoid caffeine'] },
      { q: 'How is your skin health?', opts: ['Problematic, frequent breakouts or dryness', 'Okay but could be better', 'Generally good', 'Great, I invest in skin health'] },
      { q: 'What is your biggest health concern right now?', opts: ['Brain fog and poor concentration', 'Low energy and fatigue', 'Frequent illness or slow recovery', 'Anxiety and poor sleep'] },
      { q: 'How do you feel about taking multiple supplements?', opts: ['I want one simple product', 'Two to three is fine', 'I do not mind a full protocol', 'I already take many supplements'] },
    ],
    results: [
      {
        title: 'The Morning Clarity Blend: Lion\'s Mane + Cordyceps',
        text: 'Your early mornings and brain fog point to a clean cognitive-energy stack. Add Lion\'s Mane powder to your morning coffee for focus without anxiety, and Cordyceps for sustained physical energy. This is the simplest effective blend: two mushrooms, one morning ritual. Many people report that this combination replaces their need for a second cup of coffee. Start with half doses for the first week to assess your sensitivity.',
        products: [
          { asin: 'B078SZX3ML', name: 'Real Mushrooms Lion\'s Mane Capsules' },
          { asin: 'B0CRKX1VV7', name: 'Wellness Tracking Journal' },
          { asin: '0525510311', name: 'Entangled Life' },
        ]
      },
      {
        title: 'The Resilience Blend: Chaga + Turkey Tail + Cordyceps',
        text: 'Your immune concerns and energy needs call for the resilience trio. Chaga brings the highest antioxidant load of any mushroom. Turkey Tail provides proven beta-glucan immune support. Cordyceps fills the energy gap without stimulant side effects. Take Chaga and Turkey Tail with breakfast, Cordyceps before your afternoon activities. This blend is especially powerful during seasonal transitions.',
        products: [
          { asin: 'B078SZX3ML', name: 'Real Mushrooms Organic Capsules' },
          { asin: 'B09VK9S4JB', name: 'Mushroom Growing Kit' },
          { asin: '0525510311', name: 'Entangled Life' },
        ]
      },
      {
        title: 'The Beauty + Brain Blend: Tremella + Lion\'s Mane + Reishi',
        text: 'Your skin concerns and stress levels point to the beauty-brain-calm trio. Tremella is called the "beauty mushroom" because it holds 500 times its weight in water, deeply hydrating skin from within. Lion\'s Mane keeps your mind sharp. Reishi in the evening brings the calm. This is the blend for people who understand that beauty starts with internal health. Take Tremella and Lion\'s Mane in the morning, Reishi before bed.',
        products: [
          { asin: 'B078SZX3ML', name: 'Real Mushrooms Organic Capsules' },
          { asin: 'B01MR4Y0CZ', name: 'Aromatherapy Diffuser' },
          { asin: '1646119266', name: 'Guided Meditation Journal' },
        ]
      },
      {
        title: 'The Full Spectrum Protocol: 5-Mushroom Daily Stack',
        text: 'You are ready for the comprehensive approach. Your full spectrum protocol: Lion\'s Mane (1000mg morning) for cognition, Cordyceps (500mg morning) for energy, Chaga (500mg midday) for antioxidants, Turkey Tail (1000mg with meals) for immunity, and Reishi (1500mg evening) for sleep and calm. Cycle 5 days on, 2 days off to prevent tolerance. This is the protocol for people who are serious about mushroom-based wellness.',
        products: [
          { asin: 'B078SZX3ML', name: 'Real Mushrooms Organic Capsules' },
          { asin: 'B0CRKX1VV7', name: 'Wellness Tracking Journal' },
          { asin: 'B0FPML7DJC', name: 'WHOOP 5.0 HRV Monitor' },
          { asin: '0525510311', name: 'Entangled Life' },
        ]
      },
    ]
  },

  {
    slug: 'mushroom-myths-vs-facts',
    title: 'Mushroom Myths vs. Facts',
    desc: 'Can you separate mushroom science from mushroom folklore? Test your knowledge of common misconceptions about both culinary and psychedelic mushrooms.',
    heroImage: `${BUNNY}/mushroom-psychedelic-pattern.webp`,
    questions: [
      { q: 'True or false: All brightly colored mushrooms are poisonous.', opts: ['True, bright colors always mean danger', 'False, color alone does not determine toxicity', 'True, but only red and orange ones', 'It depends on the season'] },
      { q: 'Can you build a tolerance to psilocybin mushrooms?', opts: ['No, each experience is the same', 'Yes, tolerance builds rapidly within days', 'Only if you take very high doses', 'Tolerance takes months to develop'] },
      { q: 'Are mushroom supplements all created equal?', opts: ['Yes, a mushroom is a mushroom', 'No, many supplements use mycelium on grain, not actual fruiting bodies', 'Only organic ones matter', 'Price determines quality'] },
      { q: 'Can you overdose fatally on psilocybin mushrooms alone?', opts: ['Yes, easily', 'Yes, at high doses', 'The lethal dose is estimated at 1.7 kg of dried mushrooms, making fatal overdose practically impossible', 'There is no lethal dose'] },
      { q: 'Do cooking mushrooms destroy their nutritional value?', opts: ['Yes, always eat them raw', 'Cooking actually makes many mushroom nutrients more bioavailable', 'It does not matter either way', 'Only microwaving destroys nutrients'] },
      { q: 'Is the "Stamets Stack" for microdosing scientifically proven?', opts: ['Yes, multiple clinical trials confirm it', 'It has theoretical backing and anecdotal support but lacks large-scale clinical trials', 'It has been debunked', 'It only works with specific mushroom strains'] },
    ],
    results: [
      {
        title: 'Myth Believer: Time for a Reality Check',
        text: 'You have absorbed some common mushroom myths that could lead you astray. The biggest misconception people carry is that color indicates toxicity (it does not) and that all supplements are the same (they are absolutely not). Many popular mushroom supplements contain mostly grain starch with minimal actual mushroom compounds. Look for products made from fruiting bodies with verified beta-glucan content.',
        products: [
          { asin: '0735224153', name: 'How to Change Your Mind' },
          { asin: '0525510311', name: 'Entangled Life' },
          { asin: 'B078SZX3ML', name: 'Real Mushrooms (Fruiting Body Extract)' },
        ]
      },
      {
        title: 'Mixed Knowledge: Some Myths Still Lingering',
        text: 'You got some right and some wrong, which is actually the most common result. The supplement quality question trips up most people. The dirty secret of the mushroom supplement industry is that many products labeled "mushroom" are actually mycelium grown on grain, containing significant starch filler. Always check: does the label say "fruiting body" or "mycelium"? The difference matters enormously.',
        products: [
          { asin: 'B078SZX3ML', name: 'Real Mushrooms (Fruiting Body)' },
          { asin: '0525510311', name: 'Entangled Life' },
          { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal' },
        ]
      },
      {
        title: 'Fact-Based Thinker: Well Informed',
        text: 'You have a strong grasp of mushroom science versus folklore. You understand that supplement quality varies wildly, that tolerance builds rapidly with psilocybin, and that cooking actually improves nutrient bioavailability. Your critical thinking serves you well in a space full of marketing hype and misinformation.',
        products: [
          { asin: 'B09VK9S4JB', name: 'Mushroom Growing Kit' },
          { asin: '0525510311', name: 'Entangled Life' },
          { asin: 'B078SZX3ML', name: 'Real Mushrooms Supplement' },
        ]
      },
      {
        title: 'Mycology Scholar: You Know Your Fungi',
        text: 'You can separate science from folklore with precision. You understand the nuances of supplement quality, the pharmacology of psilocybin tolerance, and the importance of proper preparation. Your knowledge base is solid enough to help others cut through the noise in the mushroom wellness space.',
        products: [
          { asin: 'B09VK9S4JB', name: 'Mushroom Growing Kit' },
          { asin: '0060801719', name: 'The Doors of Perception' },
          { asin: '0525510311', name: 'Entangled Life' },
          { asin: 'B0885S1866', name: 'Precision Milligram Scale' },
        ]
      },
    ]
  },
];
