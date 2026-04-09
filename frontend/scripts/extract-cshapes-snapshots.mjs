// Extract per-year world boundary GeoJSONs from CShapes 2.0 — War Mode data.
// One-time build script. CShapes 2.0 is CC BY-NC-SA 4.0
// (Schvitz, Girardin, Rüegger, Weidmann, Cederman, Gleditsch 2022, ETH Zurich).
//
// Output: frontend/public/assets/geo-war/world_<YYYY>.geojson (15 files covering
// WWI and WWII: 1914-1920 + 1938-1945). Kept in a separate directory from the
// default aourednik snapshots so normal timeline scrubbing is untouched.
//
// Key design decisions (for smooth Civ-style transitions):
//
//   1. JULY-1 DATE FILTER. CShapes encodes every territorial change as a new
//      feature with start/end dates, and adjacent features overlap on the day
//      of transition. A naive year-range filter picks up multiple conflicting
//      features at boundary years (e.g. 5 Russia features in 1918 during the
//      Brest-Litovsk collapse). We pick the single feature active on July 1
//      of the target year, which gives exactly one snapshot per country.
//
//   2. DETERMINISTIC SHAPE HASH per feature. GlobeView uses __id to match
//      polygons across year snapshots. We hash the simplified geometry and
//      store it in properties.SHAPE_HASH so GlobeView can build
//      __id = name + shapeHash. This way:
//        - A country with unchanged borders has the SAME __id across years →
//          react-globe.gl performs zero visible transition.
//        - A country whose shape actually changed gets a DIFFERENT __id →
//          react-globe.gl tweens altitude down for the old shape and up for
//          the new shape, producing the smooth crossfade we want.
//
//   3. AGGRESSIVE DOUGLAS–PEUCKER simplification (eps ≈ 13 km) because the
//      globe never needs more than a handful of vertices per country at
//      playback altitude. Smaller files = less GPU buffer rebuilding = less
//      stutter.
//
// Usage:  node frontend/scripts/extract-cshapes-snapshots.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_FILE = resolve(__dirname, '_cshapes-source/CShapes-2.0.geojson');
const OUT_DIR = resolve(__dirname, '../public/assets/geo-war');

const TARGET_YEARS = [
  // WWI range — one before, one after
  1914, 1915, 1916, 1917, 1918, 1919, 1920,
  // WWII range — one before, one after
  1938, 1939, 1940, 1941, 1942, 1943, 1944, 1945,
];

// Parse CShapes DD.MM.YYYY date string to a JS Date (local time; we only
// compare by calendar date).
function parseCShapesDate(str) {
  const [datePart] = str.split(' ');
  const [d, m, y] = datePart.split('.').map(Number);
  return new Date(y, m - 1, d);
}

// ── Coordinate processing ─────────────────────────────────────────

// Round to 2 decimals (~1.1 km at equator)
function roundCoord(c) {
  return Math.round(c * 100) / 100;
}

// Perpendicular distance from p to segment ab (degrees).
function perpDist(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) {
    const ex = p[0] - a[0];
    const ey = p[1] - a[1];
    return Math.sqrt(ex * ex + ey * ey);
  }
  const num = Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]);
  const den = Math.sqrt(dx * dx + dy * dy);
  return num / den;
}

// Iterative Douglas–Peucker. Aggressive epsilon ≈ 13 km.
const EPSILON = 0.12;
function simplify(points) {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length > 0) {
    const [start, end] = stack.pop();
    let maxDist = 0;
    let maxIdx = -1;
    for (let i = start + 1; i < end; i++) {
      const d = perpDist(points[i], points[start], points[end]);
      if (d > maxDist) {
        maxDist = d;
        maxIdx = i;
      }
    }
    if (maxIdx !== -1 && maxDist > EPSILON) {
      keep[maxIdx] = 1;
      stack.push([start, maxIdx]);
      stack.push([maxIdx, end]);
    }
  }
  const out = [];
  for (let i = 0; i < points.length; i++) {
    if (keep[i]) out.push(points[i]);
  }
  return out;
}

function processRing(ring) {
  const rounded = [];
  let prevLng = null, prevLat = null;
  for (const pt of ring) {
    const lng = roundCoord(pt[0]);
    const lat = roundCoord(pt[1]);
    if (lng !== prevLng || lat !== prevLat) {
      rounded.push([lng, lat]);
      prevLng = lng;
      prevLat = lat;
    }
  }
  if (rounded.length < 4) return null;
  const isClosed =
    rounded[0][0] === rounded[rounded.length - 1][0] &&
    rounded[0][1] === rounded[rounded.length - 1][1];
  const open = isClosed ? rounded.slice(0, -1) : rounded;
  const simplified = simplify(open);
  if (simplified.length < 3) return null;
  simplified.push([simplified[0][0], simplified[0][1]]);
  return simplified;
}

