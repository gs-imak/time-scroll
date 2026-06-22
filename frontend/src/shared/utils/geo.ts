import type { BoundaryFeature } from '@/shared/types/geo';

/** Haversine distance between two points in km */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Find the closest boundary year that is <= the given year */
export function closestBoundaryYear(year: number, boundaryYears: number[]): number {
  let closest = boundaryYears[0]!;
  for (const by of boundaryYears) {
    if (by <= year) {
      closest = by;
    } else {
      break;
    }
  }
  return closest;
}

/**
 * Bounding-box centroid + approximate area for a single GeoJSON feature.
 * Cheap (no real geodesy), good enough for placing markers and detecting
 * "this country grew/shrank" between two snapshots.
 */
export function computeFeatureBounds(feature: any): {
  lat: number;
  lng: number;
  area: number;
} | null {
  const geom = feature?.geometry;
  if (!geom) return null;

  const coordSets =
    geom.type === 'MultiPolygon'
      ? geom.coordinates.flat(2)
      : geom.type === 'Polygon'
        ? geom.coordinates.flat(1)
        : null;
  if (!coordSets || coordSets.length === 0) return null;

  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
  for (const coord of coordSets) {
    const lng = coord[0];
    const lat = coord[1];
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  return {
    lat: (minLat + maxLat) / 2,
    lng: (minLng + maxLng) / 2,
    area: (maxLat - minLat) * (maxLng - minLng),
  };
}

/**
 * Polygon winding normalization. three-globe's earcut triangulator treats a
 * CCW outer ring as a hole and fills the polygon's COMPLEMENT — one malformed
 * feature (e.g. aourednik's CCW "Bantu") can fill the whole hemisphere. We
 * rewind at load time so the renderer never sees bad winding. Mutates in place.
 */
function signedRingArea(ring: number[][]): number {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const a = ring[i]!;
    const b = ring[i + 1]!;
    sum += (b[0]! - a[0]!) * (b[1]! + a[1]!);
  }
  return sum / 2;
}

function ensureClockwisePolygon(rings: number[][][]): void {
  for (let idx = 0; idx < rings.length; idx++) {
    const ring = rings[idx]!;
    const area = signedRingArea(ring);
    const isCW = area > 0;
    const wantCW = idx === 0; // outer ring CW, holes CCW
    if (wantCW !== isCW) ring.reverse();
  }
}

/** Rewind every outer ring to clockwise (holes CCW) across a feature list. */
export function rewindFeatures(features: BoundaryFeature[]): BoundaryFeature[] {
  for (const f of features) {
    const g = f?.geometry;
    if (!g) continue;
    if (g.type === 'Polygon') {
      ensureClockwisePolygon(g.coordinates as number[][][]);
    } else if (g.type === 'MultiPolygon') {
      for (const poly of g.coordinates as number[][][][]) {
        ensureClockwisePolygon(poly);
      }
    }
  }
  return features;
}

/**
 * Rewind winding, then assign a stable `__id` to each feature so react-globe.gl
 * can tween polygons across boundary changes instead of destroying/recreating
 * them. Uses NAME + SHAPE_HASH when present (CShapes war snapshots) so unchanged
 * borders keep the same id (zero redraw) and only changed shapes crossfade.
 * A per-(name,hash) counter keeps split MultiPolygon pieces uniquely ided.
 */
export function assignStableIds(features: BoundaryFeature[]): BoundaryFeature[] {
  rewindFeatures(features);
  const counts = new Map<string, number>();
  return features.map((f) => {
    const name: string = f.properties?.NAME || '?';
    const hash: string | undefined = f.properties?.SHAPE_HASH;
    const base = hash ? `${name}_${hash}` : name;
    const idx = counts.get(base) || 0;
    counts.set(base, idx + 1);
    f.__id = `${base}_${idx}`;
    return f;
  });
}
