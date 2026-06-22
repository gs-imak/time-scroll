import { EVENT_CIVILIZATION } from './civilizationAssets';
import { SEED_EVENTS, ERAS, findEraForYear, getEraById } from '@/shared/utils/constants';

export interface CivilizationLabel {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  eventIds: string[];
  importance: number;
}

/**
 * Deduplicates civilizations from EVENT_CIVILIZATION by slug.
 * Returns one label per civilization with its center coords and all mapped event IDs.
 */
function buildAllCivilizationLabels(): CivilizationLabel[] {
  const bySlug = new Map<string, CivilizationLabel>();

  for (const [eventId, pack] of Object.entries(EVENT_CIVILIZATION)) {
    const existing = bySlug.get(pack.slug);
    if (existing) {
      existing.eventIds.push(eventId);
      existing.importance = existing.eventIds.length;
    } else {
      bySlug.set(pack.slug, {
        slug: pack.slug,
        name: pack.name,
        lat: pack.center.lat,
        lng: pack.center.lng,
        eventIds: [eventId],
        importance: 1,
      });
    }
  }

  return Array.from(bySlug.values());
}

export const ALL_CIVILIZATION_LABELS = buildAllCivilizationLabels();

/**
 * Returns civilization labels relevant to the current year.
 * A civilization is visible if at least one of its events belongs to the current
 * era or the era before it (same logic as event visibility in eventsStore).
 */
export function getVisibleCivilizationLabels(currentYear: number): CivilizationLabel[] {
  const currentEra = findEraForYear(currentYear);
  if (!currentEra) return [];

  const currentEraIdx = ERAS.indexOf(currentEra);

  return ALL_CIVILIZATION_LABELS.filter(civ => {
    return civ.eventIds.some(eventId => {
      const event = SEED_EVENTS.find(e => e.id === eventId);
      if (!event) return false;
      if (event.year > currentYear) return false;

      const eventEra = getEraById(event.eraId);
      if (!eventEra) return false;

      const eventEraIdx = ERAS.indexOf(eventEra);
      return eventEraIdx <= currentEraIdx && eventEraIdx >= currentEraIdx - 1;
    });
  });
}
