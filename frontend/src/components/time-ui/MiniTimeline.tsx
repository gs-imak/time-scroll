import React, { useState } from 'react';

interface TimelinePeriod {
  id: string;
  year: string;
  title: string;
  description: string;
  imageUrl: any; // Make this optional or any to match PYRAMID_TIME_PERIODS
}

interface MiniTimelineProps {
  periods: TimelinePeriod[];
  currentPeriodIndex: number;
  onPeriodChange: (index: number) => void;
  onInfoClick?: (period: TimelinePeriod) => void;
}

export function MiniTimeline({ 
  periods, 
  currentPeriodIndex, 
  onPeriodChange,
  onInfoClick
}: MiniTimelineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calculate positions for markers with padding to keep them inside the container
  const getMarkerPosition = (index: number) => {
    const totalMarkers = periods.length;
    // Add padding on both ends (5% on each side)
    return `${5 + (index / (totalMarkers - 1)) * 90}%`;
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the timeline click
    if (onInfoClick) {
      onInfoClick(periods[currentPeriodIndex]);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        width: '80%',
        maxWidth: '48rem',
        padding: '16px 32px 16px 32px',
        borderRadius: '16px',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Info button - repositioned to be more visible */}
      <button 
        className="info-button"
        onClick={handleInfoClick}
        title="View historical details about this time period"
        style={{
          right: '-45px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 999 // Ensure it's above all other elements
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      </button>
      
      {/* Timeline Track */}
      <div className="timeline-track" style={{ 
        marginTop: '26px', 
        marginBottom: '26px',
        position: 'relative',
        width: '100%'
      }}>
        {/* Active segment - adjusted to match new positioning */}
        <div 
          className="timeline-active-segment"
          style={{ 
            width: `${5 + (currentPeriodIndex / (periods.length - 1)) * 90}%` 
          }}
        />

        {/* Time markers */}
        {periods.map((period, index) => (
          <button
            key={period.id}
            onClick={() => onPeriodChange(index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="timeline-marker"
            style={{ 
              left: getMarkerPosition(index),
              top: '0px'
            }}
          >
            <div className="flex flex-col items-center justify-center">
              {/* Timeline dot removed */}
              
              <div 
                className="timeline-marker-year"
                style={{
                  opacity: hoveredIndex === index || currentPeriodIndex === index ? 1 : 0.6,
                  transform: hoveredIndex === index ? 'scale(1.1)' : 'scale(1)',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  marginTop: '0'
                }}
              >
                {period.year}
              </div>
              
              {(hoveredIndex === index || currentPeriodIndex === index) && (
                <div className="timeline-tooltip">
                  <span className="text-white text-xs">{period.title}</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Current time period display */}
      <div className="timeline-period-info">
        <div className="timeline-period-year">
          {periods[currentPeriodIndex].year}
        </div>
        <div className="timeline-period-title">
          {periods[currentPeriodIndex].title}
        </div>
      </div>
    </div>
  );
} 