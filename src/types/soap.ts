export interface FattyAcidProfile {
  lauric: number;
  myristic: number;
  palmitic: number;
  stearic: number;
  ricinoleic: number;
  oleic: number;
  linoleic: number;
  linolenic: number;
}

export interface INCINames {
  standard: string;
  saponified_naoh: string;
  saponified_koh: string;
}

export type HardnessProfile = "hard" | "soft" | "brittle";
export type TraceSpeedImpact = "accelerates" | "neutral" | "slows";
export type MassUnit = "g" | "oz";
export type LiquidMode = "concentration" | "ratio" | "water_percent_oils";

export interface MasterOilRecord {
  id: string;
  name: string;
  slug: string;
  common_botanical_name: string;
  sap_naoh: number;
  sap_koh: number;
  iodine: number;
  ins: number;
  fatty_acids: FattyAcidProfile;
  recommended_max_percentage: number;
  hardness_profile: HardnessProfile;
  inci_names: INCINames;
  trace_speed_impact: TraceSpeedImpact;
  aliases?: string[];
  workhorse?: boolean;
}

export interface RecipeOilInput {
  oilId: string;
  amount: number;
}

export interface LiquidConfig {
  mode: LiquidMode;
  value: number;
}

export interface LyeChoice {
  /** Fraction of the alkali demand met with NaOH (0 = all KOH, 1 = all NaOH). */
  naohRatio: number;
  /** Mass-fraction purity of the NaOH reagent. Defaults to 1.0 or 0.99. */
  naohPurity: number;
  /** Mass-fraction purity of the KOH reagent. Defaults to 0.90. */
  kohPurity: number;
}

export interface RecipeAdditives {
  fragranceGrams?: number;
  sodiumLactateGrams?: number;
}

export interface RecipeConfig {
  unit: MassUnit;
  oils: RecipeOilInput[];
  superfatPercentage: number;
  liquidConfig: LiquidConfig;
  lyeChoice: LyeChoice;
  additives?: RecipeAdditives;
}

export interface QualityScores {
  hardness: number;
  cleansing: number;
  conditioning: number;
  bubbly: number;
  creamy: number;
  longevity: number;
  iodine: number;
  ins: number;
}

export interface DryLyeWeight {
  naoh: number;
  koh: number;
  total: number;
}

export interface BatchResult {
  totalOilWeight: number;
  dryLyeWeight: DryLyeWeight;
  liquidWeight: number;
  totalBatchWeight: number;
  lyeConcentrationPercent: number;
  waterToLyeRatio: number;
  waterAsPercentOils: number;
  fattyAcids: FattyAcidProfile;
  qualityScores: QualityScores;
  safetyAlerts: string[];
}

export const FATTY_ACID_KEYS = [
  "lauric",
  "myristic",
  "palmitic",
  "stearic",
  "ricinoleic",
  "oleic",
  "linoleic",
  "linolenic",
] as const satisfies readonly (keyof FattyAcidProfile)[];

export type FattyAcidKey = (typeof FATTY_ACID_KEYS)[number];

export const QUALITY_SCORE_KEYS = [
  "hardness",
  "cleansing",
  "conditioning",
  "bubbly",
  "creamy",
  "longevity",
  "iodine",
  "ins",
] as const satisfies readonly (keyof QualityScores)[];

export type QualityScoreKey = (typeof QUALITY_SCORE_KEYS)[number];

export const DANGER_UNSATURATED_SOLUTION =
  "DANGER_UNSATURATED_SOLUTION: Water ratio too low to safely dissolve alkali.";

export const WARNING_EXCESS_WATER =
  "WARNING_EXCESS_WATER: High liquid content will cause soft bars, prolonged cure, and soda ash.";

export const WARNING_STRIPPING_BAR =
  "WARNING_STRIPPING_BAR: High cleansing profile requires higher superfat to avoid skin dryness.";
