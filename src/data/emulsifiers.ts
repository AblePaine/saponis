/**
 * EMULSIFIERS + PRESERVATIVES dataset for the Emulsions bench (bench 03).
 *
 * HLB values are the standard published numbers for these workhorse
 * emulsifiers (supplier technical data sheets and the classic HLB tables).
 * Required-HLB values for oils come from the standard required-HLB tables
 * compiled from ICI's HLB system literature. Preservative maximums are
 * supplier/EU-Annex-V use levels — always check your supplier's current
 * spec sheet before selling anything.
 */

import type { IngredientCharge } from "../types/ingredients.ts";

export interface EmulsifierRecord {
  id: string;
  name: string;
  slug: string;
  inci_name: string;
  /** Published HLB number. See `hlb_note` for caveats. */
  hlb: number;
  hlb_note: string;
  charge: IngredientCharge;
  /** Typical use level, percent of formula. */
  recommended_usage_range: [number, number];
  source: string;
}

export interface PreservativeRecord {
  id: string;
  name: string;
  slug: string;
  inci_name: string;
  /** Maximum use level, percent of formula. Do not exceed. */
  max_usage_percent: number;
  usage_note: string;
  source: string;
}

export interface OilHlbRecord {
  id: string;
  name: string;
  /** Required HLB of the oil for a stable o/w emulsion (standard tables). */
  required_hlb: number;
  source: string;
}

export const EMULSIFIERS: EmulsifierRecord[] = [
  {
    id: "glyceryl-stearate-peg100",
    name: "Glyceryl Stearate (and) PEG-100 Stearate",
    slug: "glyceryl-stearate-peg100",
    inci_name: "Glyceryl Stearate (and) PEG-100 Stearate",
    hlb: 11,
    hlb_note: "Widely published value.",
    charge: "nonionic",
    recommended_usage_range: [2, 6],
    source: "Standard HLB tables; supplier TDS.",
  },
  {
    id: "ceteareth-20",
    name: "Ceteareth-20",
    slug: "ceteareth-20",
    inci_name: "Ceteareth-20",
    hlb: 15.2,
    hlb_note: "Widely published value.",
    charge: "nonionic",
    recommended_usage_range: [1, 5],
    source: "Standard HLB tables; supplier TDS.",
  },
  {
    id: "sorbitan-olivate",
    name: "Sorbitan Olivate",
    slug: "sorbitan-olivate",
    inci_name: "Sorbitan Olivate",
    hlb: 4.7,
    hlb_note: "Widely published value.",
    charge: "nonionic",
    recommended_usage_range: [1, 5],
    source: "Standard HLB tables; supplier TDS.",
  },
  {
    id: "polysorbate-20",
    name: "Polysorbate 20",
    slug: "polysorbate-20",
    inci_name: "Polysorbate 20",
    hlb: 16.7,
    hlb_note: "Widely published value.",
    charge: "nonionic",
    recommended_usage_range: [1, 5],
    source: "Standard HLB tables; supplier TDS.",
  },
  {
    id: "polysorbate-80",
    name: "Polysorbate 80",
    slug: "polysorbate-80",
    inci_name: "Polysorbate 80",
    hlb: 15,
    hlb_note: "Widely published value.",
    charge: "nonionic",
    recommended_usage_range: [1, 5],
    source: "Standard HLB tables; supplier TDS.",
  },
  {
    id: "olivem-1000",
    name: "Olivem 1000",
    slug: "olivem-1000",
    inci_name: "Cetearyl Olivate (and) Sorbitan Olivate",
    hlb: 9,
    hlb_note: "Supplier-quoted; sometimes listed 8.5–9.",
    charge: "nonionic",
    recommended_usage_range: [2, 8],
    source: "Hallstar supplier data.",
  },
  {
    id: "btms-50",
    name: "BTMS-50",
    slug: "btms-50",
    inci_name:
      "Behentrimonium Methosulfate (and) Cetyl Alcohol (and) Butylene Glycol",
    hlb: 9,
    hlb_note:
      "Estimated — BTMS-50 is sold for conditioning first, emulsifying second; verify HLB behavior with your supplier.",
    charge: "cationic",
    recommended_usage_range: [1, 8],
    source: "Estimated from formulating practice; supplier TDS for usage range.",
  },
  {
    id: "lecithin",
    name: "Lecithin",
    slug: "lecithin",
    inci_name: "Lecithin",
    hlb: 5,
    hlb_note: "Estimated midpoint — published values vary 4–8 by source.",
    charge: "nonionic",
    recommended_usage_range: [1, 5],
    source: "Estimated from the published 4–8 range.",
  },
];

