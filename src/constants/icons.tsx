import React from 'react';
import { 
  BatteryFull, Volume2, ShieldCheck, Fuel, Waves, Lightbulb, ArrowLeftRight, Eye, CircleDot, IdCard, Car, Disc, Gauge, Droplets, Droplet, Flame, BriefcaseMedical, Wrench, Snowflake, Cctv, Moon, Coffee, Navigation, Stethoscope, MapPin, Siren, CloudLightning, Shield, Timer, FileCheck, CircleDashed, Radio, Package, PhoneOff, LifeBuoy, LogOut, DoorOpen, Settings, AlertTriangle, LightbulbOff, ShieldAlert, HelpCircle, Triangle, PhoneCall, UserCheck, Map, Thermometer, Smartphone, Anchor, Pill, CloudSunRain, ClipboardCheck, BedDouble, BatteryCharging, Zap, PlugZap
} from 'lucide-react';

// Helper to create image-based icons with normalized visual sizing and blue color filtering
export const ImageIcon = (url: string, alt: string) => ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('div', {
    style: { 
      width: size, 
      height: size, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '1px'
    },
    className: className,
  }, 
    React.createElement('img', {
      src: url,
      style: { 
        maxWidth: '100%', 
        maxHeight: '100%', 
        objectFit: 'contain',
        filter: 'brightness(0) saturate(100%) invert(31%) sepia(94%) saturate(2335%) hue-rotate(184deg) brightness(92%) contrast(101%)'
      },
      alt: alt
    })
  )
);

// Custom image icons using local assets
export const BatteryIcon = ImageIcon("/assets/icons/car_battery.png", "Battery");
export const HornIcon = ImageIcon("/assets/icons/horn.png", "Horn");
export const FuelIcon = ImageIcon("/assets/icons/gas_station_1.png", "Fuel");
export const WiperIcon = ImageIcon("/assets/icons/wiper.png", "Wiper");
export const LampIcon = ImageIcon("/assets/icons/fog_lamp.png", "Lamp");
export const FirstAidIcon = ImageIcon("/assets/icons/first_aid_kit.png", "First Aid");
export const SignalIcon = ImageIcon("/assets/icons/turn_signal.png", "Signal");
export const MirrorIcon = ImageIcon("/assets/icons/mirror.png", "Mirror");
export const BrakesIcon = ImageIcon("/assets/icons/disc_brake.png", "Brakes");
export const PlateIcon = ImageIcon("/assets/icons/license-plate-1.png", "Plate");
export const VehicleBodyIcon = ImageIcon("/assets/icons/inspection.png", "Vehicle Body");
export const WheelIcon = ImageIcon("/assets/icons/car_wheel.png", "Wheel");
export const TyrePressureIcon = ImageIcon("/assets/icons/tyre-1.png", "Tyre Pressure");
export const FluidsIcon = ImageIcon("/assets/icons/water-tank.png", "Fluids");
export const LeakIcon = ImageIcon("/assets/icons/car.png", "Leaks");
export const FireExtIcon = ImageIcon("/assets/icons/fire_extinguisher.png", "Fire Extinguisher");
export const EmergencyToolsIcon = ImageIcon("/assets/icons/car_repair.png", "Emergency Tools");
export const ACIcon = ImageIcon("/assets/icons/air_conditioner.png", "AC");
export const IVMSIcon = ImageIcon("/assets/icons/connected_car.png", "IVMS");
export const SpareTyreIcon = ImageIcon("/assets/icons/car_with_spare_tire.png", "Spare Tyre");
export const SeatBeltIcon = ImageIcon("/assets/icons/seabelt-SVG.png", "Seat Belt");
export const CommToolsIcon = ImageIcon("/assets/icons/smartphone.png", "Communication");
export const LuggageIcon = ImageIcon("/assets/icons/suitcase.png", "Luggage");
export const DocumentsIcon = ImageIcon("/assets/icons/registration.png", "Documents");
export const SteeringIcon = ImageIcon("/assets/icons/steering-wheel.png", "Steering");

