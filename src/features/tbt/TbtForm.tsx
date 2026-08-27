import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, MapPin, Users, Clock, 
  Calendar, FileText, CheckCircle2, AlertTriangle,
  ArrowRight, ArrowLeft, Trash2, Plus, PenTool, ArrowLeftRight
} from 'lucide-react';
import { TBT_TOPICS } from './tbtConfig';
import { SignaturePad } from '../../components/SignaturePad';
import { CustomDatePicker } from '../../components/CustomDatePicker';
import { CustomTimePicker } from '../../components/CustomTimePicker';
import { scrollToFirstError } from '../../utils/validationScroll';
import { TbtReport } from './TbtReport';

export interface DriverInfo {
  id: string;
  name: string;
  signature: string;
}

export interface TbtData {
  date: string;
  time: string;
  type: 'face_to_face' | 'remote';
  managerName: string;
  routeFrom: string;
  routeTo: string;
  drivers: DriverInfo[];
  selectedTopicId: string;
  otherTopicDetails: string;
  notes: string;
  managerSignature: string;
}

interface Props {
  isRTL: boolean;
  lang: string;
  onExit: () => void;
}

export const TbtForm: React.FC<Props> = ({ isRTL, onExit }) => {
  const [showReport, setShowReport] = useState(false);
  const [data, setData] = useState<TbtData>(() => {
    try {
      const saved = localStorage.getItem('tbt_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.timestamp && (Date.now() - parsed.timestamp < 60 * 60 * 1000)) {
          return parsed.data;
        }
      }
    } catch(e) {}
    const now = new Date();
    return {
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      type: 'face_to_face',
      managerName: '',
      routeFrom: '',
      routeTo: '',
      drivers: [{ id: Date.now().toString(), name: '', signature: '' }],
      selectedTopicId: '',
      otherTopicDetails: '',
      notes: '',
      managerSignature: ''
    };
  });

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem('tbt_session', JSON.stringify({ data, timestamp: Date.now() }));
    }, 1000);
    return () => clearTimeout(handler);
  }, [data]);
  const [alertMsg, setAlertMsg] = useState('');

  const t = (ar: string, en: string) => isRTL ? ar : en;

  // Auto-update time on load if not set
  useEffect(() => {
    const timer = setInterval(() => {
      if (!attemptedSubmit && !showReport && data.managerName === '') {
        const now = new Date();
        setData(prev => ({ ...prev, time: now.toTimeString().slice(0, 5) }));
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [attemptedSubmit, showReport, data.managerName]);

  const addDriver = () => {
    setData(prev => ({
      ...prev,
      drivers: [...prev.drivers, { id: Date.now().toString(), name: '', signature: '' }]
    }));
  };

  const removeDriver = (id: string) => {
    setData(prev => ({
      ...prev,
      drivers: prev.drivers.filter(d => d.id !== id)
    }));
  };

  const updateDriver = (id: string, field: keyof DriverInfo, value: string) => {
    setData(prev => ({
      ...prev,
      drivers: prev.drivers.map(d => d.id === id ? { ...d, [field]: value } : d)
    }));
  };

  const showAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  const validateForm = () => {
    setAttemptedSubmit(true);
    let isValid = true;
    
    if (!data.date) isValid = false;
    
    if (data.date > new Date().toISOString().split('T')[0]) {
      showAlert(t('لا يمكن تسجيل استمارة بتاريخ مستقبلي.', 'Cannot submit form with a future date.'));
      return false;
    }
    
    if (!data.routeFrom.trim() || !data.routeTo.trim()) isValid = false;

    // Validate Topic
    if (!data.selectedTopicId) isValid = false;
    
    if (data.selectedTopicId === 'other' && !data.otherTopicDetails.trim()) isValid = false;
    
    // Validate Drivers
    if (data.drivers.length === 0) isValid = false;
    for (let i = 0; i < data.drivers.length; i++) {
      if (!data.drivers[i].name.trim()) isValid = false;
      if (data.type === 'face_to_face' && (!data.drivers[i].signature || data.drivers[i].signature.length < 500)) isValid = false;
    }

    // Validate Manager
    if (!data.managerName.trim()) isValid = false;
    
    if (!data.managerSignature || data.managerSignature.length < 500) isValid = false;

    if (!isValid) {
      scrollToFirstError();
      return false;
    }

    return true;
  };

  const handleGenerateReport = () => {
    if (validateForm()) {
      setShowReport(true);
    }
  };

  if (showReport) {
    return (
      <TbtReport 
        data={data}
        isRTL={isRTL}
        onEdit={() => setShowReport(false)}
      />
    );
  }

  return (
    <div className="space-y-6 relative pb-20 animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <button type="button" onClick={onExit} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors">
            <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
            {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
          <div className="flex items-center gap-2">
            <ClipboardCheck size={18} className="text-primary-600" />
            <span className="text-sm font-black text-gray-800">
              {t('استمارة TBT', 'TBT Form')}
            </span>
          </div>
        </div>
      </div>

      {alertMsg && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] bg-red-50 border-2 border-red-200 text-red-700 px-8 py-6 rounded-2xl font-black text-lg shadow-2xl flex flex-col items-center gap-3 animate-fade-in text-center max-w-[85vw] backdrop-blur-sm">
          <AlertTriangle size={36} className="text-red-500 mb-1 animate-pulse" />
          {alertMsg}
        </div>
      )}

      {/* Main Form */}
      <div className="space-y-8">
        
        {/* Section 1: Basic Info */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-gray-800 v-center-cairo justify-start px-2">
            {t('البيانات الأساسية', 'Basic Information')}
          </h2>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('التاريخ', 'Date')}</label>
              <CustomDatePicker
                value={data.date}
                onChange={val => setData({...data, date: val})}
                error={attemptedSubmit && !data.date}
                isRTL={isRTL}
              />
              {attemptedSubmit && !data.date && <div data-error="true" className="hidden"></div>}
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('الوقت', 'Time')}</label>
              <CustomTimePicker
                value={data.time}
                onChange={val => setData({...data, time: val})}
                error={attemptedSubmit && !data.time}
                isRTL={isRTL}
              />
              {attemptedSubmit && !data.time && <div data-error="true" className="hidden"></div>}
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('نوع الاجتماع', 'TBT Type')}</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={() => setData({...data, type: 'face_to_face'})} className={`flex-1 p-3.5 rounded-xl border-2 font-black transition-all flex items-center justify-center gap-2 ${data.type === 'face_to_face' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>
                  <Users size={20} />
                  {t('حضوري', 'In-Person')}
                </button>
                <button type="button" onClick={() => setData({...data, type: 'remote'})} className={`flex-1 p-3.5 rounded-xl border-2 font-black transition-all flex items-center justify-center gap-2 ${data.type === 'remote' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>
                  <MapPin size={20} />
                  {t('عن بُعد', 'Remote')}
                </button>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('مسار الرحلة', 'Journey Route')}</label>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <input type="text" data-error={attemptedSubmit && !data.routeFrom ? "true" : undefined} placeholder={t('من (نقطة الانطلاق)', 'From (Starting Point)')} value={data.routeFrom} onChange={e => setData({...data, routeFrom: e.target.value})} className={`w-full p-3.5 border rounded-xl outline-none font-bold text-base transition-all duration-300 ${attemptedSubmit && !data.routeFrom ? 'border-red-500 bg-red-50 focus:ring-4 focus:ring-red-500/20' : 'border-gray-300 bg-gray-50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white'}`} />
                <ArrowLeftRight size={20} className="text-gray-400 hidden md:block" />
                <input type="text" data-error={attemptedSubmit && !data.routeTo ? "true" : undefined} placeholder={t('إلى (الوجهة)', 'To (Destination)')} value={data.routeTo} onChange={e => setData({...data, routeTo: e.target.value})} className={`w-full p-3.5 border rounded-xl outline-none font-bold text-base transition-all duration-300 ${attemptedSubmit && !data.routeTo ? 'border-red-500 bg-red-50 focus:ring-4 focus:ring-red-500/20' : 'border-gray-300 bg-gray-50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white'}`} />
              </div>
            </div>

            </div>
          </div>
        </section>

        {/* Section 2: Topic Selection & Discussion */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-gray-800 v-center-cairo justify-start">
            {t('موضوع السلامة', 'Discussion Topic')}
          </h2>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-300 space-y-6">
            <div className="space-y-4">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('اختر الموضوع *', 'Select Topic *')}</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {TBT_TOPICS.map(topic => (
                  <button type="button"
                    key={topic.id}
                    onClick={() => setData({...data, selectedTopicId: topic.id})}
                    className={`p-4 rounded-xl border-2 text-start font-black transition-all flex items-center justify-between group ${data.selectedTopicId === topic.id ? 'border-primary-600 bg-primary-50 text-primary-800' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-white hover:border-primary-300'}`}
                  >
                    <span className="text-sm">{isRTL ? topic.categoryAr : topic.categoryEn}</span>
                    {data.selectedTopicId === topic.id && <CheckCircle2 size={18} className="text-primary-600" />}
                  </button>
                ))}
              </div>
              {attemptedSubmit && !data.selectedTopicId && (
                 <p data-error="true" className="text-red-500 text-xs font-bold mt-2">{t('يجب اختيار موضوع واحد على الأقل.', 'You must select at least one topic.')}</p>
              )}
            </div>

            {/* Other Topic Input */}
            {data.selectedTopicId === 'other' && (
              <div className="animate-fade-in space-y-2 mt-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('تفاصيل الموضوع الإضافي *', 'Other Topic Details *')}</label>
                <textarea 
                  value={data.otherTopicDetails}
                  onChange={e => setData({...data, otherTopicDetails: e.target.value})}
                  data-error={attemptedSubmit && !data.otherTopicDetails.trim() ? "true" : undefined}
                  placeholder={t('اكتب تفاصيل الموضوع الذي تمت مناقشته...', 'Type the details of the discussed topic...')}
                  className={`w-full p-3.5 border rounded-xl font-bold transition-all outline-none min-h-[100px] resize-y ${attemptedSubmit && !data.otherTopicDetails.trim() ? 'border-red-500 bg-red-50 focus:ring-4 focus:ring-red-500/20' : 'border-gray-300 bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'}`}
                />
              </div>
            )}

            {/* Topic Details Preview */}
            {data.selectedTopicId && data.selectedTopicId !== 'other' && (
              <div className="mt-4 bg-gray-50 text-gray-900 p-6 rounded-2xl animate-fade-in border border-gray-200 shadow-sm">
                {(() => {
                  const topic = TBT_TOPICS.find(t => t.id === data.selectedTopicId);
                  if (!topic) return null;
                  const intro = isRTL ? topic.introAr : topic.introEn;
                  const points = isRTL ? topic.pointsAr : topic.pointsEn;
                  const incidents = isRTL ? topic.incidentsAr : topic.incidentsEn;
                  const takeaway = isRTL ? topic.takeawayAr : topic.takeawayEn;

                  return (
                    <div className="space-y-6">
                      {intro && (
                        <div>
                          <h3 className="text-[14px] font-black mb-2 text-primary-700 border-b border-primary-100 pb-1">{isRTL ? 'المقدمة' : 'Introduction'}</h3>
                          <p className="text-sm font-bold text-gray-700 leading-relaxed">{intro}</p>
                        </div>
                      )}

                      {points && points.length > 0 && (
                        <div>
                          <h3 className="text-[14px] font-black mb-3 text-primary-700 border-b border-primary-100 pb-1">{isRTL ? 'النقاط الرئيسية' : 'Key Points'}</h3>
                          <ul className="space-y-3">
                            {points.map((point, idx) => (
                              <li key={idx} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                <span className="font-black text-gray-900 block mb-1 text-sm">{point.title}</span>
                                <span className="text-sm font-bold text-gray-600 block leading-relaxed">{point.desc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {incidents && incidents.length > 0 && (
                        <div>
                          <h3 className="text-[14px] font-black mb-3 text-amber-700 border-b border-amber-100 pb-1">{isRTL ? 'حوادث سابقة للنقاش' : 'Previous Incidents'}</h3>
                          <ul className="space-y-2 list-disc list-inside">
                            {incidents.map((inc, idx) => (
                              <li key={idx} className="text-sm font-bold text-gray-700 leading-relaxed">{inc}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {takeaway && (
                        <div className="bg-primary-50 p-4 rounded-xl border border-primary-100">
                          <h3 className="text-[14px] font-black mb-2 text-primary-800 flex items-center gap-2">
                            <CheckCircle2 size={18} />
                            {isRTL ? 'الرسالة الأساسية' : 'Key Takeaway'}
                          </h3>
                          <p className="text-sm font-bold text-primary-900 leading-relaxed">{takeaway}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="space-y-2 pt-4 border-t border-gray-100 mt-4">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('ملاحظات إضافية (اختياري)', 'Additional Notes (Optional)')}</label>
              <textarea 
                value={data.notes}
                onChange={e => setData({...data, notes: e.target.value})}
                placeholder={t('اكتب أي ملاحظات أو تعليمات إضافية هنا...', 'Type any additional notes or instructions here...')}
                className="w-full p-3.5 border border-gray-300 bg-gray-50 rounded-xl font-bold focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all outline-none min-h-[100px] resize-y"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Drivers */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-gray-800 v-center-cairo justify-start">{t('السائقين', 'Participants (Drivers)')}</h2>
            <button type="button" onClick={addDriver} className="px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              <Plus size={16} /> {t('إضافة سائق', 'Add Driver')}
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-300 space-y-4">
            {data.drivers.map((driver, idx) => (
              <div key={driver.id} className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-4 relative">
                {data.drivers.length > 1 && (
                  <button type="button" onClick={() => removeDriver(driver.id)} className="absolute top-4 rtl:left-4 ltr:right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                )}
                
                <div className="space-y-2 max-w-md">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">{t(`السائق رقم ${idx + 1}`, `Driver #${idx + 1}`)}</label>
                  <input type="text" data-error={attemptedSubmit && !driver.name ? "true" : undefined} placeholder={t('اسم السائق', 'Driver Name')} value={driver.name} onChange={e => updateDriver(driver.id, 'name', e.target.value)} className={`w-full p-3.5 border rounded-xl outline-none font-bold text-base transition-all duration-300 ${attemptedSubmit && !driver.name ? 'border-red-500 bg-red-50 focus:ring-4 focus:ring-red-500/20' : 'border-gray-300 bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white'}`} />
                </div>

                {data.type === 'face_to_face' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <SignaturePad
                      label={t(`توقيع ${driver.name || 'السائق'} *`, `Signature of ${driver.name || 'Driver'} *`)}
                      onSave={(sig) => updateDriver(driver.id, 'signature', sig)}
                      onClear={() => updateDriver(driver.id, 'signature', '')}
                      error={attemptedSubmit && !driver.signature}
                      isRTL={isRTL}
                    />
                  </div>
                )}
              </div>
            ))}
            
            {data.type === 'remote' && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl flex items-start gap-3 text-sm font-bold mt-2">
                <div className="mt-0.5"><MapPin size={18} /></div>
                <p>{t('الاجتماع تم عن بُعد، لا يوجد تواقيع للسائقين', 'Since the meeting is remote, physical driver signatures are not required.')}</p>
              </div>
            )}
          </div>
        </section>

        {/* Section 4: Manager Approval */}
        <section className="space-y-4">
          <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2 border-b-2 border-gray-100 pb-2">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full inline-block"></span>
            {t('اعتماد مسؤول الرحلة', 'Journey Manager Approval')}
          </h3>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-300 space-y-6">
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('اسم مسؤول الرحلة *', 'Journey Manager Name *')}</label>
              <input type="text" data-error={attemptedSubmit && !data.managerName ? "true" : undefined} placeholder={t('اكتب اسم المسؤول...', 'Enter manager name...')} value={data.managerName} onChange={e => setData({...data, managerName: e.target.value})} className={`w-full p-3.5 border rounded-xl outline-none font-bold text-base transition-all duration-300 ${attemptedSubmit && !data.managerName ? 'border-red-500 bg-red-50 focus:ring-4 focus:ring-red-500/20' : 'border-gray-300 bg-gray-50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white'}`} />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <SignaturePad
                label={t('توقيع مسؤول الرحلة *', 'Journey Manager Signature *')}
                onSave={(sig) => setData({...data, managerSignature: sig})}
                onClear={() => setData({...data, managerSignature: ''})}
                error={attemptedSubmit && !data.managerSignature}
                isRTL={isRTL}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Action Area */}
      <div className="pt-6">
        <button type="button"
          onClick={handleGenerateReport}
          className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-lg transition-all flex items-center justify-center gap-3"
        >
          {t('اعتماد وإنشاء التقرير', 'Approve & Generate Report')}
        </button>
      </div>

    </div>
  );
};
