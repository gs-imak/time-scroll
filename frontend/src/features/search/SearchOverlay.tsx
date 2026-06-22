import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, MapPin, Scroll, Command, Landmark, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { useUIStore } from '@/shared/stores/uiStore';
import { useGlobeCamera } from '@/features/globe/useGlobeCamera';
import { LOCATIONS, ERAS } from '@/shared/utils/constants';
import { formatYear } from '@/shared/utils/format';
import { ALL_CIVILIZATION_LABELS } from '@/shared/data/civilizationLabels';
import { CIV_DESCRIPTIONS } from '@/shared/data/civDescriptions';
import type { EventCategory } from '@/shared/types/events';

/* ── Constants ── */

const CATEGORY_HEX: Record<EventCategory, string> = {
  war: '#b85454',
  discovery: '#5a8fa5',
  cultural: '#c49a44',
  political: '#8b80b0',
  construction: '#6d9476',
  natural: '#b87a60',
};

const ERA_HEX: Record<string, string> = {
  prehistory: '#8d7b68',
  ancient: '#c49a44',
  classical: '#b85454',
  medieval: '#8b6faa',
  renaissance: '#5a7fb5',
  industrial: '#7a9e5a',
  modern: '#5a9aaa',
};

const MAX_RESULTS_PER_GROUP = 5;

const SUGGESTED_QUERIES = [
  'Rome',
  'Pyramid',
  'Revolution',
  'Genghis Khan',
  'Egypt',
];

/* ── Result types ── */

interface EventResult {
  type: 'event';
  id: string;
  title: string;
  year: number;
  category: EventCategory;
  eraId: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

interface LocationResult {
  type: 'location';
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  defaultZoom: number;
}

interface CivResult {
  type: 'civ';
  slug: string;
  name: string;
  summary: string | null;
  imageUrl: string | null;
}

type SearchResult = EventResult | LocationResult | CivResult;

/* ══════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════ */

export function SearchOverlay() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const events = useEventsStore((s) => s.events);
  const selectEvent = useEventsStore((s) => s.selectEvent);
  const setActivePanel = useUIStore((s) => s.setActivePanel);
  const { flyTo } = useGlobeCamera();

  /* ── Open / close ── */