function processGeometry(geom) {
  if (geom.type === 'Polygon') {
    const rings = geom.coordinates.map(processRing).filter(Boolean);
    return rings.length > 0 ? { type: 'Polygon', coordinates: rings } : null;
  }
  if (geom.type === 'MultiPolygon') {
    // Drop tiny polygons (< 0.3° bounding box) — they're usually noise islands
    // that add bytes without adding visual information at globe altitude.
    const polys = geom.coordinates
      .map((poly) => poly.map(processRing).filter(Boolean))
      .filter((poly) => {
        if (poly.length === 0) return false;
        // Check outer ring bounding box
        const outer = poly[0];
        let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;
        for (const [lng, lat] of outer) {
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        }
        return maxLng - minLng > 0.3 || maxLat - minLat > 0.3;
      });
    return polys.length > 0 ? { type: 'MultiPolygon', coordinates: polys } : null;
  }
  return geom;
}

// ── Name normalization ────────────────────────────────────────────

function normalizeName(raw) {
  if (!raw) return '?';
  if (/Soviet Union/i.test(raw)) return 'Soviet Union';
  if (/Yugoslavia/i.test(raw)) return 'Yugoslavia';
  if (/Czechoslovakia/i.test(raw)) return 'Czechoslovakia';
  if (/Ottoman/i.test(raw)) return 'Ottoman Empire';
  if (/Austria.?Hungary|Austro.?Hungar/i.test(raw)) return 'Austria-Hungary';
  const cleaned = raw.replace(/\s*\([^)]*\)\s*$/, '').trim();
  return cleaned || raw;
}

// ── Stable shape hash ─────────────────────────────────────────────

function shapeHash(geom) {
  // Hash the rounded, simplified coordinates. Identical geometries across
  // snapshots → identical hash → same __id in GlobeView → no visible redraw.
  const str = JSON.stringify(geom.coordinates);
  return createHash('sha1').update(str).digest('hex').slice(0, 10);
}

// ── Main ──────────────────────────────────────────────────────────

function mapFeature(f) {
  const name = normalizeName(f.properties.cntry_name);
  const geometry = processGeometry(f.geometry);
  if (!geometry) return null;
  return {
    type: 'Feature',
    properties: {
      NAME: name,
      ABBREVN: name,
      SUBJECTO: name,
      BORDERPRECISION: 3,
      PARTOF: name,
      SHAPE_HASH: shapeHash(geometry),
    },
    geometry,
  };
}

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

console.log(`\nReading ${SOURCE_FILE}…`);
const raw = readFileSync(SOURCE_FILE, 'utf8');
const data = JSON.parse(raw);
console.log(`  ${data.features.length} total CShapes features\n`);

// Parse all feature dates once up front
const featuresWithDates = data.features.map((f) => ({
  f,
  start: parseCShapesDate(f.properties.gwsdate),
  end: parseCShapesDate(f.properties.gwedate),
}));

mkdirSync(OUT_DIR, { recursive: true });

// Global shape-hash counter for stable __id assignment even when CShapes
// emits multiple features with the same normalized name and same shape
// (shouldn't happen with July-1 filter but belt-and-braces).
const summary = [];
for (const year of TARGET_YEARS) {
  // "Mid-year" pick date — July 1 of the target year
  const pickDate = new Date(year, 6, 1); // month 6 = July (0-indexed)

  const matches = featuresWithDates.filter(
    ({ start, end }) => start <= pickDate && pickDate <= end,
  );

  // Deduplicate by normalized name: keep the LAST matching feature (most
  // recent territorial state). CShapes is sorted chronologically.
  const byName = new Map();
  for (const { f } of matches) {
    const name = normalizeName(f.properties.cntry_name);
    byName.set(name, f);
  }

  const features = [];
  for (const f of byName.values()) {
    const mapped = mapFeature(f);
    if (mapped) features.push(mapped);
  }

  const out = { type: 'FeatureCollection', features };
  const outPath = resolve(OUT_DIR, `world_${year}.geojson`);
  const json = JSON.stringify(out);
  writeFileSync(outPath, json);

  const size = Buffer.byteLength(json, 'utf8');
  summary.push({ year, count: features.length, size });
  console.log(
    `  world_${year}.geojson  →  ${String(features.length).padStart(3)} features  ${fmtBytes(size).padStart(9)}`,
  );
}

console.log(
  `\nDone. Wrote ${summary.length} files to ${OUT_DIR}\n` +
  `Total: ${fmtBytes(summary.reduce((s, r) => s + r.size, 0))}\n`,
);
