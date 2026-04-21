// 6 Mushroom-Focused Assessments with Liability Disclaimers and Amazon Product Recommendations
// Each result includes 3-4 verified Amazon affiliate links

const BUNNY = 'https://quiet-medicine.b-cdn.net/images';
const TAG = 'spankyspinola-20';

const DISCLAIMER = `<div style="margin-top:24px;padding:16px 20px;background:rgba(255,107,107,0.08);border-left:3px solid #ff6b6b;border-radius:8px;font-size:13px;line-height:1.7;color:var(--text-dim);">
<strong style="color:#ff6b6b;">Important Disclaimer:</strong> This assessment is for educational and informational purposes only. It is not medical advice, diagnosis, or treatment. Mushroom supplements and psychedelic substances carry risks including drug interactions, allergic reactions, and psychological effects. Always consult a qualified healthcare provider before starting any new supplement regimen or considering psychedelic use. Psilocybin remains a controlled substance in most jurisdictions. The Quiet Medicine does not encourage or condone illegal activity. Individual results vary. You assume all responsibility for your own health decisions.</div>`;

export const assessments = [
  {
    slug: 'mushroom-supplement-readiness',
    title: 'Mushroom Supplement Readiness Assessment',
    desc: 'A thorough evaluation of your health background, current medications, and goals to determine which functional mushroom supplements are safe and appropriate for you.',
    heroImage: `${BUNNY}/mushroom-hero-assessments.webp`,
    disclaimer: DISCLAIMER,
    questions: [
      { q: 'Are you currently taking any blood-thinning medications (warfarin, aspirin, heparin)?', opts: ['Yes', 'No', 'I am not sure'] },
      { q: 'Do you have any autoimmune conditions (lupus, rheumatoid arthritis, MS, etc.)?', opts: ['Yes, diagnosed', 'Suspected but not diagnosed', 'No'] },
      { q: 'Are you pregnant, breastfeeding, or planning to become pregnant?', opts: ['Yes', 'Possibly', 'No'] },
      { q: 'Do you have any known allergies to molds or fungi?', opts: ['Yes, confirmed allergy', 'I have had reactions but not tested', 'No known allergies'] },
      { q: 'Are you currently taking immunosuppressant medications?', opts: ['Yes', 'I was recently but stopped', 'No'] },
      { q: 'Have you had any organ transplants?', opts: ['Yes', 'No'] },
      { q: 'Do you have low blood pressure or take blood pressure medication?', opts: ['Yes, both', 'Low blood pressure only', 'Blood pressure medication only', 'Neither'] },
      { q: 'Are you scheduled for surgery in the next two weeks?', opts: ['Yes', 'No'] },
    ],
    results: [
      {
        title: 'Proceed with Caution: Medical Consultation Required',
        text: 'Based on your responses, there are potential contraindications that require professional medical guidance before starting mushroom supplements. This is not a rejection. It is a safety measure. Several functional mushrooms (especially Reishi, Chaga, and Maitake) can interact with blood thinners, affect blood sugar, and modulate immune function in ways that could complicate existing conditions. Please bring this assessment to your doctor and discuss specifically which mushroom species you are interested in.',
        products: [
          { asin: '0143127748', name: 'The Body Keeps the Score' },
          { asin: '1646119266', name: 'Guided Meditation Journal' },
          { asin: 'B0CHVYY8P4', name: 'Therapy Journal with Guided Prompts' },
        ]
      },
      {
        title: 'Low Risk: Start Slowly with Basic Species',
        text: 'Your health profile suggests a low-risk starting point for functional mushroom supplements. Begin with well-researched species like Lion\'s Mane or Turkey Tail, which have the fewest known interactions. Start at half the recommended dose for the first week to assess your individual response. Keep a simple log of how you feel. If you notice any unusual symptoms (digestive upset, headaches, skin reactions), discontinue and consult your healthcare provider.',
        products: [
          { asin: 'B078SZX3ML', name: 'Real Mushrooms Lion\'s Mane Capsules' },
          { asin: 'B0CRKX1VV7', name: 'Wellness Tracking Journal' },
          { asin: '0525510311', name: 'Entangled Life by Merlin Sheldrake' },
        ]
      },
      {
        title: 'Good to Go: Full Spectrum Available',
        text: 'Your health profile shows no major contraindications for functional mushroom supplements. You have a wide range of species available to you, from Lion\'s Mane for cognition to Reishi for sleep to Cordyceps for energy. The key now is matching the right mushrooms to your specific goals. Quality matters enormously in this space. Look for supplements made from fruiting bodies (not mycelium on grain), with verified beta-glucan content, and third-party testing.',
        products: [
          { asin: 'B078SZX3ML', name: 'Real Mushrooms Organic Capsules' },
          { asin: 'B09VK9S4JB', name: 'Mushroom Growing Kit' },
          { asin: '0525510311', name: 'Entangled Life' },
          { asin: 'B0CRKX1VV7', name: 'Wellness Tracking Journal' },
        ]
      },
    ]
  },

  {
    slug: 'psychedelic-readiness-assessment',
    title: 'Psychedelic Mushroom Readiness Assessment',
    desc: 'A comprehensive evaluation of your mental health history, support system, and preparation level for a psychedelic mushroom experience. Honest, clinical, no hype.',
    heroImage: `${BUNNY}/mushroom-psychedelic-pattern.webp`,
    disclaimer: DISCLAIMER,
    questions: [
      { q: 'Do you have a personal or family history of schizophrenia, schizoaffective disorder, or psychotic episodes?', opts: ['Yes, personal history', 'Yes, family history', 'Not that I know of', 'No'] },
      { q: 'Are you currently taking lithium, tramadol, or MAO inhibitors?', opts: ['Yes, one or more of these', 'I recently stopped one of these', 'No'] },
      { q: 'Do you have a trusted person who could serve as a sitter or guide during an experience?', opts: ['No, I would do it alone', 'I have friends but none with experience', 'I have someone willing but inexperienced', 'I have an experienced sitter or professional guide'] },
      { q: 'How would you describe your current mental health?', opts: ['In active crisis or severe distress', 'Struggling but stable', 'Generally okay with some challenges', 'Stable and grounded'] },
      { q: 'What is your experience with meditation or mindfulness practices?', opts: ['None', 'I have tried it a few times', 'Regular but inconsistent practice', 'Established daily practice'] },
      { q: 'Have you researched what a psychedelic experience actually involves?', opts: ['Not really', 'I have read some articles', 'I have read multiple books and trip reports', 'I have extensive research and/or personal experience'] },
      { q: 'Do you have a clear intention for why you want this experience?', opts: ['Not really, just curious', 'Vague sense of wanting growth', 'Specific intention I can articulate', 'Deep, well-considered intention with preparation work done'] },
      { q: 'Are you in a stable life situation (housing, relationships, work)?', opts: ['Multiple areas of instability', 'Some instability', 'Mostly stable', 'Very stable'] },
    ],
    results: [
      {
        title: 'Not Recommended at This Time',
        text: 'Based on your responses, a psychedelic mushroom experience is not recommended right now. This is a safety determination, not a judgment. If you have a personal or family history of psychosis, or are taking lithium or MAOIs, psilocybin carries serious risks including serotonin syndrome and potential psychotic breaks. If you are in active mental health crisis, psychedelics can intensify distress rather than relieve it. Please prioritize conventional mental health support first. The option will still exist when your foundation is stronger.',
        products: [
          { asin: '0143127748', name: 'The Body Keeps the Score' },
          { asin: 'B0CHVYY8P4', name: 'Therapy Journal with Guided Prompts' },
          { asin: '1646119266', name: 'Guided Meditation Journal' },
        ]
      },
      {
        title: 'More Preparation Needed',
        text: 'You have some readiness factors in place but important gaps remain. The most critical areas to address: having an experienced sitter (never journey alone, especially for the first time), building a meditation practice (it gives you tools for working with difficult material), and clarifying your intention (vague curiosity is not enough structure for a powerful experience). Spend 2-3 months on preparation before reconsidering.',
        products: [
          { asin: '0735224153', name: 'How to Change Your Mind by Michael Pollan' },
          { asin: '1594774021', name: 'The Psychedelic Explorer\'s Guide' },
          { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal' },
          { asin: 'B0D2K8N8NR', name: 'Meditation Cushion' },
        ]
      },
      {
        title: 'Approaching Readiness',
        text: 'Your profile shows meaningful preparation and a solid foundation. You have most of the key elements: stable mental health, some contemplative practice, research knowledge, and a support system. The remaining work is refining your intention, ensuring your sitter is genuinely prepared, and creating the right physical environment. Consider a low-dose experience (1-1.5g dried) as your first step rather than a full dose.',
        products: [
          { asin: 'B0885S1866', name: 'Precision Milligram Scale' },
          { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal' },
          { asin: 'B09XS7JWHH', name: 'Sony WH-1000XM5 Headphones' },
          { asin: 'B0DK86ZBNJ', name: 'Cozy Therapy Blanket' },
        ]
      },
      {
        title: 'Well Prepared: Strong Foundation',
        text: 'Your assessment indicates thorough preparation across all key dimensions: mental health stability, experienced support, contemplative practice, clear intention, and life stability. You have done the homework. The remaining steps are practical: confirm your sitter, prepare your space (comfortable, private, with music and blankets), prepare a playlist (Johns Hopkins psilocybin playlist is excellent), and set aside 8 hours with no obligations the following day for integration.',
        products: [
          { asin: 'B09XS7JWHH', name: 'Sony WH-1000XM5 Headphones' },
          { asin: 'B0DK86ZBNJ', name: 'Cozy Therapy Blanket' },
          { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal' },
          { asin: 'B074TBYWGS', name: 'Silk Sleep Eye Mask' },
        ]
      },
    ]
  },

  {
    slug: 'mushroom-growing-readiness',
    title: 'Home Mushroom Cultivation Readiness',
    desc: 'Assess whether you have the space, patience, and knowledge to successfully grow mushrooms at home. From oyster mushrooms to lion\'s mane to gourmet varieties.',
    heroImage: `${BUNNY}/mushroom-forest-magical.webp`,
    disclaimer: `<div style="margin-top:24px;padding:16px 20px;background:rgba(255,107,107,0.08);border-left:3px solid #ff6b6b;border-radius:8px;font-size:13px;line-height:1.7;color:var(--text-dim);"><strong style="color:#ff6b6b;">Important Note:</strong> This assessment covers legal gourmet and medicinal mushroom cultivation only. Growing psilocybin-containing mushrooms is illegal in most jurisdictions. The Quiet Medicine does not provide instructions for or encourage the cultivation of controlled substances. Always verify the legal status of any mushroom species you intend to grow in your area.</div>`,
    questions: [
      { q: 'Do you have a clean, temperature-controlled indoor space you can dedicate to growing?', opts: ['No dedicated space', 'A closet or small area I could use', 'A spare room or basement', 'I have a dedicated growing area already set up'] },
      { q: 'How patient are you with slow processes?', opts: ['I want results fast', 'I can wait a few weeks', 'I enjoy slow, methodical processes', 'I find waiting meditative'] },
      { q: 'How comfortable are you with sterile technique (cleaning, sanitizing, working carefully)?', opts: ['Not very', 'I can follow instructions', 'I am naturally careful and detail-oriented', 'I have lab or medical experience with sterile technique'] },
      { q: 'What is your budget for getting started?', opts: ['Under $25', '$25 to $75', '$75 to $200', 'Over $200'] },
      { q: 'Which mushrooms are you most interested in growing?', opts: ['Oyster mushrooms (easiest)', 'Shiitake', 'Lion\'s Mane', 'Multiple species including more challenging ones'] },
      { q: 'How do you handle setbacks and failed experiments?', opts: ['I get frustrated and quit', 'Disappointed but I try again', 'I analyze what went wrong and adjust', 'Failure is part of the process, I expect it'] },
    ],
    results: [
      {
        title: 'Start with a Ready-Made Kit',
        text: 'Your current setup and experience level point to starting with a pre-made mushroom growing kit. These kits come with fully colonized substrate, so you skip the most contamination-prone steps. Just open, mist daily, and harvest in 7-14 days. Oyster mushroom kits have the highest success rate for beginners. Once you have successfully grown a few flushes from kits, you will have the confidence and understanding to move to more advanced techniques.',
        products: [
          { asin: 'B09VK9S4JB', name: 'Mushroom Growing Kit' },
          { asin: '0525510311', name: 'Entangled Life by Merlin Sheldrake' },
          { asin: 'B0CRKX1VV7', name: 'Growing Journal' },
        ]
      },
      {
        title: 'Ready for Intermediate Growing',
        text: 'You have the patience, space, and mindset for intermediate mushroom cultivation. This means working with grain spawn and bulk substrates like straw or hardwood sawdust. The key skill to develop is sterile technique during inoculation. Your dedicated space gives you the environmental control needed for consistent results. Start with oyster mushrooms on straw (very forgiving) and progress to shiitake on supplemented sawdust.',
        products: [
          { asin: 'B09VK9S4JB', name: 'Mushroom Growing Kit (to practice first)' },
          { asin: '0525510311', name: 'Entangled Life' },
          { asin: 'B0CRKX1VV7', name: 'Cultivation Journal' },
        ]
      },
      {
        title: 'Advanced Cultivator Potential',
        text: 'Your combination of dedicated space, patience, sterile technique comfort, and resilience to setbacks positions you for serious mushroom cultivation. You can work with agar cultures, grain-to-grain transfers, and multiple species simultaneously. Lion\'s Mane and shiitake on supplemented hardwood blocks will be rewarding projects. Consider building a simple still-air box or investing in a laminar flow hood as your next step.',
        products: [
          { asin: 'B09VK9S4JB', name: 'Mushroom Growing Kit' },
          { asin: 'B0885S1866', name: 'Precision Scale for Substrate Measurement' },
          { asin: '0525510311', name: 'Entangled Life' },
          { asin: 'B078SZX3ML', name: 'Lion\'s Mane Supplement (while you grow your own)' },
        ]
      },
    ]
  },

  {
    slug: 'integration-readiness-assessment',
    title: 'Psychedelic Integration Readiness',
    desc: 'After a psychedelic mushroom experience, integration is where the real work happens. Assess your readiness to process, embody, and apply what you experienced.',
    heroImage: `${BUNNY}/mushroom-psychedelic-pattern.webp`,
    disclaimer: DISCLAIMER,
    questions: [
      { q: 'How soon after your experience are you taking this assessment?', opts: ['During or immediately after', 'Within the first week', 'One to four weeks after', 'More than a month after'] },
      { q: 'Can you articulate what happened during your experience?', opts: ['It is completely overwhelming and confusing', 'I have fragments but cannot make sense of them', 'I can describe the main themes and feelings', 'I have a clear narrative with specific insights'] },
      { q: 'Do you have someone you can talk to about your experience?', opts: ['No one who would understand', 'Friends but they have no psychedelic experience', 'A friend or partner with psychedelic experience', 'A therapist or integration specialist'] },
      { q: 'How are you sleeping since your experience?', opts: ['Barely sleeping, racing thoughts', 'Disrupted but functional', 'About the same as before', 'Better than before'] },
      { q: 'Are you experiencing any of these: persistent anxiety, depersonalization, or intrusive thoughts?', opts: ['Yes, significantly', 'Mildly', 'Briefly but they passed', 'No'] },
      { q: 'Do you have a journaling or reflective practice?', opts: ['No', 'I have tried but do not stick with it', 'Occasional journaling', 'Regular journaling or contemplative practice'] },
      { q: 'Have you made any impulsive major life decisions since your experience?', opts: ['Yes, several', 'I am considering major changes', 'I have ideas but I am sitting with them', 'No, I am letting things settle'] },
    ],
    results: [
      {
        title: 'Seek Professional Support',
        text: 'Your responses suggest you may be experiencing some challenging after-effects that would benefit from professional support. This is not uncommon and it is not a sign that something went wrong with you. Difficult psychedelic experiences can surface material that needs skilled help to process. Please reach out to a psychedelic integration therapist. The Fireside Project (62-FIRESIDE) offers free peer support for people processing psychedelic experiences. MAPS also maintains a directory of integration therapists.',
        products: [
          { asin: '0143127748', name: 'The Body Keeps the Score' },
          { asin: 'B0CHVYY8P4', name: 'Therapy Journal with Guided Prompts' },
          { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal' },
        ]
      },
      {
        title: 'Active Integration Phase',
        text: 'You are in the active integration window where the experience is still fresh and workable. The most important things right now: write everything down before it fades, avoid making major life decisions for at least two weeks, and find someone to talk to who can hold space without judgment. The insights from a psychedelic experience are like dreams. They feel vivid and obvious in the moment but can slip away quickly without anchoring.',
        products: [
          { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal' },
          { asin: 'B0D2K8N8NR', name: 'Meditation Cushion' },
          { asin: '1646119266', name: 'Guided Meditation Journal' },
        ]
      },
      {
        title: 'Grounded Integration',
        text: 'You are processing your experience from a stable, grounded place. You can articulate what happened, you have support, and you are not making impulsive decisions. This is the ideal integration posture. The work now is translating insight into action. What specific changes did the experience point toward? What patterns did you see that you want to shift? Integration is not about having had a big experience. It is about letting that experience change how you live.',
        products: [
          { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal' },
          { asin: 'B0D2K8N8NR', name: 'Meditation Cushion' },
          { asin: '0062429655', name: 'Stealing Fire by Steven Kotler' },
        ]
      },
    ]
  },

  {
    slug: 'mushroom-knowledge-level',
    title: 'Your Mushroom Knowledge Level',
    desc: 'A comprehensive assessment of your mycological knowledge across identification, cultivation, pharmacology, history, and ecology. Where do you stand?',
    heroImage: `${BUNNY}/mushroom-hero-quizzes.webp`,
    disclaimer: `<div style="margin-top:24px;padding:16px 20px;background:rgba(100,200,255,0.08);border-left:3px solid #64c8ff;border-radius:8px;font-size:13px;line-height:1.7;color:var(--text-dim);"><strong style="color:#64c8ff;">Note:</strong> This assessment evaluates general mycological knowledge for educational purposes. It is not a certification or qualification for foraging, cultivation, or therapeutic use. Always seek proper training and mentorship for hands-on mushroom work.</div>`,
    questions: [
      { q: 'Can you name the five parts of a typical mushroom fruiting body?', opts: ['I could not name any', 'I know cap and stem', 'I know cap, stem, gills, and maybe one more', 'Cap, stem, gills, ring (annulus), and volva'] },
      { q: 'What is mycelium?', opts: ['The mushroom cap', 'The underground root-like network of fungal threads', 'A type of mushroom spore', 'The soil mushrooms grow in'] },
      { q: 'What role do fungi play in forest ecosystems?', opts: ['They are parasites that harm trees', 'They decompose dead matter only', 'They form mycorrhizal networks that connect and nourish trees, decompose organic matter, and cycle nutrients', 'They compete with plants for sunlight'] },
      { q: 'What is the difference between a spore print and a spore syringe?', opts: ['No idea', 'I know what a spore print is but not a syringe', 'I understand both conceptually', 'I can explain both and have made or used them'] },
      { q: 'Who is Paul Stamets and why is he significant?', opts: ['Never heard of him', 'I think he is a mushroom scientist', 'He is a prominent mycologist and advocate for fungal solutions to environmental problems', 'I know his work in detail, including his patents, books, and the Stamets Stack'] },
      { q: 'What is the Wood Wide Web?', opts: ['A website about trees', 'The mycorrhizal network connecting trees through fungal threads underground', 'A type of spider web found in forests', 'I am not sure'] },
      { q: 'Can you explain the difference between saprotrophic, mycorrhizal, and parasitic fungi?', opts: ['No', 'I know one of these terms', 'I understand two of the three', 'I can explain all three and give examples of each'] },
    ],
    results: [
      {
        title: 'Mushroom Curious: Welcome to the Kingdom',
        text: 'You are at the beginning of what could become a lifelong fascination. Fungi are the hidden kingdom that makes life on Earth possible, and most people know almost nothing about them. Start with Merlin Sheldrake\'s Entangled Life for a mind-expanding introduction, then consider a local mushroom identification walk or a beginner growing kit to get hands-on experience. The rabbit hole goes deep, and it only gets more interesting.',
        products: [
          { asin: '0525510311', name: 'Entangled Life by Merlin Sheldrake' },
          { asin: 'B09VK9S4JB', name: 'Mushroom Growing Kit' },
          { asin: '0735224153', name: 'How to Change Your Mind' },
        ]
      },
      {
        title: 'Developing Mycophile: Building Knowledge',
        text: 'You have a foundation of mushroom knowledge that puts you ahead of most people. You understand the basics of fungal biology and can identify some key concepts. The next level involves hands-on experience: growing mushrooms, learning spore printing, and understanding the ecological relationships between fungi and their environments. Consider joining a local mycological society for guided forays and mentorship.',
        products: [
          { asin: 'B09VK9S4JB', name: 'Mushroom Growing Kit' },
          { asin: '0525510311', name: 'Entangled Life' },
          { asin: 'B078SZX3ML', name: 'Real Mushrooms Supplement' },
        ]
      },
      {
        title: 'Knowledgeable Mycophile: Solid Understanding',
        text: 'Your mycological knowledge is substantial. You understand fungal biology, ecology, and the key figures in the field. You can distinguish between different fungal lifestyles and appreciate the role of fungi in ecosystem health. Your next growth edge might be in specialized areas: medicinal mushroom pharmacology, advanced cultivation techniques, or fungal taxonomy.',
        products: [
          { asin: 'B09VK9S4JB', name: 'Mushroom Growing Kit' },
          { asin: '0525510311', name: 'Entangled Life' },
          { asin: '0060801719', name: 'The Doors of Perception' },
          { asin: 'B0885S1866', name: 'Precision Scale' },
        ]
      },
      {
        title: 'Advanced Mycologist: Deep Expertise',
        text: 'Your knowledge spans fungal biology, ecology, pharmacology, cultivation, and the cultural history of mushrooms. You understand the science at a level that allows you to evaluate claims critically and separate marketing from evidence. You are the kind of person who could teach others, contribute to citizen science projects, or pursue formal mycological study. The fungal kingdom still has vast unexplored territory, and you have the foundation to explore it.',
        products: [
          { asin: '0525510311', name: 'Entangled Life' },
          { asin: '0060801719', name: 'The Doors of Perception by Aldous Huxley' },
          { asin: 'B09VK9S4JB', name: 'Advanced Growing Kit' },
        ]
      },
    ]
  },

  {
    slug: 'mushroom-interaction-risk',
    title: 'Mushroom-Drug Interaction Risk Assessment',
    desc: 'Evaluate potential interactions between mushroom supplements or psilocybin and your current medications. Safety first, always.',
    heroImage: `${BUNNY}/mushroom-science-lab.webp`,
    disclaimer: `<div style="margin-top:24px;padding:16px 20px;background:rgba(255,107,107,0.08);border-left:3px solid #ff6b6b;border-radius:8px;font-size:13px;line-height:1.7;color:var(--text-dim);">
<strong style="color:#ff6b6b;">Critical Medical Disclaimer:</strong> This assessment provides general educational information about known and theoretical drug interactions. It is NOT a substitute for professional medical advice. Drug interactions can be life-threatening. ALWAYS consult your prescribing physician or pharmacist before combining any mushroom product with prescription medications. Do not stop or modify any prescribed medication based on this assessment. If you experience adverse effects, seek immediate medical attention. The Quiet Medicine assumes no liability for health decisions made based on this tool.</div>`,
    questions: [
      { q: 'Which category best describes your current medications? (Select the most relevant)', opts: ['SSRIs or SNRIs (antidepressants like Prozac, Zoloft, Lexapro, Effexor)', 'Lithium, MAOIs, or tricyclic antidepressants', 'Blood thinners (warfarin, Eliquis, Xarelto)', 'Blood pressure or heart medications', 'Immunosuppressants', 'Diabetes medications', 'I take no prescription medications'] },
      { q: 'What type of mushroom product are you considering?', opts: ['Functional supplements only (Lion\'s Mane, Reishi, etc.)', 'Psilocybin microdosing', 'Psilocybin macro-dose experience', 'Both functional supplements and psilocybin'] },
      { q: 'How many different medications do you take daily?', opts: ['None', 'One to two', 'Three to five', 'More than five'] },
      { q: 'Do you consume alcohol regularly?', opts: ['Daily', 'Several times a week', 'Occasionally', 'Rarely or never'] },
      { q: 'Have you ever had an adverse reaction to a supplement or herbal product?', opts: ['Yes, serious reaction', 'Yes, mild reaction', 'Not that I recall', 'No'] },
      { q: 'Are you taking any over-the-counter supplements that affect serotonin (St. John\'s Wort, 5-HTP, SAMe)?', opts: ['Yes, one or more', 'I am not sure', 'No'] },
    ],
    results: [
      {
        title: 'HIGH RISK: Do Not Proceed Without Medical Supervision',
        text: 'Your medication profile indicates HIGH RISK for dangerous interactions with mushroom products, particularly psilocybin. The combination of lithium and psilocybin can trigger seizures. MAOIs combined with psilocybin can cause serotonin syndrome, a potentially fatal condition. Even functional mushroom supplements like Reishi can interact with blood thinners and immunosuppressants. DO NOT combine any mushroom product with your current medications without explicit approval from your prescribing physician. This is a hard stop, not a suggestion.',
        products: [
          { asin: '0143127748', name: 'The Body Keeps the Score' },
          { asin: 'B0CHVYY8P4', name: 'Therapy Journal' },
          { asin: '1646119266', name: 'Guided Meditation Journal' },
        ]
      },
      {
        title: 'MODERATE RISK: Medical Consultation Required',
        text: 'Your profile shows moderate interaction risk. SSRIs do not create the same dangerous interactions as lithium or MAOIs, but they significantly reduce psilocybin effects and there are theoretical serotonin risks. Functional mushroom supplements may interact with blood pressure medications (Reishi lowers blood pressure) or diabetes medications (Maitake and Reishi affect blood sugar). Schedule a conversation with your doctor specifically about mushroom supplements. Bring a list of the exact species and doses you are considering.',
        products: [
          { asin: '0735224153', name: 'How to Change Your Mind' },
          { asin: 'B0CRKX1VV7', name: 'The Psychedelic Integration Journal' },
          { asin: 'B078SZX3ML', name: 'Real Mushrooms Supplement' },
        ]
      },
      {
        title: 'LOW RISK: Proceed Mindfully',
        text: 'Your medication profile suggests low interaction risk with mushroom products. With no prescription medications and no serotonergic supplements, the major drug interaction concerns do not apply to you. This does not mean zero risk. Individual sensitivities exist, and mushroom supplements can still cause digestive upset, headaches, or allergic reactions in some people. Start with low doses, introduce one new product at a time, and monitor your response for at least a week before adjusting.',
        products: [
          { asin: 'B078SZX3ML', name: 'Real Mushrooms Lion\'s Mane' },
          { asin: 'B0885S1866', name: 'Precision Milligram Scale' },
          { asin: 'B0CRKX1VV7', name: 'Wellness Tracking Journal' },
          { asin: '0525510311', name: 'Entangled Life' },
        ]
      },
    ]
  },
];
