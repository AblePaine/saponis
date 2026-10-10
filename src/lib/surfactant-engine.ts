import { SURFACTANTS, getSurfactantById } from "../data/surfactants.ts";
import type { SurfactantRecord } from "../data/surfactants.ts";
import type { IngredientCharge } from "../types/ingredients.ts";

export interface CleanserSurfactantInput {
  id: string;
  /** Percent of the total formula as entered. */
  percent: number;
}

export interface CleanserInput {
  batchGrams: number;
  surfactants: CleanserSurfactantInput[];
  /** Target finished pH, if the maker has one in mind. */
  targetPh: number | null;
}

export interface CleanserSurfactantRow {
  id: string;
  name: string;
  charge: IngredientCharge;
  /** Percent of the total formula. */
  percent: number;
  /** Active matter contributed, percent of the total formula. */
  asmContribution: number;
  grams: number;
}

export type GentlenessLabel = "gentle" | "moderate" | "strong";

export interface CleanserResult {
  batchGrams: number;
  /** Total active surfactant matter, percent of formula. */
  totalAsm: number;
  rows: CleanserSurfactantRow[];
  charges: IngredientCharge[];
  compatible: boolean;
  compatibilityNote: string | null;
  synergyNote: string | null;
  /** 0–100 heuristic. Higher is milder. */
  gentlenessScore: number;
  gentlenessLabel: GentlenessLabel;
  recommendedPhRange: [number, number] | null;
  phNote: string | null;
  warnings: string[];
  unknownIds: string[];
}

