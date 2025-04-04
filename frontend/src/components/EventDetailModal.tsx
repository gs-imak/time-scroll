import React from 'react';

interface EventDetailModalProps {
  name: string;
  year: number;
  emoji: string;
  description: string;
  onClose: () => void;
  isOpen: boolean;
}

export function EventDetailModal({
  name,
  year,
  emoji,
  description,
  onClose,
  isOpen
}: EventDetailModalProps) {
  if (!isOpen) return null;

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      <div className="event-modal-overlay" onClick={onClose} />
      <div className="event-detail-modal">
        <div className="event-modal-header">
          <div>
            <h2 className="event-modal-title">
              <span className="event-modal-emoji">{emoji} </span>
              {name}
            </h2>
            <div className="event-modal-year">
              {year < 0 ? Math.abs(year) + ' BCE' : year + ' CE'}
            </div>
          </div>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="event-modal-content">
          {description.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </>
  );
} 