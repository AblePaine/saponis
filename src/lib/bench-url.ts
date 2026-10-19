import type { CoolMethod } from "./balm-engine.ts";
import type { FoBasis } from "./candle-engine.ts";
import type { CostInput, CostRow, MoldFillInput } from "./costing-engine.ts";
import type { WholesaleInput, WholesaleTierInput } from "./wholesale-engine.ts";

/**
 * Shareable bench links for the balm, emulsion, candle, and costing
 * benches — companion to recipe-url.ts (which covers the soap bench with
 * the same `?r=` compact pipe format). Each bench's state round-trips
 * through the URL so a formula can be linked, bookmarked, or handed to
 * an agent.
 *
 * Pipe formats (in `?r=`):
 *
 *   balm:     batchGrams|coolMethod(s|f)|id:pct,id:pct,…
 *   emulsion: batchGrams|oilPhasePct|evapPct|oilId:pct,…|emulId:pct,…|presId-or-"-"|presPct
 *   candle:   waterGrams|vesselCount|waxId|customSg|headspacePct|wastePct|basis(w|f)|foLoadPct|maxFoPct|ifraCapPct
 *   costing:  mold(11 fields)|cost(11 fields)|rows(name~amt~price~bought~mode~flat,…)|floorMargin|tiers(name~discount~minQty,…)
 *
 * Numbers use the same compact formatting as recipe-url (integers stay
 * plain; fractions get up to 3 decimals, trailing zeros stripped) and the
 * decoders apply UI-shaped bounds. Ingredient ids are joined raw — the
 * library ids are URL-safe slugs.
 */

/* ------------------------------------------------------------------ */
/* Shared pieces (kept in step with recipe-url.ts)                     */
/* ------------------------------------------------------------------ */

