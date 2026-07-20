import { useEffect } from 'react';
import { useSpotlightStore } from '@/shared/stores/spotlightStore';
import { useTimeStore } from '@/shared/stores/timeStore';

/** Auto-advances through spotlight snapshot years at configurable speed */
export function useSpotlightPlayback() {
  const active = useSpotlightStore(s => s.active);
  const isPlaying = useSpotlightStore(s => s.isPlaying);
  const playSpeed = useSpotlightStore(s => s.playSpeed);
  const snapshotYears = useSpotlightStore(s => s.snapshotYears);
  const setYear = useTimeStore(s => s.setYear);

  useEffect(() => {
    if (!active || !isPlaying || snapshotYears.length === 0) return;

    // Pause 3s / speed between steps — reading time for the stage card, with the
    // 800ms border transition comfortably inside it.
    const interval = 3000 / playSpeed;

    const timer = setInterval(() => {
      const state = useSpotlightStore.getState();
      const nextIndex = state.currentSnapshotIndex + 1;

      if (nextIndex >= snapshotYears.length) {
        // Reached the end, stop
        state.togglePlay();
        return;
      }

      state.setSnapshotIndex(nextIndex);
      const year = snapshotYears[nextIndex];
      if (year !== undefined) setYear(year);
    }, interval);

    return () => clearInterval(timer);
  }, [active, isPlaying, playSpeed, snapshotYears, setYear]);

  // Sync year when snapshot index changes manually (step forward/backward)
  const currentSnapshotIndex = useSpotlightStore(s => s.currentSnapshotIndex);
  useEffect(() => {
    if (!active || snapshotYears.length === 0) return;
    const year = snapshotYears[currentSnapshotIndex];
    if (year !== undefined) setYear(year);
  }, [active, currentSnapshotIndex, snapshotYears, setYear]);
}
