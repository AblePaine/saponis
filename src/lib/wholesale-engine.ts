/**
 * Wholesale pricing helper — Tool B of the costing suite, and the suite's
 * Saponis Pro piece (free teaser on the /costing bench: your retail and
 * direct margin; the full tier ladder + reverse solves are Pro).
 *
 * Deliberately NOT wired into the agent API (agent-api.ts), the MCP
 * endpoint, the public manifest, or OpenAPI — the same fence the label
 * engine has had since Tranche 2. The gating STRUCTURE lives here and in
 * the bench component; whether an account actually has Pro still comes
 * from the existing entitlements system, untouched.
 *
 * Dual-basis discipline (from candle-engine.ts): tiers are quoted as
 * discount off retail, and every tier also prints its margin on price.
 * The two numbers are not the same, and conflating them is the mistake
 * this tool exists to catch.
 */

function nonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export interface WholesaleTierInput {
  name: string;
  /** Discount off retail, percent. */
  discountPercent: number;
  /** Display-only minimum order quantity. */
  minQty: number;
}

export interface WholesaleInput {
  retailPrice: number;
  unitCost: number;
  /** Margin percent below which a tier is flagged. */
  floorMarginPercent: number;
  tiers: WholesaleTierInput[];
}

export interface WholesaleTierResult {
  name: string;
  discountPercent: number;
  minQty: number;
  price: number;
  /** Margin ON PRICE: (price − cost) / price × 100. */
  marginPercent: number;
  profitPerUnit: number;
  belowFloor: boolean;
}

export interface WholesaleResult {
  tiers: WholesaleTierResult[];
  /** Cheapest price that still holds the floor margin. */
  floorPrice: number;
  /**
   * Retail at which the FIRST tier (wholesale) holds the floor margin at
   * its discount — the reverse solve makers ask for.
   */
  requiredRetailForFirstTier: number;
  /** Margin on price when selling direct at retail. */
  retailMarginPercent: number;
}

export const DEFAULT_WHOLESALE_INPUT: WholesaleInput = {
  retailPrice: 7.4,
  unitCost: 2.59,
  floorMarginPercent: 20,
  tiers: [
    { name: "Wholesale", discountPercent: 50, minQty: 24 },
    { name: "Distributor", discountPercent: 60, minQty: 96 },
  ],
};

export function computeWholesale(input: WholesaleInput): WholesaleResult {
  const retail = nonNegative(input.retailPrice);
  const cost = nonNegative(input.unitCost);
  const floor = nonNegative(input.floorMarginPercent);
  const tiers = input.tiers.map((tier) => {
    const price = retail * (1 - nonNegative(tier.discountPercent) / 100);
    const marginPercent = price > 0 ? ((price - cost) / price) * 100 : 0;
    return {
      name: tier.name,
      discountPercent: nonNegative(tier.discountPercent),
      minQty: tier.minQty,
      price,
      marginPercent,
      profitPerUnit: price - cost,
      belowFloor: marginPercent < floor,
    };
  });
  const floorPrice = floor < 100 ? cost / (1 - floor / 100) : 0;
  const first = tiers[0];
  const requiredRetailForFirstTier =
    first && first.discountPercent < 100
      ? floorPrice / (1 - first.discountPercent / 100)
      : 0;
  return {
    tiers,
    floorPrice,
    requiredRetailForFirstTier,
    retailMarginPercent: retail > 0 ? ((retail - cost) / retail) * 100 : 0,
  };
}
