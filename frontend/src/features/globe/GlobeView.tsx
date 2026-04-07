import { useEffect, useRef, useState, useMemo, createContext, useContext, useCallback, type ReactNode } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import { useMapStore } from '@/shared/stores/mapStore';
import { useTimeStore } from '@/shared/stores/timeStore';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { useJourneyArcsStore } from '@/shared/stores/journeyArcsStore';
import { closestBoundaryYear } from '@/shared/utils/geo';
import { formatYear } from '@/shared/utils/format';
import { BOUNDARY_YEAR_MAP } from '@/shared/utils/constants';
import { getVisibleCivilizationLabels } from '@/shared/data/civilizationLabels';
import { createEventMarker, CATEGORY_COLORS } from './eventMarkers';

// === Globe context for child components (landmarks, etc.) ===
interface GlobeContextValue {
  globeRef: React.RefObject<GlobeMethods | undefined> | null;
  getScreenCoords: (lat: number, lng: number) => { x: number; y: number } | null;
}

const GlobeContext = createContext<GlobeContextValue>({ globeRef: null, getScreenCoords: () => null });
export const useGlobe = () => useContext(GlobeContext);

// === Civilization territory colors — deterministic per NAME for visual distinction ===
// Hand-picked palette for major civilizations + hash-based fallback for others
const MAJOR_CIV_COLORS: Record<string, string> = {
  'Rome': '#b85454',
  'Roman Empire': '#b85454',
  'Achaemenid Empire': '#c49a44',
  'Greek city-states': '#5a8fa5',
  'Carthaginian Empire': '#b87a60',
  'Zhou states': '#6d9476',
  'Magadha': '#8b80b0',
  'Olmec': '#7a9e5a',
  'Meroe': '#c4944a',
  'Hindu kingdoms': '#d4a054',
  'Mauryan Empire': '#8b80b0',
  'Han Empire': '#6d9476',
  'Mongol Empire': '#b85454',
  'Ottoman Empire': '#c49a44',
  'Byzantine Empire': '#8b6faa',
  'Tang Dynasty': '#5a9aaa',
  'Song Dynasty': '#5a9aaa',
  'Ming Dynasty': '#5a9aaa',
  'Qing Dynasty': '#5a9aaa',
  'Abbasid Caliphate': '#c49a44',
  'Umayyad Caliphate': '#d4a054',
  'Mali Empire': '#c4944a',
  'Songhai Empire': '#b87a60',
  'Inca Empire': '#7a9e5a',
  'Aztec Empire': '#b87a60',
  'Mughal Empire': '#d4a054',
  'British Empire': '#b85454',
  'Spanish Empire': '#c49a44',
  'French Empire': '#5a7fb5',
  'Russian Empire': '#8b6faa',
};

// Deterministic hash for civilizations not in the hand-picked list
const CIV_PALETTE = [
  '#c49a44', '#b85454', '#5a8fa5', '#6d9476', '#8b80b0',
  '#b87a60', '#7a9e5a', '#5a7fb5', '#d4a054', '#8b6faa',
  '#c4944a', '#5a9aaa', '#9a7b5a', '#7b8fa5', '#a08070',
  '#6b8b7a', '#9b7090', '#8a9b6a', '#7a6b8b', '#ab8060',
];

