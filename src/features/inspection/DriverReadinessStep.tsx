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
                        type="button"
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
                        type="button"
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
          


       </div>
    </div>
  );
};
