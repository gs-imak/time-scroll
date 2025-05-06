import React from 'react';
import { DateWheelPicker } from '../../components/DateWheelPicker';
import './styles.css'; // Keep this import for the stars background

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
    return <div className="fixed inset-0 z-50 bg-[#000428]"></div>;
  }

  function renderPortalEffect() {
    if (!showPortalEffect) return null;
    return <div className="fixed inset-0 z-50 bg-gradient-to-r from-primary/30 via-secondary/50 to-background/90"></div>;
  }

  function renderTransitionOverlay() {
    if (!showTransitionOverlay) return null;
    return <div className="fixed inset-0 z-50 bg-black/80"></div>;
  }

  return (
    <>
      {renderPreloader()}
      {renderPortalEffect()}
      {renderTransitionOverlay()}
      
      {/* Landing Page - with static background */}
      <div className={`fixed inset-0 flex justify-center items-center bg-gradient-to-br from-[#000000] via-[#00152b] to-[#000000] perspective-1000 overflow-hidden z-40 transition-all duration-1500 ease-out ${
        transitioning ? 'opacity-0 scale-[1.5] rotate-3d-y-15' : 'opacity-100 scale-100'
      }`}>
        
        {/* Stars Background - Keep the new stars background */}
        <div className="absolute inset-0 stars-bg opacity-70"></div>
        
        {/* Main Content Card - Matching the style of other containers */}
        <div className={`relative text-center p-14 rounded-2xl bg-[rgba(0,40,80,0.5)] w-[85%] max-w-[800px] mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_40px_rgba(0,174,255,0.3),inset_0_0_20px_rgba(0,136,255,0.2)] border border-[rgba(0,174,255,0.3)] backdrop-blur-lg overflow-hidden z-10 transition-all duration-1000 ease-out ${
          transitioning ? 'opacity-0 translate-y-[-80px] scale-[0.7]' : 'opacity-100 translate-y-0 scale-100'
        }`}>          
          {/* Title - Matching .landing-page h1 */}
          <h1 className="text-[3.5rem] mb-6 text-white bg-transparent font-['Arial',sans-serif] font-extrabold tracking-wide drop-shadow-[0_0_10px_rgba(0,149,255,0.8),0_0_30px_rgba(0,149,255,0.5)] bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent bg-[length:200%_auto] animate-title-shimmer">
            Time Machine
          </h1>
          
          {/* Subtitle - Matching .landing-subtitle */}
          <p className="text-white/90 text-[1.4rem] mb-12 max-w-[85%] mx-auto leading-relaxed font-light drop-shadow-[0_0_8px_rgba(0,136,255,0.4)]">
            Begin your journey through space and time
          </p>
          
          {/* Select Era - Using dropdown instead of pills */}
          <div className="mb-8">
            <div className="bg-[rgba(0,40,80,0.5)] border border-[rgba(0,174,255,0.3)] rounded-lg py-[15px] px-[20px] max-w-[480px] mx-auto text-center transition-all duration-300">
              <span className="text-white/70 text-[0.8rem] uppercase mb-2 tracking-[1.5px] block w-full text-center font-medium">SELECT ERA</span>
              <select 
                className="bg-[rgba(0,30,60,0.8)] text-[#60efff] text-[1.25rem] font-semibold border border-[rgba(0,174,255,0.3)] rounded-md py-2 px-4 w-full outline-none focus:border-[rgba(0,174,255,0.6)] focus:ring-2 focus:ring-[rgba(0,174,255,0.3)]"
                value={selectedEra || ""}
                onChange={(e) => handleEraSelection(e.target.value)}
                disabled={transitioning}
              >
                <option value="" disabled>Select an era</option>
                {availableEras.map(era => (
                  <option key={era.id} value={era.id}>{era.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Selection - only show when era is selected */}
          {selectedEra && (
            <div className="mb-6 w-full flex justify-center">
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

          {/* Time Indicators - Matching .time-indicators and .time-indicator classes */}
          <div className="flex justify-center gap-5 mb-10 flex-wrap">
            <div className="bg-[rgba(0,40,80,0.5)] border border-[rgba(0,174,255,0.3)] rounded-lg py-[15px] px-[20px] min-w-[140px] text-center relative cursor-pointer transition-all duration-300 flex flex-col items-center hover:bg-[rgba(0,30,60,0.7)] hover:translate-y-[-5px] hover:border-[rgba(0,174,255,0.5)] group">
              <span className="text-white/70 text-[0.8rem] uppercase mb-2 tracking-[1.5px] block w-full text-center font-medium">ERA</span>
              <span className="text-[#60efff] text-[1.25rem] font-semibold drop-shadow-[0_0_15px_rgba(96,239,255,0.6)] block w-full text-center">
                {selectedEra ? availableEras.find(era => era.id === selectedEra)?.name : "Not Selected"}
              </span>
              <div className="absolute bottom-[-5px] left-1/2 transform -translate-x-1/2 w-[60%] h-[5px] bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 rounded-md opacity-0 transition-opacity group-hover:opacity-100"></div>
            </div>

            <div className="bg-[rgba(0,40,80,0.5)] border border-[rgba(0,174,255,0.3)] rounded-lg py-[15px] px-[20px] min-w-[140px] text-center relative cursor-pointer transition-all duration-300 flex flex-col items-center hover:bg-[rgba(0,30,60,0.7)] hover:translate-y-[-5px] hover:border-[rgba(0,174,255,0.5)] group">
              <span className="text-white/70 text-[0.8rem] uppercase mb-2 tracking-[1.5px] block w-full text-center font-medium">DATE</span>
              <span className="text-[#60efff] text-[1.25rem] font-semibold drop-shadow-[0_0_15px_rgba(96,239,255,0.6)] block w-full text-center">
                {selectedEra
                  ? `${new Date(2000, selectedMonth - 1, 1).toLocaleString('default', { month: 'long' })} ${selectedDay}, ${selectedYear < 0 ? Math.abs(selectedYear) + ' BCE' : selectedYear + ' CE'}`
                  : "Not Selected"}
              </span>
              <div className="absolute bottom-[-5px] left-1/2 transform -translate-x-1/2 w-[60%] h-[5px] bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 rounded-md opacity-0 transition-opacity group-hover:opacity-100"></div>
            </div>

            <div className="bg-[rgba(0,40,80,0.5)] border border-[rgba(0,174,255,0.3)] rounded-lg py-[15px] px-[20px] min-w-[140px] text-center relative cursor-pointer transition-all duration-300 flex flex-col items-center hover:bg-[rgba(0,30,60,0.7)] hover:translate-y-[-5px] hover:border-[rgba(0,174,255,0.5)] group">
              <span className="text-white/70 text-[0.8rem] uppercase mb-2 tracking-[1.5px] block w-full text-center font-medium">SYSTEM</span>
              <span className={`text-[1.25rem] font-semibold block w-full text-center ${isSystemReady ? 'text-[#60efff] drop-shadow-[0_0_15px_rgba(96,239,255,0.6)]' : 'text-[#ff9966] drop-shadow-[0_0_10px_rgba(255,153,102,0.7)]'}`}>
                {isSystemReady ? "Ready" : "Not Ready"}
              </span>
              <div className="absolute bottom-[-5px] left-1/2 transform -translate-x-1/2 w-[60%] h-[5px] bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 rounded-md opacity-0 transition-opacity group-hover:opacity-100"></div>
            </div>
          </div>

          {/* Portal Status Container - Matching .status-container */}
          <div className={`flex items-center justify-center gap-4 mb-10 py-3 px-6 mx-auto w-fit rounded-full ${isPortalStabilized ? 'bg-[rgba(0,40,80,0.5)]' : 'bg-[rgba(30,10,10,0.4)]'} border ${isPortalStabilized ? 'border-[rgba(0,174,255,0.3)]' : 'border-[rgba(255,153,102,0.3)]'} shadow-[0_4px_15px_rgba(0,0,0,0.3)] relative overflow-hidden`}>
            <div className={`w-4 h-4 rounded-full ${isPortalStabilized ? 'border-2 border-primary animate-pulse' : 'border-2 border-[#ff9966] animate-[pulse-warning_1.5s_infinite]'} relative`}>
              <div className="absolute inset-0 w-full h-full rounded-full" style={{
                transform: 'translate(-50%, -50%)',
                top: '50%',
                left: '50%',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isPortalStabilized ? '#60efff' : '#ff9966',
                boxShadow: isPortalStabilized ? '0 0 10px rgba(96,239,255,0.8)' : '0 0 10px rgba(255,153,102,0.8)'
              }}></div>
            </div>
            <span className={`${isPortalStabilized ? 'text-[#60efff]' : 'text-[#ff9966]'} text-[0.95rem] font-medium tracking-wider ${isPortalStabilized ? 'drop-shadow-[0_0_8px_rgba(96,239,255,0.6)]' : 'drop-shadow-[0_0_8px_rgba(255,153,102,0.6)]'}`}>
              {isPortalStabilized ? "Time Portal Stabilized" : "Stabilizing Time Portal..."}
            </span>
          </div>

          {/* CTA Button - Simple grid based centering for perfect responsiveness */}
          <div className="grid place-items-center w-full mb-10">
            <button
              className={`px-6 sm:px-14 py-4 text-[1.4rem] font-extrabold rounded-2xl text-white transition-all duration-200 w-[90%] max-w-[480px]
                ${isSystemReady 
                  ? 'bg-primary hover:bg-[#7df2ff] active:bg-[#00daff] hover:translate-y-[-4px] active:translate-y-[-2px] shadow-[0_8px_0_rgb(25,102,139),0_15px_20px_rgba(0,0,0,0.3)] active:shadow-[0_4px_0_rgb(0,121,178),0_5px_10px_rgba(0,0,0,0.2)]' 
                  : 'bg-gray-400 cursor-not-allowed shadow-[0_8px_0_rgb(100,100,100),0_15px_20px_rgba(0,0,0,0.2)]'
                }`}
              onClick={onStartJourney}
              disabled={transitioning || !isSystemReady}
            >
              {isSystemReady ? 'START JOURNEY' : 'NOT READY'}
            </button>
          </div>
          
          {/* Version info */}
          <div className="mt-8 text-white/50 text-xs tracking-wider drop-shadow-[0_0_5px_rgba(0,136,255,0.3)]">v1.0 Time Machine</div>
        </div>
      </div>
    </>
  );
} 