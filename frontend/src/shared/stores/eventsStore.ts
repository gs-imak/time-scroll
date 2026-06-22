import { create } from 'zustand';
import type { HistoricalEvent, EventCategory } from '@/shared/types/events';
import { SEED_EVENTS, ERAS, findEraForYear, getEraById } from '@/shared/utils/constants';
import { NEW_EVENTS } from '@/shared/data/newEvents';
import { WAR_EVENTS } from '@/shared/data/warEvents';

// Merge seed events + new events + war events, deduplicate by id
const ALL_EVENTS: HistoricalEvent[] = [
  ...SEED_EVENTS,
  ...NEW_EVENTS.filter(ne => !SEED_EVENTS.some(se => se.id === ne.id)),
  ...WAR_EVENTS.filter(
    we => !SEED_EVENTS.some(se => se.id === we.id) && !NEW_EVENTS.some(ne => ne.id === we.id),
  ),
];

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

export const useEventsStore = create<EventsStore>((set, get) => ({
  events: ALL_EVENTS,
  selectedEventId: null,
  filters: { categories: [], eraId: null },

  selectEvent: (id) => set({ selectedEventId: id }),
  setFilters: (f) => set(s => ({ filters: { ...s.filters, ...f } })),

  getVisibleEvents: (year: number) => {
    const { events, filters } = get();
    const currentEra = findEraForYear(year);

    return events.filter(e => {
      // Only show events from the current era + the one before it
      // This prevents 97 markers from stacking at modern times
      if (currentEra) {
        const eventEra = getEraById(e.eraId);
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
