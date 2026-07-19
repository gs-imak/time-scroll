import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Landmark, Search, Filter, Layers, Sparkles, Crown,
  ChevronRight, X, BookOpen,
} from 'lucide-react';
import { ALL_CIVILIZATION_LABELS } from '@/shared/data/civilizationLabels';
import { CIV_DESCRIPTIONS, NAME_DESCRIPTIONS } from '@/shared/data/civDescriptions';
import type { CivDescription } from '@/shared/data/civDescriptions';
import { ERAS, SEED_EVENTS } from '@/shared/utils/constants';
import { formatYear } from '@/shared/utils/format';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { Card } from '@/shared/components/Card';

/* ══════════════════════════════════════════
   ANIMATION PRESETS
   ══════════════════════════════════════════ */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const stagger = {
  animate: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } },
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
   CONSTANTS
   ══════════════════════════════════════════ */

const ERA_HEX: Record<string, string> = {
  prehistory: '#8d7b68',
  ancient: '#c49a44',
  classical: '#b85454',
  medieval: '#8b6faa',
  renaissance: '#5a7fb5',
  industrial: '#7a9e5a',
  modern: '#5a9aaa',
};

/** Direct image overrides for orphan labels (no description entry).
 *  Keyed by the label slug from ALL_CIVILIZATION_LABELS.
 *  'ancient-arabia' has no entry on purpose: its pack images depict Arabia while
 *  the label's events center on Giza, and no local Egypt pack exists — the styled
 *  placeholder is more honest than a wrong-civilization photo. */
const ORPHAN_LABEL_IMAGES: Record<string, string> = {
  'mauryan-empire': '/assets/civilizations/mauryan-empire/3.webp',
};

/* Name overrides for CIV_DESCRIPTIONS keys that don't derive nicely from their slug */
const NAME_OVERRIDES: Record<string, string> = {
  hre: 'Holy Roman Empire',
  arab_caliphates: 'Arab Caliphates',
  abbasid: 'Abbasid Caliphate',
  umayyad: 'Umayyad Caliphate',
  usa: 'United States',
  ussr: 'Soviet Union',
  ussr_empire: 'Soviet Union',
  prc: "People's Republic of China",
  uk: 'United Kingdom',
  hrh: 'Habsburg Empire',
};

/** Normalize a key to a URL-safe slug — lowercase, strip diacritics, spaces→hyphens */
function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritic marks
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Map a year to an era, clamping to the earliest/latest era for
 * out-of-range values (e.g. Jōmon at -14000 clamps to prehistory).
 */
function assignEra(year: number): (typeof ERAS)[number] {
  const first = ERAS[0]!;
  const last = ERAS[ERAS.length - 1]!;
  if (year < first.startYear) return first;
  if (year >= last.endYear) return last;
  return ERAS.find((e) => year >= e.startYear && year < e.endYear) ?? last;
}

/**
 * Parse the earliest year referenced in a block of text. Looks for
 * patterns like "550 BCE", "1,453 CE", "(330–1453 CE)", etc.
 * Returns the smallest year found, or null if nothing matched.
 */
