import { useCallback, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useTimeStore } from '@/shared/stores/timeStore';
import { ERAS, MIN_YEAR, MAX_YEAR } from '@/shared/utils/constants';
import { formatYear } from '@/shared/utils/format';
import { usePlayback } from './usePlayback';
import { cn } from '@/shared/utils/cn';

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

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const pct = getPercentFromPointer(e.clientX);
      setYear(percentToYear(pct));
    },
    [setYear, getPercentFromPointer, percentToYear]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const pct = getPercentFromPointer(e.clientX);
      setHoverYear(percentToYear(pct));
      setHoverX(e.clientX - rect.left);
      if (isDragging.current) setYear(percentToYear(pct));
    },
    [setYear, getPercentFromPointer, percentToYear]
  );

  const onPointerUp = useCallback(() => { isDragging.current = false; }, []);
  const onPointerLeave = useCallback(() => { setHoverYear(null); isDragging.current = false; }, []);

  const currentPercent = yearToPercent(currentYear);

  const eraSegments = useMemo(
    () => ERAS.map(era => ({
      ...era,
      widthPercent: yearToPercent(era.endYear) - yearToPercent(era.startYear),
      isActive: era.id === currentEra.id,
    })),
    [currentEra.id, yearToPercent]
  );

  // Get hex color for current era (CSS vars don't work here)
  const ERA_HEX: Record<string, string> = {
    prehistory: '#8d7b68', ancient: '#f5a623', classical: '#ef4444',
    medieval: '#9b59b6', renaissance: '#3b82f6', industrial: '#84cc16', modern: '#00d4ff',
  };
  const eraHex = ERA_HEX[currentEra.id] ?? '#ffffff';

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-40 px-4 pb-4 md:px-6 md:pb-5"
      initial={{ y: 120 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 160, damping: 22 }}
    >
      <div className="glass-strong rounded-2xl overflow-hidden">
        {/* === ROW 1: Era info + Year + Controls === */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 md:px-6 md:pt-5 md:pb-4">
          {/* Left: prev era + era name */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={prevEra}
              className="shrink-0 w-9 h-9 rounded-full border border-border-subtle bg-elevated/40 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors cursor-pointer"
              aria-label="Previous era"
            >
              <SkipBack size={14} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 shrink-0 rounded-full" style={{ backgroundColor: eraHex, boxShadow: `0 0 8px ${eraHex}` }} />
                <span className="text-sm font-semibold truncate md:text-base" style={{ color: eraHex }}>{currentEra.name}</span>
              </div>
              <p className="hidden md:block mt-0.5 text-xs text-text-muted truncate max-w-[300px]">{currentEra.description}</p>
            </div>
          </div>

          {/* Center: Year */}
          <div className="shrink-0 px-4">
            <span className="font-mono text-2xl md:text-3xl font-bold tracking-wider text-text-primary tabular-nums">
              {formatYear(currentYear)}
            </span>
          </div>

          {/* Right: Play + next era */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            <button
              onClick={togglePlay}
              className={cn(
                'shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer',
                isPlaying
                  ? 'bg-accent-cyan text-void'
                  : 'border border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20'
              )}
              style={isPlaying ? { boxShadow: '0 0 20px rgba(0,212,255,0.4)' } : undefined}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <button
              onClick={nextEra}
              className="shrink-0 w-9 h-9 rounded-full border border-border-subtle bg-elevated/40 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors cursor-pointer"
              aria-label="Next era"
            >
              <SkipForward size={14} />
            </button>
          </div>
        </div>

        {/* === ROW 2: Scrubber track === */}
        <div
          ref={trackRef}
          className="relative px-5 pb-5 pt-1 md:px-6 md:pb-6 cursor-pointer touch-none select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerLeave}
          role="slider"
          aria-label="Timeline"
          aria-valuemin={MIN_YEAR}
          aria-valuemax={MAX_YEAR}
          aria-valuenow={currentYear}
          aria-valuetext={formatYear(currentYear)}
          tabIndex={0}
        >
          {/* Hover tooltip */}
          {hoverYear !== null && !isDragging.current && (
            <div
              className="absolute top-[-4px] pointer-events-none z-10"
              style={{ left: `calc(${(hoverX / (trackRef.current?.clientWidth ?? 1)) * 100}% + 20px)`, transform: 'translateX(-50%)' }}
            >
              <div className="glass-light rounded-md px-2 py-0.5 text-[10px] font-mono tabular-nums text-text-secondary whitespace-nowrap">
                {formatYear(hoverYear)}
              </div>
            </div>
          )}

          {/* Era segment track */}
          <div className="flex h-3 rounded-full overflow-hidden">
            {eraSegments.map((era, i) => (
              <div
                key={era.id}
                className="h-full transition-opacity duration-300 relative"
                style={{
                  width: `${era.widthPercent}%`,
                  backgroundColor: ERA_HEX[era.id],
                  opacity: era.isActive ? 1 : 0.2,
                  borderRight: i < eraSegments.length - 1 ? '1px solid rgba(5,10,24,0.5)' : undefined,
                }}
              />
            ))}
          </div>

          {/* Thumb */}
          <div
            className="absolute top-1 pointer-events-none"
            style={{ left: `calc(${currentPercent}% * (1 - 40px / ${trackRef.current?.clientWidth ?? 1000}) + 20px)` }}
          >
            <div
              className="w-3 h-5 -translate-x-1/2 rounded-full border-2"
              style={{
                backgroundColor: eraHex,
                borderColor: 'rgba(238,242,247,0.85)',
                boxShadow: `0 0 10px ${eraHex}80, 0 1px 4px rgba(0,0,0,0.4)`,
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
