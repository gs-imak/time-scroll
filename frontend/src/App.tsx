import React, { useEffect, useRef, useState } from 'react';
import './styles/cesium.css';

// Access Cesium as a global variable with proper typing
declare global {
  interface Window {
    Cesium: any;
  }
  
  interface ImportMeta {
    env: {
      VITE_MAPBOX_ACCESS_TOKEN: string;
      VITE_CESIUM_ACCESS_TOKEN: string;
    }
  }
}

// Define location data with precise coordinates and lower heights
const LOCATIONS = {
  newYork: {
    name: "New York City",
    longitude: -74.0060,
    latitude: 40.7128,
    height: 11000, // Reduced height for better visibility
    emoji: "🗽"
  },
  egypt: {
    name: "Pyramids of Giza",
    longitude: 31.1342,
    latitude: 29.9792,
    height: 2000, // Lower height to get closer to the pyramids
    emoji: "🏛️"
  }
};

// Historical time periods for the Pyramids of Giza
const PYRAMID_TIME_PERIODS = [
  {
    id: "construction-begin",
    year: "2580 BCE",
    title: "Construction Begins",
    description: "Workers begin the massive project of building the Great Pyramid of Giza under Pharaoh Khufu's orders. The construction involves thousands of skilled workers, not slaves as commonly believed.",
    imageUrl: null // You can add image URLs later
  },
  {
    id: "construction-mid",
    year: "2570 BCE",
    title: "Mid-Construction",
    description: "The Great Pyramid is half complete. Workers are using ramps and levers to move massive stone blocks weighing several tons each. The limestone casing that will eventually cover the pyramid is being prepared.",
    imageUrl: null
  },
  {
    id: "construction-complete",
    year: "2560 BCE",
    title: "Completion",
    description: "The Great Pyramid is completed after approximately 20 years of construction. It stands 146.5 meters tall and is covered in polished white limestone, making it shine brilliantly in the sunlight.",
    imageUrl: null
  },
  {
    id: "middle-kingdom",
    year: "2000 BCE",
    title: "Middle Kingdom",
    description: "After several centuries, the pyramids remain intact but their limestone casing begins to be removed for other construction projects. The complex is still an important religious and cultural site.",
    imageUrl: null
  },
  {
    id: "modern-era",
    year: "Present Day",
    title: "Modern Era",
    description: "Today, the Great Pyramid stands without its smooth limestone casing, revealing the core masonry. It remains the oldest of the Seven Wonders of the Ancient World and the only one still intact.",
    imageUrl: null
  }
];

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
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [showTimeSlider, setShowTimeSlider] = useState(false);
  const [currentTimePeriodIndex, setCurrentTimePeriodIndex] = useState(0);
  const [activeOverlay, setActiveOverlay] = useState<any>(null);
  const [showVisualEffect, setShowVisualEffect] = useState(false);

  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const cesiumToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN;
  
  // Create a reference to Cesium so we can use it throughout the component
  const Cesium = window.Cesium;

  useEffect(() => {
    if (showLandingPage) return; // Don't initialize Cesium on the landing page
    
    try {
      // Check if Cesium is available globally
      if (!window.Cesium) {
        setError("Cesium is not available. Make sure the CDN script is loaded correctly.");
        return;
      }
      
      console.log("Setting Cesium Ion token...");
      if (window.Cesium.Ion) {
        window.Cesium.Ion.defaultAccessToken = cesiumToken || '';
      }
      
      if (!viewerRef.current) {
        setError("Viewer reference is null");
        return;
      }
      
      console.log("Creating viewer...");
      // Create viewer with optimized settings to reduce loading lag
      cesiumViewer.current = new window.Cesium.Viewer(viewerRef.current, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: true,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        imageryProvider: window.Cesium.createWorldImagery({
          style: window.Cesium.IonWorldImageryStyle.AERIAL_WITH_LABELS
        }),
        sceneMode: window.Cesium.SceneMode.SCENE3D,
        // Make things load faster
        terrainExaggeration: 1.0,
        shadows: false,
        targetFrameRate: 60
      });
      
      // Basic terrain setup
      if (window.Cesium.createWorldTerrain) {
        const terrainProvider = window.Cesium.createWorldTerrain({
          requestWaterMask: false,
          requestVertexNormals: false
        });
        cesiumViewer.current.terrainProvider = terrainProvider;
      }
      
      // Improve performance
      cesiumViewer.current.scene.fog.enabled = false;
      cesiumViewer.current.scene.globe.showGroundAtmosphere = false;
      cesiumViewer.current.scene.globe.maximumScreenSpaceError = 2; // Lower for better quality
      
      // Basic camera settings
      cesiumViewer.current.scene.screenSpaceCameraController.minimumZoomDistance = 10000;
      cesiumViewer.current.scene.screenSpaceCameraController.maximumZoomDistance = 25000000;
      
      // Disable lighting for better performance
      cesiumViewer.current.scene.globe.enableLighting = false;
      cesiumViewer.current.scene.globe.depthTestAgainstTerrain = true;
      
      // Start at a reliable position
      cesiumViewer.current.camera.flyTo({
        destination: window.Cesium.Cartesian3.fromDegrees(0, 0, 20000000),
        duration: 0
      });
      
      // Preload imagery at our destination locations to reduce lag when flying there
      Object.values(LOCATIONS).forEach(location => {
        const rectangle = new window.Cesium.Rectangle.fromDegrees(
          location.longitude - 0.5, // west
          location.latitude - 0.5, // south
          location.longitude + 0.5, // east
          location.latitude + 0.5  // north
        );
        cesiumViewer.current.camera.setView({
          destination: rectangle,
          orientation: {
            heading: 0.0,
            pitch: -Math.PI / 4,
            roll: 0.0
          }
        });
      });
      
      // Then return to initial view
      cesiumViewer.current.camera.flyTo({
        destination: window.Cesium.Cartesian3.fromDegrees(0, 0, 20000000),
        duration: 0
      });
      
      // Add pins for our locations
      const locationEntities: any[] = [];
      Object.values(LOCATIONS).forEach(location => {
        // Create a pin entity with minimal options
        const entity = cesiumViewer.current.entities.add({
          name: location.name,
          position: window.Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude),
          billboard: {
            image: buildPin(location.emoji),
            verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM,
            scale: 1.2, // Slightly larger scale
            heightReference: window.Cesium.HeightReference.CLAMP_TO_GROUND
          },
          label: {
            text: location.name,
            font: '16pt sans-serif', // Larger font
            style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 3, // Thicker outline
            verticalOrigin: window.Cesium.VerticalOrigin.TOP,
            pixelOffset: new window.Cesium.Cartesian2(0, -35), // Adjusted offset
            showBackground: true,
            backgroundColor: new window.Cesium.Color(0.1, 0.1, 0.1, 0.8), // Darker background
            backgroundPadding: new window.Cesium.Cartesian2(10, 7), // More padding
            horizontalOrigin: window.Cesium.HorizontalOrigin.CENTER
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
      
      // Force immediate rendering to reduce lag
      cesiumViewer.current.scene.requestRender();
      
      // Disable camera constraints temporarily
      const sscc = cesiumViewer.current.scene.screenSpaceCameraController;
      const oldMinimumZoomDistance = sscc.minimumZoomDistance;
      const oldMaximumZoomDistance = sscc.maximumZoomDistance;
      
      // Allow closer zooming for more precision
      sscc.minimumZoomDistance = 50; // Minimum zoom level (closer to surface)
      sscc.maximumZoomDistance = 30000000;
      
      // Get the target position in Cartesian3
      const destination = window.Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
      
      // Direct flight to the location with optimized parameters
      cesiumViewer.current.camera.flyTo({
        destination: destination,
        orientation: {
          heading: window.Cesium.Math.toRadians(0.0),
          pitch: window.Cesium.Math.toRadians(-85.0),
          roll: 0.0,
        },
        duration: 2,
        maximumHeight: 5000000, // Limit the maximum height during flight
        pitchAdjustHeight: 0, // Disable automatic pitch adjustment during flight
        complete: function() {
          // Don't restore old constraints as it might prevent zooming in
          // Just keep the new values that allow more zoom flexibility
          console.log("Flight complete");
          
          // Force render to ensure everything is displayed
          cesiumViewer.current.scene.requestRender();
        }
      });
    } catch (error) {
      console.error(`Error flying to ${name}:`, error);
    }
  };

  // Function to handle time period changes and update the map visualization
  const handleTimePeriodChange = (periodIndex: number) => {
    if (!cesiumViewer.current) return;
    
    // Set the current time period index
    setCurrentTimePeriodIndex(periodIndex);
    
    // Clear any existing overlays
    if (activeOverlay) {
      try {
        cesiumViewer.current.entities.remove(activeOverlay);
      } catch (e) {
        console.error("Error removing overlay:", e);
      }
      setActiveOverlay(null);
    }
    
    // Remove all previous time period entities
    cesiumViewer.current.entities.removeAll();
    
    // Add location pins back
    addLocationPins();
    
    // Show a transition effect
    setShowVisualEffect(true);
    setTimeout(() => setShowVisualEffect(false), 1500);
    
    // Add different visual elements based on the selected time period
    try {
      switch(periodIndex) {
        case 0: // Construction Begins (2580 BCE)
          addTimePeriodVisualization("construction-begin");
          break;
          
        case 1: // Mid-Construction (2570 BCE)
          addTimePeriodVisualization("construction-mid");
          break;
          
        case 2: // Completion (2560 BCE)
          addTimePeriodVisualization("construction-complete");
          break;
          
        case 3: // Middle Kingdom (2000 BCE)
          addTimePeriodVisualization("middle-kingdom");
          break;
          
        case 4: // Modern Era (Present Day)
          addTimePeriodVisualization("modern-era");
          break;
      }
    } catch (error) {
      console.error("Error changing time period:", error);
    }
  };
  
  // Function to add visualization for a specific time period
  const addTimePeriodVisualization = (periodId: string) => {
    if (!cesiumViewer.current) return;
    
    const pyramidPosition = window.Cesium.Cartesian3.fromDegrees(
      31.1342, // longitude
      29.9792, // latitude
      0 // height
    );
    
    try {
      switch(periodId) {
        case "construction-begin":
          // Add early construction visualization
          for (let i = 0; i < 10; i++) {
            cesiumViewer.current.entities.add({
              position: window.Cesium.Cartesian3.fromDegrees(
                31.1342 + (Math.random() - 0.5) * 0.005,
                29.9792 + (Math.random() - 0.5) * 0.005,
                Math.random() * 10
              ),
              ellipsoid: {
                radii: new window.Cesium.Cartesian3(20, 20, 5),
                material: window.Cesium.Color.SANDYBROWN.withAlpha(0.8)
              }
            });
          }
          
          // Add a simple foundation
          const foundation = cesiumViewer.current.entities.add({
            position: window.Cesium.Cartesian3.fromDegrees(31.1342, 29.9792, 5),
            box: {
              dimensions: new window.Cesium.Cartesian3(100, 100, 10),
              material: window.Cesium.Color.SANDYBROWN
            }
          });
          
          setActiveOverlay(foundation);
          break;
          
        case "construction-mid":
          // Add half-built pyramid
          const midPyramid = cesiumViewer.current.entities.add({
            position: window.Cesium.Cartesian3.fromDegrees(31.1342, 29.9792, 40),
            ellipsoid: {
              radii: new window.Cesium.Cartesian3(80, 80, 40),
              material: window.Cesium.Color.BURLYWOOD
            }
          });
          
          setActiveOverlay(midPyramid);
          break;
          
        case "construction-complete":
          // Add completed pyramid with limestone
          const completePyramid = cesiumViewer.current.entities.add({
            position: window.Cesium.Cartesian3.fromDegrees(31.1342, 29.9792, 73),
            ellipsoid: {
              radii: new window.Cesium.Cartesian3(80, 80, 73),
              material: window.Cesium.Color.IVORY
            }
          });
          
          setActiveOverlay(completePyramid);
          break;
          
        case "middle-kingdom":
          // Add aged pyramid with some deterioration
          const agedPyramid = cesiumViewer.current.entities.add({
            position: window.Cesium.Cartesian3.fromDegrees(31.1342, 29.9792, 73),
            ellipsoid: {
              radii: new window.Cesium.Cartesian3(80, 80, 73),
              material: window.Cesium.Color.WHEAT
            }
          });
          
          setActiveOverlay(agedPyramid);
          break;
          
        case "modern-era":
          // Modern pyramids - Cesium's default imagery is already showing them
          // We don't need to add anything special
          break;
      }
    } catch (error) {
      console.error("Error adding time period visualization:", error);
    }
  };
  
  // Function to add location pins
  const addLocationPins = () => {
    if (!cesiumViewer.current) return;
    
    Object.values(LOCATIONS).forEach(location => {
      // Create a pin entity
      cesiumViewer.current.entities.add({
        name: location.name,
        position: window.Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude),
        billboard: {
          image: buildPin(location.emoji),
          verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM,
          scale: 1.2,
          heightReference: window.Cesium.HeightReference.CLAMP_TO_GROUND
        },
        label: {
          text: location.name,
          font: '16pt sans-serif',
          style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 3,
          verticalOrigin: window.Cesium.VerticalOrigin.TOP,
          pixelOffset: new window.Cesium.Cartesian2(0, -35),
          showBackground: true,
          backgroundColor: new window.Cesium.Color(0.1, 0.1, 0.1, 0.8),
          backgroundPadding: new window.Cesium.Cartesian2(10, 7),
          horizontalOrigin: window.Cesium.HorizontalOrigin.CENTER
        }
      });
    });
  };

  const flyToNewYork = () => {
    const location = LOCATIONS.newYork;
    flyToLocation(location.longitude, location.latitude, location.height, location.name);
    setCurrentLocation("newYork");
    setShowTimeSlider(false);
  };
  
  const flyToEgypt = () => {
    const location = LOCATIONS.egypt;
    flyToLocation(location.longitude, location.latitude, location.height, location.name);
    setCurrentLocation("egypt");
    setShowTimeSlider(true);
    // Start with modern day view
    setCurrentTimePeriodIndex(4);
    // Apply the modern day appearance with a delay to allow the camera to settle
    setTimeout(() => handleTimePeriodChange(4), 2000);
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
                data-icon="🗽"
              >
                <span>New York City</span>
              </button>
              <button 
                onClick={flyToEgypt} 
                disabled={!cesiumLoaded}
                data-icon="🏛️"
              >
                <span>Pyramids of Giza</span>
              </button>
            </>
          )}
        </div>
        <div id="cesiumContainer" ref={viewerRef} />
        {showVisualEffect && (
          <div className="time-travel-effect"></div>
        )}
        {showTimeSlider && currentLocation === "egypt" && (
          <div className="time-travel-controls" data-period={PYRAMID_TIME_PERIODS[currentTimePeriodIndex].id}>
            <div className="time-travel-info">
              <h2>{PYRAMID_TIME_PERIODS[currentTimePeriodIndex].title}</h2>
              <h3>{PYRAMID_TIME_PERIODS[currentTimePeriodIndex].year}</h3>
              <p>{PYRAMID_TIME_PERIODS[currentTimePeriodIndex].description}</p>
            </div>
            <div className="time-slider-container">
              <button 
                className="time-nav-button"
                disabled={currentTimePeriodIndex === 0}
                onClick={() => handleTimePeriodChange(Math.max(0, currentTimePeriodIndex - 1))}
              >
                ◀ Earlier
              </button>
              <input
                type="range"
                min="0"
                max={PYRAMID_TIME_PERIODS.length - 1}
                value={currentTimePeriodIndex}
                onChange={(e) => handleTimePeriodChange(parseInt(e.target.value))}
                className="time-slider"
              />
              <button 
                className="time-nav-button"
                disabled={currentTimePeriodIndex === PYRAMID_TIME_PERIODS.length - 1}
                onClick={() => handleTimePeriodChange(Math.min(PYRAMID_TIME_PERIODS.length - 1, currentTimePeriodIndex + 1))}
              >
                Later ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;