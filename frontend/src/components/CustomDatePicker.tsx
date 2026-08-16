import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar as CalendarIcon } from 'lucide-react';

interface CustomDatePickerProps {
  selected?: Date | null;
  startDate?: Date | null;
  endDate?: Date | null;
  selectsRange?: boolean;
  selectsStart?: boolean;
  selectsEnd?: boolean;
  minDate?: Date | null;
  onChange: (date: Date | null | [Date | null, Date | null]) => void;
  showTimeSelect?: boolean;
  showMonthYearPicker?: boolean;
  placeholderText?: string;
  className?: string;
  required?: boolean;
  dateFormat?: string;
}

export default function CustomDatePicker({
  selected,
  startDate,
  endDate,
  selectsRange = false,
  selectsStart = false,
  selectsEnd = false,
  minDate,
  onChange,
  showTimeSelect = false,
  showMonthYearPicker = false,
  placeholderText = 'Select date',
  className = '',
  required = false,
  dateFormat
}: CustomDatePickerProps) {
  return (
    <div className="relative w-full">
      {/* @ts-ignore - react-datepicker types struggle with conditional selectsRange boolean */}
      <DatePicker
        selected={selected}
        startDate={startDate}
        endDate={endDate}
        selectsRange={selectsRange}
        selectsStart={selectsStart}
        selectsEnd={selectsEnd}
        minDate={minDate || undefined}
        onChange={onChange as any}
        showTimeSelect={showTimeSelect}
        showMonthYearPicker={showMonthYearPicker}
        dateFormat={
          dateFormat || (
            showMonthYearPicker
              ? 'MMM yyyy'
              : showTimeSelect
              ? 'MMM d, yyyy h:mm aa'
              : 'MMM d, yyyy'
          )
        }
        placeholderText={placeholderText}
        required={required}
        className={`block w-full rounded-xl border border-border bg-input px-4 py-3.5 pl-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${className}`}
        calendarClassName="custom-calendar-popup"
        popperClassName="custom-calendar-popper"
      />
      <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
    </div>
  );
}
