import React, { useState, useMemo } from 'react';
import {
  Users, Bus, MapPin, Clock, Hash, User, Calendar,
  Plus, Edit3, Trash2, ChevronLeft, ChevronRight,
  FileText, ArrowLeft, AlertTriangle, Check, X,
  RotateCcw, Download, Share2, ArrowLeftRight
} from 'lucide-react';
import { usePassengerLogSession, Trip, DayInfo } from '../../hooks/usePassengerLogSession';
import { PassengerLogReport } from './PassengerLogReport';

// Fixed locations (always English)
const LOCATIONS = ['EPCM', 'KRC', 'KOB', 'CPF'];
const VEHICLE_CLASSES = ['A', 'B', 'C', 'D'] as const;
const TRIP_TYPES = [
  { value: 'routine' as const, labelAr: 'روتينية', labelEn: 'Routine', icon: '🔄', color: 'blue' },
  { value: 'shift' as const, labelAr: 'مناوبة', labelEn: 'Shift', icon: '🔀', color: 'purple' },
];

interface Props {
  lang: string;
  isRTL: boolean;
  onExit: () => void;
}

export const PassengerLogForm: React.FC<Props> = ({ lang, isRTL, onExit }) => {
  const {
    dayInfo, setDayInfo, trips,
    addTrip, updateTrip, deleteTrip, resetDay,
    isLoaded, hasExistingSession,
  } = usePassengerLogSession();

  const [step, setStep] = useState<'setup' | 'log' | 'report'>(hasExistingSession ? 'log' : 'setup');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // New trip form state
  const [newTrip, setNewTrip] = useState({
    type: '' as '' | 'routine' | 'shift',
    pickupLocation: '',
    dropoffLocation: '',
    passengerCount: '',
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  });

  // Alert
  const [alertMsg, setAlertMsg] = useState('');
  const showAlert = (msg: string) => { setAlertMsg(msg); setTimeout(() => setAlertMsg(''), 4000); };

  const t = (ar: string, en: string) => isRTL ? ar : en;

  // Update step when session loads
  React.useEffect(() => {
    if (isLoaded && hasExistingSession) setStep('log');
  }, [isLoaded, hasExistingSession]);

  // ---- SETUP VALIDATION ----
  const validateSetup = (): boolean => {
    setAttemptedSubmit(true);
    if (!dayInfo.vehiclePlate.trim()) { showAlert(t('يرجى إدخال رقم المركبة', 'Please enter vehicle plate')); return false; }
    if (!dayInfo.driverName.trim()) { showAlert(t('يرجى إدخال اسم السائق', 'Please enter driver name')); return false; }
    if (!dayInfo.vehicleClass) { showAlert(t('يرجى اختيار رمز التصنيف', 'Please select vehicle class')); return false; }
    return true;
  };

  const handleStartDay = () => {
    if (validateSetup()) {
      setAttemptedSubmit(false);
      setStep('log');
    }
  };

  // ---- TRIP FORM ----
  const resetTripForm = () => {
    setNewTrip({
      type: '',
      pickupLocation: '',
      dropoffLocation: '',
      passengerCount: '',
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    });
    setShowAddTrip(false);
    setEditingTripId(null);
  };

  const validateTrip = (): boolean => {
    if (!newTrip.type) { showAlert(t('يرجى اختيار نوع النقلة', 'Please select trip type')); return false; }
    if (!newTrip.pickupLocation) { showAlert(t('يرجى اختيار مكان الركوب', 'Please select pickup location')); return false; }
    if (!newTrip.dropoffLocation) { showAlert(t('يرجى اختيار مكان التنزيل', 'Please select drop-off location')); return false; }
    if (!newTrip.passengerCount || parseInt(newTrip.passengerCount) < 1) { showAlert(t('يرجى إدخال عدد الركاب', 'Please enter passenger count')); return false; }
    if (!newTrip.time) { showAlert(t('يرجى إدخال التوقيت', 'Please enter time')); return false; }
    return true;
  };

  const handleSaveTrip = () => {
    if (!validateTrip()) return;
    const tripData = {
      type: newTrip.type as 'routine' | 'shift',
      pickupLocation: newTrip.pickupLocation,
      dropoffLocation: newTrip.dropoffLocation,
      passengerCount: parseInt(newTrip.passengerCount),
      time: newTrip.time,
    };

    if (editingTripId) {
      updateTrip(editingTripId, tripData);
    } else {
      addTrip(tripData);
    }
    resetTripForm();
  };

  const handleEditTrip = (trip: Trip) => {
    setNewTrip({
      type: trip.type,
      pickupLocation: trip.pickupLocation,
      dropoffLocation: trip.dropoffLocation,
      passengerCount: String(trip.passengerCount),
      time: trip.time,
    });
    setEditingTripId(trip.id);
    setShowAddTrip(true);
  };

  const handleDeleteTrip = (id: string) => {
    deleteTrip(id);
    setShowDeleteConfirm(null);
  };

  const handleNewDay = () => {
    resetDay();
    setStep('setup');
    setShowResetConfirm(false);
    setAttemptedSubmit(false);
  };

  // Stats
  const totalPassengers = useMemo(() => trips.reduce((sum, t) => sum + t.passengerCount, 0), [trips]);
  const routineCount = useMemo(() => trips.filter(t => t.type === 'routine').length, [trips]);
  const shiftCount = useMemo(() => trips.filter(t => t.type === 'shift').length, [trips]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Alert */}
      {alertMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in">
          <div className="bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-2">
            <AlertTriangle size={18} /> {alertMsg}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-700 text-white p-4 rounded-xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-emerald-500/20 to-transparent skew-x-[-15deg] translate-x-20" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-teal-400/10 rounded-full blur-[80px]" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 backdrop-blur-sm rounded-lg">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight">{t('استمارة تسجيل الركاب', 'Passenger Registration Log')}</h1>
              <p className="text-teal-100 text-[10px] font-bold mt-0.5">{t('تسجيل النقلات اليومية للحافلات الصغيرة', 'Daily trip logging for light buses')}</p>
            </div>
          </div>
          <button onClick={onExit} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>

      {/* ===== STEP: SETUP (Day Info) ===== */}
      {step === 'setup' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-md space-y-4">
            <h2 className="text-sm font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Calendar size={16} className="text-teal-600" />
              {t('البيانات الأساسية', 'Basic Data')}
            </h2>

            {/* Vehicle Plate */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t('رقم المركبة *', 'Vehicle Plate *')}</label>
              <input
                value={dayInfo.vehiclePlate}
                onChange={e => setDayInfo({ ...dayInfo, vehiclePlate: e.target.value })}
                placeholder={t('أدخل رقم المركبة', 'Enter vehicle plate')}
                className={`w-full py-2 px-3 rounded-lg border text-xs font-bold focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none transition bg-gray-50 ${attemptedSubmit && !dayInfo.vehiclePlate.trim() ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`}
              />
            </div>

            {/* Driver Name */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t('اسم السائق *', 'Driver Name *')}</label>
              <input
                value={dayInfo.driverName}
                onChange={e => setDayInfo({ ...dayInfo, driverName: e.target.value })}
                placeholder={t('أدخل اسم السائق', 'Enter driver name')}
                className={`w-full py-2 px-3 rounded-lg border text-xs font-bold focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none transition bg-gray-50 ${attemptedSubmit && !dayInfo.driverName.trim() ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`}
              />
            </div>

            {/* Date (auto-filled) */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t('التاريخ', 'Date')}</label>
              <input
                type="date"
                value={dayInfo.date}
                onChange={e => setDayInfo({ ...dayInfo, date: e.target.value })}
                className="w-full py-2 px-3 rounded-lg border border-gray-200 text-xs font-bold focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none transition bg-gray-50"
              />
            </div>

            {/* Vehicle Class */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1.5 block">{t('رمز التصنيف *', 'Vehicle Class *')}</label>
              <div className="grid grid-cols-4 gap-2">
                {VEHICLE_CLASSES.map(cls => (
                  <button
                    key={cls}
                    onClick={() => setDayInfo({ ...dayInfo, vehicleClass: cls })}
                    className={`py-2 rounded-lg font-black text-base border-2 transition-all duration-200 ${
                      dayInfo.vehicleClass === cls
                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-md shadow-teal-500/20 scale-105'
                        : `border-gray-200 bg-white text-gray-600 hover:border-teal-300 hover:bg-teal-50/50 ${attemptedSubmit && !dayInfo.vehicleClass ? 'border-red-300' : ''}`
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartDay}
            className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-black text-sm shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Bus size={20} />
            {t('بدء التسجيل', 'Start Logging')}
          </button>
        </div>
      )}

      {/* ===== STEP: LOG (Trip Registration) ===== */}
      {step === 'log' && (
        <div className="space-y-5 animate-fade-in">

          {/* Day Summary Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-md">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: t('المركبة', 'Vehicle'), value: dayInfo.vehiclePlate, icon: <Bus size={12} className="text-teal-600" /> },
                { label: t('السائق', 'Driver'), value: dayInfo.driverName, icon: <User size={12} className="text-blue-600" /> },
                { label: t('التصنيف', 'Class'), value: dayInfo.vehicleClass, icon: <Hash size={12} className="text-purple-600" /> },
                { label: t('التاريخ', 'Date'), value: dayInfo.date, icon: <Calendar size={12} className="text-amber-600" /> },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{item.icon} {item.label}</div>
                  <div className="text-[11px] font-black text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{item.value || '-'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-2 border border-teal-200 text-center">
              <div className="text-lg font-black text-teal-700">{trips.length}</div>
              <div className="text-[9px] font-bold text-teal-500 uppercase tracking-wider">{t('النقلات', 'Trips')}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-2 border border-blue-200 text-center">
              <div className="text-lg font-black text-blue-700">{totalPassengers}</div>
              <div className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">{t('الركاب', 'Passengers')}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl p-2 border border-purple-200 text-center">
              <div className="text-sm font-black text-purple-700 mt-1">{routineCount}<span className="text-gray-300 mx-1">/</span>{shiftCount}</div>
              <div className="text-[9px] font-bold text-purple-500 uppercase tracking-wider">{t('روتين/مناوب', 'Routine/Shift')}</div>
            </div>
          </div>

          {/* Trip List */}
          {trips.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-[11px] font-black text-gray-800 flex items-center gap-1.5">
                  <FileText size={14} className="text-gray-600" />
                  {t('النقلات المسجلة', 'Registered Trips')}
                </h3>
                <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">{trips.length} {t('نقلة', 'trips')}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-2 py-1.5 text-start font-black text-gray-600 w-6">#</th>
                      <th className="px-2 py-1.5 text-start font-black text-gray-600">{t('النوع', 'Type')}</th>
                      <th className="px-2 py-1.5 text-start font-black text-gray-600">{t('الانطلاق', 'Start')}</th>
                      <th className="px-2 py-1.5 text-start font-black text-gray-600">{t('الوصول', 'End')}</th>
                      <th className="px-2 py-1.5 text-center font-black text-gray-600">{t('الركاب', 'Pax')}</th>
                      <th className="px-2 py-1.5 text-start font-black text-gray-600">{t('الوقت', 'Time')}</th>
                      <th className="px-2 py-1.5 text-end font-black text-gray-600 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {trips.map((trip, idx) => (
                      <tr key={trip.id} className="group hover:bg-gray-50/80 transition-colors">
                        <td className="px-2 py-1.5 font-black text-gray-500">
                          {idx + 1}
                        </td>
                        <td className="px-2 py-1.5">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                            trip.type === 'routine' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                          }`}>
                            {trip.type === 'routine' ? t('روتينية', 'Routine') : t('مناوبة', 'Shift')}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 font-bold text-gray-800">
                          {trip.pickupLocation}
                        </td>
                        <td className="px-2 py-1.5 font-bold text-gray-800">
                          {trip.dropoffLocation}
                        </td>
                        <td className="px-2 py-1.5 text-center font-black text-gray-900">
                          {trip.passengerCount}
                        </td>
                        <td className="px-2 py-1.5 font-bold text-gray-600">
                          {trip.time}
                        </td>
                        <td className="px-2 py-1.5 text-end">
                          <div className="flex items-center justify-end gap-0.5">
                            <button
                              onClick={() => handleEditTrip(trip)}
                              className="p-1 text-blue-500 rounded-md bg-blue-50 transition-colors"
                              title={t('تعديل', 'Edit')}
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(trip.id)}
                              className="p-1 text-red-400 rounded-md bg-red-50 transition-colors"
                              title={t('حذف', 'Delete')}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {trips.length === 0 && !showAddTrip && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bus size={28} className="text-gray-300" />
              </div>
              <h3 className="text-base font-black text-gray-400">{t('لا توجد نقلات مسجلة بعد', 'No trips registered yet')}</h3>
              <p className="text-xs text-gray-400 font-bold mt-1">{t('اضغط على "إضافة نقلة" لبدء التسجيل', 'Click "Add Trip" to start logging')}</p>
            </div>
          )}

          {/* Add Trip Form */}
          {showAddTrip && (
            <div className="bg-white rounded-xl border-2 border-teal-200 p-4 shadow-lg shadow-teal-500/10 space-y-3 animate-fade-in">
              <h3 className="text-sm font-black text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                {editingTripId ? <Edit3 size={16} className="text-amber-600" /> : <Plus size={16} className="text-teal-600" />}
                {editingTripId ? t('تعديل النقلة', 'Edit Trip') : t('إضافة نقلة جديدة', 'Add New Trip')}
              </h3>

              {/* Trip Type */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 mb-1.5 block">{t('نوع النقلة *', 'Trip Type *')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {TRIP_TYPES.map(tt => (
                      <button
                      key={tt.value}
                      onClick={() => setNewTrip({ ...newTrip, type: tt.value })}
                      className={`py-2 px-3 rounded-lg font-black text-xs border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                        newTrip.type === tt.value
                          ? tt.value === 'routine'
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md shadow-blue-500/20'
                            : 'border-purple-500 bg-purple-50 text-purple-700 shadow-md shadow-purple-500/20'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm">{tt.icon}</span>
                      {isRTL ? tt.labelAr : tt.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pickup & Dropoff */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t('نقطة الانطلاق *', 'Starting Point *')}</label>
                  <select
                    value={newTrip.pickupLocation}
                    onChange={e => setNewTrip({ ...newTrip, pickupLocation: e.target.value })}
                    className={`w-full py-2 px-3 rounded-lg border text-xs font-bold focus:ring-2 focus:ring-teal-300 outline-none transition bg-gray-50 appearance-none ${
                      !newTrip.pickupLocation ? 'text-gray-400' : 'text-gray-900'
                    } ${attemptedSubmit && !newTrip.pickupLocation ? 'border-red-400' : 'border-gray-200'}`}
                  >
                    <option value="">{t('اختر', 'Select')}</option>
                    {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t('نقطة الوصول *', 'Arrival Point *')}</label>
                  <select
                    value={newTrip.dropoffLocation}
                    onChange={e => setNewTrip({ ...newTrip, dropoffLocation: e.target.value })}
                    className={`w-full py-2 px-3 rounded-lg border text-xs font-bold focus:ring-2 focus:ring-teal-300 outline-none transition bg-gray-50 appearance-none ${
                      !newTrip.dropoffLocation ? 'text-gray-400' : 'text-gray-900'
                    } ${attemptedSubmit && !newTrip.dropoffLocation ? 'border-red-400' : 'border-gray-200'}`}
                  >
                    <option value="">{t('اختر', 'Select')}</option>
                    {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
              </div>

              {/* Passenger Count & Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t('عدد الركاب *', 'Passengers *')}</label>
                  <input
                    type="number"
                    min="1"
                    value={newTrip.passengerCount}
                    onChange={e => setNewTrip({ ...newTrip, passengerCount: e.target.value })}
                    placeholder="0"
                    className="w-full py-2 px-3 rounded-lg border border-gray-200 text-xs font-bold focus:ring-2 focus:ring-teal-300 outline-none transition bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t('التوقيت *', 'Time *')}</label>
                  <input
                    type="time"
                    value={newTrip.time}
                    onChange={e => setNewTrip({ ...newTrip, time: e.target.value })}
                    className="w-full py-2 px-3 rounded-lg border border-gray-200 text-xs font-bold focus:ring-2 focus:ring-teal-300 outline-none transition bg-gray-50"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={resetTripForm}
                  className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg font-black text-xs hover:bg-gray-200 active:scale-95 transition-all"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveTrip}
                  className="flex-1 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg font-black text-xs shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Check size={14} />
                  {editingTripId ? t('حفظ التعديلات', 'Save Changes') : t('إضافة النقلة', 'Add Trip')}
                </button>
              </div>
            </div>
          )}

          {/* Add Trip Button */}
          {!showAddTrip && (
            <button
              onClick={() => { resetTripForm(); setShowAddTrip(true); }}
              className="w-full py-2.5 border-2 border-dashed border-teal-300 text-teal-600 rounded-xl font-black text-xs hover:bg-teal-50 hover:border-teal-400 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
            >
              <Plus size={16} />
              {t('إضافة نقلة جديدة', 'Add New Trip')}
            </button>
          )}

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
            {trips.length > 0 && (
              <button
                onClick={() => setStep('report')}
                className="flex-1 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg font-black text-xs shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <FileText size={14} />
                {t('عرض التقرير', 'View Report')}
              </button>
            )}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex-1 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-black text-xs hover:bg-amber-100 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={14} />
              {t('بدء يوم جديد', 'Start New Day')}
            </button>
            <button
              onClick={onExit}
              className="flex-1 py-2.5 bg-gray-800 text-white rounded-lg font-black text-xs hover:bg-gray-900 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={14} />
              {t('العودة للرئيسية', 'Back to Home')}
            </button>
          </div>
        </div>
      )}

      {/* ===== STEP: REPORT ===== */}
      {step === 'report' && (
        <div className="space-y-6 animate-fade-in">
          <PassengerLogReport dayInfo={dayInfo} trips={trips} isRTL={isRTL} />
          <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
            <button
              onClick={() => setStep('log')}
              className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-black text-xs hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={14} />
              {t('العودة للتسجيل', 'Back to Log')}
            </button>
            <button
              onClick={() => { resetTripForm(); setShowAddTrip(true); setStep('log'); }}
              className="flex-1 py-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-black text-xs hover:bg-blue-100 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus size={14} />
              {t('إضافة نقلة جديدة', 'Add New Trip')}
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex-1 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-black text-xs hover:bg-amber-100 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={14} />
              {t('بدء يوم جديد', 'Start New Day')}
            </button>
          </div>
        </div>
      )}

      {/* ===== MODALS ===== */}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-fade-in">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-base font-black text-gray-900 text-center">{t('حذف النقلة', 'Delete Trip')}</h3>
            <p className="text-sm text-gray-500 font-bold text-center">{t('هل أنت متأكد من حذف هذه النقلة؟', 'Are you sure you want to delete this trip?')}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-3 rounded-xl font-black text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all">
                {t('إلغاء', 'Cancel')}
              </button>
              <button onClick={() => handleDeleteTrip(showDeleteConfirm)} className="flex-1 py-3 rounded-xl font-black text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all">
                {t('حذف', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Day Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-fade-in">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={24} className="text-amber-600" />
            </div>
            <h3 className="text-base font-black text-gray-900 text-center">{t('بدء يوم جديد', 'Start New Day')}</h3>
            <p className="text-sm text-gray-500 font-bold text-center">
              {t(
                'سيتم مسح جميع النقلات المسجلة لهذا اليوم. تأكد من تصدير التقرير قبل المتابعة.',
                'All trips for today will be cleared. Make sure to export the report before proceeding.'
              )}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-3 rounded-xl font-black text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all">
                {t('إلغاء', 'Cancel')}
              </button>
              <button onClick={handleNewDay} className="flex-1 py-3 rounded-xl font-black text-white bg-amber-600 hover:bg-amber-700 active:scale-95 transition-all">
                {t('بدء يوم جديد', 'Start New Day')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
