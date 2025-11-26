import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

export default function BulgarianDateInput({ value, onChange, className, placeholder = "дд.мм.гггг", ...props }) {
  const [displayValue, setDisplayValue] = useState('');

  // Convert ISO date (YYYY-MM-DD) to Bulgarian format (DD.MM.YYYY)
  const isoToBulgarian = (isoDate) => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return '';
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  };

  // Convert Bulgarian format (DD.MM.YYYY) to ISO date (YYYY-MM-DD)
  const bulgarianToIso = (bgDate) => {
    if (!bgDate) return '';
    const parts = bgDate.split('.');
    if (parts.length !== 3) return '';
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    if (year.length !== 4) return '';
    return `${year}-${month}-${day}`;
  };

  // Validate date
  const isValidDate = (bgDate) => {
    const parts = bgDate.split('.');
    if (parts.length !== 3) return false;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  useEffect(() => {
    setDisplayValue(isoToBulgarian(value));
  }, [value]);

  const handleChange = (e) => {
    let input = e.target.value;
    
    // Allow only digits and dots
    input = input.replace(/[^\d.]/g, '');
    
    // Auto-add dots after day and month
    if (input.length === 2 && !input.includes('.')) {
      input = input + '.';
    } else if (input.length === 5 && input.split('.').length === 2) {
      input = input + '.';
    }
    
    // Limit to 10 characters (DD.MM.YYYY)
    if (input.length > 10) {
      input = input.substring(0, 10);
    }
    
    setDisplayValue(input);
    
    // Only update parent if valid complete date
    if (input.length === 10 && isValidDate(input)) {
      onChange(bulgarianToIso(input));
    } else if (input === '') {
      onChange('');
    }
  };

  const isComplete = displayValue.length === 10;
  const isValid = isComplete && isValidDate(displayValue);

  return (
    <div className="relative">
      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${className} ${isComplete ? (isValid ? 'border-green-500' : 'border-red-500') : ''}`}
        maxLength={10}
        {...props}
      />
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
    </div>
  );
}