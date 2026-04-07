import { useMemo } from 'react';
import { useCameraStore } from '@/shared/stores/cameraStore';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { haversineDistance } from '@/shared/utils/geo';
import type { HistoricalEvent } from '@/shared/types/events';

// ── Types ─────────────────────────────────────────────────────────

export interface EventCluster {
  type: 'cluster';
  id: string;
  lat: number;
  lng: number;
  count: number;
  dominantCategory: string;
  events: HistoricalEvent[];
}

export interface SpreadEvent extends HistoricalEvent {
  type: 'event';
  /** Display coordinates — offset from original when spiderfied */
  displayLat: number;
  displayLng: number;
}

export type ClusterOrEvent = EventCluster | SpreadEvent;

// ── Spiderfying ───────────────────────────────────────────────────
// When markers are close together at zoomed-in levels, fan them out
// in a circle/spiral so they don't overlap.

const CIRCLE_SPIRAL_SWITCHOVER = 9;

function spiderfyGroup(
  events: HistoricalEvent[],
  centerLat: number,
  centerLng: number,
  separationDeg: number,
): SpreadEvent[] {
  const count = events.length;

  if (count <= 1) {
    return events.map(e => ({
      ...e,
      type: 'event' as const,
      displayLat: e.latitude,
      displayLng: e.longitude,
    }));
  }

  // Correct for longitude convergence at this latitude
  const lngCorrection = Math.cos(centerLat * Math.PI / 180) || 0.01;

  if (count <= CIRCLE_SPIRAL_SWITCHOVER) {
    // Circle layout
    const angleStep = (2 * Math.PI) / count;
    return events.map((e, i) => {
      const angle = i * angleStep - Math.PI / 2; // start from top
      return {
        ...e,
        type: 'event' as const,
        displayLat: centerLat + separationDeg * Math.cos(angle),
        displayLng: centerLng + (separationDeg * Math.sin(angle)) / lngCorrection,
      };
    });
  }

  // Spiral layout for 9+ markers
  const results: SpreadEvent[] = [];
  let legLength = separationDeg * 0.6;
  let angle = 0;
  const spiralStep = separationDeg * 1.2;

  for (let i = 0; i < count; i++) {
    angle += spiralStep / legLength + i * 0.0005;
    results.push({
      ...events[i]!,
      type: 'event' as const,
      displayLat: centerLat + legLength * Math.cos(angle),
      displayLng: centerLng + (legLength * Math.sin(angle)) / lngCorrection,
    });
    legLength += (2 * Math.PI * separationDeg * 0.25) / angle;
  }

  return results;
}

// ── Clustering ────────────────────────────────────────────────────

function clusterEvents(
  events: HistoricalEvent[],
  thresholdKm: number,
  selectedEventId: string | null,
): EventCluster[] {
  if (events.length === 0) return [];

  const claimed = new Set<number>();
  const clusters: EventCluster[] = [];

  for (let i = 0; i < events.length; i++) {
    if (claimed.has(i)) continue;

    const anchor = events[i]!;

    // Never cluster the selected event
    if (anchor.id === selectedEventId) {
      claimed.add(i);
      continue;
    }

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

    if (neighbors.length >= 2) {
      const members = neighbors.map(idx => events[idx]!);
      neighbors.forEach(idx => claimed.add(idx));

      const lat = members.reduce((s, e) => s + e.latitude, 0) / members.length;
      const lng = members.reduce((s, e) => s + e.longitude, 0) / members.length;

      const catCount: Record<string, number> = {};
      for (const m of members) {
        catCount[m.category] = (catCount[m.category] || 0) + 1;
      }
      const dominantCategory = Object.entries(catCount)
        .sort((a, b) => b[1] - a[1])[0]![0];

      clusters.push({
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

  return clusters;
}

// ── Spiderfy pass ─────────────────────────────────────────────────
// At zoomed-in levels, detect groups of close markers and spread them

function spiderfyEvents(
  events: HistoricalEvent[],
  proximityKm: number,
  separationDeg: number,
): SpreadEvent[] {
  if (events.length === 0) return [];

  const claimed = new Set<number>();
  const results: SpreadEvent[] = [];

  for (let i = 0; i < events.length; i++) {
    if (claimed.has(i)) continue;

    const anchor = events[i]!;
    const neighbors: number[] = [i];

    for (let j = i + 1; j < events.length; j++) {
      if (claimed.has(j)) continue;
      const dist = haversineDistance(
        anchor.latitude, anchor.longitude,
        events[j]!.latitude, events[j]!.longitude,
      );
      if (dist <= proximityKm) {
        neighbors.push(j);
      }
    }

    if (neighbors.length === 1) {
      // Solo marker — no offset needed
      claimed.add(i);
      results.push({
        ...anchor,
        type: 'event' as const,
        displayLat: anchor.latitude,
        displayLng: anchor.longitude,
      });
    } else {
      // Group of close markers — spiderfy them
      const group = neighbors.map(idx => events[idx]!);
      neighbors.forEach(idx => claimed.add(idx));

      const centerLat = group.reduce((s, e) => s + e.latitude, 0) / group.length;
      const centerLng = group.reduce((s, e) => s + e.longitude, 0) / group.length;

      results.push(...spiderfyGroup(group, centerLat, centerLng, separationDeg));
    }
  }

  return results;
}

// ── Main hook ─────────────────────────────────────────────────────

export function useEventClustering(events: HistoricalEvent[]): ClusterOrEvent[] {
  const altitude = useCameraStore(s => s.altitude);
  const tier = useCameraStore(s => s.tier);
  const selectedEventId = useEventsStore(s => s.selectedEventId);

  return useMemo(() => {
    if (events.length === 0) return [];

    // At REGIONAL/LOCAL zoom — spiderfy close markers instead of clustering
    if (tier === 'LOCAL' || tier === 'REGIONAL') {
      // Scale proximity detection and spread radius with altitude
      // Lower altitude = tighter detection, smaller spread (more precise)
      const proximityKm = Math.max(50, altitude * 400);
      // Separation in degrees — how far apart spiderfied markers spread
      const separationDeg = Math.max(0.8, altitude * 3);

      const spread = spiderfyEvents(events, proximityKm, separationDeg);

      // If there's a selected event, ensure it stays at its real position
      if (selectedEventId) {
        const idx = spread.findIndex(e => e.id === selectedEventId);
        if (idx >= 0) {
          const sel = spread[idx]!;
          spread[idx] = { ...sel, displayLat: sel.latitude, displayLng: sel.longitude };
        }
      }

      return spread;
    }

    // At GLOBAL/CONTINENTAL zoom — cluster into count badges
    const thresholdKm = altitude * 800;
    const clusters = clusterEvents(events, thresholdKm, selectedEventId);

    // Any unclaimed events (solo markers or selected event) become individual SpreadEvents
    const clusteredIds = new Set(clusters.flatMap(c => c.events.map(e => e.id)));
    const soloEvents: SpreadEvent[] = events
      .filter(e => !clusteredIds.has(e.id))
      .map(e => ({
        ...e,
        type: 'event' as const,
        displayLat: e.latitude,
        displayLng: e.longitude,
      }));

    return [...clusters, ...soloEvents];
  }, [events, altitude, tier, selectedEventId]);
}
