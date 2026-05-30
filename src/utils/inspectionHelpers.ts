import { VehicleType, ChecklistItem, CheckStatus } from "../types";
import { GENERIC_CHECKLIST, HEAVY_BUS_CHECKLIST, ELECTRIC_CHECKLIST } from "../constants";

/**
 * Generates the initial checklist items based on the chosen vehicle type.
 * @param type - The vehicle type.
 * @returns Array of initial checklist items.
 */
export const getChecklistForType = (type: VehicleType): ChecklistItem[] => {
  const list = type === 'heavy_bus' ? HEAVY_BUS_CHECKLIST : type === 'electric_vehicle' ? ELECTRIC_CHECKLIST : GENERIC_CHECKLIST;
  return list.map(item => ({
    id: item.id,
    key: item.key,
    // Body damage starts as PASS (even if other items are unchecked)
    status: (item.key === 'body_damage' ? 'pass' : 'unchecked') as CheckStatus,
    notes: '',
    photo: undefined, // Using undefined to comply with ChecklistItem interface definition
    damagePoints: []
  }));
};
