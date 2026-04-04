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
};
