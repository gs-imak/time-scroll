import { useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, MapPin, Calendar, Clock, ChevronLeft, ChevronRight, Lightbulb, ExternalLink } from 'lucide-react';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { formatYear } from '@/shared/utils/format';
import { ERAS } from '@/shared/utils/constants';

// Muted category palette
const CATEGORY_META: Record<string, { color: string; label: string }> = {
  war: { color: '#b85454', label: 'War & Conflict' },
  discovery: { color: '#5a8fa5', label: 'Discovery' },
  cultural: { color: '#c49a44', label: 'Cultural' },
  political: { color: '#8b80b0', label: 'Political' },
  construction: { color: '#6d9476', label: 'Construction' },
  natural: { color: '#b87a60', label: 'Natural Event' },
};

export function EventStory() {
  const selectedEventId = useEventsStore(s => s.selectedEventId);
  const events = useEventsStore(s => s.events);
  const selectEvent = useEventsStore(s => s.selectEvent);

  const event = events.find(e => e.id === selectedEventId);
  const era = event ? ERAS.find(e => e.id === event.eraId) : null;
  const cat = event ? CATEGORY_META[event.category] : null;

  // Related events: same era or same category, excluding self
  const relatedEvents = useMemo(() => {
    if (!event) return [];
    return events
      .filter(e => e.id !== event.id && (e.eraId === event.eraId || e.category === event.category))
      .sort((a, b) => Math.abs(a.year - event.year) - Math.abs(b.year - event.year))
      .slice(0, 4);
  }, [event, events]);

  // Prev/next through all events chronologically
  const sortedEvents = useMemo(() => [...events].sort((a, b) => a.year - b.year), [events]);
  const currentIdx = event ? sortedEvents.findIndex(e => e.id === event.id) : -1;
  const prevEvent = currentIdx > 0 ? sortedEvents[currentIdx - 1] : null;
  const nextEvent = currentIdx < sortedEvents.length - 1 ? sortedEvents[currentIdx + 1] : null;

  const onClose = useCallback(() => selectEvent(null), [selectEvent]);

  // Escape key
  useEffect(() => {
    if (!event) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [event, onClose]);

  // Arrow keys for prev/next
  useEffect(() => {
    if (!event) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && prevEvent) selectEvent(prevEvent.id);
      if (e.key === 'ArrowRight' && nextEvent) selectEvent(nextEvent.id);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [event, prevEvent, nextEvent, selectEvent]);

  return (
    <AnimatePresence>
      {event && cat && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(5, 8, 18, 0.97)' }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Content */}
          <motion.div
            className="relative z-10 flex-1 overflow-y-auto"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Top bar: close + nav */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4"
              style={{
                background: 'linear-gradient(180deg, rgba(5, 8, 18, 0.95) 0%, rgba(5, 8, 18, 0.8) 70%, transparent 100%)',
              }}
            >
              <div className="flex items-center gap-3">
                {prevEvent && (
                  <button
                    onClick={() => selectEvent(prevEvent.id)}
                    className="flex items-center gap-1.5 text-[12px] text-[#6b7a94] hover:text-[#9ba8c2] transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span className="hidden sm:inline">{prevEvent.title}</span>
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X size={18} className="text-[#6b7a94]" />
              </button>
              <div className="flex items-center gap-3">
                {nextEvent && (
                  <button
                    onClick={() => selectEvent(nextEvent.id)}
                    className="flex items-center gap-1.5 text-[12px] text-[#6b7a94] hover:text-[#9ba8c2] transition-colors cursor-pointer"
                  >
                    <span className="hidden sm:inline">{nextEvent.title}</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Main content — centered column */}
            <div className="max-w-[720px] mx-auto px-6 pb-20">

              {/* ── Hero ── */}
              <div className="mb-10 mt-4">
                {/* Category + Year */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: cat.color }}
                  />
                  <span className="text-[11px] font-medium tracking-wider uppercase" style={{ color: cat.color }}>
                    {cat.label}
                  </span>
                  <span className="text-[11px] text-[#3d4f6a]">·</span>
                  <span className="text-[11px] text-[#5a6d8a]">
                    {formatYear(event.year)}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-[#e8ecf2] mb-3">
                  {event.title}
                </h1>

                {/* Era + Location subtitle */}
                <div className="flex items-center gap-4 text-[13px] text-[#5a6d8a]">
                  {era && <span>{era.name}</span>}
                  {event.locationName && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {event.locationName}
                      </span>
                    </>
                  )}
                </div>

                {/* Hero media (when available) */}
                {event.imageUrl && (
                  <div className="mt-6 rounded-xl overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-auto object-cover"
                      style={{ maxHeight: '400px' }}
                    />
                  </div>
                )}

                {/* Video embed (when available) */}
                {event.videoUrl && (
                  <div className="mt-6 rounded-xl overflow-hidden aspect-video">
                    <iframe
                      src={event.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`Video: ${event.title}`}
                    />
                  </div>
                )}
              </div>

              {/* ── Accent divider ── */}
              <div className="h-px mb-8" style={{ background: `linear-gradient(90deg, ${cat.color}40, transparent)` }} />

              {/* ── Key Facts ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
                <FactCard
                  icon={<Calendar size={14} />}
                  label="Date"
                  value={event.endYear ? `${formatYear(event.year)} — ${formatYear(event.endYear)}` : formatYear(event.year)}
                />
                {event.locationName && (
                  <FactCard
                    icon={<MapPin size={14} />}
                    label="Location"
                    value={event.locationName}
                  />
                )}
                {era && (
                  <FactCard
                    icon={<Clock size={14} />}
                    label="Era"
                    value={era.name}
                  />
                )}
                {event.endYear && (
                  <FactCard
                    icon={<Clock size={14} />}
                    label="Duration"
                    value={`${Math.abs(event.endYear - event.year)} years`}
                  />
                )}
              </div>

              {/* ── Overview ── */}
              <div className="mb-10">
                <SectionHeading>Overview</SectionHeading>
                <p className="text-[15px] text-[#9ba8c2] leading-[1.8]">
                  {event.description}
                </p>
              </div>

              {/* ── Did You Know? (when impactText exists) ── */}
              {event.impactText && (
                <div
                  className="mb-10 rounded-xl p-5"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${cat.color}20`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb size={15} style={{ color: cat.color }} />
                    <span className="text-[12px] font-semibold tracking-wide uppercase" style={{ color: cat.color }}>
                      Did you know?
                    </span>
                  </div>
                  <p className="text-[14px] text-[#b0bbd0] leading-[1.7]">
                    {event.impactText}
                  </p>
                </div>
              )}

              {/* ── Image Gallery (when images exist) ── */}
              {event.images && event.images.length > 0 && (
                <div className="mb-10">
                  <SectionHeading>Gallery</SectionHeading>
                  <div className="grid grid-cols-2 gap-3">
                    {event.images.map((img, i) => (
                      <div key={i} className="rounded-lg overflow-hidden">
                        <img src={img} alt={`${event.title} ${i + 1}`} className="w-full h-40 object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Sources (when they exist) ── */}
              {event.sources && event.sources.length > 0 && (
                <div className="mb-10">
                  <SectionHeading>Sources</SectionHeading>
                  <ul className="space-y-2">
                    {event.sources.map((src, i) => (
                      <li key={i}>
                        <a
                          href={src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[13px] text-[#5a8fa5] hover:text-[#7bb0c4] transition-colors"
                        >
                          <ExternalLink size={12} />
                          {src}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ── Related Events ── */}
              {relatedEvents.length > 0 && (
                <div className="mb-10">
                  <SectionHeading>Related Events</SectionHeading>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {relatedEvents.map(re => {
                      const rc = CATEGORY_META[re.category];
                      return (
                        <button
                          key={re.id}
                          onClick={() => selectEvent(re.id)}
                          className="flex items-start gap-3 p-4 rounded-xl text-left cursor-pointer transition-colors hover:bg-white/[0.04]"
                          style={{ border: '1px solid rgba(255, 255, 255, 0.05)' }}
                        >
                          <span
                            className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                            style={{ background: rc?.color ?? '#7a869a' }}
                          />
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-[#c8ced8] truncate">{re.title}</p>
                            <p className="text-[11px] text-[#5a6d8a] mt-0.5">
                              {formatYear(re.year)}
                              {re.locationName && ` · ${re.locationName}`}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Small helper components ────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold tracking-wider uppercase text-[#4d5e78] mb-4">
      {children}
    </h3>
  );
}

function FactCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="flex items-center gap-1.5 text-[#4d5e78] mb-1.5">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-[13px] text-[#9ba8c2] font-medium">{value}</p>
    </div>
  );
}
