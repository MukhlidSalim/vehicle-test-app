import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
  isRTL?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, error, isRTL = true }) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    let v = value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 4) {
      v = v.slice(0, 4) + ' ' + v.slice(4);
    }
    setDisplayValue(v);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
    let formatted = raw;
    
    if (raw.length > 4) {
      formatted = raw.slice(0, 4) + ' ' + raw.slice(4);
    } else if (raw.length === 4 && (e.nativeEvent as any).data !== null) {
      formatted += ' ';
    }
    
    setDisplayValue(formatted);
    onChange(raw);
  };

  return (
    <div className="relative flex items-center">
      <Phone size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
      
      <input
        type="tel"
        value={displayValue}
        onChange={handleChange}
        dir="ltr"
        className={`w-full pl-10 pr-4 ${isRTL ? 'text-right' : 'text-left'} py-3 border rounded-xl outline-none font-black text-lg tracking-wider text-gray-800 transition-all duration-300 ${
          error ? 'border-red-500 bg-red-50 focus:ring-4 focus:ring-red-500/20' : 'border-gray-200 bg-gray-50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white'
        }`}
        placeholder="9123 4567"
      />
    </div>
  );
};
