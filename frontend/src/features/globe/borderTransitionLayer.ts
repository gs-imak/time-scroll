/**
 * Paint-dissolve transition layer for historical border changes.
 *
 * three-globe swaps polygon meshes instantly (only altitude is tweened — see
 * its polygons layer: geometry is rebuilt the moment `coords` change), so any
 * boundary-snapshot change pops. Instead of morphing 2,000 multipolygons on
 * the CPU (ring correspondence + per-frame retessellation — the jank we just
 * removed), this layer blends the two snapshots in TEXTURE space on the GPU:
 *
 *   1. Each snapshot is rasterized once onto an offscreen equirectangular
 *      canvas (fills + strokes, same colors as the live mesh layer).
 *   2. A thin transparent sphere shell above the polygon caps cross-dissolves
 *      from the previous snapshot's texture to the next with a noise-driven
 *      edge, so borders bleed outward like wet paint instead of snapping.
 *   3. The real polygon meshes are swapped while the shell covers them; when
 *      the dissolve ends the shell fades out over the already-settled meshes.
 *
 * Cost is constant regardless of polygon count: two canvas rasterizations per
 * snapshot change (double-buffered) + one full-screen-ish blended draw call.
 */
import * as THREE from 'three';
import type { BoundaryFeature } from '@/shared/types/geo';

/** Equirectangular raster size. 3072×1536 keeps a redraw ~30-60ms and the
 *  shell soft-but-clean under the closest spotlight zoom. */
const TEX_W = 3072;
const TEX_H = 1536;

/** Globe radius is 100 in three-globe units. Polygon caps extrude to
 *  100*(1+altitude): ~100.6 default, ~101.8 for spotlight-highlighted
 *  territories. Markers sit at ~102. The shell must cover EVERY cap variant
 *  (or raised territories pop right through the dissolve) while staying
 *  under the markers. */
const SHELL_RADIUS = 101.85;

export interface FeaturePaintStyle {
  fill: string;        // css color
  fillAlpha: number;   // 0..1
  stroke: string;      // css color
  strokeAlpha: number; // 0..1
}

export type PaintStyleFn = (f: BoundaryFeature) => FeaturePaintStyle;

interface Buffer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
}

function makeBuffer(): Buffer {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext('2d')!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  // Equirect wraps horizontally; clamping vertically avoids pole bleed.
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return { canvas, ctx, texture };
}

function tracePolygon(ctx: CanvasRenderingContext2D, rings: number[][][]): void {
  for (const ring of rings) {
    if (!ring || ring.length < 3) continue;
    const first = ring[0]!;
    ctx.moveTo(((first[0]! + 180) / 360) * TEX_W, ((90 - first[1]!) / 180) * TEX_H);
    for (let i = 1; i < ring.length; i++) {
      const p = ring[i]!;
      ctx.lineTo(((p[0]! + 180) / 360) * TEX_W, ((90 - p[1]!) / 180) * TEX_H);
    }
    ctx.closePath();
  }
}

