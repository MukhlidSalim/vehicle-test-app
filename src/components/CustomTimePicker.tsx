import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface Props {
  value?: string;
  onChange: (value: string) => void;
  error?: boolean;
  isRTL?: boolean;
}

type PickerMode = 'hours' | 'minutes';

export const CustomTimePicker: React.FC<Props> = ({ 
  value, 
  onChange, 
  error = false, 
  isRTL = true 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownDirection, setDropdownDirection] = useState<'down' | 'up'>('down');
  
  // State for internal logic
  const [hour12, setHour12] = useState<number>(12);
  const [minute, setMinute] = useState<number>(0);
  const [isPM, setIsPM] = useState<boolean>(false);
  const [mode, setMode] = useState<PickerMode>('hours');

  // Parse external value into internal state on open or mount
  useEffect(() => {
    if (value) {
      const parts = value.split(':');
      if (parts.length >= 2) {
        let h24 = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        
        if (!isNaN(h24) && !isNaN(m)) {
          setMinute(m);
          setIsPM(h24 >= 12);
          if (h24 === 0) setHour12(12);
          else if (h24 > 12) setHour12(h24 - 12);
          else setHour12(h24);
        }
      }
    } else {
      // Default to current time if no value
      const now = new Date();
      let h24 = now.getHours();
      setMinute(now.getMinutes());
      setIsPM(h24 >= 12);
      if (h24 === 0) setHour12(12);
      else if (h24 > 12) setHour12(h24 - 12);
      else setHour12(h24);
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

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 300) {
        setDropdownDirection('up');
      } else {
        setDropdownDirection('down');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const id = mode === 'hours' ? 'selected-hour' : 'selected-minute';
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }
  }, [isOpen, mode]);

  const triggerChange = (h12: number, m: number, pm: boolean) => {
    let h24 = h12;
    if (pm && h12 !== 12) h24 += 12;
    else if (!pm && h12 === 12) h24 = 0;

    const formattedH = String(h24).padStart(2, '0');
    const formattedM = String(m).padStart(2, '0');
    onChange(`${formattedH}:${formattedM}`);
  };

  const handleHourSelect = (h: number) => {
    setHour12(h);
    triggerChange(h, minute, isPM);
    setMode('minutes');
  };

  const handleMinuteSelect = (m: number) => {
    setMinute(m);
    triggerChange(hour12, m, isPM);
    setIsOpen(false);
  };

  const toggleAmPm = () => {
    const newIsPM = !isPM;
    setIsPM(newIsPM);
    triggerChange(hour12, minute, newIsPM);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Input Field Simulator */}
      <div
        onClick={() => {
          if (!isOpen) {
            setMode('hours');
            setIsOpen(true);
          } else {
            setIsOpen(false);
          }
        }}
        className={`w-full flex items-center justify-between gap-2 py-3 px-4 border rounded-xl bg-white transition-all duration-300 outline-none cursor-pointer select-none
          ${error ? 'border-red-500 ring-4 ring-red-500/20' : 'border-gray-200 hover:border-primary-400 focus:border-primary-500'}
          ${isOpen ? 'border-primary-500 ring-4 ring-primary-500/20' : ''}
        `}
        dir="ltr"
      >
        <Clock size={18} className="text-primary-500 shrink-0" />
        
        {/* Clickable segments */}
        <div className="flex-1 flex items-center justify-center gap-1 font-black text-xl tracking-wider text-gray-800">
          <span 
            className={`px-3 py-1 rounded-lg transition-colors hover:bg-gray-100 ${isOpen && mode === 'hours' ? 'bg-primary-100 text-primary-700' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setMode('hours');
              setIsOpen(true);
            }}
          >
            {String(hour12).padStart(2, '0')}
          </span>
          <span className="text-gray-400 pb-1">:</span>
          <span 
            className={`px-3 py-1 rounded-lg transition-colors hover:bg-gray-100 ${isOpen && mode === 'minutes' ? 'bg-primary-100 text-primary-700' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setMode('minutes');
              setIsOpen(true);
            }}
          >
            {String(minute).padStart(2, '0')}
          </span>
        </div>

        {/* AM / PM Toggle */}
        <div 
          className="shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-black text-sm transition-colors active:scale-95"
          onClick={(e) => {
            e.stopPropagation();
            toggleAmPm();
          }}
        >
          {isPM ? (isRTL ? 'م' : 'PM') : (isRTL ? 'ص' : 'AM')}
        </div>
      </div>

      {/* Calendar-Style Grid Dropdown */}
      {isOpen && (
        <div className={`absolute z-50 w-full min-w-[280px] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up p-4 select-none ${dropdownDirection === 'up' ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top'}`} dir="ltr">
          
          <div className="text-center mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
            {mode === 'hours' 
              ? (isRTL ? 'اختر الساعة' : 'Select Hour') 
              : (isRTL ? 'اختر الدقيقة' : 'Select Minute')}
          </div>

          <div className="bg-gray-50 rounded-xl p-2 border border-gray-100 max-h-[260px] overflow-y-auto scrollbar-hide">
            {/* Hours Mode (4x3 Grid) */}
            {mode === 'hours' && (
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 12 }, (_, i) => {
                  const h = i === 0 ? 12 : i;
                  const isSelected = hour12 === h;
                  return (
                    <div
                      key={`h-${h}`}
                      id={isSelected ? 'selected-hour' : undefined}
                      onClick={() => handleHourSelect(h)}
                      className={`h-12 rounded-lg flex items-center justify-center font-black text-lg cursor-pointer transition-all active:scale-95
                        ${isSelected ? 'bg-primary-500 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300 hover:bg-primary-50'}
                      `}
                    >
                      {h}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Minutes Mode (6x10 Grid) */}
            {mode === 'minutes' && (
              <div className="grid grid-cols-6 gap-1.5">
                {Array.from({ length: 60 }, (_, i) => {
                  const m = i;
                  const isSelected = minute === m;
                  const isMajor = m % 5 === 0;
                  return (
                    <div
                      key={`m-${m}`}
                      id={isSelected ? 'selected-minute' : undefined}
                      onClick={() => handleMinuteSelect(m)}
                      className={`h-9 rounded-md flex items-center justify-center font-bold text-sm cursor-pointer transition-all active:scale-95
                        ${isSelected ? 'bg-primary-500 text-white shadow-md z-10 scale-110' : 'bg-white border hover:border-primary-300 hover:bg-primary-50'}
                        ${!isSelected && isMajor ? 'border-gray-300 text-gray-900 bg-gray-100' : ''}
                        ${!isSelected && !isMajor ? 'border-gray-100 text-gray-500' : ''}
                      `}
                    >
                      {String(m).padStart(2, '0')}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
