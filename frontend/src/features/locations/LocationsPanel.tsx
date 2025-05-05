import React, { useState } from 'react';

interface Location {
  id: string;
  name: string;
  emoji: string;
  category: string;
  period?: string;
}

interface LocationsPanelProps {
  locations: Location[];
  onSelectLocation: (locationId: string) => void;
  currentLocationId?: string;
}

export function LocationsPanel({ 
  locations, 
  onSelectLocation, 
  currentLocationId 
}: LocationsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(locations.map(loc => loc.category)))];

  // Filter locations based on search text and category
  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = activeCategory === 'all' || location.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`locations-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button 
        className="toggle-panel-button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? "Collapse locations panel" : "Expand locations panel"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isExpanded ? (
            // X icon when expanded
            <>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </>
          ) : (
            // Map icon when collapsed
            <>
              <circle cx="12" cy="10" r="3"></circle>
              <path d="M12 21l-5-10 5-10 5 10z"></path>
            </>
          )}
        </svg>
        <span>{isExpanded ? 'Close' : 'Locations'}</span>
      </button>

      {isExpanded && (
        <div className="panel-content">
          <div className="panel-header">
            <h3>Explore Locations</h3>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search locations..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category}
                className={`category-button ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          <div className="locations-list">
            {filteredLocations.length === 0 ? (
              <div className="no-results">No locations match your search</div>
            ) : (
              filteredLocations.map(location => (
                <button
                  key={location.id}
                  className={`location-button ${currentLocationId === location.id ? 'active' : ''}`}
                  onClick={() => onSelectLocation(location.id)}
                >
                  <span className="location-emoji">{location.emoji}</span>
                  <span className="location-name">{location.name}</span>
                  {location.period && (
                    <span className="location-period">{location.period}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 