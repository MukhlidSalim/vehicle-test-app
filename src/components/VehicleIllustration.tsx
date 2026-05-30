import React from 'react';
import { VehicleType } from '../types';
import { VEHICLE_SELECTION_IMAGES } from '../constants';

interface VehicleIllustrationProps {
  type: VehicleType;
  size?: number;
  className?: string;
}

/**
 * VehicleIllustration displays a graphical representation of the selected vehicle type.
 */
export const VehicleIllustration: React.FC<VehicleIllustrationProps> = ({ 
  type, 
  size = 100, 
  className = "" 
}) => {
  const imageUrl = VEHICLE_SELECTION_IMAGES[type];
  return (
    <div 
      className={`flex items-center justify-center rounded-lg bg-white overflow-hidden ${className} border border-gray-300 shadow-sm`} 
      style={{ width: size, height: size * 0.75 }}
    >
       <img 
         src={imageUrl} 
         alt={type} 
         className="w-full h-full object-contain" 
         crossOrigin="anonymous" 
         loading="eager" 
       />
    </div>
  );
};
