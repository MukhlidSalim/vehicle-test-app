// Vehicle-type-specific configuration for handover forms

export type AnswerType = 'binary' | 'level' | 'rating' | 'count' 
  | 'maintenance_state_1' | 'maintenance_state_2' | 'working_state_1' | 'working_state_2' 
  | 'availability_binary' | 'availability_binary_masculine' 
  | 'first_aid_state' | 'first_aid_state_ambulance' | 'fire_extinguisher_state' | 'battery_level';

export interface ItemConfig {
  id: string;
  labelAr: string;
  labelEn: string;
  hasCount?: boolean; // Legacy support
  answerType?: AnswerType; // The new smart answer type, defaults to 'binary'
}

export interface ExtraFieldConfig {
  id: string;
  labelAr: string;
  labelEn: string;
  type: 'text' | 'textarea';
  required?: boolean;
}

export type VehicleCategory = 'light_vehicle' | 'pickup' | 'light_bus' | 'heavy_bus' | 'ambulance' | 'electric';

export interface VehicleCategoryConfig {
  items: ItemConfig[];
  extraFields: ExtraFieldConfig[];
  senderLabelAr: string;
  senderLabelEn: string;
  receiverLabelAr: string;
  receiverLabelEn: string;
  expiryLabel2Ar: string;
  expiryLabel2En: string;
  formTitleAr: string;
  formTitleEn: string;
}

// ======= Common Essentials =======
const ESSENTIAL_ITEMS: ItemConfig[] = [
  { id: 'pre_trip_checklist', labelAr: 'قائمة التدقيق ما قبل الرحلة', labelEn: 'Pre-trip Inspection Checklist', answerType: 'binary' },
  { id: 'vehicle_cleaning', labelAr: 'نظافة المركبة', labelEn: 'Vehicle Cleanliness', answerType: 'rating' },
  { id: 'fuel_level', labelAr: 'مستوى الوقود', labelEn: 'Fuel Level', answerType: 'level' },
];

// ======= Category Specific Items =======
const LIGHT_VEHICLE_ITEMS: ItemConfig[] = [
  { id: 'vehicle_cleaning', labelAr: 'نظافة المركبة', labelEn: 'Vehicle Cleanliness', answerType: 'rating' },
  { id: 'fuel_level', labelAr: 'مستوى الوقود', labelEn: 'Fuel Level', answerType: 'level' },
  { id: 'first_aid_kits', labelAr: 'حقيبة الإسعافات الأولية', labelEn: 'First Aid Kit', answerType: 'first_aid_state' },
  { id: 'fire_extinguisher', labelAr: 'طفاية الحريق', labelEn: 'Fire Extinguisher', answerType: 'fire_extinguisher_state' },
];

const PICKUP_ITEMS: ItemConfig[] = [
  { id: 'vehicle_cleaning', labelAr: 'نظافة المركبة', labelEn: 'Vehicle Cleanliness', answerType: 'rating' },
  { id: 'fuel_level', labelAr: 'مستوى الوقود', labelEn: 'Fuel Level', answerType: 'level' },
  { id: 'first_aid_kits', labelAr: 'حقيبة الإسعافات الأولية', labelEn: 'First Aid Kit', answerType: 'first_aid_state' },
  { id: 'fire_extinguisher', labelAr: 'طفاية الحريق', labelEn: 'Fire Extinguisher', answerType: 'fire_extinguisher_state' },
];

const LIGHT_BUS_ITEMS: ItemConfig[] = [
  { id: 'vehicle_cleaning', labelAr: 'نظافة المركبة', labelEn: 'Vehicle Cleanliness', answerType: 'rating' },
  { id: 'fuel_level', labelAr: 'مستوى الوقود', labelEn: 'Fuel Level', answerType: 'level' },
  { id: 'schedule_docs', labelAr: 'جدول الرحلات', labelEn: 'Trip Schedule', answerType: 'availability_binary_masculine' },
  { id: 'first_aid_kits', labelAr: 'حقيبة الإسعافات الأولية', labelEn: 'First Aid Kit', answerType: 'first_aid_state' },
  { id: 'fire_extinguisher', labelAr: 'طفاية الحريق', labelEn: 'Fire Extinguisher', answerType: 'fire_extinguisher_state' },
  { id: 'mobile_phone', labelAr: 'الهاتف النقال', labelEn: 'Mobile Phone', answerType: 'working_state_2' },
];

const ELECTRIC_ITEMS: ItemConfig[] = [
  { id: 'vehicle_cleaning', labelAr: 'نظافة المركبة', labelEn: 'Vehicle Cleanliness', answerType: 'rating' },
  { id: 'battery_level', labelAr: 'مستوى شحن البطارية', labelEn: 'Battery Charge Level', answerType: 'battery_level' },
  { id: 'first_aid_kits', labelAr: 'حقيبة الإسعافات الأولية', labelEn: 'First Aid Kit', answerType: 'first_aid_state' },
  { id: 'fire_extinguisher', labelAr: 'طفاية الحريق', labelEn: 'Fire Extinguisher', answerType: 'fire_extinguisher_state' },
];

