import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeCandle,
  dualBasisSplit,
  vesselsFromWaxMass,
  type CandleInput,
} from "./candle-engine.ts";
import { CANDLE_WAXES, getCandleWaxById } from "../data/candle-waxes.ts";

const EPS = 1e-9;

function close(actual: number, expected: number, eps = EPS): void {
  assert.ok(
    Math.abs(actual - expected) < eps,
    `expected ${expected}, got ${actual} (Δ ${Math.abs(actual - expected)})`,
  );
}

function baseInput(overrides: Partial<CandleInput> = {}): CandleInput {
  return {
    waterMassGramsPerVessel: 240,
    vesselCount: 1,
    waxId: "soy-container-seed",
    headspacePercent: 0,
    wastePercent: 0,
    foBasis: "wax",
    foLoadPercent: 8,
    ...overrides,
  };
}

describe("candle waxes dataset", () => {
  it("has unique ids, plausible SGs, and seed-stamped sources", () => {
    const ids = CANDLE_WAXES.map((w) => w.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const record of CANDLE_WAXES) {
      assert.ok(
        record.specific_gravity > 0.5 && record.specific_gravity < 1.2,
        `${record.id} SG out of range`,
      );
      assert.ok(record.source.includes("SEED"), `${record.id} source must be stamped SEED`);
    }
  });

  it("orders density beeswax > paraffin > soy > coconut-soy seed", () => {
    const sg = (id: string) => getCandleWaxById(id)?.specific_gravity ?? 0;
    assert.ok(sg("beeswax-candle-seed") > sg("paraffin-container-seed"));
    assert.ok(sg("paraffin-container-seed") > sg("soy-container-seed"));
    assert.ok(sg("soy-container-seed") > sg("coconut-soy-blend-seed"));
  });
});

describe("dualBasisSplit — wax basis", () => {
  it("computes FO from wax and prints both percentages", () => {
    const split = dualBasisSplit({
      basis: "wax",
      loadPercent: 8,
      waxMassGrams: 100,
    });
    close(split.fragranceMassGrams, 8);
    close(split.finishedMassGrams, 108);
    close(split.foPercentOfWax, 8);
    // 8 / 108 as a share of finished weight
    close(split.foPercentOfFinished, (8 / 108) * 100);
  });

  it("derives the same split when anchored on finished mass", () => {
    const split = dualBasisSplit({
      basis: "wax",
      loadPercent: 8,
      finishedMassGrams: 108,
    });
    close(split.waxMassGrams, 100);
    close(split.fragranceMassGrams, 8);
  });
});

describe("dualBasisSplit — finished basis", () => {
  it("computes FO from finished and prints both percentages", () => {
    const split = dualBasisSplit({
      basis: "finished",
      loadPercent: 8,
      finishedMassGrams: 108,
    });
    close(split.fragranceMassGrams, 8.64);
    close(split.waxMassGrams, 99.36);
    close(split.foPercentOfFinished, 8);
    close(split.foPercentOfWax, (8.64 / 99.36) * 100);
  });

  it("derives the same split when anchored on wax mass", () => {
    const split = dualBasisSplit({
      basis: "finished",
      loadPercent: 8,
      waxMassGrams: 92,
    });
    close(split.finishedMassGrams, 100);
    close(split.fragranceMassGrams, 8);
  });

  it("shows the two bases are NOT the same candle at the same percent", () => {
    const byWax = dualBasisSplit({
      basis: "wax",
      loadPercent: 8,
      finishedMassGrams: 100,
    });
    const byFinished = dualBasisSplit({
      basis: "finished",
      loadPercent: 8,
      finishedMassGrams: 100,
    });
    assert.ok(
      byFinished.fragranceMassGrams > byWax.fragranceMassGrams,
      "finished-basis 8% must carry more FO than wax-basis 8%",
    );
  });

  it("refuses a finished-basis load at or above 100%", () => {
    const split = dualBasisSplit({
      basis: "finished",
      loadPercent: 100,
      finishedMassGrams: 100,
    });
    assert.equal(split.valid, false);
    assert.equal(split.finishedMassGrams, 0);
    assert.ok(split.warnings.length > 0);
  });
});

