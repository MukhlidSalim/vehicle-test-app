import React from 'react';
import { Language, InspectionData } from '../../../types';

/** Formats a YYYY-MM-DD date string based on language */
const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const formatDisplayDate = (dateStr: string, lang: Language): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (lang === 'ar') {
    return `${day}-${month}-${year}`;
  }
  const monthIdx = parseInt(month, 10) - 1;
  return `${day}-${MONTH_ABBR[monthIdx] ?? month}-${year}`;
};

export const formatDisplayDateObj = (date: Date, lang: Language): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return formatDisplayDate(`${year}-${month}-${day}`, lang);
};

export const CompactReportHeader: React.FC<{ titleSuffix: string; lang: Language }> = ({ titleSuffix, lang }) => {
  const isRTL = lang === 'ar';
  const locale = isRTL ? 'ar-SA' : 'en-US';
  
  return (
    <div className="mb-2 border-b-2 border-primary-600 pb-2 flex justify-between items-center flex-shrink-0">
       <h1 className="text-[18px] font-black text-gray-900 leading-tight v-center-cairo justify-start whitespace-nowrap overflow-hidden text-ellipsis">
         {titleSuffix}
       </h1>
       <div className="flex items-center gap-5 text-gray-500 font-bold text-[10px]">
          <span className="v-center-cairo">
            <span className="opacity-60 ml-1.5 mr-1.5">{isRTL ? 'التاريخ:' : 'Date:'}</span> 
            <span dir="ltr" style={{ unicodeBidi: 'embed' }}>{formatDisplayDateObj(new Date(), lang)}</span>
          </span>
          <span className="v-center-cairo">
            <span className="opacity-60 ml-1.5 mr-1.5">{isRTL ? 'الوقت:' : 'Time:'}</span> 
            {new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: true })}
          </span>
       </div>
    </div>
  );
};

export const CompactInfoGrid: React.FC<{ data: InspectionData; t: any; lang: Language }> = ({ data, t, lang }) => (
  <div className="mb-2 border border-gray-300 rounded-xl p-3 bg-gray-50 flex-shrink-0 shadow-sm">
     <div className={`grid gap-y-2.5 gap-x-3 ${
         (data.mode === 'full' || data.mode === 'driver_only') && data.mode !== 'maintenance' 
           ? 'grid-cols-4' 
           : (data.mode === 'maintenance' || data.mode === 'vehicle_only')
             ? 'grid-cols-3' 
             : 'grid-cols-4'
     }`}>
        {[
          // Row 1: Driver/Inspector → phone → (Assistant → Assistant phone)
          { label: data.mode === 'maintenance' ? (lang === 'ar' ? 'اسم الفاحص' : 'Inspector Name') : t.driver_name, value: data.driverInfo.name || '-' },
          { label: t.phone_number, value: data.driverInfo.phoneNumber || '-', mono: true },
          ...(data.mode !== 'maintenance' && data.mode !== 'vehicle_only' ? [
             { label: t.assistant_name, value: data.driverInfo.assistantName || '-' },
             { label: t.assistant_phone, value: data.driverInfo.assistantPhone || '-', mono: true },
          ] : []),
          // Row 2: Plate → Vehicle expiry (or Route) → Current odometer → Next maintenance odometer
          { label: t.plate_number, value: data.driverInfo.plateNumber || '-', mono: true },
          ...(data.mode === 'full' || data.mode === 'driver_only' ? [
             { 
               label: lang === 'ar' ? 'مسار الرحلة' : 'Trip Route', 
               value: (
                 <div className="flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap">
                   <span>{data.driverInfo.departure || '-'}</span>
                   <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`text-primary-500 shrink-0 ${lang === 'ar' ? 'rotate-180' : ''}`}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                   <span>{data.driverInfo.destination || '-'}</span>
                 </div>
               )
             },
          ] : [
             { label: t.vehicle_expiry_date, value: data.driverInfo.vehicleExpiryDate ? formatDisplayDate(data.driverInfo.vehicleExpiryDate, lang) : '-' },
          ]),
          { label: (lang === 'ar' ? 'قراءة العداد الحالية (كم)' : 'Current Odometer (KM)'), value: data.driverInfo.currentOdometer || '-', mono: true },
          { label: (lang === 'ar' ? 'عداد الصيانة القادمة (كم)' : 'Next Maintenance (KM)'), value: data.driverInfo.odometer || '-', mono: true },
        ].map((info, idx) => (
          <div key={idx} className="flex flex-col border-b border-gray-400/50 pb-1.5 overflow-hidden">
             <span className="text-[7.5px] font-black text-gray-400 uppercase leading-none mb-1 v-center-cairo justify-start">{info.label}</span>
             <span className={`text-[10.5px] font-black text-gray-800 ${info.mono ? 'font-mono' : ''} v-center-cairo justify-start break-words`}>{info.value}</span>
          </div>
        ))}
     </div>
  </div>
);