function compact(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (Number.isInteger(value)) return String(value);
  return value
    .toFixed(3)
    .replace(/0+$/, "")
    .replace(/\.$/, "");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function num(value: string | undefined, fallback = 0): number {
  if (value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function readBenchEncoded(search?: string): string | null {
  const query =
    search ??
    (typeof window !== "undefined" ? window.location.search : "");
  const params = new URLSearchParams(query);
  const encoded = params.get("r");
  return encoded && encoded.length > 0 ? encoded : null;
}

/** ReplaceState-write the encoded state into `?r=`, mirroring writeRecipeToUrl. */
export function writeBenchEncoded(encoded: string): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("r", encoded);
  const next = url.toString();
  if (next !== window.location.href) {
    window.history.replaceState(null, "", next);
  }
}

function encodePercentMap(percents: Record<string, number>): string {
  return Object.entries(percents)
    .filter(([, pct]) => Number.isFinite(pct) && pct > 0)
    .map(([id, pct]) => `${id}:${compact(pct)}`)
    .join(",");
}

function decodePercentMap(
  segment: string | undefined,
): Record<string, number> {
  const percents: Record<string, number> = {};
  if (!segment) return percents;
  for (const entry of segment.split(",")) {
    const [id, rawPct] = entry.split(":");
    if (!id) continue;
    percents[id] = clamp(num(rawPct), 0, 100);
  }
  return percents;
}

/* ------------------------------------------------------------------ */
/* Balm                                                                */
/* ------------------------------------------------------------------ */

export interface BalmUrlState {
  batchGrams: number;
  coolMethod: CoolMethod;
  percents: Record<string, number>;
}

export function encodeBalmState(state: BalmUrlState): string {
  return [
    compact(state.batchGrams),
    state.coolMethod === "slow" ? "s" : "f",
    encodePercentMap(state.percents),
  ].join("|");
}

export function decodeBalmState(encoded: string | null): BalmUrlState | null {
  if (!encoded) return null;
  const parts = encoded.split("|");
  if (parts.length < 3) return null;
  return {
    batchGrams: clamp(num(parts[0], 100), 0, 100_000),
    coolMethod: parts[1] === "s" ? "slow" : "fast",
    percents: decodePercentMap(parts[2]),
  };
}

/* ------------------------------------------------------------------ */
/* Emulsion                                                            */
/* ------------------------------------------------------------------ */

export interface EmulsionUrlState {
  batchGrams: number;
  oilPhasePercent: number;
  evaporationPercent: number;
  oilPercents: Record<string, number>;
  emulsifierPercents: Record<string, number>;
  /** "" means none selected. */
  preservativeId: string;
  preservativePercent: number;
}

export function encodeEmulsionState(state: EmulsionUrlState): string {
  return [
    compact(state.batchGrams),
    compact(state.oilPhasePercent),
    compact(state.evaporationPercent),
    encodePercentMap(state.oilPercents),
    encodePercentMap(state.emulsifierPercents),
    state.preservativeId === "" ? "-" : state.preservativeId,
    compact(state.preservativePercent),
  ].join("|");
}

export function decodeEmulsionState(
  encoded: string | null,
): EmulsionUrlState | null {
  if (!encoded) return null;
  const parts = encoded.split("|");
  if (parts.length < 7) return null;
  const preservativeId = parts[5] ?? "-";
  return {
    batchGrams: clamp(num(parts[0], 100), 0, 100_000),
    oilPhasePercent: clamp(num(parts[1], 20), 0, 100),
    evaporationPercent: clamp(num(parts[2], 10), 0, 30),
    oilPercents: decodePercentMap(parts[3]),
    emulsifierPercents: decodePercentMap(parts[4]),
    preservativeId: preservativeId === "-" ? "" : preservativeId,
    preservativePercent: clamp(num(parts[6]), 0, 100),
  };
}

/* ------------------------------------------------------------------ */
/* Candle                                                              */
/* ------------------------------------------------------------------ */

export interface CandleUrlState {
  waterGrams: number;
  vesselCount: number;
  waxId: string;
  customSg: number;
  headspacePercent: number;
  wastePercent: number;
  foBasis: FoBasis;
  foLoadPercent: number;
  maxFoPercent: number;
  ifraCapPercent: number;
}

export function encodeCandleState(state: CandleUrlState): string {
  return [
    compact(state.waterGrams),
    compact(state.vesselCount),
    state.waxId,
    compact(state.customSg),
    compact(state.headspacePercent),
    compact(state.wastePercent),
    state.foBasis === "finished" ? "f" : "w",
    compact(state.foLoadPercent),
    compact(state.maxFoPercent),
    compact(state.ifraCapPercent),
  ].join("|");
}

export function decodeCandleState(
  encoded: string | null,
): CandleUrlState | null {
  if (!encoded) return null;
  const parts = encoded.split("|");
  if (parts.length < 10) return null;
  return {
    waterGrams: clamp(num(parts[0], 240), 0, 1_000_000),
    vesselCount: Math.floor(clamp(num(parts[1], 4), 0, 100_000)),
    waxId: parts[2] ?? "soy-container-seed",
    customSg: clamp(num(parts[3]), 0, 5),
    headspacePercent: clamp(num(parts[4], 10), 0, 100),
    wastePercent: clamp(num(parts[5], 3), 0, 100),
    foBasis: parts[6] === "f" ? "finished" : "wax",
    foLoadPercent: clamp(num(parts[7], 8), 0, 100),
    maxFoPercent: clamp(num(parts[8]), 0, 100),
    ifraCapPercent: clamp(num(parts[9]), 0, 100),
  };
}

/* ------------------------------------------------------------------ */
/* Costing suite                                                       */
/* ------------------------------------------------------------------ */

export interface CostingUrlState {
  mold: MoldFillInput;
  cost: CostInput;
  /** Wholesale retail/cost are NOT stored — the bench feeds them from
   *  the cost tool's result, exactly like the tab handoff does. */
  wholesale: Pick<WholesaleInput, "floorMarginPercent" | "tiers">;
}

const MOLD_SHAPES = ["loaf", "slab", "cylinder", "water_fill"] as const;

function encodeCostRow(row: CostRow): string {
  return [
    encodeURIComponent(row.name),
    compact(row.amountGrams),
    compact(row.pricePaid),
    compact(row.purchasedGrams),
    row.mode === "flat" ? "f" : "w",
    compact(row.flatCost),
  ].join("~");
}

function decodeCostRow(entry: string): CostRow | null {
  const parts = entry.split("~");
  if (parts.length < 6) return null;
  let name = parts[0] ?? "";
  try {
    name = decodeURIComponent(name);
  } catch {
    /* keep the raw name */
  }
  return {
    name,
    amountGrams: clamp(num(parts[1]), 0, 1_000_000),
    pricePaid: clamp(num(parts[2]), 0, 1_000_000),
    purchasedGrams: clamp(num(parts[3]), 0, 1_000_000),
    mode: parts[4] === "f" ? "flat" : "weight",
    flatCost: clamp(num(parts[5]), 0, 1_000_000),
  };
}

function encodeTier(tier: WholesaleTierInput): string {
  return [
    encodeURIComponent(tier.name),
    compact(tier.discountPercent),
    compact(tier.minQty),
  ].join("~");
}

function decodeTier(entry: string): WholesaleTierInput | null {
  const parts = entry.split("~");
  if (parts.length < 3) return null;
  let name = parts[0] ?? "";
  try {
    name = decodeURIComponent(name);
  } catch {
    /* keep the raw name */
  }
  return {
    name,
    discountPercent: clamp(num(parts[1]), 0, 100),
    minQty: Math.floor(clamp(num(parts[2]), 0, 1_000_000)),
  };
}

export function encodeCostingState(state: CostingUrlState): string {
  const { mold, cost, wholesale } = state;
  return [
    // mold (11)
    mold.shape,
    mold.unit,
    compact(mold.length),
    compact(mold.width),
    compact(mold.height),
    compact(mold.diameter),
    compact(mold.waterGrams),
    mold.fill === "headspace" ? "h" : "b",
    compact(mold.cavities),
    compact(mold.cureLossPercent),
    compact(mold.bars),
    // cost scalars (11)
    compact(cost.packagingPerBar),
    compact(cost.laborMinutes),
    compact(cost.laborRatePerHour),
    compact(cost.overheadPerBatch),
    compact(cost.yieldBars),
    compact(cost.shrinkBars),
    compact(cost.targetMarginPercent),
    compact(cost.carryingRatePercent),
    compact(cost.cureWeeks),
    compact(cost.channelFeePercent),
    compact(cost.channelFeeFixed),
    // rows, wholesale floor, tiers
    cost.rows.map(encodeCostRow).join(","),
    compact(wholesale.floorMarginPercent),
    wholesale.tiers.map(encodeTier).join(","),
  ].join("|");
}

export function decodeCostingState(encoded: string | null): CostingUrlState | null {
  if (!encoded) return null;
  const parts = encoded.split("|");
  if (parts.length < 25) return null;
  const shape = (MOLD_SHAPES as readonly string[]).includes(parts[0] ?? "")
    ? (parts[0] as CostingUrlState["mold"]["shape"])
    : "loaf";
  const rows = (parts[22] ?? "")
    .split(",")
    .filter((entry) => entry.length > 0)
    .map(decodeCostRow)
    .filter((row): row is CostRow => row !== null);
  const tiers = (parts[24] ?? "")
    .split(",")
    .filter((entry) => entry.length > 0)
    .map(decodeTier)
    .filter((tier): tier is WholesaleTierInput => tier !== null);
  return {
    mold: {
      shape,
      unit: parts[1] === "cm" ? "cm" : "in",
      length: clamp(num(parts[2], 10), 0, 10_000),
      width: clamp(num(parts[3], 3.5), 0, 10_000),
      height: clamp(num(parts[4], 3.5), 0, 10_000),
      diameter: clamp(num(parts[5], 3), 0, 10_000),
      waterGrams: clamp(num(parts[6]), 0, 1_000_000),
      fill: parts[7] === "b" ? "brim" : "headspace",
      cavities: Math.floor(clamp(num(parts[8], 1), 1, 10_000)),
      cureLossPercent: clamp(num(parts[9], 10), 0, 100),
      bars: Math.floor(clamp(num(parts[10]), 0, 10_000)),
    },
    cost: {
      rows,
      packagingPerBar: clamp(num(parts[11], 0.45), 0, 100_000),
      laborMinutes: clamp(num(parts[12], 45), 0, 100_000),
      laborRatePerHour: clamp(num(parts[13], 15), 0, 100_000),
      overheadPerBatch: clamp(num(parts[14], 2.5), 0, 100_000),
      yieldBars: clamp(num(parts[15], 12), 0, 100_000),
      shrinkBars: clamp(num(parts[16]), 0, 100_000),
      targetMarginPercent: clamp(num(parts[17], 65), 0, 100),
      carryingRatePercent: clamp(num(parts[18]), 0, 100),
      cureWeeks: clamp(num(parts[19], 4), 0, 520),
      channelFeePercent: clamp(num(parts[20]), 0, 100),
      channelFeeFixed: clamp(num(parts[21]), 0, 100_000),
    },
    wholesale: {
      floorMarginPercent: clamp(num(parts[23], 20), 0, 100),
      tiers,
    },
  };
}
