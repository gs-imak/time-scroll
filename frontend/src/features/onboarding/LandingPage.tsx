import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MapPin, Brain, Trophy } from 'lucide-react';
import { ERAS } from '@/shared/utils/constants';
import { cn } from '@/shared/utils/cn';

const ERA_COLORS: Record<string, string> = { prehistory: '#8d7b68', ancient: '#c49a44', classical: '#b85454', medieval: '#8b6faa', renaissance: '#5a7fb5', industrial: '#7a9e5a', modern: '#5a9aaa' };

const FEATURES = [
  { icon: MapPin, label: '27 Historical Events', desc: 'Pinned on a 3D globe' },
  { icon: Brain, label: 'Interactive Quizzes', desc: 'Test your knowledge' },
  { icon: Trophy, label: 'Earn Achievements', desc: 'Unlock as you explore' },
] as const;

function formatYear(y: number) { return y < 0 ? `${Math.abs(y)} BCE` : `${y} CE`; }

function StarField() {
  const stars = useMemo(() => Array.from({ length: 90 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() < 0.08 ? 2 : 1, opacity: 0.06 + Math.random() * 0.28,
    twinkle: 4 + Math.random() * 6, delay: Math.random() * 5,
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: '#e0e0e6',
            opacity: s.opacity,
            animation: `ts-twinkle ${s.twinkle}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes ts-twinkle {
          0%, 100% { opacity: var(--tw-opacity, 0.15); }
          50% { opacity: 0.02; }
        }
      `}</style>
    </div>
  );
}

function OrbitalRings({ accentColor }: { accentColor: string }) {
  const particles = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    id: i, angle: (i / 28) * 360, radius: 220 + Math.random() * 300,
    size: 1 + Math.random() * 2, duration: 30 + Math.random() * 50,
    delay: Math.random() * -30, opacity: 0.1 + Math.random() * 0.35,
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0">
        {[660, 460, 280].map((diameter, i) => (
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
              borderColor: `rgba(196, 154, 68, ${0.06 + i * 0.03})`,
              animation: `ts-spin ${65 - i * 15}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
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
              animation: `ts-orbit-${p.id} ${p.duration}s linear ${p.delay}s infinite`,
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
          background: `radial-gradient(circle, ${accentColor}14 0%, ${accentColor}08 40%, transparent 70%)`,
          transition: 'background 1s ease',
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 2, delay: 0.8 }}
        style={{
          width: '4px',
          height: '4px',
          background: accentColor,
          boxShadow: `0 0 20px 6px ${accentColor}50, 0 0 60px 20px ${accentColor}18`,
          transition: 'all 1s ease',
        }}
      />

      <style>{`
        @keyframes ts-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        ${particles.map((p) => `
          @keyframes ts-orbit-${p.id} {
            from { transform: rotate(${p.angle}deg) translateX(${p.radius}px) rotate(-${p.angle}deg); }
            to { transform: rotate(${p.angle + 360}deg) translateX(${p.radius}px) rotate(-${p.angle + 360}deg); }
          }
        `).join('')}
      `}</style>
    </div>
  );
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const stagger = {
  container: {
    animate: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  },
  item: {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT_EXPO } },
  },
  card: (i: number) => ({
    initial: { opacity: 0, y: 20, scale: 0.96 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, delay: 0.9 + i * 0.07, ease: EASE_OUT_EXPO },
    },
  }),
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);

  const selectedEraData = ERAS.find((e) => e.id === selectedEra);
  const accentColor = selectedEra ? ERA_COLORS[selectedEra] ?? '#c49a44' : '#c49a44';

  const handleExplore = () => {
    setExiting(true);
    setTimeout(() => navigate('/dashboard'), 900);
  };

  return (
    <AnimatePresence mode="wait">
      {!exiting ? (
        <motion.div
          key="landing"
          className="fixed inset-0 z-50 flex flex-col items-center overflow-hidden"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 20%, var(--color-elevated) 0%, var(--color-surface) 30%, var(--color-void) 60%, var(--color-void) 100%)',
          }}
          exit={{ scale: 1.15, opacity: 0, filter: 'blur(20px)' }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        >
          <StarField />
          <OrbitalRings accentColor={accentColor} />

          <div
            className="absolute inset-x-0 bottom-0 h-48 pointer-events-none"
            style={{ background: 'linear-gradient(to top, var(--color-void) 0%, transparent 100%)' }}
          />

          <motion.div
            className="relative z-10 flex flex-col items-center w-full max-w-5xl px-6 md:px-10 py-6 sm:py-4 md:py-3 my-auto min-h-0"
            variants={stagger.container}
            initial="initial"
            animate="animate"
          >
            {/* --- Hero --- */}
            <motion.h1
              className="text-center leading-[1.0]"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: '0.08em',
              }}
              variants={stagger.item}
            >
              <span
                className="block font-bold text-text-primary"
                style={{
                  fontSize: 'clamp(40px, 7vw, 90px)',
                  fontWeight: 700,
                }}
              >
                TIME
              </span>
              <span
                className="block font-bold bg-clip-text text-transparent"
                style={{
                  fontSize: 'clamp(40px, 7vw, 90px)',
                  fontWeight: 700,
                  backgroundImage:
                    'linear-gradient(135deg, #c49a44 0%, #d4b06a 45%, #a07830 100%)',
                }}
              >
                SCROLL
              </span>
            </motion.h1>

            <motion.p
              className="mt-3 text-center leading-relaxed max-w-lg"
              style={{
                fontSize: '16px',
                color: 'var(--color-text-secondary)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 300,
                lineHeight: 1.7,
              }}
              variants={stagger.item}
            >
              Journey through 12,000 years of human civilization
              <br />
              on an interactive 3D globe.
            </motion.p>

            {/* --- Feature highlights --- */}
            <motion.div
              className="flex flex-wrap justify-center gap-2 mt-5"
              variants={stagger.item}
            >
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.label}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg"
                  style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--color-border-subtle)',
                    backdropFilter: 'blur(24px)',
                  }}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.7 + i * 0.1,
                    ease: EASE_OUT_EXPO,
                  }}
                >
                  <f.icon
                    size={18}
                    strokeWidth={1.8}
                    style={{ color: '#c49a44', opacity: 0.7 }}
                  />
                  <div>
                    <span
                      className="block text-text-primary"
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {f.label}
                    </span>
                    <span
                      className="block"
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {f.desc}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* --- Era selector --- */}
            <motion.div className="w-full mt-6" variants={stagger.item}>
              <p
                className="text-center uppercase tracking-[0.2em] font-medium mb-3"
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Choose your starting era
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                {ERAS.map((era, i) => {
                  const isSelected = selectedEra === era.id;
                  const color = ERA_COLORS[era.id] ?? '#5a9aaa';

                  return (
                    <motion.button
                      key={era.id}
                      {...stagger.card(i)}
                      onClick={() =>
                        setSelectedEra(era.id === selectedEra ? null : era.id)
                      }
                      className={cn(
                        'group relative flex flex-col items-start text-left rounded-lg cursor-pointer transition-all duration-300',
                        'px-4 py-3',
                        'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-void',
                        isSelected
                          ? 'border-transparent'
                          : 'border-white/[0.07] hover:border-white/[0.14]',
                      )}
                      style={{
                        minWidth: '120px',
                        ...(isSelected
                          ? {
                              background: `${color}18`,
                              borderColor: `${color}40`,
                              boxShadow: `0 0 24px ${color}20, inset 0 1px 0 rgba(255,255,255,0.06)`,
                              focusVisibleRingColor: `${color}80`,
                            }
                          : {
                              background: 'var(--glass-bg)',
                              backdropFilter: 'blur(12px)',
                              boxShadow:
                                'inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 12px var(--glass-shadow)',
                            }),
                      }}
                      whileHover={!isSelected ? { y: -2, scale: 1.02 } : undefined}
                      aria-pressed={isSelected}
                      aria-label={`${era.name}, ${formatYear(era.startYear)} to ${formatYear(era.endYear)}`}
                    >
                      <div
                        className="w-8 h-[2px] rounded-full mb-2 transition-all duration-300"
                        style={{
                          background: isSelected ? color : `${color}60`,
                          boxShadow: isSelected ? `0 0 10px ${color}70` : 'none',
                        }}
                      />

                      <span
                        className={cn(
                          'transition-colors duration-300',
                          isSelected
                            ? ''
                            : 'text-text-secondary group-hover:text-text-primary',
                        )}
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          fontFamily: "'Space Grotesk', sans-serif",
                          ...(isSelected ? { color } : {}),
                        }}
                      >
                        {era.name}
                      </span>

                      <span
                        className="mt-1 tracking-wider"
                        style={{
                          fontSize: '10px',
                          color: isSelected ? `${color}aa` : '#55556a',
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
                    className="text-center max-w-md mx-auto mt-5"
                    style={{
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: 'var(--color-text-secondary)',
                    }}
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

            {/* --- CTA --- */}
            <motion.div
              className="mt-6 flex flex-col items-center"
              variants={stagger.item}
            >
              <div className="relative">
                <motion.div
                  className="absolute -inset-4 rounded-xl pointer-events-none"
                  style={{ borderBottom: '1px solid rgba(196, 154, 68, 0.12)' }}
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(196, 154, 68, 0.12), 0 0 50px rgba(196, 154, 68, 0.04)',
                      '0 0 32px rgba(196, 154, 68, 0.25), 0 0 70px rgba(196, 154, 68, 0.08)',
                      '0 0 20px rgba(196, 154, 68, 0.12), 0 0 50px rgba(196, 154, 68, 0.04)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.button
                  onClick={handleExplore}
                  className={cn(
                    'relative inline-flex items-center justify-center gap-3',
                    'h-[50px] px-7 rounded-xl font-semibold cursor-pointer',
                    'transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-void',
                  )}
                  style={{
                    fontSize: '15px',
                    fontFamily: "'Space Grotesk', sans-serif",
                    background: 'linear-gradient(135deg, #c49a44 0%, #a07830 100%)',
                    color: '#08080c',
                    fontWeight: 600,
                  }}
                  whileHover={{
                    scale: 1.04,
                    boxShadow: '0 0 36px rgba(196, 154, 68, 0.35)',
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  Start Exploring
                  <ArrowRight size={18} strokeWidth={2.5} />
                </motion.button>
              </div>

              <p
                className="mt-5 uppercase tracking-[0.25em]"
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
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
          style={{ background: 'var(--color-void)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        />
      )}
    </AnimatePresence>
  );
}
