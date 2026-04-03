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
  war: '#ff4444', discovery: '#00e5ff', cultural: '#ffca28',
  political: '#b388ff', construction: '#69f0ae', natural: '#ff8a65',
};

const CATEGORY_ICONS: Record<string, string> = {
  war: '⚔', discovery: '🔭', cultural: '🎭',
  political: '👑', construction: '🏛', natural: '🌋',
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
              ? 'fixed bottom-28 left-3 right-3 z-30 glass-strong rounded-[var(--radius-xl)] max-h-[45vh] overflow-y-auto'
              : 'fixed top-5 left-[76px] z-30 w-80 glass-strong rounded-xl max-h-[70vh] overflow-y-auto shadow-xl'
          }
          initial={isMobile ? { y: 60, opacity: 0 } : { x: -40, opacity: 0 }}
          animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
          exit={isMobile ? { y: 60, opacity: 0 } : { x: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isEvents ? <Scroll size={14} className="text-accent-cyan" /> : <MapPin size={14} className="text-accent-gold" />}
                <h3 className="font-semibold text-sm">
                  {isEvents ? 'Historical Events' : 'Notable Locations'}
                </h3>
                <span className="text-[10px] text-text-muted font-mono bg-elevated/60 px-1.5 py-0.5 rounded-full">
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
                  const color = CATEGORY_COLORS[event.category] ?? '#8b9dc3';
                  const icon = CATEGORY_ICONS[event.category] ?? '●';
                  return (
                    <button
                      key={event.id}
                      onClick={() => {
                        selectEvent(event.id);
                        flyTo(event.longitude, event.latitude, 6);
                        setActivePanel('none');
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-[var(--radius-md)] hover:bg-elevated/60 transition-all text-left cursor-pointer group"
                    >
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0"
                        style={{ background: color + '18', border: `1px solid ${color}30` }}
                      >
                        {icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate group-hover:text-text-primary transition-colors">{event.title}</p>
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
                    className="w-full flex items-center gap-3 p-2.5 rounded-[var(--radius-md)] hover:bg-elevated/60 transition-all text-left cursor-pointer group"
                  >
                    <span className="w-8 h-8 rounded-lg bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center shrink-0">
                      <MapPin size={14} className="text-accent-gold" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium group-hover:text-text-primary transition-colors">{loc.name}</p>
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
