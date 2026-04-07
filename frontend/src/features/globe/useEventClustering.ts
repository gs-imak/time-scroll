import { useMemo } from 'react';
import { useCameraStore } from '@/shared/stores/cameraStore';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { haversineDistance } from '@/shared/utils/geo';
import type { HistoricalEvent } from '@/shared/types/events';

export interface EventCluster {
  type: 'cluster';
  id: string;
  lat: number;
  lng: number;
  count: number;
  dominantCategory: string;
  events: HistoricalEvent[];
}

export interface SingleEvent extends HistoricalEvent {
  type: 'event';
}

export type ClusterOrEvent = EventCluster | SingleEvent;

function clusterEvents(
  events: HistoricalEvent[],
  thresholdKm: number,
  selectedEventId: string | null,
): ClusterOrEvent[] {
  if (events.length === 0) return [];

  const claimed = new Set<number>();
  const results: ClusterOrEvent[] = [];

  for (let i = 0; i < events.length; i++) {
    if (claimed.has(i)) continue;

    const anchor = events[i]!;

    // Never cluster the selected event — always show it individually
    if (anchor.id === selectedEventId) {
      results.push({ ...anchor, type: 'event' });
      claimed.add(i);
      continue;
    }

    // Find neighbors within threshold
    const neighbors: number[] = [i];
    for (let j = i + 1; j < events.length; j++) {
      if (claimed.has(j)) continue;
      if (events[j]!.id === selectedEventId) continue;

      const dist = haversineDistance(
        anchor.latitude, anchor.longitude,
        events[j]!.latitude, events[j]!.longitude,
      );
      if (dist <= thresholdKm) {
        neighbors.push(j);
      }
    }

    if (neighbors.length === 1) {
      // No neighbors — solo event
      results.push({ ...anchor, type: 'event' });
      claimed.add(i);
    } else {
      // Form cluster
      const members = neighbors.map(idx => events[idx]!);
      neighbors.forEach(idx => claimed.add(idx));

      // Centroid
      const lat = members.reduce((s, e) => s + e.latitude, 0) / members.length;
      const lng = members.reduce((s, e) => s + e.longitude, 0) / members.length;

      // Dominant category
      const catCount: Record<string, number> = {};
      for (const m of members) {
        catCount[m.category] = (catCount[m.category] || 0) + 1;
      }
      const dominantCategory = Object.entries(catCount)
        .sort((a, b) => b[1] - a[1])[0]![0];

      results.push({
        type: 'cluster',
        id: `cluster-${anchor.id}`,
        lat,
        lng,
        count: members.length,
        dominantCategory,
        events: members,
      });
    }
  }

  return results;
}

export function useEventClustering(events: HistoricalEvent[]): ClusterOrEvent[] {
  const altitude = useCameraStore(s => s.altitude);
  const tier = useCameraStore(s => s.tier);
  const selectedEventId = useEventsStore(s => s.selectedEventId);

  return useMemo(() => {
    // At LOCAL zoom, show all individual markers — no clustering
    if (tier === 'LOCAL') {
      return events.map(e => ({ ...e, type: 'event' as const }));
    }

    // Scale threshold with altitude: higher = more aggressive clustering
    const thresholdKm = altitude * 800;
    return clusterEvents(events, thresholdKm, selectedEventId);
  }, [events, altitude, tier, selectedEventId]);
}
