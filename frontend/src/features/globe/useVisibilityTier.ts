import { useMemo } from 'react';
import { useCameraStore } from '@/shared/stores/cameraStore';
import { useSpotlightStore } from '@/shared/stores/spotlightStore';
import { useEventsStore } from '@/shared/stores/eventsStore';
import type { CivilizationLabel } from '@/shared/data/civilizationLabels';
import type { HistoricalEvent } from '@/shared/types/events';

const MAJOR_CIV_THRESHOLD = 3; // civs with 3+ events shown at CONTINENTAL

export function useVisibilityTier(
  allLabels: CivilizationLabel[],
  allEvents: HistoricalEvent[],
) {
  const tier = useCameraStore(s => s.tier);
  const spotlightActive = useSpotlightStore(s => s.active);
  const selectedEventId = useEventsStore(s => s.selectedEventId);

  const filteredLabels = useMemo(() => {
    // Hide labels during spotlight — the spotlight overlay handles its own UI
    if (spotlightActive) return [];

    switch (tier) {
      case 'GLOBAL':
        return [];
      case 'CONTINENTAL':
        return allLabels.filter(l => l.importance >= MAJOR_CIV_THRESHOLD);
      default:
        return allLabels;
    }
  }, [allLabels, tier, spotlightActive]);

  const filteredEvents = useMemo(() => {
    // Hide all event markers during spotlight mode
    if (spotlightActive) return [];

    switch (tier) {
      case 'GLOBAL':
      case 'CONTINENTAL':
        // Still show the selected event so flyTo works
        if (selectedEventId) {
          const selected = allEvents.find(e => e.id === selectedEventId);
          return selected ? [selected] : [];
        }
        return [];
      default:
        return allEvents;
    }
  }, [allEvents, tier, spotlightActive, selectedEventId]);

  return { filteredLabels, filteredEvents, tier };
}
