import React, { useEffect, useRef, useState } from 'react';
import { useRive } from '@rive-app/react-canvas';
import { PyramidInfoPopup } from './PyramidInfoPopup';

interface PyramidAnimationProps {
  isVisible: boolean;
  isPlaying: boolean;
  currentTimePeriod?: string;
}

export function PyramidAnimation({ isVisible, isPlaying, currentTimePeriod }: PyramidAnimationProps) {
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [animationFile, setAnimationFile] = useState<string>('/assets/rive/pyramid_building.riv');
  const [labelText, setLabelText] = useState<string>("Construction of the Pyramids of Giza");
  
  useEffect(() => {
    const isPresentDay = currentTimePeriod === 'modern-era';
    const isConstructionCompleted = currentTimePeriod === 'construction-complete' || 
                                   currentTimePeriod === 'middle-kingdom' || 
                                   currentTimePeriod === 'modern-era';
    
    console.log(`Current time period: ${currentTimePeriod}, isPresentDay: ${isPresentDay}`);
    
    // Set the animation file based on the time period
    if (isPresentDay) {
      console.log('Switching to pyramid_finished animation');
      setAnimationFile('/assets/rive/pyramid_finished.riv');
    } else {
      console.log('Switching to pyramid_building animation');
      setAnimationFile('/assets/rive/pyramid_building.riv');
    }
    
    // Set the label text based on the construction phase
    if (isConstructionCompleted) {
      setLabelText("Pyramids of Giza");
    } else {
      setLabelText("Construction of the Pyramids of Giza");
    }
  }, [currentTimePeriod]);
  
  const { RiveComponent, rive } = useRive({
    src: animationFile,
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
        containerRef.current.style.left = `${position.x - 160}px`;
        containerRef.current.style.top = `${position.y - 180}px`;
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
        className="pyramid-animation-container"
        onClick={handleAnimationClick}
      >
        <div className="pyramid-animation-wrapper">
          <RiveComponent key={animationFile} />
        </div>
        <div className="pyramid-label">
          {labelText}
        </div>
      </div>
      
      {showPopup && (
        <PyramidInfoPopup onClose={handleClosePopup} />
      )}
    </>
  );
} 