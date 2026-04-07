import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMapStore } from '@/shared/stores/mapStore';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const MIN_DISPLAY_MS = 1800;
const ACCENT = '#c49a44';

function StarField() {
  const stars = useMemo(() => Array.from({ length: 80 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() < 0.1 ? 2 : 1,
    opacity: 0.05 + Math.random() * 0.25,
    twinkle: 3 + Math.random() * 5,
    delay: Math.random() * 4,
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            background: '#e0e0e6',
            opacity: s.opacity,
            animation: `ls-twinkle ${s.twinkle}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes ls-twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.02; }
        }
      `}</style>
    </div>
  );
}

function OrbitalRings() {
  const particles = useMemo(() => Array.from({ length: 24 }, (_, i) => ({
    id: i, angle: (i / 24) * 360,
    radius: 180 + Math.random() * 250,
    size: 1 + Math.random() * 1.5,
    duration: 25 + Math.random() * 40,
    delay: Math.random() * -20,
    opacity: 0.12 + Math.random() * 0.3,
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0">
        {/* Orbital rings */}
        {[540, 380, 240].map((diameter, i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute rounded-full border"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.3 + i * 0.2, ease: EASE }}
            style={{
              width: `${diameter}px`, height: `${diameter}px`,
              top: `${-diameter / 2}px`, left: `${-diameter / 2}px`,
              borderColor: `rgba(196, 154, 68, ${0.06 + i * 0.03})`,
              animation: `ls-spin ${55 - i * 12}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
            }}
          />
        ))}

        {/* Orbiting particles */}
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: `${p.size}px`, height: `${p.size}px`,
              top: `-${p.size / 2}px`, left: `-${p.size / 2}px`,
              background: ACCENT,
              opacity: p.opacity,
              animation: `ls-orbit-${p.id} ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Center glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.3 }}
        style={{
          width: '700px', height: '700px',
          background: `radial-gradient(circle, ${ACCENT}10 0%, ${ACCENT}06 40%, transparent 70%)`,
        }}
      />

      {/* Center dot */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        style={{
          width: '3px', height: '3px',
          background: ACCENT,
          boxShadow: `0 0 16px 4px ${ACCENT}50, 0 0 50px 16px ${ACCENT}15`,
        }}
      />

      <style>{`
        @keyframes ls-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        ${particles.map(p => `
          @keyframes ls-orbit-${p.id} {
            from { transform: rotate(${p.angle}deg) translateX(${p.radius}px) rotate(-${p.angle}deg); }
            to { transform: rotate(${p.angle + 360}deg) translateX(${p.radius}px) rotate(-${p.angle + 360}deg); }
          }
        `).join('')}
      `}</style>
    </div>
  );
}

export function LoadingScreen() {
  const mapReady = useMapStore(s => s.mapReady);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), MIN_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mapReady && minTimeElapsed) setVisible(false);
  }, [mapReady, minTimeElapsed]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-60 flex flex-col items-center justify-center"
          style={{ background: 'var(--color-void)' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] } }}
          role="status"
          aria-live="polite"
        >
          <StarField />
          <OrbitalRings />

          {/* Title block */}
          <div className="relative z-10 flex flex-col items-center">
            <motion.h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(36px, 6vw, 52px)',
                fontWeight: 300,
                letterSpacing: '0.3em',
                color: 'var(--color-text-primary)',
                lineHeight: 1,
                textIndent: '0.3em',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: EASE }}
            >
              TIME SCROLL
            </motion.h1>

            <motion.p
              className="mt-4 text-center"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 400,
                letterSpacing: '0.06em',
                color: 'var(--color-text-muted)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
            >
              12,000 years of human civilization
            </motion.p>

            {/* Progress bar */}
            <motion.div
              className="relative mt-8 overflow-hidden rounded-full"
              style={{ width: '180px', height: '2px', background: `${ACCENT}15` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: ACCENT }}
                initial={{ width: '0%' }}
                animate={{ width: mapReady ? '100%' : '60%' }}
                transition={{ duration: mapReady ? 0.4 : 6, ease: mapReady ? EASE : 'linear' }}
              />
            </motion.div>
          </div>

          <span className="sr-only">
            {mapReady ? 'Loading complete' : 'Loading the globe, please wait'}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
