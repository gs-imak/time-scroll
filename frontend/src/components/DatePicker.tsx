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
  const yearWheelRef = useRef<HTMLDivElement>(null);
  const monthWheelRef = useRef<HTMLDivElement>(null);

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

  // Generate years for the wheel
  const generateYears = () => {
    const years: number[] = [];
    for (let year = availableYearRange.min; year <= availableYearRange.max; year++) {
      years.push(year);
    }
    return years;
  };
  
  // Scroll to selected items initially and when selection changes
  useEffect(() => {
    setTimeout(() => {
      if (yearWheelRef.current) {
        const years = generateYears();
        const yearIndex = years.findIndex(y => y === selectedYear);
        if (yearIndex !== -1) {
          const itemHeight = 40; // Height of each wheel item in pixels
          yearWheelRef.current.scrollTop = yearIndex * itemHeight;
        }
      }
      
      if (monthWheelRef.current) {
        const monthIndex = selectedMonth - 1; // Convert 1-based to 0-based
        const itemHeight = 40; // Height of each wheel item in pixels
        monthWheelRef.current.scrollTop = monthIndex * itemHeight;
      }
    }, 50); // Small delay to ensure DOM is ready
  }, [selectedYear, selectedMonth, availableYearRange]);
  
  // Handle year wheel scroll
  const handleYearScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (yearWheelRef.current) {
      // Debounce scroll events
      const timeout = yearWheelRef.current.dataset.scrollTimeout;
      if (timeout) {
        clearTimeout(parseInt(timeout));
      }
      
      const timeoutId = setTimeout(() => {
        const scrollTop = e.currentTarget.scrollTop;
        const itemHeight = 40;
        
        // Calculate which year is centered
        const yearIndex = Math.round(scrollTop / itemHeight);
        const years = generateYears();
        
        if (yearIndex >= 0 && yearIndex < years.length && years[yearIndex] !== selectedYear) {
          onYearChange(years[yearIndex]);
        }
      }, 150);
      
      yearWheelRef.current.dataset.scrollTimeout = timeoutId.toString();
    }
  };
  
  // Handle month wheel scroll
  const handleMonthScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (monthWheelRef.current) {
      // Debounce scroll events
      const timeout = monthWheelRef.current.dataset.scrollTimeout;
      if (timeout) {
        clearTimeout(parseInt(timeout));
      }
      
      const timeoutId = setTimeout(() => {
        const scrollTop = e.currentTarget.scrollTop;
        const itemHeight = 40;
        
        // Calculate which month is centered
        const monthIndex = Math.round(scrollTop / itemHeight);
        
        if (monthIndex >= 0 && monthIndex < 12 && (monthIndex + 1) !== selectedMonth) {
          onMonthChange(monthIndex + 1); // Convert 0-based to 1-based
        }
      }, 150);
      
      monthWheelRef.current.dataset.scrollTimeout = timeoutId.toString();
    }
  };
  
  // Handle direct click selection on year
  const handleYearClick = (year: number) => {
    if (year !== selectedYear) {
      onYearChange(year);
    }
  };
  
  // Handle direct click selection on month
  const handleMonthClick = (month: number) => {
    if (month !== selectedMonth) {
      onMonthChange(month);
    }
  };

  return (
    <div ref={wrapperRef} className={`apple-date-picker ${className}`}>
      <div className="wheel-container">
        {/* Year wheel */}
        <div className="wheel-column">
          <div className="wheel-label">YEAR</div>
          <div 
            className="wheel year-wheel" 
            ref={yearWheelRef}
            onScroll={handleYearScroll}
          >
            <div className="wheel-items">
              {/* Year items */}
              {generateYears().map(year => (
                <div 
                  key={year} 
                  className={`wheel-item ${year === selectedYear ? 'selected' : ''}`}
                  onClick={() => handleYearClick(year)}
                >
                  {formatYear(year)}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Month wheel */}
        <div className="wheel-column">
          <div className="wheel-label">MONTH</div>
          <div 
            className="wheel month-wheel" 
            ref={monthWheelRef}
            onScroll={handleMonthScroll}
          >
            <div className="wheel-items">
              {/* Month items */}
              {MonthNames.map((month, index) => (
                <div 
                  key={month} 
                  className={`wheel-item ${index + 1 === selectedMonth ? 'selected' : ''}`}
                  onClick={() => handleMonthClick(index + 1)}
                >
                  {month}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Center selection indicator */}
      <div className="wheel-selection-indicator"></div>
    </div>
  );
} 