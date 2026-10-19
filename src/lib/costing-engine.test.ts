import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decodeCostingState,
  encodeCostingState,
  type CostingUrlState,
} from "./bench-url.ts";
import {
  DEFAULT_COST_INPUT,
  DEFAULT_MOLD_FILL,
  SAMPLE_COST_ROWS,
  computeCost,
  computeMoldFill,
  lineCost,
  type MoldFillInput,
} from "./costing-engine.ts";

/** SPEC hand-checked values (dojo staging SPEC, 2026-10-19). */
function approx(actual: number, expected: number, tol = 0.05) {
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `expected ${actual} ≈ ${expected} (±${tol})`,
  );
}

const LOAF: MoldFillInput = {
  ...DEFAULT_MOLD_FILL,
  shape: "loaf",
  unit: "in",
  length: 10,
  width: 3.5,
  height: 3.5,
  cavities: 1,
  bars: 0,
};

describe("mold-fill sizing (SPEC hand-checked examples)", () => {
  it("loaf 10×3.5×3.5 in at brim: volume, batter, oil charge", () => {
    const r = computeMoldFill({ ...LOAF, fill: "brim" });
    approx(r.totalVolumeCm3, 2007.42, 0.1);
    approx(r.batterGrams, 2107.8, 0.5);
    approx(r.oilChargeGrams, 1454.4, 0.5);
  });

  it("loaf at 10% headspace: batter and oil charge shrink by the headspace", () => {
    const r = computeMoldFill({ ...LOAF, fill: "headspace" });
    approx(r.batterGrams, 1897.0, 0.5);
    approx(r.oilChargeGrams, 1308.9, 0.5);
    approx(r.usableVolumeCm3, r.totalVolumeCm3 * 0.9, 0.5);
  });

  it("cavity mold: 6 cavities of 3×2×1 in at brim", () => {
    const r = computeMoldFill({
      ...LOAF,
      length: 3,
      width: 2,
      height: 1,
      fill: "brim",
      cavities: 6,
      cureLossPercent: 10,
    });
    approx(r.perCavityVolumeCm3, 98.32, 0.05);
    approx(r.totalVolumeCm3, 589.93, 0.1);
    approx(r.batterGrams, 619.4, 0.5);
    approx(r.oilChargeGrams, 427.4, 0.5);
    approx(r.perBarCuredGrams, 92.9, 0.2);
  });

  it("reuses the mold engine's math — never a forked constant", () => {
    const r = computeMoldFill({ ...LOAF, fill: "brim" });
    // batter = volume × 1.05, oil = batter × 0.69, the mold-engine constants.
    approx(r.batterGrams, r.totalVolumeCm3 * 1.05, 1e-6);
    approx(r.oilChargeGrams, r.batterGrams * 0.69, 1e-6);
  });

  it("water-fill treats the weighed water as the whole mold's volume", () => {
    const r = computeMoldFill({
      ...LOAF,
      shape: "water_fill",
      waterGrams: 1200,
      cavities: 4,
      fill: "brim",
    });
    approx(r.totalVolumeCm3, 1200, 1e-9);
    approx(r.batterGrams, 1260, 1e-6);
  });
});

describe("cost per bar (SPEC hand-checked example)", () => {
  const result = computeCost(DEFAULT_COST_INPUT);

  it("prices every sample line by weight or flat", () => {
    const expected = [4.2, 1.75, 1.6, 1.32, 0.09, 2.38, 0.6];
    result.lines.forEach((line, i) => approx(line.cost, expected[i]!, 0.01));
    approx(result.ingredientSubtotal, 11.95, 0.01);
  });

  it("lineCost: flat rows ignore weight fields; weight rows need a purchase amount", () => {
    assert.equal(
      lineCost({ name: "x", amountGrams: 10, pricePaid: 5, purchasedGrams: 0, mode: "weight", flatCost: 0 }),
      0,
    );
    assert.equal(
      lineCost({ name: "x", amountGrams: 0, pricePaid: 0, purchasedGrams: 0, mode: "flat", flatCost: 0.6 }),
      0.6,
    );
  });

  it("batch total stacks ingredients + packaging + labor + overhead", () => {
    approx(result.packagingTotal, 5.4, 1e-9);
    approx(result.laborTotal, 11.25, 1e-9);
    approx(result.batchTotal, 31.1, 0.01);
  });

  it("divides by GOOD bars only and exposes the ingredients-only gap", () => {
    assert.equal(result.goodBars, 12);
    approx(result.unitCost, 2.59, 0.01);
    approx(result.ingredientsPerBar, 1.0, 0.01);
  });

  it("suggested retail at the 65% target margin", () => {
    approx(result.suggestedRetail, 7.4, 0.01);
    approx(result.marginDollarsAtRetail, 7.4 - 2.59, 0.02);
  });

  it("shrink bars raise the true unit cost (cost divides by good bars)", () => {
    const shrunk = computeCost({ ...DEFAULT_COST_INPUT, shrinkBars: 2 });
    assert.equal(shrunk.goodBars, 10);
    assert.ok(shrunk.unitCost > result.unitCost);
    approx(shrunk.unitCost, 3.02, 0.01);
  });

  it("cure carrying cost is off by default and additive when enabled", () => {
    assert.equal(result.carryingCost, 0);
    const carried = computeCost({
      ...DEFAULT_COST_INPUT,
      carryingRatePercent: 10,
      cureWeeks: 4,
    });
    approx(carried.carryingCost, 11.95 * 0.1 * (4 / 52), 0.005);
    assert.ok(carried.batchTotal > result.batchTotal);
  });

  it("channel fees net against suggested retail", () => {
    const feed = computeCost({
      ...DEFAULT_COST_INPUT,
      channelFeePercent: 10,
      channelFeeFixed: 0.3,
    });
    approx(feed.channelFeeAtRetail, feed.suggestedRetail * 0.1 + 0.3, 1e-9);
    approx(feed.netRetailAfterFees, feed.suggestedRetail - feed.channelFeeAtRetail, 1e-9);
  });

  it("sample rows are the SPEC seed (stamped SAMPLE in the UI/docs)", () => {
    assert.equal(SAMPLE_COST_ROWS.length, 7);
    assert.equal(SAMPLE_COST_ROWS[0]?.name, "Olive oil");
  });
});

describe("costing share links", () => {
  it("round-trips the full suite state through ?r=", () => {
    const state: CostingUrlState = {
      mold: { ...DEFAULT_MOLD_FILL, cavities: 6, bars: 12 },
      cost: { ...DEFAULT_COST_INPUT, shrinkBars: 1, carryingRatePercent: 5 },
      wholesale: {
        floorMarginPercent: 25,
        tiers: [
          { name: "Wholesale", discountPercent: 50, minQty: 24 },
          { name: "Distributor", discountPercent: 60, minQty: 96 },
        ],
      },
    };
    const decoded = decodeCostingState(encodeCostingState(state));
    assert.deepEqual(decoded, state);
  });

  it("rejects truncated encodings", () => {
    assert.equal(decodeCostingState("loaf|in|10"), null);
    assert.equal(decodeCostingState(null), null);
  });
});
