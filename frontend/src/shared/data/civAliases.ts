/**
 * Civilization alias mapping — maps canonical IDs to all NAME variants
 * found across the 53 GeoJSON boundary files (-10000 to 2010).
 * Names extracted by scanning every feature in every file.
 */

export interface CivAlias {
  displayName: string;
  color: string;
  center: { lat: number; lng: number };
  aliases: string[];
}

export const CIV_ALIASES: Record<string, CivAlias> = {
  rome: {
    displayName: 'Rome',
    color: '#b85454',
    center: { lat: 41.9, lng: 12.5 },
    aliases: [
      'Rome', 'Roman Republic', 'Roman Empire',
      'Rome (Constantinus)', 'Rome (Maximian)',
      'Rome (Galerius)', 'Rome (Diocletianus)',
      'Western Roman Empire',
    ],
  },
  byzantium: {
    displayName: 'Byzantine Empire',
    color: '#8b6faa',
    center: { lat: 41.0, lng: 29.0 },
    aliases: ['Byzantine Empire', 'Eastern Roman Empire'],
  },
  hre: {
    displayName: 'Holy Roman Empire',
    color: '#9a7b5a',
    center: { lat: 50.1, lng: 10.5 },
    aliases: ['Holy Roman Empire'],
  },
  persia: {
    displayName: 'Persia',
    color: '#c49a44',
    center: { lat: 32.4, lng: 53.7 },
    aliases: [
      'Achaemenid Empire', 'Parthian Empire',
      'Sasanian Empire', 'Sasanian dependencies',
      'Safavid Empire', 'Persia', 'Iran',
    ],
  },
  china: {
    displayName: 'China',
    color: '#6d9476',
    center: { lat: 35.0, lng: 105.0 },
    aliases: [
      'Zhou states', 'Han', 'Han Empire', 'Han Zhao',
      'Sui Empire', 'Tang Empire', 'Song Empire',
      'Ming Empire', 'Ming Chinese Empire', 'Post-Ming Warlords',
      'Qing Empire', 'China',
    ],
  },
  greece: {
    displayName: 'Greece',
    color: '#5a8fa5',
    center: { lat: 38.0, lng: 23.7 },
    aliases: [
      'Greek city-states', 'Greek colonies',
      'Macedon and Hellenic League', 'Macedonia',
      'Greece',
    ],
  },
  egypt: {
    displayName: 'Egypt',
    color: '#c4944a',
    center: { lat: 30.0, lng: 31.2 },
    aliases: ['Egypt', 'Ptolemaic Kingdom'],
  },
  mongolia: {
    displayName: 'Mongol Empire',
    color: '#b85454',
    center: { lat: 47.9, lng: 106.9 },
    aliases: [
      'Mongols', 'Mongol Empire', 'Mongolia',
      'Chagatai Khanate', 'Ilkhanate',
      'Khanate of the Golden Horde', 'Golden Horde',
      'Great Khanate',
    ],
  },
  ottoman: {
    displayName: 'Ottoman Empire',
    color: '#c49a44',
    center: { lat: 39.9, lng: 32.9 },
    aliases: ['Ottoman Empire', 'Ottoman Sultanate', 'Turkey'],
  },
  arab_caliphates: {
    displayName: 'Arab Caliphates',
    color: '#d4a054',
    center: { lat: 33.3, lng: 44.4 },
    aliases: [
      'Umayyad Caliphate', 'Abbasid Caliphate',
      'Fatimid Caliphate', 'Caliphate of Córdoba',
      'Idrisid Caliphate', 'Almohad Caliphate',
      'Seljuk Caliphate', 'Seljuk Empire',
      'Hafsid Caliphate', 'Wattasid Caliphate',
      'Zayyanid Caliphate', 'Sokoto Caliphate',
      'Tukular Caliphate',
    ],
  },
  britain: {
    displayName: 'British Empire',
    color: '#b85454',
    center: { lat: 51.5, lng: -0.1 },
    aliases: [
      'England', 'England and Ireland',
      'United Kingdom',
      'United Kingdom of Great Britain and Ireland',
      'British American colonies', 'British Guiana',
      'British East India Company', 'British Raj',
      'British East Africa', 'British Somaliland',
      'British Protectorate',
    ],
  },
  france: {
    displayName: 'France',
    color: '#5a7fb5',
    center: { lat: 46.6, lng: 2.2 },
    aliases: [
      'West Francia', 'East Francia',
      'Kingdom of France', 'France', 'New France',
    ],
  },
  spain: {
    displayName: 'Spain',
    color: '#c49a44',
    center: { lat: 40.4, lng: -3.7 },
    aliases: [
      'Castilla', 'Castille', 'Spain',
      'Vice Royalty of New Spain', 'Vice-Royalty of New Spain',
    ],
  },
  india: {
    displayName: 'Indian Kingdoms',
    color: '#8b80b0',
    center: { lat: 22.0, lng: 78.0 },
    aliases: [
      'Hindu kingdoms', 'Hindu Kingdoms',
      'Hindu kingdoms and republics', 'Hindu states',
      'Mauryan Empire', 'Gupta Empire',
      'Chola state', 'Chola', 'Cholas',
      'Sultanate of Delhi', 'Mughal Empire',
      'Rajput Kingdoms', 'Rajput kingdoms',
      'India',
      'minor Hindu and Buddhist states',
      'minor Hindu & Buddhist states',
      'minor Hindu and Buddhist kingdoms',
      'minor Hindu kingdoms',
      'minor states under Indian influence',
    ],
  },
  japan: {
    displayName: 'Japan',
    color: '#5a9aaa',
    center: { lat: 35.7, lng: 139.7 },
    aliases: [
      'Yamato', 'Imperial Japan (Fujiwara)',
      'Shogun Japan (Kamakura)', 'Japan',
      'Japan (Warring States)', 'Tokugawa Shogunate',
      'Tokugawa shogunate', 'Imperial Japan',
      'Empire of Japan',
    ],
  },
  maya: {
    displayName: 'Maya',
    color: '#7a9e5a',
    center: { lat: 19.7, lng: -89.6 },
    aliases: [
      'Maya', 'Mayas', 'Maya chiefdoms and states',
      'Maya city-states', 'Maya states',
    ],
  },
  carthage: {
    displayName: 'Carthage',
    color: '#b87a60',
    center: { lat: 36.8, lng: 10.2 },
    aliases: ['Carthaginian Empire'],
  },
  mali: {
    displayName: 'Mali Empire',
    color: '#c4944a',
    center: { lat: 16.8, lng: -3.0 },
    aliases: ['Mali', 'Empire of Ghana', 'Ghana'],
  },
  songhai: {
    displayName: 'Songhai Empire',
    color: '#b87a60',
    center: { lat: 14.0, lng: 2.1 },
    aliases: ['Songhai'],
  },
  meroe: {
    displayName: 'Meroe / Kush',
    color: '#c4944a',
    center: { lat: 16.9, lng: 33.7 },
    aliases: ['Meroe', 'Axum'],
  },
};

/** Build a Set of all aliases for O(1) matching in polygon render loops */
export function buildAliasSet(civId: string): Set<string> {
  const civ = CIV_ALIASES[civId];
  if (!civ) return new Set();
  return new Set(civ.aliases);
}

/** Find the canonical civ ID for a given display name */
export function findCivIdByName(name: string): string | null {
  for (const [id, civ] of Object.entries(CIV_ALIASES)) {
    if (civ.displayName === name || civ.aliases.includes(name)) return id;
  }
  return null;
}
