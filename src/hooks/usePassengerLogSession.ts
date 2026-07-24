import { useState, useEffect, useCallback } from 'react';

// --- Types ---
export interface Trip {
  id: string;
  type: 'routine' | 'shift';
  pickupLocation: string;
  dropoffLocation: string;
  passengerCount: number;
  time: string;
}

export interface DayInfo {
  vehiclePlate: string;
  date: string;
  driverName: string;
  vehicleClass: 'A' | 'B' | 'C' | 'D' | '';
}

export interface PassengerLogSession {
  dayInfo: DayInfo;
  trips: Trip[];
  createdAt: number;
}

const STORAGE_KEY = 'passenger_log_session';

const emptyDayInfo: DayInfo = {
  vehiclePlate: '',
  date: new Date().toISOString().split('T')[0],
  driverName: '',
  vehicleClass: '',
};

export function usePassengerLogSession() {
  const [dayInfo, setDayInfo] = useState<DayInfo>(emptyDayInfo);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasExistingSession, setHasExistingSession] = useState(false);

  // Load from localStorage on mount - NO expiry
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: PassengerLogSession = JSON.parse(raw);
        if (parsed.dayInfo && parsed.trips) {
          setDayInfo(parsed.dayInfo);
          setTrips(parsed.trips);
          setHasExistingSession(true);
        }
      }
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsLoaded(true);
  }, []);

  // Auto-save to localStorage on every change (after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    // Only save if we have meaningful data
    if (dayInfo.driverName || dayInfo.vehiclePlate || trips.length > 0) {
      const session: PassengerLogSession = {
        dayInfo,
        trips,
        createdAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }, [dayInfo, trips, isLoaded]);

  const addTrip = useCallback((trip: Omit<Trip, 'id'>) => {
    const newTrip: Trip = { ...trip, id: `trip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` };
    setTrips(prev => [...prev, newTrip]);
  }, []);

  const updateTrip = useCallback((id: string, updated: Partial<Trip>) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
  }, []);

  const deleteTrip = useCallback((id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
  }, []);

  const resetDay = useCallback(() => {
    setDayInfo({ ...emptyDayInfo, date: new Date().toISOString().split('T')[0] });
    setTrips([]);
    setHasExistingSession(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    dayInfo,
    setDayInfo,
    trips,
    addTrip,
    updateTrip,
    deleteTrip,
    resetDay,
    isLoaded,
    hasExistingSession,
  };
}
