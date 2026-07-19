import { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { AnimatePresence, motion, useScroll, useTransform, useMotionValueEvent, useInView } from 'framer-motion';
import {
  X, MapPin, Calendar, Clock, ChevronLeft, ChevronRight,
  Lightbulb, ExternalLink, Play, Image as ImageIcon, Globe,
  Share2, ArrowUp, Heart, Maximize2,
} from 'lucide-react';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { useProgressStore } from '@/shared/stores/progressStore';
import { ACHIEVEMENTS } from '@/shared/stores/progressStore';
import { showAchievementToast } from '@/shared/components/AchievementToast';
import { formatYear, formatYearRange } from '@/shared/utils/format';
import { ERAS } from '@/shared/utils/constants';
import type { HistoricalEvent } from '@/shared/types/events';
import { EventQuiz } from './EventQuiz';
import { EventMapVisual } from './EventMapVisual';
import { getEventPlacements, getIllustrationUrl, getFloatClasses, getGalleryImages } from '@/shared/data/illustrationPlacements';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { useMonumentViewer } from '@/features/monuments/useMonumentViewer';

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
  // Ancient
  'great-pyramid': '△', 'indus-valley': '🏗️', 'code-hammurabi': '📜',
  'shang-oracle-bones': '🦴', 'phoenician-alphabet': '🔤', 'kingdom-of-kush': '👑',
  'trojan-war': '⚔️',
  // Classical
  'persian-empire-cyrus': '🦁', 'birth-of-buddhism': '🧘', 'battle-of-marathon': '🏃',
  'founding-rome': '🐺', 'democracy-athens': '🏛️', 'parthenon-construction': '🔱',
  'library-of-alexandria': '📚', 'roman-forum': '🎭', 'alexander-empire': '🦅',
  'great-wall-begin': '🧱', 'construction-of-petra': '🏜️', 'maurya-ashoka': '☸️',
  'rosetta-stone': '🪨', 'julius-caesar': '🗡️', 'silk-road': '🐫',
  'teotihuacan-founded': '🔺', 'colosseum': '🏟️', 'pompeii-destroyed': '🌋',
  'fall-of-rome': '💀',
  // Medieval
  'hagia-sophia': '🕌', 'house-of-wisdom': '📐', 'viking-expansion': '🪓',
  'song-dynasty-movable-type': '🖨️', 'battle-of-hastings': '🎯', 'first-crusade': '🛡️',
  'angkor-wat': '🕉️', 'genghis-khan': '🏹', 'magna-carta': '🏰',
  'mansa-musa': '💰', 'aztec-tenochtitlan': '🗿', 'black-death': '☠️',
  'hundred-years-war': '🏴', 'zheng-he-voyages': '🧭', 'machu-picchu': '⛰️',
  'fall-of-constantinople': '💥', 'gutenberg-press': '📖',
  // Renaissance & Exploration
  'spanish-inquisition': '⛪', 'columbus-americas': '⛵', 'reformation-luther': '📝',
  'copernicus-heliocentric': '☀️', 'edo-period-japan': '🏯', 'galileo-telescope': '🔭',
  'taj-mahal': '💎', 'manhattan-purchase': '📋', 'french-revolution': '⚜️',
  // Industrial Age
  'steam-locomotive': '🚂', 'emancipation-proclamation': '✊', 'origin-of-species': '🦎',
  'suez-canal': '🚢', 'meiji-restoration': '🎌', 'telephone-invention': '📞',
  'light-bulb': '💡', 'eiffel-tower': '🗼',
  // Modern Era
  'panama-canal': '⛴️', 'ww1': '💣', 'russian-revolution': '⚒️',
  'penicillin-discovery': '💊', 'ww2': '✈️', 'indian-independence': '🕊️',
  'chinese-revolution': '⭐', 'dna-structure': '🧬', 'cuban-missile-crisis': '☢️',
  'civil-rights-act': '⚖️', 'moon-landing': '🚀', 'chernobyl-disaster': '🏭',
  'berlin-wall': '🔨', 'mandela-freed': '🔓', 'www-invention': '💻',
  'human-genome-project': '🔬', 'fukushima-disaster': '🌊', 'mars-perseverance': '🛸',
};

