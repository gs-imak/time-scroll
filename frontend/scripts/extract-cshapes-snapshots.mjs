// Extract per-year world boundary GeoJSONs from CShapes 2.0 — War Mode data.
// One-time build script. CShapes 2.0 is CC BY-NC-SA 4.0
// (Schvitz, Girardin, Rüegger, Weidmann, Cederman, Gleditsch 2022, ETH Zurich).
//
// Output: frontend/public/assets/geo-war/world_<YYYY>.geojson (15 files covering
// WWI and WWII: 1914-1920 + 1938-1945). Kept in a separate directory from the
// default aourednik snapshots so normal timeline scrubbing is untouched.
//
// Pipeline:
//
//   1. JULY-1 DATE FILTER. CShapes encodes every territorial change as a new
//      feature with start/end dates, and adjacent features overlap on the day
//      of transition. A naive year-range filter picks up multiple conflicting
//      features at boundary years (e.g. 5 Russia features in 1918 during the
//      Brest-Litovsk collapse). We pick the single feature active on July 1
//      of the target year.
//
//   2. NAME NORMALIZATION. CShapes uses parentheticals like "Germany (Prussia)"
//      and "Russia (Soviet Union)". We strip these to clean display names.
//
//   3. MAPSHAPER TOPOLOGY-PRESERVING SIMPLIFICATION. Critical for clean
//      rendering: we run `-simplify 15% keep-shapes` via mapshaper's
//      applyCommands API. This preserves shared borders between adjacent
//      countries, prevents self-intersections (which produce those nasty
//      fan-shaped triangulation artifacts when rendered), and avoids
//      degenerate geometry. We drop Antarctica because its pole singularity
//      causes spurious triangles in the render.
//
//   4. DETERMINISTIC SHAPE HASH per feature, computed AFTER simplification
//      so consecutive years with identical simplified geometry produce
//      identical hashes. GlobeView uses `__id = NAME + SHAPE_HASH` so
//      unchanged countries have the same polygon id across years (zero
//      visible redraw) and changed countries get new ids (altitude
//      crossfade via react-globe.gl's built-in tween).
//
// Usage:  node frontend/scripts/extract-cshapes-snapshots.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const mapshaper = require('mapshaper');

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_FILE = resolve(__dirname, '_cshapes-source/CShapes-2.0.geojson');
const OUT_DIR = resolve(__dirname, '../public/assets/geo-war');

const TARGET_YEARS = [
  1914, 1915, 1916, 1917, 1918, 1919, 1920,
  1938, 1939, 1940, 1941, 1942, 1943, 1944, 1945,
];

// Mapshaper tolerance: 15% retention preserves topology well at globe scale
// while still giving a meaningful size reduction. `keep-shapes` prevents tiny
// countries from being deleted entirely.
const MAPSHAPER_CMD =
  '-i input.geojson -clean -simplify percentage=0.15 keep-shapes weighted -o output.geojson format=geojson precision=0.01';

