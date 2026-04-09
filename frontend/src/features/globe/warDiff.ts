import { getGeoJsonFromCache } from '@/shared/data/geoJsonCache';
import { BOUNDARY_YEAR_MAP } from '@/shared/utils/constants';
import { computeFeatureBounds } from '@/shared/utils/geo';
import type { DiffOverlay } from '@/shared/stores/warStore';

const AREA_CHANGE_THRESHOLD = 0.15; // 15% bounding-box area change counts as gain/loss

/**
 * Compare two yearly snapshots and emit overlay markers for territories that
 * appeared, disappeared, or significantly resized between them.
 *
 * Cheap on purpose: works on bounding-box centroids and bounding-box area,
 * not real geodesy. Catches the major WWI/WWII shifts (Austro-Hungarian
 * breakup, fall of France, Soviet expansion) without a geometry library.
 */
export function computeYearDiff(prevYear: number, nextYear: number, now: number): DiffOverlay[] {
  const prevFile = BOUNDARY_YEAR_MAP[prevYear];
  const nextFile = BOUNDARY_YEAR_MAP[nextYear];
  if (!prevFile || !nextFile) return [];

  const prev = getGeoJsonFromCache(prevFile);
  const next = getGeoJsonFromCache(nextFile);
  if (!prev || !next) return [];

  // Group features by NAME — a country can have multiple polygon features.
  const prevByName = new Map<string, any[]>();
  const nextByName = new Map<string, any[]>();
  for (const f of prev as any[]) {
    const name = f.properties?.NAME;
    if (!name || name === '?') continue;
    const arr = prevByName.get(name) ?? [];
    arr.push(f);
    prevByName.set(name, arr);
  }
  for (const f of next as any[]) {
    const name = f.properties?.NAME;
    if (!name || name === '?') continue;
    const arr = nextByName.get(name) ?? [];
    arr.push(f);
    nextByName.set(name, arr);
  }

  function aggregate(features: any[]): { lat: number; lng: number; area: number } | null {
    let totalArea = 0;
    let lat = 0;
    let lng = 0;
    let n = 0;
    for (const f of features) {
      const b = computeFeatureBounds(f);
      if (!b) continue;
      totalArea += b.area;
      lat += b.lat * b.area;
      lng += b.lng * b.area;
      n++;
    }
    if (n === 0 || totalArea === 0) return null;
    return { lat: lat / totalArea, lng: lng / totalArea, area: totalArea };
  }

  const out: DiffOverlay[] = [];

  // Brand-new countries (gained)
  for (const [name, features] of nextByName) {
    if (!prevByName.has(name)) {
      const a = aggregate(features);
      if (a) out.push({ id: `gained-${name}-${nextYear}`, kind: 'gained', lat: a.lat, lng: a.lng, bornAt: now });
    }
  }

  // Disappeared countries (lost)
  for (const [name, features] of prevByName) {
    if (!nextByName.has(name)) {
      const a = aggregate(features);
      if (a) out.push({ id: `lost-${name}-${nextYear}`, kind: 'lost', lat: a.lat, lng: a.lng, bornAt: now });
    }
  }

  // Same name, area changed significantly
  for (const [name, nextFeats] of nextByName) {
    const prevFeats = prevByName.get(name);
    if (!prevFeats) continue;
    const aPrev = aggregate(prevFeats);
    const aNext = aggregate(nextFeats);
    if (!aPrev || !aNext) continue;
    const ratio = (aNext.area - aPrev.area) / aPrev.area;
    if (Math.abs(ratio) >= AREA_CHANGE_THRESHOLD) {
      out.push({
        id: `${ratio > 0 ? 'gained' : 'lost'}-${name}-${nextYear}`,
        kind: ratio > 0 ? 'gained' : 'lost',
        lat: aNext.lat,
        lng: aNext.lng,
        bornAt: now,
      });
    }
  }

  return out;
}
