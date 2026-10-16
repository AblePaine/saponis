import type { CoolMethod } from "./balm-engine.ts";
import type { FoBasis } from "./candle-engine.ts";

/**
 * Shareable bench links for the balm, emulsion, and candle benches —
 * companion to recipe-url.ts (which covers the soap bench with the same
 * `?r=` compact pipe format). Each bench's state round-trips through the
 * URL so a formula can be linked, bookmarked, or handed to an agent.
 *
 * Pipe formats (in `?r=`):
 *
 *   balm:     batchGrams|coolMethod(s|f)|id:pct,id:pct,…
 *   emulsion: batchGrams|oilPhasePct|evapPct|oilId:pct,…|emulId:pct,…|presId-or-"-"|presPct
 *   candle:   waterGrams|vesselCount|waxId|customSg|headspacePct|wastePct|basis(w|f)|foLoadPct|maxFoPct|ifraCapPct
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
