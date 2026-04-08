import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, Filter, Layers, Sparkles, Scroll,
  CheckCircle2, ChevronRight, Compass, X,
} from 'lucide-react';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { useProgressStore } from '@/shared/stores/progressStore';
import { ERAS } from '@/shared/utils/constants';
import { EVENT_ICONS } from '@/features/globe/eventMarkers';
import { formatYear } from '@/shared/utils/format';
import type { EventCategory, HistoricalEvent } from '@/shared/types/events';

/* ══════════════════════════════════════════
   ANIMATION PRESETS (mirror QuizHub)
   ══════════════════════════════════════════ */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const stagger = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
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
   COLOR MAPS (needed for dynamic ${color}XX alpha)
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

const CATEGORY_HEX: Record<EventCategory, string> = {
  war: '#b85454',
  discovery: '#5a8fa5',
  cultural: '#c49a44',
  political: '#8b80b0',
  construction: '#6d9476',
  natural: '#b87a60',
};

const CATEGORY_LABELS: { id: EventCategory; label: string }[] = [
  { id: 'war', label: 'War' },
  { id: 'discovery', label: 'Discovery' },
  { id: 'cultural', label: 'Cultural' },
  { id: 'political', label: 'Political' },
  { id: 'construction', label: 'Construction' },
  { id: 'natural', label: 'Natural' },
];

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
  icon: typeof Scroll;
  label: string;
  value: number | string;
  color: string;
  suffix?: string;
  index: number;
}) {
  return (
    <motion.div variants={scaleIn} custom={index}>
      <GlassCard className="p-5 sm:p-6 group cursor-default relative overflow-hidden">
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
      className="px-3 py-1.5 rounded-full text-[11px] font-medium cursor-pointer transition-colors"
      style={{
        background: active ? `${color}20` : 'var(--glass-bg)',
        border: `1px solid ${active ? `${color}50` : 'var(--color-border-subtle)'}`,
        color: active ? color : 'var(--color-text-muted)',
        backdropFilter: 'blur(12px)',
      }}
      whileHover={{ scale: 1.05, borderColor: `${color}60` }}
      whileTap={{ scale: 0.95 }}
    >
      {label}
    </motion.button>
  );
}

