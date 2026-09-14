import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { computeBatch } from "./calcEngine.ts";
import {
  DANGER_UNSATURATED_SOLUTION,
  WARNING_EXCESS_WATER,
  WARNING_STRIPPING_BAR,
  type MasterOilRecord,
  type RecipeConfig,
} from "../types/soap.ts";

const dir = dirname(fileURLToPath(import.meta.url));
const OIL_DATABASE = JSON.parse(
  readFileSync(join(dir, "../data/oils.json"), "utf8"),
) as MasterOilRecord[];

const EPS = 1e-9;

function close(actual: number, expected: number, eps = EPS): void {
  assert.ok(
    Math.abs(actual - expected) < eps,
    `expected ${expected}, got ${actual} (Δ ${Math.abs(actual - expected)})`,
  );
}

function coconut(): MasterOilRecord {
  const oil = OIL_DATABASE.find((o) => o.id === "coconut-76");
  assert.ok(oil);
  return oil;
}

function oil(id: string): MasterOilRecord {
  const found = OIL_DATABASE.find((o) => o.id === id);
  assert.ok(found, `missing oil ${id}`);
  return found;
}

function baseConfig(overrides: Partial<RecipeConfig> = {}): RecipeConfig {
  return {
    unit: "g",
    oils: [{ oilId: "coconut-76", amount: 1000 }],
    superfatPercentage: 0,
    liquidConfig: { mode: "concentration", value: 33 },
    lyeChoice: { naohRatio: 1, naohPurity: 1, kohPurity: 1 },
    ...overrides,
  };
}

describe("oils.json seed dataset", () => {
  it("contains complete contracts for every oil", () => {
    const ids = OIL_DATABASE.map((o) => o.id);
    for (const required of [
      "coconut-76",
      "olive",
      "palm-rspo",
      "castor",
      "shea-unrefined",
      "babassu",
      "tallow",
    ]) {
      assert.ok(ids.includes(required), `missing ${required}`);
    }
    const slugs = OIL_DATABASE.map((o) => o.slug);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(new Set(slugs).size, slugs.length);
    assert.ok(OIL_DATABASE.length >= 10);
    for (const record of OIL_DATABASE) {
      assert.equal(typeof record.name, "string");
      assert.equal(typeof record.slug, "string");
      assert.equal(typeof record.common_botanical_name, "string");
      assert.ok(record.sap_naoh > 0 && record.sap_naoh < 1);
      assert.ok(record.sap_koh > record.sap_naoh);
      assert.ok(record.iodine >= 0);
      assert.ok(Number.isFinite(record.ins));
      for (const key of [
        "lauric",
        "myristic",
        "palmitic",
        "stearic",
        "ricinoleic",
        "oleic",
        "linoleic",
        "linolenic",
      ] as const) {
        assert.ok(
          Number.isFinite(record.fatty_acids[key]),
          `${record.id}.${key}`,
        );
      }
      assert.ok(["hard", "soft", "brittle"].includes(record.hardness_profile));
      assert.ok(
        ["accelerates", "neutral", "slows"].includes(record.trace_speed_impact),
      );
      assert.ok(record.inci_names.standard);
      assert.ok(record.inci_names.saponified_naoh);
      assert.ok(record.inci_names.saponified_koh);
    }
  });
});

