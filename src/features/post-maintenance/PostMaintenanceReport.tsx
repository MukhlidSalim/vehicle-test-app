import React, { useRef, useState } from 'react';
import { PostMaintenanceData } from '../../types';
import { ReportPageFooter } from '../../components/ReportPageFooter';
import { SECTION_A_ITEMS, SECTION_B_ITEMS } from './postMaintenanceConfig';
import { ScaledPreview } from '../../components/ScaledPreview';
import { generatePdfReport } from '../../utils/pdfGenerator';
import { Download, Share2, Printer, ClipboardCheck, CheckCircle, XCircle, MinusCircle, Loader2, FileIcon, Edit3, RotateCcw } from 'lucide-react';

interface Props {
  data: PostMaintenanceData;
  isRTL: boolean;
  onNewForm?: () => void;
  onEdit?: () => void;
}

export const PostMaintenanceReport: React.FC<Props> = ({ data, isRTL, onNewForm, onEdit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const page3Ref = useRef<HTMLDivElement>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfProgress, setPdfProgress] = useState({ percent: 0, current: 0, total: 0, phase: '' });

  const lang = isRTL ? 'ar' : 'en';

  const handleExport = async (shouldShare: boolean) => {
    if (!page1Ref.current || !page2Ref.current) return;
    setIsGenerating(true);
    
    await generatePdfReport({
      nodes: [page1Ref.current, page2Ref.current] as any,
      baseFilename: `Post-Maintenance-Report-${data.vehicleRegNo}`,
      isRTL,
      lang,
      shouldShare,
      onProgress: setPdfProgress,
      onAttempt: () => {},
      onSuccess: async (file) => {
        setIsGenerating(false);
        if (navigator.share) {
          try { await navigator.share({ files: [file] }); } catch (e) { console.error('Share failed:', e); }
        }
      },
      onDownloadDirect: (pdf, filename) => {
        setIsGenerating(false);
        pdf.save(filename);
      },
      onError: () => setIsGenerating(false)
    });
  };

  const pageStyle = { width: '794px', minHeight: '1123px', fontFamily: 'Cairo, sans-serif', direction: isRTL ? 'rtl' : 'ltr' } as React.CSSProperties;

  // Render Checkbox
  const renderCheck = (status: 'pass' | 'fail' | 'na' | null, expected: 'pass' | 'fail' | 'na') => {
    if (status === expected) {
      if (expected === 'pass') return <CheckCircle size={16} className="text-emerald-500 mx-auto" />;
      if (expected === 'fail') return <XCircle size={16} className="text-red-500 mx-auto" />;
      if (expected === 'na') return <MinusCircle size={16} className="text-gray-500 mx-auto" />;
    }
    return <div className="w-[14px] h-[14px] border border-gray-300 rounded-sm mx-auto"></div>;
  };

  const renderSectionTable = (title: string, items: any[], configs: any[]) => (
    <div className="mb-4 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
        <div className="flex gap-4 text-[10px] font-bold text-gray-500">
           <div className="w-8 text-center">{isRTL ? 'ناجح' : 'Pass'}</div>
           <div className="w-8 text-center">{isRTL ? 'راسب' : 'Fail'}</div>
           <div className="w-8 text-center">{isRTL ? 'غير ذلك' : 'N/A'}</div>
        </div>
      </div>
      <div>
        {configs.map((conf, index) => {
          const itemData = items.find(i => i.id === conf.id);
          return (
            <div key={conf.id} className="flex items-center p-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50">
              <div className="flex-1 flex items-center gap-3">
                {conf.icon ? (
                    <div className="w-[26px] h-[26px] bg-blue-50 text-blue-500 rounded-full shrink-0 flex items-center justify-center shadow-sm">
                      <conf.icon size={14} />
                    </div>
                  ) : (
                    <div className="w-[26px] h-[26px] bg-blue-50 text-blue-600 rounded-full shrink-0 flex items-center justify-center font-black text-[12px] shadow-sm">
                      {index + 1}
                    </div>
                  )}
                <div className="text-[12px] font-bold text-gray-800 leading-snug flex-1">
                  {isRTL ? conf.labelAr : conf.labelEn}
                  {itemData?.remarks && (
                    <div className="mt-1 text-[11px] text-red-600 font-bold line-clamp-2">{isRTL ? 'ملاحظات: ' : 'Remarks: '}{itemData.remarks}</div>
                  )}
                </div>
              </div>
              <div className="flex gap-4 shrink-0 pr-1">
                <div className="w-8">{renderCheck(itemData?.status || null, 'pass')}</div>
                <div className="w-8">{renderCheck(itemData?.status || null, 'fail')}</div>
                <div className="w-8">{renderCheck(itemData?.status || null, 'na')}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderSig = (sig: string | undefined) => {
    if (sig && sig.startsWith('data:')) {
      return (
        <div className="h-10 w-full flex justify-center items-center">
          <img src={sig} alt="sig" className="h-full object-contain mix-blend-multiply" />
        </div>
      );
    }
    return <div className="h-10 w-full flex items-center justify-center text-[10px] text-gray-400 font-bold">{isRTL ? 'لا يوجد توقيع' : 'No Signature'}</div>;
  };

  const bItemsPage1 = SECTION_B_ITEMS.slice(0, 2);
  const bItemsPage2 = SECTION_B_ITEMS.slice(2);

  const ReportHeader = () => (
    <div className="bg-[#1e293b] text-white p-4 rounded-xl flex items-center justify-between mb-4 shadow-sm">
      <div className="flex items-center gap-4">
        <ClipboardCheck size={28} className="text-white opacity-90" />
        <h1 className="text-xl font-black">{isRTL ? 'نموذج استلام الحافلات بعد الصيانة' : 'Post-Maintenance Bus Acceptance Form'}</h1>
      </div>
    </div>
  );

  const FooterInfo = ({ page }: { page: number }) => (
    <div className="absolute bottom-6 w-full left-0 px-10">
      <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-[10px]">
        <div className="text-gray-400 font-normal">{isRTL ? 'تم إنشاء هذا التقرير إلكترونياً بواسطة نظام فحص المركبات (VIS)' : 'This report was generated electronically by Vehicle Inspection System (VIS)'}</div>
        <div className="text-gray-500 font-bold">{isRTL ? `صفحة ${page} من 2` : `Page ${page} of 2`}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-32 flex flex-col items-center print:block print:space-y-0 print:pb-0" dir={isRTL ? 'rtl' : 'ltr'}>
      <div ref={containerRef} className="space-y-8 flex flex-col items-center w-full print:block print:space-y-0">
        
        {/* ================= PAGE 1 ================= */}
        <ScaledPreview>
          <div ref={page1Ref} className="bg-white relative overflow-hidden shadow-lg print:shadow-none shrink-0" style={pageStyle}>
            <div className="px-10 pt-8 pb-16 relative z-10 flex flex-col min-h-full">
              <ReportHeader />
              
              {/* Meta Data Grid (Matches PDF screenshot) */}
              <div className="mb-4 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
                   <h3 className="font-bold text-gray-900 text-sm">{isRTL ? 'البيانات الأساسية للمركبة والفحص' : 'Basic Vehicle & Inspection Details'}</h3>
                </div>
                <div className={`grid grid-cols-4 gap-[1px] bg-gray-100 text-[11px] ${isRTL ? 'text-right' : 'text-left'} font-bold text-gray-800`}>
                  {/* Row 1 */}
                  <div className="bg-white p-2">
                    <div className="text-gray-400 font-bold mb-1">{isRTL ? 'رقم اللوحة' : 'Reg No'}</div>
                    <div className="text-[13px] font-black">{data.vehicleRegNo || '-'}</div>
                  </div>
                  <div className="bg-white p-2">
                    <div className="text-gray-400 font-bold mb-1">{isRTL ? 'الورشة' : 'Workshop'}</div>
                    <div className="text-[13px] font-black">{data.workshop || '-'}</div>
                  </div>
                  <div className="bg-white p-2">
                    <div className="text-gray-400 font-bold mb-1">{isRTL ? 'رقم كرت العمل' : 'Job Card No'}</div>
                    <div className="text-[13px] font-black">{data.jobCardNo || '-'}</div>
                  </div>
                  <div className="bg-white p-2">
                    <div className="text-gray-400 font-bold mb-1">{isRTL ? 'قراءة العداد' : 'Odometer'}</div>
                    <div className="text-[13px] font-black">{data.kmReading || '-'}</div>
                  </div>
                  
                  {/* Row 2 */}
                  <div className="bg-white p-2">
                    <div className="text-gray-400 font-bold mb-1">{isRTL ? 'تاريخ الإرسال' : 'Date Sent'}</div>
                    <div className="text-[13px] font-black">{data.dateSent || '-'}</div>
                  </div>
                  <div className="bg-white p-2">
                    <div className="text-gray-400 font-bold mb-1">{isRTL ? 'تاريخ الاسترجاع' : 'Date Returned'}</div>
                    <div className="text-[13px] font-black">{data.dateReturned || '-'}</div>
                  </div>
                  <div className="bg-white p-2">
                    <div className="text-gray-400 font-bold mb-1">{isRTL ? 'الأولوية' : 'Priority'}</div>
                    <div className="text-[13px] font-black">{data.priority || '-'}</div>
                  </div>
                  <div className="bg-white p-2">
                    <div className="text-gray-400 font-bold mb-1">{isRTL ? 'اسم المفتش' : 'Inspector Name'}</div>
                    <div className="text-[13px] font-black">{data.inspectorName || '-'}</div>
                  </div>
                  
                  {/* Row 3 */}
                  <div className="bg-white p-2 col-span-2">
                    <div className="text-gray-400 font-bold mb-1">{isRTL ? 'العطل المبلغ عنه' : 'Reported Defect'}</div>
                    <div className="text-[13px] font-black">{data.reportedDefect || '-'}</div>
                  </div>
                  <div className="bg-white p-2 col-span-2">
                    <div className="text-gray-400 font-bold mb-1">{isRTL ? 'تفاصيل الإصلاح' : 'Repair Details'}</div>
                    <div className="text-[13px] font-black">{data.repairDetails || '-'}</div>
                  </div>
                </div>
              </div>

              {renderSectionTable(isRTL ? 'أ. التحقق من تصحيح الإصلاح' : 'A. Repair Rectification Verification', data.sectionA, SECTION_A_ITEMS)}
              
              {renderSectionTable(isRTL ? 'ب. الفحوصات التشغيلية (جزء 1)' : 'B. Functional Checks (Part 1)', data.sectionB, bItemsPage1)}
            </div>
            <ReportPageFooter pageNumber={1} totalPages={2} isRTL={isRTL} lang={isRTL ? 'ar' : 'en'} />
          </div>
        </ScaledPreview>

        {/* ================= PAGE 2 ================= */}
        <ScaledPreview>
          <div ref={page2Ref} className="bg-white relative overflow-hidden shadow-lg print:shadow-none shrink-0 flex flex-col" style={pageStyle}>
            <div className="px-10 pt-8 pb-12 relative z-10 flex-1 flex flex-col">
              {renderSectionTable(isRTL ? 'ب. الفحوصات الوظيفية بعد الصيانة (الجزء 2)' : 'B. Functional Checks (Part 2)', data.sectionB, bItemsPage2)}
              
              {/* Compact Sign-Off Section */}
              <div className="mt-auto mb-10 pt-4 border-t-2 border-gray-800">
                <h3 className="font-black text-gray-900 text-sm mb-3 uppercase tracking-wider">{isRTL ? 'القرار النهائي والاعتماد' : 'Final Decision and Sign-Off'}</h3>
                
                <div className="grid grid-cols-4 gap-4 items-start mb-4">
                  {/* Final Status */}
                  <div className="col-span-1 border border-gray-200 rounded-lg p-2.5 text-center bg-gray-50 flex flex-col justify-center min-h-[60px]">
                    <div className="text-[9px] font-black text-gray-500 uppercase mb-1">{isRTL ? 'الحالة النهائية' : 'Final Status'}</div>
                    <div className={`font-black text-sm ${data.finalStatus === 'Accepted' ? 'text-emerald-600' : data.finalStatus === 'Rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                      {isRTL ? 
                        (data.finalStatus === 'Accepted' ? 'مقبول' : data.finalStatus === 'Rejected' ? 'مرفوض' : data.finalStatus === 'Reinspection' ? 'إعادة فحص' : 'قبول مشروط') 
                        : data.finalStatus}
                    </div>
                  </div>
                  
                  {/* Outstanding Items */}
                  <div className="col-span-3 border border-gray-200 rounded-lg p-2.5 bg-gray-50 flex flex-col min-h-[60px]">
                    <div className="text-[9px] font-black text-gray-500 uppercase mb-1">{isRTL ? 'عناصر معلقة / ملاحظات' : 'Outstanding Items / Remarks'}</div>
                    <div className="text-xs font-bold text-gray-800 line-clamp-2">{data.outstandingItems || '-'}</div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-2 text-center flex flex-col h-[115px]">
                    <div className="text-[9px] font-black text-gray-500 uppercase">{isRTL ? 'السائق' : 'Driver'}</div>
                    <div className="text-[10px] font-bold text-gray-800 line-clamp-1">{data.signatures.driverName || '-'}</div>
                    <div className="flex justify-center items-center h-8 mt-auto">
                      {renderSig(data.signatures.driver)}
                    </div>
                    <div className="border-t border-gray-200 mt-1 pt-1 text-[8px] font-bold text-gray-400">{data.signatures.driverDate || '02/08/2026'}</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-2 text-center flex flex-col h-[115px]">
                    <div className="text-[9px] font-black text-gray-500 uppercase">{isRTL ? 'المفتش' : 'Inspector'}</div>
                    <div className="text-[10px] font-bold text-gray-800 line-clamp-1">{data.signatures.inspectorName || '-'}</div>
                    <div className="flex justify-center items-center h-8 mt-auto">
                      {renderSig(data.signatures.inspector)}
                    </div>
                    <div className="border-t border-gray-200 mt-1 pt-1 text-[8px] font-bold text-gray-400">{data.signatures.inspectorDate || '02/08/2026'}</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-2 text-center flex flex-col h-[115px]">
                    <div className="text-[9px] font-black text-gray-500 uppercase">{isRTL ? 'ممثل الورشة' : 'Workshop Rep'}</div>
                    <div className="text-[10px] font-bold text-gray-800 line-clamp-1">{data.signatures.workshopName || '-'}</div>
                    <div className="flex justify-center items-center h-8 mt-auto">
                      {renderSig(data.signatures.workshop)}
                    </div>
                    <div className="border-t border-gray-200 mt-1 pt-1 text-[8px] font-bold text-gray-400">{data.signatures.workshopDate || '02/08/2026'}</div>
                  </div>
                </div>
              </div>
            </div>
            <ReportPageFooter pageNumber={2} totalPages={2} isRTL={isRTL} lang={isRTL ? 'ar' : 'en'} />
          </div>
        </ScaledPreview>

        </div>

                {/* Standard Actions Control Buttons */}
        <div className="w-full max-w-4xl mx-auto px-4 pb-20 mt-8 no-print space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Share Report */}
            <button 
              onClick={() => handleExport(true)} 
              disabled={isGenerating} 
              className="py-3.5 px-4 rounded-xl font-bold text-[14px] bg-[#0284c7] text-white shadow-sm hover:bg-[#0369a1] hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
              <span>{isRTL ? 'مشاركة التقرير' : 'Share Report'}</span>
            </button>
  
            {/* Download PDF */}
            <button 
              onClick={() => handleExport(false)} 
              disabled={isGenerating} 
              className="py-3.5 px-4 rounded-xl font-bold text-[14px] bg-[#dc2626] text-white shadow-sm hover:bg-[#b91c1c] hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <FileIcon size={18} />}
              <span>{isRTL ? 'تنزيل PDF' : 'Download PDF'}</span>
            </button>
  
            {/* Edit Inspection */}
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="py-3.5 px-4 rounded-xl font-bold text-[14px] bg-[#d97706] text-white shadow-sm hover:bg-[#b45309] hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Edit3 size={18} />
                <span>{isRTL ? 'تعديل الفحص' : 'Edit Inspection'}</span>
              </button>
            )}
          </div>
  
          {/* Start New Inspection */}
          {onNewForm && (
            <button
              onClick={onNewForm}
              className="w-full py-4 rounded-xl font-bold text-[15px] bg-[#1e293b] text-white shadow-md hover:bg-slate-800 hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              <span>{isRTL ? 'بدء فحص جديد' : 'Start New Inspection'}</span>
            </button>
          )}
       </div>

    </div>
  );
};

