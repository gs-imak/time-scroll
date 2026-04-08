import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, ChevronRight, Sparkles, Scroll, BookOpen,
  Crown, Landmark,
} from 'lucide-react';
import { EVENT_CIVILIZATION, getCivImageUrl } from '@/shared/data/civilizationAssets';
import { ALL_CIVILIZATION_LABELS } from '@/shared/data/civilizationLabels';
import { CIV_DESCRIPTIONS, NAME_DESCRIPTIONS } from '@/shared/data/civDescriptions';
import type { CivDescription } from '@/shared/data/civDescriptions';
import { SEED_EVENTS, ERAS } from '@/shared/utils/constants';
import { formatYear } from '@/shared/utils/format';
import { useEventsStore } from '@/shared/stores/eventsStore';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const ERA_HEX: Record<string, string> = {
  prehistory: '#8d7b68',
  ancient: '#c49a44',
  classical: '#b85454',
  medieval: '#8b6faa',
  renaissance: '#5a7fb5',
  industrial: '#7a9e5a',
  modern: '#5a9aaa',
};

const stagger = {
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: EASE } },
};

const section = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: EASE } },
});

/* ══════════════════════════════════════════
   GLASS CARD
   ══════════════════════════════════════════ */

function GlassCard({
  children,
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl transition-all duration-200 ${className ?? ''}`}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: 'inset 0 1px 0 var(--glass-inset)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════
   LOOKUP HELPERS
   ══════════════════════════════════════════ */

interface CivData {
  name: string;
  slug: string;
  summary: string;
  detail: string | null;
  knownFor: string | null;
  keyFacts: string[];
  imageUrl: string | null;
  eraId: string;
  eraName: string;
  eraColor: string;
  earliestYear: number | null;
  relatedEvents: typeof SEED_EVENTS;
  packSlug: string | null;
  totalImages: number;
  lat: number | null;
  lng: number | null;
}

/** Normalize a key to a URL-safe slug: lowercase, strip diacritics, spaces→hyphens */
function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritic marks
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Try many slug variants to locate a description. */
function findDescription(slug: string): {
  desc: CivDescription | null;
  matchedKey: string | null;
} {
  // Direct hit on CIV_DESCRIPTIONS
  if (CIV_DESCRIPTIONS[slug]) {
    return { desc: CIV_DESCRIPTIONS[slug], matchedKey: slug };
  }

  // Try prefix/suffix stripped variants
  const variants = [
    slug.replace(/^ancient-/, ''),
    slug.replace(/^kingdom-of-/, ''),
    slug.replace(/-empire$/, ''),
    slug.replace(/^ancient-/, '').replace(/-empire$/, ''),
  ];
  for (const v of variants) {
    if (CIV_DESCRIPTIONS[v]) return { desc: CIV_DESCRIPTIONS[v], matchedKey: v };
  }

  // Also try each CIV_DESCRIPTIONS key via slugified match (covers quoted/unicode keys)
  for (const [key, entry] of Object.entries(CIV_DESCRIPTIONS)) {
    if (slugify(key) === slug) return { desc: entry, matchedKey: key };
  }

  // Try NAME_DESCRIPTIONS — keyed by GeoJSON NAME (e.g. "Sweden", "'Jōmon'")
  // Direct title-cased lookup
  const titleCased = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  if (NAME_DESCRIPTIONS[titleCased]) {
    return {
      desc: toCivDescription(NAME_DESCRIPTIONS[titleCased]),
      matchedKey: titleCased,
    };
  }

  // Fuzzy slugified match against NAME_DESCRIPTIONS keys
  for (const [nameKey, entry] of Object.entries(NAME_DESCRIPTIONS)) {
    if (slugify(nameKey) === slug) {
      return { desc: toCivDescription(entry), matchedKey: nameKey };
    }
  }

  return { desc: null, matchedKey: null };
}

function toCivDescription(
  entry: (typeof NAME_DESCRIPTIONS)[string],
): CivDescription {
  return {
    summary: entry.summary,
    detail: entry.detail,
    knownFor: entry.knownFor,
    keyFacts: entry.keyFacts,
    imageUrl: entry.imageUrl ?? '',
  };
}

/** Parse earliest year from text (same logic as CivilizationIndex) */
function parseEarliestYearFromText(text: string): number | null {
  const years: number[] = [];

  const pushBCE = (raw: string | undefined, min: number) => {
    if (!raw) return;
    const n = parseInt(raw.replace(/,/g, ''), 10);
    if (!isNaN(n) && n >= min && n < 500000) years.push(-n);
  };
  const pushCE = (raw: string | undefined, min: number) => {
    if (!raw) return;
    const n = parseInt(raw.replace(/,/g, ''), 10);
    if (!isNaN(n) && n >= min && n < 2100) years.push(n);
  };

  const bceRangeRe = /\b(\d{1,4}(?:,\d{3})*)\s*[-–—]\s*\d{1,4}(?:,\d{3})*\s*BCE\b/g;
  for (const m of text.matchAll(bceRangeRe)) pushBCE(m[1], 30);

  const ceRangeRe = /\b(\d{1,4}(?:,\d{3})*)\s*[-–—]\s*\d{1,4}(?:,\d{3})*\s*CE\b/g;
  for (const m of text.matchAll(ceRangeRe)) pushCE(m[1], 1);

  const bceRe = /\b(\d{1,2}(?:,\d{3})+|\d{3,6})\s*BCE\b/g;
  for (const m of text.matchAll(bceRe)) pushBCE(m[1], 100);

  const ceRe = /\b(\d{1,2}(?:,\d{3})+|\d{2,4})\s*CE\b/g;
  for (const m of text.matchAll(ceRe)) pushCE(m[1], 50);

  const yearsAgoRe = /\b(\d{1,3}(?:,\d{3})*|\d{3,7})\s*years?\s+ago\b/gi;
  for (const m of text.matchAll(yearsAgoRe)) {
    const raw = m[1];
    if (!raw) continue;
    const n = parseInt(raw.replace(/,/g, ''), 10);
    if (!isNaN(n) && n >= 500 && n < 5000000) years.push(2025 - n);
  }

  const parenYearRe = /\((\d{4})\)/g;
  for (const m of text.matchAll(parenYearRe)) {
    const raw = m[1];
    if (!raw) continue;
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 1000 && n <= 2024) years.push(n);
  }

  if (years.length === 0) return null;
  return Math.min(...years);
}

function assignEra(year: number): (typeof ERAS)[number] {
  const first = ERAS[0]!;
  const last = ERAS[ERAS.length - 1]!;
  if (year < first.startYear) return first;
  if (year >= last.endYear) return last;
  return ERAS.find((e) => year >= e.startYear && year < e.endYear) ?? last;
}

/* ══════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════ */

export default function CivilizationGallery() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const events = useEventsStore((s) => s.events);

  const civData: CivData | null = useMemo(() => {
    if (!slug) return null;

    // Step 1: find label (if any)
    const label = ALL_CIVILIZATION_LABELS.find((c) => c.slug === slug);

    // Step 2: find description (via multiple slug variants)
    const { desc, matchedKey } = findDescription(slug);

    // Step 3: if neither exists, bail
    if (!label && !desc) return null;

    // Step 4: try to find a pack for illustrations (17 packs max)
    const pack = label
      ? Object.values(EVENT_CIVILIZATION).find((p) => p.slug === label.slug)
      : null;

    // Step 5: determine era + earliest year
    let earliestYear: number | null = null;
    if (label && label.eventIds.length > 0) {
      for (const eventId of label.eventIds) {
        const evt =
          events.find((e) => e.id === eventId) ??
          SEED_EVENTS.find((e) => e.id === eventId);
        if (!evt) continue;
        if (earliestYear === null || evt.year < earliestYear) {
          earliestYear = evt.year;
        }
      }
    }
    if (earliestYear === null && desc) {
      const combined = [
        desc.summary,
        desc.detail ?? '',
        ...(desc.keyFacts ?? []),
      ].join(' ');
      earliestYear = parseEarliestYearFromText(combined);
    }
    const era = assignEra(earliestYear ?? -2000);
    const eraColor = ERA_HEX[era.id] ?? '#8a8a9a';

    // Step 6: display name
    const name = label
      ? label.name
      : matchedKey && /[A-Z]/.test(matchedKey)
        ? matchedKey // Use NAME_DESCRIPTIONS key if it's already title-cased
        : (matchedKey ?? slug)
            .replace(/[_']/g, ' ')
            .split(/[-\s]+/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

    // Step 7: gather related events
    const relatedEvents = label
      ? (label.eventIds
          .map((id) => SEED_EVENTS.find((e) => e.id === id))
          .filter(Boolean) as typeof SEED_EVENTS)
      : [];

    return {
      name,
      slug,
      summary: desc?.summary ?? 'No summary available for this civilization.',
      detail: desc?.detail ?? null,
      knownFor: desc?.knownFor ?? null,
      keyFacts: desc?.keyFacts ?? [],
      imageUrl: desc?.imageUrl || null,
      eraId: era.id,
      eraName: era.name,
      eraColor,
      earliestYear,
      relatedEvents,
      packSlug: label?.slug ?? null,
      totalImages: pack?.totalImages ?? 0,
      lat: label?.lat ?? null,
      lng: label?.lng ?? null,
    };
  }, [slug, events]);

  if (!civData) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center lg:pl-[64px]"
        style={{
          background: `
            radial-gradient(ellipse at 50% 20%, rgba(196,154,68,0.04) 0%, transparent 50%),
            var(--color-void)
          `,
        }}
      >
        <GlassCard className="p-10 text-center max-w-md">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'rgba(196,154,68,0.1)',
              border: '1px solid rgba(196,154,68,0.2)',
            }}
          >
            <Landmark size={26} style={{ color: 'var(--color-accent-gold)' }} />
          </div>
          <h2
            className="mb-2"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            Civilization not found
          </h2>
          <p
            className="mb-6"
            style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
            }}
          >
            We couldn't find "{slug}" in our records. Try browsing all civilizations instead.
          </p>
          <motion.button
            type="button"
            onClick={() => navigate('/civilizations')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] cursor-pointer"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '13px',
              fontWeight: 600,
              background: 'rgba(196,154,68,0.12)',
              border: '1px solid rgba(196,154,68,0.3)',
              color: 'var(--color-accent-gold)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={15} />
            Back to Civilizations
          </motion.button>
        </GlassCard>
      </div>
    );
  }

  const hasGallery = civData.packSlug && civData.totalImages > 0;
  const galleryImages = hasGallery
    ? Array.from({ length: civData.totalImages }, (_, i) =>
        getCivImageUrl(civData.packSlug!, i + 1),
      )
    : [];

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden overflow-y-auto lg:pl-[64px]"
      style={{
        background: `
          radial-gradient(ellipse at 50% 0%, ${civData.eraColor}10 0%, transparent 40%),
          radial-gradient(ellipse at 80% 60%, rgba(90,143,165,0.03) 0%, transparent 50%),
          var(--color-void)
        `,
      }}
    >
      {/* ═══════════════ HERO ═══════════════ */}
      <div className="relative">
        {/* Hero image background */}
        {civData.imageUrl ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${civData.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.35,
              filter: 'blur(1px)',
            }}
            aria-hidden="true"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${civData.eraColor}18 0%, ${civData.eraColor}04 100%)`,
            }}
            aria-hidden="true"
          />
        )}

        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 40%, var(--color-void) 100%)',
          }}
          aria-hidden="true"
        />

        <div className="relative w-full max-w-[1100px] mx-auto px-5 sm:px-8 md:px-10 pt-10 md:pt-14 pb-20 md:pb-28">
          {/* Back button */}
          <motion.button
            type="button"
            onClick={() => navigate('/civilizations')}
            className="inline-flex items-center gap-2 mb-10 px-4 py-2 rounded-[10px] cursor-pointer"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-secondary)',
            }}
            whileHover={{
              scale: 1.03,
              borderColor: 'rgba(196, 154, 68, 0.3)',
            }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            aria-label="Back to all civilizations"
          >
            <ArrowLeft size={14} />
            All Civilizations
          </motion.button>

          {/* Era chip */}
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
            style={{
              background: `${civData.eraColor}20`,
              border: `1px solid ${civData.eraColor}50`,
              backdropFilter: 'blur(12px)',
            }}
            {...section(0.1)}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: civData.eraColor, boxShadow: `0 0 6px ${civData.eraColor}` }}
            />
            <span
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: civData.eraColor,
              }}
            >
              {civData.eraName}
            </span>
          </motion.div>

          {/* Name */}
          <motion.h1
            className="mb-5 max-w-[800px]"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(32px, 6vw, 56px)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              lineHeight: 1.05,
              textShadow: '0 2px 20px rgba(0,0,0,0.5)',
            }}
            {...section(0.15)}
          >
            {civData.name}
          </motion.h1>

          {/* Meta row */}
          <motion.div className="flex flex-wrap items-center gap-4" {...section(0.2)}>
            {civData.earliestYear !== null && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <Crown size={12} style={{ color: 'var(--color-accent-gold)' }} />
                <span
                  className="text-[11px] font-semibold"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  First event: {formatYear(civData.earliestYear)}
                </span>
              </div>
            )}
            {civData.lat !== null && civData.lng !== null && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <MapPin size={12} style={{ color: 'var(--color-accent-cyan)' }} />
                <span
                  className="text-[11px] font-semibold"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {civData.lat.toFixed(1)}, {civData.lng.toFixed(1)}
                </span>
              </div>
            )}
            {civData.relatedEvents.length > 0 && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <Scroll size={12} style={{ color: '#6d9476' }} />
                <span
                  className="text-[11px] font-semibold"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {civData.relatedEvents.length} event
                  {civData.relatedEvents.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ═══════════════ BODY ═══════════════ */}
      <div className="w-full max-w-[1100px] mx-auto px-5 sm:px-8 md:px-10 pb-20 -mt-8 relative z-10">
        {/* ── Summary card ── */}
        <motion.section className="mb-10" {...section(0.3)}>
          <GlassCard className="p-6 md:p-8" style={{ background: 'var(--glass-strong-bg)' }}>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(16px, 2vw, 19px)',
                lineHeight: 1.55,
                color: 'var(--color-text-primary)',
                fontWeight: 400,
              }}
            >
              {civData.summary}
            </p>
          </GlassCard>
        </motion.section>

        {/* ── Detail + Key Facts ── */}
        {(civData.detail || civData.keyFacts.length > 0) && (
          <motion.section className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6" {...section(0.35)}>
            {civData.detail && (
              <div className="lg:col-span-2">
                <SectionHeading icon={BookOpen} label="Background" />
                <GlassCard className="p-6">
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '14px',
                      lineHeight: 1.65,
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {civData.detail}
                  </p>
                </GlassCard>
              </div>
            )}

            {civData.keyFacts.length > 0 && (
              <div>
                <SectionHeading icon={Sparkles} label="Key Facts" />
                <motion.div
                  className="space-y-2.5"
                  variants={stagger}
                  initial="initial"
                  animate="animate"
                >
                  {civData.keyFacts.map((fact, i) => (
                    <motion.div
                      key={i}
                      variants={scaleIn}
                      className="p-3.5 rounded-lg flex items-start gap-3"
                      style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(24px)',
                        border: `1px solid ${civData.eraColor}20`,
                        boxShadow: 'inset 0 1px 0 var(--glass-inset)',
                      }}
                    >
                      <div
                        className="w-1 self-stretch rounded-full shrink-0"
                        style={{ background: civData.eraColor }}
                      />
                      <p
                        className="flex-1"
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: '12.5px',
                          lineHeight: 1.5,
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {fact}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}
          </motion.section>
        )}

        {/* ── Known For ── */}
        {civData.knownFor && (
          <motion.section className="mb-10" {...section(0.4)}>
            <SectionHeading icon={Crown} label="Known For" />
            <GlassCard className="p-5 md:p-6">
              <p
                className="italic"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: 'var(--color-text-secondary)',
                }}
              >
                {civData.knownFor}
              </p>
            </GlassCard>
          </motion.section>
        )}

        {/* ── Related Events ── */}
        {civData.relatedEvents.length > 0 && (
          <motion.section className="mb-10" {...section(0.45)}>
            <SectionHeading icon={Scroll} label={`Related Events (${civData.relatedEvents.length})`} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {civData.relatedEvents.map((event, i) => (
                <motion.button
                  key={event.id}
                  type="button"
                  onClick={() => navigate(`/explore?event=${event.id}`)}
                  className="group relative rounded-xl text-left cursor-pointer overflow-hidden"
                  style={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid var(--color-border-subtle)',
                    boxShadow: 'inset 0 1px 0 var(--glass-inset)',
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.05, ease: EASE }}
                  whileHover={{
                    y: -2,
                    borderColor: `${civData.eraColor}55`,
                    boxShadow: `0 8px 20px ${civData.eraColor}20, inset 0 1px 0 var(--glass-inset)`,
                  }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="px-5 py-4 flex items-center gap-4">
                    <div
                      className="flex-shrink-0 w-[52px] h-[52px] rounded-[10px] flex items-center justify-center"
                      style={{
                        background: `${civData.eraColor}14`,
                        border: `1px solid ${civData.eraColor}28`,
                      }}
                    >
                      <span
                        className="text-[10px] font-semibold text-center"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          color: civData.eraColor,
                        }}
                      >
                        {formatYear(event.year)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="truncate"
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: '14px',
                          fontWeight: 700,
                          color: 'var(--color-text-primary)',
                          lineHeight: 1.3,
                        }}
                      >
                        {event.title}
                      </h3>
                      {(event.locationName || event.category) && (
                        <p
                          className="truncate mt-0.5"
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '11px',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          {event.locationName ?? ''}
                          {event.locationName && event.category ? ' · ' : ''}
                          {event.category}
                        </p>
                      )}
                    </div>
                    <ChevronRight
                      size={16}
                      className="flex-shrink-0 group-hover:translate-x-0.5 transition-transform"
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Illustrations Gallery ── */}
        {hasGallery && (
          <motion.section {...section(0.5)}>
            <SectionHeading icon={Landmark} label={`Illustrations (${civData.totalImages})`} />
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
              variants={stagger}
              initial="initial"
              animate="animate"
            >
              {galleryImages.map((url, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                  style={{
                    background: 'var(--glass-strong-bg)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                  whileHover={{ scale: 1.04, y: -2 }}
                  transition={{ duration: 0.2, ease: EASE }}
                >
                  <img
                    src={url}
                    alt={`${civData.name} illustration ${i + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
                    }}
                  >
                    <span
                      className="px-3 py-2 text-[10px] font-semibold"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: '#fff',
                      }}
                    >
                      #{i + 1}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}

        <div className="h-16" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   SECTION HEADING
   ══════════════════════════════════════════ */

function SectionHeading({
  icon: Icon,
  label,
}: {
  icon: typeof Sparkles;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={14} style={{ color: 'var(--color-text-muted)' }} />
      <h2
        className="text-[11px] font-semibold tracking-[0.14em] uppercase"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </h2>
    </div>
  );
}
