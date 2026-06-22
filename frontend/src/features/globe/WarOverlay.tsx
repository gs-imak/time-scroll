import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Play, Pause, SkipForward, SkipBack, ChevronsLeft, ChevronsRight, Info,
} from 'lucide-react';
import { useWarStore } from '@/shared/stores/warStore';
import { useTimeStore } from '@/shared/stores/timeStore';
import { useWarPlayback } from './useWarPlayback';
import { WAR_EVENTS } from '@/shared/data/warEvents';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const SPEED_OPTIONS = [1, 2, 3] as const;
const ACCENT = '#d4a574';

const TITLES = {
  wwi: 'WORLD WAR I',
  wwii: 'WORLD WAR II',
} as const;

const SPANS = {
  wwi: '1914 \u2014 1919',
  wwii: '1938 \u2014 1945',
} as const;

export function WarOverlay() {
  useWarPlayback();

  const active = useWarStore((s) => s.active);
  const activeWar = useWarStore((s) => s.activeWar);
  const isPlaying = useWarStore((s) => s.isPlaying);
  const playSpeed = useWarStore((s) => s.playSpeed);
  const snapshotYears = useWarStore((s) => s.snapshotYears);
  const currentIndex = useWarStore((s) => s.currentIndex);

  const exit = useWarStore((s) => s.exit);
  const togglePlay = useWarStore((s) => s.togglePlay);
  const stepForward = useWarStore((s) => s.stepForward);
  const stepBackward = useWarStore((s) => s.stepBackward);
  const setIndex = useWarStore((s) => s.setIndex);
  const setPlaySpeed = useWarStore((s) => s.setPlaySpeed);
  const jumpToStart = useWarStore((s) => s.jumpToStart);
  const jumpToEnd = useWarStore((s) => s.jumpToEnd);

  const currentYear = useTimeStore((s) => s.currentYear);

  const [infoOpen, setInfoOpen] = useState(false);

  const cycleSpeed = useCallback(() => {
    const idx = SPEED_OPTIONS.indexOf(playSpeed);
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]!;
    setPlaySpeed(next);
  }, [playSpeed, setPlaySpeed]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exit();
      else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') stepForward();
      else if (e.key === 'ArrowLeft') stepBackward();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, exit, togglePlay, stepForward, stepBackward]);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= snapshotYears.length - 1;

  // Active events at the current year, for the bottom-left list
  const activeEvents = useMemo(() => {
    if (!activeWar) return [];
    return WAR_EVENTS.filter((e) => e.war === activeWar && e.year === currentYear);
  }, [activeWar, currentYear]);

  if (!active || !activeWar) return null;

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Subtle vignette */}
          <motion.div
            className="fixed inset-0 z-30 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 50% 45%, transparent 0%, rgba(8,8,12,0.35) 70%, rgba(8,8,12,0.7) 100%)',
            }}
            aria-hidden="true"
          />

          {/* Top title bar */}
          <motion.div
            className="fixed top-4 left-1/2 -translate-x-1/2 z-40 lg:left-[calc(50%+32px)]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div
              className="flex items-center gap-4 px-6 py-3 rounded-xl"
              style={{
                background: 'var(--glass-strong-bg)',
                backdropFilter: 'blur(24px)',
                border: `1.5px solid ${ACCENT}40`,
                boxShadow: `0 0 28px ${ACCENT}20, 0 4px 24px var(--glass-shadow)`,
              }}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}90` }}
              />
              <div>
                <h2
                  className="text-[16px] font-bold leading-tight"
                  style={{
                    color: ACCENT,
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.04em',
                    textShadow: `0 0 16px ${ACCENT}40`,
                  }}
                >
                  {TITLES[activeWar]}
                </h2>
                <p className="text-[11px] text-text-muted font-mono">
                  {SPANS[activeWar]} · {currentYear}
                </p>
              </div>
              <div className="ml-2 text-[10px] font-mono text-text-muted">
                {currentIndex + 1}/{snapshotYears.length}
              </div>
            </div>
          </motion.div>

          {/* Top-right controls (info + exit) */}
          <motion.div
            className="fixed top-4 right-4 z-50 flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
          >
            <motion.button
              onClick={() => setInfoOpen((o) => !o)}
              className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer"
              style={{
                background: 'var(--glass-strong-bg)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--color-border-active)',
              }}
              whileHover={{ borderColor: `${ACCENT}80`, scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              aria-label="Sources and credits"
            >
              <Info size={16} className="text-text-secondary" />
            </motion.button>
            <motion.button
              onClick={exit}
              className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer"
              style={{
                background: 'var(--glass-strong-bg)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--color-border-active)',
              }}
              whileHover={{ borderColor: 'rgba(184, 84, 84, 0.6)', scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              aria-label="Exit War Mode (Esc)"
            >
              <X size={16} className="text-text-secondary" />
            </motion.button>
          </motion.div>

          {/* Info / attribution card */}
          <AnimatePresence>
            {infoOpen && (
              <motion.div
                className="fixed top-20 right-4 z-50 w-[320px] rounded-2xl"
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.95 }}
                transition={{ duration: 0.3, ease: EASE }}
                style={{
                  background: 'var(--glass-strong-bg)',
                  backdropFilter: 'blur(24px)',
                  border: `1.5px solid ${ACCENT}30`,
                  padding: '20px',
                }}
              >
                <h3
                  className="text-[13px] font-bold mb-3"
                  style={{ color: ACCENT, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}
                >
                  SOURCES & CREDITS
                </h3>
                <p className="text-[12px] text-text-secondary leading-[1.65] mb-3">
                  Historical borders are extracted from{' '}
                  <strong className="text-text-primary">CShapes 2.0</strong> (Schvitz, Girardin,
                  Rüegger, Weidmann, Cederman, Gleditsch — ETH Zurich, 2022).
                </p>
                <p className="text-[11px] text-text-muted leading-[1.6]">
                  Licensed under{' '}
                  <a
                    href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: ACCENT }}
                    className="underline"
                  >
                    CC BY-NC-SA 4.0
                  </a>
                  .
                </p>
                <p className="text-[11px] text-text-muted leading-[1.6] mt-2">
                  <a
                    href="https://icr.ethz.ch/data/cshapes/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: ACCENT }}
                    className="underline"
                  >
                    icr.ethz.ch/data/cshapes
                  </a>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom-left active events list */}
          <AnimatePresence mode="wait">
            {activeEvents.length > 0 && (
              <motion.div
                key={`active-${currentYear}`}
                className="fixed bottom-32 left-4 z-40 lg:left-[80px] max-w-[320px]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <div
                  className="rounded-2xl px-5 py-4"
                  style={{
                    background: 'var(--glass-strong-bg)',
                    backdropFilter: 'blur(24px)',
                    border: `1px solid ${ACCENT}25`,
                    boxShadow: `0 0 24px ${ACCENT}15, 0 8px 32px var(--glass-shadow)`,
                  }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider mb-2"
                    style={{ color: ACCENT, letterSpacing: '0.12em' }}
                  >
                    {currentYear}
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {activeEvents.map((e) => (
                      <li
                        key={e.id}
                        className="text-[12px] text-text-primary leading-snug flex items-start gap-2"
                      >
                        <span style={{ color: ACCENT, fontSize: '8px', marginTop: '5px' }}>
                          ●
                        </span>
                        <span>{e.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom playback controls */}
          <motion.div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:ml-[32px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.45, delay: 0.1, ease: EASE }}
          >
            <div
              className="flex items-center gap-3 px-5 py-3 rounded-2xl"
              style={{
                background: 'var(--glass-strong-bg)',
                backdropFilter: 'blur(24px)',
                border: `1px solid ${ACCENT}25`,
                boxShadow: `0 0 20px ${ACCENT}15, 0 4px 20px var(--glass-shadow)`,
              }}
            >
              <ControlBtn onClick={jumpToStart} disabled={isFirst} title="Jump to start">
                <ChevronsLeft size={16} />
              </ControlBtn>
              <ControlBtn onClick={stepBackward} disabled={isFirst} title="Previous (←)">
                <SkipBack size={16} />
              </ControlBtn>
              <motion.button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer"
                style={{ background: `${ACCENT}22`, border: `1.5px solid ${ACCENT}55` }}
                whileHover={{ scale: 1.08, background: `${ACCENT}33` }}
                whileTap={{ scale: 0.92 }}
                title="Play / Pause (Space)"
              >
                {isPlaying ? (
                  <Pause size={22} style={{ color: ACCENT }} />
                ) : (
                  <Play size={22} style={{ color: ACCENT, marginLeft: 3 }} />
                )}
              </motion.button>
              <ControlBtn onClick={stepForward} disabled={isLast} title="Next (→)">
                <SkipForward size={16} />
              </ControlBtn>
              <ControlBtn onClick={jumpToEnd} disabled={isLast} title="Jump to end">
                <ChevronsRight size={16} />
              </ControlBtn>

              <div className="w-px h-7 mx-1 bg-white/10" />

              <motion.button
                onClick={cycleSpeed}
                className="px-3 h-9 rounded-full text-[11px] font-bold cursor-pointer flex items-center"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-secondary)',
                  letterSpacing: '0.05em',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Cycle playback speed"
              >
                {playSpeed}×
              </motion.button>

              {/* Snapshot dots */}
              <div className="flex items-center gap-1.5 ml-2">
                {snapshotYears.map((y, i) => (
                  <button
                    key={y}
                    onClick={() => setIndex(i)}
                    className="cursor-pointer"
                    title={`${y}`}
                    style={{
                      width: i === currentIndex ? 12 : 8,
                      height: i === currentIndex ? 12 : 8,
                      borderRadius: '50%',
                      background: i === currentIndex ? ACCENT : 'rgba(255,255,255,0.18)',
                      transition: 'all 200ms ease',
                      border: 'none',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ControlBtn({
  onClick,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-25 disabled:cursor-default"
      style={{ background: 'rgba(255,255,255,0.04)' }}
      whileHover={!disabled ? { scale: 1.08, background: 'rgba(255,255,255,0.08)' } : {}}
      whileTap={!disabled ? { scale: 0.92 } : {}}
      title={title}
    >
      <span className="text-text-secondary">{children}</span>
    </motion.button>
  );
}
