import React, { useEffect, useRef, useState } from 'react';
import { useRive } from '@rive-app/react-canvas';
import { PyramidInfoPopup } from './PyramidInfoPopup';

interface PyramidAnimationProps {
  isVisible: boolean;
  isPlaying: boolean;
}

export function PyramidAnimation({ isVisible, isPlaying }: PyramidAnimationProps) {
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const { RiveComponent, rive } = useRive({
    src: '/assets/rive/pyramid_building.riv',
    autoplay: false,
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isVisible || !window.Cesium) return;
    
    // Only proceed if we have both the container and the Cesium viewer
    if (!containerRef.current) return;
    
    const viewer = (window as any)._pyramidCesiumViewer;
    if (!viewer) {
      console.error("Cesium viewer not found");
      return;
    }
    
    // The precise geo coordinates of the Pyramids of Giza
    const pyramidPosition = window.Cesium.Cartesian3.fromDegrees(
      31.1342, // longitude
      29.9792, // latitude
      10      // height
    );
    
    // The scratch object for reuse in the position calculations
    const scratchPosition = new window.Cesium.Cartesian2();
    
    // Update the position of the animation on each pre-render
    const preRenderListener = viewer.scene.preRender.addEventListener(() => {
      // Convert the world position to window coordinates
      const position = window.Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        viewer.scene,
        pyramidPosition,
        scratchPosition
      );
      
      // If we have a valid screen position, update the animation's position
      if (position && containerRef.current) {
        containerRef.current.style.left = `${position.x - 150}px`;
        containerRef.current.style.top = `${position.y - 150}px`;
        containerRef.current.style.display = 'block';
      } else if (containerRef.current) {
        // Hide the animation if position is invalid (off screen)
        containerRef.current.style.display = 'none';
      }
    });
    
    // Clean up the event listener when the component unmounts or visibility changes
    return () => {
      preRenderListener();
    };
  }, [isVisible]);

  // Control animation playback based on isPlaying prop
  useEffect(() => {
    if (rive) {
      if (isPlaying) {
        rive.play();
      } else {
        rive.pause();
      }
    }
  }, [isPlaying, rive]);
  
  const handleAnimationClick = () => {
    setShowPopup(true);
  };
  
  const handleClosePopup = () => {
    setShowPopup(false);
  };
  
  if (!isVisible) return null;
  
  return (
    <>
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          pointerEvents: 'auto', // Changed from 'none' to make it clickable
          zIndex: 1000,
          display: 'none', // Initially hidden until positioned
          cursor: 'pointer', // Show pointer cursor on hover
        }}
        onClick={handleAnimationClick}
      >
        <RiveComponent />
      </div>
      
      {showPopup && (
        <PyramidInfoPopup onClose={handleClosePopup} />
      )}
    </>
  );
} 