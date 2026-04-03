import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Globe } from 'lucide-react';
import { Button } from '@/shared/components';
import { ERAS } from '@/shared/utils/constants';
import { cn } from '@/shared/utils/cn';

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);

  const handleExplore = () => {
    setExiting(true);
    const era = ERAS.find(e => e.id === selectedEra);
    const year = era ? era.startYear : -3000;
    setTimeout(() => navigate(`/explore/${year}`), 800);
  };

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          className="fixed inset-0 z-50 bg-void flex flex-col items-center justify-center overflow-hidden"
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Star particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 60 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-px h-px bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.6 + 0.2,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <motion.div
            className="relative z-10 text-center max-w-2xl px-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
            >
              <Globe size={28} className="text-accent-cyan" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-3">
              Time{' '}
              <span className="text-accent-cyan">Scroll</span>
            </h1>
            <p className="text-text-secondary text-lg md:text-xl mb-10 leading-relaxed">
              Journey through 12,000 years of world history on an interactive 3D globe
            </p>

            {/* Era selector */}
            <motion.div
              className="mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-xs text-text-muted uppercase tracking-widest mb-3">
                Start at an era
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {ERAS.map(era => (
                  <button
                    key={era.id}
                    onClick={() => setSelectedEra(era.id === selectedEra ? null : era.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border cursor-pointer',
                      selectedEra === era.id
                        ? 'border-transparent text-void'
                        : 'border-border-subtle text-text-secondary hover:border-border-active hover:text-text-primary'
                    )}
                    style={
                      selectedEra === era.id
                        ? { background: era.accentColor }
                        : undefined
                    }
                  >
                    {era.name}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button size="lg" variant="primary" onClick={handleExplore}>
                Explore History
                <ArrowRight size={18} />
              </Button>
            </motion.div>
          </motion.div>

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-void to-transparent pointer-events-none" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
