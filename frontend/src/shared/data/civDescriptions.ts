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
