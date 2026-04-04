import { motion } from 'framer-motion';
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

export function CategoryFilters() {
  const filters = useEventsStore(s => s.filters);
  const setFilters = useEventsStore(s => s.setFilters);
  const isMobile = useUIStore(s => s.isMobile);

  const activeCategories = filters.categories;
  const showAll = activeCategories.length === 0;

  function toggle(cat: EventCategory) {
    if (showAll) {
      // Currently showing all -- clicking one means "show only this one"
      setFilters({ categories: [cat] });
    } else if (activeCategories.includes(cat)) {
      const next = activeCategories.filter(c => c !== cat);
      // If removing the last active filter, reset to show all
      setFilters({ categories: next });
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
          ? 'fixed top-4 left-3 right-3 z-30 glass rounded-xl p-2 overflow-x-auto'
          : 'absolute top-[280px] left-5 z-30 glass rounded-xl p-2'
      }
      initial={isMobile ? { y: -20, opacity: 0 } : { x: -40, opacity: 0 }}
      animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 25 }}
      role="group"
      aria-label="Filter events by category"
    >
      <div
        className={
          isMobile
            ? 'flex gap-1 min-w-max'
            : 'flex flex-col gap-1'
        }
      >
        {CATEGORIES.map((cat, i) => {
          const active = isActive(cat.id);

          return (
            <motion.button
              key={cat.id}
              onClick={() => toggle(cat.id)}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.7 + i * 0.04,
                type: 'spring',
                stiffness: 300,
                damping: 28,
              }}
              className="flex items-center gap-2 rounded-full cursor-pointer transition-[filter] duration-200 ease-out hover:brightness-125 active:scale-95"
              style={{
                padding: '6px 12px',
                background: active
                  ? `${cat.color}20`
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${active ? `${cat.color}66` : 'rgba(255,255,255,0.1)'}`,
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
  );
}
