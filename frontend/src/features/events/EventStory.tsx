import { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform, useMotionValueEvent, useInView } from 'framer-motion';
import {
  X, MapPin, Calendar, Clock, ChevronLeft, ChevronRight,
  Lightbulb, ExternalLink, Play, Image as ImageIcon, Globe,
} from 'lucide-react';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { formatYear, formatYearRange } from '@/shared/utils/format';
import { ERAS } from '@/shared/utils/constants';
import type { HistoricalEvent } from '@/shared/types/events';

// ── Category visuals ──
const CATEGORY_META: Record<string, { color: string; label: string; gradient: string }> = {
  war:          { color: '#b85454', label: 'War & Conflict',  gradient: 'linear-gradient(135deg, #2a1418 0%, #1a0c10 40%, #0a1020 100%)' },
  discovery:    { color: '#5a8fa5', label: 'Discovery',       gradient: 'linear-gradient(135deg, #0c1e2a 0%, #0a1828 40%, #0a1020 100%)' },
  cultural:     { color: '#c49a44', label: 'Cultural',        gradient: 'linear-gradient(135deg, #2a2010 0%, #1a1608 40%, #0a1020 100%)' },
  political:    { color: '#8b80b0', label: 'Political',       gradient: 'linear-gradient(135deg, #1a1628 0%, #120e20 40%, #0a1020 100%)' },
  construction: { color: '#6d9476', label: 'Construction',    gradient: 'linear-gradient(135deg, #0c201a 0%, #0a1a14 40%, #0a1020 100%)' },
  natural:      { color: '#b87a60', label: 'Natural Event',   gradient: 'linear-gradient(135deg, #2a1a10 0%, #1a1008 40%, #0a1020 100%)' },
};

const EVENT_ICONS: Record<string, string> = {
  'great-pyramid': '△', 'code-hammurabi': '📜', 'trojan-war': '⚔️',
  'founding-rome': '🐺', 'democracy-athens': '🏛️', 'roman-forum': '🎭',
  'alexander-empire': '🦅', 'great-wall-begin': '🧱', 'julius-caesar': '🗡️',
  'colosseum': '🏟️', 'fall-of-rome': '💀', 'hagia-sophia': '🕌',
  'viking-expansion': '🪓', 'genghis-khan': '🏹', 'black-death': '☠️',
  'gutenberg-press': '📖', 'columbus-americas': '⛵', 'manhattan-purchase': '📋',
  'french-revolution': '⚜️', 'steam-locomotive': '🚂', 'suez-canal': '🚢',
  'eiffel-tower': '🗼', 'ww1': '💣', 'ww2': '✈️',
  'moon-landing': '🚀', 'berlin-wall': '🔨', 'www-invention': '💻',
};

