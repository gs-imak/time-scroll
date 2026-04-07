import { useRef, useCallback } from 'react';

/**
 * Smoothly morphs territory polygons between GeoJSON snapshots.
 * Resamples polygon rings to consistent point count and linearly
 * interpolates coordinates over time with easing.
 */

// ── Ring resampling ───────────────────────────────────────────────

function ringLength(ring: number[][]): number {
  let len = 0;
  for (let i = 1; i < ring.length; i++) {
    const a = ring[i] as number[], b = ring[i - 1] as number[];
    const dx = a[0]! - b[0]!;
    const dy = a[1]! - b[1]!;
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len;
}

function resampleRing(ring: number[][], n: number): number[][] {
  if (ring.length < 2) {
    const pt = ring[0] || [0, 0];
    return Array.from({ length: n }, () => [...pt]);
  }

  const totalLen = ringLength(ring);
  if (totalLen === 0) {
    const pt = ring[0]!;
    return Array.from({ length: n }, () => [...pt]);
  }

  const step = totalLen / n;
  const result: number[][] = [[...(ring[0]!)]];
  let distAccum = 0;
  let nextDist = step;
  let j = 1;

  while (result.length < n && j < ring.length) {
    const prev = ring[j - 1] as number[];
    const curr = ring[j] as number[];
    const dx = curr[0]! - prev[0]!;
    const dy = curr[1]! - prev[1]!;
    const segLen = Math.sqrt(dx * dx + dy * dy);

    if (segLen === 0) { j++; continue; }

    const segStart = distAccum;
    const segEnd = distAccum + segLen;

    while (nextDist <= segEnd && result.length < n) {
      const t = (nextDist - segStart) / segLen;
      result.push([prev[0]! + dx * t, prev[1]! + dy * t]);
      nextDist += step;
    }

    distAccum = segEnd;
    j++;
  }

  while (result.length < n) {
    result.push([...(ring[ring.length - 1]!)]);
  }

  return result;
}

// ── Helpers ───────────────────────────────────────────────────────

function ringCentroid(ring: number[][]): [number, number] {
  let sumX = 0, sumY = 0;
  for (const p of ring) { sumX += p[0]!; sumY += p[1]!; }
  return [sumX / ring.length, sumY / ring.length];
}

function tinyRingAtCentroid(c: [number, number]): number[][] {
  const r = 0.01;
  return [[c[0]-r,c[1]-r],[c[0]+r,c[1]-r],[c[0]+r,c[1]+r],[c[0]-r,c[1]+r],[c[0]-r,c[1]-r]];
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
}

// ── Types ─────────────────────────────────────────────────────────

const RESAMPLE_COUNT = 80;

interface FeatureLike {
  type: string;
  properties: Record<string, any>;
  geometry: { type: string; coordinates: any };
  __id?: string;
}

interface InterpData {
  fromRings: number[][][];
  toRings: number[][][];
  properties: Record<string, any>;
  geometryType: string;
}

interface TransitionState {
  interpolators: Map<string, InterpData>;
  passThrough: FeatureLike[];
  startTime: number;
  duration: number;
}

function getOuterRings(f: FeatureLike): number[][][] {
  if (f.geometry.type === 'Polygon') return [f.geometry.coordinates[0]];
  if (f.geometry.type === 'MultiPolygon') {
    return f.geometry.coordinates.map((poly: number[][][]) => poly[0]);
  }
  return [];
}

function buildFeature(rings: number[][][], props: Record<string, any>, geoType: string): FeatureLike {
  if (geoType === 'MultiPolygon' || rings.length > 1) {
    return { type: 'Feature', properties: props, geometry: { type: 'MultiPolygon', coordinates: rings.map(r => [r]) } };
  }
  return { type: 'Feature', properties: props, geometry: { type: 'Polygon', coordinates: [rings[0] || []] } };
}

// ── Transition setup ──────────────────────────────────────────────

function prepareTransition(from: FeatureLike[], to: FeatureLike[], duration: number): TransitionState {
  const fromByName = new Map<string, FeatureLike>();
  const toByName = new Map<string, FeatureLike>();
  const passThrough: FeatureLike[] = [];

  for (const f of from) {
    const name = f.properties?.NAME;
    if (name && name !== '?') fromByName.set(name, f);
  }
  for (const f of to) {
    const name = f.properties?.NAME;
    if (name && name !== '?') toByName.set(name, f);
    else passThrough.push(f);
  }

  const allNames = new Set([...fromByName.keys(), ...toByName.keys()]);
  const interpolators = new Map<string, InterpData>();

  for (const name of allNames) {
    const fromF = fromByName.get(name);
    const toF = toByName.get(name);

    const fromRingsRaw = fromF ? getOuterRings(fromF) : [];
    const toRingsRaw = toF ? getOuterRings(toF) : [];
    const maxRings = Math.max(fromRingsRaw.length, toRingsRaw.length);
    if (maxRings === 0) continue;

    const resFrom: number[][][] = [];
    const resTo: number[][][] = [];

    for (let i = 0; i < maxRings; i++) {
      const fr = fromRingsRaw[i];
      const tr = toRingsRaw[i];

      if (fr && tr) {
        resFrom.push(resampleRing(fr, RESAMPLE_COUNT));
        resTo.push(resampleRing(tr, RESAMPLE_COUNT));
      } else if (fr) {
        resFrom.push(resampleRing(fr, RESAMPLE_COUNT));
        resTo.push(resampleRing(tinyRingAtCentroid(ringCentroid(fr)), RESAMPLE_COUNT));
      } else if (tr) {
        resFrom.push(resampleRing(tinyRingAtCentroid(ringCentroid(tr)), RESAMPLE_COUNT));
        resTo.push(resampleRing(tr, RESAMPLE_COUNT));
      }
    }

    interpolators.set(name, {
      fromRings: resFrom,
      toRings: resTo,
      properties: (toF || fromF)!.properties,
      geometryType: (toF || fromF)!.geometry.type,
    });
  }

  return { interpolators, passThrough, startTime: performance.now(), duration };
}

function computeFrame(state: TransitionState, t: number): FeatureLike[] {
  const eased = easeInOutCubic(t);
  const features: FeatureLike[] = [...state.passThrough];

  for (const [, data] of state.interpolators) {
    const rings: number[][][] = [];
    for (let r = 0; r < data.fromRings.length; r++) {
      const fr = data.fromRings[r]!;
      const tr = data.toRings[r]!;
      const ring: number[][] = [];
      for (let i = 0; i < fr.length; i++) {
        const fp = fr[i] as number[], tp = tr[i] as number[];
        ring.push([
          fp[0]! + (tp[0]! - fp[0]!) * eased,
          fp[1]! + (tp[1]! - fp[1]!) * eased,
        ]);
      }
      // Close ring
      if (ring.length > 1) ring.push([...(ring[0] as number[])]);
      rings.push(ring);
    }
    features.push(buildFeature(rings, data.properties, data.geometryType));
  }

  return features;
}

// ── Hook ──────────────────────────────────────────────────────────

const TRANSITION_DURATION = 1800;
const FRAME_INTERVAL = 33; // ~30fps

export function usePolygonTransition(
  setPolygonsData: (data: object[]) => void,
) {
  const currentRef = useRef<FeatureLike[]>([]);
  const animRef = useRef<number>(0);
  const transRef = useRef<TransitionState | null>(null);

  const transitionTo = useCallback((newFeatures: any[]) => {
    const oldFeatures = currentRef.current;

    cancelAnimationFrame(animRef.current);
    transRef.current = null;

    // First load — no animation
    if (oldFeatures.length === 0) {
      currentRef.current = newFeatures;
      setPolygonsData(newFeatures);
      return;
    }

    const state = prepareTransition(oldFeatures, newFeatures, TRANSITION_DURATION);
    transRef.current = state;
    let lastFrame = 0;

    function tick() {
      if (!transRef.current) return;
      const now = performance.now();
      if (now - lastFrame < FRAME_INTERVAL) {
        animRef.current = requestAnimationFrame(tick);
        return;
      }
      lastFrame = now;

      const elapsed = now - state.startTime;
      const t = Math.min(1, elapsed / state.duration);
      setPolygonsData(computeFrame(state, t));

      if (t < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        currentRef.current = newFeatures;
        transRef.current = null;
      }
    }

    animRef.current = requestAnimationFrame(tick);
  }, [setPolygonsData]);

  return transitionTo;
}
