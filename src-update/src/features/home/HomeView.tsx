import React, { useRef, useState, useEffect } from 'react';
import { 
  Layout, 
  UserCheck, 
  Car, 
  ClipboardCheck, 
  ArrowLeft, 
  ArrowRight, 
  HelpCircle, 
  ShieldCheck, 
  Lightbulb, 
  BookOpen, 
  Wrench, 
  Siren, 
  Zap,
  ArrowLeftRight,
  Truck,
  Users
} from 'lucide-react';
import { LiveClock } from '../../components/LiveClock';
import { View, InspectionMode } from '../../types';

interface HomeViewProps {
  t: any;
  isRTL: boolean;
  setCurrentView: (view: View) => void;
  startInspection: (mode: InspectionMode) => void;
}

/**
 * HomeView displays the welcome banner, real-time clock, quick access inspection buttons,
 * safety reasons banner, and links to guides/resources.
 */
export const HomeView: React.FC<HomeViewProps> = ({ 
  t, 
  isRTL, 
  setCurrentView, 
  startInspection 
}) => {
  const whyImportantRef = useRef<HTMLDivElement>(null);
  const [isWhyVisible, setIsWhyVisible] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsWhyVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (whyImportantRef.current) {
      observer.observe(whyImportantRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="animate-fade-in space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white p-6 md:p-10 rounded-[1.5rem] shadow-2xl shadow-primary-900/20 relative overflow-hidden flex flex-col gap-5 border border-white/10 transition-all duration-500 hover:shadow-primary-900/40 hover:-translate-y-0.5">
         <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-primary-600/30 to-transparent skew-x-[-15deg] translate-x-20"></div>
         <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px]"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div className="space-y-2 flex-1">
              <h1 className="text-lg md:text-2xl font-black tracking-tight leading-tight break-words">{t.site_intro_title}</h1>
              <p className="text-primary-100 text-xs md:text-sm opacity-80 font-medium max-w-2xl leading-relaxed">{t.site_intro_body}</p>
            </div>
            <div className="flex-shrink-0">
              <LiveClock isRTL={isRTL} />
            </div>
         </div>
      </div>

      {/* Quick Access Inspection Modes */}
      <div className="space-y-6">
        <div className="flex flex-col gap-1 border-b border-gray-400 pb-3">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-3">
            <Layout size={20} className="text-primary-600" />
            {t.quick_access}
          </h2>
          <p className="text-xs text-gray-500 font-bold">{t.quick_access_desc}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { mode: 'driver_only', icon: UserCheck, label: t.mode_driver, desc: t.mode_driver_desc, color: 'purple', bg: 'bg-purple-50', text: 'text-purple-600' },
             { mode: 'vehicle_only', icon: Car, label: t.mode_vehicle, desc: t.mode_vehicle_desc, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600' },
             { mode: 'full', icon: ClipboardCheck, label: t.mode_full, desc: t.mode_full_desc, color: 'primary', bg: 'bg-primary-50', text: 'text-primary-600' },
             { mode: 'maintenance', icon: Wrench, label: isRTL ? 'قسم الصيانة' : 'Maintenance', desc: isRTL ? 'فحص المركبة من قبل الفني المختص' : 'Vehicle inspection by technician', color: 'orange', bg: 'bg-orange-50', text: 'text-orange-600' }
           ].map((item: any) => (
            <button 
              key={item.mode} 
              onClick={() => startInspection(item.mode as InspectionMode)} 
              className="group bg-white/80 backdrop-blur-lg p-5 rounded-[1.25rem] border border-gray-200/60 shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-primary-500/10 hover:border-primary-300 hover:-translate-y-1 transition-all duration-300 text-start flex flex-col h-full"
            >
              <div className={`p-3 ${item.bg} ${item.text} rounded-xl w-fit group-hover:scale-105 transition-transform duration-300 mb-5`}>
                <item.icon size={24} strokeWidth={2.5} />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-base font-black text-gray-900 group-hover:text-primary-600 transition-colors">{item.label}</h3>
                <p className="text-[11px] text-gray-400 font-bold leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-6 flex items-center gap-3 text-[10px] font-black text-primary-600 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 uppercase tracking-widest">
                 {isRTL ? 'بدء العملية' : 'Initialize Operation'} 
                 {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              </div>
            </button>
           ))}
        </div>

        {/* Forms Section */}
        <div className="mt-8 space-y-6">
          <div className="flex flex-col gap-1 border-b border-gray-400 pb-3">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-3">
              <ArrowLeftRight size={20} className="text-primary-600" />
              {isRTL ? 'الاستمارات' : 'Forms'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Vehicle Handover Form Card */}
            <button 
              onClick={() => setCurrentView('bus_handover')}
              className="group bg-white/80 backdrop-blur-lg p-5 rounded-[1.25rem] border border-gray-200/60 shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-primary-500/10 hover:border-primary-300 hover:-translate-y-1 transition-all duration-300 text-start flex flex-col h-full"
            >
              <div className="p-3 bg-primary-50 text-primary-600 rounded-xl w-fit group-hover:scale-105 transition-transform duration-300 mb-5">
                <Truck size={24} strokeWidth={2.5} />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-base font-black text-gray-900 group-hover:text-primary-600 transition-colors">
                  {isRTL ? 'إستمارة تسليم مركبة' : 'Vehicle Handover Form'}
                </h3>
                <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                  {isRTL ? 'تسليم واستلام المركبات' : 'Vehicle handover & receiving'}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 text-[10px] font-black text-primary-600 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 uppercase tracking-widest">
                {isRTL ? 'فتح الاستمارة' : 'Open Form'}
                {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              </div>
            </button>

            {/* Passenger Registration Log Card */}
            <button 
              onClick={() => setCurrentView('passenger_log')}
              className="group bg-white/80 backdrop-blur-lg p-5 rounded-[1.25rem] border border-gray-200/60 shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-teal-500/10 hover:border-teal-300 hover:-translate-y-1 transition-all duration-300 text-start flex flex-col h-full"
            >
              <div className="p-3 bg-teal-50 text-teal-600 rounded-xl w-fit group-hover:scale-105 transition-transform duration-300 mb-5">
                <Users size={24} strokeWidth={2.5} />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-base font-black text-gray-900 group-hover:text-teal-600 transition-colors">
                  {isRTL ? 'استمارة تسجيل الركاب' : 'Passenger Registration Log'}
                </h3>
                <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                  {isRTL ? 'تسجيل النقلات اليومية للحافلات الصغيرة' : 'Daily trip logging for light buses'}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 text-[10px] font-black text-teal-600 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 uppercase tracking-widest">
                {isRTL ? 'فتح الاستمارة' : 'Open Form'}
                {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              </div>
            </button>

            {/* TBT Form Card */}
            <button 
              onClick={() => setCurrentView('tbt_form')}
              className="group bg-white/80 backdrop-blur-lg p-5 rounded-[1.25rem] border border-gray-200/60 shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 text-start flex flex-col h-full"
            >
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit group-hover:scale-105 transition-transform duration-300 mb-5">
                <ClipboardCheck size={24} strokeWidth={2.5} />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-base font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {isRTL ? 'استمارة TBT' : 'TBT Form'}
                </h3>
                <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                  {isRTL ? 'اجتماع نقاش أدوات السلامة قبل الرحلة' : 'Toolbox Talk safety meeting before journey'}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 text-[10px] font-black text-indigo-600 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 uppercase tracking-widest">
                {isRTL ? 'فتح الاستمارة' : 'Open Form'}
                {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Importance Section */}
      <div 
        ref={whyImportantRef}
        className={`bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 rounded-[1.5rem] border border-gray-200/60 shadow-lg shadow-gray-200/40 space-y-6 transition-all duration-1000 transform ${
          isWhyVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
        }`}
      >
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-3">
          <HelpCircle size={20} className="text-primary-600" />
          {t.why_important_title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { text: t.why_important_1, icon: ShieldCheck, color: 'text-green-600', delay: '0ms' },
             { text: t.why_important_2, icon: Car, color: 'text-blue-600', delay: '150ms' },
             { text: t.why_important_3, icon: Lightbulb, color: 'text-amber-600', delay: '300ms' }
           ].map((item, idx) => (
             <div 
               key={idx} 
               style={{ transitionDelay: isWhyVisible ? item.delay : '0ms' }}
               className={`flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm hover:shadow-md border border-gray-100 hover:border-gray-300 transition-all duration-700 transform hover:-translate-y-0.5 ${
                 isWhyVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
               }`}
             >
                <item.icon size={20} className={item.color} />
                <p className="text-xs md:text-sm font-bold text-gray-700">{item.text}</p>
             </div>
           ))}
        </div>
      </div>

      {/* Resources & Guides Section */}
      <div className="space-y-6 pb-8">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-3">
          <BookOpen size={20} className="text-primary-600" /> {t.resources}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
           <button 
             onClick={() => setCurrentView('driver_safety')} 
             className="flex items-center gap-4 p-4 bg-white rounded-xl hover:bg-gray-50/80 border border-gray-200 hover:border-primary-300 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group shadow-sm"
           >
              <div className="p-2.5 bg-white text-primary-600 rounded-lg shadow-md group-hover:rotate-6 transition-transform">
                <ShieldCheck size={20} />
              </div>
              <div className="text-start">
                 <h3 className="font-black text-sm text-gray-900">{t.driver_guide}</h3>
                 <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{isRTL ? 'إرشادات القيادة الآمنة' : 'Safe Driving Guidelines'}</p>
              </div>
           </button>
           <button 
             onClick={() => setCurrentView('vehicle_safety')} 
             className="flex items-center gap-4 p-4 bg-white rounded-xl hover:bg-gray-50/80 border border-gray-200 hover:border-amber-300 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group shadow-sm"
           >
              <div className="p-2.5 bg-white text-amber-500 rounded-lg shadow-md group-hover:rotate-6 transition-transform">
                <Wrench size={20} />
              </div>
              <div className="text-start">
                 <h3 className="font-black text-sm text-gray-900">{t.vehicle_guide}</h3>
                 <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{isRTL ? 'جاهزية المركبة' : 'Vehicle Readiness'}</p>
              </div>
           </button>
           <button 
             onClick={() => setCurrentView('emergency_procedures')} 
             className="flex items-center gap-4 p-4 bg-white rounded-xl hover:bg-gray-50/80 border border-gray-200 hover:border-red-300 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group shadow-sm"
           >
              <div className="p-2.5 bg-white text-red-600 rounded-lg shadow-md group-hover:rotate-6 transition-transform">
                <Siren size={20} />
              </div>
              <div className="text-start">
                 <h3 className="font-black text-sm text-gray-900">{t.emergency_proc_title}</h3>
                 <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{isRTL ? 'خطوات التصرف الصحيح' : 'Correct Response Steps'}</p>
              </div>
           </button>
           <button 
             onClick={() => setCurrentView('pre_trip_tips')} 
             className="flex items-center gap-4 p-4 bg-white rounded-xl hover:bg-gray-50/80 border border-gray-200 hover:border-indigo-300 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group shadow-sm"
           >
              <div className="p-2.5 bg-white text-indigo-600 rounded-lg shadow-md group-hover:rotate-6 transition-transform">
                <Zap size={20} />
              </div>
              <div className="text-start">
                 <h3 className="font-black text-sm text-gray-900">{t.pre_trip_tips_title}</h3>
                 <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{isRTL ? 'أفضل الممارسات' : 'Best Practices'}</p>
              </div>
           </button>
        </div>
      </div>
    </div>
  );
};
