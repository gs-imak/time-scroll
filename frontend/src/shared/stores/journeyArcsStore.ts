import { create } from 'zustand';

export interface ArcDatum {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
}

interface JourneyArcsStore {
  arcs: ArcDatum[];
  setArcs: (arcs: ArcDatum[]) => void;
  clearArcs: () => void;
}

export const useJourneyArcsStore = create<JourneyArcsStore>((set) => ({
  arcs: [],
  setArcs: (arcs) => set({ arcs }),
  clearArcs: () => set({ arcs: [] }),
}));
