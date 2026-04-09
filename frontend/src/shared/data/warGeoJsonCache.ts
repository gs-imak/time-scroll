/**
 * War-Mode GeoJSON cache — loads the CShapes-derived yearly snapshots from
 * `/assets/geo-war/` on demand. Kept separate from the default `geoJsonCache`
 * so normal timeline scrubbing stays on the aourednik dataset and is
 * untouched by this feature.
 *
 * The files are produced by `frontend/scripts/extract-cshapes-snapshots.mjs`
 * and contain yearly snapshots for 1914-1920 and 1938-1945. Each feature has
 * a stable `SHAPE_HASH` in its properties so GlobeView can build
 * `__id = NAME + SHAPE_HASH`, which makes react-globe.gl's polygon tween
 * treat unchanged geometry as identical (zero visible transition) and
 * changed geometry as a fresh crossfade.
 */

export const WAR_YEARS = [
  1914, 1915, 1916, 1917, 1918, 1919, 1920,
  1938, 1939, 1940, 1941, 1942, 1943, 1944, 1945,
] as const;

const cache = new Map<number, object[]>();
let preloadPromise: Promise<void> | null = null;
let preloaded = false;

export function getWarGeoJson(year: number): object[] | null {
  return cache.get(year) ?? null;
}

export function isWarPreloaded(): boolean {
  return preloaded;
}

/** Preload all 15 war snapshots. Safe to call repeatedly — returns the same promise. */
export function preloadWarGeoJson(): Promise<void> {
  if (preloadPromise) return preloadPromise;

  preloadPromise = Promise.all(
    WAR_YEARS.map(async (year) => {
      if (cache.has(year)) return;
      try {
        const res = await fetch(`/assets/geo-war/world_${year}.geojson`);
        if (!res.ok) return;
        const data = await res.json();
        cache.set(year, data.features || []);
      } catch {
        /* silently skip failed files */
      }
    }),
  ).then(() => {
    preloaded = true;
  });

  return preloadPromise;
}

/**
 * Find the closest war snapshot year that is <= the given year.
 * WAR_YEARS is a fixed sorted array of 15 entries so this is O(n).
 */
export function closestWarYear(year: number): number {
  let closest: number = WAR_YEARS[0];
  for (const y of WAR_YEARS) {
    if (y <= year) closest = y;
    else break;
  }
  return closest;
}
