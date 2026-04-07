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
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Italy-0093_-_Colosseum_%285124888873%29.jpg/640px-Italy-0093_-_Colosseum_%285124888873%29.jpg',
  },
  byzantium: {
    summary: 'The eastern continuation of the Roman Empire, centered on Constantinople. It preserved Roman governance and Greek culture for over a thousand years after the fall of the west.',
    knownFor: 'Preserving classical knowledge, Hagia Sophia, Orthodox Christianity, and codifying Roman law.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Hagia_Sophia_Mars_2013.jpg/640px-Hagia_Sophia_Mars_2013.jpg',
  },
  hre: {
    summary: 'A complex political entity in central Europe that claimed succession to ancient Rome. Despite its name, it was a loose federation of hundreds of principalities and kingdoms.',
    knownFor: 'Medieval German politics, the electoral system, Charlemagne\'s legacy, and centuries of European power struggles.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Aachen_Germany_Imperial-Cathedral-01.jpg/640px-Aachen_Germany_Imperial-Cathedral-01.jpg',
  },
  persia: {
    summary: 'One of the world\'s oldest civilizations, Persia built empires that stretched from Egypt to India. Multiple dynasties — Achaemenid, Parthian, Sasanian, Safavid — each left lasting marks.',
    knownFor: 'The first postal system, Zoroastrianism, Persian gardens, poetry, and the Royal Road trade network.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Persepolis_24.11.2009_11-12-14.jpg/640px-Persepolis_24.11.2009_11-12-14.jpg',
  },
  china: {
    summary: 'The world\'s longest continuous civilization, unified under various dynasties for over two millennia. Each dynasty brought distinct cultural, technological, and territorial achievements.',
    knownFor: 'Paper, printing, gunpowder, the compass, silk production, the Great Wall, and Confucian philosophy.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/The_Great_Wall_of_China_at_Jinshanling.jpg/640px-The_Great_Wall_of_China_at_Jinshanling.jpg',
  },
  greece: {
    summary: 'A collection of independent city-states that produced some of history\'s most influential ideas. Athens pioneered democracy; Sparta forged military excellence; Alexander spread Greek culture across Asia.',
    knownFor: 'Philosophy, democracy, the Olympic Games, theater, mathematics, and classical architecture.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/The_Parthenon_in_Athens.jpg/640px-The_Parthenon_in_Athens.jpg',
  },
  egypt: {
    summary: 'Built along the Nile River, ancient Egypt was one of the earliest and most enduring civilizations. Its pharaohs ruled for three millennia, leaving monuments that still stand today.',
    knownFor: 'Pyramids, hieroglyphics, mummification, papyrus, advanced medicine, and monumental architecture.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/640px-Kheops-Pyramid.jpg',
  },
  mongolia: {
    summary: 'Nomadic steppe warriors who built the largest contiguous land empire in history under Genghis Khan. At its peak, the Mongol Empire stretched from Korea to Hungary.',
    knownFor: 'Horse warfare, the Silk Road\'s golden age, religious tolerance, and a postal relay system spanning continents.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/YuanEmperorAlbumGenghisPortrait.jpg/480px-YuanEmperorAlbumGenghisPortrait.jpg',
  },
  ottoman: {
    summary: 'Founded by Turkish tribes in Anatolia, the Ottoman Empire grew into a transcontinental superpower controlling southeastern Europe, western Asia, and northern Africa for over 600 years.',
    knownFor: 'Conquest of Constantinople, architectural masterpieces, religious coexistence, and centuries of Eurasian trade.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Istanbul_asv2020-02_img64_Topkap%C4%B1_Palace.jpg/640px-Istanbul_asv2020-02_img64_Topkap%C4%B1_Palace.jpg',
  },
  arab_caliphates: {
    summary: 'A series of Islamic empires that rapidly expanded from the Arabian Peninsula after the 7th century, unifying vast territories under Islamic governance and culture.',
    knownFor: 'Preserving and advancing science, algebra, medicine, astronomy, and building centers of learning like the House of Wisdom.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Mosque_of_Cordoba_Spain.jpg/640px-Mosque_of_Cordoba_Spain.jpg',
  },
  britain: {
    summary: 'Starting as a small island kingdom, Britain built a global empire spanning every continent. At its height in the early 20th century, it governed a quarter of the world\'s population.',
    knownFor: 'The Industrial Revolution, parliamentary democracy, the English language, and naval dominance.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Palace_of_Westminster_from_the_dome_on_Methodist_Central_Hall_%28cropped%29.jpg/640px-Palace_of_Westminster_from_the_dome_on_Methodist_Central_Hall_%28cropped%29.jpg',
  },
  france: {
    summary: 'A major European power since the Middle Ages. From Charlemagne to Napoleon, France shaped European culture, politics, and revolution.',
    knownFor: 'The French Revolution, Enlightenment philosophy, art, cuisine, and colonial influence across Africa and the Americas.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg/480px-Tour_Eiffel_Wikimedia_Commons.jpg',
  },
  spain: {
    summary: 'Unified in 1492 after centuries of reconquest, Spain quickly became the first global empire — colonizing the Americas, Philippines, and parts of Africa.',
    knownFor: 'Exploration, the Reconquista, the Alhambra, and the first circumnavigation of the globe.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Alhambra_evening_panorama.jpg/640px-Alhambra_evening_panorama.jpg',
  },
  india: {
    summary: 'The Indian subcontinent hosted a succession of kingdoms and empires over millennia — Maurya, Gupta, Chola, Mughal — each contributing to one of the world\'s richest cultural traditions.',
    knownFor: 'The concept of zero, Hinduism and Buddhism, the Taj Mahal, spice trade, and Sanskrit literature.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Taj_Mahal%2C_Agra%2C_India_edit3.jpg/640px-Taj_Mahal%2C_Agra%2C_India_edit3.jpg',
  },
  japan: {
    summary: 'An island civilization that developed a unique culture in relative isolation. Samurai warriors, shoguns, and emperors shaped centuries of Japanese history before rapid modernization in the 1800s.',
    knownFor: 'Bushido, Zen Buddhism, woodblock printing, the samurai class, and the Meiji-era industrial transformation.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Himeji_Castle_The_Keep_Towers.jpg/640px-Himeji_Castle_The_Keep_Towers.jpg',
  },
  vikings: {
    summary: 'Norse seafarers from Scandinavia who explored, traded, and raided across Europe, the North Atlantic, and even reached North America around 1000 CE.',
    knownFor: 'Longship navigation, sagas, runic writing, exploration of Iceland, Greenland, and Vinland.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Gokstad-ship-model.jpg/640px-Gokstad-ship-model.jpg',
  },
  aztecs: {
    summary: 'A Mesoamerican civilization that built a powerful empire centered on the island city of Tenochtitlan in just two centuries before the Spanish conquest.',
    knownFor: 'Tenochtitlan\'s engineering, the calendar stone, chinampas (floating gardens), and elaborate ritual culture.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Sunstone_closeup.jpg/640px-Sunstone_closeup.jpg',
  },
  phoenicia: {
    summary: 'Maritime traders based in modern-day Lebanon who established a network of colonies across the Mediterranean, most famously Carthage.',
    knownFor: 'Inventing the alphabet, purple dye production, glass-making, and pioneering Mediterranean sea trade.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Byblos_Ruins.jpg/640px-Byblos_Ruins.jpg',
  },
  khmer: {
    summary: 'A Southeast Asian empire that controlled much of mainland Southeast Asia from the 9th to 15th centuries, centered around the monumental temple complex of Angkor.',
    knownFor: 'Angkor Wat, sophisticated water management, Hindu-Buddhist architecture, and rice cultivation.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Angkor_Wat.jpg/640px-Angkor_Wat.jpg',
  },
  babylon: {
    summary: 'One of the earliest urban civilizations, located in Mesopotamia between the Tigris and Euphrates rivers. Babylon was the cultural and political center of the ancient Near East.',
    knownFor: 'The Code of Hammurabi, the Hanging Gardens, cuneiform writing, and early astronomy and mathematics.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Ishtar_Gate_at_Berlin_Museum.jpg/480px-Ishtar_Gate_at_Berlin_Museum.jpg',
  },
  kush: {
    summary: 'An African kingdom south of Egypt along the Nile that at times rivaled and even conquered its northern neighbor. It was a major center of iron production and trade.',
    knownFor: 'Nubian pyramids, iron smelting, trade with Egypt and Rome, and a unique writing system (Meroitic).',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Nubian_Pyramids_at_Meroe.jpg/640px-Nubian_Pyramids_at_Meroe.jpg',
  },
  inca: {
    summary: 'The largest empire in pre-Columbian America, stretching along the Andes from Ecuador to Chile. Built in under a century, it was connected by an extensive road network.',
    knownFor: 'Machu Picchu, quipu record-keeping, terrace farming, and an empire run without a writing system.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Machu_Picchu%2C_Peru.jpg/640px-Machu_Picchu%2C_Peru.jpg',
  },
  maya: {
    summary: 'A Mesoamerican civilization known for sophisticated city-states that flourished for centuries in the jungles of Central America, with advanced astronomy and mathematics.',
    knownFor: 'Hieroglyphic writing, the Long Count calendar, pyramids at Chichen Itza and Tikal, and the concept of zero.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Chichen_Itza_3.jpg/640px-Chichen_Itza_3.jpg',
  },
  carthage: {
    summary: 'A Phoenician colony that grew into a powerful maritime republic dominating western Mediterranean trade. Its rivalry with Rome produced the legendary Punic Wars.',
    knownFor: 'Hannibal\'s crossing of the Alps, naval warfare, merchant trading networks, and resistance against Rome.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Karthago_Antoninus-Pius-Thermen.jpg/640px-Karthago_Antoninus-Pius-Thermen.jpg',
  },
  mali: {
    summary: 'A West African empire that became one of the wealthiest in world history. Mansa Musa\'s legendary pilgrimage to Mecca put Mali on the map of the medieval world.',
    knownFor: 'Timbuktu as a center of learning, gold and salt trade, Mansa Musa\'s wealth, and the University of Sankore.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Djinguereber_Mosque_in_Timbuktu.jpg/640px-Djinguereber_Mosque_in_Timbuktu.jpg',
  },
  songhai: {
    summary: 'The successor to the Mali Empire, Songhai became the largest empire in African history under Sunni Ali and Askia Muhammad, dominating trans-Saharan trade routes.',
    knownFor: 'Expansion of Timbuktu, administration of vast territories, Islamic scholarship, and West African trade dominance.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Djinguereber_Mosque_in_Timbuktu.jpg/640px-Djinguereber_Mosque_in_Timbuktu.jpg',
  },
};

