import { useEffect, useRef, useState, useMemo, createContext, useContext, useCallback, type ReactNode } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import { useNavigate } from 'react-router';
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

// === Era hex colors — muted, cinematic tones (WebGL needs real hex) ===
const ERA_HEX_COLORS: Record<string, string> = {
  prehistory: '#8d7b68',
  ancient: '#c49a44',
  classical: '#b85454',
  medieval: '#8b6faa',
  renaissance: '#5a7fb5',
  industrial: '#7a9e5a',
  modern: '#5a9aaa',
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

  const navigate = useNavigate();
  const setMapReady = useMapStore(s => s.setMapReady);
  const currentYear = useTimeStore(s => s.currentYear);
  const currentEra = useTimeStore(s => s.currentEra);
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

            // Historical boundaries (polygons)
            polygonsData={polygonsData}
            polygonGeoJsonGeometry={(d: any) => d.geometry}
            polygonCapColor={() => {
              const hex = ERA_HEX_COLORS[currentEra.id] ?? '#ffffff';
              // Very subtle fill so borders read as regions, not just lines
              const r = parseInt(hex.slice(1, 3), 16);
              const g = parseInt(hex.slice(3, 5), 16);
              const b = parseInt(hex.slice(5, 7), 16);
              return `rgba(${r}, ${g}, ${b}, 0.04)`;
            }}
            polygonSideColor={() => 'rgba(255, 255, 255, 0.02)'}
            polygonStrokeColor={() => ERA_HEX_COLORS[currentEra.id] ?? '#ffffff'}
            polygonAltitude={0.004}
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

            // Civilization name labels
            labelsData={civilizationLabels}
            labelLat={(d: any) => d.lat}
            labelLng={(d: any) => d.lng}
            labelText={(d: any) => d.name}
            labelSize={() => 0.6}
            labelColor={() => '#c49a44'}
            labelResolution={3}
            labelDotRadius={0}
            labelAltitude={0.01}
            onLabelClick={(label: any) => {
              navigate(`/civilizations/${label.slug}`);
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
