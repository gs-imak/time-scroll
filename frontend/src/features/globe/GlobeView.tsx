import { useEffect, useRef, useState, createContext, useContext, type ReactNode } from 'react';
import mapboxgl from 'mapbox-gl';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [loading, setLoading] = useState(true);
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
      // Custom atmospheric fog matching our dark theme
      instance.setFog({
        color: 'rgb(12, 20, 37)',
        'high-color': 'rgb(20, 30, 55)',
        'horizon-blend': 0.08,
        'space-color': 'rgb(5, 10, 24)',
        'star-intensity': 0.5,
      });

      instance.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        'top-right'
      );

      setMap(instance);
      setMapReady(true);
      setLoading(false);
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
        {/* Loading placeholder */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="absolute inset-0 z-10 flex items-center justify-center"
              style={{ background: 'radial-gradient(ellipse at 50% 50%, #0c1e3a, #050a18)' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-accent-cyan/20 border-t-accent-cyan rounded-full animate-spin mb-4 mx-auto" />
                <p className="text-sm text-text-muted font-medium">Loading globe...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={containerRef} className="w-full h-full" />
        {map && children}
      </div>
    </MapContext.Provider>
  );
}
