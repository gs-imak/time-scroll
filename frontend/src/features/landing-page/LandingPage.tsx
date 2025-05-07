import React, { useState, useRef, useEffect } from 'react';
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
  // State for custom dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add CSS for custom scrollbar
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #0074b0;
        border-radius: 0 0 5px 0;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #2196F3;
        border-radius: 5px;
        border: 2px solid #0074b0;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #3aa8ff;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Handle selection
  const handleSelect = (eraId: string) => {
    handleEraSelection(eraId);
    setIsDropdownOpen(false);
  };

  function renderPreloader() {
    if (!showPreloader) return null;
    return <div className="fixed inset-0 z-50 bg-[#000428] transition-overlay"></div>;
  }

  function renderPortalEffect() {
    if (!showPortalEffect) return null;
    return <div className="portal-effect"></div>;
  }

  function renderTransitionOverlay() {
    if (!showTransitionOverlay) return null;
    return <div className="transition-overlay"></div>;
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
        
        {/* Stars Background */}
        <div className="stars-bg"></div>
        
        {/* Main Content Card */}
        <div className={`main-content relative text-center p-6 sm:p-14 rounded-2xl bg-[rgba(0,40,80,0.5)] w-[95%] sm:w-[85%] max-w-[800px] mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_40px_rgba(0,174,255,0.3),inset_0_0_20px_rgba(0,136,255,0.2)] border border-[rgba(0,174,255,0.3)] backdrop-blur-lg overflow-hidden z-10 transition-all duration-1000 ease-out space-y-6 sm:space-y-10 ${
          transitioning ? 'opacity-0 translate-y-[-80px] scale-[0.7]' : 'opacity-100 translate-y-0 scale-100'
        }`}>          
          {/* Title */}
          <h1 className="title-shimmer text-[2.5rem] sm:text-[3.5rem] font-['Arial',sans-serif] font-extrabold tracking-wide">
            Time Machine
          </h1>
          
          {/* Subtitle */}
          <p className="subtitle-glow text-white/90 text-[1.1rem] sm:text-[1.4rem] max-w-[90%] sm:max-w-[85%] mx-auto leading-relaxed font-light">
            Begin your journey through space and time
          </p>

          {/* Date Selection */}
          {selectedEra && (
            <div className="mb-6 sm:mb-10">
              <DateWheelPicker
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                selectedDay={selectedDay}
                onYearChange={handleYearChange}
                onMonthChange={handleMonthChange}
                onDayChange={handleDayChange}
                availableYearRange={{ min: currentGlobalPeriod.start, max: currentGlobalPeriod.end }}
                className="interactive-element bg-primary border-2 border-[#2196F3] rounded-2xl py-3 sm:py-4 px-2 w-[95%] sm:w-[90%] max-w-[480px] shadow-[0_8px_0_rgb(25,102,139),0_15px_20px_rgba(0,0,0,0.3)] mx-auto touch-manipulation"
              />
            </div>
          )}

          {/* Time Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-[95%] sm:w-[90%] max-w-[480px] mx-auto">
            {/* DATE Indicator */}
            <div className="hover-lift glow-effect bg-primary border-2 border-[#2196F3] rounded-2xl py-2.5 sm:py-3 px-3 sm:px-4 text-center cursor-pointer shadow-[0_8px_0_rgb(25,102,139),0_15px_20px_rgba(0,0,0,0.3)] touch-manipulation">
              <span className="text-[#7df2ff] text-[0.75rem] sm:text-[0.8rem] uppercase mb-1 tracking-[1.5px] block w-full text-center font-extrabold">DATE</span>
              <span className="text-white text-[1rem] sm:text-[1.1rem] font-bold block w-full text-center">
                {selectedEra
                  ? `${new Date(2000, selectedMonth - 1, 1).toLocaleString('default', { month: 'long' })} ${selectedDay}, ${selectedYear < 0 ? Math.abs(selectedYear) + ' BCE' : selectedYear + ' CE'}`
                  : "Not Selected"}
              </span>
            </div>

            {/* SYSTEM Indicator */}
            <div className={`hover-lift glow-effect rounded-2xl py-2.5 sm:py-3 px-3 sm:px-4 text-center cursor-pointer border-2 touch-manipulation
              ${isSystemReady 
                ? 'bg-primary border-[#2196F3] shadow-[0_8px_0_rgb(25,102,139),0_15px_20px_rgba(0,0,0,0.3)]' 
                : 'bg-gray-400 border-gray-500 shadow-[0_8px_0_rgb(100,100,100),0_15px_20px_rgba(0,0,0,0.2)]'
              }`}>
              <span className="text-[#7df2ff] text-[0.75rem] sm:text-[0.8rem] uppercase mb-1 tracking-[1.5px] block w-full text-center font-extrabold">SYSTEM</span>
              <span className="text-white text-[1rem] sm:text-[1.1rem] font-bold block w-full text-center">
                {isSystemReady ? "Ready" : "Not Ready"}
              </span>
            </div>
          </div>

          {/* Portal Status Container */}
          <div className="grid place-items-center w-full mb-6 sm:mb-10">
            <div className={`hover-lift glow-effect flex items-center justify-center gap-2 sm:gap-3 py-2.5 sm:py-3 px-4 sm:px-6 rounded-full w-fit border-2 touch-manipulation
              ${isPortalStabilized 
                ? 'bg-primary border-[#2196F3] shadow-[0_8px_0_rgb(25,102,139),0_15px_20px_rgba(0,0,0,0.3)]' 
                : 'bg-gray-400 border-gray-500 shadow-[0_8px_0_rgb(100,100,100),0_15px_20px_rgba(0,0,0,0.2)]'
              }`}>
              <div className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full ${isPortalStabilized ? 'bg-[#7CFF7C]' : 'bg-[#ff9966]'} loading-pulse`}></div>
              <span className="text-white text-[0.85rem] sm:text-[0.9rem] font-bold tracking-wider">
                {isPortalStabilized ? "Time Portal Stabilized" : "Stabilizing Time Portal..."}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="grid place-items-center w-full mb-6 sm:mb-10">
            <button
              className={`hover-lift glow-effect px-6 sm:px-14 py-3.5 sm:py-4 text-[1.2rem] sm:text-[1.4rem] font-extrabold rounded-2xl text-white transition-all duration-200 w-[95%] sm:w-[90%] max-w-[350px] border-2 border-[#2196F3] touch-manipulation
                ${isSystemReady 
                  ? 'bg-primary shadow-[0_8px_0_rgb(25,102,139),0_15px_20px_rgba(0,0,0,0.3)]' 
                  : 'bg-gray-400 cursor-not-allowed shadow-[0_8px_0_rgb(100,100,100),0_15px_20px_rgba(0,0,0,0.2)]'
                }`}
              onClick={onStartJourney}
              disabled={transitioning || !isSystemReady}
            >
              {isSystemReady ? 'START JOURNEY' : 'NOT READY'}
            </button>
          </div>
          
          {/* Version info */}
          <div className="mt-6 sm:mt-8 text-white/50 text-[0.7rem] sm:text-xs tracking-wider subtitle-glow">v1.0 Time Machine</div>
        </div>
      </div>
    </>
  );
} 