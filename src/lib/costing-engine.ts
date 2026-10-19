import {
  BATTER_DENSITY_G_CM3,
  computeMold,
  type FillMode,
  type MoldInput,
} from "./mold-engine.ts";

/**
 * Costing suite — free engines: mold-fill sizing (Tool C) and cost-per-unit
 * (Tool A) of the "size it → cost it → price it" flow.
 *
 * Mold-fill is a standalone front door to the Pro mold engine: it calls
 * computeMold in mold-engine.ts directly, so the batter-density / oil-
 * fraction / headspace constants live in exactly one place and are never
 * forked here. Its extensions over computeMold are cavity counts, a cured
 * (post water-loss) weight, and a per-bar cured weight.
 *
 * The wholesale ladder (Tool B) is the suite's Pro piece and lives in
 * wholesale-engine.ts. It is deliberately NOT wired into the agent API —
 * same fence as the label engine. Everything in this file is free and
 * gets full agent parity (REST + MCP + OpenAPI).
 *
 * House rules, same as every Saponis engine: user-supplied numbers only.
 * The sample rows below are stamped SAMPLE — plausible craft-supplier
 * prices for hand-checking the math, never presented as market prices.
 */

/* ------------------------------------------------------------------ */
/* Tool C — mold-fill sizing (standalone)                              */
/* ------------------------------------------------------------------ */

export interface MoldFillInput extends MoldInput {
  fill: FillMode;
  /** Number of cavities in the mold; dims describe ONE cavity. */
  cavities: number;
  /** Percent of batter weight lost as water during cure. */
  cureLossPercent: number;
  /**
   * Bars the batch is cut/poured into for the per-bar cured weight.
   * 0 (or omitted by callers via the default) = use the cavity count —
   * right for cavity molds; loaf makers pass their cut count.
   */
  bars: number;
}

export interface MoldFillResult {
  perCavityVolumeCm3: number;
  totalVolumeCm3: number;
  usableVolumeCm3: number;
  batterGrams: number;
  oilChargeGrams: number;
  curedGrams: number;
  perBarCuredGrams: number;
  bars: number;
  fill: FillMode;
}

export const DEFAULT_MOLD_FILL: MoldFillInput = {
  shape: "loaf",
  unit: "in",
  length: 10,
  width: 3.5,
  height: 3.5,
  diameter: 3,
  waterGrams: 0,
  fill: "headspace",
  cavities: 1,
  cureLossPercent: 10,
  bars: 0,
};

function positiveInt(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value < 1) return fallback;
  return Math.floor(value);
}

function nonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function computeMoldFill(input: MoldFillInput): MoldFillResult {
  const cavities = positiveInt(input.cavities, 1);
  const bars = input.bars >= 1 ? Math.floor(input.bars) : cavities;
  // computeMold gives the volume of ONE cavity (or, for water_fill, of the
  // whole mold — the weighed water is already the total) plus the batter
  // and oil charge for that volume under the fill mode.
  const one = computeMold(input, input.fill);
  const perCavityVolumeCm3 = one.volumeCm3;
  const totalVolumeCm3 =
    input.shape === "water_fill"
      ? perCavityVolumeCm3
      : perCavityVolumeCm3 * cavities;
  const batterGrams =
    input.shape === "water_fill"
      ? one.batterGrams
      : one.batterGrams * cavities;
  const oilChargeGrams =
    input.shape === "water_fill"
      ? one.oilWeightGrams
      : one.oilWeightGrams * cavities;
  const curedGrams = batterGrams * (1 - nonNegative(input.cureLossPercent) / 100);
  return {
    perCavityVolumeCm3,
    totalVolumeCm3,
    // Volume actually filled with batter (after headspace), derived from
    // the batter weight so it can never disagree with computeMold.
    usableVolumeCm3: batterGrams / BATTER_DENSITY_G_CM3,
    batterGrams,
    oilChargeGrams,
    curedGrams,
    perBarCuredGrams: bars > 0 ? curedGrams / bars : 0,
    bars,
    fill: input.fill,
  };
}

/* ------------------------------------------------------------------ */
/* Tool A — cost per unit                                              */
/* ------------------------------------------------------------------ */

export type CostRowMode = "weight" | "flat";

export interface CostRow {
  name: string;
  /** Grams of this ingredient in the batch (weight mode). */
  amountGrams: number;
  /** Price paid for the purchased amount, dollars (weight mode). */
  pricePaid: number;
  /** Grams purchased for pricePaid (weight mode). */
  purchasedGrams: number;
  mode: CostRowMode;
  /** Flat dollars-per-batch cost (flat mode, e.g. mica, embeds). */
  flatCost: number;
}

export interface CostInput {
  rows: CostRow[];
  packagingPerBar: number;
  laborMinutes: number;
  laborRatePerHour: number;
  overheadPerBatch: number;
  yieldBars: number;
  shrinkBars: number;
  targetMarginPercent: number;
  /** Cure-time carrying cost: annual rate %; 0 = off (the default). */
  carryingRatePercent: number;
  cureWeeks: number;
  /** Optional channel fees, netted against suggested retail. */
  channelFeePercent: number;
  channelFeeFixed: number;
}

