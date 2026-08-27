import React, { useRef, useState } from 'react';
import {
  Users, Bus, Clock, MapPin, Hash, User,
  Calendar, FileText, ArrowLeftRight, Truck, Download
} from 'lucide-react';
import { DayInfo, Trip } from '../../hooks/usePassengerLogSession';
import { ScaledPreview } from '../../components/ScaledPreview';
import { ReportPageFooter } from '../../components/ReportPageFooter';

interface Props {
  dayInfo: DayInfo;
  trips: Trip[];
  isRTL: boolean;
}

export const PassengerLogReport: React.FC<Props> = ({ dayInfo, trips, isRTL }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const t = (ar: string, en: string) => isRTL ? ar : en;

  const totalPassengers = trips.reduce((sum, trip) => sum + trip.passengerCount, 0);
  const routineCount = trips.filter(trip => trip.type === 'routine').length;
  const shiftCount = trips.filter(trip => trip.type === 'shift').length;


  const generateExcelBuffer = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Passenger Log', {
      views: [{ rightToLeft: isRTL }]
    });

    // Adjust column widths
    sheet.columns = [
      { key: 'id', width: 6 },
      { key: 'type', width: 14 },
      { key: 'pickup', width: 22 },
      { key: 'dropoff', width: 22 },
      { key: 'passengers', width: 14 },
      { key: 'time', width: 14 },
    ];

    // Add Title
    const titleRow1 = sheet.addRow(['', '', '', '', '', '']);
    const titleRow2 = sheet.addRow(['', '', '', '', '', '']);
    sheet.mergeCells('A1:F2');
    const titleCell = sheet.getCell('A1');
    titleCell.value = t('تقرير تسجيل الركاب اليومي', 'Daily Passenger Registration Report');
    [titleRow1, titleRow2].forEach(row => row.eachCell({ includeEmpty: true }, cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } } as any;
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} } as any;
    }));
    titleCell.font = { name: 'Cairo', size: 20, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' } as any;

    // Subtitle
    const subTitleRow = sheet.addRow(['', '', '', '', '', '']);
    sheet.mergeCells('A3:F3');
    const subTitleCell = sheet.getCell('A3');
    subTitleCell.value = t('نظام فحص المركبات', 'Vehicle Inspection System');
    subTitleRow.eachCell({ includeEmpty: true }, cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDFA' } } as any;
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} } as any;
    });
    subTitleCell.font = { name: 'Cairo', size: 12, bold: true, color: { argb: 'FF0F766E' } };
    subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' } as any;
    subTitleRow.height = 22;

    sheet.addRow([]);

    // Day Info Section
    const row5 = sheet.addRow([t('رقم المركبة', 'Vehicle Plate'), '', dayInfo.vehiclePlate, t('رمز التصنيف', 'Vehicle Class'), '', dayInfo.vehicleClass]);
    sheet.mergeCells('A5:B5'); sheet.mergeCells('D5:E5');
    const row6 = sheet.addRow([t('اسم السائق', 'Driver Name'), '', dayInfo.driverName, t('التاريخ', 'Date'), '', dayInfo.date]);
    sheet.mergeCells('A6:B6'); sheet.mergeCells('D6:E6');
    
    [row5, row6].forEach(row => {
      row.height = 28;
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const isLabel = colNumber === 1 || colNumber === 2 || colNumber === 4 || colNumber === 5;
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} } as any;
        cell.alignment = { vertical: 'middle', horizontal: 'center' } as any;
        cell.font = { bold: true, name: 'Cairo', size: isLabel ? 12 : 14, color: isLabel ? {argb: 'FF4B5563'} : {argb: 'FF111827'} };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isLabel ? 'FFF3F4F6' : 'FFFFFFFF' } } as any;
      });
    });

    sheet.addRow([]);

    // Table Header
    const headerRow = sheet.addRow(['#', t('النوع', 'Type'), t('نقطة الانطلاق', 'Starting Point'), t('نقطة الوصول', 'Arrival Point'), t('الركاب', 'Passengers'), t('التوقيت', 'Time')]);
    headerRow.height = 25;
    headerRow.eachCell({ includeEmpty: true }, cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Cairo', size: 12 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } } as any;
      cell.alignment = { horizontal: 'center', vertical: 'middle' } as any;
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} } as any;
    });

    // Add Trips
    trips.forEach((trip, idx) => {
      const row = sheet.addRow([
        idx + 1,
        trip.type === 'routine' ? t('روتينية', 'Routine') : t('مناوبة', 'Shift'),
        trip.pickupLocation,
        trip.dropoffLocation,
        trip.passengerCount,
        trip.time
      ]);
      row.height = 22;
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = { top: {style:'thin', color: {argb:'FFD1D5DB'}}, left: {style:'thin', color: {argb:'FFD1D5DB'}}, bottom: {style:'thin', color: {argb:'FFD1D5DB'}}, right: {style:'thin', color: {argb:'FFD1D5DB'}} } as any;
        cell.alignment = { vertical: 'middle', horizontal: 'center' } as any;
        if (colNumber === 2) { 
          cell.font = { bold: true, name: 'Cairo', color: { argb: trip.type === 'routine' ? 'FF1D4ED8' : 'FF7E22CE' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: trip.type === 'routine' ? 'FFDBEAFE' : 'FFF3E8FF' } } as any;
        } else {
          cell.font = { bold: true, name: 'Cairo', size: 11, color: {argb: 'FF1F2937'} };
        }
      });
    });

    sheet.addRow([]);

    // Summary Stats
    const lastRow = trips.length + 10;
    const r1 = sheet.addRow([t('إجمالي النقلات', 'Total Trips'), '', trips.length, t('إجمالي الركاب', 'Total Passengers'), '', totalPassengers]);
    sheet.mergeCells(`A${lastRow}:B${lastRow}`); sheet.mergeCells(`D${lastRow}:E${lastRow}`);
    const r2 = sheet.addRow([t('نقلات روتينية', 'Routine Trips'), '', routineCount, t('نقلات مناوبة', 'Shift Trips'), '', shiftCount]);
    sheet.mergeCells(`A${lastRow+1}:B${lastRow+1}`); sheet.mergeCells(`D${lastRow+1}:E${lastRow+1}`);
    
    [r1, r2].forEach(row => {
      row.height = 26;
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const isLabel = colNumber === 1 || colNumber === 2 || colNumber === 4 || colNumber === 5;
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} } as any;
        cell.alignment = { vertical: 'middle', horizontal: 'center' } as any;
        if (isLabel) {
          cell.font = { bold: true, name: 'Cairo', size: 12, color: {argb: 'FF4B5563'} };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } } as any;
        } else {
          cell.font = { bold: true, name: 'Cairo', size: 16, color: {argb: 'FF0F766E'} };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } } as any;
        }
      });
    });

    return await workbook.xlsx.writeBuffer();
  };

  const handleExportExcel = async () => {
    setIsGenerating(true);
    try {
      const buffer = await generateExcelBuffer();
      const { saveAs } = (await import('file-saver')).default;
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const cleanName = dayInfo.driverName.trim().replace(/\s+/g, '_');
      const cleanPlate = dayInfo.vehiclePlate.trim().replace(/\s+/g, '_');
      const cleanClass = dayInfo.vehicleClass.trim().replace(/\s+/g, '_');
      saveAs(blob, `[${dayInfo.date}]_[Bus ${cleanClass}]_[${cleanPlate}]_[${cleanName}].xlsx`);
    } catch (err) {
      console.error('Excel generation failed', err);
      alert(t('حدث خطأ أثناء تصدير ملف الإكسل', 'Failed to export Excel file'));
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6 pb-20" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Report Content */}
      <div className="flex justify-center w-full pb-4">
        <ScaledPreview>
          <div
            ref={reportRef}
            className="bg-white relative overflow-hidden w-full max-w-[794px]"
            style={{
              minHeight: '400px',
              width: '794px', // Enforce A4 width for PDF generation
              fontFamily: 'Cairo, sans-serif',
              direction: isRTL ? 'rtl' : 'ltr',
            }}
          >
          <div className="p-2 sm:p-4 space-y-2 relative z-10">
            {/* Day Info */}
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center gap-2">
                <Bus size={14} className="text-teal-600" />
                <h2 className="text-xs font-black text-gray-800">{t('البيانات الأساسية', 'Basic Data')}</h2>
              </div>
              <div className="grid grid-cols-4 divide-x rtl:divide-x-reverse divide-gray-100 bg-white">
                <div className="p-1.5">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('رقم المركبة', 'Vehicle Plate')}</div>
                  <div className="text-[11px] font-black text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{dayInfo.vehiclePlate}</div>
                </div>
                <div className="p-1.5">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('اسم السائق', 'Driver Name')}</div>
                  <div className="text-[11px] font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{dayInfo.driverName}</div>
                </div>
                <div className="p-1.5">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('رمز التصنيف', 'Vehicle Class')}</div>
                  <div className="text-[11px] font-black text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{dayInfo.vehicleClass}</div>
                </div>
                <div className="p-1.5">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('التاريخ', 'Date')}</div>
                  <div className="text-[11px] font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{dayInfo.date}</div>
                </div>
              </div>
            </div>

            {/* Trips Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-2 py-1.5 border-b border-gray-200 flex items-center gap-2">
                <FileText size={12} className="text-gray-600" />
                <h2 className="text-[11px] font-black text-gray-800">{t('سجل النقلات', 'Trip Log')}</h2>
                <span className="ms-auto text-[8px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">{trips.length} {t('نقلة', 'trips')}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-1.5 py-1 text-start font-black text-gray-600">#</th>
                      <th className="px-1.5 py-1 text-start font-black text-gray-600">{t('النوع', 'Type')}</th>
                      <th className="px-1.5 py-1 text-start font-black text-gray-600">{t('نقطة الانطلاق', 'Starting Point')}</th>
                      <th className="px-1.5 py-1 text-start font-black text-gray-600">{t('نقطة الوصول', 'Arrival Point')}</th>
                      <th className="px-1.5 py-1 text-center font-black text-gray-600">{t('الركاب', 'Passengers')}</th>
                      <th className="px-1.5 py-1 text-start font-black text-gray-600">{t('التوقيت', 'Time')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {trips.map((trip, idx) => (
                      <tr key={trip.id} className={idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}>
                        <td className="px-1.5 py-0.5 font-black text-gray-500">{idx + 1}</td>
                        <td className="px-1.5 py-0.5">
                          <span className={`text-[8px] font-black uppercase tracking-wider px-1 py-0.5 rounded-sm ${
                            trip.type === 'routine' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                          }`}>
                            {trip.type === 'routine' ? t('روتينية', 'Routine') : t('مناوبة', 'Shift')}
                          </span>
                        </td>
                        <td className="px-1.5 py-0.5 font-bold text-gray-800">{trip.pickupLocation}</td>
                        <td className="px-1.5 py-0.5 font-bold text-gray-800">{trip.dropoffLocation}</td>
                        <td className="px-1.5 py-0.5 text-center font-black text-gray-900">{trip.passengerCount}</td>
                        <td className="px-1.5 py-0.5 font-bold text-gray-600">{trip.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-1.5">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-1.5 text-center">
                <div className="text-lg font-black text-teal-700 leading-none">{trips.length}</div>
                <div className="text-[8px] font-bold text-teal-500 uppercase tracking-wider mt-1">{t('إجمالي النقلات', 'Total Trips')}</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-1.5 text-center">
                <div className="text-lg font-black text-blue-700 leading-none">{totalPassengers}</div>
                <div className="text-[8px] font-bold text-blue-500 uppercase tracking-wider mt-1">{t('إجمالي الركاب', 'Total Passengers')}</div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-1.5 text-center">
                <div className="text-lg font-black text-indigo-700 leading-none">{routineCount}</div>
                <div className="text-[8px] font-bold text-indigo-500 uppercase tracking-wider mt-1">{t('نقلات روتينية', 'Routine')}</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-1.5 text-center">
                <div className="text-lg font-black text-purple-700 leading-none">{shiftCount}</div>
                <div className="text-[8px] font-bold text-purple-500 uppercase tracking-wider mt-1">{t('نقلات مناوبة', 'Shift')}</div>
              </div>
            </div>

            {/* Notes Section */}
            {dayInfo.notes && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <h3 className="text-[10px] font-black text-gray-800 mb-1.5 flex items-center gap-1">
                  <FileText size={12} className="text-gray-500" />
                  {t('الملاحظات', 'Notes')}
                </h3>
                <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                  <p className="text-xs font-bold text-gray-700 whitespace-pre-wrap leading-relaxed">{dayInfo.notes}</p>
                </div>
              </div>
            )}
            
          </div>
          <ReportPageFooter pageNumber={1} totalPages={1} isRTL={isRTL} lang={isRTL ? 'ar' : 'en'} />
          </div>
        </ScaledPreview>
      </div>

      {/* Action Buttons */}
      <div className="flex max-w-2xl mx-auto no-print">
        <button type="button" onClick={handleExportExcel} disabled={isGenerating}
          className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none">
          <FileText size={18} />
          {t('تصدير التقرير كملف Excel', 'Export Report as Excel')}
        </button>
      </div>
    </div>
  );
};