describe("computeBatch stoichiometry", () => {
  it("computes pure NaOH as Σ(oil × sap_naoh) × naohRatio", () => {
    const result = computeBatch(baseConfig(), OIL_DATABASE);
    close(result.dryLyeWeight.naoh, 1000 * coconut().sap_naoh);
    close(result.dryLyeWeight.koh, 0);
    close(result.dryLyeWeight.total, result.dryLyeWeight.naoh);
    close(result.totalOilWeight, 1000);
  });

  it("applies the superfat discount before purity", () => {
    const result = computeBatch(
      baseConfig({ superfatPercentage: 5 }),
      OIL_DATABASE,
    );
    close(result.dryLyeWeight.naoh, 1000 * coconut().sap_naoh * 0.95);
  });

  it("divides discounted alkali by reagent purity", () => {
    const result = computeBatch(
      baseConfig({
        superfatPercentage: 5,
        lyeChoice: { naohRatio: 1, naohPurity: 0.99, kohPurity: 0.9 },
      }),
      OIL_DATABASE,
    );
    close(result.dryLyeWeight.naoh, (1000 * coconut().sap_naoh * 0.95) / 0.99);
  });

  it("splits dual-lye demand across NaOH and KOH SAP values", () => {
    const result = computeBatch(
      baseConfig({
        lyeChoice: { naohRatio: 0.5, naohPurity: 1, kohPurity: 1 },
      }),
      OIL_DATABASE,
    );
    close(result.dryLyeWeight.naoh, 1000 * coconut().sap_naoh * 0.5);
    close(result.dryLyeWeight.koh, 1000 * coconut().sap_koh * 0.5);
    close(
      result.dryLyeWeight.total,
      result.dryLyeWeight.naoh + result.dryLyeWeight.koh,
    );
  });

  it("uses KOH SAP exclusively when naohRatio is 0", () => {
    const result = computeBatch(
      baseConfig({
        lyeChoice: { naohRatio: 0, naohPurity: 1, kohPurity: 0.9 },
      }),
      OIL_DATABASE,
    );
    close(result.dryLyeWeight.naoh, 0);
    close(result.dryLyeWeight.koh, (1000 * coconut().sap_koh) / 0.9);
  });
});

describe("computeBatch liquid modes", () => {
  it("concentration: Liquid = TotalLye / (value/100) − TotalLye", () => {
    const result = computeBatch(baseConfig(), OIL_DATABASE);
    const lye = 1000 * coconut().sap_naoh;
    close(result.liquidWeight, lye / 0.33 - lye);
    close(result.lyeConcentrationPercent, 33);
  });

  it("ratio: Liquid = TotalLye × value", () => {
    const result = computeBatch(
      baseConfig({ liquidConfig: { mode: "ratio", value: 2.2 } }),
      OIL_DATABASE,
    );
    const lye = 1000 * coconut().sap_naoh;
    close(result.liquidWeight, lye * 2.2);
    close(result.waterToLyeRatio, 2.2);
  });

  it("water_percent_oils: Liquid = TotalOils × (value/100)", () => {
    const result = computeBatch(
      baseConfig({
        liquidConfig: { mode: "water_percent_oils", value: 38 },
      }),
      OIL_DATABASE,
    );
    close(result.liquidWeight, 380);
    close(result.waterAsPercentOils, 38);
  });
});

describe("computeBatch quality metrics", () => {
  it("derives scores from a single-oil fatty acid profile", () => {
    const fa = coconut().fatty_acids;
    const result = computeBatch(baseConfig(), OIL_DATABASE);
    close(result.fattyAcids.lauric, fa.lauric);
    close(result.qualityScores.hardness, fa.lauric + fa.myristic + fa.palmitic + fa.stearic);
    close(result.qualityScores.cleansing, fa.lauric + fa.myristic);
    close(
      result.qualityScores.conditioning,
      fa.oleic + fa.linoleic + fa.linolenic + fa.ricinoleic,
    );
    close(result.qualityScores.bubbly, fa.lauric + fa.myristic + fa.ricinoleic);
    close(result.qualityScores.creamy, fa.palmitic + fa.stearic + fa.ricinoleic);
    close(result.qualityScores.longevity, fa.palmitic + fa.stearic);
    close(result.qualityScores.iodine, coconut().iodine);
    close(result.qualityScores.ins, coconut().ins);
  });

  it("weight-averages fatty acids, iodine, and INS across a blend", () => {
    const result = computeBatch(
      baseConfig({
        oils: [
          { oilId: "coconut-76", amount: 250 },
          { oilId: "olive", amount: 400 },
          { oilId: "palm-rspo", amount: 250 },
          { oilId: "castor", amount: 50 },
          { oilId: "shea-unrefined", amount: 50 },
        ],
      }),
      OIL_DATABASE,
    );

    const weights: [MasterOilRecord, number][] = [
      [oil("coconut-76"), 0.25],
      [oil("olive"), 0.4],
      [oil("palm-rspo"), 0.25],
      [oil("castor"), 0.05],
      [oil("shea-unrefined"), 0.05],
    ];

    let expectedLauric = 0;
    let expectedIodine = 0;
    let expectedIns = 0;
    let expectedNaoh = 0;
    for (const [record, w] of weights) {
      expectedLauric += record.fatty_acids.lauric * w;
      expectedIodine += record.iodine * w;
      expectedIns += record.ins * w;
      expectedNaoh += 1000 * w * record.sap_naoh;
    }

    close(result.totalOilWeight, 1000);
    close(result.fattyAcids.lauric, expectedLauric);
    close(result.qualityScores.iodine, expectedIodine);
    close(result.qualityScores.ins, expectedIns);
    close(result.dryLyeWeight.naoh, expectedNaoh);
    close(
      result.qualityScores.cleansing,
      result.fattyAcids.lauric + result.fattyAcids.myristic,
    );
  });
});