function parseEarliestYearFromText(text: string): number | null {
  const years: number[] = [];

  const pushBCE = (raw: string | undefined, minVal: number) => {
    if (!raw) return;
    const n = parseInt(raw.replace(/,/g, ''), 10);
    if (!isNaN(n) && n >= minVal && n < 500000) years.push(-n);
  };
  const pushCE = (raw: string | undefined, minVal: number) => {
    if (!raw) return;
    const n = parseInt(raw.replace(/,/g, ''), 10);
    if (!isNaN(n) && n >= minVal && n < 2100) years.push(n);
  };

  // Range patterns: "312-63 BCE", "3,000-2,000 BCE", "(756-1870 CE)"
  // Use the FIRST number (the earlier/larger BCE or earlier/smaller CE)
  const bceRangeRe = /\b(\d{1,4}(?:,\d{3})*)\s*[-–—]\s*\d{1,4}(?:,\d{3})*\s*BCE\b/g;
  for (const match of text.matchAll(bceRangeRe)) pushBCE(match[1], 30);

  const ceRangeRe = /\b(\d{1,4}(?:,\d{3})*)\s*[-–—]\s*\d{1,4}(?:,\d{3})*\s*CE\b/g;
  for (const match of text.matchAll(ceRangeRe)) pushCE(match[1], 1);

  // Single BCE: "550 BCE", "3,200 BCE", "12,000 BCE" — min 3 digits to avoid
  // "1 BCE" false positives from "1st century BCE".
  const bceRe = /\b(\d{1,2}(?:,\d{3})+|\d{3,6})\s*BCE\b/g;
  for (const match of text.matchAll(bceRe)) pushBCE(match[1], 100);

  // Single CE: "476 CE", "1,453 CE" — min 2 digits (50 CE) to reject "1 CE".
  const ceRe = /\b(\d{1,2}(?:,\d{3})+|\d{2,4})\s*CE\b/g;
  for (const match of text.matchAll(ceRe)) pushCE(match[1], 50);

  // "X years ago" patterns: "400,000 years ago", "40,000 years ago"
  // Convert to approx year: current ~2025 minus years ago
  const yearsAgoRe = /\b(\d{1,3}(?:,\d{3})*|\d{3,7})\s*years?\s+ago\b/gi;
  for (const match of text.matchAll(yearsAgoRe)) {
    const raw = match[1];
    if (!raw) continue;
    const n = parseInt(raw.replace(/,/g, ''), 10);
    if (!isNaN(n) && n >= 500 && n < 5000000) years.push(2025 - n);
  }

  // Millennia: "5th millennium BCE" -> -4500 (middle of that millennium)
  const millenniumRe = /\b(\d{1,2})(?:st|nd|rd|th)?\s+millennium\s+BCE\b/gi;
  for (const match of text.matchAll(millenniumRe)) {
    const raw = match[1];
    if (!raw) continue;
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n > 0 && n < 50) years.push(-(n * 1000 - 500));
  }

  // Century patterns: "6th century BCE" -> -550, "3rd century CE" -> 250
  const centuryBceRe = /\b(\d{1,2})(?:st|nd|rd|th)?\s+century\s+BCE\b/gi;
  for (const match of text.matchAll(centuryBceRe)) {
    const raw = match[1];
    if (!raw) continue;
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n > 0 && n < 40) years.push(-(n * 100 - 50));
  }

  const centuryCeRe = /\b(\d{1,2})(?:st|nd|rd|th)?\s+century\s+CE\b/gi;
  for (const match of text.matchAll(centuryCeRe)) {
    const raw = match[1];
    if (!raw) continue;
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n > 0 && n < 25) years.push(n * 100 - 50);
  }

  // Bare year with preposition context: "in 1492", "by 1500"
  // Require 4 digits to avoid matching "by 600 million", "in 300 km", etc.
  // This does miss pre-1000 CE bare years without suffix but those are rare
  // because authors usually say "9th century" or "628 CE" for older dates.
  // Also require the year NOT be followed by a unit word.
  const bareYearRe = /\b(?:in|by|around|since|from|after|before|during|established|founded|ended|rose|fell|built|completed|until|reached|invaded|conquered|crowned|began)\s+(\d{4})\b(?!\s*(?:million|billion|thousand|years?|people|km|mi|miles?|inhabitants|BCE|CE))/gi;
  for (const match of text.matchAll(bareYearRe)) {
    const raw = match[1];
    if (!raw) continue;
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 1000 && n <= 2024) years.push(n);
  }

  // Parenthesized years: "(1776)", "(1969)" — common pattern
  const parenYearRe = /\((\d{4})\)/g;
  for (const match of text.matchAll(parenYearRe)) {
    const raw = match[1];
    if (!raw) continue;
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 1000 && n <= 2024) years.push(n);
  }

  if (years.length === 0) return null;
  return Math.min(...years);
}

/* ══════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════ */

/** 44px-tall invisible ::after hit area so slim filter pills meet the
    design-system 44px minimum touch target while staying visually compact. */
