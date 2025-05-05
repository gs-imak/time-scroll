import React, { useState, useRef, useEffect } from 'react';

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
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  
  const sliderRef = useRef<HTMLInputElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const trackActiveRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  
  // Calculate slider position from period index (0-100)
  const getSliderValueFromPeriodIndex = (index: number): number => {
    if (periods.length <= 1) return 0;
    return (index / (periods.length - 1)) * 100;
  };
  
  // Calculate period index from slider value (0-100)
  const getPeriodIndexFromSliderValue = (value: number): number => {
    if (periods.length <= 1) return 0;
    const rawIndex = (value / 100) * (periods.length - 1);
    return Math.round(rawIndex);
  };

  // Update slider visuals based on current value
  const updateSliderVisuals = () => {
    if (trackActiveRef.current) {
      trackActiveRef.current.style.width = `${sliderValue}%`;
    }
    
    if (thumbRef.current) {
      thumbRef.current.style.left = `${sliderValue}%`;
    }
    
    // Also update tooltip position
    updateTooltipPosition();
  };

  // Update tooltip position
  const updateTooltipPosition = () => {
    if (sliderRef.current && tooltipRef.current && thumbRef.current) {
      const slider = sliderRef.current;
      const tooltip = tooltipRef.current;
      const sliderRect = slider.closest('.win11-slider-wrapper')?.getBoundingClientRect();
      
      if (sliderRect) {
        // Position tooltip based on slider value percentage
        const tooltipWidth = tooltip.offsetWidth;
        const totalWidth = sliderRect.width;
        const position = (sliderValue / 100) * totalWidth;
        
        // Constrain position to prevent going off-screen
        const minPosition = tooltipWidth / 2;
        const maxPosition = totalWidth - (tooltipWidth / 2);
        
        let constrainedPosition = position;
        if (position < minPosition) {
          constrainedPosition = minPosition;
        } else if (position > maxPosition) {
          constrainedPosition = maxPosition;
        }
        
        tooltip.style.left = `${constrainedPosition}px`;
      }
    }
  };

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setSliderValue(newValue);
    
    // Update visuals immediately
    setTimeout(() => updateSliderVisuals(), 0);
    
    if (isDragging) {
      const newIndex = getPeriodIndexFromSliderValue(newValue);
      if (newIndex !== currentPeriodIndex) {
        onPeriodChange(newIndex);
        console.log(`Timeline changed to period ${periods[newIndex].id} (index ${newIndex})`);
      }
    }
    
    resetFadeTimer();
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the timeline click
    if (onInfoClick) {
      onInfoClick(periods[currentPeriodIndex]);
    }
    resetFadeTimer();
  };
  
  // Reset the fade timer when user interacts with the component
  const resetFadeTimer = () => {
    // Show the component with full opacity
    setIsVisible(true);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a new timeout to fade out after 5 seconds
    timeoutRef.current = setTimeout(() => {
      if (!isDragging && !showTooltip) {
        setIsVisible(false);
      }
    }, 5000);
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

  // Initialize slider value
  useEffect(() => {
    const initialValue = getSliderValueFromPeriodIndex(currentPeriodIndex);
    setSliderValue(initialValue);
    
    // Schedule visual update after component has mounted
    setTimeout(() => updateSliderVisuals(), 10);
    
    resetFadeTimer();
  }, []);
  
  // Update slider value when current period changes externally
  useEffect(() => {
    const newValue = getSliderValueFromPeriodIndex(currentPeriodIndex);
    setSliderValue(newValue);
    
    // Schedule visual update to ensure it happens after state update
    setTimeout(() => updateSliderVisuals(), 10);
    
    resetFadeTimer();
  }, [currentPeriodIndex]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div 
      className={`mini-timeline win11-style ${isVisible ? 'visible' : 'faded'}`}
      onMouseEnter={() => {
        setShowTooltip(true);
        resetFadeTimer();
      }}
      onMouseLeave={() => {
        if (!isDragging) {
          setShowTooltip(false);
        }
      }}
    >
      {/* Info button */}
      <button 
        className="info-button timeline-info-button"
        onClick={handleInfoClick}
        title="View historical details about this time period"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      </button>
      
      {/* Current time period display */}
      <div className="timeline-period-info">
        <div className="timeline-period-year">
          {periods[currentPeriodIndex].year}
        </div>
        <div className="timeline-period-title">
          {periods[currentPeriodIndex].title}
        </div>
      </div>
      
      {/* Windows 11 style slider */}
      <div className="win11-slider-container mini-timeline-slider">
        <div className="win11-slider-wrapper">
          <div 
            className={`win11-slider-tooltip ${showTooltip || isDragging ? 'visible' : ''}`}
            ref={tooltipRef}
          >
            {periods[currentPeriodIndex].year}
          </div>
          
          <div className="win11-slider-track">
            <div 
              className="win11-slider-track-active"
              ref={trackActiveRef}
              style={{ width: `${sliderValue}%` }}
            />
            <div 
              className="win11-slider-thumb"
              ref={thumbRef}
              style={{ left: `${sliderValue}%` }}
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
    </div>
  );
} 