import {
  EMULSIFIERS,
  OIL_REQUIRED_HLB,
  PRESERVATIVES,
  getEmulsifierById,
  getOilHlbById,
  getPreservativeById,
} from "../data/emulsifiers.ts";
import type {
  EmulsifierRecord,
  OilHlbRecord,
  PreservativeRecord,
} from "../data/emulsifiers.ts";

export interface EmulsionOilInput {
  id: string;
  /** Percent of the oil phase as entered (need not sum to 100). */
  percent: number;
}

export interface EmulsionEmulsifierInput {
  id: string;
  /** Percent of the total formula as entered. */
  percent: number;
}

export interface EmulsionInput {
  batchGrams: number;
  /** Oil phase size, percent of the total formula. */
  oilPhasePercent: number;
  oils: EmulsionOilInput[];
  emulsifiers: EmulsionEmulsifierInput[];
  preservativeId: string | null;
  preservativePercent: number;
  /** Extra water to add upfront to cover heat-phase evaporation, percent. */
  evaporationPercent: number;
}

export interface EmulsionComponentRow {
  id: string;
  name: string;
  percent: number;
  grams: number;
}

export type HlbVerdict = "good" | "acceptable" | "mismatch" | "unknown";
export type PreservativeVerdict = "ok" | "over" | "missing" | "unknown";

export interface EmulsionResult {
  batchGrams: number;
  oilPhasePercent: number;
  emulsifierPercent: number;
  preservativePercent: number;
  waterPercent: number;
  requiredHlb: number | null;
  blendHlb: number | null;
  hlbGap: number | null;
  hlbVerdict: HlbVerdict;
  preservativeVerdict: PreservativeVerdict;
  preservativeMax: number | null;
  oilRows: EmulsionComponentRow[];
  emulsifierRows: EmulsionComponentRow[];
  waterGrams: number;
  makeupWaterGrams: number;
  warnings: string[];
  unknownIds: string[];
}

/** HLB gap ≤ 1 is the textbook target; ≤ 2 usually still holds. */
export const HLB_GOOD_MAX_GAP = 1;
export const HLB_ACCEPTABLE_MAX_GAP = 2;

