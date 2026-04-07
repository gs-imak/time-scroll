import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['Ctrl', 'K'], description: 'Search' },
  { keys: ['Escape'], description: 'Close current panel / modal' },
  { keys: ['\u2190'], description: 'Previous event' },
  { keys: ['\u2192'], description: 'Next event' },
  { keys: ['?'], description: 'This help dialog' },
];

export function KeyboardHelp() {
  const [open, setOpen] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === '?' || (e.ctrlKey && e.key === '/')) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    },
    [open],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(5, 5, 8, 0.75)' }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            className="relative w-[420px] max-w-[90vw] rounded-2xl p-8"
            style={{
              background: 'var(--glass-strong-bg)',
              backdropFilter: 'blur(32px)',
              border: '1px solid var(--color-border-subtle)',
              boxShadow: '0 24px 80px var(--glass-shadow)',
            }}
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-[16px] font-semibold text-text-primary"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.1] transition-colors cursor-pointer"
                aria-label="Close shortcuts dialog"
              >
                <X size={14} className="text-text-secondary" />
              </button>
            </div>

            {/* Shortcut list */}
            <div className="space-y-3">
              {SHORTCUTS.map(({ keys, description }) => (
                <div
                  key={description}
                  className="flex items-center justify-between py-2"
                >
                  <span
                    className="text-[13px] text-[#95959f]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {description}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {keys.map((key) => (
                      <kbd
                        key={key}
                        className="inline-flex items-center justify-center min-w-[28px] h-[26px] px-2 rounded-md text-[11px] font-medium"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#c49a44',
                          boxShadow: '0 1px 2px var(--glass-shadow)',
                        }}
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <div
              className="mt-6 pt-4 text-center text-[11px]"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--color-text-muted)',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              Press <kbd className="inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded text-[10px] mx-1" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-muted)' }}>?</kbd> to toggle this dialog
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
