import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
    // A single three instance: react-globe.gl/three-globe must share the app's
    // (root-overridden) copy, or dev prebundling duplicates it.
    dedupe: ['three'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          globe: ['react-globe.gl'],
          rive: ['@rive-app/react-webgl2'],
          motion: ['framer-motion'],
          vendor: ['react', 'react-dom', 'react-router', 'zustand'],
        },
      },
    },
  },
});
