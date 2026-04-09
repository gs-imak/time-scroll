// Extract per-year world boundary GeoJSONs from CShapes 2.0.
// One-time build script. CShapes 2.0 is CC BY-NC-SA 4.0
// (Schvitz, Girardin, Rüegger, Weidmann, Cederman, Gleditsch 2022, ETH Zurich).
//
// Usage:  node frontend/scripts/extract-cshapes-snapshots.mjs
//
// Reads:  scripts/_cshapes-source/CShapes-2.0.geojson  (gitignored)
// Writes: public/assets/geo/world_<YYYY>.geojson       (one per target year)
//
// Output schema mirrors the existing aourednik/historical-basemaps files
// (NAME, ABBREVN, SUBJECTO, BORDERPRECISION, PARTOF) so the rest of the
// app's GeoJSON pipeline doesn't care which source produced the file.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_FILE = resolve(__dirname, '_cshapes-source/CShapes-2.0.geojson');
const OUT_DIR = resolve(__dirname, '../public/assets/geo');

const TARGET_YEARS = [
  1915, 1916, 1917, 1918, 1919,
  1939, 1940, 1941, 1942, 1943, 1944,
];

// Round to 2 decimals = ~1.1 km precision at the equator. Plenty for a globe visualization.
function roundCoord(c) {
  return Math.round(c * 100) / 100;
}

// Perpendicular distance from point p to the segment between a and b.
// Used as the keep/drop test in Douglas–Peucker.
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

// Douglas–Peucker polyline simplification, iterative (avoids deep recursion).
// epsilon is in degrees; ~0.08 ≈ 9 km, fine at globe altitude.
const EPSILON = 0.08;
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

// Round one ring (an array of [lng,lat] pairs), drop consecutive duplicates,
// then run Douglas–Peucker to drop near-collinear vertices.
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
  // Ensure ring is closed; simplify open polyline; re-close.
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
    const polys = geom.coordinates
      .map((poly) => poly.map(processRing).filter(Boolean))
      .filter((poly) => poly.length > 0);
    return polys.length > 0 ? { type: 'MultiPolygon', coordinates: polys } : null;
  }
  return geom;
}

// Normalize CShapes country names for the visualization.
// CShapes names use parentheticals like "Germany (Prussia)" and
// "Russia (Soviet Union)". Strip them so tooltips/labels read cleanly,
// with a few hand-picked special cases for the WWI/WWII era.
function normalizeName(raw) {
  if (!raw) return '?';
  // Special cases first
  if (/Soviet Union/i.test(raw)) return 'Soviet Union';
  if (/Yugoslavia/i.test(raw)) return 'Yugoslavia';
  if (/Czechoslovakia/i.test(raw)) return 'Czechoslovakia';
  if (/Ottoman/i.test(raw)) return 'Ottoman Empire';
  if (/Austria.?Hungary|Austro.?Hungar/i.test(raw)) return 'Austria-Hungary';
  // Default: drop parenthetical suffix
  const cleaned = raw.replace(/\s*\([^)]*\)\s*$/, '').trim();
  return cleaned || raw;
}

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
console.log(`  ${data.features.length} total features in CShapes 2.0\n`);

mkdirSync(OUT_DIR, { recursive: true });

const summary = [];
for (const year of TARGET_YEARS) {
  // Include features where the country was independent during any part of `year`
  const matches = data.features.filter(
    (f) => f.properties.gwsyear <= year && f.properties.gweyear >= year,
  );

  const out = {
    type: 'FeatureCollection',
    features: matches.map(mapFeature).filter(Boolean),
  };

  const outPath = resolve(OUT_DIR, `world_${year}.geojson`);
  const json = JSON.stringify(out);
  writeFileSync(outPath, json);

  const size = Buffer.byteLength(json, 'utf8');
  summary.push({ year, count: matches.length, size });
  console.log(
    `  world_${year}.geojson  →  ${String(matches.length).padStart(3)} features  ${fmtBytes(size).padStart(9)}`,
  );
}

console.log(
  `\nDone. Wrote ${summary.length} files to ${OUT_DIR}\n` +
  `Total: ${fmtBytes(summary.reduce((s, r) => s + r.size, 0))}\n`,
);
