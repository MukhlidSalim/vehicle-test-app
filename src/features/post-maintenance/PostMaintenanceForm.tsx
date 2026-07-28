import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, Wrench, ShieldCheck, CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight, Hash, User, Calendar, FileText, ArrowLeft,
  Truck
} from 'lucide-react';
import { SignaturePad } from '../../components/SignaturePad';
import { PostMaintenanceReport } from './PostMaintenanceReport';
import { SECTION_A_ITEMS, SECTION_B_ITEMS, SECTION_C_ITEMS, getInitialData, PostMaintenanceConfigItem } from './postMaintenanceConfig';
import { PostMaintenanceData, PostMaintenanceStatus } from '../../types';
import { CustomDatePicker } from '../../components/CustomDatePicker';
import { OmanPlateInput } from '../../components/OmanPlateInput';
import { OdometerInput } from '../../components/OdometerInput';
interface Props {
  initialData?: PostMaintenanceData;
  onSubmit?: (data: PostMaintenanceData) => void;
  lang: 'ar' | 'en';
  isRTL: boolean;
  onExit: () => void;
}

export const PostMaintenanceForm: React.FC<Props> = ({ 
  initialData, 
  onSubmit, 
  lang: appLang, 
  isRTL: appIsRTL, 
  onExit 
}) => {
  const [lang, setLang] = useState<'ar' | 'en'>(appLang);
  const isRTL = lang === 'ar';
  
  useEffect(() => { setLang(appLang); }, [appLang]);
  
  const [step, setStep] = useState(0);
  const [data, setData] = useState<PostMaintenanceData>(getInitialData());
  const [uiAlert, setUiAlert] = useState({ show: false, message: '', type: 'warning' as 'warning' | 'fail' });
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  
  const showAlert = (message: string, type: 'warning' | 'fail' = 'warning') => {
    setUiAlert({ show: true, message, type });
    window.setTimeout(() => setUiAlert(p => p.show ? { ...p, show: false } : p), 4500);
  };
  
  const updateMeta = (field: keyof PostMaintenanceData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateItem = (section: 'sectionA' | 'sectionB' | 'sectionC', id: string, field: 'status' | 'remarks', value: any) => {
    setData(prev => ({
      ...prev,
      [section]: prev[section].map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const updateSignature = (role: 'driver' | 'operations' | 'workshop', sig: string) => {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    setData(prev => ({
      ...prev,
      signatures: {
        ...prev.signatures,
        [role]: sig,
        [`${role}Date`]: sig ? dateStr : undefined
      }
    }));
  };
  
  const validateStep0 = () => {
    setAttemptedSubmit(true);
    const requiredStr = (str?: string) => str && str.trim().length > 0;
    
    if (!requiredStr(data.vehicleRegNo) || !requiredStr(data.workshop) || !requiredStr(data.jobCardNo) || !requiredStr(data.inspectorName) || !data.priority) {
      showAlert(isRTL ? 'يرجى تعبئة جميع الحقول الإلزامية (*) المحددة باللون الأحمر.' : 'Please fill all required fields marked in red.');
      return false;
    }
    
    if (data.dateSent && data.dateReturned) {
      if (data.dateReturned < data.dateSent) {
        showAlert(isRTL ? 'تاريخ الاسترجاع لا يمكن أن يسبق تاريخ الإرسال.' : 'Date Returned cannot be before Date Sent.');
        return false;
      }
    }
    
    if (data.kmReading && Number(data.kmReading) < 0) {
      showAlert(isRTL ? 'قراءة العداد يجب أن تكون قيمة موجبة.' : 'KM Reading must be a positive value.');
      return false;
    }
    
    return true;
  };
  
  const validateSection = (section: 'sectionA' | 'sectionB' | 'sectionC') => {
    const uncompleted = data[section].find(item => item.status === null);
    if (uncompleted) {
      setAttemptedSubmit(true);
      showAlert(isRTL ? 'يرجى الإجابة على جميع العناصر' : 'Please answer all items');
      return false;
    }
    const missingRemarks = data[section].find(item => (item.status === 'fail' || item.status === 'na') && !item.remarks);
    if (missingRemarks) {
      showAlert(isRTL ? 'يرجى كتابة ملاحظة للعناصر التي فشلت أو لا تنطبق' : 'Please provide remarks for Fail / N/A items');
      return false;
    }
    return true;
  };

  const validateSignOff = () => {
    if (!data.finalStatus) {
      showAlert(isRTL ? 'يرجى تحديد حالة القبول النهائية' : 'Please select a final status');
      return false;
    }
    if (!data.signatures.driver || !data.signatures.operations || !data.signatures.workshop) {
      showAlert(isRTL ? 'يرجى توقيع جميع الأطراف المعنية' : 'Please provide all signatures');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setAttemptedSubmit(false);
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateSection('sectionA')) return;
    if (step === 2 && !validateSection('sectionB')) return;
    if (step === 3 && !validateSection('sectionC')) return;
    if (step === 4 && !validateSignOff()) return;
    
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handlePrev = () => {
    setAttemptedSubmit(false);
    setStep(s => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setData(getInitialData());
    setStep(0);
    setAttemptedSubmit(false);
  };

  const renderRadio = (
    options: { value: string, labelAr: string, labelEn: string, color: string }[], 
    currentValue: any, 
    onChange: (val: any) => void
  ) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center justify-center py-3 px-4 rounded-xl border-2 font-black transition-all ${currentValue === opt.value ? opt.color + ' shadow-md scale-[1.02]' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
          >
            {isRTL ? opt.labelAr : opt.labelEn}
          </button>
        ))}
      </div>
    );
  };

  const renderStatusButtons = (status: PostMaintenanceStatus, onChange: (st: PostMaintenanceStatus) => void) => (
    <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
      <button onClick={() => onChange('pass')} className={`flex-1 py-2 px-3 rounded-lg font-black text-sm transition-all ${status === 'pass' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>
        {isRTL ? 'ناجح' : 'Pass'}
      </button>
      <button onClick={() => onChange('fail')} className={`flex-1 py-2 px-3 rounded-lg font-black text-sm transition-all ${status === 'fail' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>
        {isRTL ? 'راسب' : 'Fail'}
      </button>
      <button onClick={() => onChange('na')} className={`flex-1 py-2 px-3 rounded-lg font-black text-sm transition-all ${status === 'na' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>
        {isRTL ? 'غير ذلك' : 'N/A'}
      </button>
    </div>
  );

  const renderListSection = (
    titleAr: string, titleEn: string, 
    items: PostMaintenanceConfigItem[], 
    sectionKey: 'sectionA' | 'sectionC'
  ) => {
    return (
      <div className="space-y-5 animate-fade-in">
        <h3 className="text-xl font-black text-primary-900 border-b border-primary-200 pb-3">{isRTL ? titleAr : titleEn}</h3>
        <div className="space-y-4">
          {items.map((conf, index) => {
            const dataItem = data[sectionKey].find(i => i.id === conf.id)!;
            const hasError = attemptedSubmit && dataItem.status === null;
            return (
              <div key={conf.id} className={`bg-white rounded-2xl p-4 border-2 shadow-sm transition-all ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-100'}`}>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 font-black rounded-full flex items-center justify-center shadow-inner">{index + 1}</span>
                    <span className="font-bold text-gray-800 leading-relaxed text-sm md:text-base">{isRTL ? conf.labelAr : conf.labelEn}</span>
                  </div>
                  <div className="w-full md:w-auto flex-shrink-0">
                    {renderStatusButtons(dataItem.status, (st) => updateItem(sectionKey, conf.id, 'status', st))}
                  </div>
                </div>
                {(dataItem.status === 'fail' || dataItem.status === 'na' || dataItem.remarks.length > 0) && (
                  <div className="mt-4 animate-fade-in">
                    <textarea 
                      placeholder={isRTL ? "ملاحظات / إجراءات تصحيحية (مطلوب إذا تم اختيار Fail أو N/A)" : "Remarks / Corrective Action (Required for Fail/N/A)"}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 font-medium"
                      rows={2}
                      value={dataItem.remarks}
                      onChange={(e) => updateItem(sectionKey, conf.id, 'remarks', e.target.value)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderIconSectionB = () => {
    return (
      <div className="space-y-5 animate-fade-in">
        <h3 className="text-xl font-black text-primary-900 border-b border-primary-200 pb-3">{isRTL ? 'ب. الفحوصات التشغيلية بعد الصيانة' : 'B. Post-Maintenance Functional Checks'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SECTION_B_ITEMS.map((conf, index) => {
            const dataItem = data.sectionB.find(i => i.id === conf.id)!;
            const hasError = attemptedSubmit && dataItem.status === null;
            return (
              <div key={conf.id} className={`bg-white rounded-2xl p-4 border-2 shadow-sm transition-all flex flex-col gap-4 ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-100'}`}>
                <div className="flex items-start gap-4">
                  {conf.icon && (
                    <div className={`p-2 rounded-xl border shadow-inner flex-shrink-0 ${hasError ? 'bg-red-100 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-primary-600'}`}>
                      <conf.icon size={28} />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-xs font-black text-primary-600 mb-1">{isRTL ? `العنصر ${index + 1}` : `Item ${index + 1}`}</div>
                    <span className="font-bold text-gray-800 text-sm leading-snug block">{isRTL ? conf.labelAr : conf.labelEn}</span>
                  </div>
                </div>
                
                <div className="mt-auto">
                  {renderStatusButtons(dataItem.status, (st) => updateItem('sectionB', conf.id, 'status', st))}
                </div>
                
                {(dataItem.status === 'fail' || dataItem.status === 'na' || dataItem.remarks.length > 0) && (
                  <div className="animate-fade-in">
                    <textarea 
                      placeholder={isRTL ? "ملاحظات (مطلوب لـ Fail/NA)" : "Remarks (Required for Fail/NA)"}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-primary-500 font-medium"
                      rows={2}
                      value={dataItem.remarks}
                      onChange={(e) => updateItem('sectionB', conf.id, 'remarks', e.target.value)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            {isRTL ? <ArrowLeft size={24} className="rotate-180" /> : <ArrowLeft size={24} />}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center shadow-inner">
              <ClipboardCheck size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-gray-900">{isRTL ? 'استلام الحافلات بعد الصيانة' : 'Post-Maintenance Acceptance'}</h2>
              {step > 0 && step < 5 && <p className="text-sm font-bold text-primary-600">{isRTL ? `خطوة ${step} من 4` : `Step ${step} of 4`}</p>}
            </div>
          </div>
        </div>
      </div>

      {uiAlert.show && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-bold text-sm shadow-sm animate-fade-in border ${
          uiAlert.type === 'fail' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          <AlertTriangle size={20} />
          {uiAlert.message}
        </div>
      )}

      {/* Steps */}
      {step === 0 && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-[2rem] p-6 shadow-xl border border-gray-200 space-y-6">
            <h3 className="text-xl font-black text-primary-900 border-b border-gray-100 pb-3">{isRTL ? 'معلومات صيانة الحافلة' : 'Bus Maintenance Information'}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-black text-gray-700 flex items-center gap-2"><Truck size={16} className="text-primary-500"/> {isRTL ? 'رقم اللوحة' : 'Vehicle Reg. No'} *</label>
                <input type="text" className={`w-full bg-white border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 font-bold transition-all shadow-sm ${attemptedSubmit && !data.vehicleRegNo.trim() ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : 'border-gray-200'}`}
                       value={data.vehicleRegNo} onChange={e => updateMeta('vehicleRegNo', e.target.value)} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-black text-gray-700 flex items-center gap-2"><Wrench size={16} className="text-primary-500"/> {isRTL ? 'الورشة' : 'Workshop'} *</label>
                <input type="text" className={`w-full bg-white border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 font-bold transition-all shadow-sm ${attemptedSubmit && !data.workshop.trim() ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : 'border-gray-200'}`}
                       value={data.workshop} onChange={e => updateMeta('workshop', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-black text-gray-700 flex items-center gap-2"><Calendar size={16} className="text-primary-500"/> {isRTL ? 'تاريخ الإرسال' : 'Date Sent'}</label>
                <CustomDatePicker
                  value={data.dateSent}
                  onChange={val => updateMeta('dateSent', val)}
                  error={attemptedSubmit && data.dateSent && data.dateReturned && data.dateReturned < data.dateSent ? true : false}
                  isRTL={isRTL}
                  isRecentDate={true}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-black text-gray-700 flex items-center gap-2"><Calendar size={16} className="text-primary-500"/> {isRTL ? 'تاريخ الاسترجاع' : 'Date Returned'}</label>
                <CustomDatePicker
                  value={data.dateReturned}
                  onChange={val => updateMeta('dateReturned', val)}
                  error={attemptedSubmit && data.dateSent && data.dateReturned && data.dateReturned < data.dateSent ? true : false}
                  isRTL={isRTL}
                  isRecentDate={true}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-black text-gray-700 flex items-center gap-2"><Hash size={16} className="text-primary-500"/> {isRTL ? 'رقم كرت العمل' : 'Job Card No'} *</label>
                <input type="text" className={`w-full bg-white border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 font-bold transition-all shadow-sm ${attemptedSubmit && !data.jobCardNo.trim() ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : 'border-gray-200'}`}
                       value={data.jobCardNo} onChange={e => updateMeta('jobCardNo', e.target.value)} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-black text-gray-700 flex items-center gap-2"><Hash size={16} className="text-primary-500"/> {isRTL ? 'قراءة العداد (كم)' : 'KM Reading'}</label>
                <OdometerInput
                  value={data.kmReading}
                  onChange={val => updateMeta('kmReading', val)}
                  error={attemptedSubmit && !data.kmReading.trim() ? true : false}
                  isRTL={isRTL}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-black text-gray-700 flex items-center gap-2"><User size={16} className="text-primary-500"/> {isRTL ? 'اسم المفتش' : 'Inspector Name'} *</label>
                <input type="text" className={`w-full bg-white border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 font-bold transition-all shadow-sm ${attemptedSubmit && !data.inspectorName.trim() ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : 'border-gray-200'}`}
                       value={data.inspectorName} onChange={e => updateMeta('inspectorName', e.target.value)} />
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <label className="text-sm font-black text-gray-700">{isRTL ? 'الأولوية' : 'Priority'} *</label>
              <div className={`p-1.5 rounded-2xl transition-all ${attemptedSubmit && !data.priority ? 'border border-red-500 bg-red-50' : 'border border-transparent'}`}>
                {renderRadio([
                  { value: 'A', labelAr: 'أولوية أ (A)', labelEn: 'Priority A', color: 'bg-red-50 border-red-500 text-red-700' },
                  { value: 'B', labelAr: 'أولوية ب (B)', labelEn: 'Priority B', color: 'bg-amber-50 border-amber-500 text-amber-700' },
                  { value: 'C', labelAr: 'أولوية ج (C)', labelEn: 'Priority C', color: 'bg-emerald-50 border-emerald-500 text-emerald-700' },
                ], data.priority, (val) => updateMeta('priority', val))}
              </div>
            </div>

          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-[2rem] p-6 shadow-xl border border-gray-200 space-y-4">
            <h3 className="text-xl font-black text-primary-900 border-b border-gray-100 pb-3">{isRTL ? 'تفاصيل الإصلاح المُبلغ عنه' : 'Reported Repair Details'}</h3>
            <div className="space-y-1.5">
              <label className="text-sm font-black text-gray-700">{isRTL ? 'العطل المُبلغ عنه' : 'Reported Defect'}</label>
              <textarea className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 font-bold transition-all shadow-sm" rows={3}
                     value={data.reportedDefect} onChange={e => updateMeta('reportedDefect', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-black text-gray-700">{isRTL ? 'تفاصيل الإصلاح' : 'Repair Details'}</label>
              <textarea className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 font-bold transition-all shadow-sm" rows={3}
                     value={data.repairDetails} onChange={e => updateMeta('repairDetails', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {step === 1 && renderListSection(isRTL ? 'أ. التحقق من تصحيح الإصلاح' : 'A. Repair Rectification Verification', isRTL ? 'أ. التحقق من تصحيح الإصلاح' : 'A. Repair Rectification Verification', SECTION_A_ITEMS, 'sectionA')}
      
      {step === 2 && renderIconSectionB()}

      {step === 3 && renderListSection(isRTL ? 'ج. اختبار الطريق والقبول النهائي' : 'C. Road Test and Final Acceptance', isRTL ? 'ج. اختبار الطريق والقبول النهائي' : 'C. Road Test and Final Acceptance', SECTION_C_ITEMS, 'sectionC')}

      {step === 4 && (
        <div className="bg-white/80 backdrop-blur-lg rounded-[2rem] p-6 shadow-xl border border-white/40 space-y-8 animate-fade-in">
          <h3 className="text-xl font-black text-primary-900 border-b border-primary-100 pb-4">{isRTL ? 'القرار النهائي والتوقيع' : 'Final Decision and Sign-Off'}</h3>
          
          <div className="space-y-4">
            <label className="text-sm font-black text-gray-700">{isRTL ? 'الحالة النهائية' : 'Final Status'} *</label>
            {renderRadio([
              { value: 'Accepted', labelAr: 'مقبولة (Accepted)', labelEn: 'Accepted', color: 'bg-emerald-50 border-emerald-500 text-emerald-700' },
              { value: 'Conditional Acceptance', labelAr: 'قبول مشروط', labelEn: 'Conditional Acceptance', color: 'bg-amber-50 border-amber-500 text-amber-700' },
              { value: 'Reinspection', labelAr: 'إعادة فحص', labelEn: 'Reinspection', color: 'bg-blue-50 border-blue-500 text-blue-700' },
              { value: 'Rejected', labelAr: 'مرفوضة (Rejected)', labelEn: 'Rejected', color: 'bg-red-50 border-red-500 text-red-700' },
            ], data.finalStatus, (val) => updateMeta('finalStatus', val))}
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl mt-2 text-xs font-bold text-red-800">
              <span className="text-red-600 font-black">{isRTL ? 'قاعدة القبول: ' : 'Acceptance rule: '}</span>
              {isRTL ? 'أي عطل يمس السلامة لم يتم حله أو تكرار العطل الأصلي يتطلب الرفض وإعادة الصيانة.' : 'Any unresolved safety-critical defect or recurrence of the original defect requires rejection and return to maintenance.'}
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-black text-gray-700">{isRTL ? 'العناصر المتبقية / ملاحظات' : 'Outstanding Items'}</label>
             <textarea className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 font-bold transition-all shadow-sm" rows={4}
                     value={data.outstandingItems} onChange={e => updateMeta('outstandingItems', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 gap-6 pt-6 border-t border-gray-200">
             <div className="space-y-3">
                <SignaturePad 
                  label={isRTL ? 'توقيع السائق / المفتش *' : 'Driver / Inspector Signature *'}
                  initialSignature={data.signatures.driver}
                  onSave={(sig) => updateSignature('driver', sig)} 
                  onClear={() => updateSignature('driver', '')}
                  error={attemptedSubmit && !data.signatures.driver}
                  isRTL={isRTL}
                />
             </div>
             <div className="space-y-3">
                <SignaturePad 
                  label={isRTL ? 'توقيع ممثل العمليات *' : 'Operations Rep. Signature *'}
                  initialSignature={data.signatures.operations}
                  onSave={(sig) => updateSignature('operations', sig)} 
                  onClear={() => updateSignature('operations', '')}
                  error={attemptedSubmit && !data.signatures.operations}
                  isRTL={isRTL}
                />
             </div>
             <div className="space-y-3">
                <SignaturePad 
                  label={isRTL ? 'توقيع ممثل الورشة *' : 'Workshop Rep. Signature *'}
                  initialSignature={data.signatures.workshop}
                  onSave={(sig) => updateSignature('workshop', sig)} 
                  onClear={() => updateSignature('workshop', '')}
                  error={attemptedSubmit && !data.signatures.workshop}
                  isRTL={isRTL}
                />
             </div>
          </div>
        </div>
      )}

      {step === 5 && (
        <PostMaintenanceReport data={data} isRTL={isRTL} onNewForm={handleReset} onEdit={() => {
          setStep(0);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} />
      )}

      {/* Navigation Footer */}
      {step < 5 && (
        <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center gap-4">
            <button
              onClick={handlePrev}
              disabled={step === 0}
              className={`flex-1 py-3.5 md:py-4 rounded-xl font-black text-sm md:text-base flex items-center justify-center gap-2 transition-all ${
                step === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50' 
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <ChevronLeft size={20} className={isRTL ? 'rotate-180' : ''} />
              {isRTL ? 'السابق' : 'Previous'}
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3.5 md:py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-sm md:text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-600/30"
            >
              {step === 4 ? (isRTL ? 'إصدار التقرير' : 'Generate Report') : (isRTL ? 'التالي' : 'Next')}
              <ChevronRight size={20} className={isRTL ? 'rotate-180' : ''} />
            </button>
        </div>
      )}
    </div>
  );
};
