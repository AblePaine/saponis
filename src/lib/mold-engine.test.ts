import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BATTER_DENSITY_G_CM3,
  HEADSPACE_FRACTION,
  OIL_FRACTION_OF_BATTER,
  computeMold,
  moldVolumeCm3,
} from "./mold-engine.ts";

describe("mold volume", () => {
  it("computes a rectangular loaf in inches as cm³", () => {
    const volume = moldVolumeCm3({
      shape: "loaf",
      unit: "in",
      length: 10,
      width: 3.5,
      height: 3.5,
      diameter: 0,
      waterGrams: 0,
    });
    const expected = 10 * 2.54 * 3.5 * 2.54 * 3.5 * 2.54;
    assert.ok(Math.abs(volume - expected) < 1e-9);
  });

  it("computes a cylinder and treats water-fill grams as cm³", () => {
    const cyl = moldVolumeCm3({
      shape: "cylinder",
      unit: "cm",
      length: 0,
      width: 0,
      height: 8,
      diameter: 10,
      waterGrams: 0,
    });
    assert.ok(Math.abs(cyl - Math.PI * 25 * 8) < 1e-9);

    const water = moldVolumeCm3({
      shape: "water_fill",
      unit: "cm",
      length: 0,
      width: 0,
      height: 0,
      diameter: 0,
      waterGrams: 1200,
    });
    assert.equal(water, 1200);
  });
});

describe("oil charge from volume", () => {
  it("applies 1.05 g/cm³ batter density and 0.69 oil fraction", () => {
    const result = computeMold(
      {
        shape: "loaf",
        unit: "cm",
        length: 10,
        width: 10,
        height: 10,
        diameter: 0,
        waterGrams: 0,
      },
      "brim",
    );
    assert.equal(result.volumeCm3, 1000);
    assert.equal(result.batterGrams, 1000 * BATTER_DENSITY_G_CM3);
    assert.equal(
      result.oilWeightGrams,
      1000 * BATTER_DENSITY_G_CM3 * OIL_FRACTION_OF_BATTER,
    );
  });

  it("applies a 10% headspace safety margin", () => {
    const brim = computeMold(
      {
        shape: "loaf",
        unit: "cm",
        length: 10,
        width: 10,
        height: 10,
        diameter: 0,
        waterGrams: 0,
      },
      "brim",
    );
    const head = computeMold(
      {
        shape: "loaf",
        unit: "cm",
        length: 10,
        width: 10,
        height: 10,
        diameter: 0,
        waterGrams: 0,
      },
      "headspace",
    );
    assert.ok(
      Math.abs(head.oilWeightGrams - brim.oilWeightGrams * (1 - HEADSPACE_FRACTION)) <
        1e-9,
    );
  });
});
