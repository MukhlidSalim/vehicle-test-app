import React, { useState, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import { formatDateDDMMYYYY } from '../utils/dateHelpers';

interface LiveClockProps {
  isRTL: boolean;
}

export const LiveClock: React.FC<LiveClockProps> = ({ isRTL }) => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours12 = time.getHours() % 12 || 12;
  const hours = hours12.toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const ampm = time.getHours() >= 12 ? (isRTL ? 'م' : 'PM') : (isRTL ? 'ص' : 'AM');

  return (
    <div className="flex flex-col items-start md:items-end justify-center">
      {/* Elegant Minimalist Typographic Clock */}
      <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 py-3 px-5 rounded-2xl shadow-lg transition-all hover:bg-white/10">
        
        {/* Large Thin Time */}
        <div className="flex items-baseline gap-1.5 text-white" dir="ltr">
          <span className="text-4xl md:text-5xl font-light tracking-tighter tabular-nums drop-shadow-md">
            {hours}<span className="opacity-50 mx-0.5 animate-pulse">:</span>{minutes}
          </span>
          <span className="text-sm md:text-base font-bold text-primary-200 uppercase tracking-widest drop-shadow-sm">
            {ampm}
          </span>
        </div>
        
        {/* Subtle Divider */}
        <div className="w-px h-10 bg-white/20 hidden sm:block"></div>
        
        {/* Right Side: Live Indicator & Date */}
        <div className="flex flex-col items-start gap-1.5">
           
           {/* Live Badge */}
           <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-full shadow-inner border border-white/5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
              <span className="text-[9px] font-black text-green-400 uppercase tracking-widest opacity-90">
                {isRTL ? 'مباشر' : 'Live'}
              </span>
           </div>
           
           {/* Date */}
           <div className="flex items-center gap-1.5 text-primary-100 pl-1">
             <CalendarDays size={13} className="opacity-70" />
             <span className="text-xs font-semibold tracking-wide">
               {formatDateDDMMYYYY(time)}
             </span>
           </div>

        </div>
      </div>
    </div>
  );
};
