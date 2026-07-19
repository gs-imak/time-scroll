import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  Clock, Filter, Layers, Sparkles, Scroll,
  CheckCircle2, ChevronRight, Compass, X,
  Swords, Palette, Landmark, Hammer, Leaf, Image as ImageIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { useProgressStore } from '@/shared/stores/progressStore';
import { ERAS, ERA_COUNT, TIMELINE_YEAR_SPAN } from '@/shared/utils/constants';
import { formatYear } from '@/shared/utils/format';
import { Card } from '@/shared/components/Card';
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

import { CATEGORY_COLORS as CATEGORY_HEX, getCategoryColor } from '@/shared/data/categories';

const CATEGORY_LABELS: { id: EventCategory; label: string }[] = [
  { id: 'war', label: 'War' },
  { id: 'discovery', label: 'Discovery' },
  { id: 'cultural', label: 'Cultural' },
  { id: 'political', label: 'Political' },
  { id: 'construction', label: 'Construction' },
  { id: 'natural', label: 'Natural' },
];

/** Lucide icon per category — image placeholders (no broken-image glyphs). */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  war: Swords,
  discovery: Compass,
  cultural: Palette,
  political: Landmark,
  construction: Hammer,
  natural: Leaf,
};

/** 44px-tall invisible ::after hit area so slim filter pills meet the
    design-system 44px minimum touch target while staying visually compact. */
const PILL_HIT_AREA =
  "relative after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']";

