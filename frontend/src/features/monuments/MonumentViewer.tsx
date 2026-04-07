import { useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, MapPin } from 'lucide-react';
import { useMonumentViewer } from './useMonumentViewer';
import { formatYear } from '@/shared/utils/format';

const CATEGORY_COLORS: Record<string, string> = {
  war: '#b85454',
  discovery: '#5a8fa5',
  cultural: '#c49a44',
  political: '#8b80b0',
  construction: '#6d9476',
  natural: '#b87a60',
};

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.25, ease: 'easeIn' as const } },
};

const contentVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: EASE_OUT, delay: 0.05 },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  },
};

export function MonumentViewer() {
  const { isOpen, event, close } = useMonumentViewer();

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    },
    [close],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  const accentColor = event ? CATEGORY_COLORS[event.category] ?? '#5a8fa5' : '#5a8fa5';
  const description = event?.description?.slice(0, 150) ?? '';
  const truncatedDesc = description.length >= 150 ? `${description}...` : description;

  return (
    <AnimatePresence>
      {isOpen && event?.modelUrl && (
        <motion.div
          key="monument-viewer"
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: 'var(--color-void)' }}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-modal="true"
          aria-label={`3D model viewer: ${event.title}`}
        >
          <motion.div
            className="flex flex-col h-full"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* ── Top Bar ── */}
            <header
              className="flex items-center justify-between shrink-0 px-5 sm:px-6"
              style={{
                height: '56px',
                background: 'var(--glass-strong-bg)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="shrink-0"
                  style={{
                    width: '3px',
                    height: '24px',
                    borderRadius: '2px',
                    background: accentColor,
                  }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <h2
                    className="truncate"
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.2,
                    }}
                  >
                    {event.title}
                  </h2>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 400,
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {formatYear(event.year)}
                  </span>
                </div>
              </div>

              <button
                onClick={close}
                className="shrink-0 flex items-center gap-2 cursor-pointer"
                style={{
                  height: '36px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                  fontSize: '13px',
                  fontWeight: 500,
                  transition: 'all 200ms ease-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
                aria-label="Close 3D model viewer"
              >
                <X size={16} />
                <span className="hidden sm:inline">Back to Event</span>
              </button>
            </header>

            {/* ── Iframe Area ── */}
            <div className="flex-1 min-h-0 relative">
              <iframe
                src={event.modelUrl}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen; xr-spatial-tracking"
                allowFullScreen
                title={`3D Model: ${event.title}`}
                style={{ border: 'none' }}
              />
            </div>

            {/* ── Bottom Info Bar ── */}
            <footer
              className="shrink-0 px-5 sm:px-6 py-3"
              style={{
                background: 'var(--glass-strong-bg)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p
                    className="line-clamp-2 sm:line-clamp-1"
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    {truncatedDesc}
                  </p>
                  {event.locationName && (
                    <div
                      className="flex items-center gap-1 mt-1"
                      style={{ color: accentColor }}
                    >
                      <MapPin size={12} />
                      <span style={{ fontSize: '11px', fontWeight: 500 }}>
                        {event.locationName}
                      </span>
                    </div>
                  )}
                </div>

                <p
                  className="shrink-0 hidden sm:block"
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-text-muted)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Drag to rotate · Scroll to zoom · Shift+drag to pan
                </p>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
