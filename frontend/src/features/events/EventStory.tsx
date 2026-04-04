import { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform, useMotionValueEvent, useInView } from 'framer-motion';
import {
  X, MapPin, Calendar, Clock, ChevronLeft, ChevronRight,
  Lightbulb, ExternalLink, Play, Image as ImageIcon, Globe,
  Share2, ArrowUp,
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
  'colosseum': '🏟️', 'fall-of-rome': '💀', 'hagia-sophia': '��',
  'viking-expansion': '🪓', 'genghis-khan': '🏹', 'black-death': '☠️',
  'gutenberg-press': '📖', 'columbus-americas': '⛵', 'manhattan-purchase': '📋',
  'french-revolution': '⚜️', 'steam-locomotive': '🚂', 'suez-canal': '🚢',
  'eiffel-tower': '🗼', 'ww1': '💣', 'ww2': '✈️',
  'moon-landing': '🚀', 'berlin-wall': '🔨', 'www-invention': '💻',
};

// Section IDs for side navigation
const SECTIONS = ['overview', 'impact', 'deeper', 'gallery', 'video', 'related'] as const;
const SECTION_LABELS: Record<string, string> = {
  overview: 'Overview', impact: 'Impact', deeper: 'Explore',
  gallery: 'Gallery', video: 'Video', related: 'Related',
};

