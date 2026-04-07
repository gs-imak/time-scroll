/**
 * Spotlight context — maps civilization IDs to historical events and
 * border change explanations. Used during Spotlight playback to show
 * WHY borders are changing at each snapshot.
 *
 * Combines events from SEED_EVENTS/newEvents that are tied to each
 * civilization, plus hand-written context for major border changes
 * that don't have matching events in the database.
 */

import { SEED_EVENTS } from '@/shared/utils/constants';
import { EVENT_CIVILIZATION } from './civilizationAssets';
import type { EventCategory } from '@/shared/types/events';

export interface ContextEntry {
  year: number;
  title: string;
  description: string;
  category: EventCategory;
}

// ── Map event IDs to civ IDs via civilizationAssets slugs ─────────

const SLUG_TO_CIV: Record<string, string> = {
  'ancient-egypt': 'egypt',
  'ancient-greece': 'greece',
  'ancient-rome': 'rome',
  'ancient-persia': 'persia',
  'ancient-india': 'india',
  'maurya-empire': 'india',
  'ancient-china': 'china',
  'viking-norse': 'vikings',
  'aztec-empire': 'aztecs',
  'maya-civilization': 'maya',
  'kingdom-of-kush': 'kush',
  'ancient-phoenicia': 'phoenicia',
  'edo-japan': 'japan',
  'inca-empire': 'inca',
  'mali-empire': 'mali',
  'khmer-empire': 'khmer',
  'mongol-empire': 'mongolia',
  'ancient-babylon': 'babylon',
};

function buildEventContext(): Map<string, ContextEntry[]> {
  const map = new Map<string, ContextEntry[]>();

  // Pull events from EVENT_CIVILIZATION mapping
  for (const [eventId, pack] of Object.entries(EVENT_CIVILIZATION)) {
    const civId = SLUG_TO_CIV[pack.slug];
    if (!civId) continue;

    const event = SEED_EVENTS.find(e => e.id === eventId);
    if (!event) continue;

    if (!map.has(civId)) map.set(civId, []);
    map.get(civId)!.push({
      year: event.year,
      title: event.title,
      description: event.description?.slice(0, 160) || '',
      category: event.category,
    });
  }

  return map;
}

const eventContext = buildEventContext();

// ── Hand-written context for major border changes ─────────────────
// These explain border shifts that don't have matching events

