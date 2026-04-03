import { useEffect, useRef, useState, createContext, useContext, useCallback, type ReactNode } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import { useMapStore } from '@/shared/stores/mapStore';
import { useTimeStore } from '@/shared/stores/timeStore';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { closestBoundaryYear } from '@/shared/utils/geo';
import { formatYear } from '@/shared/utils/format';
import { BOUNDARY_YEAR_MAP } from '@/shared/utils/constants';

// === Globe context for child components (landmarks, etc.) ===
interface GlobeContextValue {
  globeRef: React.RefObject<GlobeMethods | undefined> | null;
  getScreenCoords: (lat: number, lng: number) => { x: number; y: number } | null;
}

const GlobeContext = createContext<GlobeContextValue>({ globeRef: null, getScreenCoords: () => null });
export const useGlobe = () => useContext(GlobeContext);

// === Era hex colors (WebGL needs real hex, not CSS variables) ===
const ERA_HEX_COLORS: Record<string, string> = {
  prehistory: '#8d7b68',
  ancient: '#f5a623',
  classical: '#ef4444',
  medieval: '#9b59b6',
  renaissance: '#3b82f6',
  industrial: '#84cc16',
  modern: '#00d4ff',
};

// === Category config ===
const CATEGORY_COLORS: Record<string, string> = {
  war: '#ff4444', discovery: '#00e5ff', cultural: '#ffca28',
  political: '#b388ff', construction: '#69f0ae', natural: '#ff8a65',
};

const CATEGORY_ICONS: Record<string, string> = {
  war: '⚔', discovery: '🔭', cultural: '🎭',
  political: '👑', construction: '🏛', natural: '🌋',
};

// === Sorted boundary years ===
const SORTED_BOUNDARY_YEARS = Object.keys(BOUNDARY_YEAR_MAP).map(Number).sort((a, b) => a - b);

interface GlobeViewProps {
  children?: ReactNode;
}

export function GlobeView({ children }: GlobeViewProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [polygonsData, setPolygonsData] = useState<object[]>([]);
  const [ready, setReady] = useState(false);

  const setMapReady = useMapStore(s => s.setMapReady);
  const currentYear = useTimeStore(s => s.currentYear);
  const currentEra = useTimeStore(s => s.currentEra);
  const getVisibleEvents = useEventsStore(s => s.getVisibleEvents);
  const selectEvent = useEventsStore(s => s.selectEvent);
  const loadedFileRef = useRef<string | null>(null);

  // Responsive sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Globe ready handler
  const onGlobeReady = useCallback(() => {
    setReady(true);
    setMapReady(true);

    if (globeRef.current) {
      // Set initial view
      globeRef.current.pointOfView({ lat: 30, lng: 0, altitude: 2.5 }, 0);

      // Configure controls
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
      }

      // Enhance globe material for a polished look
      const scene = globeRef.current.scene();
      if (scene) {
        scene.traverse((obj: { isMesh?: boolean; material?: any }) => {
          if (obj.isMesh && obj.material && 'shininess' in obj.material && obj.material.map) {
            const mat = obj.material;
            mat.shininess = 15;
            mat.bumpScale = 0.8;
            // Set a dark blue specular to avoid harsh white ocean reflections
            if (mat.specular && typeof mat.specular.setHex === 'function') {
              mat.specular.setHex(0x1a2a4a);
            }
            mat.needsUpdate = true;
          }
        });
      }
    }
  }, [setMapReady]);

  // Load boundary GeoJSON when year changes
  useEffect(() => {
    const year = closestBoundaryYear(currentYear, SORTED_BOUNDARY_YEARS);
    const fileName = BOUNDARY_YEAR_MAP[year];
    if (!fileName || fileName === loadedFileRef.current) return;

    (async () => {
      try {
        const res = await fetch(`/assets/geo/${fileName}.geojson`);
        if (!res.ok) return;
        const geojson = await res.json();
        setPolygonsData(geojson.features || []);
        loadedFileRef.current = fileName;
      } catch {
        // Boundary file not found
      }
    })();
  }, [currentYear]);

  // Get visible events
  const events = getVisibleEvents(currentYear);

  // Screen coords helper for child components (landmarks)
  const getScreenCoords = useCallback((lat: number, lng: number) => {
    if (!globeRef.current) return null;
    const coords = globeRef.current.getScreenCoords(lat, lng, 0.02);
    if (!coords) return null;
    return { x: coords.x, y: coords.y };
  }, []);

  // Create HTML marker element for events
  const createMarkerElement = useCallback((event: { id: string; title: string; year: number; category: string }) => {
    const color = CATEGORY_COLORS[event.category] ?? '#8b9dc3';
    const icon = CATEGORY_ICONS[event.category] ?? '●';

    const el = document.createElement('div');
    el.style.cssText = `
      position: relative;
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;
    el.innerHTML = `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(circle, ${color}35 0%, ${color}08 60%, transparent 70%);
          animation: pulse-ring 2.5s ease-out infinite;
        "></div>
        <div style="
          position: relative;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: ${color}25;
          border: 2px solid ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          line-height: 1;
          box-shadow: 0 0 10px ${color}60, inset 0 0 6px ${color}15;
        ">${icon}</div>
      </div>
      <div style="
        position: absolute;
        bottom: calc(100% + 6px);
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s;
        z-index: 100;
      " class="marker-tooltip">
        <div style="
          background: rgba(12, 20, 37, 0.92);
          backdrop-filter: blur(16px);
          border: 1px solid ${color}40;
          border-radius: 8px;
          padding: 6px 10px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.5);
          max-width: 200px;
        ">
          <div style="font-size: 10px; font-weight: 600; color: ${color}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
            ${formatYear(event.year)}
          </div>
          <div style="font-size: 12px; font-weight: 600; color: #eef2f7; font-family: 'Inter', system-ui, sans-serif;">
            ${event.title}
          </div>
        </div>
      </div>
    `;

    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.3)';
      const tooltip = el.querySelector('.marker-tooltip') as HTMLElement;
      if (tooltip) tooltip.style.opacity = '1';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      const tooltip = el.querySelector('.marker-tooltip') as HTMLElement;
      if (tooltip) tooltip.style.opacity = '0';
    });
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      selectEvent(event.id);
    });

    return el;
  }, [selectEvent]);

  return (
    <GlobeContext.Provider value={{ globeRef, getScreenCoords }}>
      <div ref={containerRef} className="absolute inset-0">
        {dimensions.width > 0 && (
          <Globe
            ref={globeRef}
            width={dimensions.width}
            height={dimensions.height}
            onGlobeReady={onGlobeReady}

            // Globe appearance — NASA day texture with topology bump
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            atmosphereColor="#6db3f2"
            atmosphereAltitude={0.2}
            showAtmosphere={true}

            // Historical boundaries (polygons)
            polygonsData={polygonsData}
            polygonGeoJsonGeometry={(d: any) => d.geometry}
            polygonCapColor={() => 'rgba(0, 0, 0, 0)'}
            polygonSideColor={() => 'rgba(0, 0, 0, 0)'}
            polygonStrokeColor={() => ERA_HEX_COLORS[currentEra.id] ?? '#ffffff'}
            polygonAltitude={0.001}
            polygonsTransitionDuration={600}

            // Event markers (HTML elements in 3D space)
            htmlElementsData={events}
            htmlLat={(d: any) => d.latitude}
            htmlLng={(d: any) => d.longitude}
            htmlAltitude={0.02}
            htmlElement={(d: any) => createMarkerElement(d)}
            htmlTransitionDuration={300}
          />
        )}
        {ready && children}
      </div>
    </GlobeContext.Provider>
  );
}
