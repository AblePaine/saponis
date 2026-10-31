/**
 * CANDLE BLEND PROFILES for the Candle Studio expansion (blend window
 * engine, candlemaking brief engine D).
 *
 * ⚠️ SEED / FIXTURE VALUES, same posture as src/data/candle-waxes.ts.
 * Melt points, pour windows, hardness and frost tendencies below are
 * typical published ranges for each wax *class* (supplier literature for
 * workhorse SKUs in the class runs in these bands), reduced to seed
 * numbers so the blend math has named constants to work with. They are
 * NOT the spec sheet for the exact wax in your pot — swap in your
 * supplier's numbers for the SKU before treating a window as final.
 * The blend engine's outputs are estimates built from these seeds:
 * useful for comparing blends against each other, not a burn test.
 *
 * Hardness is a relative 0–1 scale anchored on the classes: soft soy
 * container wax ≈ 0.35, hard beeswax ≈ 0.85. Frost risk is likewise a
 * relative 0–1 tendency (soy frosts; beeswax blooms instead — different
 * defect, flagged separately in the engine).
 */

export interface CandleBlendProfile {
  /** Matches CandleWaxRecord.id in src/data/candle-waxes.ts. */
  waxId: string;
  /** Melt range, °C (low–high). */
  meltRangeC: [number, number];
  /** Typical pour window, °C (low–high). */
  pourRangeC: [number, number];
  /** Relative hardness, 0–1. Heuristic seed. */
  hardness: number;
  /** Relative frosting tendency, 0–1. Heuristic seed. */
  frostRisk: number;
  /** Forms this class is normally poured in. */
  forms: ("container" | "pillar")[];
  /** Class note printed with the profile's numbers. */
  note: string;
  source: string;
}

export const CANDLE_BLEND_PROFILES: CandleBlendProfile[] = [
  {
    waxId: "soy-container-seed",
    meltRangeC: [45, 48],
    pourRangeC: [57, 66],
    hardness: 0.35,
    frostRisk: 0.8,
    forms: ["container"],
    note: "Soft, frost-prone, container-only as a class. The frosting is cosmetic, not a defect in the burn.",
    source:
      "SEED — melt/pour bands typical of published data for soy container classes (e.g. Golden Brands 464-class sheets: melt ≈113–119 °F, pour ≈135–155 °F). Hardness/frost are relative heuristics. Replace with your SKU's sheet.",
  },
  {
    waxId: "coconut-soy-blend-seed",
    meltRangeC: [43, 47],
    pourRangeC: [54, 62],
    hardness: 0.3,
    frostRisk: 0.55,
    forms: ["container"],
    note: "Softer and lower-melting than straight soy; creamy tops, still container-only as a class.",
    source:
      "SEED — bands typical of published coconut–soy container blend classes. Hardness/frost are relative heuristics. Replace with your SKU's sheet.",
  },
  {
    waxId: "paraffin-container-seed",
    meltRangeC: [52, 58],
    pourRangeC: [66, 77],
    hardness: 0.55,
    frostRisk: 0.25,
    forms: ["container"],
    note: "Firmer than soy and pours hotter. The paraffin defect to watch is shrinkage / wet spots, not frost — leave headspace for a re-pour.",
    source:
      "SEED — bands typical of published low-melt container paraffin classes (IGI 4627-class sheets). Hardness/frost are relative heuristics. Replace with your SKU's sheet.",
  },
  {
    waxId: "beeswax-candle-seed",
    meltRangeC: [62, 65],
    pourRangeC: [68, 75],
    hardness: 0.85,
    frostRisk: 0.15,
    forms: ["container", "pillar"],
    note: "The hard, high-melt anchor of a blend and the only library class at home in a pillar. Surface bloom over time is natural beeswax behavior, not frosting.",
    source:
      "SEED — melt band from the pharmacopeial beeswax range (62–64 °C, cf. the balm bench dataset) widened a degree for candle stock. Hardness/frost are relative heuristics.",
  },
];

export function getBlendProfile(
  waxId: string,
  profiles: CandleBlendProfile[] = CANDLE_BLEND_PROFILES,
): CandleBlendProfile | undefined {
  return profiles.find((profile) => profile.waxId === waxId);
}
