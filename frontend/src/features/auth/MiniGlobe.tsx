import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import { createEventMarker, CATEGORY_COLORS } from '@/features/globe/eventMarkers';
import { formatYear } from '@/shared/utils/format';
import { motion } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';

// Curated events spread across the globe
const SHOWCASE_EVENTS = [
  { id: 'great-pyramid', title: 'Great Pyramid of Giza', year: -2560, category: 'construction', latitude: 29.98, longitude: 31.13 },
  { id: 'colosseum', title: 'Colosseum', year: 80, category: 'construction', latitude: 41.89, longitude: 12.49 },
  { id: 'great-wall-begin', title: 'Great Wall of China', year: -221, category: 'construction', latitude: 40.43, longitude: 116.57 },
  { id: 'machu-picchu', title: 'Machu Picchu', year: 1450, category: 'construction', latitude: -13.16, longitude: -72.55 },
  { id: 'angkor-wat', title: 'Angkor Wat', year: 1150, category: 'construction', latitude: 13.41, longitude: 103.87 },
  { id: 'taj-mahal', title: 'Taj Mahal', year: 1632, category: 'construction', latitude: 27.17, longitude: 78.04 },
  { id: 'eiffel-tower', title: 'Eiffel Tower', year: 1889, category: 'construction', latitude: 48.86, longitude: 2.29 },
  { id: 'moon-landing', title: 'Moon Landing', year: 1969, category: 'discovery', latitude: 28.57, longitude: -80.65 },
  { id: 'democracy-athens', title: 'Birth of Democracy', year: -508, category: 'political', latitude: 37.98, longitude: 23.73 },
  { id: 'genghis-khan', title: 'Mongol Empire Founded', year: 1206, category: 'war', latitude: 47.92, longitude: 106.92 },
  { id: 'viking-expansion', title: 'Viking Expansion', year: 793, category: 'war', latitude: 60.47, longitude: 10.74 },
  { id: 'silk-road', title: 'Silk Road Established', year: -130, category: 'discovery', latitude: 39.47, longitude: 75.99 },
  { id: 'mansa-musa', title: 'Mansa Musa\'s Pilgrimage', year: 1324, category: 'cultural', latitude: 16.77, longitude: -3.01 },
  { id: 'aztec-tenochtitlan', title: 'Tenochtitlan Founded', year: 1325, category: 'construction', latitude: 19.43, longitude: -99.13 },
  { id: 'berlin-wall', title: 'Fall of the Berlin Wall', year: 1989, category: 'political', latitude: 52.52, longitude: 13.38 },
];

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

