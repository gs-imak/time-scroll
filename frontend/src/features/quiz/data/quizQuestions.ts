/**
 * Enhanced Quiz Question Bank — transforms existing eventQuizzes + adds new question types.
 * This is the starter set. Full question bank will be generated.
 */
import type { QuizQuestion, MCQQuestion, TrueFalseQuestion, ImageIdQuestion, TimelineOrderQuestion } from '../types';
import type { EventCategory } from '@/shared/types/events';
import { EVENT_QUIZZES } from '@/shared/data/eventQuizzes';

// Event metadata for tagging questions
const EVENT_META: Record<string, { era: string; category: EventCategory }> = {
  'great-pyramid': { era: 'ancient', category: 'construction' },
  'code-hammurabi': { era: 'ancient', category: 'political' },
  'trojan-war': { era: 'ancient', category: 'war' },
  'founding-rome': { era: 'ancient', category: 'political' },
  'democracy-athens': { era: 'classical', category: 'political' },
  'roman-forum': { era: 'classical', category: 'construction' },
  'alexander-empire': { era: 'classical', category: 'war' },
  'great-wall-begin': { era: 'classical', category: 'construction' },
  'julius-caesar': { era: 'classical', category: 'political' },
  'colosseum': { era: 'classical', category: 'construction' },
  'fall-of-rome': { era: 'classical', category: 'political' },
  'hagia-sophia': { era: 'medieval', category: 'construction' },
  'viking-expansion': { era: 'medieval', category: 'war' },
  'genghis-khan': { era: 'medieval', category: 'war' },
  'black-death': { era: 'medieval', category: 'natural' },
  'gutenberg-press': { era: 'medieval', category: 'discovery' },
  'columbus-americas': { era: 'renaissance', category: 'discovery' },
  'manhattan-purchase': { era: 'renaissance', category: 'political' },
  'french-revolution': { era: 'renaissance', category: 'political' },
  'steam-locomotive': { era: 'industrial', category: 'discovery' },
  'suez-canal': { era: 'industrial', category: 'construction' },
  'eiffel-tower': { era: 'industrial', category: 'construction' },
  'ww1': { era: 'modern', category: 'war' },
  'ww2': { era: 'modern', category: 'war' },
  'moon-landing': { era: 'modern', category: 'discovery' },
  'berlin-wall': { era: 'modern', category: 'political' },
  'www-invention': { era: 'modern', category: 'discovery' },
  'indus-valley': { era: 'ancient', category: 'construction' },
  'shang-oracle-bones': { era: 'ancient', category: 'cultural' },
  'phoenician-alphabet': { era: 'ancient', category: 'cultural' },
  'kingdom-of-kush': { era: 'ancient', category: 'political' },
  'persian-empire-cyrus': { era: 'classical', category: 'political' },
  'birth-of-buddhism': { era: 'classical', category: 'cultural' },
  'battle-of-marathon': { era: 'classical', category: 'war' },
  'parthenon-construction': { era: 'classical', category: 'construction' },
  'construction-of-petra': { era: 'classical', category: 'construction' },
  'library-of-alexandria': { era: 'classical', category: 'cultural' },
  'maurya-ashoka': { era: 'classical', category: 'political' },
  'rosetta-stone': { era: 'classical', category: 'discovery' },
  'silk-road': { era: 'classical', category: 'discovery' },
  'teotihuacan-founded': { era: 'classical', category: 'construction' },
  'pompeii-destroyed': { era: 'classical', category: 'natural' },
  'house-of-wisdom': { era: 'medieval', category: 'cultural' },
  'song-dynasty-movable-type': { era: 'medieval', category: 'discovery' },
  'battle-of-hastings': { era: 'medieval', category: 'war' },
  'first-crusade': { era: 'medieval', category: 'war' },
  'angkor-wat': { era: 'medieval', category: 'construction' },
  'magna-carta': { era: 'medieval', category: 'political' },
  'mansa-musa': { era: 'medieval', category: 'cultural' },
  'aztec-tenochtitlan': { era: 'medieval', category: 'construction' },
  'hundred-years-war': { era: 'medieval', category: 'war' },
  'zheng-he-voyages': { era: 'medieval', category: 'discovery' },
  'machu-picchu': { era: 'medieval', category: 'construction' },
  'fall-of-constantinople': { era: 'medieval', category: 'war' },
  'spanish-inquisition': { era: 'renaissance', category: 'political' },
  'reformation-luther': { era: 'renaissance', category: 'cultural' },
  'copernicus-heliocentric': { era: 'renaissance', category: 'discovery' },
  'edo-period-japan': { era: 'renaissance', category: 'political' },
  'galileo-telescope': { era: 'renaissance', category: 'discovery' },
  'taj-mahal': { era: 'renaissance', category: 'construction' },
  'emancipation-proclamation': { era: 'industrial', category: 'political' },
  'origin-of-species': { era: 'industrial', category: 'discovery' },
  'meiji-restoration': { era: 'industrial', category: 'political' },
  'telephone-invention': { era: 'industrial', category: 'discovery' },
  'light-bulb': { era: 'industrial', category: 'discovery' },
  'panama-canal': { era: 'modern', category: 'construction' },
  'russian-revolution': { era: 'modern', category: 'political' },
  'penicillin-discovery': { era: 'modern', category: 'discovery' },
  'indian-independence': { era: 'modern', category: 'political' },
  'chinese-revolution': { era: 'modern', category: 'political' },
  'dna-structure': { era: 'modern', category: 'discovery' },
  'cuban-missile-crisis': { era: 'modern', category: 'political' },
  'civil-rights-act': { era: 'modern', category: 'political' },
  'chernobyl-disaster': { era: 'modern', category: 'natural' },
  'mandela-freed': { era: 'modern', category: 'political' },
  'human-genome-project': { era: 'modern', category: 'discovery' },
  'fukushima-disaster': { era: 'modern', category: 'natural' },
  'mars-perseverance': { era: 'modern', category: 'discovery' },
};

