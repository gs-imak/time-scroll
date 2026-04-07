/**
 * Brief civilization descriptions for the territory info card.
 * Shown when a user clicks a territory on the globe.
 */

export interface CivDescription {
  summary: string;
  knownFor: string;
  imageUrl: string;
}

export const CIV_DESCRIPTIONS: Record<string, CivDescription> = {
  rome: {
    summary: 'Founded as a small city-state in central Italy, Rome grew into a republic and then an empire that dominated the Mediterranean and much of Europe for centuries.',
    knownFor: 'Engineering, law, military conquest, roads, aqueducts, and the spread of Latin culture across Europe.',
    imageUrl: 'https://images.unsplash.com/photo-1515542483964-5e8c63d7d89b?w=640&q=80&fit=crop',
  },
  byzantium: {
    summary: 'The eastern continuation of the Roman Empire, centered on Constantinople. It preserved Roman governance and Greek culture for over a thousand years after the fall of the west.',
    knownFor: 'Preserving classical knowledge, Hagia Sophia, Orthodox Christianity, and codifying Roman law.',
    imageUrl: 'https://images.unsplash.com/photo-1683874350903-8151d987fef4?w=640&q=80&fit=crop',
  },
  hre: {
    summary: 'A complex political entity in central Europe that claimed succession to ancient Rome. Despite its name, it was a loose federation of hundreds of principalities and kingdoms.',
    knownFor: 'Medieval German politics, the electoral system, Charlemagne\'s legacy, and centuries of European power struggles.',
    imageUrl: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=640&q=80&fit=crop',
  },
  persia: {
    summary: 'One of the world\'s oldest civilizations, Persia built empires that stretched from Egypt to India. Multiple dynasties — Achaemenid, Parthian, Sasanian, Safavid — each left lasting marks.',
    knownFor: 'The first postal system, Zoroastrianism, Persian gardens, poetry, and the Royal Road trade network.',
    imageUrl: 'https://images.unsplash.com/photo-1562576605-88930bca8574?w=640&q=80&fit=crop',
  },
  china: {
    summary: 'The world\'s longest continuous civilization, unified under various dynasties for over two millennia. Each dynasty brought distinct cultural, technological, and territorial achievements.',
    knownFor: 'Paper, printing, gunpowder, the compass, silk production, the Great Wall, and Confucian philosophy.',
    imageUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=640&q=80&fit=crop',
  },
  greece: {
    summary: 'A collection of independent city-states that produced some of history\'s most influential ideas. Athens pioneered democracy; Sparta forged military excellence; Alexander spread Greek culture across Asia.',
    knownFor: 'Philosophy, democracy, the Olympic Games, theater, mathematics, and classical architecture.',
    imageUrl: 'https://images.unsplash.com/photo-1569770725012-58fac5eec229?w=640&q=80&fit=crop',
  },
  egypt: {
    summary: 'Built along the Nile River, ancient Egypt was one of the earliest and most enduring civilizations. Its pharaohs ruled for three millennia, leaving monuments that still stand today.',
    knownFor: 'Pyramids, hieroglyphics, mummification, papyrus, advanced medicine, and monumental architecture.',
    imageUrl: 'https://images.unsplash.com/photo-1692986172150-ec32dccfa5f0?w=640&q=80&fit=crop',
  },
  mongolia: {
    summary: 'Nomadic steppe warriors who built the largest contiguous land empire in history under Genghis Khan. At its peak, the Mongol Empire stretched from Korea to Hungary.',
    knownFor: 'Horse warfare, the Silk Road\'s golden age, religious tolerance, and a postal relay system spanning continents.',
    imageUrl: 'https://images.unsplash.com/photo-1600751267958-5bb0d08beb41?w=640&q=80&fit=crop',
  },
  ottoman: {
    summary: 'Founded by Turkish tribes in Anatolia, the Ottoman Empire grew into a transcontinental superpower controlling southeastern Europe, western Asia, and northern Africa for over 600 years.',
    knownFor: 'Conquest of Constantinople, architectural masterpieces, religious coexistence, and centuries of Eurasian trade.',
    imageUrl: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=640&q=80&fit=crop',
  },
  arab_caliphates: {
    summary: 'A series of Islamic empires that rapidly expanded from the Arabian Peninsula after the 7th century, unifying vast territories under Islamic governance and culture.',
    knownFor: 'Preserving and advancing science, algebra, medicine, astronomy, and building centers of learning like the House of Wisdom.',
    imageUrl: 'https://images.unsplash.com/photo-1577561426384-62154a1e9457?w=640&q=80&fit=crop',
  },
  britain: {
    summary: 'Starting as a small island kingdom, Britain built a global empire spanning every continent. At its height in the early 20th century, it governed a quarter of the world\'s population.',
    knownFor: 'The Industrial Revolution, parliamentary democracy, the English language, and naval dominance.',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=640&q=80&fit=crop',
  },
  france: {
    summary: 'A major European power since the Middle Ages. From Charlemagne to Napoleon, France shaped European culture, politics, and revolution.',
    knownFor: 'The French Revolution, Enlightenment philosophy, art, cuisine, and colonial influence across Africa and the Americas.',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=640&q=80&fit=crop',
  },
  spain: {
    summary: 'Unified in 1492 after centuries of reconquest, Spain quickly became the first global empire — colonizing the Americas, Philippines, and parts of Africa.',
    knownFor: 'Exploration, the Reconquista, the Alhambra, and the first circumnavigation of the globe.',
    imageUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=640&q=80&fit=crop',
  },
  india: {
    summary: 'The Indian subcontinent hosted a succession of kingdoms and empires over millennia — Maurya, Gupta, Chola, Mughal — each contributing to one of the world\'s richest cultural traditions.',
    knownFor: 'The concept of zero, Hinduism and Buddhism, the Taj Mahal, spice trade, and Sanskrit literature.',
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=640&q=80&fit=crop',
  },
  japan: {
    summary: 'An island civilization that developed a unique culture in relative isolation. Samurai warriors, shoguns, and emperors shaped centuries of Japanese history before rapid modernization in the 1800s.',
    knownFor: 'Bushido, Zen Buddhism, woodblock printing, the samurai class, and the Meiji-era industrial transformation.',
    imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=640&q=80&fit=crop',
  },
  vikings: {
    summary: 'Norse seafarers from Scandinavia who explored, traded, and raided across Europe, the North Atlantic, and even reached North America around 1000 CE.',
    knownFor: 'Longship navigation, sagas, runic writing, exploration of Iceland, Greenland, and Vinland.',
    imageUrl: 'https://images.unsplash.com/photo-1761570365095-f0ad45de3bd1?w=640&q=80&fit=crop',
  },
  aztecs: {
    summary: 'A Mesoamerican civilization that built a powerful empire centered on the island city of Tenochtitlan in just two centuries before the Spanish conquest.',
    knownFor: 'Tenochtitlan\'s engineering, the calendar stone, chinampas (floating gardens), and elaborate ritual culture.',
    imageUrl: 'https://images.unsplash.com/photo-1647220498890-f2ea9c3933a2?w=640&q=80&fit=crop',
  },
  phoenicia: {
    summary: 'Maritime traders based in modern-day Lebanon who established a network of colonies across the Mediterranean, most famously Carthage.',
    knownFor: 'Inventing the alphabet, purple dye production, glass-making, and pioneering Mediterranean sea trade.',
    imageUrl: 'https://images.unsplash.com/photo-1772368871875-1f536b85ad75?w=640&q=80&fit=crop',
  },
  khmer: {
    summary: 'A Southeast Asian empire that controlled much of mainland Southeast Asia from the 9th to 15th centuries, centered around the monumental temple complex of Angkor.',
    knownFor: 'Angkor Wat, sophisticated water management, Hindu-Buddhist architecture, and rice cultivation.',
    imageUrl: 'https://images.unsplash.com/photo-1554481923-a6918bd997bc?w=640&q=80&fit=crop',
  },
  babylon: {
    summary: 'One of the earliest urban civilizations, located in Mesopotamia between the Tigris and Euphrates rivers. Babylon was the cultural and political center of the ancient Near East.',
    knownFor: 'The Code of Hammurabi, the Hanging Gardens, cuneiform writing, and early astronomy and mathematics.',
    imageUrl: 'https://images.unsplash.com/photo-1762495842622-97bf58b76181?w=640&q=80&fit=crop',
  },
  kush: {
    summary: 'An African kingdom south of Egypt along the Nile that at times rivaled and even conquered its northern neighbor. It was a major center of iron production and trade.',
    knownFor: 'Nubian pyramids, iron smelting, trade with Egypt and Rome, and a unique writing system (Meroitic).',
    imageUrl: 'https://images.unsplash.com/photo-1764685761993-4bbb0cf4ba49?w=640&q=80&fit=crop',
  },
  inca: {
    summary: 'The largest empire in pre-Columbian America, stretching along the Andes from Ecuador to Chile. Built in under a century, it was connected by an extensive road network.',
    knownFor: 'Machu Picchu, quipu record-keeping, terrace farming, and an empire run without a writing system.',
    imageUrl: 'https://images.unsplash.com/photo-1539017691474-d280be4d3290?w=640&q=80&fit=crop',
  },
  maya: {
    summary: 'A Mesoamerican civilization known for sophisticated city-states that flourished for centuries in the jungles of Central America, with advanced astronomy and mathematics.',
    knownFor: 'Hieroglyphic writing, the Long Count calendar, pyramids at Chichen Itza and Tikal, and the concept of zero.',
    imageUrl: 'https://images.unsplash.com/photo-1586933613001-b003c20beac0?w=640&q=80&fit=crop',
  },
  carthage: {
    summary: 'A Phoenician colony that grew into a powerful maritime republic dominating western Mediterranean trade. Its rivalry with Rome produced the legendary Punic Wars.',
    knownFor: 'Hannibal\'s crossing of the Alps, naval warfare, merchant trading networks, and resistance against Rome.',
    imageUrl: 'https://images.unsplash.com/photo-1573322867455-fc97c490c14c?w=640&q=80&fit=crop',
  },
  mali: {
    summary: 'A West African empire that became one of the wealthiest in world history. Mansa Musa\'s legendary pilgrimage to Mecca put Mali on the map of the medieval world.',
    knownFor: 'Timbuktu as a center of learning, gold and salt trade, Mansa Musa\'s wealth, and the University of Sankore.',
    imageUrl: 'https://images.unsplash.com/photo-1552931549-06dc73ec0d25?w=640&q=80&fit=crop',
  },
  songhai: {
    summary: 'The successor to the Mali Empire, Songhai became the largest empire in African history under Sunni Ali and Askia Muhammad, dominating trans-Saharan trade routes.',
    knownFor: 'Expansion of Timbuktu, administration of vast territories, Islamic scholarship, and West African trade dominance.',
    imageUrl: 'https://images.unsplash.com/photo-1552931549-06dc73ec0d25?w=640&q=80&fit=crop',
  },
};

