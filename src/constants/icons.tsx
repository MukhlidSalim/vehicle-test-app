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

export const SmartImageIcon = (url: string, alt: string, zoom: number = 1.0) => ({ size = 20, className = "" }: { size?: number, className?: string }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  React.useEffect(() => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Target blue color: #0284c7 -> RGB(2, 132, 199)
      const targetR = 2;
      const targetG = 132;
      const targetB = 199;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const a = data[i+3];
        
        // If pixel is already fully transparent, ignore it
        if (a < 10) continue;
        
        // Calculate brightness (0 to 255)
        const brightness = (r + g + b) / 3;
        
        // Calculate darkness intensity for alpha masking
        // Pure white (255) -> intensity 0 -> fully transparent
        // Pure black (0) -> intensity 1 -> fully opaque
        let intensity = 1 - (brightness / 255);
        intensity = Math.max(0, intensity - 0.05); // threshold to ensure pure white bg is stripped
        
        data[i] = targetR;
        data[i+1] = targetG;
        data[i+2] = targetB;
        data[i+3] = Math.round(intensity * 255 * 1.5); // Boost opacity of lines
      }
      
      ctx.putImageData(imageData, 0, 0);
    };
  }, [url]);

  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1px' }} className={className}>
      <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transform: `scale(${zoom})` }} title={alt} />
    </div>
  );
};

export const ElectronicGearIcon = SmartImageIcon("/assets/icons/ElectronicGearButtons.png", "Electronic Gear", 1.3);
export const RefrigeratorsIcon = SmartImageIcon("/assets/icons/Refrigerators.png", "Refrigerators", 1.3);
export const ElectricSwitchesIcon = SmartImageIcon("/assets/icons/ElectricSwitches.png", "Electric Switches", 1.3);
export const ExhaustSystemIcon = SmartImageIcon("/assets/icons/ExhaustSystem.png", "Exhaust System", 1.1);
export const SuspensionSystemIcon = SmartImageIcon("/assets/icons/SuspensionSystem.png", "Suspension System", 1.5);
export const HandBrakeIcon = SmartImageIcon("/assets/icons/HandBrake.png", "Hand Brake", 1.3);
export const DoorsStepsIcon = SmartImageIcon("/assets/icons/bus-Doors-Steps.png", "Doors and Steps", 1.5);
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

// EV-Specific Custom SVG Icons
export const EVMotorIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('circle', { cx: 12, cy: 12, r: 7 }),
    React.createElement('path', { d: "M12 5V2" }),
    React.createElement('path', { d: "M12 22v-3" }),
    React.createElement('path', { d: "M5 12H2" }),
    React.createElement('path', { d: "M22 12h-3" }),
    React.createElement('circle', { cx: 12, cy: 12, r: 3 }),
    React.createElement('path', { d: "M12 9l1.5 3-1.5 3" }),
  )
);

export const EVThermalIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('rect', { x: 2, y: 8, width: 16, height: 8, rx: 2 }),
    React.createElement('path', { d: "M6 8V6" }),
    React.createElement('path', { d: "M10 8V6" }),
    React.createElement('path', { d: "M14 8V6" }),
    React.createElement('path', { d: "M20 10c1.1 0 2 .9 2 2s-.9 2-2 2" }),
    React.createElement('path', { d: "M6 16v2" }),
    React.createElement('path', { d: "M10 16v2" }),
    React.createElement('path', { d: "M14 16v2" }),
  )
);

export const EVInsulationIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('path', { d: "M12 2l8 4v6c0 5.5-3.8 10.1-8 12-4.2-1.9-8-6.5-8-12V6l8-4z" }),
    React.createElement('path', { d: "M13 8l-4 8" }),
    React.createElement('circle', { cx: 9.5, cy: 9.5, r: 1 }),
    React.createElement('circle', { cx: 14.5, cy: 14.5, r: 1 }),
  )
);

export const EVUndercarriageIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('rect', { x: 3, y: 4, width: 18, height: 6, rx: 2 }),
    React.createElement('rect', { x: 5, y: 13, width: 14, height: 4, rx: 1 }),
    React.createElement('path', { d: "M8 10v3" }),
    React.createElement('path', { d: "M16 10v3" }),
    React.createElement('path', { d: "M3 20h18" }),
    React.createElement('path', { d: "M7 17v3" }),
    React.createElement('path', { d: "M17 17v3" }),
  )
);

export const EV12VIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('rect', { x: 4, y: 6, width: 16, height: 12, rx: 2 }),
    React.createElement('path', { d: "M7 6V4" }),
    React.createElement('path', { d: "M17 6V4" }),
    React.createElement('text', { x: 12, y: 14, textAnchor: "middle", fontSize: 7, fill: "currentColor", stroke: "none", fontWeight: "bold" }, "12V"),
  )
);

export const EVDriveModesIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
    React.createElement('path', { d: "M12 6v6l4 2" }),
    React.createElement('path', { d: "M16.24 7.76l1.42-1.42" }),
    React.createElement('path', { d: "M19 12h2" }),
  )
);

export const EVOnboardChargerIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('rect', { x: 3, y: 7, width: 14, height: 10, rx: 2 }),
    React.createElement('path', { d: "M10 7V5a2 2 0 014 0v2" }),
    React.createElement('path', { d: "M17 12h2a2 2 0 010 4h-2" }),
    React.createElement('path', { d: "M9 11l2 4h-2l2 4" }),
  )
);

export const EVFrunkIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('path', { d: "M3 14h18v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4z" }),
    React.createElement('path', { d: "M3 14l2-6a2 2 0 012-2h10a2 2 0 012 2l2 6" }),
    React.createElement('path', { d: "M9 14v3" }),
    React.createElement('path', { d: "M15 14v3" }),
  )
);

