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
  const [isSliderVisible, setIsSliderVisible] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  
  // Component refs
  const sliderRef = useRef<HTMLInputElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const periodYearsRef = useRef<HTMLDivElement>(null);
  const periodLabelRef = useRef<HTMLDivElement>(null);
  
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

  // Calculate slider position from period index
  const getSliderValueFromPeriodIndex = (index: number): number => {
    return index / (timePeriods.length - 1) * 100;
  };
  
  // Calculate period index from slider value
  const getPeriodIndexFromSliderValue = (value: number): number => {
    const rawIndex = (value / 100) * (timePeriods.length - 1);
    return Math.round(rawIndex);
  };

  // Update tooltip position and thumb position
  const updateTooltipPosition = () => {
    if (sliderRef.current && tooltipRef.current) {
      const slider = sliderRef.current;
      const thumb = slider.closest('.win11-slider-track')?.querySelector('.win11-slider-thumb');
      const tooltip = tooltipRef.current;
      
      if (thumb) {
        // Use the thumb's position directly
        const thumbRect = thumb.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const sliderRect = slider.getBoundingClientRect();
        
        // Position tooltip above thumb
        const thumbCenterX = thumbRect.left + thumbRect.width / 2 - sliderRect.left;
        
        // Get tooltip width for positioning constraints
        const tooltipWidth = tooltipRect.width;
        const minPosition = tooltipWidth / 2; // Don't let left edge go below this
        const maxPosition = sliderRect.width - (tooltipWidth / 2); // Don't let right edge exceed this
        
        // Constrain tooltip position to prevent it from going off-screen
        let constrainedPosition = thumbCenterX;
        if (thumbCenterX < minPosition) {
          constrainedPosition = minPosition;
        } else if (thumbCenterX > maxPosition) {
          constrainedPosition = maxPosition;
        }
        
        // Center the tooltip over the thumb, with constraints
        tooltip.style.left = `${constrainedPosition}px`;
      }
    }
  };

  // Handle direct slider input
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setSliderValue(newValue);
    
    // Only update the period index if we're dragging
    // This prevents jumps when just hovering over the slider
    if (isDragging) {
      const newIndex = getPeriodIndexFromSliderValue(newValue);
      if (newIndex !== selectedPeriodIndex) {
        setSelectedPeriodIndex(newIndex);
      }
    }
    
    updateTooltipPosition();
  };

  // Mouse/touch event handlers for smoother dragging
  const handleMouseDown = () => {
    setIsDragging(true);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Simplified time travel animation
  const animateTimeTravel = (toIndex: number) => {
    setIsAnimating(true);
    
    // Create a simple timeline
    const timeline = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
        
        // Set a timer to hide the slider after a period of inactivity
        setTimeout(() => {
          if (!isDragging && !showTooltip) {
            const fadeTimeline = gsap.timeline();
            fadeTimeline.to('.global-time-slider', {
              opacity: 0.4,
              duration: 0.8,
              ease: "power2.out"
            });
          }
        }, 5000); // Hide after 5 seconds of inactivity
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
      setSliderValue(getSliderValueFromPeriodIndex(toIndex));
    });
    
    // Fade in new content
    timeline.to([periodYearsRef.current, periodLabelRef.current], {
      opacity: 1,
      y: 0,
      duration: 0.3,
      ease: "power1.out"
    });
    
    // Add a shimmer effect to the slider track
    timeline.fromTo('.win11-slider-track-active', {
      backgroundImage: 'linear-gradient(90deg, rgba(56, 189, 248, 0.7), rgba(96, 239, 255, 0.9), rgba(56, 189, 248, 0.7))',
      backgroundSize: '200% 100%',
      backgroundPosition: '0% 50%'
    }, {
      backgroundPosition: '100% 50%',
      duration: 1.2,
      ease: "power1.inOut"
    }, "-=0.3");
    
    return timeline;
  };

  // Update events and progress when selected period changes
  useEffect(() => {
    const filteredEvents = getVisibleEvents();
    if (onEventsFiltered) {
      onEventsFiltered(filteredEvents);
    }
    if (onTimePeriodChange) {
      onTimePeriodChange(timePeriods[selectedPeriodIndex]);
    }
  }, [selectedPeriodIndex, onEventsFiltered, onTimePeriodChange]);

  // Initialize slider value
  useEffect(() => {
    setSliderValue(getSliderValueFromPeriodIndex(selectedPeriodIndex));
  }, []);
  
  // Show full opacity when interacting with slider
  useEffect(() => {
    if (isDragging || showTooltip) {
      gsap.to('.global-time-slider', {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }, [isDragging, showTooltip]);
  
  // Update tooltip position when period index changes
  useEffect(() => {
    updateTooltipPosition();
  }, [selectedPeriodIndex, sliderValue]);

  // Update slider value and CSS variables
  useEffect(() => {
    if (sliderRef.current) {
      // Find the track and thumb elements
      const track = sliderRef.current.closest('.win11-slider-track');
      if (track) {
        const trackActive = track.querySelector('.win11-slider-track-active') as HTMLElement;
        const thumb = track.querySelector('.win11-slider-thumb') as HTMLElement;
        
        if (trackActive) {
          trackActive.style.width = `${sliderValue}%`;
        }
        
        if (thumb) {
          thumb.style.left = `${sliderValue}%`;
        }
      }
    }
    
    updateTooltipPosition();
  }, [sliderValue]);

  // Handle direct period change with animation
  const handlePeriodChange = (newIndex: number) => {
    if (isAnimating || newIndex === selectedPeriodIndex) return;
    animateTimeTravel(newIndex);
  };

  const filteredEvents = getVisibleEvents();

  return (
    <div 
      className={`global-time-slider win11-style ${isAnimating ? 'animating' : ''}`}
      onMouseEnter={() => {
        setShowTooltip(true);
        gsap.to('.global-time-slider', {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      }}
      onMouseLeave={() => {
        if (!isDragging) {
          setShowTooltip(false);
        }
      }}
    >
      <div className="time-slider-content">
        <div className="time-period-display">
          <div ref={periodYearsRef} className="time-period-years">
            {formatYear(timePeriods[selectedPeriodIndex].start)} - {formatYear(timePeriods[selectedPeriodIndex].end)}
          </div>
          <div ref={periodLabelRef} className="time-period-label">
            {timePeriods[selectedPeriodIndex].label}
          </div>
        </div>

        <div className="win11-slider-container">
          <div className="win11-slider-wrapper">
            <div 
              className={`win11-slider-tooltip ${showTooltip || isDragging ? 'visible' : ''}`}
              ref={tooltipRef}
            >
              {formatYear(timePeriods[selectedPeriodIndex].start)} - {formatYear(timePeriods[selectedPeriodIndex].end)}
            </div>
            
            <div className="win11-slider-track">
              <div 
                className="win11-slider-track-active" 
                data-value={sliderValue}
              />
              <div 
                className="win11-slider-thumb" 
                data-position={sliderValue}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                ref={sliderRef}
                className="win11-slider-input"
                onChange={handleSliderChange}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              />
            </div>
          </div>
        </div>

        <div className="visible-events-info">
          Showing <span className="event-count"><span>{filteredEvents.length}</span></span> historical events from this time period
        </div>
      </div>
    </div>
  );
}; 