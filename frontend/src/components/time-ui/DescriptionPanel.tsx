import React, { useEffect } from 'react';

interface TimelinePeriod {
  id: string;
  year: string;
  title: string;
  description: string;
  imageUrl: any; // Make this optional or any to match PYRAMID_TIME_PERIODS
}

interface DescriptionPanelProps {
  isVisible: boolean;
  period: TimelinePeriod | null;
  onClose: () => void;
}

export function DescriptionPanel({ isVisible, period, onClose }: DescriptionPanelProps) {
  // Add escape key listener to close panel
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isVisible, onClose]);

  if (!period) return null;
  
  return (
    <div className={`description-panel ${isVisible ? 'visible' : ''}`}>
      <div className="description-header">
        <h3 className="description-title">
          Time Period Details
        </h3>
        <button className="close-button" onClick={onClose} aria-label="Close description">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div style={{
        padding: '10px',
        marginBottom: '16px',
        background: 'rgba(56, 189, 248, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(56, 189, 248, 0.3)'
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          fontSize: '1.1rem', 
          color: 'rgb(125, 211, 252)',
          marginBottom: '4px' 
        }}>
          {period.title}
        </div>
        <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
          {period.year}
        </div>
      </div>
      
      <p className="description-content">{period.description}</p>
      
      {/* Bottom gradient for visual appeal */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '10px',
          background: 'linear-gradient(to bottom, transparent, rgba(56, 189, 248, 0.2))',
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
} 