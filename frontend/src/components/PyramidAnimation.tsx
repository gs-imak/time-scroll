import React from 'react';
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

  if (!isVisible) return null;

  return (
    <div
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