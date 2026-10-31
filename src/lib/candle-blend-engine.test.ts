import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeCandleBlend } from "./candle-blend-engine.ts";
import { CANDLE_BLEND_PROFILES } from "../data/candle-blend-profiles.ts";
import { CANDLE_WAXES } from "../data/candle-waxes.ts";

const EPS = 1e-9;

function close(actual: number, expected: number, eps = EPS): void {
  assert.ok(
    Math.abs(actual - expected) < eps,
    `expected ${expected}, got ${actual} (Δ ${Math.abs(actual - expected)})`,
  );
}

describe("candle blend profiles dataset", () => {
  it("covers every candle wax with ordered ranges and a seed source", () => {
    for (const wax of CANDLE_WAXES) {
      const profile = CANDLE_BLEND_PROFILES.find((p) => p.waxId === wax.id);
      assert.ok(profile, `missing blend profile for ${wax.id}`);
      assert.ok(profile.meltRangeC[0] < profile.meltRangeC[1]);
      assert.ok(profile.pourRangeC[0] < profile.pourRangeC[1]);
      assert.ok(profile.hardness >= 0 && profile.hardness <= 1);
      assert.ok(profile.frostRisk >= 0 && profile.frostRisk <= 1);
      assert.match(profile.source, /SEED/);
    }
  });
});

describe("computeCandleBlend", () => {
  it("a single wax returns its own profile numbers", () => {
    const result = computeCandleBlend({
      components: [{ waxId: "soy-container-seed", percent: 100 }],
    });
    assert.equal(result.complete, true);
    close(result.blendSg, 0.88);
    close(result.meltLowC, 45);
    close(result.meltHighC, 48);
    close(result.meltMidC, 46.5);
    close(result.pourLowC, 57);
    close(result.pourHighC, 66);
    close(result.hardnessScore, 0.35);
    assert.equal(result.hardnessBand, "soft");
    assert.equal(result.frostRiskBand, "high");
    assert.equal(result.containerOk, true);
    assert.equal(result.pillarOk, false);
    assert.equal(result.rows.length, 1);
    close(result.rows[0]?.percent ?? -1, 100);
  });

  it("weights a 50/50 soy–beeswax blend and widens the pour window by the spread", () => {
    const result = computeCandleBlend({
      components: [
        { waxId: "soy-container-seed", percent: 50 },
        { waxId: "beeswax-candle-seed", percent: 50 },
      ],
    });
    close(result.blendSg, 0.92);
    close(result.meltMidC, 55);
    close(result.meltLowC, 53.5);
    close(result.meltHighC, 56.5);
    close(result.meltSpreadC, 17);
    // Weighted window 62.5–70.5, stretched by spread/4 on each side (4.25).
    close(result.pourLowC, 58.25);
    close(result.pourHighC, 74.75);
    close(result.hardnessScore, 0.6);
    assert.equal(result.hardnessBand, "firm");
    assert.equal(result.pillarOk, true);
    assert.equal(result.frostRiskBand, "medium");
    assert.ok(
      result.warnings.some((w) => w.includes("melt 17 °C apart")),
      "expected the divergence warning",
    );
    assert.ok(
      result.notes.some((w) => w.includes("bloom")),
      "expected the beeswax bloom note",
    );
  });

  it("normalizes components that do not add to 100 and says so", () => {
    const result = computeCandleBlend({
      components: [
        { waxId: "soy-container-seed", percent: 30 },
        { waxId: "beeswax-candle-seed", percent: 30 },
      ],
    });
    close(result.rows[0]?.percent ?? -1, 50);
    close(result.rows[1]?.percent ?? -1, 50);
    assert.ok(result.notes.some((n) => n.includes("normalizes them to 100%")));
  });

  it("excludes unknown waxes and reports them", () => {
    const result = computeCandleBlend({
      components: [
        { waxId: "soy-container-seed", percent: 80 },
        { waxId: "mystery-wax", percent: 20 },
      ],
    });
    assert.equal(result.complete, false);
    assert.deepEqual(result.unknownWaxIds, ["mystery-wax"]);
    close(result.rows[0]?.percent ?? -1, 100);
  });

  it("stearic firms the blend and lifts the melt band (heuristic)", () => {
    const result = computeCandleBlend({
      components: [{ waxId: "soy-container-seed", percent: 100 }],
      stearicPercent: 10,
    });
    close(result.hardnessScore, 0.55);
    assert.equal(result.hardnessBand, "medium");
    close(result.meltMidC, 49.5);
    assert.ok(result.notes.some((n) => n.includes("heuristics")));
  });

  it("an empty blend maths to nothing and warns", () => {
    const result = computeCandleBlend({ components: [] });
    assert.equal(result.rows.length, 0);
    close(result.blendSg, 0);
    assert.ok(result.warnings.some((w) => w.includes("Nothing in the blend")));
  });
});
