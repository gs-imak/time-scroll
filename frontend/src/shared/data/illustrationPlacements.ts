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
  /** Width class — 'sm' = 200px, 'md' = 300px, 'lg' = 380px, 'xl' = 440px (editorial standard: 25-60% of ~700px column) */
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

  // ═══ PHOENICIA — verified: 1=temple ruins blue/gold (transparent),
  // 5=PORT CITY aerial with ships, 8=three ornate pillars (transparent) ═══

  'phoenician-alphabet': {
    heroImage: { slug: 'ancient-phoenicia', num: 5 },    // PORT CITY — Phoenician trade hub
    heroBg: { slug: 'ancient-phoenicia', num: 1 },
    sceneBreaks: [{ slug: 'ancient-phoenicia', num: 5, afterParagraph: 0 }],
    floats: [
      { slug: 'ancient-phoenicia', num: 1, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'ancient-phoenicia', num: 8, side: 'left', size: 'md', paragraph: 1 },
    ],
  },

  // ═══ KUSH — verified: 1=Nile valley, 5=marketplace, 8=WARRIOR KING (transparent),
  // 15=pharaoh face (transparent) ═══

  'kingdom-of-kush': {
    heroImage: { slug: 'kingdom-of-kush', num: 8 },     // WARRIOR KING
    heroBg: { slug: 'kingdom-of-kush', num: 15 },
    sceneBreaks: [
      { slug: 'kingdom-of-kush', num: 1, afterParagraph: 0 },
      { slug: 'kingdom-of-kush', num: 5, afterParagraph: 1 },
    ],
    floats: [
      { slug: 'kingdom-of-kush', num: 15, side: 'right', size: 'lg', paragraph: 0 },
    ],
  },

  // ═══ BABYLON — verified: 1=ziggurat gardens (transparent), 5=ISHTAR GATE (transparent),
  // 8=astronomical disc (transparent), 12=Lamassu (transparent) ═══

  'code-hammurabi': {
    heroImage: { slug: 'ancient-babylon', num: 5 },      // ISHTAR GATE
    heroBg: { slug: 'ancient-babylon', num: 1 },
    sceneBreaks: [{ slug: 'ancient-babylon', num: 1, afterParagraph: 0 }],
    floats: [
      { slug: 'ancient-babylon', num: 12, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'ancient-babylon', num: 8, side: 'left', size: 'md', paragraph: 1 },
    ],
  },

  // ═══ AZTECS — verified: 1=Tenochtitlan canal city, 5=pyramid complex,
  // 8=Quetzalcoatl mask (transparent), 15=ritual mask (transparent) ═══

  'aztec-tenochtitlan': {
    heroImage: { slug: 'aztecs', num: 1 },               // canal city
    heroBg: { slug: 'aztecs', num: 8 },
    sceneBreaks: [{ slug: 'aztecs', num: 5, afterParagraph: 0 }],
    floats: [
      { slug: 'aztecs', num: 8, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'aztecs', num: 15, side: 'left', size: 'md', paragraph: 1 },
    ],
  },

  // ═══ MALI — verified: 1=trading post (transparent), 5=KING portrait (transparent),
  // 8=nobleman turban (transparent), 15=warrior/trader (transparent) ═══

  'mansa-musa': {
    heroImage: { slug: 'mali-empire', num: 5 },           // KING PORTRAIT
    heroBg: { slug: 'mali-empire', num: 1 },
    sceneBreaks: [{ slug: 'mali-empire', num: 1, afterParagraph: 0 }],
    floats: [
      { slug: 'mali-empire', num: 8, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'mali-empire', num: 15, side: 'left', size: 'md', paragraph: 1 },
    ],
  },

  // ═══ KHMER — verified: 1=ANGKOR WAT aerial (transparent), 5=temple towers (transparent) ═══

  'angkor-wat': {
    heroImage: { slug: 'ancient-khmer', num: 1 },         // ANGKOR WAT
    sceneBreaks: [],
    floats: [
      { slug: 'ancient-khmer', num: 5, side: 'right', size: 'lg', paragraph: 0 },
    ],
  },

  // ═══ JAPAN — verified: 1=kitsune fox (transparent), 5=female samurai (transparent),
  // 15=SHOGUN gold armor (transparent) ═══

  'edo-period-japan': {
    heroImage: { slug: 'ancient-japan', num: 15 },         // SHOGUN
    heroBg: { slug: 'ancient-japan', num: 1 },
    sceneBreaks: [],
    floats: [
      { slug: 'ancient-japan', num: 5, side: 'right', size: 'lg', paragraph: 0 },
      { slug: 'ancient-japan', num: 1, side: 'left', size: 'md', paragraph: 1 },
    ],
  },

  // ═══ MAURYAN — verified: 1=warrior king profile helmet (transparent),
  // 5=grand palace complex (transparent) ═══

  'maurya-ashoka': {
    heroImage: { slug: 'mauryan-empire', num: 1 },        // WARRIOR KING
    heroBg: { slug: 'mauryan-empire', num: 5 },
    sceneBreaks: [{ slug: 'mauryan-empire', num: 5, afterParagraph: 0 }],
    floats: [],
  },

  // ═══ TROJAN WAR — minoan-civilization: 1=dancer priestess, 2=sacred bull,
  // 6=Minoan woman profile, 12=noblewoman helmet, 13=decorated bull,
  // 17=sailing vessel, 18=large galley ═══

  'trojan-war': {
    heroImage: { slug: 'minoan-civilization', num: 1 },     // dancer/priestess — Aegean culture
    heroBg: { slug: 'minoan-civilization', num: 2 },         // sacred bull — Minoan icon
    sceneBreaks: [
      { slug: 'minoan-civilization', num: 18, afterParagraph: 0 },  // large galley — Greek fleet
    ],
    floats: [
      { slug: 'minoan-civilization', num: 6, side: 'right', size: 'lg', paragraph: 0 },   // Minoan woman profile
      { slug: 'minoan-civilization', num: 13, side: 'left', size: 'md', paragraph: 1 },    // decorated bull
      { slug: 'minoan-civilization', num: 12, side: 'right', size: 'md', paragraph: 2 },   // noblewoman with helmet
    ],
    parallaxLeft: { slug: 'minoan-civilization', num: 16 },  // ornamental shield disc
  },

  // ═══ POMPEII — ancient-rome ruins + ancient-etruscans ═══

  'pompeii-destroyed': {
    heroImage: { slug: 'ancient-rome', num: 12 },            // crumbling ruins — DESTRUCTION
    heroBg: { slug: 'ancient-rome', num: 9 },                // cityscape — Pompeii before
    sceneBreaks: [
      { slug: 'ancient-rome', num: 2, afterParagraph: 0 },   // aqueduct — Roman infrastructure
    ],
    floats: [
      { slug: 'ancient-rome', num: 15, side: 'right', size: 'lg', paragraph: 0 },  // amphitheater
      { slug: 'ancient-rome', num: 18, side: 'left', size: 'md', paragraph: 1 },   // dome — Roman architecture
      { slug: 'ancient-rome', num: 5, side: 'right', size: 'md', paragraph: 2 },   // bridge
    ],
  },

  // ═══ PETRA — ancient-nabataea: 1=PETRA rock-cut facade(!), 2=twin tombs,
  // 3=ornate capital, 13=large tomb, 14=merchant, 15=trader ═══

  'construction-of-petra': {
    heroImage: { slug: 'ancient-nabataea', num: 1 },         // PETRA FACADE — iconic rock-cut building
    heroBg: { slug: 'ancient-nabataea', num: 2 },            // twin tombs — Nabataean architecture
    sceneBreaks: [
      { slug: 'ancient-nabataea', num: 13, afterParagraph: 0 },  // large rock-cut tomb
    ],
    floats: [
      { slug: 'ancient-nabataea', num: 14, side: 'right', size: 'lg', paragraph: 0 },  // merchant in teal robe
      { slug: 'ancient-nabataea', num: 15, side: 'left', size: 'md', paragraph: 1 },   // trader with vessels
      { slug: 'ancient-nabataea', num: 3, side: 'right', size: 'md', paragraph: 2 },   // ornate carved capital
    ],
    parallaxRight: { slug: 'ancient-nabataea', num: 16 },    // caravan trader
  },

  // ═══ HOUSE OF WISDOM — ancient-iraq: 3=law stele, 6=king portrait,
  // 8=king throne, 10=water wheel, 12=astronomical disc, 15=ziggurat,
  // 17=city gate, 19=scribe writing ═══

  'house-of-wisdom': {
    heroImage: { slug: 'ancient-iraq', num: 19 },             // SCRIBE writing on tablet — scholarship
    heroBg: { slug: 'ancient-iraq', num: 12 },                // astronomical disc — Golden Age science
    sceneBreaks: [
      { slug: 'ancient-iraq', num: 15, afterParagraph: 0 },   // ziggurat — Baghdad architecture
      { slug: 'ancient-iraq', num: 10, afterParagraph: 1 },   // water wheel/gear — engineering
    ],
    floats: [
      { slug: 'ancient-iraq', num: 8, side: 'right', size: 'lg', paragraph: 0 },   // king on throne — Caliph
      { slug: 'ancient-iraq', num: 6, side: 'left', size: 'md', paragraph: 1 },    // king/priest portrait
      { slug: 'ancient-iraq', num: 3, side: 'right', size: 'md', paragraph: 2 },   // law stele — written wisdom
    ],
    parallaxLeft: { slug: 'ancient-iraq', num: 17 },          // monumental city gate
  },

};