// Difficulty assignment heuristics
const DIFFICULTY_MAP: Record<number, 'easy' | 'medium' | 'hard'> = { 0: 'easy', 1: 'medium', 2: 'hard' };

// Auto-generate explanations based on the correct answer
function generateExplanation(eventId: string, _question: string, correctOption: string): string {
  return `The correct answer is "${correctOption}." This fact relates to the historical event: ${eventId.replace(/-/g, ' ')}.`;
}

// ── Transform existing 234 MCQ questions ──
function transformExistingQuestions(): MCQQuestion[] {
  const questions: MCQQuestion[] = [];

  for (const [eventId, quizzes] of Object.entries(EVENT_QUIZZES)) {
    const meta = EVENT_META[eventId];
    if (!meta || !quizzes) continue;

    quizzes.forEach((q, i) => {
      const diff = DIFFICULTY_MAP[i] ?? 'medium';
      const points = diff === 'easy' ? 10 : diff === 'medium' ? 20 : 30;

      questions.push({
        id: `${eventId}-mcq-${i + 1}`,
        eventId,
        type: 'mcq',
        difficulty: diff,
        era: meta.era,
        category: meta.category,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: generateExplanation(eventId, q.question, q.options[q.correctIndex] ?? ''),
        points,
      });
    });
  }

  return questions;
}

