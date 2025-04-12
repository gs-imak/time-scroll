import React, { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  selectedYear: number;
  selectedMonth: number;
  selectedDay?: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onDayChange?: (day: number) => void;
  availableYearRange: { min: number; max: number };
  className?: string;
}

const MonthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function DatePicker({
  selectedYear,
  selectedMonth,
  selectedDay = 1,
  onYearChange,
  onMonthChange,
  onDayChange,
  availableYearRange,
  className = '',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'calendar' | 'months' | 'years'>('calendar');
  const [viewYear, setViewYear] = useState(selectedYear);
  const [viewMonth, setViewMonth] = useState(selectedMonth);
  const [viewDay, setViewDay] = useState(selectedDay);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Format selected date for display
  const formattedDate = `${MonthNames[selectedMonth - 1]} ${selectedDay}, ${selectedYear < 0 ? Math.abs(selectedYear) + ' BCE' : selectedYear + ' CE'}`;

  // Month pagination
  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Handle year pagination in 10-year increments
  const prevDecade = () => {
    setViewYear(Math.max(viewYear - 10, availableYearRange.min));
  };

  const nextDecade = () => {
    setViewYear(Math.min(viewYear + 10, availableYearRange.max));
  };

  // Get days in a month accounting for leap years
  const getDaysInMonth = (year: number, month: number): number => {
    // Month is 1-indexed but Date constructor takes 0-indexed month
    return new Date(year < 0 ? 1 : year, month, 0).getDate();
  };

  // Get first day of the month (0-6, where 0 is Sunday)
  const getFirstDayOfMonth = (year: number, month: number): number => {
    // For BCE years, we use a different approach
    if (year < 0) {
      // Calculate proleptic Gregorian calendar for BCE
      // This is an approximation
      const y = Math.abs(year);
      const m = month - 1; // 0-indexed month
      
      // Approximate algorithm for BCE dates
      let k = y;
      if (m <= 2) {
        k -= 1;
      }
      
      const day = (1 + Math.floor((m + 1) * 30.6) - (m > 7 ? 1 : 0) + (k % 28) * 365 + Math.floor(k / 4) - Math.floor(k / 100) + Math.floor(k / 400)) % 7;
      return day;
    }
    
    // For CE years, use standard Date calculation
    return new Date(year, month - 1, 1).getDay();
  };

  // Generate calendar days for current view
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDayOfMonth = getFirstDayOfMonth(viewYear, viewMonth);
    
    const days: (number | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  // Generate years for year picker
  const generateYearRange = () => {
    const startYear = Math.floor(viewYear / 10) * 10 - 1;
    const years: number[] = [];
    
    for (let i = 0; i < 12; i++) {
      const year = startYear + i;
      if (year >= availableYearRange.min && year <= availableYearRange.max) {
        years.push(year);
      }
    }
    
    return years;
  };

  // Handle day selection
  const handleDaySelect = (day: number | null) => {
    if (day === null) return;
    
    setViewDay(day);
    
    // Update selected date
    onYearChange(viewYear);
    onMonthChange(viewMonth);
    if (onDayChange) onDayChange(day);
    
    // Close the picker
    setIsOpen(false);
  };

  // Handle month selection
  const handleMonthSelect = (month: number) => {
    setViewMonth(month);
    setCurrentView('calendar');
  };

  // Handle year selection
  const handleYearSelect = (year: number) => {
    setViewYear(year);
    setCurrentView('months');
  };

  // Handle outside click to close the picker
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        wrapperRef.current && 
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Format year with BCE/CE notation
  const formatYear = (year: number): string => {
    if (year === 0) return "0";
    if (year < 0) return `${Math.abs(year)} BCE`;
    return `${year} CE`;
  };

  return (
    <div ref={wrapperRef} className={`date-picker-wrapper ${className}`}>
      <button 
        className="date-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="date-text">{formattedDate}</span>
        <span className="date-icon">📅</span>
      </button>

      {isOpen && (
        <div className="date-picker-dropdown">
          <div className="date-picker-header">
            {currentView === 'calendar' && (
              <>
                <button className="header-button" onClick={prevMonth}>⟨</button>
                <div className="header-title">
                  <button className="month-title" onClick={() => setCurrentView('months')}>
                    {MonthNames[viewMonth - 1]}
                  </button>
                  <button className="year-title" onClick={() => setCurrentView('years')}>
                    {formatYear(viewYear)}
                  </button>
                </div>
                <button className="header-button" onClick={nextMonth}>⟩</button>
              </>
            )}
            
            {currentView === 'months' && (
              <>
                <button className="header-button" onClick={() => setCurrentView('calendar')}>⟨</button>
                <div className="header-title">
                  <button className="year-title" onClick={() => setCurrentView('years')}>
                    {formatYear(viewYear)}
                  </button>
                </div>
                <button className="header-button invisible">⟩</button>
              </>
            )}
            
            {currentView === 'years' && (
              <>
                <button className="header-button" onClick={prevDecade}>⟨</button>
                <div className="header-title">
                  <span>{formatYear(Math.floor(viewYear / 10) * 10)} - {formatYear(Math.floor(viewYear / 10) * 10 + 9)}</span>
                </div>
                <button className="header-button" onClick={nextDecade}>⟩</button>
              </>
            )}
          </div>

          <div className="date-picker-body">
            {currentView === 'calendar' && (
              <>
                <div className="calendar-days-header">
                  {DayNames.map((name, index) => (
                    <div key={index} className="day-name">{name}</div>
                  ))}
                </div>
                <div className="calendar-days-grid">
                  {generateCalendarDays().map((day, index) => (
                    <button
                      key={index}
                      className={`day-cell ${day === null ? 'empty' : ''} ${day === viewDay && viewMonth === selectedMonth && viewYear === selectedYear ? 'selected' : ''}`}
                      onClick={() => handleDaySelect(day)}
                      disabled={day === null}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </>
            )}

            {currentView === 'months' && (
              <div className="months-grid">
                {MonthNames.map((month, index) => (
                  <button
                    key={index}
                    className={`month-cell ${index + 1 === selectedMonth && viewYear === selectedYear ? 'selected' : ''}`}
                    onClick={() => handleMonthSelect(index + 1)}
                  >
                    {month.substring(0, 3)}
                  </button>
                ))}
              </div>
            )}

            {currentView === 'years' && (
              <div className="years-grid">
                {generateYearRange().map((year, index) => (
                  <button
                    key={index}
                    className={`year-cell ${year === selectedYear ? 'selected' : ''}`}
                    onClick={() => handleYearSelect(year)}
                  >
                    {formatYear(year)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 