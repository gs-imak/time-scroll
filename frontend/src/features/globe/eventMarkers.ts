import * as THREE from 'three';

/**
 * Per-event billboard markers rendered as canvas sprites.
 * Each event gets a unique icon + name badge that always faces the camera.
 * Inspired by Google Earth placemarks, Cesium billboards, and Shopify BFCM globe.
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

// ── Category colors (must match GlobeView) ─────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  war: '#ff4444',
  discovery: '#00e5ff',
  cultural: '#ffca28',
  political: '#b388ff',
  construction: '#69f0ae',
  natural: '#ff8a65',
};

// ── Format year for display ────────────────────────────────────────
function fmtYear(year: number): string {
  if (year < 0) return `${Math.abs(year).toLocaleString()} BCE`;
  if (year === 0) return '1 BCE';
  return `${year.toLocaleString()} CE`;
}

// ── Canvas rendering ─────────────��─────────────────────────────────

function renderBadgeCanvas(
  icon: string,
  title: string,
  year: number,
  color: string,
): HTMLCanvasElement {
  const dpr = 2;
  const w = 300;
  const h = 68;

  const canvas = document.createElement('canvas');
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  const r = 14;

  // ── Background ──
  ctx.beginPath();
  ctx.roundRect(2, 2, w - 4, h - 4, r);
  ctx.fillStyle = 'rgba(8, 14, 28, 0.92)';
  ctx.fill();

  // ── Outer glow border ���─
  ctx.beginPath();
  ctx.roundRect(2, 2, w - 4, h - 4, r);
  ctx.strokeStyle = color + '55';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ── Left accent bar ──
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(2, 2, w - 4, h - 4, r);
  ctx.clip();
  ctx.fillStyle = color;
  ctx.fillRect(2, 2, 4, h - 4);
  ctx.restore();

  // ── Icon ──
  ctx.font = '22px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, 16, h / 2);

  // ── Title text ──
  ctx.font = '600 14px Inter, -apple-system, system-ui, sans-serif';
  ctx.fillStyle = '#edf1f7';
  ctx.textBaseline = 'bottom';

  // Truncate long titles
  let displayTitle = title;
  const maxTitleWidth = w - 60;
  while (ctx.measureText(displayTitle).width > maxTitleWidth && displayTitle.length > 3) {
    displayTitle = displayTitle.slice(0, -1);
  }
  if (displayTitle !== title) displayTitle += '…';

  ctx.fillText(displayTitle, 48, h / 2 + 1);

  // ── Year subtitle ──
  ctx.font = '500 10px Inter, -apple-system, system-ui, sans-serif';
  ctx.fillStyle = color;
  ctx.textBaseline = 'top';
  ctx.fillText(fmtYear(year), 48, h / 2 + 4);

  return canvas;
}

// ── 3D marker construction ──────────��──────────────────────────────

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

  // ── 1. Surface dot (glowing point at the location) ──
  const dotMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.9,
  });
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), dotMat);
  group.add(dot);

  // Soft glow around dot
  const glowMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
  });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(1.5, 10, 8), glowMat);
  group.add(glow);

  // ── 2. Pin line (thin vertical connector) ──
  const pinHeight = 5;
  const pinGeo = new THREE.CylinderGeometry(0.06, 0.06, pinHeight, 4);
  const pinMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.35,
  });
  const pin = new THREE.Mesh(pinGeo, pinMat);
  pin.position.y = pinHeight / 2;
  group.add(pin);

  // ── 3. Badge sprite (canvas billboard, always faces camera) ──
  const canvas = renderBadgeCanvas(icon, event.title, event.year, colorHex);
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const sprite = new THREE.Sprite(spriteMat);

  // Scale to match canvas aspect ratio (300:68 ≈ 4.4:1)
  const spriteHeight = 3.2;
  const spriteWidth = spriteHeight * (300 / 68);
  sprite.scale.set(spriteWidth, spriteHeight, 1);
  sprite.position.y = pinHeight + spriteHeight / 2 + 0.3;
  group.add(sprite);

  return group;
}
