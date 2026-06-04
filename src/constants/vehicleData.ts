import { VehicleType } from '../types';

export const VEHICLE_TYPES: { value: VehicleType; labelAr: string; labelEn: string }[] = [
  { value: 'light_vehicle', labelAr: 'مركبة خفيفة', labelEn: 'Light Vehicle' },
  { value: 'heavy_bus', labelAr: 'حافلة ثقيلة', labelEn: 'Heavy Bus' },
  { value: 'light_bus', labelAr: 'حافلة خفيفة', labelEn: 'Light Bus' },
  { value: 'ambulance', labelAr: 'سيارة إسعاف', labelEn: 'Ambulance' },
  { value: 'pickup', labelAr: 'سيارة بيك أب', labelEn: 'Pickup' },
  { value: 'electric_vehicle', labelAr: 'مركبة كهربائية', labelEn: 'Electric Vehicle' },
];

export const VEHICLE_IMAGES: Record<VehicleType, string> = {
  light_vehicle: "/assest/vehicles/landcruser.png",
  heavy_bus: "/assest/vehicles/heavybus.png",
  light_bus: "/assest/vehicles/coster.png",
  ambulance: "/assest/vehicles/ambulance.png",
  pickup: "/assest/vehicles/pickup.png",
  electric_vehicle: "/assest/vehicles/landcruser.png",
};

export const VEHICLE_SELECTION_IMAGES: Record<VehicleType, string> = {
  light_vehicle: "/assets/vehicles_new/Land-Cruser-Copy.png",
  heavy_bus: "/assets/vehicles_new/Heavy-Bus.jpg",
  light_bus: "/assets/vehicles_new/48691406-Copy.jpg",
  ambulance: "/assets/vehicles_new/Ambulance-Copy.png",
  pickup: "/assets/vehicles_new/toyota-hilux.jpg",
  electric_vehicle: "/assets/vehicles_new/Land-Cruser-Copy.png",
};
