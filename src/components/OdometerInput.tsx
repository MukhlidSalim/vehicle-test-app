import React, { useState, useEffect } from 'react';
import { Gauge } from 'lucide-react';

interface OdometerInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
  isRTL?: boolean;
}

export const OdometerInput: React.FC<OdometerInputProps> = ({ value, onChange, error, isRTL = true }) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (!value) {
      setDisplayValue('');
      return;
    }
    const num = value.replace(/\D/g, '');
    if (num) {
      setDisplayValue(Number(num).toLocaleString('en-US'));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw) {
      setDisplayValue(Number(raw).toLocaleString('en-US'));
      onChange(raw);
    } else {
      setDisplayValue('');
      onChange('');
    }
  };

  return (
    <div className="relative flex items-center">
      <Gauge size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        dir="ltr"
        className={`w-full pl-10 pr-14 ${isRTL ? 'text-right' : 'text-left'} py-3 border rounded-xl outline-none font-black text-lg tracking-wider text-gray-800 transition-all duration-300 ${
          error ? 'border-red-500 bg-red-50 focus:ring-4 focus:ring-red-500/20' : 'border-gray-200 bg-gray-50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white'
        }`}
        placeholder="0"
      />
      <div className="absolute right-3 text-[10px] font-black text-gray-400 select-none bg-gray-200/50 px-2 py-1 rounded-md pointer-events-none">
        KM
      </div>
    </div>
  );
};
