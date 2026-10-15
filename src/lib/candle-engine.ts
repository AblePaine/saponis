import { getCandleWaxById, CANDLE_WAXES } from "../data/candle-waxes.ts";
import type { CandleWaxRecord } from "../data/candle-waxes.ts";

/**
 * Candle Studio engine (bench 05) — see docs/CANDLE_STUDIO_SPEC.md.
 *
 * Two things, done explicitly:
 *  1. Dual-basis fragrance load. "8% FO" means two different candles
 *     depending on whether the percent is of the wax or of the finished
 *     fill. The caller must name the basis; the result always prints both.
 *  2. Vessel fill from weighed water × wax specific gravity, with
 *     headspace and a waste/kettle-heel allowance on the melt only.
 *
 * Calculation tool only — no wick, pour-temperature, or burn claims.
 */

export type FoBasis = "wax" | "finished";

export const FO_BASIS_LABEL: Record<FoBasis, string> = {
  wax: "% of wax weight",
  finished: "% of finished weight",
};

function nonNegative(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

function percentOf(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return (part / whole) * 100;
}

export interface DualBasisInput {
  basis: FoBasis;
  /** The load percent, expressed in the chosen basis. */
  loadPercent: number;
  /** Anchor mass — provide exactly one (the other is derived). */
  waxMassGrams?: number;
  finishedMassGrams?: number;
}

export interface DualBasisResult {
  basis: FoBasis;
  loadPercent: number;
  waxMassGrams: number;
  fragranceMassGrams: number;
  finishedMassGrams: number;
  /** The same load, expressed both ways — the point of this bench. */
  foPercentOfWax: number;
  foPercentOfFinished: number;
  valid: boolean;
  warnings: string[];
}

/**
 * Split a candle into wax + fragrance under an explicitly named basis.
 * Anchors on whichever mass is given; wax anchor wins if both are.
 */
export function dualBasisSplit(input: DualBasisInput): DualBasisResult {
  const loadPercent = nonNegative(input.loadPercent);
  const warnings: string[] = [];
  let wax = 0;
  let fragrance = 0;
  let finished = 0;
  let valid = true;

  if (input.basis === "wax") {
    const p = loadPercent / 100;
    if (input.waxMassGrams !== undefined && input.waxMassGrams > 0) {
      wax = nonNegative(input.waxMassGrams);
      fragrance = wax * p;
      finished = wax + fragrance;
    } else if (input.finishedMassGrams !== undefined && input.finishedMassGrams > 0) {
      finished = nonNegative(input.finishedMassGrams);
      wax = finished / (1 + p);
      fragrance = finished - wax;
    }
  } else {
    // basis === "finished": the load is a share of the whole, so a load
    // at or above 100% leaves no room for wax — refuse, don't fudge.
    if (loadPercent >= 100) {
      valid = false;
      warnings.push(
        "A fragrance load of 100% or more of finished weight leaves no wax at all — check the percent.",
      );
    } else {
      const p = loadPercent / 100;
      if (input.finishedMassGrams !== undefined && input.finishedMassGrams > 0) {
        finished = nonNegative(input.finishedMassGrams);
        fragrance = finished * p;
        wax = finished - fragrance;
      } else if (input.waxMassGrams !== undefined && input.waxMassGrams > 0) {
        wax = nonNegative(input.waxMassGrams);
        finished = wax / (1 - p);
        fragrance = finished - wax;
      }
    }
  }

  if (valid && finished <= 0) {
    warnings.push("Nothing to split yet — give a wax or a finished mass.");
  }

  return {
    basis: input.basis,
    loadPercent,
    waxMassGrams: wax,
    fragranceMassGrams: fragrance,
    finishedMassGrams: finished,
    foPercentOfWax: percentOf(fragrance, wax),
    foPercentOfFinished: percentOf(fragrance, finished),
    valid,
    warnings,
  };
}

export interface CandleInput {
  /** Weighed water fill of one vessel, grams (to the intended fill line). */
  waterMassGramsPerVessel: number;
  vesselCount: number;
  waxId: string;
  /** Overrides the library SG when > 0 (supplier's number for the SKU). */
  specificGravityOverride?: number;
  /** Unfilled space left at the top, percent of the water-fill volume. */
  headspacePercent: number;
  /** Extra melt for kettle heel / spills, percent. Melt only, not fill. */
  wastePercent: number;
  foBasis: FoBasis;
  foLoadPercent: number;
  /** Optional, user-supplied caps — the engine seeds no limits itself. */
  maxFoPercentOfWax?: number;
  ifraCapPercentOfFinished?: number;
}

export interface CandleResult {
  waxName: string;
  specificGravity: number;
  usingCustomSg: boolean;
  unknownWax: boolean;
  vesselCount: number;
  /** Finished (wax + FO) mass that lands in one vessel / the whole batch. */
  finishedPerVesselGrams: number;
  finishedTotalGrams: number;
  waxPerVesselGrams: number;
  fragrancePerVesselGrams: number;
  waxTotalGrams: number;
  fragranceTotalGrams: number;
  /** What to actually melt/weigh, including the waste allowance. */
  waxToMeltGrams: number;
  fragranceToWeighGrams: number;
  foBasis: FoBasis;
  foLoadPercent: number;
  foPercentOfWax: number;
  foPercentOfFinished: number;
  overMaxFo: boolean;
  overIfraCap: boolean;
  warnings: string[];
}

/** Whole vessels a given wax mass covers at the per-vessel wax need. */
export function vesselsFromWaxMass(waxAvailableGrams: number, waxPerVesselGrams: number): number {
  if (waxPerVesselGrams <= 0) return 0;
  return Math.floor(nonNegative(waxAvailableGrams) / waxPerVesselGrams);
}

export function computeCandle(
  input: CandleInput,
  database: CandleWaxRecord[] = CANDLE_WAXES,
): CandleResult {
  const warnings: string[] = [];
  const override = input.specificGravityOverride ?? 0;
  const usingCustomSg = Number.isFinite(override) && override > 0;
  const record = getCandleWaxById(input.waxId, database);
  const unknownWax = !usingCustomSg && !record;
  const specificGravity = usingCustomSg ? override : (record?.specific_gravity ?? 0);
  const waxName = usingCustomSg ? "Custom SG" : (record?.name ?? "Unknown wax");

  if (unknownWax) {
    warnings.push(
      "That wax isn't in the SG library — pick one from the list or enter a custom SG.",
    );
  }
  if (!usingCustomSg && record) {
    warnings.push(
      "Library SG is a seed value — swap in your supplier's SG for this wax SKU (custom SG field) before treating the fill weights as final.",
    );
  }

  const water = nonNegative(input.waterMassGramsPerVessel);
  const vesselCount = Math.floor(nonNegative(input.vesselCount));
  const headspace = Math.min(nonNegative(input.headspacePercent), 100);
  const waste = nonNegative(input.wastePercent);
  if (input.headspacePercent >= 100) {
    warnings.push("Headspace at 100% or more leaves nothing in the vessel — check the percent.");
  }
  if (vesselCount <= 0) {
    warnings.push("Vessel count is zero — the batch maths to nothing.");
  }

  const finishedPerVessel = water * specificGravity * (1 - headspace / 100);
  const finishedTotal = finishedPerVessel * vesselCount;

  const split = dualBasisSplit({
    basis: input.foBasis,
    loadPercent: input.foLoadPercent,
    finishedMassGrams: finishedTotal,
  });
  warnings.push(...split.warnings.filter((w) => !w.includes("Nothing to split")));

  const waxToMelt = split.waxMassGrams * (1 + waste / 100);
  const fragranceToWeigh = split.fragranceMassGrams * (1 + waste / 100);

  const maxFo = input.maxFoPercentOfWax ?? 0;
  const overMaxFo = Number.isFinite(maxFo) && maxFo > 0 && split.foPercentOfWax > maxFo;
  if (overMaxFo) {
    warnings.push(
      `Over the max load you entered: this recipe runs ${split.foPercentOfWax.toFixed(1)}% of wax weight against your ${maxFo.toFixed(1)}% cap.`,
    );
  }
  const ifraCap = input.ifraCapPercentOfFinished ?? 0;
  const overIfraCap =
    Number.isFinite(ifraCap) && ifraCap > 0 && split.foPercentOfFinished > ifraCap;
  if (overIfraCap) {
    warnings.push(
      `Over the IFRA cap you entered for this oil: ${split.foPercentOfFinished.toFixed(1)}% of finished weight against a ${ifraCap.toFixed(1)}% cap. (Cap is per-oil from its IFRA certificate — the bench seeds none.)`,
    );
  }

  const perVessel = (total: number) => (vesselCount > 0 ? total / vesselCount : 0);

  return {
    waxName,
    specificGravity,
    usingCustomSg,
    unknownWax,
    vesselCount,
    finishedPerVesselGrams: finishedPerVessel,
    finishedTotalGrams: finishedTotal,
    waxPerVesselGrams: perVessel(split.waxMassGrams),
    fragrancePerVesselGrams: perVessel(split.fragranceMassGrams),
    waxTotalGrams: split.waxMassGrams,
    fragranceTotalGrams: split.fragranceMassGrams,
    waxToMeltGrams: waxToMelt,
    fragranceToWeighGrams: fragranceToWeigh,
    foBasis: input.foBasis,
    foLoadPercent: split.loadPercent,
    foPercentOfWax: split.foPercentOfWax,
    foPercentOfFinished: split.foPercentOfFinished,
    overMaxFo,
    overIfraCap,
    warnings,
  };
}
