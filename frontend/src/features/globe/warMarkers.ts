import * as THREE from 'three';

/**
 * Three.js builders for War Mode visuals.
 *  - Tethered conflict marker: dot + thin amber connector + canvas-sprite badge with the event title
 *  - Conflict pulse: a single expanding ring fired when an event year is reached
 *  - Diff overlay disc: a soft amber/blue glow placed at a country centroid that gained or lost area
 *
 * All animation is driven by an absolute "bornAt" timestamp (ms) read from the
 * userData of each object so the WarFxLayer rAF loop can advance them.
 */

const TETHER_COLOR = 0xd4a574;
const GAINED_HEX = 0xd4a574; // warm amber
const LOST_HEX = 0x6a90b8;   // cool blue
const PULSE_COLOR = 0xd4a574;

// ── Tethered marker ───────────────────────────────────────────────

function renderBadgeCanvas(title: string): HTMLCanvasElement {
  const dpr = 2;
  const w = 240;
  const h = 56;
  const canvas = document.createElement('canvas');
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  // Glass panel
  const radius = 8;
  ctx.fillStyle = 'rgba(14, 14, 20, 0.92)';
  ctx.strokeStyle = 'rgba(212, 165, 116, 0.55)';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(radius, 1);
  ctx.lineTo(w - radius, 1);
  ctx.quadraticCurveTo(w - 1, 1, w - 1, radius);
  ctx.lineTo(w - 1, h - radius);
  ctx.quadraticCurveTo(w - 1, h - 1, w - radius, h - 1);
  ctx.lineTo(radius, h - 1);
  ctx.quadraticCurveTo(1, h - 1, 1, h - radius);
  ctx.lineTo(1, radius);
  ctx.quadraticCurveTo(1, 1, radius, 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Top accent stripe
  ctx.fillStyle = 'rgba(212, 165, 116, 0.7)';
  ctx.fillRect(radius, 1, w - radius * 2, 2);

  // Text — wrap to two lines if needed
  ctx.fillStyle = '#e8e6d8';
  ctx.font = `600 14px 'Space Grotesk', system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxWidth = w - 24;
  const lines: string[] = [];
  if (ctx.measureText(title).width <= maxWidth) {
    lines.push(title);
  } else {
    const words = title.split(' ');
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
  }

  if (lines.length === 1) {
    ctx.fillText(lines[0]!, w / 2, h / 2 + 1);
  } else {
    ctx.font = `600 12px 'Space Grotesk', system-ui, sans-serif`;
    ctx.fillText(lines[0]!, w / 2, h / 2 - 7);
    ctx.fillText(lines[1] ?? '', w / 2, h / 2 + 9);
  }

  return canvas;
}

// A war badge is fully determined by its title, so build the canvas + texture
// once per distinct title and share it. three-globe removes (never disposes)
// custom-layer markers on churn, so the shared texture stays valid.
const badgeTextureCache = new Map<string, THREE.CanvasTexture>();

function getBadgeTexture(title: string): THREE.CanvasTexture {
  let tex = badgeTextureCache.get(title);
  if (tex) return tex;
  tex = new THREE.CanvasTexture(renderBadgeCanvas(title));
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  badgeTextureCache.set(title, tex);
  return tex;
}

export function createTetheredMarker(opts: { id: string; title: string }): THREE.Group {
  const group = new THREE.Group();
  const tetherHeight = 8;

  // Surface dot — sized to match existing event markers' inner ring (~1.2 units)
  const dot = new THREE.Mesh(
    new THREE.CircleGeometry(1.1, 24),
    new THREE.MeshBasicMaterial({
      color: TETHER_COLOR,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  dot.rotation.x = -Math.PI / 2;
  group.add(dot);

  // Soft glow ring around dot
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.2, 1.9, 24),
    new THREE.MeshBasicMaterial({
      color: TETHER_COLOR,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  group.add(ring);

  // Vertical connector — thin glowing tether
  const lineGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, tetherHeight, 0),
  ]);
  const line = new THREE.Line(
    lineGeom,
    new THREE.LineBasicMaterial({
      color: TETHER_COLOR,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    }),
  );
  group.add(line);

  // Slim cylinder along the tether so it actually catches the eye
  const tetherCyl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, tetherHeight, 6),
    new THREE.MeshBasicMaterial({
      color: TETHER_COLOR,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    }),
  );
  tetherCyl.position.y = tetherHeight / 2;
  group.add(tetherCyl);

  // Badge sprite (cached texture — identical per title)
  const texture = getBadgeTexture(opts.title);
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      sizeAttenuation: true,
    }),
  );
  // Aspect ratio 240/56 ≈ 4.28 — match event marker badge scale (~3.8) but wider
  const badgeWidth = 9;
  sprite.scale.set(badgeWidth, badgeWidth / (240 / 56), 1);
  sprite.position.y = tetherHeight + 1.2;
  group.add(sprite);

  group.userData = { warMarkerId: opts.id };
  return group;
}

// ── Conflict pulse ────────────────────────────────────────────────

const PULSE_LIFETIME_MS = 1800;
const PULSE_INNER_START = 0.5;
const PULSE_INNER_END = 4.5;

// Shared flat unit ring for all conflict pulses. Its normal is +Y (via the baked
// rotateX) so the per-marker orientation quaternion — which maps local +Y to the
// globe's outward radial — lays it flat on the surface. Each pulse then animates
// purely through mesh.scale + material.opacity, so we never dispose/rebuild a
// RingGeometry every frame. The ring is intentionally never disposed (module
// lifetime); three-globe removes but does not deallocate custom-layer meshes.
const UNIT_PULSE_RING = new THREE.RingGeometry(1, 1.12, 32);
UNIT_PULSE_RING.rotateX(-Math.PI / 2);

export function createConflictPulse(bornAt: number): THREE.Mesh {
  const mat = new THREE.MeshBasicMaterial({
    color: PULSE_COLOR,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(UNIT_PULSE_RING, mat);
  mesh.scale.setScalar(PULSE_INNER_START);
  mesh.userData = { bornAt, type: 'pulse' };
  return mesh;
}

/** Advance a pulse mesh's expansion / fade based on now timestamp. */
export function updateConflictPulse(mesh: THREE.Mesh, now: number): boolean {
  const bornAt: number = mesh.userData.bornAt;
  const t = (now - bornAt) / PULSE_LIFETIME_MS;
  if (t >= 1) return false;
  const eased = 1 - Math.pow(1 - t, 2);
  const radius = PULSE_INNER_START + (PULSE_INNER_END - PULSE_INNER_START) * eased;
  // Expand by scaling the shared unit ring rather than rebuilding geometry.
  mesh.scale.setScalar(radius);
  (mesh.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - t);
  return true;
}

// ── Diff overlay disc ─────────────────────────────────────────────

export function createDiffOverlayDisc(kind: 'gained' | 'lost', bornAt: number): THREE.Mesh {
  const color = kind === 'gained' ? GAINED_HEX : LOST_HEX;
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 32),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.userData = { bornAt, kind, type: 'diff' };
  return mesh;
}

const DIFF_LIFETIME_MS = 2500;
const DIFF_PEAK_OPACITY = 0.32;

/** Animate a diff overlay's opacity (fade in then out). Returns false when expired. */
export function updateDiffOverlayDisc(mesh: THREE.Mesh, now: number): boolean {
  const bornAt: number = mesh.userData.bornAt;
  const elapsed = now - bornAt;
  if (elapsed >= DIFF_LIFETIME_MS) return false;
  // Fade in 0-800ms, hold to 1700ms, fade out 1700-2500ms
  let opacity: number;
  if (elapsed < 800) {
    opacity = (elapsed / 800) * DIFF_PEAK_OPACITY;
  } else if (elapsed < 1700) {
    opacity = DIFF_PEAK_OPACITY;
  } else {
    opacity = (1 - (elapsed - 1700) / 800) * DIFF_PEAK_OPACITY;
  }
  (mesh.material as THREE.MeshBasicMaterial).opacity = opacity;
  return true;
}
