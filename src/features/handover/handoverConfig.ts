// Vehicle-type-specific configuration for handover forms

import { Wifi, ShieldCheck, BatteryCharging, Zap, PlugZap } from 'lucide-react';
import {
  VehicleBodyIcon, FuelIcon, FirstAidIcon, FireExtIcon,
  MobilePhoneIcon, UmbrellasIcon, WaterCartonsIcon,
  ThurayaChargerIcon, FlashlightIcon, ElectronicJackIcon,
  TripScheduleIcon, FuelCardIcon, SatellitePhoneIcon, WheelChocksIcon, DefibrillatorIcon, PhoneCableIcon
} from '../../constants/icons';

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
  icon?: any;
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
  { id: 'pre_trip_checklist', labelAr: 'قائمة التدقيق ما قبل الرحلة', labelEn: 'Pre-trip Inspection Checklist', answerType: 'binary', icon: ShieldCheck },
  { id: 'vehicle_cleaning', labelAr: 'نظافة المركبة', labelEn: 'Vehicle Cleanliness', answerType: 'rating', icon: VehicleBodyIcon },
  { id: 'fuel_level', labelAr: 'مستوى الوقود', labelEn: 'Fuel Level', answerType: 'level', icon: FuelIcon },
];

// ======= Category Specific Items =======
const LIGHT_VEHICLE_ITEMS: ItemConfig[] = [
  { id: 'vehicle_cleaning', labelAr: 'نظافة المركبة', labelEn: 'Vehicle Cleanliness', answerType: 'rating', icon: VehicleBodyIcon },
  { id: 'fuel_level', labelAr: 'مستوى الوقود', labelEn: 'Fuel Level', answerType: 'level', icon: FuelIcon },
  { id: 'first_aid_kits', labelAr: 'حقيبة الإسعافات الأولية', labelEn: 'First Aid Kit', answerType: 'first_aid_state', icon: FirstAidIcon },
  { id: 'fire_extinguisher', labelAr: 'طفاية الحريق', labelEn: 'Fire Extinguisher', answerType: 'fire_extinguisher_state', icon: FireExtIcon },
];

const PICKUP_ITEMS: ItemConfig[] = [
  { id: 'vehicle_cleaning', labelAr: 'نظافة المركبة', labelEn: 'Vehicle Cleanliness', answerType: 'rating', icon: VehicleBodyIcon },
  { id: 'fuel_level', labelAr: 'مستوى الوقود', labelEn: 'Fuel Level', answerType: 'level', icon: FuelIcon },
  { id: 'first_aid_kits', labelAr: 'حقيبة الإسعافات الأولية', labelEn: 'First Aid Kit', answerType: 'first_aid_state', icon: FirstAidIcon },
  { id: 'fire_extinguisher', labelAr: 'طفاية الحريق', labelEn: 'Fire Extinguisher', answerType: 'fire_extinguisher_state', icon: FireExtIcon },
];

const LIGHT_BUS_ITEMS: ItemConfig[] = [
  { id: 'vehicle_cleaning', labelAr: 'نظافة المركبة', labelEn: 'Vehicle Cleanliness', answerType: 'rating', icon: VehicleBodyIcon },
  { id: 'fuel_level', labelAr: 'مستوى الوقود', labelEn: 'Fuel Level', answerType: 'level', icon: FuelIcon },
  { id: 'schedule_docs', labelAr: 'جدول الرحلات', labelEn: 'Trip Schedule', answerType: 'availability_binary_masculine', icon: TripScheduleIcon },
  { id: 'first_aid_kits', labelAr: 'حقيبة الإسعافات الأولية', labelEn: 'First Aid Kit', answerType: 'first_aid_state', icon: FirstAidIcon },
  { id: 'fire_extinguisher', labelAr: 'طفاية الحريق', labelEn: 'Fire Extinguisher', answerType: 'fire_extinguisher_state', icon: FireExtIcon },
  { id: 'mobile_phone', labelAr: 'الهاتف النقال', labelEn: 'Mobile Phone', answerType: 'working_state_2', icon: MobilePhoneIcon },
];

const ELECTRIC_ITEMS: ItemConfig[] = [
  { id: 'vehicle_cleaning', labelAr: 'نظافة المركبة', labelEn: 'Vehicle Cleanliness', answerType: 'rating', icon: VehicleBodyIcon },
  { id: 'battery_level', labelAr: 'مستوى شحن البطارية', labelEn: 'Battery Charge Level', answerType: 'battery_level', icon: BatteryCharging },
  { id: 'first_aid_kits', labelAr: 'حقيبة الإسعافات الأولية', labelEn: 'First Aid Kit', answerType: 'first_aid_state', icon: FirstAidIcon },
  { id: 'fire_extinguisher', labelAr: 'طفاية الحريق', labelEn: 'Fire Extinguisher', answerType: 'fire_extinguisher_state', icon: FireExtIcon },
];

