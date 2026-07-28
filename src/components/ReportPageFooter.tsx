import React from 'react';
import { TRANSLATIONS } from '../constants/translations';

/**
 * ReportPageFooter displays text at the bottom of printed report pages.
 */
export const ReportPageFooter: React.FC<{isRTL?: boolean, lang?: string, pageNumber?: number, showText?: boolean}> = ({ isRTL = true, lang, showText = false }) => {
  const currentLang = (lang as 'ar' | 'en') || (isRTL ? 'ar' : 'en');
  const footerText = TRANSLATIONS[currentLang]?.report_footer_text || TRANSLATIONS.ar.report_footer_text;

  return (
    <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none opacity-50">
      {showText && (
        <p className="text-[10px] font-bold text-gray-400">
          {footerText}
        </p>
      )}
    </div>
  );
};