describe("computeCandle — vessel fill × SG", () => {
  it("converts water weight to finished fill via SG", () => {
    // 240 g water × 0.88 SG = 211.2 g finished fill, no headspace.
    const result = computeCandle(baseInput());
    close(result.finishedPerVesselGrams, 211.2);
    close(result.finishedTotalGrams, 211.2);
    assert.equal(result.specificGravity, 0.88);
  });

  it("applies headspace as a percent of the fill", () => {
    const result = computeCandle(baseInput({ headspacePercent: 10 }));
    close(result.finishedPerVesselGrams, 211.2 * 0.9);
  });

  it("splits the fill by the named basis and scales by vessel count", () => {
    const result = computeCandle(baseInput({ vesselCount: 4 }));
    close(result.finishedTotalGrams, 211.2 * 4);
    // wax basis 8% anchored on finished: wax = finished / 1.08
    close(result.waxTotalGrams, (211.2 * 4) / 1.08);
    close(result.fragranceTotalGrams, 211.2 * 4 - (211.2 * 4) / 1.08);
    close(result.waxPerVesselGrams, 211.2 / 1.08);
    close(result.foPercentOfWax, 8);
  });

  it("applies waste to the melt amounts only, never the fill", () => {
    const result = computeCandle(baseInput({ wastePercent: 5 }));
    close(result.finishedTotalGrams, 211.2);
    close(result.waxToMeltGrams, result.waxTotalGrams * 1.05);
    close(result.fragranceToWeighGrams, result.fragranceTotalGrams * 1.05);
  });

  it("honours a custom SG override over the library", () => {
    const result = computeCandle(baseInput({ specificGravityOverride: 0.92 }));
    assert.equal(result.usingCustomSg, true);
    close(result.specificGravity, 0.92);
    close(result.finishedPerVesselGrams, 240 * 0.92);
    assert.ok(
      !result.warnings.some((w) => w.includes("seed value")),
      "custom SG should not draw the seed warning",
    );
  });

  it("flags an unknown wax and zeroes the fill", () => {
    const result = computeCandle(baseInput({ waxId: "not-a-wax" }));
    assert.equal(result.unknownWax, true);
    close(result.finishedTotalGrams, 0);
    assert.ok(result.warnings.some((w) => w.includes("isn't in the SG library")));
  });

  it("warns that the library SG is a seed value", () => {
    const result = computeCandle(baseInput());
    assert.ok(result.warnings.some((w) => w.includes("seed value")));
  });
});

describe("computeCandle — user-supplied caps", () => {
  it("flags loads over the user's own max-FO cap, and only then", () => {
    const under = computeCandle(baseInput({ maxFoPercentOfWax: 10 }));
    assert.equal(under.overMaxFo, false);
    const over = computeCandle(baseInput({ maxFoPercentOfWax: 6 }));
    assert.equal(over.overMaxFo, true);
    assert.ok(over.warnings.some((w) => w.includes("Over the max load")));
    const noCap = computeCandle(baseInput());
    assert.equal(noCap.overMaxFo, false);
  });

  it("flags loads over the user's own IFRA cap (finished basis)", () => {
    const result = computeCandle(baseInput({ foBasis: "finished", ifraCapPercentOfFinished: 5 }));
    // finished-basis load is 8% of finished > 5% cap
    assert.equal(result.overIfraCap, true);
    assert.ok(result.warnings.some((w) => w.includes("IFRA cap")));
  });

  it("treats negative and NaN inputs as zero", () => {
    const result = computeCandle(
      baseInput({
        waterMassGramsPerVessel: -10,
        vesselCount: Number.NaN,
        foLoadPercent: Number.NaN,
      }),
    );
    close(result.finishedTotalGrams, 0);
    assert.equal(result.vesselCount, 0);
  });
});

describe("vesselsFromWaxMass", () => {
  it("floors to whole vessels and guards zero", () => {
    assert.equal(vesselsFromWaxMass(1000, 195.5), 5);
    assert.equal(vesselsFromWaxMass(100, 0), 0);
    assert.equal(vesselsFromWaxMass(-5, 100), 0);
  });
});