// Editorial standard float widths — 25-60% of a ~700px reading column
// sm: portraits, small artifacts | md: standard editorial workhorse
// lg: detailed illustrations, maps | xl: dominant scene-setters
const SIZE_CLASSES = {
  sm: 'w-[200px] lg:w-[220px]',
  md: 'w-[280px] lg:w-[320px]',
  lg: 'w-[340px] lg:w-[400px]',
  xl: 'w-[400px] lg:w-[460px]',
};

export function getIllustrationUrl(slug: string, num: number): string {
  return `/assets/civilizations/${slug}/${num}.webp`;
}

export function getFloatClasses(float: FloatPlacement): { className: string; style: Record<string, string> } {
  const imgUrl = getIllustrationUrl(float.slug, float.num);
  const isRight = float.side === 'right';
  // Mobile: full-width centered block (no float, no shape-outside)
  // Desktop (md+): floated with shape-outside text wrapping
  return {
    className: `block w-full max-w-[400px] mx-auto mb-6 md:max-w-none md:mx-0 ${isRight ? 'md:float-right md:ml-8' : 'md:float-left md:mr-8'} md:mb-6 ${SIZE_CLASSES[float.size]} drop-shadow-xl`,
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

/** Returns all pack images NOT already used in hero/heroBg/sceneBreaks/floats/parallax.
 *  These populate the auto-gallery so we actually USE the 20 images per pack. */
export function getGalleryImages(eventId: string): { slug: string; num: number }[] {
  const placement = EVENT_ILLUSTRATIONS[eventId];
  if (!placement) return [];

  // Collect all used image keys as "slug/num"
  const used = new Set<string>();
  if (placement.heroImage) used.add(`${placement.heroImage.slug}/${placement.heroImage.num}`);
  if (placement.heroBg) used.add(`${placement.heroBg.slug}/${placement.heroBg.num}`);
  if (placement.parallaxLeft) used.add(`${placement.parallaxLeft.slug}/${placement.parallaxLeft.num}`);
  if (placement.parallaxRight) used.add(`${placement.parallaxRight.slug}/${placement.parallaxRight.num}`);
  for (const sb of placement.sceneBreaks) used.add(`${sb.slug}/${sb.num}`);
  for (const f of placement.floats) used.add(`${f.slug}/${f.num}`);

  // Collect all unique slugs used by this event
  const slugs = new Set<string>();
  if (placement.heroImage) slugs.add(placement.heroImage.slug);
  if (placement.heroBg) slugs.add(placement.heroBg.slug);
  for (const sb of placement.sceneBreaks) slugs.add(sb.slug);
  for (const f of placement.floats) slugs.add(f.slug);
  if (placement.parallaxLeft) slugs.add(placement.parallaxLeft.slug);
  if (placement.parallaxRight) slugs.add(placement.parallaxRight.slug);

  // For each pack, find unused images (1-20)
  const gallery: { slug: string; num: number }[] = [];
  for (const slug of slugs) {
    const maxNum = slug === 'ancient-angkor' ? 18 : 20; // angkor missing #6
    for (let num = 1; num <= maxNum; num++) {
      if (slug === 'ancient-angkor' && num === 6) continue;
      if (!used.has(`${slug}/${num}`)) {
        gallery.push({ slug, num });
      }
    }
  }
  return gallery;
}
