import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, Wrench, ShieldCheck, CheckCircle, XCircle, RefreshCw, AlertTriangle, ChevronLeft, ChevronRight, Hash, User, Calendar, FileText, ArrowLeft,
  Truck
} from 'lucide-react';
import { SignaturePad } from '../../components/SignaturePad';
import { PostMaintenanceReport } from './PostMaintenanceReport';
import { SECTION_A_ITEMS, SECTION_B_ITEMS, getInitialData, PostMaintenanceConfigItem } from './postMaintenanceConfig';
import { PostMaintenanceData, PostMaintenanceStatus } from '../../types';
import { CustomDatePicker } from '../../components/CustomDatePicker';
import { OmanPlateInput } from '../../components/OmanPlateInput';
import { OdometerInput } from '../../components/OdometerInput';
import { scrollToFirstError } from '../../utils/validationScroll';
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
  
  const [step, setStep] = useState(() => {
    try {
      const saved = localStorage.getItem('pm_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.timestamp && (Date.now() - parsed.timestamp < 60 * 60 * 1000)) {
          return parsed.step;
        }
      }
    } catch(e) {}
    return 0;
  });
  
  const [data, setData] = useState<PostMaintenanceData>(() => {
    try {
      const saved = localStorage.getItem('pm_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.timestamp && (Date.now() - parsed.timestamp < 60 * 60 * 1000)) {
          return parsed.data;
        }
      }
    } catch(e) {}
    return getInitialData();
  });
  
  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem('pm_session', JSON.stringify({ step, data, timestamp: Date.now() }));
    }, 1000);
    return () => clearTimeout(handler);
  }, [step, data]);
  const [uiAlert, setUiAlert] = useState({ show: false, message: '', type: 'warning' as 'warning' | 'fail' });
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  
  const showAlert = (message: string, type: 'warning' | 'fail' = 'warning') => {
    setUiAlert({ show: true, message, type });
    window.setTimeout(() => setUiAlert(p => p.show ? { ...p, show: false } : p), 4500);
  };
  
  const updateMeta = (field: keyof PostMaintenanceData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateItem = (section: 'sectionA' | 'sectionB', id: string, field: 'status' | 'remarks', value: any) => {
    setData(prev => ({
      ...prev,
      [section]: prev[section].map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const updateSignature = (role: 'driver' | 'inspector' | 'workshop', sig: string) => {
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

  const updateSignatureName = (role: 'driver' | 'inspector' | 'workshop', name: string) => {
    setData(prev => ({
      ...prev,
      signatures: {
        ...prev.signatures,
        [`${role}Name`]: name
      }
    }));
  };
  
  const validateStep0 = () => {
    setAttemptedSubmit(true);
    const requiredStr = (str?: string) => str && str.trim().length > 0;
    
    let isValid = true;
    if (!requiredStr(data.vehicleRegNo)) isValid = false;
    if (!requiredStr(data.workshop)) isValid = false;
    if (!requiredStr(data.jobCardNo)) isValid = false;
    if (!requiredStr(data.inspectorName)) isValid = false;
    if (!data.priority) isValid = false;
    
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
    
    if (!isValid) {
      scrollToFirstError();
      return false;
    }
    
    return true;
  };
  
  const validateSection = (section: 'sectionA' | 'sectionB') => {
    setAttemptedSubmit(true);
    const uncompleted = data[section].find(item => item.status === null);
    if (uncompleted) {
      setTimeout(() => scrollToFirstError(), 100);
      return false;
    }
    const missingRemarks = data[section].find(item => item.status === 'fail' && !item.remarks);
    if (missingRemarks) {
      setTimeout(() => scrollToFirstError(), 100);
      return false;
    }
    return true;
  };

  const validateSignOff = () => {
    setAttemptedSubmit(true);
    let isValid = true;
    if (!data.finalStatus) isValid = false;
    if (
      !data.signatures.driver || data.signatures.driver.length < 500 ||
      !data.signatures.driverName || data.signatures.driverName.trim().length === 0 ||
      !data.signatures.inspector || data.signatures.inspector.length < 500 ||
      !data.signatures.inspectorName || data.signatures.inspectorName.trim().length === 0 ||
      !data.signatures.workshop || data.signatures.workshop.length < 500 ||
      !data.signatures.workshopName || data.signatures.workshopName.trim().length === 0
    ) isValid = false;

    if (!isValid) {
      scrollToFirstError();
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateSection('sectionA')) return;
    if (step === 2 && !validateSection('sectionB')) return;
    if (step === 3 && !validateSignOff()) return;
    
    setAttemptedSubmit(false);
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handlePrev = () => {
    setAttemptedSubmit(false);
    setStep(s => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    localStorage.removeItem('pm_session');
    setData(getInitialData());
    setStep(0);
    setAttemptedSubmit(false);
  };

  const renderRadio = (
    options: { value: string, labelAr: string, labelEn: string, color: string, disabled?: boolean }[], 
    currentValue: any, 
    onChange: (val: any) => void
  ) => {
    return (
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1 h-full w-full">
        {options.map(opt => (
          <button type="button"
            key={opt.value}
            disabled={opt.disabled}
            onClick={() => !opt.disabled && onChange(opt.value)}
            className={`flex-1 flex items-center justify-center rounded-lg font-black text-xs md:text-sm transition-all ${currentValue === opt.value ? opt.color + ' shadow-sm scale-[1.02]' : (opt.disabled ? 'text-gray-300 cursor-not-allowed opacity-50 bg-gray-50' : 'text-gray-500 hover:bg-gray-200')}`}
          >
            {isRTL ? opt.labelAr : opt.labelEn}
          </button>
        ))}
      </div>
    );
  };

  const renderStatusButtons = (status: PostMaintenanceStatus, onChange: (st: PostMaintenanceStatus) => void) => (
    <div className="flex bg-gray-100 rounded-xl p-1 gap-1 w-full md:w-auto min-w-[240px]">
      <button type="button" onClick={() => onChange('pass')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-black text-xs md:text-sm transition-all ${status === 'pass' ? 'bg-emerald-500 text-white shadow-md scale-[1.05] z-10' : 'text-gray-500 hover:bg-gray-200 hover:scale-105 hover:z-10'}`}>
        <CheckCircle size={14} className={status === 'pass' ? 'text-white' : 'text-emerald-500 opacity-50'} /> {isRTL ? 'ناجح' : 'Pass'}
      </button>
      <button type="button" onClick={() => onChange('fail')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-black text-xs md:text-sm transition-all ${status === 'fail' ? 'bg-red-500 text-white shadow-md scale-[1.05] z-10' : 'text-gray-500 hover:bg-gray-200 hover:scale-105 hover:z-10'}`}>
        <XCircle size={14} className={status === 'fail' ? 'text-white' : 'text-red-500 opacity-50'} /> {isRTL ? 'راسب' : 'Fail'}
      </button>
      <button type="button" onClick={() => onChange('na')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-black text-xs md:text-sm transition-all ${status === 'na' ? 'bg-gray-500 text-white shadow-md scale-[1.05] z-10' : 'text-gray-500 hover:bg-gray-200 hover:scale-105 hover:z-10'}`}>
        {isRTL ? 'غير مطبق' : 'N/A'}
      </button>
    </div>
  );

  const renderListSection = (
    titleAr: string, titleEn: string, 
    items: PostMaintenanceConfigItem[], 
    sectionKey: 'sectionA' | 'sectionB'
  ) => {
    return (
      <div className="space-y-4 animate-fade-in">
        <h2 className="text-2xl font-black text-gray-800 mb-6 px-2">{isRTL ? titleAr : titleEn}</h2>
        {items.map((conf, index) => {
          const itemData = data[sectionKey].find(i => i.id === conf.id)!;
          const isError = attemptedSubmit && itemData.status === null;
          
          return (
            <div key={conf.id} className={`bg-white rounded-[20px] p-4 md:p-5 shadow-sm border transition-all ${isError ? 'border-red-400 shadow-red-100 ring-2 ring-red-100' : 'border-gray-200'}`}>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                
                {/* Header/Title */}
                <div className="flex-1 flex gap-3 w-full">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 font-black rounded-full flex items-center justify-center shadow-inner">
                    {conf.icon ? <conf.icon size={18} /> : index + 1}
                  </span>
                  <span className="font-bold text-gray-800 leading-relaxed text-sm md:text-base pt-1 md:pt-2">
                    {isRTL ? conf.labelAr : conf.labelEn}
                  </span>
                </div>

                {/* Status Segmented Control */}
                <div className="w-full md:w-auto shrink-0 flex flex-col gap-3">
                  <div className="flex bg-gray-100/80 p-1 rounded-2xl w-full md:min-w-[280px]">
                    <button type="button" onClick={() => updateItem(sectionKey, conf.id, 'status', 'pass')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-black text-sm transition-all ${itemData.status === 'pass' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-gray-500 hover:text-emerald-600'}`}>
                      <CheckCircle size={16} /> {isRTL ? 'ناجح' : 'Pass'}
                    </button>
                    <button type="button" onClick={() => updateItem(sectionKey, conf.id, 'status', 'fail')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-black text-sm transition-all ${itemData.status === 'fail' ? 'bg-white text-red-600 shadow-sm border border-red-100' : 'text-gray-500 hover:text-red-600'}`}>
                      <XCircle size={16} /> {isRTL ? 'راسب' : 'Fail'}
                    </button>
                    <button type="button" onClick={() => updateItem(sectionKey, conf.id, 'status', 'na')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-black text-sm transition-all ${itemData.status === 'na' ? 'bg-white text-gray-800 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-800'}`}>
                      {isRTL ? 'غير مطبق' : 'N/A'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Remarks Box */}
              {(itemData.status === 'fail' || itemData.status === 'na' || itemData.remarks) && (
                <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in-down">
                  <textarea 
                    className={`w-full bg-gray-50 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white font-bold transition-all placeholder:text-gray-400 ${attemptedSubmit && itemData.status === 'fail' && !itemData.remarks ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                    placeholder={isRTL ? 'الملاحظات أو الإجراء التصحيحي...' : 'Remarks / Corrective Action...'}
                    rows={2}
                    value={itemData.remarks} onChange={e => updateItem(sectionKey, conf.id, 'remarks', e.target.value)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );};

  const renderIconSectionB = () => {
    return (
      <div className="space-y-5 animate-fade-in">
        <h3 className="text-xl font-black text-primary-900 border-b border-primary-200 pb-3">{isRTL ? 'ب. الفحوصات التشغيلية بعد الصيانة' : 'B. Post-Maintenance Functional Checks'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SECTION_B_ITEMS.map((conf, index) => {
            const dataItem = data.sectionB.find(i => i.id === conf.id)!;
            const hasError = attemptedSubmit && dataItem.status === null;
            return (
              <div key={conf.id} data-error={hasError ? "true" : undefined} className={`bg-white rounded-2xl p-4 border-2 shadow-sm transition-all flex flex-col gap-4 ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-100'}`}>
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
                
                {(dataItem.status === 'fail' || dataItem.remarks.length > 0) && (
                  <div className="animate-fade-in origin-top">
                    <div className="flex gap-1 flex-wrap mb-2">
                      {(isRTL ? ['تالف', 'مفقود', 'يحتاج صيانة'] : ['Damaged', 'Missing', 'Needs Service']).map(tag => (
                        <button key={tag} type="button" onClick={() => updateItem('sectionB', conf.id, 'remarks', dataItem.remarks ? `${dataItem.remarks}, ${tag}` : tag)} className="text-[9px] font-bold bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded-md hover:bg-primary-100 transition-colors">
                          + {tag}
                        </button>
                      ))}
                    </div>
                    <textarea 
                      placeholder={isRTL ? "ملاحظات (مطلوب لـ Fail)" : "Remarks (Required for Fail)"}
                      data-error={attemptedSubmit && dataItem.status === 'fail' && !dataItem.remarks ? "true" : undefined}
                      className={`w-full bg-gray-50 border rounded-xl p-2 text-xs focus:ring-2 focus:ring-primary-500 focus:bg-white font-medium transition-all shadow-inner ${attemptedSubmit && dataItem.status === 'fail' && !dataItem.remarks ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : 'border-gray-200'}`}
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
    <div className="animate-fade-in pb-20 max-w-4xl mx-auto">
      {/* Header with Exit */}
      <div className="flex items-center gap-4 mb-4">
        <button type="button" onClick={onExit} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 bg-white shadow-sm border border-gray-100">
          <ArrowLeft size={20} className={isRTL ? "rotate-180" : ""} />
        </button>
        <h2 className="text-lg font-black text-gray-900">{isRTL ? 'استمارة فحص الحافلة بعد الصيانة' : 'Post-Maintenance Acceptance'}</h2>
      </div>

      {/* Progress Tracker Bar */}
      {step < 4 && (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-400 space-y-3 mb-6 no-print">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-black text-primary-900 uppercase tracking-widest opacity-60">
              {isRTL ? `المرحلة ${step + 1} من 4` : `Step ${step + 1} of 4`}
            </span>
            <span className="text-xs font-black text-primary-600 font-mono">{Math.round(((step + 1) / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-primary-600 h-full transition-all duration-1000 ease-out" style={{ width: `${((step + 1) / 4) * 100}%` }}></div>
          </div>
        </div>
      )}

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
          {/* Card 1: Vehicle & Inspector Details */}
          <div className="bg-white/80 backdrop-blur-lg rounded-[2rem] p-6 shadow-xl border border-gray-200 space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Truck size={18} /></div>
              <h3 className="text-lg font-black text-gray-900">{isRTL ? 'بيانات المركبة والمفتش' : 'Vehicle & Inspector Details'}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{isRTL ? 'رقم اللوحة' : 'Vehicle Reg. No'} *</label>
                <OmanPlateInput value={data.vehicleRegNo} onChange={val => updateMeta('vehicleRegNo', val)} error={attemptedSubmit && !data.vehicleRegNo.trim()} isRTL={isRTL} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{isRTL ? 'الورشة' : 'Workshop'} *</label>
                <div className="relative">
                  <Wrench size={16} className={`absolute top-3.5 ${isRTL ? 'right-3' : 'left-3'} text-gray-400`} />
                  <input type="text" data-error={attemptedSubmit && !data.workshop.trim() ? "true" : undefined} className={`w-full bg-gray-50 border rounded-xl p-3 ${isRTL ? 'pr-10' : 'pl-10'} text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white font-bold transition-all shadow-inner ${attemptedSubmit && !data.workshop.trim() ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : 'border-gray-200'}`}
                         value={data.workshop} onChange={e => updateMeta('workshop', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{isRTL ? 'رقم كرت العمل' : 'Job Card No'} *</label>
                <div className="relative w-full">
                  <Hash size={16} className={`absolute top-3.5 ${isRTL ? 'right-3' : 'left-3'} text-gray-400`} />
                  <input type="text" data-error={attemptedSubmit && !data.jobCardNo.trim() ? "true" : undefined} className={`w-full bg-gray-50 border rounded-xl p-3 ${isRTL ? 'pr-10' : 'pl-10'} text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white font-bold transition-all shadow-inner ${attemptedSubmit && !data.jobCardNo.trim() ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : 'border-gray-200'}`}
                         value={data.jobCardNo} onChange={e => updateMeta('jobCardNo', e.target.value)} dir="ltr" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{isRTL ? 'اسم المفتش' : 'Inspector Name'} *</label>
                <div className="relative">
                  <User size={16} className={`absolute top-3.5 ${isRTL ? 'right-3' : 'left-3'} text-gray-400`} />
                  <input type="text" data-error={attemptedSubmit && !data.inspectorName.trim() ? "true" : undefined} className={`w-full bg-gray-50 border rounded-xl p-3 ${isRTL ? 'pr-10' : 'pl-10'} text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white font-bold transition-all shadow-inner ${attemptedSubmit && !data.inspectorName.trim() ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : 'border-gray-200'}`}
                         value={data.inspectorName} onChange={e => updateMeta('inspectorName', e.target.value)} />
                </div>
              </div>

            </div>
          </div>

          {/* Card 2: Timeline & Status */}
          <div className="bg-white/80 backdrop-blur-lg rounded-[2rem] p-6 shadow-xl border border-gray-200 space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><Calendar size={18} /></div>
              <h3 className="text-lg font-black text-gray-900">{isRTL ? 'السجل الزمني والمسافة' : 'Timeline & Status'}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{isRTL ? 'تاريخ الإرسال' : 'Date Sent'}</label>
                <CustomDatePicker value={data.dateSent} onChange={val => updateMeta('dateSent', val)} error={attemptedSubmit && data.dateSent && data.dateReturned && data.dateReturned < data.dateSent ? true : false} isRTL={isRTL} isRecentDate={true} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{isRTL ? 'تاريخ الاسترجاع' : 'Date Returned'}</label>
                <CustomDatePicker value={data.dateReturned} onChange={val => updateMeta('dateReturned', val)} error={attemptedSubmit && data.dateSent && data.dateReturned && data.dateReturned < data.dateSent ? true : false} isRTL={isRTL} isRecentDate={true} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{isRTL ? 'قراءة العداد (كم)' : 'KM Reading'}</label>
                <OdometerInput value={data.kmReading} onChange={val => updateMeta('kmReading', val)} error={attemptedSubmit && !data.kmReading.trim() ? true : false} isRTL={isRTL} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{isRTL ? 'الأولوية' : 'Priority'} *</label>
                <div data-error={attemptedSubmit && !data.priority ? "true" : undefined} className={`rounded-xl transition-all h-[46px] ${attemptedSubmit && !data.priority ? 'border border-red-500 bg-red-50 p-1' : ''}`}>
                  {renderRadio([
                    { value: 'A', labelAr: 'أولوية أ', labelEn: 'Priority A', color: 'bg-red-500 border-red-500 text-white' },
                    { value: 'B', labelAr: 'أولوية ب', labelEn: 'Priority B', color: 'bg-amber-500 border-amber-500 text-white' },
                    { value: 'C', labelAr: 'أولوية ج', labelEn: 'Priority C', color: 'bg-emerald-500 border-emerald-500 text-white' },
                  ], data.priority, (val) => updateMeta('priority', val))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Defect Report */}
          <div className="bg-white/80 backdrop-blur-lg rounded-[2rem] p-6 shadow-xl border border-gray-200 space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"><AlertTriangle size={18} /></div>
              <h3 className="text-lg font-black text-gray-900">{isRTL ? 'بطاقة تفاصيل الأعطال' : 'Reported Defect Details'}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{isRTL ? 'العطل المُبلغ عنه' : 'Reported Defect'}</label>
                <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white font-bold transition-all shadow-inner" rows={4}
                       value={data.reportedDefect} onChange={e => updateMeta('reportedDefect', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{isRTL ? 'تفاصيل الإصلاح' : 'Repair Details'}</label>
                <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white font-bold transition-all shadow-inner" rows={4}
                       value={data.repairDetails} onChange={e => updateMeta('repairDetails', e.target.value)} />
              </div>
            </div>
          </div>


        </div>
      )}

      {step === 1 && renderListSection(isRTL ? 'أ. التحقق من إصلاح الأعطال' : 'A. Repair Rectification Verification', isRTL ? 'أ. التحقق من إصلاح الأعطال' : 'A. Repair Rectification Verification', SECTION_A_ITEMS, 'sectionA')}
      {step === 2 && renderListSection(isRTL ? 'ب. الفحوصات التشغيلية بعد الصيانة' : 'B. Post-Maintenance Functional Checks', isRTL ? 'ب. الفحوصات التشغيلية بعد الصيانة' : 'B. Post-Maintenance Functional Checks', SECTION_B_ITEMS, 'sectionB')}
      {step === 3 && (() => {
        return (
        <div className="bg-white/80 backdrop-blur-lg rounded-[2rem] p-6 shadow-xl border border-white/40 space-y-8 animate-fade-in">
          <h3 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-4">{isRTL ? 'القرار النهائي والتوقيع' : 'Final Decision and Sign-Off'}</h3>
          
          <div className="space-y-4">
            <label className="text-sm font-black text-gray-700">{isRTL ? 'الحالة النهائية' : 'Final Status'} *</label>
            <div data-error={attemptedSubmit && !data.finalStatus ? "true" : undefined} className={`rounded-xl transition-all h-[52px] ${attemptedSubmit && !data.finalStatus ? 'border border-red-500 bg-red-50 p-1' : ''}`}>
              {renderRadio([
                { value: 'Accepted', labelAr: 'مقبولة', labelEn: 'Accepted', color: 'bg-emerald-500 border-emerald-500 text-white' },
                { value: 'Conditional Acceptance', labelAr: 'قبول مشروط', labelEn: 'Conditional Acceptance', color: 'bg-amber-500 border-amber-500 text-white' },
                { value: 'Reinspection', labelAr: 'إعادة فحص', labelEn: 'Reinspection', color: 'bg-blue-500 border-blue-500 text-white' },
                { value: 'Rejected', labelAr: 'مرفوضة', labelEn: 'Rejected', color: 'bg-red-500 border-red-500 text-white' },
              ], data.finalStatus, (val) => updateMeta('finalStatus', val))}
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
             <div className="space-y-3">
                <label className="block text-sm font-black text-gray-700">{isRTL ? 'اسم السائق *' : 'Driver Name *'}</label>
                <input type="text" data-error={attemptedSubmit && !data.signatures.driverName ? "true" : undefined} className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 font-bold transition-all shadow-sm ${attemptedSubmit && !data.signatures.driverName ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'}`} value={data.signatures.driverName || ''} onChange={e => updateSignatureName('driver', e.target.value)} />
                
                <SignaturePad 
                  label={isRTL ? 'التوقيع *' : 'Signature *'}
                  initialSignature={data.signatures.driver}
                  onSave={(sig) => updateSignature('driver', sig)} 
                  onClear={() => updateSignature('driver', '')}
                  error={attemptedSubmit && (!data.signatures.driver || data.signatures.driver.length < 500)}
                  isRTL={isRTL}
                />
             </div>
             <div className="space-y-3">
                <label className="block text-sm font-black text-gray-700">{isRTL ? 'اسم المفتش *' : 'Inspector Name *'}</label>
                <input type="text" data-error={attemptedSubmit && !data.signatures.inspectorName ? "true" : undefined} className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 font-bold transition-all shadow-sm ${attemptedSubmit && !data.signatures.inspectorName ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'}`} value={data.signatures.inspectorName || ''} onChange={e => updateSignatureName('inspector', e.target.value)} />

                <SignaturePad 
                  label={isRTL ? 'التوقيع *' : 'Signature *'}
                  initialSignature={data.signatures.inspector}
                  onSave={(sig) => updateSignature('inspector', sig)} 
                  onClear={() => updateSignature('inspector', '')}
                  error={attemptedSubmit && (!data.signatures.inspector || data.signatures.inspector.length < 500)}
                  isRTL={isRTL}
                />
             </div>
             <div className="space-y-3">
                <label className="block text-sm font-black text-gray-700">{isRTL ? 'اسم ممثل الورشة *' : 'Workshop Rep. Name *'}</label>
                <input type="text" data-error={attemptedSubmit && !data.signatures.workshopName ? "true" : undefined} className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 font-bold transition-all shadow-sm ${attemptedSubmit && !data.signatures.workshopName ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'}`} value={data.signatures.workshopName || ''} onChange={e => updateSignatureName('workshop', e.target.value)} />

                <SignaturePad 
                  label={isRTL ? 'التوقيع *' : 'Signature *'}
                  initialSignature={data.signatures.workshop}
                  onSave={(sig) => updateSignature('workshop', sig)} 
                  onClear={() => updateSignature('workshop', '')}
                  error={attemptedSubmit && (!data.signatures.workshop || data.signatures.workshop.length < 500)}
                  isRTL={isRTL}
                />
             </div>
          </div>
        </div>
        );
      })()}

      {step === 4 && (
        <PostMaintenanceReport data={data} isRTL={isRTL} onNewForm={handleReset} onEdit={() => {
          setStep(0);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} />
      )}

            {step < 4 && (
        <div className="flex gap-4 border-t border-gray-300 pt-8 mt-8">
          <button 
            type="button" 
            onClick={handlePrev} 
            className="px-8 py-4 rounded-xl text-gray-400 font-black text-base bg-white border border-gray-300 hover:bg-gray-50 active:scale-95 v-center-cairo"
          >
            {isRTL ? 'السابق' : 'Back'}
          </button>
          
          <button 
            type="button" 
            onClick={handleNext} 
            className="flex-1 py-4 rounded-xl bg-primary-600 text-white font-black text-xl disabled:bg-gray-200 shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-3"
          >
            {step === 3 ? (
              <> 
                <CheckCircle size={24} /> 
                <span className="v-center-cairo">{isRTL ? 'التقرير النهائي' : 'View Report'}</span> 
              </>
            ) : (
              <> 
                <span className="v-center-cairo">{isRTL ? 'التالي' : 'Next'}</span> 
                {isRTL ? <ChevronLeft size={24} /> : <ChevronRight size={24} />} 
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
