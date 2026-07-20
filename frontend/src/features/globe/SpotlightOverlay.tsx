import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipForward, SkipBack, ChevronsLeft, ChevronsRight, ChevronDown, Swords, Compass, Palette, Landmark, Building2, Mountain } from 'lucide-react';
import { useSpotlightStore } from '@/shared/stores/spotlightStore';
import { useTimeStore } from '@/shared/stores/timeStore';
import { formatYear } from '@/shared/utils/format';
import { ERAS } from '@/shared/utils/constants';
import { useSpotlightPlayback } from './useSpotlightPlayback';
import { getSpotlightContext, type ContextEntry } from '@/shared/data/spotlightContext';
import { CATEGORY_COLORS } from '@/shared/data/categories';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const SPEED_OPTIONS = [1, 2, 3];

/** Above this many snapshots the dot rail becomes a compact progress bar. */
const MAX_DOTS = 20;

const CATEGORY_ICONS: Record<string, typeof Swords> = {
  war: Swords,
  discovery: Compass,
  cultural: Palette,
  political: Landmark,
  construction: Building2,
  natural: Mountain,
};

export function SpotlightOverlay() {
  useSpotlightPlayback();

  const active = useSpotlightStore(s => s.active);
  const civId = useSpotlightStore(s => s.civId);
  const displayName = useSpotlightStore(s => s.displayName);
  const civColor = useSpotlightStore(s => s.civColor);
  const isPlaying = useSpotlightStore(s => s.isPlaying);
  const playSpeed = useSpotlightStore(s => s.playSpeed);
  const snapshotYears = useSpotlightStore(s => s.snapshotYears);
  const currentSnapshotIndex = useSpotlightStore(s => s.currentSnapshotIndex);
  const exitSpotlight = useSpotlightStore(s => s.exitSpotlight);
  const togglePlay = useSpotlightStore(s => s.togglePlay);
  const setPlaySpeed = useSpotlightStore(s => s.setPlaySpeed);
  const setSnapshotIndex = useSpotlightStore(s => s.setSnapshotIndex);
  const stepForward = useSpotlightStore(s => s.stepForward);
  const stepBackward = useSpotlightStore(s => s.stepBackward);
  const jumpToStart = useSpotlightStore(s => s.jumpToStart);
  const jumpToEnd = useSpotlightStore(s => s.jumpToEnd);

  const currentYear = useTimeStore(s => s.currentYear);
  const currentEra = ERAS.find(e => currentYear >= e.startYear && currentYear < e.endYear);

  const [eventsExpanded, setEventsExpanded] = useState(true);

  const cycleSpeed = useCallback(() => {
    const idx = SPEED_OPTIONS.indexOf(playSpeed);
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]!;
    setPlaySpeed(next);
  }, [playSpeed, setPlaySpeed]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitSpotlight();
      else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
      else if (e.key === 'ArrowRight') stepForward();
      else if (e.key === 'ArrowLeft') stepBackward();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, exitSpotlight, togglePlay, stepForward, stepBackward]);

  // Compute context events for the current snapshot window
  const contextEvents = useMemo<ContextEntry[]>(() => {
    if (!civId || snapshotYears.length === 0) return [];
    const currentSnapYear = snapshotYears[currentSnapshotIndex] ?? 0;
    const nextSnapYear = snapshotYears[currentSnapshotIndex + 1] ?? currentSnapYear + 200;
    const prevSnapYear = currentSnapshotIndex > 0
      ? (snapshotYears[currentSnapshotIndex - 1] ?? currentSnapYear - 200)
      : currentSnapYear - 200;
    // Show events from midpoint of previous gap to midpoint of next gap
    const fromYear = Math.floor((prevSnapYear + currentSnapYear) / 2);
    const toYear = Math.floor((currentSnapYear + nextSnapYear) / 2);
    return getSpotlightContext(civId, fromYear, toYear);
  }, [civId, snapshotYears, currentSnapshotIndex]);

  // Re-expand when new context events appear at a new snapshot
  useEffect(() => {
    if (contextEvents.length > 0) setEventsExpanded(true);
  }, [currentSnapshotIndex, contextEvents.length]);

  const color = civColor || '#c49a44';
  const isFirst = currentSnapshotIndex === 0;
  const isLast = currentSnapshotIndex >= snapshotYears.length - 1;

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Exit button */}
          <motion.button
            onClick={exitSpotlight}
            aria-label="Exit spotlight"
            className="glass-strong fixed top-4 right-4 z-50 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-void"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={16} className="text-text-secondary" />
          </motion.button>

          {/* Stage column: stage card + progress dots + playback controls.
              One anchored stack so the story, the position, and the controls
              read as a single instrument — nothing hides in a corner. */}
          <motion.div
            className="fixed bottom-[200px] left-1/2 -translate-x-1/2 lg:ml-[32px] z-40 flex flex-col items-center gap-3 w-[min(520px,calc(100vw-32px))]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {/* Stage card */}
            <div
              className="glass-strong rounded-[16px] w-full overflow-hidden"
              style={{
                border: `1.5px solid ${color}40`,
                boxShadow: `0 0 32px ${color}20, 0 8px 32px var(--glass-shadow-strong)`,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`stage-${currentSnapshotIndex}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="p-5"
                >
                  {/* Civilization + stage counter */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ background: color, boxShadow: `0 0 8px ${color}90` }}
                      />
                      <h2
                        className="text-[18px] font-semibold tracking-[0.025em] truncate"
                        style={{ color, fontFamily: 'var(--font-display)', textShadow: `0 0 16px ${color}40` }}
                      >
                        {displayName}
                      </h2>
                    </div>
                    <span
                      className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium font-mono text-text-secondary"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border-subtle)' }}
                      aria-label={`Stage ${currentSnapshotIndex + 1} of ${snapshotYears.length}`}
                    >
                      STAGE {currentSnapshotIndex + 1} / {snapshotYears.length}
                    </span>
                  </div>

                  {/* The year — the headline of every stage */}
                  <div className="flex items-baseline gap-3 mb-1" aria-live="polite">
                    <span className="text-[30px] sm:text-[36px] leading-none font-bold font-mono text-text-primary tracking-[0.05em]">
                      {formatYear(currentYear)}
                    </span>
                    {currentEra && (
                      <span className="text-[14px] text-text-secondary">{currentEra.name}</span>
                    )}
                  </div>

                  {/* Why the borders changed */}
                  {contextEvents.length > 0 && (
                    <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${color}15` }}>
                      <button
                        onClick={() => setEventsExpanded(!eventsExpanded)}
                        aria-expanded={eventsExpanded}
                        className="w-full min-h-11 flex items-center justify-between gap-2 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-void rounded-[8px]"
                      >
                        <span className="text-[11px] font-medium tracking-[0.15em] uppercase text-text-muted">
                          {contextEvents.length === 1 ? 'What happened' : `${contextEvents.length} key events`}
                        </span>
                        <motion.span animate={{ rotate: eventsExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown size={14} className="text-text-muted" />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {eventsExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: EASE }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-3 pt-2 max-h-[176px] overflow-y-auto pr-1">
                              {contextEvents.map((ev, i) => {
                                const Icon = CATEGORY_ICONS[ev.category] || Compass;
                                const catColor = CATEGORY_COLORS[ev.category] || '#8a8a9a';
                                return (
                                  <div key={i} className="flex gap-3">
                                    <div
                                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                      style={{ background: `${catColor}18`, border: `1px solid ${catColor}25` }}
                                    >
                                      <Icon size={16} style={{ color: catColor }} aria-hidden="true" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-baseline gap-2 mb-0.5">
                                        <span className="text-[14px] font-medium text-text-primary">{ev.title}</span>
                                        <span className="text-[10px] font-mono shrink-0" style={{ color: catColor }}>
                                          {formatYear(ev.year)}
                                        </span>
                                      </div>
                                      <p className="text-[12px] text-text-secondary leading-[1.6]">{ev.description}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Stage progress — dots up to MAX_DOTS, compact bar beyond */}
            {snapshotYears.length <= MAX_DOTS ? (
              <div
                className="flex items-center justify-center gap-1"
                role="group"
                aria-label="Stage progress"
              >
                {snapshotYears.map((year, i) => {
                  const isActive = i === currentSnapshotIndex;
                  const isPast = i < currentSnapshotIndex;
                  return (
                    <button
                      key={year}
                      onClick={() => setSnapshotIndex(i)}
                      aria-label={`Go to stage ${i + 1} of ${snapshotYears.length} (${formatYear(year)})`}
                      aria-current={isActive ? 'step' : undefined}
                      className="h-11 px-1 flex items-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-void rounded-full"
                    >
                      <motion.span
                        className="rounded-full block"
                        animate={{
                          width: isActive ? 10 : 8,
                          height: isActive ? 10 : 8,
                          backgroundColor: isActive ? color : isPast ? `${color}66` : 'rgba(255,255,255,0.18)',
                        }}
                        style={isActive ? { boxShadow: `0 0 8px ${color}90` } : undefined}
                        transition={{ duration: 0.2 }}
                      />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                className="w-[200px] h-1 rounded-full overflow-hidden"
                role="progressbar"
                aria-label="Stage progress"
                aria-valuenow={currentSnapshotIndex + 1}
                aria-valuemin={1}
                aria-valuemax={snapshotYears.length}
                style={{ background: 'rgba(255,255,255,0.12)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: color }}
                  animate={{ width: `${((currentSnapshotIndex + 1) / snapshotYears.length) * 100}%` }}
                  transition={{ duration: 0.3, ease: EASE }}
                />
              </div>
            )}

            {/* Playback controls */}
            <div
              className="glass-strong flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{
                border: `1px solid ${color}25`,
                boxShadow: `0 0 16px ${color}15, 0 4px 16px var(--glass-shadow)`,
              }}
            >
              <ControlBtn onClick={jumpToStart} disabled={isFirst} title="Jump to start">
                <ChevronsLeft size={14} />
              </ControlBtn>
              <ControlBtn onClick={stepBackward} disabled={isFirst} title="Step backward (Left arrow)">
                <SkipBack size={14} />
              </ControlBtn>
              <motion.button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-void"
                style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                whileHover={{ scale: 1.1, background: `${color}30` }}
                whileTap={{ scale: 0.9 }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                title="Play / Pause (Space)"
              >
                {isPlaying
                  ? <Pause size={24} style={{ color }} />
                  : <Play size={24} style={{ color, marginLeft: 2 }} />
                }
              </motion.button>
              <ControlBtn onClick={stepForward} disabled={isLast} title="Step forward (Right arrow)">
                <SkipForward size={14} />
              </ControlBtn>
              <ControlBtn onClick={jumpToEnd} disabled={isLast} title="Jump to end">
                <ChevronsRight size={14} />
              </ControlBtn>
              <motion.button
                onClick={cycleSpeed}
                className="ml-2 h-11 px-2.5 rounded-full text-[10px] font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-void"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Playback speed ${playSpeed}x — cycle`}
                title="Cycle speed"
              >
                {playSpeed}x
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ControlBtn({ onClick, disabled, children, title }: { onClick: () => void; disabled: boolean; children: React.ReactNode; title: string }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      aria-label={title}
      className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-20 disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-void"
      style={{ background: 'rgba(255,255,255,0.04)' }}
      whileHover={!disabled ? { scale: 1.1, background: 'rgba(255,255,255,0.08)' } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
      title={title}
    >
      <span className="text-text-secondary">{children}</span>
    </motion.button>
  );
}
