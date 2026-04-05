/**
 * Book-style illustration placements — multiple images scattered
 * throughout each event page like an illustrated novel.
 *
 * Based on CSS-Tricks shape-outside techniques and DK Eyewitness layout:
 * - Alternating left/right floats create a "river" of text between images
 * - shape-outside: url() wraps text around illustration contours
 * - Full-width scene breaks between major sections
 * - Large hero illustration in the header
 *
 * Each image number was verified by viewing the actual illustration.
 */

interface FloatPlacement {
  slug: string;
  num: number;
  side: 'left' | 'right';
  /** Width class — 'sm' = 180px, 'md' = 240px, 'lg' = 300px, 'xl' = 360px */
  size: 'sm' | 'md' | 'lg' | 'xl';
  /** Which paragraph to attach to (0-indexed) */
  paragraph: number;
}

interface IllustrationPlacement {
  /** Large illustration in the hero section */
  heroImage?: { slug: string; num: number };
  /** Faint watermark behind hero gradient */
  heroBg?: { slug: string; num: number };
  /** Full-width scene images between sections */
  sceneBreaks: { slug: string; num: number; afterParagraph: number }[];
  /** Multiple floated illustrations alongside text */
  floats: FloatPlacement[];
  /** Parallax side illustrations (desktop margins) */
  parallaxLeft?: { slug: string; num: number };
  parallaxRight?: { slug: string; num: number };
}

