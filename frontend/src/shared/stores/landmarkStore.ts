import { create } from 'zustand';
import { LANDMARKS } from '@/shared/utils/constants';
import { haversineDistance } from '@/shared/utils/geo';
import type { Landmark, LandmarkTimePeriod } from '@/shared/types/landmarks';

interface LandmarkVisibility {
  landmark: Landmark;
  visible: boolean;
  currentPeriod: LandmarkTimePeriod | null;
}

interface LandmarkStore {
  landmarks: Landmark[];
  getLandmarkVisibility: (
    year: number,
    zoom: number,
    centerLat: number,
    centerLng: number
  ) => LandmarkVisibility[];
}

export const useLandmarkStore = create<LandmarkStore>(() => ({
  landmarks: LANDMARKS,

  getLandmarkVisibility: (year, zoom, centerLat, centerLng) => {
    return LANDMARKS.map(lm => {
      const distance = haversineDistance(centerLat, centerLng, lm.latitude, lm.longitude);
      const visible = zoom >= lm.triggerZoom && distance <= lm.triggerRadius;

      const currentPeriod = lm.timePeriods.find(
        tp => year >= tp.startYear && year <= tp.endYear
      ) ?? null;

      return { landmark: lm, visible: visible && currentPeriod !== null, currentPeriod };
    });
  },
}));
