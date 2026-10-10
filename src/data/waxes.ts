/**
 * WAXES + BUTTERS dataset for the Balms bench (bench 02).
 *
 * Values are standard published cosmetic-chemistry reference numbers:
 * melting points from pharmacopeial / supplier COA ranges (Koster Keunen,
 * Strahl & Pitsch and similar wax suppliers publish these openly), usage
 * ranges from common formulating practice. Where a number is a midpoint of
 * a published range or otherwise estimated, `source` says so — do not read
 * more precision into these than the note allows.
 */

export type WaxKind = "wax" | "butter" | "liquid_oil";

export interface WaxButterRecord {
  id: string;
  name: string;
  slug: string;
  kind: WaxKind;
  inci_name: string;
  /**
   * Representative melt point in °C. Almost every natural wax/butter melts
   * over a range; this is the midpoint of the published range. Liquid oils
   * use a typical pour/cloud point and are marked estimated.
   */
  melt_point_c: number;
  melt_point_note: string;
  /** Typical use level, percent of formula. */
  recommended_usage_range: [number, number];
  /**
   * How strongly this ingredient drives graininess (0–1). Shea is the
   * classic grain culprit (slow-crystallizing stearic fractions); cocoa and
   * mango contribute about half as much. Heuristic, not a measured value.
   */
  grain_factor: number;
  /** Where the numbers above came from. */
  source: string;
}

export const WAXES: WaxButterRecord[] = [
  {
    id: "beeswax-yellow",
    name: "Beeswax (yellow)",
    slug: "beeswax-yellow",
    kind: "wax",
    inci_name: "Cera Alba",
    melt_point_c: 63,
    melt_point_note: "Published range 62–64 °C; midpoint used.",
    recommended_usage_range: [5, 30],
    grain_factor: 0,
    source:
      "Pharmacopeial standard; supplier COAs (e.g. Koster Keunen) list 62–64 °C.",
  },
  {
    id: "candelilla",
    name: "Candelilla wax",
    slug: "candelilla",
    kind: "wax",
    inci_name: "Euphorbia Cerifera (Candelilla) Wax",
    melt_point_c: 70,
    melt_point_note: "Published range 68–72 °C; midpoint used.",
    recommended_usage_range: [3, 15],
    grain_factor: 0,
    source: "Supplier data (Koster Keunen, Strahl & Pitsch): 68.5–72.5 °C.",
  },
  {
    id: "carnauba",
    name: "Carnauba wax",
    slug: "carnauba",
    kind: "wax",
    inci_name: "Copernicia Cerifera (Carnauba) Wax",
    melt_point_c: 84,
    melt_point_note: "Published range 82–86 °C; midpoint used.",
    recommended_usage_range: [1, 8],
    grain_factor: 0,
    source: "Supplier data: 82–86 °C. Hardest natural wax — a little goes a long way.",
  },
  {
    id: "soy-wax",
    name: "Soy wax",
    slug: "soy-wax",
    kind: "wax",
    inci_name: "Hydrogenated Soybean Oil",
    melt_point_c: 50,
    melt_point_note: "Estimated — varies with hydrogenation level.",
    recommended_usage_range: [5, 25],
    grain_factor: 0,
    source:
      "Wax supplier data (~120–125 °F); estimated midpoint, varies by batch.",
  },
];

export const BUTTERS: WaxButterRecord[] = [
  {
    id: "shea-unrefined",
    name: "Shea butter (unrefined)",
    slug: "shea-unrefined",
    kind: "butter",
    inci_name: "Butyrospermum Parkii (Shea) Butter",
    melt_point_c: 37,
    melt_point_note: "Published range 32–45 °C; midpoint used.",
    recommended_usage_range: [5, 100],
    grain_factor: 1,
    source:
      "Published range ~89–113 °F. The classic grain culprit — its stearic-rich fractions crystallize slowly.",
  },
  {
    id: "cocoa-butter",
    name: "Cocoa butter",
    slug: "cocoa-butter",
    kind: "butter",
    inci_name: "Theobroma Cacao (Cocoa) Seed Butter",
    melt_point_c: 36,
    melt_point_note: "Published range 34–38 °C; midpoint used.",
    recommended_usage_range: [5, 100],
    grain_factor: 0.5,
    source: "Published range 93–100 °F. Polymorphic — can bloom, less grain-prone than shea in balms.",
  },
  {
    id: "mango-butter",
    name: "Mango butter",
    slug: "mango-butter",
    kind: "butter",
    inci_name: "Mangifera Indica (Mango) Seed Butter",
    melt_point_c: 37,
    melt_point_note: "Published range 32–42 °C; midpoint used.",
    recommended_usage_range: [5, 100],
    grain_factor: 0.5,
    source: "Supplier data; midpoint of the published range.",
  },
];

/**
 * A short list of liquid carriers for the oil phase of a balm. Melt points
 * here are typical pour/cloud points and are ESTIMATES — they exist so the
 * weighted melt-point math has something honest to work with, not because
 * anyone measured your bottle.
 */
export const BALM_LIQUID_OILS: WaxButterRecord[] = [
  {
    id: "sweet-almond-balm",
    name: "Sweet almond oil",
    slug: "sweet-almond-balm",
    kind: "liquid_oil",
    inci_name: "Prunus Amygdalus Dulcis (Sweet Almond) Oil",
    melt_point_c: -10,
    melt_point_note: "Estimated typical pour point; varies by batch.",
    recommended_usage_range: [5, 80],
    grain_factor: 0,
    source: "Estimated — typical pour point for cosmetic-grade oil.",
  },
  {
    id: "jojoba-balm",
    name: "Jojoba oil",
    slug: "jojoba-balm",
    kind: "liquid_oil",
    inci_name: "Simmondsia Chinensis (Jojoba) Seed Oil",
    melt_point_c: 8,
    melt_point_note: "Liquid wax ester; firms up near 7–10 °C.",
    recommended_usage_range: [5, 80],
    grain_factor: 0,
    source: "Supplier data — jojoba clouds/solidifies around 45–50 °F.",
  },
  {
    id: "mct-balm",
    name: "Fractionated coconut oil (MCT)",
    slug: "mct-balm",
    kind: "liquid_oil",
    inci_name: "Caprylic/Capric Triglyceride",
    melt_point_c: 5,
    melt_point_note: "Estimated typical pour point; varies by batch.",
    recommended_usage_range: [5, 80],
    grain_factor: 0,
    source: "Estimated — typical pour point for cosmetic-grade MCT oil.",
  },
  {
    id: "olive-balm",
    name: "Olive oil",
    slug: "olive-balm",
    kind: "liquid_oil",
    inci_name: "Olea Europaea (Olive) Fruit Oil",
    melt_point_c: 0,
    melt_point_note: "Estimated cloud point; varies by batch.",
    recommended_usage_range: [5, 80],
    grain_factor: 0,
    source: "Estimated — olive oil clouds near freezing, varies by grade.",
  },
];

export const WAX_BUTTER_DATABASE: WaxButterRecord[] = [
  ...WAXES,
  ...BUTTERS,
  ...BALM_LIQUID_OILS,
];

export function getWaxButterById(
  id: string,
  database: WaxButterRecord[] = WAX_BUTTER_DATABASE,
): WaxButterRecord | undefined {
  return database.find((record) => record.id === id);
}
