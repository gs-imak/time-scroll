// Global time periods that can be used for filtering events across the map
export const GLOBAL_TIME_PERIODS = [
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

// Historical events that appear on the map
export const HISTORICAL_EVENTS = [
  // Egypt events
  {
    id: 'great-pyramid-construction',
    title: 'Great Pyramid Construction',
    name: 'Great Pyramid Construction',
    year: -2560,
    period: 'ancient',
    locationId: 'egypt',
    latitude: 29.9792,
    longitude: 31.1342,
    emoji: '🏗️',
    description: 'Construction of the Great Pyramid of Giza, one of the Seven Wonders of the Ancient World. Built as a tomb for the Fourth Dynasty pharaoh Khufu.\n\nThe Great Pyramid stood at 146.5 meters tall, making it the tallest human-made structure in the world for more than 3,800 years.'
  },
  {
    id: 'tutankhamun-reign',
    title: 'Tutankhamun\'s Reign',
    name: 'Tutankhamun\'s Reign',
    year: -1332,
    period: 'ancient',
    locationId: 'egypt',
    latitude: 29.9775,
    longitude: 31.1330,
    emoji: '👑',
    description: 'The reign of Pharaoh Tutankhamun, who became famous due to the discovery of his nearly intact tomb in 1922.\n\nTutankhamun became pharaoh at age 9 and ruled until his death at around 19 years old. His tomb contained over 5,000 artifacts.'
  },
  {
    id: 'cleopatra-reign',
    title: 'Cleopatra\'s Reign',
    name: 'Cleopatra\'s Reign',
    year: -51,
    period: 'classical',
    locationId: 'egypt',
    latitude: 29.9760,
    longitude: 31.1356,
    emoji: '👸',
    description: 'Cleopatra VII Philopator became the last active ruler of the Ptolemaic Kingdom of Egypt.\n\nShe was known for her intelligence, political acumen, and relationships with Julius Caesar and Mark Antony. Her reign ended with her suicide in 30 BCE, after which Egypt became a province of the Roman Empire.'
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
  {
    id: 'nyc-founded',
    title: 'New York City Founded',
    name: 'New York City Founded',
    year: 1624,
    period: 'renaissance',
    locationId: 'newYork',
    latitude: 40.7135,
    longitude: -74.0040,
    emoji: '🗽',
    description: 'The Dutch West India Company founded a settlement called New Amsterdam on Manhattan Island.\n\nIn 1664, the English conquered the area and renamed it New York. The city would eventually grow to become one of the most important economic and cultural centers in the world.'
  },
  {
    id: 'empire-state',
    title: 'Empire State Building Completed',
    name: 'Empire State Building Completed',
    year: 1931,
    period: 'modern',
    locationId: 'newYork',
    latitude: 40.7484,
    longitude: -73.9857,
    emoji: '🏢',
    description: 'The Empire State Building was completed in just 410 days during the Great Depression.\n\nAt 1,454 feet, it was the world\'s tallest building for nearly 40 years until the completion of the World Trade Center\'s North Tower in 1970. It has been named one of the Seven Wonders of the Modern World.'
  }
]; 