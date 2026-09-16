import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hasLegacySoapSearch,
  soapSearchFromLegacy,
} from "./soap-search.ts";

describe("legacy soap search", () => {
  it("detects r, oil, add, wt, and recipe", () => {
    assert.equal(hasLegacySoapSearch({}), false);
    assert.equal(hasLegacySoapSearch({ r: "g|5|..." }), true);
    assert.equal(hasLegacySoapSearch({ oil: "coconut-oil-76" }), true);
    assert.equal(hasLegacySoapSearch({ add: "olive" }), true);
    assert.equal(hasLegacySoapSearch({ wt: 500 }), true);
    assert.equal(hasLegacySoapSearch({ recipe: "g|5|..." }), true);
  });

  it("maps recipe onto r and preserves oil/wt/add", () => {
    const mapped = soapSearchFromLegacy({
      recipe: "encoded",
      oil: "coconut-oil-76",
      wt: 500,
      add: "castor",
    });
    assert.deepEqual(mapped, {
      r: "encoded",
      oil: "coconut-oil-76",
      wt: 500,
      add: "castor",
    });
  });

  it("prefers r over recipe when both are present", () => {
    const mapped = soapSearchFromLegacy({ r: "keep", recipe: "drop" });
    assert.equal(mapped.r, "keep");
  });
});