const PILL_HIT_AREA =
  "relative after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']";

function SectionHeading({
  icon: Icon,
  label,
  inline,
}: {
  icon: typeof Filter;
  label: string;
  inline?: boolean;
}) {
  const inner = (
    <div className="flex items-center gap-2">
      <Icon size={14} style={{ color: 'var(--color-text-muted)' }} />
      <h2
        className="text-[11px] font-semibold tracking-[0.14em] uppercase"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </h2>
    </div>
  );
  if (inline) return inner;
  return <div className="mb-4">{inner}</div>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  suffix,
  index,
}: {
  icon: typeof Landmark;
  label: string;
  value: number | string;
  color: string;
  suffix?: string;
  index: number;
}) {
  // Long text values (e.g. a civilization name) wrap at the era-name size
  // (18px per the typography table) instead of truncating mid-word.
  const isLongText = typeof value === 'string' && value.length > 8;

  return (
    <motion.div variants={scaleIn} custom={index}>
      <Card variant="glass" className="rounded-xl p-5 sm:p-6 relative overflow-hidden cursor-default">
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }}
        />
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${color}14` }}
          >
            <Icon size={16} style={{ color }} />
          </div>
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {label}
          </span>
        </div>
        <div className="flex items-baseline gap-1 min-w-0">
          <span
            className={
              isLongText
                ? 'text-[18px] font-semibold leading-tight break-words min-w-0'
                : 'text-2xl sm:text-[28px] font-bold'
            }
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}
          >
            {value}
          </span>
          {suffix && (
            <span
              className="text-sm font-medium"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
            >
              {suffix}
            </span>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function FilterPill({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider cursor-pointer transition-colors ${PILL_HIT_AREA}`}
      style={{
        background: active ? `${color}20` : 'var(--glass-bg)',
        border: `1px solid ${active ? `${color}50` : 'var(--color-border-subtle)'}`,
        color: active ? color : 'var(--color-text-muted)',
        backdropFilter: 'blur(12px)',
        fontFamily: 'var(--font-display)',
      }}
      whileHover={{ scale: 1.05, borderColor: `${color}60` }}
      whileTap={{ scale: 0.95 }}
    >
      {label}
    </motion.button>
  );
}

type Civ = {
  slug: string;
  name: string;
  eventCount: number;
  eraId: string;
  eraName: string;
  eraColor: string;
  earliestYear: number;
  imageUrl: string | null;
  summary: string | null;
  knownFor: string | null;
};

