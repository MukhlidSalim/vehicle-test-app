import { 
  VehicleBodyIcon, WheelIcon, TyrePressureIcon, LeakIcon, LampIcon, SignalIcon, MirrorIcon, WiperIcon, BatteryIcon, FluidsIcon, FuelIcon, HornIcon, BrakesIcon, ACIcon, IVMSIcon, SeatBeltIcon, FireExtIcon, FirstAidIcon, EmergencyToolsIcon, CommToolsIcon, LuggageIcon, DocumentsIcon, BatteryCharging, Zap, PlugZap, SteeringIcon,
  CustomBeltsIcon, CustomBonnetIcon, CustomBrakeFluidIcon, CustomBrakeLightsIcon, CustomBumpersIcon, CustomCoolantIcon, CustomCurtainsIcon, CustomDashboardIcon, CustomDrinkingWaterIcon, CustomExternalMirrorsIcon, CustomGearLeverIcon, CustomHosesIcon, CustomInteriorLightsIcon, CustomInternalMirrorsIcon, CustomLooseFittingsIcon, CustomPassengerSeatBeltsIcon, CustomPassengerSeatsIcon, CustomReflectorsIcon, CustomSafetyEquipmentIcon, CustomSafetySignageIcon, CustomSteeringFluidIcon, CustomToiletIcon, CustomTyresCondIcon, CustomGaugesIcon, CustomWasherFluidIcon, CustomWindowOpIcon, CustomWindowsCondIcon,
  EVMotorIcon, EVThermalIcon, EVInsulationIcon, EVUndercarriageIcon, EV12VIcon, EVDriveModesIcon, EVOnboardChargerIcon, EVFrunkIcon, EVRegenBrakingIcon, EVTireRepairIcon, EVChargingCableIcon, EVBMSIcon,
  EVReverseAlarmIcon, EVBonnetIcon, EVHosesIcon, EVSunVisorsIcon, EVParkingBrakeIcon, EVGearSelectorIcon, EVSafetyEquipmentIcon, EVWarningTriangleIcon, EVSafetySignageIcon, EVDoorIcon,
  ElectronicGearIcon, RefrigeratorsIcon, ElectricSwitchesIcon, ExhaustSystemIcon, SuspensionSystemIcon, HandBrakeIcon, DoorsStepsIcon
} from './icons';
import { 
  ShieldCheck, ArrowLeftRight, Cctv, Settings, ShieldAlert, Thermometer, BriefcaseMedical, Wrench, Siren, LogOut, DoorOpen, Radio, AlertTriangle, Monitor, Droplets, Plug, Camera, Video, Navigation, Music, Truck, Anchor, PanelLeft, AppWindow, AlertOctagon, RefreshCw, ThermometerSnowflake, Waves, Torus, CarFront, Tag, ArrowLeftToLine, Volume2, Lock, FlaskConical, SprayCan, Link, Cable, Armchair, Baseline, LayoutDashboard, GaugeCircle, Lamp, Blinds, Joystick, HardHat, Hammer, Signpost, GlassWater, Sticker, Nut, ToggleLeft
} from 'lucide-react';

