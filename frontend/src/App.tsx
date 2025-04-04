import React, { useEffect, useRef, useState } from 'react';
import './styles/cesium.css';

// Access Cesium as a global variable
declare const Cesium: any;

// Define location data with precise coordinates and lower heights
const LOCATIONS = {
  newYork: {
    name: "New York City",
    longitude: -74.0060,
    latitude: 40.7128,
    height: 100000, // Reduced height for better visibility
    emoji: "🗽"
  },
  egypt: {
    name: "Cairo, Egypt",
    longitude: 31.2357,
    latitude: 30.0444,
    height: 150000, // Reduced height for better visibility
    emoji: "🏛️"
  }
};

function App() {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const cesiumViewer = useRef<any>(null);
  const [cesiumLoaded, setCesiumLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entities, setEntities] = useState<any[]>([]);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [showPreloader, setShowPreloader] = useState(false);
  const [showPortalEffect, setShowPortalEffect] = useState(false);
  const [showTransitionOverlay, setShowTransitionOverlay] = useState(false);

  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const cesiumToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN;

  useEffect(() => {
    if (showLandingPage) return; // Don't initialize Cesium on the landing page
    
    try {
      // Check if Cesium is available globally
      if (!window.Cesium) {
        setError("Cesium is not available. Make sure the CDN script is loaded correctly.");
        return;
      }
      
      console.log("Setting Cesium Ion token...");
      if (Cesium.Ion) {
        Cesium.Ion.defaultAccessToken = cesiumToken || '';
      }
      
      if (!viewerRef.current) {
        setError("Viewer reference is null");
        return;
      }
      
      console.log("Creating viewer...");
      // Create viewer with basic settings that are known to work
      cesiumViewer.current = new Cesium.Viewer(viewerRef.current, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        imageryProvider: Cesium.createWorldImagery({
          style: Cesium.IonWorldImageryStyle.AERIAL_WITH_LABELS
        })
      });
      
      // Basic terrain setup
      if (Cesium.createWorldTerrain) {
        const terrainProvider = Cesium.createWorldTerrain({
          requestWaterMask: false,
          requestVertexNormals: false
        });
        cesiumViewer.current.terrainProvider = terrainProvider;
      }
      
      // Basic camera settings
      cesiumViewer.current.scene.screenSpaceCameraController.minimumZoomDistance = 10000;
      cesiumViewer.current.scene.screenSpaceCameraController.maximumZoomDistance = 25000000;
      
      // Disable lighting for better performance
      cesiumViewer.current.scene.globe.enableLighting = false;
      cesiumViewer.current.scene.globe.depthTestAgainstTerrain = true;
      
      // Start at a reliable position
      cesiumViewer.current.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(0, 0, 20000000),
        duration: 0
      });
      
      // Add pins for our locations
      const locationEntities: any[] = [];
      Object.values(LOCATIONS).forEach(location => {
        // Create a pin entity with minimal options
        const entity = cesiumViewer.current.entities.add({
          name: location.name,
          position: Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude),
          billboard: {
            image: buildPin(location.emoji),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            scale: 1.0
          },
          label: {
            text: location.name,
            font: '14pt sans-serif',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.TOP,
            pixelOffset: new Cesium.Cartesian2(0, -30),
            showBackground: true,
            backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 0.7),
            backgroundPadding: new Cesium.Cartesian2(7, 5),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER
          }
        });
        locationEntities.push(entity);
      });
      
      setEntities(locationEntities);
      console.log("Viewer created successfully");
      
      // Set globe as loaded immediately
      if (viewerRef.current) {
        viewerRef.current.style.opacity = '1';
      }
      
      // Hide preloader when everything is ready
      setTimeout(() => {
        setShowPreloader(false);
        setCesiumLoaded(true);
      }, 500);
    } catch (err) {
      console.error("Error initializing Cesium:", err);
      setError(`Initialization error: ${err instanceof Error ? err.message : String(err)}`);
      setShowPreloader(false);
    }
    
    // Cleanup on unmount
    return () => {
      if (cesiumViewer.current) {
        try {
          cesiumViewer.current.destroy();
        } catch (e) {
          console.error("Error destroying viewer:", e);
        }
      }
    };
  }, [cesiumToken, mapboxToken, showLandingPage]);

  // Function to create a pin with emoji
  const buildPin = (emoji: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if (context) {
      // Draw pin background
      context.beginPath();
      context.arc(32, 32, 28, 0, 2 * Math.PI, false);
      context.fillStyle = '#3F7FBF';
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = 'white';
      context.stroke();
      
      // Draw emoji
      context.font = '32px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(emoji, 32, 28);
    }
    return canvas;
  };

  const flyToLocation = (longitude: number, latitude: number, height: number, name: string) => {
    if (!cesiumViewer.current) return;
    
    try {
      console.log(`Flying to ${name}...`);
      // Simple direct flight to the location
      cesiumViewer.current.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-45.0),
          roll: 0.0,
        },
        duration: 2,
      });
      
      // Find the entity to track
      const entity = cesiumViewer.current.entities.values.find((e: any) => e.name === name);
      
      // Track the entity to ensure it's visible
      if (entity) {
        setTimeout(() => {
          cesiumViewer.current.trackedEntity = undefined; // Untrack first to avoid conflicts
          cesiumViewer.current.zoomTo(entity);
        }, 2500); // Wait for the initial animation to complete
      }
    } catch (error) {
      console.error(`Error flying to ${name}:`, error);
    }
  };

  // Add debug function to log camera position
  const logCameraPosition = () => {
    if (!cesiumViewer.current) return;
    
    const camera = cesiumViewer.current.camera;
    const position = camera.positionCartographic;
    const longitude = Cesium.Math.toDegrees(position.longitude);
    const latitude = Cesium.Math.toDegrees(position.latitude);
    const height = position.height;
    
    console.log(`Camera position: longitude=${longitude.toFixed(4)}, latitude=${latitude.toFixed(4)}, height=${height.toFixed(0)}m`);
  };

  const flyToNewYork = () => {
    const location = LOCATIONS.newYork;
    flyToLocation(location.longitude, location.latitude, location.height, location.name);
    setTimeout(logCameraPosition, 3000);
  };
  
  const flyToEgypt = () => {
    const location = LOCATIONS.egypt;
    flyToLocation(location.longitude, location.latitude, location.height, location.name);
    setTimeout(logCameraPosition, 3000);
  };

  const handleStartJourney = () => {
    // Apply transition effects
    setTransitioning(true);
    
    // Show transition overlay immediately
    setShowTransitionOverlay(true);
    
    // Simple sequential timing
    setTimeout(() => {
      // Show preloader
      setShowPreloader(true);
      
      setTimeout(() => {
        setShowPortalEffect(true);
        
        setTimeout(() => {
          setShowLandingPage(false);
          
          setTimeout(() => {
            setShowTransitionOverlay(false);
          }, 800);
        }, 1000);
      }, 300);
    }, 200);
  };

  // Render the preloader
  const renderPreloader = () => {
    if (!showPreloader) return null;
    
    return (
      <div className={`preloader ${showPreloader ? 'active' : ''}`}>
        <div className="wave-loader">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    );
  };

  // Render the portal transition effect
  const renderPortalEffect = () => {
    if (!showPortalEffect) return null;
    
    return (
      <div className={`portal-transition ${showPortalEffect ? 'active' : ''}`}></div>
    );
  };

  // Render the transition overlay
  const renderTransitionOverlay = () => {
    if (!showTransitionOverlay) return null;
    
    return (
      <div className={`transition-overlay ${showTransitionOverlay ? 'active' : ''}`}></div>
    );
  };

  if (showLandingPage) {
    return (
      <>
        {renderPreloader()}
        {renderPortalEffect()}
        {renderTransitionOverlay()}
        <div className={`landing-page ${transitioning ? 'fade-out' : ''}`}>
          <div className="landing-content">
            <h1>Temporal Voyage Explorer</h1>
            <p className="landing-subtitle">Journey through space and time to explore historical locations across our planet</p>
            
            <div className="time-indicators">
              <div className="time-indicator">
                <span className="time-label">Era</span>
                <span className="time-value">21st Century</span>
              </div>
              <div className="time-indicator">
                <span className="time-label">Destinations</span>
                <span className="time-value">2 Available</span>
              </div>
              <div className="time-indicator">
                <span className="time-label">System</span>
                <span className="time-value">Ready</span>
              </div>
            </div>
            
            <button 
              className="journey-button"
              onClick={handleStartJourney}
              disabled={transitioning}
            >
              <span className="button-text">Initialize Time Portal</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {renderPreloader()}
      {renderTransitionOverlay()}
      <div className="App">
        <h1>🌍 Temporal Voyage Explorer</h1>
        <div className="button-container">
          {error ? (
            <div className="error-message">
              Error: {error}
            </div>
          ) : (
            <>
              <button 
                onClick={flyToNewYork} 
                disabled={!cesiumLoaded}
              >
                <span>New York City 🗽</span>
              </button>
              <button 
                onClick={flyToEgypt} 
                disabled={!cesiumLoaded}
              >
                <span>Cairo, Egypt 🏛️</span>
              </button>
            </>
          )}
        </div>
        <div id="cesiumContainer" ref={viewerRef} />
      </div>
    </>
  );
}

export default App;