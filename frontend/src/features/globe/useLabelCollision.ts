import { useEffect, useRef } from 'react';
import type { GlobeMethods } from 'react-globe.gl';
import type { ClusterOrEvent } from './useEventClustering';

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
 * lower-priority ones. Also avoids event markers by treating their screen
 * positions as occupied zones.
 */
export function useLabelCollision(
  globeRef: React.RefObject<GlobeMethods | undefined>,
  enabled: boolean,
  markers: ClusterOrEvent[],
) {
  const rafRef = useRef<number>(0);
  const lastRunRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const controls = globeRef.current?.controls?.();
    if (!controls) return;

    const runCollision = () => {
      const now = performance.now();
      if (now - lastRunRef.current < 100) return;
      lastRunRef.current = now;

      const labels = document.querySelectorAll<HTMLElement>('[data-civ-slug]');
      if (labels.length === 0) return;

      // Build occupied boxes from event marker screen positions
      // Markers are THREE.js objects, so we use getScreenCoords to find them
      const occupied: PlacedBox[] = [];
      const MARKER_SCREEN_W = 60; // approximate screen footprint of a marker
      const MARKER_SCREEN_H = 80;

      if (globeRef.current) {
        for (const m of markers) {
          const lat = m.type === 'cluster' ? m.lat : (m as any).displayLat ?? (m as any).latitude;
          const lng = m.type === 'cluster' ? m.lng : (m as any).displayLng ?? (m as any).longitude;
          const screenPos = globeRef.current.getScreenCoords(lat, lng, 0.01);
          if (screenPos && screenPos.x > -100 && screenPos.y > -100) {
            occupied.push({
              x: screenPos.x - MARKER_SCREEN_W / 2,
              y: screenPos.y - MARKER_SCREEN_H,
              w: MARKER_SCREEN_W,
              h: MARKER_SCREEN_H,
            });
          }
        }
      }

      // Sort labels by importance descending
      const sorted = Array.from(labels).sort((a, b) => {
        const impA = parseInt(a.dataset.civImportance || '0', 10);
        const impB = parseInt(b.dataset.civImportance || '0', 10);
        return impB - impA;
      });

      const placed: PlacedBox[] = [...occupied]; // start with marker positions as "taken"
      const OFFSET_STEP = 32;
      const MAX_OFFSETS = 3;

      for (const el of sorted) {
        // Reset previous adjustments
        el.style.display = '';
        el.style.marginTop = '0px';

        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        if (rect.right < 0 || rect.bottom < 0) continue;
        if (rect.left > window.innerWidth || rect.top > window.innerHeight) continue;

        const box: PlacedBox = {
          x: rect.left,
          y: rect.top,
          w: rect.width,
          h: rect.height,
        };

        const hasOverlap = placed.some(p => boxesOverlap(box, p));

        if (!hasOverlap) {
          placed.push(box);
          continue;
        }

        // Try offsetting vertically (down first, then up)
        let resolved = false;
        for (let attempt = 1; attempt <= MAX_OFFSETS; attempt++) {
          const downBox = { ...box, y: box.y + OFFSET_STEP * attempt };
          if (!placed.some(p => boxesOverlap(downBox, p))) {
            el.style.marginTop = `${OFFSET_STEP * attempt}px`;
            placed.push(downBox);
            resolved = true;
            break;
          }
          const upBox = { ...box, y: box.y - OFFSET_STEP * attempt };
          if (!placed.some(p => boxesOverlap(upBox, p))) {
            el.style.marginTop = `${-OFFSET_STEP * attempt}px`;
            placed.push(upBox);
            resolved = true;
            break;
          }
        }

        if (!resolved) {
          el.style.display = 'none';
        }
      }
    };

    const onControlsChange = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(runCollision);
    };

    onControlsChange();
    controls.addEventListener('change', onControlsChange);

    return () => {
      controls.removeEventListener('change', onControlsChange);
      cancelAnimationFrame(rafRef.current);

      const labels = document.querySelectorAll<HTMLElement>('[data-civ-slug]');
      for (const el of labels) {
        el.style.display = '';
        el.style.marginTop = '0px';
      }
    };
  }, [globeRef, enabled, markers]);
}
