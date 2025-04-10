import React, { useEffect, useRef } from 'react';
import { useRive } from '@rive-app/react-canvas';

interface PyramidAnimationProps {
  isVisible: boolean;
  position: {
    x: number;
    y: number;
  };
}

export function PyramidAnimation({ isVisible, position }: PyramidAnimationProps) {
  const { RiveComponent } = useRive({
    src: '/assets/rive/pyramid_building.riv',
    autoplay: true,
  });
  
  const animRef = useRef<HTMLDivElement>(null);

  // Use an effect to apply position changes smoothly
  useEffect(() => {
    if (animRef.current && isVisible) {
      animRef.current.style.transition = 'left 0.1s, top 0.1s';
      animRef.current.style.left = `${position.x}px`;
      animRef.current.style.top = `${position.y}px`;
    }
  }, [position, isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={animRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: '300px',
        height: '300px',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      <RiveComponent />
    </div>
  );
} 