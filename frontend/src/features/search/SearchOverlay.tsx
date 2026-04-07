import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, MapPin, Scroll, Command } from 'lucide-react';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { useUIStore } from '@/shared/stores/uiStore';
import { useGlobeCamera } from '@/features/globe/useGlobeCamera';
import { LOCATIONS } from '@/shared/utils/constants';
import { formatYear } from '@/shared/utils/format';

const CATEGORY_COLORS: Record<string, string> = {
  war: '#b85454',
  discovery: '#5a8fa5',
  cultural: '#c49a44',
  political: '#8b80b0',
  construction: '#6d9476',
  natural: '#b87a60',
};

const MAX_RESULTS = 8;

interface EventResult {
  type: 'event';
  id: string;
  title: string;
  year: number;
  category: string;
  latitude: number;
  longitude: number;
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

type SearchResult = EventResult | LocationResult;

export function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const events = useEventsStore(s => s.events);
  const selectEvent = useEventsStore(s => s.selectEvent);
  const setActivePanel = useUIStore(s => s.setActivePanel);
  const { flyTo } = useGlobeCamera();

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

  // Global Ctrl+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          close();
        } else {
          open();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, open, close]);

  // Auto-focus input when opening
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Filter results
  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const eventResults: EventResult[] = events
      .filter(e => e.title.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS)
      .map(e => ({
        type: 'event',
        id: e.id,
        title: e.title,
        year: e.year,
        category: e.category,
        latitude: e.latitude,
        longitude: e.longitude,
      }));

    const locationResults: LocationResult[] = LOCATIONS
      .filter(l => l.name.toLowerCase().includes(q) || l.country.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS)
      .map(l => ({
        type: 'location',
        id: l.id,
        name: l.name,
        country: l.country,
        latitude: l.latitude,
        longitude: l.longitude,
        defaultZoom: l.defaultZoom,
      }));

    const combined = [...eventResults, ...locationResults];
    return combined.slice(0, MAX_RESULTS);
  }, [query, events]);

  // Group results
  const eventGroup = results.filter((r): r is EventResult => r.type === 'event');
  const locationGroup = results.filter((r): r is LocationResult => r.type === 'location');

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [results.length, query]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // Select result
  const handleSelect = useCallback(
    (result: SearchResult) => {
      if (result.type === 'event') {
        selectEvent(result.id);
        flyTo(result.longitude, result.latitude, 6);
        setActivePanel('none');
      } else {
        flyTo(result.longitude, result.latitude, result.defaultZoom);
        setActivePanel('none');
      }
      close();
    },
    [selectEvent, flyTo, setActivePanel, close]
  );

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i < results.length - 1 ? i + 1 : 0));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i > 0 ? i - 1 : results.length - 1));
      return;
    }

    if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      const target = results[activeIndex];
      if (target) handleSelect(target);
    }
  }

  // Click outside to close
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) {
      close();
    }
  }

  // Flat index tracker for mixed groups
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
            className="relative w-full max-w-[520px] mx-4"
            style={{
              background: 'var(--glass-strong-bg)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '16px',
              boxShadow: '0 24px 80px var(--glass-shadow), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Search events and locations"
          >
            {/* Input area */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <Search size={18} className="shrink-0" style={{ color: 'var(--color-text-muted)' }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search events, locations..."
                className="flex-1 bg-transparent text-[14px] font-medium outline-none placeholder:font-normal"
                style={{
                  color: 'var(--color-text-primary)',
                  caretColor: '#5a9aaa',
                }}
                aria-label="Search"
                aria-activedescendant={results.length > 0 ? `search-result-${activeIndex}` : undefined}
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls="search-results"
                aria-autocomplete="list"
              />
              <kbd
                className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium shrink-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            {query.trim() && (
              <div
                ref={listRef}
                id="search-results"
                role="listbox"
                className="overflow-y-auto"
                style={{ maxHeight: '360px', padding: '8px' }}
              >
                {results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Search size={24} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                    <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                      No results for "{query}"
                    </p>
                  </div>
                ) : (
                  <>
                    {eventGroup.length > 0 && (
                      <div>
                        <div
                          className="flex items-center gap-2 px-3 pt-2 pb-2"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          <Scroll size={12} />
                          <span className="text-[11px] font-medium tracking-wide uppercase">
                            Events
                          </span>
                        </div>
                        {eventGroup.map(result => {
                          const idx = flatIndex++;
                          const isActive = idx === activeIndex;
                          const dotColor = CATEGORY_COLORS[result.category] ?? '#8a8a9a';
                          return (
                            <button
                              key={`event-${result.id}`}
                              id={`search-result-${idx}`}
                              role="option"
                              aria-selected={isActive}
                              data-active={isActive}
                              onClick={() => handleSelect(result)}
                              onMouseEnter={() => setActiveIndex(idx)}
                              className="w-full flex items-center gap-3 rounded-[10px] text-left cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50"
                              style={{
                                padding: '10px 12px',
                                background: isActive ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                              }}
                            >
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: dotColor }}
                              />
                              <div className="min-w-0 flex-1">
                                <p
                                  className="text-[14px] font-medium truncate"
                                  style={{ color: isActive ? '#e0e0e6' : '#8a8a9a' }}
                                >
                                  {result.title}
                                </p>
                              </div>
                              <span
                                className="text-[11px] font-mono shrink-0"
                                style={{ color: 'var(--color-text-muted)' }}
                              >
                                {formatYear(result.year)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {locationGroup.length > 0 && (
                      <div>
                        {eventGroup.length > 0 && (
                          <div
                            className="mx-3 my-1"
                            style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)' }}
                          />
                        )}
                        <div
                          className="flex items-center gap-2 px-3 pt-2 pb-2"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          <MapPin size={12} />
                          <span className="text-[11px] font-medium tracking-wide uppercase">
                            Locations
                          </span>
                        </div>
                        {locationGroup.map(result => {
                          const idx = flatIndex++;
                          const isActive = idx === activeIndex;
                          return (
                            <button
                              key={`location-${result.id}`}
                              id={`search-result-${idx}`}
                              role="option"
                              aria-selected={isActive}
                              data-active={isActive}
                              onClick={() => handleSelect(result)}
                              onMouseEnter={() => setActiveIndex(idx)}
                              className="w-full flex items-center gap-3 rounded-[10px] text-left cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50"
                              style={{
                                padding: '10px 12px',
                                background: isActive ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                              }}
                            >
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: '#c49a44' }}
                              />
                              <div className="min-w-0 flex-1">
                                <p
                                  className="text-[14px] font-medium truncate"
                                  style={{ color: isActive ? '#e0e0e6' : '#8a8a9a' }}
                                >
                                  {result.name}
                                </p>
                              </div>
                              <span
                                className="text-[11px] shrink-0"
                                style={{ color: 'var(--color-text-muted)' }}
                              >
                                {result.country}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Footer hint */}
            {!query.trim() && (
              <div
                className="flex items-center justify-center gap-4 px-5 py-4"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <span className="flex items-center gap-1.5 text-[11px]">
                  <kbd
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px]"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <span className="mr-0.5" style={{ fontSize: '9px' }}>&#8593;</span>
                    <span style={{ fontSize: '9px' }}>&#8595;</span>
                  </kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1.5 text-[11px]">
                  <kbd
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px]"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    &#9166;
                  </kbd>
                  select
                </span>
                <span className="flex items-center gap-1.5 text-[11px]">
                  <kbd
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px]"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    esc
                  </kbd>
                  close
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SearchTrigger() {
  const [isHovered, setIsHovered] = useState(false);

  function handleClick() {
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })
    );
  }

  return (
    <div className="relative">
      <button
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
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
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
