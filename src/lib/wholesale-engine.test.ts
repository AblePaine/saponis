import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_WHOLESALE_INPUT, computeWholesale } from "./wholesale-engine.ts";

function approx(actual: number, expected: number, tol = 0.05) {
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `expected ${actual} ≈ ${expected} (±${tol})`,
  );
}

describe("wholesale pricing (SPEC hand-checked example)", () => {
  // Retail $7.40, cost $2.59 — the cost tool's own worked example.
  const result = computeWholesale(DEFAULT_WHOLESALE_INPUT);

  it("prints discount off retail AND the margin it leaves, side by side", () => {
    const [wholesale, distributor] = result.tiers;
    approx(wholesale!.price, 3.7, 0.005);
    approx(wholesale!.marginPercent, 30.0, 0.1);
    approx(distributor!.price, 2.96, 0.005);
    approx(distributor!.marginPercent, 12.5, 0.1);
  });

  it("flags the distributor tier below the 20% floor, not the wholesale tier", () => {
    const [wholesale, distributor] = result.tiers;
    assert.equal(wholesale!.belowFloor, false);
    assert.equal(distributor!.belowFloor, true);
    approx(distributor!.profitPerUnit, 0.37, 0.005);
  });

  it("floor price reverse solve: cost / (1 − floor margin)", () => {
    approx(result.floorPrice, 3.24, 0.01);
  });

  it("required retail so the wholesale tier holds the floor at its discount", () => {
    approx(result.requiredRetailForFirstTier, 6.48, 0.01);
  });

  it("direct retail margin is margin on price, not markup on cost", () => {
    approx(result.retailMarginPercent, ((7.4 - 2.59) / 7.4) * 100, 0.1);
  });
});
