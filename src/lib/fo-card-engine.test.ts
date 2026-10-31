import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeFoCard } from "./fo-card-engine.ts";

const EPS = 1e-9;

function close(actual: number, expected: number, eps = 1e-6): void {
  assert.ok(
    Math.abs(actual - expected) < eps,
    `expected ${expected}, got ${actual} (Δ ${Math.abs(actual - expected)})`,
  );
}

describe("computeFoCard", () => {
  it("splits a candle batch on finished weight and prints the load both ways", () => {
    const result = computeFoCard({
      foName: "Cedar & Smoke",
      formats: [
        { format: "candle", finishedGrams: 1000, desiredLoadPercent: 8 },
      ],
    });
    const row = result.rows[0];
    assert.ok(row);
    assert.equal(result.foName, "Cedar & Smoke");
    close(row.fragranceGrams, 80, EPS);
    close(row.baseGrams, 920, EPS);
    close(row.loadPercentOfWax ?? -1, (8 / 92) * 100);
    close(result.totalFragranceGrams, 80, EPS);
  });

  it("the IFRA cap binds below a converted wax-hold cap", () => {
    const result = computeFoCard({
      formats: [
        {
          format: "candle",
          finishedGrams: 1000,
          desiredLoadPercent: 8,
          ifraCapPercent: 5,
          waxHoldPercentOfWax: 10,
        },
      ],
    });
    const row = result.rows[0];
    assert.ok(row);
    // Wax hold 10% of wax = 9.09% of finished; IFRA 5% is tighter.
    assert.equal(row.bindingCapSource, "ifra");
    close(row.bindingCapPercent ?? -1, 5, EPS);
    close(row.maxFragranceGrams ?? -1, 50, EPS);
    assert.equal(row.overCap, true);
    assert.ok(row.warnings.some((w) => w.includes("over the binding cap")));
  });

  it("the wax-hold cap binds when it converts tighter than IFRA", () => {
    const result = computeFoCard({
      formats: [
        {
          format: "melt",
          finishedGrams: 500,
          desiredLoadPercent: 10,
          ifraCapPercent: 20,
          waxHoldPercentOfWax: 10,
        },
      ],
    });
    const row = result.rows[0];
    assert.ok(row);
    assert.equal(row.bindingCapSource, "wax-hold");
    close(row.bindingCapPercent ?? -1, (10 / 110) * 100);
    assert.equal(row.overCap, true);
  });

  it("soap gets no wax-basis conversion and no invented cap", () => {
    const result = computeFoCard({
      formats: [{ format: "soap", finishedGrams: 500, desiredLoadPercent: 3 }],
    });
    const row = result.rows[0];
    assert.ok(row);
    close(row.fragranceGrams, 15, EPS);
    close(row.baseGrams, 485, EPS);
    assert.equal(row.loadPercentOfWax, null);
    assert.equal(row.bindingCapPercent, null);
    assert.equal(row.maxFragranceGrams, null);
    assert.equal(row.overCap, false);
    assert.ok(row.warnings.some((w) => w.includes("No cap entered")));
  });

  it("diffuser splits finished mass into oil and carrier", () => {
    const result = computeFoCard({
      formats: [
        { format: "diffuser", finishedGrams: 100, desiredLoadPercent: 20 },
      ],
    });
    const row = result.rows[0];
    assert.ok(row);
    close(row.fragranceGrams, 20, EPS);
    close(row.baseGrams, 80, EPS);
    assert.equal(row.loadPercentOfWax, null);
  });

  it("differing caps across formats trigger the cross-format warning", () => {
    const result = computeFoCard({
      formats: [
        {
          format: "candle",
          finishedGrams: 1000,
          desiredLoadPercent: 8,
          ifraCapPercent: 50,
        },
        {
          format: "soap",
          finishedGrams: 500,
          desiredLoadPercent: 3,
          ifraCapPercent: 3,
        },
      ],
    });
    assert.ok(
      result.warnings.some((w) => w.includes("differ by format")),
      "expected the cross-format warning",
    );
    close(result.totalFragranceGrams, 95, EPS);
  });

  it("dedupes repeated formats and handles an empty card", () => {
    const dup = computeFoCard({
      formats: [
        { format: "candle", finishedGrams: 100, desiredLoadPercent: 5 },
        { format: "candle", finishedGrams: 200, desiredLoadPercent: 6 },
      ],
    });
    assert.equal(dup.rows.length, 1);
    close(dup.rows[0]?.finishedGrams ?? -1, 100, EPS);

    const empty = computeFoCard({ formats: [] });
    assert.equal(empty.rows.length, 0);
    assert.ok(empty.warnings.some((w) => w.includes("No formats selected")));
  });
});
