import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface Props {
  value?: string;
  onChange: (value: string) => void;
  error?: boolean;
  isRTL?: boolean;
}

export const CustomTimePicker: React.FC<Props> = ({ 
  value, 
  onChange, 
  error = false, 
  isRTL = true 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');

  useEffect(() => {
    if (value) {
      const parts = value.split(':');
      if (parts.length >= 2) {
        setHour(parts[0]);
        setMinute(parts[1]);
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdate = (h: string, m: string) => {
    setHour(h);
    setMinute(m);
    onChange(`${h}:${m}`);
  };

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 border rounded-xl bg-white transition-all duration-300 outline-none
          ${error ? 'border-red-500 ring-4 ring-red-500/20' : 'border-gray-200 hover:border-primary-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'}
          ${isOpen ? 'border-primary-500 ring-4 ring-primary-500/20' : ''}
        `}
        dir="ltr"
      >
        <Clock size={18} className="text-primary-500" />
        <span className="font-black text-lg tracking-widest text-gray-800">
          {value ? value : '--:--'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up origin-top p-4 flex gap-4 justify-center" dir="ltr">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-gray-400 mb-2">{isRTL ? 'ساعة' : 'Hour'}</span>
            <div className="h-40 overflow-y-auto scrollbar-hide snap-y snap-mandatory border-y border-gray-100 px-2 relative" 
                 style={{ scrollBehavior: 'smooth' }}>
              {hours.map(h => (
                <div 
                  key={`h-${h}`} 
                  className={`h-10 flex items-center justify-center snap-center cursor-pointer font-black text-xl transition-all ${h === hour ? 'text-primary-600 scale-110' : 'text-gray-300 hover:text-gray-500'}`}
                  onClick={() => handleUpdate(h, minute)}
                >
                  {h}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
             <span className="text-2xl font-black text-gray-200 mt-6">:</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-gray-400 mb-2">{isRTL ? 'دقيقة' : 'Min'}</span>
            <div className="h-40 overflow-y-auto scrollbar-hide snap-y snap-mandatory border-y border-gray-100 px-2 relative"
                 style={{ scrollBehavior: 'smooth' }}>
              {minutes.map(m => (
                <div 
                  key={`m-${m}`} 
                  className={`h-10 flex items-center justify-center snap-center cursor-pointer font-black text-xl transition-all ${m === minute ? 'text-primary-600 scale-110' : 'text-gray-300 hover:text-gray-500'}`}
                  onClick={() => handleUpdate(hour, m)}
                >
                  {m}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
