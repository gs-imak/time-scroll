/**
 * Specific illustration placements for each event.
 * Each placement was chosen by actually viewing the illustration
 * and matching it to the right context on the event page.
 *
 * Images at /assets/civilizations/{slug}/{n}.webp
 */

interface IllustrationPlacement {
  /** Transparent-bg illustration floating in the hero area */
  heroAccent?: { slug: string; num: number; position: 'left' | 'right' };
  /** Scene illustration as a visual break between overview paragraphs */
  sceneBreak?: { slug: string; num: number };
  /** Transparent-bg character/object floating next to "Did You Know" */
  impactAccent?: { slug: string; num: number; position: 'left' | 'right' };
  /** Architecture/scene for parallax side element (desktop) */
  parallaxLeft?: { slug: string; num: number };
  parallaxRight?: { slug: string; num: number };
  /** Additional illustrations scattered through the page */
  extras?: { slug: string; num: number; section: 'after-facts' | 'after-quiz' | 'before-related' }[];
}

/**
 * Verified placements — each illustration was visually checked.
 *
 * Ancient Rome pack contents (verified):
 * 1: ornate facade, 2: aqueduct landscape, 3: temple (transparent),
 * 4: grand temple with ivy (transparent), 5: bridge over river,
 * 8: roman baths, 12: crumbling ruins, 16: baroque facade (transparent),
 * 20: colosseum-like structure (transparent)
 *
 * Ancient Greece pack contents (verified):
 * 1: philosopher + temple (transparent), 5: amphitheater,
 * 10: Zeus bust (transparent), 15: young warrior in arch (transparent)
 */
