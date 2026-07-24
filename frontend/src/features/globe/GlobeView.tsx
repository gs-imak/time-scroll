import { useEffect, useRef, useState, useMemo, useCallback, type ReactNode } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import { GlobeContext } from './globeContext';
import * as THREE from 'three';
import { useMapStore } from '@/shared/stores/mapStore';
import { useTimeStore } from '@/shared/stores/timeStore';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { useJourneyArcsStore } from '@/shared/stores/journeyArcsStore';
import { useCameraStore, altitudeToZoom } from '@/shared/stores/cameraStore';
import { closestBoundaryYear, assignStableIds, mergeStableFeatures } from '@/shared/utils/geo';
import type { BoundaryFeature } from '@/shared/types/geo';
import { BorderTransitionLayer, type FeaturePaintStyle } from './borderTransitionLayer';
import { formatYear } from '@/shared/utils/format';
import { BOUNDARY_YEAR_MAP } from '@/shared/utils/constants';
import { getVisibleCivilizationLabels } from '@/shared/data/civilizationLabels';
import { createEventMarker, createClusterMarker, CATEGORY_COLORS } from './eventMarkers';
import {
  createTetheredMarker,
  createConflictPulse,
  createDiffOverlayDisc,
  updateConflictPulse,
  updateDiffOverlayDisc,
} from './warMarkers';
import { useSpotlightStore } from '@/shared/stores/spotlightStore';
import { useWarStore } from '@/shared/stores/warStore';
import { WAR_EVENTS } from '@/shared/data/warEvents';
import { getGeoJsonFromCache, cacheGeoJson, preloadAllGeoJson } from '@/shared/data/geoJsonCache';
import { getWarGeoJson, closestWarYear, preloadWarGeoJson, isWarPreloaded } from '@/shared/data/warGeoJsonCache';
import { useVisibilityTier } from './useVisibilityTier';
import { useEventClustering } from './useEventClustering';
import { useLabelCollision } from './useLabelCollision';
import { CIV_ALIASES } from '@/shared/data/civAliases';
import { CIV_DESCRIPTIONS, NAME_DESCRIPTIONS } from '@/shared/data/civDescriptions';
import { motion, AnimatePresence } from 'framer-motion';

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

/** Lighten a #rrggbb hex by an additive amount — matches the stroke accessors. */
function lightenHex(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
  return `rgb(${r}, ${g}, ${b})`;
}

