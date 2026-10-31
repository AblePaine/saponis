/**
 * WICK STARTING-POINT GUIDE for the Candle Studio expansion (wick engine,
 * candlemaking brief engine C).
 *
 * ⚠️ SEED / FIXTURE VALUES, same posture as src/data/candle-waxes.ts.
 * The tables below are seeded from the *structure* of supplier-published
 * wick guides for the named wax classes (CandleScience and Lone Star
 * publish per-wax, per-diameter charts in exactly this shape). They are
 * starting points for a first test burn — the only thing this data claims
 * to be. Wick performance depends on the exact wax SKU, the fragrance and
 * its load, dye, and the vessel's shape and material; no table settles
 * it. Replace the seed rows with your supplier's chart for your wax
 * before treating a size as more than a first guess.
 *
 * How the engine uses this: find the diameter band, read the center size
 * for the series, shift the ladder index for wax family and fragrance
 * load, and hand back a three-wick test matrix (one down / start / one
 * up) plus the burn-test protocol card. The protocol, not the lookup,
 * is the deliverable.
 */

export interface WickSeries {
  id: string;
  name: string;
  /** Size ladder, smallest → largest. Labels are the maker's sizes. */
  sizes: string[];
  /** Human note on the family's character. */
  note: string;
}

export const WICK_SERIES: WickSeries[] = [
  {
    id: "cd",
    name: "CD (Stabilo)",
    sizes: [
      "3", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22", "24",
      "26", "28", "30",
    ],
    note: "Flat cotton with paper filaments — the soy workhorse series; tolerates heavy fragrance loads well.",
  },
  {
    id: "eco",
    name: "ECO",
    sizes: ["1", "2", "4", "6", "8", "10", "12", "14", "16"],
    note: "Flat cotton with paper threads, self-trimming; a common first pick for soy and coconut blends.",
  },
  {
    id: "lx",
    name: "LX",
    sizes: [
      "8", "10", "12", "14", "16", "18", "20", "22", "24", "26", "28", "30",
    ],
    note: "Flat braided cotton; a steady, cooler burn often tried when CD mushrooms.",
  },
  {
    id: "htp",
    name: "HTP",
    sizes: ["31", "41", "52", "62", "73", "83", "93", "104", "105", "126"],
    note: "Rolled paper-core cotton; self-trimming curl, popular in paraffin and blends.",
  },
  {
    id: "wood",
    name: "Wooden wick (single-ply)",
    sizes: ["0.375″", "0.5″", "0.625″", "0.75″", "1″"],
    note: "Sized by width. Crackle is the point; sizing runs wider than fiber wicks for the same jar.",
  },
];

/** Diameter bands the seed table is keyed to, inches. */
export const WICK_DIAMETER_BANDS: number[] = [1.5, 2, 2.5, 3, 3.5, 4, 4.5];

/**
 * Center ladder index per series per diameter band, for the soy
 * container class (the reference family). Index into WickSeries.sizes.
 * SEED — see the file header.
 */
export const WICK_SEED_INDEX: Record<string, number[]> = {
  cd: [4, 5, 6, 7, 8, 9, 10],
  eco: [1, 2, 3, 4, 5, 6, 7],
  lx: [2, 3, 4, 5, 6, 7, 8],
  htp: [1, 2, 3, 4, 5, 6, 7],
  wood: [0, 0, 1, 1, 2, 2, 3],
};

/**
 * Ladder-index shift by candle-wax library id, relative to soy.
 * Beeswax is denser and higher-melting and generally wants the next
 * size up; container paraffin generally wants one down from soy.
 * Heuristic — printed on the test card.
 */
export const WICK_FAMILY_SHIFT: Record<string, number> = {
  "soy-container-seed": 0,
  "coconut-soy-blend-seed": 0,
  "paraffin-container-seed": -1,
  "beeswax-candle-seed": 1,
};

export function getWickSeries(id: string): WickSeries | undefined {
  return WICK_SERIES.find((series) => series.id === id);
}
