import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { InspectionData, VehicleType } from '../../types';
import { VEHICLE_TYPES } from '../../constants';
import { VehicleIllustration } from '../../components/VehicleIllustration';
import { getChecklistForType } from '../../utils/inspectionHelpers';
import { CustomDatePicker } from '../../components/CustomDatePicker';
import { PhoneInput } from '../../components/PhoneInput';
import { OmanPlateInput } from '../../components/OmanPlateInput';
import { OdometerInput } from '../../components/OdometerInput';

interface BasicInfoStepProps {
  t: any;
  isRTL: boolean;
  data: InspectionData;
  setData: React.Dispatch<React.SetStateAction<InspectionData>>;
  attemptedStep2: boolean;
  odoAcknowledged?: boolean;
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
  odoAcknowledged,
}) => {
  const [dateWarning, setDateWarning] = React.useState({ show: false, msg: '' });
  const [pendingVehicleType, setPendingVehicleType] = React.useState<VehicleType | null>(null);
  
  const showDateWarning = (msg: string) => {
    setDateWarning({ show: true, msg });
    setTimeout(() => setDateWarning({ show: false, msg: '' }), 4000);
  };

  const isOdoInvalid = Boolean(
    attemptedStep2 && 
    !odoAcknowledged &&
    data.driverInfo.currentOdometer && 
    data.driverInfo.odometer && 
    Number(data.driverInfo.currentOdometer) >= Number(data.driverInfo.odometer)
  );

  const getInputStateClass = (value: string | undefined | null, isError: boolean) => {
    if (isError) return 'border-red-500 bg-red-50 focus:ring-4 focus:ring-red-500/20';
    if (value && value.trim().length > 0) return 'border-green-500 bg-green-50 focus:ring-4 focus:ring-green-500/20';
    return 'border-gray-300 bg-gray-50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white';
  };

  const CheckIcon = () => (
    <div className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 text-green-500 bg-green-100 rounded-full p-0.5 shadow-sm">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </div>
  );

  return (
    <div className="space-y-8 pb-32" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/50 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shadow-sm border border-primary-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z"/><path d="M18 18V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12"/></svg>
          </div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">
            {t.driver_info}
          </h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
             <div className="space-y-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest" htmlFor="driver-name">
                  {data.mode === 'maintenance' ? (isRTL ? 'اسم الفاحص' : 'Inspector Name') : data.mode === 'vehicle_only' ? (isRTL ? 'اسم الشخص المتواصل' : 'Contact Person Name') : t.driver_name} *
                </label>
                <div className="relative">
                  <input
                    id="driver-name"
                    data-error={attemptedStep2 && !data.driverInfo.name ? 'true' : undefined}
                    className={`w-full p-3.5 border rounded-xl outline-none font-bold text-base transition-all duration-300 ${getInputStateClass(data.driverInfo.name, attemptedStep2 && !data.driverInfo.name)}`}
                    value={data.driverInfo.name || ''}
                    onChange={e => setData(p => ({ ...p, driverInfo: { ...p.driverInfo, name: e.target.value } }))} 
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
                  <PhoneInput 
                    value={data.driverInfo.phoneNumber || ''} 
                    onChange={val => setData(p => ({ ...p, driverInfo: { ...p.driverInfo, phoneNumber: val } }))}
                    error={attemptedStep2 && !data.driverInfo.phoneNumber ? true : false}
                    isRTL={isRTL}
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
                    onChange={e => setData(p => ({ ...p, driverInfo: { ...p.driverInfo, assistantName: e.target.value } }))} 
                  />
               </div>
             )}

             {/* Driver Assistant Phone Number - Hidden in Maintenance and Vehicle Only mode */}
             {data.mode !== 'maintenance' && data.mode !== 'vehicle_only' && (
               <div className="space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    {t.assistant_phone}
                  </label>
                  <PhoneInput 
                    value={data.driverInfo.assistantPhone || ''} 
                    onChange={val => setData(p => ({ ...p, driverInfo: { ...p.driverInfo, assistantPhone: val } }))}
                    isRTL={isRTL}
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
                    value={data.driverInfo.plateNumber || ''}
                    onChange={e => setData(p => ({ ...p, driverInfo: { ...p.driverInfo, plateNumber: e.target.value } }))} 
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
                        onChange={e => setData(p => ({ ...p, driverInfo: { ...p.driverInfo, departure: e.target.value } }))} 
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
                        onChange={e => setData(p => ({ ...p, driverInfo: { ...p.driverInfo, destination: e.target.value } }))} 
                      />
                      {data.driverInfo.destination && data.driverInfo.destination.trim().length > 0 && <CheckIcon />}
                    </div>
                  </div>
               </div>
             ) : (
               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      {t.vehicle_expiry_date} *
                    </label>
                    {data.driverInfo.vehicleExpiryDate && data.driverInfo.vehicleExpiryDate < new Date().toISOString().split('T')[0] && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {isRTL ? 'منتهي الصلاحية' : 'Expired'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <CustomDatePicker 
                      value={data.driverInfo.vehicleExpiryDate || ''} 
                      onChange={val => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        if (val && val < todayStr) {
                          showDateWarning(isRTL ? 'تنبيه: رخصة المركبة منتهية الصلاحية!' : 'Warning: Vehicle license is expired!');
                        }
                        setData((p) => ({ 
                          ...p, 
                          driverInfo: { ...p.driverInfo, vehicleExpiryDate: val } 
                        }));
                      }} 
                      error={attemptedStep2 && !data.driverInfo.vehicleExpiryDate ? true : false}
                      isRTL={isRTL}
                      isExpiryDate={true}
                    />
                  </div>
               </div>
             )}

             {/* OPAL and VOC Expire Dates for Maintenance Mode */}
             {data.mode === 'maintenance' && (
               <>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                        {isRTL ? 'تاريخ انتهاء تصريح أوبال' : 'OPAL Expiry Date'}
                      </label>
                      {data.driverInfo.opalExpiryDate && data.driverInfo.opalExpiryDate < new Date().toISOString().split('T')[0] && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {isRTL ? 'منتهي الصلاحية' : 'Expired'}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <CustomDatePicker 
                        value={data.driverInfo.opalExpiryDate || ''} 
                        onChange={val => {
                          const todayStr = new Date().toISOString().split('T')[0];
                          if (val && val < todayStr) {
                            showDateWarning(isRTL ? 'تنبيه: تصريح أوبال منتهي الصلاحية!' : 'Warning: OPAL permit is expired!');
                          }
                          setData((p) => ({ 
                            ...p, 
                            driverInfo: { ...p.driverInfo, opalExpiryDate: val } 
                          }));
                        }} 
                        isRTL={isRTL}
                        isExpiryDate={true}
                      />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                        {isRTL ? 'تاريخ انتهاء تصريح VOC' : 'VOC Expiry Date'}
                      </label>
                      {data.driverInfo.vocExpiryDate && data.driverInfo.vocExpiryDate < new Date().toISOString().split('T')[0] && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {isRTL ? 'منتهي الصلاحية' : 'Expired'}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <CustomDatePicker 
                        value={data.driverInfo.vocExpiryDate || ''} 
                        onChange={val => {
                          const todayStr = new Date().toISOString().split('T')[0];
                          if (val && val < todayStr) {
                            showDateWarning(isRTL ? 'تنبيه: تصريح VOC منتهي الصلاحية!' : 'Warning: VOC permit is expired!');
                          }
                          setData((p) => ({ 
                            ...p, 
                            driverInfo: { ...p.driverInfo, vocExpiryDate: val } 
                          }));
                        }} 
                        
                        isRTL={isRTL}
                        isExpiryDate={true}
                      />
                    </div>
                 </div>
               </>
             )}

             {/* Current Odometer */}
             <div className="space-y-2 relative">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  {isRTL ? 'قراءة العداد الحالية (كم)' : 'Current Odometer (KM)'} *
                </label>
                <div className="relative">
                  <OdometerInput 
                    value={data.driverInfo.currentOdometer || ''} 
                    onChange={val => setData(p => ({ ...p, driverInfo: { ...p.driverInfo, currentOdometer: val } }))}
                    error={(attemptedStep2 && !data.driverInfo.currentOdometer) || (isOdoInvalid && !!data.driverInfo.currentOdometer) ? true : false}
                    isRTL={isRTL}
                  />
                  {(data.driverInfo.currentOdometer && data.driverInfo.odometer && !isOdoInvalid) && <CheckIcon />}
                </div>
             </div>

             {/* Odometer at Next Maintenance */}
             <div className="space-y-2 relative">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  {isRTL ? 'قراءة العداد عند موعد الصيانة القادمة (كم)' : 'Odometer next maintenance (KM)'} *
                </label>
                <div className="relative">
                  <OdometerInput 
                    value={data.driverInfo.odometer || ''} 
                    onChange={val => setData(p => ({ ...p, driverInfo: { ...p.driverInfo, odometer: val } }))}
                    error={(attemptedStep2 && !data.driverInfo.odometer) || (isOdoInvalid && !!data.driverInfo.odometer) ? true : false}
                    isRTL={isRTL}
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
                      type="button"
                      key={vt.value} 
                      onClick={() => {
                        const hasExistingData = data.checklist?.some(item => item.status !== 'unchecked');
                        if (hasExistingData && data.driverInfo.vehicleType !== vt.value) {
                            setPendingVehicleType(vt.value as VehicleType);
                            return;
                          }
                        setData((p) => ({ 
                          ...p, 
                          driverInfo: { ...p.driverInfo, vehicleType: vt.value as VehicleType },
                          checklist: getChecklistForType(vt.value, p.mode),
                          tyrePressures: {}
                        }));
                      }}
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

      {/* Confirm Vehicle Type Change Modal */}
      {pendingVehicleType && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-2">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-800">
                {isRTL ? 'تغيير نوع المركبة' : 'Change Vehicle Type'}
              </h3>
              <p className="text-gray-500 text-sm font-bold leading-relaxed text-center w-full">
                {isRTL 
                  ? 'تغيير نوع المركبة سيؤدي إلى مسح جميع بيانات الفحص المدخلة سابقاً. هل تريد الاستمرار؟' 
                  : 'Changing the vehicle type will clear all previously entered inspection data. Do you want to continue?'}
              </p>
              <div className="flex gap-3 w-full pt-4">
                <button 
                  type="button"
                  onClick={() => setPendingVehicleType(null)}
                  className="flex-1 py-3.5 rounded-xl font-black text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    if (pendingVehicleType) {
                      setData((p) => ({ 
                        ...p, 
                        driverInfo: { ...p.driverInfo, vehicleType: pendingVehicleType as VehicleType },
                        checklist: getChecklistForType(pendingVehicleType, p.mode),
                        tyrePressures: {}
                      }));
                      setPendingVehicleType(null);
                    }
                  }}
                  className="flex-1 py-3.5 rounded-xl font-black text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all"
                >
                  {isRTL ? 'موافق، استمر' : 'Yes, Proceed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

