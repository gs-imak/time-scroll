import { create } from 'zustand';

export type VisibilityTier = 'GLOBAL' | 'CONTINENTAL' | 'REGIONAL' | 'LOCAL';

function computeTier(altitude: number): VisibilityTier {
  if (altitude > 2.0) return 'GLOBAL';
  if (altitude > 1.0) return 'CONTINENTAL';
  if (altitude > 0.4) return 'REGIONAL';
  return 'LOCAL';
}

/**
 * Convert a react-globe.gl camera altitude (distance from the surface in units
 * of globe radius; lower = closer) into the "zoom" scale that Landmark
 * `triggerZoom` thresholds are expressed in.
 *
 * Formula: `zoom = 2 / altitude`, clamped so a near-zero altitude can't blow up.
 * Calibrated so that `triggerZoom` 5.0 corresponds to altitude 0.4 — the app's
 * event fly-to altitude and the REGIONAL↔LOCAL tier boundary, i.e. an
 * unambiguous "zoomed right into a place" state. Reference points:
 *   - altitude 2.5 (default globe view)     → zoom 0.8
 *   - altitude 0.4 (event fly-to / LOCAL)    → zoom 5.0
 *   - altitude 0.2 (very close)              → zoom 10
 */
export function altitudeToZoom(altitude: number): number {
  return 2 / Math.max(altitude, 0.05);
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
