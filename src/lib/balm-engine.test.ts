import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  blendMeltPointC,
  computeBalm,
  firmnessFromWaxPercent,
  graininessRisk,
  type BalmInput,
} from "./balm-engine.ts";
import { WAX_BUTTER_DATABASE, getWaxButterById } from "../data/waxes.ts";

const EPS = 1e-9;

function close(actual: number, expected: number, eps = EPS): void {
  assert.ok(
    Math.abs(actual - expected) < eps,
    `expected ${expected}, got ${actual} (Δ ${Math.abs(actual - expected)})`,
  );
}

function baseInput(overrides: Partial<BalmInput> = {}): BalmInput {
  return {
    batchGrams: 100,
    coolMethod: "fast",
    components: [
      { id: "beeswax-yellow", percent: 20 },
      { id: "shea-unrefined", percent: 30 },
      { id: "sweet-almond-balm", percent: 50 },
    ],
    ...overrides,
  };
}

describe("waxes dataset", () => {
  it("has unique ids and sane melt points", () => {
    const ids = WAX_BUTTER_DATABASE.map((w) => w.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const record of WAX_BUTTER_DATABASE) {
      assert.ok(
        record.melt_point_c > -30 && record.melt_point_c < 100,
        `${record.id} melt point out of range`,
      );
      assert.ok(
        record.recommended_usage_range[0] <= record.recommended_usage_range[1],
        `${record.id} usage range inverted`,
      );
    }
  });

  it("orders wax hardness carnauba > candelilla > beeswax > soy", () => {
    const mp = (id: string) => getWaxButterById(id)?.melt_point_c ?? 0;
    assert.ok(mp("carnauba") > mp("candelilla"));
    assert.ok(mp("candelilla") > mp("beeswax-yellow"));
    assert.ok(mp("beeswax-yellow") > mp("soy-wax"));
  });
});

describe("blendMeltPointC", () => {
  it("computes the weighted average", () => {
    const beeswax = getWaxButterById("beeswax-yellow");
    const almond = getWaxButterById("sweet-almond-balm");
    assert.ok(beeswax && almond);
    // 20% beeswax (63) + 80% almond (-10) = 0.2*63 + 0.8*(-10) = 4.6
    close(
      blendMeltPointC([
        { record: beeswax, fraction: 0.2 },
        { record: almond, fraction: 0.8 },
      ]),
      4.6,
    );
  });

  it("returns 0 for an empty blend", () => {
    assert.equal(blendMeltPointC([]), 0);
  });
});

describe("firmnessFromWaxPercent", () => {
  it("walks the thresholds", () => {
    assert.equal(firmnessFromWaxPercent(0), "soft");
    assert.equal(firmnessFromWaxPercent(7.9), "soft");
    assert.equal(firmnessFromWaxPercent(8), "balanced");
    assert.equal(firmnessFromWaxPercent(17.9), "balanced");
    assert.equal(firmnessFromWaxPercent(18), "firm");
    assert.equal(firmnessFromWaxPercent(29.9), "firm");
    assert.equal(firmnessFromWaxPercent(30), "very_firm");
  });
});

describe("graininessRisk", () => {
  it("escalates with grain load on a slow cool", () => {
    assert.equal(graininessRisk(0.1, "slow"), "low");
    assert.equal(graininessRisk(0.3, "slow"), "moderate");
    assert.equal(graininessRisk(0.6, "slow"), "high");
  });

  it("a fast cool knocks one level off", () => {
    assert.equal(graininessRisk(0.6, "fast"), "moderate");
    assert.equal(graininessRisk(0.3, "fast"), "low");
    assert.equal(graininessRisk(0.1, "fast"), "low");
  });
});

describe("computeBalm", () => {
  it("normalizes percents and converts to grams", () => {
    const result = computeBalm(baseInput());
    close(
      result.rows.reduce((sum, row) => sum + row.percent, 0),
      100,
    );
    close(
      result.rows.reduce((sum, row) => sum + row.grams, 0),
      100,
    );
    const beeswax = result.rows.find((row) => row.id === "beeswax-yellow");
    assert.ok(beeswax);
    close(beeswax.percent, 20);
    close(beeswax.grams, 20);
  });

  it("handles percents that don't sum to 100", () => {
    const result = computeBalm(
      baseInput({
        components: [
          { id: "beeswax-yellow", percent: 10 },
          { id: "shea-unrefined", percent: 15 },
        ],
      }),
    );
    // 10 + 15 = 25 entered → normalized to 40 / 60
    const beeswax = result.rows.find((row) => row.id === "beeswax-yellow");
    const shea = result.rows.find((row) => row.id === "shea-unrefined");
    assert.ok(beeswax && shea);
    close(beeswax.percent, 40);
    close(shea.percent, 60);
    close(result.enteredPercent, 25);
  });

  it("computes the weighted melt point in C and F", () => {
    const result = computeBalm(baseInput());
    // 0.2*63 + 0.3*37 + 0.5*(-10) = 12.6 + 11.1 - 5 = 18.7
    close(result.estimatedMeltPointC, 18.7);
    close(result.estimatedMeltPointF, 18.7 * (9 / 5) + 32);
  });

  it("splits wax / butter / liquid oil fractions", () => {
    const result = computeBalm(baseInput());
    close(result.waxPercent, 20);
    close(result.butterPercent, 30);
    close(result.liquidOilPercent, 50);
    assert.equal(result.firmness, "firm");
  });

  it("flags graininess for shea-heavy slow-cooled balms", () => {
    const slow = computeBalm(
      baseInput({
        coolMethod: "slow",
        components: [{ id: "shea-unrefined", percent: 100 }],
      }),
    );
    assert.equal(slow.graininessRisk, "high");
    assert.ok(slow.warnings.some((w) => w.includes("graininess")));

    const fast = computeBalm(
      baseInput({
        coolMethod: "fast",
        components: [{ id: "shea-unrefined", percent: 100 }],
      }),
    );
    assert.equal(fast.graininessRisk, "moderate");
  });

  it("warns on very low and very high wax", () => {
    const low = computeBalm(
      baseInput({ components: [{ id: "shea-unrefined", percent: 100 }] }),
    );
    assert.ok(low.warnings.some((w) => w.includes("Very little wax")));

    const high = computeBalm(
      baseInput({
        components: [
          { id: "carnauba", percent: 40 },
          { id: "sweet-almond-balm", percent: 60 },
        ],
      }),
    );
    assert.equal(high.firmness, "very_firm");
    assert.ok(high.warnings.some((w) => w.includes("lot of wax")));
  });

  it("returns a helpful empty result for no components", () => {
    const result = computeBalm(baseInput({ components: [] }));
    assert.equal(result.rows.length, 0);
    assert.equal(result.estimatedMeltPointC, 0);
    assert.ok(result.warnings.length > 0);
  });

  it("skips unknown ids and reports them", () => {
    const result = computeBalm(
      baseInput({
        components: [
          { id: "beeswax-yellow", percent: 50 },
          { id: "not-a-wax", percent: 50 },
        ],
      }),
    );
    assert.deepEqual(result.unknownIds, ["not-a-wax"]);
    close(result.rows[0]?.percent ?? 0, 100);
  });

  it("treats negative and NaN inputs as zero", () => {
    const result = computeBalm(
      baseInput({
        batchGrams: -50,
        components: [{ id: "beeswax-yellow", percent: Number.NaN }],
      }),
    );
    assert.equal(result.rows.length, 0);
    assert.equal(result.batchGrams, 0);
  });
});
