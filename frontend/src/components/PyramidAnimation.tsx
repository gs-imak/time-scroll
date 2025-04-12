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
    autoplay: true,
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isVisible || !containerRef.current) return;
    
    containerRef.current.style.display = 'block';
    
    if (!window.Cesium) {
      containerRef.current.style.left = '50%';
      containerRef.current.style.top = '50%';
      containerRef.current.style.transform = 'translate(-50%, -50%)';
      return;
    }
    
    const viewer = (window as any)._pyramidCesiumViewer;
    if (!viewer) {
      console.error("Cesium viewer not found");
      containerRef.current.style.left = '50%';
      containerRef.current.style.top = '50%';
      containerRef.current.style.transform = 'translate(-50%, -50%)';
      return;
    }
    
    const pyramidPosition = window.Cesium.Cartesian3.fromDegrees(
      31.1342,
      29.9792,
      10
    );
    
    const scratchPosition = new window.Cesium.Cartesian2();
    
    const preRenderListener = viewer.scene.preRender.addEventListener(() => {
      const position = window.Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        viewer.scene,
        pyramidPosition,
        scratchPosition
      );
      
      if (position && containerRef.current) {
        containerRef.current.style.left = `${position.x - 150}px`;
        containerRef.current.style.top = `${position.y - 150}px`;
        containerRef.current.style.display = 'block';
        containerRef.current.style.transform = 'none';
      } else if (containerRef.current) {
        containerRef.current.style.left = '50%';
        containerRef.current.style.top = '50%';
        containerRef.current.style.transform = 'translate(-50%, -50%)';
        containerRef.current.style.display = 'block';
      }
    });
    
    return () => {
      preRenderListener();
    };
  }, [isVisible]);

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
          pointerEvents: 'auto',
          zIndex: 1000,
          display: 'block',
          cursor: 'pointer',
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