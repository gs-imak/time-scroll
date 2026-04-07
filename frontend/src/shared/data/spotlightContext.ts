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
    { year: -500, title: 'Roman Republic Established', description: 'Rome overthrows its monarchy and establishes a republic, beginning its territorial expansion across the Italian peninsula.', category: 'political' },
    { year: -264, title: 'Punic Wars Begin', description: 'Rome clashes with Carthage for control of the western Mediterranean. Three wars spanning over a century reshape the region.', category: 'war' },
    { year: -146, title: 'Conquest of Greece & Carthage', description: 'Rome destroys Carthage and conquers Greece, becoming the dominant Mediterranean power.', category: 'war' },
    { year: 117, title: 'Peak of Roman Empire', description: 'Under Emperor Trajan, Rome reaches its maximum territorial extent, spanning from Britain to Mesopotamia.', category: 'political' },
    { year: 285, title: 'Empire Divided', description: 'Diocletian splits the empire into Eastern and Western administrations to manage its vast territory.', category: 'political' },
    { year: 410, title: 'Sack of Rome', description: 'Visigoths sack Rome, signaling the irreversible decline of the Western Roman Empire.', category: 'war' },
  ],
  persia: [
    { year: -550, title: 'Cyrus Unifies Persia', description: 'Cyrus the Great defeats the Medes and establishes the Achaemenid Empire, the largest empire the world has seen.', category: 'war' },
    { year: -330, title: 'Fall to Alexander', description: 'Alexander the Great defeats Darius III, ending the Achaemenid dynasty and absorbing Persia into his empire.', category: 'war' },
    { year: 224, title: 'Sasanian Dynasty Rises', description: 'The Sasanian Empire overthrows the Parthians, restoring Persian power and rivaling Rome for centuries.', category: 'political' },
    { year: 651, title: 'Arab Conquest', description: 'The Sasanian Empire falls to the Rashidun Caliphate during the Muslim conquests, ending ancient Persian rule.', category: 'war' },
  ],
  greece: [
    { year: -800, title: 'Greek City-States Emerge', description: 'Independent city-states like Athens and Sparta develop, each with distinct governance and culture.', category: 'political' },
    { year: -480, title: 'Persian Wars', description: 'Greek city-states unite to repel two massive Persian invasions, preserving their independence.', category: 'war' },
    { year: -431, title: 'Peloponnesian War', description: 'Athens and Sparta wage a devastating 27-year war that weakens all Greek city-states.', category: 'war' },
    { year: -338, title: 'Macedonian Conquest', description: 'Philip II of Macedon defeats the Greek city-states at Chaeronea, unifying Greece under Macedonian control.', category: 'war' },
  ],
  china: [
    { year: -1600, title: 'Shang Dynasty Founded', description: 'The first historically verified Chinese dynasty establishes centralized rule in the Yellow River valley.', category: 'political' },
    { year: -221, title: 'Qin Unification', description: 'Qin Shi Huang conquers all rival states and unifies China for the first time, establishing the imperial system.', category: 'war' },
    { year: 618, title: 'Tang Dynasty Golden Age', description: 'The Tang dynasty ushers in a golden age of expansion, culture, and trade along the Silk Road.', category: 'cultural' },
    { year: 1279, title: 'Mongol Conquest Complete', description: 'Kublai Khan completes the Mongol conquest of China, establishing the Yuan dynasty.', category: 'war' },
    { year: 1368, title: 'Ming Dynasty Restoration', description: 'The Ming dynasty expels the Mongols and restores Han Chinese rule, rebuilding and expanding the empire.', category: 'political' },
    { year: 1644, title: 'Qing Dynasty Begins', description: 'The Manchu Qing dynasty conquers Ming China, eventually expanding to the largest territory in Chinese history.', category: 'war' },
  ],
  mongolia: [
    { year: 1206, title: 'Mongol Empire Founded', description: 'Genghis Khan unites the Mongol tribes and begins the largest contiguous land empire in history.', category: 'war' },
    { year: 1241, title: 'Invasion of Europe', description: 'Mongol armies sweep through Eastern Europe, reaching Hungary and Poland before withdrawing.', category: 'war' },
    { year: 1260, title: 'Empire Fragments', description: 'After Möngke Khan\'s death, the empire splits into four khanates that gradually go their separate ways.', category: 'political' },
  ],
  byzantium: [
    { year: 527, title: 'Justinian\'s Reconquests', description: 'Emperor Justinian reconquers North Africa, Italy, and parts of Spain, briefly restoring Roman territorial reach.', category: 'war' },
    { year: 1071, title: 'Battle of Manzikert', description: 'The Seljuk Turks defeat the Byzantine army, opening Anatolia to Turkish settlement and permanent Byzantine decline.', category: 'war' },
    { year: 1204, title: 'Fourth Crusade Sacks Constantinople', description: 'Crusaders divert to Constantinople and sack the city, fragmenting the empire for decades.', category: 'war' },
    { year: 1453, title: 'Fall of Constantinople', description: 'The Ottoman Turks capture Constantinople, ending the 1,100-year Byzantine Empire.', category: 'war' },
  ],
  ottoman: [
    { year: 1299, title: 'Ottoman Beylik Founded', description: 'Osman I establishes a small Anatolian principality that will grow into a vast empire.', category: 'political' },
    { year: 1453, title: 'Conquest of Constantinople', description: 'Sultan Mehmed II captures Constantinople, giving the Ottomans control of the strategic crossroads between Europe and Asia.', category: 'war' },
    { year: 1520, title: 'Suleiman the Magnificent', description: 'Under Suleiman, the Ottoman Empire reaches its peak, controlling the eastern Mediterranean, Balkans, and Middle East.', category: 'political' },
    { year: 1683, title: 'Siege of Vienna Fails', description: 'The failed siege marks the beginning of Ottoman territorial retreat in Europe.', category: 'war' },
  ],
  egypt: [
    { year: -3100, title: 'Unification of Upper and Lower Egypt', description: 'Narmer unites the two kingdoms, founding the first dynasty and creating one of the world\'s earliest nation-states.', category: 'political' },
    { year: -1550, title: 'New Kingdom Expansion', description: 'Egypt enters its most powerful era, expanding into Nubia and the Levant under warrior pharaohs.', category: 'war' },
    { year: -332, title: 'Alexander Conquers Egypt', description: 'Alexander the Great takes Egypt from the Persians, beginning the Ptolemaic period of Greek rule.', category: 'war' },
  ],
  india: [
    { year: -322, title: 'Maurya Empire Founded', description: 'Chandragupta Maurya unifies most of the Indian subcontinent for the first time, creating a vast empire.', category: 'political' },
    { year: -185, title: 'Maurya Empire Collapses', description: 'The empire fragments after Ashoka\'s death, splitting into competing regional kingdoms.', category: 'political' },
    { year: 320, title: 'Gupta Empire Golden Age', description: 'The Gupta dynasty reunifies northern India, ushering in a golden age of science, art, and literature.', category: 'cultural' },
    { year: 1526, title: 'Mughal Empire Founded', description: 'Babur defeats the Delhi Sultanate at Panipat, establishing the Mughal dynasty that will rule most of India.', category: 'war' },
  ],
  mali: [
    { year: 1235, title: 'Sundiata Founds Mali Empire', description: 'Sundiata Keita defeats the Sosso king at the Battle of Kirina, establishing the Mali Empire in West Africa.', category: 'war' },
    { year: 1337, title: 'Mansa Musa\'s Pilgrimage', description: 'Mansa Musa\'s legendary hajj to Mecca displays Mali\'s immense wealth to the world.', category: 'cultural' },
    { year: 1464, title: 'Songhai Conquest', description: 'The Songhai Empire under Sunni Ali conquers Mali\'s territories, ending its dominance in West Africa.', category: 'war' },
  ],
  vikings: [
    { year: 793, title: 'Lindisfarne Raid', description: 'The raid on Lindisfarne monastery marks the beginning of the Viking Age and Norse expansion across Europe.', category: 'war' },
    { year: 1000, title: 'Vinland Settlement', description: 'Norse explorers reach North America, establishing a short-lived settlement at L\'Anse aux Meadows.', category: 'discovery' },
    { year: 1066, title: 'End of the Viking Age', description: 'Harald Hardrada\'s defeat at Stamford Bridge marks the end of major Viking military expansion.', category: 'war' },
  ],
  aztecs: [
    { year: 1325, title: 'Tenochtitlan Founded', description: 'The Mexica people found their capital on an island in Lake Texcoco, which will become the heart of the Aztec Empire.', category: 'construction' },
    { year: 1428, title: 'Triple Alliance Formed', description: 'Tenochtitlan, Texcoco, and Tlacopan form an alliance that rapidly conquers central Mexico.', category: 'political' },
    { year: 1521, title: 'Spanish Conquest', description: 'Hernán Cortés and his indigenous allies besiege and destroy Tenochtitlan, ending the Aztec Empire.', category: 'war' },
  ],
  inca: [
    { year: 1438, title: 'Inca Expansion Begins', description: 'Pachacuti transforms the Kingdom of Cusco into the vast Inca Empire through rapid military conquest.', category: 'war' },
    { year: 1533, title: 'Spanish Conquest', description: 'Francisco Pizarro captures Emperor Atahualpa, beginning the collapse of the Inca Empire.', category: 'war' },
  ],
  japan: [
    { year: 1185, title: 'Kamakura Shogunate', description: 'The first military government is established, beginning centuries of samurai rule in Japan.', category: 'political' },
    { year: 1603, title: 'Tokugawa Unification', description: 'Tokugawa Ieyasu unifies Japan after decades of civil war, establishing 250 years of peace.', category: 'political' },
    { year: 1868, title: 'Meiji Restoration', description: 'Japan rapidly modernizes and industrializes, transforming from a feudal society into a world power.', category: 'political' },
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
