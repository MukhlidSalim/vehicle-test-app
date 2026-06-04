import { VehicleType, ChecklistItem, CheckStatus, InspectionMode } from "../types";
import { 
  GENERIC_CHECKLIST, HEAVY_BUS_CHECKLIST, ELECTRIC_CHECKLIST,
  MAINTENANCE_HEAVY_BUS_CHECKLIST, MAINTENANCE_SMALL_BUS_CHECKLIST,
  MAINTENANCE_AMBULANCE_CHECKLIST, MAINTENANCE_LIGHT_VEHICLE_CHECKLIST,
  MAINTENANCE_PICKUP_CHECKLIST, MAINTENANCE_ELECTRIC_CHECKLIST
} from "../constants";

/**
 * Returns the raw checklist definition array based on vehicle type and mode.
 */
export const getChecklistDefForType = (type: VehicleType, mode?: InspectionMode) => {
  if (mode === 'maintenance') {
    switch (type) {
      case 'heavy_bus': return MAINTENANCE_HEAVY_BUS_CHECKLIST;
      case 'small_bus': return MAINTENANCE_SMALL_BUS_CHECKLIST;
      case 'ambulance': return MAINTENANCE_AMBULANCE_CHECKLIST;
      case 'pickup': return MAINTENANCE_PICKUP_CHECKLIST;
      case 'electric_vehicle': return MAINTENANCE_ELECTRIC_CHECKLIST;
      case 'light_vehicle':
      default:
        return MAINTENANCE_LIGHT_VEHICLE_CHECKLIST;
    }
  } else {
    return type === 'heavy_bus' ? HEAVY_BUS_CHECKLIST : type === 'electric_vehicle' ? ELECTRIC_CHECKLIST : GENERIC_CHECKLIST;
  }
};

/**
 * Generates the initial checklist items based on the chosen vehicle type and inspection mode.
 * @param type - The vehicle type.
 * @param mode - The inspection mode.
 * @returns Array of initial checklist items.
 */
export const getChecklistForType = (type: VehicleType, mode?: InspectionMode): ChecklistItem[] => {
  const list = getChecklistDefForType(type, mode);


  return list.map(item => ({
    id: item.id,
    key: item.key,
    // All items start as unchecked to force user to inspect
    status: 'unchecked' as CheckStatus,
    notes: '',
    photo: undefined, // Using undefined to comply with ChecklistItem interface definition
    damagePoints: []
  }));
};
