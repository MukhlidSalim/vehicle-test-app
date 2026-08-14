import React, { useState, useEffect } from 'react';
import { Home, Globe, Menu, X, Truck, ClipboardCheck, Users, Wrench, FileText, CheckCircle, Car, UserCheck } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { Language, View, InspectionMode } from '../types';

interface TopBarProps {
  t: any;
  currentView: View;
  setCurrentView: (view: View) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  startInspection?: (mode: InspectionMode) => void;
  currentMode?: InspectionMode;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  t, 
  currentView, 
  setCurrentView, 
  lang, 
  setLang,
  startInspection,
  currentMode
}) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const isRTL = lang === 'ar';

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [menuOpen]);

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    setMenuOpen(false);
  };

  const handleStartInspection = (mode: InspectionMode) => {
    if (startInspection) {
      startInspection(mode);
    }
    setMenuOpen(false);
  };

  const DrawerItem = ({ icon: Icon, label, isActive, onClick, colorClass }: { icon: any, label: string, isActive?: boolean, onClick: () => void, colorClass?: string }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-bold ${
        isActive 
          ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100' 
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
      }`}
    >
      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-primary-100 text-primary-600' : (colorClass || 'bg-gray-100 text-gray-500')}`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <span>{label}</span>
    </button>
  );

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm z-[40] flex items-center justify-between px-4 md:px-8 no-print transition-all">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMenuOpen(true)} 
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
            title={isRTL ? 'القائمة' : 'Menu'}
          >
            <Menu size={22} />
          </button>
          
          <div className="transform transition-transform hover:scale-105 duration-300 cursor-pointer border-l border-gray-300 pl-3 rtl:pl-0 rtl:border-l-0 rtl:border-r rtl:pr-3">
            <BrandLogo onClick={() => handleNavigate('home')} />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={() => handleNavigate('home')}
             className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
           >
             <Home size={16} /> {t.home}
           </button>
           <button 
             onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} 
             className="flex items-center gap-2 text-[11px] font-black bg-gray-900 text-white px-4 py-1.5 rounded-full hover:bg-primary-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
           >
             <Globe size={14} /> {lang === 'ar' ? 'EN' : 'AR'}
           </button>
        </div>
      </header>

      {/* Slide-over Drawer Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-fade-in"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Drawer Panel */}
      <div 
        className={`fixed top-0 bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-[300px] bg-white shadow-2xl z-[101] transform transition-transform duration-300 ease-out flex flex-col ${
          menuOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')
        }`}
      >
        {/* Drawer Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <div className="transform scale-90 origin-right rtl:origin-right">
             <BrandLogo onClick={() => handleNavigate('home')} />
          </div>
          <button 
            onClick={() => setMenuOpen(false)}
            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
          
          {/* Main */}
          <div className="space-y-1">
            <DrawerItem 
              icon={Home} 
              label={t.home} 
              isActive={currentView === 'home'} 
              onClick={() => handleNavigate('home')} 
              colorClass="bg-blue-50 text-blue-500"
            />
          </div>

          {/* Inspections */}
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">
              {isRTL ? 'الفحوصات' : 'Inspections'}
            </h4>
            <div className="space-y-1">
              <DrawerItem 
                icon={UserCheck} 
                label={t.mode_driver} 
                isActive={currentView === 'inspection_process' && currentMode === 'driver_only'} 
                onClick={() => handleStartInspection('driver_only')}
                colorClass="bg-purple-50 text-purple-500"
              />
              <DrawerItem 
                icon={Car} 
                label={t.mode_vehicle} 
                isActive={currentView === 'inspection_process' && currentMode === 'vehicle_only'} 
                onClick={() => handleStartInspection('vehicle_only')}
                colorClass="bg-blue-50 text-blue-500"
              />
              <DrawerItem 
                icon={ClipboardCheck} 
                label={t.mode_full} 
                isActive={currentView === 'inspection_process' && currentMode === 'full'} 
                onClick={() => handleStartInspection('full')}
                colorClass="bg-primary-50 text-primary-500"
              />
              <DrawerItem 
                icon={Wrench} 
                label={isRTL ? 'الفحص الفني' : 'Maintenance'} 
                isActive={currentView === 'inspection_process' && currentMode === 'maintenance'} 
                onClick={() => handleStartInspection('maintenance')}
                colorClass="bg-orange-50 text-orange-500"
              />
            </div>
          </div>

          {/* Forms */}
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">
              {isRTL ? 'الاستمارات' : 'Forms'}
            </h4>
            <div className="space-y-1">
              <DrawerItem 
                icon={Truck} 
                label={isRTL ? 'تسليم مركبة' : 'Vehicle Handover'} 
                isActive={currentView === 'bus_handover'} 
                onClick={() => handleNavigate('bus_handover')}
                colorClass="bg-emerald-50 text-emerald-500"
              />
              <DrawerItem 
                icon={Users} 
                label={isRTL ? 'سجل الركاب' : 'Passenger Log'} 
                isActive={currentView === 'passenger_log'} 
                onClick={() => handleNavigate('passenger_log')}
                colorClass="bg-teal-50 text-teal-500"
              />
              <DrawerItem 
                icon={FileText} 
                label={isRTL ? 'تقرير TBT' : 'TBT Form'} 
                isActive={currentView === 'tbt_form'} 
                onClick={() => handleNavigate('tbt_form')}
                colorClass="bg-indigo-50 text-indigo-500"
              />
              <DrawerItem 
                icon={CheckCircle} 
                label={isRTL ? 'اعتماد ما بعد الصيانة' : 'Post-Maintenance'} 
                isActive={currentView === 'post_maintenance'} 
                onClick={() => handleNavigate('post_maintenance')}
                colorClass="bg-rose-50 text-rose-500"
              />
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
