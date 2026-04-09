/**
 * Time Machine — Brand Logo Suite
 *
 * Variants:
 *   mark        — Spiral icon only (square)
 *   wordmark    — "TIME MACHINE" text only
 *   full        — Mark stacked above wordmark
 *   horizontal  — Mark left + wordmark right
 *   compact     — Small mark + small wordmark (for navbars)
 *
 * Usage:
 *   <Logo variant="mark" size={48} />
 *   <Logo variant="horizontal" height={40} />
 *   <Logo variant="full" height={120} withBackground />
 */

import { type SVGProps } from 'react';

// ═══════════════════════════════════════════
//  Brand palette
// ═══════════════════════════════════════════

const GOLD       = '#c49a44';
const GOLD_LIGHT = '#d4b06a';
const GOLD_DARK  = '#a07830';
const SURFACE    = '#0e0e14';

// ═══════════════════════════════════════════
//  Spiral path generator (Archimedean spiral)
// ═══════════════════════════════════════════

function buildSpiral(
  cx: number,
  cy: number,
  rMin: number,
  rMax: number,
  turns: number,
  steps = 200,
): string {
  const total = turns * 2 * Math.PI;
  const parts: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * total;
    const r = rMin + (rMax - rMin) * t;
    const x = cx + r * Math.cos(angle);
    const y = cy - r * Math.sin(angle);
    parts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`);
  }

  return parts.join(' ');
}

// Pre-computed at module level (immutable)
const SPIRAL_48 = buildSpiral(24, 24, 2.5, 16, 2.5, 200);
const SPIRAL_START = { x: 26.5, y: 24 }; // innermost point — origin of time

// ═══════════════════════════════════════════
//  Shared SVG fragments
// ═══════════════════════════════════════════

function GoldGradient({ id, angle = 135 }: { id: string; angle?: number }) {
  const rad = (angle * Math.PI) / 180;
  const x2 = Math.round(50 + 50 * Math.cos(rad));
  const y2 = Math.round(50 + 50 * Math.sin(rad));
  return (
    <linearGradient id={id} x1="0%" y1="0%" x2={`${x2}%`} y2={`${y2}%`}>
      <stop offset="0%" stopColor={GOLD_LIGHT} />
      <stop offset="50%" stopColor={GOLD} />
      <stop offset="100%" stopColor={GOLD_DARK} />
    </linearGradient>
  );
}

function GoldGradientH({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor={GOLD_DARK} />
      <stop offset="40%" stopColor={GOLD} />
      <stop offset="100%" stopColor={GOLD_LIGHT} />
    </linearGradient>
  );
}

/** The spiral mark rendered inside an existing <svg> */
function SpiralMark({
  cx,
  cy,
  scale = 1,
  gId,
}: {
  cx: number;
  cy: number;
  scale?: number;
  gId: string;
}) {
  const tx = cx - 24 * scale;
  const ty = cy - 24 * scale;

  return (
    <g transform={`translate(${tx},${ty}) scale(${scale})`}>
      {/* Outer ring — globe / orbit reference */}
      <circle
        cx={24}
        cy={24}
        r={21}
        stroke={`url(#${gId})`}
        strokeWidth={0.75}
        fill="none"
        opacity={0.3}
      />

      {/* The scroll spiral */}
      <path
        d={SPIRAL_48}
        stroke={`url(#${gId})`}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />

      {/* Origin dot — the beginning of time */}
      <circle cx={SPIRAL_START.x} cy={SPIRAL_START.y} r={1.5} fill={GOLD} />
    </g>
  );
}

// ═══════════════════════════════════════════
//  Public API
// ═══════════════════════════════════════════

export type LogoVariant = 'mark' | 'wordmark' | 'full' | 'horizontal' | 'compact';

export interface LogoProps extends Omit<SVGProps<SVGSVGElement>, 'children' | 'height' | 'width'> {
  /** Which layout to render */
  variant?: LogoVariant;
  /** Shorthand for both width & height on square variants, or height on wide ones */
  size?: number;
  /** Add a dark rounded-rect background (useful on unknown surfaces) */
  withBackground?: boolean;
}

export function Logo({
  variant = 'mark',
  size,
  withBackground = false,
  className,
  ...rest
}: LogoProps) {
  switch (variant) {
    case 'mark':
      return (
        <MarkLogo
          size={size ?? 48}
          withBg={withBackground}
          className={className}
          {...rest}
        />
      );
    case 'wordmark':
      return (
        <WordmarkLogo
          height={size ?? 36}
          className={className}
          {...rest}
        />
      );
    case 'full':
      return (
        <FullLogo
          height={size ?? 120}
          withBg={withBackground}
          className={className}
          {...rest}
        />
      );
    case 'horizontal':
      return (
        <HorizontalLogo
          height={size ?? 48}
          withBg={withBackground}
          className={className}
          {...rest}
        />
      );
    case 'compact':
      return (
        <CompactLogo
          height={size ?? 32}
          className={className}
          {...rest}
        />
      );
  }
}

// ═══════════════════════════════════════════
//  1. MARK — spiral icon only
// ═══════════════════════════════════════════

function MarkLogo({
  size,
  withBg,
  ...props
}: { size: number; withBg: boolean } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Time Machine logo"
      {...props}
    >
      <defs>
        <GoldGradient id="ts-m-g" />
      </defs>

      {withBg && <rect width={48} height={48} rx={12} fill={SURFACE} />}

      <SpiralMark cx={24} cy={24} gId="ts-m-g" />
    </svg>
  );
}

