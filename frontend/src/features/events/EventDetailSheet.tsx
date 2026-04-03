import { AnimatePresence, motion } from 'framer-motion';
import { X, Calendar, MapPin, Tag } from 'lucide-react';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { useUIStore } from '@/shared/stores/uiStore';
import { formatYear } from '@/shared/utils/format';
import { IconButton } from '@/shared/components';
import { useGlobeCamera } from '@/features/globe/useGlobeCamera';
import { ERAS } from '@/shared/utils/constants';

export function EventDetailSheet() {
  const selectedEventId = useEventsStore(s => s.selectedEventId);
  const events = useEventsStore(s => s.events);
  const selectEvent = useEventsStore(s => s.selectEvent);
  const isMobile = useUIStore(s => s.isMobile);
  const { flyTo } = useGlobeCamera();

  const event = events.find(e => e.id === selectedEventId);
  const era = event ? ERAS.find(e => e.id === event.eraId) : null;

  const onClose = () => selectEvent(null);

  const onFlyTo = () => {
    if (event) flyTo(event.longitude, event.latitude, 8);
  };

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className={
            isMobile
              ? 'fixed bottom-24 left-4 right-4 z-40 glass-strong rounded-[var(--radius-xl)] max-h-[50vh] overflow-y-auto'
              : 'fixed top-4 right-4 z-40 w-96 glass-strong rounded-[var(--radius-xl)] max-h-[80vh] overflow-y-auto'
          }
          initial={isMobile ? { y: 100, opacity: 0 } : { x: 100, opacity: 0 }}
          animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
          exit={isMobile ? { y: 100, opacity: 0 } : { x: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-xl font-bold leading-tight pr-2">{event.title}</h2>
              <IconButton icon={X} onClick={onClose} />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-elevated text-text-secondary">
                <Calendar size={12} />
                {formatYear(event.year)}
              </span>
              {era && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                  style={{ background: era.accentColor + '20', color: era.accentColor }}
                >
                  <Tag size={12} />
                  {era.name}
                </span>
              )}
              <button
                onClick={onFlyTo}
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-colors cursor-pointer"
              >
                <MapPin size={12} />
                Fly to location
              </button>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