// Section IDs for side navigation
const SECTIONS = ['overview', 'around-the-world', 'impact', 'deeper', 'gallery', 'video', 'related'] as const;
const SECTION_LABELS: Record<string, string> = {
  overview: 'Overview', 'around-the-world': 'World', impact: 'Impact', deeper: 'Explore',
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

  const format = (v: number) =>
    v < 0 ? `${Math.abs(v).toLocaleString()} BCE` : `${v.toLocaleString()} CE`;

  // Pure visual count-up: drive the DOM node directly instead of calling
  // setState ~72×/open. Also cancels the rAF on unmount.
  useEffect(() => {
    if (!inView) return;
    const start = year > 0 ? Math.max(1, year - 200) : year + 500;
    const end = year;
    const duration = 1200;
    const startTime = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      if (ref.current) ref.current.textContent = format(Math.round(start + (end - start) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, year]);

  return <span ref={ref}>{format(year > 0 ? 1 : year + 500)}</span>;
}

export function EventStory() {
  const selectedEventId = useEventsStore(s => s.selectedEventId);
  const events = useEventsStore(s => s.events);
  const selectEvent = useEventsStore(s => s.selectEvent);
  const openMonumentViewer = useMonumentViewer(s => s.open);
  const [, setSearchParams] = useSearchParams();

  const event = events.find(e => e.id === selectedEventId);
  const era = event ? ERAS.find(e => e.id === event.eraId) : null;
  const cat = event ? CATEGORY_META[event.category] : null;
  const icon = event ? EVENT_ICONS[event.id] ?? '●' : '●';
  const illustrations = event ? getEventPlacements(event.id) : null;
  const galleryImages = useMemo(() => event ? getGalleryImages(event.id) : [], [event?.id]);
  const favoriteEvents = useProgressStore(s => s.favoriteEvents);
  const toggleFavorite = useProgressStore(s => s.toggleFavorite);
  const eventNotes = useProgressStore(s => s.eventNotes);
  const setEventNote = useProgressStore(s => s.setEventNote);

  const isFavorited = event ? favoriteEvents.includes(event.id) : false;
  const currentNote = event ? (eventNotes[event.id] ?? '') : '';
  const [noteText, setNoteText] = useState(currentNote);
  const noteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync noteText when switching events
  useEffect(() => {
    setNoteText(currentNote);
  }, [currentNote, event?.id]);

  const handleNoteChange = useCallback((value: string) => {
    if (value.length > 500) return;
    setNoteText(value);
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    noteTimerRef.current = setTimeout(() => {
      if (event) setEventNote(event.id, value);
    }, 1000);
  }, [event, setEventNote]);

  const handleNoteBlur = useCallback(() => {
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    if (event) setEventNote(event.id, noteText);
  }, [event, noteText, setEventNote]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [copied, setCopied] = useState(false);
  // Hero/media <img> may point at a dead URL (data now allows null/dead
  // imageUrl) — track failure so a styled placeholder renders instead.
  const [mediaImgFailed, setMediaImgFailed] = useState(false);

  // Shared focus trap (Tab/Shift+Tab cycling + focus restore on close).
  useFocusTrap(dialogRef, Boolean(event));

  // setShowScrollTop only re-renders when the boolean actually flips; the
  // progress bar reads scrollYProgress directly (a MotionValue), so scrolling
  // no longer triggers a React render every tick.
  useMotionValueEvent(scrollYProgress, 'change', v => {
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

  // "Around the World" — events happening around the same time
  const contemporaryEvents = useMemo(() => {
    if (!event) return [];
    // Use wider window for ancient events (year < -500) since events are more spread out
    const range = event.year < -500 ? 200 : 100;
    return events
      .filter(e => e.id !== event.id && Math.abs(e.year - event.year) <= range)
      .sort((a, b) => Math.abs(a.year - event.year) - Math.abs(b.year - event.year))
      .slice(0, 4);
  }, [event, events]);

  // Sync URL search param with selected event
  useEffect(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (event) {
        next.set('event', event.id);
      } else {
        next.delete('event');
      }
      // Only update if actually changed to avoid unnecessary history entries
      if (prev.get('event') !== next.get('event')) {
        return next;
      }
      return prev;
    }, { replace: true });
  }, [event?.id, setSearchParams]);

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
    const url = `${window.location.origin}/explore?event=${event.id}`;
    const text = `${event.title} (${formatYear(event.year)}) — Time Machine`;
    if (navigator.share) {
      await navigator.share({ title: event.title, text, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [event]);

  // Focus management — move focus into dialog on open, restore on close
  useEffect(() => {
    if (!event) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Move focus to the close button once the dialog is mounted
    requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      previouslyFocused?.focus();
    };
  }, [event?.id]);

  // Keyboard: Escape / arrow navigation (Tab cycling handled by useFocusTrap)
  useEffect(() => {
    if (!event) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowLeft' && prev) { selectEvent(prev.id); return; }
      if (e.key === 'ArrowRight' && next) { selectEvent(next.id); return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [event, prev, next, selectEvent, onClose]);

  useEffect(() => {
    if (scrollRef.current && event) scrollRef.current.scrollTop = 0;
    setMediaImgFailed(false);
  }, [event?.id]);

  useEffect(() => {
    if (!event) return;
    const markEventViewed = useProgressStore.getState().markEventViewed;
    const prevUnlocked = useProgressStore.getState().unlockedAchievements;
    markEventViewed(event.id);
    const nowUnlocked = useProgressStore.getState().unlockedAchievements;
    const newIds = nowUnlocked.filter(id => !prevUnlocked.includes(id));
    for (const id of newIds) {
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) showAchievementToast(ach);
    }
  }, [event?.id]);

  return (
    <AnimatePresence>
      {event && cat && era && (
        <motion.div
          ref={dialogRef}
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label={event.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="absolute inset-0 bg-void" onClick={onClose} aria-hidden="true" />

          {/* ── Progress Bar (fixed to viewport top) ── */}
          <div className="absolute top-0 left-0 right-0 h-[3px] z-40 overflow-hidden">
            <motion.div
              className="h-full origin-left"
              style={{
                scaleX: scrollYProgress,
                background: `linear-gradient(90deg, ${cat.color}, ${cat.color}80)`,
                boxShadow: `0 0 8px ${cat.color}40`,
              }}
            />
          </div>

          {/* ── Side Section Nav (desktop only) ── */}
          <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-3" role="navigation" aria-label="Page sections">
            {SECTIONS.map(s => (
              <button
                key={s}
                onClick={() => scrollToSection(s)}
                className="group flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-void rounded-full"
                aria-label={`Scroll to ${SECTION_LABELS[s]} section`}
                aria-current={activeSection === s ? 'true' : undefined}
              >
                <span className="text-[9px] font-medium tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity text-text-muted translate-x-1 group-hover:translate-x-0">
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
                className="fixed bottom-8 right-8 z-40 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-void"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border-subtle)', backdropFilter: 'blur(12px)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.95 }}
                aria-label="Scroll to top"
              >
                <ArrowUp size={16} className="text-text-secondary" aria-hidden="true" />
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
                <div className="font-mono text-[12px] leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
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
                  style={{ color: '#28282f' }}>
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
                  <span className="text-[13px] font-light tracking-[0.15em] uppercase" style={{ color: '#28282f' }}>
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
                  <motion.button
                    onClick={() => event && toggleFavorite(event.id)}
                    className="w-11 h-11 rounded-full flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.1] transition-colors cursor-pointer backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-void"
                    whileTap={{ scale: 0.9 }}
                    aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}>
                    <Heart
                      size={15}
                      fill={isFavorited ? '#c49a44' : 'none'}
                      stroke={isFavorited ? '#c49a44' : 'var(--color-text-muted)'}
                      aria-hidden="true"
                    />
                  </motion.button>
                  <motion.button onClick={onShare}
                    className="w-11 h-11 rounded-full flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.1] transition-colors cursor-pointer backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-void"
                    whileTap={{ scale: 0.9 }}
                    aria-label={copied ? 'Copied to clipboard' : 'Share this event'}>
                    <Share2 size={15} className="text-text-muted" aria-hidden="true" />
                  </motion.button>
                  <button onClick={onClose}
                    ref={closeButtonRef}
                    className="w-11 h-11 rounded-full flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.1] transition-colors cursor-pointer backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-void"
                    aria-label="Close event story">
                    <X size={18} className="text-text-secondary" aria-hidden="true" />
                  </button>
                </div>
                <NavButton dir="right" event={next} onSelect={selectEvent} />
              </div>

              {/* Copied toast */}
              <AnimatePresence>
                {copied && (
                  <motion.div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full text-[11px] text-text-secondary"
                    style={{ background: 'var(--glass-strong-bg)', border: '1px solid var(--color-border-subtle)' }}
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    Copied to clipboard
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hero background photo — Unsplash image with dark gradient overlay */}
              {event.imageUrl && (
                <motion.div
                  className="absolute inset-0 z-[1] overflow-hidden pointer-events-none"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <img
                    src={event.imageUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: 'center 25%' }}
                    loading="eager"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  {/* Dark gradient overlay for text legibility */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, rgba(8,8,12,0.6) 0%, rgba(8,8,12,0.4) 40%, rgba(8,8,12,0.9) 100%), linear-gradient(90deg, rgba(8,8,12,0.85) 0%, rgba(8,8,12,0.3) 50%, rgba(8,8,12,0.2) 100%)`,
                    }}
                  />
                </motion.div>
              )}

              {/* Hero content */}
              <motion.div className="relative z-10 max-w-[800px] mx-auto w-full px-6 sm:px-10 pb-12"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase"
                    style={{ background: cat.color + '20', color: cat.color, border: `1px solid ${cat.color}30` }}>
                    {cat.label}
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold leading-[1.08] text-text-primary mb-5">
                  {event.title}
                </h1>

                {/* Animated year display */}
                <div className="text-[28px] sm:text-[36px] font-light text-text-muted mb-4 tabular-nums">
                  <AnimatedYear year={event.year} />
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-text-muted">
                  {event.locationName && (
                    <span className="flex items-center gap-1.5"><MapPin size={13} />{event.locationName}</span>
                  )}
                  <span className="flex items-center gap-1.5"><Globe size={13} />{era.name}</span>
                  {event.endYear && (
                    <span className="flex items-center gap-1.5"><Clock size={13} />{Math.abs(event.endYear - event.year)} years</span>
                  )}
                </div>
              </motion.div>

              <div className="absolute bottom-0 inset-x-0 h-32" style={{ background: 'linear-gradient(transparent, var(--color-void))' }} />
            </div>

            {/* ═══ BODY ═══ */}
            <div className="max-w-[800px] mx-auto px-6 sm:px-10 pb-28">

              {/* Timeline */}
              <Reveal>
                <div className="py-10">
                  <div className="flex items-center justify-between text-[10px] text-text-muted uppercase tracking-wider mb-3">
                    <span>{formatYear(era.startYear)}</span>
                    <span className="text-text-muted">{era.name}</span>
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
                          className="absolute top-1/2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan rounded-full"
                          aria-label={`Go to ${ee.title} (${formatYear(ee.year)})`}
                          aria-current={isActive ? 'true' : undefined}
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
                          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-md text-[10px] bg-surface text-text-secondary border border-white/[0.08] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {ee.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-[#28282f] mt-3">{eraEvents.length} events in this era</p>
                </div>
              </Reveal>

              {/* Media — on load error fall through to the styled placeholder
                  below instead of collapsing (no broken glyph, no dead gap) */}
              <Reveal delay={0.05}>
                <div className="mb-16">
                  {!mediaImgFailed && (illustrations?.sceneBreaks?.[0] || event.imageUrl) ? (
                    <figure className="rounded-2xl overflow-hidden -mx-2 sm:-mx-4">
                      <img
                        src={illustrations?.sceneBreaks?.[0] ? getIllustrationUrl(illustrations.sceneBreaks[0].slug, illustrations.sceneBreaks[0].num) : event.imageUrl!}
                        alt={event.title}
                        className="w-full h-auto object-contain"
                        loading="lazy"
                        onError={() => setMediaImgFailed(true)}
                      />
                    </figure>
                  ) : event.videoUrl ? (
                    <div className="rounded-2xl overflow-hidden aspect-video">
                      <iframe src={event.videoUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={event.title} />
                    </div>
                  ) : (
                    <div className="rounded-2xl overflow-hidden aspect-[21/9] flex items-center justify-center relative"
                      style={{ background: cat.gradient, border: '1px solid var(--color-border-subtle)' }}>
                      <div className="absolute inset-0 opacity-[0.04]" style={{
                        backgroundImage: `radial-gradient(circle at 30% 40%, ${cat.color}30 0%, transparent 50%), radial-gradient(circle at 70% 60%, ${cat.color}20 0%, transparent 50%)`,
                      }} />
                      <div className="text-center relative z-10">
                        <div className="flex items-center justify-center gap-4 mb-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border-subtle)' }}>
                            <ImageIcon size={20} className="text-text-muted" />
                          </div>
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border-subtle)' }}>
                            <Play size={20} className="text-text-muted" />
                          </div>
                        </div>
                        <p className="text-[11px] text-text-muted">Media coming soon</p>
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>

              {/* 3D Model Viewer (when modelUrl exists) */}
              {event.modelUrl && (
                <Reveal>
                  <section className="mb-16">
                    <SectionLabel>3D Model — Explore in 3D</SectionLabel>
                    <div className="rounded-2xl overflow-hidden aspect-[16/10]" style={{ border: '1px solid var(--color-border-subtle)' }}>
                      <iframe
                        src={event.modelUrl}
                        className="w-full h-full"
                        allow="autoplay; fullscreen; xr-spatial-tracking"
                        allowFullScreen
                        title={`3D Model: ${event.title}`}
                        style={{ border: 'none' }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-[11px] text-text-muted">
                        Drag to rotate · Scroll to zoom · Shift+drag to pan
                      </p>
                      <motion.button
                        onClick={() => openMonumentViewer(event)}
                        className="flex items-center gap-2 cursor-pointer"
                        style={{
                          height: '36px',
                          padding: '0 16px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid var(--color-border-subtle)',
                          color: 'var(--color-text-primary)',
                          fontSize: '13px',
                          fontWeight: 500,
                        }}
                        whileHover={{
                          background: 'rgba(255,255,255,0.12)',
                          borderColor: 'rgba(255,255,255,0.14)',
                          scale: 1.05,
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Maximize2 size={14} />
                        <span className="hidden sm:inline">Explore in Full Screen</span>
                        <span className="sm:hidden">Full Screen</span>
                      </motion.button>
                    </div>
                  </section>
                </Reveal>
              )}

              {/* Key Facts */}
              <Reveal delay={0.1}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-16">
                  <FactCard icon={<Calendar size={14} />} label="Date"
                    value={event.endYear ? formatYearRange(event.year, event.endYear) : formatYear(event.year)} color={cat.color} />
                  {event.locationName && <FactCard icon={<MapPin size={14} />} label="Location" value={event.locationName} color={cat.color} />}
                  <FactCard icon={<Clock size={14} />} label="Era" value={era.name} color={cat.color} />
                </div>
              </Reveal>

              {/* Interactive Map Visual */}
              <EventMapVisual eventId={event.id} />

              {/* Overview */}
              <section id="overview" ref={setSectionRef('overview')} className="mb-20">
                <Reveal>
                  <SectionLabel>Overview</SectionLabel>
                </Reveal>
                {event.description.split('\n\n').map((para, i) => (
                  <Reveal key={i} delay={i * 0.06}>
                    {/* Book-style floated illustrations — multiple per event, alternating sides */}
                    {illustrations?.floats?.filter(f => f.paragraph === i).map((float, fi) => {
                      const { className, style } = getFloatClasses(float);
                      const imgUrl = getIllustrationUrl(float.slug, float.num);
                      return (
                        <img
                          key={`float-${i}-${fi}`}
                          src={imgUrl}
                          alt=""
                          className={className}
                          style={style}
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      );
                    })}
                    <p className="text-[15px] sm:text-[16px] text-text-secondary leading-[1.9] mb-6">{para}</p>
                    {i === 0 && pullQuote && (
                      <Reveal delay={0.1}>
                        <blockquote className="my-10 py-6 px-8 border-l-[3px] rounded-r-xl clear-both relative z-[2]" style={{ borderColor: cat.color, background: `${cat.color}06` }}>
                          <p className="text-[18px] sm:text-[20px] text-text-secondary leading-[1.7] italic font-light">
                            "{pullQuote}"
                          </p>
                        </blockquote>
                      </Reveal>
                    )}
                    {/* Full-width scene illustrations between paragraphs — breakout width */}
                    {illustrations?.sceneBreaks?.filter(sb => sb.afterParagraph === i).map((sb, si) => (
                      <Reveal key={`scene-${i}-${si}`} delay={0.15}>
                        <figure className="my-10 sm:my-14 -mx-4 sm:-mx-8 md:-mx-12 clear-both">
                          <img
                            src={getIllustrationUrl(sb.slug, sb.num)}
                            alt=""
                            className="w-full h-auto object-contain"
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                          />
                        </figure>
                      </Reveal>
                    ))}
                  </Reveal>
                ))}
              </section>

              {/* Around the World — contemporary events */}
              {contemporaryEvents.length > 0 && (
                <section id="around-the-world" ref={setSectionRef('around-the-world')} className="mb-20">
                  <Reveal>
                    <div className="flex items-center gap-2 mb-6">
                      <Globe size={14} style={{ color: cat.color }} />
                      <h2 className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: cat.color }}>Around the World</h2>
                    </div>
                  </Reveal>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {contemporaryEvents.map((ce, i) => {
                      const ceCat = CATEGORY_META[ce.category];
                      const diff = ce.year - event.year;
                      const diffLabel = diff === 0
                        ? 'Same year'
                        : diff > 0
                          ? `${Math.abs(diff)} year${Math.abs(diff) !== 1 ? 's' : ''} after`
                          : `${Math.abs(diff)} year${Math.abs(diff) !== 1 ? 's' : ''} before`;
                      const cePlacement = getEventPlacements(ce.id);
                      const ceThumb = cePlacement?.heroImage;
                      return (
                        <Reveal key={ce.id} delay={i * 0.06}>
                          <motion.button
                            onClick={() => selectEvent(ce.id)}
                            className="flex items-start gap-4 p-5 rounded-xl text-left cursor-pointer group w-full overflow-hidden relative"
                            style={{ border: '1px solid var(--color-border-subtle)' }}
                            whileHover={{ borderColor: `${ceCat?.color ?? '#8a8a9a'}25`, backgroundColor: 'rgba(255,255,255,0.02)', x: 4 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {/* Thumbnail — category-tinted underlay behind the
                                img; on error only the img hides (fixed 48px box,
                                no layout jump) */}
                            {ceThumb && (
                              <div
                                className="relative shrink-0 w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center"
                                style={{ background: `linear-gradient(135deg, ${ceCat?.color ?? '#8a8a9a'}30, ${ceCat?.color ?? '#8a8a9a'}10)` }}
                              >
                                <span className="block w-2.5 h-2.5 rounded-full" style={{ background: ceCat?.color ?? '#8a8a9a' }} />
                                <img
                                  src={getIllustrationUrl(ceThumb.slug, ceThumb.num)}
                                  alt="" className="absolute inset-0 w-full h-full object-cover"
                                  loading="lazy"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              </div>
                            )}
                            {!ceThumb && (
                              <div className="mt-0.5 shrink-0">
                                <span className="block w-2.5 h-2.5 rounded-full" style={{ background: ceCat?.color ?? '#8a8a9a' }} />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-medium text-text-secondary group-hover:text-text-primary transition-colors truncate">
                                {ce.title}
                              </p>
                              <p className="text-[11px] text-text-muted mt-1">
                                {formatYear(ce.year)}{ce.locationName && ` · ${ce.locationName}`}
                              </p>
                              <p className="text-[10px] mt-1.5" style={{ color: ceCat?.color ?? '#8a8a9a' }}>
                                {diffLabel}
                              </p>
                            </div>
                            <ChevronRight size={14} className="text-[#28282f] group-hover:text-text-muted transition-colors shrink-0 mt-1" />
                          </motion.button>
                        </Reveal>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Did You Know — with illustration accent from pack */}
              {event.impactText && (
                <section id="impact" ref={setSectionRef('impact')} className="mb-20">
                  <Reveal>
                    <div className="relative">
                      <motion.div className="rounded-2xl p-7 sm:p-9 relative overflow-hidden"
                        style={{ background: 'rgba(255, 255, 255, 0.02)', border: `1px solid ${cat.color}18` }}
                        whileHover={{ scale: 1.008 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                        <div className="absolute top-0 left-0 w-1 h-full rounded-full" style={{ background: cat.color }} />
                        {/* Illustration accent — faded pack image on the right */}
                        {galleryImages[0] && (
                          <img
                            src={getIllustrationUrl(galleryImages[0].slug, galleryImages[0].num)}
                            alt=""
                            className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 h-[140%] w-auto opacity-[0.07] pointer-events-none select-none"
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <div className="pl-6 relative z-[1]">
                          <div className="flex items-center gap-2 mb-4">
                            <Lightbulb size={16} style={{ color: cat.color }} />
                            <span className="text-[12px] font-semibold tracking-wider uppercase" style={{ color: cat.color }}>Did you know?</span>
                          </div>
                          <p className="text-[16px] text-text-secondary leading-[1.8]">{event.impactText}</p>
                        </div>
                      </motion.div>
                    </div>
                  </Reveal>
                </section>
              )}

              {/* Quiz */}
              <Reveal>
                <section className="mb-20">
                  <SectionLabel>Test Your Knowledge</SectionLabel>
                  <EventQuiz
                    eventId={event.id}
                    eventTitle={event.title}
                    categoryColor={cat.color}
                  />
                </section>
              </Reveal>

              {/* Your Notes */}
              <Reveal>
                <section className="mb-20">
                  <SectionLabel>Your Notes</SectionLabel>
                  <div className="rounded-2xl p-6 relative" style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(24px)', border: '1px solid var(--color-border-subtle)' }}>
                    <textarea value={noteText} onChange={e => handleNoteChange(e.target.value)} onBlur={handleNoteBlur} maxLength={500} rows={4} placeholder="Write your notes about this event..." className="notes-textarea w-full bg-transparent resize-none outline-none text-[14px] leading-[1.8]" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }} />
                    <div className="flex justify-end mt-2 text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: noteText.length >= 450 ? '#b85454' : '#3a3a4a' }}>{noteText.length}/500</div>
                  </div>
                </section>
              </Reveal>

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

              {/* Gallery — auto-populated from civilization pack images + explicit images */}
              {(galleryImages.length > 0 || (event.images && event.images.length > 0)) && (
                <section id="gallery" ref={setSectionRef('gallery')} className="mb-20">
                  <Reveal>
                    <SectionLabel>Gallery</SectionLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* Civilization pack images — auto-discovered from unused images */}
                      {galleryImages.map((img, i) => (
                        <Reveal key={`pack-${img.slug}-${img.num}`} delay={i * 0.04}>
                          <motion.div
                            className="rounded-xl overflow-hidden bg-[#0a0a12] cursor-pointer"
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          >
                            <img
                              src={getIllustrationUrl(img.slug, img.num)}
                              alt=""
                              className="w-full h-auto object-contain"
                              loading="lazy"
                              onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                            />
                          </motion.div>
                        </Reveal>
                      ))}
                      {/* Explicit images from event data — may contain dead
                          URLs; tinted underlay + icon shows if the img errors */}
                      {event.images?.filter(Boolean).map((img, i) => (
                        <Reveal key={`ext-${i}`} delay={(galleryImages.length + i) * 0.04}>
                          <motion.div className="relative rounded-xl overflow-hidden aspect-[4/3] cursor-pointer flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${cat.color}30, ${cat.color}10)` }}
                            whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                            <ImageIcon size={20} className="text-text-muted" aria-hidden="true" />
                            <img src={img} alt={`${event.title} ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" loading="lazy"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          </motion.div>
                        </Reveal>
                      ))}
                    </div>
                  </Reveal>
                </section>
              )}

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
                      style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid var(--color-border-subtle)' }}
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
                          style={{ border: '1px solid var(--color-border-subtle)' }}
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
  if (!event) return <div className="w-10" aria-hidden="true" />;
  return (
    <motion.button onClick={() => onSelect(event.id)}
      className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-sm transition-colors cursor-pointer max-w-[200px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-void"
      aria-label={dir === 'left' ? `Previous event: ${event.title}` : `Next event: ${event.title}`}
      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
      {dir === 'left' && <ChevronLeft size={14} className="text-text-muted shrink-0" aria-hidden="true" />}
      <span className="text-[11px] text-text-muted truncate" aria-hidden="true">{event.title}</span>
      {dir === 'right' && <ChevronRight size={14} className="text-text-muted shrink-0" aria-hidden="true" />}
    </motion.button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-text-muted mb-6 clear-both">{children}</h2>;
}

function FactCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <motion.div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border-subtle)' }}
      whileHover={{ borderColor: `${color}25`, y: -3 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
      <div className="flex items-center gap-1.5 mb-2">
        <span style={{ color: color + '80' }}>{icon}</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">{label}</span>
      </div>
      <p className="text-[14px] text-text-secondary font-medium">{value}</p>
    </motion.div>
  );
}

function DiveLink({ emoji, title, subtitle, href, color }: { emoji: string; title: string; subtitle: string; href: string; color: string }) {
  return (
    <motion.a href={href} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-4 p-5 rounded-xl cursor-pointer"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border-subtle)' }}
      whileHover={{ borderColor: `${color}30`, backgroundColor: 'rgba(255,255,255,0.03)', x: 4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <span className="text-lg">{emoji}</span>
      </div>
      <div>
        <p className="text-[13px] font-medium text-text-secondary">{title}</p>
        <p className="text-[11px] text-text-muted">{subtitle}</p>
      </div>
      <ExternalLink size={14} className="text-text-muted ml-auto shrink-0" />
    </motion.a>
  );
}

function RelatedCard({ event, onSelect }: { event: HistoricalEvent; onSelect: (id: string) => void }) {
  const cat = CATEGORY_META[event.category];
  const icon = EVENT_ICONS[event.id] ?? '●';
  const placement = getEventPlacements(event.id);
  const thumb = placement?.heroImage;
  return (
    <motion.button onClick={() => onSelect(event.id)}
      className="flex items-center gap-4 p-5 rounded-xl text-left cursor-pointer group"
      style={{ border: '1px solid var(--color-border-subtle)' }}
      whileHover={{ borderColor: `${cat?.color ?? '#8a8a9a'}25`, backgroundColor: 'rgba(255,255,255,0.02)', x: 4 }}
      whileTap={{ scale: 0.98 }}>
      {thumb ? (
        <div
          className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-2xl"
          style={{ background: (cat?.color ?? '#8a8a9a') + '12' }}
        >
          <span aria-hidden="true">{icon}</span>
          <img src={getIllustrationUrl(thumb.slug, thumb.num)} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
      ) : (
        <span className="text-2xl w-11 h-11 flex items-center justify-center rounded-lg shrink-0"
          style={{ background: (cat?.color ?? '#8a8a9a') + '12' }}>{icon}</span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-text-secondary group-hover:text-text-primary transition-colors truncate">{event.title}</p>
        <p className="text-[11px] text-text-muted mt-1">
          {formatYear(event.year)}{event.locationName && ` · ${event.locationName}`}
        </p>
      </div>
      <ChevronRight size={14} className="text-[#28282f] group-hover:text-text-muted transition-colors shrink-0" />
    </motion.button>
  );
}
