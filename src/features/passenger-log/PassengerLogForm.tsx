import React, { useState, useMemo } from 'react';
import {
  Users, Bus, MapPin, Clock, Hash, User, Calendar,
  Plus, Edit3, Trash2, ChevronLeft, ChevronRight,
  FileText, ArrowLeft, AlertTriangle, Check, X,
  RotateCcw, Download, Share2, ArrowLeftRight
} from 'lucide-react';
import { usePassengerLogSession, Trip, DayInfo } from '../../hooks/usePassengerLogSession';
import { PassengerLogReport } from './PassengerLogReport';
import { CustomDatePicker } from '../../components/CustomDatePicker';
import { CustomTimePicker } from '../../components/CustomTimePicker';
import { OmanPlateInput } from '../../components/OmanPlateInput';

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
  const [showNoteForm, setShowNoteForm] = useState(false);

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
    if (!dayInfo.date) { showAlert(t('يرجى إدخال التاريخ', 'Please enter date')); return false; }
    if (dayInfo.date > new Date().toISOString().split('T')[0]) { showAlert(t('لا يمكن تسجيل السجل بتاريخ مستقبلي', 'Cannot record log with a future date')); return false; }
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
      <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <button onClick={onExit} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors">
            <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
            {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
          <div className="flex items-center gap-2">
            <Users size={18} className="text-primary-600" />
            <span className="text-sm font-black text-gray-800">
              {t('استمارة تسجيل الركاب', 'Passenger Registration Log')}
            </span>
          </div>
        </div>
      </div>

      {/* ===== STEP: SETUP (Day Info) ===== */}
      {step === 'setup' && (
        <div className="space-y-4 animate-fade-in relative">
          <h2 className="text-lg font-black text-gray-800 v-center-cairo justify-start px-2">
            {t('البيانات الأساسية', 'Basic Data')}
          </h2>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-300 space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Plate */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('رقم اللوحة *', 'Vehicle Plate *')}</label>
                <input
                  value={dayInfo.vehiclePlate}
                  onChange={e => setDayInfo({ ...dayInfo, vehiclePlate: e.target.value })}
                  placeholder={t('أدخل رقم اللوحة', 'Enter vehicle plate')}
                  className={`w-full p-3.5 border rounded-xl outline-none font-bold text-base transition-all duration-300 ${attemptedSubmit && !dayInfo.vehiclePlate.trim() ? 'border-red-500 bg-red-50 focus:ring-4 focus:ring-red-500/20' : 'border-gray-300 bg-gray-50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white'}`}
                />
              </div>

              {/* Driver Name */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('اسم السائق *', 'Driver Name *')}</label>
                <input
                  value={dayInfo.driverName}
                  onChange={e => setDayInfo({ ...dayInfo, driverName: e.target.value })}
                  placeholder={t('أدخل اسم السائق', 'Enter driver name')}
                  className={`w-full p-3.5 border rounded-xl outline-none font-bold text-base transition-all duration-300 ${attemptedSubmit && !dayInfo.driverName.trim() ? 'border-red-500 bg-red-50 focus:ring-4 focus:ring-red-500/20' : 'border-gray-300 bg-gray-50 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white'}`}
                />
              </div>

              {/* Date (auto-filled) */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('التاريخ', 'Date')}</label>
                <CustomDatePicker
                  value={dayInfo.date}
                  onChange={val => setDayInfo({ ...dayInfo, date: val })}
                  isRTL={isRTL}
                />
              </div>

              {/* Vehicle Class */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('رمز التصنيف *', 'Vehicle Class *')}</label>
                <div className="grid grid-cols-4 gap-2 h-full items-start">
                  {VEHICLE_CLASSES.map(cls => (
                    <button
                      key={cls}
                      onClick={() => setDayInfo({ ...dayInfo, vehicleClass: cls })}
                      className={`py-3.5 rounded-xl font-black text-base border-2 transition-all duration-200 flex items-center justify-center ${
                        dayInfo.vehicleClass === cls
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md shadow-primary-500/20'
                          : `border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:bg-gray-50 ${attemptedSubmit && !dayInfo.vehicleClass ? 'border-red-300' : ''}`
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="pt-2">
            <button
              onClick={handleStartDay}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-lg transition-all flex items-center justify-center gap-3"
            >
              <Bus size={24} />
              {t('بدء التسجيل', 'Start Logging')}
            </button>
          </div>
        </div>
      )}

      {/* ===== STEP: LOG (Trip Registration) ===== */}
      {step === 'log' && (
        <div className="space-y-5 animate-fade-in">

          {/* Day Summary Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: t('المركبة', 'Vehicle'), value: dayInfo.vehiclePlate, icon: <Bus size={12} className="text-primary-600" /> },
                { label: t('السائق', 'Driver'), value: dayInfo.driverName, icon: <User size={12} className="text-blue-600" /> },
                { label: t('التصنيف', 'Class'), value: dayInfo.vehicleClass, icon: <Hash size={12} className="text-purple-600" /> },
                { label: t('التاريخ', 'Date'), value: dayInfo.date, icon: <Calendar size={12} className="text-amber-600" /> },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{item.icon} {item.label}</div>
                  <div className="text-xs font-black text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{item.value || '-'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-primary-50 rounded-xl p-3 border border-primary-100 text-center">
              <div className="text-xl font-black text-primary-700">{trips.length}</div>
              <div className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">{t('النقلات', 'Trips')}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 text-center">
              <div className="text-xl font-black text-blue-700">{totalPassengers}</div>
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{t('الركاب', 'Passengers')}</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 border border-purple-100 text-center">
              <div className="text-base font-black text-purple-700 mt-1">{routineCount}<span className="text-gray-400 mx-1">/</span>{shiftCount}</div>
              <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">{t('روتين/مناوب', 'Routine/Shift')}</div>
            </div>
          </div>

          {/* Trip List */}
          {trips.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-black text-gray-800 v-center-cairo justify-start flex items-center gap-2">
                  <FileText size={20} className="text-gray-500" />
                  {t('النقلات المسجلة', 'Registered Trips')}
                </h2>
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">{trips.length} {t('نقلة', 'trips')}</span>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-300 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full table-fixed text-[9px] sm:text-[10px] md:text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="px-0.5 md:px-4 py-2 md:py-3 text-center font-black text-gray-700 w-[8%]">#</th>
                      <th className="px-0.5 md:px-4 py-2 md:py-3 text-center font-black text-gray-700 w-[18%]">{t('النوع', 'Type')}</th>
                      <th className="px-0.5 md:px-4 py-2 md:py-3 text-center font-black text-gray-700 w-[18%]">{t('من', 'From')}</th>
                      <th className="px-0.5 md:px-4 py-2 md:py-3 text-center font-black text-gray-700 w-[18%]">{t('إلى', 'To')}</th>
                      <th className="px-0.5 md:px-4 py-2 md:py-3 text-center font-black text-gray-700 w-[10%]">{t('الركاب', 'Pax')}</th>
                      <th className="px-0.5 md:px-4 py-2 md:py-3 text-center font-black text-gray-700 w-[14%]">{t('الوقت', 'Time')}</th>
                      <th className="px-0.5 md:px-4 py-2 md:py-3 text-center font-black text-gray-700 w-[14%]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white text-center">
                    {trips.map((trip, idx) => (
                      <tr key={trip.id} className="group hover:bg-primary-50/50 transition-colors">
                        <td className="px-0.5 md:px-4 py-2 md:py-4 font-black text-gray-500">
                          {idx + 1}
                        </td>
                        <td className="px-0.5 md:px-4 py-2 md:py-4">
                          <div className={`text-[8px] md:text-xs font-black px-1 md:px-2.5 py-1 rounded-md md:rounded-lg overflow-hidden text-ellipsis ${
                            trip.type === 'routine' ? 'bg-primary-100 text-primary-700 border border-primary-200' : 'bg-purple-100 text-purple-700 border border-purple-200'
                          }`}>
                            {trip.type === 'routine' ? t('روتينية', 'Routine') : t('مناوبة', 'Shift')}
                          </div>
                        </td>
                        <td className="px-0.5 md:px-4 py-2 md:py-4 font-bold text-gray-800 truncate" title={trip.pickupLocation}>
                          {trip.pickupLocation}
                        </td>
                        <td className="px-0.5 md:px-4 py-2 md:py-4 font-bold text-gray-800 truncate" title={trip.dropoffLocation}>
                          {trip.dropoffLocation}
                        </td>
                        <td className="px-0.5 md:px-4 py-2 md:py-4 font-black text-gray-900 text-[10px] md:text-base">
                          {trip.passengerCount}
                        </td>
                        <td className="px-0.5 md:px-4 py-2 md:py-4 font-bold text-gray-600 truncate">
                          {trip.time}
                        </td>
                        <td className="px-0.5 md:px-4 py-2 md:py-4">
                          <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
                            <button
                              onClick={() => handleEditTrip(trip)}
                              className="p-1 text-blue-600 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                              title={t('تعديل', 'Edit')}
                            >
                              <Edit3 size={12} className="md:w-4 md:h-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(trip.id)}
                              className="p-1 text-red-600 rounded bg-red-50 hover:bg-red-100 transition-colors"
                              title={t('حذف', 'Delete')}
                            >
                              <Trash2 size={12} className="md:w-4 md:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </section>
          )}

          {/* Empty State */}
          {trips.length === 0 && !showAddTrip && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-10 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Bus size={28} className="text-gray-300" />
              </div>
              <h3 className="text-base font-black text-gray-400">{t('لا توجد نقلات مسجلة بعد', 'No trips registered yet')}</h3>
              <p className="text-xs text-gray-400 font-bold mt-1">{t('اضغط على "إضافة نقلة" لبدء التسجيل', 'Click "Add Trip" to start logging')}</p>
            </div>
          )}

          {/* Add Trip Form */}
          {showAddTrip && (
            <section className="space-y-4 animate-fade-in relative">
              <h2 className="text-lg font-black text-gray-800 v-center-cairo justify-start gap-2 px-2">
                {editingTripId ? <Edit3 size={20} className="text-amber-600" /> : <Plus size={20} className="text-primary-600" />}
                {editingTripId ? t('تعديل النقلة', 'Edit Trip') : t('إضافة نقلة جديدة', 'Add New Trip')}
              </h2>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary-300 space-y-6">

              {/* Trip Type */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('نوع النقلة *', 'Trip Type *')}</label>
                <div className="grid grid-cols-2 gap-4">
                  {TRIP_TYPES.map(tt => (
                      <button
                      key={tt.value}
                      onClick={() => setNewTrip({ ...newTrip, type: tt.value })}
                      className={`p-3.5 rounded-xl font-black text-sm border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                        newTrip.type === tt.value
                          ? tt.value === 'routine'
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                            : 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">{tt.icon}</span>
                      {isRTL ? tt.labelAr : tt.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pickup & Dropoff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('نقطة الانطلاق *', 'Starting Point *')}</label>
                  <select
                    value={newTrip.pickupLocation}
                    onChange={e => setNewTrip({ ...newTrip, pickupLocation: e.target.value })}
                    className={`w-full p-3.5 border rounded-xl outline-none font-bold text-base transition-all duration-300 bg-gray-50 appearance-none ${
                      !newTrip.pickupLocation ? 'text-gray-400' : 'text-gray-900'
                    } ${attemptedSubmit && !newTrip.pickupLocation ? 'border-red-500 focus:ring-4 focus:ring-red-500/20' : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white'}`}
                  >
                    <option value="">{t('اختر', 'Select')}</option>
                    {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('نقطة الوصول *', 'Arrival Point *')}</label>
                  <select
                    value={newTrip.dropoffLocation}
                    onChange={e => setNewTrip({ ...newTrip, dropoffLocation: e.target.value })}
                    className={`w-full p-3.5 border rounded-xl outline-none font-bold text-base transition-all duration-300 bg-gray-50 appearance-none ${
                      !newTrip.dropoffLocation ? 'text-gray-400' : 'text-gray-900'
                    } ${attemptedSubmit && !newTrip.dropoffLocation ? 'border-red-500 focus:ring-4 focus:ring-red-500/20' : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white'}`}
                  >
                    <option value="">{t('اختر', 'Select')}</option>
                    {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
              </div>

              {/* Passenger Count & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('عدد الركاب *', 'Passengers *')}</label>
                  <input
                    type="number"
                    min="1"
                    value={newTrip.passengerCount}
                    onChange={e => setNewTrip({ ...newTrip, passengerCount: e.target.value })}
                    placeholder="0"
                    className={`w-full p-3.5 border rounded-xl outline-none font-bold text-base transition-all duration-300 bg-gray-50 ${attemptedSubmit && !newTrip.passengerCount ? 'border-red-500 focus:ring-4 focus:ring-red-500/20' : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('التوقيت *', 'Time *')}</label>
                  <CustomTimePicker
                    value={newTrip.time}
                    onChange={val => setNewTrip({ ...newTrip, time: val })}
                    isRTL={isRTL}
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                <button
                  onClick={resetTripForm}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-black text-sm hover:bg-gray-200 active:scale-95 transition-all"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  onClick={handleSaveTrip}
                  className="flex-1 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  {editingTripId ? t('حفظ التعديلات', 'Save Changes') : t('إضافة النقلة', 'Add Trip')}
                </button>
              </div>
            </div>
            </section>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {!showAddTrip && (
              <button
                onClick={() => { resetTripForm(); setShowAddTrip(true); }}
                className="w-full py-4 border-2 border-dashed border-primary-300 text-primary-600 rounded-2xl font-black text-base hover:bg-primary-50 transition-all flex items-center justify-center gap-2 shadow-sm bg-white"
              >
                <Plus size={20} />
                {t('إضافة نقلة جديدة', 'Add New Trip')}
              </button>
            )}
            
            {!showNoteForm && (
              <button
                onClick={() => setShowNoteForm(true)}
                className="w-full py-3.5 border border-dashed border-gray-300 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-50 hover:text-gray-700 hover:border-gray-400 transition-all flex items-center justify-center gap-2 bg-white"
              >
                <FileText size={18} />
                {t('إضافة ملاحظة', 'Add Note')}
              </button>
            )}
          </div>

          {/* Note Form */}
          {showNoteForm && (
            <section className="space-y-4 animate-fade-in relative mt-6">
              <h2 className="text-lg font-black text-gray-800 v-center-cairo justify-start gap-2 px-2">
                <FileText size={20} className="text-gray-500" />
                {t('ملاحظات', 'Notes')}
              </h2>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-300 space-y-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">{t('الملاحظات (اختياري)', 'Notes (Optional)')}</label>
                  <textarea
                    value={dayInfo.notes || ''}
                    onChange={e => setDayInfo({...dayInfo, notes: e.target.value})}
                    placeholder={t('اكتب ملاحظاتك هنا...', 'Type your notes here...')}
                    className="w-full p-3.5 border border-gray-300 bg-gray-50 rounded-xl font-bold focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all outline-none min-h-[100px] resize-y"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowNoteForm(false)}
                    className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-black text-sm hover:bg-gray-200 active:scale-95 transition-all"
                  >
                    {t('إغلاق', 'Close')}
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 mt-8">
            {trips.length > 0 && (
              <button
                onClick={() => setStep('report')}
                className="flex-1 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
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
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 mt-8">
            <button
              onClick={() => setStep('log')}
              className="flex-1 py-3.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-black text-sm shadow-sm hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
              {t('العودة للتسجيل', 'Back to Log')}
            </button>
            <button
              onClick={() => { resetTripForm(); setShowAddTrip(true); setStep('log'); }}
              className="flex-1 py-3.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-xl font-black text-sm shadow-sm hover:bg-primary-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              {t('إضافة نقلة جديدة', 'Add New Trip')}
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex-1 py-3.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-black text-sm shadow-sm hover:bg-amber-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
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