// Drop polygon RINGS that straddle the antimeridian. CShapes encodes Russia,
// New Zealand, and Fiji as multipolygons with sub-pieces on both sides of
// longitude 180°/-180°. react-globe.gl's polygon extruder treats each ring
// as a flat planar polygon; a ring that spans from -180 to +180 gets
// triangulated as a band covering the entire globe, which renders as a
// giant fill blob over other countries. Dropping the offending rings
// loses the small Chukotka peninsula etc. — acceptable at globe altitude.
function dropAntimeridianRings(feature) {
  const g = feature.geometry;
  if (!g) return feature;
  const filterRing = (ring) => {
    let minLng = Infinity, maxLng = -Infinity;
    for (const pt of ring) {
      if (pt[0] < minLng) minLng = pt[0];
      if (pt[0] > maxLng) maxLng = pt[0];
    }
    if (maxLng - minLng > 180) return null;
    for (const pt of ring) {
      if (pt[0] > 179.5 || pt[0] < -179.5) return null;
    }
    return ring;
  };
  if (g.type === 'Polygon') {
    const rings = g.coordinates.map(filterRing).filter(Boolean);
    if (rings.length === 0) return null;
    return { ...feature, geometry: { type: 'Polygon', coordinates: rings } };
  }
  if (g.type === 'MultiPolygon') {
    let polys = g.coordinates
      .map((poly) => poly.map(filterRing).filter(Boolean))
      .filter((poly) => poly.length > 0);
    if (polys.length === 0) return null;

    // COLLECTIVE antimeridian check: if the remaining sub-polygons as a
    // group still straddle the dateline (e.g. New Zealand with North Island
    // at 174°E and Chatham Islands at −176°E), drop the smaller side. This
    // prevents react-globe.gl's triangulator from rendering a wrap-around
    // fill that covers the entire globe.
    const sideBBoxes = polys.map((poly) => {
      const outer = poly[0];
      let mi = Infinity, ma = -Infinity, area = 0;
      for (const [lng] of outer) { if (lng < mi) mi = lng; if (lng > ma) ma = lng; }
      // rough area = (dLng) * (dLat)
      let miLat = Infinity, maLat = -Infinity;
      for (const [, lat] of outer) { if (lat < miLat) miLat = lat; if (lat > maLat) maLat = lat; }
      area = (ma - mi) * (maLat - miLat);
      return { mi, ma, area, poly };
    });
    let overallMin = Infinity, overallMax = -Infinity;
    for (const b of sideBBoxes) {
      if (b.mi < overallMin) overallMin = b.mi;
      if (b.ma > overallMax) overallMax = b.ma;
    }
    if (overallMax - overallMin > 180) {
      // Split sub-polygons into "western" (< 0) and "eastern" (≥ 0) groups,
      // keep the group with more area.
      const west = sideBBoxes.filter((b) => b.mi < 0);
      const east = sideBBoxes.filter((b) => b.mi >= 0);
      const westArea = west.reduce((s, b) => s + b.area, 0);
      const eastArea = east.reduce((s, b) => s + b.area, 0);
      polys = (eastArea >= westArea ? east : west).map((b) => b.poly);
      if (polys.length === 0) return null;
    }

    return { ...feature, geometry: { type: 'MultiPolygon', coordinates: polys } };
  }
  return feature;
}

function parseCShapesDate(str) {
  const [datePart] = str.split(' ');
  const [d, m, y] = datePart.split('.').map(Number);
  return new Date(y, m - 1, d);
}

function normalizeName(raw) {
  if (!raw) return '?';
  if (/Soviet Union/i.test(raw)) return 'Soviet Union';
  if (/Yugoslavia/i.test(raw)) return 'Yugoslavia';
  if (/Czechoslovakia/i.test(raw)) return 'Czechoslovakia';
  if (/Ottoman/i.test(raw)) return 'Ottoman Empire';
  if (/Austria.?Hungary|Austro.?Hungar/i.test(raw)) return 'Austria-Hungary';
  if (/^Italy/i.test(raw)) return 'Italy';
  if (/^Germany/i.test(raw)) return 'Germany';
  // Strip parentheticals and slash-suffixes ("Italy/Sardinia" → "Italy")
  let cleaned = raw.replace(/\s*\([^)]*\)\s*$/, '').trim();
  cleaned = cleaned.split('/')[0].trim();
  return cleaned || raw;
}

function shapeHash(geom) {
  return createHash('sha1').update(JSON.stringify(geom.coordinates)).digest('hex').slice(0, 10);
}

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function simplifyWithMapshaper(inputGeojson) {
  return new Promise((ok, err) => {
    mapshaper.applyCommands(
      MAPSHAPER_CMD,
      { 'input.geojson': JSON.stringify(inputGeojson) },
      (error, output) => {
        if (error) return err(error);
        ok(JSON.parse(output['output.geojson']));
      },
    );
  });
}

// ── Main ──────────────────────────────────────────────────────────

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

