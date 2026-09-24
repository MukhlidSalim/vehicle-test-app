import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { TRIAL_ENVIRONMENT } from './trialEnvironment.config';

/**
 * Full-screen modal notice.
 * Informs the user that this is a trial/dev copy and FORCES them 
 * to the official production URL. It cannot be bypassed.
 */
export const TrialEnvironmentNotice: React.FC = () => {
  if (!TRIAL_ENVIRONMENT.enabled) return null;

  const goToOriginal = () => {
    window.location.href = TRIAL_ENVIRONMENT.originalUrl;
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      dir="rtl"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Orange top accent */}
        <div className="h-1.5 bg-gradient-to-l from-amber-400 via-orange-500 to-red-500" />

        <div className="p-6 pt-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mb-5">
            <AlertTriangle size={32} className="text-amber-500" />
          </div>

          {/* Arabic heading */}
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            هذه نسخة تجريبية من نظام VIS
          </h2>

          {/* Arabic body */}
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            هذه النسخة مخصصة <span className="font-bold text-gray-900">للتطوير والاختبار فقط</span> وليست مخصصة للاستخدام الفعلي.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            يرجى الانتقال إلى <span className="font-bold text-gray-900">النسخة الأصلية المعتمدة من نظام VIS</span> لمتابعة عملك.
          </p>

          {/* Warning tag */}
          <div className="inline-block bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 mb-6">
            <span className="text-xs font-bold text-red-600">
              سيتم إيقاف هذه النسخة قريبًا.
            </span>
          </div>

          {/* CTA button */}
          <button
            type="button"
            onClick={goToOriginal}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-primary-600 text-white font-bold text-lg shadow-xl hover:bg-primary-700 active:scale-[0.97] transition-all"
          >
            <ExternalLink size={20} />
            <span>الانتقال إلى النسخة الرسمية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
