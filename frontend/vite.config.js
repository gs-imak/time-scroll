import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Cesium assets workaround
const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      cesium: path.resolve(__dirname, cesiumSource),
    },
  },
  define: {
    CESIUM_BASE_URL: JSON.stringify('/cesium'),
  },
  server: {
    fs: {
      allow: ['..'],
    },
  }
});
