/**
 * CANDLE WAX dataset for the Candle Studio bench (bench 05).
 *
 * ⚠️ SEED / FIXTURE VALUES. The specific gravities below exist so the
 * vessel-fill math has named constants to work with — they are NOT sourced
 * market data and NOT a substitute for the supplier's published SG for the
 * exact wax SKU in the pot. The soy value is the midpoint of the range
 * quoted in the candlemaking brief (2026-09-29: soy ~0.86–0.90); the rest
 * are estimated seed values in the same spirit. The bench accepts a custom
 * SG override precisely so a maker can use their supplier's number.
 * Replace a seed with a cited supplier value before treating it as
 * authoritative.
 */

export interface CandleWaxRecord {
  id: string;
  name: string;
  slug: string;
  /**
   * Specific gravity of the solid wax relative to water (≈ density in
   * g/ml). Used only for the water-weight → wax-weight conversion.
   * SEED value — see the file header.
   */
  specific_gravity: number;
  /** Where the number came from, and how much to trust it. */
  source: string;
}

export const CANDLE_WAXES: CandleWaxRecord[] = [
  {
    id: "soy-container-seed",
    name: "Soy container wax (seed)",
    slug: "soy-container-seed",
    specific_gravity: 0.88,
    source:
      "SEED — midpoint of the 0.86–0.90 range quoted in the 2026-09-29 candlemaking brief. Replace with your supplier's SG for the exact SKU.",
  },
  {
    id: "coconut-soy-blend-seed",
    name: "Coconut–soy blend (seed)",
    slug: "coconut-soy-blend-seed",
    specific_gravity: 0.86,
    source:
      "SEED — estimated; the brief notes coco blends run lower than straight soy. Replace with your supplier's SG for the exact SKU.",
  },
  {
    id: "paraffin-container-seed",
    name: "Paraffin container wax (seed)",
    slug: "paraffin-container-seed",
    specific_gravity: 0.9,
    source:
      "SEED — estimated typical value for container paraffin. Replace with your supplier's SG for the exact SKU.",
  },
  {
    id: "beeswax-candle-seed",
    name: "Beeswax (seed)",
    slug: "beeswax-candle-seed",
    specific_gravity: 0.96,
    source:
      "SEED — estimated; beeswax runs denser than soy/paraffin. Replace with your supplier's SG for the exact SKU.",
  },
];

export function getCandleWaxById(
  id: string,
  database: CandleWaxRecord[] = CANDLE_WAXES,
): CandleWaxRecord | undefined {
  return database.find((record) => record.id === id);
}
