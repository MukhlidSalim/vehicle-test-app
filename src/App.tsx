import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Language, InspectionMode, View } from './types';
import { TRANSLATIONS } from './constants';
import { useInspectionSession } from './hooks/useInspectionSession';

// Layout & structure components
import { TopBar } from './components/TopBar';
import { LowerBar } from './components/LowerBar';
import { ErrorBoundary } from './components/ErrorBoundary';

// Feature views
const HomeView = React.lazy(() => import('./features/home/HomeView').then(m => ({ default: m.HomeView })));
const DriverGuideView = React.lazy(() => import('./features/guides/DriverGuideView').then(m => ({ default: m.DriverGuideView })));
const VehicleGuideView = React.lazy(() => import('./features/guides/VehicleGuideView').then(m => ({ default: m.VehicleGuideView })));
const EmergencyProcView = React.lazy(() => import('./features/guides/EmergencyProcView').then(m => ({ default: m.EmergencyProcView })));
const PreTripTipsView = React.lazy(() => import('./features/guides/PreTripTipsView').then(m => ({ default: m.PreTripTipsView })));
const InspectionProcess = React.lazy(() => import('./features/inspection/InspectionProcess').then(m => ({ default: m.InspectionProcess })));
const HandoverForm = React.lazy(() => import('./features/handover/HandoverForm').then(m => ({ default: m.HandoverForm })));
const PassengerLogForm = React.lazy(() => import('./features/passenger-log/PassengerLogForm').then(m => ({ default: m.PassengerLogForm })));
const TbtForm = React.lazy(() => import('./features/tbt/TbtForm').then(m => ({ default: m.TbtForm })));
const PostMaintenanceForm = React.lazy(() => import('./features/post-maintenance/PostMaintenanceForm').then(m => ({ default: m.PostMaintenanceForm })));

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detect default browser language on initial load
  const [lang, setLang] = useState<Language>(() => {
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'ar' ? 'ar' : 'en';
  });
  
  const currentView = location.pathname === '/' ? 'home' : location.pathname.substring(1) as View;
  
  const setCurrentView = (view: View) => {
    navigate(view === 'home' ? '/' : `/${view}`);
  };

  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  const { 
    data, setData, 
    inspectionStep, setInspectionStep, 
    saveStatus, 
    startInspection: hookStartInspection, 
    resetSession 
  } = useInspectionSession();

  // Scroll to top on navigation/view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, inspectionStep]);

  // Synchronize HTML lang and direction with current application settings
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [lang, isRTL]);

  const startInspection = (mode: InspectionMode) => {
    hookStartInspection(mode);
    setCurrentView('inspection_process');
  };

  const resetApp = () => {
    resetSession();
    setCurrentView('home');
  };

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-white flex flex-col font-${isRTL ? 'cairo' : 'sans'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <TopBar 
          t={t} 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          lang={lang} 
          setLang={setLang} 
          startInspection={startInspection}
          currentMode={data?.mode}
        />
        <main className="flex-1 w-full max-w-7xl mx-auto pt-14 flex flex-col">
          <div className="flex-1 p-4 md:p-8 w-full">
            <React.Suspense fallback={
              <div className="flex items-center justify-center h-full min-h-[50vh]">
                <div className="flex flex-col items-center gap-3 text-primary-600">
                  <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                  <span className="font-bold">{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
                </div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<HomeView t={t} isRTL={isRTL} setCurrentView={setCurrentView} startInspection={startInspection} />} />
                <Route path="/driver_safety" element={<DriverGuideView t={t} isRTL={isRTL} onBack={() => setCurrentView('home')} />} />
                <Route path="/vehicle_safety" element={<VehicleGuideView t={t} isRTL={isRTL} onBack={() => setCurrentView('home')} />} />
                <Route path="/emergency_procedures" element={<EmergencyProcView t={t} isRTL={isRTL} onBack={() => setCurrentView('home')} />} />
                <Route path="/pre_trip_tips" element={<PreTripTipsView t={t} isRTL={isRTL} onBack={() => setCurrentView('home')} />} />
                <Route path="/inspection_process" element={<InspectionProcess t={t} lang={lang} isRTL={isRTL} step={inspectionStep} setStep={setInspectionStep} data={data} setData={setData} onExit={resetApp} saveStatus={saveStatus} />} />
                <Route path="/bus_handover" element={<HandoverForm lang={lang} isRTL={isRTL} onExit={resetApp} />} />
                <Route path="/passenger_log" element={<PassengerLogForm lang={lang} isRTL={isRTL} onExit={resetApp} />} />
                <Route path="/tbt_form" element={<TbtForm lang={lang} isRTL={isRTL} onExit={resetApp} />} />
                <Route path="/post_maintenance" element={<PostMaintenanceForm lang={lang} isRTL={isRTL} onExit={resetApp} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </React.Suspense>
          </div>
        </main>
        <LowerBar />
      </div>
    </ErrorBoundary>
  );
}
