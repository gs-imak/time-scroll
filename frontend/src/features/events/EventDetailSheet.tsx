import { AnimatePresence, motion } from 'framer-motion';
import { X, Calendar, Navigation, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { useUIStore } from '@/shared/stores/uiStore';
import { formatYear } from '@/shared/utils/format';
import { IconButton } from '@/shared/components';
import { useGlobeCamera } from '@/features/globe/useGlobeCamera';
import { ERAS } from '@/shared/utils/constants';

// Muted category palette — matches eventMarkers.ts
const CATEGORY_CONFIG: Record<string, { color: string; label: string }> = {
  war:          { color: '#b85454', label: 'War & Conflict' },
  discovery:    { color: '#5a8fa5', label: 'Discovery' },
  cultural:     { color: '#c49a44', label: 'Cultural' },
  political:    { color: '#8b80b0', label: 'Political' },
  construction: { color: '#6d9476', label: 'Construction' },
  natural:      { color: '#b87a60', label: 'Natural Event' },
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
              ? 'fixed bottom-44 left-3 right-3 z-40 rounded-2xl max-h-[calc(100vh-200px)] overflow-y-auto'
              : 'fixed top-5 right-5 z-40 w-[380px] rounded-2xl max-h-[85vh] overflow-y-auto'
          }
          style={{
            background: 'rgba(10, 16, 28, 0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
          initial={isMobile ? { y: 120, opacity: 0 } : { x: 120, opacity: 0 }}
          animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
          exit={isMobile ? { y: 120, opacity: 0 } : { x: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        >
          {/* Thin accent line at top — only color usage on the card */}
          <div
            className="h-[2px] rounded-t-2xl"
            style={{ background: cat.color }}
          />

          <div className="p-5">
            {/* Header: meta + close */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                {/* Small colored dot — minimal accent */}
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: cat.color }}
                />
                <span className="text-[11px] font-medium tracking-wide text-[#8b9dc3] uppercase">
                  {cat.label}
                </span>
                <span className="text-[11px] text-[#5a6d8a]">·</span>
                <span className="flex items-center gap-1 text-[11px] text-[#5a6d8a]">
                  <Calendar size={11} />
                  {formatYear(event.year)}
                </span>
              </div>
              <IconButton icon={X} onClick={onClose} />
            </div>

            {/* Title */}
            <h2 className="text-[18px] font-semibold leading-snug text-[#e8ecf2] mb-1.5">
              {event.title}
            </h2>

            {/* Era tag */}
            {era && (
              <p className="text-[11px] text-[#5a6d8a] mb-4">{era.name}</p>
            )}

            {/* Divider */}
            <div className="h-px bg-white/[0.06] mb-4" />

            {/* Description */}
            <p className="text-[13px] text-[#9ba8c2] leading-[1.65] mb-5">
              {event.description}
            </p>

            {/* Fly to button — neutral glass, not colored */}
            <button
              onClick={onFlyTo}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-lg text-[13px] font-medium transition-all cursor-pointer hover:bg-white/[0.08] active:scale-[0.98]"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#b0bbd0',
              }}
            >
              <Navigation size={13} />
              Fly to location
            </button>

            {/* Navigation — prev/next */}
            {(prevEvent || nextEvent) && (
              <div className="flex gap-2 mt-3">
                {prevEvent && (
                  <button
                    onClick={() => selectEvent(prevEvent.id)}
                    className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors text-left cursor-pointer hover:bg-white/[0.04]"
                    style={{ border: '1px solid rgba(255, 255, 255, 0.05)' }}
                  >
                    <ChevronLeft size={12} className="text-[#5a6d8a] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-[#5a6d8a] block">Previous</span>
                      <span className="text-[11px] text-[#8b9dc3] truncate block">{prevEvent.title}</span>
                    </div>
                  </button>
                )}
                {nextEvent && (
                  <button
                    onClick={() => selectEvent(nextEvent.id)}
                    className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors text-left cursor-pointer hover:bg-white/[0.04]"
                    style={{ border: '1px solid rgba(255, 255, 255, 0.05)' }}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-[#5a6d8a] block text-right">Next</span>
                      <span className="text-[11px] text-[#8b9dc3] truncate block text-right">{nextEvent.title}</span>
                    </div>
                    <ChevronRight size={12} className="text-[#5a6d8a] shrink-0" />
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