const BASE_MAINTENANCE_CHECKLIST = [
  { id: 1, key: 'body_damage', icon: VehicleBodyIcon },
  { id: 2, key: 'windows', icon: CustomWindowsCondIcon },
  { id: 3, key: 'fluid_leaks', icon: LeakIcon },
  { id: 4, key: 'tyres_condition', icon: CustomTyresCondIcon },
  { id: 5, key: 'tyre_pressure', icon: TyrePressureIcon },
  { id: 6, key: 'spare_tire', icon: WheelIcon },
  { id: 7, key: 'external_mirrors', icon: CustomExternalMirrorsIcon },
  { id: 8, key: 'doors_steps', icon: DoorsStepsIcon },
  { id: 9, key: 'emergency_exits', icon: LogOut },
  { id: 10, key: 'bumpers', icon: CustomBumpersIcon },
  { id: 11, key: 'reflectors', icon: CustomReflectorsIcon },
  { id: 12, key: 'vehicle_markings', icon: Sticker },
  { id: 13, key: 'headlights', icon: LampIcon },
  { id: 14, key: 'brake_lights', icon: CustomBrakeLightsIcon },
  { id: 15, key: 'reverse_lights', icon: ArrowLeftToLine },
  { id: 16, key: 'reverse_alarm', icon: Volume2 },
  { id: 17, key: 'wipers', icon: WiperIcon },
  { id: 18, key: 'loose_fittings', icon: CustomLooseFittingsIcon },
  { id: 19, key: 'bonnet_security', icon: CustomBonnetIcon },
  { id: 20, key: 'battery_condition', icon: BatteryIcon },
  { id: 21, key: 'engine_oil', icon: FluidsIcon },
  { id: 22, key: 'brake_fluid', icon: CustomBrakeFluidIcon },
  { id: 23, key: 'steering_fluid', icon: CustomSteeringFluidIcon },
  { id: 24, key: 'coolant_level', icon: CustomCoolantIcon },
  { id: 25, key: 'washer_fluid', icon: CustomWasherFluidIcon },
  { id: 26, key: 'belts_bearings', icon: CustomBeltsIcon },
  { id: 27, key: 'wiring_condition', icon: Plug },
  { id: 28, key: 'hoses_condition', icon: CustomHosesIcon },
  { id: 29, key: 'tools', icon: EmergencyToolsIcon },
  { id: 30, key: 'driver_seat', icon: SeatBeltIcon },
  { id: 31, key: 'passenger_seats', icon: CustomPassengerSeatsIcon },
  { id: 32, key: 'passenger_seat_belts', icon: CustomPassengerSeatBeltsIcon },
  { id: 33, key: 'internal_mirrors', icon: CustomInternalMirrorsIcon },
  { id: 34, key: 'dashboard', icon: CustomDashboardIcon },
  { id: 35, key: 'warning_indicators', icon: ShieldAlert },
  { id: 36, key: 'gauges', icon: CustomGaugesIcon },
  { id: 37, key: 'horn', icon: HornIcon },
  { id: 38, key: 'interior_lights', icon: CustomInteriorLightsIcon },
  { id: 39, key: 'ac', icon: ACIcon },
  { id: 40, key: 'window_operation', icon: CustomWindowOpIcon },
  { id: 41, key: 'curtains', icon: CustomCurtainsIcon },
  { id: 42, key: 'hand_brake', icon: HandBrakeIcon },
  { id: 43, key: 'gear_lever', icon: CustomGearLeverIcon },
  { id: 44, key: 'safety_kit', icon: FirstAidIcon },
  { id: 45, key: 'fire_ext', icon: FireExtIcon },
  { id: 46, key: 'safety_equipment', icon: CustomSafetyEquipmentIcon },
  { id: 47, key: 'emergency_hammers', icon: Hammer },
  { id: 48, key: 'monitoring_system', icon: IVMSIcon },
  { id: 49, key: 'guardian_system', icon: Cctv },
  { id: 50, key: 'safety_signage', icon: CustomSafetySignageIcon },
  { id: 51, key: 'aed_device', icon: BriefcaseMedical },
  { id: 52, key: 'wifi_system', icon: Radio },
  { id: 53, key: 'tv_system', icon: Video },
  { id: 54, key: 'refrigerators', icon: RefrigeratorsIcon },
  { id: 55, key: 'drinking_water', icon: CustomDrinkingWaterIcon },
  { id: 56, key: 'toilet_condition', icon: CustomToiletIcon },
];

function insertAfter(list: any[], targetKey: string, newItems: any[]) {
  const result = [...list];
  const idx = result.findIndex(i => i.key === targetKey);
  if (idx !== -1) {
    result.splice(idx + 1, 0, ...newItems);
  } else {
    console.error(`insertAfter: Target key "${targetKey}" not found. Appending to the end.`);
    result.push(...newItems);
  }
  return result;
}

export const MAINTENANCE_HEAVY_BUS_CHECKLIST = (() => {
  const list = BASE_MAINTENANCE_CHECKLIST.map(item => {
    if (item.key === 'window_operation') return { ...item, key: 'heavy_electric_switches', icon: ElectricSwitchesIcon };
    if (item.key === 'gear_lever') return { ...item, key: 'heavy_electronic_gear', icon: ElectronicGearIcon };
    if (item.key === 'fire_ext') return { ...item, key: 'fire_ext_1' };
    return item;
  }).filter(item => item.key !== 'safety_signage');
  return insertAfter(list, 'fire_ext_1', [{ id: 999, key: 'fire_ext_2', icon: FireExtIcon }]);
})();

