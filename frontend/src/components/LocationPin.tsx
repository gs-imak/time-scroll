import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Define type for the global Window with Cesium
declare global {
  interface Window {
    Cesium: any;
  }
}

interface LocationPinProps {
  isVisible: boolean;
  locationId: string;
  longitude: number;
  latitude: number;
  height: number;
  emoji: string;
  name: string;
  zoomLevel: number;
}

export function LocationPin({
  isVisible,
  locationId,
  longitude,
  latitude,
  height,
  emoji,
  name,
  zoomLevel
}: LocationPinProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  
  // Handle position on the globe
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
      return;
    }
    
    const pinPosition = window.Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      height
    );
    
    const scratchPosition = new window.Cesium.Cartesian2();
    
    const preRenderListener = viewer.scene.preRender.addEventListener(() => {
      const position = window.Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        viewer.scene,
        pinPosition,
        scratchPosition
      );
      
      if (position && containerRef.current) {
        containerRef.current.style.left = `${position.x}px`;
        containerRef.current.style.top = `${position.y}px`;
        containerRef.current.style.display = 'block';
      } else if (containerRef.current) {
        containerRef.current.style.display = 'none';
      }
    });
    
    return () => {
      preRenderListener();
    };
  }, [isVisible, longitude, latitude, height]);

  // Handle zoom animation and auto-transition to pyramid animation
  useEffect(() => {
    if (!pinRef.current || !isVisible) return;
    
    const timeline = gsap.timeline();
    
    // The pin will be more visible the closer we zoom
    const pinScale = Math.max(0.5, Math.min(1.5, (10000000 - zoomLevel) / 10000000));
    const pinOpacity = Math.max(0.6, Math.min(1, (10000000 - zoomLevel) / 10000000));
    
    // Pin drop-in animation when first appears at far zoom
    if (zoomLevel < 20000000 && zoomLevel > 3000000) {
      // Show the location pin with a drop-in animation
      timeline.to(pinRef.current, {
        scale: pinScale,
        opacity: pinOpacity,
        duration: 0.5,
        ease: "back.out(1.7)"
      });
      
      // Show the pulse effect
      timeline.to(pulseRef.current, {
        opacity: pinOpacity * 0.8,
        duration: 0.3
      }, "-=0.3");
      
      // Show the label with a slight delay when closer
      if (zoomLevel < 10000000) {
        timeline.to(labelRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.3
        }, "-=0.2");
      } else {
        // Hide label when zoomed out
        gsap.to(labelRef.current, {
          opacity: 0,
          y: 10,
          duration: 0.2
        });
      }
    } else if (zoomLevel <= 3000000) {
      // When zoomed in very close, hide the pin with a pop-out animation
      if (pinRef.current) {
        // Add zoom-out animation class
        pinRef.current.classList.add('zoom-transition-out');
      }
      
      // Fade out pulse and label
      gsap.to(pulseRef.current, {
        opacity: 0,
        duration: 0.2
      });
      
      gsap.to(labelRef.current, {
        opacity: 0,
        duration: 0.2
      });
    } else {
      // When zoomed way out, make the pin small
      gsap.to(pinRef.current, {
        scale: 0.5,
        opacity: 0.7,
        duration: 0.5
      });
      
      gsap.to(pulseRef.current, {
        opacity: 0.3,
        duration: 0.3
      });
      
      gsap.to(labelRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.2
      });
    }
  }, [zoomLevel, isVisible]);

  if (!isVisible) return null;
  
  return (
    <div ref={containerRef} className="location-pin-container">
      <div 
        ref={pinRef} 
        className="location-pin"
      >
        <span className="location-pin-emoji">{emoji}</span>
        <div ref={pulseRef} className="location-pin-pulse"></div>
      </div>
      <div ref={labelRef} className="location-pin-label">
        <span className="location-pin-name">{name}</span>
      </div>
    </div>
  );
} 