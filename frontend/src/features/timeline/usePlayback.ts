import { useEffect, useRef } from 'react';
import { useTimeStore } from '@/shared/stores/timeStore';
import { BOUNDARY_YEAR_MAP, MAX_YEAR } from '@/shared/utils/constants';

const BUCKETS = [...new Set(Object.keys(BOUNDARY_YEAR_MAP).map(Number))].sort((a, b) => a - b);

/**
 * Seconds each boundary snapshot stays on screen at 1x speed.
 *
 * Playback used to advance at a flat 50 years/second, but snapshot density
 * varies ~100x across the timeline (prehistoric buckets are 1,000+ years
 * apart, 20th-century ones 10-30). A constant year-rate meant minutes of
 * nothing in the deep past and a border change every ~300ms in the modern
 * era — faster than any transition can play. Pacing by SNAPSHOT instead
 * gives every border state the same screen time; the year counter simply
 * spins at whatever rate the current gap implies.
 */
const SNAPSHOT_DWELL_S = 2.8;

/** Year-span of the bucket interval containing `year` (clamped at the ends). */
function bucketGap(year: number): number {
  let prev = BUCKETS[0]!;
  for (const b of BUCKETS) {
    if (b > year) return b - prev;
    prev = b;
  }
  // Past the last snapshot — keep the final interval's pace to the end.
  return Math.max(10, BUCKETS[BUCKETS.length - 1]! - BUCKETS[BUCKETS.length - 2]!);
}

export function usePlayback() {
  const isPlaying = useTimeStore(s => s.isPlaying);
  const playbackSpeed = useTimeStore(s => s.playbackSpeed);
  const setYear = useTimeStore(s => s.setYear);
  const togglePlay = useTimeStore(s => s.togglePlay);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  // Fractional year accumulator — the store holds integer years, so at slow
  // year-rates (small buckets) rounding store+delta each frame would never
  // advance. Accumulate the fraction here; resync if the user scrubbed.
  const floatYearRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) return;

    const tick = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      const storeYear = useTimeStore.getState().currentYear;
      if (floatYearRef.current === null || Math.abs(storeYear - Math.round(floatYearRef.current)) > 1) {
        floatYearRef.current = storeYear;
      }
      const yearsPerSecond = (bucketGap(floatYearRef.current) / SNAPSHOT_DWELL_S) * playbackSpeed;
      floatYearRef.current += yearsPerSecond * dt;
      if (floatYearRef.current >= MAX_YEAR) {
        setYear(MAX_YEAR);
        togglePlay();
        return;
      }
      setYear(Math.round(floatYearRef.current));
      rafRef.current = requestAnimationFrame(tick);
    };

    lastTimeRef.current = 0;
    floatYearRef.current = null;
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, playbackSpeed, setYear, togglePlay]);
}
