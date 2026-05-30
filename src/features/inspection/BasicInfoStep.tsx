import React from 'react';
import { InspectionData, VehicleType } from '../../types';
import { VEHICLE_TYPES } from '../../constants';
import { VehicleIllustration } from '../../components/VehicleIllustration';
import { getChecklistForType } from '../../utils/inspectionHelpers';

interface BasicInfoStepProps {
  t: any;
  isRTL: boolean;
  data: InspectionData;
  setData: React.Dispatch<React.SetStateAction<InspectionData>>;
  attemptedStep2: boolean;
}

/**
 * BasicInfoStep renders Step 2 of the inspection process: Basic Information Form.
 * Captures driver name, assistant name, plate number, phone number, odometer readings, and vehicle type.
 */
export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  t,
  isRTL,
  data,
  setData,
  attemptedStep2,
}) => {
  return (
    <div className="space-y-6">
       <h2 className="text-lg font-black text-gray-800 border-b border-gray-400 pb-3 v-center-cairo justify-start">
         {data.mode === 'maintenance' ? (isRTL ? 'بيانات قسم الصيانة' : 'Maintenance Info') : t.driver_info}
       </h2>
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-400 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
             {/* Driver Name */}
             <div className="space-y-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  {data.mode === 'maintenance' ? (isRTL ? 'اسم الفاحص' : 'Inspector Name') : t.driver_name} *
                </label>
                <input
                  id="driver-name"
                  data-error={attemptedStep2 && !data.driverInfo.name ? 'true' : undefined}
                  className={`w-full p-3.5 border rounded-xl bg-gray-50 focus:border-primary-500 focus:bg-white outline-none font-bold text-base transition-all ${
                    attemptedStep2 && !data.driverInfo.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  value={data.driverInfo.name}
                  onChange={e => setData((p) => ({ 
                    ...p, 
                    driverInfo: { ...p.driverInfo, name: e.target.value } 
                  }))}
                />
             </div>

             {/* Driver Phone Number */}
             <div className="space-y-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  {t.phone_number} *
                </label>
                <input 
                  id="phone-number" 
                  type="tel" 
                  data-error={attemptedStep2 && !data.driverInfo.phoneNumber ? 'true' : undefined} 
                  className={`w-full p-3.5 border rounded-xl bg-gray-50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white outline-none font-bold text-base transition-all duration-300 ${
                    attemptedStep2 && !data.driverInfo.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`} 
                  value={data.driverInfo.phoneNumber} 
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    setData((p) => ({ ...p, driverInfo: { ...p.driverInfo, phoneNumber: val } }));
                  }} 
                />
             </div>

             {/* Driver Assistant Name - Hidden in Maintenance mode */}
             {data.mode !== 'maintenance' && (
               <div className="space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    {t.assistant_name}
                  </label>
                  <input 
                    className="w-full p-3.5 border border-gray-300 rounded-xl bg-gray-50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white outline-none font-bold text-base transition-all duration-300" 
                    value={data.driverInfo.assistantName || ''} 
                    onChange={e => setData((p) => ({ 
                      ...p, 
                      driverInfo: { ...p.driverInfo, assistantName: e.target.value } 
                    }))} 
                  />
               </div>
             )}

             {/* Driver Assistant Phone Number - Hidden in Maintenance mode */}
             {data.mode !== 'maintenance' && (
               <div className="space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    {t.assistant_phone}
                  </label>
                  <input 
                    type="tel"
                    className="w-full p-3.5 border border-gray-300 rounded-xl bg-gray-50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white outline-none font-bold text-base transition-all duration-300" 
                    value={data.driverInfo.assistantPhone || ''} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setData((p) => ({ ...p, driverInfo: { ...p.driverInfo, assistantPhone: val } }));
                    }} 
                  />
               </div>
             )}

             {/* Plate Number */}
             <div className="space-y-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  {t.plate_number} *
                </label>
                <input
                  id="plate-number"
                  data-error={attemptedStep2 && !data.driverInfo.plateNumber ? 'true' : undefined}
                  className={`w-full p-3.5 border rounded-xl bg-gray-50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white outline-none font-mono font-bold text-xl uppercase transition-all duration-300 ${
                    attemptedStep2 && !data.driverInfo.plateNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  value={data.driverInfo.plateNumber}
                  onChange={e => setData((p) => ({ 
                    ...p, 
                    driverInfo: { ...p.driverInfo, plateNumber: e.target.value } 
                  }))}
                />
             </div>

             {/* Vehicle Expiry Date */}
             <div className="space-y-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  {t.vehicle_expiry_date}
                </label>
                <input 
                  type="date"
                  className="w-full p-3.5 border border-gray-300 rounded-xl bg-gray-50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white outline-none font-bold text-base transition-all duration-300" 
                  value={data.driverInfo.vehicleExpiryDate || ''} 
                  onChange={e => setData((p) => ({ 
                    ...p, 
                    driverInfo: { ...p.driverInfo, vehicleExpiryDate: e.target.value } 
                  }))} 
                />
             </div>

             {/* Current Odometer (Stored in nextInspectionDate for backwards compatibility) */}
             <div className="space-y-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  {isRTL ? 'قراءة العداد الحالية (كم)' : 'Current odometer reading (KM)'} *
                </label>
                <input 
                  id="next-inspection-number" 
                  type="number" 
                  inputMode="numeric" 
                  data-error={attemptedStep2 && !data.driverInfo.nextInspectionDate ? 'true' : undefined} 
                  className={`w-full p-3.5 border rounded-xl bg-gray-50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white outline-none font-bold text-base transition-all duration-300 ${
                    attemptedStep2 && !data.driverInfo.nextInspectionDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`} 
                  value={data.driverInfo.nextInspectionDate} 
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    setData((p) => ({ ...p, driverInfo: { ...p.driverInfo, nextInspectionDate: val } }));
                  }} 
                />
             </div>

             {/* Odometer at Next Maintenance (Stored in odometer for backwards compatibility) */}
             <div className="space-y-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  {isRTL ? 'قراءة العداد عند موعد الصيانة القادمة (كم)' : 'Odometer at next maintenance (KM)'} *
                </label>
                <input 
                  id="odometer" 
                  type="number" 
                  data-error={attemptedStep2 && !data.driverInfo.odometer ? 'true' : undefined} 
                  className={`w-full p-3.5 border rounded-xl bg-gray-50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white outline-none font-bold text-base font-mono transition-all duration-300 ${
                    attemptedStep2 && !data.driverInfo.odometer ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`} 
                  value={data.driverInfo.odometer} 
                  onChange={e => setData((p) => ({ 
                    ...p, 
                    driverInfo: { ...p.driverInfo, odometer: e.target.value } 
                  }))} 
                />
             </div>
          </div>


          {/* Vehicle Type Selection */}
          <div className="space-y-4">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
              {t.vehicle_type} *
            </label>
            <div 
              id="vehicle-type" 
              data-error={attemptedStep2 && !data.driverInfo.vehicleType ? 'true' : undefined} 
              className="grid grid-cols-2 md:grid-cols-3 gap-3"
            >
               {VEHICLE_TYPES.map(vt => {
                  const isSelected = data.driverInfo.vehicleType === vt.value;
                  return (
                    <button 
                      key={vt.value} 
                      onClick={() => setData((p) => ({ 
                        ...p, 
                        driverInfo: { ...p.driverInfo, vehicleType: vt.value },
                        checklist: getChecklistForType(vt.value)
                      }))} 
                      className={`relative group flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected 
                          ? 'border-primary-500 bg-primary-50 shadow-md' 
                          : 'border-gray-300 bg-white hover:border-primary-100'
                      }`}
                    >
                       <div className={`transition-transform duration-300 ${isSelected ? 'scale-105' : 'scale-100'}`}>
                         <VehicleIllustration type={vt.value} size={70} />
                       </div>
                       <span className={`text-[10px] font-black uppercase text-center mt-3 transition-colors ${
                         isSelected ? 'text-primary-800' : 'text-gray-400'
                       } v-center-cairo`}>
                         {isRTL ? vt.labelAr : vt.labelEn}
                       </span>
                    </button>
                  );
               })}
            </div>
          </div>
       </div>
    </div>
  );
};
