import { useEffect, useRef } from 'react';
import type { GlobeMethods } from 'react-globe.gl';

interface PlacedBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

function boxesOverlap(a: PlacedBox, b: PlacedBox): boolean {
  return !(
    a.x + a.w < b.x ||
    b.x + b.w < a.x ||
    a.y + a.h < b.y ||
    b.y + b.h < a.y
  );
}

/**
 * Detects overlapping civilization labels on-screen and hides or offsets
 * lower-priority ones. Runs in a rAF loop tied to camera changes.
 *
 * Labels must have `data-civ-slug` and `data-civ-importance` attributes
 * set in the htmlElement callback.
 */
export function useLabelCollision(
  globeRef: React.RefObject<GlobeMethods | undefined>,
  enabled: boolean,
) {
  const rafRef = useRef<number>(0);
  const lastRunRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const controls = globeRef.current?.controls?.();
    if (!controls) return;

    const runCollision = () => {
      const now = performance.now();
      // Throttle to ~10fps for collision checks
      if (now - lastRunRef.current < 100) return;
      lastRunRef.current = now;

      const labels = document.querySelectorAll<HTMLElement>('[data-civ-slug]');
      if (labels.length === 0) return;

      // Sort by importance descending — important labels get priority placement
      const sorted = Array.from(labels).sort((a, b) => {
        const impA = parseInt(a.dataset.civImportance || '0', 10);
        const impB = parseInt(b.dataset.civImportance || '0', 10);
        return impB - impA;
      });

      const placed: PlacedBox[] = [];
      const OFFSET_STEP = 30;
      const MAX_OFFSETS = 2;

      for (const el of sorted) {
        // Reset any previous adjustments
        el.style.display = '';
        el.style.marginTop = '0px';

        const rect = el.getBoundingClientRect();
        // Skip labels that are off-screen or behind the globe
        if (rect.width === 0 || rect.height === 0) continue;
        if (rect.right < 0 || rect.bottom < 0) continue;
        if (rect.left > window.innerWidth || rect.top > window.innerHeight) continue;

        const box: PlacedBox = {
          x: rect.left,
          y: rect.top,
          w: rect.width,
          h: rect.height,
        };

        // Check overlap with already-placed labels
        const hasOverlap = placed.some(p => boxesOverlap(box, p));

        if (!hasOverlap) {
          placed.push(box);
          continue;
        }

        // Try offsetting vertically
        let resolved = false;
        for (let attempt = 1; attempt <= MAX_OFFSETS; attempt++) {
          // Try pushing down
          const downBox = { ...box, y: box.y + OFFSET_STEP * attempt };
          if (!placed.some(p => boxesOverlap(downBox, p))) {
            el.style.marginTop = `${OFFSET_STEP * attempt}px`;
            placed.push(downBox);
            resolved = true;
            break;
          }
          // Try pushing up
          const upBox = { ...box, y: box.y - OFFSET_STEP * attempt };
          if (!placed.some(p => boxesOverlap(upBox, p))) {
            el.style.marginTop = `${-OFFSET_STEP * attempt}px`;
            placed.push(upBox);
            resolved = true;
            break;
          }
        }

        // If still overlapping after offsets, hide the label
        if (!resolved) {
          el.style.display = 'none';
        }
      }
    };

    const onControlsChange = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(runCollision);
    };

    // Run once immediately and then on every camera change
    onControlsChange();
    controls.addEventListener('change', onControlsChange);

    return () => {
      controls.removeEventListener('change', onControlsChange);
      cancelAnimationFrame(rafRef.current);

      // Clean up styles on unmount
      const labels = document.querySelectorAll<HTMLElement>('[data-civ-slug]');
      for (const el of labels) {
        el.style.display = '';
        el.style.marginTop = '0px';
      }
    };
  }, [globeRef, enabled]);
}
