import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { OIL_DATABASE } from "../data/oils.ts";
import {
  AGENT_TOOLS,
  AGENT_API_VERSION,
  AgentToolFailure,
  callAgentTool,
  getOil,
  isAgentTool,
  listOils,
  normalizeBalmInput,
  normalizeCandleInput,
  normalizeEmulsionInput,
  normalizeSoapInput,
  runBalmCalculate,
  runCandleCalculate,
  runEmulsionCalculate,
  runSoapCalculate,
  SOAP_INPUT_SCHEMA,
} from "./agent-api.ts";
import { computeBalm } from "./balm-engine.ts";
import { computeCandle } from "./candle-engine.ts";
import { computeBatch } from "./calcEngine.ts";
import { computeEmulsion } from "./emulsion-engine.ts";
import { buildOpenApiSpec } from "./openapi.ts";
import { decodeRecipe, encodeRecipe } from "./recipe-url.ts";

function close(actual: number, expected: number, eps = 1e-6): void {
  assert.ok(
    Math.abs(actual - expected) < eps,
    `expected ${expected}, got ${actual}`,
  );
}

describe("normalizeSoapInput", () => {
  it("applies the bench defaults to an empty body", () => {
    const input = normalizeSoapInput({});
    assert.equal(input.unit, "g");
    assert.equal(input.superfatPercentage, 5);
    assert.deepEqual(input.lyeChoice, {
      naohRatio: 1,
      naohPurity: 1,
      kohPurity: 0.9,
    });
    assert.deepEqual(input.liquidConfig, { mode: "concentration", value: 33 });
    assert.deepEqual(input.oils, []);
  });

  it("passes a full body through untouched", () => {
    const input = normalizeSoapInput({
      unit: "oz",
      oils: [{ oilId: "olive", amount: 16 }],
      superfatPercentage: 8,
      lyeChoice: { naohRatio: 0.9, naohPurity: 0.97, kohPurity: 0.9 },
      liquidConfig: { mode: "ratio", value: 2 },
      additives: { fragranceGrams: 12, sodiumLactateGrams: 3 },
    });
    assert.equal(input.unit, "oz");
    assert.equal(input.oils[0]?.oilId, "olive");
    assert.equal(input.superfatPercentage, 8);
    assert.deepEqual(input.liquidConfig, { mode: "ratio", value: 2 });
  });

  it("decodes a share-link recipe string", () => {
    const config = normalizeSoapInput({
      oils: [{ oilId: "coconut-76", amount: 500 }],
      superfatPercentage: 6,
    });
    const encoded = encodeRecipe(config);
    const viaRecipe = normalizeSoapInput({ recipe: encoded });
    assert.deepEqual(viaRecipe, decodeRecipe(encoded));
  });
});

describe("runSoapCalculate", () => {
  it("matches a hand-computed NaOH batch (1000 g coconut-76, 0% superfat)", () => {
    // coconut-76 sap_naoh = 0.183 → 183 g NaOH at 0% superfat, purity 1.
    // 33% lye concentration → water = 183 × 67/33.
    const { result } = runSoapCalculate({
      oils: [{ oilId: "coconut-76", amount: 1000 }],
      superfatPercentage: 0,
      lyeChoice: { naohRatio: 1, naohPurity: 1, kohPurity: 1 },
      liquidConfig: { mode: "concentration", value: 33 },
    });
    close(result.totalOilWeight, 1000);
    close(result.dryLyeWeight.naoh, 183);
    close(result.dryLyeWeight.koh, 0);
    close(result.liquidWeight, (183 * 67) / 33);
    close(result.totalBatchWeight, 1000 + 183 + (183 * 67) / 33);
  });

  it("returns exactly what the engine returns for the same input", () => {
    const body = {
      oils: [
        { oilId: "coconut-76", amount: 340 },
        { oilId: "olive", amount: 330 },
        { oilId: "palm-rspo", amount: 330 },
      ],
      superfatPercentage: 5,
      liquidConfig: { mode: "concentration", value: 33 },
    };
    const { input, result } = runSoapCalculate(body);
    assert.deepEqual(result, computeBatch(input, OIL_DATABASE));
  });

  it("reports unknown oils as safety alerts instead of throwing", () => {
    const { result } = runSoapCalculate({
      oils: [{ oilId: "not-a-real-oil", amount: 100 }],
    });
    assert.ok(
      result.safetyAlerts.some((alert) => alert.startsWith("UNKNOWN_OIL")),
    );
    close(result.totalOilWeight, 0);
  });
});

describe("runBalmCalculate", () => {
  it("reproduces the engine test fixture (melt point 18.7 °C)", () => {
    const { input, result } = runBalmCalculate({
      batchGrams: 100,
      coolMethod: "fast",
      components: [
        { id: "beeswax-yellow", percent: 20 },
        { id: "shea-unrefined", percent: 30 },
        { id: "sweet-almond-balm", percent: 50 },
      ],
    });
    close(result.estimatedMeltPointC, 18.7);
    close(result.waxPercent, 20);
    close(result.butterPercent, 30);
    close(result.liquidOilPercent, 50);
    assert.deepEqual(result, computeBalm(input));
  });

  it("defaults scalars to the bench defaults", () => {
    assert.deepEqual(normalizeBalmInput({}), {
      batchGrams: 100,
      coolMethod: "fast",
      components: [],
    });
  });
});

