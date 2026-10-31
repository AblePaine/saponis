import { dualBasisSplit } from "./candle-engine.ts";

/**
 * Multi-format fragrance card engine (Candle Studio expansion,
 * candlemaking brief engine E) — see docs/CANDLE_STUDIO_SPEC.md.
 *
 * One fragrance oil, four products, and the same percent is a different
 * answer in each: a load that is ordinary in a candle can be over the
 * soap cap on the same oil's IFRA certificate, and a diffuser answers
 * to neither. This card runs the oil across the formats the maker
 * selects — candle, wax melt, reed diffuser, bar soap — and prints,
 * per format, the split at the maker's desired load and the binding
 * cap (the maker's own numbers only: the wax's hold limit and the
 * oil's IFRA cap per format, both converted to % of finished so they
 * can be compared honestly).
 *
 * Posture matches the rest of the studio: Saponis seeds no fragrance
 * limits of its own. A format with no cap entered is a format with no
 * ceiling — the card says so rather than inventing one.
 */

export type FoFormat = "candle" | "melt" | "diffuser" | "soap";

export const FO_FORMAT_LABEL: Record<FoFormat, string> = {
  candle: "Candle",
  melt: "Wax melt",
  diffuser: "Reed diffuser",
  soap: "Bar soap",
};

/** Formats whose load also reads naturally as % of wax. */
const WAX_FORMATS: FoFormat[] = ["candle", "melt"];

export interface FoFormatInput {
  format: FoFormat;
  /** Finished batch size for this format, grams. */
  finishedGrams: number;
  /** Desired load, % of finished weight (the IFRA convention). */
  desiredLoadPercent: number;
  /** From the oil's IFRA certificate for this product type, % of finished. 0/omitted = none entered. */
  ifraCapPercent?: number;
  /** Wax/melt only: the wax supplier's max load, % of wax weight. 0/omitted = none entered. */
  waxHoldPercentOfWax?: number;
}

export interface FoCardInput {
  foName?: string;
  formats: FoFormatInput[];
}

export interface FoFormatResult {
  format: FoFormat;
  label: string;
  finishedGrams: number;
  desiredLoadPercent: number;
  fragranceGrams: number;
  baseGrams: number;
  /** Candle/melt only: the desired load re-expressed as % of wax. */
  loadPercentOfWax: number | null;
  /** The lower of the entered caps, converted to % of finished. Null = no cap entered. */
  bindingCapPercent: number | null;
  bindingCapSource: "ifra" | "wax-hold" | null;
  /** Fragrance grams at the binding cap. Null when no cap entered. */
  maxFragranceGrams: number | null;
  overCap: boolean;
  warnings: string[];
}

export interface FoCardResult {
  foName: string;
  rows: FoFormatResult[];
  /** Sum of fragrance grams across the selected formats (one batch each). */
  totalFragranceGrams: number;
  warnings: string[];
}

function nonNegative(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

/** Convert a cap stated as % of wax into % of finished: p/(100+p). */
function waxCapToFinished(capPercentOfWax: number): number {
  return (capPercentOfWax / (100 + capPercentOfWax)) * 100;
}

export function computeFoCard(input: FoCardInput): FoCardResult {
  const warnings: string[] = [];
  const foName =
    typeof input.foName === "string" && input.foName.trim().length > 0
      ? input.foName.trim()
      : "This oil";

  const rows: FoFormatResult[] = [];
  const seen = new Set<FoFormat>();
  for (const entry of input.formats) {
    if (seen.has(entry.format)) continue;
    seen.add(entry.format);
    const rowWarnings: string[] = [];
    const finished = nonNegative(entry.finishedGrams);
    const desired = nonNegative(entry.desiredLoadPercent);
    const isWaxFormat = WAX_FORMATS.includes(entry.format);

    const split = dualBasisSplit({
      basis: "finished",
      loadPercent: desired,
      finishedMassGrams: finished,
    });
    rowWarnings.push(...split.warnings.filter((w) => !w.includes("Nothing to split")));

    const ifraCap = nonNegative(entry.ifraCapPercent ?? 0);
    const waxHold = isWaxFormat ? nonNegative(entry.waxHoldPercentOfWax ?? 0) : 0;

    let bindingCapPercent: number | null = null;
    let bindingCapSource: "ifra" | "wax-hold" | null = null;
    if (ifraCap > 0) {
      bindingCapPercent = ifraCap;
      bindingCapSource = "ifra";
    }
    if (waxHold > 0) {
      const converted = waxCapToFinished(waxHold);
      if (bindingCapPercent === null || converted < bindingCapPercent) {
        bindingCapPercent = converted;
        bindingCapSource = "wax-hold";
      }
    }

    const maxFragranceGrams =
      bindingCapPercent !== null ? (finished * bindingCapPercent) / 100 : null;
    const overCap = bindingCapPercent !== null && desired > bindingCapPercent;
    if (overCap) {
      rowWarnings.push(
        `Desired load ${desired.toFixed(1)}% is over the binding cap for ${FO_FORMAT_LABEL[entry.format].toLowerCase()} — ${bindingCapPercent?.toFixed(2)}% of finished (from the ${bindingCapSource === "ifra" ? "IFRA cap" : "wax hold limit"} you entered).`,
      );
    }
    if (bindingCapPercent === null && finished > 0) {
      rowWarnings.push(
        "No cap entered for this format — the card applies no ceiling. Enter the oil's IFRA cap (and the wax hold limit, for wax formats) to get one.",
      );
    }

    rows.push({
      format: entry.format,
      label: FO_FORMAT_LABEL[entry.format],
      finishedGrams: finished,
      desiredLoadPercent: desired,
      fragranceGrams: split.fragranceMassGrams,
      baseGrams: split.waxMassGrams,
      loadPercentOfWax: isWaxFormat ? split.foPercentOfWax : null,
      bindingCapPercent,
      bindingCapSource,
      maxFragranceGrams,
      overCap,
      warnings: rowWarnings,
    });
  }

  if (rows.length === 0) {
    warnings.push("No formats selected — the card is empty.");
  }
  // The cross-format lesson, stated once: differing caps across formats
  // mean a single house load cannot be assumed safe everywhere.
  const cappedLoads = rows
    .filter((r) => r.bindingCapPercent !== null)
    .map((r) => r.bindingCapPercent as number);
  if (cappedLoads.length > 1 && Math.max(...cappedLoads) - Math.min(...cappedLoads) > 0.01) {
    warnings.push(
      "The caps you entered differ by format — that is the point of this card. A load blended for the loosest format is not automatically within the tightest one's cap.",
    );
  }

  return {
    foName,
    rows,
    totalFragranceGrams: rows.reduce((sum, r) => sum + r.fragranceGrams, 0),
    warnings,
  };
}
