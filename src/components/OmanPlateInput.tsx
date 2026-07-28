import React, { useState, useEffect } from 'react';
import { Hash } from 'lucide-react';

interface OmanPlateInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
  isRTL?: boolean;
}

export const OmanPlateInput: React.FC<OmanPlateInputProps> = ({ value, onChange, error, isRTL = true }) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase();
    
    // Extract numbers and letters
    const numbers = raw.replace(/[^0-9]/g, '').slice(0, 5);
    const letters = raw.replace(/[^A-Z]/g, '').slice(0, 2);
    
    let formatted = numbers;
    
    // Add space if there are letters, or if the user typed a space at the end of numbers
    if (letters.length > 0) {
      formatted += ' ' + letters;
    } else if (raw.endsWith(' ') && numbers.length > 0) {
      formatted += ' ';
    } else if (numbers.length === 5 && (e.nativeEvent as any).data !== null) {
      // automatically add space after 5 digits if typing forward
      formatted += ' ';
    }

    setDisplayValue(formatted);
    onChange(formatted);
  };

  return (
    <div className="relative flex items-center">
      <Hash size={16} className={`absolute ${isRTL ? 'right-3' : 'left-3'} text-gray-400 pointer-events-none`} />
      
      {/* Oman License Plate Side Badge */}
      <div className={`absolute ${isRTL ? 'left-2' : 'right-2'} h-9 w-6 bg-yellow-400 rounded-md flex flex-col items-center justify-center border-2 border-yellow-500/80 shadow-sm pointer-events-none`}>
        <span className="text-[5px] font-black text-black leading-tight">OMAN</span>
        <span className="text-[5px] font-black text-black leading-tight mt-1">عمان</span>
      </div>
      
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        dir="ltr"
        className={`w-full ${isRTL ? 'pr-10 pl-12' : 'pl-10 pr-12'} py-3 border rounded-xl outline-none font-black text-lg tracking-[0.2em] text-gray-800 transition-all duration-300 uppercase ${
          error ? 'border-red-500 bg-red-50 focus:ring-4 focus:ring-red-500/20' : 'border-gray-200 bg-gray-50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white'
        }`}
        placeholder="12345 AB"
      />
    </div>
  );
};
