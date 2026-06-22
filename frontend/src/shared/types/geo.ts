/**
 * Minimal shape of a GeoJSON feature in the historical boundary layers
 * (aourednik timeline + CShapes war snapshots). Replaces the scattered
 * `(f: any)` casts in the globe data path.
 */
export interface BoundaryFeature {
  type?: 'Feature';
  properties?: {
    NAME?: string;
    SHAPE_HASH?: string;
    [key: string]: unknown;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    // Polygon: number[][][]  ·  MultiPolygon: number[][][][]
    coordinates: number[][][] | number[][][][];
  };
  /** Stable id assigned at load time so react-globe.gl can tween polygons. */
  __id?: string;
}