  const open = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setActiveIndex(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) close();
        else open();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, open, close]);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  /* ── Flatten civs from multiple sources ── */

  const civSearchIndex = useMemo(() => {
    const all: CivResult[] = [];
    const seen = new Set<string>();

    // From ALL_CIVILIZATION_LABELS (those with events)
    for (const label of ALL_CIVILIZATION_LABELS) {
      if (seen.has(label.slug)) continue;
      seen.add(label.slug);
      const descSlug = label.slug
        .replace(/^ancient-/, '')
        .replace(/^kingdom-of-/, '')
        .replace(/-empire$/, '');
      const desc = CIV_DESCRIPTIONS[descSlug] ?? CIV_DESCRIPTIONS[label.slug];
      all.push({
        type: 'civ',
        slug: label.slug,
        name: label.name,
        summary: desc?.summary ?? null,
        imageUrl: desc?.imageUrl ?? null,
      });
    }

    // From CIV_DESCRIPTIONS (the 163 rich entries)
    for (const [key, desc] of Object.entries(CIV_DESCRIPTIONS)) {
      const normSlug = key.toLowerCase().replace(/[^a-z0-9]/g, '-');
      if (seen.has(normSlug)) continue;
      seen.add(normSlug);
      // Derive a display name from the key
      const displayName = key
        .replace(/[_']/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      all.push({
        type: 'civ',
        slug: normSlug,
        name: displayName,
        summary: desc.summary,
        imageUrl: desc.imageUrl,
      });
    }

    return all;
  }, []);

  /* ── Filter results ── */

  const results = useMemo<{
    events: EventResult[];
    locations: LocationResult[];
    civs: CivResult[];
  }>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { events: [], locations: [], civs: [] };

    const eventResults: EventResult[] = events
      .filter((e) => e.title.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS_PER_GROUP)
      .map((e) => ({
        type: 'event',
        id: e.id,
        title: e.title,
        year: e.year,
        category: e.category,
        eraId: e.eraId,
        latitude: e.latitude,
        longitude: e.longitude,
        imageUrl: e.imageUrl,
      }));

    const locationResults: LocationResult[] = LOCATIONS
      .filter(
        (l) =>
          l.name.toLowerCase().includes(q) || l.country.toLowerCase().includes(q),
      )
      .slice(0, MAX_RESULTS_PER_GROUP)
      .map((l) => ({
        type: 'location',
        id: l.id,
        name: l.name,
        country: l.country,
        latitude: l.latitude,
        longitude: l.longitude,
        defaultZoom: l.defaultZoom,
      }));

    const civResults: CivResult[] = civSearchIndex
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.summary?.toLowerCase().includes(q) ?? false),
      )
      .slice(0, MAX_RESULTS_PER_GROUP);

    return { events: eventResults, locations: locationResults, civs: civResults };
  }, [query, events, civSearchIndex]);

  const flatResults: SearchResult[] = useMemo(
    () => [...results.events, ...results.civs, ...results.locations],
    [results],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [flatResults.length, query]);

  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector('[data-active="true"]');
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  /* ── Selection ── */

  const handleSelect = useCallback(
    (result: SearchResult) => {
      if (result.type === 'event') {
        selectEvent(result.id);
        flyTo(result.longitude, result.latitude, 6);
        setActivePanel('none');
      } else if (result.type === 'location') {
        flyTo(result.longitude, result.latitude, result.defaultZoom);
        setActivePanel('none');
      } else {
        // civ
        navigate(`/civilizations/${result.slug}`);
      }
      close();
    },
    [selectEvent, flyTo, setActivePanel, close, navigate],
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i < flatResults.length - 1 ? i + 1 : 0));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : flatResults.length - 1));
      return;
    }
    if (e.key === 'Enter' && flatResults.length > 0) {
      e.preventDefault();
      const target = flatResults[activeIndex];
      if (target) handleSelect(target);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) close();
  }

  const hasResults =
    results.events.length + results.locations.length + results.civs.length > 0;

  let flatIndex = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={backdropRef}
          className="fixed inset-0 z-50 flex items-start justify-center"
          style={{ paddingTop: '12vh' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'var(--color-overlay)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Search panel */}
          <motion.div
            className="relative w-full max-w-[580px] mx-4"
            style={{
              background: 'var(--glass-strong-bg)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '16px',
              boxShadow: '0 28px 80px var(--glass-shadow), inset 0 1px 0 var(--glass-inset)',
            }}
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Search events, civilizations, and locations"
          >
            {/* ── Input area ── */}
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
            >
              <Search size={18} className="shrink-0" style={{ color: 'var(--color-accent-gold)' }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search events, civilizations, locations…"
                className="flex-1 bg-transparent text-[14px] font-medium outline-none"
                style={{
                  color: 'var(--color-text-primary)',
                  caretColor: 'var(--color-accent-gold)',
                  fontFamily: 'var(--font-display)',
                }}
                aria-label="Search"
                aria-activedescendant={hasResults ? `search-result-${activeIndex}` : undefined}
                role="combobox"
                aria-expanded={hasResults}
                aria-controls="search-results"
                aria-autocomplete="list"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                  style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                  aria-label="Clear query"
                >
                  <X size={12} style={{ color: 'var(--color-text-muted)' }} />
                </button>
              )}
              <kbd
                className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold shrink-0"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: 'var(--glass-bg)',
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border-subtle)',
                  letterSpacing: '0.05em',
                }}
              >
                ESC
              </kbd>
            </div>

            {/* ── Results / Empty State ── */}
            {query.trim() ? (
              <div
                ref={listRef}
                id="search-results"
                role="listbox"
                className="overflow-y-auto"
                style={{ maxHeight: '440px', padding: '8px' }}
              >
                {!hasResults ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      <Search
                        size={20}
                        style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}
                      />
                    </div>
                    <p
                      className="text-[13px]"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      No results for "
                      <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                        {query}
                      </span>
                      "
                    </p>
                    <p
                      className="text-[11px]"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      Try a different search term
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Events group */}
                    {results.events.length > 0 && (
                      <GroupLabel icon={Scroll} label="Events" count={results.events.length} />
                    )}
                    {results.events.map((r) => {
                      const idx = flatIndex++;
                      const isActive = idx === activeIndex;
                      const catColor = CATEGORY_HEX[r.category] ?? '#8a8a9a';
                      const eraColor = ERA_HEX[r.eraId] ?? '#8a8a9a';
                      return (
                        <ResultRow
                          key={`event-${r.id}`}
                          idx={idx}
                          isActive={isActive}
                          accentColor={catColor}
                          onClick={() => handleSelect(r)}
                          onHover={() => setActiveIndex(idx)}
                          thumbnail={
                            r.imageUrl ? (
                              <div
                                className="w-full h-full"
                                style={{
                                  backgroundImage: `url(${r.imageUrl})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }}
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ background: `${catColor}20` }}
                              >
                                <Scroll size={14} style={{ color: catColor }} />
                              </div>
                            )
                          }
                          title={r.title}
                          meta={
                            <>
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
                                style={{
                                  background: `${eraColor}18`,
                                  color: eraColor,
                                  fontSize: '9px',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.06em',
                                  fontFamily: 'var(--font-display)',
                                }}
                              >
                                {ERAS.find((e) => e.id === r.eraId)?.name ?? r.eraId}
                              </span>
                              <span
                                style={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: '10px',
                                  color: 'var(--color-text-muted)',
                                }}
                              >
                                {formatYear(r.year)}
                              </span>
                            </>
                          }
                        />
                      );
                    })}

                    {/* Civs group */}
                    {results.civs.length > 0 && (
                      <>
                        {results.events.length > 0 && <Divider />}
                        <GroupLabel
                          icon={Landmark}
                          label="Civilizations"
                          count={results.civs.length}
                        />
                      </>
                    )}
                    {results.civs.map((r) => {
                      const idx = flatIndex++;
                      const isActive = idx === activeIndex;
                      return (
                        <ResultRow
                          key={`civ-${r.slug}`}
                          idx={idx}
                          isActive={isActive}
                          accentColor="#c49a44"
                          onClick={() => handleSelect(r)}
                          onHover={() => setActiveIndex(idx)}
                          thumbnail={
                            r.imageUrl ? (
                              <div
                                className="w-full h-full"
                                style={{
                                  backgroundImage: `url(${r.imageUrl})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }}
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ background: 'rgba(196,154,68,0.18)' }}
                              >
                                <Landmark size={14} style={{ color: '#c49a44' }} />
                              </div>
                            )
                          }
                          title={r.name}
                          meta={
                            r.summary ? (
                              <span
                                style={{
                                  fontSize: '10px',
                                  color: 'var(--color-text-muted)',
                                  lineHeight: 1.3,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  maxWidth: '280px',
                                }}
                              >
                                {r.summary}
                              </span>
                            ) : (
                              <span
                                className="text-[10px]"
                                style={{
                                  color: 'var(--color-text-muted)',
                                  fontFamily: "'JetBrains Mono', monospace",
                                }}
                              >
                                Civilization
                              </span>
                            )
                          }
                        />
                      );
                    })}

                    {/* Locations group */}
                    {results.locations.length > 0 && (
                      <>
                        {(results.events.length > 0 || results.civs.length > 0) && <Divider />}
                        <GroupLabel
                          icon={MapPin}
                          label="Locations"
                          count={results.locations.length}
                        />
                      </>
                    )}
                    {results.locations.map((r) => {
                      const idx = flatIndex++;
                      const isActive = idx === activeIndex;
                      return (
                        <ResultRow
                          key={`location-${r.id}`}
                          idx={idx}
                          isActive={isActive}
                          accentColor="#5a9aaa"
                          onClick={() => handleSelect(r)}
                          onHover={() => setActiveIndex(idx)}
                          thumbnail={
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ background: 'rgba(90,154,170,0.18)' }}
                            >
                              <MapPin size={14} style={{ color: '#5a9aaa' }} />
                            </div>
                          }
                          title={r.name}
                          meta={
                            <span
                              className="text-[10px]"
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                color: 'var(--color-text-muted)',
                              }}
                            >
                              {r.country}
                            </span>
                          }
                        />
                      );
                    })}
                  </>
                )}
              </div>
            ) : (
              /* Empty state with suggestions */
              <div className="p-5 pb-4">
                <div
                  className="flex items-center gap-2 mb-3"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <Sparkles size={12} />
                  <span
                    className="text-[10px] font-semibold tracking-[0.14em] uppercase"
                  >
                    Try searching for
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {SUGGESTED_QUERIES.map((s) => (
                    <motion.button
                      key={s}
                      type="button"
                      onClick={() => setQuery(s)}
                      className="px-3 py-1.5 rounded-full text-[11px] font-medium cursor-pointer"
                      style={{
                        fontFamily: 'var(--font-display)',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--color-border-subtle)',
                        color: 'var(--color-text-secondary)',
                      }}
                      whileHover={{
                        scale: 1.05,
                        borderColor: 'rgba(196,154,68,0.4)',
                        color: 'var(--color-accent-gold)',
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>

                {/* Footer shortcuts */}
                <div
                  className="flex items-center justify-center gap-5 pt-3"
                  style={{
                    borderTop: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <KbdHint label="navigate">
                    <span style={{ fontSize: '9px' }}>↑</span>
                    <span style={{ fontSize: '9px' }}>↓</span>
                  </KbdHint>
                  <KbdHint label="select">↵</KbdHint>
                  <KbdHint label="close">esc</KbdHint>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════ */

function GroupLabel({
  icon: Icon,
  label,
  count,
}: {
  icon: typeof Scroll;
  label: string;
  count: number;
}) {
  return (
    <div
      className="flex items-center justify-between px-3 pt-3 pb-2"
      style={{ color: 'var(--color-text-muted)' }}
    >
      <div className="flex items-center gap-2">
        <Icon size={11} />
        <span className="text-[10px] font-semibold tracking-[0.14em] uppercase">
          {label}
        </span>
      </div>
      <span
        className="text-[10px] font-semibold"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: 'var(--color-text-muted)',
          opacity: 0.7,
        }}
      >
        {count}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div
      className="mx-3 my-1"
      style={{ height: '1px', background: 'var(--color-border-subtle)' }}
    />
  );
}

function ResultRow({
  idx,
  isActive,
  accentColor,
  onClick,
  onHover,
  thumbnail,
  title,
  meta,
}: {
  idx: number;
  isActive: boolean;
  accentColor: string;
  onClick: () => void;
  onHover: () => void;
  thumbnail: React.ReactNode;
  title: string;
  meta: React.ReactNode;
}) {
  return (
    <button
      type="button"
      id={`search-result-${idx}`}
      role="option"
      aria-selected={isActive}
      data-active={isActive}
      onClick={onClick}
      onMouseEnter={onHover}
      className="w-full flex items-center gap-3 rounded-[10px] text-left cursor-pointer transition-colors focus-visible:outline-none"
      style={{
        padding: '8px 10px',
        background: isActive ? `${accentColor}14` : 'transparent',
        border: isActive
          ? `1px solid ${accentColor}40`
          : '1px solid transparent',
      }}
    >
      {/* Thumbnail */}
      <div
        className="w-[38px] h-[38px] rounded-lg overflow-hidden shrink-0"
        style={{ border: `1px solid ${accentColor}30` }}
        aria-hidden="true"
      >
        {thumbnail}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p
          className="truncate"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            lineHeight: 1.3,
          }}
        >
          {title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">{meta}</div>
      </div>

      {/* Active indicator */}
      {isActive && (
        <div
          className="w-1 h-6 rounded-full shrink-0"
          style={{ background: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
          aria-hidden="true"
        />
      )}
    </button>
  );
}

function KbdHint({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5 text-[10px]">
      <kbd
        className="inline-flex items-center px-1.5 py-0.5 rounded"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          background: 'var(--glass-bg)',
          border: '1px solid var(--color-border-subtle)',
          color: 'var(--color-text-muted)',
          minWidth: '18px',
          justifyContent: 'center',
        }}
      >
        {children}
      </kbd>
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
    </span>
  );
}

/* ══════════════════════════════════════════
   TRIGGER
   ══════════════════════════════════════════ */

export function SearchTrigger() {
  const [isHovered, setIsHovered] = useState(false);

  function handleClick() {
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 text-text-secondary hover:text-text-primary hover:bg-elevated/60"
        aria-label="Search (Ctrl+K)"
      >
        <Search size={20} />
      </button>

      {isHovered && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 pointer-events-none z-50">
          <div className="glass-strong rounded-lg px-3 py-1.5 text-xs font-medium text-text-primary whitespace-nowrap shadow-lg flex items-center gap-2">
            Search
            <kbd
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px]"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <Command size={9} />K
            </kbd>
          </div>
        </div>
      )}
    </div>
  );
}