const HEAVY_BUS_ITEMS: ItemConfig[] = [
  { id: 'vehicle_cleaning', labelAr: 'نظافة المركبة', labelEn: 'Vehicle Cleanliness', answerType: 'rating', icon: VehicleBodyIcon },
  { id: 'fuel_level', labelAr: 'مستوى الوقود', labelEn: 'Fuel Level', answerType: 'level', icon: FuelIcon },
  { id: 'first_aid_kits', labelAr: 'عدة الإسعافات الأولية', labelEn: 'First Aid Kit', answerType: 'maintenance_state_1', icon: FirstAidIcon },
  { id: 'aed', labelAr: 'جهاز الإنعاش القلبي (AED)', labelEn: 'Defibrillator (AED)', answerType: 'maintenance_state_2', icon: DefibrillatorIcon },
  { id: 'wifi', labelAr: 'نظام الواي فاي', labelEn: 'WiFi System', answerType: 'working_state_1', icon: Wifi },
  { id: 'satellite_phone', labelAr: 'هاتف الأقمار الصناعية (الثريا)', labelEn: 'Satellite Phone', answerType: 'working_state_2', icon: SatellitePhoneIcon },
  { id: 'mobile_phone', labelAr: 'الهاتف النقال', labelEn: 'Mobile Phone', answerType: 'working_state_2', icon: MobilePhoneIcon },
  { id: 'fuel_card_shell', labelAr: 'بطاقة تعبئة الوقود', labelEn: 'Fuel Card', answerType: 'availability_binary', icon: FuelCardIcon },
  { id: 'water_cartons', labelAr: 'عدد كراتين الماء', labelEn: 'Water Cartons', answerType: 'count', icon: WaterCartonsIcon },
  { id: 'thuraya_charger', labelAr: 'كيبل شحن هاتف الثريا', labelEn: 'Thuraya Charger Cable', answerType: 'working_state_2', icon: ThurayaChargerIcon },
  { id: 'phone_charger', labelAr: 'كيبل شحن الهاتف', labelEn: 'Mobile Phone Charger Cable', answerType: 'working_state_2', icon: PhoneCableIcon },
  { id: 'umbrellas', labelAr: 'المظلات', labelEn: 'Umbrellas', answerType: 'availability_binary', icon: UmbrellasIcon },
  { id: 'flashlight', labelAr: 'المصباح اليدوي', labelEn: 'Flashlight', answerType: 'working_state_2', icon: FlashlightIcon },
  { id: 'wheel_chocks', labelAr: 'مصدات العجلات', labelEn: 'Wheel Chocks', answerType: 'availability_binary', icon: WheelChocksIcon },
];

const AMBULANCE_ITEMS: ItemConfig[] = [
  { id: 'vehicle_cleaning', labelAr: 'نظافة المركبة', labelEn: 'Vehicle Cleanliness', answerType: 'rating', icon: VehicleBodyIcon },
  { id: 'fuel_level', labelAr: 'مستوى الوقود', labelEn: 'Fuel Level', answerType: 'level', icon: FuelIcon },
  { id: 'fuel_card', labelAr: 'بطاقة الوقود', labelEn: 'Fuel Card', answerType: 'availability_binary', icon: FuelCardIcon },
  { id: 'first_aid_kits', labelAr: 'حقيبة الإسعافات الأولية', labelEn: 'First Aid Kit', answerType: 'first_aid_state_ambulance', icon: FirstAidIcon },
  { id: 'aed', labelAr: 'جهاز الإنعاش القلبي (AED)', labelEn: 'Defibrillator (AED)', answerType: 'working_state_2', icon: DefibrillatorIcon },
  { id: 'electronic_jack', labelAr: 'الرافع الإلكتروني', labelEn: 'Electronic Jack', answerType: 'working_state_1', icon: ElectronicJackIcon },
  { id: 'fire_extinguisher', labelAr: 'طفاية الحريق', labelEn: 'Fire Extinguisher', answerType: 'fire_extinguisher_state', icon: FireExtIcon },
  { id: 'mobile_phone', labelAr: 'الهاتف النقال', labelEn: 'Mobile Phone', answerType: 'working_state_2', icon: MobilePhoneIcon },
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
        senderLabelAr: 'السائق',
        senderLabelEn: 'Driver',
        receiverLabelAr: 'السائق المستلم',
        receiverLabelEn: 'Receiver Driver',
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
