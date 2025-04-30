// Global time periods that can be used for filtering events across the map
export const GLOBAL_TIME_PERIODS = [
  {
    id: 'prehistory',
    start: -10000,
    end: -3000,
    label: 'Prehistory'
  },
  {
    id: 'ancient',
    start: -3000,
    end: -500,
    label: 'Ancient World'
  },
  {
    id: 'classical',
    start: -500,
    end: 500,
    label: 'Classical Antiquity'
  },
  {
    id: 'medieval',
    start: 500,
    end: 1500,
    label: 'Medieval Period'
  },
  {
    id: 'renaissance',
    start: 1500,
    end: 1800,
    label: 'Renaissance & Exploration'
  },
  {
    id: 'industrial',
    start: 1800,
    end: 1900,
    label: 'Industrial Age'
  },
  {
    id: 'modern',
    start: 1900,
    end: 2023,
    label: 'Modern Era'
  }
];

// Add here the Historical events that appear on the map
export const HISTORICAL_EVENTS = [
  // Egypt events
  {
    id: 'great-pyramid-construction',
    title: 'Great Pyramid Construction',
    name: 'Great Pyramid Construction',
    label: 'Construction of the Pyramids of Giza',
    constructionPeriod: {
      start: -2580, 
      end: -2560
    },
    year: -2560,
    period: 'ancient',
    locationId: 'egypt',
    latitude: 29.9792,
    longitude: 31.1342,
    emoji: '🏗️',
    description: 'Construction of the Great Pyramid of Giza, one of the Seven Wonders of the Ancient World. Built as a tomb for the Fourth Dynasty pharaoh Khufu.\n\nThe Great Pyramid stood at 146.5 meters tall, making it the tallest human-made structure in the world for more than 3,800 years.'
  },
  
  // Rome events
  {
    id: 'colosseum-construction',
    title: 'Colosseum Construction',
    name: 'Colosseum Construction',
    label: 'Construction of the Colosseum',
    constructionPeriod: {
      start: 72, 
      end: 80
    },
    year: 80,
    period: 'classical',
    locationId: 'rome',
    latitude: 41.8902,
    longitude: 12.4922,
    emoji: '🏟️',
    description: 'Construction of the Colosseum, also known as the Flavian Amphitheatre, the largest amphitheatre ever built. It was commissioned by Emperor Vespasian in 72 CE and completed by his son Titus in 80 CE.\n\nThe Colosseum could hold an estimated 50,000-80,000 spectators and was used for gladiatorial contests, public spectacles, animal hunts, executions, and dramas.'
  },
  
  // New York events
  {
    id: 'manhattan-purchase',
    title: 'Purchase of Manhattan',
    name: 'Purchase of Manhattan',
    year: 1626,
    period: 'renaissance',
    locationId: 'newYork',
    latitude: 40.7128,
    longitude: -74.0060,
    emoji: '🏙️',
    description: 'Peter Minuit, a Dutch colonist, purchased Manhattan Island from the Lenape Native Americans.\n\nThe transaction is often cited as being worth 60 guilders, or about $24, though this figure has been disputed. The purchase led to the establishment of New Amsterdam, which later became New York City.'
  },

  // Rome events
  {
    id: 'roman-forum-inauguration',
    title: 'Inauguration of the Roman Forum',
    name: 'Roman Forum Inauguration',
    label: 'Inauguration of the Roman Forum',
    year: -500,
    period: 'ancient',
    locationId: 'rome',
    latitude: 41.8925, // Rome, Italy
    longitude: 12.4853,
    emoji: '🏛️',
    description: 'The Roman Forum, the heart of ancient Rome, is inaugurated. It becomes the center of Roman public life for centuries, hosting triumphal processions, elections, public speeches, and commercial affairs.'
  },
]; 