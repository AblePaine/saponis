import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decodeBalmState,
  decodeCandleState,
  decodeEmulsionState,
  encodeBalmState,
  encodeCandleState,
  encodeEmulsionState,
  readBenchEncoded,
  type BalmUrlState,
  type CandleUrlState,
  type EmulsionUrlState,
} from "./bench-url.ts";

describe("readBenchEncoded", () => {
  it("extracts the r parameter", () => {
    assert.equal(readBenchEncoded("?r=100|f|a:1&x=2"), "100|f|a:1");
    assert.equal(readBenchEncoded("?x=2"), null);
    assert.equal(readBenchEncoded(""), null);
    assert.equal(readBenchEncoded("?r="), null);
  });
});

describe("balm share links", () => {
  const state: BalmUrlState = {
    batchGrams: 250,
    coolMethod: "slow",
    percents: {
      "beeswax-yellow": 25,
      "shea-unrefined": 37.5,
      "mct-balm": 37.5,
    },
  };

  it("round-trips", () => {
    assert.deepEqual(decodeBalmState(encodeBalmState(state)), state);
  });

  it("uses the compact pipe format", () => {
    assert.equal(
      encodeBalmState(state),
      "250|s|beeswax-yellow:25,shea-unrefined:37.5,mct-balm:37.5",
    );
  });

  it("drops zero-percent components and rejects short strings", () => {
    const encoded = encodeBalmState({
      batchGrams: 100,
      coolMethod: "fast",
      percents: { "beeswax-yellow": 0, "soy-wax": 40 },
    });
    assert.equal(encoded, "100|f|soy-wax:40");
    assert.equal(decodeBalmState(null), null);
    assert.equal(decodeBalmState(""), null);
    assert.equal(decodeBalmState("100|f"), null);
  });

  it("clamps out-of-range batch sizes", () => {
    const decoded = decodeBalmState("999999999|f|soy-wax:40");
    assert.equal(decoded?.batchGrams, 100_000);
  });
});

describe("emulsion share links", () => {
  const state: EmulsionUrlState = {
    batchGrams: 200,
    oilPhasePercent: 25,
    evaporationPercent: 12,
    oilPercents: { "sweet-almond-hlb": 60, "shea-hlb": 40 },
    emulsifierPercents: { "glyceryl-stearate-peg100": 5 },
    preservativeId: "optiphen",
    preservativePercent: 0.75,
  };

  it("round-trips", () => {
    assert.deepEqual(decodeEmulsionState(encodeEmulsionState(state)), state);
  });

  it("round-trips a missing preservative as '-'", () => {
    const none: EmulsionUrlState = { ...state, preservativeId: "", preservativePercent: 0 };
    const encoded = encodeEmulsionState(none);
    assert.ok(encoded.split("|")[5] === "-");
    assert.deepEqual(decodeEmulsionState(encoded), none);
  });

  it("rejects short strings and clamps evaporation to the engine range", () => {
    assert.equal(decodeEmulsionState("1|2|3"), null);
    const decoded = decodeEmulsionState("100|20|99||||1");
    assert.equal(decoded?.evaporationPercent, 30);
  });
});

describe("candle share links", () => {
  const state: CandleUrlState = {
    waterGrams: 226.8,
    vesselCount: 6,
    waxId: "coconut-soy-blend-seed",
    customSg: 0.86,
    headspacePercent: 12,
    wastePercent: 5,
    foBasis: "finished",
    foLoadPercent: 6.5,
    maxFoPercent: 10,
    ifraCapPercent: 4.4,
  };

  it("round-trips", () => {
    assert.deepEqual(decodeCandleState(encodeCandleState(state)), state);
  });

  it("uses the compact pipe format", () => {
    assert.equal(
      encodeCandleState(state),
      "226.8|6|coconut-soy-blend-seed|0.86|12|5|f|6.5|10|4.4",
    );
  });

  it("rejects short strings and defaults an unknown basis to wax", () => {
    assert.equal(decodeCandleState("1|2|3"), null);
    const decoded = decodeCandleState("240|4|soy-container-seed|0|10|3|x|8|0|0");
    assert.equal(decoded?.foBasis, "wax");
    assert.equal(decoded?.waxId, "soy-container-seed");
  });
});
