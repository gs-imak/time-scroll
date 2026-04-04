import { useEffect, useRef, useState, useMemo, createContext, useContext, useCallback, type ReactNode } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
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
  war: '⚔️', discovery: '🔭', cultural: '🎭',
  political: '👑', construction: '🏛️', natural: '🌋',
};

// === Hex to RGB for ring fade ===
function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r},${g},${b}`;
}

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

  // Build rings data from events for the animated pulse effect
  const ringsData = useMemo(
    () =>
      events.map((e: any) => ({
        lat: e.latitude,
        lng: e.longitude,
        color: CATEGORY_COLORS[e.category] ?? '#8b9dc3',
      })),
    [events],
  );

  // Create custom 3D marker mesh for each event
  const createCustomMarker = useCallback((d: any) => {
    const color = new THREE.Color(CATEGORY_COLORS[d.category] ?? '#8b9dc3');
    const group = new THREE.Group();

    // Outer glow cone — translucent, large
    const glowGeo = new THREE.ConeGeometry(3.5, 14, 16, 1, true);
    const glowMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = 7;
    group.add(glow);

    // Inner beam — bright, thin cone
    const beamGeo = new THREE.ConeGeometry(0.8, 12, 8, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.5,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 6;
    group.add(beam);

    // Core line — very thin, bright
    const coreGeo = new THREE.CylinderGeometry(0.15, 0.15, 12, 4);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 6;
    group.add(core);

    // Top diamond — floating crystal
    const diamondGeo = new THREE.OctahedronGeometry(1.8, 0);
    const diamondMat = new THREE.MeshPhongMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.9,
      shininess: 80,
    });
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    diamond.position.y = 13.5;
    group.add(diamond);

    // Diamond glow halo
    const haloGeo = new THREE.SphereGeometry(3, 12, 8);
    const haloMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.y = 13.5;
    group.add(halo);

    return group;
  }, []);

  // Update marker position using getCoords
  const updateMarkerPosition = useCallback((obj: any, d: any) => {
    if (!globeRef.current) return;
    const coords = globeRef.current.getCoords(d.latitude, d.longitude, 0.01);
    if (coords) {
      Object.assign(obj.position, coords);

      // Orient the marker to point away from the globe center
      const pos = new THREE.Vector3(coords.x, coords.y, coords.z);
      const up = pos.clone().normalize();
      const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        up,
      );
      obj.setRotationFromQuaternion(quaternion);
    }
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

            // 3D event markers — glowing beam + floating crystal
            customLayerData={events}
            customThreeObject={createCustomMarker}
            customThreeObjectUpdate={updateMarkerPosition}
            onCustomLayerClick={(obj: any) => {
              selectEvent(obj.id);
              if (globeRef.current) {
                globeRef.current.pointOfView(
                  { lat: obj.latitude, lng: obj.longitude, altitude: 0.4 },
                  1200
                );
              }
            }}
            customLayerLabel={(d: any) => `
              <div style="
                background: rgba(12, 20, 37, 0.94);
                backdrop-filter: blur(20px);
                border: 1px solid ${CATEGORY_COLORS[d.category] ?? '#8b9dc3'}50;
                border-radius: 12px;
                padding: 12px 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${CATEGORY_COLORS[d.category] ?? '#8b9dc3'}15;
                max-width: 260px;
              ">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 5px;">
                  <span style="font-size: 14px;">${CATEGORY_ICONS[d.category] ?? '●'}</span>
                  <span style="font-size: 10px; font-weight: 600; color: ${CATEGORY_COLORS[d.category] ?? '#8b9dc3'}; text-transform: uppercase; letter-spacing: 0.06em;">
                    ${formatYear(d.year)}
                  </span>
                </div>
                <div style="font-size: 14px; font-weight: 600; color: #eef2f7; font-family: 'Inter', system-ui, sans-serif; line-height: 1.3;">
                  ${d.title}
                </div>
              </div>
            `}

            // Animated pulse rings at event locations
            ringsData={ringsData}
            ringLat={(d: any) => d.lat}
            ringLng={(d: any) => d.lng}
            ringColor={(d: any) => (t: number) => `rgba(${hexToRgb(d.color)}, ${1 - t})`}
            ringMaxRadius={3}
            ringPropagationSpeed={2}
            ringRepeatPeriod={1200}
          />
        )}
        {ready && children}
      </div>
    </GlobeContext.Provider>
  );
}
