import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import './styles/cesium.css';
import './styles/date-picker.css';
import './styles/DateWheelPicker.css';
import { MiniTimeline, TimeDial, EraTransition, DescriptionPanel } from './components/time-ui';
import { LocationsPanel } from './components/LocationsPanel';
import { GlobalTimeSlider } from './components/GlobalTimeSlider';
import { HistoricalEventMarker } from './components/HistoricalEventMarker';
import { EventDetailModal } from './components/EventDetailModal';
import { PyramidAnimation } from './components/PyramidAnimation';
import { DateWheelPicker } from './components/DateWheelPicker';
import { GLOBAL_TIME_PERIODS, HISTORICAL_EVENTS } from './constants/historyData';
import { LocationPin } from './components/LocationPin';

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
    height: 1000000, // Reduced height for better visibility 
    emoji: "🗽",
    category: 'modern'
  },
  egypt: {
    id: 'egypt',
    name: "Pyramids of Giza",
    longitude: 31.1342,
    latitude: 29.9792,
    height: 1000000, // Lower height to get closer to the pyramids
    emoji: "🏛️",
    category: 'ancient'
  }
};

// Define country data for labels
const COUNTRY_DATA = [
  { name: "United States", position: [-98.5795, 39.8283] },
  { name: "Canada", position: [-106.3468, 56.1304] },
  { name: "Russia", position: [105.3188, 61.5240] },
  { name: "China", position: [104.1954, 35.8617] },
  { name: "Brazil", position: [-51.9253, -14.2350] },
  { name: "India", position: [78.9629, 20.5937] },
  { name: "Australia", position: [133.7751, -25.2744] },
  { name: "France", position: [2.2137, 46.2276] },
  { name: "Germany", position: [10.4515, 51.1657] },
  { name: "Egypt", position: [30.8025, 26.8206] },
  { name: "South Africa", position: [22.9375, -30.5595] },
  { name: "Japan", position: [138.2529, 36.2048] },
  { name: "United Kingdom", position: [-3.4359, 55.3781] },
  { name: "Mexico", position: [-102.5528, 23.6345] },
  { name: "Italy", position: [12.5674, 41.8719] }
];

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
  const [currentGlobalYear, setCurrentGlobalYear] = useState<number>(-2023);
  const [currentZoomLevel, setCurrentZoomLevel] = useState<number>(30000000);
  const [showLocationPin, setShowLocationPin] = useState<boolean>(true);
  
  // New state variables for the landing page experience
  const [selectedEra, setSelectedEra] = useState<string | null>('modern');
  const [isSystemReady, setIsSystemReady] = useState(true);
  const [isPortalStabilized, setIsPortalStabilized] = useState(true);
  const [availableEras] = useState([
    { id: 'ancient', name: 'Ancient World' },
    { id: 'medieval', name: 'Medieval Era' },
    { id: 'renaissance', name: 'Renaissance' },
    { id: 'industrial', name: 'Industrial Age' },
    { id: 'modern', name: '21st Century' }
  ]);
  
  // New state variables for year and month selection
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // 1-12
  const [selectedDay, setSelectedDay] = useState<number>(1); // Add day state
  
  // Available years based on selected era
  const getAvailableYears = () => {
    switch (selectedEra) {
      case 'ancient':
        return { min: -3000, max: -500 }; // 3000 BCE to 500 BCE
      case 'medieval':
        return { min: 500, max: 1400 }; // 500 CE to 1400 CE
      case 'renaissance':
        return { min: 1400, max: 1700 }; // 1400 CE to 1700 CE
      case 'industrial':
        return { min: 1700, max: 1950 }; // 1700 CE to 1950 CE
      case 'modern':
        return { min: 1950, max: currentYear }; // 1950 CE to current year
      default:
        return { min: -3000, max: currentYear }; // Default full range
    }
  };

  // Add a loading state for location transitions
  const [isLocationTransitioning, setIsLocationTransitioning] = useState(false);

  // State for the pyramid animation (only visibility, position is handled in the component)
  const [showPyramidAnimation, setShowPyramidAnimation] = useState(false);

  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const cesiumToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN;
  
  // Create a reference to Cesium so we can use it throughout the component
  const Cesium = window.Cesium;

  // Track active event listeners for cleanup
  const activeListenersRef = useRef<(() => void)[]>([]);

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (showLandingPage) return; // Don't initialize Cesium on the landing page

    // Initialize Cesium viewer
    if (!cesiumViewer.current && viewerRef.current) {
      window.Cesium.Ion.defaultAccessToken = cesiumToken;

      try {
        cesiumViewer.current = new window.Cesium.Viewer(viewerRef.current, {
          terrainProvider: window.Cesium.createWorldTerrain(),
          baseLayerPicker: false,
          timeline: false,
          animation: false,
          homeButton: true,
          fullscreenButton: false,
          navigationHelpButton: false,
          sceneModePicker: false,
          geocoder: false,
          baseLayer: window.Cesium.ImageryLayer.fromProviderAsync(
            window.Cesium.ArcGisMapServerImageryProvider.fromUrl(
              'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
              {
                enablePickFeatures: false
              }
            )
          )
        });

        // Save the viewer reference in the window object for the animation overlay
        (window as any)._pyramidCesiumViewer = cesiumViewer.current;
        
        // Remove default base layer
        cesiumViewer.current.scene.globe.enableLighting = true;
        
        // Load GeoJSON data and style it
        window.Cesium.GeoJsonDataSource.load('/data/countries.geo.json', {
          stroke: window.Cesium.Color.fromCssColorString('#60efff'),
          fill: window.Cesium.Color.fromCssColorString('rgba(96, 239, 255, 0.05)'),
          strokeWidth: 3,
          markerSymbol: '' // Prevent default markers
        }).then((dataSource) => {
          cesiumViewer.current.dataSources.add(dataSource);
          
          // Style each entity in the dataSource to ensure borders are visible
          const entities = dataSource.entities.values;
          for (const entity of entities) {
            if (entity.polygon) {
              // Set polygon material and outline
              entity.polygon.material = window.Cesium.Color.fromCssColorString('rgba(96, 239, 255, 0.05)');
              entity.polygon.outline = true;
              entity.polygon.outlineColor = window.Cesium.Color.fromCssColorString('#60efff');
              entity.polygon.outlineWidth = 2;
              
              // Make sure borders are always visible regardless of zoom
              entity.polygon.distanceDisplayCondition = undefined;
            }
          }
          
          // Add labels for each country
          const addedCountries = new Set(); // Track countries we've already labeled
          
          for (const entity of entities) {
            if (!entity.polygon || !entity.properties) continue;
            
            const countryName = entity.properties.ADMIN?.getValue() || entity.properties.NAME?.getValue() || entity.name;
            
            // Skip if we've already labeled this country
            if (addedCountries.has(countryName)) continue;
            addedCountries.add(countryName);
            
            // Get the center of the polygon
            const positions = entity.polygon.hierarchy.getValue(window.Cesium.JulianDate.now()).positions;
            const center = window.Cesium.BoundingSphere.fromPoints(positions).center;
            
            entity.position = center;
            entity.label = new window.Cesium.LabelGraphics({
              text: countryName,
              font: '18px Helvetica, Arial, sans-serif',
              fillColor: window.Cesium.Color.fromCssColorString('#60efff'),
              outlineColor: window.Cesium.Color.BLACK,
              outlineWidth: 3,
              style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
              horizontalOrigin: window.Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: window.Cesium.VerticalOrigin.CENTER,
              pixelOffset: new window.Cesium.Cartesian2(0, 0),
              translucencyByDistance: new window.Cesium.NearFarScalar(1000000, 1.0, 20000000, 0.4),
              scaleByDistance: new window.Cesium.NearFarScalar(1000000, 1.2, 20000000, 0.8),
              distanceDisplayCondition: new window.Cesium.DistanceDisplayCondition(10000, 20000000)
            });
          }
          
          // Remove ArcGIS labels but keep the imagery
          const layers = cesiumViewer.current.imageryLayers;
          layers.removeAll();
          
          // Add base satellite imagery without labels
          const imageryProvider = new window.Cesium.ArcGisMapServerImageryProvider({
            url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
            enablePickFeatures: false
          });
          
          layers.addImageryProvider(imageryProvider);
          
          // Zoom to show all countries
          cesiumViewer.current.zoomTo(dataSource);
        });

        // Basic terrain setup
        if (window.Cesium.createWorldTerrain) {
          const terrainProvider = window.Cesium.createWorldTerrain({
            requestWaterMask: true,
            requestVertexNormals: true
          });
          cesiumViewer.current.terrainProvider = terrainProvider;
        }
        
        // Improve performance and appearance
        cesiumViewer.current.scene.fog.enabled = true;
        cesiumViewer.current.scene.fog.density = 0.0002;
        cesiumViewer.current.scene.fog.screenSpaceErrorFactor = 2.0;
        
        // Enable atmosphere for better visual appearance
        cesiumViewer.current.scene.globe.showGroundAtmosphere = true;
        cesiumViewer.current.scene.globe.enableLighting = true;
        
        // Add sky atmosphere for a more realistic look
        cesiumViewer.current.scene.skyAtmosphere.show = true;
        cesiumViewer.current.scene.skyAtmosphere.hueShift = 0.0;
        cesiumViewer.current.scene.skyAtmosphere.saturationShift = 0.1;
        cesiumViewer.current.scene.skyAtmosphere.brightnessShift = 0.1;
        
        cesiumViewer.current.scene.globe.maximumScreenSpaceError = 2;
        
        // Add camera constraints - set maximum zoom distance to prevent zooming out too far
        cesiumViewer.current.scene.screenSpaceCameraController.maximumZoomDistance = 50000000; // Limit max zoom out
        cesiumViewer.current.scene.screenSpaceCameraController.minimumZoomDistance = 1000000; // Limit max zoom in
        
        // Set initial camera view
        cesiumViewer.current.camera.setView({
          destination: window.Cesium.Cartesian3.fromDegrees(0, 20, 20000000)
        });

        // Remove old country data array since we're using GeoJSON now
        // COUNTRY_DATA array can be removed as it's no longer needed
        
        setCesiumLoaded(true);
      } catch (err: any) {
        setError(err.message);
        console.error("Error initializing Cesium:", err);
      }
    }

    return () => {
      if (cesiumViewer.current) {
        cesiumViewer.current.destroy();
        cesiumViewer.current = null;
        // Remove the reference from the window object
        if ((window as any)._pyramidCesiumViewer) {
          (window as any)._pyramidCesiumViewer = null;
        }
      }
    };
  }, [showLandingPage, cesiumToken]);

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
    
    const newPeriod = PYRAMID_TIME_PERIODS[periodIndex];
    console.log(`Changing time period to ${newPeriod.title} (${newPeriod.id})`);
    
    // Show transition effect
    setShowEraTransition(true);
    setTransitionData({
      location: LOCATIONS[currentLocation as keyof typeof LOCATIONS].name,
      year: newPeriod.year
    });
    
    // Update the selected period for the description panel
    setSelectedPeriod(newPeriod);
    
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
    
    // Store existing location pins before clearing
    const locationPins = cesiumViewer.current.entities.values.filter(
      (entity: any) => entity.id && entity.id.toString().startsWith('location_pin_')
    );
    
    // Instead of removing all entities, we need to preserve the country borders
    // and only remove the entities added directly to the viewer's collection
    const entities = cesiumViewer.current.entities.values;
    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i];
      // Only remove entities that are directly in the viewer's entity collection
      if (entity && cesiumViewer.current.entities.contains(entity)) {
        cesiumViewer.current.entities.remove(entity);
      }
    }
    
    // Add time period visualization
    console.log(`Adding visualization for period: ${newPeriod.id}`);
    addTimePeriodVisualization(newPeriod.id);
    
    // Refresh location pins to ensure correct label visibility with animation
    if (showPyramidAnimation) {
      // Small delay to ensure animation state is updated
      setTimeout(() => {
        // First remove any existing location pins
        const entities = cesiumViewer.current.entities.values;
        for (let i = entities.length - 1; i >= 0; i--) {
          const entity = entities[i];
          if (entity && entity.id && entity.id.toString().startsWith('location_pin_')) {
            cesiumViewer.current.entities.remove(entity);
          }
        }
        
        // Add location pins with proper label visibility
        addLocationPins();
      }, 50);
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
  
  // Function to add location pins for interactive locations
  const addLocationPins = () => {
    if (!cesiumViewer.current) return;
    
    console.log("Adding location pins for:", Object.keys(LOCATIONS));
    
    Object.values(LOCATIONS).forEach(location => {
      // Create the pin canvas
      const pinCanvas = buildPin(location.emoji);
      
      // Create billboard entity
      cesiumViewer.current.entities.add({
        id: `location_pin_${location.id}`,
        name: location.name,
        position: window.Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude, 10000),
        billboard: {
          image: pinCanvas.toDataURL(),
          scale: 1.2, // Larger pins for better visibility
          horizontalOrigin: window.Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM,
          heightReference: window.Cesium.HeightReference.CLAMP_TO_GROUND
        },
        label: {
          text: location.name,
          font: '16px Helvetica, Arial, sans-serif',
          fillColor: window.Cesium.Color.fromCssColorString('#60efff'),
          outlineColor: window.Cesium.Color.BLACK,
          outlineWidth: 4,
          style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: window.Cesium.VerticalOrigin.TOP,
          pixelOffset: new window.Cesium.Cartesian2(0, 6),
          showBackground: true,
          backgroundColor: window.Cesium.Color.fromCssColorString('rgba(0, 30, 60, 0.7)'),
          backgroundPadding: new window.Cesium.Cartesian2(8, 4),
          horizontalOrigin: window.Cesium.HorizontalOrigin.CENTER
        }
      });
    });
  };

  // Function to clean up any active listeners
  const cleanupActiveListeners = () => {
    if (activeListenersRef.current.length > 0) {
      console.log(`Cleaning up ${activeListenersRef.current.length} active listeners`);
      activeListenersRef.current.forEach(removeListener => removeListener());
      activeListenersRef.current = [];
    }
  };

  const flyToNewYork = () => {
    const location = LOCATIONS.newYork;
    
    // Clean up any Egypt-specific listeners
    cleanupActiveListeners();
    
    // Update current location state
    setCurrentLocation("newYork");
    
    // Hide pyramid animation
    setShowPyramidAnimation(false);
    
    // First update the state
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
    
    // Immediately show the pyramid animation - critical fix to ensure it's visible
    setShowPyramidAnimation(true);
    setIsPlaying(true);
    
    // Force animation to be visible in case it's not shown
    setTimeout(() => {
      // Double-check that animation is shown
      setShowPyramidAnimation(true);
      setIsPlaying(true);
      
      // Refresh location pins to hide the label
      if (cesiumViewer.current) {
        // First remove any existing location pins
        const entities = cesiumViewer.current.entities.values;
        for (let i = entities.length - 1; i >= 0; i--) {
          const entity = entities[i];
          if (entity && entity.id && entity.id.toString().startsWith('location_pin_')) {
            cesiumViewer.current.entities.remove(entity);
          }
        }
        
        // Then add them back with updated visibility settings
        addLocationPins();
      }
    }, 100);
    
    // Set minimum allowed zoom height for Egypt
    const MIN_EGYPT_HEIGHT = 2000;
    
    // Update camera change handler only for minimum height enforcement
    const cameraChangeHandler = () => {
      // Only enforce minimum height restriction
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
    const removeListener = cesiumViewer.current.scene.camera.changed.addEventListener(cameraChangeHandler);
    
    // Keep track of the listener for cleanup
    activeListenersRef.current.push(removeListener);
    
    // Then fly to the location
    flyToLocation(location.longitude, location.latitude, location.height, location.name);

    // Set the default time period to construction begin (index 0) instead of modern era (index 4)
    setTimeout(() => {
      console.log("Setting up Egypt time periods");
      setCurrentTimePeriodIndex(0);
      setSelectedPeriod(PYRAMID_TIME_PERIODS[0]);
      
      if (cesiumViewer.current) {
        // Instead of removing all entities, we need to preserve the country borders
        // Get all dataSources first
        const dataSources = cesiumViewer.current.dataSources;
        const countryDataSources: any[] = [];
        
        // Store references to country data sources
        for (let i = 0; i < dataSources.length; i++) {
          const dataSource = dataSources.get(i);
          countryDataSources.push(dataSource);
        }
        
        // Remove all entities (but not data sources)
        const entities = cesiumViewer.current.entities.values;
        for (let i = entities.length - 1; i >= 0; i--) {
          const entity = entities[i];
          // Only remove entities that are directly in the viewer's entity collection
          if (entity && cesiumViewer.current.entities.contains(entity)) {
            cesiumViewer.current.entities.remove(entity);
          }
        }
        
        // For modern era, add location pins (but we're starting with construction era)
        if (PYRAMID_TIME_PERIODS[0].id === "modern-era") {
          addLocationPins();
        }
        
        // Start with construction-begin visualization
        addTimePeriodVisualization("construction-begin");
      }
      
      setTimeout(() => {
        setTransitionData({
          location: location.name,
          year: PYRAMID_TIME_PERIODS[0].year
        });
        setShowEraTransition(true);
      }, 300);
    }, 800);
  };

  // Function to handle global time period change
  const handleGlobalTimePeriodChange = (period: TimePeriod) => {
    setCurrentGlobalPeriod(period.id || 'all');
    // Set the middle year of the period as the current global year
    setCurrentGlobalYear(Math.floor((period.start + period.end) / 2));
    
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

  // New function to handle year selection
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    
    // Update system status after selection
    if (selectedEra && selectedMonth) {
      setIsSystemReady(true);
      
      // Similar animation timing as era selection
      setTimeout(() => {
        const sandTimer = document.querySelector('.loading-sand-timer');
        if (sandTimer) {
          sandTimer.classList.add('fade-out');
          setTimeout(() => {
            sandTimer.classList.remove('active');
            sandTimer.classList.remove('fade-out');
          }, 800);
        }
        
        setTimeout(() => {
          setIsPortalStabilized(true);
        }, 600);
      }, 1500);
    }
  };
  
  // New function to handle month selection
  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    
    // Update system status after selection
    if (selectedEra && selectedYear) {
      setIsSystemReady(true);
      
      // Similar animation timing as era selection
      setTimeout(() => {
        const sandTimer = document.querySelector('.loading-sand-timer');
        if (sandTimer) {
          sandTimer.classList.add('fade-out');
          setTimeout(() => {
            sandTimer.classList.remove('active');
            sandTimer.classList.remove('fade-out');
          }, 800);
        }
        
        setTimeout(() => {
          setIsPortalStabilized(true);
        }, 600);
      }, 1500);
    }
  };

  // New function to handle day selection
  const handleDayChange = (day: number) => {
    setSelectedDay(day);
    
    // Update system status after selection
    if (selectedEra && selectedYear && selectedMonth) {
      setIsSystemReady(true);
      
      // Similar animation timing as era selection
      setTimeout(() => {
        const sandTimer = document.querySelector('.loading-sand-timer');
        if (sandTimer) {
          sandTimer.classList.add('fade-out');
          setTimeout(() => {
            sandTimer.classList.remove('active');
            sandTimer.classList.remove('fade-out');
          }, 800);
        }
        
        setTimeout(() => {
          setIsPortalStabilized(true);
        }, 600);
      }, 1500);
    }
  };

  // New function to handle era selection on landing page
  const handleEraSelection = (eraId: string) => {
    setSelectedEra(eraId);
    
    // Set default year based on era
    const yearRange = getAvailableYears();
    const defaultYear = Math.floor((yearRange.min + yearRange.max) / 2);
    setSelectedYear(defaultYear);
    
    // Fade in the hourglass sand timer on era selection
    setTimeout(() => {
      const sandTimer = document.querySelector('.loading-sand-timer');
      if (sandTimer) {
        sandTimer.classList.add('active');
      }
    }, 300);
    
    // Don't automatically set system ready - wait for year and month selection
  };

  // Modified handle start journey function to check if system is ready
  const handleStartJourney = () => {
    // Only allow journey to start if system is ready
    if (!isSystemReady) return;
    
    // Get era name for transition data
    const eraName = availableEras.find(era => era.id === selectedEra)?.name || "";
    // Get month name
    const monthName = new Date(2000, selectedMonth - 1, 1).toLocaleString('default', { month: 'long' });
    // Format year with BCE/CE
    const yearFormatted = selectedYear < 0 ? `${Math.abs(selectedYear)} BCE` : `${selectedYear} CE`;
    
    // Set transition data with date information
    setTransitionData({ 
      location: eraName, 
      year: `${monthName} ${selectedDay}, ${yearFormatted}`
    });
    
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
    const event = HISTORICAL_EVENTS.find(event => event.id === selectedEventId) || null;
    
    if (!event) return null;
    
    // Create a copy of the event so we can modify properties without affecting the original
    const eventCopy = { ...event };
    
    // For the Great Pyramid, determine the appropriate label based on timeline
    if (event.id === 'great-pyramid-construction' && event.constructionPeriod) {
      // During construction period show "Construction of the Pyramids of Giza"
      if (currentGlobalYear >= event.constructionPeriod.start && currentGlobalYear <= event.constructionPeriod.end) {
        eventCopy.name = event.label || 'Construction of the Pyramids of Giza';
      } else if (currentGlobalYear > event.constructionPeriod.end) {
        // After construction completed, show "Pyramids of Giza"
        eventCopy.name = 'Pyramids of Giza';
      }
    }
    
    return eventCopy;
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
    
    // Determine the appropriate label for the Pyramids of Giza based on timeline
    let displayLabel = name;
    
    // For the Great Pyramid, use special label handling
    if (event.id === 'great-pyramid-construction') {
      // If we're in the construction period or have a specific label in the event, use it
      if (event.constructionPeriod) {
        // Get the current year from the slider or the global state
        const currentYear = currentGlobalYear || event.year;
        
        // During construction period show "Construction of the Pyramids of Giza"
        if (currentYear >= event.constructionPeriod.start && currentYear <= event.constructionPeriod.end) {
          displayLabel = event.label || 'Construction of the Pyramids of Giza';
        } else if (currentYear > event.constructionPeriod.end) {
          // After construction completed, show "Pyramids of Giza"
          displayLabel = 'Pyramids of Giza';
        }
      }
    }
    
    // Add a small offset to event markers to prevent overlap with location pins
    // Adjust the latitude slightly to separate event markers from location pins
    const offsetLatitude = event.latitude + 0.02; // Smaller offset for smaller pins
    
    // Create an improved billboard image
    const markerImage = createEventMarkerImage(event.id, emoji);
    
    cesiumViewer.current.entities.add({
      id: `event_${event.id}`, // Add event_ prefix to ID to make it easier to filter
      name: displayLabel,
      position: window.Cesium.Cartesian3.fromDegrees(event.longitude, offsetLatitude, 100), // Lower altitude
      billboard: {
        image: markerImage,
        scale: 0.8,
        horizontalOrigin: window.Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM,
        heightReference: window.Cesium.HeightReference.RELATIVE_TO_GROUND
      },
      label: {
        text: displayLabel,
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
        title: displayLabel,
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

  // Add a new effect to track camera zoom level and control transitions
  useEffect(() => {
    if (!cesiumLoaded || !cesiumViewer.current) return;
    
    const viewer = cesiumViewer.current;
    
    // Save reference for other components to use
    (window as any)._pyramidCesiumViewer = viewer;
    
    // Create a camera change event listener to track zoom level
    const cameraChangedEvent = viewer.camera.changed.addEventListener(() => {
      // Get current camera height/zoom level
      const cameraPosition = viewer.camera.position;
      const ellipsoid = viewer.scene.globe.ellipsoid;
      const cartographic = ellipsoid.cartesianToCartographic(cameraPosition);
      const height = cartographic.height;
      
      // Update zoom level state
      setCurrentZoomLevel(height);
      
      // Check if we're close to Egypt's coordinates regardless of current location
      const longitude = cartographic.longitude * 180 / Math.PI; // Convert to degrees
      const latitude = cartographic.latitude * 180 / Math.PI;  // Convert to degrees
      
      // Check if camera is near Egypt (within a reasonable radius)
      const isNearEgypt = 
        Math.abs(longitude - 31.1342) < 5 && 
        Math.abs(latitude - 29.9792) < 5;
      
      if (isNearEgypt) {
        // When we're near Egypt's coordinates
        if (height < 3000000) {
          // When close enough, set location to Egypt and show the animation
          if (currentLocation !== 'egypt') {
            setCurrentLocation('egypt');
            
            // Set up initial time period for the Egypt view
            setCurrentTimePeriodIndex(0);
            setSelectedPeriod(PYRAMID_TIME_PERIODS[0]);
            
            // Show the transition effect to make it clear something happened
            setTransitionData({
              location: LOCATIONS.egypt.name,
              year: PYRAMID_TIME_PERIODS[0].year
            });
            
            // Show era transition UI
            setTimeout(() => {
              setShowEraTransition(true);
            }, 300);
          }
          
          // When zoomed in close enough, show the pyramid animation
          if (!showPyramidAnimation) {
            setShowPyramidAnimation(true);
            setIsPlaying(true);
          }
        } else if (height >= 3000000 && height < 20000000) {
          // At medium zoom, show pin but hide animation
          setShowLocationPin(true);
          setShowPyramidAnimation(false);
          
          // If we're not already in Egypt view and we're focusing on it, set the location
          if (currentLocation !== 'egypt' && isNearEgypt && height < 10000000) {
            setCurrentLocation('egypt');
          }
        }
      } else if (currentLocation === 'egypt') {
        // If we're in Egypt location but camera moved far away, reset the view
        if (height > 10000000 || !isNearEgypt) {
          setShowPyramidAnimation(false);
          
          // Only reset location if we're really far away
          if (height > 30000000 || (!isNearEgypt && height > 15000000)) {
            setCurrentLocation(null);
          }
        }
      }
    });
    
    return () => {
      cameraChangedEvent();
    };
  }, [cesiumLoaded, cesiumViewer.current, currentLocation, showPyramidAnimation]);

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

  // Add useEffect to ensure PyramidAnimation is shown immediately on load when the location is Egypt
  useEffect(() => {
    if (currentLocation === 'egypt' && cesiumViewer.current) {
      // Immediately show and start the pyramid animation when in Egypt view
      setShowPyramidAnimation(true);
      setIsPlaying(true);
    }
  }, [currentLocation, cesiumViewer.current]);

  // Add a useEffect to update event markers when the current global year changes
  useEffect(() => {
    if (!cesiumViewer.current || !cesiumLoaded) return;
    
    // Get the currently filtered events
    const filteredEvents = HISTORICAL_EVENTS.filter(
      event => event.period === currentGlobalPeriod || currentGlobalPeriod === 'all'
    );
    
    // Update the events with potentially new labels based on the current year
    handleEventsFiltered(filteredEvents);
    
  }, [currentGlobalYear, cesiumLoaded]);

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
            <h1>Time Machine</h1>
            <p className="landing-subtitle">Begin your journey through space and time</p>
            
            {/* Date Selection - only show when era is selected */}
            {selectedEra && (
              <div className="time-picker-container">
                <DateWheelPicker
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                  selectedDay={selectedDay}
                  onYearChange={handleYearChange}
                  onMonthChange={handleMonthChange}
                  onDayChange={handleDayChange}
                  availableYearRange={getAvailableYears()}
                />
              </div>
            )}
            
            <div className="time-indicators">
              <div className="time-indicator">
                <span className="time-label">Era</span>
                <span className="time-value">
                  {selectedEra ? availableEras.find(era => era.id === selectedEra)?.name : "Not Selected"}
                </span>
              </div>
              <div className="time-indicator">
                <span className="time-label">Date</span>
                <span className="time-value">
                  {selectedEra 
                    ? `${new Date(2000, selectedMonth - 1, 1).toLocaleString('default', { month: 'long' })} ${selectedDay}, ${selectedYear < 0 ? Math.abs(selectedYear) + ' BCE' : selectedYear + ' CE'}`
                    : "Not Selected"}
                </span>
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
                Initialize Time Portal
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
        >
          {cesiumLoaded && currentLocation === 'egypt' && (
            <LocationPin 
              isVisible={showLocationPin}
              locationId="egypt"
              longitude={31.1342}
              latitude={29.9792}
              height={1000000}
              emoji="🏛️"
              name="Pyramids of Giza"
              zoomLevel={currentZoomLevel}
            />
          )}
          
          <PyramidAnimation
            isVisible={showPyramidAnimation}
            isPlaying={isPlaying}
            currentTimePeriod={selectedPeriod?.id}
          />
        </div>
        
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
            name={getSelectedEvent()!.name || ''}
            year={getSelectedEvent()!.year}
            emoji={getSelectedEvent()!.emoji || '📍'}
            description={getSelectedEvent()!.description || ''}
          />
        )}
      </div>
    </>
  );
}

export default App;