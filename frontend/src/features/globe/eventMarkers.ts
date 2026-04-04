import * as THREE from 'three';

/**
 * Per-event pin markers with category-specific shapes.
 * Each category has a unique shape (diamond, hexagon, shield, etc.)
 * so markers are distinguishable by silhouette from any distance.
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

// ── Muted category palette ─────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  war: '#b85454',
  discovery: '#5a8fa5',
  cultural: '#c49a44',
  political: '#8b80b0',
  construction: '#6d9476',
  natural: '#b87a60',
};
export { CATEGORY_COLORS };

// ── Category shapes — distinct silhouettes per category ────────────
type MarkerShape = 'diamond' | 'hexagon' | 'circle' | 'shield' | 'square' | 'triangle';

const CATEGORY_SHAPES: Record<string, MarkerShape> = {
  war: 'diamond',
  discovery: 'hexagon',
  cultural: 'circle',
  political: 'shield',
  construction: 'square',
  natural: 'triangle',
};

// ── Shape path drawing helpers ─────────────────────────────────────

function drawShapePath(
  ctx: CanvasRenderingContext2D,
  shape: MarkerShape,
  cx: number,
  cy: number,
  r: number,
) {
  ctx.beginPath();
  switch (shape) {
    case 'circle':
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      break;

    case 'diamond': {
      // Rotated square
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
      ctx.closePath();
      break;
    }

    case 'hexagon': {
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    }

    case 'shield': {
      // Rounded top, pointed bottom — heraldic crest
      const w = r * 0.9;
      const top = cy - r * 0.85;
      const mid = cy + r * 0.3;
      const bot = cy + r;
      ctx.moveTo(cx - w, top + 4);
      ctx.quadraticCurveTo(cx - w, top, cx - w + 4, top);
      ctx.lineTo(cx + w - 4, top);
      ctx.quadraticCurveTo(cx + w, top, cx + w, top + 4);
      ctx.lineTo(cx + w, mid);
      ctx.quadraticCurveTo(cx + w, bot - 4, cx, bot);
      ctx.quadraticCurveTo(cx - w, bot - 4, cx - w, mid);
      ctx.closePath();
      break;
    }

    case 'square': {
      // Rounded square
      const half = r * 0.82;
      const rr = 5;
      ctx.roundRect(cx - half, cy - half, half * 2, half * 2, rr);
      break;
    }

    case 'triangle': {
      // Equilateral triangle pointing up
      const h = r * 1.0;
      ctx.moveTo(cx, cy - h);
      ctx.lineTo(cx + r * 0.9, cy + h * 0.65);
      ctx.lineTo(cx - r * 0.9, cy + h * 0.65);
      ctx.closePath();
      break;
    }
  }
}

// ── Parse hex to RGB components ────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

// ── Render shaped pin canvas ───────────────────────────────────────

function renderPinCanvas(
  icon: string,
  color: string,
  shape: MarkerShape,
): HTMLCanvasElement {
  const dpr = 2;
  const size = 72;

  const canvas = document.createElement('canvas');
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  const cx = size / 2;
  const cy = size / 2;
  const r = 28;
  const [cr, cg, cb] = hexToRgb(color);

  // ── Outer glow bloom ──
  const glow = ctx.createRadialGradient(cx, cy, r - 4, cx, cy, r + 8);
  glow.addColorStop(0, `rgba(${cr},${cg},${cb}, 0.18)`);
  glow.addColorStop(1, `rgba(${cr},${cg},${cb}, 0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  // ── Shape: color-tinted fill ──
  drawShapePath(ctx, shape, cx, cy, r);
  ctx.fillStyle = `rgba(${cr},${cg},${cb}, 0.18)`;
  ctx.fill();

  // ── Shape: dark inner fill (layered) ──
  drawShapePath(ctx, shape, cx, cy, r);
  ctx.fillStyle = 'rgba(14, 14, 20, 0.78)';
  ctx.fill();

  // ── Border ──
  drawShapePath(ctx, shape, cx, cy, r);
  ctx.strokeStyle = `rgba(${cr},${cg},${cb}, 0.7)`;
  ctx.lineWidth = 2;
  ctx.stroke();

  // ── Inner accent line (subtle) ──
  drawShapePath(ctx, shape, cx, cy, r - 3);
  ctx.strokeStyle = `rgba(${cr},${cg},${cb}, 0.12)`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Icon ──
  ctx.font = '24px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#dde1e8';
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
  const shape = CATEGORY_SHAPES[event.category] ?? 'circle';

  // ── Surface glow disc (soft landing pad visible from far away) ──
  const glowDisc = new THREE.Mesh(
    new THREE.CircleGeometry(2.2, 24),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  glowDisc.rotation.x = -Math.PI / 2;
  group.add(glowDisc);

  // ── Surface ring (bright, clearly marks the location) ──
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.0, 1.5, 24),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  group.add(ring);

  // ── Pin line ──
  const pinH = 3.5;
  const pin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, pinH, 4),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 }),
  );
  pin.position.y = pinH / 2;
  group.add(pin);

  // ── Shaped badge sprite ──
  const canvas = renderPinCanvas(icon, colorHex, shape);
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
  const badgeSize = 3.8;
  sprite.scale.set(badgeSize, badgeSize, 1);
  sprite.position.y = pinH + badgeSize / 2 + 0.2;
  group.add(sprite);

  return group;
}
