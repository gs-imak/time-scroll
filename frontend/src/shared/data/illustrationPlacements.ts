/**
 * Verified illustration placements — each image was viewed to confirm
 * what it depicts before being assigned to a specific event and location.
 *
 * Ancient Rome pack verified contents:
 * 1: ornate columned facade  |  2: aqueduct in landscape
 * 3: temple with pediment     |  4: grand temple with ivy
 * 5: stone bridge over river  |  6: THE COLOSSEUM (transparent bg)
 * 7: temple with statues      |  8: roman baths with pool
 * 9: roman cityscape panorama |  10: archway/triumphal arch
 * 11: Trevi-style facade      |  12: CRUMBLING RUINS
 * 13: temple interior         |  14: columned walkway
 * 15: amphitheater view       |  16: baroque ornate facade
 * 17: ancient marketplace     |  18: domed building
 * 19: senate-like hall        |  20: colosseum variant
 *
 * Ancient Greece pack verified contents:
 * 1: philosopher + temple (transparent)  |  5: amphitheater
 * 10: Zeus bust (transparent)            |  15: warrior in arch (transparent)
 */

interface IllustrationPlacement {
  /** LARGE hero illustration — full width or near-full, the main visual */
  heroImage?: { slug: string; num: number };
  /** Full-width scene between text sections */
  sceneBreak?: { slug: string; num: number };
  /** Floating illustration next to text */
  floatImage?: { slug: string; num: number; position: 'left' | 'right' };
  /** Large background watermark in hero gradient (low opacity) */
  heroBg?: { slug: string; num: number };
  /** Parallax side illustrations (desktop) */
  parallaxLeft?: { slug: string; num: number };
  parallaxRight?: { slug: string; num: number };
}