export interface CostLineResult {
  name: string;
  cost: number;
}

export interface CostStackShares {
  ingredients: number;
  packaging: number;
  labor: number;
  overhead: number;
  carrying: number;
}

export interface CostResult {
  lines: CostLineResult[];
  ingredientSubtotal: number;
  carryingCost: number;
  packagingTotal: number;
  laborTotal: number;
  overheadPerBatch: number;
  batchTotal: number;
  goodBars: number;
  unitCost: number;
  ingredientsPerBar: number;
  suggestedRetail: number;
  channelFeeAtRetail: number;
  netRetailAfterFees: number;
  marginDollarsAtRetail: number;
  stackShares: CostStackShares;
}

export function lineCost(row: CostRow): number {
  if (row.mode === "flat") return nonNegative(row.flatCost);
  const purchased = nonNegative(row.purchasedGrams);
  if (purchased <= 0) return 0;
  return (nonNegative(row.amountGrams) / purchased) * nonNegative(row.pricePaid);
}

/** SAMPLE prices — hand-check seeds only, not market data. */
export const SAMPLE_COST_ROWS: CostRow[] = [
  { name: "Olive oil", amountGrams: 700, pricePaid: 18, purchasedGrams: 3000, mode: "weight", flatCost: 0 },
  { name: "Coconut oil 76°", amountGrams: 250, pricePaid: 14, purchasedGrams: 2000, mode: "weight", flatCost: 0 },
  { name: "Shea butter", amountGrams: 100, pricePaid: 16, purchasedGrams: 1000, mode: "weight", flatCost: 0 },
  { name: "NaOH (lye)", amountGrams: 147, pricePaid: 9, purchasedGrams: 1000, mode: "weight", flatCost: 0 },
  { name: "Distilled water", amountGrams: 294, pricePaid: 1.2, purchasedGrams: 3785, mode: "weight", flatCost: 0 },
  { name: "Fragrance oil", amountGrams: 45, pricePaid: 24, purchasedGrams: 454, mode: "weight", flatCost: 0 },
  { name: "Mica colorant", amountGrams: 0, pricePaid: 0, purchasedGrams: 0, mode: "flat", flatCost: 0.6 },
];

/** Total oil weight of the sample recipe — the mold→cost scale anchor. */
export const SAMPLE_OIL_GRAMS = 1050;

export const DEFAULT_COST_INPUT: CostInput = {
  rows: SAMPLE_COST_ROWS,
  packagingPerBar: 0.45,
  laborMinutes: 45,
  laborRatePerHour: 15,
  overheadPerBatch: 2.5,
  yieldBars: 12,
  shrinkBars: 0,
  targetMarginPercent: 65,
  carryingRatePercent: 0,
  cureWeeks: 4,
  channelFeePercent: 0,
  channelFeeFixed: 0,
};

export function computeCost(input: CostInput): CostResult {
  const lines = input.rows.map((row) => ({ name: row.name, cost: lineCost(row) }));
  const ingredientSubtotal = lines.reduce((sum, line) => sum + line.cost, 0);
  const goodBars = Math.max(
    0,
    Math.floor(nonNegative(input.yieldBars)) - Math.floor(nonNegative(input.shrinkBars)),
  );
  const carryingCost =
    ingredientSubtotal *
    (nonNegative(input.carryingRatePercent) / 100) *
    (nonNegative(input.cureWeeks) / 52);
  const packagingTotal = nonNegative(input.packagingPerBar) * goodBars;
  const laborTotal =
    (nonNegative(input.laborMinutes) / 60) * nonNegative(input.laborRatePerHour);
  const overheadPerBatch = nonNegative(input.overheadPerBatch);
  const batchTotal =
    ingredientSubtotal + packagingTotal + laborTotal + overheadPerBatch + carryingCost;
  const unitCost = goodBars > 0 ? batchTotal / goodBars : 0;
  const ingredientsPerBar = goodBars > 0 ? ingredientSubtotal / goodBars : 0;
  const margin = nonNegative(input.targetMarginPercent);
  const suggestedRetail =
    margin < 100 && unitCost > 0 ? unitCost / (1 - margin / 100) : 0;
  const channelFeeAtRetail =
    suggestedRetail * (nonNegative(input.channelFeePercent) / 100) +
    nonNegative(input.channelFeeFixed);
  const share = (part: number) => (batchTotal > 0 ? (part / batchTotal) * 100 : 0);
  return {
    lines,
    ingredientSubtotal,
    carryingCost,
    packagingTotal,
    laborTotal,
    overheadPerBatch,
    batchTotal,
    goodBars,
    unitCost,
    ingredientsPerBar,
    suggestedRetail,
    channelFeeAtRetail,
    netRetailAfterFees: suggestedRetail - channelFeeAtRetail,
    marginDollarsAtRetail: suggestedRetail - unitCost,
    stackShares: {
      ingredients: share(ingredientSubtotal),
      packaging: share(packagingTotal),
      labor: share(laborTotal),
      overhead: share(overheadPerBatch),
      carrying: share(carryingCost),
    },
  };
}
