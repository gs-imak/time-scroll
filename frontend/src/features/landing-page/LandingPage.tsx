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
          
          {/* Custom Select Era Dropdown */}
          <div className="mb-8 grid place-items-center w-full">
            <div className="bg-primary border-2 border-[#2196F3] rounded-2xl py-4 px-6 w-[90%] max-w-[480px] shadow-[0_8px_0_rgb(25,102,139),0_15px_20px_rgba(0,0,0,0.3)]">
              <span className="text-white text-[0.9rem] uppercase mb-3 tracking-[1.5px] block w-full text-center font-extrabold">SELECT ERA</span>
              
              {/* Custom dropdown */}
              <div className="relative" ref={dropdownRef}>
                {/* Dropdown trigger button */}
                <button
                  className="text-left appearance-none bg-primary text-white text-[1.25rem] font-bold border-2 border-[#2196F3] rounded-xl py-3 px-4 w-full outline-none focus:ring-2 focus:ring-white transition-all duration-200 cursor-pointer shadow-[inset_0_2px_5px_rgba(0,0,0,0.2)]"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={transitioning}
                >
                  {selectedEra ? availableEras.find(era => era.id === selectedEra)?.name : "Select an era"}
                  
                  {/* Arrow icon */}
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className={`w-5 h-5 text-white transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} 
                      fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                  
                  {/* Highlighting effect */}
                  <div className="absolute top-0 left-[5%] right-[5%] h-[1px] bg-white/30"></div>
                </button>
                
                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-[#00628f] border-2 border-[#2196F3] rounded-b-xl shadow-[0_5px_15px_rgba(0,0,0,0.5)] max-h-60 overflow-auto custom-scrollbar">
                    {availableEras.map((era, index) => (
                      <div 
                        key={era.id} 
                        className={`px-4 py-3 cursor-pointer text-white font-bold transition-colors duration-150 ${
                          selectedEra === era.id ? 'bg-[#004e73]' : ''
                        } ${
                          index === availableEras.length - 1 ? 'rounded-b-lg' : ''
                        }`}
                        onClick={() => handleSelect(era.id)}
                      >
                        {era.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Date Selection - only show when era is selected */}
          {selectedEra && (
            <div className="mb-10 grid place-items-center w-full">
              <div className="bg-primary border-2 border-[#2196F3] rounded-2xl py-4 px-2 w-[90%] max-w-[480px] shadow-[0_8px_0_rgb(25,102,139),0_15px_20px_rgba(0,0,0,0.3)]">
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
            </div>
          )}

          {/* Time Indicators - matching button style exactly */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 w-[90%] max-w-[480px] mx-auto">
            <div className="bg-primary border-2 border-[#2196F3] rounded-2xl py-3 px-4 text-center cursor-pointer shadow-[0_8px_0_rgb(25,102,139),0_15px_20px_rgba(0,0,0,0.3)] transition-all duration-200 hover:translate-y-[-4px] hover:shadow-[0_10px_0_rgb(25,102,139),0_18px_20px_rgba(0,0,0,0.3)]">
              <span className="text-[#7df2ff] text-[0.8rem] uppercase mb-1 tracking-[1.5px] block w-full text-center font-extrabold">ERA</span>
              <span className="text-white text-[1.1rem] font-bold block w-full text-center">
                {selectedEra ? availableEras.find(era => era.id === selectedEra)?.name : "Not Selected"}
              </span>
            </div>

            <div className="bg-primary border-2 border-[#2196F3] rounded-2xl py-3 px-4 text-center cursor-pointer shadow-[0_8px_0_rgb(25,102,139),0_15px_20px_rgba(0,0,0,0.3)] transition-all duration-200 hover:translate-y-[-4px] hover:shadow-[0_10px_0_rgb(25,102,139),0_18px_20px_rgba(0,0,0,0.3)]">
              <span className="text-[#7df2ff] text-[0.8rem] uppercase mb-1 tracking-[1.5px] block w-full text-center font-extrabold">DATE</span>
              <span className="text-white text-[1.1rem] font-bold block w-full text-center">
                {selectedEra
                  ? `${new Date(2000, selectedMonth - 1, 1).toLocaleString('default', { month: 'long' })} ${selectedDay}, ${selectedYear < 0 ? Math.abs(selectedYear) + ' BCE' : selectedYear + ' CE'}`
                  : "Not Selected"}
              </span>
            </div>

            <div className={`rounded-2xl py-3 px-4 text-center cursor-pointer transition-all duration-200 hover:translate-y-[-4px] border-2 
              ${isSystemReady 
                ? 'bg-primary border-[#2196F3] shadow-[0_8px_0_rgb(25,102,139),0_15px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_0_rgb(25,102,139),0_18px_20px_rgba(0,0,0,0.3)]' 
                : 'bg-gray-400 border-gray-500 shadow-[0_8px_0_rgb(100,100,100),0_15px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_0_rgb(100,100,100),0_18px_20px_rgba(0,0,0,0.2)]'
              }`}>
              <span className="text-[#7df2ff] text-[0.8rem] uppercase mb-1 tracking-[1.5px] block w-full text-center font-extrabold">SYSTEM</span>
              <span className="text-white text-[1.1rem] font-bold block w-full text-center">
                {isSystemReady ? "Ready" : "Not Ready"}
              </span>
            </div>
          </div>

          {/* Portal Status Container - matching button style exactly */}
          <div className="grid place-items-center w-full mb-10">
            <div className={`flex items-center justify-center gap-3 py-3 px-6 rounded-full w-fit border-2 
              ${isPortalStabilized 
                ? 'bg-primary border-[#2196F3] shadow-[0_8px_0_rgb(25,102,139),0_15px_20px_rgba(0,0,0,0.3)]' 
                : 'bg-gray-400 border-gray-500 shadow-[0_8px_0_rgb(100,100,100),0_15px_20px_rgba(0,0,0,0.2)]'
              }`}>
              <div className={`w-3 h-3 rounded-full ${isPortalStabilized ? 'bg-white' : 'bg-[#ff9966]'} animate-pulse`}></div>
              <span className="text-white text-[0.9rem] font-bold tracking-wider">
                {isPortalStabilized ? "Time Portal Stabilized" : "Stabilizing Time Portal..."}
              </span>
            </div>
          </div>

          {/* CTA Button - Simple grid based centering */}
          <div className="grid place-items-center w-full mb-10">
            <button
              className={`px-6 sm:px-14 py-4 text-[1.4rem] font-extrabold rounded-2xl text-white transition-all duration-200 w-[90%] max-w-[480px] border-2 border-[#2196F3]
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