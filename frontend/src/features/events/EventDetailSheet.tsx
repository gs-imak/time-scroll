import { AnimatePresence, motion } from 'framer-motion';
import { X, Calendar, Navigation } from 'lucide-react';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { useUIStore } from '@/shared/stores/uiStore';
import { formatYear } from '@/shared/utils/format';
import { IconButton } from '@/shared/components';
import { useGlobeCamera } from '@/features/globe/useGlobeCamera';
import { ERAS } from '@/shared/utils/constants';

const CATEGORY_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  war:          { color: '#ff4444', icon: '⚔',  label: 'War & Conflict' },
  discovery:    { color: '#00e5ff', icon: '🔭', label: 'Discovery' },
  cultural:     { color: '#ffca28', icon: '🎭', label: 'Cultural' },
  political:    { color: '#b388ff', icon: '👑', label: 'Political' },
  construction: { color: '#69f0ae', icon: '🏛', label: 'Construction' },
  natural:      { color: '#ff8a65', icon: '🌋', label: 'Natural Event' },
};

export function EventDetailSheet() {
  const selectedEventId = useEventsStore(s => s.selectedEventId);
  const events = useEventsStore(s => s.events);
  const selectEvent = useEventsStore(s => s.selectEvent);
  const isMobile = useUIStore(s => s.isMobile);
  const { flyTo } = useGlobeCamera();

  const event = events.find(e => e.id === selectedEventId);
  const era = event ? ERAS.find(e => e.id === event.eraId) : null;
  const cat = event ? CATEGORY_CONFIG[event.category] : null;

  // Find adjacent events for navigation
  const currentIdx = event ? events.findIndex(e => e.id === event.id) : -1;
  const prevEvent = currentIdx > 0 ? events[currentIdx - 1] : null;
  const nextEvent = currentIdx < events.length - 1 ? events[currentIdx + 1] : null;

  const onClose = () => selectEvent(null);
  const onFlyTo = () => {
    if (event) flyTo(event.longitude, event.latitude, 8);
  };

  return (
    <AnimatePresence>
      {event && cat && (
        <motion.div
          className={
            isMobile
              ? 'fixed bottom-44 left-3 right-3 z-40 glass-strong rounded-2xl max-h-[calc(100vh-200px)] overflow-y-auto shadow-xl'
              : 'fixed top-5 right-5 z-40 w-[380px] glass-strong rounded-2xl max-h-[85vh] overflow-y-auto shadow-xl'
          }
          initial={isMobile ? { y: 120, opacity: 0 } : { x: 120, opacity: 0 }}
          animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
          exit={isMobile ? { y: 120, opacity: 0 } : { x: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        >
          {/* Category header strip */}
          <div
            className="h-1 rounded-t-2xl"
            style={{ background: `linear-gradient(90deg, ${cat.color}, ${cat.color}60)` }}
          />

          <div className="p-5">
            {/* Top: category + close */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm"
                  style={{ background: cat.color + '20', boxShadow: `0 0 12px ${cat.color}20` }}
                >
                  {cat.icon}
                </span>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: cat.color }}>
                    {cat.label}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-text-muted">
                    <Calendar size={12} />
                    {formatYear(event.year)}
                    {era && <span> &middot; {era.name}</span>}
                  </div>
                </div>
              </div>
              <IconButton icon={X} onClick={onClose} />
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold leading-snug mb-3">{event.title}</h2>

            {/* Description */}
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line mb-4">
              {event.description}
            </p>

            {/* Actions */}
            <button
              onClick={onFlyTo}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-[var(--radius-md)] text-[14px] font-medium transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: cat.color + '15',
                color: cat.color,
                border: `1px solid ${cat.color}30`,
              }}
            >
              <Navigation size={14} />
              Fly to location
            </button>

            {/* Navigation between events */}
            {(prevEvent || nextEvent) && (
              <div className="flex gap-2 mt-3">
                {prevEvent && (
                  <button
                    onClick={() => selectEvent(prevEvent.id)}
                    className="flex-1 text-left px-4 py-3 rounded-[var(--radius-md)] bg-elevated/40 hover:bg-elevated/70 transition-colors text-xs cursor-pointer"
                  >
                    <span className="text-text-muted block text-[10px]">Previous</span>
                    <span className="text-text-secondary truncate block">{prevEvent.title}</span>
                  </button>
                )}
                {nextEvent && (
                  <button
                    onClick={() => selectEvent(nextEvent.id)}
                    className="flex-1 text-left px-4 py-3 rounded-[var(--radius-md)] bg-elevated/40 hover:bg-elevated/70 transition-colors text-xs cursor-pointer"
                  >
                    <span className="text-text-muted block text-[10px]">Next</span>
                    <span className="text-text-secondary truncate block">{nextEvent.title}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
