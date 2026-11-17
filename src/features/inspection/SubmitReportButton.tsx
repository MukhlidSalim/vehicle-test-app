// src/features/inspection/SubmitReportButton.tsx
// Self-contained "Submit Report" button for the inspection summary step.
// It generates the PDF with the existing generatePdfReport() and sends it with submitReport().
// It renders nothing unless the VITE_SUBMIT_* variables are configured (TEST site only).

import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { UploadCloud, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { generatePdfReport } from '../../utils/pdfGenerator';
import { submitReport } from '../../utils/reportSubmitter';
import { isSubmitEnabled } from '../../config/submitConfig';
import { InspectionData, Language } from '../../types';

interface Props {
  data: InspectionData;
  lang: Language;
  isRTL: boolean;
  /** Returns the PDF base file name (without .pdf). Pass getCustomFilename from ReportSummaryStep. */
  getBaseFilename: () => string;
}

export const SubmitReportButton: React.FC<Props> = ({ data, lang, isRTL, getBaseFilename }) => {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [phase, setPhase] = useState('');
  const [percent, setPercent] = useState(0);
  const [message, setMessage] = useState<{ type: 'ok' | 'fail'; text: string } | null>(null);
  const lockRef = useRef(false); // prevents double taps

  if (!isSubmitEnabled()) return null;

  const t = (ar: string, en: string) => (isRTL ? ar : en);

  const computeResult = (): string => {
    const list = data.checklist || [];
    const fail = list.filter((i) => i.status === 'fail').length;
    const warning = list.filter((i) => i.status === 'warning').length;
    if ((data.mode === 'full' || data.mode === 'driver_only') && data.readiness.status === 'not_ready') return 'Not Ready';
    if (data.mode === 'driver_only') return 'Ready';
    if (fail > 0) return 'Fail';
    if (warning > 0) return 'Warning';
    return 'Pass';
  };

  const handleSubmit = async () => {
    if (lockRef.current || done) return;

    const nodes = document.querySelectorAll('.a4-preview-wrapper');
    if (!nodes || nodes.length === 0) {
      setMessage({ type: 'fail', text: t('لا توجد صفحات تقرير للإرسال.', 'No report pages to submit.') });
      return;
    }

    lockRef.current = true;
    setBusy(true);
    setMessage(null);
    setPercent(0);
    setPhase(t('جاري إنشاء التقرير...', 'Generating report...'));

    const out: { file: File | null } = { file: null };

    try {
      await generatePdfReport({
        nodes,
        baseFilename: getBaseFilename(),
        isRTL,
        lang,
        shouldShare: true, // returns a File object instead of downloading
        onProgress: (p) => {
          setPercent(p.percent);
          if (p.phase) setPhase(p.phase);
        },
        onAttempt: () => {},
        onSuccess: (file) => { out.file = file; },
        onDownloadDirect: () => {},
        onError: () => {},
      });

      if (!out.file) {
        setMessage({ type: 'fail', text: t('تعذّر إنشاء التقرير. حاول مرة أخرى.', 'Could not generate the report. Please try again.') });
        return;
      }

      setPercent(100);
      setPhase(t('جاري إرسال التقرير...', 'Submitting report...'));

      const res = await submitReport(
        out.file,
        {
          reportType: data.mode,
          plate: data.driverInfo.plateNumber,
          personName: data.driverInfo.name,
          vehicleType: data.driverInfo.vehicleType,
          result: computeResult(),
        },
        isRTL
      );

      if (res.ok) {
        setDone(true);
        setMessage({ type: 'ok', text: res.message });
      } else {
        setMessage({
          type: 'fail',
          text: `${res.message} ${t('يمكنك مشاركة التقرير يدوياً عبر زر المشاركة.', 'You can still share the report manually using the Share button.')}`,
        });
      }
    } catch (e) {
      console.error('Submit report failed', e);
      setMessage({ type: 'fail', text: t('حدث خطأ غير متوقع أثناء الإرسال.', 'Unexpected error while submitting.') });
    } finally {
      setBusy(false);
      lockRef.current = false;
    }
  };

  return (
    <div className="md:col-span-3 space-y-3 no-print">
      <button
        type="button"
        onClick={handleSubmit}
        disabled={busy || done}
        className={`w-full py-5 rounded-2xl font-bold text-lg shadow-lg text-white active:scale-95 transition-all flex items-center justify-center gap-3 ${
          done ? 'bg-green-700' : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400'
        }`}
      >
        {busy ? <Loader2 size={24} className="animate-spin" /> : done ? <CheckCircle size={24} /> : <UploadCloud size={24} />}
        <span className="v-center-cairo">
          {done ? t('تم إرسال التقرير', 'Report Submitted') : t('إرسال التقرير', 'Submit Report')}
        </span>
      </button>

      {message && (
        <div
          role="status"
          className={`p-4 rounded-2xl border font-bold text-sm flex items-start gap-3 ${
            message.type === 'ok'
              ? 'bg-green-50 text-green-800 border-green-300'
              : 'bg-red-50 text-red-800 border-red-300'
          }`}
        >
          {message.type === 'ok' ? <CheckCircle size={20} className="shrink-0 mt-0.5" /> : <AlertTriangle size={20} className="shrink-0 mt-0.5" />}
          <span className="leading-relaxed">{message.text}</span>
        </div>
      )}

      {busy && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[260] flex items-center justify-center bg-white/85 backdrop-blur-sm no-print">
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            <Loader2 size={56} className="animate-spin text-emerald-600" />
            <div className="font-black text-primary-900 text-sm uppercase tracking-widest">
              {t('إرسال التقرير', 'Submitting Report')}
            </div>
            <div className="text-[12px] font-bold text-gray-600">{phase}</div>
            <div className="text-2xl font-black text-primary-900 font-mono">{Math.round(percent)}%</div>
            <div className="text-[11px] font-bold text-gray-500">
              {t('لا تغلق الصفحة حتى يكتمل الإرسال.', 'Please keep this page open until submission finishes.')}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
