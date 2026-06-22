import { useEffect } from 'react';
import { useWarStore } from '@/shared/stores/warStore';
import { useTimeStore } from '@/shared/stores/timeStore';
import { computeYearDiff } from './warDiff';
import { getWarGeoJson, closestWarYear } from '@/shared/data/warGeoJsonCache';
import { WAR_EVENTS } from '@/shared/data/warEvents';

/**
 * Drives War Mode auto-playback. Modeled after `useSpotlightPlayback`.
 *
 * Beat = 5500 ms at 1× — gives the 2.8 s polygon crossfade, the 2.5 s diff
 * overlay fade, and read time for the marker labels. At 2× = 2750 ms,
 * at 3× = 1833 ms. The crossfade is driven by react-globe.gl's altitude
 * tween when a country's SHAPE_HASH changes year-to-year; unchanged
 * countries have zero visible transition.
 */
export function useWarPlayback() {
  const active = useWarStore((s) => s.active);
  const isPlaying = useWarStore((s) => s.isPlaying);
  const playSpeed = useWarStore((s) => s.playSpeed);
  const snapshotYears = useWarStore((s) => s.snapshotYears);
  const currentIndex = useWarStore((s) => s.currentIndex);
  const activeWar = useWarStore((s) => s.activeWar);

  const setYear = useTimeStore((s) => s.setYear);

  // Auto-advance loop
  useEffect(() => {
    if (!active || !isPlaying || snapshotYears.length === 0) return;
    const interval = 5500 / playSpeed;
    const timer = setInterval(() => {
      const state = useWarStore.getState();
      const next = state.currentIndex + 1;
      if (next >= state.snapshotYears.length) {
        state.togglePlay();
        return;
      }
      state.setIndex(next);
    }, interval);
    return () => clearInterval(timer);
  }, [active, isPlaying, playSpeed, snapshotYears]);

  // Sync globe year + emit FX whenever the snapshot index changes
  useEffect(() => {
    if (!active || snapshotYears.length === 0) return;
    const year = snapshotYears[currentIndex];
    if (year === undefined) return;

    setYear(year);

    const now = performance.now();
    const state = useWarStore.getState();

    // Compute diff overlays vs the previous snapshot
    if (currentIndex > 0) {
      const prevYear = snapshotYears[currentIndex - 1]!;
      // Resolve from the war cache (the data actually on screen), not the
      // aourednik timeline cache.
      const diffs = computeYearDiff(
        prevYear,
        year,
        now,
        (y) => getWarGeoJson(closestWarYear(y)),
      );
      state.setDiffOverlays(diffs);
    } else {
      state.setDiffOverlays([]);
    }

    // Spawn pulses for any war events that fire on this year
    if (activeWar) {
      const newPulses = WAR_EVENTS
        .filter((e) => e.war === activeWar && e.year === year)
        .map((e) => ({
          id: `pulse-${e.id}-${now}`,
          lat: e.latitude,
          lng: e.longitude,
          bornAt: now,
        }));
      if (newPulses.length > 0) state.addPulses(newPulses);
    }
  }, [active, currentIndex, snapshotYears, activeWar, setYear]);
}
