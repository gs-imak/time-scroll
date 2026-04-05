/**
 * Maps event IDs to civilization illustration packs.
 * Each pack has 20 WebP images at /assets/civilizations/{slug}/{1-20}.webp
 */

interface CivilizationPack {
  slug: string;
  name: string;
  totalImages: number;
  hero: number;
  gallery: number[];
  accent: number;
  quizBg: number;
  thumbnail: number;
  center: { lat: number; lng: number };
}

function pack(slug: string, name: string, total: number, lat: number, lng: number, hero: number): CivilizationPack {
  // Generate a spread of images across the available range
  const gallery = [2, 4, 6, 8, 10, 12, 14, 16].filter(n => n <= total);
  return {
    slug, name, totalImages: total,
    hero: Math.min(hero, total),
    gallery,
    accent: Math.min(18, total),
    quizBg: Math.min(19, total),
    thumbnail: Math.min(3, total),
    center: { lat, lng },
  };
}

// Ancient Egypt pack failed extraction (>2GB zip) — no webp files available
// Map to ancient-arabia as closest available pack for now
const EGYPT = pack('ancient-arabia', 'Ancient Arabia', 20, 29.97, 31.13, 1);
const GREECE = pack('ancient-greece', 'Ancient Greece', 20, 37.98, 23.72, 1);
const ROME = pack('ancient-rome', 'Ancient Rome', 20, 41.90, 12.49, 1);
const PERSIA = pack('ancient-persia', 'Ancient Persia', 20, 30.06, 53.16, 1);
const INDIA = pack('ancient-india', 'Ancient India', 20, 25.62, 85.14, 1);
const CHINA = pack('ancient-china', 'Ancient China', 20, 34.26, 108.95, 1);
const VIKINGS_P = pack('vikings', 'Vikings', 20, 55.66, -1.78, 1);
const AZTECS_P = pack('aztecs', 'Aztecs', 20, 19.43, -99.13, 1);
const MAYA = pack('ancient-maya', 'Ancient Maya', 20, 19.69, -98.84, 1);
const KUSH = pack('kingdom-of-kush', 'Kingdom of Kush', 20, 16.93, 33.74, 1);
const PHOENICIA = pack('ancient-phoenicia', 'Ancient Phoenicia', 20, 34.12, 35.65, 1);
const JAPAN = pack('ancient-japan', 'Ancient Japan', 20, 35.67, 139.65, 1);
// Inca Empire pack failed extraction (>2GB zip) — map to ancient-maya as closest
const INCA = pack('ancient-maya', 'Inca Empire', 20, -13.16, -72.54, 1);
const MALI = pack('mali-empire', 'Mali Empire', 20, 16.77, -3.00, 1);
const KHMER = pack('ancient-khmer', 'Ancient Khmer', 20, 13.41, 103.86, 1);
const MONGOLIA = pack('ancient-mongolia', 'Ancient Mongolia', 20, 47.91, 106.91, 1);
const BABYLON = pack('ancient-babylon', 'Ancient Babylon', 20, 32.54, 44.42, 1);
const MAURYA = pack('mauryan-empire', 'Mauryan Empire', 20, 25.62, 85.14, 1);

// Different hero images per event in the same civilization
export const EVENT_CIVILIZATION: Record<string, CivilizationPack> = {
  // Egypt
  'great-pyramid': { ...EGYPT, hero: 1 },

  // Greece
  'democracy-athens': { ...GREECE, hero: 1 },
  'parthenon-construction': { ...GREECE, hero: 5 },
  'battle-of-marathon': { ...GREECE, hero: 9 },
  'alexander-empire': { ...GREECE, hero: 13 },
  'library-of-alexandria': { ...GREECE, hero: 17 },

  // Rome
  'founding-rome': { ...ROME, hero: 1 },
  'roman-forum': { ...ROME, hero: 5 },
  'julius-caesar': { ...ROME, hero: 9 },
  'colosseum': { ...ROME, hero: 13 },
  'fall-of-rome': { ...ROME, hero: 17 },

  // Persia
  'persian-empire-cyrus': { ...PERSIA, hero: 1 },

  // India
  'indus-valley': { ...INDIA, hero: 1 },
  'birth-of-buddhism': { ...INDIA, hero: 7 },
  'maurya-ashoka': { ...MAURYA, hero: 1 },

  // China
  'shang-oracle-bones': { ...CHINA, hero: 1 },
  'great-wall-begin': { ...CHINA, hero: 7 },
  'silk-road': { ...CHINA, hero: 13 },

  // Vikings
  'viking-expansion': { ...VIKINGS_P, hero: 1 },

  // Aztecs
  'aztec-tenochtitlan': { ...AZTECS_P, hero: 1 },

  // Maya
  'teotihuacan-founded': { ...MAYA, hero: 1 },

  // Kush
  'kingdom-of-kush': { ...KUSH, hero: 1 },

  // Phoenicia
  'phoenician-alphabet': { ...PHOENICIA, hero: 1 },

  // Japan
  'edo-period-japan': { ...JAPAN, hero: 1 },

  // Inca
  'machu-picchu': { ...INCA, hero: 1 },

  // Mali
  'mansa-musa': { ...MALI, hero: 1 },

  // Khmer
  'angkor-wat': { ...KHMER, hero: 1 },

  // Mongolia
  'genghis-khan': { ...MONGOLIA, hero: 1 },

  // Sumer/Babylon
  'code-hammurabi': { ...BABYLON, hero: 1 },
};

/** Get image URL for a civilization illustration */
export function getCivImageUrl(slug: string, num: number): string {
  return `/assets/civilizations/${slug}/${num}.webp`;
}

/** Get all illustration data for an event */
export function getEventIllustrations(eventId: string) {
  const pack = EVENT_CIVILIZATION[eventId];
  if (!pack) return null;
  return {
    name: pack.name,
    slug: pack.slug,
    totalImages: pack.totalImages,
    hero: getCivImageUrl(pack.slug, pack.hero),
    gallery: pack.gallery.map(n => getCivImageUrl(pack.slug, n)),
    accent: getCivImageUrl(pack.slug, pack.accent),
    quizBg: getCivImageUrl(pack.slug, pack.quizBg),
    thumbnail: getCivImageUrl(pack.slug, pack.thumbnail),
    center: pack.center,
  };
}

/** Get a random illustration from a civilization pack */
export function getRandomCivImage(slug: string, totalImages: number): string {
  const num = Math.floor(Math.random() * totalImages) + 1;
  return getCivImageUrl(slug, num);
}

/** Get all available civilization packs (for index page) */
export function getAllCivilizations() {
  const seen = new Set<string>();
  const result: { slug: string; name: string; totalImages: number; center: { lat: number; lng: number }; eventCount: number }[] = [];

  for (const pack of Object.values(EVENT_CIVILIZATION)) {
    if (seen.has(pack.slug)) continue;
    seen.add(pack.slug);
    const eventCount = Object.values(EVENT_CIVILIZATION).filter(p => p.slug === pack.slug).length;
    result.push({ slug: pack.slug, name: pack.name, totalImages: pack.totalImages, center: pack.center, eventCount });
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}
