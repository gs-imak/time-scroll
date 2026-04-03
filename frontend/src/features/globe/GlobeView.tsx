import { useEffect, useRef, useState, createContext, useContext, type ReactNode } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapStore } from '@/shared/stores/mapStore';

interface MapContextValue {
  map: mapboxgl.Map | null;
}

const MapContext = createContext<MapContextValue>({ map: null });
export const useMap = () => useContext(MapContext);

interface GlobeViewProps {
  children?: ReactNode;
}

export function GlobeView({ children }: GlobeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const setMapReady = useMapStore(s => s.setMapReady);
  const setViewport = useMapStore(s => s.setViewport);

  useEffect(() => {
    if (!containerRef.current || map) return;

    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.error('VITE_MAPBOX_ACCESS_TOKEN is missing');
      return;
    }

    mapboxgl.accessToken = token;

    const instance = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/geosim1/cmagxq7bt00x801slceck6j5t',
      center: [0, 30],
      zoom: 1.5,
      projection: { name: 'globe' },
      antialias: true,
    });

    instance.on('style.load', () => {
      instance.setFog({});
      instance.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        'top-right'
      );
      setMap(instance);
      setMapReady(true);
    });

    instance.on('moveend', () => {
      const center = instance.getCenter();
      setViewport({
        center: [center.lng, center.lat],
        zoom: instance.getZoom(),
        bearing: instance.getBearing(),
        pitch: instance.getPitch(),
      });
    });

    return () => {
      instance.remove();
      setMap(null);
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MapContext.Provider value={{ map }}>
      <div className="absolute inset-0">
        <div ref={containerRef} className="w-full h-full" />
        {map && children}
      </div>
    </MapContext.Provider>
  );
}
