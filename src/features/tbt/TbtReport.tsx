// @ts-nocheck
import React, { useRef, useState } from 'react';
import { Download, Share2, Edit2, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { captureNode, generateSmartPdf } from '../../utils/pdfGenerator';
import { ScaledPreview } from '../../components/ScaledPreview';
import { ReportPageFooter } from '../../components/ReportPageFooter';
import { TbtData } from './TbtForm';
import { TBT_TOPICS } from './tbtConfig';

interface Props {
  data: TbtData;
  isRTL: boolean;
  onEdit: () => void;
}

export const TbtReport: React.FC<Props> = ({ data, isRTL, onEdit }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [toastMsg, setToastMsg] = useState<{message: string, type: 'fail' | 'warning'} | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [readyFile, setReadyFile] = useState<File | null>(null);
  
  const selectedTopic = TBT_TOPICS.find(t => t.id === data.selectedTopicId);
  const topicTitle = isRTL ? selectedTopic?.categoryAr : selectedTopic?.categoryEn;
  const topicPoints = isRTL ? selectedTopic?.pointsAr : selectedTopic?.pointsEn;

  const t = (ar: string, en: string) => isRTL ? ar : en;

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPDF(true);
    const dateStr = data.date;
    const cleanFrom = (data.routeFrom || '').trim().replace(/[/\\?%*:|"<>]/g, '-');
    const cleanTo = (data.routeTo || '').trim().replace(/[/\\?%*:|"<>]/g, '-');
    const routeStr = cleanFrom && cleanTo ? `${cleanFrom}-${cleanTo}` : (cleanFrom || cleanTo || 'Unknown Route');
    const baseFilename = `[TBT] [${dateStr}] [${routeStr}]`;

    await generateSmartPdf({
      containerRef: reportRef,
      baseFilename,
      isRTL,
      lang: isRTL ? 'ar' : 'en',
      shouldShare: false,
      onSuccess: () => setIsGeneratingPDF(false),
      onDownloadDirect: (pdf, filename) => {
        pdf.save(filename);
        setIsGeneratingPDF(false);
      },
      onError: () => setIsGeneratingPDF(false),
    });
  };


  const showToast = (message: string, type: 'fail' | 'warning' = 'fail') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 4000);
  };
  const handleShare = async () => {
    if (!reportRef.current) return;
    setIsSharing(true);
    const dateStr = data.date;
    const cleanFrom = (data.routeFrom || '').trim().replace(/[/\\?%*:|"<>]/g, '-');
    const cleanTo = (data.routeTo || '').trim().replace(/[/\\?%*:|"<>]/g, '-');
    const routeStr = cleanFrom && cleanTo ? `${cleanFrom}-${cleanTo}` : (cleanFrom || cleanTo || 'Unknown Route');
    const baseFilename = `[TBT] [${dateStr}] [${routeStr}]`;

    await generateSmartPdf({
      containerRef: reportRef,
      baseFilename,
      isRTL,
      lang: isRTL ? 'ar' : 'en',
      shouldShare: true,
        onSuccess: (file) => {
          setReadyFile(file);
          setIsSharing(false);
        },
      onDownloadDirect: () => setIsSharing(false),
      onError: () => setIsSharing(false),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>


      {/* A4 Report Container */}
      <div className="flex justify-center w-full pb-4">
        <ScaledPreview>
          <div 
            ref={reportRef as any}
            className="bg-white mx-auto shadow-2xl relative"
            style={{ 
              width: '794px', 
              minHeight: '1123px', 
              padding: '20px 40px', // Adjusted padding from mm to px (roughly 20mm -> ~75px, but 20px 40px is safer for visuals)
              color: '#000',
              fontFamily: isRTL ? 'Cairo, sans-serif' : 'Arial, sans-serif'
            }}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
          {/* Header */}
          <div className="flex justify-between items-end border-b-4 border-indigo-900 pb-4 mb-5">
            <div>
              <h1 className="text-2xl font-black text-indigo-900 uppercase tracking-widest">{t('استمارة TBT', 'Toolbox Talk Form')}</h1>
              <p className="text-gray-500 font-bold mt-2 text-sm">{t('إجتماع السلامة قبل الرحلة', 'Pre-Journey Safety Meeting')}</p>
            </div>
            <div className="text-end text-xs font-bold text-gray-500 uppercase space-y-1">
              <p>{t('التاريخ:', 'Date:')} <span className="text-black ml-2 text-sm">{data.date}</span></p>
              <p>{t('الوقت:', 'Time:')} <span className="text-black ml-2 text-sm">{data.time}</span></p>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* General Info Table */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="grid grid-cols-4 bg-gray-100 font-bold text-xs uppercase tracking-wider">
                <div className="col-span-1 p-3 border-b border-gray-300">{t('مسؤول الرحلة', 'Journey Manager')}</div>
                <div className="col-span-1 p-3 border-b border-l rtl:border-l-0 rtl:border-r border-gray-300">{t('مسار الرحلة', 'Journey Route')}</div>
                <div className="col-span-2 p-3 border-b border-l rtl:border-l-0 rtl:border-r border-gray-300">{t('نوع الاجتماع', 'Meeting Type')}</div>
              </div>
              <div className="grid grid-cols-4 font-bold text-sm bg-white">
                <div className="col-span-1 p-3">{data.managerName}</div>
                <div className="col-span-1 p-3 border-l rtl:border-l-0 rtl:border-r border-gray-300">
                  {data.routeFrom} <ArrowRight size={14} className="inline mx-1 rtl:rotate-180 text-gray-400" /> {data.routeTo}
                </div>
                <div className="col-span-2 p-3 border-l rtl:border-l-0 rtl:border-r border-gray-300 flex items-center gap-2 text-indigo-700">
                  <CheckCircle2 size={16} />
                  {data.type === 'face_to_face' ? t('حضوري', 'In-Person') : t('عن بُعد (عبر الهاتف)', 'Remote (via Phone)')}
                </div>
              </div>
            </div>

            {/* Selected Topic Details */}
            <div>
              <h2 className="text-lg font-black text-indigo-900 border-b-2 border-indigo-100 pb-2 mb-4">
                {t('الموضوع', 'Topic')}
              </h2>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <h3 className="text-base font-black text-indigo-800 mb-3">{topicTitle}</h3>
                {data.selectedTopicId === 'other' ? (
                  <div className="text-sm font-bold text-gray-700 whitespace-pre-wrap leading-relaxed mt-2 p-4 bg-white rounded-lg border border-indigo-100">
                    {data.otherTopicDetails}
                  </div>
                ) : (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                    {topicPoints?.map((point: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm font-bold text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                        {point.title || point}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            {data.notes && (
              <div>
                <h2 className="text-lg font-black text-gray-900 border-b-2 border-gray-100 pb-2 mb-4">
                  {t('ملاحظات إضافية', 'Additional Notes')}
                </h2>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {data.notes}
                </div>
              </div>
            )}

            {/* Drivers & Signatures Table */}
            <div>
              <h2 className="text-lg font-black text-gray-900 border-b-2 border-gray-100 pb-2 mb-4 flex items-center justify-between">
                <span>{t('السائقون واعتماد الحضور', 'Drivers & Attendance')}</span>
              </h2>
              
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full text-start text-sm">
                  <thead className="bg-gray-100 text-xs uppercase tracking-wider text-gray-700">
                    <tr>
                      <th className="p-3 border-b border-gray-300 font-bold w-12 text-center">#</th>
                      <th className="p-3 border-b border-l rtl:border-l-0 rtl:border-r border-gray-300 font-bold">{t('اسم السائق', 'Driver Name')}</th>
                      <th className="p-3 border-b border-l rtl:border-l-0 rtl:border-r border-gray-300 font-bold w-1/2">{t('التوقيع', 'Signature')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 font-bold text-gray-800">
                    {data.drivers.map((driver, idx) => (
                      <tr key={driver.id}>
                        <td className="py-2 px-3 text-center text-gray-500">{idx + 1}</td>
                        <td className="py-2 px-3 border-l rtl:border-l-0 rtl:border-r border-gray-200">{driver.name}</td>
                        <td className="py-1 px-3 border-l rtl:border-l-0 rtl:border-r border-gray-200 h-14 relative align-middle text-center">
                          {data.type === 'face_to_face' ? (
                            driver.signature ? (
                              <img src={driver.signature} alt="Driver Signature" className="max-h-12 max-w-full mx-auto object-contain" />
                            ) : (
                              <span className="text-gray-300 text-xs uppercase">{t('لا يوجد توقيع', 'No Signature')}</span>
                            )
                          ) : (
                            <span className="text-gray-400 text-xs italic bg-gray-50 px-3 py-1 rounded">
                              {t('اجتماع عن بُعد', 'Remote Meeting')}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
            </div>

            {/* Journey Manager Signature */}
            <div className="pt-4 border-t-2 border-gray-200 border-dashed mt-6 flex justify-between items-end">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                  {t('اعتماد مسؤول الرحلة', 'Journey Manager Approval')}
                </p>
                <div className="font-black text-lg text-gray-900">{data.managerName}</div>

              </div>
              <div className="w-48 h-16 border-b-2 border-gray-300 flex items-center justify-center">
                {data.managerSignature && (
                  <img src={data.managerSignature} alt="JM Signature" className="max-h-14 max-w-full object-contain" />
                )}
              </div>
            </div>
            <ReportPageFooter pageNumber={1} totalPages={1} isRTL={isRTL} lang={isRTL ? 'ar' : 'en'} />
          </div>
          

          </div>
        </ScaledPreview>
      </div>

      {/* Bottom Action Bar (Hidden in PDF) */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        <button type="button"
          onClick={onEdit}
          disabled={isGeneratingPDF || isSharing}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          <Edit2 size={18} />
          {t('تعديل البيانات', 'Edit Data')}
        </button>
        <div className="flex gap-3 w-full sm:w-auto">
          {navigator.share && (
            <button type="button"
              onClick={handleShare}
              disabled={isGeneratingPDF || isSharing}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {isSharing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
              {t('مشاركة', 'Share')}
            </button>
          )}
          <button type="button"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF || isSharing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all  disabled:opacity-50 "
          >
            {isGeneratingPDF ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {t('تحميل PDF', 'Download PDF')}
          </button>
        </div>
      </div>
      {/* Share Success Modal */}
      {readyFile && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md no-print animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center space-y-6 shadow-2xl animate-scale-in">
            <div className="mx-auto w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center shadow-inner">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-900">{isRTL ? 'التقرير جاهز الآن' : 'Report is Ready'}</h3>
              <p className="text-sm font-bold text-gray-500 leading-relaxed">
                {isRTL ? 'تم إنشاء التقرير بنجاح. اضغط على الزر أدناه لمشاركته فوراً بدون أي تأخير.' : 'Report generated successfully. Click the button below to share it instantly.'}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                type="button"
                onClick={async () => {
                  if (navigator.canShare && navigator.canShare({ files: [readyFile] })) {
                    try {
                      await navigator.share({ files: [readyFile], title: isRTL ? 'تقرير' : 'Report' });
                    } catch (e) {
                      console.log("Share cancelled or failed", e);
                    }
                  } else {
                    showToast(isRTL ? "متصفحك لا يدعم المشاركة المباشرة. تم فتح التقرير." : "Direct sharing unsupported. Opening report.", 'warning');
                    const url = URL.createObjectURL(readyFile);
                    window.open(url, '_blank');
                  }
                  setReadyFile(null);
                }}
                className="w-full py-4 rounded-xl bg-primary-600 text-white font-black text-lg shadow-xl shadow-primary-200 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                <span>{isRTL ? 'مشاركة الآن' : 'Share Now'}</span>
              </button>
              <button 
                type="button"
                onClick={() => setReadyFile(null)}
                className="w-full py-3 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    
              {/* Toast Notification */}
              {toastMsg && typeof document !== 'undefined' && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] w-11/12 max-w-md pointer-events-none no-print animate-fade-in-down" dir={isRTL ? 'rtl' : 'ltr'}>
                  <div className={`p-4 rounded-2xl border shadow-2xl font-black text-sm flex items-center gap-3 ${
                    toastMsg.type === 'fail'
                      ? 'bg-red-50 text-red-800 border-red-300 shadow-red-200'
                      : 'bg-amber-50 text-amber-900 border-amber-300 shadow-amber-200'
                  }`}>
                    <span className="v-center-cairo leading-tight">{toastMsg.message}</span>
                  </div>
                </div>
              )}
        </div>
  );
};
