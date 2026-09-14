import { getOilById, OIL_DATABASE } from "../data/oils.ts";
import { recipeUnitToGrams } from "./format.ts";
import type {
  BatchResult,
  MasterOilRecord,
  RecipeConfig,
} from "../types/soap.ts";

export const GLYCERIN_YIELD = 0.105;
export const CURE_WATER_RETAINED = 0.85;

export interface LabelLine {
  name: string;
  grams: number;
  footnote?: boolean;
}

export interface LabelOutput {
  lines: LabelLine[];
  text: string;
  method: "fda_input" | "eu_saponified";
}

function mergeLines(lines: LabelLine[]): LabelLine[] {
  const map = new Map<string, LabelLine>();
  for (const line of lines) {
    if (line.grams <= 0) continue;
    const key = `${line.name}|${line.footnote ? 1 : 0}`;
    const existing = map.get(key);
    if (existing) existing.grams += line.grams;
    else map.set(key, { ...line });
  }
  return [...map.values()].sort((a, b) => b.grams - a.grams || a.name.localeCompare(b.name));
}

function formatList(lines: LabelLine[], footnote: string | null): string {
  const names = lines.map((line) => (line.footnote ? `${line.name}*` : line.name));
  const body = names.join(", ");
  if (footnote) return `Ingredients: ${body} ${footnote}`;
  return `Ingredients: ${body}`;
}

export function fdaInputLabel(
  config: RecipeConfig,
  result: BatchResult,
  database: MasterOilRecord[] = OIL_DATABASE,
): LabelOutput {
  const toG = (amount: number) => recipeUnitToGrams(amount, config.unit);
  const lines: LabelLine[] = [];

  for (const row of config.oils) {
    const oil = getOilById(row.oilId, database);
    if (!oil || row.amount <= 0) continue;
    lines.push({ name: oil.name, grams: toG(row.amount) });
  }

  if (result.liquidWeight > 0) {
    lines.push({ name: "Water", grams: toG(result.liquidWeight) });
  }
  if (result.dryLyeWeight.naoh > 0) {
    lines.push({
      name: "Sodium Hydroxide",
      grams: toG(result.dryLyeWeight.naoh),
      footnote: true,
    });
  }
  if (result.dryLyeWeight.koh > 0) {
    lines.push({
      name: "Potassium Hydroxide",
      grams: toG(result.dryLyeWeight.koh),
      footnote: true,
    });
  }
  const fragrance = config.additives?.fragranceGrams ?? 0;
  if (fragrance > 0) lines.push({ name: "Fragrance", grams: toG(fragrance) });
  const lactate = config.additives?.sodiumLactateGrams ?? 0;
  if (lactate > 0) lines.push({ name: "Sodium Lactate", grams: toG(lactate) });

  const merged = mergeLines(lines);
  const hasAlkali = merged.some((line) => line.footnote);
  return {
    method: "fda_input",
    lines: merged,
    text: formatList(
      merged,
      hasAlkali ? "(*None remains in finished soap)." : null,
    ),
  };
}

export function euSaponifiedLabel(
  config: RecipeConfig,
  result: BatchResult,
  database: MasterOilRecord[] = OIL_DATABASE,
): LabelOutput {
  const toG = (amount: number) => recipeUnitToGrams(amount, config.unit);
  const totalOilG = toG(result.totalOilWeight);
  const sf = Math.min(1, Math.max(0, config.superfatPercentage / 100));
  const sapFrac = 1 - sf;
  const naohRatio = Math.min(1, Math.max(0, config.lyeChoice.naohRatio));
  const lines: LabelLine[] = [];

  for (const row of config.oils) {
    const oil = getOilById(row.oilId, database);
    if (!oil || row.amount <= 0) continue;
    const grams = toG(row.amount);
    const sapGrams = grams * sapFrac;
    if (naohRatio > 0 && sapGrams > 0) {
      lines.push({
        name: oil.inci_names.saponified_naoh,
        grams: sapGrams * naohRatio,
      });
    }
    if (naohRatio < 1 && sapGrams > 0) {
      lines.push({
        name: oil.inci_names.saponified_koh,
        grams: sapGrams * (1 - naohRatio),
      });
    }
    const leftover = grams * sf;
    if (leftover > 0) {
      lines.push({ name: oil.inci_names.standard, grams: leftover });
    }
  }

  const glycerin = totalOilG * GLYCERIN_YIELD;
  if (glycerin > 0) lines.push({ name: "Glycerin", grams: glycerin });

  const aqua = toG(result.liquidWeight) * CURE_WATER_RETAINED;
  if (aqua > 0) lines.push({ name: "Aqua", grams: aqua });

  const fragrance = config.additives?.fragranceGrams ?? 0;
  if (fragrance > 0) lines.push({ name: "Parfum", grams: toG(fragrance) });
  const lactate = config.additives?.sodiumLactateGrams ?? 0;
  if (lactate > 0) lines.push({ name: "Sodium Lactate", grams: toG(lactate) });

  const merged = mergeLines(lines);
  return {
    method: "eu_saponified",
    lines: merged,
    text: formatList(merged, null),
  };
}
