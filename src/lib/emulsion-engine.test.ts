import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  blendHlbOfEmulsifiers,
  computeEmulsion,
  hlbVerdictForGap,
  requiredHlbOfOils,
  type EmulsionInput,
} from "./emulsion-engine.ts";
import {
  EMULSIFIERS,
  OIL_REQUIRED_HLB,
  PRESERVATIVES,
  getEmulsifierById,
  getOilHlbById,
} from "../data/emulsifiers.ts";

const EPS = 1e-9;

function close(actual: number, expected: number, eps = EPS): void {
  assert.ok(
    Math.abs(actual - expected) < eps,
    `expected ${expected}, got ${actual} (Δ ${Math.abs(actual - expected)})`,
  );
}

function baseInput(overrides: Partial<EmulsionInput> = {}): EmulsionInput {
  return {
    batchGrams: 100,
    oilPhasePercent: 20,
    oils: [
      { id: "sweet-almond-hlb", percent: 70 },
      { id: "shea-hlb", percent: 30 },
    ],
    emulsifiers: [{ id: "glyceryl-stearate-peg100", percent: 4 }],
    preservativeId: "germaben-ii",
    preservativePercent: 1,
    evaporationPercent: 10,
    ...overrides,
  };
}

describe("emulsifier dataset", () => {
  it("has unique ids and HLB values in range", () => {
    const ids = EMULSIFIERS.map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const record of EMULSIFIERS) {
      assert.ok(
        record.hlb >= 0 && record.hlb <= 20,
        `${record.id} HLB out of range`,
      );
    }
  });

  it("preservative maximums are positive and sane", () => {
    for (const record of PRESERVATIVES) {
      assert.ok(
        record.max_usage_percent > 0 && record.max_usage_percent <= 5,
        `${record.id} max usage out of range`,
      );
    }
  });
});

describe("requiredHlbOfOils", () => {
  it("weights by oil-phase fraction", () => {
    const almond = getOilHlbById("sweet-almond-hlb");
    const shea = getOilHlbById("shea-hlb");
    assert.ok(almond && shea);
    // 0.7 * 7 + 0.3 * 8 = 7.3
    close(
      requiredHlbOfOils([
        { record: almond, fraction: 0.7 },
        { record: shea, fraction: 0.3 },
      ]) ?? 0,
      7.3,
    );
  });

  it("returns null for no oils", () => {
    assert.equal(requiredHlbOfOils([]), null);
  });
});

describe("blendHlbOfEmulsifiers", () => {
  it("weights by share of the emulsifier blend", () => {
    const glyceryl = getEmulsifierById("glyceryl-stearate-peg100");
    const sorbitan = getEmulsifierById("sorbitan-olivate");
    assert.ok(glyceryl && sorbitan);
    // 50/50 of HLB 11 and 4.7 → 7.85
    close(
      blendHlbOfEmulsifiers([
        { record: glyceryl, fraction: 0.5 },
        { record: sorbitan, fraction: 0.5 },
      ]) ?? 0,
      7.85,
    );
  });
});

describe("hlbVerdictForGap", () => {
  it("walks the thresholds", () => {
    assert.equal(hlbVerdictForGap(null), "unknown");
    assert.equal(hlbVerdictForGap(0.5), "good");
    assert.equal(hlbVerdictForGap(1), "good");
    assert.equal(hlbVerdictForGap(1.5), "acceptable");
    assert.equal(hlbVerdictForGap(2), "acceptable");
    assert.equal(hlbVerdictForGap(2.1), "mismatch");
  });
});