export const MAINTENANCE_LIGHT_BUS_CHECKLIST = (() => {
  const list = [
    ...BASE_MAINTENANCE_CHECKLIST.slice(0, 8),
    { id: 9, key: 'general_interior', icon: ShieldCheck },
    ...BASE_MAINTENANCE_CHECKLIST.slice(9, 40),
    { id: 41, key: 'sun_visors', icon: ShieldCheck },
    ...BASE_MAINTENANCE_CHECKLIST.slice(41, 46),
    { id: 47, key: 'warning_triangle', icon: AlertTriangle },
    ...BASE_MAINTENANCE_CHECKLIST.slice(47, 48),
    { id: 49, key: 'suspension_system', icon: SuspensionSystemIcon },
    { id: 51, key: 'exhaust_system', icon: ExhaustSystemIcon },
    { id: 52, key: 'load_securing', icon: LuggageIcon },
  ].map(item => item.key === 'fire_ext' ? { ...item, key: 'fire_ext_1' } : item);
  return insertAfter(list, 'fire_ext_1', [{ id: 999, key: 'fire_ext_2', icon: FireExtIcon }]);
})();

export const MAINTENANCE_AMBULANCE_CHECKLIST = (() => {
  const list = [
    ...BASE_MAINTENANCE_CHECKLIST
      .slice(0, 49)
      .filter(item => !['emergency_exits', 'curtains', 'emergency_hammers'].includes(item.key)),
    { id: 47, key: 'exhaust_system', icon: ExhaustSystemIcon },
    { id: 49, key: 'suspension_system', icon: SuspensionSystemIcon },
    { id: 50, key: 'emergency_lights', icon: LampIcon },
    { id: 51, key: 'siren_system', icon: Siren },
    { id: 52, key: 'patient_lighting', icon: LampIcon },
  ].map(item => item.key === 'fire_ext' ? { ...item, key: 'fire_ext_1' } : item);
  return insertAfter(list, 'fire_ext_1', [{ id: 999, key: 'fire_ext_2', icon: FireExtIcon }]);
})();

export const MAINTENANCE_LIGHT_VEHICLE_CHECKLIST = [
  ...BASE_MAINTENANCE_CHECKLIST.slice(0, 8),
  { id: 9, key: 'general_interior', icon: ShieldCheck },
  ...BASE_MAINTENANCE_CHECKLIST.slice(9, 40),
  { id: 41, key: 'sun_visors', icon: ShieldCheck },
  ...BASE_MAINTENANCE_CHECKLIST.slice(41, 46),
  { id: 47, key: 'warning_triangle', icon: AlertTriangle },
  ...BASE_MAINTENANCE_CHECKLIST.slice(47, 48),
  { id: 49, key: 'rear_camera', icon: Camera },
  { id: 50, key: 'safety_signage', icon: ShieldAlert },
  { id: 51, key: 'suspension_system', icon: SuspensionSystemIcon },
  { id: 52, key: 'load_securing', icon: LuggageIcon },
];

export const MAINTENANCE_PICKUP_CHECKLIST = [
  ...BASE_MAINTENANCE_CHECKLIST.slice(0, 8),
  { id: 9, key: 'cargo_bed', icon: Truck },
  ...BASE_MAINTENANCE_CHECKLIST.slice(9, 30),
  { id: 31, key: 'cargo_area', icon: Truck },
  { id: 32, key: 'cargo_tie_downs', icon: Anchor },
  ...BASE_MAINTENANCE_CHECKLIST.slice(32, 40),
  { id: 41, key: 'tonneau_cover', icon: ShieldCheck },
  ...BASE_MAINTENANCE_CHECKLIST.slice(41, 46),
  { id: 47, key: 'warning_triangle', icon: AlertTriangle },
  { id: 48, key: 'suspension_system', icon: SuspensionSystemIcon },
  { id: 49, key: 'rear_camera', icon: Camera },
  { id: 50, key: 'safety_signage', icon: ShieldAlert },
  { id: 51, key: 'tow_hitch', icon: Anchor },
  { id: 52, key: 'tailgate', icon: DoorOpen },
];

