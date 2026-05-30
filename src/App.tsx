import React, { useState, useEffect } from 'react';
import { 
  Language, 
  InspectionMode, 
  InspectionData, 
  View 
} from './types';
import { 
  TRANSLATIONS, 
  INITIAL_READINESS 
} from './constants';
import { getChecklistForType } from './utils/inspectionHelpers';

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

export default function App() {
  // Detect default browser language on initial load
  const [lang, setLang] = useState<Language>(() => {
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'ar' ? 'ar' : 'en';
  });
  
  const [currentView, setCurrentView] = useState<View>('home');
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [inspectionStep, setInspectionStep] = useState<number>(1);
  const [data, setData] = useState<InspectionData>({
    mode: 'full',
    driverInfo: {
      name: '',
      assistantName: '',
      assistantPhone: '',
      vehicleType: 'light_vehicle',
      plateNumber: '',
      phoneNumber: '',
      odometer: '',
      vehicleExpiryDate: '',
      timestamp: new Date().toLocaleString('en-US', { numberingSystem: 'latn' }),
      nextInspectionDate: '', // Used to store Current Odometer
    },
    readiness: { ...INITIAL_READINESS },
    checklist: getChecklistForType('light_vehicle'),
    tyrePressures: { fl: '', fr: '', rl: '', rr: '', rlo: '', rli: '', rro: '', rri: '' },
    additionalNotes: '',
  });

  // Scroll to top on navigation/view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, inspectionStep]);

  // Synchronize HTML lang and direction with current application settings
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [lang, isRTL]);

  // Restore session from localStorage if present on mount
  useEffect(() => {
    const saved = localStorage.getItem('svi_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const EXPIRE_TIME = 60 * 60 * 1000; // 1 Hour session lifespan
        if (!parsed.timestamp || (now - parsed.timestamp > EXPIRE_TIME)) {
          localStorage.removeItem('svi_session');
          return;
        }
        if (parsed.step > 1) {
          setData(parsed.data);
          setInspectionStep(parsed.step);
          setCurrentView('inspection_process');
          setSaveStatus('saved');
        }
      } catch (e) { 
        localStorage.removeItem('svi_session');
      }
    }
  }, []);

  // Auto-save progress to localStorage on data or step changes
  useEffect(() => {
    let handler: ReturnType<typeof setTimeout>;
    
    if (inspectionStep > 1) {
      setSaveStatus('saving');
      handler = setTimeout(() => {
        try {
          localStorage.setItem('svi_session', JSON.stringify({ 
            data, 
            step: inspectionStep,
            timestamp: Date.now()
          }));
          setSaveStatus('saved');
        } catch (e) { 
          setSaveStatus('error'); 
        }
      }, 1000);
    }
    
    return () => {
      if (handler) clearTimeout(handler);
    };
  }, [data, inspectionStep]);

  // Initialize a new inspection session
  const startInspection = (mode: InspectionMode) => {
    setData(prev => ({ 
      ...prev, 
      mode,
      checklist: getChecklistForType(prev.driverInfo.vehicleType)
    }));
    setInspectionStep(2);
    setCurrentView('inspection_process');
  };

  // Reset the application state completely and clear saved session
  const resetApp = () => {
    localStorage.removeItem('svi_session');
    setCurrentView('home');
    setInspectionStep(1);
    setSaveStatus('idle');
    setData({
      mode: 'full',
      driverInfo: { 
        name: '', 
        assistantName: '', 
        assistantPhone: '',
        vehicleType: 'light_vehicle', 
        plateNumber: '', 
        phoneNumber: '', 
        odometer: '', 
        vehicleExpiryDate: '',
        timestamp: new Date().toLocaleString('en-US', { numberingSystem: 'latn' }), 
        nextInspectionDate: '',
      },
      readiness: { ...INITIAL_READINESS },
      checklist: getChecklistForType('light_vehicle'),
      tyrePressures: { fl: '', fr: '', rl: '', rr: '', rlo: '', rli: '', rro: '', rri: '' },
      additionalNotes: '',
    });
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
            {currentView === 'home' && (
              <HomeView 
                t={t} 
                isRTL={isRTL} 
                setCurrentView={setCurrentView} 
                startInspection={startInspection} 
              />
            )}

            {currentView === 'driver_safety' && (
              <DriverGuideView 
                t={t} 
                isRTL={isRTL} 
                onBack={() => setCurrentView('home')} 
              />
            )}

            {currentView === 'vehicle_safety' && (
              <VehicleGuideView 
                t={t} 
                isRTL={isRTL} 
                onBack={() => setCurrentView('home')} 
              />
            )}

            {currentView === 'emergency_procedures' && (
              <EmergencyProcView 
                t={t} 
                isRTL={isRTL} 
                onBack={() => setCurrentView('home')} 
              />
            )}

            {currentView === 'pre_trip_tips' && (
              <PreTripTipsView 
                t={t} 
                isRTL={isRTL} 
                onBack={() => setCurrentView('home')} 
              />
            )}

            {currentView === 'inspection_process' && (
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
            )}
        </div>
      </main>
      <LowerBar />
    </div>
  );
}
