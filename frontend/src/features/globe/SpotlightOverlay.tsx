import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipForward, SkipBack, ChevronsLeft, ChevronsRight, ChevronDown, Swords, Compass, Palette, Landmark, Building2, Mountain } from 'lucide-react';
import { useSpotlightStore } from '@/shared/stores/spotlightStore';
import { useTimeStore } from '@/shared/stores/timeStore';
import { formatYear } from '@/shared/utils/format';
import { ERAS } from '@/shared/utils/constants';
import { useSpotlightPlayback } from './useSpotlightPlayback';
import { getSpotlightContext, type ContextEntry } from '@/shared/data/spotlightContext';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const SPEED_OPTIONS = [1, 2, 3];

const CATEGORY_ICONS: Record<string, typeof Swords> = {
  war: Swords,
  discovery: Compass,
  cultural: Palette,
  political: Landmark,
  construction: Building2,
  natural: Mountain,
};

const CATEGORY_COLORS: Record<string, string> = {
  war: '#b85454',
  discovery: '#5a8fa5',
  cultural: '#c49a44',
  political: '#8b80b0',
  construction: '#6d9476',
  natural: '#b87a60',
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
  const stepForward = useSpotlightStore(s => s.stepForward);
  const stepBackward = useSpotlightStore(s => s.stepBackward);
  const jumpToStart = useSpotlightStore(s => s.jumpToStart);
  const jumpToEnd = useSpotlightStore(s => s.jumpToEnd);

  const currentYear = useTimeStore(s => s.currentYear);
  const currentEra = ERAS.find(e => currentYear >= e.startYear && currentYear < e.endYear);

  const [contextExpanded, setContextExpanded] = useState(false);

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

  // Collapse when snapshot changes
  useEffect(() => {
    setContextExpanded(false);
  }, [currentSnapshotIndex]);

  const color = civColor || '#c49a44';
  const isFirst = currentSnapshotIndex === 0;
  const isLast = currentSnapshotIndex >= snapshotYears.length - 1;

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Top info bar */}
          <motion.div
            className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 lg:left-[calc(50%+32px)]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div
              className="flex items-center gap-3 px-5 py-3 rounded-xl"
              style={{
                background: 'var(--glass-strong-bg)',
                backdropFilter: 'blur(20px)',
                border: `1.5px solid ${color}40`,
                boxShadow: `0 0 24px ${color}20, 0 4px 20px var(--glass-shadow)`,
              }}
            >
              <div className="w-3 h-3 rounded-sm" style={{ background: color, boxShadow: `0 0 8px ${color}90` }} />
              <div>
                <h2 className="text-[16px] font-bold" style={{ color, fontFamily: "'Space Grotesk', sans-serif", textShadow: `0 0 16px ${color}40` }}>
                  {displayName}
                </h2>
                <p className="text-[11px] text-text-muted">
                  {currentEra?.name} — {formatYear(currentYear)}
                </p>
              </div>
              <div className="ml-4 text-[10px] font-mono text-text-muted">
                {currentSnapshotIndex + 1}/{snapshotYears.length}
              </div>
            </div>
          </motion.div>

          {/* Context card — shows WHY borders changed */}
          <AnimatePresence mode="wait">
            {contextEvents.length > 0 && (
              <motion.div
                key={`ctx-${currentSnapshotIndex}`}
                className="fixed top-20 left-4 z-40 lg:left-[80px]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                {/* Collapsed pill */}
                <motion.button
                  onClick={() => setContextExpanded(!contextExpanded)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer"
                  style={{
                    background: 'var(--glass-strong-bg)',
                    backdropFilter: 'blur(16px)',
                    border: `1px solid ${color}30`,
                    boxShadow: `0 2px 12px var(--glass-shadow)`,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {(() => {
                    const firstCat = contextEvents[0]?.category || 'cultural';
                    const Icon = CATEGORY_ICONS[firstCat] || Compass;
                    const catColor = CATEGORY_COLORS[firstCat] || color;
                    return <Icon size={14} style={{ color: catColor }} />;
                  })()}
                  <span className="text-[11px] font-medium text-text-secondary">
                    {contextEvents.length} event{contextEvents.length > 1 ? 's' : ''}
                  </span>
                  <motion.span
                    animate={{ rotate: contextExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={12} className="text-text-muted" />
                  </motion.span>
                </motion.button>

                {/* Expanded event list */}
                <AnimatePresence>
                  {contextExpanded && (
                    <motion.div
                      className="mt-2 rounded-xl overflow-hidden"
                      style={{
                        background: 'var(--glass-strong-bg)',
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${color}20`,
                        boxShadow: `0 4px 24px var(--glass-shadow)`,
                        maxWidth: 320,
                      }}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                    >
                      <div className="p-3 flex flex-col gap-2.5">
                        {contextEvents.map((ev, i) => {
                          const Icon = CATEGORY_ICONS[ev.category] || Compass;
                          const catColor = CATEGORY_COLORS[ev.category] || '#8a8a9a';
                          return (
                            <div key={i} className="flex gap-2.5">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                style={{ background: `${catColor}15`, border: `1px solid ${catColor}25` }}
                              >
                                <Icon size={13} style={{ color: catColor }} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[12px] font-semibold text-text-primary truncate">
                                    {ev.title}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-text-muted">
                                  {formatYear(ev.year)}
                                </span>
                                <p className="text-[11px] text-text-secondary leading-[1.5] mt-0.5">
                                  {ev.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Exit button */}
          <motion.button
            onClick={exitSpotlight}
            className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              background: 'var(--glass-strong-bg)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--color-border-active)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ borderColor: 'rgba(184, 84, 84, 0.5)', scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={16} className="text-text-secondary" />
          </motion.button>

          {/* Playback controls */}
          <motion.div
            className="fixed bottom-[200px] lg:bottom-[200px] left-1/2 -translate-x-1/2 z-40 lg:ml-[32px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{
                background: 'var(--glass-strong-bg)',
                backdropFilter: 'blur(20px)',
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
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
                style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                whileHover={{ scale: 1.1, background: `${color}30` }}
                whileTap={{ scale: 0.9 }}
                title="Play / Pause (Space)"
              >
                {isPlaying
                  ? <Pause size={16} style={{ color }} />
                  : <Play size={16} style={{ color, marginLeft: 2 }} />
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
                className="ml-2 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
      className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-20 disabled:cursor-default"
      style={{ background: 'rgba(255,255,255,0.04)' }}
      whileHover={!disabled ? { scale: 1.1, background: 'rgba(255,255,255,0.08)' } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
      title={title}
    >
      <span className="text-text-secondary">{children}</span>
    </motion.button>
  );
}
