import React from "react";
import "../styles/DateWheelPicker.css";

// Helper function to create a range of numbers
const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, i) => i + start);

// Format year with BCE/CE notation
const formatYear = (year: number): string => {
  if (year < 0) return `${Math.abs(year)} BCE`;
  return `${year} CE`;
};

interface WheelProps {
  options: (number | string)[];
  selected: number | string;
  onChange: (opt: number | string) => void;
}

const Wheel = ({ options, selected, onChange }: WheelProps) => {
  return (
    <div className="wheel-container">
      {options.map((opt, idx) => (
        <div
          key={idx}
          className={`wheel-item ${opt === selected ? "selected" : ""}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </div>
      ))}
    </div>
  );
};

interface DateWheelPickerProps {
  selectedYear: number;
  selectedMonth: number;
  selectedDay: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onDayChange: (day: number) => void;
  availableYearRange: { min: number; max: number };
  className?: string;
}

export function DateWheelPicker({
  selectedYear,
  selectedMonth,
  selectedDay,
  onYearChange,
  onMonthChange,
  onDayChange,
  availableYearRange,
  className = ''
}: DateWheelPickerProps) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleDateChange = (
    type: "day" | "month" | "year",
    value: number | string
  ) => {
    if (type === "day") {
      onDayChange(value as number);
    } else if (type === "month") {
      const monthIndex = typeof value === "string" 
        ? months.indexOf(value) + 1
        : value;
      onMonthChange(monthIndex as number);
    } else if (type === "year") {
      onYearChange(value as number);
    }
  };

  return (
    <div className={`picker-container ${className}`}>
      <Wheel
        options={range(1, 31)}
        selected={selectedDay}
        onChange={(value) => handleDateChange("day", value)}
      />
      <Wheel
        options={months}
        selected={months[selectedMonth - 1]}
        onChange={(value) => handleDateChange("month", value)}
      />
      <Wheel
        options={range(availableYearRange.min, availableYearRange.max)}
        selected={selectedYear}
        onChange={(value) => handleDateChange("year", value)}
      />
    </div>
  );
} 