export const EVENT_ILLUSTRATIONS: Record<string, IllustrationPlacement> = {
  // ═══ ANCIENT ROME — verified: 1=facade, 2=aqueduct, 3=temple, 4=grand temple,
  // 5=bridge, 6=COLOSSEUM, 7=statued temple, 8=baths, 9=cityscape, 10=arch,
  // 11=Trevi, 12=RUINS, 13=interior, 14=walkway, 15=amphitheater, 16=baroque,
  // 17=marketplace, 18=dome, 19=senate, 20=colosseum-variant ═══

  'colosseum': {
    heroImage: { slug: 'ancient-rome', num: 6 },
    heroBg: { slug: 'ancient-rome', num: 20 },
    sceneBreaks: [
      { slug: 'ancient-rome', num: 15, afterParagraph: 0 },  // amphitheater interior
      { slug: 'ancient-rome', num: 8, afterParagraph: 2 },   // baths — Roman leisure
    ],
    floats: [
      { slug: 'ancient-rome', num: 1, side: 'right', size: 'lg', paragraph: 0 },  // facade
      { slug: 'ancient-rome', num: 10, side: 'left', size: 'md', paragraph: 1 },   // triumphal arch
      { slug: 'ancient-rome', num: 3, side: 'right', size: 'md', paragraph: 2 },   // temple
    ],
    parallaxRight: { slug: 'ancient-rome', num: 4 },
    parallaxLeft: { slug: 'ancient-rome', num: 11 },
  },

  'fall-of-rome': {
    heroImage: { slug: 'ancient-rome', num: 12 },  // crumbling ruins
    heroBg: { slug: 'ancient-rome', num: 9 },      // cityscape fading
    sceneBreaks: [
      { slug: 'ancient-rome', num: 2, afterParagraph: 0 },   // aqueduct landscape
      { slug: 'ancient-rome', num: 9, afterParagraph: 1 },   // full cityscape
    ],
    floats: [
      { slug: 'ancient-rome', num: 7, side: 'right', size: 'lg', paragraph: 0 },  // temple with statues
      { slug: 'ancient-rome', num: 3, side: 'left', size: 'md', paragraph: 1 },    // temple
      { slug: 'ancient-rome', num: 16, side: 'right', size: 'md', paragraph: 2 },  // baroque facade
      { slug: 'ancient-rome', num: 14, side: 'left', size: 'sm', paragraph: 2 },   // walkway
    ],
    parallaxRight: { slug: 'ancient-rome', num: 11 },
  },

  'founding-rome': {
    heroImage: { slug: 'ancient-rome', num: 9 },   // cityscape
    heroBg: { slug: 'ancient-rome', num: 5 },      // bridge
    sceneBreaks: [
      { slug: 'ancient-rome', num: 7, afterParagraph: 0 },
    ],
    floats: [
      { slug: 'ancient-rome', num: 4, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'ancient-rome', num: 1, side: 'left', size: 'md', paragraph: 1 },
      { slug: 'ancient-rome', num: 18, side: 'right', size: 'md', paragraph: 2 },
    ],
    parallaxLeft: { slug: 'ancient-rome', num: 10 },
  },

  'roman-forum': {
    heroImage: { slug: 'ancient-rome', num: 1 },
    heroBg: { slug: 'ancient-rome', num: 14 },
    sceneBreaks: [
      { slug: 'ancient-rome', num: 17, afterParagraph: 0 },  // marketplace
    ],
    floats: [
      { slug: 'ancient-rome', num: 19, side: 'right', size: 'lg', paragraph: 0 },  // senate
      { slug: 'ancient-rome', num: 10, side: 'left', size: 'md', paragraph: 1 },   // arch
      { slug: 'ancient-rome', num: 8, side: 'right', size: 'md', paragraph: 2 },   // baths
    ],
    parallaxRight: { slug: 'ancient-rome', num: 11 },
  },

  'julius-caesar': {
    heroImage: { slug: 'ancient-rome', num: 19 },  // senate hall
    heroBg: { slug: 'ancient-rome', num: 13 },
    sceneBreaks: [
      { slug: 'ancient-rome', num: 10, afterParagraph: 0 },  // triumphal arch
    ],
    floats: [
      { slug: 'ancient-rome', num: 7, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'ancient-rome', num: 4, side: 'left', size: 'md', paragraph: 1 },
      { slug: 'ancient-rome', num: 16, side: 'right', size: 'md', paragraph: 2 },
    ],
    parallaxLeft: { slug: 'ancient-rome', num: 3 },
  },

  // ═══ ANCIENT GREECE — verified: 1=philosopher+temple, 5=amphitheater,
  // 10=Zeus bust, 15=warrior in arch ═══

  'democracy-athens': {
    heroImage: { slug: 'ancient-greece', num: 1 },
    heroBg: { slug: 'ancient-greece', num: 5 },
    sceneBreaks: [
      { slug: 'ancient-greece', num: 5, afterParagraph: 0 },
    ],
    floats: [
      { slug: 'ancient-greece', num: 15, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'ancient-greece', num: 10, side: 'left', size: 'md', paragraph: 1 },
    ],
    parallaxRight: { slug: 'ancient-greece', num: 10 },
  },

  'battle-of-marathon': {
    heroImage: { slug: 'ancient-greece', num: 15 },  // warrior
    heroBg: { slug: 'ancient-greece', num: 1 },
    sceneBreaks: [
      { slug: 'ancient-greece', num: 5, afterParagraph: 0 },
    ],
    floats: [
      { slug: 'ancient-greece', num: 10, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'ancient-greece', num: 1, side: 'left', size: 'md', paragraph: 1 },
    ],
  },

  'alexander-empire': {
    heroImage: { slug: 'ancient-greece', num: 15 },
    heroBg: { slug: 'ancient-greece', num: 5 },
    sceneBreaks: [],
    floats: [
      { slug: 'ancient-greece', num: 1, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'ancient-greece', num: 10, side: 'left', size: 'md', paragraph: 1 },
      { slug: 'ancient-greece', num: 5, side: 'right', size: 'md', paragraph: 2 },
    ],
  },

  'parthenon-construction': {
    heroImage: { slug: 'ancient-greece', num: 5 },
    heroBg: { slug: 'ancient-greece', num: 1 },
    sceneBreaks: [],
    floats: [
      { slug: 'ancient-greece', num: 1, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'ancient-greece', num: 15, side: 'left', size: 'md', paragraph: 1 },
      { slug: 'ancient-greece', num: 10, side: 'right', size: 'md', paragraph: 2 },
    ],
  },

  'library-of-alexandria': {
    heroImage: { slug: 'ancient-greece', num: 1 },
    heroBg: { slug: 'ancient-greece', num: 10 },
    sceneBreaks: [
      { slug: 'ancient-greece', num: 5, afterParagraph: 0 },
    ],
    floats: [
      { slug: 'ancient-greece', num: 10, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'ancient-greece', num: 15, side: 'left', size: 'md', paragraph: 1 },
    ],
  },

  // ═══ OTHER CIVILIZATIONS ═══

  // ═══ VIKINGS — verified: 1=warrior in water (transparent), 5=horned helmet
  // viking (transparent), 10=shieldmaiden (transparent), 15=fjord landscape ═══

  'viking-expansion': {
    heroImage: { slug: 'vikings', num: 1 },            // warrior emerging from water — PERFECT
    heroBg: { slug: 'vikings', num: 15 },               // fjord landscape as watermark
    sceneBreaks: [
      { slug: 'vikings', num: 15, afterParagraph: 0 },  // fjord landscape — Norse homeland
    ],
    floats: [
      { slug: 'vikings', num: 5, side: 'right', size: 'lg', paragraph: 0 },   // horned helmet viking
      { slug: 'vikings', num: 10, side: 'left', size: 'lg', paragraph: 1 },    // shieldmaiden
    ],
  },

  // ═══ ANCIENT MONGOLIA — verified: 1=steppe yurt camp, 5=horseman on white
  // horse (transparent), 8=woman warrior fur cloak (transparent) ═══

  'genghis-khan': {
    heroImage: { slug: 'ancient-mongolia', num: 5 },    // HORSEMAN — this IS Genghis Khan
    heroBg: { slug: 'ancient-mongolia', num: 1 },       // steppe camp as watermark
    sceneBreaks: [
      { slug: 'ancient-mongolia', num: 1, afterParagraph: 0 },  // steppe landscape
    ],
    floats: [
      { slug: 'ancient-mongolia', num: 8, side: 'right', size: 'lg', paragraph: 0 },  // woman warrior
      { slug: 'ancient-mongolia', num: 5, side: 'left', size: 'md', paragraph: 2 },    // horseman again
    ],
  },

  // ═══ ANCIENT CHINA — verified: 1=pagoda+maples, 3=Forbidden City, 5=GREAT WALL,
  // 8=sage+pagoda, 10=lake pavilion, 12=silk-robed woman, 15=dragon coins,
  // 18=9 ancient coins ═══

  'great-wall-begin': {
    heroImage: { slug: 'ancient-china', num: 5 },       // THE GREAT WALL illustration
    heroBg: { slug: 'ancient-china', num: 3 },          // Forbidden City watermark
    sceneBreaks: [
      { slug: 'ancient-china', num: 10, afterParagraph: 0 },  // serene lake pavilion
    ],
    floats: [
      { slug: 'ancient-china', num: 1, side: 'right', size: 'lg', paragraph: 0 },   // pagoda
      { slug: 'ancient-china', num: 8, side: 'left', size: 'md', paragraph: 1 },    // sage+pagoda
      { slug: 'ancient-china', num: 3, side: 'right', size: 'md', paragraph: 2 },   // Forbidden City
    ],
  },

  'silk-road': {
    heroImage: { slug: 'ancient-china', num: 12 },      // silk-robed woman — THE Silk Road visual
    heroBg: { slug: 'ancient-china', num: 15 },          // dragon coins — trade
    sceneBreaks: [
      { slug: 'ancient-china', num: 10, afterParagraph: 0 },  // lake pavilion — oasis stop
    ],
    floats: [
      { slug: 'ancient-china', num: 15, side: 'right', size: 'lg', paragraph: 0 },  // dragon coins — trade
      { slug: 'ancient-china', num: 1, side: 'left', size: 'md', paragraph: 1 },    // pagoda
      { slug: 'ancient-china', num: 18, side: 'right', size: 'md', paragraph: 2 },  // 9 coins grid
    ],
  },

  'shang-oracle-bones': {
    heroImage: { slug: 'ancient-china', num: 3 },       // Forbidden City — royal court
    heroBg: { slug: 'ancient-china', num: 8 },           // sage+pagoda
    sceneBreaks: [],
    floats: [
      { slug: 'ancient-china', num: 8, side: 'right', size: 'lg', paragraph: 0 },   // sage figure
      { slug: 'ancient-china', num: 1, side: 'left', size: 'md', paragraph: 1 },    // pagoda
    ],
  },

  // ═══ ANCIENT INDIA — verified: 1=temple corridor with pillars,
  // 5=feathered necklace/jewelry (transparent), 10=woman in sari (transparent) ═══

  'birth-of-buddhism': {
    heroImage: { slug: 'ancient-india', num: 10 },       // woman in sari — Indian culture
    heroBg: { slug: 'ancient-india', num: 1 },           // temple corridor
    sceneBreaks: [
      { slug: 'ancient-india', num: 1, afterParagraph: 0 },  // temple corridor — meditation setting
    ],
    floats: [
      { slug: 'ancient-india', num: 5, side: 'right', size: 'lg', paragraph: 0 },   // jewelry — Indian craft
      { slug: 'ancient-india', num: 10, side: 'left', size: 'md', paragraph: 2 },   // woman figure
    ],
  },

  'indus-valley': {
    heroImage: { slug: 'ancient-india', num: 1 },        // temple corridor — ancient architecture
    sceneBreaks: [],
    floats: [
      { slug: 'ancient-india', num: 10, side: 'right', size: 'lg', paragraph: 0 },  // woman — civilization
      { slug: 'ancient-india', num: 5, side: 'left', size: 'md', paragraph: 1 },    // jewelry — craftsmanship
    ],
  },

  'maurya-ashoka': {
    heroImage: { slug: 'mauryan-empire', num: 1 },
    sceneBreaks: [{ slug: 'mauryan-empire', num: 8, afterParagraph: 0 }],
    floats: [
      { slug: 'mauryan-empire', num: 5, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'mauryan-empire', num: 12, side: 'left', size: 'md', paragraph: 1 },
    ],
  },

  // ═══ ANCIENT PERSIA — verified: 1=ornate silver shield (transparent),
  // 5=Persepolis gateway with bull statues (transparent) ═══

  'persian-empire-cyrus': {
    heroImage: { slug: 'ancient-persia', num: 5 },       // Persepolis gateway — THE Persian Empire icon
    heroBg: { slug: 'ancient-persia', num: 1 },          // shield medallion watermark
    sceneBreaks: [],
    floats: [
      { slug: 'ancient-persia', num: 1, side: 'right', size: 'lg', paragraph: 0 },   // ornate shield
      { slug: 'ancient-persia', num: 5, side: 'left', size: 'md', paragraph: 2 },    // gateway repeat
    ],
  },

  'phoenician-alphabet': {
    heroImage: { slug: 'ancient-phoenicia', num: 1 },
    sceneBreaks: [],
    floats: [
      { slug: 'ancient-phoenicia', num: 8, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'ancient-phoenicia', num: 5, side: 'left', size: 'md', paragraph: 1 },
    ],
  },

  'kingdom-of-kush': {
    heroImage: { slug: 'kingdom-of-kush', num: 1 },
    sceneBreaks: [{ slug: 'kingdom-of-kush', num: 8, afterParagraph: 0 }],
    floats: [
      { slug: 'kingdom-of-kush', num: 5, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'kingdom-of-kush', num: 15, side: 'left', size: 'md', paragraph: 1 },
      { slug: 'kingdom-of-kush', num: 10, side: 'right', size: 'md', paragraph: 2 },
    ],
  },

  'code-hammurabi': {
    heroImage: { slug: 'ancient-babylon', num: 1 },
    sceneBreaks: [{ slug: 'ancient-babylon', num: 8, afterParagraph: 0 }],
    floats: [
      { slug: 'ancient-babylon', num: 5, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'ancient-babylon', num: 12, side: 'left', size: 'md', paragraph: 1 },
    ],
  },

  'aztec-tenochtitlan': {
    heroImage: { slug: 'aztecs', num: 1 },
    sceneBreaks: [{ slug: 'aztecs', num: 8, afterParagraph: 0 }],
    floats: [
      { slug: 'aztecs', num: 5, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'aztecs', num: 15, side: 'left', size: 'md', paragraph: 1 },
      { slug: 'aztecs', num: 10, side: 'right', size: 'md', paragraph: 2 },
    ],
  },

  'teotihuacan-founded': {
    heroImage: { slug: 'ancient-maya', num: 1 },
    sceneBreaks: [],
    floats: [
      { slug: 'ancient-maya', num: 8, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'ancient-maya', num: 5, side: 'left', size: 'md', paragraph: 1 },
    ],
  },

  'machu-picchu': {
    heroImage: { slug: 'ancient-maya', num: 3 },
    sceneBreaks: [{ slug: 'ancient-maya', num: 10, afterParagraph: 0 }],
    floats: [
      { slug: 'ancient-maya', num: 7, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'ancient-maya', num: 18, side: 'left', size: 'md', paragraph: 1 },
    ],
  },

  'mansa-musa': {
    heroImage: { slug: 'mali-empire', num: 1 },
    sceneBreaks: [{ slug: 'mali-empire', num: 8, afterParagraph: 0 }],
    floats: [
      { slug: 'mali-empire', num: 5, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'mali-empire', num: 15, side: 'left', size: 'md', paragraph: 1 },
    ],
  },

  'angkor-wat': {
    heroImage: { slug: 'ancient-khmer', num: 1 },
    sceneBreaks: [{ slug: 'ancient-khmer', num: 8, afterParagraph: 0 }],
    floats: [
      { slug: 'ancient-khmer', num: 5, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'ancient-khmer', num: 15, side: 'left', size: 'md', paragraph: 1 },
      { slug: 'ancient-khmer', num: 10, side: 'right', size: 'md', paragraph: 2 },
    ],
  },

  'edo-period-japan': {
    heroImage: { slug: 'ancient-japan', num: 1 },
    sceneBreaks: [{ slug: 'ancient-japan', num: 8, afterParagraph: 0 }],
    floats: [
      { slug: 'ancient-japan', num: 5, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'ancient-japan', num: 15, side: 'left', size: 'md', paragraph: 1 },
      { slug: 'ancient-japan', num: 10, side: 'right', size: 'md', paragraph: 2 },
    ],
  },

  'great-pyramid': {
    heroImage: { slug: 'ancient-arabia', num: 1 },
    sceneBreaks: [{ slug: 'ancient-arabia', num: 8, afterParagraph: 0 }],
    floats: [
      { slug: 'ancient-arabia', num: 5, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'ancient-arabia', num: 12, side: 'left', size: 'md', paragraph: 1 },
    ],
  },

  'rosetta-stone': {
    heroImage: { slug: 'ancient-arabia', num: 3 },
    sceneBreaks: [],
    floats: [
      { slug: 'ancient-arabia', num: 10, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'ancient-arabia', num: 7, side: 'left', size: 'md', paragraph: 1 },
    ],
  },
};

const SIZE_CLASSES = {
  sm: 'w-[180px] lg:w-[200px]',
  md: 'w-[220px] lg:w-[260px]',
  lg: 'w-[260px] lg:w-[320px]',
  xl: 'w-[320px] lg:w-[380px]',
};

export function getIllustrationUrl(slug: string, num: number): string {
  return `/assets/civilizations/${slug}/${num}.webp`;
}

export function getFloatClasses(float: FloatPlacement): { className: string; style: Record<string, string> } {
  const imgUrl = getIllustrationUrl(float.slug, float.num);
  return {
    className: `hidden md:block ${float.side === 'right' ? 'float-right ml-8' : 'float-left mr-8'} mb-6 ${SIZE_CLASSES[float.size]} drop-shadow-xl`,
    style: {
      shapeOutside: `url(${imgUrl})`,
      shapeMargin: '16px',
      shapeImageThreshold: '0.1',
    },
  };
}

export function getEventPlacements(eventId: string): IllustrationPlacement | null {
  return EVENT_ILLUSTRATIONS[eventId] ?? null;
}
