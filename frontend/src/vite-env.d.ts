/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_ACCESS_TOKEN: string;
  readonly VITE_CESIUM_ACCESS_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Add global declaration for CESIUM_BASE_URL
interface Window {
  CESIUM_BASE_URL: string;
  Cesium: any;
} 