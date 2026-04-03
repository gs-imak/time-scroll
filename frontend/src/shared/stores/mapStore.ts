import { create } from 'zustand';

interface Viewport {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
}

interface MapStore {
  viewport: Viewport;
  selectedLocationId: string | null;
  mapReady: boolean;

  setViewport: (v: Partial<Viewport>) => void;
  selectLocation: (id: string | null) => void;
  setMapReady: (ready: boolean) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  viewport: { center: [0, 30], zoom: 1.5, bearing: 0, pitch: 0 },
  selectedLocationId: null,
  mapReady: false,

  setViewport: (v) => set(s => ({ viewport: { ...s.viewport, ...v } })),
  selectLocation: (id) => set({ selectedLocationId: id }),
  setMapReady: (ready) => set({ mapReady: ready }),
}));
