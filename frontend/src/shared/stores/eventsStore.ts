import { create } from 'zustand';
import type { HistoricalEvent, EventCategory } from '@/shared/types/events';
import { SEED_EVENTS, ERAS } from '@/shared/utils/constants';

interface EventFilters {
  categories: EventCategory[];
  eraId: string | null;
}

interface EventsStore {
  events: HistoricalEvent[];
  selectedEventId: string | null;
  filters: EventFilters;

  selectEvent: (id: string | null) => void;
  setFilters: (filters: Partial<EventFilters>) => void;
  getVisibleEvents: (year: number) => HistoricalEvent[];
}

// Find which era a year belongs to
function getEraForYear(year: number) {
  return ERAS.find(era => year >= era.startYear && year < era.endYear);
}

export const useEventsStore = create<EventsStore>((set, get) => ({
  events: SEED_EVENTS,
  selectedEventId: null,
  filters: { categories: [], eraId: null },

  selectEvent: (id) => set({ selectedEventId: id }),
  setFilters: (f) => set(s => ({ filters: { ...s.filters, ...f } })),

  getVisibleEvents: (year: number) => {
    const { events, filters } = get();
    const currentEra = getEraForYear(year);

    return events.filter(e => {
      // Only show events from the current era + the one before it
      // This prevents 97 markers from stacking at modern times
      if (currentEra) {
        const eventEra = ERAS.find(era => era.id === e.eraId);
        if (eventEra) {
          const currentEraIdx = ERAS.indexOf(currentEra);
          const eventEraIdx = ERAS.indexOf(eventEra);
          // Show current era and one era before (for context)
          if (eventEraIdx > currentEraIdx || eventEraIdx < currentEraIdx - 1) return false;
        }
      }
      // Within allowed eras, only show events up to the current year
      if (e.year > year) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(e.category)) return false;
      if (filters.eraId && e.eraId !== filters.eraId) return false;
      return true;
    });
  },
}));