/**
 * Direct NAME-to-description mapping for territories that appear in GeoJSON
 * but aren't in CIV_ALIASES. Keyed by the exact properties.NAME string.
 */
export const NAME_DESCRIPTIONS: Record<string, { summary: string; knownFor: string }> = {
  // ── European kingdoms & states ──
  'Sweden': { summary: 'A Scandinavian kingdom that grew from Viking-era origins into a major Baltic power. During the 17th century, Sweden was one of Europe\'s great military powers under kings like Gustavus Adolphus.', knownFor: 'Viking heritage, Baltic empire, military innovation, and the Swedish model of governance.' },
  'Portugal': { summary: 'A small Iberian kingdom that pioneered the Age of Exploration, establishing the first global maritime empire with colonies from Brazil to Macau.', knownFor: 'Maritime navigation, Vasco da Gama\'s route to India, colonization of Brazil, and the spice trade.' },
  'Denmark': { summary: 'A Scandinavian kingdom with deep Viking roots. At various points Denmark ruled Norway, parts of Sweden, and territories across the North Sea.', knownFor: 'Viking expeditions, the Kalmar Union, maritime trade, and early constitutional monarchy.' },
  'Poland': { summary: 'A Central European kingdom that formed one of the largest states in Europe through its union with Lithuania. The Polish-Lithuanian Commonwealth was a major power from the 14th to 18th centuries.', knownFor: 'The Polish-Lithuanian Commonwealth, religious tolerance, the winged hussars, and Copernicus.' },
  'Prussia': { summary: 'A German state that rose from a small duchy to become the dominant force behind German unification. Prussian military discipline and organization became legendary.', knownFor: 'Military efficiency, German unification under Bismarck, and the development of the modern state bureaucracy.' },
  'Venice': { summary: 'A maritime republic built on lagoon islands that became one of the wealthiest cities in the world. Venice dominated Mediterranean trade for centuries.', knownFor: 'Trade networks, glassmaking, the Doge\'s Palace, Marco Polo, and Renaissance art patronage.' },
  'Netherlands': { summary: 'A small but wealthy republic that became a global trading power in the 17th century Dutch Golden Age, with colonies spanning from Indonesia to the Americas.', knownFor: 'The Dutch East India Company, tulip trade, Rembrandt, windmills, and maritime innovation.' },
  'Italy': { summary: 'The Italian peninsula was home to powerful city-states like Florence, Venice, and Genoa during the Renaissance, before unifying as a nation in the 19th century.', knownFor: 'The Renaissance, Roman heritage, art, architecture, opera, and culinary traditions.' },
  'Papal States': { summary: 'Territories in central Italy ruled directly by the Pope from the 8th century until Italian unification in 1870. The seat of the Catholic Church\'s temporal power.', knownFor: 'The Vatican, Catholic governance, Renaissance patronage, and centuries of European political influence.' },
  'Luxembourg': { summary: 'A small but strategically important territory in western Europe that survived centuries of conflict between larger powers to become an independent nation.', knownFor: 'Strategic fortress location, medieval castles, and surviving as an independent state despite its small size.' },
  'Austrian Empire': { summary: 'The Habsburg domain in Central Europe that grew from a duchy into one of Europe\'s most powerful empires, eventually forming Austria-Hungary.', knownFor: 'Habsburg dynasty, Vienna as a cultural capital, classical music (Mozart, Beethoven), and multi-ethnic governance.' },
  'Angevin Empire': { summary: 'The territories held by the Plantagenet kings of England in the 12th-13th centuries, stretching from Scotland to the Pyrenees.', knownFor: 'Henry II\'s vast domain, the rivalry with France, and the origins of English common law.' },
  'Armenia': { summary: 'One of the world\'s oldest civilizations, Armenia was the first nation to adopt Christianity as a state religion in 301 CE. Its kingdom persisted despite constant pressure from larger empires.', knownFor: 'First Christian nation, the Armenian alphabet, illuminated manuscripts, and cultural resilience.' },
  'Georgia': { summary: 'A Caucasian kingdom with a rich Christian heritage that experienced a golden age in the 12th-13th centuries under Queen Tamar.', knownFor: 'Ancient winemaking, unique alphabet, the poem "The Knight in the Panther\'s Skin," and Caucasian architecture.' },
  'Cyprus': { summary: 'A Mediterranean island at the crossroads of three continents, ruled in turn by Egyptians, Greeks, Romans, Crusaders, Venetians, and Ottomans.', knownFor: 'Copper production (the island gave copper its name), Aphrodite\'s mythical birthplace, and Crusader-era castles.' },

  // ── Asian kingdoms & empires ──
  'Korea': { summary: 'A peninsula civilization with a history spanning thousands of years, unified under various dynasties including Silla, Goryeo, and Joseon.', knownFor: 'Hangul alphabet, celadon pottery, printing technology, kimchi, and Confucian scholarship.' },
  'Tibet': { summary: 'A highland kingdom on the Tibetan Plateau that developed a unique Buddhist civilization. The Tibetan Empire once rivaled Tang China in power.', knownFor: 'Tibetan Buddhism, the Dalai Lama lineage, Potala Palace, and high-altitude monasteries.' },
  'Nepal': { summary: 'A Himalayan kingdom nestled between India and Tibet, home to diverse ethnic groups and the birthplace of Siddhartha Gautama (the Buddha).', knownFor: 'Mount Everest, birthplace of Buddhism, Gurkha warriors, and Hindu-Buddhist temple architecture.' },
  'Bhutan': { summary: 'A small Himalayan kingdom that maintained its independence through isolation and strategic diplomacy. It measures prosperity through Gross National Happiness.', knownFor: 'Dzong fortresses, Thunder Dragon symbolism, Buddhist monasteries, and environmental conservation.' },
  'Philippines': { summary: 'An archipelago of over 7,000 islands with a pre-colonial history of maritime trade, barangay governance, and cultural exchange with China, India, and the Islamic world.', knownFor: 'Rice terraces of the Cordilleras, maritime trade networks, and diverse indigenous cultures.' },
  'Afghanistan': { summary: 'Positioned at the crossroads of Central and South Asia, Afghanistan has been a contested corridor for empires from Alexander the Great to the Mughals and British.', knownFor: 'The Silk Road, Bamiyan Buddhas, Pashtun warrior culture, and its role as a crossroads of civilizations.' },
  'Đại Việt': { summary: 'The Vietnamese kingdom that fought for independence from Chinese rule and built a sophisticated civilization in Southeast Asia over a thousand years.', knownFor: 'Resistance against Chinese and Mongol invasions, the Lý and Trần dynasties, and Temple of Literature.' },
  'Champa': { summary: 'A Hindu-influenced kingdom in central and southern Vietnam that thrived on maritime trade from the 2nd to 17th centuries.', knownFor: 'Mỹ Sơn temple ruins, maritime commerce, Hindu-Buddhist art, and resistance against Vietnamese expansion.' },
  'Simhala': { summary: 'The ancient name for Sri Lanka\'s Sinhalese kingdoms, which built advanced hydraulic civilizations with massive irrigation reservoirs.', knownFor: 'Sigiriya rock fortress, ancient irrigation tanks, Theravada Buddhism, and the Temple of the Tooth.' },
  'Arakan': { summary: 'A coastal kingdom in western Myanmar (Burma) that served as a bridge between the Indian and Southeast Asian worlds.', knownFor: 'Maritime trade, Buddhist monuments, the Mrauk U kingdom, and cultural fusion of Indian and Burmese traditions.' },
  'Brunei': { summary: 'A Malay sultanate on the island of Borneo that once controlled much of coastal Borneo and the Philippines before European colonization.', knownFor: 'The Bruneian Empire\'s maritime reach, Islamic governance, and control of Southeast Asian trade routes.' },

  // ── African kingdoms & peoples ──
  'Ethiopia': { summary: 'One of the oldest nations in the world, Ethiopia was never colonized and maintains a continuous history stretching back to the Aksumite Kingdom.', knownFor: 'The Ark of the Covenant tradition, rock-hewn churches of Lalibela, Ge\'ez script, and coffee\'s origin.' },
  'Morocco': { summary: 'A North African kingdom at the gateway between Europe and Africa, ruled by various dynasties from the Almoravids to the Alaouites.', knownFor: 'Marrakech, Fez\'s medieval medina, Berber culture, and control of trans-Saharan trade routes.' },
  'Congo': { summary: 'The Kingdom of Kongo was one of the most powerful states in Central Africa, with sophisticated governance and extensive trade networks before European contact.', knownFor: 'Metalworking, textile production, the Kongo-Portuguese alliance, and complex political organization.' },
  'Benin': { summary: 'The Kingdom of Benin (in modern Nigeria) was famous for its sophisticated bronze-casting artisans and powerful obas who ruled for centuries.', knownFor: 'Benin Bronzes, advanced metalwork, city walls, and a highly organized political system.' },
  'Bornu-Kanem': { summary: 'A long-lived African empire near Lake Chad that was a major center of Islamic learning and trans-Saharan commerce for nearly a millennium.', knownFor: 'Islamic scholarship, trans-Saharan trade, cavalry warfare, and diplomatic relations across the Sahara.' },
  'Senegal': { summary: 'A region of West Africa home to powerful kingdoms including the Wolof Empire and the Jolof Confederation, important centers of trade and Islam.', knownFor: 'Gorée Island\'s historical significance, the Wolof Empire, groundnut trade, and Sufi Islamic traditions.' },
  'Madagascar': { summary: 'A large island off southeastern Africa settled by both African and Austronesian peoples, creating a unique cultural blend found nowhere else on Earth.', knownFor: 'Unique biodiversity, Austronesian-African cultural fusion, the Merina kingdom, and rice terrace agriculture.' },
  'Oman': { summary: 'An Arabian maritime power that built a trading empire stretching from East Africa to the Indian subcontinent, controlling key Indian Ocean routes.', knownFor: 'Maritime trade dominance, the Sultanate of Zanzibar, frankincense, and Ibadi Islam.' },
  'Yemen': { summary: 'One of the oldest centers of civilization in the Arabian Peninsula, home to the legendary Kingdom of Sheba and important in the ancient incense trade.', knownFor: 'The Queen of Sheba, the incense route, ancient dams of Ma\'rib, and early coffee cultivation.' },
  'Hadramaut': { summary: 'An ancient region of southern Arabia known for its merchant diaspora, distinctive mud-brick architecture, and role in the incense trade.', knownFor: 'Tall mud-brick tower houses, frankincense and myrrh trade, and the Hadrami merchant diaspora across the Indian Ocean.' },

  // ── Americas ──
  'United States': { summary: 'Founded through revolution in 1776, the United States expanded from 13 Atlantic colonies to a continental power and became the world\'s dominant superpower in the 20th century.', knownFor: 'The Constitution, westward expansion, industrialization, the space program, and global cultural influence.' },
  'Haiti': { summary: 'The site of the only successful large-scale slave revolution in history. Haiti became the first free Black republic in 1804 and the second independent nation in the Americas.', knownFor: 'The Haitian Revolution, Toussaint Louverture, Vodou culture, and being the first free Black republic.' },
  'Paraguay': { summary: 'A landlocked South American nation with a unique history including Jesuit missions and the devastating War of the Triple Alliance.', knownFor: 'Guaraní culture, Jesuit Reductions, bilingual society, and resilience through devastating wars.' },

  // ── Indigenous & regional groups ──
  'Australian aboriginal hunter-gatherers': { summary: 'The Indigenous peoples of Australia represent the world\'s oldest continuous civilization, with a presence spanning over 65,000 years. Hundreds of distinct nations developed across the continent.', knownFor: 'The world\'s oldest art (rock paintings), the Dreamtime cosmology, fire-stick farming, and boomerang technology.' },
  'Ainu': { summary: 'The indigenous people of northern Japan, Sakhalin, and the Kuril Islands, with a distinct language and culture separate from the Japanese.', knownFor: 'Bear ceremonies, unique textile arts, oral epic traditions, and a language with no known relatives.' },
  'Polynesians': { summary: 'Master navigators who colonized the vast Pacific Ocean from Hawaii to New Zealand to Easter Island, using only stars, waves, and wind patterns.', knownFor: 'Open-ocean navigation without instruments, the Polynesian triangle, moai statues, and taro cultivation.' },
  'Guanches': { summary: 'The indigenous Berber people of the Canary Islands who lived in isolation for thousands of years before European contact in the 14th century.', knownFor: 'Whistled language (Silbo Gomero), mummification practices, cave dwellings, and Berber heritage.' },
  'Saami': { summary: 'The indigenous people of northern Scandinavia and the Kola Peninsula, one of Europe\'s oldest surviving cultures with a nomadic reindeer-herding tradition.', knownFor: 'Reindeer herding, joik singing, lavvu tent dwellings, and survival in Arctic conditions.' },
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
};