// Countries to exclude entirely: Antarctica causes pole singularity in
// polygon triangulation, producing radial fan artifacts on render.
const EXCLUDE_NAMES = new Set(['Antarctica']);

const summary = [];
for (const year of TARGET_YEARS) {
  const pickDate = new Date(year, 6, 1); // July 1

  const matches = featuresWithDates.filter(
    ({ start, end }) => start <= pickDate && pickDate <= end,
  );

  // Deduplicate by normalized name
  const byName = new Map();
  for (const { f } of matches) {
    const name = normalizeName(f.properties.cntry_name);
    if (EXCLUDE_NAMES.has(name)) continue;
    byName.set(name, f);
  }

  // Build unsimplified intermediate. Drop antimeridian-crossing rings BEFORE
  // simplification so mapshaper doesn't keep topology that we don't want.
  const intermediate = {
    type: 'FeatureCollection',
    features: [...byName.values()]
      .map((f) => ({
        type: 'Feature',
        properties: { NAME: normalizeName(f.properties.cntry_name) },
        geometry: f.geometry,
      }))
      .map(dropAntimeridianRings)
      .filter(Boolean),
  };

  // Run mapshaper topology-preserving simplification
  const simplified = await simplifyWithMapshaper(intermediate);

  // Post-filter: another antimeridian pass just in case mapshaper merged
  // anything across the dateline.
  const cleanedFeatures = simplified.features
    .map(dropAntimeridianRings)
    .filter(Boolean);

  // CRITICAL: reverse ring winding to CLOCKWISE to match aourednik's convention.
  // react-globe.gl / three-globe uses earcut triangulation with rules that
  // interpret CCW outer rings as HOLES, causing every polygon to render as
  // "everything EXCEPT this country" — which tints the entire globe with
  // the aggregated complement. Mapshaper outputs GeoJSON-spec CCW but this
  // app's pipeline expects CW (same as the rest of our data).
  function signedArea(ring) {
    let sum = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      sum += (ring[i + 1][0] - ring[i][0]) * (ring[i + 1][1] + ring[i][1]);
    }
    return sum / 2;
  }
  function ensureClockwise(polyCoords) {
    return polyCoords.map((ring, idx) => {
      const area = signedArea(ring);
      const isCW = area > 0;
      // Outer ring (idx 0) should be CW; holes should be CCW.
      const wantCW = idx === 0;
      return wantCW === isCW ? ring : [...ring].reverse();
    });
  }
  function rewindGeometry(geom) {
    if (geom.type === 'Polygon') {
      return { type: 'Polygon', coordinates: ensureClockwise(geom.coordinates) };
    }
    if (geom.type === 'MultiPolygon') {
      return {
        type: 'MultiPolygon',
        coordinates: geom.coordinates.map(ensureClockwise),
      };
    }
    return geom;
  }

  const finalFeatures = cleanedFeatures.map((f) => {
    const rewound = rewindGeometry(f.geometry);
    return {
      type: 'Feature',
      properties: {
        NAME: f.properties.NAME,
        ABBREVN: f.properties.NAME,
        SUBJECTO: f.properties.NAME,
        BORDERPRECISION: 3,
        PARTOF: f.properties.NAME,
        SHAPE_HASH: shapeHash(rewound),
      },
      geometry: rewound,
    };
  });

  const out = { type: 'FeatureCollection', features: finalFeatures };
  const outPath = resolve(OUT_DIR, `world_${year}.geojson`);
  const json = JSON.stringify(out);
  writeFileSync(outPath, json);

  const size = Buffer.byteLength(json, 'utf8');
  summary.push({ year, count: finalFeatures.length, size });
  console.log(
    `  world_${year}.geojson  →  ${String(finalFeatures.length).padStart(3)} features  ${fmtBytes(size).padStart(9)}`,
  );
}

console.log(
  `\nDone. Wrote ${summary.length} files to ${OUT_DIR}\n` +
  `Total: ${fmtBytes(summary.reduce((s, r) => s + r.size, 0))}\n`,
);
