import { getCandleWaxById, CANDLE_WAXES } from "../data/candle-waxes.ts";
import type { CandleWaxRecord } from "../data/candle-waxes.ts";
import {
  getBlendProfile,
  CANDLE_BLEND_PROFILES,
} from "../data/candle-blend-profiles.ts";
import type { CandleBlendProfile } from "../data/candle-blend-profiles.ts";

/**
 * Candle blend window engine (Candle Studio expansion, candlemaking
 * brief engine D) — see docs/CANDLE_STUDIO_SPEC.md.
 *
 * A blend of candle waxes is not a mystery: its density, melt band, and
 * pour window are the mass-weighted sums of its components, and its
 * hardness and frost tendency track the same weights. This engine does
 * that arithmetic on the seed profile library and prints the estimate
 * as an estimate — a way to compare two blends before melting either,
 * not a substitute for pouring one.
 *
 * Additive heuristics (labelled as such in the output): stearic acid
 * firms a blend and lifts its melt band slightly; vybar firms paraffin
 * blends a little and takes the edge off shrinkage/frost behaviour.
 */

export interface BlendComponentInput {
  waxId: string;
  percent: number;
}

export interface CandleBlendInput {
  components: BlendComponentInput[];
  /** Stearic acid, % of the total blend. Firms and lifts melt. */
  stearicPercent?: number;
  /** Vybar (or similar polymer additive), % of the total blend. */
  vybarPercent?: number;
}

export interface BlendComponentRow {
  waxId: string;
  name: string;
  /** Normalized share of the blend, %. */
  percent: number;
  meltMidC: number;
  hardness: number;
  frostRisk: number;
}

export type HardnessBand = "soft" | "medium" | "firm" | "hard";
export type RiskBand = "low" | "medium" | "high";

export interface CandleBlendResult {
  /** True when every component resolved to a library profile. */
  complete: boolean;
  unknownWaxIds: string[];
  rows: BlendComponentRow[];
  /** Mass-weighted specific gravity — feeds the vessel-fill bench. */
  blendSg: number;
  meltLowC: number;
  meltHighC: number;
  meltMidC: number;
  /** Weighted pour window, widened by component divergence. */
  pourLowC: number;
  pourHighC: number;
  /** Spread between the hottest and coolest component melt midpoints. */
  meltSpreadC: number;
  hardnessScore: number;
  hardnessBand: HardnessBand;
  frostRiskScore: number;
  frostRiskBand: RiskBand;
  containerOk: boolean;
  pillarOk: boolean;
  warnings: string[];
  notes: string[];
}

