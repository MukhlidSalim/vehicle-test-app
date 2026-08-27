import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  labelAr: string;
  labelEn: string;
  icon?: React.FC<any>;
}

interface CustomDropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (val: string) => void;
  isRTL?: boolean;
  error?: boolean;
  placeholder?: string;
  icon?: React.FC<any>;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
  value, 
  options, 
  onChange, 
  isRTL = true, 
  error = false,
  placeholder,
  icon: MainIcon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownDirection, setDropdownDirection] = useState<'down' | 'up'>('down');

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
      if (spaceBelow < 250) {
        setDropdownDirection('up');
      } else {
        setDropdownDirection('down');
      }
    }
  }, [isOpen]);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between py-3.5 px-4 border rounded-xl bg-white transition-all duration-300 outline-none
          ${error ? 'border-red-500 ring-4 ring-red-500/20' : 'border-gray-200 hover:border-primary-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'}
          ${isOpen ? 'border-primary-500 ring-4 ring-primary-500/20' : ''}
        `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {MainIcon && !selectedOption?.icon && <MainIcon size={18} className="text-primary-500 shrink-0" />}
          {selectedOption?.icon && <selectedOption.icon size={18} className="text-primary-500 shrink-0" />}
          
          <span className={`font-bold text-sm truncate ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
            {selectedOption ? (isRTL ? selectedOption.labelAr : selectedOption.labelEn) : (placeholder || (isRTL ? 'اختر...' : 'Select...'))}
          </span>
        </div>
        <ChevronDown size={18} className={`text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-full bg-white/95 backdrop-blur-md border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-fade-in-up ${dropdownDirection === 'up' ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top'}`}>
          <div className="max-h-60 overflow-y-auto py-2 scrollbar-hide">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors
                  ${value === opt.value ? 'bg-primary-50 text-primary-700 font-black' : 'text-gray-700 font-bold hover:bg-gray-50'}
                `}
              >
                <div className="flex items-center gap-3">
                  {opt.icon && <opt.icon size={16} className={value === opt.value ? 'text-primary-600' : 'text-gray-400'} />}
                  <span>{isRTL ? opt.labelAr : opt.labelEn}</span>
                </div>
                {value === opt.value && <Check size={16} className="text-primary-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