export function MiniGlobe() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [interacted, setInteracted] = useState(false);

  // Resize bursts coalesced into one measurement per frame (rAF guard) so a
  // drag-resize doesn't fire a setDimensions storm that re-sizes the renderer.
  useEffect(() => {
    let rafId = 0;
    const measure = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    const onResize = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        measure();
      });
    };
    measure();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const onReady = useCallback(() => {
    if (!globeRef.current) return;
    globeRef.current.pointOfView({ lat: 25, lng: 30, altitude: 1.6 }, 0);

    const controls = globeRef.current.controls();
    if (controls) {
      // Respect reduced-motion: don't spin the globe for users who opt out.
      controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      controls.autoRotateSpeed = 0.4;
      controls.enableDamping = true;
      controls.dampingFactor = 0.12;
      controls.enableZoom = false;
      controls.minPolarAngle = Math.PI * 0.2; // prevent flipping too far
      controls.maxPolarAngle = Math.PI * 0.8;
    }

    // Tighten camera for better depth precision (reduces z-fighting)
    const camera = globeRef.current.camera() as THREE.PerspectiveCamera;
    if (camera && 'near' in camera) {
      camera.near = 1;
      camera.far = 1500;
      camera.updateProjectionMatrix();
    }

    // Enhance globe surface
    const scene = globeRef.current.scene();
    if (scene) {
      scene.traverse((obj: any) => {
        if (obj.isMesh && obj.material?.map) {
          obj.material.map.anisotropy = 8;
          obj.material.needsUpdate = true;
        }
      });

      // Cloud layer
      const cloudTexture = new THREE.TextureLoader().load('/assets/images/earth-clouds.png');
      cloudTexture.anisotropy = 4;
      const cloudGeo = new THREE.SphereGeometry(101.2, 64, 32);
      const cloudMat = new THREE.MeshPhongMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
        side: THREE.FrontSide,
      });
      const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
      scene.add(cloudMesh);

      const animateClouds = () => {
        cloudMesh.rotation.y += 0.00004;
        requestAnimationFrame(animateClouds);
      };
      animateClouds();
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
    // Position markers ABOVE polygons (0.02 vs polygon 0.006) to prevent z-fighting
    const coords = globeRef.current.getCoords(d.latitude, d.longitude, 0.02);
    if (coords) {
      Object.assign(obj.position, coords);
      const pos = new THREE.Vector3(coords.x, coords.y, coords.z);
      const up = pos.clone().normalize();
      const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        up,
      );
      obj.setRotationFromQuaternion(quaternion);
      obj.scale.setScalar(1.8);

      // Hide the glow disc (child 0) which causes flickering
      if (obj.children?.[0]) obj.children[0].visible = false;

      // Subtle pulse on the ring (child 1) — makes markers feel alive
      const ring = obj.children?.[1];
      if (ring?.material) {
        const t = (performance.now() / 1500 + d.latitude) % (Math.PI * 2);
        ring.material.opacity = 0.5 + Math.sin(t) * 0.35;
      }
    }
  }, []);

  const events = useMemo(() => SHOWCASE_EVENTS, []);

  // Golden arc connections between related events — shows the app traces history across the globe
  const arcs = useMemo(() => [
    { startLat: 29.98, startLng: 31.13, endLat: 41.89, endLng: 12.49 },   // Pyramids → Colosseum
    { startLat: 41.89, startLng: 12.49, endLat: 37.98, endLng: 23.73 },   // Colosseum → Athens
    { startLat: 37.98, startLng: 23.73, endLat: 27.17, endLng: 78.04 },   // Athens → Taj Mahal
    { startLat: 27.17, startLng: 78.04, endLat: 40.43, endLng: 116.57 },  // Taj Mahal → Great Wall
    { startLat: 40.43, startLng: 116.57, endLat: 13.41, endLng: 103.87 }, // Great Wall → Angkor Wat
    { startLat: 16.77, startLng: -3.01, endLat: 29.98, endLng: 31.13 },   // Mansa Musa → Pyramids
    { startLat: 19.43, startLng: -99.13, endLat: -13.16, endLng: -72.55 },// Tenochtitlan → Machu Picchu
    { startLat: 60.47, startLng: 10.74, endLat: 52.52, endLng: 13.38 },   // Vikings → Berlin
    { startLat: 48.86, startLng: 2.29, endLat: 28.57, endLng: -80.65 },   // Eiffel → Moon Landing
  ], []);

  const [polygons, setPolygons] = useState<object[]>([]);
  useEffect(() => {
    fetch('/assets/geo/world_1200.geojson')
      .then(r => r.json())
      .then(data => {
        const filtered = (data.features || []).filter(
          (f: any) => f?.geometry && FEATURED_CIVS.has(f.properties?.NAME)
        );
        setPolygons(filtered);
      })
      .catch(() => {});
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      onMouseDown={() => setInteracted(true)}
      onTouchStart={() => setInteracted(true)}
    >
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          onGlobeReady={onReady}
          globeImageUrl="/assets/images/earth-8k.jpg"
          bumpImageUrl="/assets/images/earth-bump-8k.png"
          backgroundImageUrl="/assets/images/night-sky.png"
          atmosphereColor="#6db3f2"
          atmosphereAltitude={0.25}
          showAtmosphere={true}

          // 5 featured territories
          polygonsData={polygons}
          polygonGeoJsonGeometry={(d: any) => d.geometry}
          polygonCapColor={(d: any) => {
            const name = d.properties?.NAME;
            const hex = FEATURED_COLORS[name] || '#555566';
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, 0.22)`;
          }}
          polygonSideColor={() => 'rgba(0,0,0,0)'}
          polygonStrokeColor={(d: any) => {
            const name = d.properties?.NAME;
            const hex = FEATURED_COLORS[name] || '#555566';
            const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + 60);
            const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + 60);
            const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + 60);
            return `rgba(${r}, ${g}, ${b}, 0.85)`;
          }}
          polygonAltitude={() => 0.006}
          polygonLabel={() => ''}
          polygonsTransitionDuration={0}

          // Arc connections between events — bold golden trails
          arcsData={arcs}
          arcStartLat={(d: any) => d.startLat}
          arcStartLng={(d: any) => d.startLng}
          arcEndLat={(d: any) => d.endLat}
          arcEndLng={(d: any) => d.endLng}
          arcColor={() => ['rgba(196, 154, 68, 0.9)', 'rgba(196, 154, 68, 0.15)']}
          arcAltitude={0.08}
          arcStroke={1.6}
          arcDashLength={0.6}
          arcDashGap={0.15}
          arcDashAnimateTime={2500}

          // Event markers — large and visible
          customLayerData={events}
          customThreeObject={createMarker}
          customThreeObjectUpdate={updateMarkerPosition}
          customLayerLabel={(d: any) => {
            const c = CATEGORY_COLORS[d.category] ?? '#8a8a9a';
            return `<div style="background:rgba(10,10,16,0.92);backdrop-filter:blur(20px);border:1.5px solid ${c}50;border-radius:10px;padding:10px 14px;font-family:'Space Grotesk',sans-serif;box-shadow:0 4px 20px rgba(0,0,0,0.5);min-width:140px;">
              <div style="font-size:14px;font-weight:700;color:#e0e0e6;margin-bottom:2px;">${d.title}</div>
              <div style="font-size:10px;font-weight:500;color:${c};">${formatYear(d.year)} · ${d.category}</div>
            </div>`;
          }}
        />
      )}

      {/* "Drag to explore" hint — fades out after first interaction */}
      {!interacted && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-full pointer-events-none"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <motion.div
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <MousePointer2 size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />
          </motion.div>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            Drag to explore
          </span>
        </motion.div>
      )}
    </div>
  );
}