describe("computeBatch safety alerts", () => {
  it("flags unsaturated (over-concentrated) lye solutions", () => {
    const result = computeBatch(
      baseConfig({ liquidConfig: { mode: "concentration", value: 45 } }),
      OIL_DATABASE,
    );
    assert.ok(result.lyeConcentrationPercent > 40);
    assert.ok(result.safetyAlerts.includes(DANGER_UNSATURATED_SOLUTION));
  });

  it("flags excess water below 25% lye concentration", () => {
    const result = computeBatch(
      baseConfig({ liquidConfig: { mode: "concentration", value: 20 } }),
      OIL_DATABASE,
    );
    assert.ok(result.lyeConcentrationPercent < 25);
    assert.ok(result.safetyAlerts.includes(WARNING_EXCESS_WATER));
  });

  it("flags a stripping bar when cleansing > 22 and superfat < 6", () => {
    const result = computeBatch(
      baseConfig({ superfatPercentage: 5 }),
      OIL_DATABASE,
    );
    assert.ok(result.qualityScores.cleansing > 22);
    assert.ok(result.safetyAlerts.includes(WARNING_STRIPPING_BAR));
  });

  it("does not flag stripping when superfat is at least 6%", () => {
    const result = computeBatch(
      baseConfig({ superfatPercentage: 6 }),
      OIL_DATABASE,
    );
    assert.equal(
      result.safetyAlerts.includes(WARNING_STRIPPING_BAR),
      false,
    );
  });

  it("emits no concentration alerts for an empty recipe", () => {
    const result = computeBatch(baseConfig({ oils: [] }), OIL_DATABASE);
    assert.equal(result.totalOilWeight, 0);
    assert.equal(result.dryLyeWeight.total, 0);
    assert.equal(result.liquidWeight, 0);
    assert.equal(result.safetyAlerts.length, 0);
    assert.ok(Number.isFinite(result.lyeConcentrationPercent));
    assert.ok(Number.isFinite(result.waterToLyeRatio));
  });

  it("records unknown oil ids without throwing", () => {
    const result = computeBatch(
      baseConfig({
        oils: [
          { oilId: "ghost-tallow", amount: 100 },
          { oilId: "coconut-76", amount: 100 },
        ],
      }),
      OIL_DATABASE,
    );
    assert.equal(result.totalOilWeight, 100);
    assert.ok(
      result.safetyAlerts.some((alert) => alert.startsWith("UNKNOWN_OIL")),
    );
  });
});

describe("computeBatch batch weight", () => {
  it("includes fragrance and sodium lactate in the total", () => {
    const result = computeBatch(
      baseConfig({
        additives: { fragranceGrams: 30, sodiumLactateGrams: 20 },
      }),
      OIL_DATABASE,
    );
    close(
      result.totalBatchWeight,
      result.totalOilWeight +
        result.dryLyeWeight.total +
        result.liquidWeight +
        30 +
        20,
    );
  });
});