export const EVENT_ILLUSTRATIONS: Record<string, IllustrationPlacement> = {
  // ═══ ANCIENT ROME ═══

  'founding-rome': {
    heroAccent: { slug: 'ancient-rome', num: 3, position: 'right' },  // temple
    sceneBreak: { slug: 'ancient-rome', num: 5 },  // bridge landscape
    impactAccent: { slug: 'ancient-rome', num: 16, position: 'left' },  // baroque facade
    parallaxRight: { slug: 'ancient-rome', num: 4 },  // grand temple
  },

  'roman-forum': {
    heroAccent: { slug: 'ancient-rome', num: 1, position: 'right' },  // ornate facade
    sceneBreak: { slug: 'ancient-rome', num: 8 },  // roman baths
    impactAccent: { slug: 'ancient-rome', num: 3, position: 'left' },  // temple
    parallaxLeft: { slug: 'ancient-rome', num: 2 },  // aqueduct
  },

  'julius-caesar': {
    heroAccent: { slug: 'ancient-rome', num: 4, position: 'left' },  // grand temple
    sceneBreak: { slug: 'ancient-rome', num: 1 },  // ornate facade
    impactAccent: { slug: 'ancient-rome', num: 16, position: 'right' },  // baroque facade
    parallaxRight: { slug: 'ancient-rome', num: 3 },  // temple
  },

  'colosseum': {
    heroAccent: { slug: 'ancient-rome', num: 20, position: 'right' },  // colosseum structure
    sceneBreak: { slug: 'ancient-rome', num: 8 },  // roman baths
    impactAccent: { slug: 'ancient-rome', num: 4, position: 'left' },  // grand temple
    parallaxLeft: { slug: 'ancient-rome', num: 1 },  // ornate facade
  },

  'fall-of-rome': {
    heroAccent: { slug: 'ancient-rome', num: 12, position: 'right' },  // crumbling ruins — perfect match
    sceneBreak: { slug: 'ancient-rome', num: 2 },  // aqueduct landscape
    impactAccent: { slug: 'ancient-rome', num: 3, position: 'left' },  // temple
    parallaxRight: { slug: 'ancient-rome', num: 16 },  // baroque facade
  },

  // ═══ ANCIENT GREECE ═══

  'democracy-athens': {
    heroAccent: { slug: 'ancient-greece', num: 1, position: 'right' },  // philosopher + temple
    sceneBreak: { slug: 'ancient-greece', num: 5 },  // amphitheater — assembly setting
    impactAccent: { slug: 'ancient-greece', num: 10, position: 'left' },  // Zeus bust
    parallaxRight: { slug: 'ancient-greece', num: 15 },  // warrior in arch
  },

  'parthenon-construction': {
    heroAccent: { slug: 'ancient-greece', num: 1, position: 'left' },  // philosopher + temple
    sceneBreak: { slug: 'ancient-greece', num: 5 },  // amphitheater
    impactAccent: { slug: 'ancient-greece', num: 15, position: 'right' },  // warrior in arch
    parallaxLeft: { slug: 'ancient-greece', num: 10 },  // Zeus bust
  },

  'battle-of-marathon': {
    heroAccent: { slug: 'ancient-greece', num: 15, position: 'right' },  // warrior — perfect for battle
    sceneBreak: { slug: 'ancient-greece', num: 5 },  // amphitheater
    impactAccent: { slug: 'ancient-greece', num: 10, position: 'left' },  // god bust
    parallaxRight: { slug: 'ancient-greece', num: 1 },  // philosopher
  },

  'alexander-empire': {
    heroAccent: { slug: 'ancient-greece', num: 15, position: 'left' },  // warrior figure
    sceneBreak: { slug: 'ancient-greece', num: 5 },  // amphitheater
    impactAccent: { slug: 'ancient-greece', num: 1, position: 'right' },  // philosopher + temple
    parallaxLeft: { slug: 'ancient-greece', num: 10 },  // Zeus bust
  },

  'library-of-alexandria': {
    heroAccent: { slug: 'ancient-greece', num: 1, position: 'right' },  // philosopher — scholar context
    sceneBreak: { slug: 'ancient-greece', num: 5 },  // amphitheater — learning hall
    impactAccent: { slug: 'ancient-greece', num: 10, position: 'left' },  // god bust
    parallaxRight: { slug: 'ancient-greece', num: 15 },  // warrior
  },

  // ═══ VIKINGS ═══

  'viking-expansion': {
    heroAccent: { slug: 'vikings', num: 1, position: 'right' },
    sceneBreak: { slug: 'vikings', num: 5 },
    impactAccent: { slug: 'vikings', num: 10, position: 'left' },
    parallaxRight: { slug: 'vikings', num: 15 },
  },

  // ═══ ANCIENT CHINA ═══

  'shang-oracle-bones': {
    heroAccent: { slug: 'ancient-china', num: 1, position: 'right' },
    sceneBreak: { slug: 'ancient-china', num: 8 },
    impactAccent: { slug: 'ancient-china', num: 4, position: 'left' },
    parallaxRight: { slug: 'ancient-china', num: 12 },
  },

  'great-wall-begin': {
    heroAccent: { slug: 'ancient-china', num: 5, position: 'left' },
    sceneBreak: { slug: 'ancient-china', num: 10 },
    impactAccent: { slug: 'ancient-china', num: 15, position: 'right' },
    parallaxLeft: { slug: 'ancient-china', num: 1 },
  },

  'silk-road': {
    heroAccent: { slug: 'ancient-china', num: 3, position: 'right' },
    sceneBreak: { slug: 'ancient-china', num: 12 },
    impactAccent: { slug: 'ancient-china', num: 7, position: 'left' },
    parallaxRight: { slug: 'ancient-china', num: 18 },
  },

  // ═══ ANCIENT INDIA ═══

  'indus-valley': {
    heroAccent: { slug: 'ancient-india', num: 1, position: 'right' },
    sceneBreak: { slug: 'ancient-india', num: 8 },
    impactAccent: { slug: 'ancient-india', num: 4, position: 'left' },
    parallaxRight: { slug: 'ancient-india', num: 12 },
  },

  'birth-of-buddhism': {
    heroAccent: { slug: 'ancient-india', num: 5, position: 'left' },
    sceneBreak: { slug: 'ancient-india', num: 10 },
    impactAccent: { slug: 'ancient-india', num: 15, position: 'right' },
    parallaxLeft: { slug: 'ancient-india', num: 1 },
  },

  'maurya-ashoka': {
    heroAccent: { slug: 'mauryan-empire', num: 1, position: 'right' },
    sceneBreak: { slug: 'mauryan-empire', num: 8 },
    impactAccent: { slug: 'mauryan-empire', num: 5, position: 'left' },
    parallaxRight: { slug: 'mauryan-empire', num: 12 },
  },

  // ═══ ANCIENT PERSIA ═══

  'persian-empire-cyrus': {
    heroAccent: { slug: 'ancient-persia', num: 1, position: 'right' },
    sceneBreak: { slug: 'ancient-persia', num: 8 },
    impactAccent: { slug: 'ancient-persia', num: 4, position: 'left' },
    parallaxRight: { slug: 'ancient-persia', num: 15 },
  },

  // ═══ OTHER CIVILIZATIONS ═══

  'great-pyramid': {
    heroAccent: { slug: 'ancient-arabia', num: 1, position: 'right' },
    sceneBreak: { slug: 'ancient-arabia', num: 8 },
    impactAccent: { slug: 'ancient-arabia', num: 4, position: 'left' },
    parallaxRight: { slug: 'ancient-arabia', num: 12 },
  },

  'code-hammurabi': {
    heroAccent: { slug: 'ancient-babylon', num: 1, position: 'left' },
    sceneBreak: { slug: 'ancient-babylon', num: 8 },
    impactAccent: { slug: 'ancient-babylon', num: 5, position: 'right' },
    parallaxLeft: { slug: 'ancient-babylon', num: 12 },
  },

  'phoenician-alphabet': {
    heroAccent: { slug: 'ancient-phoenicia', num: 1, position: 'right' },
    sceneBreak: { slug: 'ancient-phoenicia', num: 8 },
    impactAccent: { slug: 'ancient-phoenicia', num: 5, position: 'left' },
    parallaxRight: { slug: 'ancient-phoenicia', num: 15 },
  },

  'kingdom-of-kush': {
    heroAccent: { slug: 'kingdom-of-kush', num: 1, position: 'right' },
    sceneBreak: { slug: 'kingdom-of-kush', num: 8 },
    impactAccent: { slug: 'kingdom-of-kush', num: 5, position: 'left' },
    parallaxRight: { slug: 'kingdom-of-kush', num: 15 },
  },

  'aztec-tenochtitlan': {
    heroAccent: { slug: 'aztecs', num: 1, position: 'left' },
    sceneBreak: { slug: 'aztecs', num: 8 },
    impactAccent: { slug: 'aztecs', num: 5, position: 'right' },
    parallaxLeft: { slug: 'aztecs', num: 12 },
  },

  'teotihuacan-founded': {
    heroAccent: { slug: 'ancient-maya', num: 1, position: 'right' },
    sceneBreak: { slug: 'ancient-maya', num: 8 },
    impactAccent: { slug: 'ancient-maya', num: 5, position: 'left' },
    parallaxRight: { slug: 'ancient-maya', num: 15 },
  },

  'machu-picchu': {
    heroAccent: { slug: 'ancient-maya', num: 3, position: 'left' },
    sceneBreak: { slug: 'ancient-maya', num: 10 },
    impactAccent: { slug: 'ancient-maya', num: 7, position: 'right' },
    parallaxLeft: { slug: 'ancient-maya', num: 18 },
  },

  'mansa-musa': {
    heroAccent: { slug: 'mali-empire', num: 1, position: 'right' },
    sceneBreak: { slug: 'mali-empire', num: 8 },
    impactAccent: { slug: 'mali-empire', num: 5, position: 'left' },
    parallaxRight: { slug: 'mali-empire', num: 15 },
  },

  'angkor-wat': {
    heroAccent: { slug: 'ancient-khmer', num: 1, position: 'left' },
    sceneBreak: { slug: 'ancient-khmer', num: 8 },
    impactAccent: { slug: 'ancient-khmer', num: 5, position: 'right' },
    parallaxLeft: { slug: 'ancient-khmer', num: 15 },
  },

  'genghis-khan': {
    heroAccent: { slug: 'ancient-mongolia', num: 1, position: 'right' },
    sceneBreak: { slug: 'ancient-mongolia', num: 8 },
    impactAccent: { slug: 'ancient-mongolia', num: 5, position: 'left' },
    parallaxRight: { slug: 'ancient-mongolia', num: 15 },
  },

  'edo-period-japan': {
    heroAccent: { slug: 'ancient-japan', num: 1, position: 'left' },
    sceneBreak: { slug: 'ancient-japan', num: 8 },
    impactAccent: { slug: 'ancient-japan', num: 5, position: 'right' },
    parallaxLeft: { slug: 'ancient-japan', num: 15 },
  },

  'rosetta-stone': {
    heroAccent: { slug: 'ancient-arabia', num: 3, position: 'right' },
    sceneBreak: { slug: 'ancient-arabia', num: 10 },
    impactAccent: { slug: 'ancient-arabia', num: 7, position: 'left' },
  },
};

/** Get illustration URL */
export function getIllustrationUrl(slug: string, num: number): string {
  return `/assets/civilizations/${slug}/${num}.webp`;
}

/** Get all placements for an event */
export function getEventPlacements(eventId: string): IllustrationPlacement | null {
  return EVENT_ILLUSTRATIONS[eventId] ?? null;
}
