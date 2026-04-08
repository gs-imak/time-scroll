import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Landmark, Search, Filter, Layers, Sparkles, Crown,
  ChevronRight, X, BookOpen,
} from 'lucide-react';
import { ALL_CIVILIZATION_LABELS } from '@/shared/data/civilizationLabels';
import { EVENT_CIVILIZATION, getCivImageUrl } from '@/shared/data/civilizationAssets';
import { CIV_DESCRIPTIONS } from '@/shared/data/civDescriptions';
import { ERAS, SEED_EVENTS } from '@/shared/utils/constants';
import { formatYear } from '@/shared/utils/format';
import { useEventsStore } from '@/shared/stores/eventsStore';

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

/* ══════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════ */

function GlassCard({
  children,
  className,
  strong,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { strong?: boolean }) {
  return (
    <div
      className={`rounded-xl transition-all duration-200 ${className ?? ''}`}
      style={{
        background: strong ? 'var(--glass-strong-bg)' : 'var(--glass-bg)',
        backdropFilter: strong ? 'blur(40px)' : 'blur(24px)',
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
  return (
    <motion.div variants={scaleIn} custom={index}>
      <GlassCard className="p-5 sm:p-6 relative overflow-hidden cursor-default">
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
        <div className="flex items-baseline gap-1">
          <span
            className="text-2xl sm:text-[28px] font-bold"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-text-primary)' }}
          >
            {value}
          </span>
          {suffix && (
            <span
              className="text-sm font-medium"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-text-muted)' }}
            >
              {suffix}
            </span>
          )}
        </div>
      </GlassCard>
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
      className="px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider cursor-pointer transition-colors"
      style={{
        background: active ? `${color}20` : 'var(--glass-bg)',
        border: `1px solid ${active ? `${color}50` : 'var(--color-border-subtle)'}`,
        color: active ? color : 'var(--color-text-muted)',
        backdropFilter: 'blur(12px)',
        fontFamily: "'Space Grotesk', sans-serif",
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
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(civ.slug)}
      variants={scaleIn}
      className="
        group relative rounded-2xl overflow-hidden text-left cursor-pointer
        focus-visible:outline-none focus-visible:ring-2
      "
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: 'inset 0 1px 0 var(--glass-inset)',
      }}
      whileHover={{
        y: -4,
        borderColor: `${civ.eraColor}60`,
        boxShadow: `0 14px 36px ${civ.eraColor}25, inset 0 1px 0 var(--glass-inset)`,
      }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.25, ease: EASE }}
    >
      {/* Hero image */}
      <div className="relative h-[160px] overflow-hidden">
        {civ.imageUrl ? (
          <div
            className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.06]"
            style={{
              backgroundImage: `url(${civ.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            aria-hidden="true"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${civ.eraColor}25 0%, ${civ.eraColor}08 100%)`,
            }}
          >
            <Landmark size={48} style={{ color: `${civ.eraColor}80` }} />
          </div>
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
            style={{ color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {civ.eraName}
          </span>
        </div>

        {/* Name anchored to bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3
            className="mb-0.5"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
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
              fontFamily: "'JetBrains Mono', monospace",
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
              fontFamily: "'JetBrains Mono', monospace",
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
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
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

  /* ── Build enriched civ list with era assignment ── */

  const enrichedCivs: Civ[] = useMemo(() => {
    return ALL_CIVILIZATION_LABELS.map((label) => {
      // Find earliest event for this civ to determine primary era
      let earliestYear = Infinity;
      let earliestEraId = 'modern';
      for (const eventId of label.eventIds) {
        const evt =
          events.find((e) => e.id === eventId) ??
          SEED_EVENTS.find((e) => e.id === eventId);
        if (!evt) continue;
        if (evt.year < earliestYear) {
          earliestYear = evt.year;
          earliestEraId = evt.eraId;
        }
      }
      const era = ERAS.find((e) => e.id === earliestEraId) ?? ERAS[ERAS.length - 1]!;
      const eraColor = ERA_HEX[era.id] ?? '#8a8a9a';

      // Get description — try multiple slug variants
      // ALL_CIVILIZATION_LABELS uses "ancient-rome", "ancient-greece"
      // CIV_DESCRIPTIONS uses "rome", "greece", etc.
      const slugVariants = [
        label.slug,
        label.slug.replace(/^ancient-/, ''),
        label.slug.replace(/^kingdom-of-/, ''),
        label.slug.replace(/-empire$/, ''),
      ];
      let desc: (typeof CIV_DESCRIPTIONS)[string] | undefined;
      for (const s of slugVariants) {
        if (CIV_DESCRIPTIONS[s]) {
          desc = CIV_DESCRIPTIONS[s];
          break;
        }
      }

      // Fallback to pack thumbnail if no description image
      let imageUrl: string | null = desc?.imageUrl ?? null;
      if (!imageUrl) {
        const pack = Object.values(EVENT_CIVILIZATION).find((p) => p.slug === label.slug);
        if (pack) imageUrl = getCivImageUrl(label.slug, pack.thumbnail);
      }

      return {
        slug: label.slug,
        name: label.name,
        eventCount: label.eventIds.length,
        eraId: era.id,
        eraName: era.name,
        eraColor,
        earliestYear: earliestYear === Infinity ? 0 : earliestYear,
        imageUrl,
        summary: desc?.summary ?? null,
        knownFor: desc?.knownFor ?? null,
      };
    }).sort((a, b) => a.earliestYear - b.earliestYear);
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
      <div className="w-full max-w-[1200px] mx-auto px-5 sm:px-8 md:px-10 py-10 md:py-14">
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
                fontFamily: "'Space Grotesk', sans-serif",
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
                fontFamily: "'JetBrains Mono', monospace",
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
                fontFamily: "'JetBrains Mono', monospace",
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
          <StatCard
            icon={Crown}
            label="Oldest"
            value={oldestCivName.length > 10 ? `${oldestCivName.slice(0, 10)}…` : oldestCivName}
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
                fontFamily: "'JetBrains Mono', monospace",
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
                fontFamily: "'Space Grotesk', sans-serif",
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
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
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
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium cursor-pointer"
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
          <GlassCard className="p-10 text-center">
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
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '12px',
                fontWeight: 600,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={13} />
              Clear filters
            </motion.button>
          </GlassCard>
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
                          fontFamily: "'Space Grotesk', sans-serif",
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
                          fontFamily: "'JetBrains Mono', monospace",
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
                fontFamily: "'JetBrains Mono', monospace",
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
