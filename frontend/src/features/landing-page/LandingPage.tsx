import React, { useState } from 'react';
import { DateWheelPicker } from '../../components/DateWheelPicker';

interface LandingPageProps {
  onStartJourney: () => void;
  isSystemReady: boolean;
  isPortalStabilized: boolean;
  transitioning: boolean;
  showPreloader: boolean;
  showPortalEffect: boolean;
  showTransitionOverlay: boolean;
  selectedEra: string | null;
  selectedYear: number;
  selectedMonth: number;
  selectedDay: number;
  availableEras: { id: string; name: string }[];
  handleEraSelection: (eraId: string) => void;
  handleYearChange: (year: number) => void;
  handleMonthChange: (month: number) => void;
  handleDayChange: (day: number) => void;
  currentGlobalPeriod: { start: number; end: number };
}

export function LandingPage({
  onStartJourney,
  isSystemReady,
  isPortalStabilized,
  transitioning,
  showPreloader,
  showPortalEffect,
  showTransitionOverlay,
  selectedEra,
  selectedYear,
  selectedMonth,
  selectedDay,
  availableEras,
  handleEraSelection,
  handleYearChange,
  handleMonthChange,
  handleDayChange,
  currentGlobalPeriod
}: LandingPageProps) {
  function renderPreloader() {
    if (!showPreloader) return null;
    return <div className={`preloader ${showPreloader ? 'active' : ''}`}></div>;
  }

  function renderPortalEffect() {
    if (!showPortalEffect) return null;
    return <div className={`portal-transition ${showPortalEffect ? 'active' : ''}`}></div>;
  }

  function renderTransitionOverlay() {
    if (!showTransitionOverlay) return null;
    return <div className={`transition-overlay ${showTransitionOverlay ? 'active' : ''}`}></div>;
  }

  return (
    <>
      {renderPreloader()}
      {renderPortalEffect()}
      {renderTransitionOverlay()}
      <div className={`landing-page ${transitioning ? 'fade-out' : ''}`}>
        <div className="floating-elements">
          <div className="floating-element f1"></div>
          <div className="floating-element f2"></div>
          <div className="floating-element f3"></div>
          <div className="floating-element f4"></div>
          <div className="floating-element f5"></div>
        </div>
        <div className="landing-content">
          <h1>Time Machine</h1>
          <p className="landing-subtitle">Begin your journey through space and time</p>

          {/* Date Selection - only show when era is selected */}
          {selectedEra && (
            <div className="time-picker-container">
              <DateWheelPicker
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                selectedDay={selectedDay}
                onYearChange={handleYearChange}
                onMonthChange={handleMonthChange}
                onDayChange={handleDayChange}
                availableYearRange={{ min: currentGlobalPeriod.start, max: currentGlobalPeriod.end }}
              />
            </div>
          )}

          <div className="time-indicators">
            <div className="time-indicator">
              <span className="time-label">Era</span>
              <span className="time-value">
                {selectedEra ? availableEras.find(era => era.id === selectedEra)?.name : "Not Selected"}
              </span>
            </div>
            <div className="time-indicator">
              <span className="time-label">Date</span>
              <span className="time-value">
                {selectedEra
                  ? `${new Date(2000, selectedMonth - 1, 1).toLocaleString('default', { month: 'long' })} ${selectedDay}, ${selectedYear < 0 ? Math.abs(selectedYear) + ' BCE' : selectedYear + ' CE'}`
                  : "Not Selected"}
              </span>
            </div>
            <div className="time-indicator">
              <span className="time-label">System</span>
              <span className={`time-value ${isSystemReady ? 'ready' : 'not-ready'}`}>
                {isSystemReady ? "Ready" : "Not Ready"}
              </span>
            </div>
          </div>

          <div className={`status-container ${isPortalStabilized ? 'stabilized' : ''}`}>
            <div className="status-ring"></div>
            <div className="status-message">
              {isPortalStabilized ? "Time Portal Stabilized" : "Stabilizing Time Portal..."}
            </div>
          </div>

          <button
            className={`journey-button ${isSystemReady ? 'ready' : 'disabled'}`}
            onClick={onStartJourney}
            disabled={transitioning || !isSystemReady}
          >
            <span className="button-text">
              Initialize Time Portal
            </span>
          </button>

          <div className="version-info">v1.0 Time Machine</div>
        </div>
      </div>
    </>
  );
} 