// Deterministic hash for per-civ altitude stratification
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Escape interpolated values before injecting them into globe label/tooltip
// HTML. Data is trusted today, but this keeps these innerHTML sinks safe if a
// title/description/name ever carries user or remote text.
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  );
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
  // Tracks the most-recently-requested boundary file. A slow, superseded fetch
  // (from fast timeline scrubbing) compares against this after it resolves and
  // discards itself instead of clobbering newer borders. See the boundary loader.
  const requestedFileRef = useRef<string | null>(null);

  // Three.js resources created in onGlobeReady that must be torn down on unmount.
  // react-globe.gl does NOT dispose its WebGLRenderer/scene/textures when the
  // React component unmounts, so without this every visit to the globe route
  // leaks a live WebGL context + the 8K textures; browsers cap live contexts
  // (~16) and the globe eventually renders black.
  const cloudRafRef = useRef<number>(0);
  const disposablesRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    controls?: ReturnType<GlobeMethods['controls']>;
    controlsChange?: () => void;
    altitudeThrottle?: ReturnType<typeof setTimeout> | null;
    canvas?: HTMLCanvasElement;
    onContextLost?: EventListener;
    cloudMesh?: THREE.Mesh;
    cloudGeo?: THREE.BufferGeometry;
    cloudMat?: THREE.Material;
    cloudTexture?: THREE.Texture;
  }>({});
  const [contextLost, setContextLost] = useState(false);

  // Territory selection — click a territory to isolate and highlight it
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);

  // Spotlight mode state
  const spotlightActive = useSpotlightStore(s => s.active);
  const spotlightAliasSet = useSpotlightStore(s => s.aliasSet);
  const spotlightColor = useSpotlightStore(s => s.civColor);

  // Paint-dissolve transition layer for boundary snapshot changes (created in
  // onGlobeReady once the scene exists; disposed with the other GL resources).
  const transitionLayerRef = useRef<BorderTransitionLayer | null>(null);
  // Mirror of polygonsData for computing merges outside setState updaters.
  const polygonsRef = useRef<BoundaryFeature[]>([]);
  // The boundary effect's closures must see the CURRENT selection at paint
  // time, not the value captured when the effect last ran.
  const selectedTerritoryRef = useRef<string | null>(null);
  useEffect(() => { selectedTerritoryRef.current = selectedTerritory; }, [selectedTerritory]);
  // Dissolving between unrelated datasets (war <-> normal) looks wrong — track
  // the mode so the first paint after a switch swaps without a transition.
  const boundaryModeRef = useRef<'normal' | 'war' | null>(null);

  /** Rasterization style for the transition layer — mirrors the live
   *  polygonCapMaterial / polygonStrokeColor accessors below. */
  const styleForTransition = useCallback((f: BoundaryFeature): FeaturePaintStyle => {
    const name = f.properties?.NAME;
    const isNamed = !!name && name !== '?';
    const sp = useSpotlightStore.getState();
    if (sp.active) {
      if (name && sp.aliasSet.has(name)) {
        const hex = sp.civColor || '#c49a44';
        return { fill: hex, fillAlpha: 0.45, stroke: lightenHex(hex, 80), strokeAlpha: 1 };
      }
      return { fill: '#191923', fillAlpha: 0.03, stroke: 'rgb(30, 30, 40)', strokeAlpha: 0.02 };
    }
    const sel = selectedTerritoryRef.current;
    if (sel) {
      if (name === sel) {
        const hex = getCivColor(name);
        return { fill: hex, fillAlpha: 0.55, stroke: lightenHex(hex, 80), strokeAlpha: 1 };
      }
      return { fill: '#191923', fillAlpha: 0.04, stroke: 'rgb(30, 30, 40)', strokeAlpha: 0.05 };
    }
    if (!isNamed) {
      return { fill: getCivColor(name), fillAlpha: 0.02, stroke: 'rgb(60, 60, 70)', strokeAlpha: 0.15 };
    }
    const hex = getCivColor(name);
    return { fill: hex, fillAlpha: 0.25, stroke: lightenHex(hex, 50), strokeAlpha: 0.9 };
  }, []);

  /** Single entry point for boundary snapshot changes: merges for object
   *  identity (unchanged shapes skip rebuild), runs the paint-dissolve when
   *  transitioning within the same dataset, and respects reduced motion. */
  const applyBoundaries = useCallback((raw: BoundaryFeature[], dissolve: boolean) => {
    const merged = mergeStableFeatures(polygonsRef.current, assignStableIds(raw));
    const layer = transitionLayerRef.current;
    if (layer) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (dissolve && !reduceMotion) layer.transitionTo(merged, styleForTransition, 1100);
      else layer.prime(merged, styleForTransition);
    }
    polygonsRef.current = merged;
    setPolygonsData(merged);
  }, [styleForTransition]);

  // War mode state
  const warActive = useWarStore(s => s.active);
  const warActiveWar = useWarStore(s => s.activeWar);
  const warDiffOverlays = useWarStore(s => s.diffOverlays);
  const warPulses = useWarStore(s => s.pulses);

  const allCivilizationLabels = useMemo(
    () => getVisibleCivilizationLabels(currentYear),
    [currentYear],
  );

  // Responsive sizing — resize bursts are coalesced into one measurement per
  // frame via a requestAnimationFrame guard so a drag-resize doesn't fire a
  // setDimensions storm (each one resizes the WebGL renderer).
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
        const setViewport = useMapStore.getState().setViewport;
        const onControlsChange = () => {
          if (disposablesRef.current.altitudeThrottle) return;
          disposablesRef.current.altitudeThrottle = setTimeout(() => {
            disposablesRef.current.altitudeThrottle = null;
            if (globeRef.current) {
              const pov = globeRef.current.pointOfView();
              setCameraAltitude(pov.altitude);
              // Feed the live camera into mapStore so altitude/zoom-gated overlays
              // react to real navigation. Without this viewport.zoom stayed frozen
              // at its initial value and Landmark overlays (triggerZoom 5.0) — which
              // also need the camera center for their distance gate — never appeared.
              setViewport({ zoom: altitudeToZoom(pov.altitude), center: [pov.lng, pov.lat] });
            }
          }, 60);
        };
        controls.addEventListener('change', onControlsChange);
        disposablesRef.current.controls = controls;
        disposablesRef.current.controlsChange = onControlsChange;
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

        // Track for disposal on unmount
        disposablesRef.current.scene = scene;
        disposablesRef.current.cloudMesh = cloudMesh;
        disposablesRef.current.cloudGeo = cloudGeo;
        disposablesRef.current.cloudMat = cloudMat;
        disposablesRef.current.cloudTexture = cloudTexture;

        // Slowly rotate clouds independently — store the rAF id so the loop can
        // be cancelled on unmount (otherwise it runs forever on a detached mesh).
        const animateClouds = () => {
          cloudMesh.rotation.y += 0.00005;
          cloudRafRef.current = requestAnimationFrame(animateClouds);
        };
        cloudRafRef.current = requestAnimationFrame(animateClouds);

        // Paint-dissolve shell for boundary snapshot changes
        transitionLayerRef.current = new BorderTransitionLayer(scene);
      }

      // Capture the renderer + canvas so we can dispose the WebGL context on
      // unmount and recover from a lost context instead of showing a dead globe.
      const renderer = globeRef.current.renderer();
      if (renderer) {
        disposablesRef.current.renderer = renderer;
        const canvas = renderer.domElement;
        const onContextLost: EventListener = (e) => {
          e.preventDefault();
          if (cloudRafRef.current) cancelAnimationFrame(cloudRafRef.current);
          setContextLost(true);
        };
        canvas.addEventListener('webglcontextlost', onContextLost, false);
        disposablesRef.current.canvas = canvas;
        disposablesRef.current.onContextLost = onContextLost;
      }
    }
  }, [setMapReady]);

  // Dispose every Three.js / WebGL resource on unmount — react-globe.gl leaks
  // the renderer, scene, and 8K textures otherwise, exhausting the browser's
  // live WebGL context budget across route changes.
  useEffect(() => {
    return () => {
      const d = disposablesRef.current;
      if (cloudRafRef.current) cancelAnimationFrame(cloudRafRef.current);
      if (d.altitudeThrottle) clearTimeout(d.altitudeThrottle);
      if (d.controls && d.controlsChange) {
        d.controls.removeEventListener('change', d.controlsChange);
      }
      if (d.canvas && d.onContextLost) {
        d.canvas.removeEventListener('webglcontextlost', d.onContextLost);
      }
      if (d.scene && d.cloudMesh) d.scene.remove(d.cloudMesh);
      d.cloudGeo?.dispose();
      d.cloudMat?.dispose();
      d.cloudTexture?.dispose();
      transitionLayerRef.current?.dispose();
      transitionLayerRef.current = null;
      if (d.renderer) {
        d.renderer.dispose();
        d.renderer.forceContextLoss?.();
      }
      disposablesRef.current = {};
    };
  }, []);

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
    // In war mode, the cinematic camera stays put — don't zoom in on marker clicks
    if (useWarStore.getState().active) return;
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
    // Aim ~12° south of the territory so it frames in the upper half of the
    // viewport — the bottom-anchored stage card occupies the lower half.
    globeRef.current.pointOfView(
      { lat: spotlightCenterLat - 12, lng: spotlightCenterLng, altitude: 1.2 },
      1500,
    );
  }, [spotlightActive, spotlightCivId, spotlightCenterLat, spotlightCenterLng]);

  // Camera fly-to when war mode enters or when switching wars.
  // WWI camera centers slightly south to capture all of Europe + Mediterranean (Gallipoli),
  // WWII centers a bit further north for Eastern Front coverage.
  useEffect(() => {
    if (!warActive || !globeRef.current || !warActiveWar) return;
    const target = warActiveWar === 'wwi'
      ? { lat: 48, lng: 12, altitude: 0.95 }
      : { lat: 50, lng: 18, altitude: 0.95 };
    globeRef.current.pointOfView(target, 1600);
  }, [warActive, warActiveWar]);

  // Restore default camera on war exit
  const wasWarActiveRef = useRef(false);
  useEffect(() => {
    if (wasWarActiveRef.current && !warActive && globeRef.current) {
      globeRef.current.pointOfView({ lat: 30, lng: 0, altitude: 2.5 }, 1400);
    }
    wasWarActiveRef.current = warActive;
  }, [warActive]);


  // Clear territory selection when entering spotlight
  useEffect(() => {
    if (spotlightActive) setSelectedTerritory(null);
  }, [spotlightActive]);

  // Escape to deselect territory
  useEffect(() => {
    if (!selectedTerritory) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTerritory(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedTerritory]);

  // Preload all GeoJSON boundary files so boundary switches are instant — but
  // defer to idle time so the large batch of parallel fetches never competes
  // with first paint / first interaction. The per-year loader below still
  // fetches the current file on demand, and CivLegend re-triggers this on open.
  useEffect(() => {
    const ric = window.requestIdleCallback;
    if (ric) {
      const id = ric(() => preloadAllGeoJson(), { timeout: 4000 });
      return () => window.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => preloadAllGeoJson(), 2000);
    return () => clearTimeout(t);
  }, []);

  // Preload the 15 war snapshots the first time War Mode activates (one-time cost)
  useEffect(() => {
    if (warActive && !isWarPreloaded()) {
      preloadWarGeoJson();
    }
  }, [warActive]);

  // Update boundaries when year changes or War Mode toggles.
  // In War Mode we load from the CShapes-derived snapshots in /assets/geo-war/;
  // the aourednik timeline data is untouched.
  useEffect(() => {
    // Dissolve only within the same dataset — the first paint after entering
    // or leaving war mode swaps hard (blending unrelated maps looks wrong).
    const mode: 'normal' | 'war' = warActive ? 'war' : 'normal';
    const dissolve = boundaryModeRef.current === mode;

    if (warActive) {
      const warYear = closestWarYear(currentYear);
      const fileName = `war_${warYear}`;
      if (fileName === loadedFileRef.current) return;
      boundaryModeRef.current = mode;
      // Record this as the latest intent so an in-flight older fetch bails.
      requestedFileRef.current = fileName;

      const cached = getWarGeoJson(warYear);
      if (cached) {
        applyBoundaries(cached, dissolve);
        loadedFileRef.current = fileName;
        return;
      }

      // Fallback fetch if war preload hasn't finished yet
      (async () => {
        try {
          const res = await fetch(`/assets/geo-war/world_${warYear}.geojson`);
          if (!res.ok) return;
          const geojson = await res.json();
          // A newer year was requested while this response was in flight — discard.
          if (requestedFileRef.current !== fileName) return;
          applyBoundaries(geojson.features || [], dissolve);
          loadedFileRef.current = fileName;
        } catch { /* skip */ }
      })();
      return;
    }

    // Normal mode — aourednik data via the default cache
    const year = closestBoundaryYear(currentYear, SORTED_BOUNDARY_YEARS);
    const fileName = BOUNDARY_YEAR_MAP[year];
    if (!fileName || fileName === loadedFileRef.current) return;
    boundaryModeRef.current = mode;
    requestedFileRef.current = fileName;

    const cached = getGeoJsonFromCache(fileName);
    if (cached) {
      applyBoundaries(cached, dissolve);
      loadedFileRef.current = fileName;
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/assets/geo/${fileName}.geojson`);
        if (!res.ok) return;
        const geojson = await res.json();
        const features = geojson.features || [];
        // Cache the fetched data regardless (a re-scrub to this year is then
        // instant), but only paint it if this is still the current request.
        cacheGeoJson(fileName, features);
        if (requestedFileRef.current !== fileName) return;
        applyBoundaries(features, dissolve);
        loadedFileRef.current = fileName;
      } catch { /* skip */ }
    })();
  }, [currentYear, warActive, applyBoundaries]);

  // Get visible events, then filter by zoom tier, then cluster nearby ones.
  // Memoized so the array keeps a stable reference across the many GlobeView
  // re-renders where currentYear is unchanged, letting the downstream
  // visibility-tier and clustering memos stay valid.
  const allVisibleEvents = useMemo(
    () => getVisibleEvents(currentYear),
    [getVisibleEvents, currentYear],
  );
  const { filteredLabels: civilizationLabelsRaw, filteredEvents } = useVisibilityTier(
    allCivilizationLabels,
    allVisibleEvents,
  );
  const clusteredEventsNormal = useEventClustering(filteredEvents);

  // In war mode, replace civ labels with empty (cleaner stage) and replace
  // clustered events with tethered war markers + diff overlays + pulses.
  const civilizationLabels = warActive ? [] : civilizationLabelsRaw;

  const customLayerData = useMemo(() => {
    if (!warActive || !warActiveWar) return clusteredEventsNormal;

    const warMarkers = WAR_EVENTS
      .filter((e) => e.war === warActiveWar && e.year <= currentYear)
      .map((e) => ({
        type: 'war-marker' as const,
        id: e.id,
        title: e.title,
        latitude: e.latitude,
        longitude: e.longitude,
      }));

    const diffs = warDiffOverlays.map((d) => ({
      type: 'war-diff' as const,
      id: d.id,
      kind: d.kind,
      lat: d.lat,
      lng: d.lng,
      bornAt: d.bornAt,
    }));

    const pulses = warPulses.map((p) => ({
      type: 'war-pulse' as const,
      id: p.id,
      lat: p.lat,
      lng: p.lng,
      bornAt: p.bornAt,
    }));

    return [...diffs, ...pulses, ...warMarkers];
  }, [warActive, warActiveWar, clusteredEventsNormal, currentYear, warDiffOverlays, warPulses]);

  // Label collision avoidance — labels are now flat text on the surface,
  // only need to check label-vs-label overlap (markers are on a different layer)
  useLabelCollision(globeRef, civilizationLabels.length > 0, []);

  // Screen coords helper for child components (landmarks)
  const getScreenCoords = useCallback((lat: number, lng: number) => {
    if (!globeRef.current) return null;
    const coords = globeRef.current.getScreenCoords(lat, lng, 0.02);
    if (!coords) return null;
    return { x: coords.x, y: coords.y };
  }, []);

  // Create marker — dispatches to event, cluster, or war renderer
  const createCustomMarker = useCallback((d: any) => {
    if (d.type === 'cluster') {
      return createClusterMarker({
        count: d.count,
        dominantCategory: d.dominantCategory,
      });
    }
    if (d.type === 'war-marker') {
      return createTetheredMarker({ id: d.id, title: d.title });
    }
    if (d.type === 'war-pulse') {
      return createConflictPulse(d.bornAt);
    }
    if (d.type === 'war-diff') {
      return createDiffOverlayDisc(d.kind, d.bornAt);
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
    let lat: number;
    let lng: number;
    if (d.type === 'cluster') { lat = d.lat; lng = d.lng; }
    else if (d.type === 'war-marker' || d.type === 'war-diff' || d.type === 'war-pulse') {
      lat = d.lat ?? d.latitude;
      lng = d.lng ?? d.longitude;
    } else {
      lat = d.displayLat ?? d.latitude;
      lng = d.displayLng ?? d.longitude;
    }
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

      // War-mode FX self-animate based on bornAt timestamp
      if (d.type === 'war-pulse') {
        updateConflictPulse(obj as THREE.Mesh, performance.now());
      } else if (d.type === 'war-diff') {
        updateDiffOverlayDisc(obj as THREE.Mesh, performance.now());
      } else if (d.type === 'event' && d.groupSize > 1) {
        const densityScale = Math.max(0.35, 1 / (1 + d.groupSize * 0.25));
        obj.scale.setScalar(densityScale);
      } else if (d.type !== 'cluster' && d.type !== 'war-marker' && d.type !== 'war-diff' && d.type !== 'war-pulse') {
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
            backgroundImageUrl="/assets/images/night-sky.png"
            atmosphereColor="#6db3f2"
            atmosphereAltitude={0.18}
            showAtmosphere={true}

            // Historical boundaries — custom materials to eliminate z-fighting
            polygonsData={polygonsData}
            polygonGeoJsonGeometry={(d: any) => d.geometry}
            polygonCapMaterial={(d: any) => {
              const name: string | undefined = d.properties?.NAME;
              const isNamed = name && name !== '?';
              const isSelected = selectedTerritory && name === selectedTerritory;
              const hasSelection = !!selectedTerritory;

              if (spotlightActive) {
                if (name && spotlightAliasSet.has(name)) {
                  const hex = spotlightColor || '#c49a44';
                  return getCachedCapMaterial(`spot-cap-${name}`, hex, 0.45, -2);
                }
                return getCachedCapMaterial('spot-cap-dim', '#191923', 0.03, 2);
              }

              // Territory selection: selected = full opacity, others dim
              if (hasSelection) {
                if (isSelected) {
                  const hex = getCivColor(name);
                  return getCachedCapMaterial(`sel-cap-${name}`, hex, 0.55, -5);
                }
                return getCachedCapMaterial('sel-cap-dim', '#191923', 0.04, 2);
              }

              const hex = getCivColor(name);
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
              const isSelected = selectedTerritory && name === selectedTerritory;
              const hasSelection = !!selectedTerritory;

              if (spotlightActive) {
                if (name && spotlightAliasSet.has(name)) {
                  const hex = spotlightColor || '#c49a44';
                  return getCachedSideMaterial(`spot-side-${name}`, hex, 0.85);
                }
                return getCachedSideMaterial('spot-side-dim', '#14141c', 0.01);
              }

              if (hasSelection) {
                if (isSelected) {
                  const hex = getCivColor(name);
                  return getCachedSideMaterial(`sel-side-${name}`, hex, 0.9);
                }
                return getCachedSideMaterial('sel-side-dim', '#14141c', 0.02);
              }

              if (!name || name === '?') {
                return getCachedSideMaterial('side-unknown', '#282832', 0.05);
              }
              const hex = getCivColor(name);
              return getCachedSideMaterial(`side-${name}`, hex, 0.6);
            }}
            polygonStrokeColor={(d: any) => {
              const name = d.properties?.NAME;
              const isSelected = selectedTerritory && name === selectedTerritory;
              const hasSelection = !!selectedTerritory;

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

              if (hasSelection) {
                if (isSelected) {
                  const hex = getCivColor(name);
                  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + 80);
                  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + 80);
                  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + 80);
                  return `rgba(${r}, ${g}, ${b}, 1.0)`;
                }
                return 'rgba(30, 30, 40, 0.05)';
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
              const isSelected = selectedTerritory && name === selectedTerritory;

              if (spotlightActive) {
                return spotlightAliasSet.has(name) ? 0.018 : 0.0003;
              }

              // Selected territory lifts up prominently
              if (isSelected) return 0.03;

              if (selectedTerritory) {
                // Other territories sink when something is selected
                return name && name !== '?' ? 0.002 : 0.001;
              }

              if (!name || name === '?') return 0.002;
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
                  <span style="font-size: 14px; font-weight: 700; color: ${color}; letter-spacing: 0.02em;">${escapeHtml(name)}</span>
                </div>
                <div style="font-size: 10px; color: #55556a; padding-left: 18px;">
                  ${formatYear(currentYear)}
                </div>
              </div>`;
            }}
            // 800ms: long enough to read a border change as motion, short enough
            // that only genuinely-changed polygons (post identity-merge) animate
            // without the whole map feeling in permanent flux during playback.
            polygonsTransitionDuration={800}
            onPolygonClick={(d: any) => {
              const name = d.properties?.NAME;
              if (!name || name === '?') return;
              if (spotlightActive || warActive) return;
              // Toggle: click same territory to deselect, different to select
              setSelectedTerritory(prev => prev === name ? null : name);
            }}

            // Event markers + cluster badges (war markers + diff overlays + pulses in war mode)
            customLayerData={customLayerData}
            customThreeObject={createCustomMarker}
            customThreeObjectUpdate={updateMarkerPosition}
            onCustomLayerClick={(obj: any) => {
              if (obj.type === 'cluster') {
                if (globeRef.current) {
                  globeRef.current.pointOfView(
                    { lat: obj.lat, lng: obj.lng, altitude: 0.4 },
                    1200,
                  );
                }
              } else if (obj.type === 'war-marker') {
                // Open the existing EventDetailSheet — no camera move (would
                // disorient the cinematic view)
                selectEvent(obj.id);
              } else if (obj.type === 'war-diff' || obj.type === 'war-pulse') {
                // Non-interactive FX
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
              // War-mode FX have no tooltip; the marker badge IS the label
              if (d.type === 'war-marker' || d.type === 'war-diff' || d.type === 'war-pulse') return '';
              if (d.type === 'cluster') {
                const c = CATEGORY_COLORS[d.dominantCategory] ?? '#8a8a9a';
                const titles = d.events
                  .slice(0, 5)
                  .map((e: any) => `<div style="font-size: 11px; color: #b0b0bc; padding: 2px 0;">· ${escapeHtml(e.title)}</div>`)
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
                  ${escapeHtml(d.title)}
                </div>
                <div style="font-size: 10px; font-weight: 500; color: ${c}; margin-bottom: 6px;">
                  ${formatYear(d.year)} · ${d.category}
                </div>
                <div style="font-size: 11px; color: #8a8a9a; line-height: 1.45;">
                  ${escapeHtml(d.description?.slice(0, 140) ?? '')}${d.description?.length > 140 ? '…' : ''}
                </div>
              </div>`;
            }}

            // Civilization names — flat text on territory surface (no floating badges)
            htmlElementsData={civilizationLabels}
            htmlLat={(d: any) => d.lat}
            htmlLng={(d: any) => d.lng}
            htmlAltitude={0.012}
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
                <span style="
                  font-size: 9px;
                  font-weight: 800;
                  color: ${color};
                  opacity: 0.7;
                  letter-spacing: 0.14em;
                  text-transform: uppercase;
                  font-family: 'Space Grotesk', system-ui, sans-serif;
                  text-shadow:
                    0 0 6px rgba(0,0,0,0.9),
                    0 0 12px rgba(0,0,0,0.6),
                    0 1px 3px rgba(0,0,0,0.8);
                ">${escapeHtml(d.name ?? '')}</span>
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

        {/* WebGL context-loss recovery — shown instead of a frozen black globe */}
        {contextLost && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-void/90 text-text-primary">
            <p className="text-[14px] text-text-secondary" style={{ fontFamily: "var(--font-display)" }}>
              The 3D view lost its graphics context
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl text-[14px] font-semibold cursor-pointer transition-transform hover:scale-[1.03] active:scale-[0.97]"
              style={{ background: 'var(--color-accent-cyan)', color: 'var(--color-void)', fontFamily: 'var(--font-display)' }}
            >
              Reload the globe
            </button>
          </div>
        )}
        {ready && children}

        {/* Territory info card — shows when a territory is clicked */}
        <AnimatePresence>
          {selectedTerritory && !spotlightActive && (() => {
            const civColor = getCivColor(selectedTerritory);
            const civEntry = Object.entries(CIV_ALIASES).find(([, v]) =>
              v.aliases.includes(selectedTerritory!),
            );
            const civId = civEntry?.[0];
            const civDesc = civId ? CIV_DESCRIPTIONS[civId] : null;
            const nameDesc = NAME_DESCRIPTIONS[selectedTerritory!];
            const desc = civDesc || (nameDesc ? { ...nameDesc, imageUrl: nameDesc.imageUrl || '' } : null);

            return (
              <motion.div
                key={selectedTerritory}
                className="fixed top-20 right-4 z-40 lg:right-[80px]"
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.95 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'var(--glass-strong-bg)',
                    backdropFilter: 'blur(24px)',
                    border: `1.5px solid ${civColor}35`,
                    boxShadow: `0 0 30px ${civColor}15, 0 8px 32px var(--glass-shadow-strong)`,
                    width: 340,
                    maxHeight: 'calc(100vh - 280px)',
                    overflowY: 'auto',
                  }}
                >
                  {/* Image */}
                  {desc?.imageUrl && (
                    <div className="relative w-full h-[140px] overflow-hidden">
                      <img
                        src={desc.imageUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ objectPosition: 'center 25%' }}
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(to top, var(--glass-strong-bg) 0%, transparent 60%)` }}
                      />
                      {/* Close button */}
                      <motion.button
                        onClick={() => setSelectedTerritory(null)}
                        className="absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer"
                        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Close"
                      >
                        <span className="text-[12px] text-white/70">✕</span>
                      </motion.button>
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative z-10 px-5 pb-5 pt-4">
                    {/* Header */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ background: civColor, boxShadow: `0 0 8px ${civColor}80` }}
                      />
                      <div className="min-w-0">
                        <h3
                          className="text-[16px] font-bold leading-tight break-words"
                          style={{ color: civColor, fontFamily: 'var(--font-display)' }}
                        >
                          {selectedTerritory}
                        </h3>
                        <p className="text-[10px] font-mono text-text-muted">{formatYear(currentYear)}</p>
                      </div>
                    </div>

                    {/* Description */}
                    {desc ? (
                      <>
                        <p className="text-[12px] text-text-secondary leading-[1.65] mb-3">
                          {desc.summary}
                        </p>
                        {desc.detail && (
                          <p className="text-[12px] text-text-secondary leading-[1.65] mb-3">
                            {desc.detail}
                          </p>
                        )}
                        {desc.keyFacts && desc.keyFacts.length > 0 && (
                          <div
                            className="rounded-lg px-3 py-2.5 mb-3"
                            style={{ background: `${civColor}08`, border: `1px solid ${civColor}15` }}
                          >
                            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Key Facts</p>
                            <ul className="flex flex-col gap-1">
                              {desc.keyFacts.map((fact: string, i: number) => (
                                <li key={i} className="text-[11px] text-text-secondary leading-[1.5] flex items-start gap-1.5">
                                  <span style={{ color: civColor, fontSize: '8px', marginTop: '4px' }}>●</span>
                                  {fact}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div
                          className="rounded-lg px-3 py-2.5 mb-4"
                          style={{ background: `${civColor}08`, border: `1px solid ${civColor}15` }}
                        >
                          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Known for</p>
                          <p className="text-[11px] text-text-secondary leading-[1.55]">{desc.knownFor}</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-[12px] text-text-secondary leading-[1.65] mb-4">
                        {selectedTerritory} — a people or territory present in this region during {formatYear(currentYear)}. Many such groups left lasting cultural, linguistic, or ecological legacies even without written records.
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {civId && (
                        <motion.button
                          onClick={() => {
                            setSelectedTerritory(null);
                            useSpotlightStore.getState().enterSpotlight(civId);
                          }}
                          className="flex-1 px-4 py-2.5 rounded-lg text-[12px] font-semibold cursor-pointer"
                          style={{
                            background: `${civColor}20`,
                            border: `1px solid ${civColor}40`,
                            color: civColor,
                          }}
                          whileHover={{ scale: 1.02, background: `${civColor}30` }}
                          whileTap={{ scale: 0.97 }}
                        >
                          View Timeline
                        </motion.button>
                      )}
                      <motion.button
                        onClick={() => setSelectedTerritory(null)}
                        className="px-4 py-2.5 rounded-lg text-[12px] font-medium cursor-pointer text-text-secondary"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border-subtle)' }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Close
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </GlobeContext.Provider>
  );
}
