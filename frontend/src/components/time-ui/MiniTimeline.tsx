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
  const timeoutRef = useRef<number | null>(null);

  // Calculate slider position from period index
  const getSliderValueFromPeriodIndex = (index: number): number => {
    return index / (periods.length - 1) * 100;
  };
  
  // Calculate period index from slider value
  const getPeriodIndexFromSliderValue = (value: number): number => {
    const rawIndex = (value / 100) * (periods.length - 1);
    return Math.round(rawIndex);
  };

  // Update tooltip position
  const updateTooltipPosition = () => {
    if (sliderRef.current && tooltipRef.current) {
      const slider = sliderRef.current;
      const tooltip = tooltipRef.current;
      
      // Calculate the thumb position based on slider value
      const percentage = sliderValue;
      const sliderWidth = slider.offsetWidth;
      const thumbPosition = (percentage / 100) * sliderWidth;
      
      // Center the tooltip over the thumb
      tooltip.style.left = `${thumbPosition}px`;
    }
  };

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setSliderValue(newValue);
    
    if (isDragging) {
      const newIndex = getPeriodIndexFromSliderValue(newValue);
      if (newIndex !== currentPeriodIndex) {
        onPeriodChange(newIndex);
      }
    }
    
    updateTooltipPosition();
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
    setSliderValue(getSliderValueFromPeriodIndex(currentPeriodIndex));
    resetFadeTimer();
  }, []);
  
  // Update slider value when current period changes externally
  useEffect(() => {
    setSliderValue(getSliderValueFromPeriodIndex(currentPeriodIndex));
    resetFadeTimer();
  }, [currentPeriodIndex]);
  
  // Update tooltip when slider value changes
  useEffect(() => {
    updateTooltipPosition();
  }, [sliderValue]);
  
  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={`mini-timeline win11-style ${isVisible ? 'visible' : 'faded'}`}
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
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
        transition: 'opacity 0.5s ease'
      }}
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
      <div className="win11-slider-container" style={{ marginTop: '16px' }}>
        <div className="win11-slider-wrapper">
          <div 
            className="win11-slider-tooltip" 
            ref={tooltipRef}
            style={{ opacity: showTooltip || isDragging ? 1 : 0 }}
          >
            {periods[currentPeriodIndex].title}
          </div>
          
          <div className="win11-slider-track">
            <div 
              className="win11-slider-track-active" 
              style={{ width: `${sliderValue}%` }}
            />
            <div 
              className="win11-slider-thumb" 
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