import { useEffect, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X, Search, Navigation, Keyboard, Eye, Layers, Home,
} from 'lucide-react';
import { useTimeStore } from '@/shared/stores/timeStore';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface Shortcut {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  icon: typeof Navigation;
  label: string;
  color: string;
  shortcuts: Shortcut[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    icon: Search,
    label: 'Search',
    color: '#c49a44',
    shortcuts: [
      { keys: ['Ctrl', 'K'], description: 'Open global search' },
      { keys: ['↑', '↓'], description: 'Navigate results' },
      { keys: ['↵'], description: 'Open selected result' },
    ],
  },
  {
    icon: Navigation,
    label: 'Navigation',
    color: '#5a9aaa',
    shortcuts: [
      { keys: ['←'], description: 'Previous event' },
      { keys: ['→'], description: 'Next event' },
      { keys: ['Esc'], description: 'Close current panel or modal' },
    ],
  },
  {
    icon: Layers,
    label: 'Interface',
    color: '#6d9476',
    shortcuts: [
      { keys: ['?'], description: 'Toggle this help dialog' },
      { keys: ['Ctrl', '/'], description: 'Alternative help shortcut' },
    ],
  },
];

export function KeyboardHelp() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);

  // Pause timeline playback while the shortcuts dialog is open; resume only
  // if it was actually playing before (never start playback the user
  // hadn't begun). Same pattern as SearchOverlay.
  const wasPlayingRef = useRef(false);
  useEffect(() => {
    if (open) {
      const { isPlaying, togglePlay } = useTimeStore.getState();
      if (isPlaying) {
        wasPlayingRef.current = true;
        togglePlay();
      } else {
        wasPlayingRef.current = false;
      }
    } else if (wasPlayingRef.current) {
      useTimeStore.getState().togglePlay();
      wasPlayingRef.current = false;
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === '?' || (e.ctrlKey && e.key === '/')) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && open) setOpen(false);
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
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'var(--color-overlay)' }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={dialogRef}
            className="relative w-[500px] max-w-full rounded-2xl overflow-hidden"
            style={{
              background: 'var(--glass-strong-bg)',
              backdropFilter: 'blur(40px)',
              border: '1px solid var(--color-border-subtle)',
              boxShadow: '0 28px 80px var(--glass-shadow), inset 0 1px 0 var(--glass-inset)',
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
            <div className="flex items-center justify-between px-7 pt-6 pb-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: 'rgba(196,154,68,0.1)',
                    border: '1px solid rgba(196,154,68,0.2)',
                  }}
                >
                  <Keyboard size={20} style={{ color: 'var(--color-accent-gold)' }} />
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '20px',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.1,
                    }}
                  >
                    Keyboard Shortcuts
                  </h2>
                  <p
                    className="mt-0.5"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    Navigate Time Machine at the speed of thought
                  </p>
                </div>
              </div>
              <motion.button
                type="button"
                onClick={() => setOpen(false)}
                className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer shrink-0"
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--color-border-subtle)',
                }}
                whileHover={{
                  scale: 1.1,
                  borderColor: 'rgba(196,154,68,0.3)',
                }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close shortcuts dialog"
              >
                <X size={14} style={{ color: 'var(--color-text-secondary)' }} />
              </motion.button>
            </div>

            {/* Groups */}
            <div className="px-7 pb-6 space-y-5">
              {SHORTCUT_GROUPS.map((group, gIdx) => {
                const GroupIcon = group.icon;
                return (
                  <motion.div
                    key={group.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * gIdx, duration: 0.4, ease: EASE }}
                  >
                    {/* Group label */}
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                        style={{
                          background: `${group.color}14`,
                          border: `1px solid ${group.color}28`,
                        }}
                      >
                        <GroupIcon size={12} style={{ color: group.color }} />
                      </div>
                      <span
                        className="text-[10px] font-semibold tracking-[0.14em] uppercase"
                        style={{ color: group.color }}
                      >
                        {group.label}
                      </span>
                      <div
                        className="flex-1 h-px"
                        style={{
                          background: `linear-gradient(90deg, ${group.color}30, transparent)`,
                        }}
                      />
                    </div>

                    {/* Shortcuts in this group */}
                    <div className="space-y-1">
                      {group.shortcuts.map(({ keys, description }) => (
                        <div
                          key={description}
                          className="flex items-center justify-between py-2 px-3 rounded-lg"
                          style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--color-border-subtle)',
                          }}
                        >
                          <span
                            className="text-[12px]"
                            style={{
                              fontFamily: 'var(--font-display)',
                              color: 'var(--color-text-secondary)',
                            }}
                          >
                            {description}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {keys.map((key, kIdx) => (
                              <span key={`${key}-${kIdx}`} className="flex items-center gap-1.5">
                                {kIdx > 0 && (
                                  <span
                                    className="text-[10px]"
                                    style={{ color: 'var(--color-text-muted)' }}
                                  >
                                    +
                                  </span>
                                )}
                                <kbd
                                  className="inline-flex items-center justify-center min-w-[26px] h-[24px] px-2 rounded-md text-[11px] font-semibold"
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    background: `${group.color}14`,
                                    border: `1px solid ${group.color}35`,
                                    color: group.color,
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                  }}
                                >
                                  {key}
                                </kbd>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between gap-2 px-7 py-4"
              style={{
                borderTop: '1px solid var(--color-border-subtle)',
                background: 'var(--glass-bg)',
              }}
            >
              <div className="flex items-center gap-2">
                <Eye size={11} style={{ color: 'var(--color-text-muted)' }} />
                <span
                  className="text-[10px]"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-muted)',
                    letterSpacing: '0.04em',
                  }}
                >
                  Press
                </span>
                <kbd
                  className="inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded text-[10px]"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    background: 'rgba(196,154,68,0.14)',
                    border: '1px solid rgba(196,154,68,0.3)',
                    color: 'var(--color-accent-gold)',
                  }}
                >
                  ?
                </kbd>
                <span
                  className="text-[10px]"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-muted)',
                    letterSpacing: '0.04em',
                  }}
                >
                  to toggle
                </span>
              </div>
              <div
                className="flex items-center gap-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <Home size={11} />
                <span
                  className="text-[10px]"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.04em',
                  }}
                >
                  Time Machine
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
