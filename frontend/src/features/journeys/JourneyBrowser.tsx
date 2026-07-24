import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Compass, BookOpen, Clock, CheckCircle2, Play,
  Sparkles, Zap, Filter, ChevronRight, Route,
} from 'lucide-react';
import { JOURNEYS } from '@/shared/data/journeys';
import { useProgressStore } from '@/shared/stores/progressStore';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { Card } from '@/shared/components/Card';
import type { Journey } from '@/shared/data/journeys';

/* ══════════════════════════════════════════
   ANIMATION PRESETS
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
   CONSTANTS
   ══════════════════════════════════════════ */

type Difficulty = Journey['difficulty'];

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; color: string; icon: typeof Zap }
> = {
  beginner: { label: 'Beginner', color: '#6d9476', icon: BookOpen },
  intermediate: { label: 'Intermediate', color: '#5a8fa5', icon: Route },
  advanced: { label: 'Advanced', color: '#b85454', icon: Zap },
};

const DIFFICULTY_ORDER: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

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
  icon: typeof Compass;
  label: string;
  value: number | string;
  color: string;
  suffix?: string;
  index: number;
}) {
  return (
    <motion.div variants={scaleIn} custom={index}>
      <Card variant="glass" className="rounded-xl p-5 sm:p-6 relative overflow-hidden cursor-default">
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

function JourneyCard({
  journey,
  heroImage,
  viewedInJourney,
  onOpen,
}: {
  journey: Journey;
  heroImage: string | null;
  viewedInJourney: number;
  onOpen: (id: string) => void;
}) {
  const diff = DIFFICULTY_CONFIG[journey.difficulty];
  const DiffIcon = diff.icon;
  const total = journey.eventIds.length;
  const progress = total > 0 ? viewedInJourney / total : 0;
  const started = viewedInJourney > 0;
  const complete = viewedInJourney === total && total > 0;
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(heroImage) && !imgFailed;

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(journey.id)}
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
      }}
      whileHover={{
        y: -4,
        borderColor: `${diff.color}60`,
        boxShadow: `0 16px 40px ${diff.color}25, inset 0 1px 0 var(--glass-inset)`,
      }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.25, ease: EASE }}
    >
      {/* Hero image — gradient + journey glyph underlay always renders; the
          <img> covers it when it loads and unmounts on error (no broken
          glyph, no layout jump: the 180px box is constant). */}
      <div className="relative h-[180px] overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${diff.color}25 0%, ${diff.color}08 100%)`,
            fontSize: '64px',
          }}
          aria-hidden="true"
        >
          <span>{journey.icon}</span>
        </div>
        {showImage && (
          <img
            src={heroImage!}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            onError={() => setImgFailed(true)}
            aria-hidden="true"
          />
        )}

        {/* Gradient overlay for legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.85) 100%)',
          }}
        />

        {/* Difficulty chip top-left */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{
            background: `${diff.color}40`,
            border: `1px solid ${diff.color}80`,
            backdropFilter: 'blur(10px)',
          }}
        >
          <DiffIcon size={11} style={{ color: '#fff' }} />
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: '#fff', fontFamily: 'var(--font-display)' }}
          >
            {diff.label}
          </span>
        </div>

        {/* Status chip top-right */}
        {complete && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(109, 148, 118, 0.45)',
              border: '1px solid rgba(109, 148, 118, 0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CheckCircle2 size={11} style={{ color: '#fff' }} />
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: '#fff', fontFamily: 'var(--font-display)' }}
            >
              Complete
            </span>
          </div>
        )}
        {started && !complete && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(196, 154, 68, 0.45)',
              border: '1px solid rgba(196, 154, 68, 0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Play size={10} style={{ color: '#fff', fill: '#fff' }} />
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: '#fff', fontFamily: 'var(--font-display)' }}
            >
              In Progress
            </span>
          </div>
        )}

        {/* Title anchored to bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end gap-2 mb-1">
            <span
              className="text-[24px] leading-none"
              aria-hidden="true"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
            >
              {journey.icon}
            </span>
            <h3
              className="flex-1"
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
              {journey.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 md:p-5">
        <p
          className="mb-4"
          style={{
            fontSize: '13px',
            lineHeight: 1.55,
            color: 'var(--color-text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {journey.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="flex items-center gap-1"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--color-text-muted)',
              }}
            >
              <BookOpen size={12} />
              {total} events
            </span>
            <span
              className="flex items-center gap-1"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--color-text-muted)',
              }}
            >
              <Clock size={12} />
              {journey.estimatedMinutes} min
            </span>
          </div>
          <div
            className="flex items-center gap-1 transition-colors"
            style={{ color: diff.color }}
          >
            <span
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {started ? 'Continue' : 'Start'}
            </span>
            <ChevronRight
              size={13}
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </div>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div
            className="relative mt-4 h-[3px] rounded-full overflow-hidden"
            style={{ background: 'var(--color-border-subtle)' }}
          >
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: complete
                  ? 'linear-gradient(90deg, #6d9476, #8bb595)'
                  : 'linear-gradient(90deg, #c49a44, #d4b06a)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
            />
          </div>
        )}
      </div>
    </motion.button>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════ */

export default function JourneyBrowser() {
  const navigate = useNavigate();
  const events = useEventsStore((s) => s.events);
  const viewedEvents = useProgressStore((s) => s.viewedEvents);

  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

  /* ── Compute per-journey stats + hero image ── */

  const journeyData = useMemo(() => {
    return JOURNEYS.map((j) => {
      const firstEvent = events.find((e) => e.id === j.eventIds[0]);
      const heroImage = firstEvent?.imageUrl ?? null;
      const viewedInJourney = j.eventIds.filter((id) => viewedEvents.includes(id)).length;
      return { journey: j, heroImage, viewedInJourney };
    });
  }, [events, viewedEvents]);

  const filteredJourneys = useMemo(() => {
    if (!selectedDifficulty) return journeyData;
    return journeyData.filter((d) => d.journey.difficulty === selectedDifficulty);
  }, [journeyData, selectedDifficulty]);

  /* ── Aggregate stats ── */

  const totalJourneys = JOURNEYS.length;
  const completedJourneys = useMemo(
    () => journeyData.filter((d) => d.viewedInJourney === d.journey.eventIds.length).length,
    [journeyData],
  );
  const inProgressJourneys = useMemo(
    () =>
      journeyData.filter(
        (d) => d.viewedInJourney > 0 && d.viewedInJourney < d.journey.eventIds.length,
      ).length,
    [journeyData],
  );
  const totalEventsAcrossJourneys = useMemo(() => {
    const ids = new Set<string>();
    for (const j of JOURNEYS) for (const id of j.eventIds) ids.add(id);
    return ids.size;
  }, []);

  /* ── Continue journey (first in-progress) ── */

  const continueJourney = useMemo(
    () =>
      journeyData.find(
        (d) => d.viewedInJourney > 0 && d.viewedInJourney < d.journey.eventIds.length,
      ),
    [journeyData],
  );

  /* ── Handlers ── */

  const openJourney = useCallback(
    (id: string) => {
      navigate(`/journeys/${id}`);
    },
    [navigate],
  );

  const toggleDifficulty = useCallback((d: Difficulty) => {
    setSelectedDifficulty((prev) => (prev === d ? null : d));
  }, []);

  /* ══════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════ */

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden overflow-y-auto lg:pl-[64px]"
      style={{
        background: `
          radial-gradient(ellipse at 30% 0%, rgba(196,154,68,0.05) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 50%, rgba(90,143,165,0.035) 0%, transparent 50%),
          radial-gradient(ellipse at 15% 85%, rgba(109,148,118,0.025) 0%, transparent 50%),
          var(--color-void)
        `,
      }}
    >
      {/* pt-20 below lg clears the fixed mobile nav button: 12px offset + 44px
          button + 24px (xl) gap = 80px. Desktop sidebar appears at lg. */}
      <div className="w-full max-w-[1100px] mx-auto px-5 sm:px-8 md:px-10 pt-20 lg:pt-14 pb-10 md:pb-14">
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
              <Compass size={22} style={{ color: 'var(--color-accent-gold)' }} />
            </div>

            <h1
              className="text-[30px] sm:text-[38px] font-bold truncate"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text-primary)',
                lineHeight: 1.1,
              }}
            >
              Journeys
            </h1>
          </div>

          <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row sm:pl-[60px]">
            <p
              className="text-[14px] max-w-[560px] leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Follow{' '}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-accent-gold)',
                  fontWeight: 600,
                }}
              >
                {totalJourneys}
              </span>{' '}
              curated paths through history — connecting{' '}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-accent-gold)',
                  fontWeight: 600,
                }}
              >
                {totalEventsAcrossJourneys}
              </span>{' '}
              events into narrative arcs you can read in a single sitting.
            </p>

            {continueJourney && (
              <motion.button
                type="button"
                onClick={() => openJourney(continueJourney.journey.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-full shrink-0 cursor-pointer"
                style={{
                  background: 'rgba(196, 154, 68, 0.12)',
                  border: '1px solid rgba(196, 154, 68, 0.25)',
                }}
                whileHover={{ scale: 1.04, borderColor: 'rgba(196, 154, 68, 0.5)' }}
                whileTap={{ scale: 0.96 }}
              >
                <Play size={12} style={{ color: 'var(--color-accent-gold)', fill: 'var(--color-accent-gold)' }} />
                <span
                  className="text-[12px] font-semibold"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-accent-gold)',
                  }}
                >
                  Continue
                </span>
              </motion.button>
            )}
          </div>
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
          <StatCard icon={Compass} label="Journeys" value={totalJourneys} color="#c49a44" index={0} />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={completedJourneys}
            suffix={`/${totalJourneys}`}
            color="#6d9476"
            index={1}
          />
          <StatCard
            icon={Play}
            label="In Progress"
            value={inProgressJourneys}
            color="#5a8fa5"
            index={2}
          />
          <StatCard
            icon={Sparkles}
            label="Events"
            value={totalEventsAcrossJourneys}
            color="#b87a60"
            index={3}
          />
        </motion.div>

        {/* ─────────────────────────────────
            SECTION 3 — Difficulty Filter
           ───────────────────────────────── */}
        <motion.section className="mb-7" {...section(0.15)}>
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <SectionHeading icon={Filter} label="Filter by Difficulty" inline />
            <span
              className="text-[11px] font-medium"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
              }}
            >
              {filteredJourneys.length} of {totalJourneys} shown
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterPill
              label="All"
              color="#c49a44"
              active={selectedDifficulty === null}
              onClick={() => setSelectedDifficulty(null)}
            />
            {DIFFICULTY_ORDER.map((d) => (
              <FilterPill
                key={d}
                label={DIFFICULTY_CONFIG[d].label}
                color={DIFFICULTY_CONFIG[d].color}
                active={selectedDifficulty === d}
                onClick={() => toggleDifficulty(d)}
              />
            ))}
          </div>
        </motion.section>

        {/* ─────────────────────────────────
            SECTION 4 — Journey Grid
           ───────────────────────────────── */}
        {filteredJourneys.length === 0 ? (
          <Card variant="glass" className="rounded-xl p-10 text-center">
            <p className="text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>
              No journeys match this filter.
            </p>
          </Card>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {filteredJourneys.map((d) => (
              <JourneyCard
                key={d.journey.id}
                journey={d.journey}
                heroImage={d.heroImage}
                viewedInJourney={d.viewedInJourney}
                onOpen={openJourney}
              />
            ))}
          </motion.div>
        )}

        <div className="h-16" />
      </div>
    </div>
  );
}
