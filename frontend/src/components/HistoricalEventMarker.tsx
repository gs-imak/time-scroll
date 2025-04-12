import React from 'react';

interface HistoricalEventMarkerProps {
  name: string;
  year: number;
  emoji: string;
  description?: string;
  onClick?: () => void;
  label?: string;
}

export function HistoricalEventMarker({
  name,
  year,
  emoji,
  description,
  onClick,
  label
}: HistoricalEventMarkerProps) {
  const displayLabel = label || name;
  
  return (
    <div className="event-marker-wrapper">
      <button 
        className="event-marker"
        onClick={onClick}
        title={`${displayLabel} (${year < 0 ? Math.abs(year) + ' BCE' : year + ' CE'})`}
      >
        <span className="event-emoji">{emoji}</span>
        <div className="event-pulse"></div>
      </button>
      <div className="event-label">
        <span className="event-name">{displayLabel}</span>
        <span className="event-year">{year < 0 ? Math.abs(year) + ' BCE' : year + ' CE'}</span>
      </div>
    </div>
  );
} 