import { useCallback } from 'react';
import { useGlobe } from './globeContext';

export function useGlobeCamera() {
  const { globeRef } = useGlobe();

  const flyTo = useCallback(
    (lng: number, lat: number, zoom = 6) => {
      if (!globeRef?.current) return;

      // Convert Mapbox-style zoom to globe altitude
      // zoom 1.5 ≈ altitude 2.5 (whole earth)
      // zoom 6 ≈ altitude 0.5 (region)
      // zoom 8 ≈ altitude 0.2 (city)
      const altitude = Math.max(0.1, 3.0 / Math.pow(1.5, zoom - 1.5));

      globeRef.current.pointOfView({ lat, lng, altitude }, 1500);

      // Stop auto-rotation when user navigates
      const controls = globeRef.current.controls();
      if (controls) controls.autoRotate = false;
    },
    [globeRef]
  );

  const resetView = useCallback(() => {
    if (!globeRef?.current) return;
    globeRef.current.pointOfView({ lat: 30, lng: 0, altitude: 2.5 }, 1500);

    const controls = globeRef.current.controls();
    if (controls) controls.autoRotate = true;
  }, [globeRef]);

  return { flyTo, resetView };
}
