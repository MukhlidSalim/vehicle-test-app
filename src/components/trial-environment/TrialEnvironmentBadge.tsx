import React, { useState } from 'react';
import { AlertTriangle, ExternalLink, X } from 'lucide-react';
import { TRIAL_ENVIRONMENT } from './trialEnvironment.config';

/**
 * Persistent badge that sits inside the TopBar.
 * Always visible while TRIAL_ENVIRONMENT.enabled is true.
 * Clicking it opens a small tooltip/popover with a link
 * to the official production URL.
 */
export const TrialEnvironmentBadge: React.FC = () => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  if (!TRIAL_ENVIRONMENT.enabled) return null;

  const goToOriginal = () => {
    window.location.href = TRIAL_ENVIRONMENT.originalUrl;
  };

  return (
    <div className="relative">
      {/* Badge pill */}
      <button
        type="button"
        onClick={() => setPopoverOpen(!popoverOpen)}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-[11px] font-bold hover:bg-amber-100 transition-colors cursor-pointer select-none"
        title="نسخة تجريبية — Trial Version"
      >
        <AlertTriangle size={12} className="flex-shrink-0" />
        <span className="whitespace-nowrap">نسخة تجريبية</span>
      </button>

      {/* Popover */}
      {popoverOpen && (
        <>
          {/* Invisible backdrop to close popover */}
          <div
            className="fixed inset-0 z-[199]"
            onClick={() => setPopoverOpen(false)}
          />

          {/* Popover card */}
          <div
            className="absolute top-full mt-2 z-[200] w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
            style={{ left: '50%', transform: 'translateX(-50%)' }}
            dir="rtl"
          >
            <div className="h-1 bg-gradient-to-l from-amber-400 via-orange-500 to-red-500" />
            <div className="p-4">
              {/* Close */}
              <button
                type="button"
                onClick={() => setPopoverOpen(false)}
                className="absolute top-3 left-3 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={14} />
              </button>

              <p className="text-sm font-bold text-gray-800 mb-1">نسخة تجريبية</p>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                هذه نسخة تطوير واختبار. يرجى استخدام النسخة الأصلية الرسمية.
              </p>

              <button
                type="button"
                onClick={goToOriginal}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all"
              >
                <ExternalLink size={14} />
                <span>الانتقال إلى النسخة الأصلية</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
