import React, { useRef, useState } from 'react';
import { Download, Share2, CheckCircle, XCircle, Truck, User, FileText, Calendar, Wrench, Settings, ClipboardCheck, ArrowLeft } from 'lucide-react';
import { PostMaintenanceData, PostMaintenanceStatus } from '../../types';
import { captureNode } from '../../utils/pdfGenerator';
import { ScaledPreview } from '../../components/ScaledPreview';
import { ReportPageFooter } from '../../components/ReportPageFooter';
import { jsPDF } from 'jspdf';
import { SECTION_A_ITEMS, SECTION_B_ITEMS, SECTION_C_ITEMS } from './postMaintenanceConfig';

interface Props {
  data: PostMaintenanceData;
  isRTL: boolean;
  onNewForm: () => void;
  onEdit?: () => void;
}

export const PostMaintenanceReport: React.FC<Props> = ({ data, isRTL, onNewForm, onEdit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const page3Ref = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const t = (ar: string, en: string) => isRTL ? ar : en;

  const generatePdfInstance = async () => {
    if (!page1Ref.current || !page2Ref.current || !page3Ref.current) return null;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const a4W = 210, a4H = 297;
    
    const captureAndAdd = async (el: HTMLElement, isFirst: boolean) => {
      const { dataUrl } = await captureNode(el);
      if (!isFirst) pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', 0, 0, a4W, a4H, undefined, 'FAST');
    };

    await captureAndAdd(page1Ref.current, true);
    await captureAndAdd(page2Ref.current, false);
    await captureAndAdd(page3Ref.current, false);
    return pdf;
  };

  const handleDownloadPDF = async () => {
    if (!containerRef.current) return;
    setIsGenerating(true);
    try {
      const pdf = await generatePdfInstance();
      if (pdf) {
        const cleanPlate = data.vehicleRegNo.trim().replace(/\s+/g, '_');
        const dateStr = new Date().toISOString().slice(0,10);
        pdf.save(`[${dateStr}]_[Post_Maintenance]_[${cleanPlate}].pdf`);
      }
    } catch (err) {
      console.error('PDF generation failed', err);
    }
    setIsGenerating(false);
  };

  const handleShare = async () => {
    if (!containerRef.current) return;
    setIsGenerating(true);
    try {
      const pdf = await generatePdfInstance();
      if (pdf && navigator.share) {
        const blob = pdf.output('blob');
        const cleanPlate = data.vehicleRegNo.trim().replace(/\s+/g, '_');
        const dateStr = new Date().toISOString().slice(0,10);
        const file = new File([blob], `[${dateStr}]_[Post_Maintenance]_[${cleanPlate}].pdf`, { type: 'application/pdf' });
        await navigator.share({ files: [file], title: t('اعتماد مركبة بعد الصيانة', 'Post-Maintenance Bus Acceptance') });
      }
    } catch (err) {
      console.error('Share failed', err);
    }
    setIsGenerating(false);
  };

  const renderStatusBox = (status: PostMaintenanceStatus, expected: PostMaintenanceStatus) => {
    if (status !== expected) return <div className="w-4 h-4 md:w-5 md:h-5 rounded border border-gray-200"></div>;
    return (
      <div className={`w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded ${status === 'pass' ? 'bg-emerald-100 text-emerald-600' : status === 'fail' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
        {status === 'pass' && <CheckCircle size={14} />}
        {status === 'fail' && <XCircle size={14} />}
        {status === 'na' && <span className="text-[9px] font-black">{t('غير ذلك', 'N/A')}</span>}
      </div>
    );
  };

  const renderSig = (sig: string | undefined) => {
    if (sig && sig.startsWith('data:')) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-1 flex justify-center items-center h-16 w-full">
          <img src={sig} alt="sig" className="h-full object-contain max-w-full" style={{ imageRendering: 'auto', filter: 'contrast(1.3)' }} />
        </div>
      );
    }
    return <div className="h-16 w-full border border-gray-200 border-dashed rounded-lg bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 font-bold">{isRTL ? 'لا يوجد توقيع' : 'No Signature'}</div>;
  };

  const renderSectionHeader = (titleAr: string, titleEn: string) => (
    <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-2 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
      <h3 className="font-black text-gray-800 text-[13px]">{isRTL ? titleAr : titleEn}</h3>
      <div className="flex gap-4 md:gap-6 px-2 text-[10px] font-bold text-gray-500 uppercase">
        <span className="w-5 text-center">{t('ناجح', 'PASS')}</span>
        <span className="w-5 text-center">{t('راسب', 'FAIL')}</span>
        <span className="w-5 text-center">{t('غير ذلك', 'N/A')}</span>
      </div>
    </div>
  );

  const renderItemRow = (conf: any, itemData: any) => (
    <div key={conf.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors px-2">
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-2">
           {conf.icon && (
             <div className="p-1 bg-gray-100 text-primary-600 rounded flex-shrink-0">
               <conf.icon size={14} />
             </div>
           )}
           <span className="text-sm font-bold text-gray-700 leading-snug">{isRTL ? conf.labelAr : conf.labelEn}</span>
        </div>
        {itemData.remarks && (
          <div className="mt-1 text-xs text-red-600 font-bold bg-red-50 p-1.5 rounded border border-red-100 leading-tight">
            {isRTL ? 'ملاحظات: ' : 'Remarks: '}{itemData.remarks}
          </div>
        )}
      </div>
      <div className="flex gap-4 md:gap-6 px-2 flex-shrink-0 mt-0.5">
        <div className="w-5 flex justify-center">{renderStatusBox(itemData.status, 'pass')}</div>
        <div className="w-5 flex justify-center">{renderStatusBox(itemData.status, 'fail')}</div>
        <div className="w-5 flex justify-center">{renderStatusBox(itemData.status, 'na')}</div>
      </div>
    </div>
  );

  const pageStyle = { width: '794px', height: '1123px', fontFamily: 'Cairo, sans-serif', direction: isRTL ? 'rtl' : 'ltr' } as React.CSSProperties;
  


  return (
    <div className="space-y-8 pb-12 flex flex-col items-center print:block print:space-y-0" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* REPORT CONTENT: Wrapped in a container for Image Share */}
      <div ref={containerRef} className="space-y-8 flex flex-col items-center w-full print:block print:space-y-0">
        
        {/* ================= PAGE 1 ================= */}
        <ScaledPreview>
          <div ref={page1Ref} className="bg-white relative overflow-hidden shadow-lg border border-gray-100 print:shadow-none print:border-none shrink-0" style={pageStyle}>
          <div className="p-8 space-y-4 relative z-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-4 rounded-xl text-center text-white shadow-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <ClipboardCheck size={28} className="text-primary-300" />
                </div>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h1 className="text-[22px] font-black tracking-tight">{t('نموذج استلام الحافلات بعد الصيانة', 'Post-Maintenance Bus Acceptance Checklist')}</h1>
                </div>
              </div>
            </div>

            {/* Meta Data Grid */}
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
              <div className="grid grid-cols-4 divide-x rtl:divide-x-reverse divide-gray-100">
                <div className="p-2">
                  <div className="text-[9px] font-bold text-gray-400 uppercase">{t('رقم اللوحة', 'Vehicle Reg. No')}</div>
                  <div className="text-[13px] font-black text-gray-900 mt-0.5">{data.vehicleRegNo}</div>
                </div>
                <div className="p-2">
                  <div className="text-[9px] font-bold text-gray-400 uppercase">{t('الورشة', 'Workshop')}</div>
                  <div className="text-[13px] font-black text-gray-900 mt-0.5">{data.workshop}</div>
                </div>
                <div className="p-2">
                  <div className="text-[9px] font-bold text-gray-400 uppercase">{t('رقم كرت العمل', 'Job Card No')}</div>
                  <div className="text-[13px] font-black text-gray-900 mt-0.5">{data.jobCardNo}</div>
                </div>
                <div className="p-2">
                  <div className="text-[9px] font-bold text-gray-400 uppercase">{t('قراءة العداد', 'KM Reading')}</div>
                  <div className="text-[13px] font-black text-gray-900 mt-0.5">{data.kmReading || '-'}</div>
                </div>
              </div>
              <div className="grid grid-cols-4 divide-x rtl:divide-x-reverse divide-gray-100 border-t border-gray-100 bg-gray-50">
                <div className="p-2">
                  <div className="text-[9px] font-bold text-gray-400 uppercase">{t('تاريخ الإرسال', 'Date Sent')}</div>
                  <div className="text-[13px] font-black text-gray-900 mt-0.5">{data.dateSent || '-'}</div>
                </div>
                <div className="p-2">
                  <div className="text-[9px] font-bold text-gray-400 uppercase">{t('تاريخ الاسترجاع', 'Date Returned')}</div>
                  <div className="text-[13px] font-black text-gray-900 mt-0.5">{data.dateReturned || '-'}</div>
                </div>
                <div className="p-2">
                  <div className="text-[9px] font-bold text-gray-400 uppercase">{t('الأولوية', 'Priority')}</div>
                  <div className="text-[13px] font-black text-gray-900 mt-0.5">{data.priority || '-'}</div>
                </div>
                <div className="p-2">
                  <div className="text-[9px] font-bold text-gray-400 uppercase">{t('اسم المفتش', 'Inspector')}</div>
                  <div className="text-[13px] font-black text-gray-900 mt-0.5">{data.inspectorName}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x rtl:divide-x-reverse divide-gray-100 border-t border-gray-100">
                <div className="p-2 bg-white">
                  <div className="text-[9px] font-bold text-gray-400 uppercase">{t('العطل المُبلغ عنه', 'Reported Defect')}</div>
                  <div className="text-[11px] font-bold text-gray-700 mt-1 whitespace-pre-wrap leading-tight">{data.reportedDefect || '-'}</div>
                </div>
                <div className="p-2 bg-white">
                  <div className="text-[9px] font-bold text-gray-400 uppercase">{t('تفاصيل الإصلاح', 'Repair Details')}</div>
                  <div className="text-[11px] font-bold text-gray-700 mt-1 whitespace-pre-wrap leading-tight">{data.repairDetails || '-'}</div>
                </div>
              </div>
            </div>

            {/* Section A */}
            <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
               {renderSectionHeader('أ. التحقق من تصحيح الإصلاح', 'A. Repair Rectification Verification')}
               <div className="mt-1">
                 {SECTION_A_ITEMS.map(conf => renderItemRow(conf, data.sectionA.find(i => i.id === conf.id)))}
               </div>
            </div>

            {/* Section B (Part 1) */}
            <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
               {renderSectionHeader('ب. الفحوصات التشغيلية (جزء 1)', 'B. Functional Checks (Part 1)')}
               <div className="mt-1">
                 {SECTION_B_ITEMS.slice(0, 2).map(conf => renderItemRow(conf, data.sectionB.find(i => i.id === conf.id)))}
               </div>
            </div>
            
            <div className="text-center text-[10px] text-gray-400 font-bold pt-2 relative z-10">Page 1 of 3</div>
          </div>
        </div>
        </ScaledPreview>

        {/* ================= PAGE 2 ================= */}
        <ScaledPreview>
          <div ref={page2Ref} className="bg-white relative overflow-hidden shadow-lg border border-gray-100 print:shadow-none print:border-none shrink-0 print:break-before-page" style={pageStyle}>
          <div className="p-8 space-y-4 relative z-10 h-full flex flex-col">
            <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm flex-1">
               {renderSectionHeader('ب. الفحوصات التشغيلية (جزء 2)', 'B. Functional Checks (Part 2)')}
               <div className="mt-1">
                 {SECTION_B_ITEMS.slice(2).map(conf => renderItemRow(conf, data.sectionB.find(i => i.id === conf.id)))}
               </div>
            </div>
            <div className="text-center text-[10px] text-gray-400 font-bold mt-auto pb-4 relative z-10">Page 2 of 3</div>
          </div>
        </div>
        </ScaledPreview>

        {/* ================= PAGE 3 ================= */}
        <ScaledPreview>
          <div ref={page3Ref} className="bg-white relative overflow-hidden shadow-lg border border-gray-100 print:shadow-none print:border-none shrink-0 print:break-before-page" style={pageStyle}>
          <div className="p-8 space-y-4 relative z-10 h-full flex flex-col">
            <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
               {renderSectionHeader('ج. اختبار الطريق والقبول النهائي', 'C. Road Test and Final Acceptance')}
               <div className="mt-1">
                 {SECTION_C_ITEMS.map(conf => renderItemRow(conf, data.sectionC.find(i => i.id === conf.id)))}
               </div>
            </div>

            {/* Final Decision & Sign Off */}
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden mt-4 shadow-sm">
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                <h3 className="text-sm font-black text-gray-900">{t('القرار النهائي والتوقيع', 'Final Decision and Sign-Off')}</h3>
              </div>
              <div className="p-4 space-y-4 bg-white">
                <div className="flex gap-4 items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase">{t('الحالة النهائية:', 'Final Status:')}</span>
                  <div className={`px-4 py-1.5 rounded-lg font-black text-sm border-2 ${
                    data.finalStatus === 'Accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-500' :
                    data.finalStatus === 'Rejected' ? 'bg-red-50 text-red-700 border-red-500' :
                    'bg-amber-50 text-amber-700 border-amber-500'
                  }`}>
                    {t(data.finalStatus === 'Accepted' ? 'مقبول' : data.finalStatus === 'Rejected' ? 'مرفوض' : data.finalStatus, data.finalStatus)}
                  </div>
                </div>

                {data.outstandingItems && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">{t('عناصر متبقية:', 'Outstanding Items:')}</span>
                    <p className="text-xs font-bold text-gray-800 whitespace-pre-wrap">{data.outstandingItems}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center space-y-2">
                    <div className="text-[10px] font-bold text-gray-500 uppercase">{t('السائق / المفتش', 'Driver / Inspector')}</div>
                    {renderSig(data.signatures.driver)}
                    <div className="text-[9px] font-bold text-gray-400">{data.signatures.driverDate || '-'}</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-[10px] font-bold text-gray-500 uppercase">{t('ممثل العمليات', 'Operations Rep.')}</div>
                    {renderSig(data.signatures.operations)}
                    <div className="text-[9px] font-bold text-gray-400">{data.signatures.operationsDate || '-'}</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-[10px] font-bold text-gray-500 uppercase">{t('ممثل الورشة', 'Workshop Rep.')}</div>
                    {renderSig(data.signatures.workshop)}
                    <div className="text-[9px] font-bold text-gray-400">{data.signatures.workshopDate || '-'}</div>
                  </div>
                </div>
                <div className="text-[9px] text-center text-red-600 font-bold bg-red-50 p-2 rounded mt-2">
                  {isRTL ? 'قاعدة القبول: أي عيب حرج يهدد السلامة لم يتم حله أو تكرار العيب الأصلي يتطلب الرفض والعودة إلى الصيانة.' : 'Acceptance rule: Any unresolved safety-critical defect or recurrence of the original defect requires rejection and return to maintenance.'}
                </div>
              </div>
            </div>
            

            
            <div className="text-center text-xs text-gray-400 font-bold mt-auto pb-4 relative z-10">Page 3 of 3</div>
          </div>
          <ReportPageFooter showText={true} isRTL={isRTL} />
        </div>
        </ScaledPreview>

      </div>

      {/* Download / Actions (Moved to bottom) */}
      <div className="flex flex-wrap items-center justify-center gap-3 bg-white/80 p-4 rounded-2xl shadow-sm border border-gray-200 w-full max-w-[794px] print:hidden">
        {onEdit && (
          <button onClick={onEdit} disabled={isGenerating} className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 p-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all">
            <ClipboardCheck size={18} />
            {isRTL ? 'تعديل البيانات' : 'Edit Information'}
          </button>
        )}
        <button onClick={handleDownloadPDF} disabled={isGenerating} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-primary-500/20 disabled:opacity-70">
          <Download size={18} />
          {isGenerating ? (isRTL ? 'جاري التحضير...' : 'Preparing...') : (isRTL ? 'تحميل PDF' : 'Download PDF')}
        </button>
        <button onClick={handleShare} disabled={isGenerating} className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 p-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all">
          <Share2 size={18} />
          {isRTL ? 'مشاركة صورة' : 'Share Image'}
        </button>
        <button onClick={onNewForm} className="flex-1 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 p-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all">
          <ClipboardCheck size={18} />
          {isRTL ? 'فحص جديد' : 'New Form'}
        </button>
      </div>

    </div>
  );
};
