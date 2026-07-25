import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Loader2, 
  Share2, 
  File as FileIcon, 
  Edit3, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  ShieldCheck, 
  ShieldAlert, 
  Map as MapIcon, 
  X 
} from 'lucide-react';
import { InspectionData, Language, CheckStatus } from '../../types';
import { 
  CHECKLIST_STATUS_LABELS, 
  HEAVY_BUS_CHECKLIST, 
  GENERIC_CHECKLIST, 
  READINESS_QUESTIONS 
} from '../../constants';
import { ScaledPreview } from '../../components/ScaledPreview';
import { ReportPageFooter } from '../../components/ReportPageFooter';
import { getChecklistDefForType } from '../../utils/inspectionHelpers';
import { VehicleBodyMap } from '../../components/VehicleBodyMap';
import { generatePdfReport } from '../../utils/pdfGenerator';
import { VEHICLE_TYPES } from '../../constants/vehicleData';


import { formatDisplayDate, CompactReportHeader, CompactInfoGrid } from './report/ReportComponents';


// --- Main Component ---

interface ReportSummaryStepProps {
  t: any;
  lang: Language;
  isRTL: boolean;
  data: InspectionData;
  setStep: (step: number) => void;
  onExit: () => void;
}

export const ReportSummaryStep: React.FC<ReportSummaryStepProps> = ({
  t,
  lang,
  isRTL,
  data,
  setStep,
  onExit,
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [readyFile, setReadyFile] = useState<File | null>(null);
  
  const [pdfAttempt, setPdfAttempt] = useState<number>(0);
  const [pdfWarning, setPdfWarning] = useState<string | null>(null);
  const [pdfHadIncomplete, setPdfHadIncomplete] = useState<boolean>(false);
  const [pdfWarnAck, setPdfWarnAck] = useState<boolean>(false);
  
  const [pdfProgress, setPdfProgress] = useState<{
    percent: number;
    current: number;
    total: number;
    etaSec: number | null;
    phase: string;
  }>({ percent: 0, current: 0, total: 0, etaSec: null, phase: '' });

  const [uiAlert, setUiAlert] = useState<{ show: boolean; message: string; type: 'warning' | 'fail' | 'info' }>({
    show: false,
    message: '',
    type: 'info',
  });

  const showUiAlert = (message: string, type: 'warning' | 'fail' | 'info' = 'warning') => {
    setUiAlert({ show: true, message, type });
    window.setTimeout(() => setUiAlert((p) => (p.show ? { ...p, show: false } : p)), 4500);
  };

  const getCustomFilename = () => {
    const name = data.driverInfo.name || (isRTL ? 'سائق' : 'Driver');
    const plate = data.driverInfo.plateNumber || '0000';
    
    let reportTypeLabel = '';
    if (data.mode === 'full') reportTypeLabel = t.mode_full;
    else if (data.mode === 'vehicle_only') reportTypeLabel = t.mode_vehicle;
    else if (data.mode === 'driver_only') reportTypeLabel = t.mode_driver;
    else if (data.mode === 'maintenance') reportTypeLabel = isRTL ? 'قسم الصيانة' : 'Maintenance';
    else reportTypeLabel = isRTL ? 'تقرير' : 'Report';
    
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${day}-${month}-${year}`;

    const finalFilename = `${name}_${reportTypeLabel}-${dateStr}-${plate}`;
    return finalFilename.replace(/[/\\?%*:|"<>]/g, '-').trim();
  };

  const handleDownloadPDF = async (shouldShare: boolean = false) => {
    // 1. Perform final checklist notes validation
    const bodyItem = data.checklist.find((i) => i.key === 'body_damage');
    const bodyPts = bodyItem?.damagePoints || [];
    const bodyWF = bodyItem?.status === 'warning' || bodyItem?.status === 'fail';
    const hasBodyMissing = bodyWF && ((bodyPts.length === 0) || bodyPts.some((p) => !p?.note || String(p.note).trim().length === 0));
    
    const missingNotesItems = data.checklist.filter((i) => {
      if (i.key === 'body_damage') return hasBodyMissing;
      const wf = i.status === 'warning' || i.status === 'fail';
      if (!wf) return false;
      return !i.notes || String(i.notes).trim().length === 0;
    });

    if (missingNotesItems.length > 0) {
      showUiAlert(
        isRTL
          ? '❌ لا يمكن إنشاء التقرير: يوجد عناصر (تنبيه/ضرر) بدون ملاحظات أو أضرار هيكل بدون وصف.'
          : '❌ Cannot generate report: some Warning/Fail items are missing notes, or body damages are missing descriptions.',
        'fail'
      );
      setStep(4);
      return;
    }

    const nodes = document.querySelectorAll('.a4-preview-wrapper');
    if (!nodes || nodes.length === 0) return;

    if (shouldShare) setIsSharing(true);
    else setIsGeneratingPDF(true);

    setPdfWarning(null);
    setPdfProgress({ percent: 0, current: 0, total: nodes.length, etaSec: null, phase: isRTL ? 'تهيئة الصفحات...' : 'Preparing pages...' });

    const baseFilename = getCustomFilename();

    await generatePdfReport({
      nodes,
      baseFilename,
      isRTL,
      lang,
      shouldShare,
      onProgress: (prog) => setPdfProgress(prog),
      onAttempt: (att) => setPdfAttempt(att),
      onSuccess: (file, incomplete) => {
        setReadyFile(file);
        setPdfHadIncomplete(incomplete);
        setPdfWarnAck(false);
      },
      onDownloadDirect: (pdfDoc, filename) => {
        pdfDoc.save(filename);
      },
      onError: () => {
        showUiAlert(isRTL ? 'عذراً، حدث خطأ أثناء إنشاء التقرير. يرجى المحاولة مرة أخرى.' : 'Error generating PDF report. Please try again.', 'fail');
      }
    });

    setPdfAttempt(0);
    setPdfProgress({ percent: 0, current: 0, total: 0, etaSec: null, phase: '' });
    setIsGeneratingPDF(false);
    setIsSharing(false);
  };

  const downloadReadyFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const handleFinalShare = async () => {
    if (!readyFile) return;

    if (pdfHadIncomplete && !pdfWarnAck) {
      setPdfWarning(
        isRTL 
          ? 'قد لا تظهر بعض الصور بشكل كامل بسبب قيود مؤقتة في الاتصال أو أداء الجهاز.' 
          : 'Some images may not appear fully due to temporary connection or device performance limits.'
      );
      return;
    }

    const fallbackMsg = isRTL
      ? 'المشاركة غير مدعومة على هذا الجهاز، سيتم تنزيل الملف ويمكنك مشاركته يدويًا.'
      : 'Sharing is not supported on this device. The file will be downloaded so you can share it manually.';

    try {
      const canShareFiles =
        !!navigator.share &&
        !!navigator.canShare &&
        navigator.canShare({ files: [readyFile] });

      if (canShareFiles) {
        await navigator.share({
          files: [readyFile],
          title: isRTL ? 'تقرير فحص مركبة' : 'Vehicle Inspection Report',
          text: isRTL ? 'إليك نسخة من تقرير فحص المركبة.' : 'Here is a copy of the vehicle inspection report.'
        });
        setReadyFile(null);
        setPdfHadIncomplete(false);
        setPdfWarnAck(false);
      } else {
        showUiAlert(fallbackMsg, 'info');
        downloadReadyFile(readyFile);
        setReadyFile(null);
        setPdfHadIncomplete(false);
        setPdfWarnAck(false);
      }
    } catch (e: any) {
      const name = e?.name || '';
      const msg = String(e?.message || '').toLowerCase();
      if (name === 'AbortError' || msg.includes('abort') || msg.includes('cancel')) {
        return; // User cancelled share sheet, leave modal open
      }

      console.warn('Share failed', e);
      showUiAlert(fallbackMsg, 'warning');
      try { downloadReadyFile(readyFile); } catch {}
      setReadyFile(null);
      setPdfHadIncomplete(false);
      setPdfWarnAck(false);
    }
  };

  // --- Helpers for formatting report layout ---
  const vType = data.driverInfo.vehicleType;
  const vTypeLabel = VEHICLE_TYPES.find(v => v.value === vType)?.[isRTL ? 'labelAr' : 'labelEn'] || vType;
  
  const activeChecklistDef = getChecklistDefForType(vType, data.mode);
  const bodyDamageItem = data.checklist.find((i) => i.key === 'body_damage');
  const bodyDamagePoints = bodyDamageItem?.damagePoints || [];

  const checklistEvidenceItems = data.checklist.filter((i) => {
    const hasPhoto = (i.photos && i.photos.length > 0) || !!i.photo;
    if (i.key === 'body_damage') return hasPhoto;
    return (
      i.status === 'warning' ||
      i.status === 'fail' ||
      ((i.notes || '').trim().length > 0) ||
      hasPhoto
    );
  });

  const checklistPhotoEvidenceItems = checklistEvidenceItems.filter((i) => (i.photos && i.photos.length > 0) || !!i.photo);
  const checklistNotesOnlyEvidenceItems = checklistEvidenceItems.filter((i) => {
    const hasPhoto = (i.photos && i.photos.length > 0) || !!i.photo;
    return !hasPhoto && (i.status === "warning" || i.status === "fail" || ((i.notes || "").trim().length > 0));
  });

  const bodyDamageEntries = (bodyDamagePoints || [])
    .map((p, i) => ({
      key: 'body_damage',
      status: 'fail',
      notes: p.note,
      photos: p.photos && p.photos.length > 0 ? p.photos : (p.photo ? [p.photo] : [])
    }))
    .filter(p => p.photos.length > 0);

  const bodyDamageNotesEntries = (bodyDamagePoints || [])
    .map((p, i) => ({
      key: 'body_damage',
      status: 'fail',
      notes: p.note,
      photos: []
    }))
    .filter(p => !p.notes && (!p.photos || p.photos.length === 0)); // wait, if they have notes but no photo

  // Do not duplicate body damage notes into the general notes section
  // since they are already displayed right below the Vehicle Damage Map.
  const textNotesWithBody = [...checklistNotesOnlyEvidenceItems];

  const chunkBy = (arr: any[], size: number) => {
    const out: any[][] = [];
    for (let i = 0; i < (arr || []).length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  type EvidenceEntry =
    | { kind: "photo_checklist"; item: any }
    | { kind: "photo_body"; item: any }
    | { kind: "note_only"; item: any };

  const buildSmartPhotoPages = (checklistPhotos: any[], bodyPhotos: any[]): EvidenceEntry[][] => {
    const chk = [...(checklistPhotos || [])];
    const bd = [...(bodyPhotos || [])];
    const pages: EvidenceEntry[][] = [];

    while (chk.length >= 2) pages.push(chk.splice(0, 2).map(i => ({ kind: "photo_checklist" as const, item: i })));
    while (bd.length >= 2) pages.push(bd.splice(0, 2).map(d => ({ kind: "photo_checklist" as const, item: d })));

    if (chk.length + bd.length > 0) {
      const remaining: EvidenceEntry[] = [
        ...chk.map(i => ({ kind: "photo_checklist" as const, item: i })),
        ...bd.map(d => ({ kind: "photo_checklist" as const, item: d }))
      ];
      pages.push(remaining);
    }
    return pages;
  };


  // Calculate digital summary stats
  const checklistStats = useMemo(() => {
    let pass = 0;
    let fail = 0;
    let warning = 0;
    data.checklist.forEach(item => {
      if (item.status === 'pass') pass++;
      else if (item.status === 'fail') fail++;
      else if (item.status === 'warning') warning++;
    });
    return { total: pass + fail + warning, pass, fail, warning };
  }, [data.checklist]);

  const photoEvidencePages = buildSmartPhotoPages(checklistPhotoEvidenceItems, bodyDamageEntries).map(p => ({ photos: p }));
  const textEvidencePages = chunkBy([...textNotesWithBody], 5).map(np => ({
    notesOnly: np.map(n => ({ kind: "note_only" as const, item: n }))
  }));

  const hasTyrePressures = !!(data.tyrePressures && Object.values(data.tyrePressures).some((val) => typeof val === 'string' && val.trim() !== ''));
  const hasAdditionalNotes = !!data.additionalNotes?.trim();
  const hasTextNotesPage = checklistNotesOnlyEvidenceItems.length > 0 || hasTyrePressures || hasAdditionalNotes;
  const hasPhotoPages = photoEvidencePages.length > 0;
  const hasEvidencePage = hasTextNotesPage || hasPhotoPages;

  const isVehicleOrMaintenance = data.mode === 'vehicle_only' || data.mode === 'maintenance';
  // Signatures for Full / Driver Only modes are exclusively on the Driver Readiness page.
  const placeSigOnTextNotesPage = false;
  const placeSigOnLastPhotoPage = false;
  const createStandaloneSigPage = false; // Never used anymore, we use unified grid

  // --- Unified Evidence Grid System (For Vehicle / Maintenance Only) ---
  type UnifiedItem = 
    | { kind: 'photo_checklist'; item: any; weight: number }
    | { kind: 'text_only'; item: any; weight: number }
    | { kind: 'tyres'; weight: number }
    | { kind: 'additional'; weight: number }
    | { kind: 'summary'; weight: number };

  const unifiedEvidencePages = useMemo(() => {
    if (!isVehicleOrMaintenance) return [];

    const items: UnifiedItem[] = [];

    // Photo items (weight 4 = half page)
    checklistPhotoEvidenceItems.forEach(item => items.push({ kind: 'photo_checklist', item, weight: 4 }));
    bodyDamageEntries.forEach(item => items.push({ kind: 'photo_checklist', item, weight: 4 }));
    
    // Text items (weight 1 = 1/8th of page)
    textNotesWithBody.forEach(item => items.push({ kind: 'text_only', item, weight: 1 }));

    // Extras (weight 2 = 1/4th of page)
    if (hasTyrePressures) items.push({ kind: 'tyres', weight: 2 });
    if (hasAdditionalNotes) items.push({ kind: 'additional', weight: 2 });

    // Summary (weight 4 = half page)
    items.push({ kind: 'summary', weight: 4 });

    const pages: UnifiedItem[][] = [];
    let currentPage: UnifiedItem[] = [];
    let currentWeight = 0;

    items.forEach(item => {
      if (currentWeight + item.weight > 8) {
        pages.push(currentPage);
        currentPage = [];
        currentWeight = 0;
      }
      currentPage.push(item);
      currentWeight += item.weight;
    });

    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    return pages;
  }, [isVehicleOrMaintenance, checklistPhotoEvidenceItems, checklistNotesOnlyEvidenceItems, hasTyrePressures, hasAdditionalNotes]);

  const renderSignatures = () => {
    if (!data.signatures || (!data.signatures.inspector && !data.signatures.driver)) return null;
    return (
      <div className="mt-4 mb-2 flex flex-row items-center justify-around border-t-2 border-dashed border-gray-300 pt-4" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        {data.signatures.inspector && (
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 flex items-center justify-center">
              <img src={data.signatures.inspector} alt="Inspector Signature" className="max-h-full max-w-[150px] object-contain mix-blend-multiply" />
            </div>
            <div className="w-40 border-t border-gray-400 text-center pt-1">
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                {isRTL ? 'توقيع الفاحص' : 'Inspector Signature'}
              </span>
            </div>
          </div>
        )}
        {data.signatures.driver && (
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 flex items-center justify-center">
              <img src={data.signatures.driver} alt="Driver Signature" className="max-h-full max-w-[150px] object-contain mix-blend-multiply" />
            </div>
            <div className="w-40 border-t border-gray-400 text-center pt-1">
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                {isRTL ? 'توقيع السائق' : 'Driver Signature'}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSummaryAndSignatures = () => {
    return (
      <div className="mt-4 mb-2 space-y-4" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        {/* Digital Summary */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 shadow-sm">
          <h4 className="text-[12px] font-black text-gray-800 mb-3 border-b border-gray-200 pb-2 v-center-cairo">
            {isRTL ? 'ملخص الفحص' : 'Inspection Summary'}
          </h4>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <div className="text-2xl font-black text-blue-600">{checklistStats.total}</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase">{isRTL ? 'الإجمالي' : 'Total'}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-100 shadow-sm">
              <div className="text-2xl font-black text-green-600">{checklistStats.pass}</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase">{isRTL ? 'سليم' : 'Pass'}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
              <div className="text-2xl font-black text-amber-500">{checklistStats.warning}</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase">{isRTL ? 'تنبيه' : 'Warning'}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-red-100 shadow-sm">
              <div className="text-2xl font-black text-red-600">{checklistStats.fail}</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase">{isRTL ? 'معيب' : 'Fail'}</div>
            </div>
          </div>
        </div>

        {/* Signatures */}
        {renderSignatures()}
      </div>
    );
  };

  return (
    <div className="space-y-10 pb-20">
       {/* Generate Loading State Overlay */}
       {(isGeneratingPDF || isSharing) && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm no-print">
            <div className="flex flex-col items-center gap-4 px-6">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(17, 24, 39, 0.15)"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeDasharray={`${Math.max(0, Math.min(100, pdfProgress.percent))}, 100`}
                    className="text-primary-600 transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-black text-primary-900 font-mono">{Math.round(pdfProgress.percent)}%</div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      {pdfProgress.total > 0 ? `${pdfProgress.current}/${pdfProgress.total}` : ''}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className="font-black text-primary-900 uppercase tracking-widest text-sm">
                  {isSharing ? (isRTL ? 'تجهيز المشاركة' : 'Preparing Share') : (isRTL ? 'جاري إنشاء التقرير' : 'Generating Report')}
                </div>
                {pdfProgress.phase && (
                  <div className="text-[11px] font-bold text-gray-600">
                    {pdfProgress.phase}
                    {pdfAttempt > 0 ? ` • ${isRTL ? 'محاولة' : 'Attempt'} ${pdfAttempt}/2` : ''}
                  </div>
                )}
                {typeof pdfProgress.etaSec === 'number' && pdfProgress.etaSec > 0 && (
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    {isRTL ? 'الوقت المتبقي تقريبًا' : 'Approx. remaining'}: {Math.ceil(pdfProgress.etaSec)}s
                  </div>
                )}
              </div>
            </div>
         </div>
       )}

       {/* Share Success Modal */}
       {readyFile && (
         <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md no-print animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center space-y-6 shadow-2xl animate-scale-in">
               <div className="mx-auto w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center shadow-inner">
                  <CheckCircle size={48} />
               </div>
               <div className="space-y-2">
                  <h3 className="text-xl font-black text-gray-900 v-center-cairo">{isRTL ? 'التقرير جاهز الآن' : 'Report is Ready'}</h3>
                  <p className="text-sm font-bold text-gray-500 leading-relaxed">
                    {isRTL ? 'تم إنشاء التقرير بنجاح، اضغط على الزر أدناه لمشاركته فوراً عبر تطبيقات التواصل.' : 'Report generated successfully. Click the button below to share it via messaging apps.'}
                  </p>
               </div>
               <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleFinalShare}
                    className="w-full py-4 rounded-xl bg-primary-600 text-white font-black text-lg shadow-xl shadow-primary-200 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <Share2 size={22} />
                    <span className="v-center-cairo">{isRTL ? 'مشاركة التقرير' : 'Share Now'}</span>
                  </button>
                  <button 
                    onClick={() => { setReadyFile(null); setPdfHadIncomplete(false); setPdfWarnAck(false); setPdfWarning(null); }}
                    className="w-full py-3 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </button>
               </div>
            </div>
         </div>
       )}

       {/* Warning Dialog Modal */}
       {pdfWarning && (
         <div className="fixed inset-0 z-[240] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md no-print animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[2rem] p-7 text-center space-y-5 shadow-2xl animate-scale-in border border-gray-200">
               <div className="mx-auto w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center shadow-inner">
                  <AlertTriangle size={40} />
               </div>
               <p className="text-sm font-bold text-gray-700 leading-relaxed">
                 {pdfWarning}
               </p>
               <button
                 onClick={() => { setPdfWarnAck(true); setPdfWarning(null); setTimeout(() => { handleFinalShare(); }, 0); }}
                 className="w-full py-4 rounded-xl bg-primary-600 text-white font-black text-lg shadow-xl shadow-primary-200 active:scale-95 transition-all"
               >
                 <span className="v-center-cairo">{isRTL ? 'متابعة الإرسال' : 'Continue'}</span>
               </button>
            </div>
         </div>
       )}

       {/* Alerts Banner (Fixed Toast via Portal) */}
       {uiAlert.show && typeof document !== 'undefined' && createPortal(
         <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] w-11/12 max-w-md pointer-events-none no-print animate-fade-in-down">
           <div
             className={`p-4 rounded-2xl border shadow-2xl font-black text-sm flex items-center gap-3 ${
               uiAlert.type === 'fail'
                 ? 'bg-red-50 text-red-800 border-red-300 shadow-red-200'
                 : uiAlert.type === 'warning'
                 ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-amber-200'
                 : 'bg-blue-50 text-blue-900 border-blue-300 shadow-blue-200'
             }`}
           >
             <AlertTriangle className={`w-6 h-6 flex-shrink-0 ${uiAlert.type === 'fail' ? 'text-red-600' : uiAlert.type === 'warning' ? 'text-amber-600' : 'text-blue-600'}`} />
             <span className="v-center-cairo leading-tight">{uiAlert.message}</span>
           </div>
         </div>,
         document.body
       )}

       {/* Title Header */}
       <div className="flex justify-between items-center px-1 no-print">
          <div className="flex flex-col gap-0.5">
             <h2 className="text-2xl font-black text-gray-900 v-center-cairo justify-start">{t.summary}</h2>
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{isRTL ? "معاينة التقرير النهائي (A4)" : "Report Preview"}</p>
          </div>
       </div>

       {/* A4 Report Pages Render */}
       <div className="flex flex-col items-center gap-0 no-scrollbar w-full px-2" id="print-zone">
          {/* Page 1: Vehicle Checklist and Body Map */}
          {(data.mode === 'full' || data.mode === 'vehicle_only' || data.mode === 'maintenance') && (
            <ScaledPreview>
              <div className="ui-preview-card h-fit">
                <div className="a4-preview-wrapper font-cairo flex flex-col report-light" dir={isRTL ? 'rtl' : 'ltr'} lang={isRTL ? 'ar' : 'en'}>
                  <CompactReportHeader titleSuffix={data.mode === 'maintenance' ? (isRTL ? `تقرير قسم الصيانة - ${vTypeLabel}` : `Maintenance Inspection Report - ${vTypeLabel}`) : (isRTL ? `فحص المركبة - ${vTypeLabel}` : `Vehicle Inspection - ${vTypeLabel}`)} lang={lang} />
                  <CompactInfoGrid data={data} t={t} lang={lang} />
                  <div className="flex-1 flex flex-col gap-0">
                    <div className="mb-1">
                        <div className="grid grid-cols-4 gap-x-2 gap-y-1.5">
                          {data.checklist.slice(0, data.mode === 'maintenance' && data.checklist.length > 36 ? 36 : data.checklist.length).map((item) => {
                            const itemDef = activeChecklistDef.find(c => c.key === item.key);
                            const statusLabels = CHECKLIST_STATUS_LABELS[item.key] || CHECKLIST_STATUS_LABELS['body_damage'];
                            const displayLabel = item.status === 'pass' 
                              ? statusLabels.pass[lang as keyof typeof statusLabels.pass] 
                              : item.status === 'fail' 
                              ? statusLabels.fail[lang as keyof typeof statusLabels.fail] 
                              : t[item.status as keyof typeof t];

                            return (
                              <div 
                                key={item.key} 
                                className={`p-1.5 border rounded-xl flex flex-col gap-0.5 shadow-xs h-[92px] justify-between ${
                                  item.status === 'fail' 
                                    ? 'bg-red-50 border-red-100' 
                                    : item.status === 'warning' 
                                    ? 'bg-amber-50 border-amber-100' 
                                    : 'bg-white border-gray-300'
                                }`}
                              >
                                <div className="flex items-center gap-1">
                                  <div className={`p-0.5 rounded bg-gray-50 text-primary-600 border border-gray-300 flex-shrink-0 ${
                                    item.status === 'fail' ? 'bg-red-100 text-red-600 border-red-200' : ''
                                  }`}>
                                    {itemDef && <itemDef.icon size={22} />}
                                  </div>
                                  <span 
                                    className="text-[10px] font-black text-gray-800 leading-[1.1] flex-1 v-center-cairo justify-start break-words overflow-hidden" 
                                    style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical' }}
                                  >
                                    {t[item.key as keyof typeof t] || item.key}
                                  </span>
                                </div>
                                
                                <div className={`w-full rounded text-[8.5px] text-white font-black h-[22px] v-center-cairo shadow-sm ${
                                  item.status === 'pass' 
                                    ? 'bg-green-600' 
                                    : item.status === 'warning' 
                                    ? 'bg-amber-500' 
                                    : item.status === 'fail' 
                                    ? 'bg-red-600' 
                                    : 'bg-gray-100 text-gray-400'
                                }`}>
                                  <div className="w-full flex items-center justify-center h-full">
                                    {item.status === 'unchecked' ? '-' : (() => {
                                      const isDateRequired = ['fire_ext', 'fire_ext_1', 'fire_ext_2', 'safety_kit', 'aed_device', 'tyres_condition', 'spare_tire'].includes(item.key);
                                      const isPast = isDateRequired && item.expiryDate && new Date(item.expiryDate) <= new Date();
                                      
                                      if (isDateRequired && item.expiryDate) {
                                        return (
                                          <div className="flex items-center justify-center gap-1.5 w-full px-0.5">
                                            <span className="truncate">{displayLabel}</span>
                                            <div 
                                              dir={isRTL ? "rtl" : "ltr"} 
                                              className={`flex items-center gap-1 px-1.5 rounded-[3px] shadow-[inset_0_1px_1px_rgba(0,0,0,0.05)] border ${
                                                isPast 
                                                  ? "bg-white/25 text-white border-white/30" 
                                                  : "bg-black/20 text-white border-transparent"
                                              }`}
                                              style={{ paddingTop: '1.5px', paddingBottom: '1.5px' }}
                                            >
                                              <span className="text-[7.5px] font-semibold opacity-90 mt-[1px] tracking-wide v-center-cairo">
                                                {isRTL ? 'الانتهاء:' : 'Exp:'}
                                              </span>
                                              <span dir="ltr" className="text-[8px] font-mono tracking-widest font-bold v-center-cairo mt-[1px]">
                                                {formatDisplayDate(item.expiryDate, lang)}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      }
                                      return <span>{displayLabel}</span>;
                                    })()}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                    </div>
                    
                    {/* Vehicle Damage points section (Only on Page 1 if not maintenance OR length <= 36) */}
                    {!(data.mode === 'maintenance' && data.checklist.length > 36) && (
                      <div className="mt-auto border-2 rounded-xl bg-gray-50/40 p-3 border-primary-50 shadow-sm flex-shrink-0 flex flex-col gap-2">
                          <div className="flex items-center gap-2 border-b-2 border-primary-100 pb-1 mb-0.5">
                              <MapIcon size={16} className="text-primary-600" />
                              <h2 className="text-[14px] font-black text-primary-900 v-center-cairo">
                                {isRTL ? "خريطة الأضرار بهيكل المركبة" : "Vehicle Body Damage Diagram"}
                              </h2>
                          </div>
                          <div className="flex flex-col gap-2 items-center">
                              <div className="flex-shrink-0 bg-white rounded-lg border border-gray-300 p-0.5 w-full max-w-[500px] shadow-inner">
                                <VehicleBodyMap 
                                  points={bodyDamagePoints} 
                                  readOnly 
                                  type={data.driverInfo.vehicleType} 
                                  compact 
                                  isRTL={isRTL} 
                                />
                              </div>
                              
                              {bodyDamagePoints.length > 0 && (
                                <div className="w-full grid grid-cols-2 gap-x-6 gap-y-1.5 mt-0.5 border-t border-primary-100 pt-2">
                                  {bodyDamagePoints.slice(0, 8).map((pt, idx) => (
                                    <div key={idx} className="flex items-start gap-2 min-w-0">
                                      <div className={`w-4 h-4 flex-shrink-0 text-white rounded flex items-center justify-center text-[9px] font-black font-mono shadow-sm ${
                                        pt.severity === 'warning' ? 'bg-amber-500' : 'bg-red-600'
                                      }`}>
                                        {idx + 1}
                                      </div>
                                      <span className="text-[10px] font-semibold text-gray-800 justify-start leading-snug whitespace-normal break-words min-w-0">
                                        <span className={`font-black text-[9px] px-1 rounded-sm mr-1 ${
                                          pt.severity === 'warning' ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'
                                        }`}>
                                          {pt.severity === 'warning' ? (isRTL ? 'تنبيه' : 'Warning') : (isRTL ? 'ضرر' : 'Fail')}
                                        </span>
                                        {pt.note || (isRTL ? 'بدون ملاحظة' : 'No note')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                      </div>
                    )}
                  </div>
                  <ReportPageFooter isRTL={isRTL} lang={lang} pageNumber={1} />
                </div>
              </div>
            </ScaledPreview>
          )}

          {/* Page 2: Remaining Checklist Items and Body Map (If Maintenance mode and length > 36) */}
          {(data.mode === 'maintenance' && data.checklist.length > 36) && (
            <ScaledPreview>
              <div className="ui-preview-card h-fit">
                <div className="a4-preview-wrapper font-cairo flex flex-col report-light" dir={isRTL ? 'rtl' : 'ltr'} lang={isRTL ? 'ar' : 'en'}>
                  <CompactReportHeader titleSuffix={data.mode === 'maintenance' ? (isRTL ? "تقرير فحص الصيانة - تكملة" : "Maintenance Inspection - Continued") : ""} lang={lang} />
                  <div className="flex-1 flex flex-col gap-0 mt-2">
                    <div className="mb-1">
                        <div className="grid grid-cols-4 gap-x-2 gap-y-1.5">
                          {data.checklist.slice(36).map((item) => {
                            const itemDef = activeChecklistDef.find(c => c.key === item.key);
                            const statusLabels = CHECKLIST_STATUS_LABELS[item.key] || CHECKLIST_STATUS_LABELS['body_damage'];
                            const displayLabel = item.status === 'pass' 
                              ? statusLabels.pass[lang as keyof typeof statusLabels.pass] 
                              : item.status === 'fail' 
                              ? statusLabels.fail[lang as keyof typeof statusLabels.fail] 
                              : t[item.status as keyof typeof t];

                            return (
                              <div 
                                key={item.key} 
                                className={`p-1.5 border rounded-xl flex flex-col gap-0.5 shadow-xs h-[92px] justify-between ${
                                  item.status === 'fail' 
                                    ? 'bg-red-50 border-red-100' 
                                    : item.status === 'warning' 
                                    ? 'bg-amber-50 border-amber-100' 
                                    : 'bg-white border-gray-300'
                                }`}
                              >
                                <div className="flex items-center gap-1">
                                  <div className={`p-0.5 rounded bg-gray-50 text-primary-600 border border-gray-300 flex-shrink-0 ${
                                    item.status === 'fail' ? 'bg-red-100 text-red-600 border-red-200' : ''
                                  }`}>
                                    {itemDef && <itemDef.icon size={22} />}
                                  </div>
                                  <span 
                                    className="text-[10px] font-black text-gray-800 leading-[1.1] flex-1 v-center-cairo justify-start break-words overflow-hidden" 
                                    style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical' }}
                                  >
                                    {t[item.key as keyof typeof t] || item.key}
                                  </span>
                                </div>
                                
                                <div className={`w-full rounded text-[8.5px] text-white font-black h-[22px] v-center-cairo shadow-sm ${
                                  item.status === 'pass' 
                                    ? 'bg-green-600' 
                                    : item.status === 'warning' 
                                    ? 'bg-amber-500' 
                                    : item.status === 'fail' 
                                    ? 'bg-red-600' 
                                    : 'bg-gray-100 text-gray-400'
                                }`}>
                                  <div className="w-full flex items-center justify-center h-full">
                                    {item.status === 'unchecked' ? '-' : (() => {
                                      const isDateRequired = ['fire_ext', 'fire_ext_1', 'fire_ext_2', 'safety_kit', 'aed_device', 'tyres_condition', 'spare_tire'].includes(item.key);
                                      const isPast = isDateRequired && item.expiryDate && new Date(item.expiryDate) <= new Date();
                                      
                                      if (isDateRequired && item.expiryDate) {
                                        return (
                                          <div className="flex items-center justify-center gap-1.5 w-full px-0.5">
                                            <span className="truncate">{displayLabel}</span>
                                            <div 
                                              dir={isRTL ? "rtl" : "ltr"} 
                                              className={`flex items-center gap-1 px-1.5 rounded-[3px] shadow-[inset_0_1px_1px_rgba(0,0,0,0.05)] border ${
                                                isPast 
                                                  ? "bg-white/25 text-white border-white/30" 
                                                  : "bg-black/20 text-white border-transparent"
                                              }`}
                                              style={{ paddingTop: '1.5px', paddingBottom: '1.5px' }}
                                            >
                                              <span className="text-[7.5px] font-semibold opacity-90 mt-[1px] tracking-wide v-center-cairo">
                                                {isRTL ? 'الانتهاء:' : 'Exp:'}
                                              </span>
                                              <span dir="ltr" className="text-[8px] font-mono tracking-widest font-bold v-center-cairo mt-[1px]">
                                                {formatDisplayDate(item.expiryDate, lang)}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      }
                                      return <span>{displayLabel}</span>;
                                    })()}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                    </div>
                    
                    {/* Vehicle Damage points section (On Page 2 for maintenance mode) */}
                    <div className="mt-auto border-2 rounded-xl bg-gray-50/40 p-3 border-primary-50 shadow-sm flex-shrink-0 flex flex-col gap-2">
                        <div className="flex items-center gap-2 border-b-2 border-primary-100 pb-1 mb-0.5">
                            <MapIcon size={16} className="text-primary-600" />
                            <h2 className="text-[14px] font-black text-primary-900 v-center-cairo">
                              {isRTL ? "خريطة الأضرار بهيكل المركبة" : "Vehicle Body Damage Diagram"}
                            </h2>
                        </div>
                        <div className="flex flex-col gap-2 items-center">
                            <div className="flex-shrink-0 bg-white rounded-lg border border-gray-300 p-0.5 w-full max-w-[500px] shadow-inner">
                              <VehicleBodyMap 
                                points={bodyDamagePoints} 
                                readOnly 
                                type={data.driverInfo.vehicleType} 
                                compact 
                                isRTL={isRTL} 
                              />
                            </div>
                            
                            {bodyDamagePoints.length > 0 && (
                              <div className="w-full grid grid-cols-2 gap-x-6 gap-y-1.5 mt-0.5 border-t border-primary-100 pt-2">
                                {bodyDamagePoints.slice(0, 8).map((pt, idx) => (
                                  <div key={idx} className="flex items-start gap-2 min-w-0">
                                    <div className={`w-4 h-4 flex-shrink-0 text-white rounded flex items-center justify-center text-[9px] font-black font-mono shadow-sm ${
                                      pt.severity === 'warning' ? 'bg-amber-500' : 'bg-red-600'
                                    }`}>
                                      {idx + 1}
                                    </div>
                                    <span className="text-[10px] font-semibold text-gray-800 justify-start leading-snug whitespace-normal break-words min-w-0">
                                      <span className={`font-black text-[9px] px-1 rounded-sm mr-1 ${
                                        pt.severity === 'warning' ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'
                                      }`}>
                                        {pt.severity === 'warning' ? (isRTL ? 'تنبيه' : 'Warning') : (isRTL ? 'ضرر' : 'Fail')}
                                      </span>
                                      {pt.note || (isRTL ? 'بدون ملاحظة' : 'No note')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                    </div>
                  </div>
                  <ReportPageFooter />
                </div>
              </div>
            </ScaledPreview>
          )}

          {/* Unified Evidence Grid Pages (Vehicle/Maintenance Only) */}
          {isVehicleOrMaintenance && unifiedEvidencePages.map((page, pageIndex) => (
            <ScaledPreview key={`unified-page-${pageIndex}`}>
              <div className="ui-preview-card h-fit">
                <div className="a4-preview-wrapper fixed-a4-height font-cairo flex flex-col report-light" dir={isRTL ? 'rtl' : 'ltr'} lang={isRTL ? 'ar' : 'en'}>
                  <CompactReportHeader
                    titleSuffix={isRTL ? `الملاحظات والملخص (${pageIndex + 1}/${unifiedEvidencePages.length})` : `Evidence & Summary (${pageIndex + 1}/${unifiedEvidencePages.length})`}
                    lang={lang}
                  />
                  <CompactInfoGrid data={data} t={t} lang={lang} />
                  
                  <div className="flex-1 min-h-0 h-full mt-4 grid gap-3 pb-4" style={{ gridTemplateRows: 'repeat(8, minmax(0, 1fr))' }}>
                    {page.map((uItem, slotIdx) => {
                      const rowSpanClass = uItem.weight === 4 ? 'row-span-4' : uItem.weight === 2 ? 'row-span-2' : 'row-span-1';

                      if (uItem.kind === 'photo_checklist') {
                        const item = uItem.item;
                        const itemPhotos = item.photos && item.photos.length > 0 ? item.photos : (item.photo ? [item.photo] : []);
                        const noteText = (() => {
                          const n = (item.notes || '').trim();
                          if (n) return n;
                          if (item.status === 'warning' || item.status === 'fail') {
                            return isRTL ? 'صورة توضيحية.' : 'Illustrative image.';
                          }
                          return null;
                        })();

                        return (
                          <div key={`u-photo-${pageIndex}-${slotIdx}`} className={`${rowSpanClass} min-h-0 flex flex-col`}>
                            <div className="relative h-full min-h-0 bg-gray-50 rounded-2xl border border-gray-300 overflow-hidden shadow-sm flex flex-col">
                              <div className={`absolute top-0 bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-[6px] ${item.status === 'fail' ? 'bg-red-600' : item.status === 'warning' ? 'bg-amber-400' : 'bg-green-500'}`} />
                              <div className="p-3 pb-1 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                  <div className="p-1 bg-primary-100 text-primary-700 rounded text-[10px]">
                                    {(() => { const def = activeChecklistDef.find((c) => c.key === item.key); return def && <def.icon size={14} />; })()}
                                  </div>
                                  <p className="text-[11px] font-black text-primary-900 truncate">{t[item.key as keyof typeof t]}</p>
                                </div>
                              </div>
                              {noteText && (
                                <div className="px-3 pb-1 flex-shrink-0">
                                  <div className="bg-white/80 p-2 rounded border border-gray-200">
                                    <p className="text-[9px] font-bold text-gray-700 leading-tight line-clamp-1">{noteText}</p>
                                  </div>
                                </div>
                              )}
                              <div className="px-3 pb-3 flex-1 min-h-0">
                                <div className={`h-full min-h-0 grid gap-2 ${itemPhotos.length === 3 ? 'grid-cols-3' : itemPhotos.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                  {itemPhotos.map((photoUrl: string, pIdx: number) => (
                                    <div key={pIdx} className="relative bg-white rounded-lg border border-gray-200 overflow-hidden">
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <img src={photoUrl} alt={`${item.key}-${pIdx}`} className="max-w-full max-h-full object-contain" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (uItem.kind === 'text_only') {
                        const item = uItem.item;
                        
                        const statusLabels = CHECKLIST_STATUS_LABELS[item.key] || CHECKLIST_STATUS_LABELS['battery'];
                        const statusPill = (() => {
                          if (item.status === 'fail') {
                            return {
                              text: statusLabels.fail[lang as keyof typeof statusLabels.fail],
                              cls: 'text-red-700 border-red-300 bg-transparent',
                              icon: <XCircle size={14} className="text-red-600" strokeWidth={2.5} />,
                              bar: 'bg-red-500'
                            };
                          }
                          if (item.status === 'warning') {
                            return {
                              text: isRTL ? 'تنبيه' : 'Warning',
                              cls: 'text-amber-600 border-amber-300 bg-transparent',
                              icon: <AlertTriangle size={14} className="text-amber-500" strokeWidth={2.5} />,
                              bar: 'bg-amber-400'
                            };
                          }
                          return {
                            text: isRTL ? 'غير محدد' : 'Unchecked',
                            cls: 'text-gray-500 border-gray-300 bg-transparent',
                            icon: <HelpCircle size={14} className="text-gray-400" strokeWidth={2.5} />,
                            bar: 'bg-gray-400'
                          };
                        })();

                        const cardTone = (() => {
                          if (item.status === 'fail') return 'bg-red-50/40 border-red-200';
                          if (item.status === 'warning') return 'bg-[#FFFDF0] border-[#FDE68A]';
                          return 'bg-white border-gray-200';
                        })();

                        return (
                          <div key={`u-txt-${pageIndex}-${slotIdx}`} className={`${rowSpanClass} min-h-0 flex flex-col`}>
                            <div className={`relative h-full min-h-0 rounded-xl border shadow-sm flex flex-col ${cardTone}`}>
                              <div className={`absolute top-0 bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-[6px] z-10 ${statusPill.bar} rounded-r-xl`} />
                              
                              <div className={`flex flex-col h-full p-2.5 ${isRTL ? 'pr-4' : 'pl-4'}`}>
                                <div className="flex items-center justify-between gap-3 mb-2 shrink-0">
                                  <div className="min-w-0">
                                    <p className="text-[13px] font-black text-slate-800 v-center-cairo justify-start truncate">
                                      {t[item.key as keyof typeof t] || item.label}
                                    </p>
                                  </div>
                                  <div className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border flex-shrink-0 ${statusPill.cls}`}>
                                    {statusPill.icon}
                                    <span className="v-center-cairo leading-none mt-0.5">{statusPill.text}</span>
                                  </div>
                                </div>
                                <div className="flex-1 bg-white p-2.5 rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-h-0 overflow-hidden">
                                  <p className={`text-[12px] font-bold text-gray-700 leading-relaxed whitespace-pre-wrap break-words line-clamp-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {item.notes}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (uItem.kind === 'tyres') {
                        const is6Tyre = ['heavy_bus', 'light_bus', 'ambulance'].includes(data.driverInfo.vehicleType);
                        const baseTyreItems = is6Tyre
                          ? [
                              { key: 'FL', value: data.tyrePressures?.fl },
                              { key: 'FR', value: data.tyrePressures?.fr },
                              { key: 'RLO', value: data.tyrePressures?.rlo },
                              { key: 'RLI', value: data.tyrePressures?.rli },
                              { key: 'RRO', value: data.tyrePressures?.rro },
                              { key: 'RRI', value: data.tyrePressures?.rri },
                            ]
                          : [
                              { key: 'FL', value: data.tyrePressures?.fl },
                              { key: 'FR', value: data.tyrePressures?.fr },
                              { key: 'RL', value: data.tyrePressures?.rl },
                              { key: 'RR', value: data.tyrePressures?.rr },
                            ];
                        const tyreItems = (data.mode === 'maintenance' && data.driverInfo.vehicleType !== 'electric_vehicle') 
                          ? [
                              ...baseTyreItems,
                              { key: 'ST1', value: data.tyrePressures?.st1 },
                              { key: 'ST2', value: data.tyrePressures?.st2 },
                            ]
                          : baseTyreItems;
                        
                        const activeTyres = tyreItems.filter(t => t.value && String(t.value).trim() !== '');

                        return (
                          <div key={`u-tyres`} className={`${rowSpanClass} min-h-0 bg-gray-50 rounded-2xl border border-gray-300 p-3 shadow-sm flex flex-col`}>
                            <h3 className="text-[10px] font-black text-primary-900 uppercase tracking-widest mb-2 pb-1 border-b border-gray-300">{isRTL ? 'قياسات ضغط الإطارات' : 'Tyre Pressures'}</h3>
                            <div className={`grid ${activeTyres.length === 6 ? 'grid-cols-3' : 'grid-cols-4'} gap-2 flex-1 min-h-0`}>
                              {activeTyres.map((tyre) => (
                                <div key={tyre.key} className="bg-white rounded-lg border border-gray-200 p-1 flex flex-col items-center justify-center">
                                  <span className="text-[8px] font-black text-gray-400 uppercase">{tyre.key}</span>
                                  <span className="text-sm font-black text-primary-900">{tyre.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      if (uItem.kind === 'additional') {
                        return (
                          <div key={`u-addl`} className={`${rowSpanClass} min-h-0 bg-gray-50 rounded-2xl border border-gray-300 p-3 shadow-sm flex flex-col`}>
                            <h3 className="text-[10px] font-black text-primary-900 uppercase tracking-widest mb-2 pb-1 border-b border-gray-300">{isRTL ? 'ملاحظات إضافية' : 'Additional Notes'}</h3>
                            <div className="flex-1 overflow-hidden bg-white rounded-lg border border-gray-200 p-2">
                              <p className="text-[10px] font-bold text-gray-700 whitespace-pre-wrap leading-tight line-clamp-3">{data.additionalNotes}</p>
                            </div>
                          </div>
                        );
                      }

                      if (uItem.kind === 'summary') {
                        return (
                          <div key={`u-sum`} className={`${rowSpanClass} flex flex-col justify-center min-h-0`}>
                            {renderSummaryAndSignatures()}
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                  
                  <ReportPageFooter />
                </div>
              </div>
            </ScaledPreview>
          ))}

          {/* Page 2: Photo and Text Evidence (For Full / Driver Only modes) */}
          {(data.mode === 'full' || data.mode === 'driver_only') && hasEvidencePage && (
            <>
              {/* Photo Evidence Pages */}
              {photoEvidencePages.map((page, pageIndex) => (
                <ScaledPreview key={`photo-notes-${pageIndex}`}>
                  <div className="ui-preview-card h-fit">
                    <div className="a4-preview-wrapper font-cairo flex flex-col report-light" dir={isRTL ? 'rtl' : 'ltr'} lang={isRTL ? 'ar' : 'en'}>
                      <CompactReportHeader
                        titleSuffix={
                          isRTL
                            ? `الملاحظات المصوّرة (${pageIndex + 1}/${photoEvidencePages.length})`
                            : `Photo Notes (${pageIndex + 1}/${photoEvidencePages.length})`
                        }
                        lang={lang}
                      />
                      <CompactInfoGrid data={data} t={t} lang={lang} />

                      {/* Displaying up to 2 items per page */}
                      <div className="flex-1 min-h-0 mt-4 grid grid-rows-2 gap-4">
                        {[0, 1].map((slotIdx) => {
                          const wrap = page.photos[slotIdx];
                          if (!wrap) return <div key={`slot-empty-${pageIndex}-${slotIdx}`} className="min-h-0 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center opacity-50"><span className="text-gray-300 font-black tracking-widest text-[10px] uppercase">Empty Slot</span></div>;

                          if (wrap.kind === 'photo_checklist') {
                            const item = wrap.item;
                            const itemPhotos = item.photos && item.photos.length > 0 ? item.photos : (item.photo ? [item.photo] : []);
                            
                            const noteText = (() => {
                              const n = (item.notes || '').trim();
                              if (n) return n;
                              if (item.status === 'warning' || item.status === 'fail') {
                                return isRTL ? 'صورة توضيحية لهيكل المركبة.' : 'Illustrative image of the vehicle body.';
                              }
                              return null;
                            })();

                            return (
                              <div key={`slot-chk-${pageIndex}-${slotIdx}-${item.key}`} className="min-h-0 flex flex-col h-full">
                                <div className="relative h-full min-h-0 bg-gray-50 rounded-2xl border border-gray-300 overflow-hidden shadow-sm flex flex-col">
                                  <div
                                    className={`absolute top-0 bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-[6px] ${
                                      item.status === 'fail' ? 'bg-red-600' : item.status === 'warning' ? 'bg-amber-400' : 'bg-green-500'
                                    }`}
                                  />

                                  <div className="p-4 pb-2 flex-shrink-0">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="p-1.5 bg-primary-100 text-primary-700 rounded-lg flex-shrink-0">
                                          {(() => {
                                            const def = activeChecklistDef.find((c) => c.key === item.key);
                                            return def && <def.icon size={18} />;
                                          })()}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-[12px] font-black text-primary-900 v-center-cairo justify-start truncate">
                                            {t[item.key as keyof typeof t]}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {noteText && (
                                    <div className="px-4 pb-2 flex-shrink-0">
                                      <div className="bg-white/80 p-2.5 rounded-xl border border-gray-300">
                                        <p
                                          className="text-[10px] font-bold text-gray-700 leading-relaxed whitespace-pre-wrap break-words"
                                          style={{
                                            overflowWrap: 'anywhere',
                                            wordBreak: 'break-word',
                                            whiteSpace: 'normal',
                                            display: '-webkit-box',
                                            WebkitLineClamp: '2',
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                          }}
                                        >
                                          {noteText}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  <div className="px-4 pb-4 flex-1 min-h-0">
                                    <div className={`h-full min-h-0 grid gap-2 ${itemPhotos.length === 3 ? 'grid-cols-3' : itemPhotos.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                      {itemPhotos.map((photoUrl: string, pIdx: number) => (
                                        <div key={pIdx} className="relative bg-white rounded-xl border border-gray-300 overflow-hidden shadow-inner">
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <img src={photoUrl} alt={`${item.key}-${pIdx}`} className="max-w-full max-h-full object-contain bg-white" />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>

                      {placeSigOnLastPhotoPage && pageIndex === photoEvidencePages.length - 1 && renderSummaryAndSignatures()}
                      <ReportPageFooter />
                    </div>
                  </div>
                </ScaledPreview>
              ))}

              {/* Unified Text Notes & Additional Data Page(s) */}
              {(() => {
                // Flatten all text note items
                const allTextItems = checklistNotesOnlyEvidenceItems;
                const hasExtras = hasTyrePressures || hasAdditionalNotes;
                const hasTextNotes = allTextItems.length > 0;
                if (!hasTextNotes && !hasExtras) return null;

                return (
                  <ScaledPreview>
                    <div className="ui-preview-card h-fit">
                      <div className="a4-preview-wrapper font-cairo flex flex-col report-light" dir={isRTL ? 'rtl' : 'ltr'} lang={isRTL ? 'ar' : 'en'}>
                        <CompactReportHeader
                          titleSuffix={isRTL ? 'الملاحظات والبيانات الإضافية' : 'Notes & Additional Data'}
                          lang={lang}
                        />
                        <CompactInfoGrid data={data} t={t} lang={lang} />

                        <div className="flex-1 min-h-0 mt-4 space-y-3">
                          {/* Text-only notes */}
                          {hasTextNotes && (
                              <div className="grid grid-cols-1 gap-2">
                                {allTextItems.map((item, idx) => {
                                  const noteText = (() => {
                                    const n = (item.notes || '').trim();
                                    if (n) return n;
                                    if (item.status === 'warning' || item.status === 'fail') {
                                      return isRTL ? 'تم رصد تنبيه/ضرر بدون ملاحظة نصية.' : 'Warning/Fail recorded without text notes.';
                                    }
                                    return null;
                                  })();
                                  if (!noteText) return null;

                                  const statusLabels = CHECKLIST_STATUS_LABELS[item.key] || CHECKLIST_STATUS_LABELS['battery'];
                                  const statusPill = (() => {
                                    if (item.status === 'fail') {
                                      return {
                                        text: statusLabels.fail[lang as keyof typeof statusLabels.fail],
                                        cls: 'text-red-700 border-red-300 bg-transparent',
                                        icon: <XCircle size={14} className="text-red-600" strokeWidth={2.5} />,
                                        bar: 'bg-red-500'
                                      };
                                    }
                                    if (item.status === 'warning') {
                                      return {
                                        text: isRTL ? 'تنبيه' : 'Warning',
                                        cls: 'text-amber-600 border-amber-300 bg-transparent',
                                        icon: <AlertTriangle size={14} className="text-amber-500" strokeWidth={2.5} />,
                                        bar: 'bg-amber-400'
                                      };
                                    }
                                    return {
                                      text: isRTL ? 'غير محدد' : 'Unchecked',
                                      cls: 'text-gray-500 border-gray-300 bg-transparent',
                                      icon: <HelpCircle size={14} className="text-gray-400" strokeWidth={2.5} />,
                                      bar: 'bg-gray-400'
                                    };
                                  })();

                                  const cardTone = (() => {
                                    if (item.status === 'fail') return 'bg-red-50/40 border-red-200';
                                    if (item.status === 'warning') return 'bg-[#FFFDF0] border-[#FDE68A]'; // amber-200
                                    return 'bg-white border-gray-200';
                                  })();

                                  return (
                                    <div key={`unified-tn-${idx}-${item.key || item.id}`} className={`relative rounded-xl border shadow-sm ${cardTone}`}>
                                      <div className={`absolute top-0 bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-[6px] ${statusPill.bar} rounded-r-xl`} />
                                      <div className={`p-3 ${isRTL ? 'pr-5' : 'pl-5'}`}>
                                        <div className="flex items-center justify-between gap-3 mb-2.5">
                                          <div className="min-w-0">
                                            <p className="text-[13px] font-black text-slate-800 v-center-cairo justify-start truncate">
                                              {t[item.key as keyof typeof t] || item.label}
                                            </p>
                                          </div>
                                          <div className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border flex-shrink-0 ${statusPill.cls}`}>
                                            {statusPill.icon}
                                            <span className="v-center-cairo leading-none mt-0.5">{statusPill.text}</span>
                                          </div>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                          <p
                                            className={`text-[12px] font-bold text-gray-700 leading-relaxed whitespace-pre-wrap break-words ${isRTL ? 'text-right' : 'text-left'}`}
                                            style={{
                                              overflowWrap: 'anywhere',
                                              wordBreak: 'break-word',
                                              whiteSpace: 'normal',
                                            }}
                                          >
                                            {noteText}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                          )}

                          {/* Tyre Pressure Table */}
                          {hasTyrePressures && (() => {
                            const is6Tyre = ['heavy_bus', 'light_bus', 'ambulance'].includes(data.driverInfo.vehicleType);
                            const baseTyreItems = is6Tyre
                              ? [
                                  { label: isRTL ? 'أمامي يسار' : 'Front Left', value: data.tyrePressures?.fl },
                                  { label: isRTL ? 'أمامي يمين' : 'Front Right', value: data.tyrePressures?.fr },
                                  { label: isRTL ? 'خلفي يسار خارجي' : 'Rear Left Outer', value: data.tyrePressures?.rlo },
                                  { label: isRTL ? 'خلفي يسار داخلي' : 'Rear Left Inner', value: data.tyrePressures?.rli },
                                  { label: isRTL ? 'خلفي يمين خارجي' : 'Rear Right Outer', value: data.tyrePressures?.rro },
                                  { label: isRTL ? 'خلفي يمين داخلي' : 'Rear Right Inner', value: data.tyrePressures?.rri },
                                ]
                              : [
                                  { label: isRTL ? 'أمامي يسار' : 'Front Left', value: data.tyrePressures?.fl },
                                  { label: isRTL ? 'أمامي يمين' : 'Front Right', value: data.tyrePressures?.fr },
                                  { label: isRTL ? 'خلفي يسار' : 'Rear Left', value: data.tyrePressures?.rl },
                                  { label: isRTL ? 'خلفي يمين' : 'Rear Right', value: data.tyrePressures?.rr },
                                ];
                            const tyreItems = (data.mode === 'maintenance' && data.driverInfo.vehicleType !== 'electric_vehicle') 
                              ? [
                                  ...baseTyreItems,
                                  { label: isRTL ? 'ضغط إطار احتياطي 1' : 'Spare Tyre 1 Pressure', value: data.tyrePressures?.st1 },
                                  { label: isRTL ? 'ضغط إطار احتياطي 2' : 'Spare Tyre 2 Pressure', value: data.tyrePressures?.st2 },
                                ]
                              : baseTyreItems;

                            return (
                              <div className="border border-gray-300 rounded-xl p-4 bg-gray-50/50 shadow-sm">
                                <h3 className="text-[12px] font-black text-primary-900 uppercase tracking-widest mb-3 pb-1.5 border-b border-gray-300 v-center-cairo justify-start">
                                  {isRTL ? `ضغط الإطارات (PSI) — ${is6Tyre ? '6 إطارات' : '4 إطارات'}` : `Tyre Pressure (PSI) — ${is6Tyre ? '6 Tyres' : '4 Tyres'}`}
                                </h3>
                                <div className={`grid ${tyreItems.length % 4 === 0 ? 'grid-cols-4' : 'grid-cols-3'} gap-3`}>
                                  {tyreItems.map((tyre, idx) => (
                                    <div key={idx} className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-300 shadow-xs">
                                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">{tyre.label}</span>
                                      <span className="text-lg font-black text-primary-900 font-mono">{tyre.value || '-'}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Additional Notes */}
                          {hasAdditionalNotes && (
                            <div className="border border-gray-300 rounded-xl p-4 bg-gray-50/50 shadow-sm mt-4">
                              <h3 className="text-[12px] font-black text-primary-900 uppercase tracking-widest mb-3 pb-1.5 border-b border-gray-300 v-center-cairo justify-start">
                                {isRTL ? 'ملاحظات إضافية' : 'Additional Notes'}
                              </h3>
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <p className={`text-[12px] font-bold text-gray-700 leading-relaxed whitespace-pre-wrap break-words ${isRTL ? 'text-right' : 'text-left'}`}>
                                  {data.additionalNotes}
                                </p>
                              </div>
                            </div>
                          )}

                        </div>

                        {placeSigOnTextNotesPage && renderSummaryAndSignatures()}

                        <ReportPageFooter />
                      </div>
                    </div>
                  </ScaledPreview>
                );
              })()}
            </>
          )}

          {/* Page 3: Driver Readiness Checklist */}
          {(data.mode === 'full' || data.mode === 'driver_only') && (
            <ScaledPreview>
              <div className="ui-preview-card h-fit">
                <div className="a4-preview-wrapper font-cairo flex flex-col report-light" dir={isRTL ? 'rtl' : 'ltr'} lang={isRTL ? 'ar' : 'en'}>
                  <CompactReportHeader titleSuffix={isRTL ? "جاهزية السائق" : "Driver Readiness"} lang={lang} />
                  <CompactInfoGrid data={data} t={t} lang={lang} />
                  <div className="space-y-4 mt-4 mb-4">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b pb-1">{isRTL ? "بنود الجاهزية" : "Readiness Items"}</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {READINESS_QUESTIONS.map(q => {
                          const answer = data.readiness.answers[q.id];
                          return (
                            <div key={q.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-300 shadow-xs h-[52px]">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="p-2 rounded-lg bg-white text-primary-600 shadow-sm border border-gray-300 flex-shrink-0">
                                  {(() => { const Icon = q.icon as React.ElementType; return <Icon size={22} />; })()}
                                </div>
                                <span className="text-[12px] font-black text-gray-700 v-center-cairo justify-start leading-tight">{t[q.key as keyof typeof t]}</span>
                              </div>
                              <div className={`px-5 rounded-lg text-[10px] font-black h-[26px] min-w-[60px] v-center-cairo shadow-sm flex-shrink-0 ms-2 ${answer === true ? 'bg-green-600 text-white' : answer === false ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                <span>{answer === true ? (isRTL ? "نعم" : "Yes") : answer === false ? (isRTL ? "لا" : "No") : '-'}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                  </div>
                  
                  {/* Final Readiness Status indicator */}
                  <div className="mt-2 mb-2 flex-shrink-0">
                     <div className={`flex items-center justify-center gap-3 p-3 rounded-xl border shadow-sm ${data.readiness.status === 'ready' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                       {data.readiness.status === 'ready' ? <ShieldCheck size={24} className="text-green-600" /> : <ShieldAlert size={24} className="text-red-600" />}
                       <span className={`text-[16px] font-black v-center-cairo ${data.readiness.status === 'ready' ? 'text-green-900' : 'text-red-900'}`}>
                         {t.final_result_label}: {data.readiness.status === 'ready' ? t.ready_for_trip : t.not_ready_label}
                       </span>
                     </div>
                  </div>

                  {(data.mode === 'full' || data.mode === 'driver_only') && renderSignatures()}

                  <ReportPageFooter />
                </div>
              </div>
            </ScaledPreview>
          )}
       </div>

       {/* Actions Control Buttons Grid */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 pb-20 no-print max-w-[1000px] mx-auto">
          {/* Share Report */}
          <button 
            onClick={() => handleDownloadPDF(true)} 
            disabled={isSharing || isGeneratingPDF} 
            className="py-5 rounded-2xl font-black text-lg shadow-lg bg-primary-600 text-white hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-gray-400"
          >
            {isSharing ? <Loader2 size={24} className="animate-spin" /> : <Share2 size={24} />}
            <span className="v-center-cairo">{t.share_report}</span>
          </button>
          
          {/* Download PDF */}
          <button 
            onClick={() => handleDownloadPDF(false)} 
            disabled={isGeneratingPDF || isSharing} 
            className="py-5 rounded-2xl font-black text-lg shadow-lg bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-gray-400"
          >
            {isGeneratingPDF ? <Loader2 size={24} className="animate-spin" /> : <FileIcon size={24} />}
            <span className="v-center-cairo">{isRTL ? 'تنزيل بصيغة PDF' : 'Download PDF'}</span>
          </button>

          {/* Edit Inspection */}
          <button
            type="button"
            onClick={() => {
              if (data.mode === 'full' || data.mode === 'vehicle_only') setStep(4);
              else if (data.mode === 'driver_only') setStep(3);
              else setStep(2);
            }}
            className="py-5 rounded-2xl font-black text-lg shadow-lg bg-amber-500 text-white hover:bg-amber-600 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Edit3 size={24} />
            <span className="v-center-cairo">{isRTL ? 'تعديل الفحص' : 'Edit Inspection'}</span>
          </button>

          {/* Start New Inspection (Spans full width) */}
          <button
            onClick={onExit}
            className="md:col-span-3 py-5 rounded-2xl font-black text-lg shadow-lg bg-gray-800 text-white hover:bg-gray-900 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <RotateCcw size={24} />
            <span className="v-center-cairo">{t.new_inspection}</span>
          </button>
       </div>
    </div>
  );
};
