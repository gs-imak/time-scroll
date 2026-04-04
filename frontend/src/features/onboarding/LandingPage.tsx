import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Compass } from 'lucide-react';
import { ERAS } from '@/shared/utils/constants';
import { cn } from '@/shared/utils/cn';

const ERA_COLORS: Record<string, string> = {
  prehistory: '#8d7b68',
  ancient: '#c49a44',
  classical: '#b85454',
  medieval: '#8b6faa',
  renaissance: '#5a7fb5',
  industrial: '#7a9e5a',
  modern: '#5a9aaa',
};

function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`;
  return `${year} CE`;
}

function OrbitalBackground({ accentColor }: { accentColor: string }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        id: i,
        angle: (i / 32) * 360,
        radius: 200 + Math.random() * 340,
        size: 1.5 + Math.random() * 2.5,
        duration: 25 + Math.random() * 50,
        delay: Math.random() * -30,
        opacity: 0.15 + Math.random() * 0.5,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0">
        {[620, 440, 260].map((diameter, i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute rounded-full border"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.8, delay: 0.2 + i * 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: `${diameter}px`,
              height: `${diameter}px`,
              top: `${-diameter / 2}px`,
              left: `${-diameter / 2}px`,
              borderColor: `rgba(255, 255, 255, ${0.04 + i * 0.02})`,
              animation: `spin ${60 - i * 15}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
            }}
          />
        ))}

        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              top: `-${p.size / 2}px`,
              left: `-${p.size / 2}px`,
              background: accentColor,
              opacity: p.opacity,
              animation: `orbit-${p.id} ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        style={{
          width: '900px',
          height: '900px',
          background: `radial-gradient(circle, ${accentColor}18 0%, ${accentColor}08 40%, transparent 70%)`,
          transition: 'background 1s ease',
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 2, delay: 0.8 }}
        style={{
          width: '4px',
          height: '4px',
          background: accentColor,
          boxShadow: `0 0 20px 6px ${accentColor}60, 0 0 60px 20px ${accentColor}20`,
          transition: 'all 1s ease',
        }}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        ${particles.map((p) => `
          @keyframes orbit-${p.id} {
            from { transform: rotate(${p.angle}deg) translateX(${p.radius}px) rotate(-${p.angle}deg); }
            to { transform: rotate(${p.angle + 360}deg) translateX(${p.radius}px) rotate(-${p.angle + 360}deg); }
          }
        `).join('')}
      `}</style>
    </div>
  );
}

