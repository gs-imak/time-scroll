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
      const timer = setTimeout(() => setShowTransition(false), 2200);
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
          transition={{ duration: 0.5 }}
        >
          {/* Dark vignette overlay for contrast */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, rgba(8, 8, 12, 0.7) 0%, rgba(8, 8, 12, 0.4) 50%, transparent 80%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />

          {/* Subtle colored edge tint */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: currentEra.accentColor,
              mixBlendMode: 'soft-light',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />

          <motion.div className="relative text-center px-8">
            {/* Era name — white text, readable on any background */}
            <motion.h1
              className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight"
              style={{
                color: '#e0e0e6',
                textShadow: '0 2px 30px rgba(0, 0, 0, 0.7), 0 0 80px rgba(0, 0, 0, 0.4)',
              }}
              initial={{ opacity: 0, y: 30, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {currentEra.name}
            </motion.h1>

            {/* Thin colored accent line under the title */}
            <motion.div
              className="mx-auto mt-4 h-[2px] rounded-full"
              style={{ background: currentEra.accentColor, width: '80px' }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 0.8, scaleX: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            />

            {/* Description */}
            <motion.p
              className="mt-4 text-[15px] max-w-lg mx-auto leading-relaxed"
              style={{ color: '#8a8a9a' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              {currentEra.description}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
