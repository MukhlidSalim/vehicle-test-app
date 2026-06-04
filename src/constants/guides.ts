import { 
  Moon, Coffee, Timer, MapPin, Shield, Siren, Disc, Lightbulb, Droplet, CircleDot, BatteryFull, ShieldAlert, AlertTriangle, UserCheck, Triangle, PhoneCall, Map, Thermometer, Smartphone, Anchor, Settings 
} from './icons';

export const DRIVER_GUIDES = [
  { section: 'fatigue', icon: Moon, color: 'bg-purple-50 text-purple-600', titleKey: 'guide_sleep_title', textKey: 'guide_sleep_text' },
  { section: 'fatigue', icon: Coffee, color: 'bg-amber-50 text-amber-600', titleKey: 'guide_breaks_title', textKey: 'guide_breaks_text' },
  { section: 'rules', icon: Timer, color: 'bg-blue-50 text-blue-600', titleKey: 'guide_hours_title', textKey: 'guide_hours_text' },
  { section: 'rules', icon: MapPin, color: 'bg-indigo-50 text-indigo-600', titleKey: 'guide_gps_title', textKey: 'guide_gps_text' },
  { section: 'safety', icon: Shield, color: 'bg-red-50 text-red-600', titleKey: 'guide_belt_title', textKey: 'guide_belt_text' },
  { section: 'safety', icon: Siren, color: 'bg-orange-50 text-orange-600', titleKey: 'guide_emergency_title', textKey: 'guide_emergency_text' },
];

export const VEHICLE_GUIDES = [
  { icon: Disc, color: 'bg-blue-50 text-blue-600', titleKey: 'v_guide_tyre_title', textKey: 'v_guide_tyre_text' },
  { icon: Lightbulb, color: 'bg-amber-50 text-amber-600', titleKey: 'v_guide_light_title', textKey: 'v_guide_light_text' },
  { icon: Droplet, color: 'bg-emerald-50 text-emerald-600', titleKey: 'v_guide_fluid_title', textKey: 'v_guide_fluid_text' },
  { icon: CircleDot, color: 'bg-red-50 text-red-600', titleKey: 'v_guide_brake_title', textKey: 'v_guide_brake_text' },
  { icon: BatteryFull, color: 'bg-purple-50 text-purple-600', titleKey: 'v_guide_battery_title', textKey: 'v_guide_battery_text' },
  { icon: ShieldAlert, color: 'bg-orange-50 text-orange-600', titleKey: 'v_guide_kit_title', textKey: 'v_guide_kit_text' },
];

export const EMERGENCY_PROCEDURES = [
  { icon: MapPin, color: 'bg-red-50 text-red-600', titleKey: 'ep_stop_title', textKey: 'ep_stop_text' },
  { icon: AlertTriangle, color: 'bg-amber-50 text-amber-600', titleKey: 'ep_hazard_title', textKey: 'ep_hazard_text' },
  { icon: UserCheck, color: 'bg-blue-50 text-blue-600', titleKey: 'ep_vest_title', textKey: 'ep_vest_text' },
  { icon: Triangle, color: 'bg-orange-50 text-orange-600', titleKey: 'ep_triangle_title', textKey: 'ep_triangle_text' },
  { icon: PhoneCall, color: 'bg-emerald-50 text-emerald-600', titleKey: 'ep_contact_title', textKey: 'ep_contact_text' },
  { icon: ShieldAlert, color: 'bg-gray-50 text-gray-600', titleKey: 'ep_safety_title', textKey: 'ep_safety_text' },
];

export const PRE_TRIP_TIPS = [
  { icon: Map, color: 'bg-blue-50 text-blue-600', titleKey: 'pt_route_title', textKey: 'pt_route_text' },
  { icon: Thermometer, color: 'bg-amber-50 text-amber-600', titleKey: 'pt_weather_title', textKey: 'pt_weather_text' },
  { icon: Smartphone, color: 'bg-emerald-50 text-emerald-600', titleKey: 'pt_comm_title', textKey: 'pt_comm_text' },
  { icon: Droplet, color: 'bg-cyan-50 text-cyan-600', titleKey: 'pt_water_title', textKey: 'pt_water_text' },
  { icon: Anchor, color: 'bg-indigo-50 text-indigo-600', titleKey: 'pt_cargo_title', textKey: 'pt_cargo_text' },
  { icon: Settings, color: 'bg-purple-50 text-purple-600', titleKey: 'pt_mirrors_title', textKey: 'pt_mirrors_text' },
];