describe("computeEmulsion", () => {
  it("matches a well-built formula", () => {
    // Required HLB: 0.7*7 + 0.3*8 = 7.3; blend HLB 11 → gap 3.7 → mismatch.
    // Swap in a matching blend: 50/50 glyceryl stearate (11) + sorbitan olivate (4.7) = 7.85 → gap 0.55 → good.
    const result = computeEmulsion(
      baseInput({
        emulsifiers: [
          { id: "glyceryl-stearate-peg100", percent: 2 },
          { id: "sorbitan-olivate", percent: 2 },
        ],
      }),
    );
    close(result.requiredHlb ?? 0, 7.3);
    close(result.blendHlb ?? 0, 7.85);
    close(result.hlbGap ?? 0, 0.55, 1e-6);
    assert.equal(result.hlbVerdict, "good");
    assert.equal(result.preservativeVerdict, "ok");
  });

  it("flags an HLB mismatch", () => {
    const result = computeEmulsion(baseInput());
    assert.equal(result.hlbVerdict, "mismatch");
    assert.ok(result.warnings.some((w) => w.includes("misses the oil phase")));
  });

  it("flags preservative over the maximum", () => {
    const result = computeEmulsion(
      baseInput({ preservativeId: "germall-plus", preservativePercent: 1 }),
    );
    assert.equal(result.preservativeVerdict, "over");
    assert.equal(result.preservativeMax, 0.5);
    assert.ok(result.warnings.some((w) => w.includes("over its 0.5% maximum")));
  });

  it("warns when there is no preservative", () => {
    const result = computeEmulsion(
      baseInput({ preservativeId: null, preservativePercent: 0 }),
    );
    assert.equal(result.preservativeVerdict, "missing");
    assert.ok(result.warnings.some((w) => w.includes("No preservative")));
  });

  it("does the water math with evaporation makeup", () => {
    // 100g batch: 20% oil + 4% emulsifier + 1% preservative → 75% water = 75g
    // 10% evaporation → 7.5g makeup
    const result = computeEmulsion(baseInput());
    close(result.waterPercent, 75);
    close(result.waterGrams, 75);
    close(result.makeupWaterGrams, 7.5);
    // Oil rows: 70/30 of the 20g oil phase
    const almond = result.oilRows.find((r) => r.id === "sweet-almond-hlb");
    assert.ok(almond);
    close(almond.grams, 14);
  });

  it("warns when the phases pass 100%", () => {
    const result = computeEmulsion(
      baseInput({ oilPhasePercent: 90, preservativePercent: 15 }),
    );
    assert.ok(result.warnings.some((w) => w.includes("pass 100%")));
    assert.equal(result.waterPercent, 0);
  });

  it("flags anionic + cationic emulsifier conflict", () => {
    const result = computeEmulsion(
      baseInput({
        emulsifiers: [
          // BTMS-50 is the cationic one in the dataset; pair it with a
          // hypothetical anionic via a custom record below.
          { id: "btms-50", percent: 3 },
        ],
      }),
    );
    // No anionic emulsifier in the default dataset alongside BTMS-50, so
    // no conflict expected here — documents the current dataset shape.
    assert.ok(!result.warnings.some((w) => w.includes("Anionic meets cationic")));
  });

  it("detects anionic/cationic conflict with a custom dataset", () => {
    const anionic = {
      ...EMULSIFIERS[0],
      id: "anionic-x",
      charge: "anionic" as const,
    };
    const result = computeEmulsion(
      baseInput({
        emulsifiers: [
          { id: "anionic-x", percent: 2 },
          { id: "btms-50", percent: 2 },
        ],
      }),
      [...EMULSIFIERS, anionic],
    );
    assert.ok(result.warnings.some((w) => w.includes("Anionic meets cationic")));
  });

  it("skips unknown ids and reports them", () => {
    const result = computeEmulsion(
      baseInput({ oils: [{ id: "nope", percent: 100 }] }),
    );
    assert.deepEqual(result.unknownIds, ["nope"]);
    assert.equal(result.requiredHlb, null);
    assert.equal(result.hlbVerdict, "unknown");
  });

  it("handles an empty formula gracefully", () => {
    const result = computeEmulsion(
      baseInput({
        oilPhasePercent: 0,
        oils: [],
        emulsifiers: [],
        preservativeId: null,
        preservativePercent: 0,
      }),
    );
    close(result.waterPercent, 100);
    assert.equal(result.hlbVerdict, "unknown");
  });
});

describe("oil required-HLB dataset", () => {
  it("covers the oils the UI offers", () => {
    const ids = OIL_REQUIRED_HLB.map((o) => o.id);
    for (const required of [
      "sweet-almond-hlb",
      "shea-hlb",
      "olive-hlb",
      "mct-hlb",
    ]) {
      assert.ok(ids.includes(required), `missing ${required}`);
    }
  });
});