// ── True/False questions ──
const TRUE_FALSE_QUESTIONS: TrueFalseQuestion[] = [
  { id: 'great-pyramid-tf-1', eventId: 'great-pyramid', type: 'true-false', difficulty: 'easy', era: 'ancient', category: 'construction', statement: 'The Great Pyramid of Giza was built by slaves.', isTrue: false, explanation: 'Archaeological evidence shows the builders were skilled, well-fed laborers organized into teams, not slaves. They received medical care and were housed in workers\' villages near the pyramid.', points: 10 },
  { id: 'colosseum-tf-1', eventId: 'colosseum', type: 'true-false', difficulty: 'easy', era: 'classical', category: 'construction', statement: 'The Roman Colosseum could be flooded for mock sea battles.', isTrue: true, explanation: 'The Colosseum had a sophisticated system of water channels that could flood the arena floor for naval battle reenactments called naumachiae, at least in its early years before the underground hypogeum was built.', points: 10 },
  { id: 'trojan-war-tf-1', eventId: 'trojan-war', type: 'true-false', difficulty: 'medium', era: 'ancient', category: 'war', statement: 'The ruins of ancient Troy were discovered in modern-day Greece.', isTrue: false, explanation: 'Heinrich Schliemann discovered the ruins of Troy at Hisarlik in northwestern Turkey (not Greece). The archaeological site revealed nine cities built on top of each other spanning millennia.', points: 20 },
  { id: 'alexander-empire-tf-1', eventId: 'alexander-empire', type: 'true-false', difficulty: 'easy', era: 'classical', category: 'war', statement: 'Alexander the Great never lost a single battle.', isTrue: true, explanation: 'Alexander the Great maintained an undefeated military record throughout his campaigns, from his first battle at age 18 until his death at 32, conquering lands from Greece to India.', points: 10 },
  { id: 'black-death-tf-1', eventId: 'black-death', type: 'true-false', difficulty: 'medium', era: 'medieval', category: 'natural', statement: 'The Black Death killed roughly one-third of Europe\'s population.', isTrue: true, explanation: 'The Black Death (1347-1351) killed an estimated 25-50 million people in Europe, roughly 30-60% of the total population. It was caused by the bacterium Yersinia pestis, spread by fleas on rats.', points: 20 },
  { id: 'gutenberg-press-tf-1', eventId: 'gutenberg-press', type: 'true-false', difficulty: 'medium', era: 'medieval', category: 'discovery', statement: 'Gutenberg invented the concept of printing from carved blocks.', isTrue: false, explanation: 'Block printing had existed in China since the 7th century. Gutenberg\'s innovation was movable type — individual metal letter blocks that could be rearranged to print any text, making mass production of books possible.', points: 20 },
  { id: 'columbus-americas-tf-1', eventId: 'columbus-americas', type: 'true-false', difficulty: 'easy', era: 'renaissance', category: 'discovery', statement: 'Columbus was trying to reach India when he arrived in the Americas.', isTrue: true, explanation: 'Columbus sailed west from Spain in 1492 seeking a shorter trade route to Asia (specifically India and the Spice Islands). He believed he had reached the outskirts of Asia, which is why indigenous peoples were called "Indians."', points: 10 },
  { id: 'french-revolution-tf-1', eventId: 'french-revolution', type: 'true-false', difficulty: 'medium', era: 'renaissance', category: 'political', statement: 'Marie Antoinette actually said "Let them eat cake."', isTrue: false, explanation: 'There is no historical evidence that Marie Antoinette ever said this. The phrase was attributed to her decades later. It originally appeared in Rousseau\'s "Confessions" referring to "a great princess" — written when Marie Antoinette was only a child.', points: 20 },
  { id: 'moon-landing-tf-1', eventId: 'moon-landing', type: 'true-false', difficulty: 'easy', era: 'modern', category: 'discovery', statement: 'The Apollo 11 mission computer had less computing power than a modern smartphone.', isTrue: true, explanation: 'The Apollo Guidance Computer had about 74KB of memory and ran at 0.043 MHz. A modern smartphone has millions of times more processing power and storage. Yet this computer was enough to land humans on the Moon.', points: 10 },
  { id: 'ww1-tf-1', eventId: 'ww1', type: 'true-false', difficulty: 'medium', era: 'modern', category: 'war', statement: 'World War I was triggered by the assassination of Archduke Franz Ferdinand.', isTrue: true, explanation: 'The assassination of Archduke Franz Ferdinand of Austria-Hungary by Gavrilo Princip on June 28, 1914 in Sarajevo set off a chain of alliance obligations that drew Europe\'s major powers into war within weeks.', points: 20 },
  { id: 'berlin-wall-tf-1', eventId: 'berlin-wall', type: 'true-false', difficulty: 'easy', era: 'modern', category: 'political', statement: 'The Berlin Wall stood for over 50 years.', isTrue: false, explanation: 'The Berlin Wall stood for 28 years (1961-1989). It was built on August 13, 1961 and fell on November 9, 1989, when East Germany opened its borders after weeks of civil unrest.', points: 10 },
  { id: 'silk-road-tf-1', eventId: 'silk-road', type: 'true-false', difficulty: 'medium', era: 'classical', category: 'discovery', statement: 'The Silk Road was a single road connecting Rome to China.', isTrue: false, explanation: 'The Silk Road was actually a vast network of interconnected trade routes spanning over 6,000 km, with multiple branches through Central Asia, the Middle East, and beyond. Very few merchants traveled the entire length.', points: 20 },
  { id: 'magna-carta-tf-1', eventId: 'magna-carta', type: 'true-false', difficulty: 'hard', era: 'medieval', category: 'political', statement: 'The Magna Carta gave equal rights to all English citizens.', isTrue: false, explanation: 'The Magna Carta (1215) primarily protected the rights of feudal barons against the king, not common people. However, it established the revolutionary principle that even the king was subject to the law, which later influenced modern democracy and human rights.', points: 30 },
  { id: 'taj-mahal-tf-1', eventId: 'taj-mahal', type: 'true-false', difficulty: 'easy', era: 'renaissance', category: 'construction', statement: 'The Taj Mahal was built as a tomb.', isTrue: true, explanation: 'The Taj Mahal was built by Mughal Emperor Shah Jahan as a mausoleum for his beloved wife Mumtaz Mahal, who died in 1631 during childbirth. It took over 20 years and 20,000 workers to complete.', points: 10 },
  { id: 'dna-structure-tf-1', eventId: 'dna-structure', type: 'true-false', difficulty: 'medium', era: 'modern', category: 'discovery', statement: 'Watson and Crick discovered the double helix structure of DNA entirely on their own.', isTrue: false, explanation: 'Watson and Crick\'s model relied heavily on Rosalind Franklin\'s X-ray crystallography data (Photo 51), which they accessed without her explicit permission. Franklin\'s contribution was not fully acknowledged during her lifetime.', points: 20 },
];

