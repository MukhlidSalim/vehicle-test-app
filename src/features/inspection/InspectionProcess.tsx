import React, { useState } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { InspectionData, InspectionMode } from '../../types';
import { READINESS_QUESTIONS } from '../../constants';
import { BasicInfoStep } from './BasicInfoStep';
import { DriverReadinessStep } from './DriverReadinessStep';
import { ChecklistStep } from './ChecklistStep';
import { ReportSummaryStep } from './ReportSummaryStep';

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
      const first = document.querySelector('[data-error="true"]') as HTMLElement | null;
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
       {/* Validation Alerts */}
       {uiAlert.show && (
         <div
           className={`p-3 rounded-xl border font-black text-sm v-center-cairo no-print ${
             uiAlert.type === 'fail'
               ? 'bg-red-50 text-red-700 border-red-200'
               : uiAlert.type === 'warning'
               ? 'bg-amber-50 text-amber-800 border-amber-200'
               : 'bg-blue-50 text-blue-800 border-blue-200'
           }`}
         >
           {uiAlert.message}
         </div>
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
          <div className="flex gap-4 border-t border-gray-300 pt-8 pb-10 no-print">
             <button 
               onClick={() => { 
                 if (currentStepIndex === 0) onExit(); 
                 else setStep(currentModeSteps[currentStepIndex - 1]);
               }} 
               className="px-8 py-4 rounded-xl text-gray-400 font-black text-base bg-white border border-gray-300 hover:bg-gray-50 active:scale-95 v-center-cairo"
             >
               {t.back}
             </button>
             
             <button 
               onClick={() => { 
                  if (step === 2) {
                    setAttemptedStep2(true);
                    const { name, plateNumber, phoneNumber, nextInspectionDate, odometer, vehicleType } = data.driverInfo;
                    if (!name || !plateNumber || !phoneNumber || !nextInspectionDate || !odometer || !vehicleType) {
                      showUiAlert(t.required, 'warning');
                      scrollToFirstErrorInDOM();
                      return;
                    }
                    setStep(currentModeSteps[currentStepIndex + 1]);
                  } 
                  else if (step === 3) { 
                    setAttemptedStep3(true);
                    const allAnswered = Object.keys(data.readiness.answers).length >= READINESS_QUESTIONS.length;
                    if (!allAnswered || !data.readiness.finalConfirmation) {
                       showUiAlert(isRTL ? "يرجى الإجابة على جميع الأسئلة وتأكيد الجاهزية قبل المتابعة." : "Please answer all questions and confirm readiness before proceeding.", 'warning');
                       scrollToFirstErrorInDOM();
                       return;
                    }
                    setStep(currentModeSteps[currentStepIndex + 1]); 
                  } 
                  else if (step === 4) {
                    setAttemptedStep4(true);
                    const uncheckedItems = data.checklist.filter((i) => i.status === 'unchecked');
                    
                    // Notes are mandatory for Warning/Fail statuses
                    const bodyItem = data.checklist.find((i) => i.key === 'body_damage');
                    const bdPts = bodyItem?.damagePoints || [];
                    const missingBody = (bdPts.length === 0) || bdPts.some((p) => !p?.note || String(p.note).trim().length === 0);
                    
                    const missingNotesItems = data.checklist.filter((i) => {
                      if (i.key === 'body_damage') return (i.status === 'warning' || i.status === 'fail') ? missingBody : false;
                      const wf = i.status === 'warning' || i.status === 'fail';
                      if (!wf) return false;
                      return !i.notes || String(i.notes).trim().length === 0;
                    });

                    // Fire extinguisher expiry date is mandatory once the item is checked
                    const fireExtItem = data.checklist.find((i) => i.key === 'fire_ext');
                    const missingFireExpiry = fireExtItem && fireExtItem.status !== 'unchecked' && !fireExtItem.expiryDate;

                    // First aid kit expiry date is mandatory once the item is checked
                    const safetyKitItem = data.checklist.find((i) => i.key === 'safety_kit');
                    const missingSafetyExpiry = safetyKitItem && safetyKitItem.status !== 'unchecked' && !safetyKitItem.expiryDate;

                    if (uncheckedItems.length > 0) {
                      showUiAlert(isRTL ? 'يرجى فحص جميع العناصر المطلوبة قبل المتابعة.' : 'Please inspect all required items before proceeding.', 'warning');
                      scrollToFirstErrorInDOM();
                      return;
                    }
                    if (missingFireExpiry || missingSafetyExpiry) {
                      showUiAlert(
                        isRTL ? 'يرجى إدخال تاريخ انتهاء الصلاحية لجميع العناصر المطلوبة قبل المتابعة.' : 'Please enter all required expiry dates before proceeding.',
                        'warning'
                      );
                      scrollToFirstErrorInDOM();
                      return;
                    }
                    if (missingNotesItems.length > 0) {
                      showUiAlert(
                        isRTL ? 'يرجى كتابة الملاحظات لجميع عناصر (تنبيه/ضرر) وإضافة نقطة واحدة على الأقل مع وصف لكل ضرر في هيكل المركبة.'
                             : 'Please add notes for all Warning/Fail items and add at least one body-damage point with a description for each point.',
                        'warning'
                      );
                      scrollToFirstErrorInDOM();
                      return;
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
       )}
    </div>
  );
};