function rasterize(buf: Buffer, features: BoundaryFeature[], styleFor: PaintStyleFn): void {
  const { ctx } = buf;
  ctx.clearRect(0, 0, TEX_W, TEX_H);
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  for (const f of features) {
    const g = f.geometry;
    if (!g) continue;
    const style = styleFor(f);
    if (style.fillAlpha <= 0.005 && style.strokeAlpha <= 0.005) continue;
    const polys = (g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates]) as number[][][][];
    ctx.beginPath();
    for (const poly of polys) tracePolygon(ctx, poly);
    if (style.fillAlpha > 0.005) {
      ctx.globalAlpha = style.fillAlpha;
      ctx.fillStyle = style.fill;
      ctx.fill('evenodd');
    }
    if (style.strokeAlpha > 0.005) {
      ctx.globalAlpha = style.strokeAlpha;
      ctx.strokeStyle = style.stroke;
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  buf.texture.needsUpdate = true;
}

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Two octaves of cheap value noise perturb the dissolve threshold so the new
// borders spread with an organic, painted edge instead of a uniform fade.
const FRAG = /* glsl */ `
  uniform sampler2D texA;
  uniform sampler2D texB;
  uniform float progress;
  uniform float fade;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  void main() {
    vec4 a = texture2D(texA, vUv);
    vec4 b = texture2D(texB, vUv);
    float n = vnoise(vUv * vec2(140.0, 70.0)) * 0.6 + vnoise(vUv * vec2(24.0, 12.0)) * 0.4;
    // progress runs 0→1; each texel flips when the widened front passes its
    // noise threshold, giving a soft creeping edge ~0.25 wide.
    float t = smoothstep(0.0, 1.0, (progress * 1.6 - n * 0.6) / 0.4 - 0.5);
    t = clamp(t, 0.0, 1.0);
    vec4 c = mix(a, b, t);
    gl_FragColor = vec4(c.rgb, c.a * fade);
  }
`;

export class BorderTransitionLayer {
  private mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private bufA: Buffer;
  private bufB: Buffer;
  /** Which buffer holds the CURRENT (last painted) state. */
  private current: 'A' | 'B' = 'A';
  private hasCurrent = false;
  private rafId = 0;

  // Interrupt continuity: when a new snapshot arrives mid-dissolve, the
  // visible blend is baked into a render target and becomes the new "from"
  // state — without this, rapid scrubbing snaps to the previous target
  // before each new dissolve. Two RTs ping-pong so a capture never samples
  // the target it writes.
  private renderer: THREE.WebGLRenderer | null;
  private captureRTs: [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget];
  private lastCaptureIdx = 0;
  private captureScene: THREE.Scene;
  private captureCamera: THREE.OrthographicCamera;
  private captureQuad: THREE.Mesh;

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer | null) {
    this.renderer = renderer;
    this.bufA = makeBuffer();
    this.bufB = makeBuffer();
    this.captureRTs = [
      new THREE.WebGLRenderTarget(TEX_W, TEX_H, { depthBuffer: false }),
      new THREE.WebGLRenderTarget(TEX_W, TEX_H, { depthBuffer: false }),
    ];
    this.captureCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.captureScene = new THREE.Scene();
    this.captureQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    this.captureScene.add(this.captureQuad);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        texA: { value: this.bufA.texture },
        texB: { value: this.bufB.texture },
        progress: { value: 0 },
        fade: { value: 0 },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
    });
    const geo = new THREE.SphereGeometry(SHELL_RADIUS, 96, 48);
    this.mesh = new THREE.Mesh(geo, this.material);
    // three-globe's globe material renders the equirect texture starting at
    // -90° longitude; SphereGeometry's seam sits at +90°. Rotate to align the
    // shell's UVs with the lat/lng rasterization above.
    this.mesh.rotation.y = -Math.PI / 2;
    this.mesh.visible = false;
    this.mesh.renderOrder = 2;
    // Never intercept globe interaction raycasts.
    this.mesh.raycast = () => {};
    scene.add(this.mesh);
  }

  /**
   * Record a snapshot as the current state WITHOUT dissolving — used for the
   * first paint and for mode switches (war <-> normal) where blending from an
   * unrelated dataset would look wrong.
   */
  prime(features: BoundaryFeature[], styleFor: PaintStyleFn): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.mesh.visible = false;
    const next = this.current === 'A' ? this.bufB : this.bufA;
    rasterize(next, features, styleFor);
    this.current = this.current === 'A' ? 'B' : 'A';
    this.hasCurrent = true;
  }

  /**
   * Paint the incoming snapshot and dissolve from the previously painted one.
   * On the very first call there is no previous state to blend from, so the
   * layer just records the state and stays hidden (the initial mesh build has
   * its own entrance animation).
   */
  /** Bake the currently-visible blend into a render target for continuity. */
  private captureCurrentBlend(): THREE.Texture | null {
    if (!this.renderer) return null;
    const idx = this.lastCaptureIdx === 0 ? 1 : 0;
    const rt = this.captureRTs[idx]!;
    this.captureQuad.material = this.material;
    const prevTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(rt);
    this.renderer.clear();
    this.renderer.render(this.captureScene, this.captureCamera);
    this.renderer.setRenderTarget(prevTarget);
    this.lastCaptureIdx = idx;
    return rt.texture;
  }

  transitionTo(features: BoundaryFeature[], styleFor: PaintStyleFn, durationMs: number): void {
    if (!this.hasCurrent) {
      this.prime(features, styleFor);
      return;
    }
    // If a dissolve is still running, continue from what's on screen now.
    const interrupted = this.rafId !== 0;
    const capturedPrev = interrupted ? this.captureCurrentBlend() : null;

    const next = this.current === 'A' ? this.bufB : this.bufA;
    rasterize(next, features, styleFor);

    const prev = this.current === 'A' ? this.bufA : this.bufB;
    this.material.uniforms.texA!.value = capturedPrev ?? prev.texture;
    this.material.uniforms.texB!.value = next.texture;
    this.material.uniforms.progress!.value = 0;
    this.material.uniforms.fade!.value = 1;
    this.mesh.visible = true;
    this.current = this.current === 'A' ? 'B' : 'A';

    if (this.rafId) cancelAnimationFrame(this.rafId);
    const start = performance.now();
    const FADE_OUT = 400; // reveal the live meshes after the dissolve settles
    const tick = () => {
      const elapsed = performance.now() - start;
      const p = Math.min(1, elapsed / durationMs);
      this.material.uniforms.progress!.value = p;
      if (elapsed >= durationMs) {
        const f = Math.max(0, 1 - (elapsed - durationMs) / FADE_OUT);
        this.material.uniforms.fade!.value = f;
        if (f <= 0) {
          this.mesh.visible = false;
          this.rafId = 0;
          return;
        }
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  dispose(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.mesh.parent?.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.bufA.texture.dispose();
    this.bufB.texture.dispose();
    this.captureRTs[0].dispose();
    this.captureRTs[1].dispose();
    this.captureQuad.geometry.dispose();
    this.renderer = null;
  }
}