function nonNegative(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

export function gentlenessLabelForScore(score: number): GentlenessLabel {
  if (score >= 80) return "gentle";
  if (score >= 60) return "moderate";
  return "strong";
}

export const GENTLENESS_LABEL: Record<GentlenessLabel, string> = {
  gentle: "Gentle",
  moderate: "Moderate",
  strong: "Strong",
};

/**
 * Gentleness heuristic, 0–100. Starts kind and docks points for what
 * actually irritates skin: high total active matter, and anionic-heavy
 * systems without an amphoteric to soften them. Amphoteric and nonionic
 * content earns points back. Heuristic — patch tests beat arithmetic.
 */
export function gentlenessScore(
  totalAsm: number,
  anionicAsmShare: number,
  amphotericAsmShare: number,
  nonionicAsmShare: number,
): number {
  let score = 100;
  score -= Math.min(45, Math.max(0, totalAsm - 12) * 2.5);
  if (anionicAsmShare > 0.7 && amphotericAsmShare < 0.1) score -= 12;
  if (amphotericAsmShare >= 0.25) score += 8;
  if (nonionicAsmShare >= 0.2) score += 5;
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Recommended finished-pH window: the overlap of every surfactant's ideal
 * range. Returns null when there is no common window (or no surfactants).
 */
export function recommendedPhRange(
  records: SurfactantRecord[],
): [number, number] | null {
  if (records.length === 0) return null;
  let lo = -Infinity;
  let hi = Infinity;
  for (const record of records) {
    lo = Math.max(lo, record.ideal_ph_range[0]);
    hi = Math.min(hi, record.ideal_ph_range[1]);
  }
  if (lo > hi) return null;
  return [lo, hi];
}

/**
 * Deterministic, side-effect-free cleanser calculator: total active
 * surfactant matter, charge compatibility, a gentleness read, and pH
 * guidance. Percents are of the total formula.
 */
export function computeCleanser(
  input: CleanserInput,
  database: SurfactantRecord[] = SURFACTANTS,
): CleanserResult {
  const batchGrams = nonNegative(input.batchGrams);
  const warnings: string[] = [];
  const unknownIds: string[] = [];

  const rows: CleanserSurfactantRow[] = [];
  for (const item of input.surfactants) {
    const percent = nonNegative(item.percent);
    if (percent <= 0) continue;
    const record = getSurfactantById(item.id, database);
    if (!record) {
      unknownIds.push(item.id);
      continue;
    }
    rows.push({
      id: record.id,
      name: record.name,
      charge: record.charge,
      percent,
      asmContribution: percent * record.asm_fraction,
      grams: (percent / 100) * batchGrams,
    });
  }

  if (rows.length === 0) {
    return {
      batchGrams,
      totalAsm: 0,
      rows: [],
      charges: [],
      compatible: true,
      compatibilityNote: null,
      synergyNote: null,
      gentlenessScore: 100,
      gentlenessLabel: "gentle",
      recommendedPhRange: null,
      phNote: null,
      warnings: ["Nothing in the bowl yet — pick at least one surfactant."],
      unknownIds,
    };
  }

  const totalAsm = rows.reduce((sum, row) => sum + row.asmContribution, 0);
  const charges = [...new Set(rows.map((row) => row.charge))];

  const anionicAsm = rows
    .filter((row) => row.charge === "anionic")
    .reduce((sum, row) => sum + row.asmContribution, 0);
  const amphotericAsm = rows
    .filter((row) => row.charge === "amphoteric")
    .reduce((sum, row) => sum + row.asmContribution, 0);
  const nonionicAsm = rows
    .filter((row) => row.charge === "nonionic")
    .reduce((sum, row) => sum + row.asmContribution, 0);

  // Anionic + cationic: the classic incompatibility — they bind to each
  // other and drop out instead of cleaning.
  const compatible = !(
    charges.includes("anionic") && charges.includes("cationic")
  );
  const compatibilityNote = compatible
    ? null
    : "Anionic meets cationic — they'll bind to each other and fall out of solution instead of cleaning. Pick one team.";

  const synergyNote =
    amphotericAsm > 0 && anionicAsm > 0
      ? "Betaine in the mix softens the whole system — the classic way to keep an anionic cleanser kind."
      : null;

  const score = gentlenessScore(
    totalAsm,
    totalAsm > 0 ? anionicAsm / totalAsm : 0,
    totalAsm > 0 ? amphotericAsm / totalAsm : 0,
    totalAsm > 0 ? nonionicAsm / totalAsm : 0,
  );
  const gentlenessLabel = gentlenessLabelForScore(score);

  const records = rows.map(
    (row) => getSurfactantById(row.id, database) as SurfactantRecord,
  );
  const phRange = recommendedPhRange(records);

  let phNote: string | null = null;
  const targetPh =
    input.targetPh !== null && Number.isFinite(input.targetPh)
      ? input.targetPh
      : null;
  if (phRange && targetPh !== null) {
    if (targetPh < phRange[0] || targetPh > phRange[1]) {
      phNote = `Your target pH ${targetPh} sits outside the happy window (${phRange[0]}–${phRange[1]}) for this blend — check stability before you commit.`;
    } else {
      phNote = `Your target pH ${targetPh} sits inside the happy window (${phRange[0]}–${phRange[1]}).`;
    }
  } else if (!phRange) {
    phNote =
      "These surfactants share no common pH window — check each one's range and pick your compromise deliberately.";
  }

  if (totalAsm > 20) {
    warnings.push(
      `Total active matter is ${totalAsm.toFixed(1)}% — that's a strong cleanser. Fine for a clarifying wash, harsh for daily faces.`,
    );
  } else if (totalAsm < 5) {
    warnings.push(
      `Total active matter is only ${totalAsm.toFixed(1)}% — this will barely foam. Fine for a gentle milky cleanser, thin for a foaming wash.`,
    );
  }
  if (!compatible && compatibilityNote) warnings.push(compatibilityNote);
  if (unknownIds.length > 0) {
    warnings.push(
      `Skipped ${unknownIds.length} surfactant${unknownIds.length === 1 ? "" : "s"} not in the library.`,
    );
  }

  return {
    batchGrams,
    totalAsm,
    rows,
    charges,
    compatible,
    compatibilityNote,
    synergyNote,
    gentlenessScore: score,
    gentlenessLabel,
    recommendedPhRange: phRange,
    phNote,
    warnings,
    unknownIds,
  };
}
