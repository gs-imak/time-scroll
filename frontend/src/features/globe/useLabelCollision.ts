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
  const trailingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const controls = globeRef.current?.controls?.();
    if (!controls) return;

    // Reads (getBoundingClientRect) and writes (style mutations) are kept in
    // separate phases so the loop forces a single layout reflow per run instead
    // of one per label. `controls 'change'` fires continuously during drag/zoom
    // (and damping keeps firing after release), so this runs often.
    const runCollision = (force = false) => {
      const now = performance.now();
      if (!force && now - lastRunRef.current < 150) return;
      lastRunRef.current = now;

      const labels = document.querySelectorAll<HTMLElement>('[data-civ-slug]');
      if (labels.length === 0) return;

      // Build occupied boxes from event-marker screen positions. `markers` is
      // currently always [] from GlobeView, so this is a no-op there; kept for
      // when the caller starts passing markers again.
      const occupied: PlacedBox[] = [];
      const MARKER_SCREEN_W = 60;
      const MARKER_SCREEN_H = 80;
      if (globeRef.current && markers.length > 0) {
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

      // Phase 1 — WRITE: reset every label's previous adjustments.
      for (const el of labels) {
        el.style.display = '';
        el.style.marginTop = '0px';
      }

      // Phase 2 — READ: measure every label after the reset (one reflow total),
      // sorted by importance so higher-priority labels claim space first.
      const measured = Array.from(labels)
        .sort(
          (a, b) =>
            parseInt(b.dataset.civImportance || '0', 10) -
            parseInt(a.dataset.civImportance || '0', 10),
        )
        .map(el => ({ el, rect: el.getBoundingClientRect() }));

      // Phase 3 — COMPUTE: decide placements, queue writes (no reads here).
      const placed: PlacedBox[] = [...occupied];
      const OFFSET_STEP = 32;
      const MAX_OFFSETS = 3;
      const writes: Array<{ el: HTMLElement; marginTop?: string; hide?: boolean }> = [];

      for (const { el, rect } of measured) {
        if (rect.width === 0 || rect.height === 0) continue;
        if (rect.right < 0 || rect.bottom < 0) continue;
        if (rect.left > window.innerWidth || rect.top > window.innerHeight) continue;

        const box: PlacedBox = { x: rect.left, y: rect.top, w: rect.width, h: rect.height };

        if (!placed.some(p => boxesOverlap(box, p))) {
          placed.push(box);
          continue;
        }

        let resolved = false;
        for (let attempt = 1; attempt <= MAX_OFFSETS; attempt++) {
          const downBox = { ...box, y: box.y + OFFSET_STEP * attempt };
          if (!placed.some(p => boxesOverlap(downBox, p))) {
            writes.push({ el, marginTop: `${OFFSET_STEP * attempt}px` });
            placed.push(downBox);
            resolved = true;
            break;
          }
          const upBox = { ...box, y: box.y - OFFSET_STEP * attempt };
          if (!placed.some(p => boxesOverlap(upBox, p))) {
            writes.push({ el, marginTop: `${-OFFSET_STEP * attempt}px` });
            placed.push(upBox);
            resolved = true;
            break;
          }
        }

        if (!resolved) writes.push({ el, hide: true });
      }

      // Phase 4 — WRITE: apply all adjustments in one batch.
      for (const w of writes) {
        if (w.hide) w.el.style.display = 'none';
        else if (w.marginTop) w.el.style.marginTop = w.marginTop;
      }
    };

    const onControlsChange = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => runCollision());
      // Guarantee a final settle pass after movement stops, even if the
      // throttle dropped the last 'change' event.
      if (trailingRef.current) clearTimeout(trailingRef.current);
      trailingRef.current = setTimeout(() => runCollision(true), 200);
    };

    onControlsChange();
    controls.addEventListener('change', onControlsChange);

    return () => {
      controls.removeEventListener('change', onControlsChange);
      cancelAnimationFrame(rafRef.current);
      if (trailingRef.current) clearTimeout(trailingRef.current);

      const labels = document.querySelectorAll<HTMLElement>('[data-civ-slug]');
      for (const el of labels) {
        el.style.display = '';
        el.style.marginTop = '0px';
      }
    };
  }, [globeRef, enabled, markers]);
}
