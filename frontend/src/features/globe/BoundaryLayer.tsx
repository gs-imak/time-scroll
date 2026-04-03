import { useEffect, useRef } from 'react';
import { useMap } from './GlobeView';
import { useTimeStore } from '@/shared/stores/timeStore';
import { closestBoundaryYear } from '@/shared/utils/geo';
import { BOUNDARY_YEAR_MAP } from '@/shared/utils/constants';

const SORTED_YEARS = Object.keys(BOUNDARY_YEAR_MAP)
  .map(Number)
  .sort((a, b) => a - b);

const SOURCE_ID = 'historical-boundaries';
const FILL_LAYER_ID = 'boundaries-fill';
const LINE_LAYER_ID = 'boundaries-line';

export function BoundaryLayer() {
  const { map } = useMap();
  const currentYear = useTimeStore(s => s.currentYear);
  const currentEra = useTimeStore(s => s.currentEra);
  const loadedFileRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map) return;

    const year = closestBoundaryYear(currentYear, SORTED_YEARS);
    const fileName = BOUNDARY_YEAR_MAP[year];
    if (!fileName || fileName === loadedFileRef.current) return;

    const url = `/assets/geo/${fileName}.geojson`;

    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const geojson = await res.json();

        if (map.getLayer(FILL_LAYER_ID)) map.removeLayer(FILL_LAYER_ID);
        if (map.getLayer(LINE_LAYER_ID)) map.removeLayer(LINE_LAYER_ID);
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);

        map.addSource(SOURCE_ID, { type: 'geojson', data: geojson });

        map.addLayer({
          id: FILL_LAYER_ID,
          type: 'fill',
          source: SOURCE_ID,
          paint: {
            'fill-color': currentEra.accentColor,
            'fill-opacity': 0.08,
          },
        });

        map.addLayer({
          id: LINE_LAYER_ID,
          type: 'line',
          source: SOURCE_ID,
          paint: {
            'line-color': currentEra.accentColor,
            'line-width': 1,
            'line-opacity': 0.4,
          },
        });

        loadedFileRef.current = fileName;
      } catch (err) {
        console.error('Failed to load boundary data:', err);
      }
    })();
  }, [map, currentYear, currentEra]);

  useEffect(() => {
    if (!map) return;
    if (map.getLayer(FILL_LAYER_ID)) {
      map.setPaintProperty(FILL_LAYER_ID, 'fill-color', currentEra.accentColor);
    }
    if (map.getLayer(LINE_LAYER_ID)) {
      map.setPaintProperty(LINE_LAYER_ID, 'line-color', currentEra.accentColor);
    }
  }, [map, currentEra]);

  return null;
}