const HEAVY_BUS_ITEMS: ItemConfig[] = [
  { id: 'vehicle_cleaning', labelAr: 'نظافة المركبة', labelEn: 'Vehicle Cleanliness', answerType: 'rating' },
  { id: 'fuel_level', labelAr: 'مستوى الوقود', labelEn: 'Fuel Level', answerType: 'level' },
  { id: 'first_aid_kits', labelAr: 'عدة الإسعافات الأولية', labelEn: 'First Aid Kit', answerType: 'maintenance_state_1' },
  { id: 'aed', labelAr: 'جهاز الإنعاش القلبي (AED)', labelEn: 'Defibrillator (AED)', answerType: 'maintenance_state_2' },
  { id: 'wifi', labelAr: 'نظام الواي فاي', labelEn: 'WiFi System', answerType: 'working_state_1' },
  { id: 'satellite_phone', labelAr: 'هاتف الأقمار الصناعية (الثريا)', labelEn: 'Satellite Phone', answerType: 'working_state_2' },
  { id: 'mobile_phone', labelAr: 'الهاتف النقال', labelEn: 'Mobile Phone', answerType: 'working_state_2' },
  { id: 'fuel_card_shell', labelAr: 'بطاقة تعبئة الوقود (شل)', labelEn: 'Shell Fuel Card', answerType: 'availability_binary' },
  { id: 'fuel_card_oman', labelAr: 'بطاقة تعبئة الوقود (نفط عمان)', labelEn: 'Oman Oil Fuel Card', answerType: 'availability_binary' },
];

const AMBULANCE_ITEMS: ItemConfig[] = [
  { id: 'vehicle_cleaning', labelAr: 'نظافة المركبة', labelEn: 'Vehicle Cleanliness', answerType: 'rating' },
  { id: 'fuel_level', labelAr: 'مستوى الوقود', labelEn: 'Fuel Level', answerType: 'level' },
  { id: 'first_aid_kits', labelAr: 'حقيبة الإسعافات الأولية', labelEn: 'First Aid Kit', answerType: 'first_aid_state_ambulance' },
  { id: 'aed', labelAr: 'جهاز الإنعاش القلبي (AED)', labelEn: 'Defibrillator (AED)', answerType: 'working_state_2' },
  { id: 'fire_extinguisher', labelAr: 'طفاية الحريق', labelEn: 'Fire Extinguisher', answerType: 'fire_extinguisher_state' },
  { id: 'mobile_phone', labelAr: 'الهاتف النقال', labelEn: 'Mobile Phone', answerType: 'working_state_2' },
];

const AMBULANCE_EXTRA_FIELDS: ExtraFieldConfig[] = [
  { id: 'locationsCovered', labelAr: 'المواقع المغطاة', labelEn: 'Locations Covered', type: 'textarea', required: false },
  { id: 'timeToLocation', labelAr: 'وقت الوصول إلى الموقع', labelEn: 'Time to Location', type: 'text', required: false },
];

// ======= Category Resolution =======
export const getVehicleCategory = (vehicleType: string): VehicleCategory => {
  if (['heavy_bus', 'light_bus', 'ambulance', 'pickup', 'electric', 'light_vehicle'].includes(vehicleType)) {
    return vehicleType as VehicleCategory;
  }
  return 'light_vehicle'; 
};

const defaultLabels = {
  senderLabelAr: 'السائق المُسلِّم',
  senderLabelEn: 'Sender Driver',
  receiverLabelAr: 'السائق المُستلِم',
  receiverLabelEn: 'Receiver Driver',
  expiryLabel2Ar: 'تاريخ انتهاء ملصق أوبال',
  expiryLabel2En: 'Opal Sticker Expiry',
};

export const getCategoryConfig = (category: VehicleCategory): VehicleCategoryConfig => {
  switch (category) {
    case 'heavy_bus':
      return {
        items: HEAVY_BUS_ITEMS,
        extraFields: [],
        ...defaultLabels,
        formTitleAr: 'إستمارة تسليم حافلة ثقيلة',
        formTitleEn: 'Heavy Bus Handover Form',
      };
    case 'light_bus':
      return {
        items: LIGHT_BUS_ITEMS,
        extraFields: [],
        ...defaultLabels,
        formTitleAr: 'إستمارة تسليم حافلة خفيفة',
        formTitleEn: 'Light Bus Handover Form',
      };
    case 'pickup':
      return {
        items: PICKUP_ITEMS,
        extraFields: [],
        ...defaultLabels,
        formTitleAr: 'إستمارة تسليم مركبة نقل (بيك أب)',
        formTitleEn: 'Pickup Handover Form',
      };
    case 'electric':
      return {
        items: ELECTRIC_ITEMS,
        extraFields: [],
        ...defaultLabels,
        formTitleAr: 'إستمارة تسليم مركبة كهربائية',
        formTitleEn: 'EV Handover Form',
      };
    case 'ambulance':
      return {
        items: AMBULANCE_ITEMS,
        extraFields: AMBULANCE_EXTRA_FIELDS,
        ...defaultLabels,
        senderLabelAr: 'سائق المناوبة الصباحية',
        senderLabelEn: 'Day Driver',
        receiverLabelAr: 'سائق المناوبة الليلية',
        receiverLabelEn: 'Night Driver',
        formTitleAr: 'قائمة تسليم مناوبة الإسعاف',
        formTitleEn: 'Ambulance Handover Checklist',
      };
    case 'light_vehicle':
    default:
      return {
        items: LIGHT_VEHICLE_ITEMS,
        extraFields: [],
        ...defaultLabels,
        formTitleAr: 'إستمارة تسليم مركبة خفيفة',
        formTitleEn: 'Light Vehicle Handover Form',
      };
  }
};

export const VEHICLE_TYPES_OPTIONS = [
  { value: 'heavy_bus', labelAr: 'حافلة ثقيلة', labelEn: 'Heavy Bus' },
  { value: 'light_bus', labelAr: 'حافلة خفيفة', labelEn: 'Light Bus' },
  { value: 'light_vehicle', labelAr: 'مركبة خفيفة', labelEn: 'Light Vehicle' },
  { value: 'pickup', labelAr: 'بيك أب', labelEn: 'Pickup' },
  { value: 'ambulance', labelAr: 'إسعاف', labelEn: 'Ambulance' },
  { value: 'electric', labelAr: 'مركبة كهربائية', labelEn: 'Electric Vehicle' },
];
