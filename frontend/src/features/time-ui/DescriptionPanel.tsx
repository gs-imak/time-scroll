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
        <h2 className="description-title">Historical Period</h2>
        <button className="close-button" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="period-info">
        <div className="period-title">
          {period.title}
        </div>
        <div className="period-year">
          {period.year}
        </div>
      </div>
      
      <p className="description-content">{period.description}</p>
      
      <div className="description-gradient" />
    </div>
  );
} 