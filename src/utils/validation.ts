import { InspectionData, CheckStatus } from '../types';
import { READINESS_QUESTIONS } from '../constants';

export interface ValidationResult {
  isValid: boolean;
  messageKey: string;
}

export const validateBasicInfo = (data: InspectionData): ValidationResult => {
  const { name, plateNumber, phoneNumber, currentOdometer, odometer, vehicleType, departure, destination, vehicleExpiryDate, opalExpiryDate, vocExpiryDate } = data.driverInfo;
  
  // Common required fields
  let isValid = Boolean(name && phoneNumber && plateNumber && currentOdometer && odometer && vehicleType);
  
  // Mode specific required fields
  if (data.mode === 'full' || data.mode === 'driver_only') {
    if (!departure || !destination) isValid = false;
  } else if (data.mode === 'maintenance') {
    if (!vehicleExpiryDate || !vocExpiryDate) isValid = false;
  } else {
    if (!vehicleExpiryDate) isValid = false;
  }

  return {
    isValid,
    messageKey: 'required',
  };
};

export const validateChecklist = (data: InspectionData, isRTL: boolean): ValidationResult => {
  const uncheckedItems = data.checklist.filter((i) => i.status === 'unchecked');
  
  const bodyItem = data.checklist.find((i) => i.key === 'body_damage');
  const bdPts = bodyItem?.damagePoints || [];
  const missingBody = (bdPts.length === 0) || bdPts.some((p) => !p?.note || String(p.note).trim().length === 0);
  
  const missingNotesItems = data.checklist.filter((i) => {
    if (i.key === 'body_damage') return (i.status === 'warning' || i.status === 'fail') ? missingBody : false;
    const wf = i.status === 'warning' || i.status === 'fail';
    if (!wf) return false;
    return !i.notes || String(i.notes).trim().length === 0;
  });

  const fireExtItem = data.checklist.find((i) => i.key === 'fire_ext');
  const missingFireExpiry = fireExtItem && fireExtItem.status !== 'unchecked' && !fireExtItem.expiryDate;

  const safetyKitItem = data.checklist.find((i) => i.key === 'safety_kit');
  const missingSafetyExpiry = safetyKitItem && safetyKitItem.status !== 'unchecked' && !safetyKitItem.expiryDate;

  if (uncheckedItems.length > 0) {
    return {
      isValid: false,
      messageKey: isRTL ? 'يرجى فحص جميع العناصر المطلوبة قبل المتابعة.' : 'Please inspect all required items before proceeding.',
    };
  }
  if (missingFireExpiry || missingSafetyExpiry) {
    return {
      isValid: false,
      messageKey: isRTL ? 'يرجى إدخال تاريخ انتهاء الصلاحية لجميع العناصر المطلوبة قبل المتابعة.' : 'Please enter all required expiry dates before proceeding.',
    };
  }
  if (missingNotesItems.length > 0) {
    return {
      isValid: false,
      messageKey: isRTL ? 'يرجى كتابة الملاحظات لجميع عناصر (تنبيه/ضرر) وإضافة نقطة واحدة على الأقل مع وصف لكل ضرر في هيكل المركبة.' : 'Please add notes for all Warning/Fail items and add at least one body-damage point with a description for each point.',
    };
  }

  return { isValid: true, messageKey: '' };
};

export const validateDriverReadiness = (data: InspectionData, isRTL: boolean): ValidationResult => {
  const allAnswered = Object.keys(data.readiness.answers).length >= READINESS_QUESTIONS.length;
  if (!allAnswered) {
    return {
      isValid: false,
      messageKey: isRTL ? 'يرجى الإجابة على جميع بنود الجاهزية بنعم أو لا.' : 'Please answer all readiness items with Yes or No.',
    };
  }
  return { isValid: true, messageKey: '' };
};
