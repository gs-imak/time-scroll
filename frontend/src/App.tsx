import React, { useEffect, useRef } from 'react';
import './styles/cesium.css';

function App() {
  const viewerRef = useRef<HTMLDivElement | null>(null);

  // Access tokens from .env
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const cesiumToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN;

  useEffect(() => {
    import('cesium').then((Cesium) => {
      // Set Cesium Ion token
      Cesium.Ion.defaultAccessToken = cesiumToken;

      if (viewerRef.current) {
        const viewer = new Cesium.Viewer(viewerRef.current, {
          terrainProvider: Cesium.createWorldTerrain(),
          animation: true,
          timeline: true,
          baseLayerPicker: false,
        });

        // Remove default imagery and add Mapbox
        viewer.imageryLayers.removeAll();

        viewer.imageryLayers.addImageryProvider(
          new Cesium.UrlTemplateImageryProvider({
            url: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
            tileWidth: 256,
            tileHeight: 256,
            maximumLevel: 18,
            credit: 'Mapbox',
          }),
        );
      }
    });
  }, [cesiumToken, mapboxToken]);

  return (
    <div className="App">
      <h1>🌍 Cesium + Mapbox Integrated</h1>
      <div id="cesiumContainer" ref={viewerRef} />
    </div>
  );
}

export default App;
