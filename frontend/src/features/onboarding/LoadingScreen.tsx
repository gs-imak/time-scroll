import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMapStore } from '@/shared/stores/mapStore';

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const MIN_DISPLAY_MS = 1500;

function DriftingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 1.5,
        duration: 18 + Math.random() * 30,
        delay: Math.random() * -20,
        opacity: 0.06 + Math.random() * 0.14,
        drift: 30 + Math.random() * 60,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: '#5a9aaa',
            opacity: p.opacity,
            animation: `drift-${p.id} ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        ${particles
          .map(
            (p) => `
          @keyframes drift-${p.id} {
            0% { transform: translate(0, 0); }
            100% { transform: translate(${p.drift * (Math.random() > 0.5 ? 1 : -1)}px, ${p.drift * (Math.random() > 0.5 ? 1 : -1)}px); }
          }`,
          )
          .join('')}
      `}</style>
    </div>
  );
}

export function LoadingScreen() {
  const mapReady = useMapStore((s) => s.mapReady);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), MIN_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mapReady && minTimeElapsed) {
      setVisible(false);
    }
  }, [mapReady, minTimeElapsed]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-60 flex flex-col items-center justify-center"
          style={{ background: 'var(--color-void)' }}
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
          }}
          role="status"
          aria-live="polite"
          aria-label="Loading Time Scroll"
        >
          {/* Radial ambient glow behind the title */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: '700px',
              height: '700px',
              background:
                'radial-gradient(circle, rgba(90, 154, 170, 0.06) 0%, rgba(90, 154, 170, 0.02) 40%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            aria-hidden="true"
          />

          <DriftingParticles />

          {/* Horizontal rule — top accent */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: '280px',
              height: '1px',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(90, 154, 170, 0.2) 30%, rgba(90, 154, 170, 0.2) 70%, transparent 100%)',
              marginTop: '-60px',
            }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: EASE_OUT_EXPO }}
            aria-hidden="true"
          />

          {/* Title block */}
          <div className="relative z-10 flex flex-col items-center">
            <motion.h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '42px',
                fontWeight: 300,
                letterSpacing: '0.3em',
                color: 'var(--color-text-primary)',
                lineHeight: 1,
                textIndent: '0.3em',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: EASE_OUT_EXPO }}
            >
              TIME SCROLL
            </motion.h1>

            <motion.p
              className="mt-5 text-center"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 400,
                letterSpacing: '0.08em',
                color: 'var(--color-text-muted)',
                lineHeight: 1.5,
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: EASE_OUT_EXPO }}
            >
              12,000 years of human civilization
            </motion.p>

            {/* Progress bar */}
            <motion.div
              className="relative mt-10 overflow-hidden rounded-full"
              style={{
                width: '200px',
                height: '1px',
                background: 'rgba(90, 154, 170, 0.12)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              aria-hidden="true"
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: '#5a9aaa' }}
                initial={{ width: '0%' }}
                animate={{ width: mapReady ? '100%' : '70%' }}
                transition={{
                  duration: mapReady ? 0.4 : 8,
                  ease: mapReady ? EASE_OUT_EXPO : 'linear',
                }}
              />
            </motion.div>
          </div>

          {/* Horizontal rule — bottom accent */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: '280px',
              height: '1px',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(90, 154, 170, 0.2) 30%, rgba(90, 154, 170, 0.2) 70%, transparent 100%)',
              marginTop: '80px',
            }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: EASE_OUT_EXPO }}
            aria-hidden="true"
          />

          {/* Screen-reader text for loading state */}
          <span className="sr-only">
            {mapReady ? 'Loading complete' : 'Loading the globe, please wait'}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
