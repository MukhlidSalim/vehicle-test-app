import React from 'react';

interface BrandLogoProps {
  onClick: () => void;
}

/**
 * Premium BrandLogo 
 * Uses the custom 3D VIS logo provided by the user.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ onClick }) => (
  <div 
    className="flex items-center justify-center cursor-pointer group select-none transition-transform duration-300 active:scale-95" 
    onClick={onClick}
    title="الرئيسية | Home"
  >
    <div className="relative flex items-center justify-center">
      {/* 
        Custom Logo Image
        Added drop-shadow for depth, and scale transition for a premium interactive feel.
      */}
      <img 
        src="/assest/vehicles/VIS logo.png" 
        alt="VIS System Logo" 
        className="w-24 md:w-32 lg:w-36 scale-[1.3] md:scale-[1.5] object-contain drop-shadow-sm group-hover:drop-shadow-[0_4px_12px_rgba(2,132,199,0.3)] group-hover:scale-[1.4] md:group-hover:scale-[1.6] transition-all duration-500"
      />
      
      {/* 
        Live Monitoring Radar Dot (Hidden by default, reveals softly on hover)
        This keeps the "Smart System" feel alive without cluttering the 3D logo.
      */}
      <div className="absolute -top-1 -right-2 flex items-center justify-center scale-[0.6] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute w-3 h-3 bg-green-400/80 rounded-full animate-ping"></div>
        <div className="relative w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
      </div>
    </div>
  </div>
);