function getCivColor(name: string | undefined): string {
  if (!name || name === '?') return '#555566';
  if (MAJOR_CIV_COLORS[name]) return MAJOR_CIV_COLORS[name]!;
  // Deterministic hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  return CIV_PALETTE[Math.abs(hash) % CIV_PALETTE.length]!;
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
  const getVisibleEvents = useEventsStore(s => s.getVisibleEvents);
  const selectEvent = useEventsStore(s => s.selectEvent);
  const journeyArcs = useJourneyArcsStore(s => s.arcs);
  const loadedFileRef = useRef<string | null>(null);

  const civilizationLabels = useMemo(
    () => getVisibleCivilizationLabels(currentYear),
    [currentYear],
  );

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

  // Fly to event location when selectedEventId changes and globe is ready
  const selectedEventId = useEventsStore(s => s.selectedEventId);
  const allEvents = useEventsStore(s => s.events);
  const lastFlyToRef = useRef<string | null>(null);
  useEffect(() => {
    if (!ready || !selectedEventId || !globeRef.current) return;
    if (lastFlyToRef.current === selectedEventId) return;
    const target = allEvents.find(e => e.id === selectedEventId);
    if (!target) return;
    lastFlyToRef.current = selectedEventId;
    globeRef.current.pointOfView(
      { lat: target.latitude, lng: target.longitude, altitude: 0.4 },
      1200,
    );
  }, [ready, selectedEventId, allEvents]);

  // Load boundary GeoJSON when year changes (debounced to prevent rapid flickering)
  const pendingLoadRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const year = closestBoundaryYear(currentYear, SORTED_BOUNDARY_YEARS);
    const fileName = BOUNDARY_YEAR_MAP[year];
    if (!fileName || fileName === loadedFileRef.current) return;

    // Debounce: wait 150ms before loading to avoid rapid-fire during scrubbing
    if (pendingLoadRef.current) clearTimeout(pendingLoadRef.current);
    pendingLoadRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/assets/geo/${fileName}.geojson`);
        if (!res.ok) return;
        const geojson = await res.json();
        setPolygonsData(geojson.features || []);
        loadedFileRef.current = fileName;
      } catch {
        // Boundary file not found
      }
    }, 150);

    return () => { if (pendingLoadRef.current) clearTimeout(pendingLoadRef.current); };
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

  // Create per-event billboard marker (unique icon + name badge)
  const createCustomMarker = useCallback((d: any) => {
    return createEventMarker({
      id: d.id,
      title: d.title,
      year: d.year,
      category: d.category,
    });
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

            // Historical boundaries — Civ VI inspired: glowing borders, vivid fills
            polygonsData={polygonsData}
            polygonGeoJsonGeometry={(d: any) => d.geometry}
            polygonCapColor={(d: any) => {
              const name = d.properties?.NAME;
              const hex = getCivColor(name);
              const r = parseInt(hex.slice(1, 3), 16);
              const g = parseInt(hex.slice(3, 5), 16);
              const b = parseInt(hex.slice(5, 7), 16);
              // Named civs: strong visible fill; unnamed: barely there
              const alpha = name && name !== '?' ? 0.25 : 0.02;
              return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }}
            polygonSideColor={(d: any) => {
              const name = d.properties?.NAME;
              if (!name || name === '?') return 'rgba(40, 40, 50, 0.05)';
              const hex = getCivColor(name);
              const r = parseInt(hex.slice(1, 3), 16);
              const g = parseInt(hex.slice(3, 5), 16);
              const b = parseInt(hex.slice(5, 7), 16);
              // Bright glowing sides — the "Civ VI border glow" effect
              return `rgba(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)}, 0.6)`;
            }}
            polygonStrokeColor={(d: any) => {
              const name = d.properties?.NAME;
              if (!name || name === '?') return 'rgba(60, 60, 70, 0.15)';
              const hex = getCivColor(name);
              // Brighten the stroke for glow effect
              const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + 50);
              const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + 50);
              const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + 50);
              return `rgba(${r}, ${g}, ${b}, 0.9)`;
            }}
            polygonAltitude={(d: any) => {
              const name = d.properties?.NAME;
              // Named civs raised higher — creates visible 3D border walls
              return name && name !== '?' ? 0.01 : 0.001;
            }}
            polygonLabel={(d: any) => {
              const name = d.properties?.NAME;
              if (!name || name === '?') return '';
              const color = getCivColor(name);
              return `<div style="
                background: rgba(10, 10, 16, 0.88);
                backdrop-filter: blur(20px);
                border: 1.5px solid ${color}60;
                border-radius: 10px;
                padding: 10px 14px;
                font-family: 'Space Grotesk', system-ui, sans-serif;
                box-shadow: 0 0 20px ${color}30, 0 4px 20px rgba(0,0,0,0.5);
                min-width: 160px;
              ">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <div style="width: 10px; height: 10px; border-radius: 3px; background: ${color}; box-shadow: 0 0 8px ${color}80;"></div>
                  <span style="font-size: 14px; font-weight: 700; color: ${color}; letter-spacing: 0.02em;">${name}</span>
                </div>
                <div style="font-size: 10px; color: #55556a; padding-left: 18px;">
                  ${formatYear(currentYear)}
                </div>
              </div>`;
            }}
            polygonsTransitionDuration={2000}

            // Event markers — per-event billboard badges
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
            customLayerLabel={(d: any) => {
              const c = CATEGORY_COLORS[d.category] ?? '#8a8a9a';
              return `<div style="
                background: rgba(14, 14, 20, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255,255,255,0.06);
                border-left: 3px solid ${c};
                border-radius: 10px;
                padding: 10px 14px;
                max-width: 260px;
                font-family: 'Inter', system-ui, sans-serif;
                box-shadow: 0 4px 24px rgba(0,0,0,0.6);
              ">
                <div style="font-size: 13px; font-weight: 600; color: #e0e0e6; margin-bottom: 2px;">
                  ${d.title}
                </div>
                <div style="font-size: 10px; font-weight: 500; color: ${c}; margin-bottom: 6px;">
                  ${formatYear(d.year)} · ${d.category}
                </div>
                <div style="font-size: 11px; color: #8a8a9a; line-height: 1.45;">
                  ${d.description?.slice(0, 140)}${d.description?.length > 140 ? '…' : ''}
                </div>
              </div>`;
            }}

            // Civilization name banners — HTML elements floating above territories
            htmlElementsData={civilizationLabels}
            htmlLat={(d: any) => d.lat}
            htmlLng={(d: any) => d.lng}
            htmlAltitude={0.02}
            htmlElement={(d: any) => {
              const el = document.createElement('div');
              const color = getCivColor(d.name);
              el.style.cssText = `
                pointer-events: none;
                transform: translate(-50%, -50%);
                white-space: nowrap;
              `;
              el.innerHTML = `
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 5px;
                  padding: 3px 10px 3px 6px;
                  background: rgba(10, 10, 16, 0.75);
                  backdrop-filter: blur(8px);
                  border: 1px solid ${color}40;
                  border-radius: 6px;
                  box-shadow: 0 0 12px ${color}25, 0 2px 8px rgba(0,0,0,0.4);
                  font-family: 'Space Grotesk', system-ui, sans-serif;
                ">
                  <div style="
                    width: 8px; height: 8px;
                    border-radius: 2px;
                    background: ${color};
                    box-shadow: 0 0 6px ${color}90;
                    flex-shrink: 0;
                  "></div>
                  <span style="
                    font-size: 10px;
                    font-weight: 700;
                    color: ${color};
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    text-shadow: 0 0 8px ${color}40;
                  ">${d.name}</span>
                </div>
              `;
              return el;
            }}

            // Journey arcs
            arcsData={journeyArcs}
            arcStartLat={(d: any) => d.startLat}
            arcStartLng={(d: any) => d.startLng}
            arcEndLat={(d: any) => d.endLat}
            arcEndLng={(d: any) => d.endLng}
            arcColor={() => 'rgba(196, 154, 68, 0.4)'}
            arcAltitude={0.15}
            arcStroke={1}
            arcDashLength={0.5}
            arcDashGap={0.2}
            arcDashAnimateTime={2000}

          />
        )}
        {ready && children}
      </div>
    </GlobeContext.Provider>
  );
}
