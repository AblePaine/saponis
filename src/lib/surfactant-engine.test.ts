import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeCleanser,
  gentlenessLabelForScore,
  gentlenessScore,
  recommendedPhRange,
  type CleanserInput,
} from "./surfactant-engine.ts";
import { SURFACTANTS, getSurfactantById } from "../data/surfactants.ts";

const EPS = 1e-9;

function close(actual: number, expected: number, eps = EPS): void {
  assert.ok(
    Math.abs(actual - expected) < eps,
    `expected ${expected}, got ${actual} (Δ ${Math.abs(actual - expected)})`,
  );
}

function baseInput(overrides: Partial<CleanserInput> = {}): CleanserInput {
  return {
    batchGrams: 100,
    targetPh: null,
    surfactants: [
      { id: "cocamidopropyl-betaine", percent: 8 },
      { id: "decyl-glucoside", percent: 6 },
    ],
    ...overrides,
  };
}

describe("surfactant dataset", () => {
  it("has unique ids and sane ASM fractions", () => {
    const ids = SURFACTANTS.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const record of SURFACTANTS) {
      assert.ok(
        record.asm_fraction > 0 && record.asm_fraction <= 1,
        `${record.id} ASM fraction out of range`,
      );
      assert.ok(
        record.ideal_ph_range[0] < record.ideal_ph_range[1],
        `${record.id} pH range inverted`,
      );
    }
  });

  it("covers the workhorse cleanser surfactants", () => {
    const ids = SURFACTANTS.map((s) => s.id);
    for (const required of [
      "cocamidopropyl-betaine",
      "decyl-glucoside",
      "sodium-cocoyl-isethionate",
    ]) {
      assert.ok(ids.includes(required), `missing ${required}`);
    }
  });
});

describe("gentlenessScore", () => {
  it("docks points for high ASM", () => {
    const mild = gentlenessScore(10, 0.3, 0.4, 0.3);
    const strong = gentlenessScore(25, 0.3, 0.4, 0.3);
    assert.ok(strong < mild, `expected ${strong} < ${mild}`);
  });

  it("rewards amphoteric content", () => {
    const without = gentlenessScore(15, 0.8, 0, 0.2);
    const withBetaine = gentlenessScore(15, 0.55, 0.25, 0.2);
    assert.ok(withBetaine > without);
  });

  it("penalizes anionic-heavy systems with no amphoteric", () => {
    const harsh = gentlenessScore(15, 0.9, 0, 0.1);
    const softened = gentlenessScore(15, 0.9, 0.2, 0.1);
    assert.ok(harsh < softened);
  });

  it("stays within 0–100", () => {
    assert.ok(gentlenessScore(60, 1, 0, 0) >= 0);
    assert.ok(gentlenessScore(0, 0, 1, 0) <= 100);
  });
});

describe("gentlenessLabelForScore", () => {
  it("walks the thresholds", () => {
    assert.equal(gentlenessLabelForScore(100), "gentle");
    assert.equal(gentlenessLabelForScore(80), "gentle");
    assert.equal(gentlenessLabelForScore(79), "moderate");
    assert.equal(gentlenessLabelForScore(60), "moderate");
    assert.equal(gentlenessLabelForScore(59), "strong");
  });
});

describe("recommendedPhRange", () => {
  it("intersects the ranges", () => {
    const capb = getSurfactantById("cocamidopropyl-betaine");
    const decyl = getSurfactantById("decyl-glucoside");
    assert.ok(capb && decyl);
    // [5.0, 7.5] ∩ [5.0, 9.0] = [5.0, 7.5]
    assert.deepEqual(recommendedPhRange([capb, decyl]), [5.0, 7.5]);
  });

  it("returns null when ranges do not overlap", () => {
    const a = { ...SURFACTANTS[0], ideal_ph_range: [4.0, 5.0] as [number, number] };
    const b = { ...SURFACTANTS[0], ideal_ph_range: [6.0, 7.0] as [number, number] };
    assert.equal(recommendedPhRange([a, b]), null);
  });

  it("returns null for no surfactants", () => {
    assert.equal(recommendedPhRange([]), null);
  });
});

