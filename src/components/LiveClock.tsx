import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { formatDateDDMMYYYY } from '../utils/dateHelpers';

interface LiveClockProps {
  isRTL: boolean;
}

/**
 * LiveClock displays the current real-time clock and date, updating every second.
 */
export const LiveClock: React.FC<LiveClockProps> = ({ isRTL }) => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-start md:items-end text-white">
      <div className="flex items-center gap-2 font-bold text-lg md:text-xl">
        <Clock size={18} className="text-primary-400" />
        <span className="font-mono tracking-tighter">
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-[12px] font-bold opacity-80 mt-0.5 uppercase tracking-widest">
        <Calendar size={15} />
        <span>
          {formatDateDDMMYYYY(time)}
        </span>
      </div>
    </div>
  );
};
