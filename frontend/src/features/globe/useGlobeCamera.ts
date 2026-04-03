import { useCallback } from 'react';
import { useMap } from './GlobeView';

export function useGlobeCamera() {
  const { map } = useMap();

  const flyTo = useCallback(
    (lng: number, lat: number, zoom = 6) => {
      map?.flyTo({
        center: [lng, lat],
        zoom,
        speed: 0.5,
        curve: 1.9,
        essential: true,
      });
    },
    [map]
  );

  const resetView = useCallback(() => {
    map?.flyTo({
      center: [0, 30],
      zoom: 1.5,
      speed: 0.8,
      essential: true,
    });
  }, [map]);

  return { flyTo, resetView };
}
