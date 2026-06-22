import { create } from 'zustand';
import type { Era } from '@/shared/types/timeline';
import { ERAS, MIN_YEAR, MAX_YEAR, getEraForYear } from '@/shared/utils/constants';

interface TimeStore {
  currentYear: number;
  currentEra: Era;
  isPlaying: boolean;
  playbackSpeed: number;

  setYear: (year: number) => void;
  setEra: (era: Era) => void;
  nextEra: () => void;
  prevEra: () => void;
  togglePlay: () => void;
  setPlaybackSpeed: (speed: number) => void;
}

export const useTimeStore = create<TimeStore>((set, get) => ({
  currentYear: -3000,
  currentEra: ERAS[1]!,
  isPlaying: false,
  playbackSpeed: 1,

  setYear: (year: number) => {
    const clamped = Math.max(MIN_YEAR, Math.min(MAX_YEAR, year));
    const era = getEraForYear(clamped);
    set({ currentYear: clamped, currentEra: era });
  },

  setEra: (era: Era) => {
    set({ currentEra: era, currentYear: era.startYear });
  },

  nextEra: () => {
    const { currentEra } = get();
    const idx = ERAS.findIndex(e => e.id === currentEra.id);
    if (idx < ERAS.length - 1) {
      const next = ERAS[idx + 1]!;
      set({ currentEra: next, currentYear: next.startYear });
    }
  },

  prevEra: () => {
    const { currentEra } = get();
    const idx = ERAS.findIndex(e => e.id === currentEra.id);
    if (idx > 0) {
      const prev = ERAS[idx - 1]!;
      set({ currentEra: prev, currentYear: prev.startYear });
    }
  },

  togglePlay: () => set(s => ({ isPlaying: !s.isPlaying })),
  setPlaybackSpeed: (speed: number) => set({ playbackSpeed: speed }),
}));
