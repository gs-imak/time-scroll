import React, { useState, useRef, useEffect } from 'react';

interface TimeDialProps {
  periods: Array<{
    id: string;
    year: string;
    title: string;
  }>;
  currentPeriodIndex: number;
  onPeriodChange: (index: number) => void;
}

export function TimeDial({ periods, currentPeriodIndex, onPeriodChange }: TimeDialProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const segmentAngle = 360 / periods.length;

  // Convert current period index to rotation angle
  useEffect(() => {
    setRotation(currentPeriodIndex * segmentAngle);
  }, [currentPeriodIndex, segmentAngle]);

  // Handle mouse movement for drag rotation
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dialRef.current) return;
    
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle based on mouse position relative to center
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const normalizedAngle = (angle + 90 + 360) % 360;
    
    // Find closest segment
    const closestSegmentIndex = Math.round(normalizedAngle / segmentAngle) % periods.length;
    
    // Only update if changed
    if (closestSegmentIndex !== currentPeriodIndex) {
      onPeriodChange(closestSegmentIndex);
    }
  };

  // Add and remove event listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', () => setIsDragging(false));
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', () => setIsDragging(false));
    };
  }, [isDragging, currentPeriodIndex]);

  return (
    <div className="time-dial" style={{ position: 'fixed', top: '48px', right: '48px', zIndex: 50 }}>
      {/* Outer ring */}
      <div 
        ref={dialRef}
        className="dial-outer"
        onMouseDown={() => setIsDragging(true)}
      >
        {/* Segment markers */}
        {periods.map((period, index) => {
          const angle = index * segmentAngle;
          const isActive = index === currentPeriodIndex;
          
          return (
            <div 
              key={period.id}
              className="dial-segment-marker"
              style={{
                transform: `rotate(${angle}deg) translateY(-70px)`,
                transformOrigin: 'center center',
                left: '50%',
                top: '50%',
              }}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
              onClick={() => onPeriodChange(index)}
            >
              <div 
                className={`dial-marker-line ${isActive ? 'active' : 'inactive'}`}
              />
            </div>
          );
        })}

        {/* Inner dial */}
        <div className="dial-inner">
          {/* Sci-fi dial elements */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="dial-gradient" 
              style={{
                background: `conic-gradient(
                  transparent 0deg,
                  rgba(56, 189, 248, 0.2) ${rotation}deg, 
                  rgba(14, 165, 233, 0.5) ${rotation + 5}deg, 
                  transparent ${rotation + 25}deg
                )`
              }}
            />
          </div>

          {/* Center content */}
          <div className="dial-content">
            <div className="dial-year">
              {periods[currentPeriodIndex].year}
            </div>
            <div className="dial-title">
              {periods[currentPeriodIndex].title}
            </div>
          </div>
        </div>

        {/* Pointer */}
        <div className="dial-pointer" />

        {/* Hover tooltip */}
        {hoverIndex !== null && hoverIndex !== currentPeriodIndex && (
          <div className="dial-tooltip">
            <div className="dial-tooltip-year">
              {periods[hoverIndex].year}
            </div>
            <div className="dial-tooltip-title">
              {periods[hoverIndex].title}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 