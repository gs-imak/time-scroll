import React from 'react';

interface HistoricalEventMarkerProps {
  name: string;
  year: number;
  emoji: string;
  description?: string;
  onClick?: () => void;
}

export function HistoricalEventMarker({
  name,
  year,
  emoji,
  description,
  onClick
}: HistoricalEventMarkerProps) {
  return (
    <div className="event-marker-wrapper">
      <button 
        className="event-marker"
        onClick={onClick}
        title={`${name} (${year < 0 ? Math.abs(year) + ' BCE' : year + ' CE'})`}
      >
        <span className="event-emoji">{emoji}</span>
        <div className="event-pulse"></div>
      </button>
      <div className="event-label">
        <span className="event-name">{name}</span>
        <span className="event-year">{year < 0 ? Math.abs(year) + ' BCE' : year + ' CE'}</span>
      </div>
    </div>
  );
} 