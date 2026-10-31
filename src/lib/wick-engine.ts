import { getCandleWaxById, CANDLE_WAXES } from "../data/candle-waxes.ts";
import type { CandleWaxRecord } from "../data/candle-waxes.ts";
import {
  WICK_DIAMETER_BANDS,
  WICK_FAMILY_SHIFT,
  WICK_SEED_INDEX,
  WICK_SERIES,
  getWickSeries,
} from "../data/wick-guide.ts";
import type { WickSeries } from "../data/wick-guide.ts";

/**
 * Wick starting-point engine (Candle Studio expansion, candlemaking
 * brief engine C) — see docs/CANDLE_STUDIO_SPEC.md.
 *
 * This engine refuses to be a wick oracle. What it returns is a *test
 * card*: for each wick series, a three-wick matrix (one size down, the
 * seeded starting size, one size up) read off the seed guide for the
 * vessel diameter, shifted for wax family and fragrance load — plus
 * the burn-test protocol that actually settles the question, computed
 * from the diameter: burn an hour per inch of diameter, judge the melt
 * pool against the vessel, adjust one size at a time.
 */

export interface WickInput {
  /** Vessel inside diameter, inches. */
  diameterInches: number;
  /** Candle-wax library id — picks the family shift. */
  waxId: string;
  /** Fragrance load, % (of wax or finished — only the size matters here). */
  foLoadPercent: number;
  /** Restrict to one series id; omit for the full card. */
  seriesId?: string;
}

export interface WickSeriesResult {
  seriesId: string;
  name: string;
  note: string;
  /** [one down, starting point, one up] — null at the ladder's ends. */
  sizes: [string | null, string, string | null];
  startIndex: number;
}

export interface WickTestProtocol {
  /** First test burn length: one hour per inch of diameter. */
  firstBurnHours: number;
  /** Subsequent full burns before judging. */
  fullBurnCycles: number;
  /** Melt pool should reach this share of the diameter by the end of a full cycle. */
  targetPoolPercentOfDiameter: number;
  /** Healthy pool depth band, inches. */
  targetPoolDepthInches: [number, number];
  evaluate: string[];
  adjust: string[];
}

export interface WickResult {
  diameterInches: number;
  bandInches: number;
  waxName: string;
  unknownWax: boolean;
  familyShift: number;
  loadShift: number;
  series: WickSeriesResult[];
  protocol: WickTestProtocol;
  advisories: string[];
}

function clampIndex(index: number, series: WickSeries): number {
  return Math.min(series.sizes.length - 1, Math.max(0, index));
}

export function computeWickStart(
  input: WickInput,
  waxes: CandleWaxRecord[] = CANDLE_WAXES,
): WickResult {
  const advisories: string[] = [];
  const diameter = Number.isFinite(input.diameterInches)
    ? Math.max(0, input.diameterInches)
    : 0;

  // Nearest seed band; out-of-table diameters clamp to the end bands.
  let bandIdx = 0;
  let best = Infinity;
  WICK_DIAMETER_BANDS.forEach((bandValue, idx) => {
    const diff = Math.abs(bandValue - diameter);
    if (diff < best) {
      best = diff;
      bandIdx = idx;
    }
  });
  const bandInches = WICK_DIAMETER_BANDS[bandIdx] ?? 3;
  if (diameter > 0 && Math.abs(bandInches - diameter) > 0.26) {
    advisories.push(
      `Diameter ${diameter.toFixed(2)}″ sits between seed bands — read from the ${bandInches}″ band and lean on the test protocol, not the table.`,
    );
  }
  if (diameter >= 4.25) {
    advisories.push(
      "Wide vessel: a single centered wick is working hard past ~4¼″. Price out a double-wick test alongside this card — two wicks two sizes down often burn cleaner than one wick sized up.",
    );
  }

  const record = getCandleWaxById(input.waxId, waxes);
  const unknownWax = !record;
  const familyShift = WICK_FAMILY_SHIFT[input.waxId] ?? 0;
  if (unknownWax) {
    advisories.push(
      "That wax isn't in the library — the card uses the soy reference family with no shift. Pick the library wax closest to yours.",
    );
  }
  const loadShift = input.foLoadPercent >= 12 ? 1 : 0;
  if (loadShift > 0) {
    advisories.push(
      "Fragrance load at 12% or more shifts every series one size up — heavy loads feed a bigger flame and clog a marginal wick.",
    );
  }
  advisories.push(
    "Sizes come from the seed guide for each wax class — a starting point for testing, never a guarantee. Your supplier's chart for the exact wax SKU outranks this table.",
  );

  const wanted = input.seriesId
    ? WICK_SERIES.filter((s) => s.id === input.seriesId)
    : WICK_SERIES;
  const series: WickSeriesResult[] = [];
  for (const s of wanted) {
    const seedRow = WICK_SEED_INDEX[s.id];
    if (!seedRow) continue;
    const startIndex = clampIndex(
      (seedRow[bandIdx] ?? 0) + familyShift + loadShift,
      s,
    );
    series.push({
      seriesId: s.id,
      name: s.name,
      note: s.note,
      sizes: [
        startIndex > 0 ? (s.sizes[startIndex - 1] ?? null) : null,
        s.sizes[startIndex] ?? "",
        startIndex < s.sizes.length - 1 ? (s.sizes[startIndex + 1] ?? null) : null,
      ],
      startIndex,
    });
  }
  if (input.seriesId && series.length === 0) {
    advisories.push(`Unknown wick series '${input.seriesId}' — the card is empty.`);
  }

  // Protocol: an hour per inch of diameter is the trade's standard
  // first-cycle rule; the pool targets are the standard read of it.
  const firstBurnHours = Math.max(0.5, Math.round(diameter * 2) / 2);
  const protocol: WickTestProtocol = {
    firstBurnHours,
    fullBurnCycles: 3,
    targetPoolPercentOfDiameter: 100,
    targetPoolDepthInches: [0.25, 0.5],
    evaluate: [
      `After a full ${firstBurnHours}-hour burn, the melt pool should reach the vessel walls (100% of the ${diameter.toFixed(2)}″ diameter) — or be clearly on its way there by the third cycle.`,
      "Pool depth in the healthy band is ¼″–½″. Deeper is not better: a deep pool is a hot jar and a drowning wick.",
      "Flame should stand calm, roughly ½″–1″ tall. Note mushrooming, soot on the glass, and any smoking on the card — they are data, not failures.",
      "Let the candle cool fully between cycles and judge across three full burns, not the first hour — the lower half of the jar burns hotter than the top.",
    ],
    adjust: [
      "Pool stalls short of the walls or tunnels → test one size up in the same series.",
      "Pool deeper than ½″, jar too hot to hold comfortably, heavy soot or mushrooming → test one size down.",
      "Change one variable at a time — wick size OR load OR wax — or the card teaches you nothing.",
    ],
  };

  return {
    diameterInches: diameter,
    bandInches,
    waxName: record?.name ?? "Unknown wax (soy reference)",
    unknownWax,
    familyShift,
    loadShift,
    series,
    protocol,
    advisories,
  };
}

export { getWickSeries };
