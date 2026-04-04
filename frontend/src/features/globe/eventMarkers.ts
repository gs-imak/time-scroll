import * as THREE from 'three';

/**
 * Per-event compact pin markers.
 * Muted, desaturated color palette — cinematic, not neon.
 * Small circular badge with event-specific icon, always faces camera.
 */

// ── Per-event icon mapping ─────────────────────────────────────────
const EVENT_ICONS: Record<string, string> = {
  'great-pyramid': '△',
  'code-hammurabi': '📜',
  'trojan-war': '⚔️',
  'founding-rome': '🐺',
  'democracy-athens': '🏛️',
  'roman-forum': '🎭',
  'alexander-empire': '🦅',
  'great-wall-begin': '🧱',
  'julius-caesar': '🗡️',
  'colosseum': '🏟️',
  'fall-of-rome': '💀',
  'hagia-sophia': '🕌',
  'viking-expansion': '🪓',
  'genghis-khan': '🏹',
  'black-death': '☠️',
  'gutenberg-press': '📖',
  'columbus-americas': '⛵',
  'manhattan-purchase': '📋',
  'french-revolution': '⚜️',
  'steam-locomotive': '🚂',
  'suez-canal': '🚢',
  'eiffel-tower': '🗼',
  'ww1': '💣',
  'ww2': '✈️',
  'moon-landing': '🚀',
  'berlin-wall': '🔨',
  'www-invention': '💻',
};

// ── Muted category palette — desaturated jewel tones ───────────────
// Inspired by cartographic best practices (Imhof, ColorBrewer Dark2)
// and premium dark UI (Apple, Stripe). No neon. No Material defaults.
const CATEGORY_COLORS: Record<string, string> = {
  war: '#b85454',        // desaturated crimson — old battle flags
  discovery: '#5a8fa5',  // muted steel blue — ocean exploration
  cultural: '#c49a44',   // warm amber — aged parchment
  political: '#8b80b0',  // soft lavender — faded royal cloth
  construction: '#6d9476', // sage green — natural stone
  natural: '#b87a60',    // terracotta — earth and clay
};

// Export for use in GlobeView tooltip
export { CATEGORY_COLORS };

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
  const r = 26;

  // Subtle outer glow — very faint, not neon
  const glow = ctx.createRadialGradient(cx, cy, r, cx, cy, r + 5);
  glow.addColorStop(0, color + '20');
  glow.addColorStop(1, color + '00');
  ctx.beginPath();
  ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  // Dark circle background
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(12, 18, 32, 0.94)';
  ctx.fill();

  // Thin border — subtle, not heavy
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = color + '90';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Icon
  ctx.font = '22px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#d8dce4';
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
  const colorHex = CATEGORY_COLORS[event.category] ?? '#7a869a';
  const color = new THREE.Color(colorHex);
  const icon = EVENT_ICONS[event.id] ?? '●';

  // ── Small surface dot ──
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 8, 6),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 }),
  );
  group.add(dot);

  // ── Faint pin line ──
  const pinH = 3.5;
  const pin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, pinH, 4),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2 }),
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
  const badgeSize = 3.2;
  sprite.scale.set(badgeSize, badgeSize, 1);
  sprite.position.y = pinH + badgeSize / 2 + 0.15;
  group.add(sprite);

  return group;
}