function EventCard({
  event,
  viewed,
  index,
  onOpen,
}: {
  event: HistoricalEvent;
  viewed: boolean;
  index: number;
  onOpen: (id: string) => void;
}) {
  const color = CATEGORY_HEX[event.category] ?? '#8a8a9a';
  const icon = EVENT_ICONS[event.id] ?? '●';
  const hasImage = Boolean(event.imageUrl);

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(event.id)}
      className="
        group relative flex items-stretch gap-4 w-full
        rounded-xl text-left cursor-pointer overflow-hidden
        focus-visible:outline-none focus-visible:ring-2
      "
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: 'inset 0 1px 0 var(--glass-inset)',
        opacity: viewed ? 1 : 0.75,
      }}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: viewed ? 1 : 0.75, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.04, ease: EASE }}
      whileHover={{
        scale: 1.008,
        y: -2,
        borderColor: `${color}55`,
        boxShadow: `0 8px 24px ${color}20, inset 0 1px 0 var(--glass-inset)`,
      }}
      whileTap={{ scale: 0.995 }}
    >
      {/* Thumbnail or emoji fallback — full-height stripe */}
      {hasImage ? (
        <div
          className="relative w-[88px] sm:w-[128px] md:w-[160px] shrink-0 self-stretch"
          style={{
            backgroundImage: `url(${event.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '104px',
          }}
          aria-hidden="true"
        >
          {/* Right-fade for seamless blend into card background */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, transparent 55%, var(--glass-bg) 100%)',
            }}
          />
          {/* Category tag in corner */}
          <div
            className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              background: `${color}30`,
              border: `1px solid ${color}60`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: color, boxShadow: `0 0 6px ${color}` }}
            />
            <span
              className="text-[9px] font-semibold uppercase tracking-wider"
              style={{ color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {event.category}
            </span>
          </div>
        </div>
      ) : (
        <div
          className="flex items-center justify-center w-[88px] sm:w-[128px] md:w-[160px] shrink-0 self-stretch"
          style={{
            background: `${color}12`,
            borderRight: `1px solid ${color}25`,
            fontSize: '38px',
            minHeight: '104px',
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      {/* Text block */}
      <div className="flex-1 min-w-0 flex flex-col justify-center py-4 pr-4 md:pr-5">
        <div className="flex items-baseline justify-between gap-3 mb-1.5">
          <h3
            className="min-w-0 flex-1"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(15px, 1.4vw, 17px)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              lineHeight: 1.25,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {event.title}
          </h3>
          <span
            className="shrink-0 px-2 py-0.5 rounded-md"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              fontWeight: 600,
              color,
              background: `${color}14`,
              border: `1px solid ${color}25`,
              whiteSpace: 'nowrap',
            }}
          >
            {formatYear(event.year)}
          </span>
        </div>

        {event.description && (
          <p
            style={{
              fontSize: '12.5px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.55,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {event.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 mt-2">
          {event.locationName ? (
            <span
              className="truncate"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                color: 'var(--color-text-muted)',
              }}
            >
              {event.locationName}
            </span>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            {viewed ? (
              <>
                <CheckCircle2 size={13} style={{ color: '#6d9476' }} />
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: '#6d9476' }}
                >
                  Explored
                </span>
              </>
            ) : (
              <>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Read
                </span>
                <ChevronRight
                  size={13}
                  className="group-hover:translate-x-0.5 transition-transform duration-200"
                  style={{ color: 'var(--color-text-muted)' }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function EraChapter({
  era,
  events,
  explored,
  viewedEvents,
  onOpenEvent,
}: {
  era: (typeof ERAS)[number];
  events: HistoricalEvent[];
  explored: number;
  viewedEvents: string[];
  onOpenEvent: (id: string) => void;
}) {
  const eraColor = ERA_HEX[era.id] ?? '#8a8a9a';
  const total = events.length;

  return (
    <motion.section
      id={`era-${era.id}`}
      aria-label={`${era.name} era`}
      className="relative rounded-2xl overflow-hidden scroll-mt-10"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: EASE }}
      style={{
        background: `linear-gradient(180deg, ${eraColor}0E 0%, transparent 30%), var(--glass-bg)`,
        backdropFilter: 'blur(24px)',
        border: `1px solid ${eraColor}22`,
        boxShadow: 'inset 0 1px 0 var(--glass-inset)',
      }}
    >
      {/* Left-edge colored stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: eraColor, opacity: 0.6 }}
        aria-hidden="true"
      />

      <div className="px-5 md:px-8 py-7 md:py-9">
        {/* Era header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6 md:mb-8">
          <div className="flex-1 min-w-0">
            <h2
              className="mb-1"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(20px, 3vw, 26px)',
                fontWeight: 700,
                color: eraColor,
                letterSpacing: '0.01em',
                lineHeight: 1.15,
              }}
            >
              {era.name}
            </h2>
            <p
              className="mb-3"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                color: 'var(--color-text-muted)',
              }}
            >
              {formatYear(era.startYear)} — {formatYear(era.endYear)}
            </p>
            <p
              className="max-w-[560px]"
              style={{
                fontSize: '13px',
                lineHeight: 1.55,
                color: 'var(--color-text-secondary)',
              }}
            >
              {era.description}
            </p>
          </div>

          {/* Era progress badge */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0"
            style={{
              background: `${eraColor}15`,
              border: `1px solid ${eraColor}30`,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <CheckCircle2 size={12} style={{ color: eraColor }} />
            <span
              className="text-[11px] font-semibold"
              style={{ color: eraColor }}
            >
              {explored}/{total}
            </span>
          </div>
        </div>

        {/* Event list — full-width stacked cards */}
        <div className="flex flex-col gap-3">
          {events.map((event, i) => (
            <EventCard
              key={event.id}
              event={event}
              viewed={viewedEvents.includes(event.id)}
              index={i}
              onOpen={onOpenEvent}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════ */

export default function TimelineView() {
  const navigate = useNavigate();
  const events = useEventsStore((s) => s.events);
  const viewedEvents = useProgressStore((s) => s.viewedEvents);

  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const [unexploredOnly, setUnexploredOnly] = useState(false);

  /* ── Data derivations ── */

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.year - b.year),
    [events],
  );

  const filteredEvents = useMemo(() => {
    return sortedEvents.filter((e) => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(e.category))
        return false;
      if (unexploredOnly && viewedEvents.includes(e.id)) return false;
      return true;
    });
  }, [sortedEvents, selectedCategories, unexploredOnly, viewedEvents]);

  const grouped = useMemo(() => {
    const sections: {
      era: (typeof ERAS)[number];
      events: HistoricalEvent[];
      explored: number;
    }[] = [];
    for (const era of ERAS) {
      const eraEvents = filteredEvents.filter((e) => e.eraId === era.id);
      if (eraEvents.length > 0) {
        const explored = eraEvents.filter((e) => viewedEvents.includes(e.id)).length;
        sections.push({ era, events: eraEvents, explored });
      }
    }
    return sections;
  }, [filteredEvents, viewedEvents]);

  const totalCount = events.length;
  const viewedCount = viewedEvents.length;
  const eraCount = grouped.length;

  const yearSpanLabel = useMemo(() => {
    const first = events[0];
    if (!first) return '—';
    let min = first.year;
    let max = first.year;
    for (const e of events) {
      if (e.year < min) min = e.year;
      if (e.year > max) max = e.year;
    }
    const span = max - min;
    if (span >= 1000) return `${Math.round(span / 1000)}k`;
    return `${span}`;
  }, [events]);

  const filteredCount = filteredEvents.length;
  const filtersActive = selectedCategories.length > 0 || unexploredOnly;

  /* ── Handlers ── */

  const openEvent = useCallback(
    (id: string) => {
      navigate(`/explore?event=${id}`);
    },
    [navigate],
  );

  const toggleCategory = useCallback((cat: EventCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategories([]);
    setUnexploredOnly(false);
  }, []);

  const jumpToEra = useCallback((eraId: string) => {
    const el = document.getElementById(`era-${eraId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          radial-gradient(ellipse at 80% 40%, rgba(90,154,170,0.03) 0%, transparent 50%),
          radial-gradient(ellipse at 20% 70%, rgba(139,111,170,0.02) 0%, transparent 50%),
          var(--color-void)
        `,
      }}
    >
      <div className="w-full max-w-[1000px] mx-auto px-5 sm:px-8 md:px-10 py-10 md:py-14">
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
              <Clock size={22} style={{ color: 'var(--color-accent-gold)' }} />
            </div>

            <h1
              className="text-[30px] sm:text-[38px] font-bold truncate"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: 'var(--color-text-primary)',
                lineHeight: 1.1,
              }}
            >
              Timeline
            </h1>
          </div>

          <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row sm:pl-[60px]">
            <p
              className="text-[14px] max-w-[560px] leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Every event in chronological order —{' '}
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--color-accent-gold)',
                  fontWeight: 600,
                }}
              >
                {totalCount}
              </span>{' '}
              moments that shaped human civilization across{' '}
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--color-accent-gold)',
                  fontWeight: 600,
                }}
              >
                {ERAS.length}
              </span>{' '}
              eras of history.
            </p>

            {/* Progress pill */}
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full shrink-0"
              style={{
                background: 'rgba(196, 154, 68, 0.12)',
                border: '1px solid rgba(196, 154, 68, 0.2)',
              }}
            >
              <Compass size={14} style={{ color: 'var(--color-accent-gold)' }} />
              <span
                className="text-[12px] font-semibold"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--color-accent-gold)',
                }}
              >
                {viewedCount}/{totalCount} Explored
              </span>
            </div>
          </div>
        </motion.header>

        {/* ─────────────────────────────────
            SECTION 2 — Stats Row (4 cards)
           ───────────────────────────────── */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          <StatCard
            icon={Scroll}
            label="Events"
            value={totalCount}
            color="#c49a44"
            index={0}
          />
          <StatCard
            icon={CheckCircle2}
            label="Explored"
            value={viewedCount}
            suffix={`/${totalCount}`}
            color="#6d9476"
            index={1}
          />
          <StatCard
            icon={Layers}
            label="Eras"
            value={eraCount}
            color="#5a9aaa"
            index={2}
          />
          <StatCard
            icon={Sparkles}
            label="Years"
            value={yearSpanLabel}
            color="#b87a60"
            index={3}
          />
        </motion.div>

        {/* ─────────────────────────────────
            SECTION 3 — Filter Bar
           ───────────────────────────────── */}
        <motion.section className="mb-7" {...section(0.15)}>
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <SectionHeading icon={Filter} label="Filter by Category" inline />
            <span
              className="text-[11px] font-medium"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--color-text-muted)',
              }}
            >
              {filteredCount} of {totalCount} events
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {CATEGORY_LABELS.map((cat) => (
              <FilterPill
                key={cat.id}
                label={cat.label}
                color={CATEGORY_HEX[cat.id]}
                active={selectedCategories.includes(cat.id)}
                onClick={() => toggleCategory(cat.id)}
              />
            ))}

            {/* Divider */}
            <div
              className="w-px h-5 mx-1"
              style={{ background: 'var(--color-border-subtle)' }}
            />

            <FilterPill
              label="Unexplored only"
              color="#c49a44"
              active={unexploredOnly}
              onClick={() => setUnexploredOnly((v) => !v)}
            />

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
            SECTION 4 — Era Jump Navigation (desktop)
           ───────────────────────────────── */}
        <motion.nav
          aria-label="Era navigation"
          className="hidden md:flex flex-wrap items-center gap-2 mb-10"
          {...section(0.2)}
        >
          <span
            className="text-[11px] font-semibold tracking-[0.14em] uppercase mr-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Jump to
          </span>
          {ERAS.map((era) => {
            const eraColor = ERA_HEX[era.id] ?? '#8a8a9a';
            const disabled = !grouped.some((g) => g.era.id === era.id);
            return (
              <motion.button
                key={era.id}
                type="button"
                onClick={() => jumpToEra(era.id)}
                disabled={disabled}
                className="px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider cursor-pointer transition-colors"
                style={{
                  background: `${eraColor}12`,
                  border: `1px solid ${eraColor}28`,
                  color: eraColor,
                  fontFamily: "'Space Grotesk', sans-serif",
                  opacity: disabled ? 0.35 : 1,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
                whileHover={
                  disabled
                    ? undefined
                    : { scale: 1.05, borderColor: `${eraColor}60`, background: `${eraColor}20` }
                }
                whileTap={disabled ? undefined : { scale: 0.95 }}
              >
                {era.name}
              </motion.button>
            );
          })}
        </motion.nav>

        {/* ─────────────────────────────────
            SECTION 5 — Era Chapters
           ───────────────────────────────── */}
        {grouped.length === 0 ? (
          <GlassCard className="p-10 text-center">
            <p
              className="text-[14px]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              No events match your current filters.
            </p>
            <motion.button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full cursor-pointer"
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
          <div className="space-y-8 md:space-y-10">
            {grouped.map(({ era, events: eraEvents, explored }) => (
              <EraChapter
                key={era.id}
                era={era}
                events={eraEvents}
                explored={explored}
                viewedEvents={viewedEvents}
                onOpenEvent={openEvent}
              />
            ))}
          </div>
        )}

        {/* ─────────────────────────────────
            SECTION 6 — Timeline Terminus
           ───────────────────────────────── */}
        {grouped.length > 0 && (
          <motion.div
            className="flex flex-col items-center gap-3 py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{
                background: 'var(--color-accent-gold)',
                boxShadow:
                  '0 0 24px rgba(196, 154, 68, 0.4), 0 0 48px rgba(196, 154, 68, 0.15)',
              }}
            />
            <span
              className="text-[10px] font-semibold"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: '0.2em',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
              }}
            >
              End of Timeline
            </span>
            <span
              className="text-[11px]"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--color-text-muted)',
              }}
            >
              Present Day
            </span>
          </motion.div>
        )}

        {/* Bottom breathing room */}
        <div className="h-8" />
      </div>
    </div>
  );
}
