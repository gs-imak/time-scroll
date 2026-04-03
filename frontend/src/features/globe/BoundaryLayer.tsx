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
const HIGHLIGHT_LAYER_ID = 'boundaries-highlight';

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

        // Remove existing layers
        if (map.getLayer(HIGHLIGHT_LAYER_ID)) map.removeLayer(HIGHLIGHT_LAYER_ID);
        if (map.getLayer(LINE_LAYER_ID)) map.removeLayer(LINE_LAYER_ID);
        if (map.getLayer(FILL_LAYER_ID)) map.removeLayer(FILL_LAYER_ID);
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);

        map.addSource(SOURCE_ID, { type: 'geojson', data: geojson });

        // Subtle fill
        map.addLayer({
          id: FILL_LAYER_ID,
          type: 'fill',
          source: SOURCE_ID,
          paint: {
            'fill-color': currentEra.accentColor,
            'fill-opacity': 0.15,
          },
        });

        // Border lines — visible and colored
        map.addLayer({
          id: LINE_LAYER_ID,
          type: 'line',
          source: SOURCE_ID,
          paint: {
            'line-color': currentEra.accentColor,
            'line-width': [
              'interpolate', ['linear'], ['zoom'],
              1, 0.8,
              4, 1.5,
              8, 2.5,
            ],
            'line-opacity': 0.6,
          },
        });

        // Hover highlight
        map.addLayer({
          id: HIGHLIGHT_LAYER_ID,
          type: 'fill',
          source: SOURCE_ID,
          paint: {
            'fill-color': currentEra.accentColor,
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.3,
              0,
            ],
          },
        });

        loadedFileRef.current = fileName;
      } catch (err) {
        console.error('Failed to load boundary data:', err);
      }
    })();
  }, [map, currentYear, currentEra]);

  // Update colors when era changes
  useEffect(() => {
    if (!map) return;
    if (map.getLayer(FILL_LAYER_ID)) {
      map.setPaintProperty(FILL_LAYER_ID, 'fill-color', currentEra.accentColor);
    }
    if (map.getLayer(LINE_LAYER_ID)) {
      map.setPaintProperty(LINE_LAYER_ID, 'line-color', currentEra.accentColor);
    }
    if (map.getLayer(HIGHLIGHT_LAYER_ID)) {
      map.setPaintProperty(HIGHLIGHT_LAYER_ID, 'fill-color', currentEra.accentColor);
    }
  }, [map, currentEra]);

  // Hover interaction
  useEffect(() => {
    if (!map) return;
    let hoveredId: string | number | null = null;

    const onMouseMove = (e: mapboxgl.MapMouseEvent) => {
      if (!map.getLayer(FILL_LAYER_ID)) return;
      const features = map.queryRenderedFeatures(e.point, { layers: [FILL_LAYER_ID] });
      if (features.length > 0) {
        if (hoveredId !== null) {
          map.setFeatureState({ source: SOURCE_ID, id: hoveredId }, { hover: false });
        }
        hoveredId = features[0]!.id ?? null;
        if (hoveredId !== null) {
          map.setFeatureState({ source: SOURCE_ID, id: hoveredId }, { hover: true });
        }
        map.getCanvas().style.cursor = 'pointer';
      } else {
        if (hoveredId !== null) {
          map.setFeatureState({ source: SOURCE_ID, id: hoveredId }, { hover: false });
        }
        hoveredId = null;
        map.getCanvas().style.cursor = '';
      }
    };

    const onMouseLeave = () => {
      if (hoveredId !== null) {
        map.setFeatureState({ source: SOURCE_ID, id: hoveredId }, { hover: false });
      }
      hoveredId = null;
      map.getCanvas().style.cursor = '';
    };

    map.on('mousemove', onMouseMove);
    map.on('mouseleave', onMouseLeave);

    return () => {
      map.off('mousemove', onMouseMove);
      map.off('mouseleave', onMouseLeave);
    };
  }, [map]);

  return null;
}
