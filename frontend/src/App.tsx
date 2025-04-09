import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import './styles/cesium.css';
import { MiniTimeline, TimeDial, EraTransition, DescriptionPanel } from './components/time-ui';
import { LocationsPanel } from './components/LocationsPanel';
import { GlobalTimeSlider } from './components/GlobalTimeSlider';
import { HistoricalEventMarker } from './components/HistoricalEventMarker';
import { EventDetailModal } from './components/EventDetailModal';
import { PyramidAnimation } from './components/PyramidAnimation';
import { GLOBAL_TIME_PERIODS, HISTORICAL_EVENTS } from './constants/historyData';

// Get the interfaces from the GlobalTimeSlider component
import type { TimePeriod, HistoricalEvent } from './components/GlobalTimeSlider';

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
    id: 'newYork',
    name: "New York City",
    longitude: -74.0060,
    latitude: 40.7128,
    height: 11000, // Reduced height for better visibility
    emoji: "🗽",
    category: 'modern'
  },
  egypt: {
    id: 'egypt',
    name: "Pyramids of Giza",
    longitude: 31.1342,
    latitude: 29.9792,
    height: 2000, // Lower height to get closer to the pyramids
    emoji: "🏛️",
    category: 'ancient'
  }
};

// Create a simpler format for the LocationsPanel
const LOCATION_LIST = Object.values(LOCATIONS).map(loc => ({
  id: loc.id,
  name: loc.name,
  emoji: loc.emoji,
  category: loc.category
}));

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
  const [showEraTransition, setShowEraTransition] = useState(false);
  const [transitionData, setTransitionData] = useState({ location: '', year: '' });
  const [showDescriptionPanel, setShowDescriptionPanel] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<typeof PYRAMID_TIME_PERIODS[0] | null>(null);
  const [visibleEvents, setVisibleEvents] = useState<HistoricalEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [currentGlobalPeriod, setCurrentGlobalPeriod] = useState(GLOBAL_TIME_PERIODS[GLOBAL_TIME_PERIODS.length - 1].id);
  
  // New state variables for the landing page experience
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [isSystemReady, setIsSystemReady] = useState(false);
  const [isPortalStabilized, setIsPortalStabilized] = useState(false);
  const [availableEras] = useState([
    { id: 'ancient', name: 'Ancient World' },
    { id: 'medieval', name: 'Medieval Era' },
    { id: 'renaissance', name: 'Renaissance' },
    { id: 'industrial', name: 'Industrial Age' },
    { id: 'modern', name: '21st Century' }
  ]);

  // Add a loading state for location transitions
  const [isLocationTransitioning, setIsLocationTransitioning] = useState(false);

  const [showPyramidAnimation, setShowPyramidAnimation] = useState(false);
  const [pyramidAnimationPosition, setPyramidAnimationPosition] = useState({ x: 0, y: 0 });

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
      // Create a hidden element for credits to effectively remove them from view
      const hiddenCreditsContainer = document.createElement('div');
      hiddenCreditsContainer.style.display = 'none';
      
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
        targetFrameRate: 60,
        // Hide credits
        creditContainer: hiddenCreditsContainer,
        creditViewport: hiddenCreditsContainer
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
      
      // Set strict global zoom limits
      cesiumViewer.current.scene.screenSpaceCameraController.minimumZoomDistance = 800000; // Restrict how close users can zoom
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
        // Create a pin entity with improved visibility options
        const entity = cesiumViewer.current.entities.add({
          id: `location_pin_${location.name.replace(/\s+/g, '_').toLowerCase()}`,
          name: location.name,
          position: window.Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude),
          billboard: {
            image: buildPin(location.emoji),
            verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM,
            scale: 0.8, // Smaller scale for Google Maps style
            heightReference: window.Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY // Always show on top
          },
          label: {
            text: location.name,
            font: '12pt sans-serif', // Smaller font
            style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: window.Cesium.VerticalOrigin.TOP,
            pixelOffset: new window.Cesium.Cartesian2(0, -8), // Adjusted for smaller icon
            showBackground: true,
            backgroundColor: new window.Cesium.Color(0.1, 0.1, 0.1, 0.7),
            backgroundPadding: new window.Cesium.Cartesian2(7, 5),
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

  useEffect(() => {
    if (!cesiumLoaded || showLandingPage) return;
    
    // When the map is loaded, initialize the filtered events
    // This ensures we have event markers instead of location pins
    if (cesiumViewer.current) {
      handleEventsFiltered(HISTORICAL_EVENTS);
    }
  }, [cesiumLoaded, showLandingPage]);

  // Function to create a pin with emoji
  const buildPin = (emoji: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 40; // Much smaller size
    canvas.height = 40; // Much smaller size
    const context = canvas.getContext('2d');
    if (context) {
      // Create a Google Maps style pin (teardrop shape)
      context.beginPath();
      context.arc(20, 14, 10, 0, Math.PI * 2, true); // Circle for top part
      context.moveTo(20, 14);
      context.lineTo(26, 28); // Right side of pointer
      context.lineTo(20, 36); // Tip of pointer
      context.lineTo(14, 28); // Left side of pointer
      context.lineTo(20, 14); // Back to start
      context.closePath();
      
      // Fill with nice gradient
      const gradient = context.createLinearGradient(0, 0, 0, 36);
      gradient.addColorStop(0, 'rgba(66, 133, 244, 0.95)'); // Google Maps blue
      gradient.addColorStop(1, 'rgba(26, 115, 232, 0.98)');
      context.fillStyle = gradient;
      context.fill();
      
      // Add subtle border
      context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      context.lineWidth = 1;
      context.stroke();
      
      // Add subtle shadow
      context.shadowColor = 'rgba(0, 0, 0, 0.5)';
      context.shadowBlur = 5;
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 2;
      
      // Reset shadow for emoji
      context.shadowBlur = 0;
      context.shadowOffsetY = 0;
      
      // Draw emoji at smaller size
      context.font = '14px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = 'white';
      context.fillText(emoji, 20, 14);
    }
    return canvas;
  };

  const flyToLocation = (longitude: number, latitude: number, height: number, name: string) => {
    if (!cesiumViewer.current) return;
    
    try {
      console.log(`Flying to ${name}...`);
      
      // Force immediate rendering to reduce lag
      cesiumViewer.current.scene.requestRender();
      
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
    if (!cesiumViewer.current || periodIndex === currentTimePeriodIndex) return;
    
    console.log(`Changing time period to ${PYRAMID_TIME_PERIODS[periodIndex].title}`);
    
    // Show transition effect
    setShowEraTransition(true);
    setTransitionData({
      location: LOCATIONS[currentLocation as keyof typeof LOCATIONS].name,
      year: PYRAMID_TIME_PERIODS[periodIndex].year
    });
    
    // Update the selected period for the description panel
    setSelectedPeriod(PYRAMID_TIME_PERIODS[periodIndex]);
    
    // Clear any existing overlays immediately
    if (activeOverlay) {
      try {
        cesiumViewer.current.entities.remove(activeOverlay);
        setActiveOverlay(null);
      } catch (e) {
        console.error("Error removing overlay:", e);
      }
    }
    
    // Update state immediately to avoid lag
    setCurrentTimePeriodIndex(periodIndex);
    
    // Remove all entities including location pins when in Egypt historical view
    cesiumViewer.current.entities.removeAll();
    
    // Only show specific time period visualization for Egypt
    // Don't add location pins for historical periods to avoid confusion
    console.log(`Adding visualization for period: ${PYRAMID_TIME_PERIODS[periodIndex].id}`);
    addTimePeriodVisualization(PYRAMID_TIME_PERIODS[periodIndex].id);
    
    // The transition will automatically fade out and call onTransitionComplete
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
      // Check if this is the modern era - only in this case we show location pins
      const isModernEra = periodId === "modern-era";
      
      // For historical time periods, we only show the historical visualization
      // No location pins to avoid confusion with modern map features
      
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
          // Modern era - add location pins since we're showing the modern map
          if (isModernEra) {
            addLocationPins();
          }
          break;
      }
    } catch (error) {
      console.error("Error adding time period visualization:", error);
    }
  };
  
  // Function to add location pins
  const addLocationPins = () => {
    if (!cesiumViewer.current) return;
    
    // Keep track of pins created for better management
    const locationPinsArray: any[] = [];
    
    Object.values(LOCATIONS).forEach(location => {
      // Create a pin entity with improved visibility options
      const pinEntity = cesiumViewer.current.entities.add({
        id: `location_pin_${location.name.replace(/\s+/g, '_').toLowerCase()}`,
        name: location.name,
        position: window.Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude),
        billboard: {
          image: buildPin(location.emoji),
          verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM,
          scale: 0.8, // Smaller scale for Google Maps style
          heightReference: window.Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY, // Always show on top
          eyeOffset: new window.Cesium.Cartesian3(0, 0, -10) // Slight offset toward camera
        },
        label: {
          text: location.name,
          font: '12pt sans-serif', // Smaller font
          style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: window.Cesium.VerticalOrigin.TOP,
          pixelOffset: new window.Cesium.Cartesian2(0, -8), // Adjusted for smaller icon
          showBackground: true,
          backgroundColor: new window.Cesium.Color(0.1, 0.1, 0.1, 0.7),
          backgroundPadding: new window.Cesium.Cartesian2(7, 5),
          horizontalOrigin: window.Cesium.HorizontalOrigin.CENTER,
          distanceDisplayCondition: new window.Cesium.DistanceDisplayCondition(0, 6000000), // Show from far away
          translucencyByDistance: new window.Cesium.NearFarScalar(1.5e6, 1.0, 6.0e6, 0.5) // Fade with distance
        }
      });
      
      locationPinsArray.push(pinEntity);
    });
    
    return locationPinsArray;
  };

  const flyToNewYork = () => {
    const location = LOCATIONS.newYork;
    
    console.log("Starting transition to New York");
    
    // First update the state
    setCurrentLocation("newYork");
    setShowTimeSlider(false);
    
    // Then fly to location
    flyToLocation(location.longitude, location.latitude, location.height, location.name);
    
    // Clear any existing entities and prepare global events after a short delay
    setTimeout(() => {
      if (cesiumViewer.current) {
        console.log("Preparing New York view");
        
        // Preserve location pins while removing other entities
        const entities = cesiumViewer.current.entities.values;
        for (let i = entities.length - 1; i >= 0; i--) {
          const entity = entities[i];
          // Remove entities that are not location pins
          if (!entity.id || !entity.id.startsWith('location_pin_')) {
            cesiumViewer.current.entities.remove(entity);
          }
        }
        
        // Add filtered events for the current global period
        handleEventsFiltered(HISTORICAL_EVENTS.filter(
          event => event.locationId === 'newYork' && 
          (event.period === currentGlobalPeriod || currentGlobalPeriod === 'all')
        ));
      }
    }, 800);
  };
  
  const flyToEgypt = () => {
    const location = LOCATIONS.egypt;
    
    console.log("Starting transition to Egypt");
    
    // First update the current location state to trigger UI updates
    setCurrentLocation("egypt");
    
    // Show the animation immediately
    const screenPosition = window.Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      cesiumViewer.current.scene,
      window.Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude)
    );
    
    if (screenPosition) {
      setPyramidAnimationPosition({
        x: screenPosition.x - 150,
        y: screenPosition.y - 150
      });
      setShowPyramidAnimation(true);
    }
    
    // Set minimum allowed zoom height for Egypt
    const MIN_EGYPT_HEIGHT = 2000;
    
    // Update camera change handler to keep animation positioned correctly
    // and enforce zoom limits
    const cameraChangeHandler = () => {
      // First update animation position
      const updatedScreenPosition = window.Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        cesiumViewer.current.scene,
        window.Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude)
      );
      
      if (updatedScreenPosition) {
        setPyramidAnimationPosition({
          x: updatedScreenPosition.x - 150,
          y: updatedScreenPosition.y - 150
        });
      }

      // Then enforce minimum height restriction
      const cameraPosition = cesiumViewer.current.camera.position;
      const cameraCartographic = window.Cesium.Cartographic.fromCartesian(cameraPosition);
      const currentHeight = cameraCartographic.height;
      
      // If camera is too close, force it back to minimum height
      if (currentHeight < MIN_EGYPT_HEIGHT) {
        console.log(`Enforcing minimum height: ${currentHeight} -> ${MIN_EGYPT_HEIGHT}`);
        const surfacePoint = window.Cesium.Cartesian3.fromRadians(
          cameraCartographic.longitude,
          cameraCartographic.latitude,
          0
        );
        const direction = window.Cesium.Cartesian3.normalize(
          window.Cesium.Cartesian3.subtract(
            cameraPosition, 
            surfacePoint, 
            new window.Cesium.Cartesian3()
          ),
          new window.Cesium.Cartesian3()
        );
        
        // Calculate new position at minimum height
        const newPosition = window.Cesium.Cartesian3.add(
          surfacePoint,
          window.Cesium.Cartesian3.multiplyByScalar(
            direction,
            MIN_EGYPT_HEIGHT,
            new window.Cesium.Cartesian3()
          ),
          new window.Cesium.Cartesian3()
        );
        
        // Set camera to new position while preserving direction
        cesiumViewer.current.camera.position = newPosition;
      }
    };

    // Add the camera change listener
    cesiumViewer.current.scene.camera.changed.addEventListener(cameraChangeHandler);
    
    // Then fly to the location
    flyToLocation(location.longitude, location.latitude, location.height, location.name);

    // Set the default time period to modern era (index 4) with proper timing
    setTimeout(() => {
      console.log("Setting up Egypt time periods");
      setCurrentTimePeriodIndex(4);
      setSelectedPeriod(PYRAMID_TIME_PERIODS[4]);
      
      if (cesiumViewer.current) {
        cesiumViewer.current.entities.removeAll();
        
        if (PYRAMID_TIME_PERIODS[4].id === "modern-era") {
          addLocationPins();
        }
        
        addTimePeriodVisualization("modern-era");
      }
      
      setTimeout(() => {
        setTransitionData({
          location: location.name,
          year: PYRAMID_TIME_PERIODS[4].year
        });
        setShowEraTransition(true);
      }, 300);
    }, 800);
  };

  // Function to handle global time period change
  const handleGlobalTimePeriodChange = (period: TimePeriod) => {
    // Update the current global period using the period id
    if (period.id) {
      setCurrentGlobalPeriod(period.id);
    } else {
      // Fallback to finding by start/end dates
      const periodId = GLOBAL_TIME_PERIODS.findIndex(p => 
        p.start === period.start && p.end === period.end);
      
      if (periodId >= 0) {
        setCurrentGlobalPeriod(String(periodId));
      }
    }
    
    console.log(`Switched to period: ${period.label}, ${period.start} - ${period.end}`);
  };

  // Function to handle filtering events by time period
  const handleEventsFiltered = (filteredEvents: HistoricalEvent[]) => {
    // Only update if the events have actually changed
    if (JSON.stringify(filteredEvents) === JSON.stringify(visibleEvents)) {
      return;
    }

    setVisibleEvents(filteredEvents);
    
    // Update the map with visible events
    if (cesiumViewer.current) {
      // Store references to all current entities
      const entities = cesiumViewer.current.entities.values;
      
      // First, remove only event markers (not location pins)
      for (let i = entities.length - 1; i >= 0; i--) {
        const entity = entities[i];
        // If entity ID doesn't start with "location_pin_", it's an event marker or other entity
        if (!entity.id || !entity.id.startsWith('location_pin_')) {
          cesiumViewer.current.entities.remove(entity);
        }
      }
      
      // Check if we need to add location pins (none exist)
      const hasPins = entities.some(e => e.id && e.id.startsWith('location_pin_'));
      if (!hasPins && !currentLocation) {
        addLocationPins();
      }
      
      // Then add any filtered event markers
      if (filteredEvents.length > 0) {
        filteredEvents.forEach(event => {
          if (event.latitude && event.longitude) {
            addEventMarker(event);
          }
        });
      }
      
      // Force a render to refresh the scene
      cesiumViewer.current.scene.requestRender();
    }
  };

  // New function to handle era selection on landing page
  const handleEraSelection = (eraId: string) => {
    setSelectedEra(eraId);
    
    // After a brief delay, update system status to ready
    setTimeout(() => {
      setIsSystemReady(true);
      
      // Fade out the hourglass sand timer after 2 seconds - using opacity for smooth transition
      setTimeout(() => {
        const sandTimer = document.querySelector('.loading-sand-timer');
        if (sandTimer) {
          sandTimer.classList.add('fade-out');
          
          // Wait for the fade out animation to complete before removing the active class
          setTimeout(() => {
            sandTimer.classList.remove('active');
            sandTimer.classList.remove('fade-out');
          }, 800);
        }
        
        // After another delay, update portal status to stabilized
        setTimeout(() => {
          setIsPortalStabilized(true);
        }, 600);
      }, 2000);
    }, 1000);
  };

  // Modified handle start journey function to check if system is ready
  const handleStartJourney = () => {
    // Only allow journey to start if system is ready
    if (!isSystemReady) return;
    
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
        {/* <div className="wave-loader">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div> */}
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

  // Function to handle showing the description panel
  const handleInfoClick = (period: typeof PYRAMID_TIME_PERIODS[0]) => {
    console.log("Showing description for:", period.title);
    
    // Toggle the description panel visibility if it's the same period
    if (showDescriptionPanel && selectedPeriod && selectedPeriod.id === period.id) {
      setShowDescriptionPanel(false);
    } else {
      // Show the panel with the selected period
      setSelectedPeriod(period);
      setShowDescriptionPanel(true);
    }
  };

  // Function to close the description panel
  const handleCloseDescription = () => {
    console.log("Closing description panel"); // Add logging
    setShowDescriptionPanel(false);
  };

  // Modify the handleLocationSelect function to prevent rapid multiple clicks
  const handleLocationSelect = (locationId: string) => {
    // Prevent action if already transitioning to a location
    if (isLocationTransitioning) {
      console.log("Location transition already in progress, ignoring click");
      return;
    }
    
    // Set transitioning state to prevent multiple clicks
    setIsLocationTransitioning(true);
    
    // If clicking the same location that's already selected, ensure the timeline is shown
    if (locationId === currentLocation) {
      console.log(`Already at location ${locationId}, ensuring timeline is shown`);
      
      if (locationId === 'egypt' && !showEraTransition) {
        // Force refresh the Egypt timeline
        setCurrentTimePeriodIndex(4); // Reset to modern era
        setSelectedPeriod(PYRAMID_TIME_PERIODS[4]);
        
        if (cesiumViewer.current) {
          // Preserve location pins while removing other entities
          const entities = cesiumViewer.current.entities.values;
          for (let i = entities.length - 1; i >= 0; i--) {
            const entity = entities[i];
            // Remove entities that are not location pins
            if (!entity.id || !entity.id.startsWith('location_pin_')) {
              cesiumViewer.current.entities.remove(entity);
            }
          }
          
          // Then ensure pins are visible
          const hasPins = cesiumViewer.current.entities.values.some(e => e.id && e.id.startsWith('location_pin_'));
          if (!hasPins) {
            addLocationPins();
          }
          
          // Add modern era visualization
          addTimePeriodVisualization("modern-era");
        }
        
        // Show the transition effect to make it clear something happened
        setTransitionData({
          location: LOCATIONS.egypt.name,
          year: PYRAMID_TIME_PERIODS[4].year
        });
        setShowEraTransition(true);
      }
      
      // Clear transition state after a short delay
      setTimeout(() => setIsLocationTransitioning(false), 300);
      return;
    }
    
    // Handle new location selection
    if (locationId === 'newYork') {
      flyToNewYork();
    } else if (locationId === 'egypt') {
      flyToEgypt();
    }
    
    // Clear transition state after location change animation completes
    setTimeout(() => setIsLocationTransitioning(false), 2000);
  };

  // Helper to get selected event
  const getSelectedEvent = () => {
    return HISTORICAL_EVENTS.find(event => event.id === selectedEventId) || null;
  };
  
  // Function to create event marker image
  const createEventMarkerImage = (id: string, emoji: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 36;  // Slightly smaller than location pins
    canvas.height = 36;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';
    
    // Create Google Maps style pin but in red for events
    ctx.beginPath();
    ctx.arc(18, 12, 9, 0, Math.PI * 2, true); // Circle for top part
    ctx.moveTo(18, 12);
    ctx.lineTo(24, 24); // Right side of pointer
    ctx.lineTo(18, 32); // Tip of pointer
    ctx.lineTo(12, 24); // Left side of pointer
    ctx.lineTo(18, 12); // Back to start
    ctx.closePath();
    
    // Fill with red gradient for events
    const gradient = ctx.createLinearGradient(0, 0, 0, 32);
    gradient.addColorStop(0, 'rgba(234, 67, 53, 0.95)'); // Google Maps red
    gradient.addColorStop(1, 'rgba(190, 25, 25, 0.98)');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add subtle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Add subtle shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    
    // Reset shadow for emoji
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw emoji
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText(emoji, 18, 12);
    
    // Convert to data URL
    return canvas.toDataURL();
  };

  // Function to add event marker to the map
  const addEventMarker = (event: HistoricalEvent) => {
    if (!event.latitude || !event.longitude || !cesiumViewer.current) return;
    
    const name = event.name || event.title;
    const description = event.description || '';
    const emoji = event.emoji || '📍';
    
    // Add a small offset to event markers to prevent overlap with location pins
    // Adjust the latitude slightly to separate event markers from location pins
    const offsetLatitude = event.latitude + 0.02; // Smaller offset for smaller pins
    
    // Create an improved billboard image
    const markerImage = createEventMarkerImage(event.id, emoji);
    
    cesiumViewer.current.entities.add({
      id: `event_${event.id}`, // Add event_ prefix to ID to make it easier to filter
      name: name,
      position: window.Cesium.Cartesian3.fromDegrees(event.longitude, offsetLatitude, 100), // Lower altitude
      billboard: {
        image: markerImage,
        scale: 0.8,
        horizontalOrigin: window.Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM,
        heightReference: window.Cesium.HeightReference.RELATIVE_TO_GROUND,
        disableDepthTestDistance: 50000 // Less priority than location pins but still visible
      },
      label: {
        text: name,
        font: '11pt sans-serif', // Smaller than location pins
        style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: window.Cesium.VerticalOrigin.TOP,
        pixelOffset: new window.Cesium.Cartesian2(0, -6), // Adjusted for smaller icon
        showBackground: true,
        backgroundColor: new window.Cesium.Color(0.3, 0.1, 0.1, 0.7), // Reddish background
        backgroundPadding: new window.Cesium.Cartesian2(6, 4),
        horizontalOrigin: window.Cesium.HorizontalOrigin.CENTER,
        distanceDisplayCondition: new window.Cesium.DistanceDisplayCondition(0, 3000000),
        translucencyByDistance: new window.Cesium.NearFarScalar(1.5e6, 1.0, 5.0e6, 0)
      },
      // Make the marker clickable
      description: description,
      properties: {
        id: event.id,
        title: name,
        type: 'event'
      }
    });
  };
  
  // Function to handle click on an event marker
  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowEventDetail(true);
  };

  // Function to close event detail modal
  const handleCloseEventDetail = () => {
    setShowEventDetail(false);
  };

  // Update the camera change listener to properly handle zoom levels
  useEffect(() => {
    if (!cesiumViewer.current || !cesiumLoaded) return;
    
    const handleCameraChange = () => {
      // Check if camera is at or close to the default home position
      const cameraPosition = cesiumViewer.current.camera.position;
      const cameraHeight = window.Cesium.Cartographic.fromCartesian(cameraPosition).height;
      
      // If we're zoomed out significantly or too close, hide the animation
      if (cameraHeight > 10000000 || cameraHeight < 1000) {
        setShowPyramidAnimation(false);
      }
    };

    // Add the camera changed event listener
    const cameraChangedEventRemove = cesiumViewer.current.camera.changed.addEventListener(handleCameraChange);
    
    // Add an event listener specifically for the home button
    const homeButton = document.querySelector('.cesium-button-home');
    
    const handleHomeButtonClick = () => {
      // When home button is clicked, reset all location-specific state
      setCurrentLocation(null);
      setShowPyramidAnimation(false);
      setShowDescriptionPanel(false);
      setSelectedPeriod(null);
      
      if (cesiumViewer.current) {
        cesiumViewer.current.entities.removeAll();
        addLocationPins();
        
        // Reset to filtered events for global view
        const filteredEvents = HISTORICAL_EVENTS.filter(
          event => event.period === currentGlobalPeriod || currentGlobalPeriod === 'all'
        );
        handleEventsFiltered(filteredEvents);
      }
    };
    
    if (homeButton) {
      homeButton.addEventListener('click', handleHomeButtonClick);
    }
    
    return () => {
      cameraChangedEventRemove();
      if (homeButton) {
        homeButton.removeEventListener('click', handleHomeButtonClick);
      }
    };
  }, [cesiumViewer.current, cesiumLoaded, currentLocation, currentGlobalPeriod]);

  // Add cleanup when leaving Egypt view or unmounting
  useEffect(() => {
    if (currentLocation !== 'egypt') {
      setShowPyramidAnimation(false);
    }
    
    return () => {
      setShowPyramidAnimation(false);
    };
  }, [currentLocation]);

  // Fix the events filtering effect
  useEffect(() => {
    if (!cesiumLoaded || showLandingPage || currentLocation) return;
    
    const filteredEvents = HISTORICAL_EVENTS.filter(
      event => event.period === currentGlobalPeriod || currentGlobalPeriod === 'all'
    );
    handleEventsFiltered(filteredEvents);
  }, [cesiumLoaded, showLandingPage, currentLocation, currentGlobalPeriod]);

  // Add a useEffect to monitor the era transition
  useEffect(() => {
    if (showEraTransition) {
      console.log("Era transition activated");
      
      // Safety fallback - ensure era transition is reset if something goes wrong
      const safetyTimeout = setTimeout(() => {
        if (showEraTransition) {
          console.log("WARNING: Era transition did not complete normally, forcing reset");
          setShowEraTransition(false);
        }
      }, 5000); // 5 second safety timeout
      
      return () => clearTimeout(safetyTimeout);
    }
  }, [showEraTransition]);

  // Add a useEffect to reset the location transitioning state after navigation completes
  useEffect(() => {
    if (currentLocation && isLocationTransitioning) {
      // After the location has loaded and transitions have started, 
      // we can safely reset the transitioning flag after a delay
      const resetTimer = setTimeout(() => {
        console.log(`Location ${currentLocation} fully loaded, resetting transition state`);
        setIsLocationTransitioning(false);
      }, 3000); // Give enough time for all animations to complete
      
      return () => clearTimeout(resetTimer);
    }
  }, [currentLocation, isLocationTransitioning]);

  // Add useEffect to ensure location pins are displayed when no events are visible
  useEffect(() => {
    // Only apply this when not in a specific location view and when viewer is ready
    if (!currentLocation && cesiumViewer.current && cesiumLoaded) {
      // Check if there are already pins visible
      const locationEntities = cesiumViewer.current.entities.values.filter(
        entity => entity.name && Object.values(LOCATIONS).some(loc => loc.name === entity.name)
      );
      
      // If no location pins are visible, add them
      if (locationEntities.length === 0) {
        console.log("Location pins not found, adding pins");
        addLocationPins();
      }
    }
  }, [visibleEvents, currentLocation, cesiumLoaded]);

  // Add useEffect to set up entity click handling
  useEffect(() => {
    if (!cesiumViewer.current || !cesiumLoaded) return;
    
    // Set up click handler for both location pins and event markers
    const handler = new window.Cesium.ScreenSpaceEventHandler(cesiumViewer.current.scene.canvas);
    
    handler.setInputAction((click: any) => {
      const pickedObject = cesiumViewer.current.scene.pick(click.position);
      
      if (window.Cesium.defined(pickedObject) && pickedObject.id) {
        const entity = pickedObject.id;
        
        // Check if we clicked on a location pin
        const clickedLocation = Object.values(LOCATIONS).find(loc => loc.name === entity.name);
        if (clickedLocation) {
          console.log(`Clicked on location: ${clickedLocation.name}`);
          handleLocationSelect(clickedLocation.id);
          return;
        }
        
        // Check if we clicked on an event marker
        if (entity.id && entity.properties && entity.properties.type === 'event') {
          console.log(`Clicked on event: ${entity.name}`);
          handleEventClick(entity.id);
          return;
        }
      }
    }, window.Cesium.ScreenSpaceEventType.LEFT_CLICK);
    
    // Return cleanup function
    return () => {
      handler.destroy();
    };
  }, [cesiumViewer.current, cesiumLoaded]);

  if (showLandingPage) {
    return (
      <>
        {renderPreloader()}
        {renderPortalEffect()}
        {renderTransitionOverlay()}
        <div className={`landing-page ${transitioning ? 'fade-out' : ''}`}>
          <div className="floating-elements">
            <div className="floating-element f1"></div>
            <div className="floating-element f2"></div>
            <div className="floating-element f3"></div>
            <div className="floating-element f4"></div>
            <div className="floating-element f5"></div>
          </div>
          <div className="landing-content">
            <h1>Temporal Voyage Explorer</h1>
            <p className="landing-subtitle">Select an era to begin your journey through space and time</p>
            
            {/* Era selection buttons */}
            <div className="era-selection">
              {availableEras.map(era => (
                <button 
                  key={era.id}
                  className={`era-button ${selectedEra === era.id ? 'selected' : ''}`}
                  onClick={() => handleEraSelection(era.id)}
                  disabled={transitioning}
                >
                  {era.name}
                </button>
              ))}
            </div>
            
            {/* Show loading sand timer when era is selected */}
            <div className={`loading-sand-timer ${selectedEra ? 'active' : ''}`}>
              <div className="hourglass">⏳</div>
            </div>
            
            <div className="time-indicators">
              <div className="time-indicator">
                <span className="time-label">Era</span>
                <span className="time-value">
                  {selectedEra ? availableEras.find(era => era.id === selectedEra)?.name : "Not Selected"}
                </span>
              </div>
              <div className="time-indicator">
                <span className="time-label">Destinations</span>
                <span className="time-value">2 Available</span>
              </div>
              <div className="time-indicator">
                <span className="time-label">System</span>
                <span className={`time-value ${isSystemReady ? 'ready' : 'not-ready'}`}>
                  {isSystemReady ? "Ready" : "Not Ready"}
                </span>
              </div>
            </div>
            
            <div className={`status-container ${isPortalStabilized ? 'stabilized' : ''}`}>
              <div className="status-ring"></div>
              <div className="status-message">
                {isPortalStabilized ? "Time Portal Stabilized" : "Stabilizing Time Portal..."}
              </div>
            </div>
            
            <button 
              className={`journey-button ${isSystemReady ? 'ready' : 'disabled'}`}
              onClick={handleStartJourney}
              disabled={transitioning || !isSystemReady}
            >
              <span className="button-text">
                {isSystemReady ? "Initialize Time Portal" : "Awaiting Era Selection"}
              </span>
              <span className="button-icon">→</span>
            </button>
            
            <div className="version-info">v1.0.2 • Time Navigation System</div>
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
        {/* Remove the button container and replace with LocationsPanel */}
        {error ? (
          <div className="error-message">
            Error: {error}
          </div>
        ) : (
          <LocationsPanel 
            locations={LOCATION_LIST}
            onSelectLocation={handleLocationSelect}
            currentLocationId={currentLocation || undefined}
          />
        )}
        
        <div 
          ref={viewerRef} 
          className="cesium-container"
          style={{ 
            width: "100%", 
            height: "100vh", 
            position: "relative",
          }} 
        />
        
        {showVisualEffect && (
          <div className="time-travel-effect"></div>
        )}
        
        {/* Global time slider for filtering events by time period - only show when not viewing a specific location timeline */}
        {cesiumLoaded && !showLandingPage && !currentLocation && (
          <GlobalTimeSlider 
            timePeriods={GLOBAL_TIME_PERIODS}
            historicalEvents={HISTORICAL_EVENTS}
            onEventsFiltered={handleEventsFiltered}
            onTimePeriodChange={handleGlobalTimePeriodChange}
          />
        )}
        
        {/* Only show the Egypt-specific UI components when in Egypt */}
        {currentLocation === "egypt" && !showLandingPage && (
          <>
            {/* Mini Timeline */}
            <MiniTimeline 
              periods={PYRAMID_TIME_PERIODS}
              currentPeriodIndex={currentTimePeriodIndex}
              onPeriodChange={handleTimePeriodChange}
              onInfoClick={handleInfoClick}
            />
            
            {/* Time Dial */}
            <TimeDial 
              periods={PYRAMID_TIME_PERIODS}
              currentPeriodIndex={currentTimePeriodIndex}
              onPeriodChange={handleTimePeriodChange}
            />
            
            {/* Era Transition Effect */}
            <EraTransition
              isVisible={showEraTransition}
              location={transitionData.location}
              year={transitionData.year}
              onTransitionComplete={() => {
                console.log("App received transition complete callback");
                // Check if we need to refresh the view after transition
                if (cesiumViewer.current && currentLocation === "egypt") {
                  // After transition, make sure we have proper pins visibility:
                  // - Show pins only for modern era (index 4)
                  // - Hide pins for historical eras (indexes 0-3)
                  const isModernEra = currentTimePeriodIndex === 4;
                  
                  // Force a render to refresh the scene
                  cesiumViewer.current.scene.requestRender();
                }
                
                // Introduce a small delay to ensure state updates properly
                setTimeout(() => {
                  setShowEraTransition(false);
                  console.log("Era transition state reset");
                }, 50);
              }}
            />
            
            {/* Description Panel */}
            <DescriptionPanel 
              isVisible={showDescriptionPanel}
              period={selectedPeriod}
              onClose={handleCloseDescription}
            />
          </>
        )}
        
        {/* Event Detail Modal */}
        {getSelectedEvent() && (
          <EventDetailModal
            isOpen={showEventDetail}
            onClose={handleCloseEventDetail}
            name={getSelectedEvent()!.name}
            year={getSelectedEvent()!.year}
            emoji={getSelectedEvent()!.emoji}
            description={getSelectedEvent()!.description}
          />
        )}
        
        {/* Add the PyramidAnimation component */}
        <PyramidAnimation
          isVisible={showPyramidAnimation}
          position={pyramidAnimationPosition}
        />
      </div>
    </>
  );
}

export default App;