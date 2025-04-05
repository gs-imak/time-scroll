import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export interface TimePeriod {
  id?: string;
  start: number;
  end: number;
  label: string;
}

export interface HistoricalEvent {
  id: string;
  title: string;
  name?: string;
  year: number;
  period: string;
  description?: string;
  locationId?: string;
  latitude?: number;
  longitude?: number;
  emoji?: string;
}

interface GlobalTimeSliderProps {
  timePeriods: TimePeriod[];
  historicalEvents: HistoricalEvent[];
  onTimePeriodChange: (period: TimePeriod) => void;
  onEventsFiltered: (events: HistoricalEvent[]) => void;
}

export const GlobalTimeSlider: React.FC<GlobalTimeSliderProps> = ({
  timePeriods,
  historicalEvents,
  onTimePeriodChange,
  onEventsFiltered,
}) => {
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [activeMarkerIndex, setActiveMarkerIndex] = useState<number | null>(null);

  // Component refs
  const progressRef = useRef<HTMLDivElement>(null);
  const periodYearsRef = useRef<HTMLDivElement>(null);
  const periodLabelRef = useRef<HTMLDivElement>(null);
  
  // Track current progress percentage for animation purposes
  const progressPercentage = selectedPeriodIndex / (timePeriods.length - 1) * 100;
  
  // Format year with BCE/CE notation
  const formatYear = (year: number): string => {
    if (year === 0) return "0";
    if (year < 0) return `${Math.abs(year)} BCE`;
    return `${year} CE`;
  };

  // Get visible events for the current time period
  const getVisibleEvents = () => {
    const currentPeriod = timePeriods[selectedPeriodIndex];
    return historicalEvents.filter(
      (event) => event.year >= currentPeriod.start && event.year <= currentPeriod.end
    );
  };

  // Handle marker hover
  const handleMarkerHover = (index: number) => {
    setActiveMarkerIndex(index);
  };

  const handleMarkerLeave = () => {
    setActiveMarkerIndex(null);
  };

  // Filter events whenever selected period changes
  useEffect(() => {
    const filteredEvents = getVisibleEvents();
    if (onEventsFiltered) {
      onEventsFiltered(filteredEvents);
    }
    if (onTimePeriodChange) {
      onTimePeriodChange(timePeriods[selectedPeriodIndex]);
    }
    
    // Update the progress bar width
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        width: `${progressPercentage}%`,
        duration: 0.4,
        ease: "power1.out"
      });
    }
  }, [selectedPeriodIndex, onEventsFiltered, onTimePeriodChange]);

  // Simplified time travel animation
  const animateTimeTravel = (fromIndex: number, toIndex: number) => {
    setIsAnimating(true);
    
    // Create a simple timeline
    const timeline = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
      }
    });
    
    // Fade out current content
    timeline.to([periodYearsRef.current, periodLabelRef.current], {
      opacity: 0,
      y: -5,
      duration: 0.2,
      ease: "power1.in"
    });
    
    // Update the selected period
    timeline.call(() => {
      setSelectedPeriodIndex(toIndex);
    });
    
    // Fade in new content
    timeline.to([periodYearsRef.current, periodLabelRef.current], {
      opacity: 1,
      y: 0,
      duration: 0.3,
      ease: "power1.out"
    });
    
    return timeline;
  };

  // Handle period change with animation
  const handlePeriodChange = (newIndex: number) => {
    if (isAnimating || newIndex === selectedPeriodIndex) return;
    
    // Create and play the time travel animation
    animateTimeTravel(selectedPeriodIndex, newIndex);
  };

  const handleNextPeriod = () => {
    if (selectedPeriodIndex < timePeriods.length - 1 && !isAnimating) {
      handlePeriodChange(selectedPeriodIndex + 1);
    }
  };

  const handlePreviousPeriod = () => {
    if (selectedPeriodIndex > 0 && !isAnimating) {
      handlePeriodChange(selectedPeriodIndex - 1);
    }
  };

  const filteredEvents = getVisibleEvents();

  return (
    <div 
      className={`global-time-slider ${isAnimating ? 'animating' : ''}`}
    >
      <div className="time-slider-content">
        <div className="time-period-display">
          <h3>Time Period</h3>
          <div className="time-period-info">
            <div ref={periodYearsRef} className="time-period-years">
              {formatYear(timePeriods[selectedPeriodIndex].start)} - {formatYear(timePeriods[selectedPeriodIndex].end)}
            </div>
            <div ref={periodLabelRef} className="time-period-label">
              {timePeriods[selectedPeriodIndex].label}
            </div>
          </div>
        </div>

        <div className="time-slider-controls">
          <button 
            className="time-slider-button prev" 
            onClick={handlePreviousPeriod}
            disabled={selectedPeriodIndex === 0 || isAnimating}
          >
            Previous
          </button>
          
          <div className="time-slider-track">
            <div 
              ref={progressRef}
              className="time-slider-progress" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
            
            {timePeriods.map((period, index) => {
              const position = index / (timePeriods.length - 1) * 100;
              const isActive = index === selectedPeriodIndex;
              const isHovered = activeMarkerIndex === index;
              
              return (
                <div 
                  key={index}
                  className="time-marker-container"
                  style={{ left: `${position}%` }}
                  onMouseEnter={() => handleMarkerHover(index)}
                  onMouseLeave={handleMarkerLeave}
                  onClick={() => handlePeriodChange(index)}
                >
                  <div 
                    className={`time-slider-marker ${isActive ? 'active' : ''}`}
                  ></div>
                  <div className={`time-marker-label ${isActive || isHovered ? 'visible' : ''}`}>
                    {period.label}
                  </div>
                </div>
              );
            })}
          </div>
          
          <button 
            className="time-slider-button next" 
            onClick={handleNextPeriod}
            disabled={selectedPeriodIndex === timePeriods.length - 1 || isAnimating}
          >
            Next
          </button>
        </div>

        <div className="visible-events-info">
          Showing <span className="event-count"><span>{filteredEvents.length}</span></span> historical events from this time period
        </div>
      </div>
    </div>
  );
}; 