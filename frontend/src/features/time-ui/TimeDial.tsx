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
} 