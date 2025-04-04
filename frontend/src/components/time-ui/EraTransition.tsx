import React, { useEffect, useState } from 'react';

interface EraTransitionProps {
  isVisible: boolean;
  location: string;
  year: string;
  onTransitionComplete?: () => void;
}

export function EraTransition({ 
  isVisible, 
  location, 
  year, 
  onTransitionComplete 
}: EraTransitionProps) {
  const [text, setText] = useState({ location, year });
  const [isAnimating, setIsAnimating] = useState(false);
  const [opacity, setOpacity] = useState(0);
  
  useEffect(() => {
    let fadeInTimeout: number | undefined;
    let fadeOutTimeout: number | undefined;
    let completionTimeout: number | undefined;
    
    // Reset state when visibility changes
    if (isVisible) {
      // Start fade in
      setIsAnimating(true);
      setOpacity(0);
      
      // Update text immediately when transition starts
      setText({ location, year });
      
      // Animate to full opacity
      fadeInTimeout = window.setTimeout(() => {
        setOpacity(1);
      }, 100);
      
      // Start fade out after delay
      fadeOutTimeout = window.setTimeout(() => {
        setOpacity(0);
      }, 2500);
      
      // Signal completion after animation ends
      completionTimeout = window.setTimeout(() => {
        setIsAnimating(false);
        if (onTransitionComplete) {
          onTransitionComplete();
        }
      }, 3000);
    } else {
      // Ensure opacity is reset when not visible
      setOpacity(0);
    }
    
    // Clear all timeouts on cleanup
    return () => {
      if (fadeInTimeout) window.clearTimeout(fadeInTimeout);
      if (fadeOutTimeout) window.clearTimeout(fadeOutTimeout);
      if (completionTimeout) window.clearTimeout(completionTimeout);
    };
  }, [isVisible, location, year, onTransitionComplete]);
  
  // Don't render at all when not visible and not animating
  if (!isVisible && !isAnimating) {
    return null;
  }
  
  return (
    <div 
      className="era-transition" 
      style={{ 
        opacity,
        pointerEvents: 'none', // Ensure it doesn't block interaction
      }}
    >
      <div className="era-transition-content">
        <div className="era-location">
          {text.location}
        </div>
        <div className="era-year">
          {text.year}
        </div>
      </div>
      
      {/* Background blur effect */}
      <div className="era-bg" />
      
      {/* Animated rings */}
      <div className="era-rings">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="era-ring"
            style={{
              width: `${(i + 1) * 20}vw`,
              height: `${(i + 1) * 20}vw`,
              opacity: 0.5 - i * 0.15,
              animation: `ripple ${2 + i * 0.5}s cubic-bezier(0, 0.5, 0.5, 1) infinite`,
            }}
          />
        ))}
      </div>
      
      {/* Add a subtle vignette effect */}
      <div className="era-vignette" />
    </div>
  );
} 