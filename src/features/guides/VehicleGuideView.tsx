import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VEHICLE_GUIDES } from '../../constants';

interface VehicleGuideViewProps {
  t: any;
  isRTL: boolean;
  onBack: () => void;
}

/**
 * VehicleGuideView displays tips regarding vehicle safety, engine fluids, brakes, and electrical checks.
 */
export const VehicleGuideView: React.FC<VehicleGuideViewProps> = ({ 
  t, 
  isRTL, 
  onBack 
}) => {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between border-b border-gray-400 pb-4">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onBack} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={isRTL ? 'عودة' : 'Back'}
          >
            {isRTL ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
          <h2 className="text-xl font-black text-gray-900">{t.vehicle_guide}</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
        {VEHICLE_GUIDES.map((guide, idx) => (
          <div 
            key={idx} 
            className="bg-white p-6 rounded-2xl border border-gray-400 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`p-3 rounded-xl w-fit mb-4 ${guide.color}`}>
              <guide.icon size={24} />
            </div>
            <h3 className="font-black text-lg text-gray-900 mb-2">
              {t[guide.titleKey as keyof typeof t]}
            </h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              {t[guide.textKey as keyof typeof t]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
