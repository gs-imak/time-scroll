import React from 'react';

interface MapStyleToggleProps {
  isDayMode: boolean;
  onToggle: () => void;
}

export function MapStyleToggle({ isDayMode, onToggle }: MapStyleToggleProps) {
  return (
    <div className="map-style-toggle">
      <div className="toggle-label">
        {isDayMode ? '☀️' : '🌙'}
      </div>
      <label className="toggle-switch">
        <input 
          type="checkbox"
          checked={isDayMode}
          onChange={onToggle}
          aria-label="Toggle map between day and night mode"
        />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
} 