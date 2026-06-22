/**
 * Temporary preview page for the logo suite.
 * Route: /logo-preview
 * Remove after finalizing logo choices.
 */

import { Logo } from '@/shared/components/Logo';

export function LogoPreview() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#08080c',
        padding: '48px 32px',
        fontFamily: "'Inter', sans-serif",
        color: '#8a8a9a',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          fontWeight: 700,
          color: '#e0e0e6',
          marginBottom: 8,
        }}
      >
        Time Machine — Logo Suite
      </h1>
      <p style={{ fontSize: 14, marginBottom: 48 }}>
        All variants, sizes, and background options
      </p>

      {/* ── 1. MARK ── */}
      <Section title="Mark (Icon Only)">
        <Row label="48px (default)">
          <Logo variant="mark" size={48} />
        </Row>
        <Row label="64px">
          <Logo variant="mark" size={64} />
        </Row>
        <Row label="96px">
          <Logo variant="mark" size={96} />
        </Row>
        <Row label="128px with background">
          <Logo variant="mark" size={128} withBackground />
        </Row>
        <Row label="48px on light surface" light>
          <Logo variant="mark" size={48} />
        </Row>
      </Section>

      {/* ── 2. WORDMARK ── */}
      <Section title="Wordmark (Text Only)">
        <Row label="Height 24px">
          <Logo variant="wordmark" size={24} />
        </Row>
        <Row label="Height 36px (default)">
          <Logo variant="wordmark" size={36} />
        </Row>
        <Row label="Height 48px">
          <Logo variant="wordmark" size={48} />
        </Row>
      </Section>

      {/* ── 3. FULL (STACKED) ── */}
      <Section title="Full (Stacked)">
        <Row label="120px (default)">
          <Logo variant="full" size={120} />
        </Row>
        <Row label="180px with background">
          <Logo variant="full" size={180} withBackground />
        </Row>
      </Section>

      {/* ── 4. HORIZONTAL ── */}
      <Section title="Horizontal">
        <Row label="40px height">
          <Logo variant="horizontal" size={40} />
        </Row>
        <Row label="48px (default)">
          <Logo variant="horizontal" size={48} />
        </Row>
        <Row label="56px with background">
          <Logo variant="horizontal" size={56} withBackground />
        </Row>
      </Section>

      {/* ── 5. COMPACT ── */}
      <Section title="Compact (Navbar)">
        <Row label="28px">
          <Logo variant="compact" size={28} />
        </Row>
        <Row label="32px (default)">
          <Logo variant="compact" size={32} />
        </Row>
        <Row label="40px">
          <Logo variant="compact" size={40} />
        </Row>
      </Section>

      {/* ── 6. STANDALONE SVGs ── */}
      <Section title="Standalone SVG Files">
        <Row label="logo-mark.svg">
          <img src="/assets/logo/logo-mark.svg" alt="Mark" width={64} height={64} />
        </Row>
        <Row label="logo-mark-solid.svg">
          <img src="/assets/logo/logo-mark-solid.svg" alt="Mark solid" width={64} height={64} />
        </Row>
        <Row label="favicon.svg">
          <img src="/assets/logo/favicon.svg" alt="Favicon" width={32} height={32} />
          <img src="/assets/logo/favicon.svg" alt="Favicon" width={16} height={16} style={{ marginLeft: 12 }} />
        </Row>
      </Section>
    </div>
  );
}

/* ── Layout helpers ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 56 }}>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 16,
          fontWeight: 600,
          color: '#c49a44',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 20,
          paddingBottom: 8,
          borderBottom: '1px solid rgba(196,154,68,0.15)',
        }}
      >
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {children}
      </div>
    </div>
  );
}

function Row({
  label,
  light,
  children,
}: {
  label: string;
  light?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <span
        style={{
          width: 200,
          flexShrink: 0,
          fontSize: 13,
          color: '#55556a',
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 16,
          borderRadius: 12,
          background: light ? '#e0e0e6' : 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
