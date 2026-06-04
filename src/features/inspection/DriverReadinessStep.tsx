import React from 'react';
import { ShieldCheck, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { InspectionData } from '../../types';
import { READINESS_QUESTIONS, TBT_TOPICS } from '../../constants';

interface DriverReadinessStepProps {
  t: any;
  isRTL: boolean;
  data: InspectionData;
  setData: React.Dispatch<React.SetStateAction<InspectionData>>;
  attemptedStep3: boolean;
}

/**
 * DriverReadinessStep renders Step 3 of the inspection process: Driver Readiness Questionnaire.
 * Includes 10 safety/fatigue questions and a final confirmation check.
 */
export const DriverReadinessStep: React.FC<DriverReadinessStepProps> = ({
  t,
  isRTL,
  data,
  setData,
  attemptedStep3,
}) => {
  const [isTbtModalOpen, setIsTbtModalOpen] = React.useState(false);
  
  const handleReadinessAnswer = (id: string, val: boolean) => {
    setData((p) => {
      const answers = { ...p.readiness.answers, [id]: val };
      let status: 'ready' | 'not_ready' = 'ready';
      
      // If any critical question is answered with "no" (false), status is marked as not_ready
      READINESS_QUESTIONS.forEach(q => { 
        if (answers[q.id] === false && q.critical) {
          status = 'not_ready'; 
        }
      });
      
      return { 
        ...p, 
        readiness: { ...p.readiness, answers, status } 
      };
    });
  };

  React.useEffect(() => {
    if (!data.readiness.tbtTopic) {
      const randomTopic = TBT_TOPICS[Math.floor(Math.random() * TBT_TOPICS.length)];
      setData((p) => ({
        ...p,
        readiness: { ...p.readiness, tbtTopic: randomTopic }
      }));
    }
  }, [data.readiness.tbtTopic, setData]);

  return (
    <div className="space-y-6">
       <h2 className="text-lg font-black text-gray-800 border-b border-gray-400 pb-3 v-center-cairo justify-start">
         {t.driver_readiness}
       </h2>
       
       {/* Instruction Banner */}
       <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-400 shadow-2xl shadow-primary-50/50 relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary-50/50 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-start">
             <div className="p-5 bg-primary-600 text-white rounded-3xl shadow-xl shadow-primary-200 ring-8 ring-primary-50 flex-shrink-0 animate-bounce-slow">
                <ShieldCheck size={36} />
             </div>
             <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-100">
                   <AlertCircle size={14}/>
                   <span>{isRTL ? "إرشادات السلامة والوعي" : "Safety & Awareness Guidelines"}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-tight">
                   {isRTL ? "تقييم جاهزية السائق قبل الرحلة" : "Pre-trip Driver Readiness Assessment"}
                </h3>
                <p className="text-sm md:text-base font-bold text-gray-500 leading-relaxed max-w-3xl">
                  {t.readiness_declaration_text}
                </p>
             </div>
          </div>
       </div>

       {/* Question List */}
       <div className="grid grid-cols-1 gap-4">
          {READINESS_QUESTIONS.map(q => {
             const unanswered = typeof data.readiness.answers[q.id] !== 'boolean';
             return (
             <div
               id={`readiness-${q.id}`}
               key={q.id}
               data-error={attemptedStep3 && unanswered ? 'true' : undefined}
               className={`bg-white p-5 rounded-2xl shadow-sm border transition-colors group ${
                 attemptedStep3 && unanswered ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-primary-100'
               }`}
             >
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                   <div className="p-3 bg-primary-50 rounded-xl text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all w-fit">
                     {(() => { const Icon = q.icon as React.ElementType; return <Icon size={22} />; })()}
                   </div>
                   <div className="flex-1">
                      <p className="font-bold text-base text-gray-800 leading-tight v-center-cairo justify-start">
                        {t[q.key as keyof typeof t]}
                      </p>
                   </div>
                   <div className="flex gap-4 md:w-64">
                      {/* Yes Button */}
                      <button 
                        onClick={() => handleReadinessAnswer(q.id, true)} 
                        className={`flex-1 py-3 rounded-xl font-black text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                          data.readiness.answers[q.id] === true 
                            ? 'bg-green-600 border-green-700 text-white shadow-md' 
                            : 'bg-gray-50 text-gray-400 hover:bg-green-50'
                        }`}
                      >
                        <CheckCircle size={18} /> 
                        <span className="v-center-cairo">{t.yes}</span>
                      </button>
                      {/* No Button */}
                      <button 
                        onClick={() => handleReadinessAnswer(q.id, false)} 
                        className={`flex-1 py-3 rounded-xl font-black text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                          data.readiness.answers[q.id] === false 
                            ? 'bg-red-600 border-red-700 text-white shadow-md' 
                            : 'bg-gray-50 text-gray-400 hover:bg-red-50'
                        }`}
                      >
                        <XCircle size={18} /> 
                        <span className="v-center-cairo">{t.no}</span>
                      </button>
                   </div>
                </div>
             </div>
             );
          })}
          
          {/* TBT Section */}
          {data.readiness.tbtTopic && (
            <div
              id="readiness-tbt-wrapper"
              data-error={attemptedStep3 && !data.readiness.tbtAcknowledge ? 'true' : undefined}
              className={`bg-white p-6 rounded-2xl border-2 space-y-4 mt-8 shadow-md flex items-center justify-between gap-4 ${
                attemptedStep3 && !data.readiness.tbtAcknowledge ? 'border-red-500 bg-red-50' : 'border-primary-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 text-primary-700 rounded-xl">
                  <ShieldCheck size={24} />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-black text-lg text-primary-900 v-center-cairo leading-tight">
                    {t.tbt_section_title || (isRTL ? 'موضوع التوعية اليومي (TBT)' : 'Daily Toolbox Talk (TBT)')}
                  </h3>
                  {data.readiness.tbtAcknowledge && (
                    <span className="text-[11px] font-black text-green-600 uppercase tracking-widest v-center-cairo">
                      <CheckCircle size={12} className="mr-1 ml-1" />
                      {isRTL ? 'تم الإطلاع' : 'Acknowledged'}
                    </span>
                  )}
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setIsTbtModalOpen(true)}
                className={`px-5 py-2.5 rounded-xl font-black text-sm v-center-cairo transition-all active:scale-95 ${
                  data.readiness.tbtAcknowledge 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300' 
                    : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-200'
                }`}
              >
                {isRTL ? 'قراءة الموضوع' : 'Read Topic'}
              </button>
            </div>
          )}

          {/* TBT Modal */}
          {isTbtModalOpen && data.readiness.tbtTopic && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="p-6 bg-primary-600 text-white flex items-center gap-4 border-b border-primary-700">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl v-center-cairo text-white">
                      {t.tbt_section_title || (isRTL ? 'موضوع التوعية اليومي' : 'Daily Toolbox Talk')}
                    </h3>
                    <p className="text-primary-100 text-xs font-bold uppercase tracking-widest mt-1">
                      {isRTL ? 'يرجى قراءة الموضوع بعناية' : 'Please read carefully'}
                    </p>
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                  <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100">
                    {(() => {
                      // Lookup the topic from TBT_TOPICS to ensure we have the latest keys, 
                      // even if localStorage has an old cached version.
                      const topic = TBT_TOPICS.find(t => t.id === data.readiness.tbtTopic?.id) || data.readiness.tbtTopic;
                      if (!topic) return null;
                      
                      const title = t[topic.titleKey as keyof typeof t] || topic.titleKey;
                      const intro = t[(topic as any).introKey as keyof typeof t] || (topic as any).introKey || '';
                      const points = t[(topic as any).pointsKey as keyof typeof t];
                      
                      return (
                        <>
                          <h4 className="font-black text-xl text-primary-900 mb-4 v-center-cairo text-center">
                            {title}
                          </h4>
                          <p className="font-bold text-sm text-primary-800 leading-relaxed text-center mb-6 px-4">
                            {intro}
                          </p>
                          <div className="space-y-3">
                            {Array.isArray(points) ? 
                              (points as string[]).map((point, idx) => (
                                <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl shadow-sm border border-primary-100/50">
                                  <div className="min-w-[8px] max-w-[8px] h-[8px] bg-primary-500 rounded-full mt-2 shadow-sm" />
                                  <span className="text-sm font-bold text-gray-700 leading-relaxed v-center-cairo">{point}</span>
                                </div>
                              ))
                              : null}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setData((p) => ({ ...p, readiness: { ...p.readiness, tbtAcknowledge: true } }));
                      setIsTbtModalOpen(false);
                    }}
                    className="w-full py-4 rounded-xl font-black text-lg text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95 v-center-cairo flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={24} />
                    {t.tbt_acknowledge || (isRTL ? 'تم الإطلاع وفهم الموضوع' : 'I have read and understood the topic')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTbtModalOpen(false)}
                    className="w-full py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-200 transition-all active:scale-95 v-center-cairo text-center"
                  >
                    {isRTL ? 'إغلاق ومراجعة لاحقاً' : 'Close and review later'}
                  </button>
                </div>
              </div>
            </div>
          )}

       </div>
    </div>
  );
};
