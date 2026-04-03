import { useCallback, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useTimeStore } from '@/shared/stores/timeStore';
import { ERAS, MIN_YEAR, MAX_YEAR } from '@/shared/utils/constants';
import { formatYear } from '@/shared/utils/format';
import { usePlayback } from './usePlayback';
import { cn } from '@/shared/utils/cn';

const ERA_HEX: Record<string, string> = {
  prehistory: '#8d7b68',
  ancient: '#f5a623',
  classical: '#ef4444',
  medieval: '#9b59b6',
  renaissance: '#3b82f6',
  industrial: '#84cc16',
  modern: '#00d4ff',
};

const TOTAL_RANGE = MAX_YEAR - MIN_YEAR;

function yearToPercent(year: number) {
  return ((year - MIN_YEAR) / TOTAL_RANGE) * 100;
}

function percentToYear(pct: number) {
  return Math.round(MIN_YEAR + (pct / 100) * TOTAL_RANGE);
}

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
  const [hoverPct, setHoverPct] = useState(0);

  const eraHex = ERA_HEX[currentEra.id] ?? '#ffffff';

  const getPercentFromPointer = useCallback((clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const pct = getPercentFromPointer(e.clientX);
      setYear(percentToYear(pct));
    },
    [setYear, getPercentFromPointer],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const pct = getPercentFromPointer(e.clientX);
      setHoverYear(percentToYear(pct));
      setHoverPct(pct);
      if (isDragging.current) setYear(percentToYear(pct));
    },
    [setYear, getPercentFromPointer],
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
        startPct: yearToPercent(era.startYear),
        widthPct: yearToPercent(era.endYear) - yearToPercent(era.startYear),
        hex: ERA_HEX[era.id] ?? '#ffffff',
        isActive: era.id === currentEra.id,
      })),
    [currentEra.id],
  );

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-4 sm:pb-4 md:px-6 md:pb-5"
      initial={{ y: 140 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 140, damping: 22 }}
    >
      <div
        className="glass-strong rounded-2xl"
        style={{
          boxShadow: `0 -1px 40px ${eraHex}10, 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
      >
        {/* === Top row: era info / year / controls === */}
        <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 sm:px-6 sm:pt-5 sm:pb-4 md:px-8">
          {/* LEFT column: era name + description */}
          <div className="hidden min-w-0 flex-1 sm:block">
            <div className="flex items-center gap-2.5">
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: eraHex,
                  boxShadow: `0 0 10px ${eraHex}90, 0 0 4px ${eraHex}`,
                }}
              />
              <span
                className="text-sm font-semibold leading-tight tracking-wide md:text-base"
                style={{ color: eraHex }}
              >
                {currentEra.name}
              </span>
            </div>
            <p
              className="mt-1.5 line-clamp-2 max-w-[340px] text-xs leading-relaxed text-text-muted md:text-[13px]"
              title={currentEra.description}
            >
              {currentEra.description}
            </p>
          </div>

          {/* CENTER column: year display */}
          <div className="flex shrink-0 flex-col items-center">
            <span
              className="font-mono text-2xl font-bold tracking-widest tabular-nums sm:text-3xl md:text-4xl"
              style={{
                color: '#eef2f7',
                textShadow: `0 0 24px ${eraHex}40`,
              }}
            >
              {formatYear(currentYear)}
            </span>
            {/* Era name shown on mobile only (since left column is hidden) */}
            <span
              className="mt-1 text-xs font-medium tracking-wide sm:hidden"
              style={{ color: eraHex }}
            >
              {currentEra.name}
            </span>
          </div>

          {/* RIGHT column: playback controls */}
          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
            <button
              onClick={prevEra}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-subtle bg-elevated/50 text-text-secondary transition-all hover:scale-105 hover:border-border-active hover:bg-elevated hover:text-text-primary active:scale-95"
              aria-label="Previous era"
            >
              <SkipBack size={16} />
            </button>

            <button
              onClick={togglePlay}
              className={cn(
                'flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95',
                'h-12 w-12 sm:h-[52px] sm:w-[52px]',
                isPlaying
                  ? 'text-void'
                  : 'border border-white/20 text-white hover:border-white/30',
              )}
              style={
                isPlaying
                  ? {
                      backgroundColor: eraHex,
                      boxShadow: `0 0 24px ${eraHex}60, 0 0 8px ${eraHex}40`,
                    }
                  : {
                      backgroundColor: `${eraHex}18`,
                      boxShadow: `inset 0 0 20px ${eraHex}10`,
                    }
              }
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={20} strokeWidth={2.5} />
              ) : (
                <Play size={20} strokeWidth={2.5} className="ml-0.5" />
              )}
            </button>

            <button
              onClick={nextEra}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-subtle bg-elevated/50 text-text-secondary transition-all hover:scale-105 hover:border-border-active hover:bg-elevated hover:text-text-primary active:scale-95"
              aria-label="Next era"
            >
              <SkipForward size={16} />
            </button>
          </div>
        </div>

        {/* === Bottom row: era segment track + scrubber === */}
        <div
          className="px-5 pb-5 sm:px-6 sm:pb-5 md:px-8 md:pb-6"
        >
          {/* Track wrapper: ref + pointer events live here so % maps 1:1 to track */}
          <div
            ref={trackRef}
            className="relative cursor-pointer touch-none select-none"
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
                  style={{
                    left: `${hoverPct}%`,
                    top: '-28px',
                    transform: 'translateX(-50%)',
                  }}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.12 }}
                >
                  <div className="glass-light rounded-md px-2.5 py-1 font-mono text-[11px] tabular-nums text-text-secondary whitespace-nowrap">
                    {formatYear(hoverYear)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Track background well */}
            <div className="rounded-full bg-white/[0.04] p-[2px]">
              <div className="flex h-[10px] overflow-hidden rounded-full">
                {eraSegments.map((era, i) => (
                  <div
                    key={era.id}
                    className="h-full transition-opacity duration-300"
                    style={{
                      width: `${era.widthPct}%`,
                      backgroundColor: era.hex,
                      opacity: era.isActive ? 0.9 : 0.2,
                      borderRight:
                        i < eraSegments.length - 1
                          ? '1px solid rgba(5,10,24,0.6)'
                          : undefined,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Thumb — left % maps directly to track since wrapper has no padding */}
            <div
              className="pointer-events-none absolute -translate-x-1/2"
              style={{
                left: `${currentPercent}%`,
                top: '-2px',
              }}
            >
              <div
                className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  backgroundColor: eraHex,
                  filter: 'blur(8px)',
                  opacity: 0.45,
                }}
              />
              <div
                className="relative h-[18px] w-[14px] rounded-full border-[2.5px]"
                style={{
                  backgroundColor: eraHex,
                  borderColor: 'rgba(238,242,247,0.9)',
                  boxShadow: `0 0 12px ${eraHex}80, 0 2px 6px rgba(0,0,0,0.5)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
