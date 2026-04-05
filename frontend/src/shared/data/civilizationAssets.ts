/**
 * Maps event IDs to civilization illustration packs.
 * Illustrations are used throughout the app:
 * - Event story hero background
 * - Gallery sections with curated selections
 * - Quiz question backgrounds
 * - Journey transition visuals
 * - Parallax side decorations
 * - Dashboard and timeline card thumbnails
 *
 * Images at /assets/civilizations/{slug}/{n}.png
 */

interface CivilizationPack {
  slug: string;
  name: string;
  totalImages: number;
  /** Primary illustration for event hero */
  hero: number;
  /** 6-8 illustrations for gallery (fashion, architecture, pottery, etc.) */
  gallery: number[];
  /** Illustration for parallax side accent */
  accent: number;
  /** Background illustration for quiz section */
  quizBg: number;
  /** Illustrations for journey transitions */
  journeyImages: number[];
  /** Small thumbnail for cards/timeline */
  thumbnail: number;
  /** Map center */
  center: { lat: number; lng: number };
}

const EGYPT: Omit<CivilizationPack, 'hero' | 'gallery' | 'accent' | 'quizBg' | 'journeyImages' | 'thumbnail'> = {
  slug: 'ancient-egypt', name: 'Ancient Egypt', totalImages: 542,
  center: { lat: 29.97, lng: 31.13 },
};

const GREECE: typeof EGYPT = {
  slug: 'ancient-greece', name: 'Ancient Greece', totalImages: 109,
  center: { lat: 37.98, lng: 23.72 },
};

const ROME: typeof EGYPT = {
  slug: 'ancient-rome', name: 'Ancient Rome', totalImages: 142,
  center: { lat: 41.90, lng: 12.49 },
};

const PERSIA: typeof EGYPT = {
  slug: 'ancient-persia', name: 'Ancient Persia', totalImages: 126,
  center: { lat: 30.06, lng: 53.16 },
};

const INDIA: typeof EGYPT = {
  slug: 'ancient-india', name: 'Ancient India', totalImages: 151,
  center: { lat: 25.62, lng: 85.14 },
};

const CHINA: typeof EGYPT = {
  slug: 'ancient-china', name: 'Ancient China', totalImages: 141,
  center: { lat: 34.26, lng: 108.95 },
};

const VIKINGS_PACK: typeof EGYPT = {
  slug: 'vikings', name: 'Vikings', totalImages: 54,
  center: { lat: 55.66, lng: -1.78 },
};

const AZTECS_PACK: typeof EGYPT = {
  slug: 'aztecs', name: 'Aztecs', totalImages: 151,
  center: { lat: 19.43, lng: -99.13 },
};

const MAYA: typeof EGYPT = {
  slug: 'ancient-maya', name: 'Ancient Maya', totalImages: 128,
  center: { lat: 19.69, lng: -98.84 },
};

const KUSH: typeof EGYPT = {
  slug: 'kingdom-of-kush', name: 'Kingdom of Kush', totalImages: 173,
  center: { lat: 16.93, lng: 33.74 },
};

const PHOENICIA: typeof EGYPT = {
  slug: 'ancient-phoenicia', name: 'Ancient Phoenicia', totalImages: 145,
  center: { lat: 34.12, lng: 35.65 },
};

const JAPAN: typeof EGYPT = {
  slug: 'ancient-japan', name: 'Ancient Japan', totalImages: 141,
  center: { lat: 35.67, lng: 139.65 },
};

const INCA: typeof EGYPT = {
  slug: 'inca-empire', name: 'Inca Empire', totalImages: 257,
  center: { lat: -13.16, lng: -72.54 },
};

const MALI: typeof EGYPT = {
  slug: 'mali-empire', name: 'Mali Empire', totalImages: 174,
  center: { lat: 16.77, lng: -3.00 },
};

const KHMER: typeof EGYPT = {
  slug: 'ancient-khmer', name: 'Ancient Khmer', totalImages: 157,
  center: { lat: 13.41, lng: 103.86 },
};

const MONGOLIA: typeof EGYPT = {
  slug: 'ancient-mongolia', name: 'Ancient Mongolia', totalImages: 125,
  center: { lat: 47.91, lng: 106.91 },
};

