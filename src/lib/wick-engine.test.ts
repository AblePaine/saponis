import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeWickStart } from "./wick-engine.ts";

describe("computeWickStart", () => {
  it("reads the soy starting point for a 3-inch vessel", () => {
    const result = computeWickStart({
      diameterInches: 3,
      waxId: "soy-container-seed",
      foLoadPercent: 8,
    });
    assert.equal(result.bandInches, 3);
    assert.equal(result.familyShift, 0);
    assert.equal(result.loadShift, 0);
    const cd = result.series.find((s) => s.seriesId === "cd");
    assert.ok(cd);
    assert.deepEqual(cd.sizes, ["14", "16", "18"]);
    const eco = result.series.find((s) => s.seriesId === "eco");
    assert.deepEqual(eco?.sizes, ["6", "8", "10"]);
    const wood = result.series.find((s) => s.seriesId === "wood");
    assert.deepEqual(wood?.sizes, ["0.375″", "0.5″", "0.625″"]);
    assert.equal(result.protocol.firstBurnHours, 3);
  });

  it("shifts beeswax one size up and paraffin one size down", () => {
    const bees = computeWickStart({
      diameterInches: 3,
      waxId: "beeswax-candle-seed",
      foLoadPercent: 6,
    });
    assert.equal(bees.familyShift, 1);
    assert.deepEqual(
      bees.series.find((s) => s.seriesId === "cd")?.sizes,
      ["16", "18", "20"],
    );
    const paraffin = computeWickStart({
      diameterInches: 3,
      waxId: "paraffin-container-seed",
      foLoadPercent: 6,
    });
    assert.equal(paraffin.familyShift, -1);
    assert.deepEqual(
      paraffin.series.find((s) => s.seriesId === "cd")?.sizes,
      ["12", "14", "16"],
    );
  });

  it("shifts every series up at a 12%+ fragrance load", () => {
    const result = computeWickStart({
      diameterInches: 3,
      waxId: "soy-container-seed",
      foLoadPercent: 12,
    });
    assert.equal(result.loadShift, 1);
    assert.deepEqual(
      result.series.find((s) => s.seriesId === "cd")?.sizes,
      ["16", "18", "20"],
    );
    assert.ok(result.advisories.some((a) => a.includes("12% or more")));
  });

  it("clamps the ladder at its ends", () => {
    const small = computeWickStart({
      diameterInches: 1.5,
      waxId: "paraffin-container-seed",
      foLoadPercent: 0,
    });
    const eco = small.series.find((s) => s.seriesId === "eco");
    // ECO seed index 1, paraffin shift −1 → start index 0, nothing below.
    assert.deepEqual(eco?.sizes, [null, "1", "2"]);
  });

  it("advises a double-wick test on wide vessels", () => {
    const result = computeWickStart({
      diameterInches: 5,
      waxId: "soy-container-seed",
      foLoadPercent: 8,
    });
    assert.equal(result.bandInches, 4.5);
    assert.ok(result.advisories.some((a) => a.includes("double-wick")));
    assert.equal(result.protocol.firstBurnHours, 5);
  });

  it("restricts the card to one series when asked, and flags unknown wax", () => {
    const result = computeWickStart({
      diameterInches: 2.5,
      waxId: "not-a-wax",
      foLoadPercent: 8,
      seriesId: "lx",
    });
    assert.equal(result.series.length, 1);
    assert.equal(result.series[0]?.seriesId, "lx");
    assert.equal(result.unknownWax, true);
    assert.ok(result.advisories.some((a) => a.includes("isn't in the library")));
  });

  it("the protocol is computed from the diameter, not the band", () => {
    const result = computeWickStart({
      diameterInches: 2.2,
      waxId: "soy-container-seed",
      foLoadPercent: 8,
    });
    assert.equal(result.protocol.firstBurnHours, 2);
    assert.equal(result.protocol.targetPoolPercentOfDiameter, 100);
    assert.deepEqual(result.protocol.targetPoolDepthInches, [0.25, 0.5]);
  });
});
