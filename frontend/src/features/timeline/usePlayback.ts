import { useEffect, useRef } from 'react';
import { useTimeStore } from '@/shared/stores/timeStore';
import { MAX_YEAR } from '@/shared/utils/constants';

export function usePlayback() {
  const isPlaying = useTimeStore(s => s.isPlaying);
  const playbackSpeed = useTimeStore(s => s.playbackSpeed);
  const setYear = useTimeStore(s => s.setYear);
  const togglePlay = useTimeStore(s => s.togglePlay);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) return;

    const yearsPerSecond = 50 * playbackSpeed;

    const tick = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      const next = useTimeStore.getState().currentYear + yearsPerSecond * dt;
      if (next >= MAX_YEAR) {
        setYear(MAX_YEAR);
        togglePlay();
        return;
      }
      setYear(Math.round(next));
      rafRef.current = requestAnimationFrame(tick);
    };

    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, playbackSpeed, setYear, togglePlay]);
}
