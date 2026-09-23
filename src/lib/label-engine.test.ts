import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { computeBatch } from "./calcEngine.ts";
import {
  CURE_WATER_RETAINED,
  euSaponifiedLabel,
  fdaInputLabel,
} from "./label-engine.ts";
import type { MasterOilRecord, RecipeConfig } from "../types/soap.ts";

const dir = dirname(fileURLToPath(import.meta.url));
const OIL_DATABASE = JSON.parse(
  readFileSync(join(dir, "../data/oils.json"), "utf8"),
) as MasterOilRecord[];

function coconut(): MasterOilRecord {
  const oil = OIL_DATABASE.find((row) => row.id === "coconut-76");
  assert.ok(oil);
  return oil;
}

function olive(): MasterOilRecord {
  const oil = OIL_DATABASE.find((row) => row.id === "olive");
  assert.ok(oil);
  return oil;
}

const CASTILE: RecipeConfig = {
  unit: "g",
  oils: [{ oilId: "olive", amount: 1000 }],
  superfatPercentage: 5,
  liquidConfig: { mode: "concentration", value: 33 },
  lyeChoice: { naohRatio: 1, naohPurity: 0.99, kohPurity: 0.9 },
  additives: { fragranceGrams: 30, sodiumLactateGrams: 0 },
};

describe("FDA input-method label", () => {
  it("sorts raw inputs descending and footnotes alkali", () => {
    const result = computeBatch(CASTILE, OIL_DATABASE);
    const label = fdaInputLabel(CASTILE, result, OIL_DATABASE);
    assert.equal(label.lines[0]?.name, "Olive Oil");
    assert.equal(label.lines[0]?.grams, 1000);
    assert.ok(label.lines.some((line) => line.name === "Water"));
    const alkali = label.lines.find((line) => line.name === "Sodium Hydroxide");
    assert.ok(alkali?.footnote);
    assert.ok(label.text.startsWith("Ingredients: Olive Oil, "));
    assert.ok(label.text.includes("Sodium Hydroxide*"));
    assert.ok(label.text.endsWith("(*None remains in finished soap)."));
    const grams = label.lines.map((line) => line.grams);
    const sorted = [...grams].sort((a, b) => b - a);
    assert.deepEqual(grams, sorted);
  });
});

describe("EU saponified-salt label", () => {
  it("derives glycerin from saponified oil only and retains 85% of water after cure", () => {
    const result = computeBatch(CASTILE, OIL_DATABASE);
    const label = euSaponifiedLabel(CASTILE, result, OIL_DATABASE);
    const glycerin = label.lines.find((line) => line.name === "Glycerin");
    const aqua = label.lines.find((line) => line.name === "Aqua");
    const salt = label.lines.find((line) => line.name === olive().inci_names.saponified_naoh);
    const leftover = label.lines.find((line) => line.name === olive().inci_names.standard);
    assert.ok(glycerin);
    // m2: glycerol only from saponified oil: 1000g x 0.95 x sap_koh(0.188) x 0.547
    assert.equal(glycerin.grams, 1000 * 0.95 * 0.188 * 0.547);
    assert.ok(aqua);
    assert.equal(aqua.grams, result.liquidWeight * CURE_WATER_RETAINED);
    assert.ok(salt);
    assert.equal(salt.grams, 1000 * 0.95);
    assert.ok(leftover);
    assert.equal(leftover.grams, 50);
    assert.ok(label.lines.some((line) => line.name === "Parfum"));
    assert.equal(
      label.lines.some((line) => line.name.includes("Hydroxide")),
      false,
    );
    assert.ok(label.text.startsWith("Ingredients: "));
  });

  it("emits potassium salts for 100% KOH and splits a dual-lye batch", () => {
    const kohConfig: RecipeConfig = {
      ...CASTILE,
      lyeChoice: { naohRatio: 0, naohPurity: 0.99, kohPurity: 0.9 },
      superfatPercentage: 0,
      additives: { fragranceGrams: 0, sodiumLactateGrams: 0 },
    };
    const koh = euSaponifiedLabel(
      kohConfig,
      computeBatch(kohConfig, OIL_DATABASE),
      OIL_DATABASE,
    );
    assert.ok(koh.lines.some((line) => line.name === olive().inci_names.saponified_koh));
    assert.equal(
      koh.lines.some((line) => line.name === olive().inci_names.saponified_naoh),
      false,
    );

    const blend: RecipeConfig = {
      unit: "g",
      oils: [
        { oilId: "olive", amount: 700 },
        { oilId: "coconut-76", amount: 300 },
      ],
      superfatPercentage: 0,
      liquidConfig: { mode: "concentration", value: 33 },
      lyeChoice: { naohRatio: 0.5, naohPurity: 0.99, kohPurity: 0.9 },
      additives: { fragranceGrams: 0, sodiumLactateGrams: 0 },
    };
    const label = euSaponifiedLabel(blend, computeBatch(blend, OIL_DATABASE), OIL_DATABASE);
    const sodiumOlive = label.lines.find(
      (line) => line.name === olive().inci_names.saponified_naoh,
    );
    const potassiumCoco = label.lines.find(
      (line) => line.name === coconut().inci_names.saponified_koh,
    );
    assert.equal(sodiumOlive?.grams, 350);
    assert.equal(potassiumCoco?.grams, 150);
  });
});