// ── Image Identification questions ──
const IMAGE_ID_QUESTIONS: ImageIdQuestion[] = [
  { id: 'img-id-rome-1', eventId: 'colosseum', type: 'image-id', difficulty: 'easy', era: 'classical', category: 'construction', question: 'Which civilization built this structure?', imageSlug: 'ancient-rome', imageNum: 6, options: ['Ancient Greece', 'Ancient Rome', 'Ancient Egypt', 'Byzantium'], correctIndex: 1, explanation: 'The Colosseum (Flavian Amphitheatre) was built in Rome between 72-80 CE under Emperors Vespasian and Titus. It could hold 50,000-80,000 spectators.', points: 10 },
  { id: 'img-id-nabataea-1', eventId: 'construction-of-petra', type: 'image-id', difficulty: 'medium', era: 'classical', category: 'construction', question: 'This carved rock facade belongs to which ancient city?', imageSlug: 'ancient-nabataea', imageNum: 1, options: ['Palmyra', 'Petra', 'Persepolis', 'Carthage'], correctIndex: 1, explanation: 'This is Al-Khazneh (The Treasury) at Petra, carved directly into rose-red sandstone cliffs by the Nabataean people around 300 BCE.', points: 20 },
  { id: 'img-id-iraq-1', eventId: 'house-of-wisdom', type: 'image-id', difficulty: 'medium', era: 'medieval', category: 'cultural', question: 'This illustration depicts a scholar from which civilization?', imageSlug: 'ancient-iraq', imageNum: 19, options: ['Ancient Persia', 'Islamic Golden Age (Baghdad)', 'Byzantine Empire', 'Ottoman Empire'], correctIndex: 1, explanation: 'The House of Wisdom in Baghdad was the world\'s greatest center of learning during the Islamic Golden Age (8th-14th centuries). Scholars there preserved and advanced Greek, Persian, and Indian knowledge.', points: 20 },
  { id: 'img-id-celts-1', eventId: 'battle-of-hastings', type: 'image-id', difficulty: 'medium', era: 'medieval', category: 'war', question: 'This warrior belongs to which culture?', imageSlug: 'celts-druids', imageNum: 6, options: ['Vikings', 'Celtic Warriors', 'Roman Legionaries', 'Saxon Knights'], correctIndex: 1, explanation: 'Celtic warriors were known for their fierce appearance, ornate weapons, and distinctive artistic style. Celtic culture dominated much of Europe before Roman expansion.', points: 20 },
  { id: 'img-id-gupta-1', eventId: 'taj-mahal', type: 'image-id', difficulty: 'hard', era: 'renaissance', category: 'construction', question: 'This temple architecture is from which Indian dynasty?', imageSlug: 'ancient-gupta-empire', imageNum: 6, options: ['Maurya Empire', 'Mughal Empire', 'Gupta Empire', 'Chola Dynasty'], correctIndex: 2, explanation: 'The Gupta Empire (320-550 CE) is considered India\'s Golden Age. Its architectural legacy influenced later Indian temple building for centuries.', points: 30 },
  { id: 'img-id-native-1', eventId: 'manhattan-purchase', type: 'image-id', difficulty: 'easy', era: 'renaissance', category: 'political', question: 'These dancers represent which culture?', imageSlug: 'native-american', imageNum: 10, options: ['Native American', 'Aboriginal Australian', 'Polynesian', 'Inuit'], correctIndex: 0, explanation: 'Native American ceremonial dances are an important part of indigenous cultural traditions across North America, often performed at powwows and community gatherings.', points: 10 },
  { id: 'img-id-minoan-1', eventId: 'trojan-war', type: 'image-id', difficulty: 'hard', era: 'ancient', category: 'war', question: 'This artifact style is characteristic of which Bronze Age civilization?', imageSlug: 'minoan-civilization', imageNum: 1, options: ['Mycenaean', 'Minoan', 'Phoenician', 'Hittite'], correctIndex: 1, explanation: 'The Minoan civilization on Crete (2700-1450 BCE) was known for its vibrant frescoes, bull-leaping imagery, and sophisticated palace complexes at Knossos.', points: 30 },
  { id: 'img-id-scythians-1', eventId: 'ww1', type: 'image-id', difficulty: 'hard', era: 'classical', category: 'war', question: 'This ornate warrior helmet style belongs to which nomadic people?', imageSlug: 'ancient-scythians', imageNum: 1, options: ['Huns', 'Scythians', 'Mongols', 'Goths'], correctIndex: 1, explanation: 'The Scythians were nomadic warriors of the Eurasian steppes (7th-3rd century BCE) known for their elaborate gold artifacts, fierce mounted archery, and extensive trade networks.', points: 30 },
];

