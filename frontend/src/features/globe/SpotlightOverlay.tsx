import { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipForward, SkipBack, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useSpotlightStore } from '@/shared/stores/spotlightStore';
import { useTimeStore } from '@/shared/stores/timeStore';
import { formatYear } from '@/shared/utils/format';
import { ERAS } from '@/shared/utils/constants';
import { useSpotlightPlayback } from './useSpotlightPlayback';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const SPEED_OPTIONS = [1, 2, 3];

export function SpotlightOverlay() {
  // Activate playback hook
  useSpotlightPlayback();

  const active = useSpotlightStore(s => s.active);
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
                boxShadow: `0 0 24px ${color}20, 0 4px 20px rgba(0,0,0,0.4)`,
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

          {/* Exit button */}
          <motion.button
            onClick={exitSpotlight}
            className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              background: 'var(--glass-strong-bg)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
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
                boxShadow: `0 0 16px ${color}15, 0 4px 16px rgba(0,0,0,0.4)`,
              }}
            >
              {/* Jump to start */}
              <ControlBtn onClick={jumpToStart} disabled={isFirst} title="Jump to start">
                <ChevronsLeft size={14} />
              </ControlBtn>

              {/* Step back */}
              <ControlBtn onClick={stepBackward} disabled={isFirst} title="Step backward (Left arrow)">
                <SkipBack size={14} />
              </ControlBtn>

              {/* Play / Pause */}
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

              {/* Step forward */}
              <ControlBtn onClick={stepForward} disabled={isLast} title="Step forward (Right arrow)">
                <SkipForward size={14} />
              </ControlBtn>

              {/* Jump to end */}
              <ControlBtn onClick={jumpToEnd} disabled={isLast} title="Jump to end">
                <ChevronsRight size={14} />
              </ControlBtn>

              {/* Speed toggle */}
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
