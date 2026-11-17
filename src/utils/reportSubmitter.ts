// src/utils/reportSubmitter.ts
// Sends a generated PDF + basic metadata to the Power Automate flow (HTTP trigger).
// The flow saves the PDF in SharePoint, adds a row to "VIS Report Register" and sends an email.

import { SUBMIT_CONFIG, isSubmitEnabled } from '../config/submitConfig';

export type ReportType = 'full' | 'vehicle_only' | 'driver_only' | 'maintenance';

export interface ReportMeta {
  reportType: ReportType;
  plate: string;          // e.g. "2154 TA"
  personName: string;     // driver (full / driver_only) or inspector (vehicle_only / maintenance)
  vehicleType?: string;
  result?: string;        // Pass | Warning | Fail | Ready | Not Ready
  reportDate?: string;    // YYYY-MM-DD (defaults to today, local time)
}

export interface SubmitResult {
  ok: boolean;
  submissionId: string;
  message: string;
}

const newId = (): string =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? (crypto as any).randomUUID()
    : `sub_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const todayISO = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result); // strip "data:...;base64,"
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

// SharePoint-safe file name (removes " * : < > ? / \ | # %)
const safeName = (name: string): string =>
  name.replace(/["*:<>?/\\|#%]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 150);

export async function submitReport(file: File, meta: ReportMeta, isRTL: boolean): Promise<SubmitResult> {
  const submissionId = newId();
  const t = (ar: string, en: string) => (isRTL ? ar : en);

  if (!isSubmitEnabled()) {
    return { ok: false, submissionId, message: t('خدمة الإرسال غير مفعّلة.', 'Submission service is not configured.') };
  }
  if (file.size > SUBMIT_CONFIG.maxBytes) {
    return { ok: false, submissionId, message: t('حجم التقرير كبير جداً للإرسال.', 'Report file is too large to submit.') };
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { ok: false, submissionId, message: t('لا يوجد اتصال بالإنترنت.', 'No internet connection.') };
  }

  let fileBase64 = '';
  try {
    fileBase64 = await blobToBase64(file);
  } catch {
    return { ok: false, submissionId, message: t('تعذّر تجهيز ملف التقرير للإرسال.', 'Could not prepare the report file.') };
  }

  const baseName = file.name && file.name.toLowerCase().endsWith('.pdf') ? file.name : `${file.name || 'report'}.pdf`;
  const payload = {
    key: SUBMIT_CONFIG.key,
    environment: SUBMIT_CONFIG.environment,
    submissionId,
    reportType: meta.reportType,
    plate: (meta.plate || '').trim().toUpperCase(),
    personName: (meta.personName || '').trim(),
    vehicleType: meta.vehicleType || '',
    result: meta.result || '',
    reportDate: meta.reportDate || todayISO(),
    submittedAt: new Date().toISOString(),
    fileName: safeName(baseName),
    contentType: 'application/pdf',
    fileBase64,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUBMIT_CONFIG.timeoutMs);

  try {
    // "text/plain" is a CORS "simple request": the browser sends it without a preflight (OPTIONS) request.
    const res = await fetch(SUBMIT_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    let body: any = null;
    try { body = await res.json(); } catch { /* non-JSON response */ }

    if (res.ok && body && body.status === 'saved') {
      return { ok: true, submissionId, message: t('تم إرسال التقرير وحفظه بنجاح.', 'Report submitted and saved successfully.') };
    }
    if (res.status === 401 || res.status === 403 || (body && body.status === 'rejected')) {
      return { ok: false, submissionId, message: t('رُفض الإرسال (مفتاح غير صالح).', 'Submission rejected (invalid key).') };
    }
    return { ok: false, submissionId, message: t(`فشل الإرسال (رمز ${res.status}).`, `Submission failed (code ${res.status}).`) };
  } catch (err: any) {
    const aborted = err && err.name === 'AbortError';
    return {
      ok: false,
      submissionId,
      message: aborted
        ? t('انتهت مهلة الإرسال، حاول مرة أخرى.', 'Submission timed out, please try again.')
        : t('تعذّر الاتصال بخدمة الإرسال.', 'Could not reach the submission service.'),
    };
  } finally {
    clearTimeout(timer);
  }
}
