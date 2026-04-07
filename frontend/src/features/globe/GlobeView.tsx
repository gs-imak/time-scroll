import { useEffect, useRef, useState, useMemo, createContext, useContext, useCallback, type ReactNode } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import { useMapStore } from '@/shared/stores/mapStore';
import { useTimeStore } from '@/shared/stores/timeStore';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { useJourneyArcsStore } from '@/shared/stores/journeyArcsStore';
import { useCameraStore } from '@/shared/stores/cameraStore';
import { closestBoundaryYear } from '@/shared/utils/geo';
import { formatYear } from '@/shared/utils/format';
import { BOUNDARY_YEAR_MAP } from '@/shared/utils/constants';
import { getVisibleCivilizationLabels } from '@/shared/data/civilizationLabels';
import { createEventMarker, createClusterMarker, CATEGORY_COLORS } from './eventMarkers';
import { useSpotlightStore } from '@/shared/stores/spotlightStore';
import { getGeoJsonFromCache, cacheGeoJson, preloadAllGeoJson } from '@/shared/data/geoJsonCache';
import { useVisibilityTier } from './useVisibilityTier';
import { useEventClustering } from './useEventClustering';
import { useLabelCollision } from './useLabelCollision';

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

// Deterministic hash for per-civ altitude stratification
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// === Material cache — avoids allocating new materials every render ===
const capMaterialCache = new Map<string, THREE.MeshBasicMaterial>();
const sideMaterialCache = new Map<string, THREE.MeshBasicMaterial>();

function getCachedCapMaterial(
  key: string,
  color: THREE.ColorRepresentation,
  opacity: number,
  offsetFactor: number,
): THREE.MeshBasicMaterial {
  let mat = capMaterialCache.get(key);
  if (mat) {
    // Update mutable properties in case they changed
    mat.color.set(color);
    mat.opacity = opacity;
    return mat;
  }
  mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    depthTest: true,
    polygonOffset: true,
    polygonOffsetFactor: offsetFactor,
    polygonOffsetUnits: -1,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
  });
  capMaterialCache.set(key, mat);
  return mat;
}

function getCachedSideMaterial(
  key: string,
  color: THREE.ColorRepresentation,
  opacity: number,
): THREE.MeshBasicMaterial {
  let mat = sideMaterialCache.get(key);
  if (mat) {
    mat.color.set(color);
    mat.opacity = opacity;
    return mat;
  }
  mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    depthTest: true,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
  });
  sideMaterialCache.set(key, mat);
  return mat;
}

// === Sorted boundary years ===
const SORTED_BOUNDARY_YEARS = Object.keys(BOUNDARY_YEAR_MAP).map(Number).sort((a, b) => a - b);

/**
 * Assign stable __id to each GeoJSON feature based on civilization NAME.
 * This enables react-globe.gl's built-in tween transition system —
 * matched polygons smoothly animate altitude changes, new polygons
 * rise up from below the surface, and disappearing ones sink down.
 * Without stable IDs, the library assigns random IDs and every update
 * destroys/recreates all polygons with no transition.
 */
