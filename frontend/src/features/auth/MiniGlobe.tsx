import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import { createEventMarker, CATEGORY_COLORS } from '@/features/globe/eventMarkers';
import { formatYear } from '@/shared/utils/format';

/**
 * Interactive globe for the login page — shows the Earth with a curated
 * selection of historical event markers to represent the app's content.
 */

// Curated events spread across the globe — iconic moments that make users curious
const SHOWCASE_EVENTS = [
  { id: 'great-pyramid', title: 'Great Pyramid', year: -2560, category: 'construction', latitude: 29.98, longitude: 31.13 },
  { id: 'colosseum', title: 'Colosseum', year: 80, category: 'construction', latitude: 41.89, longitude: 12.49 },
  { id: 'great-wall-begin', title: 'Great Wall', year: -221, category: 'construction', latitude: 40.43, longitude: 116.57 },
  { id: 'machu-picchu', title: 'Machu Picchu', year: 1450, category: 'construction', latitude: -13.16, longitude: -72.55 },
  { id: 'angkor-wat', title: 'Angkor Wat', year: 1150, category: 'construction', latitude: 13.41, longitude: 103.87 },
  { id: 'taj-mahal', title: 'Taj Mahal', year: 1632, category: 'construction', latitude: 27.17, longitude: 78.04 },
  { id: 'eiffel-tower', title: 'Eiffel Tower', year: 1889, category: 'construction', latitude: 48.86, longitude: 2.29 },
  { id: 'moon-landing', title: 'Moon Landing', year: 1969, category: 'discovery', latitude: 28.57, longitude: -80.65 },
  { id: 'democracy-athens', title: 'Birth of Democracy', year: -508, category: 'political', latitude: 37.98, longitude: 23.73 },
  { id: 'genghis-khan', title: 'Mongol Empire', year: 1206, category: 'war', latitude: 47.92, longitude: 106.92 },
  { id: 'viking-expansion', title: 'Viking Expansion', year: 793, category: 'war', latitude: 60.47, longitude: 10.74 },
  { id: 'silk-road', title: 'Silk Road', year: -130, category: 'discovery', latitude: 39.47, longitude: 75.99 },
  { id: 'mansa-musa', title: 'Mansa Musa', year: 1324, category: 'cultural', latitude: 16.77, longitude: -3.01 },
  { id: 'aztec-tenochtitlan', title: 'Tenochtitlan', year: 1325, category: 'construction', latitude: 19.43, longitude: -99.13 },
  { id: 'berlin-wall', title: 'Berlin Wall', year: 1989, category: 'political', latitude: 52.52, longitude: 13.38 },
];

export function MiniGlobe() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

  const onReady = useCallback(() => {
    if (!globeRef.current) return;
    globeRef.current.pointOfView({ lat: 25, lng: 30, altitude: 2.0 }, 0);

    const controls = globeRef.current.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.enableZoom = false;
    }
  }, []);

  const createMarker = useCallback((d: any) => {
    return createEventMarker({
      id: d.id,
      title: d.title,
      year: d.year,
      category: d.category,
    });
  }, []);

  const updateMarkerPosition = useCallback((obj: any, d: any) => {
    if (!globeRef.current) return;
    const coords = globeRef.current.getCoords(d.latitude, d.longitude, 0.01);
    if (coords) {
      Object.assign(obj.position, coords);
      const pos = new THREE.Vector3(coords.x, coords.y, coords.z);
      const up = pos.clone().normalize();
      const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        up,
      );
      obj.setRotationFromQuaternion(quaternion);
      obj.scale.setScalar(1.3); // Bigger for visibility on login
    }
  }, []);

  const events = useMemo(() => SHOWCASE_EVENTS, []);

  // Show only 5 hand-picked civilizations — no overlap, no flickering
  const FEATURED_CIVS = new Set([
    'Mongol Empire', 'Byzantine Empire', 'Song Empire', 'Mali', 'Angevin Empire',
  ]);
  const FEATURED_COLORS: Record<string, string> = {
    'Mongol Empire': '#b85454',
    'Byzantine Empire': '#8b6faa',
    'Song Empire': '#5a9aaa',
    'Mali': '#c49a44',
    'Angevin Empire': '#5a7fb5',
  };

  const [polygons, setPolygons] = useState<object[]>([]);
  useEffect(() => {
    fetch('/assets/geo/world_1200.geojson')
      .then(r => r.json())
      .then(data => {
        const filtered = (data.features || []).filter(
          (f: any) => FEATURED_CIVS.has(f.properties?.NAME)
        );
        setPolygons(filtered);
      })
      .catch(() => {});
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          onGlobeReady={onReady}
          globeImageUrl="/assets/images/earth-8k.jpg"
          bumpImageUrl="/assets/images/earth-bump-8k.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          atmosphereColor="#6db3f2"
          atmosphereAltitude={0.18}
          showAtmosphere={true}

          // 5 featured territory borders — clean, no overlap
          polygonsData={polygons}
          polygonGeoJsonGeometry={(d: any) => d.geometry}
          polygonCapColor={(d: any) => {
            const name = d.properties?.NAME;
            const hex = FEATURED_COLORS[name] || '#555566';
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, 0.18)`;
          }}
          polygonSideColor={() => 'rgba(0,0,0,0)'}
          polygonStrokeColor={(d: any) => {
            const name = d.properties?.NAME;
            const hex = FEATURED_COLORS[name] || '#555566';
            const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + 60);
            const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + 60);
            const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + 60);
            return `rgba(${r}, ${g}, ${b}, 0.8)`;
          }}
          polygonAltitude={() => 0.006}
          polygonLabel={() => ''}
          polygonsTransitionDuration={0}

          // Event markers
          customLayerData={events}
          customThreeObject={createMarker}
          customThreeObjectUpdate={updateMarkerPosition}
          customLayerLabel={(d: any) => {
            const c = CATEGORY_COLORS[d.category] ?? '#8a8a9a';
            return `<div style="background:rgba(14,14,20,0.9);backdrop-filter:blur(16px);border:1px solid ${c}40;border-radius:8px;padding:8px 12px;font-family:'Space Grotesk',sans-serif;">
              <div style="font-size:13px;font-weight:600;color:#e0e0e6;">${d.title}</div>
              <div style="font-size:10px;color:${c};margin-top:2px;">${formatYear(d.year)}</div>
            </div>`;
          }}
        />
      )}
    </div>
  );
}
