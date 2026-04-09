import { useEffect } from 'react';
import { useWarStore } from '@/shared/stores/warStore';

/**
 * Headless component — drives the diff overlay / pulse fade lifecycles.
 * Runs an rAF loop while War Mode is active that prunes expired entries
 * from the war store. The actual visual updates (opacity, ring radius)
 * happen inside `customThreeObjectUpdate` in GlobeView.
 */
export function WarFxLayer() {
  const active = useWarStore((s) => s.active);

  useEffect(() => {
    if (!active) return;
    let frameId: number;
    const tick = () => {
      useWarStore.getState().pruneFx(performance.now());
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [active]);

  return null;
}