function nonNegative(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * Required HLB of an oil blend: each oil's required HLB weighted by its
 * share of the oil phase. The number your emulsifier blend has to hit.
 */
export function requiredHlbOfOils(
  rows: { record: OilHlbRecord; fraction: number }[],
): number | null {
  if (rows.length === 0) return null;
  return rows.reduce(
    (sum, row) => sum + row.fraction * row.record.required_hlb,
    0,
  );
}

/**
 * HLB of an emulsifier blend: each emulsifier's HLB weighted by its share
 * of the total emulsifier (not of the formula).
 */
export function blendHlbOfEmulsifiers(
  rows: { record: EmulsifierRecord; fraction: number }[],
): number | null {
  if (rows.length === 0) return null;
  return rows.reduce((sum, row) => sum + row.fraction * row.record.hlb, 0);
}

export function hlbVerdictForGap(gap: number | null): HlbVerdict {
  if (gap === null) return "unknown";
  if (gap <= HLB_GOOD_MAX_GAP) return "good";
  if (gap <= HLB_ACCEPTABLE_MAX_GAP) return "acceptable";
  return "mismatch";
}

export const HLB_VERDICT_LABEL: Record<HlbVerdict, string> = {
  good: "On target",
  acceptable: "Close enough",
  mismatch: "Off target",
  unknown: "Can't tell",
};

/**
 * Deterministic, side-effect-free oil-in-water emulsion calculator.
 * Oil percents are normalized within the oil phase; emulsifier and
 * preservative percents are of the total formula.
 */
export function computeEmulsion(
  input: EmulsionInput,
  emulsifiers: EmulsifierRecord[] = EMULSIFIERS,
  preservatives: PreservativeRecord[] = PRESERVATIVES,
  oilHlb: OilHlbRecord[] = OIL_REQUIRED_HLB,
): EmulsionResult {
  const batchGrams = nonNegative(input.batchGrams);
  const oilPhasePercent = clamp(input.oilPhasePercent, 0, 100);
  const evaporationPercent = clamp(input.evaporationPercent, 0, 30);
  const warnings: string[] = [];
  const unknownIds: string[] = [];

  // --- oil phase: normalize within the phase ---
  const resolvedOils: { record: OilHlbRecord; percent: number }[] = [];
  let enteredOilPercent = 0;
  for (const oil of input.oils) {
    const percent = nonNegative(oil.percent);
    if (percent <= 0) continue;
    const record = getOilHlbById(oil.id, oilHlb);
    if (!record) {
      unknownIds.push(oil.id);
      continue;
    }
    enteredOilPercent += percent;
    resolvedOils.push({ record, percent });
  }

  const oilRows: EmulsionComponentRow[] = resolvedOils.map(
    ({ record, percent }) => {
      const normalized = enteredOilPercent > 0 ? (percent / enteredOilPercent) * 100 : 0;
      const grams = (oilPhasePercent / 100) * (normalized / 100) * batchGrams;
      return { id: record.id, name: record.name, percent: normalized, grams };
    },
  );

  const requiredHlb =
    enteredOilPercent > 0
      ? requiredHlbOfOils(
          resolvedOils.map(({ record, percent }) => ({
            record,
            fraction: percent / enteredOilPercent,
          })),
        )
      : null;

  // --- emulsifier blend: percents are of the total formula ---
  const resolvedEmulsifiers: { record: EmulsifierRecord; percent: number }[] = [];
  let emulsifierPercent = 0;
  for (const item of input.emulsifiers) {
    const percent = nonNegative(item.percent);
    if (percent <= 0) continue;
    const record = getEmulsifierById(item.id, emulsifiers);
    if (!record) {
      unknownIds.push(item.id);
      continue;
    }
    emulsifierPercent += percent;
    resolvedEmulsifiers.push({ record, percent });
  }

  const emulsifierRows: EmulsionComponentRow[] = resolvedEmulsifiers.map(
    ({ record, percent }) => ({
      id: record.id,
      name: record.name,
      percent,
      grams: (percent / 100) * batchGrams,
    }),
  );

  const blendHlb =
    emulsifierPercent > 0
      ? blendHlbOfEmulsifiers(
          resolvedEmulsifiers.map(({ record, percent }) => ({
            record,
            fraction: percent / emulsifierPercent,
          })),
        )
      : null;

  const hlbGap =
    requiredHlb !== null && blendHlb !== null
      ? Math.abs(blendHlb - requiredHlb)
      : null;
  const hlbVerdict = hlbVerdictForGap(hlbGap);

  // --- charge check: anionic + cationic emulsifiers fight ---
  const charges = new Set(
    resolvedEmulsifiers.map(({ record }) => record.charge),
  );
  if (charges.has("anionic") && charges.has("cationic")) {
    warnings.push(
      "Anionic meets cationic in the emulsifier blend — they tend to bind to each other instead of the oil and water, which ends in separation or a gummy mess. Pick one team.",
    );
  }

  if (emulsifierPercent > 0 && emulsifierPercent < 1) {
    warnings.push(
      "Under 1% emulsifier is brave for most oil loads — if it splits on the counter, this is the first number to raise.",
    );
  }

  // --- preservative ---
  const preservativePercent = nonNegative(input.preservativePercent);
  let preservativeVerdict: PreservativeVerdict = "missing";
  let preservativeMax: number | null = null;
  if (input.preservativeId) {
    const record = getPreservativeById(input.preservativeId, preservatives);
    if (!record) {
      unknownIds.push(input.preservativeId);
      preservativeVerdict = "unknown";
    } else {
      preservativeMax = record.max_usage_percent;
      preservativeVerdict =
        preservativePercent > record.max_usage_percent ? "over" : "ok";
      if (preservativeVerdict === "over") {
        warnings.push(
          `${record.name} at ${preservativePercent}% is over its ${record.max_usage_percent}% maximum — dial it back, more preservative isn't more protection.`,
        );
      }
    }
  } else if (preservativePercent > 0) {
    warnings.push(
      "You've got a preservative amount but no preservative picked — choose one so the math means something.",
    );
  }
  if (preservativeVerdict === "missing") {
    warnings.push(
      "No preservative in a water-containing formula — water plus time grows things you can't see. Either add one or keep this batch in the fridge and use it fast.",
    );
  }

  // --- water phase ---
  const waterPercent = Math.max(
    0,
    100 - oilPhasePercent - emulsifierPercent - preservativePercent,
  );
  if (oilPhasePercent + emulsifierPercent + preservativePercent > 100) {
    warnings.push(
      "Oil + emulsifier + preservative already pass 100% — there's no room left for water. Trim something.",
    );
  }
  const waterGrams = (waterPercent / 100) * batchGrams;
  const makeupWaterGrams = waterGrams * (evaporationPercent / 100);

  if (hlbVerdict === "mismatch" && requiredHlb !== null && blendHlb !== null) {
    warnings.push(
      `Emulsifier blend HLB (${blendHlb.toFixed(1)}) misses the oil phase's required HLB (${requiredHlb.toFixed(1)}) by ${hlbGap?.toFixed(1)} — expect a wobbly emulsion. Shift the blend toward ${blendHlb < requiredHlb ? "higher" : "lower"}-HLB emulsifiers.`,
    );
  }
  if (unknownIds.length > 0) {
    warnings.push(
      `Skipped ${unknownIds.length} ingredient${unknownIds.length === 1 ? "" : "s"} not in the library.`,
    );
  }

  return {
    batchGrams,
    oilPhasePercent,
    emulsifierPercent,
    preservativePercent,
    waterPercent,
    requiredHlb,
    blendHlb,
    hlbGap,
    hlbVerdict,
    preservativeVerdict,
    preservativeMax,
    oilRows,
    emulsifierRows,
    waterGrams,
    makeupWaterGrams,
    warnings,
    unknownIds,
  };
}
