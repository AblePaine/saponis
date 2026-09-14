import {
  DANGER_UNSATURATED_SOLUTION,
  FATTY_ACID_KEYS,
  WARNING_EXCESS_WATER,
  WARNING_STRIPPING_BAR,
  type BatchResult,
  type FattyAcidProfile,
  type MasterOilRecord,
  type QualityScores,
  type RecipeConfig,
} from "../types/soap.ts";

const EMPTY_FATTY_ACIDS: FattyAcidProfile = {
  lauric: 0,
  myristic: 0,
  palmitic: 0,
  stearic: 0,
  ricinoleic: 0,
  oleic: 0,
  linoleic: 0,
  linolenic: 0,
};

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function nonNegative(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

function emptyFattyAcids(): FattyAcidProfile {
  return { ...EMPTY_FATTY_ACIDS };
}

export function qualityFromFattyAcids(
  fattyAcids: FattyAcidProfile,
  iodine: number,
  ins: number,
): QualityScores {
  return {
    hardness:
      fattyAcids.lauric +
      fattyAcids.myristic +
      fattyAcids.palmitic +
      fattyAcids.stearic,
    cleansing: fattyAcids.lauric + fattyAcids.myristic,
    conditioning:
      fattyAcids.oleic +
      fattyAcids.linoleic +
      fattyAcids.linolenic +
      fattyAcids.ricinoleic,
    bubbly: fattyAcids.lauric + fattyAcids.myristic + fattyAcids.ricinoleic,
    creamy: fattyAcids.palmitic + fattyAcids.stearic + fattyAcids.ricinoleic,
    longevity: fattyAcids.palmitic + fattyAcids.stearic,
    iodine,
    ins,
  };
}

function mergeOilAmounts(config: RecipeConfig): Map<string, number> {
  const merged = new Map<string, number>();
  for (const input of config.oils) {
    const amount = nonNegative(input.amount);
    if (amount === 0) continue;
    merged.set(input.oilId, (merged.get(input.oilId) ?? 0) + amount);
  }
  return merged;
}

function liquidFromConfig(
  mode: RecipeConfig["liquidConfig"]["mode"],
  value: number,
  totalDryLye: number,
  totalOilWeight: number,
): number {
  const v = nonNegative(value);
  switch (mode) {
    case "concentration": {
      if (v <= 0 || v >= 100) return 0;
      const solution = totalDryLye / (v / 100);
      return Math.max(0, solution - totalDryLye);
    }
    case "ratio":
      return totalDryLye * v;
    case "water_percent_oils":
      return totalOilWeight * (v / 100);
  }
}

/**
 * Deterministic, side-effect-free cold-process batch calculator.
 * All mass units are consistent with `config.unit`; SAP values are dimensionless ratios.
 */
export function computeBatch(
  config: RecipeConfig,
  oilDatabase: MasterOilRecord[],
): BatchResult {
  const oilIndex = new Map(oilDatabase.map((oil) => [oil.id, oil]));
  const safetyAlerts: string[] = [];
  const merged = mergeOilAmounts(config);

  const resolved: { record: MasterOilRecord; amount: number }[] = [];
  for (const [oilId, amount] of merged) {
    const record = oilIndex.get(oilId);
    if (!record) {
      safetyAlerts.push(
        `UNKNOWN_OIL: ${oilId} is not in the master oil database.`,
      );
      continue;
    }
    resolved.push({ record, amount });
  }

  const totalOilWeight = resolved.reduce((sum, row) => sum + row.amount, 0);

  const naohRatio = clamp(config.lyeChoice.naohRatio, 0, 1);
  const naohPurity =
    config.lyeChoice.naohPurity > 0 ? config.lyeChoice.naohPurity : 1;
  const kohPurity =
    config.lyeChoice.kohPurity > 0 ? config.lyeChoice.kohPurity : 0.9;
  const superfatPercentage = Number.isFinite(config.superfatPercentage)
    ? config.superfatPercentage
    : 0;
  const discount = 1 - superfatPercentage / 100;

  let naohPure = 0;
  let kohPure = 0;
  for (const { record, amount } of resolved) {
    naohPure += amount * record.sap_naoh * naohRatio;
    kohPure += amount * record.sap_koh * (1 - naohRatio);
  }

  const actualNaoh = (naohPure * discount) / naohPurity;
  const actualKoh = (kohPure * discount) / kohPurity;
  const totalDryLye = actualNaoh + actualKoh;

  const liquidWeight = liquidFromConfig(
    config.liquidConfig.mode,
    config.liquidConfig.value,
    totalDryLye,
    totalOilWeight,
  );

  const solutionMass = totalDryLye + liquidWeight;
  const lyeConcentrationPercent =
    solutionMass > 0 ? (totalDryLye / solutionMass) * 100 : 0;
  const waterToLyeRatio = totalDryLye > 0 ? liquidWeight / totalDryLye : 0;
  const waterAsPercentOils =
    totalOilWeight > 0 ? (liquidWeight / totalOilWeight) * 100 : 0;

  const fattyAcids = emptyFattyAcids();
  let iodine = 0;
  let ins = 0;
  if (totalOilWeight > 0) {
    for (const { record, amount } of resolved) {
      const weight = amount / totalOilWeight;
      for (const key of FATTY_ACID_KEYS) {
        fattyAcids[key] += record.fatty_acids[key] * weight;
      }
      iodine += record.iodine * weight;
      ins += record.ins * weight;
    }
  }

  const qualityScores = qualityFromFattyAcids(fattyAcids, iodine, ins);

  if (totalOilWeight > 0) {
    if (lyeConcentrationPercent > 40) {
      safetyAlerts.push(DANGER_UNSATURATED_SOLUTION);
    }
    if (lyeConcentrationPercent < 25) {
      safetyAlerts.push(WARNING_EXCESS_WATER);
    }
    if (qualityScores.cleansing > 22 && superfatPercentage < 6) {
      safetyAlerts.push(WARNING_STRIPPING_BAR);
    }
  }

  const fragrance = nonNegative(config.additives?.fragranceGrams ?? 0);
  const sodiumLactate = nonNegative(config.additives?.sodiumLactateGrams ?? 0);
  const totalBatchWeight =
    totalOilWeight + totalDryLye + liquidWeight + fragrance + sodiumLactate;

  return {
    totalOilWeight,
    dryLyeWeight: {
      naoh: actualNaoh,
      koh: actualKoh,
      total: totalDryLye,
    },
    liquidWeight,
    totalBatchWeight,
    lyeConcentrationPercent,
    waterToLyeRatio,
    waterAsPercentOils,
    fattyAcids,
    qualityScores,
    safetyAlerts,
  };
}

export function emptyFattyAcidProfile(): FattyAcidProfile {
  return emptyFattyAcids();
}
