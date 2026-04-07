import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { useUIStore } from '@/shared/stores/uiStore';
import type { EventCategory } from '@/shared/types/events';

const CATEGORIES: { id: EventCategory; label: string; color: string }[] = [
  { id: 'war',          label: 'War',          color: '#b85454' },
  { id: 'discovery',    label: 'Discovery',    color: '#5a8fa5' },
  { id: 'cultural',     label: 'Cultural',     color: '#c49a44' },
  { id: 'political',    label: 'Political',    color: '#8b80b0' },
  { id: 'construction', label: 'Construction', color: '#6d9476' },
  { id: 'natural',      label: 'Natural',      color: '#b87a60' },
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const AUTO_COLLAPSE_MS = 5000;

export function CategoryFilters() {
  const filters = useEventsStore(s => s.filters);
  const setFilters = useEventsStore(s => s.setFilters);
  const isMobile = useUIStore(s => s.isMobile);

  const [expanded, setExpanded] = useState(false);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeCategories = filters.categories;
  const showAll = activeCategories.length === 0;
  const filterCount = activeCategories.length;

  // Auto-collapse after inactivity
  const resetCollapseTimer = useCallback(() => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
    collapseTimer.current = setTimeout(() => setExpanded(false), AUTO_COLLAPSE_MS);
  }, []);

  useEffect(() => {
    if (expanded) resetCollapseTimer();
    return () => { if (collapseTimer.current) clearTimeout(collapseTimer.current); };
  }, [expanded, resetCollapseTimer]);

  function toggleExpanded() {
    setExpanded(prev => !prev);
  }

  function toggle(cat: EventCategory) {
    resetCollapseTimer();
    if (showAll) {
      setFilters({ categories: [cat] });
    } else if (activeCategories.includes(cat)) {
      setFilters({ categories: activeCategories.filter(c => c !== cat) });
    } else {
      setFilters({ categories: [...activeCategories, cat] });
    }
  }

  function isActive(cat: EventCategory) {
    return showAll || activeCategories.includes(cat);
  }

  return (
    <motion.div
      className={
        isMobile
          ? 'fixed top-4 left-[60px] z-20'
          : 'absolute top-4 left-[80px] z-20'
      }
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 25 }}
      role="group"
      aria-label="Filter events by category"
    >
      <div className="flex items-start gap-2">
        {/* Toggle button — always visible */}
        <motion.button
          onClick={toggleExpanded}
          className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer glass"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          aria-expanded={expanded}
          aria-label="Toggle category filters"
        >
          <Filter size={14} className="text-text-secondary" />
          {filterCount > 0 && !showAll && (
            <span
              className="flex items-center justify-center w-4.5 h-4.5 rounded-full text-[9px] font-bold"
              style={{
                background: 'var(--color-accent-gold)',
                color: 'var(--color-void)',
                minWidth: 18,
                height: 18,
              }}
            >
              {filterCount}
            </span>
          )}
          {/* Show active filter dots when collapsed */}
          {!expanded && filterCount > 0 && !showAll && (
            <div className="flex gap-1">
              {activeCategories.slice(0, 3).map(catId => {
                const cat = CATEGORIES.find(c => c.id === catId);
                return cat ? (
                  <span
                    key={catId}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: cat.color }}
                  />
                ) : null;
              })}
            </div>
          )}
        </motion.button>

        {/* Expanded chip list */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              className="glass rounded-xl p-1.5 overflow-x-auto"
              initial={{ opacity: 0, width: 0, scale: 0.95 }}
              animate={{ opacity: 1, width: 'auto', scale: 1 }}
              exit={{ opacity: 0, width: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <div className="flex gap-1 min-w-max">
                {CATEGORIES.map((cat) => {
                  const active = isActive(cat.id);
                  return (
                    <motion.button
                      key={cat.id}
                      onClick={() => toggle(cat.id)}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                      className="flex items-center gap-2 rounded-full cursor-pointer transition-[filter] duration-200 ease-out hover:brightness-125 active:scale-95"
                      style={{
                        padding: '6px 12px',
                        background: active
                          ? `${cat.color}20`
                          : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${active ? `${cat.color}66` : 'var(--color-border-subtle)'}`,
                      }}
                      aria-pressed={active}
                      aria-label={`${active ? 'Hide' : 'Show'} ${cat.label} events`}
                    >
                      <span
                        className="shrink-0 rounded-full"
                        style={{
                          width: 8,
                          height: 8,
                          background: cat.color,
                          opacity: active ? 1 : 0.35,
                          transition: 'opacity 200ms ease-out',
                        }}
                      />
                      <span
                        className="text-[11px] font-medium whitespace-nowrap"
                        style={{
                          color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                          transition: 'color 200ms ease-out',
                        }}
                      >
                        {cat.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
