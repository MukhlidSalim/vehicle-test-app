import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { InspectionData, InspectionMode } from '../../types';
import { READINESS_QUESTIONS } from '../../constants';
import { BasicInfoStep } from './BasicInfoStep';
import { DriverReadinessStep } from './DriverReadinessStep';
import { ChecklistStep } from './ChecklistStep';
import { ReportSummaryStep } from './ReportSummaryStep';
import { SignaturePad } from '../../components/SignaturePad';
import { validateBasicInfo, validateChecklist, validateDriverReadiness } from '../../utils/validation';

interface InspectionProcessProps {
  t: any;
  lang: any;
  isRTL: boolean;
  step: number;
  setStep: (step: number) => void;
  data: InspectionData;
  setData: React.Dispatch<React.SetStateAction<InspectionData>>;
  onExit: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

/**
 * InspectionProcess manages the step flow wizard, progression bar, input validation alerts,
 * and renders the active step views.
 */
export const InspectionProcess: React.FC<InspectionProcessProps> = ({
  t,
  lang,
  isRTL,
  step,
  setStep,
  data,
  setData,
  onExit,
  saveStatus,
}) => {
  const [attemptedStep2, setAttemptedStep2] = useState<boolean>(false);
  const [attemptedStep3, setAttemptedStep3] = useState<boolean>(false);
  const [attemptedStep4, setAttemptedStep4] = useState<boolean>(false);
  const [attemptedSignature, setAttemptedSignature] = useState<boolean>(false);
  const [showOdoWarning, setShowOdoWarning] = useState<boolean>(false);

  const handleConfirmOdo = () => {
    setShowOdoWarning(false);
    if (currentStepIndex === totalSteps - 2) {
      const sigRequired = data.mode === 'maintenance' ? data.signatures?.inspector : data.signatures?.driver;
      if (!sigRequired) {
        setAttemptedSignature(true);
        showUiAlert(isRTL ? "التوقيع إلزامي قبل عرض التقرير النهائي." : "Signature is mandatory before viewing the summary.", 'warning');
        scrollToFirstErrorInDOM();
        return;
      }
    }
    setStep(currentModeSteps[currentStepIndex + 1]);
  };

  const [uiAlert, setUiAlert] = useState<{ show: boolean; message: string; type: 'warning' | 'fail' | 'info' }>({
    show: false,
    message: '',
    type: 'info',
  });

  const showUiAlert = (message: string, type: 'warning' | 'fail' | 'info' = 'warning') => {
    setUiAlert({ show: true, message, type });
    window.setTimeout(() => setUiAlert((p) => (p.show ? { ...p, show: false } : p)), 4500);
  };

  const scrollToFirstErrorInDOM = () => {
    window.setTimeout(() => {
      // Find all error elements and trigger shake animation
      const errorElements = document.querySelectorAll('[data-error="true"]');
      errorElements.forEach((el) => {
        el.classList.remove('animate-shake');
        // Force reflow to restart animation
        void (el as HTMLElement).offsetWidth;
        el.classList.add('animate-shake');
      });

      const first = errorElements[0] as HTMLElement | null;
      if (!first) return;
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const focusable = first.querySelector('input, textarea, select, button') as HTMLElement | null;
      if (focusable && typeof (focusable as any).focus === 'function') {
        try { (focusable as any).focus({ preventScroll: true }); } catch {}
      }
    }, 120);
  };

  // Step definition arrays per mode
  const modeStepsMap: Record<InspectionMode, number[]> = { 
    vehicle_only: [2, 4, 5], 
    driver_only: [2, 3, 5], 
    full: [2, 4, 3, 5], // Vehicle checklist first, then Driver readiness
    maintenance: [2, 4, 5] // Skip driver readiness for maintenance
  };

  const currentModeSteps = modeStepsMap[data.mode as InspectionMode] || [];
  const currentStepIndex = currentModeSteps.indexOf(step);
  const totalSteps = currentModeSteps.length;
  const progressPercent = currentStepIndex === -1 ? 0 : ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
       {/* Validation Alerts (Fixed Toast via Portal) */}
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

       {/* Progress Tracker Bar */}
       <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-400 space-y-3 no-print">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-black text-primary-900 uppercase tracking-widest opacity-60">
              {isRTL ? `المرحلة ${currentStepIndex + 1} من ${totalSteps}` : `Step ${currentStepIndex + 1} of ${totalSteps}`}
            </span>
            <span className="text-xs font-black text-primary-600 font-mono">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-primary-600 h-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <div className="flex justify-end pt-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ml-1.5 ${saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`}></div>
            {saveStatus === 'saving' ? t.saving : t.auto_saved}
          </div>
       </div>

       {/* Step Rendering */}
       {step === 2 && (
         <BasicInfoStep 
           t={t} 
           isRTL={isRTL} 
           data={data} 
           setData={setData} 
           attemptedStep2={attemptedStep2} 
         />
       )}
       {step === 3 && (
         <DriverReadinessStep 
           t={t} 
           isRTL={isRTL} 
           data={data} 
           setData={setData} 
           attemptedStep3={attemptedStep3} 
         />
       )}
       {step === 4 && (
         <ChecklistStep 
           t={t} 
           lang={lang} 
           isRTL={isRTL} 
           data={data} 
           setData={setData} 
           attemptedStep4={attemptedStep4} 
         />
       )}
       {step === 5 && (
         <ReportSummaryStep 
           t={t} 
           lang={lang} 
           isRTL={isRTL} 
           data={data} 
           setStep={setStep} 
           onExit={onExit} 
         />
       )}

       {/* Bottom Pagination Controls (Hidden on summary preview step 5) */}
       {step < 5 && (
          <div className="space-y-6 pb-10 no-print">
            {/* Signature Section (Always shown at the end of the last active step) */}
            {currentStepIndex === totalSteps - 2 && (
              <div className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm space-y-5 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                  </div>
                  <h3 className="text-sm font-black text-gray-800">
                    {isRTL ? 'التواقيع' : 'Signatures'}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SignaturePad
                    label={
                      data.mode === 'maintenance' 
                        ? (isRTL ? 'توقيع الفاحص' : 'Inspector Signature') 
                        : (isRTL ? 'توقيع السائق' : 'Driver Signature')
                    }
                    isRTL={isRTL}
                    initialSignature={data.mode === 'maintenance' ? data.signatures?.inspector : data.signatures?.driver}
                    error={attemptedSignature && !(data.mode === 'maintenance' ? data.signatures?.inspector : data.signatures?.driver)}
                    onSave={(base64) => {
                      setAttemptedSignature(false);
                      setData(p => ({
                        ...p,
                        signatures: { 
                          ...p.signatures, 
                          [data.mode === 'maintenance' ? 'inspector' : 'driver']: base64 
                        }
                      }));
                    }}
                    onClear={() => setData(p => ({
                      ...p,
                      signatures: { 
                        ...p.signatures, 
                        [data.mode === 'maintenance' ? 'inspector' : 'driver']: undefined 
                      }
                    }))}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4 border-t border-gray-300 pt-8">
             <button 
               type="button"
               onClick={() => { 
                 if (currentStepIndex === 0) onExit(); 
                 else setStep(currentModeSteps[currentStepIndex - 1]);
               }} 
               className="px-8 py-4 rounded-xl text-gray-400 font-black text-base bg-white border border-gray-300 hover:bg-gray-50 active:scale-95 v-center-cairo"
             >
               {t.back}
             </button>
             
             <button 
               type="button"
               onClick={() => { 
                  if (step === 2) {
                    setAttemptedStep2(true);
                    const { isValid, messageKey } = validateBasicInfo(data);
                    
                    if (!isValid) {
                      showUiAlert(t[messageKey] || t.required || messageKey, 'warning');
                      scrollToFirstErrorInDOM();
                      return;
                    }
                    if (Number(data.driverInfo.currentOdometer) >= Number(data.driverInfo.odometer)) {
                      setShowOdoWarning(true);
                      return;
                    }

                    // If we are about to proceed to the summary, ensure signature is captured
                    if (currentStepIndex === totalSteps - 2) {
                      const sigRequired = data.mode === 'maintenance' ? data.signatures?.inspector : data.signatures?.driver;
                      if (!sigRequired) {
                        setAttemptedSignature(true);
                        showUiAlert(isRTL ? "التوقيع إلزامي قبل عرض التقرير النهائي." : "Signature is mandatory before viewing the summary.", 'warning');
                        scrollToFirstErrorInDOM();
                        return;
                      }
                    }
                    setStep(currentModeSteps[currentStepIndex + 1]);
                  } 
                  else if (step === 3) { 
                    setAttemptedStep3(true);
                    const { isValid, messageKey } = validateDriverReadiness(data, isRTL);
                    
                    if (!isValid) {
                       showUiAlert(messageKey, 'warning');
                       scrollToFirstErrorInDOM();
                       return;
                    }

                    // If we are about to proceed to the summary, ensure signature is captured
                    if (currentStepIndex === totalSteps - 2) {
                      const sigRequired = data.mode === 'maintenance' ? data.signatures?.inspector : data.signatures?.driver;
                      if (!sigRequired) {
                        setAttemptedSignature(true);
                        showUiAlert(isRTL ? "التوقيع إلزامي قبل عرض التقرير النهائي." : "Signature is mandatory before viewing the summary.", 'warning');
                        scrollToFirstErrorInDOM();
                        return;
                      }
                    }
                    setStep(currentModeSteps[currentStepIndex + 1]); 
                  } 
                  else if (step === 4) {
                    setAttemptedStep4(true);
                    const { isValid, messageKey } = validateChecklist(data, isRTL);

                    if (!isValid) {
                      showUiAlert(messageKey, 'warning');
                      scrollToFirstErrorInDOM();
                      return;
                    }
                    // If we are about to proceed to the summary, ensure signature is captured
                    if (currentStepIndex === totalSteps - 2) {
                      const sigRequired = data.mode === 'maintenance' ? data.signatures?.inspector : data.signatures?.driver;
                      if (!sigRequired) {
                        setAttemptedSignature(true);
                        showUiAlert(isRTL ? "التوقيع إلزامي قبل عرض التقرير النهائي." : "Signature is mandatory before viewing the summary.", 'warning');
                        scrollToFirstErrorInDOM();
                        return;
                      }
                    }
                    setStep(currentModeSteps[currentStepIndex + 1]); 
                  } 
               }} 
               className="flex-1 py-4 rounded-xl bg-primary-600 text-white font-black text-xl disabled:bg-gray-200 shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-3"
             >
               {currentStepIndex === totalSteps - 2 ? (
                 <> 
                   <CheckCircle size={24} /> 
                   <span className="v-center-cairo">{t.summary}</span> 
                 </>
               ) : (
                 <> 
                   <span className="v-center-cairo">{t.next}</span> 
                   {isRTL ? <ChevronLeft size={24} /> : <ChevronRight size={24} />} 
                 </>
               )}
             </button>
          </div>
        </div>
       )}

      {showOdoWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mb-2">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-800">
                {isRTL ? 'تنبيه الصيانة' : 'Maintenance Warning'}
              </h3>
              <p className="text-gray-500 text-sm font-bold leading-relaxed">
                {isRTL 
                  ? 'قراءة العداد الحالية تتجاوز (أو تساوي) قراءة موعد الصيانة القادمة. هل أنت متأكد من صحة القراءات وترغب في إكمال الفحص؟' 
                  : 'Current odometer is greater than or equal to the next maintenance odometer. Are you sure the readings are correct and you want to proceed?'}
              </p>
              <div className="flex gap-3 w-full pt-4">
                <button 
                  onClick={() => setShowOdoWarning(false)}
                  className="flex-1 py-3.5 rounded-xl font-black text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
                >
                  {isRTL ? 'تعديل الرقم' : 'Edit Number'}
                </button>
                <button 
                  onClick={handleConfirmOdo}
                  className="flex-1 py-3.5 rounded-xl font-black text-white bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all"
                >
                  {isRTL ? 'نعم، إكمال الفحص' : 'Yes, Proceed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
