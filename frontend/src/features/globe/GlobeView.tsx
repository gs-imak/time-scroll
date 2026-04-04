import { useEffect, useRef, useState, createContext, useContext, useCallback, type ReactNode } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import { useMapStore } from '@/shared/stores/mapStore';
import { useTimeStore } from '@/shared/stores/timeStore';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { closestBoundaryYear } from '@/shared/utils/geo';
import { formatYear } from '@/shared/utils/format';
import { BOUNDARY_YEAR_MAP } from '@/shared/utils/constants';
import { createMarker3D } from './createMarker3D';

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
        controls.autoRotate = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
      }

      // Enhance globe material for HD quality
      const scene = globeRef.current.scene();
      if (scene) {
        scene.traverse((obj: any) => {
          if (obj.isMesh && obj.material && obj.material.map) {
            const mat = obj.material;

            // Boost texture quality — enable anisotropic filtering
            if (mat.map) {
              mat.map.anisotropy = 16;
              mat.map.minFilter = THREE.LinearMipmapLinearFilter;
              mat.map.magFilter = THREE.LinearFilter;
              mat.map.needsUpdate = true;
            }
            if (mat.bumpMap) {
              mat.bumpMap.anisotropy = 16;
              mat.bumpMap.needsUpdate = true;
            }

            // Fine-tune surface appearance
            if ('shininess' in mat) {
              mat.shininess = 12;
              mat.bumpScale = 1.0;
              if (mat.specular && typeof mat.specular.setHex === 'function') {
                mat.specular.setHex(0x111833);
              }
            }
            mat.needsUpdate = true;
          }
        });

        // Add cloud layer — a slightly larger translucent sphere
        const cloudTexture = new THREE.TextureLoader().load('/assets/images/earth-clouds.png');
        cloudTexture.anisotropy = 8;
        const cloudGeo = new THREE.SphereGeometry(101.2, 128, 64);
        const cloudMat = new THREE.MeshPhongMaterial({
          map: cloudTexture,
          transparent: true,
          opacity: 0.25,
          depthWrite: false,
          side: THREE.FrontSide,
        });
        const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
        cloudMesh.name = 'cloudLayer';
        scene.add(cloudMesh);

        // Slowly rotate clouds independently
        const animateClouds = () => {
          cloudMesh.rotation.y += 0.00005;
          requestAnimationFrame(animateClouds);
        };
        animateClouds();
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

  // Cache 3D marker objects to avoid recreating on every render
  const markerCache = useRef(new Map<string, THREE.Object3D>());

  const getOrCreateMarker = useCallback((event: { id: string; category: string }) => {
    const cached = markerCache.current.get(event.id);
    if (cached) return cached;
    const marker = createMarker3D(event.category);
    markerCache.current.set(event.id, marker);
    return marker;
  }, []);

  return (
    <GlobeContext.Provider value={{ globeRef, getScreenCoords }}>
      <div ref={containerRef} className="absolute inset-0">
        {dimensions.width > 0 && (
          <Globe
            ref={globeRef}
            width={dimensions.width}
            height={dimensions.height}
            onGlobeReady={onGlobeReady}

            // Globe appearance — 8K NASA Blue Marble + 8K bump map
            globeImageUrl="/assets/images/earth-8k.jpg"
            bumpImageUrl="/assets/images/earth-bump-8k.png"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            atmosphereColor="#6db3f2"
            atmosphereAltitude={0.18}
            showAtmosphere={true}

            // Historical boundaries (polygons)
            polygonsData={polygonsData}
            polygonGeoJsonGeometry={(d: any) => d.geometry}
            polygonCapColor={() => 'rgba(0, 0, 0, 0)'}
            polygonSideColor={() => 'rgba(0, 0, 0, 0)'}
            polygonStrokeColor={() => ERA_HEX_COLORS[currentEra.id] ?? '#ffffff'}
            polygonAltitude={0.001}
            polygonsTransitionDuration={600}

            // 3D event markers
            objectsData={events}
            objectLat={(d: any) => d.latitude}
            objectLng={(d: any) => d.longitude}
            objectAltitude={0.01}
            objectThreeObject={(d: any) => getOrCreateMarker(d)}
            objectFacesSurfaces={true}
            onObjectClick={(obj: any) => {
              selectEvent(obj.id);
              if (globeRef.current) {
                globeRef.current.pointOfView(
                  { lat: obj.latitude, lng: obj.longitude, altitude: 0.5 },
                  1000
                );
              }
            }}
            objectLabel={(d: any) => `
              <div style="
                background: rgba(12, 20, 37, 0.92);
                backdrop-filter: blur(16px);
                border: 1px solid ${(CATEGORY_COLORS as any)[d.category] ?? '#8b9dc3'}40;
                border-radius: 8px;
                padding: 8px 12px;
                box-shadow: 0 6px 20px rgba(0,0,0,0.5);
                max-width: 220px;
                pointer-events: none;
              ">
                <div style="font-size: 10px; font-weight: 600; color: ${(CATEGORY_COLORS as any)[d.category] ?? '#8b9dc3'}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px;">
                  ${formatYear(d.year)}
                </div>
                <div style="font-size: 13px; font-weight: 600; color: #eef2f7; font-family: 'Inter', system-ui, sans-serif;">
                  ${d.title}
                </div>
              </div>
            `}
          />
        )}
        {ready && children}
      </div>
    </GlobeContext.Provider>
  );
}
