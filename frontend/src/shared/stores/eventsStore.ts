import { create } from 'zustand';
import type { HistoricalEvent, EventCategory } from '@/shared/types/events';
import { SEED_EVENTS } from '@/shared/utils/constants';

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
  events: SEED_EVENTS,
  selectedEventId: null,
  filters: { categories: [], eraId: null },

  selectEvent: (id) => set({ selectedEventId: id }),
  setFilters: (f) => set(s => ({ filters: { ...s.filters, ...f } })),

  getVisibleEvents: (year: number) => {
    const { events, filters } = get();
    return events.filter(e => {
      if (e.year > year) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(e.category)) return false;
      if (filters.eraId && e.eraId !== filters.eraId) return false;
      return true;
    });
  },
}));
