import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { useUIStore } from '@/shared/stores/uiStore';
import { useTimeStore } from '@/shared/stores/timeStore';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { useGlobeCamera } from '@/features/globe/useGlobeCamera';
import { LOCATIONS, ERAS } from '@/shared/utils/constants';
import { formatYear } from '@/shared/utils/format';
import { IconButton } from '@/shared/components';

export function ExplorationPanel() {
  const activePanel = useUIStore(s => s.activePanel);
  const setActivePanel = useUIStore(s => s.setActivePanel);
  const isMobile = useUIStore(s => s.isMobile);
  const currentYear = useTimeStore(s => s.currentYear);
  const currentEra = useTimeStore(s => s.currentEra);
  const getVisibleEvents = useEventsStore(s => s.getVisibleEvents);
  const selectEvent = useEventsStore(s => s.selectEvent);
  const { flyTo } = useGlobeCamera();

  const show = activePanel === 'exploration' || activePanel === 'events';
  const isEvents = activePanel === 'events';
  const visibleEvents = getVisibleEvents(currentYear);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={
            isMobile
              ? 'fixed bottom-28 left-4 right-4 z-30 glass-strong rounded-[var(--radius-xl)] max-h-[45vh] overflow-y-auto'
              : 'fixed top-4 left-16 z-30 w-80 glass-strong rounded-[var(--radius-xl)] max-h-[70vh] overflow-y-auto'
          }
          initial={isMobile ? { y: 60, opacity: 0 } : { x: -40, opacity: 0 }}
          animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
          exit={isMobile ? { y: 60, opacity: 0 } : { x: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">
                {isEvents ? 'Events' : 'Locations'}
              </h3>
              <IconButton icon={X} size={16} onClick={() => setActivePanel('none')} />
            </div>

            {isEvents ? (
              <div className="space-y-1">
                {visibleEvents.length === 0 && (
                  <p className="text-xs text-text-muted py-4 text-center">No events at {formatYear(currentYear)}</p>
                )}
                {visibleEvents.map(event => {
                  const era = ERAS.find(e => e.id === event.eraId);
                  return (
                    <button
                      key={event.id}
                      onClick={() => {
                        selectEvent(event.id);
                        flyTo(event.longitude, event.latitude, 6);
                        setActivePanel('none');
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-[var(--radius-md)] hover:bg-elevated/60 transition-colors text-left cursor-pointer"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: era?.accentColor }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-text-muted">{formatYear(event.year)}</p>
                      </div>
                      <ChevronRight size={14} className="text-text-muted ml-auto shrink-0" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1">
                {LOCATIONS.filter(loc =>
                  loc.availableEras.includes(currentEra.id)
                ).map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      flyTo(loc.longitude, loc.latitude, loc.defaultZoom);
                      setActivePanel('none');
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-[var(--radius-md)] hover:bg-elevated/60 transition-colors text-left cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{loc.name}</p>
                      <p className="text-xs text-text-muted line-clamp-1">{loc.description}</p>
                    </div>
                    <ChevronRight size={14} className="text-text-muted ml-auto shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
