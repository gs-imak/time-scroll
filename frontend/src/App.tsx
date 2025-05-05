import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import './styles/cesium.css';
import './styles/date-picker.css';
import './styles/DateWheelPicker.css';
import { MiniTimeline, TimeDial, EraTransition, DescriptionPanel } from './components/time-ui';
import { LocationsPanel } from './features/locations';
import { GlobalTimeSlider } from './features/time-slider/GlobalTimeSlider';
import { HistoricalEventMarker } from './components/HistoricalEventMarker';
import { EventDetailModal } from './features/event-detail';
import { PyramidAnimation, ColosseumAnimation } from './features/animations';
import { DateWheelPicker } from './components/DateWheelPicker';
import { GLOBAL_TIME_PERIODS, HISTORICAL_EVENTS } from './constants/historyData';
import { addEventMarker } from './features/map/event-marker-helpers';

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
  },
  rome: {
    id: 'rome',
    name: "Colosseum of Rome",
    longitude: 12.4922,
    latitude: 41.8902,
    height: 1000000, // Lower height to get closer to the colosseum
    emoji: "🏟️",
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

// Historical time periods for the Colosseum of Rome
const COLOSSEUM_TIME_PERIODS = [
  {
    id: "planning-phase",
    year: "70 CE",
    title: "Planning Phase",
    description: "Emperor Vespasian orders the construction of the Colosseum (originally called the Flavian Amphitheatre) after the Great Fire of Rome and the civil war. The project is funded with spoils from the Jewish Temple after the Siege of Jerusalem.",
    imageUrl: null
  },
  {
    id: "construction-begin",
    year: "72 CE",
    title: "Construction Begins",
    description: "Construction begins on the Colosseum under Emperor Vespasian. The site chosen is the former location of Nero's Golden House (Domus Aurea) and artificial lake, symbolically returning the land to the Roman people.",
    imageUrl: null
  },
  {
    id: "construction-mid",
    year: "75 CE",
    title: "Mid-Construction",
    description: "The first two tiers of the Colosseum are complete. Emperor Vespasian dies in 79 CE and his son Titus continues the construction. The innovative design includes 80 entrance arches, a complex system of corridors, and a sophisticated drainage system.",
    imageUrl: null
  },
  {
    id: "inauguration",
    year: "80 CE",
    title: "Inauguration",
    description: "Emperor Titus inaugurates the Colosseum with 100 days of games, including gladiatorial combats and wild animal hunts. The opening ceremonies were among the most lavish in Roman history, with thousands of animals slaughtered in the arena.",
    imageUrl: null
  },
  {
    id: "modern-era",
    year: "Present Day",
    title: "Modern Era",
    description: "Today, the Colosseum stands as one of Rome's most iconic landmarks, despite significant damage from earthquakes and stone-robbers over the centuries. It remains the largest amphitheatre ever built and symbolizes the engineering prowess of the ancient Romans.",
    imageUrl: null
  }
];

import { LandingPage } from './features/landing-page/LandingPage';

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
  const [currentGlobalPeriod, setCurrentGlobalPeriod] = useState<TimePeriod>(
    GLOBAL_TIME_PERIODS[GLOBAL_TIME_PERIODS.length - 1]
  );
  const [currentGlobalYear, setCurrentGlobalYear] = useState<number>(-2023);
  const [currentZoomLevel, setCurrentZoomLevel] = useState<number>(30000000);
  
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

  // Add new state variables for Colosseum
  const [currentColosseumPeriodIndex, setCurrentColosseumPeriodIndex] = useState(0);
  const [selectedColosseumPeriod, setSelectedColosseumPeriod] = useState<typeof COLOSSEUM_TIME_PERIODS[0] | null>(null);
  const [showColosseumAnimation, setShowColosseumAnimation] = useState(false);

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
          baseLayerPicker: true,
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
          stroke: window.Cesium.Color.fromCssColorString('#FFFFFF'), // Change border color to white
          fill: window.Cesium.Color.fromCssColorString('rgba(255, 255, 255, 0.05)'), // Adjust fill color to match the new border color
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
              entity.polygon.outlineColor = window.Cesium.Color.fromCssColorString('#FFFFFF');
              entity.polygon.outlineWidth = 1.5;
              
              // Add distance display condition for borders
              entity.polygon.distanceDisplayCondition = new window.Cesium.DistanceDisplayCondition(0, 20000000); // Show borders only when closer than 20,000 km
              
              // Calculate centroid position for the polygon
              try {
                const positions = entity.polygon.hierarchy.getValue(window.Cesium.JulianDate.now()).positions;
                const center = window.Cesium.BoundingSphere.fromPoints(positions).center;
                
                // Set entity position to the centroid of its polygon
                entity.position = center;
                
                // Add label for polygon entities at their centroid with improved decluttering
                const name = entity.name || entity.id || '';
                if (name) {
                  // Determine region and importance level
                  const isEuropean = isInEurope(entity);
                  const importanceLevel = getImportanceLevel(entity);
                  
                  // Set different distance thresholds based on region and importance
                  let minDistance = 300000;  // Default min visibility distance
                  let maxDistance = 2e7;     // Default max visibility distance
                  
                  // Apply progressive visibility based on region and importance
                  if (isEuropean) {
                    // European countries need more decluttering
                    if (importanceLevel === 'major') {
                      // Major European countries (France, Germany, UK, etc)
                      minDistance = 300000;
                      maxDistance = 2e7;
                    } else if (importanceLevel === 'medium') {
                      // Medium European countries (Austria, Portugal, etc)
                      minDistance = 500000;
                      maxDistance = 1.5e7;
                    } else if (importanceLevel === 'minor') {
                      // Minor European countries (Luxembourg, etc)
                      minDistance = 800000;
                      maxDistance = 8e6;
                    } else {
                      // Micro states
                      minDistance = 1e6;
                      maxDistance = 4e6;
                    }
                  }
                  
                  entity.label = new window.Cesium.LabelGraphics({
                    text: name,
                    font: 'bold 20px Roboto, sans-serif', // Add bold for better visibility
                    fillColor: window.Cesium.Color.fromCssColorString('#FFFFFF'), // Pure white
                    outlineColor: window.Cesium.Color.fromCssColorString('#000000'), // Pure black outline
                    outlineWidth: 4, // Thicker outline for better contrast
                    style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
                    horizontalOrigin: window.Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: window.Cesium.VerticalOrigin.CENTER,
                    distanceDisplayCondition: new window.Cesium.DistanceDisplayCondition(minDistance, maxDistance),
                    scaleByDistance: new window.Cesium.NearFarScalar(minDistance, 1.5, maxDistance * 0.7, 0.4),
                    showBackground: false,
                    // Add a slight glow effect like Google Earth
                    eyeOffset: new window.Cesium.Cartesian3(0, 0, 0),
                    pixelOffset: isEuropean ? 
                      new window.Cesium.Cartesian2(
                        (Math.random() - 0.5) * 20, 
                        (Math.random() - 0.5) * 20
                      ) : 
                      new window.Cesium.Cartesian2(0, 0),
                    translucencyByDistance: new window.Cesium.NearFarScalar(minDistance, 1.0, maxDistance * 0.7, 0.5)
                  });
                }
              } catch (e) {
                console.error("Error calculating centroid for polygon:", e);
              }
            }
            // Handle entities that already have a position but no polygon
            else if (entity.position) {
              const name = entity.name || entity.id || '';
              if (name) {
                entity.label = new window.Cesium.LabelGraphics({
                  text: name,
                  font: 'bold 20px Roboto, sans-serif', // Add bold for better visibility
                  fillColor: window.Cesium.Color.fromCssColorString('#FFFFFF'), // Pure white
                  outlineColor: window.Cesium.Color.fromCssColorString('#000000'), // Pure black outline
                  outlineWidth: 4, // Thicker outline for better contrast
                  style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
                  horizontalOrigin: window.Cesium.HorizontalOrigin.CENTER,
                  verticalOrigin: window.Cesium.VerticalOrigin.CENTER,
                  distanceDisplayCondition: new window.Cesium.DistanceDisplayCondition(0.0, 2e7),
                  scaleByDistance: new window.Cesium.NearFarScalar(1e6, 1.5, 2e7, 0.4),
                  showBackground: false,
                  pixelOffset: new window.Cesium.Cartesian2(0, 0),
                  translucencyByDistance: new window.Cesium.NearFarScalar(1e6, 1.0, 2e7, 0.5)
                });
              }
            }
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

  // Function to create a pin with CSS styling rendered on canvas
  const buildCssStyledPin = (emoji: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 32; // Smaller width
    canvas.height = 48; // Smaller height
    const context = canvas.getContext('2d');
    
    if (context) {
      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw pin shape
      context.save();
      context.translate(16, 12); // Position at top
      
      // Draw the outer pin shape - pointing downward
      context.beginPath();
      context.arc(0, 0, 8, 0, Math.PI, true);
      context.lineTo(-8, 8);
      context.lineTo(0, 22); // Extend the point lower
      context.lineTo(8, 8);
      context.closePath();
      
      // Fill with solid color
      context.fillStyle = '#38bdf8';
      context.fill();
      
      // Draw the inner circle
      context.beginPath();
      context.arc(0, 0, 4, 0, 2 * Math.PI, false);
      context.fillStyle = '#FFFFFF';
      context.fill();
      
      context.restore();
    }
    
    return canvas;
  };
  
  // Function to add location pins for interactive locations
  const addLocationPins = () => {
    if (!cesiumViewer.current) return;
    // Prevent pins in prehistory
    if (currentGlobalPeriod && currentGlobalPeriod.id === 'prehistory') return;
    console.log("Adding location pins for:", Object.keys(LOCATIONS));
    Object.values(LOCATIONS).forEach(location => {
      // Create the pin canvas with CSS styling
      const pinCanvas = buildCssStyledPin(location.emoji);
      // Create billboard entity with initial scale/opacity 0
      const entity = cesiumViewer.current.entities.add({
        id: `location_pin_${location.id}`,
        name: location.name,
        position: window.Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude, 0),
        billboard: {
          image: pinCanvas.toDataURL(),
          scale: 0,
          horizontalOrigin: window.Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM,
          heightReference: window.Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: 0,
          color: window.Cesium.Color.WHITE.withAlpha(0) // Start fully transparent
        },
        label: {
          text: location.name,
          font: '16px Helvetica, Arial, sans-serif',
          fillColor: window.Cesium.Color.fromCssColorString('#60efff'),
          outlineColor: window.Cesium.Color.BLACK,
          outlineWidth: 4,
          style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: window.Cesium.VerticalOrigin.TOP,
          pixelOffset: new window.Cesium.Cartesian2(0, 0),
          showBackground: true,
          backgroundColor: window.Cesium.Color.fromCssColorString('rgba(0, 30, 60, 0.7)'),
          backgroundPadding: new window.Cesium.Cartesian2(8, 4),
          horizontalOrigin: window.Cesium.HorizontalOrigin.CENTER
        }
      });
      // Animate scale and opacity
      let start: number | null = null;
      const duration = 400;
      function animatePin(ts: number) {
        if (!start) start = ts;
        const elapsed = ts - start;
        const t = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const ease = 1 - Math.pow(1 - t, 3);
        entity.billboard.scale = ease;
        entity.billboard.color = window.Cesium.Color.WHITE.withAlpha(ease);
        // Animate label opacity
        if (entity.label && entity.label.fillColor) {
          entity.label.fillColor = window.Cesium.Color.fromCssColorString('#60efff').withAlpha(ease);
        }
        if (t < 1) {
          requestAnimationFrame(animatePin);
        } else {
          entity.billboard.scale = 1;
          entity.billboard.color = window.Cesium.Color.WHITE.withAlpha(1);
          if (entity.label && entity.label.fillColor) {
            entity.label.fillColor = window.Cesium.Color.fromCssColorString('#60efff').withAlpha(1);
          }
        }
      }
      requestAnimationFrame(animatePin);
    });
  };

  // Helper to remove all location pins
  function removeLocationPins() {
    if (!cesiumViewer.current) return;
    const entities = cesiumViewer.current.entities.values;
    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i];
      if (entity && entity.id && entity.id.toString().startsWith('location_pin_')) {
        cesiumViewer.current.entities.remove(entity);
      }
    }
  }

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
    // Prevent redundant updates to improve performance
    if (currentTimePeriodIndex === periodIndex) return;
    
    console.log(`Changing time period to ${periodIndex}: ${PYRAMID_TIME_PERIODS[periodIndex].year}`);
    
    // Update the current period index
    setCurrentTimePeriodIndex(periodIndex);
    
    // Update the selected period for animation settings
    const newPeriod = PYRAMID_TIME_PERIODS[periodIndex];
    setSelectedPeriod(newPeriod);
    
    // Check for prehistory before showing animation
    if (currentGlobalPeriod && currentGlobalPeriod.id === 'prehistory') {
      console.log("In prehistory period - not showing pyramid animation");
      setShowPyramidAnimation(false);
      setIsPlaying(false);
    } else {
      // Explicitly ensure the animation is playing when changing timeline
      setIsPlaying(true);
      // Make sure animation is visible
      setShowPyramidAnimation(true);
    }
    
    // Show transition effect for era changes
    setTransitionData({
      location: "Pyramids of Giza",
      year: newPeriod.year
    });
    
    // If we're changing between major eras, show a transition effect
    const isPreviousHistorical = currentTimePeriodIndex <= 3;
    const isNewModern = periodIndex === 4;
    const isPreviousModern = currentTimePeriodIndex === 4;
    const isNewHistorical = periodIndex <= 3;
    
    // Only show the transition if we're crossing between historical and modern
    if ((isPreviousHistorical && isNewModern) || (isPreviousModern && isNewHistorical)) {
      setShowEraTransition(true);
    }
    
    // Update the visualization for the new time period
    if (cesiumViewer.current) {
      addTimePeriodVisualization(newPeriod.id);
      
      // Always ensure the Egypt pin is hidden when the animation is showing
      if (showPyramidAnimation) {
        const egyptPin = cesiumViewer.current.entities.getById('location_pin_egypt');
        if (egyptPin) {
          egyptPin.show = false;
        }
      }
    }
    
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
        
        // Re-hide the Egypt pin if animation is showing
        const egyptPin = cesiumViewer.current.entities.getById('location_pin_egypt');
        if (egyptPin && showPyramidAnimation) {
          egyptPin.show = false;
        }
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
          if (isModernEra && currentGlobalPeriod && currentGlobalPeriod.id !== 'prehistory') {
            addLocationPins();
          }
          break;
      }
    } catch (error) {
      console.error("Error adding time period visualization:", error);
    }
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
        
        // Remove all location pins first
        removeLocationPins();
        
        // Only add pins if not prehistory
        if (currentGlobalPeriod && currentGlobalPeriod.id !== 'prehistory') {
          addLocationPins();
        }
        
        // Add filtered events for the current global period
        handleEventsFiltered(HISTORICAL_EVENTS.filter(
          event => event.locationId === 'newYork' && 
          (event.period === currentGlobalPeriod.id || currentGlobalPeriod.id === 'all')
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
      
      // Remove all location pins first
      removeLocationPins();
      
      // Only add pins if not prehistory
      if (currentGlobalPeriod && currentGlobalPeriod.id !== 'prehistory') {
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
    setCurrentGlobalPeriod(period);
    setCurrentGlobalYear(Math.floor((period.start + period.end) / 2));
    
    console.log(`Switched to period: ${period.label}, ${period.start} - ${period.end}`);
    
    // Check if we're in Egypt and need to update the animation visibility
    if (currentLocation === 'egypt') {
      // If switching to prehistory, hide the animation
      if (period.id === 'prehistory') {
        console.log("Switching to prehistory - hiding pyramid animation");
        setShowPyramidAnimation(false);
        setIsPlaying(false);
      } else if (period.id !== 'prehistory') {
        // If we're switching out of prehistory back to a period where animation should be visible
        console.log("Switching back from prehistory - potentially showing Egypt UI");
        
        // Make sure we have the proper time period selected
        if (!selectedPeriod) {
          setCurrentTimePeriodIndex(0);
          setSelectedPeriod(PYRAMID_TIME_PERIODS[0]);
        }
        
        if (cesiumViewer.current) {
          const cameraPosition = cesiumViewer.current.camera.position;
          const ellipsoid = cesiumViewer.current.scene.globe.ellipsoid;
          const cartographic = ellipsoid.cartesianToCartographic(cameraPosition);
          const height = cartographic.height;
          
          // Only show animation if we're zoomed in close enough
          if (height < 3000000) {
            console.log("Switching from prehistory - showing pyramid animation");
            setShowPyramidAnimation(true);
            setIsPlaying(true);
          }
        }
      }
    }
    // Check if we're in Rome and need to update the animation visibility
    else if (currentLocation === 'rome') {
      // If switching to prehistory, hide the animation
      if (period.id === 'prehistory') {
        console.log("Switching to prehistory - hiding colosseum animation");
        setShowColosseumAnimation(false);
      } else if (period.id !== 'prehistory') {
        // If we're switching out of prehistory back to a period where animation should be visible
        console.log("Switching back from prehistory - potentially showing Rome UI");
        
        // Make sure we have the proper time period selected
        if (!selectedColosseumPeriod) {
          setCurrentColosseumPeriodIndex(0);
          setSelectedColosseumPeriod(COLOSSEUM_TIME_PERIODS[0]);
        }
        
        if (cesiumViewer.current) {
          const cameraPosition = cesiumViewer.current.camera.position;
          const ellipsoid = cesiumViewer.current.scene.globe.ellipsoid;
          const cartographic = ellipsoid.cartesianToCartographic(cameraPosition);
          const height = cartographic.height;
          
          // Only show animation if we're zoomed in close enough
          if (height < 3000000) {
            console.log("Switching from prehistory - showing colosseum animation");
            setShowColosseumAnimation(true);
          }
        }
      }
    }
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
      
      // Then add any filtered event markers, but exclude the Pyramids of Giza event
      if (filteredEvents.length > 0) {
        filteredEvents.forEach(event => {
          // Skip adding the Great Pyramid Construction event
          if (event.latitude && event.longitude && event.id !== 'great-pyramid-construction') {
            addEventMarker(cesiumViewer.current, event, currentGlobalYear);
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
    // If year is outside current period, update global period
    if (year < currentGlobalPeriod.start || year > currentGlobalPeriod.end) {
      const newPeriod = GLOBAL_TIME_PERIODS.find(
        p => year >= p.start && year <= p.end
      );
      if (newPeriod) setCurrentGlobalPeriod(newPeriod);
    }
    
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
      } else if (locationId === 'rome' && !showEraTransition) {
        // Force refresh the Rome timeline
        setCurrentColosseumPeriodIndex(4); // Reset to modern era
        setSelectedColosseumPeriod(COLOSSEUM_TIME_PERIODS[4]);
        
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
          addColosseumTimePeriodVisualization("modern-era");
        }
        
        // Show the transition effect to make it clear something happened
        setTransitionData({
          location: LOCATIONS.rome.name,
          year: COLOSSEUM_TIME_PERIODS[4].year
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
    } else if (locationId === 'rome') {
      flyToRome();
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
      
      // Get current longitude and latitude
      const longitude = cartographic.longitude * 180 / Math.PI; // Convert to degrees
      const latitude = cartographic.latitude * 180 / Math.PI;  // Convert to degrees
      
      // Check if camera is near Egypt (within a reasonable radius)
      const isNearEgypt = 
        Math.abs(longitude - 31.1342) < 5 && 
        Math.abs(latitude - 29.9792) < 5;
      
      // Check if camera is near Rome (within a reasonable radius)
      const isNearRome = 
        Math.abs(longitude - 12.4922) < 5 && 
        Math.abs(latitude - 41.8902) < 5;
      
      // Debug log current height and location proximity
      console.log(`Camera height: ${Math.round(height)}, Near Egypt: ${isNearEgypt}, Near Rome: ${isNearRome}, Current location: ${currentLocation}`);
      
      if (isNearEgypt) {
        // When we're near Egypt's coordinates
        if (height < 3000000) {
          // Check if we're in prehistory period - don't show animation in prehistory
          if (currentGlobalPeriod && currentGlobalPeriod.id === 'prehistory') {
            console.log("In prehistory period - not showing pyramid animation");
            setShowPyramidAnimation(false);
            setIsPlaying(false);
            return;
          }
          
          // When close enough, set location to Egypt and show the animation
          if (currentLocation !== 'egypt') {
            console.log("Setting location to Egypt");
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
          
          // Check again for prehistory before showing animation
          if (currentGlobalPeriod && currentGlobalPeriod.id === 'prehistory') {
            console.log("In prehistory period - not showing pyramid animation");
            setShowPyramidAnimation(false);
            setIsPlaying(false);
          } else {
            // When zoomed in close enough, always show the pyramid animation
            console.log("Close enough to show animation, current showPyramidAnimation:", showPyramidAnimation);
            
            // Always force the animation to show and play when close enough
            setShowPyramidAnimation(true);
            setIsPlaying(true);
            
            // Hide the Egypt location pin when animation is shown
            if (cesiumViewer.current) {
              const egyptPin = cesiumViewer.current.entities.getById(`location_pin_egypt`);
              if (egyptPin) {
                egyptPin.show = false;
              }
            }
          }
        } else if (height >= 3000000 && height < 20000000) {
          // At medium zoom, show pin but hide animation
          console.log("Medium zoom, hiding animation");
          setShowPyramidAnimation(false);
          setIsPlaying(false);
          
          // Show the Egypt location pin again
          if (cesiumViewer.current) {
            const egyptPin = cesiumViewer.current.entities.getById(`location_pin_egypt`);
            if (egyptPin) {
              egyptPin.show = true;
            }
          }
          
          // If we're not already in Egypt view and we're focusing on it, set the location
          if (currentLocation !== 'egypt' && isNearEgypt && height < 10000000) {
            setCurrentLocation('egypt');
          }
        }
      } else if (isNearRome) {
        // When we're near Rome's coordinates
        if (height < 3000000) {
          // Check if we're in prehistory period - don't show animation in prehistory
          if (currentGlobalPeriod && currentGlobalPeriod.id === 'prehistory') {
            console.log("In prehistory period - not showing colosseum animation");
            setShowColosseumAnimation(false);
            return;
          }
          
          // When close enough, set location to Rome and show the animation
          if (currentLocation !== 'rome') {
            console.log("Setting location to Rome");
            setCurrentLocation('rome');
            
            // Set up initial time period for the Rome view
            setCurrentColosseumPeriodIndex(0);
            setSelectedColosseumPeriod(COLOSSEUM_TIME_PERIODS[0]);
            
            // Show the transition effect to make it clear something happened
            setTransitionData({
              location: LOCATIONS.rome.name,
              year: COLOSSEUM_TIME_PERIODS[0].year
            });
            
            // Show era transition UI
            setTimeout(() => {
              setShowEraTransition(true);
            }, 300);
          }
          
          // Check again for prehistory before showing animation
          if (currentGlobalPeriod && currentGlobalPeriod.id === 'prehistory') {
            console.log("In prehistory period - not showing colosseum animation");
            setShowColosseumAnimation(false);
          } else {
            // When zoomed in close enough, always show the colosseum animation
            console.log("Close enough to show colosseum animation, current showColosseumAnimation:", showColosseumAnimation);
            
            // Always force the animation to show when close enough
            setShowColosseumAnimation(true);
            
            // Hide the Rome location pin when animation is shown
            if (cesiumViewer.current) {
              const romePin = cesiumViewer.current.entities.getById(`location_pin_rome`);
              if (romePin) {
                romePin.show = false;
              }
            }
          }
        } else if (height >= 3000000 && height < 20000000) {
          // At medium zoom, show pin but hide animation
          console.log("Medium zoom, hiding colosseum animation");
          setShowColosseumAnimation(false);
          
          // Show the Rome location pin again
          if (cesiumViewer.current) {
            const romePin = cesiumViewer.current.entities.getById(`location_pin_rome`);
            if (romePin) {
              romePin.show = true;
            }
          }
          
          // If we're not already in Rome view and we're focusing on it, set the location
          if (currentLocation !== 'rome' && isNearRome && height < 10000000) {
            setCurrentLocation('rome');
          }
        }
      } else if (currentLocation === 'egypt') {
        // If we're in Egypt location but camera moved far away, reset the view
        if (height > 10000000 || !isNearEgypt) {
          console.log("Far from Egypt, hiding animation");
          setShowPyramidAnimation(false);
          setIsPlaying(false);
          
          // Show the Egypt location pin again
          if (cesiumViewer.current) {
            const egyptPin = cesiumViewer.current.entities.getById(`location_pin_egypt`);
            if (egyptPin) {
              egyptPin.show = true;
            }
          }
          
          // Only reset location if we're really far away
          if (height > 30000000 || (!isNearEgypt && height > 15000000)) {
            setCurrentLocation(null);
          }
        }
      } else if (currentLocation === 'rome') {
        // If we're in Rome location but camera moved far away, reset the view
        if (height > 10000000 || !isNearRome) {
          console.log("Far from Rome, hiding animation");
          setShowColosseumAnimation(false);
          
          // Show the Rome location pin again
          if (cesiumViewer.current) {
            const romePin = cesiumViewer.current.entities.getById(`location_pin_rome`);
            if (romePin) {
              romePin.show = true;
            }
          }
          
          // Only reset location if we're really far away
          if (height > 30000000 || (!isNearRome && height > 15000000)) {
            setCurrentLocation(null);
          }
        }
      }
    });
    
    return () => {
      cameraChangedEvent();
    };
  }, [cesiumLoaded, cesiumViewer.current, currentLocation, showPyramidAnimation, showColosseumAnimation, currentGlobalPeriod]);

  // Add cleanup when leaving Egypt view or unmounting
  useEffect(() => {
    if (currentLocation !== 'egypt') {
      setShowPyramidAnimation(false);
    }
    
    return () => {
      setShowPyramidAnimation(false);
    };
  }, [currentLocation]);

  // Add cleanup when leaving Rome view or unmounting
  useEffect(() => {
    if (currentLocation !== 'rome') {
      setShowColosseumAnimation(false);
    }
    
    return () => {
      setShowColosseumAnimation(false);
    };
  }, [currentLocation]);

  // Fix the events filtering effect
  useEffect(() => {
    if (!cesiumLoaded || showLandingPage || currentLocation) return;
    
    const filteredEvents = HISTORICAL_EVENTS.filter(
      event => event.period === currentGlobalPeriod.id || currentGlobalPeriod.id === 'all'
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
      // Prevent pins in prehistory
      if (currentGlobalPeriod && currentGlobalPeriod.id === 'prehistory') return;
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
  }, [visibleEvents, currentLocation, cesiumLoaded, currentGlobalPeriod]);

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
    if (currentLocation === 'egypt' && cesiumViewer.current && isPyramidPeriod(selectedPeriod?.id) && currentGlobalPeriod.id !== 'prehistory') {
      setShowPyramidAnimation(true);
      setIsPlaying(true);
      const egyptPin = cesiumViewer.current.entities.getById(`location_pin_egypt`);
      if (egyptPin) egyptPin.show = false;
    } else if (cesiumViewer.current) {
      setShowPyramidAnimation(false);
      setIsPlaying(false);
      const egyptPin = cesiumViewer.current.entities.getById(`location_pin_egypt`);
      if (egyptPin) egyptPin.show = true;
    }
  }, [currentLocation, cesiumViewer.current, selectedPeriod, currentGlobalPeriod]);

  // Add a specific effect to handle pyramid animation visibility changes
  useEffect(() => {
    if (!cesiumViewer.current) return;
    
    if (showPyramidAnimation) {
      // Hide the Egypt pin when animation becomes visible
      const egyptPin = cesiumViewer.current.entities.getById('location_pin_egypt');
      if (egyptPin) {
        egyptPin.show = false;
      }
      
      // Ensure animation is playing when visible
      setIsPlaying(true);
      
      // Add a class to the document body to help with global CSS selectors
      document.body.classList.add('pyramid-animation-visible');
    } else {
      // Only show the pin if we're in Egypt view but not showing the animation
      if (currentLocation === 'egypt') {
        const egyptPin = cesiumViewer.current.entities.getById('location_pin_egypt');
        if (egyptPin) {
          egyptPin.show = true;
        }
      }
      
      // Stop animation when hidden
      setIsPlaying(false);
      
      // Remove the class from body
      document.body.classList.remove('pyramid-animation-visible');
    }
  }, [showPyramidAnimation, currentLocation]);

  // Add a useEffect to update event markers when the current global year changes
  useEffect(() => {
    if (!cesiumViewer.current || !cesiumLoaded) return;
    
    // Get the currently filtered events
    const filteredEvents = HISTORICAL_EVENTS.filter(
      event => event.period === currentGlobalPeriod.id || currentGlobalPeriod.id === 'all'
    );
    
    // Update the events with potentially new labels based on the current year
    handleEventsFiltered(filteredEvents);
    
  }, [currentGlobalYear, cesiumLoaded]);

  // Helper functions to implement the decluttering logic

  // Determine if entity is in Europe (you can add more precise checks)
  function isInEurope(entity) {
    // Simple longitude/latitude check for European region
    if (entity.properties) {
      try {
        // Try to get coordinates from centroid position
        if (entity.position) {
          const cartographic = window.Cesium.Cartographic.fromCartesian(entity.position);
          const lon = window.Cesium.Math.toDegrees(cartographic.longitude);
          const lat = window.Cesium.Math.toDegrees(cartographic.latitude);
          
          // Rough bounds of Europe
          return (lon > -25 && lon < 40 && lat > 35 && lat < 72);
        }
      } catch (e) {
        console.error("Error checking European location:", e);
      }
    }
    return false;
  }

  // Enhance the importance level function to include scale factors
  function getImportanceLevel(entity) {
    const name = entity.name || '';
    
    // Major European countries - always visible first
    const majorEuropean = [
      'Russia', 'France', 'Germany', 'United Kingdom', 'Italy', 'Spain', 
      'Poland', 'Ukraine', 'Romania'
    ];
    
    // Medium European countries - visible at medium zoom
    const mediumEuropean = [
      'Netherlands', 'Belgium', 'Portugal', 'Sweden', 
      'Greece', 'Czech Republic', 'Hungary', 'Austria', 
      'Switzerland', 'Bulgaria', 'Denmark', 'Finland', 
      'Slovakia', 'Norway', 'Ireland', 'Croatia'
    ];
    
    // Minor European countries - visible only when zoomed in more
    const minorEuropean = [
      'Slovenia', 'Latvia', 'Estonia', 'Cyprus', 
      'Lithuania', 'Montenegro', 'Luxembourg', 'Malta', 'Iceland',
      'Belarus', 'Moldova', 'Albania', 'North Macedonia', 
      'Bosnia', 'Herzegovina', 'Serbia'
    ];
    
    // Micro states - visible only at closest zoom
    const microStates = [
      'Andorra', 'Monaco', 'Liechtenstein', 
      'San Marino', 'Vatican', 'Vatican City'
    ];
    
    // For non-European countries, use population data to determine importance
    const majorCountries = [
      'United States', 'China', 'India', 'Brazil', 'Japan', 
      'Mexico', 'Egypt', 'Turkey', 'Iran', 'Canada', 'Australia'
    ];
    
    if (majorEuropean.some(country => name.includes(country))) {
      return 'major';
    } else if (mediumEuropean.some(country => name.includes(country))) {
      return 'medium';
    } else if (minorEuropean.some(country => name.includes(country))) {
      return 'minor';
    } else if (microStates.some(country => name.includes(country))) {
      return 'micro';
    } else if (majorCountries.some(country => name.includes(country))) {
      return 'major';
    }
    
    // Default importance level
    return 'standard';
  }

  // Remove all location pins whenever the period changes to prehistory
  useEffect(() => {
    if (currentGlobalPeriod && currentGlobalPeriod.id === 'prehistory') {
      removeLocationPins();
    }
  }, [currentGlobalPeriod]);

  // Add useEffect to ensure the pyramid animation is not shown in prehistory
  useEffect(() => {
    // If we're in prehistory and the pyramid animation is showing, hide it
    if (currentGlobalPeriod && currentGlobalPeriod.id === 'prehistory' && showPyramidAnimation) {
      console.log("In prehistory - forcibly hiding pyramid animation");
      setShowPyramidAnimation(false);
      setIsPlaying(false);
    }
  }, [currentGlobalPeriod, showPyramidAnimation]);

  // Add useEffect to ensure the Colosseum animation is not shown in prehistory
  useEffect(() => {
    // If we're in prehistory and the colosseum animation is showing, hide it
    if (currentGlobalPeriod && currentGlobalPeriod.id === 'prehistory' && showColosseumAnimation) {
      console.log("In prehistory - forcibly hiding colosseum animation");
      setShowColosseumAnimation(false);
    }
  }, [currentGlobalPeriod, showColosseumAnimation]);

  // Helper: check if the current period is a pyramid period
  function isPyramidPeriod(periodId?: string) {
    return [
      'construction-begin',
      'construction-mid',
      'construction-complete',
      'middle-kingdom',
      'modern-era'
    ].includes(periodId || '');
  }
  
  // Helper: check if the current period is a colosseum period
  function isColosseumPeriod(periodId?: string) {
    return [
      'planning-phase',
      'construction-begin',
      'construction-mid',
      'inauguration',
      'modern-era'
    ].includes(periodId || '');
  }

  // Function to handle time period changes for the Colosseum
  const handleColosseumTimePeriodChange = (periodIndex: number) => {
    // Prevent redundant updates to improve performance
    if (currentColosseumPeriodIndex === periodIndex) return;
    
    console.log(`Changing Colosseum time period to ${periodIndex}: ${COLOSSEUM_TIME_PERIODS[periodIndex].year}`);
    
    // Update the current period index
    setCurrentColosseumPeriodIndex(periodIndex);
    
    // Update the selected period for animation settings
    const newPeriod = COLOSSEUM_TIME_PERIODS[periodIndex];
    setSelectedColosseumPeriod(newPeriod);
    
    // Check for prehistory before showing animation
    if (currentGlobalPeriod && currentGlobalPeriod.id === 'prehistory') {
      console.log("In prehistory period - not showing colosseum animation");
      setShowColosseumAnimation(false);
    } else {
      // Make sure animation is visible
      setShowColosseumAnimation(true);
    }
    
    // Show transition effect for era changes
    setTransitionData({
      location: "Colosseum of Rome",
      year: newPeriod.year
    });
    
    // If we're changing between major eras, show a transition effect
    const isPreviousHistorical = currentColosseumPeriodIndex <= 3;
    const isNewModern = periodIndex === 4;
    const isPreviousModern = currentColosseumPeriodIndex === 4;
    const isNewHistorical = periodIndex <= 3;
    
    // Only show the transition if we're crossing between historical and modern
    if ((isPreviousHistorical && isNewModern) || (isPreviousModern && isNewHistorical)) {
      setShowEraTransition(true);
    }
    
    // Update the visualization for the new time period
    if (cesiumViewer.current) {
      addColosseumTimePeriodVisualization(newPeriod.id);
      
      // Always ensure the Rome pin is hidden when the animation is showing
      if (showColosseumAnimation) {
        const romePin = cesiumViewer.current.entities.getById('location_pin_rome');
        if (romePin) {
          romePin.show = false;
        }
      }
    }
    
    // Refresh location pins to ensure correct label visibility with animation
    if (showColosseumAnimation) {
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
        
        // Re-hide the Rome pin if animation is showing
        const romePin = cesiumViewer.current.entities.getById('location_pin_rome');
        if (romePin && showColosseumAnimation) {
          romePin.show = false;
        }
      }, 50);
    }
  };
  
  // Function to add visualization for a specific Colosseum time period
  const addColosseumTimePeriodVisualization = (periodId: string) => {
    if (!cesiumViewer.current) return;
    
    const colosseumPosition = window.Cesium.Cartesian3.fromDegrees(
      12.4922, // longitude
      41.8902, // latitude
      0 // height
    );
    
    try {
      // Check if this is the modern era - only in this case we show location pins
      const isModernEra = periodId === "modern-era";
      
      // For historical time periods, we only show the historical visualization
      // No location pins to avoid confusion with modern map features
      
      switch(periodId) {
        case "planning-phase":
          // Add planning phase visualization
          const planningOverlay = cesiumViewer.current.entities.add({
            position: window.Cesium.Cartesian3.fromDegrees(12.4922, 41.8902, 10),
            ellipse: {
              semiMajorAxis: 100,
              semiMinorAxis: 100,
              material: window.Cesium.Color.ROYALBLUE.withAlpha(0.5),
              outline: true,
              outlineColor: window.Cesium.Color.WHITE
            }
          });
          
          setActiveOverlay(planningOverlay);
          break;
          
        case "construction-begin":
          // Add early construction visualization
          const foundationOverlay = cesiumViewer.current.entities.add({
            position: window.Cesium.Cartesian3.fromDegrees(12.4922, 41.8902, 5),
            ellipse: {
              semiMajorAxis: 80,
              semiMinorAxis: 65,
              material: window.Cesium.Color.BURLYWOOD.withAlpha(0.7),
              outline: true,
              outlineColor: window.Cesium.Color.WHITE
            }
          });
          
          setActiveOverlay(foundationOverlay);
          break;
          
        case "construction-mid":
          // Add mid-construction visualization
          const midConstructionOverlay = cesiumViewer.current.entities.add({
            position: window.Cesium.Cartesian3.fromDegrees(12.4922, 41.8902, 25),
            ellipsoid: {
              radii: new window.Cesium.Cartesian3(80, 65, 25),
              material: window.Cesium.Color.SANDYBROWN.withAlpha(0.8),
              outline: true,
              outlineColor: window.Cesium.Color.WHITE
            }
          });
          
          setActiveOverlay(midConstructionOverlay);
          break;
          
        case "inauguration":
          // Add completed Colosseum visualization
          const completedOverlay = cesiumViewer.current.entities.add({
            position: window.Cesium.Cartesian3.fromDegrees(12.4922, 41.8902, 30),
            ellipsoid: {
              radii: new window.Cesium.Cartesian3(80, 65, 30),
              material: window.Cesium.Color.PERU.withAlpha(0.8),
              outline: true,
              outlineColor: window.Cesium.Color.WHITE
            }
          });
          
          setActiveOverlay(completedOverlay);
          break;
          
        case "modern-era":
          // Modern era - add location pins since we're showing the modern map
          if (isModernEra && currentGlobalPeriod && currentGlobalPeriod.id !== 'prehistory') {
            addLocationPins();
          }
          break;
      }
    } catch (error) {
      console.error("Error adding time period visualization:", error);
    }
  };

  // Function to fly to Rome location
  const flyToRome = () => {
    const location = LOCATIONS.rome;
    
    // Clean up any active listeners
    cleanupActiveListeners();
    
    // Update current location state
    setCurrentLocation("rome");
    
    // Hide colosseum animation initially
    setShowColosseumAnimation(false);
    
    // First update the state
    setShowTimeSlider(false);
    
    // Then fly to location
    flyToLocation(location.longitude, location.latitude, location.height, location.name);
    
    // Clear any existing entities and prepare colosseum view after a short delay
    setTimeout(() => {
      if (cesiumViewer.current) {
        console.log("Preparing Rome view");
        
        // Remove all location pins first
        removeLocationPins();
        
        // Only add pins if not prehistory
        if (currentGlobalPeriod && currentGlobalPeriod.id !== 'prehistory') {
          addLocationPins();
        }
        
        // Add filtered events for the current global period
        handleEventsFiltered(HISTORICAL_EVENTS.filter(
          event => event.locationId === 'rome' && 
          (event.period === currentGlobalPeriod.id || currentGlobalPeriod.id === 'all')
        ));
      }
    }, 800);
    
    // Set up for the Colosseum time periods
    setTimeout(() => {
      console.log("Setting up Rome time periods");
      setCurrentColosseumPeriodIndex(0);
      setSelectedColosseumPeriod(COLOSSEUM_TIME_PERIODS[0]);
      
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
        
        // For modern era, add location pins (but we're starting with planning phase)
        if (COLOSSEUM_TIME_PERIODS[0].id === "modern-era") {
          addLocationPins();
        }
        
        // Start with planning-phase visualization
        addColosseumTimePeriodVisualization("planning-phase");
      }
      
      setTimeout(() => {
        setTransitionData({
          location: location.name,
          year: COLOSSEUM_TIME_PERIODS[0].year
        });
        setShowEraTransition(true);
      }, 300);
    }, 800);
  };

  if (showLandingPage) {
    return (
      <LandingPage
        onStartJourney={handleStartJourney}
        isSystemReady={isSystemReady}
        isPortalStabilized={isPortalStabilized}
        transitioning={transitioning}
        showPreloader={showPreloader}
        showPortalEffect={showPortalEffect}
        showTransitionOverlay={showTransitionOverlay}
        selectedEra={selectedEra}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        selectedDay={selectedDay}
        availableEras={availableEras}
        handleEraSelection={handleEraSelection}
        handleYearChange={handleYearChange}
        handleMonthChange={handleMonthChange}
        handleDayChange={handleDayChange}
        currentGlobalPeriod={currentGlobalPeriod}
      />
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
          className={`cesium-container ${showPyramidAnimation ? 'showing-pyramid-animation' : ''} ${showColosseumAnimation ? 'showing-colosseum-animation' : ''}`}
          style={{ 
            width: "100%", 
            height: "100vh", 
            position: "relative",
          }} 
        >
          <PyramidAnimation
            isVisible={showPyramidAnimation}
            isPlaying={isPlaying}
            currentTimePeriod={selectedPeriod?.id}
          />
          <ColosseumAnimation
            isVisible={showColosseumAnimation}
            isPlaying={isPlaying}
            currentTimePeriod={selectedColosseumPeriod?.id}
          />
        </div>
        
        {showVisualEffect && (
          <div className="time-travel-effect"></div>
        )}
        
        {/* Global time slider for filtering events by time period - show when:
            1. Not viewing a specific location timeline, OR
            2. In Egypt/Rome during prehistory period (where location-specific UI is hidden) */}
        {cesiumLoaded && !showLandingPage && (
          (!currentLocation || 
           (currentLocation === 'egypt' && currentGlobalPeriod?.id === 'prehistory') ||
           (currentLocation === 'rome' && currentGlobalPeriod?.id === 'prehistory')) && (
            <GlobalTimeSlider 
              timePeriods={GLOBAL_TIME_PERIODS}
              historicalEvents={HISTORICAL_EVENTS}
              onEventsFiltered={handleEventsFiltered}
              onTimePeriodChange={handleGlobalTimePeriodChange}
            />
          )
        )}
        
        {/* Only show the Egypt-specific UI components when in Egypt */}
        {currentLocation === "egypt" && !showLandingPage && currentGlobalPeriod.id !== 'prehistory' && (
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
        
        {/* Only show the Rome-specific UI components when in Rome */}
        {currentLocation === "rome" && !showLandingPage && currentGlobalPeriod.id !== 'prehistory' && (
          <>
            {/* Mini Timeline */}
            <MiniTimeline 
              periods={COLOSSEUM_TIME_PERIODS}
              currentPeriodIndex={currentColosseumPeriodIndex}
              onPeriodChange={handleColosseumTimePeriodChange}
              onInfoClick={(period) => {
                console.log("Showing description for:", period.title);
                
                // Toggle the description panel visibility if it's the same period
                if (showDescriptionPanel && selectedColosseumPeriod && selectedColosseumPeriod.id === period.id) {
                  setShowDescriptionPanel(false);
                } else {
                  // Show the panel with the selected period
                  setSelectedColosseumPeriod(period);
                  setShowDescriptionPanel(true);
                }
              }}
            />
            
            {/* Time Dial */}
            <TimeDial 
              periods={COLOSSEUM_TIME_PERIODS}
              currentPeriodIndex={currentColosseumPeriodIndex}
              onPeriodChange={handleColosseumTimePeriodChange}
            />
            
            {/* Era Transition Effect */}
            <EraTransition
              isVisible={showEraTransition}
              location={transitionData.location}
              year={transitionData.year}
              onTransitionComplete={() => {
                console.log("App received transition complete callback");
                // Check if we need to refresh the view after transition
                if (cesiumViewer.current && currentLocation === "rome") {
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
              period={selectedColosseumPeriod}
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