describe("runEmulsionCalculate", () => {
  it("matches the engine for the bench-default formula", () => {
    const { input, result } = runEmulsionCalculate({
      batchGrams: 100,
      oilPhasePercent: 20,
      evaporationPercent: 10,
      oils: [
        { id: "sweet-almond-hlb", percent: 70 },
        { id: "shea-hlb", percent: 30 },
      ],
      emulsifiers: [{ id: "glyceryl-stearate-peg100", percent: 4 }],
      preservativeId: "germaben-ii",
      preservativePercent: 1,
    });
    assert.deepEqual(result, computeEmulsion(input));
    assert.ok(result.requiredHlb !== null);
    assert.ok(result.blendHlb !== null);
  });

  it("defaults preservativeId to null", () => {
    const input = normalizeEmulsionInput({});
    assert.equal(input.preservativeId, null);
    assert.equal(input.batchGrams, 100);
    assert.equal(input.oilPhasePercent, 20);
    assert.equal(input.evaporationPercent, 10);
  });
});

describe("runCandleCalculate", () => {
  it("matches the engine and prints the load both ways", () => {
    const { input, result } = runCandleCalculate({
      waterMassGramsPerVessel: 240,
      vesselCount: 4,
      waxId: "soy-container-seed",
      headspacePercent: 10,
      wastePercent: 3,
      foBasis: "wax",
      foLoadPercent: 8,
    });
    assert.deepEqual(result, computeCandle(input));
    close(result.foPercentOfWax, 8);
    // 8% of wax = 8/108 of the finished candle.
    close(result.foPercentOfFinished, (8 / 108) * 100);
  });

  it("defaults to the bench defaults", () => {
    const input = normalizeCandleInput({});
    assert.equal(input.waterMassGramsPerVessel, 240);
    assert.equal(input.vesselCount, 4);
    assert.equal(input.waxId, "soy-container-seed");
    assert.equal(input.foBasis, "wax");
    assert.equal(input.foLoadPercent, 8);
  });
});

describe("oils endpoints", () => {
  it("lists the full library", () => {
    const { oils } = listOils();
    assert.equal(oils.length, OIL_DATABASE.length);
    assert.ok(oils.length >= 20);
  });

  it("resolves by slug, id, and alias; null for unknown", () => {
    assert.equal(getOil("coconut-oil-76")?.id, "coconut-76");
    assert.equal(getOil("coconut-76")?.slug, "coconut-oil-76");
    assert.equal(getOil("coconut")?.id, "coconut-76");
    assert.equal(getOil("definitely-not-an-oil"), null);
  });
});

describe("callAgentTool", () => {
  it("exposes exactly the six public tools — no label tool", () => {
    assert.deepEqual(
      AGENT_TOOLS.map((tool) => tool.name),
      [
        "soap_calculate",
        "balm_calculate",
        "emulsion_calculate",
        "candle_calculate",
        "oils_list",
        "oil_get",
      ],
    );
    assert.equal(isAgentTool("soap_calculate"), true);
    assert.equal(isAgentTool("label_generate"), false);
  });

  it("dispatches to the same runners as REST", () => {
    const body = { oils: [{ oilId: "olive", amount: 500 }] };
    assert.deepEqual(callAgentTool("soap_calculate", body), runSoapCalculate(body));
    assert.deepEqual(
      callAgentTool("balm_calculate", {}),
      runBalmCalculate({}),
    );
  });

  it("fails oil_get cleanly for a bad slug", () => {
    assert.throws(
      () => callAgentTool("oil_get", { slug: "nope" }),
      AgentToolFailure,
    );
    assert.throws(() => callAgentTool("oil_get", {}), AgentToolFailure);
  });
});

describe("manifest parity (public/mcp-tools.json)", () => {
  const manifest = JSON.parse(
    readFileSync(
      new URL("../../public/mcp-tools.json", import.meta.url),
      "utf8",
    ),
  ) as {
    api_base: string;
    mcp_endpoint: string;
    version: string;
    tools: unknown;
  };

  it("matches AGENT_TOOLS exactly", () => {
    assert.deepEqual(manifest.tools, AGENT_TOOLS);
    assert.equal(manifest.api_base, "https://saponis.app/api");
    assert.equal(manifest.mcp_endpoint, "https://saponis.app/mcp");
    assert.equal(manifest.version, AGENT_API_VERSION);
  });
});

describe("OpenAPI parity", () => {
  const spec = buildOpenApiSpec() as {
    openapi: string;
    paths: Record<string, Record<string, { requestBody?: unknown }>>;
  };

  it("is OpenAPI 3.x and covers every endpoint", () => {
    assert.ok(spec.openapi.startsWith("3."));
    for (const path of [
      "/api/soap/calculate",
      "/api/balm/calculate",
      "/api/emulsion/calculate",
      "/api/candle/calculate",
      "/api/oils",
      "/api/oils/{slug}",
      "/mcp",
    ]) {
      assert.ok(spec.paths[path], `missing path ${path}`);
    }
  });

  it("reuses the shared input schemas", () => {
    const soapPost = spec.paths["/api/soap/calculate"]?.post as {
      requestBody: {
        content: { "application/json": { schema: unknown } };
      };
    };
    assert.deepEqual(
      soapPost.requestBody.content["application/json"].schema,
      SOAP_INPUT_SCHEMA,
    );
  });
});