const SUPPLEMENTAL_CONTEXT: Record<string, ContextEntry[]> = {
  rome: [
    { year: -753, title: 'Founding of Rome', description: 'According to tradition, Romulus founds Rome on the Palatine Hill. Archaeological evidence confirms settlement from this period.', category: 'political' },
    { year: -500, title: 'Roman Republic Established', description: 'Rome overthrows its monarchy and establishes a republic with elected consuls, beginning expansion across Italy.', category: 'political' },
    { year: -343, title: 'Samnite Wars', description: 'Rome fights three wars against the Samnites for control of central and southern Italy, eventually dominating the peninsula.', category: 'war' },
    { year: -264, title: 'First Punic War', description: 'Rome clashes with Carthage over Sicily, building its first navy and winning control of the western Mediterranean.', category: 'war' },
    { year: -218, title: 'Hannibal Invades Italy', description: 'Hannibal crosses the Alps with war elephants, devastating Italy for 15 years. Rome survives and counterattacks in Africa.', category: 'war' },
    { year: -146, title: 'Carthage & Greece Conquered', description: 'Rome destroys Carthage completely and conquers Greece, becoming the undisputed Mediterranean superpower.', category: 'war' },
    { year: -49, title: 'Caesar Crosses the Rubicon', description: 'Julius Caesar marches on Rome, triggering civil war. His victory makes him dictator, ending the Republic in all but name.', category: 'political' },
    { year: -27, title: 'Augustus Becomes First Emperor', description: 'Octavian takes the title Augustus, transforming the Republic into the Roman Empire and beginning the Pax Romana.', category: 'political' },
    { year: 117, title: 'Peak Territorial Extent', description: 'Under Emperor Trajan, the empire reaches its maximum size — from Britain to Mesopotamia, 5 million km².', category: 'political' },
    { year: 285, title: 'Empire Divided East & West', description: 'Diocletian splits administration into Eastern and Western halves. The divide will eventually become permanent.', category: 'political' },
    { year: 380, title: 'Christianity Becomes State Religion', description: 'Emperor Theodosius makes Christianity the official religion, transforming Roman culture and European history.', category: 'cultural' },
    { year: 410, title: 'Visigoths Sack Rome', description: 'Alaric\'s Visigoths breach the walls and sack Rome for 3 days — the first time in 800 years the city has fallen.', category: 'war' },
    { year: 476, title: 'Fall of the Western Empire', description: 'The last Western emperor Romulus Augustulus is deposed. The Eastern half continues as the Byzantine Empire.', category: 'political' },
  ],
  persia: [
    { year: -700, title: 'Median Kingdom Rises', description: 'The Medes unite Iranian tribes into the first major Iranian empire, dominating the region from Anatolia to Afghanistan.', category: 'political' },
    { year: -550, title: 'Cyrus Founds the Achaemenid Empire', description: 'Cyrus the Great conquers Media, Lydia, and Babylon, creating the largest empire the world has ever seen.', category: 'war' },
    { year: -520, title: 'Darius Organizes the Empire', description: 'Darius I builds the Royal Road, creates a postal system, standardizes weights and currency, and carves Persepolis.', category: 'political' },
    { year: -490, title: 'Greco-Persian Wars Begin', description: 'Persia invades Greece at Marathon but is repelled. A second invasion under Xerxes (480 BCE) also fails.', category: 'war' },
    { year: -330, title: 'Alexander Conquers Persia', description: 'Alexander the Great defeats Darius III, burns Persepolis, and absorbs the entire Achaemenid Empire.', category: 'war' },
    { year: -247, title: 'Parthian Empire Emerges', description: 'The Arsacid dynasty establishes the Parthian Empire, reviving Iranian power and becoming Rome\'s eastern rival.', category: 'political' },
    { year: 224, title: 'Sasanian Dynasty Rises', description: 'Ardashir I overthrows the Parthians, founding the Sasanian Empire — the last great pre-Islamic Persian dynasty.', category: 'political' },
    { year: 540, title: 'Khosrow I\'s Golden Age', description: 'Under Khosrow I, the Sasanian Empire reaches its cultural and military peak, rivaling Justinian\'s Byzantium.', category: 'cultural' },
    { year: 651, title: 'Arab Conquest Ends Sasanian Rule', description: 'Arab armies defeat the last Sasanian emperor. Persia becomes part of the Islamic world but retains its cultural identity.', category: 'war' },
  ],
  greece: [
    { year: -1600, title: 'Mycenaean Civilization Flourishes', description: 'The first advanced Greek civilization builds fortress cities at Mycenae, Tiryns, and Pylos, dominating the Aegean.', category: 'cultural' },
    { year: -1100, title: 'Bronze Age Collapse', description: 'Mycenaean civilization collapses. Greece enters a dark age lasting 300 years, losing writing and urban culture.', category: 'political' },
    { year: -800, title: 'Greek City-States Emerge', description: 'The polis system develops — Athens, Sparta, Corinth, and Thebes become powerful independent city-states.', category: 'political' },
    { year: -776, title: 'First Olympic Games', description: 'The Olympics begin at Olympia, uniting Greeks from all city-states in athletic competition every four years.', category: 'cultural' },
    { year: -508, title: 'Athenian Democracy Born', description: 'Cleisthenes reforms create the world\'s first democracy in Athens, where citizens vote directly on laws and policy.', category: 'political' },
    { year: -490, title: 'Victory at Marathon', description: '10,000 Athenians defeat a Persian army of 25,000 at Marathon, preserving Greek independence.', category: 'war' },
    { year: -480, title: 'Thermopylae and Salamis', description: '300 Spartans delay Xerxes at Thermopylae; the Greek fleet destroys the Persian navy at Salamis.', category: 'war' },
    { year: -447, title: 'Parthenon Built', description: 'Pericles commissions the Parthenon on the Acropolis — the pinnacle of Classical Greek architecture.', category: 'construction' },
    { year: -431, title: 'Peloponnesian War', description: 'Athens and Sparta wage a 27-year war that devastates Greece and ends Athenian dominance.', category: 'war' },
    { year: -338, title: 'Philip of Macedon Conquers Greece', description: 'Philip II defeats Athens and Thebes at Chaeronea, unifying Greece under Macedonian control.', category: 'war' },
    { year: -323, title: 'Alexander\'s Empire Fragments', description: 'Alexander dies in Babylon. His generals divide his empire into rival Hellenistic kingdoms.', category: 'political' },
  ],
  china: [
    { year: -1600, title: 'Shang Dynasty Established', description: 'China\'s first verified dynasty rules the Yellow River valley, developing bronze casting and oracle bone writing.', category: 'political' },
    { year: -1046, title: 'Zhou Dynasty Begins', description: 'The Zhou overthrow the Shang, introducing the Mandate of Heaven concept that justifies dynastic change.', category: 'political' },
    { year: -551, title: 'Confucius Born', description: 'The philosopher whose teachings on ethics, governance, and social harmony will shape Chinese civilization for 2,500 years.', category: 'cultural' },
    { year: -475, title: 'Warring States Period', description: 'Seven major states fight for supremacy across China in 250 years of devastating but innovative warfare.', category: 'war' },
    { year: -221, title: 'Qin Unifies China', description: 'Qin Shi Huang conquers all rivals, creates a centralized empire, standardizes writing, weights, and measures.', category: 'war' },
    { year: -206, title: 'Han Dynasty Founded', description: 'Liu Bang establishes the Han dynasty, which will rule for 400 years and give its name to the Chinese ethnic majority.', category: 'political' },
    { year: -138, title: 'Silk Road Opens', description: 'Zhang Qian\'s missions west establish trade routes connecting China to Central Asia, Persia, and Rome.', category: 'discovery' },
    { year: 220, title: 'Three Kingdoms Period', description: 'The Han dynasty collapses into three rival states — Wei, Shu, and Wu — immortalized in Chinese literature.', category: 'war' },
    { year: 618, title: 'Tang Dynasty Golden Age', description: 'The Tang dynasty creates one of China\'s most cosmopolitan eras — poetry, trade, and territory all flourish.', category: 'cultural' },
    { year: 960, title: 'Song Dynasty Innovations', description: 'The Song dynasty invents movable type, gunpowder weapons, and the compass, leading the world in technology.', category: 'discovery' },
    { year: 1279, title: 'Mongol Conquest', description: 'Kublai Khan completes the conquest of Song China, establishing the Yuan dynasty across all of China.', category: 'war' },
    { year: 1368, title: 'Ming Dynasty Restoration', description: 'Zhu Yuanzhang expels the Mongols, rebuilds the Great Wall, and sends Zheng He\'s treasure fleets across the Indian Ocean.', category: 'political' },
    { year: 1644, title: 'Qing Dynasty Begins', description: 'Manchu invaders establish the Qing — China\'s last imperial dynasty, expanding to the largest territory in Chinese history.', category: 'war' },
    { year: 1839, title: 'Opium Wars', description: 'Britain forces China to open its ports to trade. The "Century of Humiliation" begins as foreign powers carve up Chinese territory.', category: 'war' },
  ],
  mongolia: [
    { year: 1162, title: 'Temüjin Born', description: 'The future Genghis Khan is born into a minor Mongol tribe. After years of hardship, he begins uniting the steppe peoples.', category: 'political' },
    { year: 1206, title: 'Genghis Khan Proclaimed', description: 'Temüjin is declared Genghis Khan (Universal Ruler) at a great assembly, unifying all Mongol and Turkic tribes.', category: 'political' },
    { year: 1215, title: 'Fall of Beijing', description: 'The Mongols capture Zhongdu (Beijing) from the Jin dynasty, beginning the conquest of northern China.', category: 'war' },
    { year: 1219, title: 'Invasion of Khwarezmia', description: 'Genghis Khan destroys the Khwarezmian Empire in Central Asia after its shah kills Mongol envoys.', category: 'war' },
    { year: 1227, title: 'Death of Genghis Khan', description: 'Genghis dies on campaign. His empire is divided among his sons, but expansion continues under his successors.', category: 'political' },
    { year: 1241, title: 'Mongols Reach Europe', description: 'Mongol armies devastate Poland and Hungary, reaching the gates of Vienna before withdrawing.', category: 'war' },
    { year: 1258, title: 'Baghdad Destroyed', description: 'Hulagu Khan sacks Baghdad, killing the Abbasid Caliph and ending the Islamic Golden Age.', category: 'war' },
    { year: 1260, title: 'Empire Fragments into Khanates', description: 'The empire splits into four khanates: Yuan China, Chagatai, Golden Horde, and Ilkhanate. Unity is lost.', category: 'political' },
    { year: 1368, title: 'Mongols Expelled from China', description: 'The Ming dynasty drives the Mongols out of China. The empire\'s successor states gradually weaken.', category: 'war' },
  ],
  byzantium: [
    { year: 330, title: 'Constantinople Founded', description: 'Constantine moves the Roman capital east to Byzantium, renaming it Constantinople — the "New Rome."', category: 'construction' },
    { year: 527, title: 'Justinian\'s Reconquests', description: 'Justinian reconquers North Africa, Italy, and parts of Spain. He also builds the Hagia Sophia and codifies Roman law.', category: 'war' },
    { year: 636, title: 'Arab Conquests Begin', description: 'Muslim armies conquer Syria, Egypt, and North Africa from Byzantium in just 20 years, permanently shrinking the empire.', category: 'war' },
    { year: 717, title: 'Siege of Constantinople Repelled', description: 'Leo III defeats a massive Arab siege with Greek fire, saving Constantinople and Christian Europe.', category: 'war' },
    { year: 843, title: 'Iconoclasm Ends', description: 'The controversy over religious images is resolved, restoring icon veneration and stabilizing the empire culturally.', category: 'cultural' },
    { year: 1071, title: 'Battle of Manzikert', description: 'The Seljuk Turks crush the Byzantine army, opening Anatolia to permanent Turkish settlement.', category: 'war' },
    { year: 1204, title: 'Fourth Crusade Sacks Constantinople', description: 'Western Crusaders divert to Constantinople and sack it for three days, fragmenting the empire for 57 years.', category: 'war' },
    { year: 1261, title: 'Constantinople Recaptured', description: 'The Byzantines retake their capital, but the restored empire is a shadow of its former self.', category: 'war' },
    { year: 1453, title: 'Fall of Constantinople', description: 'Ottoman Sultan Mehmed II breaches the walls with massive cannons. The 1,100-year empire ends.', category: 'war' },
  ],
  ottoman: [
    { year: 1299, title: 'Ottoman Beylik Founded', description: 'Osman I establishes a small frontier principality in Anatolia that will grow into a vast empire.', category: 'political' },
    { year: 1389, title: 'Battle of Kosovo', description: 'The Ottomans defeat Serbian forces, establishing dominance over the Balkans.', category: 'war' },
    { year: 1453, title: 'Conquest of Constantinople', description: 'Mehmed II captures Constantinople with massive cannons, renaming it Istanbul and making it his capital.', category: 'war' },
    { year: 1517, title: 'Conquest of Egypt', description: 'Selim I conquers the Mamluk Sultanate, adding Egypt, Syria, and the holy cities of Mecca and Medina.', category: 'war' },
    { year: 1520, title: 'Suleiman the Magnificent', description: 'The empire reaches its peak under Suleiman — conquering Belgrade, Rhodes, and besieging Vienna.', category: 'political' },
    { year: 1571, title: 'Battle of Lepanto', description: 'A Christian coalition destroys the Ottoman fleet, ending Ottoman naval dominance in the Mediterranean.', category: 'war' },
    { year: 1683, title: 'Second Siege of Vienna Fails', description: 'The failed siege marks the turning point. The empire begins its long territorial retreat from Europe.', category: 'war' },
    { year: 1821, title: 'Greek War of Independence', description: 'Greece revolts and gains independence, inspiring other Balkan peoples to follow. The empire is the "Sick Man of Europe."', category: 'war' },
    { year: 1922, title: 'Empire Dissolved', description: 'After defeat in WWI, the Ottoman Empire is dissolved. Mustafa Kemal Atatürk founds the Republic of Turkey.', category: 'political' },
  ],
  egypt: [
    { year: -3100, title: 'Upper and Lower Egypt Unified', description: 'King Narmer unifies the two lands, founding the First Dynasty and creating the world\'s first nation-state.', category: 'political' },
    { year: -2560, title: 'Great Pyramid Built', description: 'Pharaoh Khufu commissions the Great Pyramid at Giza — the tallest structure on Earth for 3,800 years.', category: 'construction' },
    { year: -1550, title: 'New Kingdom Begins', description: 'Egypt enters its most powerful era. Warrior pharaohs like Thutmose III expand into Nubia and the Levant.', category: 'war' },
    { year: -1274, title: 'Battle of Kadesh', description: 'Ramesses II fights the Hittites in one of history\'s largest chariot battles, leading to the first known peace treaty.', category: 'war' },
    { year: -1070, title: 'Third Intermediate Period', description: 'Egypt fragments into competing dynasties. Libyan and Nubian rulers take control of parts of the kingdom.', category: 'political' },
    { year: -750, title: 'Kushite Conquest', description: 'The Kingdom of Kush from Nubia conquers Egypt, ruling as the 25th Dynasty.', category: 'war' },
    { year: -525, title: 'Persian Conquest', description: 'Cambyses II of Persia conquers Egypt, making it a province of the Achaemenid Empire.', category: 'war' },
    { year: -332, title: 'Alexander Conquers Egypt', description: 'Alexander the Great liberates Egypt from Persia and founds Alexandria, which becomes the ancient world\'s greatest city.', category: 'war' },
    { year: -30, title: 'Cleopatra Dies, Rome Takes Over', description: 'After Cleopatra\'s death, Egypt becomes a Roman province, ending 3,000 years of pharaonic rule.', category: 'political' },
  ],
  india: [
    { year: -2600, title: 'Indus Valley Civilization Peaks', description: 'Cities like Mohenjo-daro and Harappa reach their height — grid streets, indoor plumbing, standardized weights.', category: 'construction' },
    { year: -1500, title: 'Vedic Period Begins', description: 'Indo-Aryan peoples migrate into the subcontinent, composing the Rigveda and establishing Vedic culture.', category: 'cultural' },
    { year: -528, title: 'Buddha Attains Enlightenment', description: 'Siddhartha Gautama achieves enlightenment at Bodh Gaya, founding Buddhism.', category: 'cultural' },
    { year: -322, title: 'Maurya Empire Founded', description: 'Chandragupta Maurya unifies most of the subcontinent for the first time, creating a vast centralized empire.', category: 'political' },
    { year: -260, title: 'Ashoka Embraces Non-Violence', description: 'After the bloody conquest of Kalinga, Emperor Ashoka converts to Buddhism and spreads it across Asia.', category: 'cultural' },
    { year: -185, title: 'Maurya Empire Collapses', description: 'The empire fragments into competing kingdoms — Sungas, Satavahanas, and Indo-Greek states.', category: 'political' },
    { year: 320, title: 'Gupta Empire Golden Age', description: 'The Gupta dynasty reunifies northern India. The concept of zero, decimal system, and Sanskrit literature flourish.', category: 'cultural' },
    { year: 711, title: 'Arab Conquest of Sindh', description: 'Muslim armies reach the Indian subcontinent, beginning centuries of Islamic influence in South Asia.', category: 'war' },
    { year: 1206, title: 'Delhi Sultanate Established', description: 'Turkish Muslim rulers establish a sultanate in Delhi, dominating northern India for 320 years.', category: 'political' },
    { year: 1526, title: 'Mughal Empire Founded', description: 'Babur defeats the Delhi Sultanate at Panipat, founding the Mughal dynasty that builds the Taj Mahal.', category: 'war' },
    { year: 1757, title: 'British East India Company Takes Control', description: 'Victory at Plassey begins British colonial rule. India won\'t regain independence until 1947.', category: 'war' },
  ],
  mali: [
    { year: 300, title: 'Ghana Empire Rises', description: 'The first great West African empire controls trans-Saharan gold and salt trade routes.', category: 'political' },
    { year: 1076, title: 'Ghana Empire Declines', description: 'Almoravid raids and internal strife weaken Ghana. Power shifts to new Mande kingdoms.', category: 'war' },
    { year: 1235, title: 'Sundiata Founds Mali', description: 'Sundiata Keita defeats the Sosso Empire at the Battle of Kirina, establishing the Mali Empire.', category: 'war' },
    { year: 1312, title: 'Mansa Musa Takes Power', description: 'Mansa Musa becomes ruler of Mali, presiding over what may be the wealthiest empire in world history.', category: 'political' },
    { year: 1324, title: 'Mansa Musa\'s Hajj', description: 'His legendary pilgrimage to Mecca distributes so much gold that it crashes Egyptian markets for a decade.', category: 'cultural' },
    { year: 1352, title: 'Timbuktu\'s Golden Age', description: 'Timbuktu becomes a world center of Islamic learning, with the University of Sankore attracting scholars from across Africa and the Middle East.', category: 'cultural' },
    { year: 1464, title: 'Songhai Empire Conquers Mali', description: 'Sunni Ali of Songhai captures Timbuktu, ending Mali\'s dominance in West Africa.', category: 'war' },
  ],
  vikings: [
    { year: 793, title: 'Raid on Lindisfarne', description: 'Norse warriors attack the monastery at Lindisfarne, shocking Christian Europe and beginning the Viking Age.', category: 'war' },
    { year: 845, title: 'Siege of Paris', description: 'Vikings sail up the Seine and besiege Paris with 120 ships. King Charles the Bald pays a huge ransom.', category: 'war' },
    { year: 872, title: 'Harald Fairhair Unifies Norway', description: 'Harald becomes the first king of a unified Norway, driving rival chiefs to colonize Iceland.', category: 'political' },
    { year: 911, title: 'Normandy Established', description: 'Viking leader Rollo receives Normandy from the French king. His descendants will conquer England in 1066.', category: 'political' },
    { year: 985, title: 'Erik the Red Colonizes Greenland', description: 'Erik the Red establishes Norse settlements in Greenland, pushing Viking exploration further west.', category: 'discovery' },
    { year: 1000, title: 'Leif Erikson Reaches North America', description: 'Leif Erikson lands at Vinland (Newfoundland), 500 years before Columbus. The settlement doesn\'t last.', category: 'discovery' },
    { year: 1016, title: 'Cnut Rules England', description: 'The Danish king Cnut conquers England, creating a North Sea empire spanning Denmark, Norway, and England.', category: 'war' },
    { year: 1066, title: 'End of the Viking Age', description: 'Harald Hardrada dies at Stamford Bridge. Weeks later, William the Conqueror (a Norman Viking descendant) takes England.', category: 'war' },
  ],
  aztecs: [
    { year: 1100, title: 'Mexica Migration Begins', description: 'The Mexica people leave their mythical homeland of Aztlan, wandering for generations seeking a prophesied sign.', category: 'political' },
    { year: 1325, title: 'Tenochtitlan Founded', description: 'The Mexica find an eagle on a cactus devouring a snake (now on Mexico\'s flag) and build their island capital.', category: 'construction' },
    { year: 1428, title: 'Triple Alliance Formed', description: 'Tenochtitlan allies with Texcoco and Tlacopan, rapidly conquering central Mexico.', category: 'political' },
    { year: 1487, title: 'Great Temple Rededication', description: 'The Templo Mayor is expanded with massive human sacrifice ceremonies, shocking even allied states.', category: 'cultural' },
    { year: 1502, title: 'Montezuma II Takes Throne', description: 'The last independent Aztec emperor takes power. Under him, the empire reaches 200,000+ subjects in Tenochtitlan.', category: 'political' },
    { year: 1519, title: 'Cortés Arrives', description: 'Hernán Cortés lands on the Mexican coast with 500 soldiers. He allies with anti-Aztec peoples.', category: 'war' },
    { year: 1521, title: 'Fall of Tenochtitlan', description: 'After a 75-day siege, Cortés and 200,000 indigenous allies destroy Tenochtitlan. The Aztec Empire ends.', category: 'war' },
  ],
  inca: [
    { year: 1200, title: 'Kingdom of Cusco Founded', description: 'The Inca settle in the Cusco Valley, beginning as a small kingdom among many Andean peoples.', category: 'political' },
    { year: 1438, title: 'Pachacuti Begins Expansion', description: 'Pachacuti transforms Cusco from a city-state into an empire, conquering neighboring peoples across the Andes.', category: 'war' },
    { year: 1471, title: 'Empire Reaches Ecuador', description: 'Under Tupac Inca Yupanqui, the empire expands north into Ecuador and south into Chile and Argentina.', category: 'war' },
    { year: 1493, title: 'Huayna Capac\'s Reign', description: 'The empire reaches its maximum extent — 12 million people connected by 40,000 km of roads.', category: 'political' },
    { year: 1527, title: 'Civil War', description: 'Huayna Capac dies (possibly of smallpox). His sons Atahualpa and Huascar fight a devastating civil war.', category: 'war' },
    { year: 1532, title: 'Pizarro Arrives', description: 'Francisco Pizarro lands with 168 soldiers and captures Emperor Atahualpa at Cajamarca.', category: 'war' },
    { year: 1572, title: 'Last Inca Resistance Falls', description: 'The Spanish execute the last Inca ruler, Tupac Amaru, at Cusco. Inca resistance finally ends.', category: 'war' },
  ],
  japan: [
    { year: -300, title: 'Yayoi Culture Arrives', description: 'Rice farming and metalworking spread from Korea to Japan, transforming the archipelago from hunting to agriculture.', category: 'cultural' },
    { year: 538, title: 'Buddhism Arrives', description: 'Buddhism reaches Japan from Korea, profoundly shaping Japanese art, architecture, and philosophy.', category: 'cultural' },
    { year: 794, title: 'Heian Period Begins', description: 'The capital moves to Kyoto. Japanese culture flourishes — The Tale of Genji, the world\'s first novel, is written.', category: 'cultural' },
    { year: 1185, title: 'Kamakura Shogunate', description: 'Minamoto no Yoritomo becomes the first shogun, establishing military rule that will last 700 years.', category: 'political' },
    { year: 1274, title: 'Mongol Invasions Repelled', description: 'Two Mongol fleets are destroyed by typhoons (kamikaze — "divine wind"), saving Japan from conquest.', category: 'war' },
    { year: 1467, title: 'Warring States Period', description: 'Japan fragments into warring domains. 150 years of civil war transforms the military and social order.', category: 'war' },
    { year: 1603, title: 'Tokugawa Unification', description: 'Tokugawa Ieyasu unifies Japan, establishing 250 years of peace, isolation, and cultural refinement.', category: 'political' },
    { year: 1853, title: 'Perry\'s Black Ships Arrive', description: 'American warships force Japan to open its ports, ending two centuries of isolation.', category: 'political' },
    { year: 1868, title: 'Meiji Restoration', description: 'Japan rapidly industrializes and modernizes, transforming from a feudal society into a world power in just 30 years.', category: 'political' },
    { year: 1905, title: 'Victory Over Russia', description: 'Japan defeats Russia in war — the first modern Asian victory over a European power, shocking the world.', category: 'war' },
  ],
  // ── Previously missing civilizations ──
  babylon: [
    { year: -3500, title: 'Sumerian City-States Emerge', description: 'The world\'s first cities — Ur, Uruk, Eridu — develop in southern Mesopotamia with writing, temples, and irrigation.', category: 'construction' },
    { year: -2334, title: 'Sargon of Akkad Unifies Mesopotamia', description: 'Sargon creates the world\'s first empire, conquering all Sumerian city-states and ruling from Akkad.', category: 'war' },
    { year: -1894, title: 'Old Babylonian Kingdom Founded', description: 'Babylon rises as a powerful city-state in central Mesopotamia under the Amorite dynasty.', category: 'political' },
    { year: -1754, title: 'Code of Hammurabi', description: 'King Hammurabi creates 282 laws carved on a stone stele — the most comprehensive ancient legal code ever found.', category: 'political' },
    { year: -1595, title: 'Hittite Sack of Babylon', description: 'The Hittites raid Babylon, ending Hammurabi\'s dynasty. The Kassites then rule for 400 years.', category: 'war' },
    { year: -626, title: 'Neo-Babylonian Empire Rises', description: 'Nabopolassar founds the Chaldean dynasty, defeating Assyria and restoring Babylon\'s power.', category: 'war' },
    { year: -586, title: 'Nebuchadnezzar Destroys Jerusalem', description: 'Nebuchadnezzar II conquers Judah, destroys Solomon\'s Temple, and exiles the Jewish people to Babylon.', category: 'war' },
    { year: -539, title: 'Cyrus Conquers Babylon', description: 'The Persian king Cyrus the Great captures Babylon peacefully, ending Mesopotamian independence forever.', category: 'war' },
  ],
  kush: [
    { year: -2500, title: 'Kerma Kingdom Flourishes', description: 'The earliest Nubian civilization develops along the Nile south of Egypt, rivaling Egyptian power.', category: 'political' },
    { year: -1500, title: 'Egyptian Conquest of Nubia', description: 'New Kingdom Egypt conquers Kush, imposing Egyptian culture and building temples at Abu Simbel.', category: 'war' },
    { year: -1070, title: 'Kush Regains Independence', description: 'As Egypt weakens, Kush reasserts independence and develops its own distinctive culture.', category: 'political' },
    { year: -750, title: 'Kush Conquers Egypt', description: 'Kushite kings conquer Egypt, ruling as the 25th Dynasty — Nubian pharaohs on the throne of Egypt.', category: 'war' },
    { year: -660, title: 'Assyria Drives Kush from Egypt', description: 'Assyrian invasion forces the Kushites back south. The capital moves to Meroe.', category: 'war' },
    { year: -300, title: 'Meroitic Golden Age', description: 'Meroe becomes a major iron-smelting center and builds over 200 pyramids — more than Egypt itself.', category: 'cultural' },
    { year: 350, title: 'Aksum Destroys Meroe', description: 'The Ethiopian kingdom of Aksum conquers Meroe, ending 2,000 years of Kushite civilization.', category: 'war' },
  ],
  hre: [
    { year: 800, title: 'Charlemagne Crowned Emperor', description: 'Pope Leo III crowns Charlemagne as Emperor, reviving the idea of a Roman Empire in Western Europe.', category: 'political' },
    { year: 843, title: 'Treaty of Verdun', description: 'Charlemagne\'s empire splits into three. The eastern portion becomes the basis of the Holy Roman Empire.', category: 'political' },
    { year: 962, title: 'Otto I Crowned', description: 'Otto I is crowned Holy Roman Emperor, formally establishing the empire that will last until 1806.', category: 'political' },
    { year: 1077, title: 'Investiture Controversy', description: 'Emperor Henry IV walks barefoot to Canossa to beg Pope Gregory VII for forgiveness — a pivotal Church-state clash.', category: 'political' },
    { year: 1356, title: 'Golden Bull Issued', description: 'Charles IV establishes the electoral system — seven princes choose the emperor, decentralizing power.', category: 'political' },
    { year: 1517, title: 'Protestant Reformation', description: 'Martin Luther\'s 95 Theses split the empire along religious lines, leading to devastating wars.', category: 'cultural' },
    { year: 1618, title: 'Thirty Years\' War Begins', description: 'Religious and political conflict devastates Central Europe, killing a third of Germany\'s population.', category: 'war' },
    { year: 1806, title: 'Empire Dissolved by Napoleon', description: 'Napoleon forces the last emperor to abdicate. As Voltaire quipped, it was "neither holy, nor Roman, nor an empire."', category: 'political' },
  ],
  arab_caliphates: [
    { year: 622, title: 'Hijra — Islam Founded', description: 'Muhammad migrates from Mecca to Medina, establishing the first Muslim community. Year 1 of the Islamic calendar.', category: 'cultural' },
    { year: 632, title: 'Rashidun Caliphate Begins', description: 'After Muhammad\'s death, elected caliphs conquer Syria, Iraq, Egypt, and Persia in just 20 years.', category: 'war' },
    { year: 661, title: 'Umayyad Caliphate', description: 'The Umayyads move the capital to Damascus, expanding the empire from Spain to Central Asia — the largest empire yet.', category: 'political' },
    { year: 750, title: 'Abbasid Revolution', description: 'The Abbasids overthrow the Umayyads, moving the capital to Baghdad and ushering in an Islamic Golden Age.', category: 'political' },
    { year: 786, title: 'Harun al-Rashid\'s Baghdad', description: 'Baghdad becomes the world\'s largest and most cultured city. The House of Wisdom translates Greek, Persian, and Indian texts.', category: 'cultural' },
    { year: 830, title: 'House of Wisdom Peak', description: 'Scholars develop algebra, algorithms, optics, and medicine, preserving and advancing human knowledge.', category: 'discovery' },
    { year: 1055, title: 'Seljuk Turks Take Baghdad', description: 'The Seljuks seize real power; the Abbasid caliph becomes a figurehead. The caliphate fragments.', category: 'war' },
    { year: 1258, title: 'Mongols Destroy Baghdad', description: 'Hulagu Khan sacks Baghdad, kills the caliph, and destroys the House of Wisdom. The Islamic Golden Age ends.', category: 'war' },
  ],
  britain: [
    { year: 1066, title: 'Norman Conquest', description: 'William the Conqueror defeats Harold at Hastings, establishing Norman rule and reshaping English language and law.', category: 'war' },
    { year: 1215, title: 'Magna Carta', description: 'King John is forced to sign the Magna Carta, establishing that even the king is subject to the law.', category: 'political' },
    { year: 1534, title: 'English Reformation', description: 'Henry VIII breaks from Rome, creating the Church of England and seizing monastery lands.', category: 'political' },
    { year: 1588, title: 'Spanish Armada Defeated', description: 'England destroys the Spanish fleet, establishing itself as a major naval power.', category: 'war' },
    { year: 1607, title: 'Jamestown Colony', description: 'England\'s first permanent American colony is founded, beginning the British Empire.', category: 'discovery' },
    { year: 1707, title: 'Act of Union', description: 'England and Scotland merge into the Kingdom of Great Britain, creating a unified state.', category: 'political' },
    { year: 1760, title: 'Industrial Revolution Begins', description: 'Britain becomes the birthplace of industrialization — factories, railways, and steam power transform the world.', category: 'discovery' },
    { year: 1815, title: 'Victory at Waterloo', description: 'Britain defeats Napoleon, beginning a century of global dominance known as the Pax Britannica.', category: 'war' },
    { year: 1858, title: 'British Raj in India', description: 'After the Indian Rebellion, the British Crown takes direct control of India — the "jewel in the crown."', category: 'political' },
    { year: 1922, title: 'Empire at Its Peak', description: 'The British Empire covers a quarter of the world\'s land and governs a quarter of its people.', category: 'political' },
    { year: 1947, title: 'Decolonization Begins', description: 'India gains independence, triggering the dissolution of the empire across Africa and Asia.', category: 'political' },
  ],
  france: [
    { year: 843, title: 'West Francia Established', description: 'The Treaty of Verdun creates West Francia — the foundation of modern France.', category: 'political' },
    { year: 1066, title: 'Norman Conquest of England', description: 'William of Normandy, a French duke, conquers England, linking French and English history for centuries.', category: 'war' },
    { year: 1337, title: 'Hundred Years\' War Begins', description: 'England and France fight for 116 years. Joan of Arc turns the tide for France.', category: 'war' },
    { year: 1534, title: 'France Explores North America', description: 'Jacques Cartier explores the St. Lawrence River, beginning French colonization of Canada.', category: 'discovery' },
    { year: 1643, title: 'Louis XIV Takes Power', description: 'The Sun King builds Versailles and makes France the dominant European power for 72 years.', category: 'political' },
    { year: 1789, title: 'French Revolution', description: 'The storming of the Bastille begins a revolution that topples the monarchy and reshapes the world.', category: 'political' },
    { year: 1804, title: 'Napoleon Crowned Emperor', description: 'Napoleon conquers most of Europe, spreading revolutionary ideas and the Napoleonic Code.', category: 'war' },
    { year: 1815, title: 'Napoleon Defeated at Waterloo', description: 'Napoleon\'s empire collapses. France returns to monarchy but remains a major European power.', category: 'war' },
    { year: 1880, title: 'Colonial Empire in Africa', description: 'France builds the second-largest colonial empire, ruling much of North and West Africa and Indochina.', category: 'political' },
    { year: 1940, title: 'Fall of France in WWII', description: 'Germany conquers France in six weeks. De Gaulle leads the Free French resistance from London.', category: 'war' },
  ],
  spain: [
    { year: 711, title: 'Moorish Conquest', description: 'Muslim Moors from North Africa conquer most of Iberia, beginning 800 years of Islamic influence.', category: 'war' },
    { year: 1085, title: 'Reconquista Gains Momentum', description: 'Christian kingdoms recapture Toledo, beginning the slow reconquest of the peninsula.', category: 'war' },
    { year: 1469, title: 'Ferdinand & Isabella Unite Spain', description: 'The marriage of Ferdinand of Aragon and Isabella of Castile creates a unified Spanish kingdom.', category: 'political' },
    { year: 1492, title: 'Columbus Reaches the Americas', description: 'Spain finances Columbus\'s voyage, beginning the conquest of the New World and a global empire.', category: 'discovery' },
    { year: 1519, title: 'Cortés Conquers the Aztecs', description: 'Hernán Cortés destroys the Aztec Empire, claiming Mexico for Spain.', category: 'war' },
    { year: 1533, title: 'Pizarro Conquers the Inca', description: 'Francisco Pizarro captures the Inca emperor, adding Peru and its gold to the Spanish Empire.', category: 'war' },
    { year: 1588, title: 'Spanish Armada Defeated', description: 'England destroys Spain\'s "invincible" fleet, beginning Spain\'s slow decline as a world power.', category: 'war' },
    { year: 1810, title: 'Latin American Independence', description: 'Spain\'s American colonies revolt, and by 1825 most of Latin America is independent.', category: 'political' },
  ],
  phoenicia: [
    { year: -1500, title: 'Phoenician City-States Flourish', description: 'Byblos, Sidon, and Tyre become major Mediterranean trading hubs, exporting cedar, purple dye, and glass.', category: 'political' },
    { year: -1050, title: 'Phoenician Alphabet Spreads', description: 'The Phoenicians develop the alphabet that will become the ancestor of Greek, Latin, Arabic, and Hebrew scripts.', category: 'cultural' },
    { year: -814, title: 'Carthage Founded', description: 'Phoenician colonists from Tyre found Carthage in North Africa, which will become a great power in its own right.', category: 'construction' },
    { year: -600, title: 'Circumnavigation of Africa', description: 'Phoenician sailors reportedly circumnavigate Africa for Egyptian pharaoh Necho II — 2,000 years before the Portuguese.', category: 'discovery' },
    { year: -539, title: 'Persian Conquest', description: 'Cyrus the Great conquers the Phoenician cities, which become part of the Achaemenid Empire.', category: 'war' },
    { year: -332, title: 'Alexander Destroys Tyre', description: 'Alexander the Great besieges island-city Tyre for 7 months, building a causeway to reach it. Phoenicia ends.', category: 'war' },
  ],
  khmer: [
    { year: 802, title: 'Khmer Empire Founded', description: 'Jayavarman II declares independence from Java and founds the Khmer Empire, proclaiming himself god-king.', category: 'political' },
    { year: 889, title: 'Capital Moves to Angkor', description: 'Yasovarman I establishes Angkor as the capital, beginning centuries of monumental construction.', category: 'construction' },
    { year: 1113, title: 'Angkor Wat Built', description: 'Suryavarman II builds Angkor Wat — the largest religious monument ever constructed, dedicated to Vishnu.', category: 'construction' },
    { year: 1181, title: 'Jayavarman VII Expands Empire', description: 'The empire reaches its greatest extent, controlling much of mainland Southeast Asia. The Bayon temple is built.', category: 'war' },
    { year: 1283, title: 'Mongol Pressure', description: 'Kublai Khan\'s Yuan dynasty pressures the Khmer, who pay tribute to avoid invasion.', category: 'war' },
    { year: 1431, title: 'Angkor Abandoned', description: 'Thai armies sack Angkor. The capital moves south to Phnom Penh. The jungle swallows the temple complex.', category: 'war' },
  ],
  maya: [
    { year: -1000, title: 'Early Maya Villages', description: 'Maya peoples establish farming villages in the lowlands of Guatemala, Belize, and Yucatan.', category: 'political' },
    { year: -400, title: 'First Maya Cities', description: 'Cities like El Mirador emerge with massive pyramids, some larger than anything built later at Tikal.', category: 'construction' },
    { year: 250, title: 'Classic Period Begins', description: 'Maya civilization reaches its peak — Tikal, Calakmul, Palenque, and Copan become powerful city-states.', category: 'cultural' },
    { year: 562, title: 'Calakmul Defeats Tikal', description: 'A great war between rival superpowers Tikal and Calakmul reshapes Maya political order for centuries.', category: 'war' },
    { year: 683, title: 'Pakal the Great Dies', description: 'The greatest Maya king of Palenque is buried in an elaborate tomb beneath the Temple of Inscriptions.', category: 'political' },
    { year: 900, title: 'Classic Maya Collapse', description: 'Southern lowland cities are mysteriously abandoned — drought, warfare, and deforestation likely contribute.', category: 'natural' },
    { year: 1200, title: 'Postclassic Revival in Yucatan', description: 'Cities like Chichen Itza and Mayapan flourish in the northern Yucatan with new architectural styles.', category: 'cultural' },
    { year: 1524, title: 'Spanish Conquest Begins', description: 'Pedro de Alvarado invades Guatemala. The last independent Maya kingdom falls in 1697.', category: 'war' },
  ],
  carthage: [
    { year: -814, title: 'Carthage Founded', description: 'Phoenician settlers from Tyre found Carthage on the North African coast, perfectly positioned for trade.', category: 'construction' },
    { year: -550, title: 'Carthage Dominates Western Mediterranean', description: 'Carthage builds a powerful navy and controls trade routes from Spain to Sicily.', category: 'political' },
    { year: -264, title: 'First Punic War', description: 'Rome and Carthage clash over Sicily in a 23-year war. Rome builds its first navy and wins.', category: 'war' },
    { year: -218, title: 'Hannibal Crosses the Alps', description: 'Hannibal marches elephants across the Alps into Italy, winning devastating victories at Cannae and Trasimene.', category: 'war' },
    { year: -202, title: 'Battle of Zama', description: 'Scipio Africanus defeats Hannibal in Africa, ending the Second Punic War. Carthage loses its empire.', category: 'war' },
    { year: -146, title: 'Carthage Destroyed', description: 'Rome razes Carthage to the ground and salts the earth. 700 years of Carthaginian civilization ends.', category: 'war' },
  ],
  songhai: [
    { year: 1000, title: 'Songhai Kingdom Emerges', description: 'The Songhai people establish a kingdom along the Niger River bend, subject to the Mali Empire.', category: 'political' },
    { year: 1464, title: 'Sunni Ali Conquers Timbuktu', description: 'Sunni Ali breaks free of Mali and captures Timbuktu and Djenné, creating a vast empire.', category: 'war' },
    { year: 1493, title: 'Askia Muhammad Takes Power', description: 'Askia Muhammad reforms government, expands the empire, and makes Songhai the largest in African history.', category: 'political' },
    { year: 1510, title: 'Timbuktu\'s Scholarly Peak', description: 'Under Songhai rule, Timbuktu has 25,000 students at its university — one of the world\'s greatest learning centers.', category: 'cultural' },
    { year: 1591, title: 'Moroccan Invasion', description: 'A Moroccan army with firearms crosses the Sahara and defeats the Songhai at the Battle of Tondibi.', category: 'war' },
  ],
};