/* ══════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════ */

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
      <Card variant="glass" className="rounded-xl p-5 sm:p-6 group cursor-default relative overflow-hidden">
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
      className={`px-3 py-1.5 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${PILL_HIT_AREA}`}
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
  side,
  index,
  eraColor,
  onOpen,
}: {
  event: HistoricalEvent;
  viewed: boolean;
  side: 'left' | 'right';
  index: number;
  eraColor: string;
  onOpen: (id: string) => void;
}) {
  const color = CATEGORY_HEX[event.category] ?? '#8a8a9a';
  const CategoryIcon = CATEGORY_ICONS[event.category] ?? ImageIcon;
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(event.imageUrl) && !imgFailed;

  /* Each row hosts:
     - The card (takes exactly 50% width on desktop)
     - The axis (centered) with its own dot
     - The connector line between them
     On mobile: everything collapses — card flows full-width to the right of the left axis. */

  return (
    <motion.div
      className={`
        relative flex w-full items-center
        pl-10 md:pl-0
        ${side === 'left' ? 'md:justify-start md:pr-[calc(50%+18px)]' : 'md:justify-end md:pl-[calc(50%+18px)]'}
      `}
      initial={{ opacity: 0, x: side === 'left' ? -16 : 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.05, ease: EASE }}
    >
      {/* ── Desktop connector line (card edge to axis) ── */}
      <div
        className="hidden md:block absolute top-1/2 h-px z-0"
        style={{
          width: '18px',
          background: `linear-gradient(${side === 'left' ? '90deg' : '270deg'}, ${eraColor}70, ${eraColor}20)`,
          left: side === 'left' ? 'calc(50% - 18px)' : 'auto',
          right: side === 'right' ? 'calc(50% - 18px)' : 'auto',
        }}
        aria-hidden="true"
      />

      {/* ── Mobile connector line (axis at left-4 to card) ── */}
      <div
        className="md:hidden absolute top-1/2 h-px z-0"
        style={{
          width: '20px',
          background: `linear-gradient(90deg, ${eraColor}70, ${eraColor}20)`,
          left: '16px',
        }}
        aria-hidden="true"
      />

      {/* ── Mobile axis dot (on left spine) ── */}
      <div
        className="md:hidden absolute top-1/2 -translate-y-1/2 z-10 rounded-full"
        style={{
          left: '11px',
          width: '11px',
          height: '11px',
          background: 'var(--color-void)',
          border: `2px solid ${eraColor}`,
          boxShadow: `0 0 0 3px ${eraColor}20, 0 0 12px ${eraColor}80`,
        }}
        aria-hidden="true"
      />

      {/* ── Desktop axis dot (centered on spine) ── */}
      <div
        className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rounded-full"
        style={{
          width: '12px',
          height: '12px',
          background: 'var(--color-void)',
          border: `2px solid ${eraColor}`,
          boxShadow: `0 0 0 3px ${eraColor}22, 0 0 14px ${eraColor}80`,
        }}
        aria-hidden="true"
      />

      {/* ── Card ── */}
      <motion.button
        type="button"
        onClick={() => onOpen(event.id)}
        className="
          group relative flex items-stretch gap-3 w-full
          rounded-xl text-left cursor-pointer overflow-hidden
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold
          focus-visible:ring-offset-2 focus-visible:ring-offset-void
        "
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--color-border-subtle)',
          boxShadow: 'inset 0 1px 0 var(--glass-inset)',
          opacity: viewed ? 1 : 0.78,
          minHeight: '92px',
        }}
        whileHover={{
          scale: 1.015,
          y: -2,
          borderColor: `${color}60`,
          boxShadow: `0 10px 28px ${color}25, inset 0 1px 0 var(--glass-inset)`,
        }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.2, ease: EASE }}
      >
        {/* Thumbnail — era-tinted gradient + category icon underneath; the
            <img> covers it when it loads and unmounts on error (no broken
            glyph, no layout jump: the 92px box is constant). */}
        <div
          className="relative flex items-center justify-center w-[92px] shrink-0 self-stretch overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${eraColor}30, ${eraColor}10)`,
            borderRight: `1px solid ${color}22`,
          }}
          aria-hidden="true"
        >
          <CategoryIcon size={24} style={{ color: `${eraColor}90` }} />
          {showImage && (
            <>
              <img
                src={event.imageUrl!}
                alt=""
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setImgFailed(true)}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 45%, var(--glass-bg) 100%)',
                }}
              />
            </>
          )}
        </div>

        {/* Text block — compact: year + title + category only */}
        <div className="flex-1 min-w-0 flex flex-col justify-center py-3 pr-3.5">
          {/* Year on top */}
          <span
            className="mb-0.5"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600,
              color,
              letterSpacing: '0.03em',
            }}
          >
            {formatYear(event.year)}
          </span>

          {/* Title */}
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {event.title}
          </h3>

          {/* Footer: category + viewed state */}
          <div className="flex items-center justify-between gap-2 mt-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: color, boxShadow: `0 0 4px ${color}` }}
              />
              <span
                className="text-[10px] font-semibold uppercase tracking-wider truncate"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {event.category}
              </span>
            </div>
            {viewed ? (
              <CheckCircle2 size={12} style={{ color: '#6d9476' }} />
            ) : (
              <ChevronRight
                size={12}
                className="group-hover:translate-x-0.5 transition-transform duration-200"
                style={{ color: 'var(--color-text-muted)' }}
              />
            )}
          </div>
        </div>
      </motion.button>
    </motion.div>
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
                fontFamily: 'var(--font-display)',
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
                fontFamily: 'var(--font-mono)',
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
              fontFamily: 'var(--font-mono)',
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

        {/* Event list — zigzag timeline with center spine */}
        <div className="relative">
          {/* Desktop center spine */}
          <div
            className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${eraColor}55 8%, ${eraColor}55 92%, transparent 100%)`,
            }}
            aria-hidden="true"
          />

          {/* Mobile left spine */}
          <div
            className="md:hidden absolute top-0 bottom-0 w-[2px]"
            style={{
              left: '15px',
              background: `linear-gradient(180deg, transparent 0%, ${eraColor}55 6%, ${eraColor}55 94%, transparent 100%)`,
            }}
            aria-hidden="true"
          />

          <div className="flex flex-col gap-5 md:gap-6 py-2">
            {events.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                viewed={viewedEvents.includes(event.id)}
                side={i % 2 === 0 ? 'left' : 'right'}
                index={i}
                eraColor={eraColor}
                onOpen={onOpenEvent}
              />
            ))}
          </div>
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
  // Defined eras, not eras-with-events — the header advertises ERAS.length, and
  // grouped.length silently reads 6 while Prehistory has no seeded events.
  const eraCount = ERA_COUNT;

  // Advertised timeline bounds (10,000 BCE — today), not min/max of seeded
  // events — the old computation showed "5k" against the "12,000 years" copy.
  const yearSpanLabel = useMemo(() => `${Math.round(TIMELINE_YEAR_SPAN / 1000)}k`, []);

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
      {/* pt-20 below lg clears the fixed mobile nav button: 12px offset + 44px
          button + 24px (xl) gap = 80px. Desktop sidebar appears at lg. */}
      <div className="w-full max-w-[1000px] mx-auto px-5 sm:px-8 md:px-10 pt-20 lg:pt-14 pb-10 md:pb-14">
        {/* ─────────────────────────────────
            SECTION 1 — Hero Header
            (no back-arrow: the nav drawer / sidebar already navigates)
           ───────────────────────────────── */}
        <motion.header className="mb-8" {...section(0)}>
          <div className="flex items-center gap-4 mb-5">
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
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text-primary)',
                lineHeight: 1.1,
              }}
            >
              Timeline
            </h1>
          </div>

          {/* 56px = 40px title icon + 16px (lg) gap — aligns with the title text */}
          <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row sm:pl-[56px]">
            <p
              className="text-[14px] max-w-[560px] leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Every event in chronological order —{' '}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-accent-gold)',
                  fontWeight: 600,
                }}
              >
                {totalCount}
              </span>{' '}
              moments that shaped human civilization across{' '}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
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
                  fontFamily: 'var(--font-mono)',
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
                fontFamily: 'var(--font-mono)',
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
                color={getCategoryColor(cat.id)}
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
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider cursor-pointer transition-colors ${PILL_HIT_AREA}`}
                style={{
                  background: `${eraColor}12`,
                  border: `1px solid ${eraColor}28`,
                  color: eraColor,
                  fontFamily: 'var(--font-display)',
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
          <Card variant="glass" className="rounded-xl p-10 text-center">
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
                fontFamily: 'var(--font-display)',
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
                fontFamily: 'var(--font-mono)',
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