// New Custom Icons (Maintenance)
export const CustomBeltsIcon = ImageIcon("/assets/icons/Belts Condition.png", "Belts Condition");
export const CustomBonnetIcon = ImageIcon("/assets/icons/Bonnet Security.png", "Bonnet Security");
export const CustomBrakeFluidIcon = ImageIcon("/assets/icons/Brake Fluid.png", "Brake Fluid");
export const CustomBrakeLightsIcon = ImageIcon("/assets/icons/Brake Lights.png", "Brake Lights");
export const CustomBumpersIcon = ImageIcon("/assets/icons/Bumpers Condition.png", "Bumpers Condition");
export const CustomCoolantIcon = ImageIcon("/assets/icons/Coolant Level.png", "Coolant Level");
export const CustomCurtainsIcon = ImageIcon("/assets/icons/Curtains.png", "Curtains");
export const CustomDashboardIcon = ImageIcon("/assets/icons/Dashboard Panel.png", "Dashboard Panel");
export const CustomDrinkingWaterIcon = ImageIcon("/assets/icons/Drinking Water.png", "Drinking Water");
export const CustomExternalMirrorsIcon = ImageIcon("/assets/icons/External Mirrors.png", "External Mirrors");
export const CustomGearLeverIcon = ImageIcon("/assets/icons/Gear Lever.png", "Gear Lever");
export const CustomHosesIcon = ImageIcon("/assets/icons/Hoses Condition.png", "Hoses Condition");
export const CustomInteriorLightsIcon = ImageIcon("/assets/icons/Interior Lights.png", "Interior Lights");
export const CustomInternalMirrorsIcon = ImageIcon("/assets/icons/Internal Mirrors.png", "Internal Mirrors");
export const CustomLooseFittingsIcon = ImageIcon("/assets/icons/Loose Fittings.png", "Loose Fittings");
export const CustomPassengerSeatBeltsIcon = ImageIcon("/assets/icons/Passenger Seat Belts.png", "Passenger Seat Belts");
export const CustomPassengerSeatsIcon = ImageIcon("/assets/icons/Passenger Seats.png", "Passenger Seats");
export const CustomReflectorsIcon = ImageIcon("/assets/icons/Reflectors.png", "Reflectors");
export const CustomSafetyEquipmentIcon = ImageIcon("/assets/icons/Safety Equipment.png", "Safety Equipment");
export const CustomSafetySignageIcon = ImageIcon("/assets/icons/Safety Signage.png", "Safety Signage");
export const CustomSteeringFluidIcon = ImageIcon("/assets/icons/Steering Fluid.png", "Steering Fluid");
export const CustomToiletIcon = ImageIcon("/assets/icons/Toilet Condition.png", "Toilet Condition");
export const CustomTyresCondIcon = ImageIcon("/assets/icons/Tyre Condition (Incl. DOT).png", "Tyre Condition");
export const CustomGaugesIcon = ImageIcon("/assets/icons/Vehicle Gauges.png", "Vehicle Gauges");
export const CustomWasherFluidIcon = ImageIcon("/assets/icons/Washer Fluid.png", "Washer Fluid");
export const CustomWindowOpIcon = ImageIcon("/assets/icons/Window Operation.png", "Window Operation");
export const CustomWindowsCondIcon = ImageIcon("/assets/icons/Windows Condition.png", "Windows Condition");

export {
  BatteryFull, Volume2, ShieldCheck, Fuel, Waves, Lightbulb, ArrowLeftRight, Eye, CircleDot, IdCard, Car, Disc, Gauge, Droplets, Droplet, Flame, BriefcaseMedical, Wrench, Snowflake, Cctv, Moon, Coffee, Navigation, Stethoscope, MapPin, Siren, CloudLightning, Shield, Timer, FileCheck, CircleDashed, Radio, Package, PhoneOff, LifeBuoy, LogOut, DoorOpen, Settings, AlertTriangle, LightbulbOff, ShieldAlert, HelpCircle, Triangle, PhoneCall, UserCheck, Map, Thermometer, Smartphone, Anchor, Pill, CloudSunRain, ClipboardCheck, BedDouble, BatteryCharging, Zap, PlugZap
};
