import * as THREE from 'three';

/**
 * Per-event compact pin markers.
 * Small circular badge with event-specific emoji, always faces camera.
 * Detail shown via hover tooltip (handled by GlobeView).
 */

// ── Per-event icon mapping ─────────────────────────────────────────
const EVENT_ICONS: Record<string, string> = {
  'great-pyramid': '△',
  'code-hammurabi': '📜',
  'trojan-war': '⚔️',
  'founding-rome': '🐺',
  'democracy-athens': '🗳️',
  'roman-forum': '🏛️',
  'alexander-empire': '🦅',
  'great-wall-begin': '🧱',
  'julius-caesar': '🗡️',
  'colosseum': '🏟️',
  'fall-of-rome': '⚡',
  'hagia-sophia': '🕌',
  'viking-expansion': '🪓',
  'genghis-khan': '🏹',
  'black-death': '☠️',
  'gutenberg-press': '📖',
  'columbus-americas': '⛵',
  'manhattan-purchase': '📋',
  'french-revolution': '🔥',
  'steam-locomotive': '🚂',
  'suez-canal': '🚢',
  'eiffel-tower': '🗼',
  'ww1': '💣',
  'ww2': '✈️',
  'moon-landing': '🚀',
  'berlin-wall': '🔨',
  'www-invention': '💻',
};

// ── Category colors ────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  war: '#ff4444',
  discovery: '#00e5ff',
  cultural: '#ffca28',
  political: '#b388ff',
  construction: '#69f0ae',
  natural: '#ff8a65',
};

// ── Render compact circular pin ────────────────────────────────────

function renderPinCanvas(icon: string, color: string): HTMLCanvasElement {
  const dpr = 2;
  const size = 64;

  const canvas = document.createElement('canvas');
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  const cx = size / 2;
  const cy = size / 2;
  const r = 28;

  // Outer glow
  const glow = ctx.createRadialGradient(cx, cy, r - 2, cx, cy, r + 6);
  glow.addColorStop(0, color + '40');
  glow.addColorStop(1, color + '00');
  ctx.beginPath();
  ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  // Dark circle background
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(8, 14, 28, 0.92)';
  ctx.fill();

  // Color border
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Icon
  ctx.font = '24px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(icon, cx, cy + 1);

  return canvas;
}

// ── 3D marker construction ─────────────────────────────────────────

export function createEventMarker(event: {
  id: string;
  title: string;
  year: number;
  category: string;
}): THREE.Group {
  const group = new THREE.Group();
  const colorHex = CATEGORY_COLORS[event.category] ?? '#8b9dc3';
  const color = new THREE.Color(colorHex);
  const icon = EVENT_ICONS[event.id] ?? '●';

  // ── Surface dot ──
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 10, 8),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 }),
  );
  group.add(dot);

  // Soft surface glow
  const glowMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
  });
  group.add(new THREE.Mesh(new THREE.SphereGeometry(1.2, 10, 8), glowMat));

  // ── Pin line ──
  const pinH = 4;
  const pin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, pinH, 4),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 }),
  );
  pin.position.y = pinH / 2;
  group.add(pin);

  // ── Compact circular badge sprite ──
  const canvas = renderPinCanvas(icon, colorHex);
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      sizeAttenuation: true,
    }),
  );
  const badgeSize = 3.5;
  sprite.scale.set(badgeSize, badgeSize, 1);
  sprite.position.y = pinH + badgeSize / 2 + 0.2;
  group.add(sprite);

  return group;
}
