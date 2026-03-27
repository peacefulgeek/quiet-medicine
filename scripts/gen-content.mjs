#!/usr/bin/env node
/**
 * Generate article content for all 300 articles using OpenAI-compatible API
 * Outputs JSON files to content/articles/
 * Applies all 9 Gold Standard fixes during generation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const ARTICLES_DIR = path.join(ROOT, 'content/articles');
const TOPICS_FILE = path.join(ROOT, 'data/article-topics.json');

if (!fs.existsSync(ARTICLES_DIR)) fs.mkdirSync(ARTICLES_DIR, { recursive: true });

const CATEGORIES = [
  { slug: 'the-science', name: 'The Science' },
  { slug: 'the-microdose', name: 'The Microdose' },
  { slug: 'the-journey', name: 'The Journey' },
  { slug: 'the-clinic', name: 'The Clinic' },
  { slug: 'the-integration', name: 'The Integration' },
];

const BUNNY_CDN_BASE = 'https://quiet-medicine.b-cdn.net';

// Kalesh voice phrases (50 total)
const KALESH_PHRASES = [
  "The mind is not the enemy. The identification with it is.",
  "Most of what passes for healing is just rearranging the furniture in a burning house.",
  "Awareness doesn't need to be cultivated. It needs to be uncovered.",
  "The nervous system doesn't respond to what you believe. It responds to what it senses.",
  "You cannot think your way into a felt sense of safety. The body has its own logic.",
  "Every resistance is information. The question is whether you're willing to read it.",
  "What we call 'stuck' is usually the body doing exactly what it was designed to do under conditions that no longer exist.",
  "The gap between stimulus and response is where your entire life lives.",
  "Consciousness doesn't arrive. It's what's left when everything else quiets down.",
  "The brain is prediction machinery. Anxiety is just prediction running without a stop button.",
  "There is no version of growth that doesn't involve the dissolution of something you thought was permanent.",
  "Trauma reorganizes perception. Recovery reorganizes it again, but this time with your participation.",
  "The contemplative traditions all point to the same thing: what you're looking for is what's looking.",
  "Embodiment is not a technique. It's what happens when you stop living exclusively in your head.",
  "The space between knowing something intellectually and knowing it in your body is where all the real work happens.",
  "Most people don't fear change. They fear the gap between who they were and who they haven't become yet.",
  "Attention is the most undervalued resource you have. Everything else follows from where you place it.",
  "The question is never whether the pain will come. The question is whether you'll meet it with presence or with narrative.",
  "Sit with it long enough and even the worst feeling reveals its edges.",
  "There's a difference between being alone and being with yourself. One is circumstance. The other is practice.",
  "Silence is not the absence of noise. It's the presence of attention.",
  "The breath doesn't need your management. It needs your companionship.",
  "When you stop trying to fix the moment, something remarkable happens — the moment becomes workable.",
  "We are not our thoughts, but we are responsible for our relationship to them.",
  "The body remembers what the mind would prefer to file away.",
  "Patience is not passive. It's the active practice of allowing something to unfold at its own pace.",
  "The paradox of acceptance is that nothing changes until you stop demanding that it does.",
  "What if the restlessness isn't a problem to solve but a signal to follow?",
  "You don't arrive at peace. You stop walking away from it.",
  "The most sophisticated defense mechanism is the one that looks like wisdom.",
  "Stillness is not something you achieve. It's what's already here beneath the achieving.",
  "Every moment of genuine attention is a small act of liberation.",
  "Information without integration is just intellectual hoarding.",
  "Your nervous system doesn't care about your philosophy. It cares about what happened at three years old.",
  "Reading about meditation is to meditation what reading the menu is to eating.",
  "Not every insight requires action. Some just need to be witnessed.",
  "The wellness industry sells solutions to problems it helps you believe you have.",
  "Complexity is the ego's favorite hiding place.",
  "If your spiritual practice makes you more rigid, it's not working.",
  "The research is clear on this, and it contradicts almost everything popular culture teaches.",
  "There's a meaningful difference between self-improvement and self-understanding. One adds. The other reveals.",
  "The algorithm of your attention determines the landscape of your experience.",
  "Stop pathologizing normal human suffering. Not everything requires a diagnosis.",
  "The body has a grammar. Most of us never learned to read it.",
  "You are not a problem to be solved. You are a process to be witnessed.",
  "Freedom is not the absence of constraint. It's the capacity to choose your relationship to it.",
  "The self you're trying to improve is the same self doing the improving. Notice the circularity.",
  "What we call 'the present moment' is not a place you go. It's the only place you've ever been.",
  "The most important things in life cannot be understood — only experienced.",
  "At a certain depth of inquiry, the distinction between psychology and philosophy dissolves entirely.",
];

// Named references - niche (70%)
const NICHE_REFS = [
  { name: 'Rick Doblin', context: 'founder of MAPS and pioneer of psychedelic research policy' },
  { name: 'Robin Carhart-Harris', context: 'neuroscientist whose research on psilocybin and the default mode network transformed our understanding of psychedelic states' },
  { name: 'Matthew Johnson', context: 'Johns Hopkins researcher studying psilocybin for addiction and depression' },
  { name: 'Roland Griffiths', context: 'whose landmark Hopkins studies demonstrated that psilocybin can occasion mystical experiences with lasting positive effects' },
  { name: 'Michael Pollan', context: 'whose book How to Change Your Mind brought psychedelic research into mainstream conversation' },
  { name: 'Francoise Bourzat', context: 'integration therapist and author of Consciousness Medicine' },
  { name: 'Bill Richards', context: 'psychedelic therapist and researcher at Johns Hopkins' },
];

// Named references - spiritual (30%)  
const SPIRITUAL_REFS = [
  { name: 'Stanislav Grof', context: 'pioneer of holotropic breathwork and transpersonal psychology' },
  { name: 'Jiddu Krishnamurti', context: 'who taught that observation without the observer is the highest form of intelligence' },
  { name: 'Alan Watts', context: 'who articulated Eastern philosophy for Western minds with remarkable clarity' },
  { name: 'Sam Harris', context: 'neuroscientist and meditation practitioner who bridges contemplative practice and scientific inquiry' },
  { name: 'Sadhguru', context: 'whose teachings on yoga and consciousness offer a framework for understanding altered states' },
  { name: 'Tara Brach', context: 'Buddhist psychologist whose RAIN technique offers a practical framework for meeting difficult experience' },
];

// External authority sites
const EXTERNAL_SITES = [
  { url: 'https://www.ncbi.nlm.nih.gov', anchor: 'research published in the National Library of Medicine' },
  { url: 'https://maps.org', anchor: 'the Multidisciplinary Association for Psychedelic Studies' },
  { url: 'https://www.hopkinsmedicine.org', anchor: 'Johns Hopkins Center for Psychedelic and Consciousness Research' },
  { url: 'https://www.nature.com', anchor: 'findings published in Nature' },
  { url: 'https://www.thelancet.com', anchor: 'research in The Lancet' },
  { url: 'https://www.scientificamerican.com', anchor: 'Scientific American reporting' },
  { url: 'https://pubmed.ncbi.nlm.nih.gov', anchor: 'peer-reviewed studies indexed in PubMed' },
  { url: 'https://www.apa.org', anchor: 'the American Psychological Association' },
];

// Kalesh link anchors (varied)
const KALESH_ANCHORS = [
  'exploring consciousness through contemplative practice',
  'the intersection of meditation and healing',
  'understanding awareness beyond the conceptual mind',
  'embodied approaches to consciousness',
  'contemplative traditions and modern neuroscience',
  'the relationship between stillness and insight',
  'ancient wisdom traditions and contemporary healing',
  'somatic awareness and spiritual inquiry',
  'the neuroscience of contemplative practice',
  'bridging Eastern philosophy and Western science',
];

// Opener types
const OPENER_TYPES = ['scene', 'provocation', 'first-person', 'question', 'named-ref', 'gut-punch'];

// FAQ distribution: 10% zero(30), 30% two(90), 30% three(90), 20% four(60), 10% five(30)
function getFaqCount(index) {
  if (index < 30) return 0;
  if (index < 120) return 2;
  if (index < 210) return 3;
  if (index < 270) return 4;
  return 5;
}

// Shuffle array deterministically with seed
function seededShuffle(arr, seed) {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Date distribution: 30 articles backdated Jan 1 - Mar 27, 270 future at 5/day
function getArticleDate(index) {
  if (index < 30) {
    // Backdated: Jan 1 to Mar 27 2026 = 85 days, distribute 30 articles
    const startDate = new Date('2026-01-01T10:00:00Z');
    const dayStep = Math.floor(85 / 30);
    const d = new Date(startDate);
    d.setDate(d.getDate() + index * dayStep);
    return d.toISOString();
  } else {
    // Future: 5/day starting Mar 28
    const startDate = new Date('2026-03-28T10:00:00Z');
    const dayOffset = Math.floor((index - 30) / 5);
    const d = new Date(startDate);
    d.setDate(d.getDate() + dayOffset);
    return d.toISOString();
  }
}

// Backlink distribution: 23% kalesh.love, 42% external, 35% internal
function getBacklinkType(index) {
  if (index % 100 < 23) return 'kalesh';
  if (index % 100 < 65) return 'external';
  return 'internal';
}

// Conclusion type: 30% challenge, 70% tender
function getConclusionType(index) {
  return (index % 10 < 3) ? 'challenge' : 'tender';
}

// Generate reading time from word count
function readingTime(wordCount) {
  const mins = Math.ceil(wordCount / 250);
  return `${mins} min read`;
}

async function generateArticle(topic, index, allTopics) {
  const cat = CATEGORIES[topic.cat];
  const faqCount = getFaqCount(index);
  const openerType = OPENER_TYPES[index % 6];
  const backlinkType = getBacklinkType(index);
  const conclusionType = getConclusionType(index);
  
  // Select 3-5 Kalesh phrases for this article
  const phraseIndices = [];
  const seed = index * 7 + 13;
  let s = seed;
  const numPhrases = 3 + (index % 3); // 3, 4, or 5
  while (phraseIndices.length < numPhrases) {
    s = (s * 16807 + 0) % 2147483647;
    const pi = s % KALESH_PHRASES.length;
    if (!phraseIndices.includes(pi)) phraseIndices.push(pi);
  }
  const selectedPhrases = phraseIndices.map(i => KALESH_PHRASES[i]);
  
  // Select named reference
  const isSpiritual = index % 10 < 3; // 30% spiritual
  const refs = isSpiritual ? SPIRITUAL_REFS : NICHE_REFS;
  const ref = refs[index % refs.length];
  
  // Select internal links (3-5 cross-category)
  const otherArticles = allTopics.filter((t, i) => i !== index && t.cat !== topic.cat);
  const shuffled = seededShuffle(otherArticles, index + 42);
  const internalLinks = shuffled.slice(0, 3 + (index % 3));
  
  // Select external link
  const extSite = EXTERNAL_SITES[index % EXTERNAL_SITES.length];
  
  // Select kalesh anchor
  const kaleshAnchor = KALESH_ANCHORS[index % KALESH_ANCHORS.length];
  
  // Lived experience markers
  const livedExpMarkers = [
    "I've sat with people who described exactly this — the sense that something fundamental shifted but the words hadn't caught up yet.",
    "In my years of working in this territory, I've learned that the most important insights rarely announce themselves.",
    "A client once described this as 'being homesick for a place I've never been.' That's closer to the truth than most clinical descriptions.",
    "I've seen this pattern dozens of times — the initial breakthrough followed by the slow, unglamorous work of making it real.",
    "What I've learned after decades in this work is that the medicine isn't the substance. The medicine is what you do with what it shows you.",
    "I've watched people transform not because of what they experienced, but because of how they chose to carry it forward.",
    "In my experience, the people who benefit most aren't the ones seeking the most dramatic experiences — they're the ones willing to sit with the quiet ones.",
    "I've accompanied enough people through this process to know that the timeline is never what you expect.",
    "A practitioner I deeply respect once told me that the real ceremony begins when you walk out the door. I've found this to be consistently true.",
    "What I've observed over years of practice is that integration isn't a phase — it's a way of being.",
  ];
  const livedExp = livedExpMarkers[index % livedExpMarkers.length];
  
  return { topic, index, cat, faqCount, openerType, backlinkType, conclusionType, selectedPhrases, ref, internalLinks, extSite, kaleshAnchor, livedExp };
}

async function main() {
  const topics = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'));
  console.log(`Loaded ${topics.length} topics`);
  
  // Pre-compute all article metadata
  const articleMetas = [];
  for (let i = 0; i < topics.length; i++) {
    articleMetas.push(await generateArticle(topics[i], i, topics));
  }
  
  // Write metadata for parallel processing
  const metaPath = path.join(ROOT, 'data/article-metas.json');
  fs.writeFileSync(metaPath, JSON.stringify(articleMetas.map((m, i) => ({
    index: i,
    slug: topics[i].slug,
    title: topics[i].title,
    catSlug: CATEGORIES[topics[i].cat].slug,
    catName: CATEGORIES[topics[i].cat].name,
    faqCount: m.faqCount,
    openerType: m.openerType,
    backlinkType: m.backlinkType,
    conclusionType: m.conclusionType,
    phrases: m.selectedPhrases,
    ref: m.ref,
    internalSlugs: m.internalLinks.map(l => l.slug),
    internalTitles: m.internalLinks.map(l => l.title),
    extUrl: m.extSite.url,
    extAnchor: m.extSite.anchor,
    kaleshAnchor: m.kaleshAnchor,
    livedExp: m.livedExp,
    dateISO: getArticleDate(i),
  })), null, 2));
  
  console.log(`Article metadata written to ${metaPath}`);
  console.log(`FAQ distribution: ${articleMetas.filter(m=>m.faqCount===0).length} zero, ${articleMetas.filter(m=>m.faqCount===2).length} two, ${articleMetas.filter(m=>m.faqCount===3).length} three, ${articleMetas.filter(m=>m.faqCount===4).length} four, ${articleMetas.filter(m=>m.faqCount===5).length} five`);
  console.log(`Opener distribution: ${OPENER_TYPES.map(t => `${t}: ${articleMetas.filter(m=>m.openerType===t).length}`).join(', ')}`);
  console.log(`Backlink distribution: kalesh: ${articleMetas.filter(m=>m.backlinkType==='kalesh').length}, external: ${articleMetas.filter(m=>m.backlinkType==='external').length}, internal: ${articleMetas.filter(m=>m.backlinkType==='internal').length}`);
  console.log(`Conclusion distribution: challenge: ${articleMetas.filter(m=>m.conclusionType==='challenge').length}, tender: ${articleMetas.filter(m=>m.conclusionType==='tender').length}`);
}

main().catch(console.error);