// ── Timeline Order questions ──
const TIMELINE_QUESTIONS: TimelineOrderQuestion[] = [
  {
    id: 'timeline-ancient-1', eventId: 'great-pyramid', type: 'timeline-order', difficulty: 'medium', era: 'ancient', category: 'construction',
    instruction: 'Put these ancient wonders in chronological order',
    items: [
      { label: 'Great Pyramid of Giza', year: -2560 },
      { label: 'Parthenon of Athens', year: -447 },
      { label: 'Colosseum of Rome', year: 80 },
      { label: 'Hagia Sophia', year: 537 },
    ],
    explanation: 'These four structures span nearly 3,000 years of architectural achievement, from ancient Egypt through the Byzantine Empire.',
    points: 20,
  },
  {
    id: 'timeline-empires-1', eventId: 'alexander-empire', type: 'timeline-order', difficulty: 'medium', era: 'classical', category: 'political',
    instruction: 'Order these great empires from earliest to latest',
    items: [
      { label: 'Persian Empire of Cyrus', year: -550 },
      { label: 'Alexander\'s Empire', year: -336 },
      { label: 'Roman Republic', year: -509 },
      { label: 'Maurya Empire (Ashoka)', year: -268 },
    ],
    explanation: 'These four empires overlapped in time but each reached its peak at different moments, reshaping the ancient world in succession.',
    points: 20,
  },
  {
    id: 'timeline-medieval-1', eventId: 'battle-of-hastings', type: 'timeline-order', difficulty: 'medium', era: 'medieval', category: 'war',
    instruction: 'Order these medieval events from earliest to latest',
    items: [
      { label: 'Viking Expansion begins', year: 793 },
      { label: 'Battle of Hastings', year: 1066 },
      { label: 'First Crusade', year: 1096 },
      { label: 'Magna Carta signed', year: 1215 },
    ],
    explanation: 'These events shaped medieval Europe over four centuries, from the Viking raids that terrorized coastlines to the legal document that limited royal power.',
    points: 20,
  },
  {
    id: 'timeline-discovery-1', eventId: 'columbus-americas', type: 'timeline-order', difficulty: 'medium', era: 'renaissance', category: 'discovery',
    instruction: 'Order these exploration and discovery milestones',
    items: [
      { label: 'Gutenberg\'s Printing Press', year: 1440 },
      { label: 'Columbus reaches Americas', year: 1492 },
      { label: 'Copernicus proposes heliocentric model', year: 1543 },
      { label: 'Galileo\'s telescope observations', year: 1610 },
    ],
    explanation: 'The printing press enabled the spread of knowledge that fueled the Age of Exploration and the Scientific Revolution in rapid succession.',
    points: 20,
  },
  {
    id: 'timeline-modern-1', eventId: 'ww1', type: 'timeline-order', difficulty: 'easy', era: 'modern', category: 'war',
    instruction: 'Order these 20th century events',
    items: [
      { label: 'World War I begins', year: 1914 },
      { label: 'World War II begins', year: 1939 },
      { label: 'Moon Landing', year: 1969 },
      { label: 'Berlin Wall falls', year: 1989 },
    ],
    explanation: 'These four events defined the 20th century — from the Great War through the Cold War to its dramatic end with the fall of the Berlin Wall.',
    points: 10,
  },
  {
    id: 'timeline-revolution-1', eventId: 'french-revolution', type: 'timeline-order', difficulty: 'hard', era: 'modern', category: 'political',
    instruction: 'Order these revolutions chronologically',
    items: [
      { label: 'French Revolution', year: 1789 },
      { label: 'Russian Revolution', year: 1917 },
      { label: 'Chinese Revolution', year: 1949 },
      { label: 'Indian Independence', year: 1947 },
    ],
    explanation: 'These revolutions transformed the modern world, each inspired by but distinct from its predecessors, spanning 160 years of political upheaval.',
    points: 30,
  },
  {
    id: 'timeline-science-1', eventId: 'origin-of-species', type: 'timeline-order', difficulty: 'hard', era: 'modern', category: 'discovery',
    instruction: 'Order these scientific breakthroughs',
    items: [
      { label: 'Darwin\'s Origin of Species', year: 1859 },
      { label: 'Penicillin discovered', year: 1928 },
      { label: 'DNA structure revealed', year: 1953 },
      { label: 'Human Genome Project completed', year: 2003 },
    ],
    explanation: 'These four discoveries transformed our understanding of life itself, from evolution to antibiotics to the blueprint of human genetics.',
    points: 30,
  },
  {
    id: 'timeline-construction-1', eventId: 'eiffel-tower', type: 'timeline-order', difficulty: 'medium', era: 'industrial', category: 'construction',
    instruction: 'Order these engineering marvels',
    items: [
      { label: 'Suez Canal opens', year: 1869 },
      { label: 'Eiffel Tower built', year: 1889 },
      { label: 'Panama Canal opens', year: 1914 },
      { label: 'Moon Landing', year: 1969 },
    ],
    explanation: 'From connecting seas to reaching the Moon, these achievements represent 100 years of increasingly ambitious human engineering.',
    points: 20,
  },
];

// ── Combine all questions ──
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  ...transformExistingQuestions(),
  ...TRUE_FALSE_QUESTIONS,
  ...IMAGE_ID_QUESTIONS,
  ...TIMELINE_QUESTIONS,
];
