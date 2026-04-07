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

// Per-question explanations — keyed by "{eventId}-{questionIndex}"
// These are the actual learning moments that make the quiz educational.
const EXPLANATIONS: Record<string, string> = {
  // Great Pyramid
  'great-pyramid-0': 'At 146.5 meters (481 feet), the Great Pyramid was the tallest human-made structure on Earth for over 3,800 years until Lincoln Cathedral surpassed it around 1300 CE.',
  'great-pyramid-1': 'The 2.3 million limestone blocks average 2.5 tons each. They were quarried locally, while the 80-ton granite beams came from Aswan, 800 km south, transported by Nile barges.',
  'great-pyramid-2': 'Built around 2560 BCE, it held the height record until roughly 1300 CE — an astonishing 3,800 years, making it the longest-standing architectural record in history.',
  // Code of Hammurabi
  'code-hammurabi-0': 'The 282 laws covered everything from medical malpractice to minimum wages, making it the most comprehensive ancient legal code ever discovered.',
  'code-hammurabi-1': 'The stele is carved from black diorite, one of the hardest stones available — chosen to ensure the laws would endure for millennia. It weighs about 4 tons.',
  'code-hammurabi-2': 'Discovered in 1901 by French archaeologists in Susa (modern Iran), where Elamite conquerors had taken it as war plunder around 1150 BCE.',
  // Trojan War
  'trojan-war-0': 'Homer composed the Iliad around the 8th century BCE, making it one of the oldest works of Western literature. It covers only a few weeks of the ten-year siege.',
  'trojan-war-1': 'Heinrich Schliemann, a self-taught archaeologist, took Homer literally and excavated at Hisarlik, Turkey in the 1870s, finding nine cities layered on top of each other.',
  'trojan-war-2': 'According to the myth, Paris of Troy abducted Helen from her husband King Menelaus of Sparta, prompting a Greek coalition to launch a thousand ships.',
  // Founding Rome
  'founding-rome-0': 'Legend says Romulus killed his twin brother Remus in a dispute over where to build the city, then named it after himself — Roma.',
  'founding-rome-1': 'The Capitoline Wolf is one of Rome\'s most iconic symbols. Archaeological evidence from the Palatine Hill confirms settlement dating to the mid-8th century BCE.',
  'founding-rome-2': 'Excavations on the Palatine Hill have uncovered hut foundations from the 8th century BCE, lending archaeological support to the traditional founding date.',
  // Democracy Athens
  'democracy-athens-0': 'Cleisthenes reorganized Athenian government around 508 BCE, breaking the power of aristocratic families by creating 10 new tribes based on geography, not birth.',
  'democracy-athens-1': 'Athenians used sortition (random lottery) to fill most government positions, believing it was more democratic than elections, which could favor the wealthy and well-known.',
  'democracy-athens-2': 'A quorum of 6,000 citizens (out of roughly 30,000 eligible) was needed for the Assembly to vote on laws — ensuring major decisions had broad participation.',
  // Colosseum
  'colosseum-0': 'At its peak, the Colosseum seated 50,000-80,000 spectators — comparable to modern sports stadiums. Entry was free for Roman citizens.',
  'colosseum-1': 'The velarium was a retractable canvas awning operated by sailors from the Roman navy. It could shade the entire arena from sun and rain.',
  'colosseum-2': 'Emperor Titus inaugurated the Colosseum in 80 CE with 100 consecutive days of spectacles, during which over 9,000 wild animals were killed.',
  // Alexander
  'alexander-empire-0': 'Alexander died in Babylon in 323 BCE at just 32, possibly from typhoid fever complicated by heavy drinking. His empire was divided among his generals.',
  'alexander-empire-1': 'Aristotle tutored the young Alexander for three years in Macedonia. This education shaped Alexander\'s respect for learning and his decision to spread Greek culture.',
  'alexander-empire-2': 'In 15 years of campaigning from Greece to India, Alexander never lost a single battle — a military record unmatched in ancient history.',
  // Great Wall
  'great-wall-begin-0': 'Qin Shi Huang (r. 221-210 BCE) connected existing fortification walls built by rival states into a unified defensive system — the first "Great Wall."',
  'great-wall-begin-1': 'Including all branches and sections built over 2,000 years, the Great Wall system totals 21,196 km (13,171 miles) according to a 2012 Chinese government survey.',
  'great-wall-begin-2': 'Despite the popular myth, astronauts confirm the Great Wall is not visible from space with the naked eye — it\'s too narrow (about 5-8 meters wide).',
  // Julius Caesar
  'julius-caesar-0': 'The Ides of March (March 15) was a religious observance in Rome. Caesar was warned by a seer to "beware the Ides of March" — a phrase immortalized by Shakespeare.',
  'julius-caesar-1': 'The 23 stab wounds were inflicted by a group of about 60 senators, though only a few actually struck blows. A physician concluded only one wound was fatal.',
  'julius-caesar-2': 'Caesar was killed at the Theatre of Pompey, where the Senate was temporarily meeting — not at the Senate House, which was under renovation.',
  // Fall of Rome
  'fall-of-rome-0': 'The last Western Roman Emperor, Romulus Augustulus, was deposed in 476 CE by the Germanic leader Odoacer, marking the traditional end of the Western Roman Empire.',
  'fall-of-rome-1': 'The Eastern Roman Empire (Byzantine Empire) survived the fall of the West by nearly 1,000 years, until Constantinople fell to the Ottomans in 1453.',
  'fall-of-rome-2': 'Lead poisoning from Roman aqueducts is largely a myth — the calcium carbonate buildup in the pipes actually prevented significant lead contamination.',
  // Hagia Sophia
  'hagia-sophia-0': 'Built in just five years (532-537 CE) by Emperor Justinian I, the Hagia Sophia\'s dome was an engineering marvel — 31 meters across, seemingly floating on a ring of windows.',
  'hagia-sophia-1': 'The Hagia Sophia served as a cathedral for 916 years, a mosque for 481 years, a museum for 86 years, and became a mosque again in 2020.',
  'hagia-sophia-2': 'When Justinian entered the completed building, he reportedly exclaimed "Solomon, I have surpassed thee!" — comparing it to the legendary Temple of Solomon.',
  // Viking Expansion
  'viking-expansion-0': 'The 793 CE raid on Lindisfarne monastery in northeastern England shocked Christian Europe and is traditionally considered the start of the Viking Age.',
  'viking-expansion-1': 'Viking longships could sail in water as shallow as 50 cm (20 inches), allowing them to navigate rivers deep into continents and beach on shores for surprise attacks.',
  'viking-expansion-2': 'Leif Erikson reached North America around 1000 CE, nearly 500 years before Columbus. The Viking settlement at L\'Anse aux Meadows in Newfoundland confirms this.',
  // Moon Landing
  'moon-landing-0': 'Apollo 11 launched on July 16, 1969. Neil Armstrong stepped onto the Moon on July 20, watched by an estimated 600 million people worldwide.',
  'moon-landing-1': 'The Apollo Guidance Computer had just 74 KB of memory and ran at 0.043 MHz — millions of times less powerful than a modern smartphone.',
  'moon-landing-2': 'Neil Armstrong and Buzz Aldrin walked on the Moon while Michael Collins orbited overhead in the Command Module. Collins is often called "the loneliest man in history."',
  // WW1
  'ww1-0': 'The assassination of Archduke Franz Ferdinand on June 28, 1914, triggered a chain reaction of alliance obligations that drew all of Europe\'s major powers into war within six weeks.',
  'ww1-1': 'About 10 million soldiers and 7 million civilians died in WWI. The war introduced industrialized killing on an unprecedented scale — machine guns, poison gas, and trench warfare.',
  'ww1-2': 'The Treaty of Versailles imposed harsh reparations on Germany, creating economic devastation and resentment that directly contributed to the rise of Hitler and World War II.',
  // WW2
  'ww2-0': 'WWII was the deadliest conflict in human history with 70-85 million dead — about 3% of the world\'s 1940 population.',
  'ww2-1': 'D-Day (June 6, 1944) saw over 156,000 Allied troops land on five beaches in Normandy, France — the largest amphibious military operation in history.',
  'ww2-2': 'The atomic bombs dropped on Hiroshima (August 6) and Nagasaki (August 9) in 1945 killed 129,000-226,000 people and led to Japan\'s surrender, ending the war.',
  // French Revolution
  'french-revolution-0': 'The storming of the Bastille on July 14, 1789, was as much symbolic as strategic — the fortress held only seven prisoners, but represented royal tyranny.',
  'french-revolution-1': 'The guillotine was adopted as a "humane" method of execution during the Revolution. During the Reign of Terror (1793-1794), about 17,000 people were officially executed.',
  'french-revolution-2': 'The Revolution\'s motto "Liberty, Equality, Fraternity" became a foundational principle that influenced democratic movements worldwide for centuries.',
  // Columbus
  'columbus-americas-0': 'Columbus made four voyages to the Americas (1492-1504) but died believing he had reached Asia. The continents were named after Amerigo Vespucci, who recognized them as a "New World."',
  'columbus-americas-1': 'Columbus\'s three ships were the Niña, the Pinta, and the Santa María. The Santa María ran aground on Christmas Day 1492 and had to be abandoned.',
  'columbus-americas-2': 'Contrary to myth, educated Europeans already knew the Earth was round. Columbus\'s radical claim was that Asia was much closer than it actually is — he was wrong, but got lucky.',
  // Black Death
  'black-death-0': 'The Black Death killed 25-50 million Europeans between 1347-1351 — roughly 30-60% of the continent\'s population. Some villages lost every single inhabitant.',
  'black-death-1': 'The plague was caused by Yersinia pestis bacteria, spread by fleas on black rats that traveled along trade routes from Central Asia.',
  'black-death-2': 'The massive labor shortage after the plague gave surviving peasants unprecedented bargaining power, contributing to the decline of feudalism across Europe.',
  // Gutenberg
  'gutenberg-press-0': 'Gutenberg\'s key innovation was movable metal type — individual letter blocks cast from a tin-lead alloy that could be rearranged to print any text.',
  'gutenberg-press-1': 'The Gutenberg Bible (1455) was the first major book printed in Europe. About 180 copies were printed; 49 survive, each worth tens of millions of dollars.',
  'gutenberg-press-2': 'Within 50 years of Gutenberg\'s invention, an estimated 20 million volumes had been printed in Europe — more books than had been produced in the previous thousand years.',
  // Berlin Wall
  'berlin-wall-0': 'The Berlin Wall was built overnight on August 13, 1961. Families woke to find themselves separated — some people were literally walled off from their workplaces.',
  'berlin-wall-1': 'At least 140 people died trying to cross the Berlin Wall. The most famous escape methods included tunnels, hot air balloons, and even a tightrope.',
  'berlin-wall-2': 'The Wall fell on November 9, 1989, after an East German official accidentally announced immediate border opening at a press conference, prompting thousands to rush the checkpoints.',
};