// ═══════════════════════════════════════════
//  2. WORDMARK — text only
// ═══════════════════════════════════════════

function WordmarkLogo({
  height,
  ...props
}: { height: number } & SVGProps<SVGSVGElement>) {
  const vw = 195;
  const vh = 36;
  const w = (height / vh) * vw;

  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      width={w}
      height={height}
      fill="none"
      role="img"
      aria-label="Time Machine"
      {...props}
    >
      <defs>
        <GoldGradientH id="ts-w-g" />
      </defs>

      <text
        x={4}
        y={26}
        fill={`url(#ts-w-g)`}
        fontFamily="'Space Grotesk', sans-serif"
        fontSize={22}
        letterSpacing="0.08em"
      >
        <tspan fontWeight={400} opacity={0.75}>TIME </tspan>
        <tspan fontWeight={700}>SCROLL</tspan>
      </text>
    </svg>
  );
}

// ═══════════════════════════════════════════
//  3. FULL — mark stacked above wordmark
// ═══════════════════════════════════════════

function FullLogo({
  height,
  withBg,
  ...props
}: { height: number; withBg: boolean } & SVGProps<SVGSVGElement>) {
  const vw = 200;
  const vh = 104;
  const w = (height / vh) * vw;

  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      width={w}
      height={height}
      fill="none"
      role="img"
      aria-label="Time Machine"
      {...props}
    >
      <defs>
        <GoldGradient id="ts-f-g" />
        <GoldGradientH id="ts-ft-g" />
      </defs>

      {withBg && <rect width={vw} height={vh} rx={16} fill={SURFACE} />}

      {/* Mark — centered horizontally */}
      <SpiralMark cx={vw / 2} cy={30} scale={1.15} gId="ts-f-g" />

      {/* Thin divider */}
      <line
        x1={vw / 2 - 30}
        y1={64}
        x2={vw / 2 + 30}
        y2={64}
        stroke={GOLD}
        strokeWidth={0.5}
        opacity={0.25}
      />

      {/* Wordmark */}
      <text
        x={vw / 2}
        y={84}
        textAnchor="middle"
        fill={`url(#ts-ft-g)`}
        fontFamily="'Space Grotesk', sans-serif"
        fontSize={20}
        letterSpacing="0.1em"
      >
        <tspan fontWeight={400} opacity={0.75}>TIME </tspan>
        <tspan fontWeight={700}>SCROLL</tspan>
      </text>

      {/* Tagline */}
      <text
        x={vw / 2}
        y={98}
        textAnchor="middle"
        fill={GOLD}
        fontFamily="'Inter', sans-serif"
        fontSize={7}
        letterSpacing="0.18em"
        fontWeight={400}
        opacity={0.4}
      >
        JOURNEY THROUGH 12,000 YEARS
      </text>
    </svg>
  );
}

// ═══════════════════════════════════════════
//  4. HORIZONTAL — mark + wordmark side by side
// ═══════════════════════════════════════════

function HorizontalLogo({
  height,
  withBg,
  ...props
}: { height: number; withBg: boolean } & SVGProps<SVGSVGElement>) {
  const markSize = 40;
  const vw = 230;
  const vh = 48;
  const w = (height / vh) * vw;

  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      width={w}
      height={height}
      fill="none"
      role="img"
      aria-label="Time Machine"
      {...props}
    >
      <defs>
        <GoldGradient id="ts-h-g" />
        <GoldGradientH id="ts-ht-g" />
      </defs>

      {withBg && <rect width={vw} height={vh} rx={12} fill={SURFACE} />}

      {/* Mark — left */}
      <SpiralMark
        cx={4 + markSize / 2}
        cy={vh / 2}
        scale={markSize / 48}
        gId="ts-h-g"
      />

      {/* Vertical separator */}
      <line
        x1={52}
        y1={12}
        x2={52}
        y2={36}
        stroke={GOLD}
        strokeWidth={0.5}
        opacity={0.2}
      />

      {/* Wordmark — right, vertically centered */}
      <text
        x={60}
        y={30}
        fill={`url(#ts-ht-g)`}
        fontFamily="'Space Grotesk', sans-serif"
        fontSize={21}
        letterSpacing="0.08em"
      >
        <tspan fontWeight={400} opacity={0.75}>TIME </tspan>
        <tspan fontWeight={700}>SCROLL</tspan>
      </text>
    </svg>
  );
}

// ═══════════════════════════════════════════
//  5. COMPACT — small mark + smaller text (navbar)
// ═══════════════════════════════════════════

function CompactLogo({
  height,
  ...props
}: { height: number } & SVGProps<SVGSVGElement>) {
  const markSize = 26;
  const vw = 158;
  const vh = 30;
  const w = (height / vh) * vw;

  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      width={w}
      height={height}
      fill="none"
      role="img"
      aria-label="Time Machine"
      {...props}
    >
      <defs>
        <GoldGradient id="ts-c-g" />
        <GoldGradientH id="ts-ct-g" />
      </defs>

      {/* Small mark */}
      <SpiralMark
        cx={markSize / 2 + 1}
        cy={vh / 2}
        scale={markSize / 48}
        gId="ts-c-g"
      />

      {/* Wordmark */}
      <text
        x={markSize + 8}
        y={20}
        fill={`url(#ts-ct-g)`}
        fontFamily="'Space Grotesk', sans-serif"
        fontSize={14.5}
        letterSpacing="0.08em"
      >
        <tspan fontWeight={400} opacity={0.75}>TIME </tspan>
        <tspan fontWeight={700}>SCROLL</tspan>
      </text>
    </svg>
  );
}

export default Logo;
