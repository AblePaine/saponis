import { getWaxButterById, WAX_BUTTER_DATABASE } from "../data/waxes.ts";
import type { WaxButterRecord } from "../data/waxes.ts";
import type { GraininessRisk } from "../types/ingredients.ts";

export type CoolMethod = "slow" | "fast";

export interface BalmComponentInput {
  id: string;
  /** Percent of the formula as entered (need not sum to 100). */
  percent: number;
}

export interface BalmInput {
  batchGrams: number;
  components: BalmComponentInput[];
  coolMethod: CoolMethod;
}

export interface BalmComponentRow {
  id: string;
  name: string;
  kind: WaxButterRecord["kind"];
  /** Normalized percent of formula (sums to 100). */
  percent: number;
  grams: number;
}

export type BalmFirmness = "soft" | "balanced" | "firm" | "very_firm";

export interface BalmResult {
  batchGrams: number;
  enteredPercent: number;
  rows: BalmComponentRow[];
  waxPercent: number;
  butterPercent: number;
  liquidOilPercent: number;
  /** Weighted-average melt point of the blend, °C. */
  estimatedMeltPointC: number;
  estimatedMeltPointF: number;
  firmness: BalmFirmness;
  graininessRisk: GraininessRisk;
  warnings: string[];
  unknownIds: string[];
}

const EMPTY_RESULT: BalmResult = {
  batchGrams: 0,
  enteredPercent: 0,
  rows: [],
  waxPercent: 0,
  butterPercent: 0,
  liquidOilPercent: 0,
  estimatedMeltPointC: 0,
  estimatedMeltPointF: 32,
  firmness: "soft",
  graininessRisk: "low",
  warnings: [],
  unknownIds: [],
};

function nonNegative(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

/**
 * Weighted-average melt point: sum over components of
 * (fraction × component melt point). A rough but standard formulator's
 * estimate — eutectic effects are real and this ignores them, so treat
 * the number as a neighborhood, not a promise.
 */
export function blendMeltPointC(
  rows: { record: WaxButterRecord; fraction: number }[],
): number {
  return rows.reduce(
    (sum, row) => sum + row.fraction * row.record.melt_point_c,
    0,
  );
}

export function firmnessFromWaxPercent(waxPercent: number): BalmFirmness {
  if (waxPercent < 8) return "soft";
  if (waxPercent < 18) return "balanced";
  if (waxPercent < 30) return "firm";
  return "very_firm";
}

/**
 * Graininess heuristic: grain-prone butters (shea first among equals)
 * crystallize slowly, so a high grain load plus a slow cool is the classic
 * recipe for a gritty jar. A fast cool (tempering) knocks one risk level
 * off. Heuristic — your freezer and your shea lot have the final vote.
 */
export function graininessRisk(
  grainLoad: number,
  coolMethod: CoolMethod,
): GraininessRisk {
  let risk: GraininessRisk;
  if (grainLoad < 0.25) risk = "low";
  else if (grainLoad < 0.45) risk = "moderate";
  else risk = "high";
  if (coolMethod === "fast") {
    if (risk === "high") return "moderate";
    if (risk === "moderate") return "low";
  }
  return risk;
}

export const FIRMNESS_LABEL: Record<BalmFirmness, string> = {
  soft: "Soft",
  balanced: "Balanced",
  firm: "Firm",
  very_firm: "Very firm",
};

/**
 * Deterministic, side-effect-free balm/salve calculator.
 * Percents are normalized to 100; all masses derive from `batchGrams`.
 */
export function computeBalm(
  input: BalmInput,
  database: WaxButterRecord[] = WAX_BUTTER_DATABASE,
): BalmResult {
  const batchGrams = nonNegative(input.batchGrams);
  const warnings: string[] = [];
  const unknownIds: string[] = [];

  const resolved: { record: WaxButterRecord; percent: number }[] = [];
  let enteredPercent = 0;
  for (const component of input.components) {
    const percent = nonNegative(component.percent);
    if (percent <= 0) continue;
    const record = getWaxButterById(component.id, database);
    if (!record) {
      unknownIds.push(component.id);
      continue;
    }
    enteredPercent += percent;
    resolved.push({ record, percent });
  }

  if (resolved.length === 0) {
    return {
      ...EMPTY_RESULT,
      batchGrams,
      enteredPercent,
      unknownIds,
      warnings: ["Nothing in the pot yet — add a wax, a butter, or an oil."],
    };
  }

  // Normalize entered percents so the formula always sums to 100.
  const rows: BalmComponentRow[] = resolved.map(({ record, percent }) => {
    const normalized = (percent / enteredPercent) * 100;
    return {
      id: record.id,
      name: record.name,
      kind: record.kind,
      percent: normalized,
      grams: (normalized / 100) * batchGrams,
    };
  });

  let waxPercent = 0;
  let butterPercent = 0;
  let liquidOilPercent = 0;
  let grainLoad = 0;
  for (const { record, percent } of resolved) {
    const normalized = (percent / enteredPercent) * 100;
    if (record.kind === "wax") waxPercent += normalized;
    else if (record.kind === "butter") butterPercent += normalized;
    else liquidOilPercent += normalized;
    grainLoad += (normalized / 100) * record.grain_factor;
  }

  const meltPointC = blendMeltPointC(
    resolved.map(({ record, percent }) => ({
      record,
      fraction: percent / enteredPercent,
    })),
  );

  const firmness = firmnessFromWaxPercent(waxPercent);
  const risk = graininessRisk(grainLoad, input.coolMethod);

  if (waxPercent < 5) {
    warnings.push(
      "Very little wax in here — expect a soft salve that may slump in a warm room. Nudge the wax up if you want it to hold its shape.",
    );
  }
  if (waxPercent > 35) {
    warnings.push(
      "That's a lot of wax — expect a firm stick with some drag on the skin.",
    );
  }
  if (butterPercent > 60) {
    warnings.push(
      "Butter-heavy and proud of it — lovely skin feel, but keep an eye on the graininess note below.",
    );
  }
  if (risk === "high") {
    warnings.push(
      "High graininess risk: lots of grain-prone butter cooling slowly is the classic gritty-jar recipe. Cool it fast (a quick temper in the fridge) or trim the shea.",
    );
  } else if (risk === "moderate") {
    warnings.push(
      "Moderate graininess risk — a fast cool after pouring is cheap insurance.",
    );
  }
  if (unknownIds.length > 0) {
    warnings.push(
      `Skipped ${unknownIds.length} ingredient${unknownIds.length === 1 ? "" : "s"} not in the wax library.`,
    );
  }

  return {
    batchGrams,
    enteredPercent,
    rows,
    waxPercent,
    butterPercent,
    liquidOilPercent,
    estimatedMeltPointC: meltPointC,
    estimatedMeltPointF: meltPointC * (9 / 5) + 32,
    firmness,
    graininessRisk: risk,
    warnings,
    unknownIds,
  };
}
