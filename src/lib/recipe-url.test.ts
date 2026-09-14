import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decodeRecipe, encodeRecipe, readRecipeFromUrl } from "./recipe-url.ts";
import type { RecipeConfig } from "../types/soap.ts";

const SAMPLE: RecipeConfig = {
  unit: "g",
  oils: [
    { oilId: "coconut-76", amount: 250 },
    { oilId: "olive", amount: 400 },
  ],
  superfatPercentage: 5,
  liquidConfig: { mode: "concentration", value: 33 },
  lyeChoice: { naohRatio: 1, naohPurity: 0.99, kohPurity: 0.9 },
  additives: { fragranceGrams: 30, sodiumLactateGrams: 0 },
};

describe("recipe URL codec", () => {
  it("round-trips a compact recipe", () => {
    const encoded = encodeRecipe(SAMPLE);
    const decoded = decodeRecipe(encoded);
    assert.ok(decoded);
    assert.equal(decoded.unit, "g");
    assert.equal(decoded.superfatPercentage, 5);
    assert.equal(decoded.lyeChoice.naohRatio, 1);
    assert.equal(decoded.lyeChoice.kohPurity, 0.9);
    assert.equal(decoded.liquidConfig.mode, "concentration");
    assert.equal(decoded.liquidConfig.value, 33);
    assert.equal(decoded.oils.length, 2);
    assert.equal(decoded.oils[0]?.oilId, "coconut-76");
    assert.equal(decoded.oils[0]?.amount, 250);
    assert.equal(decoded.additives?.fragranceGrams, 30);
  });

  it("returns null for garbage", () => {
    assert.equal(decodeRecipe("nope"), null);
    assert.equal(decodeRecipe(""), null);
  });
});

describe("oil preload search params", () => {
  it("parses oil and wt", () => {
    const parsed = readRecipeFromUrl("?oil=coconut-oil-76&wt=500");
    assert.equal(parsed.loadOil?.slug, "coconut-oil-76");
    assert.equal(parsed.loadOil?.weight, 500);
  });

  it("defaults wt to 500 grams", () => {
    const parsed = readRecipeFromUrl("?oil=olive-oil");
    assert.equal(parsed.loadOil?.slug, "olive-oil");
    assert.equal(parsed.loadOil?.weight, 500);
  });

  it("ignores non-positive weights", () => {
    const parsed = readRecipeFromUrl("?oil=tallow&wt=-10");
    assert.equal(parsed.loadOil?.weight, 500);
  });

  it("leaves loadOil null when oil is absent", () => {
    const parsed = readRecipeFromUrl("?r=nope");
    assert.equal(parsed.loadOil, null);
  });
});
