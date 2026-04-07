import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Achievement } from '@/shared/stores/progressStore';

interface ToastEntry {
  id: string;
  achievement: Achievement;
}

type AchievementListener = (achievement: Achievement) => void;

const listeners: Set<AchievementListener> = new Set();

export function showAchievementToast(achievement: Achievement): void {
  listeners.forEach(fn => fn(achievement));
}

export function AchievementToast() {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const addToast = useCallback((achievement: Achievement) => {
    const entry: ToastEntry = {
      id: `${achievement.id}-${Date.now()}`,
      achievement,
    };
    setToasts(prev => [...prev, entry]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => { listeners.delete(addToast); };
  }, [addToast]);

  return (
    <div
      className="fixed top-5 right-5 z-50 flex flex-col items-end pointer-events-none"
      style={{ gap: 12 }}
      aria-live="polite"
      role="status"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            entry={toast}
            onDone={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({
  entry,
  onDone,
}: {
  entry: ToastEntry;
  onDone: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDone, 4000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      layout
      initial={{ x: 120, opacity: 0, scale: 0.85 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 120, opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="pointer-events-auto"
      style={{
        background: 'var(--glass-strong-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(196, 154, 68, 0.2)',
        borderRadius: 12,
        padding: '16px 20px',
        minWidth: 260,
        maxWidth: 340,
        boxShadow: '0 8px 32px var(--glass-shadow), 0 0 0 1px rgba(255, 255, 255, 0.04)',
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="text-2xl shrink-0 leading-none"
          style={{ marginTop: 2 }}
          role="img"
          aria-hidden="true"
        >
          {entry.achievement.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.15em] leading-none"
            style={{ color: '#c49a44' }}
          >
            Achievement Unlocked!
          </p>
          <p
            className="text-[14px] font-semibold mt-1.5 leading-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {entry.achievement.title}
          </p>
          <p
            className="text-[11px] mt-0.5 leading-snug"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {entry.achievement.desc}
          </p>
        </div>
      </div>
      <motion.div
        className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full origin-left"
        style={{ background: 'rgba(196, 154, 68, 0.4)' }}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 4, ease: 'linear' }}
      />
    </motion.div>
  );
}
