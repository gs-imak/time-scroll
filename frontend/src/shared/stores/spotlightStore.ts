import { create } from 'zustand';
import { CIV_ALIASES, buildAliasSet } from '@/shared/data/civAliases';
import { computeSnapshotYearsForCiv } from '@/shared/data/geoJsonCache';

interface SpotlightStore {
  // Core state
  active: boolean;
  civId: string | null;
  displayName: string | null;
  civColor: string | null;
  aliasSet: Set<string>;
  centerLat: number;
  centerLng: number;

  // Playback
  isPlaying: boolean;
  playSpeed: number; // 1, 2, 3
  snapshotYears: number[];
  currentSnapshotIndex: number;

  // Actions
  enterSpotlight: (civId: string) => void;
  exitSpotlight: () => void;
  togglePlay: () => void;
  setPlaySpeed: (speed: number) => void;
  stepForward: () => void;
  stepBackward: () => void;
  setSnapshotIndex: (index: number) => void;
  jumpToStart: () => void;
  jumpToEnd: () => void;
}

export const useSpotlightStore = create<SpotlightStore>((set, get) => ({
  active: false,
  civId: null,
  displayName: null,
  civColor: null,
  aliasSet: new Set(),
  centerLat: 0,
  centerLng: 0,

  isPlaying: false,
  playSpeed: 1,
  snapshotYears: [],
  currentSnapshotIndex: 0,

  enterSpotlight: (civId) => {
    const civ = CIV_ALIASES[civId];
    if (!civ) return;

    const aliasSet = buildAliasSet(civId);
    const snapshotYears = computeSnapshotYearsForCiv(aliasSet);

    set({
      active: true,
      civId,
      displayName: civ.displayName,
      civColor: civ.color,
      aliasSet,
      centerLat: civ.center.lat,
      centerLng: civ.center.lng,
      snapshotYears,
      currentSnapshotIndex: 0,
      isPlaying: false,
    });
  },

  exitSpotlight: () => {
    set({
      active: false,
      civId: null,
      displayName: null,
      civColor: null,
      aliasSet: new Set(),
      snapshotYears: [],
      currentSnapshotIndex: 0,
      isPlaying: false,
    });
  },

  togglePlay: () => set(s => ({ isPlaying: !s.isPlaying })),

  setPlaySpeed: (speed) => set({ playSpeed: speed }),

  stepForward: () => {
    const { currentSnapshotIndex, snapshotYears } = get();
    if (currentSnapshotIndex < snapshotYears.length - 1) {
      set({ currentSnapshotIndex: currentSnapshotIndex + 1 });
    }
  },

  stepBackward: () => {
    const { currentSnapshotIndex } = get();
    if (currentSnapshotIndex > 0) {
      set({ currentSnapshotIndex: currentSnapshotIndex - 1 });
    }
  },

  setSnapshotIndex: (index) => {
    const { snapshotYears } = get();
    if (index >= 0 && index < snapshotYears.length) {
      set({ currentSnapshotIndex: index });
    }
  },

  jumpToStart: () => set({ currentSnapshotIndex: 0 }),

  jumpToEnd: () => {
    const { snapshotYears } = get();
    set({ currentSnapshotIndex: Math.max(0, snapshotYears.length - 1) });
  },
}));
