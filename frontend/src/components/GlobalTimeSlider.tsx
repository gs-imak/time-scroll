import React, { useState, useEffect } from 'react';

interface TimePeriod {
  id: string;
  label: string; 
  yearStart: number;
  yearEnd: number;
}

interface HistoricalEvent {
  id: string;
  name: string;
  year: number;
  locationId: string;
  latitude: number;
  longitude: number;
  description: string;
  emoji: string;
}

interface GlobalTimeSliderProps {
  timePeriods: TimePeriod[];
  events: HistoricalEvent[];
  onEventsFiltered: (events: HistoricalEvent[]) => void;
  onTimePeriodChange?: (periodId: string) => void;
}

export function GlobalTimeSlider({
  timePeriods,
  events,
  onEventsFiltered,
  onTimePeriodChange
}: GlobalTimeSliderProps) {
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const filteredEvents = events.filter(event => {
    const selectedPeriod = timePeriods[selectedPeriodIndex];
    return event.year >= selectedPeriod.yearStart && event.year <= selectedPeriod.yearEnd;
  });
  
  useEffect(() => {
    onEventsFiltered(filteredEvents);
    if (onTimePeriodChange) {
      onTimePeriodChange(timePeriods[selectedPeriodIndex].id);
    }
  }, [selectedPeriodIndex, events]);

  const handlePeriodChange = (index: number) => {
    setSelectedPeriodIndex(index);
  };

  const handleNextPeriod = () => {
    if (selectedPeriodIndex < timePeriods.length - 1) {
      setSelectedPeriodIndex(selectedPeriodIndex + 1);
    }
  };

  const handlePreviousPeriod = () => {
    if (selectedPeriodIndex > 0) {
      setSelectedPeriodIndex(selectedPeriodIndex - 1);
    }
  };

  return (
    <div className={`global-time-slider ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button
        className="time-slider-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? "Collapse time slider" : "Expand time slider"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>{isExpanded ? 'Hide Timeline' : 'Show Timeline'}</span>
      </button>

      {isExpanded && (
        <div className="time-slider-content">
          <div className="time-period-display">
            <h3>TIME PERIOD</h3>
            <div className="time-period-info">
              <div className="time-period-years">
                {timePeriods[selectedPeriodIndex].yearStart < 0 
                  ? Math.abs(timePeriods[selectedPeriodIndex].yearStart) + ' BCE' 
                  : timePeriods[selectedPeriodIndex].yearStart + ' CE'} 
                — 
                {timePeriods[selectedPeriodIndex].yearEnd < 0 
                  ? Math.abs(timePeriods[selectedPeriodIndex].yearEnd) + ' BCE' 
                  : timePeriods[selectedPeriodIndex].yearEnd + ' CE'}
              </div>
              <div className="time-period-label">{timePeriods[selectedPeriodIndex].label}</div>
            </div>
          </div>

          <div className="time-slider-controls">
            <button 
              className="time-slider-button prev"
              onClick={handlePreviousPeriod}
              disabled={selectedPeriodIndex === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Earlier</span>
            </button>

            <div className="time-slider-track">
              <div 
                className="time-slider-progress"
                style={{width: `${(selectedPeriodIndex / (timePeriods.length - 1)) * 100}%`}}
              ></div>
              {timePeriods.map((period, index) => (
                <div 
                  key={period.id}
                  className="time-marker-container" 
                  style={{left: `${(index / (timePeriods.length - 1)) * 100}%`}}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <button
                    className={`time-slider-marker ${index === selectedPeriodIndex ? 'active' : ''}`}
                    onClick={() => handlePeriodChange(index)}
                    title={period.label}
                  ></button>
                  {(hoveredIndex === index || index === selectedPeriodIndex) && (
                    <div className="time-marker-label">
                      <span>{period.yearStart < 0 ? Math.abs(period.yearStart) + ' BCE' : period.yearStart + ' CE'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button 
              className="time-slider-button next"
              onClick={handleNextPeriod}
              disabled={selectedPeriodIndex === timePeriods.length - 1}
            >
              <span>Later</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="visible-events-info">
            <div className="event-count">
              <span>{filteredEvents.length}</span> events visible from this period
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 