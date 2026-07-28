import React from 'react';
import { Car } from 'lucide-react';

interface BrandLogoProps {
  onClick: () => void;
}

/**
 * BrandLogo displays the branding logo of the VI system.
 * Clicking on it fires the onClick handler (typically navigating back home).
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ onClick }) => (
  <div 
    className="flex items-center gap-2.5 cursor-pointer group select-none active:scale-95 transition-transform duration-200" 
    onClick={onClick}
  >
    <div className="relative">
      <div className="bg-primary-600 p-1.5 md:p-2 rounded-xl text-white shadow-lg shadow-primary-100 group-hover:rotate-12 transition-transform duration-300">
        <Car size={20} strokeWidth={2.5} />
      </div>
      <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
    </div>
    <div className="flex flex-col -space-y-1">
      <div className="flex items-baseline gap-0.5">
        <span className="text-base md:text-xl font-black text-gray-900 tracking-tighter">VI</span>
        <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mb-0.5 hidden md:block"></span>
      </div>
      <span className="text-[8px] md:text-[9px] font-black text-primary-600 tracking-[0.3em] uppercase">SYSTEM</span>
    </div>
  </div>
);