describe("computeCleanser", () => {
  it("sums total active surfactant matter", () => {
    // 8% × 0.30 + 6% × 0.50 = 2.4 + 3.0 = 5.4
    const result = computeCleanser(baseInput());
    close(result.totalAsm, 5.4);
    assert.deepEqual(result.charges.sort(), ["amphoteric", "nonionic"]);
  });

  it("detects anionic + cationic conflict", () => {
    const cationic = {
      ...SURFACTANTS[0],
      id: "cationic-x",
      charge: "cationic" as const,
    };
    const result = computeCleanser(
      {
        batchGrams: 100,
        targetPh: null,
        surfactants: [
          { id: "sodium-cocoyl-isethionate", percent: 10 },
          { id: "cationic-x", percent: 2 },
        ],
      },
      [...SURFACTANTS, cationic],
    );
    assert.equal(result.compatible, false);
    assert.ok(result.compatibilityNote?.includes("Pick one team"));
    assert.ok(result.warnings.some((w) => w.includes("fall out of solution")));
  });

  it("notes the betaine synergy", () => {
    const result = computeCleanser({
      batchGrams: 100,
      targetPh: null,
      surfactants: [
        { id: "sodium-cocoyl-isethionate", percent: 10 },
        { id: "cocamidopropyl-betaine", percent: 5 },
      ],
    });
    assert.ok(result.synergyNote?.includes("softens the whole system"));
  });

  it("scores a gentle blend high and a strong blend low", () => {
    const gentle = computeCleanser(baseInput());
    const strong = computeCleanser({
      batchGrams: 100,
      targetPh: null,
      surfactants: [{ id: "sodium-cocoyl-isethionate", percent: 25 }],
    });
    assert.ok(
      gentle.gentlenessScore > strong.gentlenessScore,
      `${gentle.gentlenessScore} vs ${strong.gentlenessScore}`,
    );
    assert.equal(gentle.gentlenessLabel, "gentle");
  });

  it("warns on very high and very low ASM", () => {
    const high = computeCleanser({
      batchGrams: 100,
      targetPh: null,
      surfactants: [{ id: "sodium-cocoyl-isethionate", percent: 25 }],
    });
    close(high.totalAsm, 21.25);
    assert.ok(high.warnings.some((w) => w.includes("strong cleanser")));

    const low = computeCleanser({
      batchGrams: 100,
      targetPh: null,
      surfactants: [{ id: "cocamidopropyl-betaine", percent: 5 }],
    });
    close(low.totalAsm, 1.5);
    assert.ok(low.warnings.some((w) => w.includes("barely foam")));
  });

  it("checks a target pH against the recommended window", () => {
    const inside = computeCleanser(baseInput({ targetPh: 6 }));
    assert.ok(inside.phNote?.includes("inside the happy window"));

    const outside = computeCleanser(baseInput({ targetPh: 9 }));
    assert.ok(outside.phNote?.includes("outside the happy window"));
  });

  it("converts percents to grams", () => {
    const result = computeCleanser(baseInput());
    const capb = result.rows.find((r) => r.id === "cocamidopropyl-betaine");
    assert.ok(capb);
    close(capb.grams, 8);
    close(capb.asmContribution, 2.4);
  });

  it("returns a helpful empty result", () => {
    const result = computeCleanser({
      batchGrams: 100,
      targetPh: null,
      surfactants: [],
    });
    assert.equal(result.rows.length, 0);
    assert.equal(result.totalAsm, 0);
    assert.ok(result.warnings.some((w) => w.includes("Nothing in the bowl")));
  });

  it("skips unknown ids and reports them", () => {
    const result = computeCleanser({
      batchGrams: 100,
      targetPh: null,
      surfactants: [
        { id: "cocamidopropyl-betaine", percent: 8 },
        { id: "mystery-foam", percent: 5 },
      ],
    });
    assert.deepEqual(result.unknownIds, ["mystery-foam"]);
    close(result.totalAsm, 2.4);
  });

  it("treats negative inputs as zero", () => {
    const result = computeCleanser({
      batchGrams: -10,
      targetPh: null,
      surfactants: [{ id: "decyl-glucoside", percent: -5 }],
    });
    assert.equal(result.rows.length, 0);
    assert.equal(result.batchGrams, 0);
  });
});