export const EVRegenBrakingIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('circle', { cx: 12, cy: 12, r: 9 }),
    React.createElement('path', { d: "M12 8v4l2.5 1.5" }),
    React.createElement('path', { d: "M8.5 8.5l-2-2" }),
    React.createElement('path', { d: "M15.5 8.5l2-2" }),
    React.createElement('path', { d: "M9 16l-1.5 2" }),
    React.createElement('path', { d: "M15 16l1.5 2" }),
  )
);

export const EVTireRepairIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('circle', { cx: 12, cy: 12, r: 8 }),
    React.createElement('circle', { cx: 12, cy: 12, r: 4 }),
    React.createElement('path', { d: "M14.5 2.5l3 3-8 8-3-3 8-8z" }),
  )
);

export const EVChargingCableIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('path', { d: "M8 4v4" }),
    React.createElement('path', { d: "M12 4v4" }),
    React.createElement('path', { d: "M6 8h8a2 2 0 012 2v1a2 2 0 01-2 2H8" }),
    React.createElement('path', { d: "M8 13v5a2 2 0 004 0v-1" }),
    React.createElement('path', { d: "M16 10h2a2 2 0 010 4h-2" }),
  )
);

export const EVBMSIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('rect', { x: 4, y: 4, width: 16, height: 16, rx: 2 }),
    React.createElement('path', { d: "M9 9h6" }),
    React.createElement('path', { d: "M9 12h6" }),
    React.createElement('path', { d: "M9 15h4" }),
    React.createElement('circle', { cx: 17, cy: 15, r: 1, fill: "currentColor" }),
  )
);

export const EVReverseAlarmIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('path', { d: "M11 5L6 9H2v6h4l5 4V5z" }),
    React.createElement('path', { d: "M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" })
  )
);

export const EVBonnetIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('path', { d: "M3 10l3-5h12l3 5" }),
    React.createElement('path', { d: "M2 10h20v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" }),
    React.createElement('path', { d: "M9 16v2" }),
    React.createElement('path', { d: "M15 16v2" }),
    React.createElement('path', { d: "M8 5l4-3 4 3" }),
  )
);

export const EVHosesIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('path', { d: "M5 3v18" }),
    React.createElement('path', { d: "M9 3v18" }),
    React.createElement('path', { d: "M5 7h4" }),
    React.createElement('path', { d: "M5 12h4" }),
    React.createElement('path', { d: "M5 17h4" }),
    React.createElement('path', { d: "M14 6c0-2 2-3 4-3 2 0 3 1 3 3v12c0 2-1 3-3 3-2 0-4-1-4-3" }),
  )
);

export const EVSunVisorsIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('rect', { x: 3, y: 6, width: 18, height: 8, rx: 2 }),
    React.createElement('path', { d: "M7 6v8" }),
    React.createElement('path', { d: "M17 6v8" }),
    React.createElement('circle', { cx: 12, cy: 10, r: 2 }),
  )
);

export const EVParkingBrakeIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('circle', { cx: 12, cy: 12, r: 8 }),
    React.createElement('path', { d: "M5.5 5.5A11.9 11.9 0 002 12a11.9 11.9 0 003.5 6.5" }),
    React.createElement('path', { d: "M18.5 18.5A11.9 11.9 0 0022 12a11.9 11.9 0 00-3.5-6.5" }),
    React.createElement('text', { x: 12, y: 16, textAnchor: "middle", fontSize: 10, fill: "currentColor", stroke: "none", fontWeight: "bold", fontFamily: "sans-serif" }, "P")
  )
);

export const EVGearSelectorIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
    React.createElement('circle', { cx: 12, cy: 12, r: 6 }),
    React.createElement('path', { d: "M12 2v4" }),
    React.createElement('path', { d: "M12 18v4" }),
    React.createElement('path', { d: "M2 12h4" }),
    React.createElement('path', { d: "M18 12h4" }),
  )
);

export const EVSafetyEquipmentIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('path', { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }),
    React.createElement('path', { d: "M12 8v8" }),
    React.createElement('path', { d: "M8 12h8" }),
  )
);

export const EVWarningTriangleIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('path', { d: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" }),
    React.createElement('path', { d: "M12 9v4" }),
    React.createElement('circle', { cx: 12, cy: 17, r: 1, fill: "currentColor" }),
  )
);

export const EVSafetySignageIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2 }),
    React.createElement('circle', { cx: 12, cy: 12, r: 5 }),
    React.createElement('path', { d: "M12 7v5" }),
    React.createElement('path', { d: "M12 16h.01" }),
  )
);

export const EVDoorIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className },
    React.createElement('path', { d: "M18 20V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16" }),
    React.createElement('path', { d: "M2 20h20" }),
    React.createElement('path', { d: "M14 12v.01" }),
  )
);

export {
  BatteryFull, Volume2, ShieldCheck, Fuel, Waves, Lightbulb, ArrowLeftRight, Eye, CircleDot, IdCard, Car, Disc, Gauge, Droplets, Droplet, Flame, BriefcaseMedical, Wrench, Snowflake, Cctv, Moon, Coffee, Navigation, Stethoscope, MapPin, Siren, CloudLightning, Shield, Timer, FileCheck, CircleDashed, Radio, Package, PhoneOff, LifeBuoy, LogOut, DoorOpen, Settings, AlertTriangle, LightbulbOff, ShieldAlert, HelpCircle, Triangle, PhoneCall, UserCheck, Map, Thermometer, Smartphone, Anchor, Pill, CloudSunRain, ClipboardCheck, BedDouble, BatteryCharging, Zap, PlugZap
};
