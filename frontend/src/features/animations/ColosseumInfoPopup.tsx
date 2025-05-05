import React from 'react';

interface ColosseumInfoPopupProps {
  onClose: () => void;
}

export function ColosseumInfoPopup({ onClose }: ColosseumInfoPopupProps) {
  return (
    <div className="colosseum-info-popup">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>The Colosseum</h2>
        <p>
          The Colosseum is an oval amphitheatre in the center of Rome, Italy. It is the largest ancient 
          amphitheatre ever built, and is still the largest standing amphitheatre in the world today.
        </p>
        <p>
          Construction began under the emperor Vespasian in 72 CE, and was completed in 80 CE under his 
          successor and heir, Titus. The Colosseum could hold an estimated 50,000-80,000 spectators, and 
          was used for gladiatorial contests and public spectacles.
        </p>
      </div>
    </div>
  );
} 