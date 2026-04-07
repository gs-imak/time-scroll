import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, MapPin, Calendar, Tag, Layers } from 'lucide-react';
import { useProgressStore } from '@/shared/stores/progressStore';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { ERAS } from '@/shared/utils/constants';

const CATEGORY_COLORS: Record<string, string> = {
  war: '#b85454', discovery: '#5a8fa5', cultural: '#c49a44',
  political: '#8b80b0', construction: '#6d9476', natural: '#b87a60',
};

const ERA_COLORS: Record<string, string> = {
  prehistory: '#8d7b68', ancient: '#c49a44', classical: '#b85454',
  medieval: '#8b6faa', renaissance: '#5a7fb5', industrial: '#7a9e5a', modern: '#5a9aaa',
};

function formatYear(y: number) {
  return y < 0 ? `${Math.abs(y)} BCE` : `${y} CE`;
}

function formatYearGap(a: number, b: number): string {
  const gap = Math.abs(a - b);
  if (gap === 0) return 'Same year';
  if (gap === 1) return '1 year apart';
  if (gap >= 1000) {
    const thousands = Math.floor(gap / 1000);
    const hundreds = gap % 1000;
    if (hundreds === 0) return `${thousands},000 years apart`;
    return `${thousands},${String(hundreds).padStart(3, '0')} years apart`;
  }
  return `${gap.toLocaleString()} years apart`;
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function ComparisonTool() {
  const compareEvents = useProgressStore(s => s.compareEvents);
  const clearCompareEvents = useProgressStore(s => s.clearCompareEvents);
  const events = useEventsStore(s => s.events);

  const isOpen = compareEvents !== null && compareEvents[0] !== '' && compareEvents[1] !== '';

  const eventA = useMemo(
    () => (compareEvents ? events.find(e => e.id === compareEvents[0]) : undefined),
    [compareEvents, events],
  );
  const eventB = useMemo(
    () => (compareEvents ? events.find(e => e.id === compareEvents[1]) : undefined),
    [compareEvents, events],
  );

  const eraA = useMemo(() => (eventA ? ERAS.find(era => era.id === eventA.eraId) : undefined), [eventA]);
  const eraB = useMemo(() => (eventB ? ERAS.find(era => era.id === eventB.eraId) : undefined), [eventB]);

  const yearGap = eventA && eventB ? formatYearGap(eventA.year, eventB.year) : '';

  // For the timeline visualization: normalize positions between the two years
  const timelineData = useMemo(() => {
    if (!eventA || !eventB) return null;
    const minYear = Math.min(eventA.year, eventB.year);
    const maxYear = Math.max(eventA.year, eventB.year);
    const range = maxYear - minYear || 1;
    return {
      leftPct: ((eventA.year - minYear) / range) * 100,
      rightPct: ((eventB.year - minYear) / range) * 100,
    };
  }, [eventA, eventB]);

  return (
    <AnimatePresence>
      {isOpen && eventA && eventB && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
          style={{ background: 'var(--color-overlay)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Close button */}
          <motion.button
            onClick={clearCompareEvents}
            className="absolute top-5 right-5 flex items-center justify-center rounded-full cursor-pointer z-10"
            style={{
              width: '44px', height: '44px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--color-border-subtle)',
            }}
            whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.9 }}
            aria-label="Close comparison"
          >
            <X size={20} style={{ color: 'var(--color-text-secondary)' }} />
          </motion.button>

          {/* Main content */}
          <motion.div
            className="w-full max-w-[1000px] max-h-[90vh] overflow-y-auto scrollbar-none"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 'clamp(20px, 3vw, 28px)',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                }}
              >
                Event Comparison
              </h2>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Side-by-side historical analysis
              </p>
            </div>

            {/* Year gap display */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 'clamp(28px, 5vw, 44px)',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #c49a44 0%, #e8c876 50%, #c49a44 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                }}
              >
                {yearGap}
              </span>
            </motion.div>

            {/* Timeline visualization */}
            {timelineData && (
              <motion.div
                className="relative mx-auto mb-10 px-4"
                style={{ maxWidth: '600px' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {/* Timeline bar */}
                <div className="relative h-[4px] rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {/* Gold connecting line */}
                  <motion.div
                    className="absolute top-0 h-full rounded-full"
                    style={{
                      left: `${Math.min(timelineData.leftPct, timelineData.rightPct)}%`,
                      background: 'linear-gradient(90deg, #c49a44, #e8c876, #c49a44)',
                      boxShadow: '0 0 12px rgba(196, 154, 68, 0.4)',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.abs(timelineData.rightPct - timelineData.leftPct)}%` }}
                    transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
                  />

                  {/* Event A dot */}
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{ left: `${timelineData.leftPct}%` }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full -ml-[7px]"
                      style={{
                        background: ERA_COLORS[eventA.eraId] ?? '#c49a44',
                        boxShadow: `0 0 10px ${ERA_COLORS[eventA.eraId] ?? '#c49a44'}60`,
                      }}
                    />
                  </motion.div>

                  {/* Event B dot */}
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{ left: `${timelineData.rightPct}%` }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: 'spring', stiffness: 300 }}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full -ml-[7px]"
                      style={{
                        background: ERA_COLORS[eventB.eraId] ?? '#c49a44',
                        boxShadow: `0 0 10px ${ERA_COLORS[eventB.eraId] ?? '#c49a44'}60`,
                      }}
                    />
                  </motion.div>
                </div>

                {/* Year labels */}
                <div className="flex justify-between mt-3">
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {formatYear(Math.min(eventA.year, eventB.year))}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {formatYear(Math.max(eventA.year, eventB.year))}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Two-column comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ComparisonCard event={eventA} era={eraA} delay={0.3} />
              <ComparisonCard event={eventB} era={eraB} delay={0.4} />
            </div>

            {/* Clear button */}
            <motion.div
              className="flex justify-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                onClick={clearCompareEvents}
                className="flex items-center gap-2 h-[44px] px-5 rounded-[10px] cursor-pointer"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '14px',
                  fontWeight: 500,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-secondary)',
                }}
                whileHover={{ scale: 1.04, borderColor: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.96 }}
              >
                <Trash2 size={16} />
                Clear Comparison
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ComparisonCardProps {
  event: {
    id: string;
    title: string;
    year: number;
    description: string;
    category: string;
    eraId: string;
    imageUrl?: string;
    locationName?: string;
  };
  era?: { id: string; name: string };
  delay: number;
}

function ComparisonCard({ event, era, delay }: ComparisonCardProps) {
  const catColor = CATEGORY_COLORS[event.category] ?? '#8a8a9a';
  const eraColor = ERA_COLORS[event.eraId] ?? '#5a9aaa';
  const snippet = event.description.length > 200
    ? event.description.slice(0, 200).replace(/\s+\S*$/, '') + '...'
    : event.description;

  return (
    <motion.div
      className="rounded-[12px] overflow-hidden"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: EASE }}
    >
      {/* Image */}
      <div
        className="w-full aspect-[16/9] relative overflow-hidden"
        style={{
          background: event.imageUrl
            ? `url(${event.imageUrl}) center/cover`
            : `linear-gradient(135deg, ${catColor}30, ${catColor}10)`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(14,14,20,0.95) 0%, rgba(14,14,20,0.3) 40%, transparent 70%)' }}
        />
        <div className="absolute bottom-4 left-4 right-4">
          <h3
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              lineHeight: 1.3,
            }}
          >
            {event.title}
          </h3>
        </div>
      </div>

      {/* Details */}
      <div className="px-5 py-4 space-y-3">
        {/* Year */}
        <DetailRow icon={Calendar} label="Year" value={formatYear(event.year)} color="#e0e0e6" />

        {/* Location */}
        {event.locationName && (
          <DetailRow icon={MapPin} label="Location" value={event.locationName} color="#e0e0e6" />
        )}

        {/* Category */}
        <DetailRow icon={Tag} label="Category" value={event.category} color={catColor} />

        {/* Era */}
        {era && (
          <DetailRow icon={Layers} label="Era" value={era.name} color={eraColor} />
        )}

        {/* Description snippet */}
        <p
          className="pt-2"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '13px',
            lineHeight: 1.6,
            color: 'var(--color-text-secondary)',
            borderTop: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          {snippet}
        </p>
      </div>
    </motion.div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--color-text-muted)', minWidth: '60px' }}>
        {label}
      </span>
      <span
        className="capitalize"
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 500, color }}
      >
        {value}
      </span>
    </div>
  );
}
