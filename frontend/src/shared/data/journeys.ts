export interface Journey {
  id: string;
  title: string;
  description: string;
  icon: string;
  eventIds: string[];
  transitions: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
}

export const JOURNEYS: Journey[] = [
  {
    id: 'rise-and-fall-of-rome',
    title: 'Rise and Fall of Rome',
    description: 'Trace the arc of the greatest empire the ancient world ever knew, from a muddy village on the Tiber to a crumbling colossus besieged by barbarians.',
    icon: '\u{1F3DB}\u{FE0F}',
    eventIds: ['founding-rome', 'roman-forum', 'julius-caesar', 'colosseum', 'fall-of-rome'],
    transitions: [
      'For centuries after its legendary founding, Rome grew from a cluster of hilltop villages into a republic governed by elected senators. The Roman Forum became the beating heart of this new political experiment \u2014 a public square where laws were debated, triumphs celebrated, and the fate of nations decided under open sky.',
      'By the 1st century BCE, the Republic was tearing itself apart. Generals commanded legions more loyal to them than to the Senate, and none exploited this more brilliantly than Julius Caesar. His crossing of the Rubicon in 49 BCE was the point of no return \u2014 the Republic died so that one man could reshape the world.',
      'Caesar\u2019s assassination did not restore the Republic; it birthed an Empire. Under Augustus and his successors, Rome built monuments to match its ambitions. The Colosseum, completed in 80 CE, was the ultimate symbol of imperial power \u2014 a stadium seating 50,000 that hosted spectacles designed to remind every citizen who ruled them.',
      'But empires that rise must also fall. Over the following centuries, economic crisis, military overextension, plague, and waves of migration slowly eroded what once seemed invincible. In 476 CE, the last Western Roman Emperor was deposed by a Germanic chieftain, and an era that had shaped the entire Mediterranean world came to its quiet, exhausted end.',
    ],
    difficulty: 'beginner',
    estimatedMinutes: 12,
  },
  {
    id: 'age-of-exploration',
    title: 'Age of Exploration',
    description: 'Follow the ships that connected continents, from Gutenberg\u2019s press to the coasts of the Americas and beyond.',
    icon: '\u{26F5}',
    eventIds: ['gutenberg-press', 'columbus-americas', 'zheng-he-voyages', 'machu-picchu'],
    transitions: [
      'Gutenberg\u2019s movable type did more than print Bibles \u2014 it spread knowledge at a speed the world had never seen. Within decades, maps, navigation charts, and accounts of distant lands circulated across Europe, igniting a feverish desire to find new trade routes. Columbus, armed with incomplete maps and boundless ambition, sailed west in 1492 convinced he would reach Asia.',
      'But Europe was not the only civilization sending ships across the seas. Decades before Columbus, the Chinese admiral Zheng He commanded treasure fleets of enormous junks \u2014 some over 120 meters long \u2014 that voyaged as far as East Africa. His expeditions showcased the Ming Dynasty\u2019s wealth and technological prowess, yet China ultimately turned inward, leaving the oceans to European rivals.',
      'While European and Asian navigators charted coastlines, deep in the Andes, the Inca Empire was building its own marvel in splendid isolation. Machu Picchu, constructed around 1450 at nearly 2,500 meters above sea level, stood as proof that extraordinary civilizations flourished far from the Old World\u2019s gaze \u2014 civilizations the Age of Exploration would soon, and violently, bring into contact with one another.',
    ],
    difficulty: 'beginner',
    estimatedMinutes: 10,
  },
  {
    id: 'the-scientific-revolution',
    title: 'The Scientific Revolution',
    description: 'From heliocentric heresy to the double helix \u2014 how humanity learned to decode the universe through observation and experiment.',
    icon: '\u{1F52D}',
    eventIds: ['copernicus-heliocentric', 'galileo-telescope', 'origin-of-species', 'dna-structure'],
    transitions: [
      'When Copernicus proposed that the Earth orbited the Sun, he did more than rearrange celestial geometry \u2014 he planted a seed of doubt in every received truth. A century later, Galileo aimed a telescope at Jupiter and saw moons orbiting another planet with his own eyes. The Church condemned him, but the evidence was irrefutable: the cosmos did not revolve around humanity.',
      'Galileo\u2019s method \u2014 observe, measure, test \u2014 became the engine of modern science. By the 19th century, Charles Darwin applied it to life itself. His theory of evolution by natural selection, published in 1859, explained the breathtaking diversity of living things without invoking design, shaking Victorian society to its foundations just as Copernicus had shaken the medieval Church.',
      'Darwin revealed that all life shares common ancestry, but it took another century to find the mechanism. In 1953, Watson and Crick unveiled the double-helix structure of DNA \u2014 the molecule that encodes the instructions for every living organism. The discovery completed a chain that began with Copernicus: from understanding our place in the cosmos, to our place in the tree of life, to the very code that makes us who we are.',
    ],
    difficulty: 'intermediate',
    estimatedMinutes: 10,
  },
  {
    id: 'ancient-wonders',
    title: 'Ancient Wonders',
    description: 'Visit the architectural marvels of antiquity, from the desert sands of Egypt to the arena floor of Rome.',
    icon: '\u{1F3F0}',
    eventIds: ['great-pyramid', 'parthenon-construction', 'library-of-alexandria', 'construction-of-petra', 'colosseum'],
    transitions: [
      'The Great Pyramid stood alone for over two millennia as the tallest structure on Earth, a testament to what focused human labor and ingenious engineering could achieve. When the Greeks began building the Parthenon around 447 BCE, they brought something new to monumental architecture: mathematical harmony. Every column, every proportion was calibrated to create the illusion of perfection \u2014 straight lines were subtly curved so they would appear straight to the human eye.',
      'While Athens celebrated beauty through stone, Alexandria pursued a different kind of monument: knowledge itself. The Great Library, founded around 300 BCE, aspired to collect every scroll in the known world. Scholars came from across the Mediterranean to study, debate, and push the boundaries of astronomy, mathematics, and medicine. It was the ancient world\u2019s greatest intellectual engine.',
      'Far to the east, the Nabataean people were carving an entire city from living rock. Petra, in modern-day Jordan, combined engineering ingenuity with artistic ambition \u2014 facades sculpted directly into sandstone cliffs, fed by a sophisticated water system that turned desert into oasis. It was a crossroads of trade and culture, hidden in a canyon yet connected to the world.',
      'The final stop brings us back to Rome, where the Flavian Amphitheatre \u2014 the Colosseum \u2014 represented the pinnacle of ancient construction technology. With retractable awnings, underground staging areas, and the capacity to flood its arena for mock naval battles, it was entertainment engineering on a scale that would not be matched for nearly two thousand years.',
    ],
    difficulty: 'beginner',
    estimatedMinutes: 14,
  },
  {
    id: 'the-world-at-war',
    title: 'The World at War',
    description: 'The devastating global conflicts of the 20th century and the fragile peace that followed.',
    icon: '\u{1F30D}',
    eventIds: ['ww1', 'russian-revolution', 'ww2', 'moon-landing', 'berlin-wall'],
    transitions: [
      'World War I shattered the old European order. Four empires collapsed, millions perished in trenches that barely moved, and the survivors emerged into a world stripped of the certainties their parents had known. In Russia, the strain of war cracked the Tsarist regime wide open \u2014 and into that void stepped Lenin and the Bolsheviks.',
      'The Russian Revolution of 1917 did not merely change one country; it split the world into ideological camps that would define the entire 20th century. The Treaty of Versailles, meant to prevent another Great War, instead planted the seeds for something worse. Two decades later, World War II engulfed the planet in a conflict of unprecedented scale and horror.',
      'From the rubble of 1945 emerged two superpowers locked in a Cold War that played out on every continent. The Space Race became the most spectacular arena of competition \u2014 and when Neil Armstrong set foot on the Moon in 1969, it was both a triumph of human ingenuity and a quiet rebuke to the idea that rivalry can only end in destruction.',
      'But the Cold War\u2019s most powerful symbol was not a rocket \u2014 it was a wall. When the Berlin Wall fell on November 9, 1989, it did not just reunify a city. It signaled the end of the ideological divide that had shaped every conflict, alliance, and revolution since 1917. The century of total war was, at last, drawing to a close.',
    ],
    difficulty: 'intermediate',
    estimatedMinutes: 14,
  },
  {
    id: 'eastern-civilizations',
    title: 'Eastern Civilizations',
    description: 'Journey across Asia\u2019s ancient cultures, from the Indus Valley\u2019s planned cities to the Mongol Empire\u2019s thundering cavalry.',
    icon: '\u{1F30F}',
    eventIds: ['indus-valley', 'birth-of-buddhism', 'great-wall-begin', 'silk-road', 'genghis-khan'],
    transitions: [
      'The Indus Valley civilization built some of the ancient world\u2019s most sophisticated cities \u2014 grid-planned streets, indoor plumbing, standardized weights \u2014 then vanished around 1900 BCE, leaving behind a script no one has yet deciphered. Centuries later, in the foothills of the Himalayas, a prince named Siddhartha Gautama renounced his wealth and set out to understand the nature of suffering. The philosophy he founded, Buddhism, would spread across all of Asia.',
      'Buddhism\u2019s message of compassion traveled along the same routes that carried silk, spices, and ideas. One of the most ambitious infrastructure projects in history helped protect these routes: the Great Wall of China, whose earliest sections date to the 7th century BCE. It was not a single structure but a network of walls, watchtowers, and garrisons built by successive dynasties to guard the northern frontier.',
      'Beyond those walls lay the Silk Road \u2014 a web of trade routes stretching from China to the Mediterranean. For over a millennium, caravans carried not just goods but religions, technologies, and diseases between East and West. The Silk Road made globalization possible long before anyone had a word for it.',
      'Then came the force that would reshape the entire network. In 1206, a nomadic warrior named Temujin united the Mongol tribes and took the title Genghis Khan. Within decades, his horsemen conquered the largest contiguous land empire in history, from Korea to Hungary. Paradoxically, the devastation of conquest was followed by the Pax Mongolica \u2014 a century of relative stability along the Silk Road that allowed ideas and commerce to flow more freely than ever before.',
    ],
    difficulty: 'intermediate',
    estimatedMinutes: 14,
  },
  {
    id: 'freedom-and-rights',
    title: 'Freedom & Rights',
    description: 'The long, unfinished march toward human liberty \u2014 from Athenian democracy to the end of apartheid.',
    icon: '\u{1F5FD}',
    eventIds: ['democracy-athens', 'magna-carta', 'french-revolution', 'emancipation-proclamation', 'civil-rights-act', 'mandela-freed'],
    transitions: [
      'In 508 BCE, the Athenian statesman Cleisthenes introduced a radical experiment: every male citizen could vote directly on laws and policy. It was imperfect \u2014 women, slaves, and foreigners were excluded \u2014 but the seed of self-governance had been planted. It would take nearly two millennia for that seed to sprout again, in an English meadow called Runnymede.',
      'In 1215, a group of rebellious barons forced King John to seal the Magna Carta, establishing for the first time that even a king was subject to law. The document itself was narrow \u2014 it mostly protected baronial privileges \u2014 but its principle proved explosive. Over centuries, it was reinterpreted as a charter of universal rights, inspiring revolutionaries from Philadelphia to Paris.',
      'The French Revolution of 1789 took the Enlightenment\u2019s ideas about liberty, equality, and popular sovereignty and turned them into a political earthquake that shook every throne in Europe. Its Declaration of the Rights of Man proclaimed that all men are born free and equal \u2014 yet the revolution also devoured its own children in the Terror. Across the Atlantic, the unfinished promise of "all men are created equal" was about to face its greatest test.',
      'In 1863, Abraham Lincoln issued the Emancipation Proclamation, declaring enslaved people in Confederate states to be free. It was a war measure as much as a moral one, but it transformed the Civil War into a fight for human freedom and set in motion the long, painful dismantling of legalized slavery in the United States.',
      'A century later, the struggle was far from over. The Civil Rights Act of 1964 outlawed discrimination based on race, color, religion, sex, or national origin \u2014 the result of decades of protest, sacrifice, and moral courage led by figures like Martin Luther King Jr. Halfway around the world, another freedom struggle was reaching its climax: after 27 years in prison, Nelson Mandela walked free in 1990, signaling the beginning of the end for apartheid in South Africa.',
    ],
    difficulty: 'advanced',
    estimatedMinutes: 18,
  },
  {
    id: 'innovation-and-discovery',
    title: 'Innovation & Discovery',
    description: 'From the first alphabet to the World Wide Web \u2014 the inventions that rewired how humanity thinks, communicates, and connects.',
    icon: '\u{1F4A1}',
    eventIds: ['phoenician-alphabet', 'gutenberg-press', 'steam-locomotive', 'telephone-invention', 'light-bulb', 'www-invention'],
    transitions: [
      'Around 1050 BCE, Phoenician traders simplified the complex writing systems of Egypt and Mesopotamia into a compact alphabet of about 22 characters. For the first time, literacy was within reach of ordinary people, not just scribes. This alphabet became the ancestor of Greek, Latin, Arabic, and Hebrew scripts \u2014 and, indirectly, of the one you are reading right now. Two and a half millennia later, another invention would amplify its reach beyond anything the Phoenicians could have imagined.',
      'Gutenberg\u2019s printing press, developed around 1440, turned the reproduction of text from a months-long task into one that took hours. Within fifty years, an estimated twenty million volumes had been printed across Europe. Knowledge became a commodity, and the monopoly of the literate elite was broken forever. The acceleration of ideas set the stage for an age of machines.',
      'In 1804, Richard Trevithick\u2019s steam locomotive hauled ten tons of iron along a tramway in Wales. It was noisy, unreliable, and revolutionary. Within a generation, railways had stitched together nations, collapsed distances, and created the modern concept of standardized time. The world was shrinking \u2014 but communication still traveled only as fast as a train could carry it.',
      'Alexander Graham Bell\u2019s telephone, patented in 1876, severed the ancient link between communication and physical distance. For the first time in human history, a voice could travel faster than a horse. The telephone rewired business, family life, and warfare, and it introduced an idea that would define the next century: instant connection across any distance.',
      'Thomas Edison\u2019s practical incandescent light bulb, demonstrated in 1879, did more than illuminate rooms \u2014 it rewired the rhythm of human life. Night was no longer a barrier to work or play. Electrification followed, and with it came the infrastructure that would eventually carry a new kind of signal: data. A century later, Tim Berners-Lee invented the World Wide Web, connecting every human with an internet connection to the sum of human knowledge \u2014 completing a chain that began with 22 Phoenician letters scratched into clay.',
    ],
    difficulty: 'advanced',
    estimatedMinutes: 18,
  },
];