// ── Merge event-based and supplemental context ────────────────────

const mergedContext = new Map<string, ContextEntry[]>();

// Start with supplemental
for (const [civId, entries] of Object.entries(SUPPLEMENTAL_CONTEXT)) {
  mergedContext.set(civId, [...entries]);
}

// Add event-based entries (avoid duplicates by checking year proximity)
for (const [civId, entries] of eventContext) {
  const existing = mergedContext.get(civId) || [];
  for (const entry of entries) {
    const isDuplicate = existing.some(e =>
      Math.abs(e.year - entry.year) < 50 && e.category === entry.category
    );
    if (!isDuplicate) {
      existing.push(entry);
    }
  }
  mergedContext.set(civId, existing);
}

// Sort each civ's entries by year
for (const [civId, entries] of mergedContext) {
  mergedContext.set(civId, entries.sort((a, b) => a.year - b.year));
}

/**
 * Get context events for a civilization within a year range.
 * Used during spotlight playback to show what's happening at each snapshot.
 */
export function getSpotlightContext(
  civId: string,
  fromYear: number,
  toYear: number,
): ContextEntry[] {
  const entries = mergedContext.get(civId);
  if (!entries) return [];
  return entries.filter(e => e.year >= fromYear && e.year <= toYear);
}

/**
 * Get ALL context events for a civilization (for overview).
 */
export function getAllContextForCiv(civId: string): ContextEntry[] {
  return mergedContext.get(civId) || [];
}
