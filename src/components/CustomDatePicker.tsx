import React, { useState, useEffect } from 'react';

interface Props {
  value?: string;
  onChange: (value: string) => void;
  error?: boolean;
  minYear?: number;
  maxYear?: number;
  isRTL?: boolean;
  isExpiryDate?: boolean;
  isRecentDate?: boolean;
}

export const CustomDatePicker: React.FC<Props> = ({ 
  value, 
  onChange, 
  error = false, 
  minYear, 
  maxYear, 
  isRTL = true,
  isExpiryDate = false,
  isRecentDate = false
}) => {
  const currentYear = new Date().getFullYear();
  
  // If it's an expiry date, show [currentYear - 1] to [currentYear + 4]
  // If it's a recent date, show [currentYear - 1] to [currentYear + 1]
  const startYear = isExpiryDate ? currentYear - 1 : (isRecentDate ? currentYear - 1 : (minYear || currentYear - 20));
  const endYear = isExpiryDate ? currentYear + 4 : (isRecentDate ? currentYear + 1 : (maxYear || currentYear + 10));

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // Sync internal state with external value
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setDay(parts[2]);
      }
    } else {
      setYear('');
      setMonth('');
      setDay('');
    }
  }, [value]);

  const handleUpdate = (y: string, m: string, d: string) => {
    if (y && m && d) {
      onChange(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
    } else {
      onChange('');
    }
  };

  const daysInMonth = (y: string, m: string) => {
    if (!y || !m) return 31;
    return new Date(parseInt(y), parseInt(m), 0).getDate();
  };

  const maxDays = daysInMonth(year, month);

  // If day is selected but exceeds the max days for the newly selected month, correct it
  useEffect(() => {
    if (day && parseInt(day) > maxDays) {
      setDay(maxDays.toString().padStart(2, '0'));
      handleUpdate(year, month, maxDays.toString().padStart(2, '0'));
    }
  }, [month, year, day, maxDays]);

  const baseSelectClass = `flex-1 p-3 border rounded-xl font-bold text-sm outline-none transition-all appearance-none text-center cursor-pointer shadow-sm`;
  const stateClass = error 
    ? 'border-red-500 bg-red-50 focus:border-red-500 text-red-900 ring-1 ring-red-500' 
    : 'border-gray-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500 text-gray-900 hover:border-gray-300';

  return (
    <div className="flex gap-2 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <select
        className={`${baseSelectClass} ${stateClass}`}
        value={day}
        onChange={e => {
          setDay(e.target.value);
          handleUpdate(year, month, e.target.value);
        }}
      >
        <option value="" disabled>{isRTL ? 'يوم' : 'Day'}</option>
        {Array.from({ length: maxDays }, (_, i) => String(i + 1).padStart(2, '0')).map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <select
        className={`${baseSelectClass} ${stateClass}`}
        value={month}
        onChange={e => {
          setMonth(e.target.value);
          handleUpdate(year, e.target.value, day);
        }}
      >
        <option value="" disabled>{isRTL ? 'شهر' : 'Month'}</option>
        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <select
        className={`${baseSelectClass} ${stateClass}`}
        value={year}
        onChange={e => {
          setYear(e.target.value);
          handleUpdate(e.target.value, month, day);
        }}
      >
        <option value="" disabled>{isRTL ? 'سنة' : 'Year'}</option>
        {Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i).map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
};
