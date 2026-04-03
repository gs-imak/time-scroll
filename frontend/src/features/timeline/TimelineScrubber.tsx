import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTimeStore } from '@/shared/stores/timeStore';
import { ERAS, MIN_YEAR, MAX_YEAR } from '@/shared/utils/constants';
import { formatYear } from '@/shared/utils/format';
import { usePlayback } from './usePlayback';
import { cn } from '@/shared/utils/cn';

const TICK_YEARS = [-8000, -5000, -3000, -1000, 0, 500, 1000, 1500, 1800, 1900, 2000];

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

  const yearToPercent = (year: number) =>
    ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

  const percentToYear = (pct: number) =>
    Math.round(MIN_YEAR + (pct / 100) * (MAX_YEAR - MIN_YEAR));

  const getPercentFromPointer = (clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  };

  const handlePointerEvent = useCallback(
    (e: React.PointerEvent) => {
      const pct = getPercentFromPointer(e.clientX);
      setYear(percentToYear(pct));
    },
    [setYear]
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
    [handlePointerEvent]
  );

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const onPointerLeave = useCallback(() => {
    setHoverYear(null);
    isDragging.current = false;
  }, []);

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 z-40"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 180, damping: 22 }}
    >
      <div className="glass-strong mx-3 mb-3 rounded-[var(--radius-xl)] px-4 pt-3 pb-2 md:mx-6">
        {/* Top row: era badge, year, controls */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={prevEra}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all cursor-pointer hover:brightness-110"
            style={{ background: currentEra.accentColor, color: '#050a18' }}
          >
            <ChevronLeft size={12} />
            {currentEra.name}
          </button>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xl font-bold tracking-wider text-text-primary tabular-nums">
              {formatYear(currentYear)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={togglePlay}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full transition-all cursor-pointer',
                isPlaying
                  ? 'bg-accent-cyan text-void shadow-[0_0_20px_rgba(0,212,255,0.4)]'
                  : 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/25'
              )}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
            <button
              onClick={nextEra}
              className="flex items-center justify-center w-8 h-8 rounded-full text-text-secondary hover:text-text-primary hover:bg-elevated/60 transition-colors cursor-pointer"
              aria-label="Next era"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Track area */}
        <div
          ref={trackRef}
          className="relative h-10 cursor-pointer touch-none select-none group"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerLeave}
        >
          {/* Era segments */}
          <div className="absolute top-3 left-0 right-0 h-3 rounded-full overflow-hidden flex">
            {ERAS.map(era => {
              const isActive = era.id === currentEra.id;
              return (
                <div
                  key={era.id}
                  className="h-full transition-all duration-300 relative"
                  style={{
                    width: `${yearToPercent(era.endYear) - yearToPercent(era.startYear)}%`,
                    background: isActive ? era.accentColor : `${era.accentColor}`,
                    opacity: isActive ? 1 : 0.2,
                  }}
                />
              );
            })}
          </div>

          {/* Tick marks */}
          {TICK_YEARS.map(year => (
            <div
              key={year}
              className="absolute top-1 flex flex-col items-center pointer-events-none"
              style={{ left: `${yearToPercent(year)}%` }}
            >
              <div className="w-px h-2 bg-border-bright opacity-40" />
              <span className="text-[8px] text-text-muted mt-0.5 font-mono tabular-nums">
                {year <= 0 ? `${Math.abs(year)}BC` : year}
              </span>
            </div>
          ))}

          {/* Hover preview tooltip */}
          {hoverYear !== null && !isDragging.current && (
            <div
              className="absolute -top-8 pointer-events-none"
              style={{ left: hoverX, transform: 'translateX(-50%)' }}
            >
              <div className="glass-light rounded-md px-2 py-0.5 text-[10px] font-mono text-text-secondary tabular-nums">
                {formatYear(hoverYear)}
              </div>
            </div>
          )}

          {/* Filled progress */}
          <div
            className="absolute top-3 left-0 h-3 rounded-full pointer-events-none"
            style={{
              width: `${yearToPercent(currentYear)}%`,
              background: `linear-gradient(90deg, ${currentEra.accentColor}00, ${currentEra.accentColor}60)`,
            }}
          />

          {/* Thumb */}
          <div
            className="absolute top-0 -translate-x-1/2 pointer-events-none"
            style={{ left: `${yearToPercent(currentYear)}%` }}
          >
            <div
              className="w-5 h-9 rounded-full border-2 flex items-center justify-center"
              style={{
                background: `linear-gradient(180deg, ${currentEra.accentColor}, ${currentEra.accentColor}aa)`,
                borderColor: '#eef2f7',
                boxShadow: `0 0 12px ${currentEra.accentColor}80, 0 2px 8px rgba(0,0,0,0.4)`,
              }}
            >
              <div className="w-1 h-3 rounded-full bg-white/60" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
