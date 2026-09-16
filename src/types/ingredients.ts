import type { FattyAcidProfile, MasterOilRecord } from "./soap.ts";

/**
 * Cross-bench ingredient taxonomy. Soap continues to use MasterOilRecord;
 * later benches (balms, emulsions, surfactants) plug into BaseIngredient.
 */
export type IngredientCategory =
  | "oil_fat_butter"
  | "wax"
  | "emulsifier"
  | "surfactant"
  | "active"
  | "preservative"
  | "solvent_water"
  | "thickener_polymer"
  | "fragrance_essential_oil";

export type IngredientCharge =
  | "anionic"
  | "cationic"
  | "nonionic"
  | "amphoteric"
  | "none";

export type GraininessRisk = "low" | "moderate" | "high";

export interface SaponificationPayload {
  sap_naoh: number;
  sap_koh: number;
  fatty_acids: FattyAcidProfile;
  iodine: number;
  ins: number;
}

export interface EmulsionPayload {
  required_hlb: number;
  hlb_contribution: number;
  charge: IngredientCharge;
}

export interface SurfactantPayload {
  asm_percentage: number;
  charge: IngredientCharge;
  ideal_ph_range: [number, number];
}

export interface StabilityPayload {
  melting_point_c: number;
  graininess_risk: GraininessRisk;
}

export interface BaseIngredient {
  id: string;
  name: string;
  slug: string;
  category: IngredientCategory;
  inci_name: string;
  recommended_usage_range: [number, number];
  saponification?: SaponificationPayload;
  emulsion?: EmulsionPayload;
  surfactant?: SurfactantPayload;
  stability?: StabilityPayload;
}

export const INGREDIENT_CATEGORIES = [
  "oil_fat_butter",
  "wax",
  "emulsifier",
  "surfactant",
  "active",
  "preservative",
  "solvent_water",
  "thickener_polymer",
  "fragrance_essential_oil",
] as const satisfies readonly IngredientCategory[];

export function oilToBaseIngredient(oil: MasterOilRecord): BaseIngredient {
  return {
    id: oil.id,
    name: oil.name,
    slug: oil.slug,
    category: "oil_fat_butter",
    inci_name: oil.inci_names.standard,
    recommended_usage_range: [0, oil.recommended_max_percentage],
    saponification: {
      sap_naoh: oil.sap_naoh,
      sap_koh: oil.sap_koh,
      fatty_acids: oil.fatty_acids,
      iodine: oil.iodine,
      ins: oil.ins,
    },
  };
}