function assignStableIds(features: any[]): any[] {
  // Track how many times each name appears (for multi-feature civs)
  const nameCount = new Map<string, number>();
  return features.map((f: any) => {
    const name: string = f.properties?.NAME || '?';
    const idx = nameCount.get(name) || 0;
    nameCount.set(name, idx + 1);
    // Stable ID = name + occurrence index
    f.__id = `${name}_${idx}`;
    return f;
  });
}

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

  // Spotlight mode state
  const spotlightActive = useSpotlightStore(s => s.active);
  const spotlightAliasSet = useSpotlightStore(s => s.aliasSet);
  const spotlightColor = useSpotlightStore(s => s.civColor);

  const allCivilizationLabels = useMemo(
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

        // Track camera altitude for visibility tier system
        const setCameraAltitude = useCameraStore.getState().setCameraAltitude;
        let throttleTimer: ReturnType<typeof setTimeout> | null = null;
        controls.addEventListener('change', () => {
          if (throttleTimer) return;
          throttleTimer = setTimeout(() => {
            throttleTimer = null;
            if (globeRef.current) {
              const pov = globeRef.current.pointOfView();
              setCameraAltitude(pov.altitude);
            }
          }, 60);
        });
      }

      // Tighten camera near/far ratio for better depth buffer precision
      // Reduces z-fighting between overlapping territory polygons
      const camera = globeRef.current.camera() as THREE.PerspectiveCamera;
      if (camera && 'near' in camera) {
        camera.near = 0.5;
        camera.far = 2000;
        camera.updateProjectionMatrix();
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

  // Camera fly-to when spotlight mode enters
  const spotlightCivId = useSpotlightStore(s => s.civId);
  const spotlightCenterLat = useSpotlightStore(s => s.centerLat);
  const spotlightCenterLng = useSpotlightStore(s => s.centerLng);
  useEffect(() => {
    if (!spotlightActive || !globeRef.current || !spotlightCivId) return;
    globeRef.current.pointOfView(
      { lat: spotlightCenterLat, lng: spotlightCenterLng, altitude: 1.2 },
      1500,
    );
  }, [spotlightActive, spotlightCivId, spotlightCenterLat, spotlightCenterLng]);

  // Preload all 53 GeoJSON boundary files on globe mount so every
  // boundary switch is instant — no network delays during scrubbing
  useEffect(() => {
    preloadAllGeoJson();
  }, []);

  // Update boundaries when year changes — instant from preloaded cache
  useEffect(() => {
    const year = closestBoundaryYear(currentYear, SORTED_BOUNDARY_YEARS);
    const fileName = BOUNDARY_YEAR_MAP[year];
    if (!fileName || fileName === loadedFileRef.current) return;

    const cached = getGeoJsonFromCache(fileName);
    if (cached) {
      setPolygonsData(assignStableIds(cached));
      loadedFileRef.current = fileName;
      return;
    }

    // Fallback: fetch if preload hasn't finished yet (first few seconds)
    (async () => {
      try {
        const res = await fetch(`/assets/geo/${fileName}.geojson`);
        if (!res.ok) return;
        const geojson = await res.json();
        const features = geojson.features || [];
        setPolygonsData(assignStableIds(features));
        cacheGeoJson(fileName, features);
        loadedFileRef.current = fileName;
      } catch { /* skip */ }
    })();
  }, [currentYear]);

  // Get visible events, then filter by zoom tier, then cluster nearby ones
  const allVisibleEvents = getVisibleEvents(currentYear);
  const { filteredLabels: civilizationLabels, filteredEvents } = useVisibilityTier(
    allCivilizationLabels,
    allVisibleEvents,
  );
  const clusteredEvents = useEventClustering(filteredEvents);

  // Label collision avoidance — also avoids event marker positions
  useLabelCollision(globeRef, civilizationLabels.length > 0, clusteredEvents);

  // Screen coords helper for child components (landmarks)
  const getScreenCoords = useCallback((lat: number, lng: number) => {
    if (!globeRef.current) return null;
    const coords = globeRef.current.getScreenCoords(lat, lng, 0.02);
    if (!coords) return null;
    return { x: coords.x, y: coords.y };
  }, []);

  // Create marker — dispatches to event or cluster renderer
  const createCustomMarker = useCallback((d: any) => {
    if (d.type === 'cluster') {
      return createClusterMarker({
        count: d.count,
        dominantCategory: d.dominantCategory,
      });
    }
    return createEventMarker({
      id: d.id,
      title: d.title,
      year: d.year,
      category: d.category,
    });
  }, []);

  // Update marker position + scale based on density and zoom
  const updateMarkerPosition = useCallback((obj: any, d: any) => {
    if (!globeRef.current) return;
    const lat = d.type === 'cluster' ? d.lat : (d.displayLat ?? d.latitude);
    const lng = d.type === 'cluster' ? d.lng : (d.displayLng ?? d.longitude);
    const coords = globeRef.current.getCoords(lat, lng, 0.01);
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

      // Scale markers down when they're in dense groups
      // Solo markers (groupSize 1) = full size, dense groups scale down
      if (d.type === 'event' && d.groupSize > 1) {
        // Scale: 2 markers = 0.7, 3 = 0.58, 5 = 0.45, 8+ = 0.35
        const densityScale = Math.max(0.35, 1 / (1 + d.groupSize * 0.25));
        obj.scale.setScalar(densityScale);
      } else if (d.type !== 'cluster') {
        obj.scale.setScalar(1);
      }
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

            // Historical boundaries — custom materials to eliminate z-fighting
            polygonsData={polygonsData}
            polygonGeoJsonGeometry={(d: any) => d.geometry}
            polygonCapMaterial={(d: any) => {
              const name: string | undefined = d.properties?.NAME;
              const isNamed = name && name !== '?';

              if (spotlightActive) {
                if (name && spotlightAliasSet.has(name)) {
                  const hex = spotlightColor || '#c49a44';
                  return getCachedCapMaterial(`spot-cap-${name}`, hex, 0.45, -2);
                }
                return getCachedCapMaterial('spot-cap-dim', '#191923', 0.03, 2);
              }

              const hex = getCivColor(name);
              // Deterministic offset per civ so overlapping territories don't fight
              const offset = isNamed ? -(hashString(name!) % 10) - 1 : 2;
              return getCachedCapMaterial(
                `cap-${name ?? 'unknown'}`,
                hex,
                isNamed ? 0.25 : 0.02,
                offset,
              );
            }}
            polygonSideMaterial={(d: any) => {
              const name: string | undefined = d.properties?.NAME;

              if (spotlightActive) {
                if (name && spotlightAliasSet.has(name)) {
                  const hex = spotlightColor || '#c49a44';
                  return getCachedSideMaterial(`spot-side-${name}`, hex, 0.85);
                }
                return getCachedSideMaterial('spot-side-dim', '#14141c', 0.01);
              }

              if (!name || name === '?') {
                return getCachedSideMaterial('side-unknown', '#282832', 0.05);
              }
              const hex = getCivColor(name);
              return getCachedSideMaterial(`side-${name}`, hex, 0.6);
            }}
            polygonStrokeColor={(d: any) => {
              const name = d.properties?.NAME;
              if (spotlightActive) {
                if (spotlightAliasSet.has(name)) {
                  const hex = spotlightColor || '#c49a44';
                  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + 80);
                  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + 80);
                  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + 80);
                  return `rgba(${r}, ${g}, ${b}, 1.0)`;
                }
                return 'rgba(30, 30, 40, 0.02)';
              }
              if (!name || name === '?') return 'rgba(60, 60, 70, 0.15)';
              const hex = getCivColor(name);
              const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + 50);
              const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + 50);
              const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + 50);
              return `rgba(${r}, ${g}, ${b}, 0.9)`;
            }}
            polygonAltitude={(d: any) => {
              const name = d.properties?.NAME;
              if (spotlightActive) {
                return spotlightAliasSet.has(name) ? 0.018 : 0.0003;
              }
              if (!name || name === '?') return 0.002;
              // Hash-based altitude: each civ gets a unique height (0.008–0.022)
              // This prevents same-altitude z-fighting between adjacent territories
              const h = hashString(name) % 100;
              return 0.008 + h * 0.00014;
            }}
            polygonLabel={(d: any) => {
              const name = d.properties?.NAME;
              if (!name || name === '?') return '';
              if (spotlightActive && !spotlightAliasSet.has(name)) return '';
              const color = spotlightActive ? (spotlightColor || '#c49a44') : getCivColor(name);
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

            // Event markers + cluster badges
            customLayerData={clusteredEvents}
            customThreeObject={createCustomMarker}
            customThreeObjectUpdate={updateMarkerPosition}
            onCustomLayerClick={(obj: any) => {
              if (obj.type === 'cluster') {
                // Zoom into cluster to expand it
                if (globeRef.current) {
                  globeRef.current.pointOfView(
                    { lat: obj.lat, lng: obj.lng, altitude: 0.4 },
                    1200,
                  );
                }
              } else {
                selectEvent(obj.id);
                if (globeRef.current) {
                  globeRef.current.pointOfView(
                    { lat: obj.latitude, lng: obj.longitude, altitude: 0.4 },
                    1200,
                  );
                }
              }
            }}
            customLayerLabel={(d: any) => {
              if (d.type === 'cluster') {
                const c = CATEGORY_COLORS[d.dominantCategory] ?? '#8a8a9a';
                const titles = d.events
                  .slice(0, 5)
                  .map((e: any) => `<div style="font-size: 11px; color: #b0b0bc; padding: 2px 0;">· ${e.title}</div>`)
                  .join('');
                const more = d.events.length > 5
                  ? `<div style="font-size: 10px; color: #55556a; padding-top: 4px;">+${d.events.length - 5} more</div>`
                  : '';
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
                  <div style="font-size: 13px; font-weight: 600; color: #e0e0e6; margin-bottom: 6px;">
                    ${d.count} events in this area
                  </div>
                  ${titles}${more}
                  <div style="font-size: 9px; color: #55556a; margin-top: 6px;">Click to zoom in</div>
                </div>`;
              }
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
              el.dataset.civSlug = d.slug;
              el.dataset.civImportance = String(d.importance ?? 1);
              el.style.cssText = `
                pointer-events: none;
                transform: translate(-50%, -50%);
                white-space: nowrap;
                transition: opacity 0.3s ease, margin-top 0.2s ease;
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
