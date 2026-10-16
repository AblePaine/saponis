import {
  AGENT_TOOLS,
  AGENT_API_VERSION,
  BALM_INPUT_SCHEMA,
  CANDLE_INPUT_SCHEMA,
  EMULSION_INPUT_SCHEMA,
  SOAP_INPUT_SCHEMA,
  type JsonSchema,
} from "./agent-api.ts";
import { SITE_ORIGIN } from "./site.ts";

/**
 * OpenAPI 3.0 document for the Saponis agent API, served at /openapi.json.
 * Request schemas are the same constants the MCP tools and the public
 * manifest use (imported from agent-api.ts), so the three surfaces cannot
 * drift apart.
 */

const ERROR_SCHEMA: JsonSchema = {
  type: "object",
  properties: { error: { type: "string" } },
  required: ["error"],
};

function envelopeSchema(inputSchema: JsonSchema, resultDescription: string): JsonSchema {
  return {
    type: "object",
    properties: {
      input: {
        ...inputSchema,
        description:
          "The normalized engine input — the request with every default applied, exactly as the engine consumed it.",
      },
      result: { type: "object", description: resultDescription },
    },
    required: ["input", "result"],
  };
}

function calculateOperation(
  toolName: string,
  inputSchema: JsonSchema,
  resultDescription: string,
) {
  const tool = AGENT_TOOLS.find((t) => t.name === toolName);
  return {
    operationId: toolName,
    summary: tool?.description ?? toolName,
    requestBody: {
      required: false,
      description:
        "Every field is optional; omitted fields fall back to the bench defaults shown in the schema.",
      content: {
        "application/json": {
          schema: inputSchema,
          ...(tool?.http.example_body
            ? { example: tool.http.example_body }
            : {}),
        },
      },
    },
    responses: {
      "200": {
        description: "The normalized input and the engine's full result.",
        content: {
          "application/json": {
            schema: envelopeSchema(inputSchema, resultDescription),
          },
        },
      },
      "400": {
        description: "The request body was not valid JSON.",
        content: { "application/json": { schema: ERROR_SCHEMA } },
      },
    },
  };
}

const OIL_RECORD_SCHEMA: JsonSchema = {
  type: "object",
  description: "One record from the Saponis oil library.",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    slug: { type: "string" },
    common_botanical_name: { type: "string" },
    sap_naoh: { type: "number" },
    sap_koh: { type: "number" },
    iodine: { type: "number" },
    ins: { type: "number" },
    fatty_acids: {
      type: "object",
      description: "Fatty-acid profile, percent by weight.",
      properties: {
        lauric: { type: "number" },
        myristic: { type: "number" },
        palmitic: { type: "number" },
        stearic: { type: "number" },
        ricinoleic: { type: "number" },
        oleic: { type: "number" },
        linoleic: { type: "number" },
        linolenic: { type: "number" },
      },
    },
    recommended_max_percentage: { type: "number" },
    hardness_profile: {
      type: "string",
      enum: ["soft", "hard", "brittle"],
    },
    trace_speed_impact: {
      type: "string",
      enum: ["accelerates", "neutral", "slows"],
    },
    inci_names: {
      type: "object",
      properties: {
        standard: { type: "string" },
        saponified_naoh: { type: "string" },
        saponified_koh: { type: "string" },
      },
    },
    aliases: { type: "array", items: { type: "string" } },
    workhorse: { type: "boolean" },
  },
};

