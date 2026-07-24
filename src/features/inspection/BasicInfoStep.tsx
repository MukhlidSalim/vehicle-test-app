import React from 'react';
import { InspectionData, VehicleType } from '../../types';
import { VEHICLE_TYPES } from '../../constants';
import { VehicleIllustration } from '../../components/VehicleIllustration';
import { getChecklistForType } from '../../utils/inspectionHelpers';
import { OdometerScanner } from '../../components/OdometerScanner';
import { ScanLine } from 'lucide-react';

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
  const [dateWarning, setDateWarning] = React.useState({ show: false, msg: '' });
  const [scannerField, setScannerField] = React.useState<'currentOdometer' | 'odometer' | null>(null);

  const showDateWarning = (msg: string) => {
    setDateWarning({ show: true, msg });
    setTimeout(() => setDateWarning({ show: false, msg: '' }), 4000);
  };

  const isOdoInvalid = Boolean(
    attemptedStep2 && 
    data.driverInfo.currentOdometer && 
    data.driverInfo.odometer && 
    Number(data.driverInfo.currentOdometer) >= Number(data.driverInfo.odometer)
  );

  const getInputStateClass = (value: string | undefined | null, isError: boolean) => {
    if (isError) return 'border-red-500 bg-red-50 focus:ring-4 focus:ring-red-500/20';
    if (value && value.trim().length > 0) return 'border-green-500 bg-green-50 text-green-900 focus:ring-4 focus:ring-green-500/20 pe-10';
    return 'border-gray-300 bg-gray-50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white';
  };

  const CheckIcon = () => (
    <div className="absolute end-3 top-1/2 -translate-y-1/2 text-green-600 bg-green-100 rounded-full p-0.5 animate-in zoom-in z-10 pointer-events-none">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </div>
  );

  return (
    <div className="space-y-6 relative">
       {dateWarning.show && (
         <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-red-100 text-red-800 px-6 py-4 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-top flex items-center gap-3 border border-red-300">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 animate-pulse flex-shrink-0"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
           <span className="font-black text-sm v-center-cairo">{dateWarning.msg}</span>
         </div>
       )}
       <h2 className="text-lg font-black text-gray-800 border-b border-gray-400 pb-3 v-center-cairo justify-start">
         {data.mode === 'maintenance' ? (isRTL ? 'بيانات قسم الصيانة' : 'Maintenance Info') : t.driver_info}
       </h2>
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-400 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
             {/* Driver Name */}
             <div className="space-y-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  {data.mode === 'maintenance' || data.mode === 'vehicle_only' ? (isRTL ? 'اسم الفاحص' : 'Inspector Name') : t.driver_name} *
                </label>
                <div className="relative">
                  <input
                    id="driver-name"
                    data-error={attemptedStep2 && !data.driverInfo.name ? 'true' : undefined}
                    className={`w-full p-3.5 border rounded-xl outline-none font-bold text-base transition-all duration-300 ${getInputStateClass(data.driverInfo.name, attemptedStep2 && !data.driverInfo.name)}`}
                    value={data.driverInfo.name}
                    onChange={e => setData((p) => ({ 
                      ...p, 
                      driverInfo: { ...p.driverInfo, name: e.target.value } 
                    }))}
                  />
                  {data.driverInfo.name && data.driverInfo.name.trim().length > 0 && <CheckIcon />}
                </div>
             </div>

              {/* Driver Phone Number */}
             <div className="space-y-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  {data.mode === 'maintenance' ? (isRTL ? 'رقم الفاحص' : 'Inspector Phone') : data.mode === 'vehicle_only' ? (isRTL ? 'رقم التواصل' : 'Contact Number') : t.phone_number} *
                </label>
                <div className="relative">
                  <input 
                    id="phone-number" 
                    type="tel" 
                    data-error={attemptedStep2 && !data.driverInfo.phoneNumber ? 'true' : undefined} 
                    className={`w-full p-3.5 border rounded-xl outline-none font-bold text-base transition-all duration-300 ${isRTL ? 'text-right' : 'text-left'} ${getInputStateClass(data.driverInfo.phoneNumber, attemptedStep2 && !data.driverInfo.phoneNumber)}`}
                    value={data.driverInfo.phoneNumber} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setData((p) => ({ ...p, driverInfo: { ...p.driverInfo, phoneNumber: val } }));
                    }} 
                  />
                  {data.driverInfo.phoneNumber && data.driverInfo.phoneNumber.trim().length > 0 && <CheckIcon />}
                </div>
             </div>

             {/* Driver Assistant Name - Hidden in Maintenance and Vehicle Only mode */}
             {data.mode !== 'maintenance' && data.mode !== 'vehicle_only' && (
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

             {/* Driver Assistant Phone Number - Hidden in Maintenance and Vehicle Only mode */}
             {data.mode !== 'maintenance' && data.mode !== 'vehicle_only' && (
               <div className="space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    {t.assistant_phone}
                  </label>
                  <input 
                    type="tel"
                    className={`w-full p-3.5 border border-gray-300 rounded-xl bg-gray-50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white outline-none font-bold text-base transition-all duration-300 ${isRTL ? 'text-right' : 'text-left'}`}
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
                <div className="relative">
                  <input
                    id="plate-number"
                    data-error={attemptedStep2 && !data.driverInfo.plateNumber ? 'true' : undefined}
                    className={`w-full p-3.5 border rounded-xl outline-none font-mono font-bold text-xl uppercase transition-all duration-300 ${getInputStateClass(data.driverInfo.plateNumber, attemptedStep2 && !data.driverInfo.plateNumber)}`}
                    value={data.driverInfo.plateNumber}
                    onChange={e => setData((p) => ({ 
                      ...p, 
                      driverInfo: { ...p.driverInfo, plateNumber: e.target.value } 
                    }))}
                  />
                  {data.driverInfo.plateNumber && data.driverInfo.plateNumber.trim().length > 0 && <CheckIcon />}
                </div>
             </div>

             {/* Conditional Fields based on Mode: Route vs Expiry Date */}
             {(data.mode === 'full' || data.mode === 'driver_only') ? (
               <div className="space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    {isRTL ? 'مسار الرحلة (انطلاق ← وجهة)' : 'Trip Route (Departure ➔ Destination)'} *
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input 
                        type="text"
                        placeholder={isRTL ? 'نقطة الانطلاق' : 'Departure'}
                        data-error={attemptedStep2 && !data.driverInfo.departure ? 'true' : undefined}
                        className={`w-full p-3.5 border rounded-xl outline-none font-bold text-base transition-all duration-300 ${getInputStateClass(data.driverInfo.departure, attemptedStep2 && !data.driverInfo.departure)}`} 
                        value={data.driverInfo.departure || ''} 
                        onChange={e => setData((p) => ({ 
                          ...p, 
                          driverInfo: { ...p.driverInfo, departure: e.target.value } 
                        }))} 
                      />
                      {data.driverInfo.departure && data.driverInfo.departure.trim().length > 0 && <CheckIcon />}
                    </div>
                    <div className="bg-primary-50 text-primary-500 p-2 rounded-lg shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isRTL ? 'rotate-180' : ''}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </div>
                    <div className="relative flex-1">
                      <input 
                        type="text"
                        placeholder={isRTL ? 'الوجهة' : 'Destination'}
                        data-error={attemptedStep2 && !data.driverInfo.destination ? 'true' : undefined}
                        className={`w-full p-3.5 border rounded-xl outline-none font-bold text-base transition-all duration-300 ${getInputStateClass(data.driverInfo.destination, attemptedStep2 && !data.driverInfo.destination)}`} 
                        value={data.driverInfo.destination || ''} 
                        onChange={e => setData((p) => ({ 
                          ...p, 
                          driverInfo: { ...p.driverInfo, destination: e.target.value } 
                        }))} 
                      />
                      {data.driverInfo.destination && data.driverInfo.destination.trim().length > 0 && <CheckIcon />}
                    </div>
                  </div>
               </div>
             ) : (
               <div className="space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    {t.vehicle_expiry_date} *
                  </label>
                  <div className="relative">
                    <input 
                      type="date"
                      data-error={attemptedStep2 && !data.driverInfo.vehicleExpiryDate ? 'true' : undefined}
                      className={`w-full p-3.5 border rounded-xl outline-none font-bold text-base transition-all duration-300 ${
                        data.driverInfo.vehicleExpiryDate && new Date(data.driverInfo.vehicleExpiryDate) < new Date()
                          ? '!border-red-500 !bg-red-50 !text-red-900 focus:ring-4 focus:ring-red-500/20'
                          : getInputStateClass(data.driverInfo.vehicleExpiryDate, attemptedStep2 && !data.driverInfo.vehicleExpiryDate)
                      }`} 
                      value={data.driverInfo.vehicleExpiryDate || ''} 
                      onChange={e => {
                        const val = e.target.value;
                        if (val && new Date(val) < new Date()) {
                          showDateWarning(isRTL ? 'تنبيه: رخصة المركبة منتهية الصلاحية!' : 'Warning: Vehicle license is expired!');
                        }
                        setData((p) => ({ 
                          ...p, 
                          driverInfo: { ...p.driverInfo, vehicleExpiryDate: val } 
                        }));
                      }} 
                    />
                    {data.driverInfo.vehicleExpiryDate && data.driverInfo.vehicleExpiryDate.trim().length > 0 && new Date(data.driverInfo.vehicleExpiryDate) >= new Date() && <CheckIcon />}
                  </div>
               </div>
             )}

             {/* Current Odometer */}
             <div className="space-y-2 relative">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    {isRTL ? 'قراءة العداد الحالية (كم)' : 'Current Odometer (KM)'} *
                  </label>
                  <button type="button" onClick={() => setScannerField('currentOdometer')} className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-bold text-[10px] bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-full transition-colors">
                    <ScanLine size={12} />
                    {isRTL ? 'مسح بالكاميرا' : 'Scan'}
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type="number" 
                    data-error={attemptedStep2 && !data.driverInfo.currentOdometer ? 'true' : undefined} 
                    className={`w-full p-3.5 border rounded-xl outline-none font-bold text-base font-mono transition-all duration-300 ${getInputStateClass(data.driverInfo.currentOdometer, attemptedStep2 && !data.driverInfo.currentOdometer)} ${
                      isOdoInvalid && data.driverInfo.currentOdometer ? '!border-orange-500 !bg-orange-50 !text-orange-900 focus:ring-orange-500/20' : ''
                    }`} 
                    value={data.driverInfo.currentOdometer || ''} 
                    onChange={e => setData((p) => ({ ...p, driverInfo: { ...p.driverInfo, currentOdometer: e.target.value } }))} 
                  />
                  {(data.driverInfo.currentOdometer && data.driverInfo.odometer && !isOdoInvalid) && <CheckIcon />}
                </div>
             </div>

             {/* Odometer at Next Maintenance */}
             <div className="space-y-2 relative">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    {isRTL ? 'قراءة العداد عند موعد الصيانة القادمة (كم)' : 'Odometer at next maintenance (KM)'} *
                  </label>
                  <button type="button" onClick={() => setScannerField('odometer')} className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-bold text-[10px] bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-full transition-colors">
                    <ScanLine size={12} />
                    {isRTL ? 'مسح بالكاميرا' : 'Scan'}
                  </button>
                </div>
                <div className="relative">
                  <input 
                    id="odometer" 
                    type="number" 
                    data-error={(attemptedStep2 && !data.driverInfo.odometer) ? 'true' : undefined} 
                    className={`w-full p-3.5 border rounded-xl outline-none font-bold text-base font-mono transition-all duration-300 ${getInputStateClass(data.driverInfo.odometer, attemptedStep2 && !data.driverInfo.odometer)} ${
                      isOdoInvalid && data.driverInfo.odometer ? '!border-orange-500 !bg-orange-50 !text-orange-900 focus:ring-orange-500/20' : ''
                    }`} 
                    value={data.driverInfo.odometer || ''} 
                    onChange={e => setData((p) => ({ 
                      ...p, 
                      driverInfo: { ...p.driverInfo, odometer: e.target.value } 
                    }))} 
                  />
                  {(data.driverInfo.currentOdometer && data.driverInfo.odometer && !isOdoInvalid) && <CheckIcon />}
                </div>
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
                        checklist: getChecklistForType(vt.value, p.mode)
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

       {scannerField && (
         <OdometerScanner
           isRTL={isRTL}
           onClose={() => setScannerField(null)}
           onScan={(value) => {
             setData(p => ({
               ...p,
               driverInfo: {
                 ...p.driverInfo,
                 [scannerField]: value
               }
             }));
             setScannerField(null);
           }}
         />
       )}
    </div>
  );
};