// ── Scroll-reveal ──
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Animated counter ──
function AnimatedYear({ year }: { year: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(year > 0 ? 1 : year + 500);

  useEffect(() => {
    if (!inView) return;
    const start = year > 0 ? Math.max(1, year - 200) : year + 500;
    const end = year;
    const duration = 1200;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(Math.round(start + (end - start) * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, year]);

  const formatted = display < 0
    ? `${Math.abs(display).toLocaleString()} BCE`
    : `${display.toLocaleString()} CE`;

  return <span ref={ref}>{formatted}</span>;
}

export function EventStory() {
  const selectedEventId = useEventsStore(s => s.selectedEventId);
  const events = useEventsStore(s => s.events);
  const selectEvent = useEventsStore(s => s.selectEvent);

  const event = events.find(e => e.id === selectedEventId);
  const era = event ? ERAS.find(e => e.id === event.eraId) : null;
  const cat = event ? CATEGORY_META[event.category] : null;
  const icon = event ? EVENT_ICONS[event.id] ?? '●' : '●';

  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const [progress, setProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [copied, setCopied] = useState(false);

  useMotionValueEvent(scrollYProgress, 'change', v => {
    setProgress(v);
    setShowScrollTop(v > 0.15);
  });

  // Parallax
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, 100]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [0.06, 0]);

  // Parallax side elements — different layers at different speeds
  const sideLeftY1 = useTransform(scrollYProgress, [0, 1], [100, -300]);   // year — slow
  const sideLeftY2 = useTransform(scrollYProgress, [0, 1], [400, -100]);   // coordinates — medium
  const sideRightY1 = useTransform(scrollYProgress, [0, 1], [200, -250]);  // era label — slow
  const sideRightY2 = useTransform(scrollYProgress, [0, 1], [500, -50]);   // category — medium
  const sideOpacity1 = useTransform(scrollYProgress, [0, 0.05, 0.15, 0.8, 0.95], [0, 0, 1, 1, 0]);
  const sideOpacity2 = useTransform(scrollYProgress, [0, 0.1, 0.25, 0.75, 0.9], [0, 0, 1, 1, 0]);

  // Section refs for side nav tracking
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const setSectionRef = useCallback((id: string) => (el: HTMLElement | null) => { sectionRefs.current[id] = el; }, []);

  // Track which section is in view
  useEffect(() => {
    if (!event) return;
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target.id) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { root: scrollRef.current, rootMargin: '-30% 0px -60% 0px' },
    );
    for (const el of Object.values(sectionRefs.current)) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [event?.id]);

  const relatedEvents = useMemo(() => {
    if (!event) return [];
    return events
      .filter(e => e.id !== event.id && (e.eraId === event.eraId || e.category === event.category))
      .sort((a, b) => Math.abs(a.year - event.year) - Math.abs(b.year - event.year))
      .slice(0, 4);
  }, [event, events]);

  const eraEvents = useMemo(() => {
    if (!event) return [];
    return events.filter(e => e.eraId === event.eraId).sort((a, b) => a.year - b.year);
  }, [event, events]);

  const sorted = useMemo(() => [...events].sort((a, b) => a.year - b.year), [events]);
  const idx = event ? sorted.findIndex(e => e.id === event.id) : -1;
  const prev = idx > 0 ? sorted[idx - 1] ?? null : null;
  const next = idx < sorted.length - 1 ? sorted[idx + 1] ?? null : null;

  const eraProgress = useMemo(() => {
    if (!event || !era) return 0.5;
    const span = era.endYear - era.startYear;
    return span === 0 ? 0.5 : Math.max(0, Math.min(1, (event.year - era.startYear) / span));
  }, [event, era]);

  // Extract a pull-quote from the description (first sentence of second paragraph)
  const pullQuote = useMemo(() => {
    if (!event) return null;
    const paragraphs = event.description.split('\n\n');
    if (paragraphs.length < 2) return null;
    const secondPara = paragraphs[1] ?? '';
    const firstSentence = secondPara.split(/(?<=[.!?])\s/)[0];
    return firstSentence && firstSentence.length > 40 && firstSentence.length < 250 ? firstSentence : null;
  }, [event]);

  const onClose = useCallback(() => selectEvent(null), [selectEvent]);
  const scrollToTop = useCallback(() => { scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
  const scrollToSection = useCallback((id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);
  const onShare = useCallback(async () => {
    if (!event) return;
    const text = `${event.title} (${formatYear(event.year)}) — Time Scroll`;
    if (navigator.share) {
      await navigator.share({ title: event.title, text });
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [event]);

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

  useEffect(() => {
    if (scrollRef.current && event) scrollRef.current.scrollTop = 0;
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
          <div className="absolute inset-0 bg-[#08080c]" onClick={onClose} />

          {/* ── Progress Bar (fixed to viewport top) ── */}
          <div className="absolute top-0 left-0 right-0 h-[3px] z-40 overflow-hidden">
            <motion.div
              className="h-full origin-left"
              style={{
                scaleX: progress,
                background: `linear-gradient(90deg, ${cat.color}, ${cat.color}80)`,
                boxShadow: `0 0 8px ${cat.color}40`,
              }}
            />
          </div>

          {/* ── Side Section Nav (desktop only) ── */}
          <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-3">
            {SECTIONS.map(s => (
              <button
                key={s}
                onClick={() => scrollToSection(s)}
                className="group flex items-center gap-2 cursor-pointer"
                title={SECTION_LABELS[s]}
              >
                <span className="text-[9px] font-medium tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity text-[#55556a] translate-x-1 group-hover:translate-x-0">
                  {SECTION_LABELS[s]}
                </span>
                <span
                  className="block rounded-full transition-all duration-300"
                  style={{
                    width: activeSection === s ? 10 : 5,
                    height: activeSection === s ? 10 : 5,
                    background: activeSection === s ? cat.color : '#28282f',
                    boxShadow: activeSection === s ? `0 0 6px ${cat.color}50` : 'none',
                  }}
                />
              </button>
            ))}
          </div>

          {/* ── Scroll-to-top ── */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                onClick={scrollToTop}
                className="fixed bottom-8 right-8 z-40 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowUp size={16} className="text-[#8a8a9a]" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* ── Scrollable content ── */}
          <motion.div
            ref={scrollRef}
            className="absolute inset-0 overflow-y-auto overflow-x-hidden"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            {/* ═══ PARALLAX SIDE ELEMENTS (desktop only) ═══ */}
            <div className="hidden xl:block pointer-events-none select-none" aria-hidden="true">
              {/* Left: Large year number */}
              <motion.div
                className="absolute left-[2%] top-[500px] z-[1]"
                style={{ y: sideLeftY1, opacity: sideOpacity1 }}
              >
                <span className="text-[160px] font-extralight leading-none tracking-tight"
                  style={{ color: `${cat.color}12`, WebkitTextStroke: `1px ${cat.color}30` }}>
                  {Math.abs(event.year)}
                </span>
              </motion.div>

              {/* Left: Coordinates */}
              <motion.div
                className="absolute left-[3%] top-[1000px] z-[1]"
                style={{ y: sideLeftY2, opacity: sideOpacity2 }}
              >
                <div className="font-mono text-[12px] leading-relaxed" style={{ color: '#35353f' }}>
                  <div>{event.latitude.toFixed(4)}°N</div>
                  <div>{event.longitude.toFixed(4)}°E</div>
                  <div className="mt-2 w-8 h-px" style={{ background: `${cat.color}25` }} />
                </div>
              </motion.div>

              {/* Right: Era name (vertical) */}
              <motion.div
                className="absolute right-[2%] top-[600px] z-[1]"
                style={{ y: sideRightY1, opacity: sideOpacity1, writingMode: 'vertical-rl' }}
              >
                <span className="text-[16px] font-light tracking-[0.35em] uppercase"
                  style={{ color: '#2a2a35' }}>
                  {era.name}
                </span>
              </motion.div>

              {/* Right: Category icon large */}
              <motion.div
                className="absolute right-[4%] top-[1200px] z-[1]"
                style={{ y: sideRightY2, opacity: sideOpacity2 }}
              >
                <span className="text-[100px]" style={{ opacity: 0.08 }}>{icon}</span>
              </motion.div>

              {/* Left: Vertical decorative line */}
              <motion.div
                className="absolute left-[5%] top-[1500px] z-[1]"
                style={{ y: sideLeftY1, opacity: sideOpacity2 }}
              >
                <div className="w-px h-[250px]" style={{ background: `linear-gradient(180deg, transparent, ${cat.color}20, transparent)` }} />
              </motion.div>

              {/* Right: Vertical decorative line */}
              <motion.div
                className="absolute right-[5%] top-[850px] z-[1]"
                style={{ y: sideRightY1, opacity: sideOpacity1 }}
              >
                <div className="w-px h-[200px]" style={{ background: `linear-gradient(180deg, transparent, ${cat.color}20, transparent)` }} />
              </motion.div>

              {/* Left: Location name */}
              {event.locationName && (
                <motion.div
                  className="absolute left-[3%] top-[1800px] z-[1]"
                  style={{ y: sideLeftY2, opacity: sideOpacity1 }}
                >
                  <span className="text-[13px] font-light tracking-[0.15em] uppercase" style={{ color: '#2a2a35' }}>
                    {event.locationName}
                  </span>
                </motion.div>
              )}
            </div>

            {/* ═══ HERO ═══ */}
            <div className="relative min-h-[460px] sm:min-h-[520px] flex flex-col justify-end" style={{ background: cat.gradient }}>
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
              }} />

              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
                style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
              >
                <span className="text-[140px] sm:text-[200px]">{icon}</span>
              </motion.div>

              {/* Top bar */}
              <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-5 py-4">
                <NavButton dir="left" event={prev} onSelect={selectEvent} />
                <div className="flex items-center gap-2">
                  <motion.button onClick={onShare}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.1] transition-colors cursor-pointer backdrop-blur-sm"
                    whileTap={{ scale: 0.9 }}>
                    <Share2 size={15} className="text-[#606070]" />
                  </motion.button>
                  <button onClick={onClose}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.1] transition-colors cursor-pointer backdrop-blur-sm">
                    <X size={18} className="text-[#8a8a9a]" />
                  </button>
                </div>
                <NavButton dir="right" event={next} onSelect={selectEvent} />
              </div>

              {/* Copied toast */}
              <AnimatePresence>
                {copied && (
                  <motion.div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full text-[11px] text-[#8a8a9a]"
                    style={{ background: 'rgba(10,16,28,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    Copied to clipboard
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hero content */}
              <motion.div className="relative z-10 max-w-[800px] mx-auto w-full px-6 sm:px-10 pb-12"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase"
                    style={{ background: cat.color + '20', color: cat.color, border: `1px solid ${cat.color}30` }}>
                    {cat.label}
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold leading-[1.08] text-[#e0e0e6] mb-5">
                  {event.title}
                </h1>

                {/* Animated year display */}
                <div className="text-[28px] sm:text-[36px] font-light text-[#454555] mb-4 tabular-nums">
                  <AnimatedYear year={event.year} />
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[#55556a]">
                  {event.locationName && (
                    <span className="flex items-center gap-1.5"><MapPin size={13} />{event.locationName}</span>
                  )}
                  <span className="flex items-center gap-1.5"><Globe size={13} />{era.name}</span>
                  {event.endYear && (
                    <span className="flex items-center gap-1.5"><Clock size={13} />{Math.abs(event.endYear - event.year)} years</span>
                  )}
                </div>
              </motion.div>

              <div className="absolute bottom-0 inset-x-0 h-32" style={{ background: 'linear-gradient(transparent, #08080c)' }} />
            </div>

            {/* ═══ BODY ═══ */}
            <div className="max-w-[800px] mx-auto px-6 sm:px-10 pb-28">

              {/* Timeline */}
              <Reveal>
                <div className="py-10">
                  <div className="flex items-center justify-between text-[10px] text-[#3a3a4a] uppercase tracking-wider mb-3">
                    <span>{formatYear(era.startYear)}</span>
                    <span className="text-[#55556a]">{era.name}</span>
                    <span>{formatYear(era.endYear)}</span>
                  </div>
                  <div className="relative h-[3px] rounded-full bg-white/[0.06]">
                    <motion.div className="absolute top-0 left-0 h-full rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${eraProgress * 100}%` }}
                      transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      style={{ background: cat.color + '40' }} />
                    {eraEvents.map(ee => {
                      const pos = (ee.year - era.startYear) / (era.endYear - era.startYear);
                      const isActive = ee.id === event.id;
                      return (
                        <button key={ee.id} onClick={() => selectEvent(ee.id)}
                          className="absolute top-1/2 group cursor-pointer"
                          style={{
                            left: `${Math.max(1, Math.min(99, pos * 100))}%`,
                            transform: `translate(-50%, -50%)`,
                            width: 24, height: 24,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                          <span className="block rounded-full transition-all duration-300"
                            style={{
                              width: isActive ? 12 : 6, height: isActive ? 12 : 6,
                              background: isActive ? cat.color : '#3a3a4a',
                              border: isActive ? '2px solid #08080c' : 'none',
                              boxShadow: isActive ? `0 0 10px ${cat.color}60` : 'none',
                            }} />
                          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-md text-[10px] bg-[#0e0e14] text-[#8a8a9a] border border-white/[0.08] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {ee.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-[#28282f] mt-3">{eraEvents.length} events in this era</p>
                </div>
              </Reveal>

              {/* Media */}
              <Reveal delay={0.05}>
                <div className="mb-16">
                  {event.imageUrl ? (
                    <div className="rounded-2xl overflow-hidden"><img src={event.imageUrl} alt={event.title} className="w-full h-auto object-cover" style={{ maxHeight: '440px' }} /></div>
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
                            <ImageIcon size={20} className="text-[#3a3a4a]" />
                          </div>
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <Play size={20} className="text-[#3a3a4a]" />
                          </div>
                        </div>
                        <p className="text-[11px] text-[#3a3a4a]">Media coming soon</p>
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>

              {/* Key Facts */}
              <Reveal delay={0.1}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-16">
                  <FactCard icon={<Calendar size={14} />} label="Date"
                    value={event.endYear ? formatYearRange(event.year, event.endYear) : formatYear(event.year)} color={cat.color} />
                  {event.locationName && <FactCard icon={<MapPin size={14} />} label="Location" value={event.locationName} color={cat.color} />}
                  <FactCard icon={<Clock size={14} />} label="Era" value={era.name} color={cat.color} />
                </div>
              </Reveal>

              {/* Overview */}
              <section id="overview" ref={setSectionRef('overview')} className="mb-20">
                <Reveal>
                  <SectionLabel>Overview</SectionLabel>
                </Reveal>
                {event.description.split('\n\n').map((para, i) => (
                  <Reveal key={i} delay={i * 0.06}>
                    <p className="text-[15px] sm:text-[16px] text-[#95959f] leading-[1.9] mb-6">{para}</p>
                    {/* Pull-quote after first paragraph */}
                    {i === 0 && pullQuote && (
                      <Reveal delay={0.1}>
                        <blockquote className="my-10 py-6 px-8 border-l-[3px] rounded-r-xl" style={{ borderColor: cat.color, background: `${cat.color}06` }}>
                          <p className="text-[18px] sm:text-[20px] text-[#a8a8b4] leading-[1.7] italic font-light">
                            "{pullQuote}"
                          </p>
                        </blockquote>
                      </Reveal>
                    )}
                  </Reveal>
                ))}
              </section>

              {/* Did You Know */}
              {event.impactText && (
                <section id="impact" ref={setSectionRef('impact')} className="mb-20">
                  <Reveal>
                    <motion.div className="rounded-2xl p-7 sm:p-9 relative overflow-hidden"
                      style={{ background: 'rgba(255, 255, 255, 0.02)', border: `1px solid ${cat.color}18` }}
                      whileHover={{ scale: 1.008 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                      <div className="absolute top-0 left-0 w-1 h-full rounded-full" style={{ background: cat.color }} />
                      <div className="pl-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Lightbulb size={16} style={{ color: cat.color }} />
                          <span className="text-[12px] font-semibold tracking-wider uppercase" style={{ color: cat.color }}>Did you know?</span>
                        </div>
                        <p className="text-[16px] text-[#a8a8b4] leading-[1.8]">{event.impactText}</p>
                      </div>
                    </motion.div>
                  </Reveal>
                </section>
              )}

              {/* Dive Deeper */}
              <section id="deeper" ref={setSectionRef('deeper')} className="mb-20">
                <Reveal>
                  <SectionLabel>Dive Deeper</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DiveLink emoji="📚" title="Read full article" subtitle="Wikipedia"
                      href={`https://en.wikipedia.org/wiki/${encodeURIComponent(event.title.replace(/ /g, '_'))}`} color={cat.color} />
                    <DiveLink emoji="🔍" title="Explore more" subtitle="Search the web"
                      href={`https://www.google.com/search?q=${encodeURIComponent(event.title + ' history')}`} color={cat.color} />
                  </div>
                </Reveal>
              </section>

              {/* Gallery */}
              <section id="gallery" ref={setSectionRef('gallery')} className="mb-20">
                <Reveal>
                  <SectionLabel>Gallery</SectionLabel>
                  {event.images && event.images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {event.images.map((img, i) => (
                        <motion.div key={i} className="rounded-xl overflow-hidden aspect-[4/3] cursor-pointer"
                          whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                          <img src={img} alt={`${event.title} ${i + 1}`} className="w-full h-full object-cover" />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="aspect-[4/3] rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
                          whileHover={{ borderColor: `${cat.color}30`, background: `${cat.color}06` }}>
                          <ImageIcon size={20} className="text-[#1a1a22]" />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Reveal>
              </section>

              {/* Video */}
              <section id="video" ref={setSectionRef('video')} className="mb-20">
                <Reveal>
                  <SectionLabel>Video</SectionLabel>
                  {event.videoUrl ? (
                    <div className="rounded-2xl overflow-hidden aspect-video">
                      <iframe src={event.videoUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={event.title} />
                    </div>
                  ) : (
                    <motion.div className="aspect-video rounded-2xl flex flex-col items-center justify-center gap-4"
                      style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}
                      whileHover={{ borderColor: `${cat.color}30` }}>
                      <motion.div className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.04)' }}
                        whileHover={{ scale: 1.15, background: `${cat.color}15` }}>
                        <Play size={28} className="text-[#28282f] ml-1" />
                      </motion.div>
                      <p className="text-[12px] text-[#28282f]">Video content coming soon</p>
                    </motion.div>
                  )}
                </Reveal>
              </section>

              {/* Sources */}
              {event.sources && event.sources.length > 0 && (
                <Reveal>
                  <section className="mb-20">
                    <SectionLabel>Sources</SectionLabel>
                    <div className="space-y-3">
                      {event.sources.map((src, i) => (
                        <motion.a key={i} href={src} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2.5 p-4 rounded-xl text-[13px] text-[#5a8fa5]"
                          style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                          whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: `${cat.color}20`, x: 4 }}>
                          <ExternalLink size={13} /><span className="truncate">{src}</span>
                        </motion.a>
                      ))}
                    </div>
                  </section>
                </Reveal>
              )}

              {/* Related */}
              {relatedEvents.length > 0 && (
                <section id="related" ref={setSectionRef('related')} className="mb-16">
                  <Reveal>
                    <SectionLabel>Related Events</SectionLabel>
                  </Reveal>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {relatedEvents.map((re, i) => (
                      <Reveal key={re.id} delay={i * 0.06}>
                        <RelatedCard event={re} onSelect={selectEvent} />
                      </Reveal>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Sub-components ──

function NavButton({ dir, event, onSelect }: { dir: 'left' | 'right'; event: HistoricalEvent | null; onSelect: (id: string) => void }) {
  if (!event) return <div className="w-10" />;
  return (
    <motion.button onClick={() => onSelect(event.id)}
      className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-sm transition-colors cursor-pointer max-w-[200px]"
      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
      {dir === 'left' && <ChevronLeft size={14} className="text-[#606070] shrink-0" />}
      <span className="text-[11px] text-[#606070] truncate">{event.title}</span>
      {dir === 'right' && <ChevronRight size={14} className="text-[#606070] shrink-0" />}
    </motion.button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#3a3a4a] mb-6">{children}</h3>;
}

function FactCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <motion.div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      whileHover={{ borderColor: `${color}25`, y: -3 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
      <div className="flex items-center gap-1.5 mb-2">
        <span style={{ color: color + '80' }}>{icon}</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#3a3a4a]">{label}</span>
      </div>
      <p className="text-[14px] text-[#a8a8b4] font-medium">{value}</p>
    </motion.div>
  );
}

function DiveLink({ emoji, title, subtitle, href, color }: { emoji: string; title: string; subtitle: string; href: string; color: string }) {
  return (
    <motion.a href={href} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-4 p-5 rounded-xl cursor-pointer"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      whileHover={{ borderColor: `${color}30`, backgroundColor: 'rgba(255,255,255,0.03)', x: 4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <span className="text-lg">{emoji}</span>
      </div>
      <div>
        <p className="text-[13px] font-medium text-[#95959f]">{title}</p>
        <p className="text-[11px] text-[#3a3a4a]">{subtitle}</p>
      </div>
      <ExternalLink size={14} className="text-[#3a3a4a] ml-auto shrink-0" />
    </motion.a>
  );
}

function RelatedCard({ event, onSelect }: { event: HistoricalEvent; onSelect: (id: string) => void }) {
  const cat = CATEGORY_META[event.category];
  const icon = EVENT_ICONS[event.id] ?? '●';
  return (
    <motion.button onClick={() => onSelect(event.id)}
      className="flex items-center gap-4 p-5 rounded-xl text-left cursor-pointer group"
      style={{ border: '1px solid rgba(255,255,255,0.05)' }}
      whileHover={{ borderColor: `${cat?.color ?? '#7a869a'}25`, backgroundColor: 'rgba(255,255,255,0.02)', x: 4 }}
      whileTap={{ scale: 0.98 }}>
      <span className="text-2xl w-11 h-11 flex items-center justify-center rounded-lg shrink-0"
        style={{ background: (cat?.color ?? '#7a869a') + '12' }}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-[#95959f] group-hover:text-[#c0c0c8] transition-colors truncate">{event.title}</p>
        <p className="text-[11px] text-[#3a3a4a] mt-1">
          {formatYear(event.year)}{event.locationName && ` · ${event.locationName}`}
        </p>
      </div>
      <ChevronRight size={14} className="text-[#28282f] group-hover:text-[#3a3a4a] transition-colors shrink-0" />
    </motion.button>
  );
}
