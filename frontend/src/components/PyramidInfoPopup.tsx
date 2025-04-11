import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface PyramidInfoPopupProps {
  onClose: () => void;
}

export function PyramidInfoPopup({ onClose }: PyramidInfoPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // Animation for popup entrance
  useEffect(() => {
    if (!popupRef.current || !overlayRef.current) return;
    
    // Create animation timeline
    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    // Animate overlay
    timeline.fromTo(
      overlayRef.current,
      { 
        opacity: 0 
      },
      { 
        opacity: 1, 
        duration: 0.3 
      }
    );
    
    // Animate popup
    timeline.fromTo(
      popupRef.current,
      { 
        opacity: 0,
        y: 20,
        scale: 0.95,
      },
      { 
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
      },
      '-=0.1' // Slight overlap with previous animation
    );
    
    // Add a subtle shimmer effect to the border
    timeline.fromTo(
      '.pyramid-info-border',
      {
        backgroundPosition: '0% 50%',
      },
      {
        backgroundPosition: '100% 50%',
        duration: 5,
        repeat: -1,
        yoyo: true,
      },
      '-=0.2'
    );
    
    // Handle ESC key to close modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      timeline.kill();
    };
  }, [onClose]);
  
  // Animation for popup exit
  const handleClose = () => {
    if (!popupRef.current || !overlayRef.current) {
      onClose();
      return;
    }
    
    const timeline = gsap.timeline({
      defaults: { ease: 'power2.in' },
      onComplete: onClose
    });
    
    timeline.to(
      popupRef.current,
      { 
        opacity: 0,
        y: -10,
        scale: 0.9,
        duration: 0.3,
      }
    );
    
    timeline.to(
      overlayRef.current,
      { 
        opacity: 0, 
        duration: 0.2 
      },
      '-=0.1'
    );
  };
  
  return (
    <>
      <div 
        ref={overlayRef}
        className="event-modal-overlay"
        onClick={handleClose}
      />
      
      <div 
        ref={popupRef}
        className="pyramid-info-popup"
      >
        <div className="pyramid-info-border"></div>
        
        <div className="pyramid-info-header">
          <h2 className="pyramid-info-title">
            <span className="pyramid-emoji">🏛️ </span>
            Great Pyramid of Giza
          </h2>
          <div className="pyramid-info-year">2560 BCE</div>
          
          <button 
            className="close-button" 
            onClick={handleClose}
            aria-label="Close details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="pyramid-info-content">
          <div className="pyramid-image-container">
            <div className="pyramid-image"></div>
          </div>
          
          <div className="pyramid-facts">
            <div className="fact-item">
              <span className="fact-label">Height:</span>
              <span className="fact-value">146.6 meters (original)</span>
            </div>
            <div className="fact-item">
              <span className="fact-label">Base:</span>
              <span className="fact-value">230.4 meters</span>
            </div>
            <div className="fact-item">
              <span className="fact-label">Builder:</span>
              <span className="fact-value">Pharaoh Khufu</span>
            </div>
            <div className="fact-item">
              <span className="fact-label">Dynasty:</span>
              <span className="fact-value">4th Dynasty, Old Kingdom</span>
            </div>
          </div>
          
          <p>
            The Great Pyramid of Giza is the oldest and largest of the three pyramids in the Giza pyramid complex. It is the oldest of the Seven Wonders of the Ancient World, and the only one to remain largely intact.
          </p>
          
          <p>
            Built as a tomb for the Fourth Dynasty Egyptian pharaoh Khufu, it was constructed over a 20-year period. The pyramid contains an estimated 2.3 million blocks of stone, with an average weight of 2.5 tons each.
          </p>
          
          <p>
            For over 3,800 years, it was the tallest human-made structure in the world until the completion of Lincoln Cathedral in England in 1311 AD.
          </p>
          
          <div className="pyramid-info-footer">
            <div className="pyramid-mysteries">
              <h3>Enduring Mysteries</h3>
              <ul>
                <li>How exactly were the massive stones transported and lifted?</li>
                <li>Why are the measurements so precise and mathematically significant?</li>
                <li>What other chambers might remain undiscovered within?</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 