function CivCard({
  civ,
  onOpen,
}: {
  civ: Civ;
  onOpen: (slug: string) => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(civ.imageUrl) && !imgFailed;

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(civ.slug)}
      variants={scaleIn}
      className="
        group relative rounded-2xl overflow-hidden text-left cursor-pointer
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold
        focus-visible:ring-offset-2 focus-visible:ring-offset-void
      "
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: 'inset 0 1px 0 var(--glass-inset)',
        // CSS-only virtualization: with ~200 cards on one page, skip
        // rendering work for off-screen cards. The intrinsic size estimate
        // (~320px tall) keeps the scrollbar stable while skipped.
        contentVisibility: 'auto',
        containIntrinsicSize: 'auto 320px',
      }}
      whileHover={{
        y: -4,
        borderColor: `${civ.eraColor}60`,
        boxShadow: `0 14px 36px ${civ.eraColor}25, inset 0 1px 0 var(--glass-inset)`,
      }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.25, ease: EASE }}
    >
      {/* Hero image — era-gradient + Landmark underlay always renders; the
          <img> covers it when it loads and unmounts on error (fixed 160px
          box, no broken glyph, no layout jump). */}
      <div className="relative h-[160px] overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${civ.eraColor}25 0%, ${civ.eraColor}08 100%)`,
          }}
          aria-hidden="true"
        >
          <Landmark size={48} style={{ color: `${civ.eraColor}80` }} />
        </div>
        {showImage && (
          <img
            src={civ.imageUrl!}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            style={{ objectPosition: 'center 25%' }}
            onError={() => setImgFailed(true)}
            aria-hidden="true"
          />
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.85) 100%)',
          }}
        />

        {/* Era chip */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{
            background: `${civ.eraColor}40`,
            border: `1px solid ${civ.eraColor}90`,
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#fff', boxShadow: '0 0 4px #fff' }}
          />
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: '#fff', fontFamily: 'var(--font-display)' }}
          >
            {civ.eraName}
          </span>
        </div>

        {/* Name anchored to bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3
            className="mb-0.5"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '19px',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.2,
              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {civ.name}
          </h3>
          <p
            className="text-[11px]"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'rgba(255,255,255,0.75)',
              textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            }}
          >
            First event: {formatYear(civ.earliestYear)}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 md:p-5">
        {civ.summary ? (
          <p
            className="mb-3"
            style={{
              fontSize: '12.5px',
              lineHeight: 1.55,
              color: 'var(--color-text-secondary)',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {civ.summary}
          </p>
        ) : (
          <p
            className="mb-3 italic"
            style={{
              fontSize: '12.5px',
              lineHeight: 1.55,
              color: 'var(--color-text-muted)',
            }}
          >
            No description yet — {civ.eventCount} events on record.
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between gap-3">
          <span
            className="flex items-center gap-1"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-muted)',
            }}
          >
            <BookOpen size={12} />
            {civ.eventCount} event{civ.eventCount !== 1 ? 's' : ''}
          </span>
          <div
            className="flex items-center gap-1 transition-colors"
            style={{ color: civ.eraColor }}
          >
            <span
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Explore
            </span>
            <ChevronRight
              size={13}
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════ */

export default function CivilizationIndex() {
  const navigate = useNavigate();
  const events = useEventsStore((s) => s.events);

  const [selectedEras, setSelectedEras] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  /* ── Build enriched civ list from CIV_DESCRIPTIONS (primary) + events (augment) ── */

  const enrichedCivs: Civ[] = useMemo(() => {
    // Step 1: Build lookup from label slug (e.g. "ancient-rome") to label
    const labelByDescriptionKey = new Map<string, (typeof ALL_CIVILIZATION_LABELS)[number]>();
    for (const label of ALL_CIVILIZATION_LABELS) {
      // Register under normalized keys that match CIV_DESCRIPTIONS keys
      const normalized = label.slug
        .replace(/^ancient-/, '')
        .replace(/^kingdom-of-/, '')
        .replace(/-empire$/, '');
      labelByDescriptionKey.set(normalized, label);
      labelByDescriptionKey.set(label.slug, label);
    }

    // Step 2: Walk both CIV_DESCRIPTIONS (26) + NAME_DESCRIPTIONS (137)
    const result: Civ[] = [];
    const seenNormalizedSlugs = new Set<string>();

    // Build a unified entry list from both description sources
    type EntryTuple = [string, CivDescription];
    const civEntries: EntryTuple[] = Object.entries(CIV_DESCRIPTIONS) as EntryTuple[];
    const nameEntries: EntryTuple[] = Object.entries(NAME_DESCRIPTIONS).map(
      ([name, desc]) => [
        name,
        {
          summary: desc.summary,
          detail: desc.detail,
          knownFor: desc.knownFor,
          keyFacts: desc.keyFacts,
          imageUrl: desc.imageUrl ?? '',
        },
      ],
    );
    const entries: EntryTuple[] = [...civEntries, ...nameEntries];

    for (const [rawKey, desc] of entries) {
      // Normalize the key for deduplication
      const normalizedSlug = slugify(rawKey);
      if (seenNormalizedSlugs.has(normalizedSlug)) continue;
      seenNormalizedSlugs.add(normalizedSlug);

      // Try to match to a label for event-based era/count
      const label = labelByDescriptionKey.get(rawKey) ?? labelByDescriptionKey.get(normalizedSlug);

      // Determine earliest year
      let earliestYear: number | null = null;

      if (label && label.eventIds.length > 0) {
        // Use earliest event year
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

      if (earliestYear === null) {
        // Parse earliest year from description/keyFacts text
        const combined = [
          desc.summary,
          desc.detail ?? '',
          ...(desc.keyFacts ?? []),
        ].join(' ');
        earliestYear = parseEarliestYearFromText(combined);
      }

      // Assign to era. If no year found, bucket as "ancient" by default
      // (more accurate than "modern" for undated historical civilizations).
      const effectiveYear = earliestYear ?? -2000;
      const era = assignEra(effectiveYear);
      const eraColor = ERA_HEX[era.id] ?? '#8a8a9a';

      const finalYear = earliestYear ?? effectiveYear;

      // Display name — use label name if available, else derive from key.
      // If the rawKey already has capital letters (like "Đại Việt" or
      // "Tuʻi Tonga Empire"), use it as-is. Only derive from slug-style keys.
      const hasProperCase = /[A-Z]/.test(rawKey) && rawKey.includes(' ');
      const displayName = label
        ? label.name
        : NAME_OVERRIDES[rawKey] ??
          (hasProperCase
            ? rawKey
            : rawKey
                .replace(/[_']/g, ' ')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase()));

      // Image: description image only. NO illustration pack fallback.
      const imageUrl: string | null = desc.imageUrl || null;

      // Slug for navigation — prefer label slug so the gallery route works
      const navSlug = label?.slug ?? normalizedSlug;

      result.push({
        slug: navSlug,
        name: displayName,
        eventCount: label?.eventIds.length ?? 0,
        eraId: era.id,
        eraName: era.name,
        eraColor,
        earliestYear: finalYear,
        imageUrl,
        summary: desc.summary,
        knownFor: desc.knownFor,
      });
    }

    // Also include any labels without a description (rare edge case)
    for (const label of ALL_CIVILIZATION_LABELS) {
      const normalized = label.slug
        .replace(/^ancient-/, '')
        .replace(/^kingdom-of-/, '')
        .replace(/-empire$/, '');
      if (seenNormalizedSlugs.has(normalized)) continue;
      if (seenNormalizedSlugs.has(label.slug)) continue;
      seenNormalizedSlugs.add(label.slug);

      let earliestYear: number | null = null;
      for (const eventId of label.eventIds) {
        const evt =
          events.find((e) => e.id === eventId) ??
          SEED_EVENTS.find((e) => e.id === eventId);
        if (!evt) continue;
        if (earliestYear === null || evt.year < earliestYear) {
          earliestYear = evt.year;
        }
      }
      const effectiveYear = earliestYear ?? -2000;
      const era = assignEra(effectiveYear);
      // Real-photo override for orphan labels that have no description entry.
      const imageUrl: string | null = ORPHAN_LABEL_IMAGES[label.slug] ?? null;

      result.push({
        slug: label.slug,
        name: label.name,
        eventCount: label.eventIds.length,
        eraId: era.id,
        eraName: era.name,
        eraColor: ERA_HEX[era.id] ?? '#8a8a9a',
        earliestYear: earliestYear ?? effectiveYear,
        imageUrl,
        summary: null,
        knownFor: null,
      });
    }

    return result.sort((a, b) => a.earliestYear - b.earliestYear);
  }, [events]);

  /* ── Filter + search ── */

  const filteredCivs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enrichedCivs.filter((c) => {
      if (selectedEras.length > 0 && !selectedEras.includes(c.eraId)) return false;
      if (q) {
        const matchName = c.name.toLowerCase().includes(q);
        const matchSummary = c.summary?.toLowerCase().includes(q) ?? false;
        if (!matchName && !matchSummary) return false;
      }
      return true;
    });
  }, [enrichedCivs, selectedEras, searchQuery]);

  /* ── Group by era for rendering ── */

  const grouped = useMemo(() => {
    const sections: { era: (typeof ERAS)[number]; civs: Civ[] }[] = [];
    for (const era of ERAS) {
      const eraCivs = filteredCivs.filter((c) => c.eraId === era.id);
      if (eraCivs.length > 0) sections.push({ era, civs: eraCivs });
    }
    return sections;
  }, [filteredCivs]);

  /* ── Aggregate stats ── */

  const totalCivs = enrichedCivs.length;
  const describedCivs = useMemo(
    () => enrichedCivs.filter((c) => c.summary !== null).length,
    [enrichedCivs],
  );
  const eraCount = useMemo(
    () => new Set(enrichedCivs.map((c) => c.eraId)).size,
    [enrichedCivs],
  );
  const oldestCivName = useMemo(() => {
    const oldest = enrichedCivs[0];
    return oldest?.name ?? '—';
  }, [enrichedCivs]);

  const filtersActive = selectedEras.length > 0 || searchQuery.trim().length > 0;

  /* ── Handlers ── */

  const openCiv = useCallback(
    (slug: string) => {
      navigate(`/civilizations/${slug}`);
    },
    [navigate],
  );

  const toggleEra = useCallback((eraId: string) => {
    setSelectedEras((prev) =>
      prev.includes(eraId) ? prev.filter((e) => e !== eraId) : [...prev, eraId],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedEras([]);
    setSearchQuery('');
  }, []);

  /* ══════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════ */

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden overflow-y-auto lg:pl-[64px]"
      style={{
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(196,154,68,0.05) 0%, transparent 45%),
          radial-gradient(ellipse at 80% 60%, rgba(184,84,84,0.025) 0%, transparent 50%),
          radial-gradient(ellipse at 20% 85%, rgba(139,111,170,0.025) 0%, transparent 50%),
          var(--color-void)
        `,
      }}
    >
      {/* pt-20 below lg clears the fixed mobile nav button: 12px offset + 44px
          button + 24px (xl) gap = 80px. Desktop sidebar appears at lg. */}
      <div className="w-full max-w-[1200px] mx-auto px-5 sm:px-8 md:px-10 pt-20 lg:pt-14 pb-10 md:pb-14">
        {/* ─────────────────────────────────
            SECTION 1 — Hero Header
           ───────────────────────────────── */}
        <motion.header className="mb-8" {...section(0)}>
          <div className="flex items-center gap-4 mb-5">
            <motion.button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center w-[44px] h-[44px] rounded-[10px] cursor-pointer shrink-0"
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(24px)',
                border: '1px solid var(--color-border-subtle)',
              }}
              whileHover={{ scale: 1.08, borderColor: 'rgba(196, 154, 68, 0.3)' }}
              whileTap={{ scale: 0.93 }}
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={20} style={{ color: 'var(--color-text-secondary)' }} />
            </motion.button>

            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'rgba(196,154,68,0.1)',
                border: '1px solid rgba(196,154,68,0.2)',
              }}
            >
              <Landmark size={22} style={{ color: 'var(--color-accent-gold)' }} />
            </div>

            <h1
              className="text-[30px] sm:text-[38px] font-bold truncate"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text-primary)',
                lineHeight: 1.1,
              }}
            >
              Civilizations
            </h1>
          </div>

          <p
            className="text-[14px] max-w-[620px] leading-relaxed sm:pl-[60px]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Explore the{' '}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-accent-gold)',
                fontWeight: 600,
              }}
            >
              {totalCivs}
            </span>{' '}
            great cultures that shaped human history, from the earliest agricultural
            societies to the modern nation-state. Grouped chronologically across{' '}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-accent-gold)',
                fontWeight: 600,
              }}
            >
              {eraCount}
            </span>{' '}
            eras of history.
          </p>
        </motion.header>

        {/* ─────────────────────────────────
            SECTION 2 — Stats Row
           ───────────────────────────────── */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          <StatCard
            icon={Landmark}
            label="Civilizations"
            value={totalCivs}
            color="#c49a44"
            index={0}
          />
          <StatCard
            icon={BookOpen}
            label="Described"
            value={describedCivs}
            suffix={`/${totalCivs}`}
            color="#6d9476"
            index={1}
          />
          <StatCard icon={Layers} label="Eras" value={eraCount} color="#5a9aaa" index={2} />
          {/* Full name — StatCard wraps long text; never mid-word ellipsis */}
          <StatCard
            icon={Crown}
            label="Oldest"
            value={oldestCivName}
            color="#b87a60"
            index={3}
          />
        </motion.div>

        {/* ─────────────────────────────────
            SECTION 3 — Search + Era Filters
           ───────────────────────────────── */}
        <motion.section className="mb-8" {...section(0.15)}>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <SectionHeading icon={Filter} label="Filter by Era" inline />
            <span
              className="text-[11px] font-medium"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
              }}
            >
              {filteredCivs.length} of {totalCivs} shown
            </span>
          </div>

          {/* Search input */}
          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search civilizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 rounded-full text-[12px] outline-none"
              style={{
                fontFamily: 'var(--font-display)',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
              }}
              aria-label="Search civilizations"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center cursor-pointer"
                aria-label="Clear search"
              >
                <X size={13} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            )}
          </div>

          {/* Era pills */}
          <div className="flex flex-wrap items-center gap-2">
            {ERAS.map((era) => {
              const color = ERA_HEX[era.id] ?? '#8a8a9a';
              return (
                <FilterPill
                  key={era.id}
                  label={era.name}
                  color={color}
                  active={selectedEras.includes(era.id)}
                  onClick={() => toggleEra(era.id)}
                />
              );
            })}
            {filtersActive && (
              <motion.button
                type="button"
                onClick={clearFilters}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium cursor-pointer ${PILL_HIT_AREA}`}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-muted)',
                }}
                whileHover={{ scale: 1.05, color: 'var(--color-text-primary)' }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={12} />
                Clear
              </motion.button>
            )}
          </div>
        </motion.section>

        {/* ─────────────────────────────────
            SECTION 4 — Era-grouped Civ Grid
           ───────────────────────────────── */}
        {grouped.length === 0 ? (
          <Card variant="glass" className="rounded-xl p-10 text-center">
            <p className="text-[14px] mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              No civilizations match your filters.
            </p>
            <motion.button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer"
              style={{
                background: 'rgba(196,154,68,0.12)',
                border: '1px solid rgba(196,154,68,0.25)',
                color: 'var(--color-accent-gold)',
                fontFamily: 'var(--font-display)',
                fontSize: '12px',
                fontWeight: 600,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={13} />
              Clear filters
            </motion.button>
          </Card>
        ) : (
          <div className="space-y-10 md:space-y-12">
            {grouped.map(({ era, civs }) => {
              const eraColor = ERA_HEX[era.id] ?? '#8a8a9a';
              return (
                <motion.section
                  key={era.id}
                  aria-label={`${era.name} civilizations`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  {/* Era divider */}
                  <div className="flex items-center gap-4 mb-5">
                    <div
                      className="w-1 h-8 rounded-full shrink-0"
                      style={{ background: eraColor }}
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <h2
                        className="mb-0.5"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'clamp(18px, 2.5vw, 22px)',
                          fontWeight: 700,
                          color: eraColor,
                          letterSpacing: '0.01em',
                        }}
                      >
                        {era.name}
                      </h2>
                      <p
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {formatYear(era.startYear)} — {formatYear(era.endYear)} ·{' '}
                        {civs.length} civilization{civs.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div
                      className="hidden md:block flex-1 h-px"
                      style={{
                        background: `linear-gradient(90deg, ${eraColor}50, transparent)`,
                      }}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Civ grid */}
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    variants={stagger}
                    initial="initial"
                    animate="animate"
                  >
                    {civs.map((civ) => (
                      <CivCard key={civ.slug} civ={civ} onOpen={openCiv} />
                    ))}
                  </motion.div>
                </motion.section>
              );
            })}
          </div>
        )}

        {/* Bottom stats footer */}
        {grouped.length > 0 && (
          <motion.div
            className="flex items-center justify-center gap-2 mt-16 py-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles size={13} style={{ color: 'var(--color-text-muted)' }} />
            <span
              className="text-[11px]"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
                letterSpacing: '0.08em',
              }}
            >
              {filteredCivs.length} civilization{filteredCivs.length !== 1 ? 's' : ''} · {grouped.length} era
              {grouped.length !== 1 ? 's' : ''}
            </span>
          </motion.div>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}
