import { useState, useEffect } from 'react';
import { InspectionMode, InspectionData } from '../types';
import { INITIAL_READINESS } from '../constants';
import { getChecklistForType } from '../utils/inspectionHelpers';

export function useInspectionSession() {
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
      departure: '',
      destination: '',
      timestamp: new Date().toLocaleString('en-US', { numberingSystem: 'latn' }),
      nextInspectionDate: '', // Used to store Current Odometer
    },
    readiness: { ...INITIAL_READINESS },
    checklist: getChecklistForType('light_vehicle'),
    tyrePressures: { fl: '', fr: '', rl: '', rr: '', rlo: '', rli: '', rro: '', rri: '' },
    additionalNotes: '',
  });

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
      checklist: getChecklistForType(prev.driverInfo.vehicleType, mode)
    }));
    setInspectionStep(2);
  };

  // Reset the application state completely and clear saved session
  const resetSession = () => {
    localStorage.removeItem('svi_session');
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
        departure: '',
        destination: '',
        timestamp: new Date().toLocaleString('en-US', { numberingSystem: 'latn' }), 
        nextInspectionDate: '',
      },
      readiness: { ...INITIAL_READINESS },
      checklist: getChecklistForType('light_vehicle'),
      tyrePressures: { fl: '', fr: '', rl: '', rr: '', rlo: '', rli: '', rro: '', rri: '' },
      additionalNotes: '',
    });
  };

  return {
    data,
    setData,
    inspectionStep,
    setInspectionStep,
    saveStatus,
    startInspection,
    resetSession
  };
}
