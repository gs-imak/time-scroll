import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components';
import { ERAS } from '@/shared/utils/constants';
import { cn } from '@/shared/utils/cn';

function StarField() {
  const stars = useMemo(() =>
    Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() < 0.1 ? 2 : 1,
      opacity: 0.15 + Math.random() * 0.5,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
    })),
  []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animation: `float-subtle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);

  const selectedEraData = ERAS.find(e => e.id === selectedEra);

  const handleExplore = () => {
    setExiting(true);
    const year = selectedEraData ? selectedEraData.startYear : -3000;
    setTimeout(() => navigate(`/explore/${year}`), 700);
  };

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, #0c1e3a 0%, #050a18 60%, #020510 100%)' }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.7 }}
        >
          <StarField />

          {/* Radial glow behind content */}
          <div
            className="absolute w-[600px] h-[600px] rounded-full pointer-events-none opacity-20"
            style={{
              background: `radial-gradient(circle, ${selectedEraData?.accentColor ?? '#00d4ff'}40 0%, transparent 70%)`,
              transition: 'background 0.8s ease',
            }}
          />

          {/* Content */}
          <motion.div
            className="relative z-10 text-center max-w-xl px-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Title */}
            <motion.h1
              className="text-6xl md:text-8xl font-bold tracking-tight mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="text-text-primary">Time</span>
              {' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #00d4ff, #3b82f6, #9b59b6)' }}
              >
                Scroll
              </span>
            </motion.h1>

            <motion.p
              className="text-text-secondary text-lg md:text-xl mb-12 leading-relaxed max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              Explore 12,000 years of world history on an interactive 3D globe
            </motion.p>

            {/* Era selector */}
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] mb-4 font-medium">
                Choose your starting era
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {ERAS.map(era => {
                  const isSelected = selectedEra === era.id;
                  return (
                    <button
                      key={era.id}
                      onClick={() => setSelectedEra(era.id === selectedEra ? null : era.id)}
                      className={cn(
                        'px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer',
                        isSelected
                          ? 'text-void border border-transparent shadow-lg'
                          : 'text-text-secondary border border-border-subtle hover:border-border-active hover:text-text-primary bg-elevated/30'
                      )}
                      style={
                        isSelected
                          ? {
                              background: era.accentColor,
                              boxShadow: `0 0 24px ${era.accentColor}50`,
                            }
                          : undefined
                      }
                    >
                      {era.name}
                    </button>
                  );
                })}
              </div>

              {/* Era description */}
              <AnimatePresence mode="wait">
                {selectedEraData && (
                  <motion.p
                    key={selectedEraData.id}
                    className="text-sm text-text-secondary mt-4 max-w-sm mx-auto leading-relaxed"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                  >
                    {selectedEraData.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              <Button
                size="lg"
                variant="primary"
                onClick={handleExplore}
                className="!px-8 !h-13 !text-base glow-cyan"
              >
                Begin Exploration
                <ArrowRight size={18} />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
