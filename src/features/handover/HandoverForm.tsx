import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Truck, User, Hash, MapPin, Gauge, FileText,
  CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight,
  Share2, Clipboard, Check, ArrowLeft,
  FileCheck, MessageSquare
} from 'lucide-react';
import { SignaturePad } from '../../components/SignaturePad';

import { HandoverReport } from './HandoverReport';
import {
  getVehicleCategory, getCategoryConfig, VehicleCategoryConfig, AnswerType,
  VEHICLE_TYPES_OPTIONS as CONFIG_VEHICLE_TYPES
} from './handoverConfig';

// --- Types ---
export interface HandoverItem {
  id: string;
  labelAr: string;
  labelEn: string;
  status: 'good' | 'bad' | null;
  note: string;
  count: string;
  hasCount: boolean;
  answerType: AnswerType;
  answerValue: string;
}

export interface HandoverData {
  personRole: 'sender' | 'receiver';
  personName: string;
  vehiclePlate: string;
  vehicleType: string;
  location: string;
  odometer: string;
  opalExpiry: string;
  ropExpiry: string;
  items: HandoverItem[];
  notes: string;
  signature: string;
  date: string;
  lang: string;
  extraFields: Record<string, string>;
  config: VehicleCategoryConfig;
}

const buildItemsFromConfig = (config: VehicleCategoryConfig): HandoverItem[] =>
  config.items.map(ic => ({
    id: ic.id,
    labelAr: ic.labelAr,
    labelEn: ic.labelEn,
    status: null,
    note: '',
    count: '',
    hasCount: !!ic.hasCount,
    answerType: ic.answerType || 'binary',
    answerValue: '',
  }));

interface Props {
  lang: 'ar' | 'en';
  isRTL: boolean;
  onExit: () => void;
}

