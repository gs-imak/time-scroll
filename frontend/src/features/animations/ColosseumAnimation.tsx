import React, { useEffect, useRef, useState } from 'react';
import { useRive } from '@rive-app/react-canvas';
import { ColosseumInfoPopup } from './ColosseumInfoPopup';

interface ColosseumAnimationProps {
  isVisible: boolean;
  isPlaying: boolean;
  currentTimePeriod?: string;
}

export function ColosseumAnimation({ isVisible, isPlaying, currentTimePeriod }: ColosseumAnimationProps) {
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [animationFile, setAnimationFile] = useState<string>('/assets/rive/colosseum.riv');
  const [labelText, setLabelText] = useState<string>("Planning of the Colosseum");
  const [hasTransitioned, setHasTransitioned] = useState<boolean>(false);
  
  useEffect(() => {
    const isPresentDay = currentTimePeriod === 'modern-era';
    const isInaugurationOrLater = currentTimePeriod === 'inauguration' || currentTimePeriod === 'modern-era';
    const isMidConstructionOrLater = currentTimePeriod === 'construction-mid' || 
                                   currentTimePeriod === 'inauguration' || 
                                   currentTimePeriod === 'modern-era';
    
    console.log(`Current Colosseum time period: ${currentTimePeriod}, isInaugurationOrLater: ${isInaugurationOrLater}`);
    
    // Set the label text based on the construction phase
    if (isPresentDay) {
      setLabelText("Colosseum of Rome");
    } else if (isInaugurationOrLater) {
      setLabelText("Inauguration of the Colosseum");
    } else if (isMidConstructionOrLater) {
      setLabelText("Construction of the Colosseum");
    } else if (currentTimePeriod === 'construction-begin') {
      setLabelText("Construction Begins on the Colosseum");
    } else {
      setLabelText("Planning of the Colosseum");
    }
  }, [currentTimePeriod]);
  
  const { RiveComponent, rive } = useRive({
    src: animationFile,
    autoplay: isPlaying,
    stateMachines: "Timeline",
  });
  
  // Update the Rive animation state based on the time period
  useEffect(() => {
    if (!rive || !currentTimePeriod) return;
    
    // Give the Rive instance time to initialize
    setTimeout(() => {
      try {
        if (rive.stateMachineInputs) {
          // Get the state machine and find the input
          const inputs = rive.stateMachineInputs("Timeline");
          const timelineInput = inputs && inputs.find((input: any) => input.name === "TimelineTrigger");
          
          if (timelineInput) {
            // Map the time period to a numeric value for the state machine
            let timelineValue;
            
            switch(currentTimePeriod) {
              case 'planning-phase':
                timelineValue = 0;
                break;
              case 'construction-begin':
                timelineValue = 1;
                break;
              case 'construction-mid':
                timelineValue = 2;
                break;
              case 'inauguration':
                timelineValue = 3;
                break;
              case 'modern-era':
                timelineValue = 4;
                break;
              default:
                timelineValue = 0;
            }
            
            console.log(`Setting Colosseum timeline to ${timelineValue} for period ${currentTimePeriod}`);
            timelineInput.value = timelineValue;
          }
        }
      } catch (error) {
        console.error("Error setting Colosseum timeline:", error);
      }
    }, 100);
  }, [rive, currentTimePeriod]);
  
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

    // Find the cesium container parent and add the showing-colosseum-animation class
    const cesiumContainer = document.querySelector('.cesium-container');
    if (cesiumContainer) {
      cesiumContainer.classList.add('showing-colosseum-animation');
      
      // Also add colosseum-animation-visible class to body for global selector effects
      document.body.classList.add('colosseum-animation-visible');
    }
    
    // Directly hide the Rome pin if it exists
    if (window.Cesium && (window as any)._pyramidCesiumViewer) {
      const viewer = (window as any)._pyramidCesiumViewer;
      const romePin = viewer.entities.getById('location_pin_rome');
      if (romePin) {
        romePin.show = false;
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
    
    const colosseumPosition = window.Cesium.Cartesian3.fromDegrees(
      12.4922, // Rome longitude
      41.8902, // Rome latitude
      10
    );
    
    const scratchPosition = new window.Cesium.Cartesian2();
    
    const preRenderListener = viewer.scene.preRender.addEventListener(() => {
      const position = window.Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        viewer.scene,
        colosseumPosition,
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
      
      // Remove the showing-colosseum-animation class when component unmounts or becomes invisible
      const cesiumContainer = document.querySelector('.cesium-container');
      if (cesiumContainer) {
        cesiumContainer.classList.remove('showing-colosseum-animation');
      }
      
      // Remove the colosseum-animation-visible class from body
      document.body.classList.remove('colosseum-animation-visible');
    };
  }, [isVisible, hasTransitioned]);

  // When the component unmounts entirely or visibility changes to false, clean up classes
  useEffect(() => {
    if (!isVisible) {
      const cesiumContainer = document.querySelector('.cesium-container');
      if (cesiumContainer) {
        cesiumContainer.classList.remove('showing-colosseum-animation');
      }
      document.body.classList.remove('colosseum-animation-visible');
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

  // Log when the component renders with props
  useEffect(() => {
    console.log(`ColosseumAnimation rendered: visible=${isVisible}, playing=${isPlaying}, period=${currentTimePeriod}`);
  }, [isVisible, isPlaying, currentTimePeriod]);
  
  // Force animation to play when file changes
  useEffect(() => {
    if (rive && isPlaying) {
      console.log(`Animation file changed, trying to play: ${animationFile}`);
      setTimeout(() => {
        rive.play();
      }, 100); // Small delay to ensure file is loaded
    }
  }, [animationFile, rive, isPlaying]);
  
  // Handle play/pause state changes
  useEffect(() => {
    if (rive) {
      console.log(`isPlaying changed to: ${isPlaying}, updating animation state`);
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
        className="colosseum-animation-container"
        onClick={handleAnimationClick}
      >
        <div className="colosseum-animation-wrapper">
          <RiveComponent key={animationFile} />
        </div>
        <div className="colosseum-label">
          {labelText}
        </div>
      </div>
      
      {showPopup && (
        <ColosseumInfoPopup onClose={handleClosePopup} />
      )}
    </>
  );
} 