function generateExplanation(eventId: string, _question: string, correctOption: string, index: number): string {
  return EXPLANATIONS[`${eventId}-${index}`] ?? `The correct answer is "${correctOption}." This relates to the history of ${eventId.replace(/-/g, ' ')}.`;
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
        explanation: generateExplanation(eventId, q.question, q.options[q.correctIndex] ?? '', i),
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
  // Additional True/False — covering more events and eras
  { id: 'founding-rome-tf-1', eventId: 'founding-rome', type: 'true-false', difficulty: 'easy', era: 'ancient', category: 'political', statement: 'According to legend, Rome was founded by twin brothers raised by a she-wolf.', isTrue: true, explanation: 'Romulus and Remus were said to be sons of Mars, the god of war. Abandoned as infants, they were suckled by a she-wolf (lupa) on the banks of the Tiber before being found by a shepherd.', points: 10 },
  { id: 'democracy-athens-tf-1', eventId: 'democracy-athens', type: 'true-false', difficulty: 'medium', era: 'classical', category: 'political', statement: 'All residents of Athens could vote in the democratic assembly.', isTrue: false, explanation: 'Only free adult male citizens could vote — roughly 30,000 out of 300,000+ residents. Women, slaves, and foreigners (metics) were excluded from political participation.', points: 20 },
  { id: 'silk-road-tf-2', eventId: 'silk-road', type: 'true-false', difficulty: 'hard', era: 'classical', category: 'discovery', statement: 'Most Silk Road merchants traveled the entire route from China to Rome.', isTrue: false, explanation: 'Very few merchants traveled the entire 6,000+ km route. Goods typically changed hands many times through intermediary traders at oasis towns and trading posts along the way.', points: 30 },
  { id: 'pompeii-tf-1', eventId: 'pompeii-destroyed', type: 'true-false', difficulty: 'easy', era: 'classical', category: 'natural', statement: 'Pompeii was destroyed by the eruption of Mount Vesuvius in 79 CE.', isTrue: true, explanation: 'Mount Vesuvius erupted on August 24, 79 CE, burying Pompeii under 4-6 meters of volcanic ash. The city was remarkably preserved and rediscovered in 1748.', points: 10 },
  { id: 'library-alexandria-tf-1', eventId: 'library-of-alexandria', type: 'true-false', difficulty: 'medium', era: 'classical', category: 'cultural', statement: 'The Library of Alexandria was destroyed in a single fire.', isTrue: false, explanation: 'The library declined gradually over centuries through multiple incidents — Julius Caesar\'s fire (48 BCE), Christian riots (391 CE), and possibly the Muslim conquest (642 CE). There was no single catastrophic destruction.', points: 20 },
  { id: 'genghis-khan-tf-1', eventId: 'genghis-khan', type: 'true-false', difficulty: 'medium', era: 'medieval', category: 'war', statement: 'The Mongol Empire was the largest contiguous land empire in history.', isTrue: true, explanation: 'At its peak under Genghis Khan\'s successors, the Mongol Empire covered 24 million km² — about 16% of Earth\'s total land area, stretching from Korea to Hungary.', points: 20 },
  { id: 'mansa-musa-tf-1', eventId: 'mansa-musa', type: 'true-false', difficulty: 'easy', era: 'medieval', category: 'cultural', statement: 'Mansa Musa of Mali is considered one of the wealthiest people in history.', isTrue: true, explanation: 'Mansa Musa\'s wealth was so vast that during his 1324 pilgrimage to Mecca, his gold spending crashed the economies of cities he passed through. His fortune is estimated at $400+ billion in modern terms.', points: 10 },
  { id: 'angkor-wat-tf-1', eventId: 'angkor-wat', type: 'true-false', difficulty: 'medium', era: 'medieval', category: 'construction', statement: 'Angkor Wat was originally built as a Buddhist temple.', isTrue: false, explanation: 'Angkor Wat was built as a Hindu temple dedicated to Vishnu in the early 12th century. It was later converted to a Buddhist temple in the late 13th century, which it remains today.', points: 20 },
  { id: 'machu-picchu-tf-1', eventId: 'machu-picchu', type: 'true-false', difficulty: 'hard', era: 'medieval', category: 'construction', statement: 'The Spanish conquistadors discovered and destroyed Machu Picchu.', isTrue: false, explanation: 'The Spanish never found Machu Picchu. The site was abandoned around 1572 and remained unknown to the outside world until American historian Hiram Bingham publicized it in 1911.', points: 30 },
  { id: 'reformation-tf-1', eventId: 'reformation-luther', type: 'true-false', difficulty: 'easy', era: 'renaissance', category: 'cultural', statement: 'Martin Luther nailed his 95 Theses to a church door in Wittenberg.', isTrue: true, explanation: 'On October 31, 1517, Luther posted his 95 Theses criticizing the Catholic Church\'s sale of indulgences on the door of All Saints\' Church in Wittenberg, Germany — an event that sparked the Protestant Reformation.', points: 10 },
  { id: 'galileo-tf-1', eventId: 'galileo-telescope', type: 'true-false', difficulty: 'medium', era: 'renaissance', category: 'discovery', statement: 'Galileo invented the telescope.', isTrue: false, explanation: 'The telescope was invented by Dutch spectacle makers around 1608. Galileo improved the design and was the first to systematically use it for astronomy, discovering Jupiter\'s moons and Saturn\'s rings.', points: 20 },
  { id: 'steam-locomotive-tf-1', eventId: 'steam-locomotive', type: 'true-false', difficulty: 'easy', era: 'industrial', category: 'discovery', statement: 'The first passenger railway ran between Liverpool and Manchester.', isTrue: true, explanation: 'The Liverpool and Manchester Railway, opened in 1830, was the world\'s first inter-city passenger railway. George Stephenson\'s "Rocket" locomotive won the famous Rainhill Trials.', points: 10 },
  { id: 'eiffel-tower-tf-1', eventId: 'eiffel-tower', type: 'true-false', difficulty: 'medium', era: 'industrial', category: 'construction', statement: 'The Eiffel Tower was originally meant to be permanent.', isTrue: false, explanation: 'The Eiffel Tower was built for the 1889 World\'s Fair and was supposed to be demolished after 20 years. It was saved because it proved useful as a radio transmission tower.', points: 20 },
  { id: 'suez-canal-tf-1', eventId: 'suez-canal', type: 'true-false', difficulty: 'medium', era: 'industrial', category: 'construction', statement: 'The Suez Canal contains locks like the Panama Canal.', isTrue: false, explanation: 'Unlike the Panama Canal, the Suez Canal has no locks because the Mediterranean and Red Sea are at roughly the same elevation. Ships simply sail through the 193 km channel.', points: 20 },
  { id: 'russian-revolution-tf-1', eventId: 'russian-revolution', type: 'true-false', difficulty: 'medium', era: 'modern', category: 'political', statement: 'The Russian Revolution of 1917 was a single event.', isTrue: false, explanation: 'There were actually two revolutions in 1917: the February Revolution that overthrew the Tsar, and the October Revolution where the Bolsheviks seized power from the provisional government.', points: 20 },
  { id: 'indian-independence-tf-1', eventId: 'indian-independence', type: 'true-false', difficulty: 'easy', era: 'modern', category: 'political', statement: 'Gandhi led India to independence through non-violent resistance.', isTrue: true, explanation: 'Mahatma Gandhi\'s strategy of non-violent civil disobedience (satyagraha) — including the Salt March and Quit India movement — was central to India achieving independence from Britain on August 15, 1947.', points: 10 },
  { id: 'chernobyl-tf-1', eventId: 'chernobyl-disaster', type: 'true-false', difficulty: 'medium', era: 'modern', category: 'natural', statement: 'The Chernobyl disaster was caused by an earthquake.', isTrue: false, explanation: 'The 1986 Chernobyl disaster was caused by a flawed reactor design combined with operator error during a safety test. A power surge led to explosions that blew the roof off Reactor 4, releasing radioactive material.', points: 20 },
  { id: 'www-invention-tf-1', eventId: 'www-invention', type: 'true-false', difficulty: 'medium', era: 'modern', category: 'discovery', statement: 'The World Wide Web and the Internet are the same thing.', isTrue: false, explanation: 'The Internet is the global network infrastructure (developed since the 1960s). The World Wide Web, invented by Tim Berners-Lee in 1989, is a system of hyperlinked pages that runs ON the Internet — just one of many services.', points: 20 },
  { id: 'persian-empire-tf-1', eventId: 'persian-empire-cyrus', type: 'true-false', difficulty: 'hard', era: 'classical', category: 'political', statement: 'Cyrus the Great freed the Jewish people from Babylonian captivity.', isTrue: true, explanation: 'After conquering Babylon in 539 BCE, Cyrus issued a decree allowing exiled peoples to return home. The Jewish community returned to Jerusalem and rebuilt the Temple — Cyrus is honored in the Hebrew Bible.', points: 30 },
  { id: 'battle-marathon-tf-1', eventId: 'battle-of-marathon', type: 'true-false', difficulty: 'easy', era: 'classical', category: 'war', statement: 'The modern marathon race distance comes from the Battle of Marathon.', isTrue: true, explanation: 'Legend says Pheidippides ran ~40 km from Marathon to Athens to announce the Greek victory over Persia in 490 BCE. The modern marathon distance of 42.195 km was standardized at the 1908 London Olympics.', points: 10 },
  { id: 'aztec-tf-1', eventId: 'aztec-tenochtitlan', type: 'true-false', difficulty: 'hard', era: 'medieval', category: 'construction', statement: 'When the Spanish arrived, Tenochtitlan was larger than any city in Spain.', isTrue: true, explanation: 'Tenochtitlan had 200,000-300,000 inhabitants in 1519 — larger than Paris or London at the time, and far larger than any Spanish city. The Aztec capital was built on an island in Lake Texcoco with causeways and aqueducts.', points: 30 },
  { id: 'penicillin-tf-1', eventId: 'penicillin-discovery', type: 'true-false', difficulty: 'easy', era: 'modern', category: 'discovery', statement: 'Alexander Fleming discovered penicillin by accident.', isTrue: true, explanation: 'In 1928, Fleming noticed that mold (Penicillium notatum) on an accidentally contaminated petri dish was killing surrounding bacteria. This accidental discovery led to the first true antibiotic.', points: 10 },
  { id: 'civil-rights-tf-1', eventId: 'civil-rights-act', type: 'true-false', difficulty: 'medium', era: 'modern', category: 'political', statement: 'The Civil Rights Act of 1964 was signed by President Kennedy.', isTrue: false, explanation: 'Although Kennedy proposed the legislation, he was assassinated in November 1963. President Lyndon B. Johnson signed the Civil Rights Act into law on July 2, 1964.', points: 20 },
  { id: 'mandela-tf-1', eventId: 'mandela-freed', type: 'true-false', difficulty: 'easy', era: 'modern', category: 'political', statement: 'Nelson Mandela spent 27 years in prison.', isTrue: true, explanation: 'Mandela was imprisoned from 1962 to 1990 — 27 years, mostly on Robben Island. After his release, he became South Africa\'s first democratically elected president in 1994.', points: 10 },
  { id: 'construction-petra-tf-1', eventId: 'construction-of-petra', type: 'true-false', difficulty: 'hard', era: 'classical', category: 'construction', statement: 'Petra was carved from the top down, not built from the ground up.', isTrue: true, explanation: 'The Nabataeans carved Petra\'s facades directly into the rose-red sandstone cliffs, working from the top downward. Al-Khazneh (The Treasury) is 40 meters tall, entirely sculpted from living rock.', points: 30 },
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
  // Additional Image-ID questions
  { id: 'img-id-vikings-1', eventId: 'viking-expansion', type: 'image-id', difficulty: 'easy', era: 'medieval', category: 'war', question: 'This warrior belongs to which seafaring culture?', imageSlug: 'vikings', imageNum: 1, options: ['Celtic Warriors', 'Viking Raiders', 'Saxon Knights', 'Norman Knights'], correctIndex: 1, explanation: 'Viking warriors were feared throughout Europe from the 8th-11th centuries. Their distinctive helmets, shields, and longships made them instantly recognizable.', points: 10 },
  { id: 'img-id-ghana-1', eventId: 'mandela-freed', type: 'image-id', difficulty: 'medium', era: 'medieval', category: 'cultural', question: 'This artwork represents which West African empire?', imageSlug: 'ghana-empire', imageNum: 14, options: ['Mali Empire', 'Songhai Empire', 'Ghana Empire', 'Benin Kingdom'], correctIndex: 2, explanation: 'The Ghana Empire (c. 300-1200 CE) was one of West Africa\'s earliest and wealthiest states, controlling the trans-Saharan gold and salt trade.', points: 20 },
  { id: 'img-id-zimbabwe-1', eventId: 'mandela-freed', type: 'image-id', difficulty: 'hard', era: 'medieval', category: 'construction', question: 'These stone ruins are from which African civilization?', imageSlug: 'kingdom-of-zimbabwe', imageNum: 1, options: ['Great Zimbabwe', 'Kingdom of Aksum', 'Ancient Nubia', 'Kilwa Sultanate'], correctIndex: 0, explanation: 'Great Zimbabwe was a medieval city of stone walls built without mortar, home to 18,000 people at its peak. It was the capital of the Kingdom of Zimbabwe (11th-15th century CE).', points: 30 },
  { id: 'img-id-olmec-1', eventId: 'teotihuacan-founded', type: 'image-id', difficulty: 'medium', era: 'classical', category: 'cultural', question: 'This carved head belongs to which Mesoamerican civilization?', imageSlug: 'olmec-civilization', imageNum: 5, options: ['Maya', 'Aztec', 'Olmec', 'Zapotec'], correctIndex: 2, explanation: 'The Olmec (1500-400 BCE) are considered the "mother culture" of Mesoamerica. They carved colossal stone heads up to 3.4 meters tall, weighing up to 50 tons.', points: 20 },
  { id: 'img-id-korea-1', eventId: 'song-dynasty-movable-type', type: 'image-id', difficulty: 'hard', era: 'medieval', category: 'cultural', question: 'These ceramics and artifacts are characteristic of which East Asian culture?', imageSlug: 'ancient-korea', imageNum: 1, options: ['Japanese Edo Period', 'Korean Joseon Dynasty', 'Chinese Song Dynasty', 'Vietnamese Le Dynasty'], correctIndex: 1, explanation: 'Korean celadon pottery and cultural artifacts from the Goryeo and Joseon periods are renowned for their distinctive blue-green glaze and elegant forms.', points: 30 },
  { id: 'img-id-ethiopia-1', eventId: 'kingdom-of-kush', type: 'image-id', difficulty: 'medium', era: 'ancient', category: 'cultural', question: 'These stone structures are from which African kingdom?', imageSlug: 'ancient-ethiopia', imageNum: 1, options: ['Kingdom of Kush', 'Aksumite Empire', 'Ancient Egypt', 'Kingdom of Punt'], correctIndex: 1, explanation: 'The Aksumite Empire in modern Ethiopia/Eritrea was one of the ancient world\'s great powers, known for its massive stone obelisks (stelae) and early adoption of Christianity.', points: 20 },
  { id: 'img-id-tunisia-1', eventId: 'fall-of-constantinople', type: 'image-id', difficulty: 'medium', era: 'medieval', category: 'construction', question: 'This architectural style is typical of which region?', imageSlug: 'ancient-tunisia', imageNum: 1, options: ['Medieval Spain', 'North Africa / Carthage', 'Ancient Greece', 'Byzantine Empire'], correctIndex: 1, explanation: 'Tunisia was home to ancient Carthage, one of Rome\'s greatest rivals. North African architecture blends Phoenician, Roman, and later Islamic influences.', points: 20 },
  { id: 'img-id-japan-1', eventId: 'meiji-restoration', type: 'image-id', difficulty: 'easy', era: 'renaissance', category: 'political', question: 'This artwork represents which country\'s culture?', imageSlug: 'japan', imageNum: 1, options: ['China', 'Japan', 'Korea', 'Vietnam'], correctIndex: 1, explanation: 'Japanese art is characterized by its distinctive aesthetic — clean lines, natural motifs, and attention to seasonal beauty, developed over centuries of relative cultural isolation during the Edo period.', points: 10 },
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
  // Additional Timeline questions
  {
    id: 'timeline-writing-1', eventId: 'code-hammurabi', type: 'timeline-order', difficulty: 'hard', era: 'ancient', category: 'cultural',
    instruction: 'Order these milestones in the history of writing',
    items: [
      { label: 'Code of Hammurabi', year: -1754 },
      { label: 'Phoenician Alphabet', year: -1050 },
      { label: 'Library of Alexandria founded', year: -283 },
      { label: 'Gutenberg Printing Press', year: 1440 },
    ],
    explanation: 'From carved law codes to mass-printed books, the evolution of writing technology spans over 3,000 years and transformed civilization at each step.',
    points: 30,
  },
  {
    id: 'timeline-religion-1', eventId: 'birth-of-buddhism', type: 'timeline-order', difficulty: 'hard', era: 'classical', category: 'cultural',
    instruction: 'Order these religious and philosophical milestones',
    items: [
      { label: 'Birth of Buddhism', year: -528 },
      { label: 'Hagia Sophia built', year: 537 },
      { label: 'First Crusade', year: 1096 },
      { label: 'Protestant Reformation', year: 1517 },
    ],
    explanation: 'These events trace the evolution of major world religions and their intersection with political power over two millennia.',
    points: 30,
  },
  {
    id: 'timeline-americas-1', eventId: 'columbus-americas', type: 'timeline-order', difficulty: 'medium', era: 'renaissance', category: 'construction',
    instruction: 'Order these events in the Americas',
    items: [
      { label: 'Teotihuacan founded', year: -100 },
      { label: 'Aztec Tenochtitlan built', year: 1325 },
      { label: 'Machu Picchu constructed', year: 1450 },
      { label: 'Columbus reaches Americas', year: 1492 },
    ],
    explanation: 'Advanced civilizations flourished in the Americas for centuries before European contact. Tenochtitlan was larger than most European cities when the Spanish arrived.',
    points: 20,
  },
  {
    id: 'timeline-trade-1', eventId: 'silk-road', type: 'timeline-order', difficulty: 'hard', era: 'classical', category: 'discovery',
    instruction: 'Order these trade and exploration milestones',
    items: [
      { label: 'Silk Road trade begins', year: -130 },
      { label: 'Zheng He\'s voyages', year: 1405 },
      { label: 'Columbus reaches Americas', year: 1492 },
      { label: 'Suez Canal opens', year: 1869 },
    ],
    explanation: 'From overland caravans to oceanic voyages to artificial waterways, humanity has constantly sought to connect distant markets and cultures.',
    points: 30,
  },
  {
    id: 'timeline-independence-1', eventId: 'indian-independence', type: 'timeline-order', difficulty: 'medium', era: 'modern', category: 'political',
    instruction: 'Order these independence and liberation events',
    items: [
      { label: 'Emancipation Proclamation', year: 1863 },
      { label: 'Indian Independence', year: 1947 },
      { label: 'Civil Rights Act', year: 1964 },
      { label: 'Mandela freed', year: 1990 },
    ],
    explanation: 'The struggle for human freedom and equality has been a defining theme of the modern era, with each movement inspiring the next across continents.',
    points: 20,
  },
  {
    id: 'timeline-disasters-1', eventId: 'pompeii-destroyed', type: 'timeline-order', difficulty: 'medium', era: 'modern', category: 'natural',
    instruction: 'Order these major disasters chronologically',
    items: [
      { label: 'Pompeii destroyed', year: 79 },
      { label: 'Black Death in Europe', year: 1347 },
      { label: 'Chernobyl disaster', year: 1986 },
      { label: 'Fukushima disaster', year: 2011 },
    ],
    explanation: 'From volcanic eruptions to pandemics to nuclear meltdowns, disasters have shaped human history and driven changes in how societies prepare for catastrophe.',
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
