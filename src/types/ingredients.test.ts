import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  INGREDIENT_CATEGORIES,
  oilToBaseIngredient,
  type BaseIngredient,
} from "./ingredients.ts";
import type { MasterOilRecord } from "./soap.ts";

const dir = dirname(fileURLToPath(import.meta.url));
const oils = JSON.parse(
  readFileSync(join(dir, "../data/oils.json"), "utf8"),
) as MasterOilRecord[];

describe("ingredient domain", () => {
  it("locks the nine bench categories", () => {
    assert.deepEqual(INGREDIENT_CATEGORIES, [
      "oil_fat_butter",
      "wax",
      "emulsifier",
      "surfactant",
      "active",
      "preservative",
      "solvent_water",
      "thickener_polymer",
      "fragrance_essential_oil",
    ]);
  });

  it("projects every MasterOilRecord onto BaseIngredient without dropping SAP", () => {
    assert.ok(oils.length >= 20);
    for (const oil of oils) {
      const row: BaseIngredient = oilToBaseIngredient(oil);
      assert.equal(row.id, oil.id);
      assert.equal(row.slug, oil.slug);
      assert.equal(row.category, "oil_fat_butter");
      assert.equal(row.inci_name, oil.inci_names.standard);
      assert.deepEqual(row.recommended_usage_range, [0, oil.recommended_max_percentage]);
      assert.equal(row.saponification?.sap_naoh, oil.sap_naoh);
      assert.equal(row.saponification?.sap_koh, oil.sap_koh);
      assert.deepEqual(row.saponification?.fatty_acids, oil.fatty_acids);
      assert.equal(row.emulsion, undefined);
      assert.equal(row.surfactant, undefined);
    }
  });
});