/**
 * Direct NAME-to-description mapping for territories that appear in GeoJSON
 * but aren't in CIV_ALIASES. Keyed by the exact properties.NAME string.
 */
export const NAME_DESCRIPTIONS: Record<string, { summary: string; knownFor: string; imageUrl?: string }> = {
  // ── European kingdoms & states ──
  'Sweden': { summary: 'A Scandinavian kingdom that grew from Viking-era origins into a major Baltic power. During the 17th century under Gustavus Adolphus, Sweden controlled much of the Baltic and was one of Europe\'s great military powers. Swedish innovations in infantry tactics revolutionized warfare.', knownFor: 'Viking heritage, Baltic empire, military innovation, the Vasa warship, and ABBA.', imageUrl: 'https://images.unsplash.com/photo-1509356843151-3e7643f38907?w=640&q=80&fit=crop' },
  'Portugal': { summary: 'A small Iberian kingdom that pioneered the Age of Exploration, establishing the first global maritime empire with colonies stretching from Brazil to Macau, Mozambique to Goa. Portuguese navigators opened sea routes that connected the world for the first time.', knownFor: 'Maritime navigation, Vasco da Gama\'s route to India, colonization of Brazil, and the spice trade.', imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=640&q=80&fit=crop' },
  'Denmark': { summary: 'A Scandinavian kingdom with deep Viking roots. At various points Denmark ruled Norway, parts of Sweden, and territories across the North Sea.', knownFor: 'Viking expeditions, the Kalmar Union, maritime trade, and early constitutional monarchy.' , imageUrl: 'https://images.unsplash.com/photo-1513622501526-616d6b10fc9e?w=640&q=80&fit=crop'},
  'Poland': { summary: 'A Central European kingdom that formed one of the largest states in Europe through its union with Lithuania. The Polish-Lithuanian Commonwealth was a major power from the 14th to 18th centuries.', knownFor: 'The Polish-Lithuanian Commonwealth, religious tolerance, the winged hussars, and Copernicus.' , imageUrl: 'https://images.unsplash.com/photo-1519197924976-5387b4e3be8f?w=640&q=80&fit=crop'},
  'Prussia': { summary: 'A German state that rose from a small duchy to become the dominant force behind German unification. Prussian military discipline and organization became legendary.', knownFor: 'Military efficiency, German unification under Bismarck, and the development of the modern state bureaucracy.' , imageUrl: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=640&q=80&fit=crop'},
  'Venice': { summary: 'A maritime republic built on lagoon islands that became one of the wealthiest cities in the world. Venice dominated Mediterranean trade for centuries.', knownFor: 'Trade networks, glassmaking, the Doge\'s Palace, Marco Polo, and Renaissance art patronage.' , imageUrl: 'https://images.unsplash.com/photo-1523906834658-3a5b20b0fccf?w=640&q=80&fit=crop'},
  'Netherlands': { summary: 'A small but wealthy republic that became a global trading power in the 17th century Dutch Golden Age, with colonies spanning from Indonesia to the Americas.', knownFor: 'The Dutch East India Company, tulip trade, Rembrandt, windmills, and maritime innovation.' , imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=640&q=80&fit=crop'},
  'Italy': { summary: 'The Italian peninsula was home to powerful city-states like Florence, Venice, and Genoa during the Renaissance, before unifying as a nation in the 19th century.', knownFor: 'The Renaissance, Roman heritage, art, architecture, opera, and culinary traditions.' , imageUrl: 'https://images.unsplash.com/photo-1515542483964-5e8c63d7d89b?w=640&q=80&fit=crop'},
  'Papal States': { summary: 'Territories in central Italy ruled directly by the Pope from the 8th century until Italian unification in 1870. The seat of the Catholic Church\'s temporal power.', knownFor: 'The Vatican, Catholic governance, Renaissance patronage, and centuries of European political influence.' , imageUrl: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=640&q=80&fit=crop'},
  'Luxembourg': { summary: 'A small but strategically important territory in western Europe that survived centuries of conflict between larger powers to become an independent nation.', knownFor: 'Strategic fortress location, medieval castles, and surviving as an independent state despite its small size.' },
  'Austrian Empire': { summary: 'The Habsburg domain in Central Europe that grew from a duchy into one of Europe\'s most powerful empires, eventually forming Austria-Hungary.', knownFor: 'Habsburg dynasty, Vienna as a cultural capital, classical music (Mozart, Beethoven), and multi-ethnic governance.' },
  'Angevin Empire': { summary: 'The territories held by the Plantagenet kings of England in the 12th-13th centuries, stretching from Scotland to the Pyrenees.', knownFor: 'Henry II\'s vast domain, the rivalry with France, and the origins of English common law.' },
  'Armenia': { summary: 'One of the world\'s oldest civilizations, Armenia was the first nation to adopt Christianity as a state religion in 301 CE. Its kingdom persisted despite constant pressure from larger empires.', knownFor: 'First Christian nation, the Armenian alphabet, illuminated manuscripts, and cultural resilience.' , imageUrl: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=640&q=80&fit=crop'},
  'Georgia': { summary: 'A Caucasian kingdom with a rich Christian heritage that experienced a golden age in the 12th-13th centuries under Queen Tamar.', knownFor: 'Ancient winemaking, unique alphabet, the poem "The Knight in the Panther\'s Skin," and Caucasian architecture.' },
  'Cyprus': { summary: 'A Mediterranean island at the crossroads of three continents, ruled in turn by Egyptians, Greeks, Romans, Crusaders, Venetians, and Ottomans.', knownFor: 'Copper production (the island gave copper its name), Aphrodite\'s mythical birthplace, and Crusader-era castles.' , imageUrl: 'https://images.unsplash.com/photo-1600775507917-90885fa93b6f?w=640&q=80&fit=crop'},

  // ── Asian kingdoms & empires ──
  'Korea': { summary: 'A peninsula civilization with a history spanning thousands of years, unified under various dynasties including Silla, Goryeo, and Joseon.', knownFor: 'Hangul alphabet, celadon pottery, printing technology, kimchi, and Confucian scholarship.' , imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=640&q=80&fit=crop'},
  'Tibet': { summary: 'A highland kingdom on the Tibetan Plateau that developed a unique Buddhist civilization. The Tibetan Empire once rivaled Tang China in power.', knownFor: 'Tibetan Buddhism, the Dalai Lama lineage, Potala Palace, and high-altitude monasteries.' , imageUrl: 'https://images.unsplash.com/photo-1558431382-0e37b2c1e5da?w=640&q=80&fit=crop'},
  'Nepal': { summary: 'A Himalayan kingdom nestled between India and Tibet, home to diverse ethnic groups and the birthplace of Siddhartha Gautama (the Buddha).', knownFor: 'Mount Everest, birthplace of Buddhism, Gurkha warriors, and Hindu-Buddhist temple architecture.' , imageUrl: 'https://images.unsplash.com/photo-1544735716-7f1aef2f8c44?w=640&q=80&fit=crop'},
  'Bhutan': { summary: 'A small Himalayan kingdom that maintained its independence through isolation and strategic diplomacy. It measures prosperity through Gross National Happiness.', knownFor: 'Dzong fortresses, Thunder Dragon symbolism, Buddhist monasteries, and environmental conservation.' , imageUrl: 'https://images.unsplash.com/photo-1553856622-d1b352e24756?w=640&q=80&fit=crop'},
  'Philippines': { summary: 'An archipelago of over 7,000 islands with a pre-colonial history of maritime trade, barangay governance, and cultural exchange with China, India, and the Islamic world.', knownFor: 'Rice terraces of the Cordilleras, maritime trade networks, and diverse indigenous cultures.' , imageUrl: 'https://images.unsplash.com/photo-1518509562904-a7ef1a9a6453?w=640&q=80&fit=crop'},
  'Afghanistan': { summary: 'Positioned at the crossroads of Central and South Asia, Afghanistan has been a contested corridor for empires from Alexander the Great to the Mughals and British.', knownFor: 'The Silk Road, Bamiyan Buddhas, Pashtun warrior culture, and its role as a crossroads of civilizations.' , imageUrl: 'https://images.unsplash.com/photo-1567532939941-a387e1e1c3f0?w=640&q=80&fit=crop'},
  'Đại Việt': { summary: 'The Vietnamese kingdom that fought for independence from Chinese rule and built a sophisticated civilization in Southeast Asia over a thousand years.', knownFor: 'Resistance against Chinese and Mongol invasions, the Lý and Trần dynasties, and Temple of Literature.' },
  'Champa': { summary: 'A Hindu-influenced kingdom in central and southern Vietnam that thrived on maritime trade from the 2nd to 17th centuries.', knownFor: 'Mỹ Sơn temple ruins, maritime commerce, Hindu-Buddhist art, and resistance against Vietnamese expansion.' },
  'Simhala': { summary: 'The ancient name for Sri Lanka\'s Sinhalese kingdoms, which built advanced hydraulic civilizations with massive irrigation reservoirs.', knownFor: 'Sigiriya rock fortress, ancient irrigation tanks, Theravada Buddhism, and the Temple of the Tooth.' },
  'Arakan': { summary: 'A coastal kingdom in western Myanmar (Burma) that served as a bridge between the Indian and Southeast Asian worlds.', knownFor: 'Maritime trade, Buddhist monuments, the Mrauk U kingdom, and cultural fusion of Indian and Burmese traditions.' },
  'Brunei': { summary: 'A Malay sultanate on the island of Borneo that once controlled much of coastal Borneo and the Philippines before European colonization.', knownFor: 'The Bruneian Empire\'s maritime reach, Islamic governance, and control of Southeast Asian trade routes.' },

  // ── African kingdoms & peoples ──
  'Ethiopia': { summary: 'One of the oldest nations in the world, Ethiopia was never colonized and maintains a continuous history stretching back to the Aksumite Kingdom.', knownFor: 'The Ark of the Covenant tradition, rock-hewn churches of Lalibela, Ge\'ez script, and coffee\'s origin.' , imageUrl: 'https://images.unsplash.com/photo-1518509562904-a7ef1a9a6453?w=640&q=80&fit=crop'},
  'Morocco': { summary: 'A North African kingdom at the gateway between Europe and Africa, ruled by various dynasties from the Almoravids to the Alaouites.', knownFor: 'Marrakech, Fez\'s medieval medina, Berber culture, and control of trans-Saharan trade routes.' , imageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=640&q=80&fit=crop'},
  'Congo': { summary: 'The Kingdom of Kongo was one of the most powerful states in Central Africa, with sophisticated governance and extensive trade networks before European contact.', knownFor: 'Metalworking, textile production, the Kongo-Portuguese alliance, and complex political organization.' },
  'Benin': { summary: 'The Kingdom of Benin (in modern Nigeria) was famous for its sophisticated bronze-casting artisans and powerful obas who ruled for centuries.', knownFor: 'Benin Bronzes, advanced metalwork, city walls, and a highly organized political system.' , imageUrl: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=640&q=80&fit=crop'},
  'Bornu-Kanem': { summary: 'A long-lived African empire near Lake Chad that was a major center of Islamic learning and trans-Saharan commerce for nearly a millennium.', knownFor: 'Islamic scholarship, trans-Saharan trade, cavalry warfare, and diplomatic relations across the Sahara.' , imageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=640&q=80&fit=crop'},
  'Senegal': { summary: 'A region of West Africa home to powerful kingdoms including the Wolof Empire and the Jolof Confederation, important centers of trade and Islam.', knownFor: 'Gorée Island\'s historical significance, the Wolof Empire, groundnut trade, and Sufi Islamic traditions.' , imageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=640&q=80&fit=crop'},
  'Madagascar': { summary: 'A large island off southeastern Africa settled by both African and Austronesian peoples, creating a unique cultural blend found nowhere else on Earth.', knownFor: 'Unique biodiversity, Austronesian-African cultural fusion, the Merina kingdom, and rice terrace agriculture.' , imageUrl: 'https://images.unsplash.com/photo-1580060839134-d437e8ab6708?w=640&q=80&fit=crop'},
  'Oman': { summary: 'An Arabian maritime power that built a trading empire stretching from East Africa to the Indian subcontinent, controlling key Indian Ocean routes.', knownFor: 'Maritime trade dominance, the Sultanate of Zanzibar, frankincense, and Ibadi Islam.' , imageUrl: 'https://images.unsplash.com/photo-1567532939941-a387e1e1c3f0?w=640&q=80&fit=crop'},
  'Yemen': { summary: 'One of the oldest centers of civilization in the Arabian Peninsula, home to the legendary Kingdom of Sheba and important in the ancient incense trade.', knownFor: 'The Queen of Sheba, the incense route, ancient dams of Ma\'rib, and early coffee cultivation.' , imageUrl: 'https://images.unsplash.com/photo-1567532939941-a387e1e1c3f0?w=640&q=80&fit=crop'},
  'Hadramaut': { summary: 'An ancient region of southern Arabia known for its merchant diaspora, distinctive mud-brick architecture, and role in the incense trade.', knownFor: 'Tall mud-brick tower houses, frankincense and myrrh trade, and the Hadrami merchant diaspora across the Indian Ocean.' , imageUrl: 'https://images.unsplash.com/photo-1567532939941-a387e1e1c3f0?w=640&q=80&fit=crop'},

  // ── Americas ──
  'United States': { summary: 'Founded through revolution in 1776, the United States expanded from 13 Atlantic colonies to a continental power and became the world\'s dominant superpower in the 20th century.', knownFor: 'The Constitution, westward expansion, industrialization, the space program, and global cultural influence.' , imageUrl: 'https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=640&q=80&fit=crop'},
  'Haiti': { summary: 'The site of the only successful large-scale slave revolution in history. Haiti became the first free Black republic in 1804 and the second independent nation in the Americas.', knownFor: 'The Haitian Revolution, Toussaint Louverture, Vodou culture, and being the first free Black republic.' , imageUrl: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=640&q=80&fit=crop'},
  'Paraguay': { summary: 'A landlocked South American nation with a unique history including Jesuit missions and the devastating War of the Triple Alliance.', knownFor: 'Guaraní culture, Jesuit Reductions, bilingual society, and resilience through devastating wars.' },

  // ── Indigenous & regional groups ──
  'Australian aboriginal hunter-gatherers': { summary: 'The Indigenous peoples of Australia represent the world\'s oldest continuous civilization, with a presence spanning over 65,000 years. Hundreds of distinct nations developed across the continent.', knownFor: 'The world\'s oldest art (rock paintings), the Dreamtime cosmology, fire-stick farming, and boomerang technology.' , imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&q=80&fit=crop'},
  'Ainu': { summary: 'The indigenous people of northern Japan, Sakhalin, and the Kuril Islands, with a distinct language and culture separate from the Japanese.', knownFor: 'Bear ceremonies, unique textile arts, oral epic traditions, and a language with no known relatives.' },
  'Polynesians': { summary: 'Master navigators who colonized the vast Pacific Ocean from Hawaii to New Zealand to Easter Island, using only stars, waves, and wind patterns.', knownFor: 'Open-ocean navigation without instruments, the Polynesian triangle, moai statues, and taro cultivation.' , imageUrl: 'https://images.unsplash.com/photo-1589308580012-94b07a7ab413?w=640&q=80&fit=crop'},
  'Guanches': { summary: 'The indigenous Berber people of the Canary Islands who lived in isolation for thousands of years before European contact in the 14th century.', knownFor: 'Whistled language (Silbo Gomero), mummification practices, cave dwellings, and Berber heritage.' , imageUrl: 'https://images.unsplash.com/photo-1500581276021-a4bbcd0e6064?w=640&q=80&fit=crop'},
  'Saami': { summary: 'The indigenous people of northern Scandinavia and the Kola Peninsula, one of Europe\'s oldest surviving cultures with a nomadic reindeer-herding tradition.', knownFor: 'Reindeer herding, joik singing, lavvu tent dwellings, and survival in Arctic conditions.' , imageUrl: 'https://images.unsplash.com/photo-1509356843151-3e7643f38907?w=640&q=80&fit=crop'},
  'Khoiasan': { summary: 'The Khoisan peoples of southern Africa are among the oldest human populations on Earth, with a genetic lineage stretching back over 100,000 years.', knownFor: 'Click languages, San rock art, hunter-gatherer expertise, and being among humanity\'s oldest lineages.' },
  'Thule': { summary: 'The ancestors of modern Inuit peoples who spread across the Arctic from Alaska to Greenland around 1000 CE, developing sophisticated cold-weather survival technology.', knownFor: 'Igloo construction, kayak and umiak watercraft, whale hunting, and Arctic survival mastery.' },
  'Tasmanian hunter-gatherers': { summary: 'The Aboriginal Tasmanians lived in isolation for approximately 10,000 years after rising sea levels separated Tasmania from mainland Australia.', knownFor: 'One of the most isolated populations in human history, shell necklace craftsmanship, and unique fire management.' },
  'Tuʻi Tonga Empire': { summary: 'A powerful Polynesian maritime empire centered on Tonga that dominated large parts of the Pacific for centuries, with influence reaching Fiji, Samoa, and beyond.', knownFor: 'Pacific-wide tribute network, monumental stone architecture (Ha\'amonga), and Polynesian political organization.' },
  'Expansionist Kingdom of Merina': { summary: 'The dominant highland kingdom of Madagascar that unified much of the island in the 18th-19th centuries under a centralized monarchy.', knownFor: 'Unification of Madagascar, the Rova palace complex, and blending Austronesian and African traditions.' },

  // ── Central Asian & steppe peoples ──
  'central Asian khanates': { summary: 'A series of Turkic and Mongol successor states across Central Asia — including Bukhara, Khiva, and Kokand — that controlled the Silk Road\'s eastern segments.', knownFor: 'Silk Road trade, Islamic architecture, madrasas of Samarkand, and steppe-urban cultural fusion.' },
  'Saharan Pastoral Nomads': { summary: 'Nomadic and semi-nomadic peoples of the Sahara, including the Tuareg and other groups who controlled trans-Saharan trade routes for centuries.', knownFor: 'Camel caravans, salt and gold trade, indigo-dyed textiles, and navigation across the world\'s largest desert.' },

  // ── Misc hunter-gatherer descriptions ──
  'Pampas cultures': { summary: 'Indigenous peoples of the South American grasslands (Pampas) who developed a nomadic lifestyle based on hunting guanaco and rhea before the arrival of horses.', knownFor: 'Boleadoras hunting weapons, horseback mastery (post-contact), and adaptation to vast open grasslands.' },
  'Subarctic forest hunter-gatherers': { summary: 'Indigenous peoples of the boreal forests across northern North America and Eurasia who developed specialized survival strategies for harsh winters.', knownFor: 'Snowshoe travel, birch bark canoes, fur trapping, and deep knowledge of boreal ecosystems.' },
  'Savanna hunter-gatherers': { summary: 'Diverse groups of African hunter-gatherers living in the savannas south of the Sahara, among the oldest continuous human cultural traditions on Earth.', knownFor: 'Tracking and hunting expertise, medicinal plant knowledge, rock art, and oral storytelling traditions.' },
  'Caribbean hunter-gatherers': { summary: 'The earliest inhabitants of the Caribbean islands, including the Taíno and Carib peoples who developed farming, fishing, and trading cultures.', knownFor: 'Hammock invention, cassava cultivation, ball courts, zemí spiritual figures, and canoe-based island travel.' },
  'West African cereal farmers': { summary: 'Agricultural societies across West Africa who independently domesticated crops like sorghum, millet, and African rice, forming the foundation of great kingdoms.', knownFor: 'Independent crop domestication, ironworking, village-based governance, and the agricultural base for later empires.' },
  'Arctic marine mammal hunters': { summary: 'Circumpolar peoples who developed extraordinary technologies for hunting whales, seals, and walrus in some of Earth\'s most extreme environments.', knownFor: 'Harpoon technology, skin boats, ice fishing, blubber lamps, and survival in perpetual winter darkness.' },
  'Desert hunter-gatherers': { summary: 'Indigenous peoples adapted to arid environments across multiple continents, developing remarkable water-finding and food-extraction skills in extreme conditions.', knownFor: 'Water source knowledge, desert navigation, root and seed processing, and lightweight shelter construction.' },
  'Andean hunter-gatherers': { summary: 'Pre-agricultural peoples of the Andes mountains who adapted to extreme altitudes, eventually developing into the civilizations that preceded the Inca.', knownFor: 'High-altitude adaptation, camelid domestication, early potato cultivation, and textile arts.' },
  'Finno-Ugric taiga hunter-gatherers': { summary: 'Northern Eurasian peoples speaking Finno-Ugric languages who inhabited the vast taiga forests from Finland to Siberia.', knownFor: 'Ski technology, forest management, shamanistic traditions, and survival in extreme cold.' },
  'Paleo-Siberian hunter-gatherers': { summary: 'Ancient peoples of Siberia who survived Ice Age conditions and whose descendants spread across the Bering land bridge to populate the Americas.', knownFor: 'Ice Age survival, migration to the Americas, mammoth hunting, and adaptation to permafrost environments.' },
  'Plain bison hunters': { summary: 'Indigenous peoples of the Great Plains who built entire cultures around the American bison, using every part of the animal for food, shelter, and tools.', knownFor: 'Bison hunting strategies, tipi dwellings, pemmican food preservation, and horse culture (post-contact).' },
  'Patagonian shellfish and marine mammal hunters': { summary: 'Maritime peoples of southern South America who navigated the channels and fjords of Patagonia and Tierra del Fuego.', knownFor: 'Canoe-based maritime culture, cold-water diving, shellfish harvesting, and adaptation to sub-Antarctic conditions.' },
  'Shellfish gatherers': { summary: 'Coastal peoples around the world who developed sophisticated knowledge of tidal patterns, shellfish habitats, and marine resource management.', knownFor: 'Shell middens (some thousands of years old), tidal knowledge, and sustainable coastal resource management.' },
  'North American Pacifi foraging, hunting and fishing peoples': { summary: 'Indigenous peoples of the Pacific Northwest coast who built complex societies based on salmon fishing, cedar woodworking, and maritime resources.', knownFor: 'Totem poles, potlatch ceremonies, cedar plank houses, and some of the richest non-agricultural societies in history.' },
  'Eastern North Amercian hunter-gatherers': { summary: 'Diverse Indigenous peoples of eastern North America who developed complex societies, earthwork monuments, and extensive trade networks long before European contact.', knownFor: 'Mississippian mound cities, Hopewell trade networks, Three Sisters agriculture, and confederacy governance.' },

  // ── Ancient civilizations & cultures (pre-1000 BCE) ──
  'Austronesians': { summary: 'The greatest seafaring people of the ancient world, originating from Taiwan around 3000 BCE. They colonized islands across the Pacific and Indian Oceans, reaching Madagascar, Easter Island, and New Zealand.', knownFor: 'Outrigger canoe technology, the largest language family by number of speakers, taro and breadfruit cultivation, and colonizing half the globe by sea.' , imageUrl: 'https://images.unsplash.com/photo-1589308580012-94b07a7ab413?w=640&q=80&fit=crop'},
  'Bantu': { summary: 'Bantu-speaking peoples who originated in West-Central Africa and embarked on one of the largest migrations in human history, spreading agriculture and ironworking across sub-Saharan Africa over 3,000 years.', knownFor: 'Iron smelting, agricultural expansion, spreading Bantu languages (now spoken by ~350 million people), and transforming the demographics of Africa.' , imageUrl: 'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?w=640&q=80&fit=crop'},
  'Dravidians': { summary: 'The indigenous peoples of South Asia whose civilizations predate Indo-Aryan migration. Dravidian cultures built the Indus Valley civilization and continue to thrive in southern India and Sri Lanka.', knownFor: 'The Indus Valley cities of Mohenjo-daro and Harappa, Dravidian temple architecture, classical Tamil literature, and advanced urban planning.' , imageUrl: 'https://images.unsplash.com/photo-1585744945554-5df801d2b680?w=640&q=80&fit=crop'},
  'Celts': { summary: 'A widespread group of tribal societies across Iron Age and Medieval Europe, united by language, religion, and artistic traditions. At their peak, Celtic peoples inhabited lands from Ireland to Anatolia.', knownFor: 'La Tène art style, druids, chariot warfare, intricate metalwork, and oral storytelling traditions that inspired Arthurian legends.' , imageUrl: 'https://images.unsplash.com/photo-1485465053475-dd55ed3894b9?w=640&q=80&fit=crop'},
  'Scythians': { summary: 'Nomadic warriors of the Eurasian steppe who dominated a vast territory from the Black Sea to China from the 7th to 3rd centuries BCE. They were feared horseback archers.', knownFor: 'Horse archery, gold craftsmanship (Scythian animal style), koumiss (fermented mare\'s milk), and defeating Persian King Darius through guerrilla tactics.' , imageUrl: 'https://images.unsplash.com/photo-1600751267958-5bb0d08beb41?w=640&q=80&fit=crop'},
  'Hittites': { summary: 'A powerful Bronze Age empire based in Anatolia (modern Turkey) that rivaled Egypt and Babylon. They fought Ramesses II at the Battle of Kadesh, one of the largest chariot battles in history.', knownFor: 'Iron smelting (among the first), the world\'s earliest known peace treaty (with Egypt), cuneiform archives, and advanced chariot warfare.' , imageUrl: 'https://images.unsplash.com/photo-1562576605-88930bca8574?w=640&q=80&fit=crop'},
  'Olmec': { summary: 'The "mother culture" of Mesoamerica, flourishing from 1500-400 BCE along the Gulf Coast of Mexico. They laid the foundations for all later Mesoamerican civilizations.', knownFor: 'Colossal stone heads, the Mesoamerican ballgame, early writing and calendar systems, and jade craftsmanship.' , imageUrl: 'https://images.unsplash.com/photo-1647220498890-f2ea9c3933a2?w=640&q=80&fit=crop'},
  'Minoan': { summary: 'Europe\'s first advanced civilization, based on the island of Crete from roughly 2700-1450 BCE. The Minoans built elaborate palace complexes and dominated Mediterranean trade.', knownFor: 'The Palace of Knossos, bull-leaping rituals, Linear A script (still undeciphered), and vivid fresco art.' , imageUrl: 'https://images.unsplash.com/photo-1569770725012-58fac5eec229?w=640&q=80&fit=crop'},
  'Chavin': { summary: 'The first major civilization in the Andes, centered on the temple complex at Chavín de Huántar in Peru (900-200 BCE). It unified Andean peoples through religious influence rather than military conquest.', knownFor: 'The Lanzón monolith, sophisticated stone architecture, a pan-Andean religious cult, and early metallurgy.' , imageUrl: 'https://images.unsplash.com/photo-1586933613001-b003c20beac0?w=640&q=80&fit=crop'},
  'Assyria': { summary: 'One of the most powerful empires of the ancient Near East, based in northern Mesopotamia. At its height, the Neo-Assyrian Empire controlled territory from Egypt to Iran.', knownFor: 'The Library of Ashurbanipal (one of the first libraries), fearsome military machine, winged bull statues (lamassu), and advanced siege warfare.' , imageUrl: 'https://images.unsplash.com/photo-1762495842622-97bf58b76181?w=640&q=80&fit=crop'},
  'Elam': { summary: 'One of the oldest civilizations in the world, based in southwestern Iran. Elam was a major rival to Sumer and Babylon for over two millennia.', knownFor: 'The ziggurat at Chogha Zanbil, Proto-Elamite script (still undeciphered), and metalworking expertise.' },
  'Indus valley civilization': { summary: 'One of the three earliest urban civilizations (alongside Mesopotamia and Egypt), flourishing in the Indus River valley from 3300-1300 BCE with remarkably advanced city planning.', knownFor: 'Grid-planned cities, indoor plumbing, standardized weights and measures, the Great Bath of Mohenjo-daro, and still-undeciphered script.' , imageUrl: 'https://images.unsplash.com/photo-1562576605-88930bca8574?w=640&q=80&fit=crop'},
  'Kerma': { summary: 'The earliest urban civilization in sub-Saharan Africa, based along the Nile in modern Sudan (2500-1500 BCE). Kerma was a powerful rival to Egyptian control of Nubia.', knownFor: 'Massive mudbrick temple (the Deffufa), elaborate burial practices, bronze-working, and resistance against Egyptian expansion.' , imageUrl: 'https://images.unsplash.com/photo-1764685761993-4bbb0cf4ba49?w=640&q=80&fit=crop'},
  'Saba': { summary: 'The biblical Kingdom of Sheba, located in modern-day Yemen. Saba controlled the lucrative incense trade routes that connected Arabia to the Mediterranean world.', knownFor: 'The Queen of Sheba legend, the Marib Dam (an ancient engineering marvel), frankincense trade, and monumental stone temples.' , imageUrl: 'https://images.unsplash.com/photo-1567532939941-a387e1e1c3f0?w=640&q=80&fit=crop'},
  'Jōmon': { summary: 'The prehistoric people of Japan who created some of the world\'s oldest pottery (dating to 14,000 BCE) and lived as hunter-gatherers in a remarkably stable culture for over 10,000 years.', knownFor: 'The world\'s earliest pottery, cord-marked ceramics, dogū figurines, and a sophisticated hunter-gatherer society that lasted millennia.' },
  'Illyrians': { summary: 'Ancient peoples of the western Balkans who established tribal kingdoms along the Adriatic coast. They were known as fierce warriors and skilled sailors.', knownFor: 'Piracy and seafaring, distinctive hilltop fortifications, bronze weapons, and resistance against Roman expansion.' },
  'Hurrian Kingdoms': { summary: 'A people who established kingdoms across northern Mesopotamia and Anatolia, most notably the Mitanni Empire (1500-1300 BCE), which was a major power rivaling Egypt and the Hittites.', knownFor: 'The Mitanni Empire, horse training manuals (the oldest known), Hurrian hymns (earliest known music notation), and diplomatic marriages with Egypt.' },
  'Namazga': { summary: 'A Bronze Age civilization in Central Asia (modern Turkmenistan) with sophisticated urban centers that were contemporary with Mesopotamia and the Indus Valley.', knownFor: 'The city of Altyn-Depe, early bronze metallurgy, proto-urban planning, and trade connections to Mesopotamia and the Indus Valley.' },
  'Norte Chico': { summary: 'The oldest known civilization in the Americas, flourishing in coastal Peru from 3000-1800 BCE. It developed complex society without ceramics, writing, or warfare.', knownFor: 'The city of Caral (contemporary with Egyptian pyramids), monumental platform mounds, quipu-like recording devices, and a peaceful society based on trade.' , imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=640&q=80&fit=crop'},
  'Valdivia': { summary: 'One of the oldest settled cultures in the Americas, based on the coast of Ecuador (3500-1800 BCE). They were among the first in the Western Hemisphere to develop agriculture and pottery.', knownFor: 'Some of the earliest pottery in the Americas, Venus figurines, agricultural villages, and maritime trade networks.' },
  'Xiongnu': { summary: 'A powerful nomadic confederation that dominated the Mongolian steppe from the 3rd century BCE. They were the primary threat that prompted China to build the Great Wall.', knownFor: 'Forcing China to build the Great Wall, mounted warfare, the Heqin treaty system, and influence on later steppe empires.' },
  'Nabatean Kingdom': { summary: 'An ancient Arab kingdom based in modern Jordan that controlled vital trade routes between Arabia and the Mediterranean. They carved their capital Petra from living rock.', knownFor: 'Petra (one of the New Seven Wonders), advanced water harvesting in the desert, incense trade, and rock-cut architecture.' , imageUrl: 'https://images.unsplash.com/photo-1600751267958-5bb0d08beb41?w=640&q=80&fit=crop'},
  'Berbers': { summary: 'The indigenous peoples of North Africa, inhabiting the region for thousands of years before Arab, Roman, or Phoenician contact. Berber kingdoms and tribes controlled vast Saharan trade routes.', knownFor: 'Tifinagh script, Saharan trade networks, the Numidian cavalry (feared by Rome), and enduring cultural identity across North Africa.' , imageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=640&q=80&fit=crop'},
  'Urartu': { summary: 'A powerful Iron Age kingdom in the Armenian Highlands (860-590 BCE) that rivaled the Assyrian Empire. They were master builders and metalworkers.', knownFor: 'Fortress citadels, sophisticated irrigation canals, bronze working, and resistance against Assyrian expansion.' , imageUrl: 'https://images.unsplash.com/photo-1562576605-88930bca8574?w=640&q=80&fit=crop'},
  'Thrace': { summary: 'Ancient peoples of southeastern Europe (modern Bulgaria, Turkey, Greece) who were renowned warriors and horsemen. Spartacus, who led the great slave revolt against Rome, was Thracian.', knownFor: 'Gold treasure of Panagyurishte, Orpheus mythology, fierce warrior culture, and Spartacus\'s rebellion against Rome.' , imageUrl: 'https://images.unsplash.com/photo-1569770725012-58fac5eec229?w=640&q=80&fit=crop'},
  'Vedic Aryans': { summary: 'Indo-Aryan peoples who migrated into the Indian subcontinent around 1500 BCE, bringing with them the Vedic religious tradition that became the foundation of Hinduism.', knownFor: 'The Rigveda (one of the oldest religious texts), the caste system, Sanskrit language, and foundational Hindu religious concepts.' },
  'Paracas': { summary: 'A pre-Inca civilization on the southern coast of Peru (800-100 BCE) famous for their elaborate textiles, which are considered some of the finest ever produced.', knownFor: 'The most intricate textiles in pre-Columbian America, skull trepanation surgery, the Paracas Candelabra geoglyph, and mummy bundles.' , imageUrl: 'https://images.unsplash.com/photo-1585744945554-5df801d2b680?w=640&q=80&fit=crop'},
  'Chorrera': { summary: 'An ancient culture of coastal Ecuador (1300-300 BCE) known for distinctive pottery and as a cultural bridge between early and later Andean civilizations.', knownFor: 'Exquisitely crafted ceramics with iridescent finishes, long-distance trade networks, and cultural influence across western South America.' },
  'Chinchoros': { summary: 'An ancient fishing people of the Atacama Desert coast (northern Chile/southern Peru) who created the world\'s oldest known artificial mummies — over 2,000 years before Egypt.', knownFor: 'The world\'s oldest mummies (dating to 5050 BCE), sophisticated fishing technology, and survival in one of Earth\'s driest environments.' },
  'Papuan neolithic farmers': { summary: 'The indigenous peoples of New Guinea who independently invented agriculture around 7000 BCE, making the highlands one of the earliest centers of plant domestication in the world.', knownFor: 'Independent invention of agriculture, taro and banana domestication, over 800 distinct languages, and some of the world\'s most diverse cultures.' },
  'Homo erectus': { summary: 'An early human species that lived from about 2 million to 100,000 years ago. Homo erectus was the first hominin to leave Africa and spread across Asia.', knownFor: 'First hominin to use fire, first to leave Africa, Acheulean hand axes, and surviving for nearly 2 million years — far longer than modern humans so far.' },
  'Neanderthal': { summary: 'Our closest evolutionary relatives, living in Europe and western Asia from about 400,000 to 40,000 years ago. They were intelligent, artistic, and cared for their sick and elderly.', knownFor: 'Cave art, burial practices, sophisticated stone tools, adapting to Ice Age Europe, and interbreeding with modern humans (2-4% of non-African DNA).' , imageUrl: 'https://images.unsplash.com/photo-1559041881-74dd9fd9b600?w=640&q=80&fit=crop'},
  'Homo heidelbergensis': { summary: 'A common ancestor of both modern humans and Neanderthals, living from about 700,000 to 200,000 years ago. They were likely the first hominins to build shelters and use controlled fire regularly.', knownFor: 'First evidence of constructed shelters, communal hunting of large animals, early use of wooden spears, and being the ancestor of both us and Neanderthals.' },
  'Manioc farmers': { summary: 'Indigenous peoples of tropical South America who domesticated cassava (manioc), a root crop that became the staple food for millions across the tropics worldwide.', knownFor: 'Domestication of cassava — now the sixth most important crop globally — and developing processing techniques to remove its natural cyanide toxins.' },
  'Maize farmers': { summary: 'Mesoamerican peoples who domesticated teosinte into maize (corn), arguably the most transformative agricultural achievement in human history, enabling complex civilizations across the Americas.', knownFor: 'Transforming a wild grass into the world\'s most produced grain crop, nixtamalization, and enabling every major American civilization.' },
  'Ethiopian highland farmers': { summary: 'Ancient agricultural peoples of the Ethiopian Highlands who independently domesticated unique crops found nowhere else on Earth, including coffee, teff, and enset.', knownFor: 'Origin of coffee, domestication of teff (used for injera bread), enset (false banana), and one of the world\'s independent centers of agriculture.' },
  'Austro-Asiatic rice farmers': { summary: 'Ancient peoples of mainland Southeast Asia who were among the first to domesticate rice, one of the most important food crops in human history feeding half the world\'s population.', knownFor: 'Early rice domestication, water buffalo husbandry, wet-rice paddy agriculture, and the agricultural foundation of Southeast Asian civilizations.' },
  'Aboriginal Tasmanians': { summary: 'The Aboriginal people of Tasmania who lived in isolation for approximately 10,000 years after rising sea levels separated the island from mainland Australia, developing a unique culture.', knownFor: 'One of the most isolated populations in human history, fire management of landscapes, shell necklace craftsmanship, and ochre body painting.' },
  'Aboriginal tribes': { summary: 'The Indigenous peoples of Australia, representing the world\'s oldest continuous civilization with over 65,000 years of unbroken cultural history. Hundreds of distinct nations existed across the continent.', knownFor: 'The Dreamtime spiritual framework, the world\'s oldest rock art, fire-stick farming, boomerangs, and didgeridoos.' , imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&q=80&fit=crop'},
  'Khoisan': { summary: 'The indigenous peoples of southern Africa, among the oldest human populations on Earth with a genetic lineage stretching back over 100,000 years. Their click languages are unique in the world.', knownFor: 'Click consonant languages, the world\'s oldest rock art traditions, hunter-gatherer expertise, and being among humanity\'s most ancient lineages.' , imageUrl: 'https://images.unsplash.com/photo-1516426122078-f30e1c35b439?w=640&q=80&fit=crop'},
  'Hunters-gatherers': { summary: 'For over 95% of human history, all people lived as hunter-gatherers — small mobile bands who foraged, hunted, and fished. This lifestyle shaped human biology, psychology, and social instincts.', knownFor: 'The foundational human lifestyle, deep ecological knowledge, egalitarian social structures, and the skills that allowed humans to colonize every continent.' },
  'Steppe Mesolithic Hunter-Foragers': { summary: 'Mesolithic peoples of the Eurasian steppe who adapted to the vast grasslands after the Ice Age. Their descendants would eventually domesticate horses, transforming human civilization.', knownFor: 'Adaptation to grassland environments, early animal tracking, and inhabiting the region where horses would later be domesticated.' },
  'Hopewell Culture': { summary: 'A network of Native American communities across eastern North America (200 BCE-500 CE) connected by a vast trade network spanning from the Rocky Mountains to the Atlantic.', knownFor: 'Massive geometric earthworks, a trade network spanning half a continent, obsidian and copper artifacts, and elaborate burial mounds.' , imageUrl: 'https://images.unsplash.com/photo-1600751267958-5bb0d08beb41?w=640&q=80&fit=crop'},
  'Adena Culture': { summary: 'An early Native American culture of the Ohio Valley (1000-200 BCE) who built some of the first burial mounds in North America and established long-distance trade networks.', knownFor: 'The Great Serpent Mound, elaborate burial customs, copper ornaments, and pioneering mound-building traditions.' },
  'Monte Albán': { summary: 'One of the earliest cities in Mesoamerica, built atop a mountain in Oaxaca, Mexico. It served as the capital of the Zapotec civilization for over a thousand years (500 BCE-700 CE).', knownFor: 'Mountain-top urban planning, some of the earliest writing in the Americas, astronomical observatories, and elaborate stone carvings.' },
  'Teotihuacán': { summary: 'The largest city in the pre-Columbian Americas, located near modern Mexico City. At its peak around 450 CE, it housed over 100,000 people and influenced cultures across Mesoamerica.', knownFor: 'The Pyramid of the Sun (third largest pyramid on Earth), the Avenue of the Dead, sophisticated murals, and continent-wide cultural influence.' },
  'Zapotec': { summary: 'One of the earliest Mesoamerican civilizations, based in the Oaxaca Valley of Mexico. The Zapotec developed one of the first writing systems in the Americas.', knownFor: 'Monte Albán capital city, early Mesoamerican writing, elaborate tombs, and a calendar system.' },
  'Babylonia': { summary: 'The Babylonian Empire in southern Mesopotamia, centered on the city of Babylon. Under Hammurabi and later Nebuchadnezzar II, it was one of the ancient world\'s greatest powers.', knownFor: 'The Code of Hammurabi (earliest comprehensive law code), the Hanging Gardens, Ishtar Gate, and Babylonian mathematics.' , imageUrl: 'https://images.unsplash.com/photo-1586933613001-b003c20beac0?w=640&q=80&fit=crop'},
  'Kingdom of David and Solomon': { summary: 'The united Israelite monarchy described in the Hebrew Bible, ruling from Jerusalem around 1000-930 BCE. It represents the golden age of ancient Israel.', knownFor: 'Solomon\'s Temple in Jerusalem, the Psalms of David, the biblical narrative, and foundational influence on Judaism, Christianity, and Islam.' },
  'Canaan': { summary: 'The ancient Semitic-speaking peoples of the Levant (modern Israel, Palestine, Lebanon, western Syria) who developed the first alphabet, which became the ancestor of nearly all modern alphabets.', knownFor: 'Inventing the alphabet, city-states like Jericho (one of the world\'s oldest cities), and the cultural crossroads of ancient civilizations.' },
  'Bosporan Kingdom': { summary: 'A Hellenistic kingdom on the shores of the Crimean Peninsula and the Taman Peninsula (480 BCE-370 CE), one of the longest-surviving successor states of Greek colonization.', knownFor: 'Grain exports to Athens, Greek-Scythian cultural fusion, elaborate burial mounds (kurgans), and goldwork.' },
  'Seleucid Kingdom': { summary: 'One of the successor kingdoms to Alexander the Great\'s empire, ruling a vast territory from Anatolia to Central Asia. It was the largest of Alexander\'s successor states.', knownFor: 'Hellenistic culture spread across Asia, the city of Antioch, Greco-Buddhist art influence, and governing one of the most diverse empires in history.' },
  'Ptolemaic Kingdom': { summary: 'The Greek-ruled dynasty of Egypt founded after Alexander the Great\'s death, ending with Cleopatra VII. It blended Greek and Egyptian culture in one of the ancient world\'s wealthiest states.', knownFor: 'The Library of Alexandria, the Lighthouse (one of the Seven Wonders), Cleopatra, and the Rosetta Stone.' },
  'Dacia': { summary: 'A powerful kingdom in the Carpathian region (modern Romania) that resisted Roman expansion before being conquered by Emperor Trajan in 106 CE. The Dacians were skilled metalworkers and warriors.', knownFor: 'The fortress of Sarmizegetusa, the falx (curved sword), resistance against Rome, and gold mining that funded Trajan\'s building projects.' , imageUrl: 'https://images.unsplash.com/photo-1569770725012-58fac5eec229?w=640&q=80&fit=crop'},
  'Kushan Empire': { summary: 'A vast empire spanning from Central Asia to northern India (1st-3rd centuries CE) that sat at the crossroads of Chinese, Indian, Persian, and Roman trade routes.', knownFor: 'Gandhara Buddhist art (Greco-Buddhist fusion), Silk Road trade hub, religious tolerance, and some of the earliest Buddha statues.' , imageUrl: 'https://images.unsplash.com/photo-1553285207-a28928d5cc82?w=640&q=80&fit=crop'},
  'Germanic tribes': { summary: 'Diverse tribal peoples of northern Europe who eventually overran the Roman Empire. Goths, Vandals, Franks, Saxons, and others reshaped Europe into the medieval world.', knownFor: 'The fall of Rome, runic writing, mead halls, the Nibelungenlied saga, and founding the kingdoms that became modern European nations.' , imageUrl: 'https://images.unsplash.com/photo-1485465053475-dd55ed3894b9?w=640&q=80&fit=crop'},
};
