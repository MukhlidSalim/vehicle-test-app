/**
 * Domain types (UI-agnostic)
 * - Intentionally does NOT import React types to keep the domain clean.
 * - Any UI-specific typing (icons/components) should be handled in UI layer.
 */

export type Language = "ar" | "en";

export type InspectionMode = "vehicle_only" | "full" | "driver_only" | "maintenance";

export type View =
  | "home"
  | "driver_safety"
  | "vehicle_safety"
  | "inspection_process"
  | "emergency_procedures"
  | "pre_trip_tips";

export type VehicleType =
  | "light_vehicle"
  | "heavy_bus"
  | "light_bus"
  | "ambulance"
  | "pickup"
  | "electric_vehicle";

export type CheckStatus = "pass" | "warning" | "fail" | "unchecked";

export type DriverStatus = "ready" | "warning" | "not_ready" | "pending";

/**
 * NOTE: We keep these as `string` to maintain full compatibility with
 * current storage/export formats (localStorage, PDF, etc).
 *
 * IMPORTANT: Be consistent across the app:
 * - If you store ISO (recommended): e.g. "2026-01-19T10:20:30.000Z"
 * - If you store DD-MM-YYYY: ensure all parsing/formatting uses the same rule.
 */
export type DateString = string;

/**
 * Keeping these as string maintains compatibility with your current UI/storage,
 * while documenting intent for future validation.
 */
export type PhoneString = string;
export type OdometerString = string;
export type PlateNumberString = string;

export interface DriverInfo {
  name: string;
  assistantName?: string;
  /** Optional phone number for the assistant driver */
  assistantPhone?: PhoneString;

  vehicleType: VehicleType;

  plateNumber: PlateNumberString;
  phoneNumber: PhoneString;
  currentOdometer?: OdometerString;
  odometer: OdometerString;

  /** Vehicle registration / license expiry date */
  vehicleExpiryDate?: DateString;

  /** Trip Route */
  departure?: string;
  destination?: string;

  /** See DateString note above */
  timestamp: DateString;

  /** See DateString note above */
  nextInspectionDate: DateString;
}

export interface DriverReadiness {
  declaration: boolean;
  finalConfirmation: boolean;
  
  tbtTopic?: { id: string; titleKey: string; introKey: string; pointsKey: string };
  tbtAcknowledge?: boolean;

  /**
   * IMPORTANT: Choose ONE consistent key strategy across the app:
   * - Prefer using the question `id` (recommended for stability)
   * - OR use `key` (translation key)
   *
   * We keep `Record<string, ...>` for compatibility right now.
   */
  answers: Record<string, boolean | null>;

  status: DriverStatus;
}

/**
 * UI-agnostic icon type.
 * - Was `any`, now `unknown` to prevent accidental misuse while keeping compatibility.
 * - In UI code, you can narrow/cast to the expected icon component type.
 */
export type IconLike = unknown;

export interface ReadinessQuestionDef {
  id: string;
  key: string;
  critical: boolean;
  icon: IconLike;
}

/**
 * Vehicle body damage point.
 * IMPORTANT: x/y must be consistent across the app:
 * - Either normalized (0..1) relative to the image/container
 * - Or pixel coordinates.
 * Decide one and keep it consistent in capture/export.
 */
export interface DamagePoint {
  /** Optional stable identifier for React keys and point tracking */
  id?: string;
  x: number;
  y: number;
  note: string;
  severity?: 'warning' | 'fail';
  photos?: string[];
}

export interface ChecklistItem {
  id: number;
  key: string;
  status: CheckStatus;
  notes: string;

  /**
   * Legacy single photo. Kept temporarily for backward compatibility with saved sessions.
   */
  photo?: string;

  /**
   * Array of photos (up to 3) for this checklist item.
   */
  photos?: string[];

  damagePoints?: DamagePoint[];

  /**
   * Expiry date for items that require one (e.g. fire extinguisher).
   * Stored as YYYY-MM-DD string from a date input.
   * Mandatory for fire_ext — enforced via UI validation.
   */
  expiryDate?: string;
}

export interface InspectionData {
  mode: InspectionMode;
  driverInfo: DriverInfo;
  readiness: DriverReadiness;
  checklist: ChecklistItem[];

  /**
   * Optional tyre pressure readings (PSI) for each wheel position.
   * 4-tyre vehicles use: fl, fr, rl, rr
   * 6-tyre vehicles (ambulance, heavy_bus, light_bus) use: fl, fr, rlo, rli, rro, rri
   */
  tyrePressures?: {
    fl?: string; fr?: string;
    rl?: string; rr?: string;
    rlo?: string; rli?: string; rro?: string; rri?: string;
  };

  /**
   * Signatures captured at the end of the inspection as base64 images.
   */
  signatures?: {
    inspector?: string;
    driver?: string;
  };

  /** Optional free-text notes not tied to any specific checklist item */
  additionalNotes?: string;
}
