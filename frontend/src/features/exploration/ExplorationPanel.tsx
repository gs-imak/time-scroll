import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronRight, MapPin, Scroll } from 'lucide-react';
import { useUIStore } from '@/shared/stores/uiStore';
import { useTimeStore } from '@/shared/stores/timeStore';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { useGlobeCamera } from '@/features/globe/useGlobeCamera';
import { LOCATIONS } from '@/shared/utils/constants';
import { formatYear } from '@/shared/utils/format';
import { IconButton } from '@/shared/components';

const CATEGORY_COLORS: Record<string, string> = {
  war: '#b85454', discovery: '#5a8fa5', cultural: '#c49a44',
  political: '#8b80b0', construction: '#6d9476', natural: '#b87a60',
};

export function ExplorationPanel() {
  const activePanel = useUIStore(s => s.activePanel);
  const setActivePanel = useUIStore(s => s.setActivePanel);
  const isMobile = useUIStore(s => s.isMobile);
  const currentYear = useTimeStore(s => s.currentYear);
  const currentEra = useTimeStore(s => s.currentEra);
  const getVisibleEvents = useEventsStore(s => s.getVisibleEvents);
  const selectEvent = useEventsStore(s => s.selectEvent);
  const setYear = useTimeStore(s => s.setYear);
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
              ? 'fixed bottom-44 left-3 right-3 z-30 glass-strong rounded-2xl max-h-[40vh] overflow-y-auto shadow-xl'
              : 'fixed top-5 left-[88px] z-30 w-80 lg:w-[360px] glass-strong rounded-2xl max-h-[70vh] overflow-y-auto shadow-xl'
          }
          initial={isMobile ? { y: 60, opacity: 0 } : { x: -40, opacity: 0 }}
          animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
          exit={isMobile ? { y: 60, opacity: 0 } : { x: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isEvents ? <Scroll size={16} className="text-accent-cyan" /> : <MapPin size={16} className="text-accent-gold" />}
                <h3 className="font-semibold text-[14px]">
                  {isEvents ? 'Historical Events' : 'Notable Locations'}
                </h3>
                <span className="text-[10px] text-text-muted font-mono bg-elevated/60 min-w-[20px] text-center px-1.5 py-0.5 rounded-full">
                  {isEvents ? visibleEvents.length : LOCATIONS.filter(l => l.availableEras.includes(currentEra.id)).length}
                </span>
              </div>
              <IconButton icon={X} size={16} onClick={() => setActivePanel('none')} />
            </div>

            {isEvents ? (
              <div className="space-y-1">
                {visibleEvents.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-text-muted mb-2">No events at {formatYear(currentYear)}</p>
                    <button
                      onClick={() => { setYear(-2560); flyTo(31.1342, 29.9792, 4); }}
                      className="text-xs text-accent-cyan hover:underline cursor-pointer"
                    >
                      Jump to the Ancient World
                    </button>
                  </div>
                )}
                {visibleEvents.map(event => {
                  const color = CATEGORY_COLORS[event.category] ?? '#7a869a';
                  return (
                    <button
                      key={event.id}
                      onClick={() => {
                        selectEvent(event.id);
                        flyTo(event.longitude, event.latitude, 6);
                        setActivePanel('none');
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-[var(--radius-md)] hover:bg-white/[0.04] transition-all text-left cursor-pointer group"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: color }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium truncate group-hover:text-text-primary transition-colors">{event.title}</p>
                        <p className="text-[11px] text-text-muted">{formatYear(event.year)}</p>
                      </div>
                      <ChevronRight size={14} className="text-text-muted group-hover:text-text-secondary transition-colors shrink-0" />
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
                    className="w-full flex items-center gap-3 p-3 rounded-[var(--radius-md)] hover:bg-elevated/60 transition-all text-left cursor-pointer group"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-accent-gold shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium group-hover:text-text-primary transition-colors">{loc.name}</p>
                      <p className="text-[11px] text-text-muted line-clamp-1">{loc.description}</p>
                    </div>
                    <ChevronRight size={14} className="text-text-muted group-hover:text-text-secondary transition-colors shrink-0" />
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