export const MAINTENANCE_ELECTRIC_CHECKLIST = [
  // === الفحص الخارجي (External Inspection) ===
  { id: 1, key: 'body_damage', icon: VehicleBodyIcon },
  { id: 2, key: 'windows', icon: CustomWindowsCondIcon },
  { id: 3, key: 'fluid_leaks', icon: LeakIcon },
  { id: 4, key: 'tyres_condition', icon: CustomTyresCondIcon },
  { id: 5, key: 'tyre_pressure', icon: TyrePressureIcon },
  { id: 6, key: 'tire_repair_kit', icon: EVTireRepairIcon }, // Replaces spare tire
  { id: 7, key: 'external_mirrors', icon: CustomExternalMirrorsIcon },
  { id: 8, key: 'doors', icon: EVDoorIcon }, // Replaces doors_steps
  { id: 9, key: 'ev_charge_level', icon: BatteryCharging }, // Inserted for EV
  { id: 10, key: 'bumpers', icon: CustomBumpersIcon },
  { id: 11, key: 'reflectors', icon: CustomReflectorsIcon },
  { id: 12, key: 'vehicle_markings', icon: Sticker },
  // === الإضاءة (Lighting) ===
  { id: 13, key: 'headlights', icon: LampIcon },
  { id: 14, key: 'brake_lights', icon: CustomBrakeLightsIcon },
  { id: 15, key: 'reverse_lights', icon: ArrowLeftToLine },
  { id: 16, key: 'reverse_alarm', icon: EVReverseAlarmIcon }, // Updated icon
  { id: 17, key: 'wipers', icon: WiperIcon },
  { id: 18, key: 'loose_fittings', icon: CustomLooseFittingsIcon },
  // === نظام الجهد العالي والمحركات (High Voltage & Motors) ===
  { id: 19, key: 'bonnet_security', icon: EVBonnetIcon }, // Updated icon
  { id: 20, key: 'battery_condition', icon: BatteryIcon },
  { id: 21, key: 'high_voltage_battery', icon: BatteryCharging }, // Inserted for EV
  { id: 22, key: 'brake_fluid', icon: CustomBrakeFluidIcon },
  { id: 23, key: 'high_voltage_cables', icon: Zap }, // Inserted for EV
  { id: 24, key: 'battery_coolant', icon: Thermometer }, // Inserted for EV
  { id: 25, key: 'washer_fluid', icon: CustomWasherFluidIcon },
  { id: 26, key: 'charging_cable', icon: EVChargingCableIcon }, // Inserted for EV
  { id: 27, key: 'wiring_condition', icon: Plug },
  { id: 28, key: 'hoses_condition', icon: EVHosesIcon }, // Updated icon
  // === السلامة والأدوات الداخلية (Safety & Interior Tools) ===
  { id: 29, key: 'tools', icon: EmergencyToolsIcon },
  { id: 30, key: 'driver_seat', icon: SeatBeltIcon },
  { id: 31, key: 'passenger_seats', icon: CustomPassengerSeatsIcon },
  { id: 32, key: 'passenger_seat_belts', icon: CustomPassengerSeatBeltsIcon },
  { id: 33, key: 'internal_mirrors', icon: CustomInternalMirrorsIcon },
  { id: 34, key: 'dashboard', icon: CustomDashboardIcon },
  { id: 35, key: 'warning_indicators', icon: ShieldAlert },
  { id: 36, key: 'gauges', icon: CustomGaugesIcon },
  { id: 37, key: 'horn', icon: HornIcon },
  { id: 38, key: 'interior_lights', icon: CustomInteriorLightsIcon },
  { id: 39, key: 'ac', icon: ACIcon },
  { id: 40, key: 'window_operation', icon: CustomWindowOpIcon },
  { id: 41, key: 'sun_visors', icon: EVSunVisorsIcon }, // Updated icon
  { id: 42, key: 'parking_brake', icon: EVParkingBrakeIcon }, // Replaces hand brake
  { id: 43, key: 'gear_selector', icon: EVGearSelectorIcon }, // Replaces gear lever
  { id: 44, key: 'safety_kit', icon: FirstAidIcon },
  { id: 45, key: 'fire_ext', icon: FireExtIcon },
  { id: 46, key: 'safety_equipment', icon: EVSafetyEquipmentIcon }, // Updated icon
  { id: 47, key: 'warning_triangle', icon: EVWarningTriangleIcon }, // Updated icon
  { id: 48, key: 'suspension_system', icon: Wrench }, // Inserted
  { id: 49, key: 'ev_charging_port', icon: PlugZap }, // Inserted
  { id: 50, key: 'safety_signage', icon: EVSafetySignageIcon }, // Updated icon
  { id: 51, key: 'bms_system', icon: EVBMSIcon }, // Inserted
  { id: 52, key: 'indicators', icon: SignalIcon }, // Inserted
];

