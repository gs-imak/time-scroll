import { useRef, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTimeStore } from '@/shared/stores/timeStore';

export function EraIndicator() {
  const currentEra = useTimeStore(s => s.currentEra);
  const [showTransition, setShowTransition] = useState(false);
  const prevEraRef = useRef(currentEra.id);

  useEffect(() => {
    if (currentEra.id !== prevEraRef.current) {
      prevEraRef.current = currentEra.id;
      setShowTransition(true);
      const timer = setTimeout(() => setShowTransition(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [currentEra.id]);

  return (
    <AnimatePresence>
      {showTransition && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: currentEra.accentColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
          <motion.div className="relative text-center">
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight"
              style={{ color: currentEra.accentColor }}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {currentEra.name}
            </motion.h1>
            <motion.p
              className="mt-2 text-text-secondary text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {currentEra.description}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
