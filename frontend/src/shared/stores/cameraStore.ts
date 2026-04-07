import { create } from 'zustand';

export type VisibilityTier = 'GLOBAL' | 'CONTINENTAL' | 'REGIONAL' | 'LOCAL';

function computeTier(altitude: number): VisibilityTier {
  if (altitude > 2.0) return 'GLOBAL';
  if (altitude > 1.0) return 'CONTINENTAL';
  if (altitude > 0.4) return 'REGIONAL';
  return 'LOCAL';
}

interface CameraState {
  altitude: number;
  tier: VisibilityTier;
  setCameraAltitude: (altitude: number) => void;
}

export const useCameraStore = create<CameraState>((set, get) => ({
  altitude: 2.5,
  tier: 'GLOBAL',
  setCameraAltitude: (altitude: number) => {
    const newTier = computeTier(altitude);
    const prev = get();
    // Only trigger re-render if tier changed or altitude shifted meaningfully
    if (newTier !== prev.tier || Math.abs(altitude - prev.altitude) > 0.02) {
      set({ altitude, tier: newTier });
    }
  },
}));