export const EVENT_CIVILIZATION: Record<string, CivilizationPack> = {
  // Egypt
  'great-pyramid': { ...EGYPT, hero: 1, gallery: [3, 7, 12, 18, 25, 33, 42, 51], accent: 60, quizBg: 70, journeyImages: [80, 90, 100], thumbnail: 5 },

  // Greece
  'democracy-athens': { ...GREECE, hero: 1, gallery: [5, 12, 20, 28, 35, 42], accent: 50, quizBg: 55, journeyImages: [60, 70, 80], thumbnail: 3 },
  'parthenon-construction': { ...GREECE, hero: 8, gallery: [15, 22, 30, 38, 45, 52], accent: 58, quizBg: 65, journeyImages: [72, 78, 85], thumbnail: 10 },
  'battle-of-marathon': { ...GREECE, hero: 14, gallery: [2, 9, 16, 24, 32], accent: 40, quizBg: 48, journeyImages: [55, 62, 68], thumbnail: 6 },
  'alexander-empire': { ...GREECE, hero: 20, gallery: [4, 11, 18, 26, 34, 41], accent: 47, quizBg: 53, journeyImages: [59, 66, 73], thumbnail: 7 },
  'library-of-alexandria': { ...GREECE, hero: 25, gallery: [3, 10, 17, 23, 31], accent: 39, quizBg: 46, journeyImages: [51, 57, 64], thumbnail: 13 },

  // Rome
  'founding-rome': { ...ROME, hero: 1, gallery: [8, 16, 24, 32, 40, 48], accent: 56, quizBg: 64, journeyImages: [72, 80, 88], thumbnail: 4 },
  'roman-forum': { ...ROME, hero: 5, gallery: [12, 20, 28, 36, 44], accent: 52, quizBg: 60, journeyImages: [68, 76, 84], thumbnail: 9 },
  'julius-caesar': { ...ROME, hero: 10, gallery: [3, 18, 26, 34, 42, 50], accent: 58, quizBg: 66, journeyImages: [74, 82, 90], thumbnail: 14 },
  'colosseum': { ...ROME, hero: 15, gallery: [7, 22, 30, 38, 46], accent: 54, quizBg: 62, journeyImages: [70, 78, 86], thumbnail: 19 },
  'fall-of-rome': { ...ROME, hero: 20, gallery: [2, 11, 28, 36, 44, 52], accent: 60, quizBg: 68, journeyImages: [76, 84, 92], thumbnail: 25 },

  // Persia
  'persian-empire-cyrus': { ...PERSIA, hero: 1, gallery: [8, 16, 24, 32, 40, 48, 56], accent: 64, quizBg: 72, journeyImages: [80, 88, 96], thumbnail: 4 },

  // India
  'indus-valley': { ...INDIA, hero: 1, gallery: [8, 16, 24, 32, 40, 48], accent: 56, quizBg: 64, journeyImages: [72, 80, 88], thumbnail: 4 },
  'birth-of-buddhism': { ...INDIA, hero: 10, gallery: [3, 18, 26, 34, 42, 50], accent: 58, quizBg: 66, journeyImages: [74, 82, 90], thumbnail: 13 },
  'maurya-ashoka': { ...INDIA, hero: 20, gallery: [5, 28, 36, 44, 52, 60], accent: 68, quizBg: 76, journeyImages: [84, 92, 100], thumbnail: 23 },

  // China
  'shang-oracle-bones': { ...CHINA, hero: 1, gallery: [8, 16, 24, 32, 40], accent: 48, quizBg: 56, journeyImages: [64, 72, 80], thumbnail: 4 },
  'great-wall-begin': { ...CHINA, hero: 10, gallery: [3, 18, 26, 34, 42, 50], accent: 58, quizBg: 66, journeyImages: [74, 82, 90], thumbnail: 13 },
  'silk-road': { ...CHINA, hero: 20, gallery: [5, 28, 36, 44, 52, 60], accent: 68, quizBg: 76, journeyImages: [84, 92, 100], thumbnail: 23 },

  // Vikings
  'viking-expansion': { ...VIKINGS_PACK, hero: 1, gallery: [5, 10, 15, 20, 25, 30], accent: 35, quizBg: 40, journeyImages: [45, 48, 50], thumbnail: 3 },

  // Aztecs
  'aztec-tenochtitlan': { ...AZTECS_PACK, hero: 1, gallery: [10, 20, 30, 40, 50, 60, 70], accent: 80, quizBg: 90, journeyImages: [100, 110, 120], thumbnail: 5 },

  // Maya
  'teotihuacan-founded': { ...MAYA, hero: 1, gallery: [8, 16, 24, 32, 40, 48], accent: 56, quizBg: 64, journeyImages: [72, 80, 88], thumbnail: 4 },

  // Kush
  'kingdom-of-kush': { ...KUSH, hero: 1, gallery: [10, 20, 30, 40, 50, 60, 70], accent: 80, quizBg: 90, journeyImages: [100, 110, 120], thumbnail: 5 },

  // Phoenicia
  'phoenician-alphabet': { ...PHOENICIA, hero: 1, gallery: [10, 20, 30, 40, 50, 60], accent: 70, quizBg: 80, journeyImages: [90, 100, 110], thumbnail: 5 },

  // Japan
  'edo-period-japan': { ...JAPAN, hero: 1, gallery: [10, 20, 30, 40, 50, 60, 70], accent: 80, quizBg: 90, journeyImages: [100, 110, 120], thumbnail: 5 },

  // Inca
  'machu-picchu': { ...INCA, hero: 1, gallery: [15, 30, 45, 60, 75, 90, 105], accent: 120, quizBg: 135, journeyImages: [150, 165, 180], thumbnail: 8 },

  // Mali
  'mansa-musa': { ...MALI, hero: 1, gallery: [10, 20, 30, 40, 50, 60, 70], accent: 80, quizBg: 90, journeyImages: [100, 110, 120], thumbnail: 5 },

  // Khmer
  'angkor-wat': { ...KHMER, hero: 1, gallery: [10, 20, 30, 40, 50, 60, 70], accent: 80, quizBg: 90, journeyImages: [100, 110, 120], thumbnail: 5 },

  // Mongolia
  'genghis-khan': { ...MONGOLIA, hero: 1, gallery: [8, 16, 24, 32, 40, 48, 56], accent: 64, quizBg: 72, journeyImages: [80, 88, 96], thumbnail: 4 },
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
    journeyImages: pack.journeyImages.map(n => getCivImageUrl(pack.slug, n)),
    thumbnail: getCivImageUrl(pack.slug, pack.thumbnail),
    center: pack.center,
  };
}

/** Get a random illustration from a civilization pack */
export function getRandomCivImage(slug: string, totalImages: number): string {
  const num = Math.floor(Math.random() * totalImages) + 1;
  return getCivImageUrl(slug, num);
}