function nonNegative(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

function band(score: number, medium: number, high: number): RiskBand {
  if (score >= high) return "high";
  if (score >= medium) return "medium";
  return "low";
}

export function hardnessBandFor(score: number): HardnessBand {
  if (score >= 0.75) return "hard";
  if (score >= 0.6) return "firm";
  if (score >= 0.4) return "medium";
  return "soft";
}

export function computeCandleBlend(
  input: CandleBlendInput,
  waxes: CandleWaxRecord[] = CANDLE_WAXES,
  profiles: CandleBlendProfile[] = CANDLE_BLEND_PROFILES,
): CandleBlendResult {
  const warnings: string[] = [];
  const notes: string[] = [];
  const unknownWaxIds: string[] = [];

  const stearic = Math.min(nonNegative(input.stearicPercent ?? 0), 30);
  const vybar = Math.min(nonNegative(input.vybarPercent ?? 0), 5);

  const rawTotal = input.components.reduce(
    (sum, c) => sum + nonNegative(c.percent),
    0,
  );
  if (rawTotal <= 0) {
    warnings.push("Nothing in the blend yet — give at least one wax a percent.");
  }
  if (rawTotal > 0 && Math.abs(rawTotal - 100) > 0.5) {
    notes.push(
      `Components add to ${rawTotal.toFixed(1)}% — the blend maths normalizes them to 100%.`,
    );
  }

  interface Resolved {
    waxId: string;
    name: string;
    share: number; // 0..1 of the wax portion
    sg: number;
    profile: CandleBlendProfile;
  }
  const resolved: Resolved[] = [];
  for (const component of input.components) {
    const pct = nonNegative(component.percent);
    if (pct <= 0) continue;
    const wax = getCandleWaxById(component.waxId, waxes);
    const profile = getBlendProfile(component.waxId, profiles);
    if (!wax || !profile) {
      unknownWaxIds.push(component.waxId);
      continue;
    }
    resolved.push({
      waxId: component.waxId,
      name: wax.name,
      share: rawTotal > 0 ? pct / rawTotal : 0,
      sg: wax.specific_gravity,
      profile,
    });
  }
  if (unknownWaxIds.length > 0) {
    warnings.push(
      `Not in the blend library: ${unknownWaxIds.join(", ")} — those shares are excluded from the estimate.`,
    );
  }

  const waxShareTotal = resolved.reduce((sum, r) => sum + r.share, 0);
  const complete = unknownWaxIds.length === 0 && resolved.length > 0;

  const weight = (pick: (r: Resolved) => number): number =>
    waxShareTotal > 0
      ? resolved.reduce((sum, r) => sum + r.share * pick(r), 0) / waxShareTotal
      : 0;

  const meltLowC = weight((r) => r.profile.meltRangeC[0]);
  const meltHighC = weight((r) => r.profile.meltRangeC[1]);
  const meltMidC = weight(
    (r) => (r.profile.meltRangeC[0] + r.profile.meltRangeC[1]) / 2,
  );
  const mids = resolved.map(
    (r) => (r.profile.meltRangeC[0] + r.profile.meltRangeC[1]) / 2,
  );
  const meltSpreadC =
    mids.length > 1 ? Math.max(...mids) - Math.min(...mids) : 0;

  // Pour window: mass-weighted component windows, stretched by half the
  // melt spread so a far-apart blend honestly shows a wider, less
  // certain window instead of a falsely precise one.
  const stretch = meltSpreadC / 2;
  const pourLowC = weight((r) => r.profile.pourRangeC[0]) - stretch / 2;
  const pourHighC = weight((r) => r.profile.pourRangeC[1]) + stretch / 2;

  const blendSg = weight((r) => r.sg);

  // Heuristic additive effects — labelled heuristic wherever printed.
  const stearicHardness = Math.min(0.2, stearic * 0.02);
  const vybarHardness = Math.min(0.1, vybar * 0.03);
  const hardnessScore = Math.min(
    1,
    weight((r) => r.profile.hardness) + stearicHardness + vybarHardness,
  );
  const meltShiftC = stearic * 0.3;
  const frostRiskScore = Math.max(
    0,
    weight((r) => r.profile.frostRisk) - vybar * 0.05,
  );

  const hardnessBand = hardnessBandFor(hardnessScore);
  const frostRiskBand = band(frostRiskScore, 0.4, 0.65);

  const softShare = resolved
    .filter((r) => r.profile.hardness < 0.4)
    .reduce((sum, r) => sum + r.share, 0);
  const containerOk = hardnessScore >= 0.25;
  const pillarOk = hardnessScore >= 0.6;
  if (!containerOk && resolved.length > 0) {
    warnings.push(
      "Very soft blend — even a container will slump in a warm room. Add a harder wax or stearic before pouring.",
    );
  }
  if (pillarOk && softShare > 0.3) {
    notes.push(
      "Firm enough for a pillar on the weighted numbers, but over 30% of the blend is a soft container class — expect a soft skin and easy denting; a harder shell wax carries pillars better.",
    );
  }
  if (meltSpreadC > 12) {
    warnings.push(
      `Components melt ${meltSpreadC.toFixed(0)} °C apart — pour at the hot end of the window, and expect texture (grain, separation) risk where the low-melt share sets first.`,
    );
  }
  if (stearic > 0 || vybar > 0) {
    notes.push(
      "Additive effects (stearic / vybar) are heuristics layered on the weighted sums — direction is reliable, decimals are not.",
    );
  }
  const beeswaxShare = resolved
    .filter((r) => r.waxId === "beeswax-candle-seed")
    .reduce((sum, r) => sum + r.share, 0);
  if (beeswaxShare > 0) {
    notes.push(
      "Beeswax share will bloom over time — a white surface film that wipes or warms off. Natural, not a flaw; don't chase it as frosting.",
    );
  }
  if (resolved.length > 0) {
    notes.push(
      "Profile numbers are seed values for each wax class — swap in your supplier's SKU data before treating the window as final.",
    );
  }

  return {
    complete,
    unknownWaxIds,
    rows: resolved.map((r) => ({
      waxId: r.waxId,
      name: r.name,
      percent: waxShareTotal > 0 ? (r.share / waxShareTotal) * 100 : 0,
      meltMidC: (r.profile.meltRangeC[0] + r.profile.meltRangeC[1]) / 2,
      hardness: r.profile.hardness,
      frostRisk: r.profile.frostRisk,
    })),
    blendSg,
    meltLowC: meltLowC + meltShiftC,
    meltHighC: meltHighC + meltShiftC,
    meltMidC: meltMidC + meltShiftC,
    pourLowC: pourLowC + meltShiftC,
    pourHighC: pourHighC + meltShiftC,
    meltSpreadC,
    hardnessScore,
    hardnessBand,
    frostRiskScore,
    frostRiskBand,
    containerOk,
    pillarOk,
    warnings,
    notes,
  };
}
