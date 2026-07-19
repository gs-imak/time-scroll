export const EVENT_QUIZZES: Record<string, { question: string; options: string[]; correctIndex: number }[]> = {
  'great-pyramid': [
    { question: 'How tall was the Great Pyramid when it was first built?', options: ['100 meters', '146.5 meters', '200 meters', '50 meters'], correctIndex: 1 },
    { question: 'About how many stone blocks make up the Great Pyramid?', options: ['500,000', '1 million', '2.3 million', '5 million'], correctIndex: 2 },
    { question: 'How long was the Great Pyramid the tallest structure on Earth?', options: ['500 years', '1,000 years', '2,000 years', '3,800 years'], correctIndex: 3 },
  ],
  'code-hammurabi': [
    { question: 'How many laws were written in the Code of Hammurabi?', options: ['100', '282', '500', '50'], correctIndex: 1 },
    { question: 'What kind of stone was the Code of Hammurabi carved on?', options: ['White marble', 'Red granite', 'Black diorite', 'Gray limestone'], correctIndex: 2 },
    { question: 'Where can you see the Code of Hammurabi today?', options: ['British Museum, London', 'The Louvre, Paris', 'Metropolitan Museum, New York', 'Cairo Museum, Egypt'], correctIndex: 1 },
  ],
  'trojan-war': [
    { question: 'Which ancient poet told the story of the Trojan War?', options: ['Virgil', 'Socrates', 'Homer', 'Plato'], correctIndex: 2 },
    { question: 'Who discovered the ruins of ancient Troy in the 1870s?', options: ['Howard Carter', 'Heinrich Schliemann', 'Indiana Jones', 'Arthur Evans'], correctIndex: 1 },
    { question: 'According to legend, what started the Trojan War?', options: ['A stolen treasure', 'Paris took Helen from Greece', 'A border dispute', 'A broken trade agreement'], correctIndex: 1 },
  ],
  'founding-rome': [
    { question: 'According to legend, who founded the city of Rome?', options: ['Julius Caesar', 'Romulus', 'Augustus', 'Neptune'], correctIndex: 1 },
    { question: 'In the legend, what animal raised Romulus and Remus as babies?', options: ['A bear', 'An eagle', 'A she-wolf', 'A lion'], correctIndex: 2 },
    { question: 'On which hill was Rome traditionally said to be founded?', options: ['Aventine Hill', 'Capitoline Hill', 'Palatine Hill', 'Quirinal Hill'], correctIndex: 2 },
  ],
  'democracy-athens': [
    { question: 'Who introduced the democratic reforms in Athens?', options: ['Pericles', 'Socrates', 'Cleisthenes', 'Alexander'], correctIndex: 2 },
    { question: 'How were many officials chosen in Athenian democracy?', options: ['By the king', 'By lottery', 'By written exam', 'By family wealth'], correctIndex: 1 },
    { question: 'How many citizens needed to show up for the Athenian Assembly to make decisions?', options: ['100', '1,000', '6,000', '50,000'], correctIndex: 2 },
  ],
  'roman-forum': [
    { question: 'What was the name of the ancient drainage system under the Roman Forum?', options: ['Aqua Claudia', 'Cloaca Maxima', 'Via Appia', 'Pons Sublicius'], correctIndex: 1 },
    { question: 'What is the oldest street in the Roman Forum called?', options: ['Via Appia', 'Via Sacra', 'Via Flaminia', 'Via Latina'], correctIndex: 1 },
    { question: 'What did the Roman Forum become known as during the Middle Ages?', options: ['A marketplace', 'A cow field', 'A fortress', 'A church yard'], correctIndex: 1 },
  ],
  'alexander-empire': [
    { question: 'How old was Alexander the Great when he died?', options: ['25', '32', '40', '55'], correctIndex: 1 },
    { question: 'Which famous philosopher was Alexander the Great\'s teacher?', options: ['Plato', 'Socrates', 'Aristotle', 'Pythagoras'], correctIndex: 2 },
    { question: 'What is remarkable about Alexander\'s military record?', options: ['He won 100 battles', 'He never lost a battle', 'He only fought one war', 'He conquered Rome'], correctIndex: 1 },
  ],
  'great-wall-begin': [
    { question: 'Which emperor started connecting the Great Wall sections together?', options: ['Emperor Wu', 'Emperor Qin Shi Huang', 'Emperor Ming', 'Emperor Tang'], correctIndex: 1 },
    { question: 'What is the total length of all Great Wall sections combined?', options: ['5,000 km', '10,000 km', '21,196 km', '50,000 km'], correctIndex: 2 },
    { question: 'Can astronauts see the Great Wall of China from space with the naked eye?', options: ['Yes, easily', 'Only on clear days', 'No, it\'s a myth', 'Only from the Moon'], correctIndex: 2 },
  ],
  'julius-caesar': [
    { question: 'On what date was Julius Caesar assassinated?', options: ['January 1', 'March 15 (Ides of March)', 'July 4', 'December 25'], correctIndex: 1 },
    { question: 'How many times was Caesar stabbed by the conspirators?', options: ['5 times', '12 times', '23 times', '50 times'], correctIndex: 2 },
    { question: 'Where was Julius Caesar assassinated?', options: ['The Colosseum', 'The Senate House', 'The Theatre of Pompey', 'His own palace'], correctIndex: 2 },
  ],
  'colosseum': [
    { question: 'How many spectators could the Colosseum hold?', options: ['10,000-20,000', '50,000-80,000', '100,000-150,000', '200,000+'], correctIndex: 1 },
    { question: 'What was the velarium in the Colosseum?', options: ['A type of gladiator', 'A giant awning to shade spectators', 'The emperor\'s throne', 'An underground tunnel'], correctIndex: 1 },
    { question: 'How many days of games were held when the Colosseum first opened?', options: ['10 days', '30 days', '100 days', '365 days'], correctIndex: 2 },
  ],
  'fall-of-rome': [
    { question: 'What was the name of the last Roman Emperor in the West?', options: ['Julius Caesar', 'Constantine', 'Romulus Augustulus', 'Nero'], correctIndex: 2 },
    { question: 'What happened to the last Roman Emperor after he was removed?', options: ['He was executed', 'He was given a pension', 'He fled to Egypt', 'He became a gladiator'], correctIndex: 1 },
    { question: 'Roughly how many theories exist for why the Roman Empire fell?', options: ['About 10', 'About 50', 'Over 200', 'Exactly 1,000'], correctIndex: 2 },
  ],
  'hagia-sophia': [
    { question: 'What did Emperor Justinian reportedly say when the Hagia Sophia was finished?', options: ['"I am the greatest!"', '"Solomon, I have surpassed thee!"', '"Nothing is impossible!"', '"This is for the people!"'], correctIndex: 1 },
    { question: 'How many gold mosaic tiles decorate the Hagia Sophia?', options: ['1 million', '10 million', '30 million', '100 million'], correctIndex: 2 },
    { question: 'How high is the main dome of the Hagia Sophia?', options: ['25 meters', '55 meters', '75 meters', '100 meters'], correctIndex: 1 },
  ],
  'viking-expansion': [
    { question: 'What famous monastery did the Vikings raid in 793 CE?', options: ['Canterbury', 'Lindisfarne', 'Mont Saint-Michel', 'Iona'], correctIndex: 1 },
    { question: 'What was special about Viking longships that let them travel up rivers?', options: ['They had wheels', 'They had a very shallow draft (50 cm)', 'They were made of rubber', 'They could fly'], correctIndex: 1 },
    { question: 'Did the Vikings reach North America before Columbus?', options: ['No, Columbus was first', 'Yes, around 1000 CE', 'Yes, around 500 CE', 'Nobody knows for sure'], correctIndex: 1 },
  ],
  'genghis-khan': [
    { question: 'What was Genghis Khan\'s name before he became a great leader?', options: ['Kublai', 'Temujin', 'Ogedei', 'Batu'], correctIndex: 1 },
    { question: 'How did Genghis Khan organize his army?', options: ['By age groups', 'By family clans only', 'Using a decimal system (groups of 10, 100, 1000)', 'Alphabetically'], correctIndex: 2 },
    { question: 'How large was the Mongol Empire at its peak?', options: ['5 million sq km', '12 million sq km', '24 million sq km', '50 million sq km'], correctIndex: 2 },
  ],
  'black-death': [
    { question: 'What percentage of Europe\'s population was killed by the Black Death?', options: ['5-10%', '15-20%', '30-60%', '80-90%'], correctIndex: 2 },
    { question: 'What type of disease was the Black Death?', options: ['Smallpox', 'Bubonic plague', 'Cholera', 'Influenza'], correctIndex: 1 },
    { question: 'What surprising positive effect did the Black Death have on surviving workers?', options: ['They got free land', 'They could demand higher wages', 'They became nobles', 'They got longer vacations'], correctIndex: 1 },
  ],
  'gutenberg-press': [
    { question: 'In which city did Gutenberg build his printing press?', options: ['Berlin, Germany', 'Mainz, Germany', 'Paris, France', 'London, England'], correctIndex: 1 },
    { question: 'What was revolutionary about Gutenberg\'s printing press?', options: ['It used electricity', 'It used movable type', 'It printed in color', 'It was made of gold'], correctIndex: 1 },
    { question: 'How many volumes were printed within 50 years of the press being invented?', options: ['1,000', '100,000', '1 million', '20 million'], correctIndex: 3 },
  ],
  'columbus-americas': [
    { question: 'In what year did Columbus first reach the Americas?', options: ['1400', '1450', '1492', '1510'], correctIndex: 2 },
    { question: 'Where did Columbus first land in the Americas?', options: ['Florida', 'The Bahamas', 'Mexico', 'Cuba'], correctIndex: 1 },
    { question: 'What did Columbus\'s voyage begin between Europe and the Americas?', options: ['A peace treaty', 'Sustained European contact', 'A blockade', 'A trade war'], correctIndex: 1 },
  ],
  'manhattan-purchase': [
    { question: 'Who bought Manhattan island from the Lenape people?', options: ['Henry Hudson', 'Peter Minuit', 'George Washington', 'John Smith'], correctIndex: 1 },
    { question: 'How much was paid for Manhattan in 1626?', options: ['10 guilders', '60 guilders', '500 guilders', '10,000 guilders'], correctIndex: 1 },
    { question: 'What major city stands on Manhattan island today?', options: ['Boston', 'Philadelphia', 'New York City', 'Washington D.C.'], correctIndex: 2 },
  ],
  'french-revolution': [
    { question: 'In what year did the French Revolution begin?', options: ['1776', '1789', '1799', '1812'], correctIndex: 1 },
    { question: 'What famous fortress was stormed at the start of the French Revolution?', options: ['The Louvre', 'The Bastille', 'Versailles', 'Notre-Dame'], correctIndex: 1 },
    { question: 'What form of government did the French Revolution overthrow?', options: ['A democracy', 'A republic', 'A monarchy', 'A military dictatorship'], correctIndex: 2 },
  ],
  'steam-locomotive': [
    { question: 'Who built the first full-scale steam locomotive?', options: ['James Watt', 'George Stephenson', 'Richard Trevithick', 'Thomas Edison'], correctIndex: 2 },
    { question: 'In which country did the first steam locomotive run?', options: ['England', 'Wales', 'Scotland', 'France'], correctIndex: 1 },
    { question: 'In what year did the first steam locomotive make its journey?', options: ['1769', '1804', '1825', '1850'], correctIndex: 1 },
  ],
  'suez-canal': [
    { question: 'What two seas does the Suez Canal connect?', options: ['Atlantic and Pacific', 'Mediterranean and Red Sea', 'Black Sea and Caspian Sea', 'North Sea and Baltic Sea'], correctIndex: 1 },
    { question: 'When was the Suez Canal completed?', options: ['1815', '1848', '1869', '1901'], correctIndex: 2 },
    { question: 'What was the main benefit of the Suez Canal for ships?', options: ['It was free to use', 'It reduced shipping times dramatically', 'It was wider than any river', 'It could handle submarines'], correctIndex: 1 },
  ],
  'eiffel-tower': [
    { question: 'How tall was the Eiffel Tower when it was built?', options: ['150 meters', '200 meters', '300 meters', '400 meters'], correctIndex: 2 },
    { question: 'For what event was the Eiffel Tower originally constructed?', options: ['The Olympics', 'A royal wedding', 'The 1889 World\'s Fair', 'The French Revolution centennial only'], correctIndex: 2 },
    { question: 'Until what year was the Eiffel Tower the tallest structure in the world?', options: ['1900', '1915', '1930', '1950'], correctIndex: 2 },
  ],
  'ww1': [
    { question: 'What event triggered the start of World War I?', options: ['The sinking of a ship', 'The assassination of Archduke Franz Ferdinand', 'An invasion of France', 'A revolution in Russia'], correctIndex: 1 },
    { question: 'In what year did World War I begin?', options: ['1905', '1910', '1914', '1918'], correctIndex: 2 },
    { question: 'Approximately how many people were killed in World War I?', options: ['1 million', '5 million', '17 million', '50 million'], correctIndex: 2 },
  ],
  'ww2': [
    { question: 'What event is considered the start of World War II in Europe?', options: ['The bombing of London', 'Germany invading Poland', 'Japan attacking Pearl Harbor', 'Italy invading Ethiopia'], correctIndex: 1 },
    { question: 'Approximately how many people died in World War II?', options: ['10 million', '30 million', '70 million', '100 million'], correctIndex: 2 },
    { question: 'In what year did World War II begin?', options: ['1935', '1937', '1939', '1941'], correctIndex: 2 },
  ],
  'moon-landing': [
    { question: 'What was the name of the Apollo mission that first landed on the Moon?', options: ['Apollo 1', 'Apollo 9', 'Apollo 11', 'Apollo 13'], correctIndex: 2 },
    { question: 'How much computer memory did the Apollo spacecraft have?', options: ['72 KB', '1 MB', '10 MB', '1 GB'], correctIndex: 0 },
    { question: 'Which two astronauts walked on the Moon during the first landing?', options: ['Glenn and Shepard', 'Armstrong and Aldrin', 'Collins and Armstrong', 'Aldrin and Collins'], correctIndex: 1 },
  ],
  'berlin-wall': [
    { question: 'In what year did the Berlin Wall come down?', options: ['1985', '1987', '1989', '1991'], correctIndex: 2 },
    { question: 'The fall of the Berlin Wall symbolized the end of what global conflict?', options: ['World War II', 'The Cold War', 'The Korean War', 'The Vietnam War'], correctIndex: 1 },
    { question: 'What major event followed the fall of the Berlin Wall?', options: ['German reunification', 'A new wall was built', 'Germany split into three', 'Berlin became its own country'], correctIndex: 0 },
  ],
  'www-invention': [
    { question: 'Who invented the World Wide Web?', options: ['Steve Jobs', 'Bill Gates', 'Tim Berners-Lee', 'Mark Zuckerberg'], correctIndex: 2 },
    { question: 'Where was the World Wide Web invented?', options: ['MIT, USA', 'CERN, Switzerland', 'Oxford, England', 'Silicon Valley, USA'], correctIndex: 1 },
    { question: 'What generous decision did Tim Berners-Lee make about the Web?', options: ['He gave it to Google', 'He made it only for scientists', 'He chose not to patent it', 'He sold it to the government'], correctIndex: 2 },
  ],
  'indus-valley': [
    { question: 'What modern amenity did Mohenjo-daro homes have in 2600 BCE?', options: ['Electric lights', 'Bathrooms and toilets', 'Glass windows', 'Central heating'], correctIndex: 1 },
    { question: 'What ratio did Harappan bricks maintain across the entire civilization?', options: ['1:1:1', '3:2:1', '4:2:1', '5:3:1'], correctIndex: 2 },
    { question: 'Why is the Indus Valley script a mystery?', options: ['It was destroyed by fire', 'It has never been deciphered', 'It was written in invisible ink', 'Only one copy exists'], correctIndex: 1 },
  ],
  'shang-oracle-bones': [
    { question: 'What were oracle bones used for?', options: ['Building houses', 'Asking questions of spirits', 'Making weapons', 'Writing poetry'], correctIndex: 1 },
    { question: 'What were oracle bones sold as in 19th-century pharmacies?', options: ['Soap', 'Dragon bones medicine', 'Fertilizer', 'Paint pigment'], correctIndex: 1 },
    { question: 'How many years has Chinese writing been continuously used?', options: ['1,000', '2,000', '3,200+', '5,000'], correctIndex: 2 },
  ],
  'phoenician-alphabet': [
    { question: 'How many symbols were in the Phoenician alphabet?', options: ['12', '22', '52', '100'], correctIndex: 1 },
    { question: 'Where does the word "alphabet" come from?', options: ['Latin words', 'Greek words', 'Phoenician letters aleph and beth', 'Egyptian hieroglyphs'], correctIndex: 2 },
    { question: 'What famous product gave the Phoenicians their name?', options: ['Gold jewelry', 'Purple dye', 'Olive oil', 'Bronze weapons'], correctIndex: 1 },
  ],
  'kingdom-of-kush': [
    { question: 'Which country has MORE pyramids than Egypt?', options: ['Mexico', 'Sudan', 'China', 'Peru'], correctIndex: 1 },
    { question: 'What did King Piye do when he conquered Egypt?', options: ['Burned the temples', 'Restored them and spared surrendering rulers', 'Moved the capital', 'Destroyed the pyramids'], correctIndex: 1 },
    { question: 'The Kushite dynasty of Egypt is known as which dynasty?', options: ['First', 'Fifteenth', 'Twenty-Fifth', 'Thirtieth'], correctIndex: 2 },
  ],
  'persian-empire-cyrus': [
    { question: 'What is the Cyrus Cylinder often called?', options: ['First constitution', 'First declaration of human rights', 'First peace treaty', 'First tax code'], correctIndex: 1 },
    { question: 'Which captive people did Cyrus free from Babylon?', options: ['The Greeks', 'The Egyptians', 'The Jews', 'The Romans'], correctIndex: 2 },
    { question: 'How long could a message travel the Royal Road?', options: ['One month', 'Two weeks', 'Seven days', 'One day'], correctIndex: 2 },
  ],
  'birth-of-buddhism': [
    { question: 'What was Siddhartha Gautama before becoming the Buddha?', options: ['A farmer', 'A prince', 'A merchant', 'A priest'], correctIndex: 1 },
    { question: 'What does "Buddha" mean?', options: ['The Holy One', 'The Awakened One', 'The Chosen One', 'The Peaceful One'], correctIndex: 1 },
    { question: 'How many followers does Buddhism have today?', options: ['50 million', '200 million', '500 million+', '2 billion'], correctIndex: 2 },
  ],
  'battle-of-marathon': [
    { question: 'How many Athenians died at Marathon compared to 6,400 Persians?', options: ['5,000', '1,000', '192', '50'], correctIndex: 2 },
    { question: 'What modern sporting event was inspired by the battle?', options: ['The Olympics', 'The marathon race', 'Wrestling', 'Javelin throw'], correctIndex: 1 },
    { question: 'Why was Marathon so important for Western civilization?', options: ['It opened trade routes', 'Athens could have been destroyed before its golden age', 'It united Greece', 'It defeated Rome'], correctIndex: 1 },
  ],
  'parthenon-construction': [
    { question: 'What is unusual about the Parthenon\'s design?', options: ['It has no roof', 'It contains no straight lines', 'It faces south', 'It has no doors'], correctIndex: 1 },
    { question: 'How much gold covered the statue of Athena inside?', options: ['10 kg', '100 kg', '1,100 kg', '10,000 kg'], correctIndex: 2 },
    { question: 'What destroyed part of the Parthenon in 1687?', options: ['An earthquake', 'A fire', 'A mortar shell hitting its gunpowder storage', 'A flood'], correctIndex: 2 },
  ],
  'construction-of-petra': [
    { question: 'How was Petra built?', options: ['With bricks and mortar', 'Carved directly from sandstone cliffs', 'Built from marble blocks', 'Constructed from wood'], correctIndex: 1 },
    { question: 'How much of Petra has been excavated?', options: ['100%', 'About 75%', 'About 50%', 'Only about 20%'], correctIndex: 3 },
    { question: 'How did the Nabataeans solve the water problem in the desert?', options: ['They imported water', 'Built dams, cisterns, and pipes to harvest rainfall', 'They used magic', 'They lived near a river'], correctIndex: 1 },
  ],
  'library-of-alexandria': [
    { question: 'How did the Library acquire books from visiting ships?', options: ['They bought them', 'They confiscated and copied them', 'They borrowed them', 'Ships donated them'], correctIndex: 1 },
    { question: 'What did Eratosthenes calculate using two sticks and their shadows?', options: ['The distance to the Moon', 'Earth\'s circumference', 'The speed of light', 'The height of the pyramids'], correctIndex: 1 },
    { question: 'How was the Library destroyed?', options: ['One great fire', 'A tsunami', 'Gradually over centuries', 'An earthquake'], correctIndex: 2 },
  ],
  'maurya-ashoka': [
    { question: 'What made Ashoka convert to Buddhism?', options: ['A dream', 'Remorse after the bloody conquest of Kalinga', 'A monk\'s teaching', 'A plague'], correctIndex: 1 },
    { question: 'What symbol from Ashoka\'s pillar is on the Indian flag?', options: ['A lion', 'A 24-spoked wheel', 'An elephant', 'A lotus flower'], correctIndex: 1 },
    { question: 'What was unusual about Ashoka\'s hospitals?', options: ['They were free', 'They treated both humans and animals', 'They were underground', 'They used surgery'], correctIndex: 1 },
  ],
  'rosetta-stone': [
    { question: 'How many scripts are on the Rosetta Stone?', options: ['One', 'Two', 'Three', 'Four'], correctIndex: 2 },
    { question: 'Who finally deciphered the hieroglyphs?', options: ['Thomas Young', 'Jean-Francois Champollion', 'Napoleon Bonaparte', 'Howard Carter'], correctIndex: 1 },
    { question: 'How long had hieroglyphs been unreadable before the breakthrough?', options: ['200 years', '500 years', '1,000 years', '1,400 years'], correctIndex: 3 },
  ],
  'silk-road': [
    { question: 'Who was the Chinese diplomat whose journey opened the Silk Road?', options: ['Confucius', 'Zhang Qian', 'Zheng He', 'Sun Tzu'], correctIndex: 1 },
    { question: 'How long was the Silk Road network?', options: ['1,000 km', '3,000 km', '6,400 km', '12,000 km'], correctIndex: 2 },
    { question: 'What religion spread from India to China along the Silk Road?', options: ['Christianity', 'Islam', 'Buddhism', 'Hinduism'], correctIndex: 2 },
  ],
  'teotihuacan-founded': [
    { question: 'Why is Teotihuacan mysterious?', options: ['It was never finished', 'We don\'t know who built it or what they called it', 'It was built underwater', 'It appeared overnight'], correctIndex: 1 },
    { question: 'What does "Teotihuacan" mean in Aztec?', options: ['Great city', 'Place where the gods were born', 'City of gold', 'Ancient capital'], correctIndex: 1 },
    { question: 'At its peak, how many people lived in Teotihuacan?', options: ['5,000', '25,000', '125,000-200,000', '1 million'], correctIndex: 2 },
  ],
  'pompeii-destroyed': [
    { question: 'What volcano destroyed Pompeii?', options: ['Mount Etna', 'Mount Vesuvius', 'Mount Olympus', 'Mount Fuji'], correctIndex: 1 },
    { question: 'How long was Pompeii buried before being rediscovered?', options: ['100 years', '500 years', '1,000 years', 'Over 1,600 years'], correctIndex: 3 },
    { question: 'What unusual thing was found perfectly preserved at Pompeii?', options: ['A living person', 'Bread still in ovens', 'Working fountains', 'A sailing ship'], correctIndex: 1 },
  ],
  'house-of-wisdom': [
    { question: 'In which city was the House of Wisdom located?', options: ['Cairo', 'Damascus', 'Baghdad', 'Istanbul'], correctIndex: 2 },
    { question: 'What number system did Islamic scholars help spread to Europe?', options: ['Roman numerals', 'Binary', 'Hindu-Arabic numerals', 'Greek numerals'], correctIndex: 2 },
    { question: 'The word "algorithm" comes from which Islamic mathematician?', options: ['Avicenna', 'Al-Khwarizmi', 'Omar Khayyam', 'Ibn Rushd'], correctIndex: 1 },
  ],
  'song-dynasty-movable-type': [
    { question: 'Who invented movable type printing in China?', options: ['Confucius', 'Bi Sheng', 'Zheng He', 'Gutenberg'], correctIndex: 1 },
    { question: 'What were Bi Sheng\'s type pieces made from?', options: ['Metal', 'Wood', 'Baked clay', 'Jade'], correctIndex: 2 },
    { question: 'How many years before Gutenberg did Bi Sheng invent movable type?', options: ['100', '200', '400', '600'], correctIndex: 2 },
  ],
  'battle-of-hastings': [
    { question: 'Who won the Battle of Hastings?', options: ['King Harold', 'William the Conqueror', 'King Alfred', 'Viking raiders'], correctIndex: 1 },
    { question: 'In what year was the Battle of Hastings?', options: ['1066', '1099', '1215', '1337'], correctIndex: 0 },
    { question: 'What famous artwork depicts the Battle of Hastings?', options: ['The Mona Lisa', 'The Bayeux Tapestry', 'The Sistine Chapel', 'The Book of Kells'], correctIndex: 1 },
  ],
  'first-crusade': [
    { question: 'What city did the First Crusade capture in 1099?', options: ['Rome', 'Constantinople', 'Jerusalem', 'Mecca'], correctIndex: 2 },
    { question: 'Who called for the First Crusade?', options: ['The King of England', 'Pope Urban II', 'Saladin', 'Charlemagne'], correctIndex: 1 },
    { question: 'How many major Crusades were there in total?', options: ['3', '5', '9', '12'], correctIndex: 2 },
  ],
  'angkor-wat': [
    { question: 'In which modern country is Angkor Wat?', options: ['Thailand', 'Vietnam', 'Cambodia', 'Myanmar'], correctIndex: 2 },
    { question: 'Angkor Wat is the largest what in the world?', options: ['Palace', 'Religious monument', 'Castle', 'Library'], correctIndex: 1 },
    { question: 'Which empire built Angkor Wat?', options: ['Mongol', 'Khmer', 'Chinese', 'Mughal'], correctIndex: 1 },
  ],
  'magna-carta': [
    { question: 'What did the Magna Carta limit?', options: ['Trade', 'The king\'s power', 'Immigration', 'Religious practice'], correctIndex: 1 },
    { question: 'In what year was the Magna Carta signed?', options: ['1066', '1215', '1337', '1453'], correctIndex: 1 },
    { question: 'Which English king was forced to sign it?', options: ['Henry VIII', 'Richard the Lionheart', 'King John', 'Edward III'], correctIndex: 2 },
  ],
  'mansa-musa': [
    { question: 'Mansa Musa was the ruler of which empire?', options: ['Songhai', 'Ghana', 'Mali', 'Kush'], correctIndex: 2 },
    { question: 'What happened when Mansa Musa spent too much gold in Cairo?', options: ['He was arrested', 'Gold prices crashed for a decade', 'He started a war', 'He was crowned pharaoh'], correctIndex: 1 },
    { question: 'Mansa Musa is often called the what person in history?', options: ['Tallest', 'Oldest', 'Richest', 'Strongest'], correctIndex: 2 },
  ],
  'aztec-tenochtitlan': [
    { question: 'Modern Mexico City was built on top of which Aztec city?', options: ['Teotihuacan', 'Tenochtitlan', 'Chichen Itza', 'Palenque'], correctIndex: 1 },
    { question: 'Tenochtitlan was built on what?', options: ['A mountain', 'An island in a lake', 'A desert', 'A river delta'], correctIndex: 1 },
    { question: 'What was the estimated population of Tenochtitlan at its peak?', options: ['10,000', '50,000', '200,000+', '1 million'], correctIndex: 2 },
  ],
  'hundred-years-war': [
    { question: 'How long did the Hundred Years\' War actually last?', options: ['Exactly 100 years', '116 years', '75 years', '150 years'], correctIndex: 1 },
    { question: 'Which two countries fought the Hundred Years\' War?', options: ['England and Spain', 'France and Germany', 'England and France', 'Spain and Portugal'], correctIndex: 2 },
    { question: 'Which famous figure helped turn the tide for France?', options: ['Napoleon', 'Joan of Arc', 'Charlemagne', 'William the Conqueror'], correctIndex: 1 },
  ],
  'zheng-he-voyages': [
    { question: 'How did Zheng He\'s ships compare to Columbus\'s?', options: ['About the same size', 'Slightly larger', 'Nearly five times longer', 'Smaller'], correctIndex: 2 },
    { question: 'Why did China stop its voyages of exploration?', options: ['The ships sank', 'A new faction at court opposed them', 'They ran out of sailors', 'They found nothing useful'], correctIndex: 1 },
    { question: 'How many men were in Zheng He\'s fleet?', options: ['500', '5,000', '27,000', '100,000'], correctIndex: 2 },
  ],
  'machu-picchu': [
    { question: 'Why didn\'t the Spanish conquerors find Machu Picchu?', options: ['It was underground', 'It was hidden in the mountains', 'It was invisible', 'They weren\'t looking for it'], correctIndex: 1 },
    { question: 'How are Machu Picchu\'s stone blocks held together?', options: ['Cement', 'Metal clamps', 'No mortar — precision cutting only', 'Wooden pegs'], correctIndex: 2 },
    { question: 'At what altitude is Machu Picchu?', options: ['500 meters', '1,200 meters', '2,430 meters', '4,000 meters'], correctIndex: 2 },
  ],
  'fall-of-constantinople': [
    { question: 'In what year did Constantinople fall?', options: ['1204', '1389', '1453', '1492'], correctIndex: 2 },
    { question: 'Who conquered Constantinople?', options: ['The Mongols', 'The Crusaders', 'Ottoman Sultan Mehmed II', 'The Persians'], correctIndex: 2 },
    { question: 'What did the fall push European nations to do?', options: ['Stop trading', 'Find sea routes to Asia', 'Invade Africa', 'Build more walls'], correctIndex: 1 },
  ],
  'spanish-inquisition': [
    { question: 'How long did the Spanish Inquisition last?', options: ['50 years', '150 years', '250 years', '356 years'], correctIndex: 3 },
    { question: 'Who were the Inquisition\'s original targets?', options: ['Protestants', 'Conversos (converted Jews)', 'Muslims', 'Scientists'], correctIndex: 1 },
    { question: 'What economic impact did the Inquisition have on Spain?', options: ['Made it richer', 'No impact', 'Drove out skilled workers, contributing to decline', 'Increased trade'], correctIndex: 2 },
  ],
  'reformation-luther': [
    { question: 'How many theses did Martin Luther post?', options: ['10', '50', '95', '200'], correctIndex: 2 },
    { question: 'What was Luther protesting against?', options: ['Taxes', 'The sale of indulgences', 'The king', 'A war'], correctIndex: 1 },
    { question: 'What technology helped Luther\'s ideas spread rapidly?', options: ['The telegraph', 'The printing press', 'Carrier pigeons', 'Town criers'], correctIndex: 1 },
  ],
  'copernicus-heliocentric': [
    { question: 'What did Copernicus propose?', options: ['The Earth is flat', 'The Earth orbits the Sun', 'The Moon is a planet', 'Stars are very close'], correctIndex: 1 },
    { question: 'When did Copernicus see the first printed copy of his book?', options: ['10 years before he died', 'The day he died', 'He never saw it', '5 years before he died'], correctIndex: 1 },
    { question: 'How long after publication was the book banned by the Church?', options: ['Immediately', '73 years', '200 years', 'It was never banned'], correctIndex: 1 },
  ],
  'edo-period-japan': [
    { question: 'What policy isolated Japan from the world for over 200 years?', options: ['Bushido', 'Sakoku', 'Shogunate', 'Samurai code'], correctIndex: 1 },
    { question: 'What was the population of Edo (Tokyo) by 1720?', options: ['100,000', '500,000', 'Over 1 million', '5 million'], correctIndex: 2 },
    { question: 'The sankin-kotai system required lords to do what?', options: ['Pay extra taxes', 'Spend every other year at the shogun\'s court', 'Send their sons to war', 'Build new roads'], correctIndex: 1 },
  ],
  'galileo-telescope': [
    { question: 'What did Galileo discover orbiting Jupiter?', options: ['Rings', 'Four moons', 'Asteroids', 'Comets'], correctIndex: 1 },
    { question: 'What happened to Galileo for supporting heliocentrism?', options: ['He was knighted', 'He was exiled', 'He was put under house arrest for life', 'Nothing'], correctIndex: 2 },
    { question: 'What famous phrase is attributed to Galileo after his trial?', options: ['"I was wrong"', '"And yet it moves"', '"The truth will out"', '"God is great"'], correctIndex: 1 },
  ],
  'taj-mahal': [
    { question: 'Why was the Taj Mahal built?', options: ['As a palace', 'As a temple', 'As a tomb for Shah Jahan\'s wife', 'As a fortress'], correctIndex: 2 },
    { question: 'How many workers helped build the Taj Mahal?', options: ['1,000', '5,000', '20,000+', '100,000'], correctIndex: 2 },
    { question: 'What material gives the Taj Mahal its white appearance?', options: ['Limestone', 'White marble', 'Painted stone', 'Porcelain'], correctIndex: 1 },
  ],
  'emancipation-proclamation': [
    { question: 'How many enslaved people did the Proclamation eventually free?', options: ['500,000', '1 million', '3.5 million', '10 million'], correctIndex: 2 },
    { question: 'How many Black men enlisted in the Union Army after the Proclamation?', options: ['10,000', '50,000', '180,000', '500,000'], correctIndex: 2 },
    { question: 'Which Constitutional amendment permanently abolished slavery?', options: ['The 10th', 'The 13th', 'The 15th', 'The 19th'], correctIndex: 1 },
  ],
  'origin-of-species': [
    { question: 'How long did Darwin wait before publishing his theory?', options: ['1 year', '5 years', 'Over 20 years', '50 years'], correctIndex: 2 },
    { question: 'What islands inspired Darwin\'s theory?', options: ['Hawaiian Islands', 'Canary Islands', 'Galapagos Islands', 'Maldives'], correctIndex: 2 },
    { question: 'What did Darwin call his process of evolution?', options: ['Intelligent design', 'Natural selection', 'Survival theory', 'Species mutation'], correctIndex: 1 },
  ],
  'meiji-restoration': [
    { question: 'How quickly did Japan modernize after the Meiji Restoration?', options: ['100 years', 'A single generation', '500 years', 'It never fully modernized'], correctIndex: 1 },
    { question: 'What European power did Japan defeat in 1905?', options: ['France', 'Britain', 'Germany', 'Russia'], correctIndex: 3 },
    { question: 'What was the name of Japan\'s isolation policy before Meiji?', options: ['Bushido', 'Sakoku', 'Kabuki', 'Shogunate'], correctIndex: 1 },
  ],
  'telephone-invention': [
    { question: 'What were Bell\'s first words on the telephone?', options: ['"Hello?"', '"Can you hear me?"', '"Mr. Watson, come here"', '"Testing, testing"'], correctIndex: 2 },
    { question: 'How many lawsuits did Bell\'s telephone patent generate?', options: ['12', '100', 'Over 600', '2,000'], correctIndex: 2 },
    { question: 'What was ironic about Bell and telephones?', options: ['He was deaf', 'He refused to have one in his study', 'He never used one', 'He preferred telegraphs'], correctIndex: 1 },
  ],
  'light-bulb': [
    { question: 'How many materials did Edison test for light bulb filaments?', options: ['50', '300', 'Over 3,000', '10,000'], correctIndex: 2 },
    { question: 'What was Edison\'s first commercial power station called?', options: ['Edison Electric', 'Pearl Street Station', 'Menlo Park Power', 'Manhattan Light Co.'], correctIndex: 1 },
    { question: 'What concept did Edison\'s Menlo Park lab pioneer?', options: ['Assembly line', 'Industrial research and development', 'Mass marketing', 'Franchising'], correctIndex: 1 },
  ],
  'panama-canal': [
    { question: 'How many workers died building the Panama Canal?', options: ['500', '5,000', '25,000', '100,000'], correctIndex: 2 },
    { question: 'Which country tried and failed to build the canal first?', options: ['Britain', 'Spain', 'France', 'Germany'], correctIndex: 2 },
    { question: 'What killed most canal workers?', options: ['Cave-ins', 'Tropical diseases', 'Drowning', 'Exhaustion'], correctIndex: 1 },
  ],
  'russian-revolution': [
    { question: 'Who led the Bolshevik Revolution?', options: ['Stalin', 'Trotsky', 'Lenin', 'Marx'], correctIndex: 2 },
    { question: 'What slogan did the Bolsheviks use?', options: ['"Liberty, Equality, Fraternity"', '"Workers of the world, unite"', '"Peace, Land, and Bread"', '"Power to the people"'], correctIndex: 2 },
    { question: 'How did the Tsar\'s family die?', options: ['In battle', 'Of disease', 'Executed in a cellar', 'Exiled and died abroad'], correctIndex: 2 },
  ],
  'penicillin-discovery': [
    { question: 'How was penicillin discovered?', options: ['Planned experiment', 'By accident from mold contamination', 'From a plant extract', 'By analyzing blood'], correctIndex: 1 },
    { question: 'How many lives has penicillin saved?', options: ['1 million', '50 million', '200 million+', '1 billion'], correctIndex: 2 },
    { question: 'What did Fleming warn about in his Nobel lecture?', options: ['Overuse of vaccines', 'Antibiotic resistance', 'Nuclear weapons', 'Air pollution'], correctIndex: 1 },
  ],
  'indian-independence': [
    { question: 'How many people were displaced during the partition of India?', options: ['1 million', '5 million', '12-15 million', '50 million'], correctIndex: 2 },
    { question: 'Who drew the border between India and Pakistan?', options: ['Gandhi', 'Nehru', 'Sir Cyril Radcliffe', 'Lord Mountbatten'], correctIndex: 2 },
    { question: 'How long had Britain ruled India before independence?', options: ['50 years', '100 years', 'Nearly 200 years', '500 years'], correctIndex: 2 },
  ],
  'chinese-revolution': [
    { question: 'Where did Mao proclaim the People\'s Republic?', options: ['Shanghai', 'Tiananmen, Beijing', 'Nanjing', 'Hong Kong'], correctIndex: 1 },
    { question: 'What was the Great Leap Forward?', options: ['A space program', 'A rapid industrialization campaign', 'A military invasion', 'An education reform'], correctIndex: 1 },
    { question: 'Where did the Nationalists flee after losing?', options: ['Japan', 'Korea', 'Taiwan', 'Mongolia'], correctIndex: 2 },
  ],
  'dna-structure': [
    { question: 'Where did Crick announce "We have found the secret of life"?', options: ['A laboratory', 'A pub called the Eagle', 'The Royal Society', 'Parliament'], correctIndex: 1 },
    { question: 'Whose X-ray image was crucial to the DNA discovery?', options: ['Marie Curie', 'Rosalind Franklin', 'Dorothy Hodgkin', 'Barbara McClintock'], correctIndex: 1 },
    { question: 'How long was the original Nature paper about DNA?', options: ['50 pages', '10 pages', '3 pages', 'About 900 words'], correctIndex: 3 },
  ],
  'cuban-missile-crisis': [
    { question: 'How many days did the Cuban Missile Crisis last?', options: ['3', '7', '13', '30'], correctIndex: 2 },
    { question: 'Who stopped a Soviet submarine from launching a nuclear torpedo?', options: ['Kennedy', 'Khrushchev', 'Vasili Arkhipov', 'Castro'], correctIndex: 2 },
    { question: 'What did Kennedy call the naval blockade to avoid legal issues?', options: ['A siege', 'A quarantine', 'An embargo', 'A patrol'], correctIndex: 1 },
  ],
  'civil-rights-act': [
    { question: 'How long was the Senate filibuster against the Civil Rights Act?', options: ['10 days', '30 days', '54 days', '100 days'], correctIndex: 2 },
    { question: 'How many pens did Johnson use to sign the bill?', options: ['1', '5', '25', '75'], correctIndex: 3 },
    { question: 'Who received the first signing pen?', options: ['Robert Kennedy', 'Martin Luther King Jr.', 'Rosa Parks', 'Thurgood Marshall'], correctIndex: 1 },
  ],
  'chernobyl-disaster': [
    { question: 'Why were "liquidators" limited to 90-second shifts on the roof?', options: ['It was too hot', 'Lethal radiation levels', 'The roof was unstable', 'Lack of oxygen'], correctIndex: 1 },
    { question: 'How far away did Sweden detect Chernobyl\'s radiation?', options: ['100 km', '500 km', '1,100 km', '5,000 km'], correctIndex: 2 },
    { question: 'What has the Chernobyl Exclusion Zone become?', options: ['A military base', 'A wildlife sanctuary', 'A nuclear testing ground', 'A new city'], correctIndex: 1 },
  ],
  'mandela-freed': [
    { question: 'How many years was Mandela imprisoned?', options: ['10', '18', '27', '35'], correctIndex: 2 },
    { question: 'What did Mandela establish instead of seeking revenge?', options: ['A military tribunal', 'The Truth and Reconciliation Commission', 'A new constitution only', 'Trade sanctions'], correctIndex: 1 },
    { question: 'How many people watched Mandela\'s release on TV?', options: ['1 million', '100 million', '600 million', '2 billion'], correctIndex: 2 },
  ],
  'human-genome-project': [
    { question: 'How much did the Human Genome Project cost?', options: ['$1 million', '$100 million', '$2.7 billion', '$50 billion'], correctIndex: 2 },
    { question: 'How much DNA do all humans share?', options: ['50%', '75%', '90%', '99.9%'], correctIndex: 3 },
    { question: 'How many genes do humans have?', options: ['100,000+', '50,000', '20,000-25,000', '5,000'], correctIndex: 2 },
  ],
  'fukushima-disaster': [
    { question: 'What caused the Fukushima disaster?', options: ['A bomb', 'An earthquake and tsunami', 'Human error alone', 'A cyber attack'], correctIndex: 1 },
    { question: 'How did the tsunami affect the Earth itself?', options: ['It didn\'t', 'Moved Japan 2.4 meters east and shifted Earth\'s axis', 'Created a new island', 'Changed ocean currents'], correctIndex: 1 },
    { question: 'How long will cleanup take?', options: ['5 years', '10 years', '30-40 years', '100 years'], correctIndex: 2 },
  ],
  'mars-perseverance': [
    { question: 'What was Ingenuity designed for?', options: ['5 flights over 30 days', '100 flights', 'One flight only', 'No flights — ground only'], correctIndex: 0 },
    { question: 'How many flights did Ingenuity actually complete?', options: ['5', '20', '72', '150'], correctIndex: 2 },
    { question: 'Why was Jezero Crater chosen for the landing?', options: ['It\'s flat', 'It once held a lake that could have harbored life', 'It has ice', 'It\'s near the equator'], correctIndex: 1 },
  ],
};

/** Total number of per-event quiz questions across all of EVENT_QUIZZES.
 *  Import this instead of hardcoding a question count in marketing copy —
 *  see the "features/quiz/data/quizQuestions.ts" module for the separate
 *  Quiz Hub question bank, which exposes its own count via `.length`. */
export const QUESTION_COUNT: number = Object.values(EVENT_QUIZZES).reduce(
  (total, questions) => total + questions.length,
  0,
);
