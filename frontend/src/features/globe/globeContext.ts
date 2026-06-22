import { createContext, useContext, type RefObject } from 'react';
import type { GlobeMethods } from 'react-globe.gl';

/**
 * Lightweight globe context, deliberately split out of GlobeView.
 *
 * Consumers of `useGlobe()` — useGlobeCamera, LandmarkOverlay, and
 * transitively the always-mounted SearchOverlay — must import from HERE, not
 * from GlobeView. Importing GlobeView pulls react-globe.gl + three (~1.8MB)
 * into whatever chunk references it; this file imports nothing at runtime
 * (the GlobeMethods import is type-only and erased at build), so the heavy
 * 3D code stays out of the entry/first-paint bundle and only loads when the
 * /explore route mounts GlobeView.
 */
export interface GlobeContextValue {
  globeRef: RefObject<GlobeMethods | undefined> | null;
  getScreenCoords: (lat: number, lng: number) => { x: number; y: number } | null;
}

export const GlobeContext = createContext<GlobeContextValue>({
  globeRef: null,
  getScreenCoords: () => null,
});

export const useGlobe = () => useContext(GlobeContext);
