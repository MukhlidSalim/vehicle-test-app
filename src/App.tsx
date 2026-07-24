import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Language, InspectionMode, View } from './types';
import { TRANSLATIONS } from './constants';
import { useInspectionSession } from './hooks/useInspectionSession';

// Layout & structure components
import { TopBar } from './components/TopBar';
import { LowerBar } from './components/LowerBar';

// Feature views
import { HomeView } from './features/home/HomeView';
import { DriverGuideView } from './features/guides/DriverGuideView';
import { VehicleGuideView } from './features/guides/VehicleGuideView';
import { EmergencyProcView } from './features/guides/EmergencyProcView';
import { PreTripTipsView } from './features/guides/PreTripTipsView';
import { InspectionProcess } from './features/inspection/InspectionProcess';
import { HandoverForm } from './features/handover/HandoverForm';
import { PassengerLogForm } from './features/passenger-log/PassengerLogForm';

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
    <div className={`min-h-screen bg-white flex flex-col font-${isRTL ? 'cairo' : 'sans'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <TopBar 
        t={t} 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        lang={lang} 
        setLang={setLang} 
      />
      <main className="flex-1 w-full max-w-7xl mx-auto pt-14 flex flex-col">
        <div className="flex-1 p-4 md:p-8 w-full">
          <Routes>
            <Route path="/" element={
              <HomeView 
                t={t} 
                isRTL={isRTL} 
                setCurrentView={setCurrentView} 
                startInspection={startInspection} 
              />
            } />
            
            <Route path="/driver_safety" element={
              <DriverGuideView 
                t={t} 
                isRTL={isRTL} 
                onBack={() => setCurrentView('home')} 
              />
            } />
            
            <Route path="/vehicle_safety" element={
              <VehicleGuideView 
                t={t} 
                isRTL={isRTL} 
                onBack={() => setCurrentView('home')} 
              />
            } />
            
            <Route path="/emergency_procedures" element={
              <EmergencyProcView 
                t={t} 
                isRTL={isRTL} 
                onBack={() => setCurrentView('home')} 
              />
            } />
            
            <Route path="/pre_trip_tips" element={
              <PreTripTipsView 
                t={t} 
                isRTL={isRTL} 
                onBack={() => setCurrentView('home')} 
              />
            } />
            
            <Route path="/inspection_process" element={
              <InspectionProcess 
                t={t} 
                lang={lang} 
                isRTL={isRTL} 
                step={inspectionStep} 
                setStep={setInspectionStep} 
                data={data} 
                setData={setData} 
                onExit={resetApp} 
                saveStatus={saveStatus} 
              />
            } />
            
            <Route path="/bus_handover" element={
              <HandoverForm 
                lang={lang}
                isRTL={isRTL}
                onExit={resetApp}
              />
            } />
            
            <Route path="/passenger_log" element={
              <PassengerLogForm 
                lang={lang}
                isRTL={isRTL}
                onExit={resetApp}
              />
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      <LowerBar />
    </div>
  );
}
