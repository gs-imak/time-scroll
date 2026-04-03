import { useCallback, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useTimeStore } from '@/shared/stores/timeStore';
import { ERAS, MIN_YEAR, MAX_YEAR } from '@/shared/utils/constants';
import { formatYear } from '@/shared/utils/format';
import { usePlayback } from './usePlayback';
import { cn } from '@/shared/utils/cn';

const TICK_YEARS = [
  -10000, -8000, -5000, -3000, -1000, 0, 500, 1000, 1500, 2000,
];

export function TimelineScrubber() {
  usePlayback();

  const currentYear = useTimeStore(s => s.currentYear);
  const currentEra = useTimeStore(s => s.currentEra);
  const isPlaying = useTimeStore(s => s.isPlaying);
  const setYear = useTimeStore(s => s.setYear);
  const togglePlay = useTimeStore(s => s.togglePlay);
  const nextEra = useTimeStore(s => s.nextEra);
  const prevEra = useTimeStore(s => s.prevEra);

  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);

  const totalRange = MAX_YEAR - MIN_YEAR;

  const yearToPercent = useCallback(
    (year: number) => ((year - MIN_YEAR) / totalRange) * 100,
    [totalRange]
  );

  const percentToYear = useCallback(
    (pct: number) => Math.round(MIN_YEAR + (pct / 100) * totalRange),
    [totalRange]
  );

  const getPercentFromPointer = useCallback((clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  }, []);

  const handlePointerEvent = useCallback(
    (e: React.PointerEvent) => {
      const pct = getPercentFromPointer(e.clientX);
      setYear(percentToYear(pct));
    },
    [setYear, getPercentFromPointer, percentToYear]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      handlePointerEvent(e);
    },
    [handlePointerEvent]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const pct = getPercentFromPointer(e.clientX);
      setHoverYear(percentToYear(pct));
      setHoverX(e.clientX - rect.left);
      if (isDragging.current) handlePointerEvent(e);
    },
    [handlePointerEvent, getPercentFromPointer, percentToYear]
  );

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const onPointerLeave = useCallback(() => {
    setHoverYear(null);
    isDragging.current = false;
  }, []);

  const currentPercent = yearToPercent(currentYear);

  const eraSegments = useMemo(
    () =>
      ERAS.map(era => ({
        ...era,
        widthPercent: yearToPercent(era.endYear) - yearToPercent(era.startYear),
        isActive: era.id === currentEra.id,
      })),
    [currentEra.id, yearToPercent]
  );

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-40"
      initial={{ y: 120 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 160, damping: 22 }}
    >
      <div
        className={cn(
          'glass-strong mx-3 mb-5 md:mx-5 md:mb-6',
          'rounded-[var(--radius-xl)]',
          'px-4 py-4 pb-6 md:px-6 md:py-5 md:pb-7'
        )}
      >
        {/* ========== ROW 1: Era info / Year / Controls ========== */}
        <div className="mb-4 flex items-center justify-between gap-3">
          {/* Left: Era navigation + era info */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              onClick={prevEra}
              className={cn(
                'flex shrink-0 items-center justify-center',
                'h-9 w-9 rounded-full',
                'border border-border-subtle bg-elevated/50',
                'text-text-secondary transition-all duration-200',
                'hover:border-border-active hover:bg-elevated hover:text-text-primary',
                'cursor-pointer'
              )}
              aria-label="Previous era"
            >
              <SkipBack size={14} />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: currentEra.accentColor,
                    boxShadow: `0 0 8px ${currentEra.accentColor}`,
                  }}
                />
                <span
                  className="truncate text-sm font-semibold tracking-wide md:text-base"
                  style={{ color: currentEra.accentColor }}
                >
                  {currentEra.name}
                </span>
              </div>
              <p className="mt-0.5 hidden truncate text-xs text-text-muted md:block">
                {currentEra.description}
              </p>
            </div>
          </div>

          {/* Center: Year display */}
          <div className="flex shrink-0 flex-col items-center">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={formatYear(currentYear)}
                className={cn(
                  'font-mono text-3xl font-bold tracking-wider text-text-primary',
                  'tabular-nums md:text-4xl'
                )}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {formatYear(currentYear)}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Right: Play/pause + next era */}
          <div className="flex flex-1 items-center justify-end gap-2">
            <button
              onClick={togglePlay}
              className={cn(
                'relative flex shrink-0 items-center justify-center',
                'h-[52px] w-[52px] rounded-full',
                'transition-all duration-200 cursor-pointer',
                isPlaying
                  ? 'bg-accent-cyan text-void'
                  : 'border border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20'
              )}
              style={
                isPlaying
                  ? {
                      boxShadow:
                        '0 0 24px rgba(0,212,255,0.5), 0 0 60px rgba(0,212,255,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }
                  : undefined
              }
              aria-label={isPlaying ? 'Pause playback' : 'Start playback'}
            >
              {isPlaying && (
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    animation: 'play-pulse 2s ease-out infinite',
                    border: '2px solid rgba(0,212,255,0.4)',
                  }}
                />
              )}
              {isPlaying ? (
                <Pause size={20} strokeWidth={2.5} />
              ) : (
                <Play size={20} strokeWidth={2.5} className="ml-0.5" />
              )}
            </button>

            <button
              onClick={nextEra}
              className={cn(
                'flex shrink-0 items-center justify-center',
                'h-9 w-9 rounded-full',
                'border border-border-subtle bg-elevated/50',
                'text-text-secondary transition-all duration-200',
                'hover:border-border-active hover:bg-elevated hover:text-text-primary',
                'cursor-pointer'
              )}
              aria-label="Next era"
            >
              <SkipForward size={14} />
            </button>
          </div>
        </div>

        {/* ========== ROW 2: Scrubber Track ========== */}
        <div
          ref={trackRef}
          className="group relative cursor-pointer touch-none select-none"
          style={{ height: 56 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerLeave}
          role="slider"
          aria-label="Timeline scrubber"
          aria-valuemin={MIN_YEAR}
          aria-valuemax={MAX_YEAR}
          aria-valuenow={currentYear}
          aria-valuetext={formatYear(currentYear)}
          tabIndex={0}
        >
          {/* Hover tooltip */}
          <AnimatePresence>
            {hoverYear !== null && !isDragging.current && (
              <motion.div
                className="pointer-events-none absolute z-10"
                style={{ left: hoverX, top: -4, transform: 'translateX(-50%)' }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.1 }}
              >
                <div
                  className={cn(
                    'glass-light rounded-[var(--radius-sm)]',
                    'px-2.5 py-1 font-mono text-xs tabular-nums text-text-secondary'
                  )}
                >
                  {formatYear(hoverYear)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tick marks — positioned above the track */}
          <div className="absolute inset-x-0 top-0 h-5">
            {TICK_YEARS.map(year => {
              const pct = yearToPercent(year);
              return (
                <div
                  key={year}
                  className="pointer-events-none absolute top-0 flex flex-col items-center"
                  style={{ left: `${pct}%` }}
                >
                  <span className="mb-0.5 font-mono text-[11px] tabular-nums text-text-muted">
                    {year <= 0 ? `${Math.abs(year)} BC` : year}
                  </span>
                  <div className="h-1.5 w-px bg-text-muted/40" />
                </div>
              );
            })}
          </div>

          {/* Era-colored segment bars */}
          <div className="absolute inset-x-0 bottom-0 flex h-5 overflow-hidden rounded-full">
            {eraSegments.map((era, i) => (
              <div
                key={era.id}
                className="relative h-full transition-opacity duration-300"
                style={{
                  width: `${era.widthPercent}%`,
                  backgroundColor: era.accentColor,
                  opacity: era.isActive ? 1 : 0.2,
                  borderRight:
                    i < eraSegments.length - 1
                      ? '1px solid rgba(5,10,24,0.6)'
                      : undefined,
                }}
              >
                {era.isActive && (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Filled progress overlay */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-5 rounded-full"
            style={{
              width: `${currentPercent}%`,
              background: `linear-gradient(90deg, transparent 0%, ${currentEra.accentColor}30 60%, ${currentEra.accentColor}50 100%)`,
            }}
          />

          {/* Scrubber thumb */}
          <div
            className="pointer-events-none absolute bottom-0"
            style={{
              left: `${currentPercent}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {/* Vertical connector line from tick area to thumb */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                top: -18,
                width: 2,
                height: 18,
                background: `linear-gradient(180deg, transparent, ${currentEra.accentColor}90)`,
              }}
            />
            {/* Thumb capsule */}
            <div
              className="relative flex items-center justify-center rounded-full"
              style={{
                width: 28,
                height: 44,
                background: `linear-gradient(180deg, ${currentEra.accentColor}, ${currentEra.accentColor}bb)`,
                border: '2.5px solid rgba(238,242,247,0.9)',
                boxShadow: `0 0 20px ${currentEra.accentColor}80, 0 0 48px ${currentEra.accentColor}30, 0 2px 8px rgba(0,0,0,0.5)`,
                marginBottom: 0,
              }}
            >
              <div className="h-3.5 w-1 rounded-full bg-white/50" />
            </div>
          </div>
        </div>
      </div>

      {/* Pulse animation for play button */}
      <style>{`
        @keyframes play-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </motion.div>
  );
}