// ── Scroll-reveal wrapper ──
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function EventStory() {
  const selectedEventId = useEventsStore(s => s.selectedEventId);
  const events = useEventsStore(s => s.events);
  const selectEvent = useEventsStore(s => s.selectEvent);

  const event = events.find(e => e.id === selectedEventId);
  const era = event ? ERAS.find(e => e.id === event.eraId) : null;
  const cat = event ? CATEGORY_META[event.category] : null;
  const icon = event ? EVENT_ICONS[event.id] ?? '●' : '●';

  // Scroll container ref for progress tracking + parallax
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const [progress, setProgress] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', v => setProgress(v));

  // Parallax: hero icon moves slower than scroll
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [0.06, 0]);

  // Related events
  const relatedEvents = useMemo(() => {
    if (!event) return [];
    return events
      .filter(e => e.id !== event.id && (e.eraId === event.eraId || e.category === event.category))
      .sort((a, b) => Math.abs(a.year - event.year) - Math.abs(b.year - event.year))
      .slice(0, 4);
  }, [event, events]);

  // Era events for the interactive timeline
  const eraEvents = useMemo(() => {
    if (!event) return [];
    return events.filter(e => e.eraId === event.eraId).sort((a, b) => a.year - b.year);
  }, [event, events]);

  // Chronological nav
  const sorted = useMemo(() => [...events].sort((a, b) => a.year - b.year), [events]);
  const idx = event ? sorted.findIndex(e => e.id === event.id) : -1;
  const prev = idx > 0 ? sorted[idx - 1] ?? null : null;
  const next = idx < sorted.length - 1 ? sorted[idx + 1] ?? null : null;

  // Era timeline position
  const eraProgress = useMemo(() => {
    if (!event || !era) return 0.5;
    const span = era.endYear - era.startYear;
    if (span === 0) return 0.5;
    return Math.max(0, Math.min(1, (event.year - era.startYear) / span));
  }, [event, era]);

  const onClose = useCallback(() => selectEvent(null), [selectEvent]);

  // Keyboard
  useEffect(() => {
    if (!event) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && prev) selectEvent(prev.id);
      if (e.key === 'ArrowRight' && next) selectEvent(next.id);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [event, prev, next, selectEvent, onClose]);

  // Reset scroll on event change
  useEffect(() => {
    if (scrollRef.current && event) {
      scrollRef.current.scrollTop = 0;
    }
  }, [event?.id]);

  return (
    <AnimatePresence>
      {event && cat && era && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#050a14]" onClick={onClose} />

          {/* ── Reading Progress Bar ── */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-[2px] z-30 origin-left"
            style={{
              scaleX: progress,
              background: cat.color,
            }}
          />

          {/* Scrollable content */}
          <motion.div
            ref={scrollRef}
            className="absolute inset-0 overflow-y-auto overflow-x-hidden"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            {/* ═══════════════ HERO ═══════════════ */}
            <div
              className="relative min-h-[420px] sm:min-h-[500px] flex flex-col justify-end"
              style={{ background: cat.gradient }}
            >
              {/* Decorative grid */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
              }} />

              {/* Parallax floating icon */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
                style={{ y: heroY, opacity: heroOpacity }}
              >
                <span className="text-[140px] sm:text-[180px]">{icon}</span>
              </motion.div>

              {/* Top bar */}
              <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-5 py-4">
                <NavButton dir="left" event={prev} onSelect={selectEvent} />
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.1] transition-colors cursor-pointer backdrop-blur-sm"
                >
                  <X size={18} className="text-[#8b9dc3]" />
                </button>
                <NavButton dir="right" event={next} onSelect={selectEvent} />
              </div>

              {/* Hero content */}
              <motion.div
                className="relative z-10 max-w-[800px] mx-auto w-full px-6 pb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase"
                    style={{ background: cat.color + '20', color: cat.color, border: `1px solid ${cat.color}30` }}>
                    {cat.label}
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] text-[#e8ecf2] mb-4">
                  {event.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[#6b7a94]">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {event.endYear ? formatYearRange(event.year, event.endYear) : formatYear(event.year)}
                  </span>
                  {event.locationName && (
                    <span className="flex items-center gap-1.5"><MapPin size={13} />{event.locationName}</span>
                  )}
                  <span className="flex items-center gap-1.5"><Globe size={13} />{era.name}</span>
                </div>
              </motion.div>

              <div className="absolute bottom-0 inset-x-0 h-24" style={{ background: 'linear-gradient(transparent, #050a14)' }} />
            </div>

            {/* ═══════════════ BODY ═══════════════ */}
            <div className="max-w-[800px] mx-auto px-6 pb-24">

              {/* ── Interactive Era Timeline ── */}
              <Reveal>
                <div className="py-8">
                  <div className="flex items-center justify-between text-[10px] text-[#3d4f6a] uppercase tracking-wider mb-3">
                    <span>{formatYear(era.startYear)}</span>
                    <span className="text-[#5a6d8a]">{era.name}</span>
                    <span>{formatYear(era.endYear)}</span>
                  </div>
                  <div className="relative h-[3px] rounded-full bg-white/[0.06]">
                    {/* Fill up to current event */}
                    <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-500" style={{ width: `${eraProgress * 100}%`, background: cat.color + '40' }} />

                    {/* Clickable dots for all events in this era */}
                    {eraEvents.map(ee => {
                      const pos = (ee.year - era.startYear) / (era.endYear - era.startYear);
                      const isActive = ee.id === event.id;
                      return (
                        <button
                          key={ee.id}
                          onClick={() => selectEvent(ee.id)}
                          className="absolute top-1/2 -translate-y-1/2 group cursor-pointer"
                          style={{ left: `${Math.max(1, Math.min(99, pos * 100))}%` }}
                          title={`${ee.title} (${formatYear(ee.year)})`}
                        >
                          <span
                            className="block rounded-full transition-all duration-300"
                            style={{
                              width: isActive ? 14 : 8,
                              height: isActive ? 14 : 8,
                              background: isActive ? cat.color : '#3d4f6a',
                              border: isActive ? `2px solid #050a14` : 'none',
                              transform: 'translate(-50%, -50%)',
                              boxShadow: isActive ? `0 0 8px ${cat.color}60` : 'none',
                            }}
                          />
                          {/* Tooltip on hover */}
                          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-md text-[10px] bg-[#0c1425] text-[#8b9dc3] border border-white/[0.08] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {ee.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {/* Era event count */}
                  <p className="text-[10px] text-[#2a3448] mt-3">
                    {eraEvents.length} events in this era — click any dot to explore
                  </p>
                </div>
              </Reveal>

              {/* ── Media Hero ── */}
              <Reveal delay={0.05}>
                <div className="mb-10">
                  {event.imageUrl ? (
                    <div className="rounded-2xl overflow-hidden">
                      <img src={event.imageUrl} alt={event.title} className="w-full h-auto object-cover" style={{ maxHeight: '440px' }} />
                    </div>
                  ) : event.videoUrl ? (
                    <div className="rounded-2xl overflow-hidden aspect-video">
                      <iframe src={event.videoUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={event.title} />
                    </div>
                  ) : (
                    <div className="rounded-2xl overflow-hidden aspect-[21/9] flex items-center justify-center relative"
                      style={{ background: cat.gradient, border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="absolute inset-0 opacity-[0.04]" style={{
                        backgroundImage: `radial-gradient(circle at 30% 40%, ${cat.color}30 0%, transparent 50%), radial-gradient(circle at 70% 60%, ${cat.color}20 0%, transparent 50%)`,
                      }} />
                      <div className="text-center relative z-10">
                        <div className="flex items-center justify-center gap-4 mb-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <ImageIcon size={20} className="text-[#3d4f6a]" />
                          </div>
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <Play size={20} className="text-[#3d4f6a]" />
                          </div>
                        </div>
                        <p className="text-[11px] text-[#3d4f6a] tracking-wide">Media coming soon</p>
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>

              {/* ── Key Facts (animated counters) ── */}
              <Reveal delay={0.1}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12">
                  <FactCard icon={<Calendar size={14} />} label="Date"
                    value={event.endYear ? formatYearRange(event.year, event.endYear) : formatYear(event.year)} color={cat.color} />
                  {event.locationName && (
                    <FactCard icon={<MapPin size={14} />} label="Location" value={event.locationName} color={cat.color} />
                  )}
                  <FactCard icon={<Clock size={14} />} label="Era" value={era.name} color={cat.color} />
                </div>
              </Reveal>

              {/* ── Overview ── */}
              <Reveal>
                <section className="mb-12">
                  <SectionLabel>Overview</SectionLabel>
                  {event.description.split('\n\n').map((para, i) => (
                    <Reveal key={i} delay={i * 0.08}>
                      <p className="text-[15px] sm:text-[16px] text-[#9ba8c2] leading-[1.85] font-[350] mb-5">
                        {para}
                      </p>
                    </Reveal>
                  ))}
                </section>
              </Reveal>

              {/* ── Did You Know? ── */}
              {event.impactText && (
                <Reveal>
                  <section className="mb-12">
                    <motion.div
                      className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
                      style={{ background: 'rgba(255, 255, 255, 0.02)', border: `1px solid ${cat.color}18` }}
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <div className="absolute top-0 left-0 w-1 h-full rounded-full" style={{ background: cat.color }} />
                      <div className="pl-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb size={16} style={{ color: cat.color }} />
                          <span className="text-[12px] font-semibold tracking-wider uppercase" style={{ color: cat.color }}>
                            Did you know?
                          </span>
                        </div>
                        <p className="text-[15px] text-[#b0bbd0] leading-[1.75]">
                          {event.impactText}
                        </p>
                      </div>
                    </motion.div>
                  </section>
                </Reveal>
              )}

              {/* ── Dive Deeper ── */}
              <Reveal>
                <section className="mb-12">
                  <SectionLabel>Dive Deeper</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Wikipedia link */}
                    <motion.a
                      href={`https://en.wikipedia.org/wiki/${encodeURIComponent(event.title.replace(/ /g, '_'))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-5 rounded-xl cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                      whileHover={{ borderColor: `${cat.color}30`, backgroundColor: 'rgba(255,255,255,0.03)', x: 4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <span className="text-lg">📚</span>
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[#9ba8c2]">Read full article</p>
                        <p className="text-[11px] text-[#3d4f6a]">Wikipedia</p>
                      </div>
                      <ExternalLink size={14} className="text-[#3d4f6a] ml-auto shrink-0" />
                    </motion.a>

                    {/* Google search */}
                    <motion.a
                      href={`https://www.google.com/search?q=${encodeURIComponent(event.title + ' history')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-5 rounded-xl cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                      whileHover={{ borderColor: `${cat.color}30`, backgroundColor: 'rgba(255,255,255,0.03)', x: 4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <span className="text-lg">🔍</span>
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[#9ba8c2]">Explore more</p>
                        <p className="text-[11px] text-[#3d4f6a]">Search the web</p>
                      </div>
                      <ExternalLink size={14} className="text-[#3d4f6a] ml-auto shrink-0" />
                    </motion.a>
                  </div>
                </section>
              </Reveal>

              {/* ── Gallery ── */}
              <Reveal>
                <section className="mb-12">
                  <SectionLabel>Gallery</SectionLabel>
                  {event.images && event.images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {event.images.map((img, i) => (
                        <motion.div key={i} className="rounded-xl overflow-hidden aspect-[4/3] cursor-pointer"
                          whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                          <img src={img} alt={`${event.title} ${i + 1}`} className="w-full h-full object-cover" />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i}
                          className="aspect-[4/3] rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
                          whileHover={{ borderColor: `${cat.color}30`, background: `${cat.color}08` }}
                          transition={{ duration: 0.25 }}
                        >
                          <ImageIcon size={20} className="text-[#1e2738]" />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </section>
              </Reveal>

              {/* ── Video ── */}
              <Reveal>
                <section className="mb-12">
                  <SectionLabel>Video</SectionLabel>
                  {event.videoUrl ? (
                    <div className="rounded-2xl overflow-hidden aspect-video">
                      <iframe src={event.videoUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={event.title} />
                    </div>
                  ) : (
                    <motion.div
                      className="aspect-video rounded-2xl flex flex-col items-center justify-center gap-3 cursor-default relative overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
                      whileHover={{ borderColor: `${cat.color}30` }}
                      transition={{ duration: 0.25 }}
                    >
                      <motion.div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.04)' }}
                        whileHover={{ scale: 1.1, background: `${cat.color}15` }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      >
                        <Play size={28} className="text-[#2a3448] ml-1" />
                      </motion.div>
                      <p className="text-[12px] text-[#2a3448]">Video content coming soon</p>
                    </motion.div>
                  )}
                </section>
              </Reveal>

              {/* ── Sources ── */}
              {event.sources && event.sources.length > 0 && (
                <Reveal>
                  <section className="mb-12">
                    <SectionLabel>Sources</SectionLabel>
                    <div className="space-y-2">
                      {event.sources.map((src, i) => (
                        <motion.a key={i} href={src} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2.5 p-3 rounded-lg text-[13px] text-[#5a8fa5]"
                          style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                          whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: `${cat.color}20`, x: 4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ExternalLink size={13} />
                          <span className="truncate">{src}</span>
                        </motion.a>
                      ))}
                    </div>
                  </section>
                </Reveal>
              )}

              {/* ── Related Events ── */}
              {relatedEvents.length > 0 && (
                <Reveal>
                  <section className="mb-12">
                    <SectionLabel>Related Events</SectionLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {relatedEvents.map((re, i) => (
                        <Reveal key={re.id} delay={i * 0.06}>
                          <RelatedCard event={re} onSelect={selectEvent} />
                        </Reveal>
                      ))}
                    </div>
                  </section>
                </Reveal>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function NavButton({ dir, event, onSelect }: { dir: 'left' | 'right'; event: HistoricalEvent | null; onSelect: (id: string) => void }) {
  if (!event) return <div className="w-10" />;
  return (
    <motion.button
      onClick={() => onSelect(event.id)}
      className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-sm transition-colors cursor-pointer max-w-[200px]"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
    >
      {dir === 'left' && <ChevronLeft size={14} className="text-[#6b7a94] shrink-0" />}
      <span className="text-[11px] text-[#6b7a94] truncate">{event.title}</span>
      {dir === 'right' && <ChevronRight size={14} className="text-[#6b7a94] shrink-0" />}
    </motion.button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#3d4f6a] mb-5">
      {children}
    </h3>
  );
}

function FactCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <motion.div
      className="rounded-xl p-4"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      whileHover={{ borderColor: `${color}25`, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span style={{ color: color + '80' }}>{icon}</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#3d4f6a]">{label}</span>
      </div>
      <p className="text-[14px] text-[#b0bbd0] font-medium">{value}</p>
    </motion.div>
  );
}

function RelatedCard({ event, onSelect }: { event: HistoricalEvent; onSelect: (id: string) => void }) {
  const cat = CATEGORY_META[event.category];
  const icon = EVENT_ICONS[event.id] ?? '●';
  return (
    <motion.button
      onClick={() => onSelect(event.id)}
      className="flex items-center gap-4 p-4 rounded-xl text-left cursor-pointer group"
      style={{ border: '1px solid rgba(255,255,255,0.05)' }}
      whileHover={{ borderColor: `${cat?.color ?? '#7a869a'}25`, backgroundColor: 'rgba(255,255,255,0.02)', x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <span className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg shrink-0"
        style={{ background: (cat?.color ?? '#7a869a') + '12' }}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-[#9ba8c2] group-hover:text-[#c8ced8] transition-colors truncate">{event.title}</p>
        <p className="text-[11px] text-[#3d4f6a] mt-0.5">
          {formatYear(event.year)}
          {event.locationName && ` · ${event.locationName}`}
        </p>
      </div>
      <ChevronRight size={14} className="text-[#2a3448] group-hover:text-[#3d4f6a] transition-colors shrink-0" />
    </motion.button>
  );
}
