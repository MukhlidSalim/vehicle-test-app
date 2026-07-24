import React, { useRef, useState } from 'react';
import { Download, Share2, CheckCircle, XCircle, Truck, User, FileText, Clock, MapPin } from 'lucide-react';
import { HandoverData } from './HandoverForm';
import { captureNode } from '../../utils/pdfGenerator';
import { jsPDF } from 'jspdf';
import { VEHICLE_TYPES_OPTIONS } from './handoverConfig';

interface Props {
  data: HandoverData;
  isRTL: boolean;
}

export const HandoverReport: React.FC<Props> = ({ data, isRTL }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { personRole, personName, vehiclePlate, vehicleType, location, odometer, opalExpiry, ropExpiry, items, notes, signature, date, extraFields, config } = data;

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    try {
      return new Date(isoStr).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return isoStr; }
  };

  const t = (ar: string, en: string) => isRTL ? ar : en;

  const vehicleLabel = VEHICLE_TYPES_OPTIONS.find(v => v.value === vehicleType)?.[isRTL ? 'labelAr' : 'labelEn'] || vehicleType;

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      const { dataUrl } = await captureNode(reportRef.current);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const a4W = 210, a4H = 297;
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = a4W;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      let position = 0;
      let remainingHeight = pdfHeight;
      while (remainingHeight > 5) {
        pdf.addImage(dataUrl, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
        remainingHeight -= a4H;
        position -= a4H;
        if (remainingHeight > 5) pdf.addPage();
      }
      pdf.save(`handover_${vehiclePlate}_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
    }
    setIsGenerating(false);
  };

  const handleShare = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      const { dataUrl } = await captureNode(reportRef.current);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      if (blob && navigator.share) {
        const file = new File([blob], `handover_${vehiclePlate}.jpeg`, { type: 'image/jpeg' });
        await navigator.share({ files: [file], title: isRTL ? config.formTitleAr : config.formTitleEn });
      }
    } catch (err) {
      console.error('Share failed', err);
    }
    setIsGenerating(false);
  };

  const renderSig = (sig: string | undefined) => {
    if (sig && sig.startsWith('data:')) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-2 flex justify-center items-center h-20 w-full">
          <img src={sig} alt="sig" className="h-full object-contain max-w-full" style={{ imageRendering: 'auto', filter: 'contrast(1.3)' }} crossOrigin="anonymous" />
        </div>
      );
    }
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center text-xs font-black text-emerald-600 flex items-center justify-center gap-1">
        <CheckCircle size={14} /> {t('تم التوقيع', 'Signed')}
      </div>
    );
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ===== REPORT CONTENT ===== */}
      <div className="flex justify-center w-full pb-4">
        <div
          ref={reportRef}
          className="bg-white relative overflow-hidden w-full max-w-[794px]"
          style={{
            minHeight: '1123px',
            fontFamily: 'Cairo, sans-serif',
            direction: isRTL ? 'rtl' : 'ltr',
          }}
        >
          {/* Watermark */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-[0.03] select-none z-0">
            <Truck size={350} />
            <h1 className="text-7xl font-black mt-10">{isRTL ? config.formTitleAr : config.formTitleEn}</h1>
          </div>

          <div className="p-4 sm:p-8 space-y-6 relative z-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-2xl text-center text-white shadow-lg">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Truck size={28} className="text-blue-400" />
                <h1 className="text-2xl font-black tracking-tight">
                  {isRTL ? config.formTitleAr : config.formTitleEn} - {isRTL ? (personRole === 'sender' ? 'تسليم' : 'استلام') : (personRole === 'sender' ? 'Handover' : 'Receive')}
                </h1>
              </div>
              <p className="text-gray-300 text-xs font-bold uppercase tracking-widest">
                {t('نظام فحص المركبات', 'Vehicle Inspection System')}
              </p>
            </div>

            {/* Vehicle Info */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                <Truck size={16} className="text-gray-600" />
                <h2 className="text-sm font-black text-gray-800">{t('بيانات المركبة', 'Vehicle Information')}</h2>
              </div>
              <div className="grid grid-cols-3 divide-x rtl:divide-x-reverse divide-gray-100">
                <div className="p-4 bg-white">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('رقم اللوحة', 'Plate No.')}</div>
                  <div className="text-lg font-black text-gray-900">{vehiclePlate}</div>
                </div>
                <div className="p-4 bg-white">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('نوع المركبة', 'Vehicle Type')}</div>
                  <div className="text-base font-bold text-gray-900 mt-1">{vehicleLabel}</div>
                </div>
                <div className="p-4 bg-white">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('عداد المسافة', 'Odometer')}</div>
                  <div className="text-base font-bold text-gray-900 mt-1">{odometer ? `${odometer} km` : '-'}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x rtl:divide-x-reverse divide-gray-100 border-t border-gray-100">
                <div className="p-4 bg-white">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('الموقع', 'Location')}</div>
                  <div className="text-sm font-bold text-gray-900">{location || '-'}</div>
                </div>
                <div className="p-4 bg-white">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('انتهاء الملكية', 'ROP Expiry')}</div>
                  <div className="text-sm font-bold text-gray-900">{ropExpiry || '-'}</div>
                </div>
                <div className="p-4 bg-white">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{isRTL ? config.expiryLabel2Ar : config.expiryLabel2En}</div>
                  <div className="text-sm font-bold text-gray-900">{opalExpiry || '-'}</div>
                </div>
              </div>
            </div>

            {/* Extra Fields (Ambulance) */}
            {extraFields && Object.keys(extraFields).length > 0 && (
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <MapPin size={16} className="text-red-500" />
                  <h2 className="text-sm font-black text-gray-800">{t('بيانات إضافية', 'Additional Information')}</h2>
                </div>
                <div className="grid grid-cols-2 divide-x rtl:divide-x-reverse divide-gray-100 bg-white">
                  {config.extraFields.map(field => (
                    extraFields[field.id] ? (
                      <div key={field.id} className="p-4">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{isRTL ? field.labelAr : field.labelEn}</div>
                        <div className="text-sm font-bold text-gray-900 whitespace-pre-wrap">{extraFields[field.id]}</div>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            )}

            {/* Checklist */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                <FileText size={16} className="text-gray-600" />
                <h2 className="text-sm font-black text-gray-800">{t('قائمة الفحص والمعدات', 'Inspection & Equipment')}</h2>
              </div>
              <div className="grid grid-cols-2 divide-x rtl:divide-x-reverse divide-gray-100 bg-white">
                {items.map((item, i) => {
                  const getLabelForValue = (val: string) => {
                    const map: Record<string, {ar: string, en: string}> = {
                      'full': { ar: 'ممتلئ (100%)', en: 'Full (100%)' },
                      '3_4': { ar: '3/4', en: '3/4' },
                      '1_2': { ar: 'نصف (50%)', en: 'Half (50%)' },
                      '1_4': { ar: '1/4', en: '1/4' },
                      'empty': { ar: 'فارغ', en: 'Empty' },
                      'clean': { ar: 'نظيفة', en: 'Clean' },
                      'acceptable': { ar: 'مقبولة', en: 'Acceptable' },
                      'dirty': { ar: 'تحتاج غسيل', en: 'Needs Wash' },
                      'present_complete': { ar: 'موجودة ومكتملة', en: 'Present & Complete' },
                      'present_incomplete': { ar: 'موجودة وغير مكتملة', en: 'Present, Incomplete' },
                      'complete': { ar: 'مكتملة', en: 'Complete' },
                      'needs_completion': { ar: 'تحتاج استكمال', en: 'Needs Completion' },
                      'present_good': { ar: 'موجود وسليم', en: 'Present & Good' },
                      'present_needs_maintenance': { ar: 'موجود ويحتاج صيانة', en: 'Present, Needs Maintenance' },
                      'present_valid': { ar: 'موجودة وصالحة', en: 'Present & Valid' },
                      'present_expired': { ar: 'موجودة ومنتهية الصلاحية', en: 'Present, Expired' },
                      'missing': { ar: 'غير موجود', en: 'Missing' },
                      'working': { ar: 'يعمل', en: 'Working' },
                      'not_working': { ar: 'لا يعمل', en: 'Not Working' },
                      'not_available': { ar: 'غير متوفر', en: 'Not Available' },
                      'present_working': { ar: 'موجود ويعمل', en: 'Present & Working' },
                      'present_not_working': { ar: 'موجود ولا يعمل', en: 'Present & Not Working' },
                      'present': { ar: 'موجود', en: 'Present' },
                      'batt_100': { ar: '100%', en: '100%' },
                      'batt_75': { ar: '75%', en: '75%' },
                      'batt_50': { ar: '50%', en: '50%' },
                      'batt_25': { ar: '25%', en: '25%' },
                      'batt_less_25': { ar: 'أقل من 25%', en: '< 25%' },
                    };
                    return map[val] ? (isRTL ? map[val].ar : map[val].en) : val;
                  };

                  return (
                    <div key={item.id} className={`p-2.5 border-b border-gray-100 ${item.status === 'bad' ? 'bg-red-50/50' : ''}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {item.status === 'good' ? (
                            <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle size={13} className="text-red-500 shrink-0" />
                          )}
                          <span className={`text-xs font-bold ${item.status === 'good' ? 'text-gray-800' : 'text-red-600'}`}>
                            {isRTL ? item.labelAr : item.labelEn}
                          </span>
                        </div>
                        
                        {(item.answerType === 'count' || item.hasCount) && item.count && (
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                            {item.count}
                          </span>
                        )}
                        
                        {item.answerType !== 'binary' && item.answerType !== 'count' && item.answerValue && (
                          <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0 text-center">
                            {getLabelForValue(item.answerValue)}
                          </span>
                        )}
                      </div>
                      
                      {item.status === 'bad' && item.note && (
                        <div className="mt-1 ms-5 text-[9px] font-bold text-red-500">
                          <span className="opacity-80 me-1">{t('ملاحظة:', 'Note:')}</span>
                          {item.note}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Remarks */}
            {notes && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2">{isRTL ? `ملاحظات ${personRole === 'sender' ? config.senderLabelAr : config.receiverLabelAr}` : `${personRole === 'sender' ? config.senderLabelEn : config.receiverLabelEn} Remarks`}</div>
                <p className="text-sm font-bold text-blue-900">{notes}</p>
              </div>
            )}

            {/* Signature */}
            <div className="border border-blue-200 rounded-xl overflow-hidden bg-white shadow-sm mt-8">
              <div className="bg-blue-50 px-4 py-3 border-b border-blue-200 flex items-center gap-2">
                <User size={16} className="text-blue-600" />
                <span className="text-sm font-black text-blue-800">{isRTL ? (personRole === 'sender' ? config.senderLabelAr : config.receiverLabelAr) : (personRole === 'sender' ? config.senderLabelEn : config.receiverLabelEn)}</span>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('الاسم', 'Name')}</div>
                  <div className="text-base font-black text-gray-900">{personName}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('التوقيع', 'Signature')}</div>
                  {renderSig(signature)}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 mt-2">
                  <Clock size={12} />
                  {formatDate(date)}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 mt-8 text-center pb-4">
              <p className="text-[10px] font-bold text-gray-400">
                {t('تم إنشاء هذا التقرير إلكترونياً بواسطة نظام فحص المركبات (VIS)', 'Generated electronically by Vehicle Inspection System (VIS)')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ACTION BUTTONS ===== */}
      <div className="flex flex-wrap gap-3 max-w-2xl mx-auto no-print">
        <button onClick={handleDownloadPDF} disabled={isGenerating}
          className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none">
          <Download size={18} />
          {t('تحميل PDF', 'Download PDF')}
        </button>
        <button onClick={handleShare} disabled={isGenerating}
          className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none">
          <Share2 size={18} />
          {t('مشاركة', 'Share')}
        </button>
      </div>
    </div>
  );
};