export const HandoverForm: React.FC<Props> = ({ lang: appLang, isRTL: appIsRTL, onExit }) => {
  const [formLang, setFormLang] = useState<'ar' | 'en'>(appLang);
  const isRTL = formLang === 'ar';
  
  useEffect(() => {
    setFormLang(appLang);
  }, [appLang]);
  
  // step 0: select action, step 1: info, step 2: checklist & sign, step 3: report
  const [step, setStep] = useState(0);
  const [action, setAction] = useState<'sender' | 'receiver' | null>(null);
  
  const [personName, setPersonName] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleType, setVehicleType] = useState('light_bus');
  const [location, setLocation] = useState('');
  const [odometer, setOdometer] = useState('');
  const [opalExpiry, setOpalExpiry] = useState('');
  const [ropExpiry, setRopExpiry] = useState('');
  const [notes, setNotes] = useState('');
  const [signature, setSignature] = useState('');
  const [extraFields, setExtraFields] = useState<Record<string, string>>({});
  
  const category = getVehicleCategory(vehicleType);
  const config = useMemo(() => getCategoryConfig(category), [category]);
  
  const [items, setItems] = useState<HandoverItem[]>(() => buildItemsFromConfig(config));
  
  useEffect(() => {
    const newConfig = getCategoryConfig(getVehicleCategory(vehicleType));
    setItems(buildItemsFromConfig(newConfig));
    setExtraFields({});
  }, [vehicleType]);
  
  const [uiAlert, setUiAlert] = useState({ show: false, message: '', type: 'warning' as 'warning' | 'fail' });
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  
  const showAlert = (message: string, type: 'warning' | 'fail' = 'warning') => {
    setUiAlert({ show: true, message, type });
    window.setTimeout(() => setUiAlert(p => p.show ? { ...p, show: false } : p), 4500);
  };
  
  const setItemStatus = (id: string, status: 'good' | 'bad' | null) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status, note: status === 'good' ? '' : item.note } : item));
  };

  const setItemNote = (id: string, note: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, note } : item));
  };

  const setItemCount = (id: string, count: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, count } : item));
  };

  const setItemAnswerValue = (id: string, value: string) => {
    const badValues = ['empty', 'dirty', 'missing', 'present_needs_maintenance', 'not_working', 'present_not_working', 'not_available', 'present_incomplete', 'present_expired', 'batt_less_25', 'needs_completion'];
    const status = badValues.includes(value) ? 'bad' : 'good';
    setItems(prev => prev.map(item => item.id === id ? { ...item, answerValue: value, status, note: status === 'good' ? '' : item.note } : item));
  };

  const setExtraField = (id: string, value: string) => {
    setExtraFields(prev => ({ ...prev, [id]: value }));
  };
  
  const handleReset = () => {
    setStep(0);
    setAction(null);
    setPersonName('');
    setVehiclePlate('');
    setLocation('');
    setOdometer('');
    setRopExpiry('');
    setOpalExpiry('');
    setNotes('');
    setSignature('');
    setExtraFields({});
    setItems(getCategoryConfig(getVehicleCategory(vehicleType)).items.map(i => ({
      id: i.id, labelAr: i.labelAr, labelEn: i.labelEn, status: null, note: '',
      hasCount: !!i.hasCount, count: '', answerType: i.answerType || 'binary', answerValue: ''
    })));
  };
  
  const buildFullHandoverData = (): HandoverData => ({
    personRole: action || 'sender',
    personName,
    vehiclePlate,
    vehicleType,
    location,
    odometer,
    opalExpiry,
    ropExpiry,
    notes,
    signature,
    date: new Date().toISOString(),
    lang: formLang,
    extraFields,
    items,
    config,
  });
  
  const validateData = (): boolean => {
    setAttemptedSubmit(true);
    if (!personName.trim()) {
      showAlert(isRTL ? `يرجى إدخال اسم ${action === 'sender' ? 'المسلم' : 'المستلم'}.` : `Please enter ${action === 'sender' ? 'sender' : 'receiver'} name.`);
      return false;
    }
    if (!vehiclePlate.trim()) {
      showAlert(isRTL ? 'يرجى إدخال رقم اللوحة.' : 'Please enter plate number.');
      return false;
    }
    if (!location.trim()) {
      showAlert(isRTL ? 'يرجى إدخال الموقع.' : 'Please enter location.');
      return false;
    }
    if (!odometer.trim()) {
      showAlert(isRTL ? 'يرجى إدخال عداد المسافة.' : 'Please enter odometer reading.');
      return false;
    }
    if (!ropExpiry) {
      showAlert(isRTL ? 'يرجى إدخال تاريخ انتهاء الملكية.' : 'Please enter ROP expiry date.');
      return false;
    }
    if (!opalExpiry) {
      showAlert(isRTL ? `يرجى إدخال ${config.expiryLabel2Ar}.` : `Please enter ${config.expiryLabel2En}.`);
      return false;
    }
    const today = new Date().toISOString().split('T')[0];
    if (ropExpiry < today) {
      showAlert(isRTL ? 'تنبيه: لا يمكن المتابعة، ملكية المركبة منتهية الصلاحية!' : 'Warning: Cannot proceed, vehicle registration is expired!');
      return false;
    }
    if (opalExpiry < today) {
      showAlert(isRTL ? `تنبيه: لا يمكن المتابعة، ${config.expiryLabel2Ar} منتهي الصلاحية!` : `Warning: Cannot proceed, ${config.expiryLabel2En} is expired!`);
      return false;
    }
    if (!signature || signature.length < 5000) {
      showAlert(isRTL ? 'يرجى رسم توقيع واضح وصحيح.' : 'Please draw a clear and valid signature.');
      return false;
    }
    if (items.some(i => i.status === null)) {
      showAlert(isRTL ? 'يرجى الإجابة على جميع عناصر قائمة الفحص.' : 'Please answer all checklist items.');
      return false;
    }
    if (items.some(i => i.status === 'bad' && !i.note.trim())) {
      showAlert(isRTL ? 'يرجى كتابة ملاحظة للعناصر التالفة أو المفقودة.' : 'Please write a note for damaged or missing items.');
      return false;
    }
    if (items.some(i => i.hasCount && i.status === 'good' && !i.count.trim())) {
      showAlert(isRTL ? 'يرجى إدخال العدد لجميع العناصر المتوفرة.' : 'Please enter the count for all available items.');
      return false;
    }
    return true;
  };
  
  const totalSteps = 2;
  const currentStepNum = step === 0 ? 0 : step;
  const progressPercent = step === 0 ? 0 : (currentStepNum / totalSteps) * 100;

  return (
    <div className="space-y-6 animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Toast */}
      {uiAlert.show && typeof document !== 'undefined' && createPortal(
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] w-11/12 max-w-md pointer-events-none no-print animate-fade-in-down">
          <div className={`p-4 rounded-2xl border shadow-2xl font-black text-sm flex items-center gap-3 ${
            uiAlert.type === 'fail'
              ? 'bg-red-50 text-red-800 border-red-300 shadow-red-200'
              : 'bg-amber-50 text-amber-900 border-amber-300 shadow-amber-200'
          }`}>
            <AlertTriangle className={`w-6 h-6 flex-shrink-0 ${uiAlert.type === 'fail' ? 'text-red-600' : 'text-amber-600'}`} />
            <span className="v-center-cairo leading-tight">{uiAlert.message}</span>
          </div>
        </div>,
        document.body
      )}
      
      {/* Progress Bar */}
      <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onExit} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors">
            <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
            {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-primary-600" />
            <span className="text-sm font-black text-gray-800">
              {isRTL ? config.formTitleAr : config.formTitleEn}
            </span>
          </div>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span>{step > 0 ? (isRTL ? `الخطوة ${currentStepNum} من ${totalSteps}` : `Step ${currentStepNum} of ${totalSteps}`) : ''}</span>
          <span>
            {step === 0 && (isRTL ? 'اختيار نوع الفحص' : 'Select Action')}
            {step === 1 && (isRTL ? `بيانات ${action === 'sender' ? config.senderLabelAr : config.receiverLabelAr}` : `${action === 'sender' ? config.senderLabelEn : config.receiverLabelEn} Info`)}
            {step === 2 && (isRTL ? 'التقرير النهائي' : 'Final Report')}
          </span>
        </div>
      </div>
      
      {/* ===== STEP 0: MODE SELECTION ===== */}
      {step === 0 && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in duration-300 py-4">
          <div className="text-center space-y-2 mb-8">
             <h2 className="text-2xl font-black text-gray-800">{isRTL ? 'اختر نوع الإجراء' : 'Select Procedure'}</h2>
             <p className="text-gray-500 font-bold text-sm">{isRTL ? 'الرجاء تحديد العملية المراد تنفيذها لتوثيق حالة المركبة' : 'Please select the operation you want to perform to document vehicle condition'}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <button 
              onClick={() => { setAction('sender'); setStep(1); }}
              className="bg-white rounded-2xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row items-center sm:items-start gap-5 group text-center sm:text-start relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-500"></div>
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-inner group-hover:shadow-blue-500/30">
                <Truck size={30} />
              </div>
              <div className="space-y-2 pt-1">
                <h3 className="text-lg font-black text-gray-800 group-hover:text-blue-700 transition-colors">{isRTL ? 'تسليم مركبة' : 'Handover Vehicle'}</h3>
                <p className="text-xs font-bold text-gray-500 leading-relaxed max-w-[200px] sm:max-w-none">{isRTL ? 'توثيق الحالة العامة للمركبة والتحقق من المستندات والأدوات الأساسية قبل تسليمها.' : 'Document general vehicle condition and verify basic documents and tools before handover.'}</p>
              </div>
            </button>
            <button 
              onClick={() => { setAction('receiver'); setStep(1); }}
              className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row items-center sm:items-start gap-5 group text-center sm:text-start relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-500"></div>
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-inner group-hover:shadow-emerald-500/30">
                <FileCheck size={30} />
              </div>
              <div className="space-y-2 pt-1">
                <h3 className="text-lg font-black text-gray-800 group-hover:text-emerald-700 transition-colors">{isRTL ? 'استلام مركبة' : 'Receive Vehicle'}</h3>
                <p className="text-xs font-bold text-gray-500 leading-relaxed max-w-[200px] sm:max-w-none">{isRTL ? 'مراجعة الحالة العامة للمركبة والتأكد من المستندات والأدوات الأساسية عند استلامها.' : 'Review general vehicle condition and verify basic documents and tools upon receiving.'}</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ===== STEP 1: SENDER/RECEIVER FORM ===== */}
      {step === 1 && action && (
        <div className="space-y-6">
          {/* Vehicle Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg space-y-4">
            <h3 className="text-base font-black text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Truck size={20} className="text-primary-600" />
              {isRTL ? 'بيانات المركبة' : 'Vehicle Information'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">{isRTL ? 'رقم اللوحة *' : 'Plate Number *'}</label>
                <div className="relative">
                  <Hash size={16} className="absolute top-3 left-3 text-gray-400" />
                  <input value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value.toUpperCase())}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-50 text-sm font-bold focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition ${attemptedSubmit && !vehiclePlate.trim() ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">{isRTL ? 'نوع المركبة' : 'Vehicle Type'}</label>
                <select value={vehicleType} onChange={e => setVehicleType(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition">
                  {CONFIG_VEHICLE_TYPES.map(vt => (
                    <option key={vt.value} value={vt.value}>{isRTL ? vt.labelAr : vt.labelEn}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">{isRTL ? 'عداد المسافة (كم) *' : 'Odometer (km) *'}</label>
                <div className="relative">
                  <Gauge size={16} className="absolute top-3 left-3 text-gray-400" />
                  <input type="number" min="0" value={odometer} onChange={e => setOdometer(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-50 text-sm font-bold focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition ${attemptedSubmit && !odometer.trim() ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">{isRTL ? 'الموقع *' : 'Location *'}</label>
                <div className="relative">
                  <MapPin size={16} className="absolute top-3 left-3 text-gray-400" />
                  <input value={location} onChange={e => setLocation(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-50 text-sm font-bold focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition ${attemptedSubmit && !location.trim() ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">{isRTL ? 'تاريخ انتهاء الملكية (ROP) *' : 'ROP Expiry *'}</label>
                <input type="date" value={ropExpiry} onChange={e => setRopExpiry(e.target.value)}
                  className={`w-full py-2.5 px-4 rounded-xl border bg-gray-50 text-sm font-bold focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition ${attemptedSubmit && !ropExpiry ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">{isRTL ? `${config.expiryLabel2Ar} *` : `${config.expiryLabel2En} *`}</label>
                <input type="date" value={opalExpiry} onChange={e => setOpalExpiry(e.target.value)}
                  className={`w-full py-2.5 px-4 rounded-xl border bg-gray-50 text-sm font-bold focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition ${attemptedSubmit && !opalExpiry ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`} />
              </div>
            </div>
          </div>

          {/* Ambulance Extra Fields */}
          {config.extraFields.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg space-y-4">
              <h3 className="text-base font-black text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
                <MapPin size={20} className="text-red-500" />
                {isRTL ? 'بيانات إضافية' : 'Additional Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.extraFields.map(field => (
                  <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">
                      {isRTL ? field.labelAr : field.labelEn}
                      {field.required && ' *'}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea value={extraFields[field.id] || ''} onChange={e => setExtraField(field.id, e.target.value)} rows={3}
                        className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition resize-none" />
                    ) : (
                      <input value={extraFields[field.id] || ''} onChange={e => setExtraField(field.id, e.target.value)}
                        className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Sender Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg space-y-4">
            <h3 className="text-base font-black text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <User size={20} className="text-blue-600" />
              {isRTL ? `بيانات ${action === 'sender' ? config.senderLabelAr : config.receiverLabelAr}` : `${action === 'sender' ? config.senderLabelEn : config.receiverLabelEn} Info`}
            </h3>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">{isRTL ? 'الاسم الكامل *' : 'Full Name *'}</label>
              <input value={personName} onChange={e => setPersonName(e.target.value)}
                className={`w-full py-2.5 px-4 rounded-xl border bg-gray-50 text-sm font-bold focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition ${attemptedSubmit && !personName.trim() ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`} />
            </div>
          </div>
          
          {/* Checklist */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg space-y-4">
            <h3 className="text-base font-black text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <FileCheck size={20} className="text-emerald-600" />
              {isRTL ? 'قائمة الفحص والمعدات' : 'Inspection & Equipment Checklist'}
            </h3>
            <div className="space-y-3">
              {items.map(item => {
                const renderAnswerUI = () => {
                  if (item.answerType === 'level') {
                    const levels = [
                      { val: 'full', labelAr: 'ممتلئ (100%)', labelEn: 'Full (100%)', color: 'bg-emerald-500' },
                      { val: '3_4', labelAr: '3/4', labelEn: '3/4', color: 'bg-emerald-400' },
                      { val: '1_2', labelAr: 'نصف (50%)', labelEn: 'Half (50%)', color: 'bg-amber-400' },
                      { val: '1_4', labelAr: '1/4', labelEn: '1/4', color: 'bg-orange-400' },
                      { val: 'empty', labelAr: 'فارغ', labelEn: 'Empty', color: 'bg-red-500' },
                    ];
                    return (
                      <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                        {levels.map(l => (
                          <button key={l.val} type="button" onClick={() => setItemAnswerValue(item.id, l.val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${item.answerValue === l.val ? `${l.color} text-white shadow-md` : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'}`}>
                            {isRTL ? l.labelAr : l.labelEn}
                          </button>
                        ))}
                      </div>
                    );
                  }
                  
                  if (item.answerType === 'rating') {
                    const ratings = [
                      { val: 'clean', labelAr: 'نظيفة', labelEn: 'Clean', color: 'bg-emerald-500' },
                      { val: 'acceptable', labelAr: 'مقبولة', labelEn: 'Acceptable', color: 'bg-amber-500' },
                      { val: 'dirty', labelAr: 'تحتاج غسيل', labelEn: 'Needs Wash', color: 'bg-red-500' },
                    ];
                    return (
                      <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                        {ratings.map(r => (
                          <button key={r.val} type="button" onClick={() => setItemAnswerValue(item.id, r.val)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${item.answerValue === r.val ? `${r.color} text-white shadow-md` : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'}`}>
                            {isRTL ? r.labelAr : r.labelEn}
                          </button>
                        ))}
                      </div>
                    );
                  }

                  if (item.answerType === 'battery_level') {
                    const levels = [
                      { val: 'batt_100', labelAr: '100%', labelEn: '100%', color: 'bg-emerald-500' },
                      { val: 'batt_75', labelAr: '75%', labelEn: '75%', color: 'bg-emerald-400' },
                      { val: 'batt_50', labelAr: '50%', labelEn: '50%', color: 'bg-amber-400' },
                      { val: 'batt_25', labelAr: '25%', labelEn: '25%', color: 'bg-orange-400' },
                      { val: 'batt_less_25', labelAr: 'أقل من 25%', labelEn: '< 25%', color: 'bg-red-500' },
                    ];
                    return (
                      <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                        {levels.map(l => (
                          <button key={l.val} type="button" onClick={() => setItemAnswerValue(item.id, l.val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${item.answerValue === l.val ? `${l.color} text-white shadow-md` : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'}`}>
                            {isRTL ? l.labelAr : l.labelEn}
                          </button>
                        ))}
                      </div>
                    );
                  }

                  if (item.answerType === 'maintenance_state_1') {
                    const options = [
                      { val: 'present_complete', labelAr: 'موجودة ومكتملة', labelEn: 'Present & Complete', color: 'bg-emerald-500' },
                      { val: 'present_needs_maintenance', labelAr: 'موجودة وتحتاج صيانة', labelEn: 'Present, Needs Maint.', color: 'bg-amber-500' },
                      { val: 'missing', labelAr: 'غير موجودة', labelEn: 'Missing', color: 'bg-red-500' },
                    ];
                    return (
                      <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                        {options.map(opt => (
                          <button key={opt.val} type="button" onClick={() => setItemAnswerValue(item.id, opt.val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${item.answerValue === opt.val ? `${opt.color} text-white shadow-md` : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'}`}>
                            {isRTL ? opt.labelAr : opt.labelEn}
                          </button>
                        ))}
                      </div>
                    );
                  }

                  if (item.answerType === 'maintenance_state_2') {
                    const options = [
                      { val: 'present_good', labelAr: 'موجود وسليم', labelEn: 'Present & Good', color: 'bg-emerald-500' },
                      { val: 'present_needs_maintenance', labelAr: 'موجود ويحتاج صيانة', labelEn: 'Present, Needs Maint.', color: 'bg-amber-500' },
                      { val: 'missing', labelAr: 'غير موجود', labelEn: 'Missing', color: 'bg-red-500' },
                    ];
                    return (
                      <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                        {options.map(opt => (
                          <button key={opt.val} type="button" onClick={() => setItemAnswerValue(item.id, opt.val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${item.answerValue === opt.val ? `${opt.color} text-white shadow-md` : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'}`}>
                            {isRTL ? opt.labelAr : opt.labelEn}
                          </button>
                        ))}
                      </div>
                    );
                  }

                  if (item.answerType === 'working_state_1') {
                    const options = [
                      { val: 'working', labelAr: 'يعمل', labelEn: 'Working', color: 'bg-emerald-500' },
                      { val: 'not_working', labelAr: 'لا يعمل', labelEn: 'Not Working', color: 'bg-red-500' },
                      { val: 'not_available', labelAr: 'غير متوفر', labelEn: 'Not Available', color: 'bg-gray-500' },
                    ];
                    return (
                      <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                        {options.map(opt => (
                          <button key={opt.val} type="button" onClick={() => setItemAnswerValue(item.id, opt.val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${item.answerValue === opt.val ? `${opt.color} text-white shadow-md` : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'}`}>
                            {isRTL ? opt.labelAr : opt.labelEn}
                          </button>
                        ))}
                      </div>
                    );
                  }

                  if (item.answerType === 'working_state_2') {
                    const options = [
                      { val: 'present_working', labelAr: 'موجود ويعمل', labelEn: 'Present & Working', color: 'bg-emerald-500' },
                      { val: 'present_not_working', labelAr: 'موجود ولا يعمل', labelEn: 'Present & Not Working', color: 'bg-amber-500' },
                      { val: 'missing', labelAr: 'غير موجود', labelEn: 'Missing', color: 'bg-red-500' },
                    ];
                    return (
                      <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                        {options.map(opt => (
                          <button key={opt.val} type="button" onClick={() => setItemAnswerValue(item.id, opt.val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${item.answerValue === opt.val ? `${opt.color} text-white shadow-md` : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'}`}>
                            {isRTL ? opt.labelAr : opt.labelEn}
                          </button>
                        ))}
                      </div>
                    );
                  }

                  if (item.answerType === 'availability_binary') {
                    const options = [
                      { val: 'present', labelAr: 'موجودة', labelEn: 'Present', color: 'bg-emerald-500' },
                      { val: 'missing', labelAr: 'غير موجودة', labelEn: 'Missing', color: 'bg-red-500' },
                    ];
                    return (
                      <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                        {options.map(opt => (
                          <button key={opt.val} type="button" onClick={() => setItemAnswerValue(item.id, opt.val)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${item.answerValue === opt.val ? `${opt.color} text-white shadow-md` : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'}`}>
                            {isRTL ? opt.labelAr : opt.labelEn}
                          </button>
                        ))}
                      </div>
                    );
                  }

                  if (item.answerType === 'availability_binary_masculine') {
                    const options = [
                      { val: 'present', labelAr: 'موجود', labelEn: 'Present', color: 'bg-emerald-500' },
                      { val: 'missing', labelAr: 'غير موجود', labelEn: 'Missing', color: 'bg-red-500' },
                    ];
                    return (
                      <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                        {options.map(opt => (
                          <button key={opt.val} type="button" onClick={() => setItemAnswerValue(item.id, opt.val)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${item.answerValue === opt.val ? `${opt.color} text-white shadow-md` : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'}`}>
                            {isRTL ? opt.labelAr : opt.labelEn}
                          </button>
                        ))}
                      </div>
                    );
                  }

                  if (item.answerType === 'first_aid_state') {
                    const options = [
                      { val: 'present_complete', labelAr: 'موجودة ومكتملة', labelEn: 'Present & Complete', color: 'bg-emerald-500' },
                      { val: 'present_incomplete', labelAr: 'موجودة وغير مكتملة', labelEn: 'Present, Incomplete', color: 'bg-amber-500' },
                      { val: 'missing', labelAr: 'غير موجودة', labelEn: 'Missing', color: 'bg-red-500' },
                    ];
                    return (
                      <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                        {options.map(opt => (
                          <button key={opt.val} type="button" onClick={() => setItemAnswerValue(item.id, opt.val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${item.answerValue === opt.val ? `${opt.color} text-white shadow-md` : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'}`}>
                            {isRTL ? opt.labelAr : opt.labelEn}
                          </button>
                        ))}
                      </div>
                    );
                  }

                  if (item.answerType === 'first_aid_state_ambulance') {
                    const options = [
                      { val: 'complete', labelAr: 'مكتملة', labelEn: 'Complete', color: 'bg-emerald-500' },
                      { val: 'needs_completion', labelAr: 'تحتاج استكمال', labelEn: 'Needs Completion', color: 'bg-amber-500' },
                      { val: 'missing', labelAr: 'غير موجودة', labelEn: 'Missing', color: 'bg-red-500' },
                    ];
                    return (
                      <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                        {options.map(opt => (
                          <button key={opt.val} type="button" onClick={() => setItemAnswerValue(item.id, opt.val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${item.answerValue === opt.val ? `${opt.color} text-white shadow-md` : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'}`}>
                            {isRTL ? opt.labelAr : opt.labelEn}
                          </button>
                        ))}
                      </div>
                    );
                  }

                  if (item.answerType === 'fire_extinguisher_state') {
                    const options = [
                      { val: 'present_valid', labelAr: 'موجودة وصالحة', labelEn: 'Present & Valid', color: 'bg-emerald-500' },
                      { val: 'present_expired', labelAr: 'موجودة ومنتهية الصلاحية', labelEn: 'Present, Expired', color: 'bg-amber-500' },
                      { val: 'missing', labelAr: 'غير موجودة', labelEn: 'Missing', color: 'bg-red-500' },
                    ];
                    return (
                      <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                        {options.map(opt => (
                          <button key={opt.val} type="button" onClick={() => setItemAnswerValue(item.id, opt.val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${item.answerValue === opt.val ? `${opt.color} text-white shadow-md` : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'}`}>
                            {isRTL ? opt.labelAr : opt.labelEn}
                          </button>
                        ))}
                      </div>
                    );
                  }

                  if (item.answerType === 'count') {
                    return (
                      <div className="flex items-center gap-2 mt-2 md:mt-0">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isRTL ? 'العدد' : 'Count'}</label>
                        <input type="number" min="0" value={item.count} 
                          onChange={e => {
                            setItemCount(item.id, e.target.value);
                            setItemStatus(item.id, e.target.value !== '' ? 'good' : null);
                          }}
                          placeholder={isRTL ? '0' : '0'}
                          className={`w-20 py-1.5 px-3 rounded-lg border text-xs font-bold focus:ring-2 focus:ring-primary-300 outline-none text-center transition ${attemptedSubmit && item.status === null ? 'border-red-500 bg-red-50/50' : 'border-gray-300 bg-white'}`} 
                        />
                      </div>
                    );
                  }

                  // Default binary
                  return (
                    <div className="flex items-center gap-2 shrink-0 mt-2 md:mt-0">
                      <button type="button" onClick={() => setItemStatus(item.id, 'good')}
                        className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all ${item.status === 'good' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-100'}`}>
                        <CheckCircle size={14} /> {isRTL ? 'سليم / متوفر' : 'Good / Present'}
                      </button>
                      <button type="button" onClick={() => setItemStatus(item.id, 'bad')}
                        className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all ${item.status === 'bad' ? 'bg-red-500 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-100'}`}>
                        <XCircle size={14} /> {isRTL ? 'تالف / مفقود' : 'Bad / Missing'}
                      </button>
                    </div>
                  );
                };

                return (
                  <div key={item.id} className={`p-4 rounded-xl border transition-all duration-200 ${attemptedSubmit && item.status === null ? 'border-red-400 bg-red-50/50 shadow-[0_0_0_1px_rgba(248,113,113,0.5)]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <span className="text-sm font-black text-gray-800 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary-400"></div>
                        {isRTL ? item.labelAr : item.labelEn}
                      </span>
                      {renderAnswerUI()}
                    </div>
                    
                    {/* Count field for legacy binary items with hasCount */}
                    {item.answerType === 'binary' && item.hasCount && item.status === 'good' && (
                      <div className="mt-3 animate-fade-in bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">{isRTL ? 'العدد *' : 'Count *'}</label>
                        <input type="number" min="0" value={item.count} onChange={e => setItemCount(item.id, e.target.value)}
                          placeholder={isRTL ? 'أدخل العدد' : 'Enter count'}
                          className={`w-32 py-1.5 px-3 rounded-lg border text-xs font-bold focus:ring-2 focus:ring-primary-300 outline-none transition ${attemptedSubmit && !item.count.trim() ? 'border-red-500 bg-white' : 'border-gray-300 bg-white'}`} />
                      </div>
                    )}
                    
                    {/* Note for bad items */}
                    {item.status === 'bad' && (
                      <div className="mt-3 animate-fade-in">
                        <input type="text"
                          placeholder={isRTL ? 'يرجى كتابة ملاحظة (سبب التلف أو الفقدان) *' : 'Please write a note (reason for damage/loss) *'}
                          value={item.note} onChange={e => setItemNote(item.id, e.target.value)}
                          className={`w-full py-2 px-3 rounded-lg border text-xs font-bold focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition ${attemptedSubmit && !item.note.trim() ? 'border-red-500 bg-white' : 'border-gray-300 bg-white'}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Notes */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg space-y-3">
            <h3 className="text-base font-black text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <MessageSquare size={20} className="text-amber-600" />
              {isRTL ? `ملاحظات ${action === 'sender' ? config.senderLabelAr : config.receiverLabelAr}` : `${action === 'sender' ? config.senderLabelEn : config.receiverLabelEn} Remarks`}
            </h3>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition resize-none" />
          </div>
          
          {/* Signature */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg">
            <SignaturePad
              label={isRTL ? `توقيع ${action === 'sender' ? config.senderLabelAr : config.receiverLabelAr} *` : `${action === 'sender' ? config.senderLabelEn : config.receiverLabelEn} Signature *`}
              isRTL={isRTL}
              onSave={setSignature}
              onClear={() => setSignature('')}
              error={attemptedSubmit && !signature}
            />
          </div>
          
          {/* Next Button */}
          <button
            onClick={() => { if (validateData()) setStep(2); }}
            className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl font-black text-base shadow-xl shadow-primary-600/20 hover:shadow-2xl hover:shadow-primary-600/30 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-3">
            {isRTL ? 'التالي: عرض التقرير النهائي' : 'Next: View Final Report'}
            {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      )}
      
      {/* ===== STEP 2: FINAL REPORT ===== */}
      {step === 2 && (
        <div className="space-y-6">
          <HandoverReport data={buildFullHandoverData()} isRTL={isRTL} />
          
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto no-print pt-4 border-t border-gray-200">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-black text-sm shadow-sm hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isRTL ? 'تعديل البيانات' : 'Edit Information'}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-3.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-black text-sm shadow-sm hover:bg-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isRTL ? 'فحص جديد' : 'New Inspection'}
            </button>
            <button
              onClick={onExit}
              className="flex-1 py-3.5 bg-gray-800 text-white rounded-xl font-black text-sm shadow-sm hover:bg-gray-900 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