export function buildOpenApiSpec(): Record<string, unknown> {
  return {
    openapi: "3.0.3",
    info: {
      title: "Saponis Agent API",
      version: AGENT_API_VERSION,
      description:
        "Programmatic access to the Saponis formulation engines — soap batches, balms, emulsions, and candles — plus the oil library. The same math as the public benches at saponis.app. No authentication. A stateless MCP endpoint exposing the same tools lives at /mcp; a JSON tool manifest at /mcp-tools.json. Label generation is a Saponis Pro feature and is not part of this API.",
      contact: { email: "contact@saponis.app", url: SITE_ORIGIN },
    },
    servers: [{ url: SITE_ORIGIN }],
    paths: {
      "/api/soap/calculate": {
        post: calculateOperation(
          "soap_calculate",
          SOAP_INPUT_SCHEMA,
          "Batch result: totalOilWeight, dryLyeWeight { naoh, koh, total }, liquidWeight, totalBatchWeight, lyeConcentrationPercent, waterToLyeRatio, waterAsPercentOils, fattyAcids, qualityScores (hardness, cleansing, conditioning, bubbly, creamy, longevity, iodine, ins), safetyAlerts.",
        ),
        get: {
          operationId: "soap_calculate_from_share_link",
          summary:
            "Calculate a soap batch from a Saponis share-link recipe string.",
          parameters: [
            {
              name: "r",
              in: "query",
              required: true,
              description:
                "The recipe string from a /soap share link (the value of its `r` query parameter).",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "The normalized input and the engine's full result.",
              content: {
                "application/json": {
                  schema: envelopeSchema(
                    SOAP_INPUT_SCHEMA,
                    "Same result shape as the POST endpoint.",
                  ),
                },
              },
            },
            "400": {
              description: "Missing or invalid `r` parameter.",
              content: { "application/json": { schema: ERROR_SCHEMA } },
            },
          },
        },
      },
      "/api/balm/calculate": {
        post: calculateOperation(
          "balm_calculate",
          BALM_INPUT_SCHEMA,
          "Balm result: rows (per-component normalized % and grams), waxPercent, butterPercent, liquidOilPercent, estimatedMeltPointC, estimatedMeltPointF, firmness, graininessRisk, warnings, unknownIds.",
        ),
      },
      "/api/emulsion/calculate": {
        post: calculateOperation(
          "emulsion_calculate",
          EMULSION_INPUT_SCHEMA,
          "Emulsion result: oilPhasePercent, emulsifierPercent, preservativePercent, waterPercent, requiredHlb, blendHlb, hlbGap, hlbVerdict, preservativeVerdict, preservativeMaxPercent, oilRows, emulsifierRows, waterGrams, makeupWaterGrams, warnings, unknownIds.",
        ),
      },
      "/api/candle/calculate": {
        post: calculateOperation(
          "candle_calculate",
          CANDLE_INPUT_SCHEMA,
          "Candle result: specificGravity, usingCustomSg, fillVolumeMlPerVessel, finishedPerVesselGrams, waxPerVesselGrams, fragrancePerVesselGrams, finishedTotalGrams, waxToMeltGrams, fragranceToWeighGrams, foBasis, foPercentOfWax, foPercentOfFinished, overMaxFo, overIfraCap, warnings.",
        ),
      },
      "/api/oils": {
        get: {
          operationId: "oils_list",
          summary: AGENT_TOOLS.find((t) => t.name === "oils_list")?.description,
          responses: {
            "200": {
              description: "The full oil library.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      oils: {
                        type: "array",
                        items: OIL_RECORD_SCHEMA,
                      },
                    },
                    required: ["oils"],
                  },
                },
              },
            },
          },
        },
      },
      "/api/oils/{slug}": {
        get: {
          operationId: "oil_get",
          summary: AGENT_TOOLS.find((t) => t.name === "oil_get")?.description,
          parameters: [
            {
              name: "slug",
              in: "path",
              required: true,
              description:
                "Oil slug (the id and listed aliases also resolve) — e.g. coconut-oil-76.",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "The oil record.",
              content: {
                "application/json": { schema: OIL_RECORD_SCHEMA },
              },
            },
            "404": {
              description: "No oil matches the given slug.",
              content: { "application/json": { schema: ERROR_SCHEMA } },
            },
          },
        },
      },
      "/mcp": {
        post: {
          operationId: "mcp",
          summary:
            "Stateless MCP endpoint (streamable HTTP, JSON-RPC 2.0, JSON responses). Supports initialize, ping, tools/list, and tools/call for all six tools in this document. Send notifications without an id to receive HTTP 202. GET returns 405.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  description:
                    "A JSON-RPC 2.0 message, or an array of messages (batch).",
                  properties: {
                    jsonrpc: { type: "string", enum: ["2.0"] },
                    id: { type: ["string", "number"] },
                    method: {
                      type: "string",
                      enum: ["initialize", "ping", "tools/list", "tools/call"],
                    },
                    params: { type: "object" },
                  },
                  required: ["jsonrpc", "method"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "The JSON-RPC response (or array of responses for a batch).",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      jsonrpc: { type: "string" },
                      id: { type: ["string", "number", "null"] },
                      result: { type: "object" },
                      error: {
                        type: "object",
                        properties: {
                          code: { type: "integer" },
                          message: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            "202": {
              description: "Notification accepted; no response body.",
            },
            "400": {
              description: "Parse error (-32700).",
            },
          },
        },
      },
    },
  };
}