function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() < 0.08 ? 2 : 1,
        opacity: 0.08 + Math.random() * 0.32,
        twinkle: 4 + Math.random() * 6,
        delay: Math.random() * 5,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animation: `twinkle ${s.twinkle}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: var(--tw-opacity, 0.15); }
          50% { opacity: 0.02; }
        }
      `}</style>
    </div>
  );
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const stagger = {
  container: {
    animate: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
  },
  item: {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT_EXPO } },
  },
  card: (i: number) => ({
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, delay: 1.0 + i * 0.08, ease: EASE_OUT_EXPO },
    },
  }),
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);

  const selectedEraData = ERAS.find((e) => e.id === selectedEra);
  const accentColor = selectedEra ? ERA_COLORS[selectedEra] ?? '#5a9aaa' : '#5a9aaa';

  const handleExplore = () => {
    setExiting(true);
    const year = selectedEraData ? selectedEraData.startYear : -3000;
    setTimeout(() => navigate(`/explore/${year}`), 900);
  };

  return (
    <AnimatePresence mode="wait">
      {!exiting ? (
        <motion.div
          key="landing"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto overflow-x-hidden"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 45%, #0c1e3a 0%, #070e20 40%, #050a18 70%, #030510 100%)',
          }}
          exit={{
            scale: 1.15,
            opacity: 0,
            filter: 'blur(20px)',
          }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        >
          <StarField />
          <OrbitalBackground accentColor={accentColor} />

          <div
            className="absolute inset-x-0 bottom-0 h-48 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, #050a18 0%, transparent 100%)',
            }}
          />

          <motion.div
            className="relative z-10 flex flex-col items-center w-full max-w-5xl px-6 md:px-10 py-16 sm:py-12 md:py-8 my-auto min-h-0"
            variants={stagger.container}
            initial="initial"
            animate="animate"
          >
            <motion.div className="mb-0" variants={stagger.item}>
              <motion.div
                className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full tracking-[0.15em] uppercase font-medium"
                style={{
                  fontSize: '13px',
                  background: 'rgba(0, 212, 255, 0.08)',
                  border: '1px solid rgba(0, 212, 255, 0.22)',
                  color: 'rgba(0, 212, 255, 0.85)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <Compass size={14} strokeWidth={2.5} />
                Interactive Historical Atlas
              </motion.div>
            </motion.div>

            <motion.h1
              className="mt-5 text-center leading-[1.0] tracking-[-0.03em]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              variants={stagger.item}
            >
              <span
                className="block text-7xl sm:text-8xl md:text-9xl font-bold text-text-primary"
                style={{ fontWeight: 700 }}
              >
                Time
              </span>
              <span
                className="block text-7xl sm:text-8xl md:text-9xl font-bold bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #5a9aaa 0%, #5a7fb5 50%, #8b6faa 100%)',
                  fontWeight: 700,
                }}
              >
                Scroll
              </span>
            </motion.h1>

            <motion.p
              className="mt-7 text-center leading-relaxed max-w-lg"
              style={{
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.65)',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 300,
                lineHeight: 1.7,
              }}
              variants={stagger.item}
            >
              Journey through 12,000 years of civilization on an interactive 3D globe.
              From the first cities to the modern world.
            </motion.p>

            <motion.div className="w-full mt-12" variants={stagger.item}>
              <p
                className="text-center uppercase tracking-[0.2em] font-medium mb-6"
                style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Choose your starting era
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                {ERAS.map((era, i) => {
                  const isSelected = selectedEra === era.id;
                  const color = ERA_COLORS[era.id] ?? '#5a9aaa';

                  return (
                    <motion.button
                      key={era.id}
                      {...stagger.card(i)}
                      onClick={() => setSelectedEra(era.id === selectedEra ? null : era.id)}
                      className={cn(
                        'group relative flex flex-col items-start text-left rounded-xl cursor-pointer transition-all duration-300',
                        'px-5 py-4',
                        'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50',
                        isSelected
                          ? 'border-transparent'
                          : 'border-white/15 hover:border-white/25',
                      )}
                      style={{
                        minWidth: '140px',
                        ...(isSelected
                          ? {
                              background: `linear-gradient(135deg, ${color}30, ${color}15)`,
                              borderColor: `${color}80`,
                              boxShadow: `0 0 30px ${color}30, 0 0 60px ${color}15, inset 0 1px 0 rgba(255,255,255,0.1)`,
                              transform: 'scale(1.04)',
                            }
                          : {
                              background: 'rgba(255, 255, 255, 0.07)',
                              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 12px rgba(0,0,0,0.3)',
                            }),
                      }}
                      whileHover={!isSelected ? { y: -2 } : undefined}
                      aria-pressed={isSelected}
                      aria-label={`${era.name}, ${formatYear(era.startYear)} to ${formatYear(era.endYear)}`}
                    >
                      <div
                        className="w-10 h-1 rounded-full mb-3 transition-all duration-300"
                        style={{
                          background: isSelected ? color : `${color}80`,
                          boxShadow: isSelected ? `0 0 12px ${color}90` : `0 0 6px ${color}30`,
                        }}
                      />

                      <span
                        className={cn(
                          'transition-colors duration-300',
                          isSelected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary',
                        )}
                        style={{
                          fontSize: '15px',
                          fontWeight: 500,
                          ...(isSelected ? { color } : {}),
                        }}
                      >
                        {era.name}
                      </span>

                      <span
                        className="mt-1.5 font-mono tracking-wider"
                        style={{
                          fontSize: '12px',
                          color: isSelected ? `${color}cc` : 'rgba(255, 255, 255, 0.4)',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {formatYear(era.startYear)} — {formatYear(era.endYear)}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {selectedEraData && (
                  <motion.p
                    key={selectedEraData.id}
                    className="text-sm leading-relaxed text-center max-w-md mx-auto mt-5"
                    style={{ color: 'var(--color-text-secondary)' }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    {selectedEraData.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div className="mt-12 flex flex-col items-center" variants={stagger.item}>
              <div className="relative">
                <motion.div
                  className="absolute -inset-4 rounded-xl"
                  style={{ borderBottom: '1px solid rgba(0, 212, 255, 0.15)' }}
                  animate={{
                    boxShadow: [
                      '0 0 24px rgba(0, 212, 255, 0.18), 0 0 60px rgba(0, 212, 255, 0.06)',
                      '0 0 36px rgba(0, 212, 255, 0.35), 0 0 80px rgba(0, 212, 255, 0.12)',
                      '0 0 24px rgba(0, 212, 255, 0.18), 0 0 60px rgba(0, 212, 255, 0.06)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.button
                  onClick={handleExplore}
                  className={cn(
                    'relative inline-flex items-center justify-center gap-3',
                    'h-14 px-10 rounded-xl font-semibold',
                    'bg-accent-cyan text-void cursor-pointer',
                    'transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void',
                  )}
                  style={{ fontSize: '16px' }}
                  whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(0, 212, 255, 0.4)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Begin Exploration
                  <ArrowRight size={18} strokeWidth={2.5} />
                </motion.button>
              </div>

              <p
                className="mt-5 uppercase tracking-[0.25em]"
                style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {selectedEraData
                  ? `Starting from ${formatYear(selectedEraData.startYear)}`
                  : 'Starting from 3000 BCE'}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="exit-void"
          className="fixed inset-0 z-50"
          style={{ background: '#050a18' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        />
      )}
    </AnimatePresence>
  );
}
