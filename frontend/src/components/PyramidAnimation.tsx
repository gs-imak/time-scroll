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
  const [hasTransitioned, setHasTransitioned] = useState<boolean>(false);
  
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
    
    // Add zoom transition class when first appearing
    if (!hasTransitioned) {
      containerRef.current.classList.add('zoom-transition');
      
      // Remove class after animation completes
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.classList.remove('zoom-transition');
          setHasTransitioned(true);
        }
      }, 800);
    }

    // Find the cesium container parent and add the showing-pyramid-animation class
    const cesiumContainer = document.querySelector('.cesium-container');
    if (cesiumContainer) {
      cesiumContainer.classList.add('showing-pyramid-animation');
      
      // Also add pyramid-animation-visible class to body for global selector effects
      document.body.classList.add('pyramid-animation-visible');
    }
    
    // Directly hide the Egypt pin if it exists
    if (window.Cesium && (window as any)._pyramidCesiumViewer) {
      const viewer = (window as any)._pyramidCesiumViewer;
      const egyptPin = viewer.entities.getById('location_pin_egypt');
      if (egyptPin) {
        egyptPin.show = false;
      }
    }
    
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
      
      // Remove the showing-pyramid-animation class when component unmounts or becomes invisible
      const cesiumContainer = document.querySelector('.cesium-container');
      if (cesiumContainer) {
        cesiumContainer.classList.remove('showing-pyramid-animation');
      }
      
      // Remove the pyramid-animation-visible class from body
      document.body.classList.remove('pyramid-animation-visible');
    };
  }, [isVisible, hasTransitioned]);

  // When the component unmounts entirely or visibility changes to false, clean up classes
  useEffect(() => {
    if (!isVisible) {
      const cesiumContainer = document.querySelector('.cesium-container');
      if (cesiumContainer) {
        cesiumContainer.classList.remove('showing-pyramid-animation');
      }
      document.body.classList.remove('pyramid-animation-visible');
    }
  }, [isVisible]);

  // Add reset effect when visibility changes from false to true
  useEffect(() => {
    if (isVisible) {
      // If animation becomes visible again, reset transition state
      // so it will animate in again next time
      if (!hasTransitioned) {
        // Already false, nothing to do
      } else {
        setHasTransitioned(false);
      }
    }
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