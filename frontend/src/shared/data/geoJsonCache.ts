/**
 * GeoJSON boundary cache — preloads and caches all 53 boundary files
 * for instant snapshot switching during Civilization Spotlight mode.
 */
import { BOUNDARY_YEAR_MAP } from '@/shared/utils/constants';

const cache = new Map<string, object[]>();
let preloadPromise: Promise<void> | null = null;
let preloaded = false;

/** Get cached features for a given file name (without .geojson extension) */
export function getGeoJsonFromCache(fileName: string): object[] | null {
  return cache.get(fileName) ?? null;
}

/** Whether all files have been preloaded */
export function isPreloaded(): boolean {
  return preloaded;
}

/** Preload all GeoJSON files into memory (~15-30MB). Call once, returns same promise on subsequent calls. */
export function preloadAllGeoJson(): Promise<void> {
  if (preloadPromise) return preloadPromise;

  const fileNames = [...new Set(Object.values(BOUNDARY_YEAR_MAP))];

  preloadPromise = Promise.all(
    fileNames.map(async (name) => {
      if (cache.has(name)) return;
      try {
        const res = await fetch(`/assets/geo/${name}.geojson`);
        if (!res.ok) return;
        const data = await res.json();
        cache.set(name, data.features || []);
      } catch { /* silently skip failed files */ }
    }),
  ).then(() => { preloaded = true; });

  return preloadPromise;
}

/** Also store features from normal on-demand loading so spotlight can reuse them */
export function cacheGeoJson(fileName: string, features: object[]): void {
  if (!cache.has(fileName)) {
    cache.set(fileName, features);
  }
}

/** Find which boundary years contain at least one feature matching the alias set */
export function computeSnapshotYearsForCiv(aliasSet: Set<string>): number[] {
  const years: number[] = [];

  for (const [yearStr, fileName] of Object.entries(BOUNDARY_YEAR_MAP)) {
    const features = cache.get(fileName);
    if (!features) continue;

    const hasMatch = features.some(
      (f: any) => aliasSet.has(f.properties?.NAME),
    );
    if (hasMatch) years.push(Number(yearStr));
  }

  return years.sort((a, b) => a - b);
}
