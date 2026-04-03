import { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useTimeStore } from '@/shared/stores/timeStore';
import { ERAS, MIN_YEAR, MAX_YEAR } from '@/shared/utils/constants';
import { formatYear } from '@/shared/utils/format';
import { IconButton } from '@/shared/components';
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

  const yearToPercent = (year: number) =>
    ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

  const percentToYear = (pct: number) =>
    Math.round(MIN_YEAR + (pct / 100) * (MAX_YEAR - MIN_YEAR));

  const handlePointerEvent = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
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
      if (isDragging.current) handlePointerEvent(e);
    },
    [handlePointerEvent]
  );

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 z-40"
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 25 }}
    >
      <div className="glass-strong mx-4 mb-4 rounded-[var(--radius-xl)] px-4 py-3 md:mx-8">
        {/* Year display */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: currentEra.accentColor, color: 'var(--color-void)' }}
          >
            {currentEra.name}
          </span>
          <span className="font-mono text-lg font-semibold tracking-wider text-text-primary">
            {formatYear(currentYear)}
          </span>
          <div className="flex items-center gap-1">
            <IconButton icon={SkipBack} size={16} onClick={prevEra} aria-label="Previous era" />
            <IconButton
              icon={isPlaying ? Pause : Play}
              size={16}
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="!w-8 !h-8 bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan"
            />
            <IconButton icon={SkipForward} size={16} onClick={nextEra} aria-label="Next era" />
          </div>
        </div>

        {/* Track */}
        <div
          ref={trackRef}
          className="relative h-8 cursor-pointer touch-none select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* Era segments */}
          <div className="absolute top-3 left-0 right-0 h-2 rounded-full overflow-hidden flex">
            {ERAS.map(era => (
              <div
                key={era.id}
                className={cn(
                  'h-full transition-opacity duration-300',
                  era.id === currentEra.id ? 'opacity-100' : 'opacity-30'
                )}
                style={{
                  width: `${yearToPercent(era.endYear) - yearToPercent(era.startYear)}%`,
                  background: era.accentColor,
                }}
              />
            ))}
          </div>

          {/* Thumb */}
          <div
            className="absolute top-1 -translate-x-1/2 w-4 h-6 rounded-full bg-text-primary shadow-lg shadow-accent-cyan/30 border-2 border-accent-cyan pointer-events-none"
            style={{ left: `${yearToPercent(currentYear)}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}