export const PRESERVATIVES: PreservativeRecord[] = [
  {
    id: "phenoxyethanol",
    name: "Phenoxyethanol",
    slug: "phenoxyethanol",
    inci_name: "Phenoxyethanol",
    max_usage_percent: 1,
    usage_note: "Add below 60 °C. Broad-spectrum workhorse.",
    source: "EU Annex V / CIR: max 1%.",
  },
  {
    id: "germaben-ii",
    name: "Germaben II",
    slug: "germaben-ii",
    inci_name:
      "Propylene Glycol (and) Diazolidinyl Urea (and) Methylparaben (and) Propylparaben",
    max_usage_percent: 1,
    usage_note: "Add below 60 °C.",
    source: "Ashland supplier data: max 1%.",
  },
  {
    id: "germall-plus",
    name: "Germall Plus (powder)",
    slug: "germall-plus",
    inci_name: "Diazolidinyl Urea (and) Iodopropynyl Butylcarbamate",
    max_usage_percent: 0.5,
    usage_note: "Add below 50 °C.",
    source: "Ashland supplier data: max 0.5%.",
  },
  {
    id: "liquid-germall-plus",
    name: "Liquid Germall Plus",
    slug: "liquid-germall-plus",
    inci_name:
      "Propylene Glycol (and) Diazolidinyl Urea (and) Iodopropynyl Butylcarbamate",
    max_usage_percent: 0.5,
    usage_note: "Add below 50 °C.",
    source: "Ashland supplier data: max 0.5%.",
  },
  {
    id: "optiphen",
    name: "Optiphen",
    slug: "optiphen",
    inci_name: "Phenoxyethanol (and) Caprylyl Glycol",
    max_usage_percent: 1.5,
    usage_note: "Typical use 0.75–1.5%. Add below 60 °C.",
    source: "Ashland supplier data: max 1.5%.",
  },
  {
    id: "potassium-sorbate",
    name: "Potassium Sorbate",
    slug: "potassium-sorbate",
    inci_name: "Potassium Sorbate",
    max_usage_percent: 0.6,
    usage_note:
      "Typically used 0.1–0.2%; most effective below pH 6. Dissolve in the water phase.",
    source: "EU Annex V limit (as sorbic acid); typical use per supplier guidance.",
  },
  {
    id: "sodium-benzoate",
    name: "Sodium Benzoate",
    slug: "sodium-benzoate",
    inci_name: "Sodium Benzoate",
    max_usage_percent: 0.5,
    usage_note:
      "Typically used 0.1–0.5%; most effective below pH 5.5. Dissolve in the water phase.",
    source: "EU Annex V limit (as benzoic acid); typical use per supplier guidance.",
  },
];

/**
 * Required HLB values for common oil-phase ingredients — the HLB your
 * emulsifier blend has to hit for a stable oil-in-water emulsion.
 */
export const OIL_REQUIRED_HLB: OilHlbRecord[] = [
  {
    id: "sweet-almond-hlb",
    name: "Sweet almond oil",
    required_hlb: 7,
    source: "Standard required-HLB tables (ICI HLB system compilations).",
  },
  {
    id: "jojoba-hlb",
    name: "Jojoba oil",
    required_hlb: 6.5,
    source: "Standard required-HLB tables.",
  },
  {
    id: "olive-hlb",
    name: "Olive oil",
    required_hlb: 7,
    source: "Standard required-HLB tables.",
  },
  {
    id: "shea-hlb",
    name: "Shea butter",
    required_hlb: 8,
    source: "Standard required-HLB tables.",
  },
  {
    id: "cocoa-hlb",
    name: "Cocoa butter",
    required_hlb: 6,
    source: "Standard required-HLB tables.",
  },
  {
    id: "sunflower-hlb",
    name: "Sunflower oil",
    required_hlb: 7,
    source: "Standard required-HLB tables.",
  },
  {
    id: "mct-hlb",
    name: "Fractionated coconut oil (MCT)",
    required_hlb: 5,
    source: "Standard required-HLB tables.",
  },
];

export function getEmulsifierById(
  id: string,
  database: EmulsifierRecord[] = EMULSIFIERS,
): EmulsifierRecord | undefined {
  return database.find((record) => record.id === id);
}

export function getPreservativeById(
  id: string,
  database: PreservativeRecord[] = PRESERVATIVES,
): PreservativeRecord | undefined {
  return database.find((record) => record.id === id);
}

export function getOilHlbById(
  id: string,
  database: OilHlbRecord[] = OIL_REQUIRED_HLB,
): OilHlbRecord | undefined {
  return database.find((record) => record.id === id);
}
