import { create } from 'zustand';
import { WWI_YEARS, WWII_YEARS } from '@/shared/data/warEvents';

export interface DiffOverlay {
  id: string;
  kind: 'gained' | 'lost';
  lat: number;
  lng: number;
  bornAt: number; // ms timestamp, used for fade animation
}

export interface ConflictPulse {
  id: string;
  lat: number;
  lng: number;
  bornAt: number;
}

interface WarStore {
  active: boolean;
  activeWar: 'wwi' | 'wwii' | null;
  snapshotYears: readonly number[];
  currentIndex: number;

  isPlaying: boolean;
  playSpeed: 1 | 2 | 3;

  diffOverlays: DiffOverlay[];
  pulses: ConflictPulse[];

  enterWar: (war: 'wwi' | 'wwii') => void;
  exit: () => void;
  togglePlay: () => void;
  setIndex: (i: number) => void;
  stepForward: () => void;
  stepBackward: () => void;
  setPlaySpeed: (s: 1 | 2 | 3) => void;
  jumpToStart: () => void;
  jumpToEnd: () => void;

  // FX layer plumbing
  setDiffOverlays: (overlays: DiffOverlay[]) => void;
  addPulses: (pulses: ConflictPulse[]) => void;
  pruneFx: (now: number) => void;
}

export const DIFF_LIFETIME_MS = 2500;
export const PULSE_LIFETIME_MS = 1800;

export const useWarStore = create<WarStore>((set, get) => ({
  active: false,
  activeWar: null,
  snapshotYears: [],
  currentIndex: 0,
  isPlaying: false,
  playSpeed: 1,
  diffOverlays: [],
  pulses: [],

  enterWar: (war) => {
    const years = war === 'wwi' ? WWI_YEARS : WWII_YEARS;
    set({
      active: true,
      activeWar: war,
      snapshotYears: years,
      currentIndex: 0,
      isPlaying: false,
      diffOverlays: [],
      pulses: [],
    });
  },

  exit: () =>
    set({
      active: false,
      activeWar: null,
      snapshotYears: [],
      currentIndex: 0,
      isPlaying: false,
      diffOverlays: [],
      pulses: [],
    }),

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  setIndex: (i) => {
    const { snapshotYears } = get();
    if (i >= 0 && i < snapshotYears.length) set({ currentIndex: i });
  },

  stepForward: () => {
    const { currentIndex, snapshotYears } = get();
    if (currentIndex < snapshotYears.length - 1) set({ currentIndex: currentIndex + 1 });
  },

  stepBackward: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) set({ currentIndex: currentIndex - 1 });
  },

  setPlaySpeed: (s) => set({ playSpeed: s }),

  jumpToStart: () => set({ currentIndex: 0 }),

  jumpToEnd: () => {
    const { snapshotYears } = get();
    set({ currentIndex: Math.max(0, snapshotYears.length - 1) });
  },

  setDiffOverlays: (overlays) => set({ diffOverlays: overlays }),

  addPulses: (pulses) => set((s) => ({ pulses: [...s.pulses, ...pulses] })),

  pruneFx: (now) => {
    const { diffOverlays, pulses } = get();
    const nextOverlays = diffOverlays.filter((o) => now - o.bornAt < DIFF_LIFETIME_MS);
    const nextPulses = pulses.filter((p) => now - p.bornAt < PULSE_LIFETIME_MS);
    if (nextOverlays.length !== diffOverlays.length || nextPulses.length !== pulses.length) {
      set({ diffOverlays: nextOverlays, pulses: nextPulses });
    }
  },
}));