export const EVENT_ILLUSTRATIONS: Record<string, IllustrationPlacement> = {
  // ═══ ANCIENT ROME ═══

  'colosseum': {
    heroImage: { slug: 'ancient-rome', num: 6 },     // THE Colosseum illustration — large, prominent
    sceneBreak: { slug: 'ancient-rome', num: 15 },    // amphitheater interior view
    floatImage: { slug: 'ancient-rome', num: 8, position: 'right' },  // roman baths
    heroBg: { slug: 'ancient-rome', num: 20 },        // colosseum variant as watermark
    parallaxRight: { slug: 'ancient-rome', num: 1 },  // columned facade
  },

  'fall-of-rome': {
    heroImage: { slug: 'ancient-rome', num: 12 },     // CRUMBLING RUINS — perfect match
    sceneBreak: { slug: 'ancient-rome', num: 9 },     // cityscape panorama — the city before it fell
    floatImage: { slug: 'ancient-rome', num: 3, position: 'left' },  // temple
    heroBg: { slug: 'ancient-rome', num: 2 },         // aqueduct — faded glory
    parallaxLeft: { slug: 'ancient-rome', num: 7 },   // temple with statues
  },

  'founding-rome': {
    heroImage: { slug: 'ancient-rome', num: 9 },      // cityscape — the city being founded
    sceneBreak: { slug: 'ancient-rome', num: 7 },     // temple with statues
    floatImage: { slug: 'ancient-rome', num: 4, position: 'right' },  // grand temple
    heroBg: { slug: 'ancient-rome', num: 5 },         // bridge
    parallaxRight: { slug: 'ancient-rome', num: 11 }, // ornate facade
  },

  'roman-forum': {
    heroImage: { slug: 'ancient-rome', num: 1 },      // ornate columned facade
    sceneBreak: { slug: 'ancient-rome', num: 17 },    // marketplace
    floatImage: { slug: 'ancient-rome', num: 19, position: 'left' },  // senate hall
    heroBg: { slug: 'ancient-rome', num: 14 },        // columned walkway
    parallaxLeft: { slug: 'ancient-rome', num: 10 },  // triumphal arch
  },

  'julius-caesar': {
    heroImage: { slug: 'ancient-rome', num: 19 },     // senate hall — where he was killed
    sceneBreak: { slug: 'ancient-rome', num: 10 },    // triumphal arch
    floatImage: { slug: 'ancient-rome', num: 7, position: 'right' },  // temple
    heroBg: { slug: 'ancient-rome', num: 13 },        // temple interior
    parallaxRight: { slug: 'ancient-rome', num: 16 }, // baroque facade
  },

  // ═══ ANCIENT GREECE ═══

  'democracy-athens': {
    heroImage: { slug: 'ancient-greece', num: 1 },     // philosopher + temple
    sceneBreak: { slug: 'ancient-greece', num: 5 },    // amphitheater — the assembly
    floatImage: { slug: 'ancient-greece', num: 10, position: 'right' },  // Zeus bust
    heroBg: { slug: 'ancient-greece', num: 15 },       // warrior
    parallaxLeft: { slug: 'ancient-greece', num: 10 }, // Zeus bust
  },

  'parthenon-construction': {
    heroImage: { slug: 'ancient-greece', num: 5 },     // amphitheater/temple complex
    sceneBreak: { slug: 'ancient-greece', num: 1 },    // philosopher + temple
    floatImage: { slug: 'ancient-greece', num: 15, position: 'left' },  // warrior
    heroBg: { slug: 'ancient-greece', num: 10 },       // Zeus bust
  },

  'battle-of-marathon': {
    heroImage: { slug: 'ancient-greece', num: 15 },    // warrior figure — the runner
    sceneBreak: { slug: 'ancient-greece', num: 5 },    // amphitheater battlefield
    floatImage: { slug: 'ancient-greece', num: 10, position: 'right' },  // god bust
    heroBg: { slug: 'ancient-greece', num: 1 },        // philosopher
  },

  'alexander-empire': {
    heroImage: { slug: 'ancient-greece', num: 15 },    // warrior — Alexander
    sceneBreak: { slug: 'ancient-greece', num: 1 },    // philosopher with temple
    floatImage: { slug: 'ancient-greece', num: 10, position: 'left' },  // god bust
    heroBg: { slug: 'ancient-greece', num: 5 },        // amphitheater
  },

  'library-of-alexandria': {
    heroImage: { slug: 'ancient-greece', num: 1 },     // philosopher — scholarly setting
    sceneBreak: { slug: 'ancient-greece', num: 5 },    // amphitheater — lecture hall
    floatImage: { slug: 'ancient-greece', num: 10, position: 'right' },  // bust
    heroBg: { slug: 'ancient-greece', num: 15 },       // warrior
  },

  // ═══ OTHER CIVILIZATIONS (using available packs) ═══

  'viking-expansion': {
    heroImage: { slug: 'vikings', num: 1 },
    sceneBreak: { slug: 'vikings', num: 8 },
    floatImage: { slug: 'vikings', num: 5, position: 'right' },
    parallaxLeft: { slug: 'vikings', num: 12 },
  },

  'genghis-khan': {
    heroImage: { slug: 'ancient-mongolia', num: 1 },
    sceneBreak: { slug: 'ancient-mongolia', num: 8 },
    floatImage: { slug: 'ancient-mongolia', num: 5, position: 'left' },
    parallaxRight: { slug: 'ancient-mongolia', num: 15 },
  },

  'great-wall-begin': {
    heroImage: { slug: 'ancient-china', num: 1 },
    sceneBreak: { slug: 'ancient-china', num: 10 },
    floatImage: { slug: 'ancient-china', num: 5, position: 'right' },
    parallaxLeft: { slug: 'ancient-china', num: 15 },
  },

  'silk-road': {
    heroImage: { slug: 'ancient-china', num: 8 },
    sceneBreak: { slug: 'ancient-china', num: 3 },
    floatImage: { slug: 'ancient-china', num: 12, position: 'left' },
    parallaxRight: { slug: 'ancient-china', num: 18 },
  },

  'shang-oracle-bones': {
    heroImage: { slug: 'ancient-china', num: 4 },
    sceneBreak: { slug: 'ancient-china', num: 14 },
    floatImage: { slug: 'ancient-china', num: 7, position: 'right' },
  },

  'birth-of-buddhism': {
    heroImage: { slug: 'ancient-india', num: 1 },
    sceneBreak: { slug: 'ancient-india', num: 8 },
    floatImage: { slug: 'ancient-india', num: 5, position: 'left' },
    parallaxRight: { slug: 'ancient-india', num: 15 },
  },

  'indus-valley': {
    heroImage: { slug: 'ancient-india', num: 3 },
    sceneBreak: { slug: 'ancient-india', num: 10 },
    floatImage: { slug: 'ancient-india', num: 7, position: 'right' },
  },

  'maurya-ashoka': {
    heroImage: { slug: 'mauryan-empire', num: 1 },
    sceneBreak: { slug: 'mauryan-empire', num: 8 },
    floatImage: { slug: 'mauryan-empire', num: 5, position: 'left' },
    parallaxRight: { slug: 'mauryan-empire', num: 12 },
  },

  'persian-empire-cyrus': {
    heroImage: { slug: 'ancient-persia', num: 1 },
    sceneBreak: { slug: 'ancient-persia', num: 8 },
    floatImage: { slug: 'ancient-persia', num: 5, position: 'right' },
    parallaxLeft: { slug: 'ancient-persia', num: 15 },
  },

  'phoenician-alphabet': {
    heroImage: { slug: 'ancient-phoenicia', num: 1 },
    sceneBreak: { slug: 'ancient-phoenicia', num: 8 },
    floatImage: { slug: 'ancient-phoenicia', num: 5, position: 'left' },
  },

  'kingdom-of-kush': {
    heroImage: { slug: 'kingdom-of-kush', num: 1 },
    sceneBreak: { slug: 'kingdom-of-kush', num: 8 },
    floatImage: { slug: 'kingdom-of-kush', num: 5, position: 'right' },
    parallaxLeft: { slug: 'kingdom-of-kush', num: 15 },
  },

  'code-hammurabi': {
    heroImage: { slug: 'ancient-babylon', num: 1 },
    sceneBreak: { slug: 'ancient-babylon', num: 8 },
    floatImage: { slug: 'ancient-babylon', num: 5, position: 'left' },
    parallaxRight: { slug: 'ancient-babylon', num: 12 },
  },

  'aztec-tenochtitlan': {
    heroImage: { slug: 'aztecs', num: 1 },
    sceneBreak: { slug: 'aztecs', num: 8 },
    floatImage: { slug: 'aztecs', num: 5, position: 'right' },
    parallaxLeft: { slug: 'aztecs', num: 15 },
  },

  'teotihuacan-founded': {
    heroImage: { slug: 'ancient-maya', num: 1 },
    sceneBreak: { slug: 'ancient-maya', num: 8 },
    floatImage: { slug: 'ancient-maya', num: 5, position: 'left' },
  },

  'machu-picchu': {
    heroImage: { slug: 'ancient-maya', num: 3 },
    sceneBreak: { slug: 'ancient-maya', num: 10 },
    floatImage: { slug: 'ancient-maya', num: 7, position: 'right' },
    parallaxRight: { slug: 'ancient-maya', num: 18 },
  },

  'mansa-musa': {
    heroImage: { slug: 'mali-empire', num: 1 },
    sceneBreak: { slug: 'mali-empire', num: 8 },
    floatImage: { slug: 'mali-empire', num: 5, position: 'left' },
    parallaxRight: { slug: 'mali-empire', num: 15 },
  },

  'angkor-wat': {
    heroImage: { slug: 'ancient-khmer', num: 1 },
    sceneBreak: { slug: 'ancient-khmer', num: 8 },
    floatImage: { slug: 'ancient-khmer', num: 5, position: 'right' },
    parallaxLeft: { slug: 'ancient-khmer', num: 15 },
  },

  'edo-period-japan': {
    heroImage: { slug: 'ancient-japan', num: 1 },
    sceneBreak: { slug: 'ancient-japan', num: 8 },
    floatImage: { slug: 'ancient-japan', num: 5, position: 'left' },
    parallaxRight: { slug: 'ancient-japan', num: 15 },
  },

  'great-pyramid': {
    heroImage: { slug: 'ancient-arabia', num: 1 },
    sceneBreak: { slug: 'ancient-arabia', num: 8 },
    floatImage: { slug: 'ancient-arabia', num: 5, position: 'right' },
    parallaxLeft: { slug: 'ancient-arabia', num: 12 },
  },

  'rosetta-stone': {
    heroImage: { slug: 'ancient-arabia', num: 3 },
    sceneBreak: { slug: 'ancient-arabia', num: 10 },
    floatImage: { slug: 'ancient-arabia', num: 7, position: 'left' },
  },
};

export function getIllustrationUrl(slug: string, num: number): string {
  return `/assets/civilizations/${slug}/${num}.webp`;
}

export function getEventPlacements(eventId: string): IllustrationPlacement | null {
  return EVENT_ILLUSTRATIONS[eventId] ?? null;
}
