/**
 * SURFACTANTS dataset for the Cleansers bench (bench 04).
 *
 * ASM = Active Surfactant Matter: the fraction of the supplied material
 * that is actual surfactant (the rest is water, salt, etc.). Values are
 * typical supplier spec-sheet actives (Stepan, Croda, BASF, Innospec
 * publish these openly). Ideal pH ranges are practical formulating
 * windows, not hard stability limits — check your supplier's TDS.
 */

import type { IngredientCharge } from "../types/ingredients.ts";

export interface SurfactantRecord {
  id: string;
  name: string;
  slug: string;
  inci_name: string;
  charge: IngredientCharge;
  /**
   * Active matter as a fraction of the material as supplied
   * (e.g. 0.30 = a 30% solution).
   */
  asm_fraction: number;
  /** Practical formulating pH window. */
  ideal_ph_range: [number, number];
  mildness_note: string;
  source: string;
}

export const SURFACTANTS: SurfactantRecord[] = [
  {
    id: "cocamidopropyl-betaine",
    name: "Cocamidopropyl Betaine (30%)",
    slug: "cocamidopropyl-betaine",
    inci_name: "Cocamidopropyl Betaine",
    charge: "amphoteric",
    asm_fraction: 0.3,
    ideal_ph_range: [5.0, 7.5],
    mildness_note:
      "The classic secondary surfactant — boosts foam and softens harsher anionics.",
    source: "Supplier spec (e.g. Stepan Amphosol CG): 30% active.",
  },
  {
    id: "decyl-glucoside",
    name: "Decyl Glucoside (50%)",
    slug: "decyl-glucoside",
    inci_name: "Decyl Glucoside",
    charge: "nonionic",
    asm_fraction: 0.5,
    ideal_ph_range: [5.0, 9.0],
    mildness_note: "Very mild nonionic; low, creamy foam on its own.",
    source: "Supplier spec (e.g. BASF Plantaren 2000 N): ~50% active.",
  },
  {
    id: "coco-glucoside",
    name: "Coco Glucoside (50%)",
    slug: "coco-glucoside",
    inci_name: "Coco-Glucoside",
    charge: "nonionic",
    asm_fraction: 0.5,
    ideal_ph_range: [5.0, 9.0],
    mildness_note: "Very mild nonionic; pairs well with betaine.",
    source: "Supplier spec (e.g. BASF Plantacare 818): ~50% active.",
  },
  {
    id: "sodium-cocoyl-isethionate",
    name: "Sodium Cocoyl Isethionate (powder)",
    slug: "sodium-cocoyl-isethionate",
    inci_name: "Sodium Cocoyl Isethionate",
    charge: "anionic",
    asm_fraction: 0.85,
    ideal_ph_range: [5.5, 7.5],
    mildness_note:
      "Mild anionic with dense, creamy lather — the syndet-bar workhorse. Hydrolyzes in prolonged low pH.",
    source: "Supplier spec (e.g. Innospec Iselux): ~85% active.",
  },
  {
    id: "sodium-lauryl-sulfoacetate",
    name: "Sodium Lauryl Sulfoacetate (powder)",
    slug: "sodium-lauryl-sulfoacetate",
    inci_name: "Sodium Lauryl Sulfoacetate",
    charge: "anionic",
    asm_fraction: 0.7,
    ideal_ph_range: [5.0, 7.0],
    mildness_note: "Mild anionic with big, fluffy foam.",
    source: "Estimated ~70% active from supplier ranges — verify your lot.",
  },
  {
    id: "sodium-lauroyl-sarcosinate",
    name: "Sodium Lauroyl Sarcosinate (30%)",
    slug: "sodium-lauroyl-sarcosinate",
    inci_name: "Sodium Lauroyl Sarcosinate",
    charge: "anionic",
    asm_fraction: 0.3,
    ideal_ph_range: [5.0, 7.0],
    mildness_note: "Mild anionic; silky after-feel, good foam booster.",
    source: "Supplier spec: 30% active solution.",
  },
  {
    id: "disodium-laureth-sulfosuccinate",
    name: "Disodium Laureth Sulfosuccinate (40%)",
    slug: "disodium-laureth-sulfosuccinate",
    inci_name: "Disodium Laureth Sulfosuccinate",
    charge: "anionic",
    asm_fraction: 0.4,
    ideal_ph_range: [5.5, 7.5],
    mildness_note: "One of the mildest anionics; rich lather.",
    source: "Supplier spec (e.g. Stepan Stepan-Mild): 40% active.",
  },
];

export function getSurfactantById(
  id: string,
  database: SurfactantRecord[] = SURFACTANTS,
): SurfactantRecord | undefined {
  return database.find((record) => record.id === id);
}
