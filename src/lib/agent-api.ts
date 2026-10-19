import { getOilBySlug, OIL_DATABASE } from "../data/oils.ts";
import type {
  BatchResult,
  MasterOilRecord,
  RecipeConfig,
} from "../types/soap.ts";
import {
  computeBalm,
  type BalmInput,
  type BalmResult,
  type CoolMethod,
} from "./balm-engine.ts";
import {
  computeCandle,
  type CandleInput,
  type CandleResult,
  type FoBasis,
} from "./candle-engine.ts";
import { computeBatch } from "./calcEngine.ts";
import {
  computeEmulsion,
  type EmulsionInput,
  type EmulsionResult,
} from "./emulsion-engine.ts";
import {
  DEFAULT_COST_INPUT,
  DEFAULT_MOLD_FILL,
  computeCost,
  computeMoldFill,
  type CostInput,
  type CostResult,
  type CostRow,
  type MoldFillInput,
  type MoldFillResult,
} from "./costing-engine.ts";
import { decodeRecipe } from "./recipe-url.ts";

/**
 * Agent API core — the shared layer behind the public REST endpoints
 * (src/routes/api/*.calculate.ts, /api/oils), the stateless MCP endpoint
 * (/mcp), the tool manifest (public/mcp-tools.json) and the OpenAPI spec
 * (/openapi.json). Every surface calls the same engine functions with the
 * same normalized inputs, so an agent gets exactly the numbers the benches
 * show a human.
 *
 * Deliberately NOT exposed: the label engine (src/lib/label-engine.ts) —
 * label output is the planned Saponis Pro feature — the wholesale pricing
 * engine (src/lib/wholesale-engine.ts, the costing suite's Pro piece),
 * and the /app Pro bench.
 */

export const AGENT_API_VERSION = "1.0.0";
export const MCP_SERVER_INFO = {
  name: "saponis",
  version: AGENT_API_VERSION,
} as const;

/* ------------------------------------------------------------------ */
/* Input hygiene                                                       */
/* ------------------------------------------------------------------ */

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function num(value: unknown, fallback: number): number {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(n) ? n : fallback;
}

function idPercentList(
  value: unknown,
): { id: string; percent: number }[] {
  if (!Array.isArray(value)) return [];
  const rows: { id: string; percent: number }[] = [];
  for (const item of value) {
    const row = asRecord(item);
    if (typeof row.id !== "string" || row.id.length === 0) continue;
    rows.push({ id: row.id, percent: num(row.percent, 0) });
  }
  return rows;
}

/* ------------------------------------------------------------------ */
/* Normalizers — partial agent input → full engine input.             */
/* Defaults are the benches' own defaults, so API and UI agree.        */
/* ------------------------------------------------------------------ */

export function normalizeSoapInput(raw: unknown): RecipeConfig {
  const body = asRecord(raw);
  // A share-link recipe string (the `r` value from a /soap URL) is a
  // first-class input — it decodes through the site's own decoder,
  // safety clamps included.
  if (typeof body.recipe === "string") {
    const decoded = decodeRecipe(body.recipe);
    if (decoded) return decoded;
  }
  const lye = asRecord(body.lyeChoice);
  const liquid = asRecord(body.liquidConfig);
  const additives = asRecord(body.additives);
  const oilsRaw = Array.isArray(body.oils) ? body.oils : [];
  const oils: RecipeConfig["oils"] = [];
  for (const item of oilsRaw) {
    const row = asRecord(item);
    if (typeof row.oilId !== "string" || row.oilId.length === 0) continue;
    oils.push({ oilId: row.oilId, amount: num(row.amount, 0) });
  }
  return {
    unit: body.unit === "oz" ? "oz" : "g",
    oils,
    superfatPercentage: num(body.superfatPercentage, 5),
    lyeChoice: {
      naohRatio: num(lye.naohRatio, 1),
      naohPurity: num(lye.naohPurity, 1),
      kohPurity: num(lye.kohPurity, 0.9),
    },
    liquidConfig: {
      mode:
        liquid.mode === "ratio" || liquid.mode === "water_percent_oils"
          ? liquid.mode
          : "concentration",
      value: num(liquid.value, 33),
    },
    additives: {
      fragranceGrams: num(additives.fragranceGrams, 0),
      sodiumLactateGrams: num(additives.sodiumLactateGrams, 0),
    },
  };
}

export function normalizeBalmInput(raw: unknown): BalmInput {
  const body = asRecord(raw);
  const coolMethod: CoolMethod = body.coolMethod === "slow" ? "slow" : "fast";
  return {
    batchGrams: num(body.batchGrams, 100),
    coolMethod,
    components: idPercentList(body.components),
  };
}

export function normalizeEmulsionInput(raw: unknown): EmulsionInput {
  const body = asRecord(raw);
  return {
    batchGrams: num(body.batchGrams, 100),
    oilPhasePercent: num(body.oilPhasePercent, 20),
    evaporationPercent: num(body.evaporationPercent, 10),
    oils: idPercentList(body.oils),
    emulsifiers: idPercentList(body.emulsifiers),
    preservativeId:
      typeof body.preservativeId === "string" && body.preservativeId.length > 0
        ? body.preservativeId
        : null,
    preservativePercent: num(body.preservativePercent, 0),
  };
}

export function normalizeCandleInput(raw: unknown): CandleInput {
  const body = asRecord(raw);
  const foBasis: FoBasis = body.foBasis === "finished" ? "finished" : "wax";
  return {
    waterMassGramsPerVessel: num(body.waterMassGramsPerVessel, 240),
    vesselCount: num(body.vesselCount, 4),
    waxId:
      typeof body.waxId === "string" && body.waxId.length > 0
        ? body.waxId
        : "soy-container-seed",
    specificGravityOverride: num(body.specificGravityOverride, 0),
    headspacePercent: num(body.headspacePercent, 10),
    wastePercent: num(body.wastePercent, 3),
    foBasis,
    foLoadPercent: num(body.foLoadPercent, 8),
    maxFoPercentOfWax: num(body.maxFoPercentOfWax, 0),
    ifraCapPercentOfFinished: num(body.ifraCapPercentOfFinished, 0),
  };
}

/* ------------------------------------------------------------------ */
/* Runners — the { input, result } envelope every surface returns.     */
/* ------------------------------------------------------------------ */

export interface SoapCalculateOutput {
  input: RecipeConfig;
  result: BatchResult;
}

export function runSoapCalculate(raw: unknown): SoapCalculateOutput {
  const input = normalizeSoapInput(raw);
  return { input, result: computeBatch(input, OIL_DATABASE) };
}

export interface BalmCalculateOutput {
  input: BalmInput;
  result: BalmResult;
}

export function runBalmCalculate(raw: unknown): BalmCalculateOutput {
  const input = normalizeBalmInput(raw);
  return { input, result: computeBalm(input) };
}

export interface EmulsionCalculateOutput {
  input: EmulsionInput;
  result: EmulsionResult;
}

export function runEmulsionCalculate(raw: unknown): EmulsionCalculateOutput {
  const input = normalizeEmulsionInput(raw);
  return { input, result: computeEmulsion(input) };
}

export interface CandleCalculateOutput {
  input: CandleInput;
  result: CandleResult;
}

export function runCandleCalculate(raw: unknown): CandleCalculateOutput {
  const input = normalizeCandleInput(raw);
  return { input, result: computeCandle(input) };
}

export function normalizeMoldFillInput(raw: unknown): MoldFillInput {
  const body = asRecord(raw);
  const shape =
    body.shape === "slab" ||
    body.shape === "cylinder" ||
    body.shape === "water_fill"
      ? body.shape
      : "loaf";
  return {
    shape,
    unit: body.unit === "cm" ? "cm" : "in",
    length: num(body.length, DEFAULT_MOLD_FILL.length),
    width: num(body.width, DEFAULT_MOLD_FILL.width),
    height: num(body.height, DEFAULT_MOLD_FILL.height),
    diameter: num(body.diameter, DEFAULT_MOLD_FILL.diameter),
    waterGrams: num(body.waterGrams, DEFAULT_MOLD_FILL.waterGrams),
    fill: body.fill === "brim" ? "brim" : "headspace",
    cavities: num(body.cavities, DEFAULT_MOLD_FILL.cavities),
    cureLossPercent: num(body.cureLossPercent, DEFAULT_MOLD_FILL.cureLossPercent),
    bars: num(body.bars, DEFAULT_MOLD_FILL.bars),
  };
}

export function normalizeCostInput(raw: unknown): CostInput {
  const body = asRecord(raw);
  const rowsRaw = Array.isArray(body.rows) ? body.rows : null;
  const rows: CostRow[] = [];
  if (rowsRaw) {
    for (const item of rowsRaw) {
      const row = asRecord(item);
      rows.push({
        name: typeof row.name === "string" && row.name.length > 0 ? row.name : "Ingredient",
        amountGrams: num(row.amountGrams, 0),
        pricePaid: num(row.pricePaid, 0),
        purchasedGrams: num(row.purchasedGrams, 0),
        mode: row.mode === "flat" ? "flat" : "weight",
        flatCost: num(row.flatCost, 0),
      });
    }
  }
  return {
    rows: rowsRaw ? rows : DEFAULT_COST_INPUT.rows,
    packagingPerBar: num(body.packagingPerBar, DEFAULT_COST_INPUT.packagingPerBar),
    laborMinutes: num(body.laborMinutes, DEFAULT_COST_INPUT.laborMinutes),
    laborRatePerHour: num(body.laborRatePerHour, DEFAULT_COST_INPUT.laborRatePerHour),
    overheadPerBatch: num(body.overheadPerBatch, DEFAULT_COST_INPUT.overheadPerBatch),
    yieldBars: num(body.yieldBars, DEFAULT_COST_INPUT.yieldBars),
    shrinkBars: num(body.shrinkBars, DEFAULT_COST_INPUT.shrinkBars),
    targetMarginPercent: num(body.targetMarginPercent, DEFAULT_COST_INPUT.targetMarginPercent),
    carryingRatePercent: num(body.carryingRatePercent, DEFAULT_COST_INPUT.carryingRatePercent),
    cureWeeks: num(body.cureWeeks, DEFAULT_COST_INPUT.cureWeeks),
    channelFeePercent: num(body.channelFeePercent, DEFAULT_COST_INPUT.channelFeePercent),
    channelFeeFixed: num(body.channelFeeFixed, DEFAULT_COST_INPUT.channelFeeFixed),
  };
}

export interface MoldFillCalculateOutput {
  input: MoldFillInput;
  result: MoldFillResult;
}

export function runMoldFillCalculate(raw: unknown): MoldFillCalculateOutput {
  const input = normalizeMoldFillInput(raw);
  return { input, result: computeMoldFill(input) };
}

export interface CostCalculateOutput {
  input: CostInput;
  result: CostResult;
}

export function runCostCalculate(raw: unknown): CostCalculateOutput {
  const input = normalizeCostInput(raw);
  return { input, result: computeCost(input) };
}

export function listOils(): { oils: MasterOilRecord[] } {
  return { oils: OIL_DATABASE };
}

export function getOil(slug: string): MasterOilRecord | null {
  return getOilBySlug(slug) ?? null;
}

/* ------------------------------------------------------------------ */
/* Shared POST helper for the calculate routes.                        */
/* ------------------------------------------------------------------ */

export async function calculateResponse(
  request: Request,
  run: (body: unknown) => unknown,
): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }
  return Response.json(run(body));
}

/* ------------------------------------------------------------------ */
/* Tool definitions — the single source for MCP tools/list, the       */
/* public manifest, and the OpenAPI request schemas.                   */
/* ------------------------------------------------------------------ */

export type JsonSchema = Record<string, unknown>;

export interface AgentTool {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  outputDescription: string;
  http: { method: "GET" | "POST"; path: string; example_body?: unknown };
}

const ID_PERCENT_ITEMS: JsonSchema = {
  type: "object",
  properties: {
    id: { type: "string", description: "Library id of the ingredient." },
    percent: {
      type: "number",
      description: "Percent as entered; the engine normalizes where the bench does.",
    },
  },
  required: ["id"],
};

export const SOAP_INPUT_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    unit: {
      type: "string",
      enum: ["g", "oz"],
      description: "Mass unit for oil amounts and for the returned weights. Default: g.",
    },
    oils: {
      type: "array",
      description:
        "Oils in the recipe. Amounts are in `unit`. Unknown ids are excluded and reported in the result's safetyAlerts as UNKNOWN_OIL entries.",
      items: {
        type: "object",
        properties: {
          oilId: {
            type: "string",
            description:
              "Oil id from oils_list — e.g. coconut-76, olive, palm-rspo, castor, shea-unrefined.",
          },
          amount: {
            type: "number",
            description: "Amount of this oil, in `unit`. Default: 0.",
          },
        },
        required: ["oilId"],
      },
    },
    superfatPercentage: {
      type: "number",
      description: "Superfat / lye discount percent (0–100). Default: 5.",
    },
    lyeChoice: {
      type: "object",
      description: "Alkali split and reagent purities.",
      properties: {
        naohRatio: {
          type: "number",
          description:
            "Fraction of the alkali demand met with NaOH (1 = all NaOH, 0 = all KOH). Default: 1.",
        },
        naohPurity: {
          type: "number",
          description:
            "NaOH purity as a mass fraction; the engine clamps to 0.85–1 for safety. Default: 1.",
        },
        kohPurity: {
          type: "number",
          description:
            "KOH purity as a mass fraction; the engine clamps to 0.80–1 for safety. Default: 0.9.",
        },
      },
    },
    liquidConfig: {
      type: "object",
      description: "How the liquid (water) amount is derived.",
      properties: {
        mode: {
          type: "string",
          enum: ["concentration", "ratio", "water_percent_oils"],
          description:
            "concentration = lye solution strength %, ratio = water:lye ratio, water_percent_oils = water as % of oil weight. Default: concentration.",
        },
        value: {
          type: "number",
          description: "The number for the chosen mode. Default: 33.",
        },
      },
    },
    additives: {
      type: "object",
      properties: {
        fragranceGrams: {
          type: "number",
          description: "Fragrance mass in `unit`; counts toward total batch weight. Default: 0.",
        },
        sodiumLactateGrams: {
          type: "number",
          description: "Sodium lactate mass in `unit`. Default: 0.",
        },
      },
    },
    recipe: {
      type: "string",
      description:
        "Alternative input: a Saponis share-link recipe string (the `r` value from a /soap URL). When present and valid it takes precedence over the other fields.",
    },
  },
};

export const BALM_INPUT_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    batchGrams: {
      type: "number",
      description: "Total batch size in grams. Default: 100.",
    },
    coolMethod: {
      type: "string",
      enum: ["slow", "fast"],
      description:
        "How the poured balm cools. A fast cool (tempering) lowers the graininess risk of shea-heavy blends. Default: fast.",
    },
    components: {
      type: "array",
      description:
        "Waxes, butters, and liquid oils with their percents of the formula. Percents need not sum to 100 — the engine normalizes. Component ids: beeswax-yellow, candelilla, carnauba, soy-wax, shea-unrefined, cocoa-butter, mango-butter, sweet-almond-balm, jojoba-balm, mct-balm, olive-balm. Unknown ids are skipped and reported in unknownIds.",
      items: ID_PERCENT_ITEMS,
    },
  },
};

export const EMULSION_INPUT_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    batchGrams: {
      type: "number",
      description: "Total batch size in grams. Default: 100.",
    },
    oilPhasePercent: {
      type: "number",
      description: "Oil phase size as % of the total formula. Default: 20.",
    },
    evaporationPercent: {
      type: "number",
      description:
        "Extra water added upfront to cover heat-phase evaporation, % of the water phase (engine clamps to 0–30). Default: 10.",
    },
    oils: {
      type: "array",
      description:
        "Oil-phase oils; percents are shares of the oil phase and are normalized within it. Oil ids: sweet-almond-hlb, jojoba-hlb, olive-hlb, shea-hlb, cocoa-hlb, sunflower-hlb, mct-hlb.",
      items: ID_PERCENT_ITEMS,
    },
    emulsifiers: {
      type: "array",
      description:
        "Emulsifier blend; percents are of the total formula. Emulsifier ids: glyceryl-stearate-peg100, ceteareth-20, sorbitan-olivate, polysorbate-20, polysorbate-80, olivem-1000, btms-50, lecithin.",
      items: ID_PERCENT_ITEMS,
    },
    preservativeId: {
      type: ["string", "null"],
      description:
        "Preservative id or null. Preservative ids: phenoxyethanol, germaben-ii, germall-plus, liquid-germall-plus, optiphen, potassium-sorbate, sodium-benzoate. Default: null.",
    },
    preservativePercent: {
      type: "number",
      description:
        "Preservative as % of the total formula; the engine checks it against the preservative's maximum. Default: 0.",
    },
  },
};

export const CANDLE_INPUT_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    waterMassGramsPerVessel: {
      type: "number",
      description:
        "Weighed water fill of one vessel, grams, to the intended fill line. Default: 240.",
    },
    vesselCount: {
      type: "number",
      description: "Number of vessels in the batch. Default: 4.",
    },
    waxId: {
      type: "string",
      description:
        "Wax from the specific-gravity library: soy-container-seed, coconut-soy-blend-seed, paraffin-container-seed, beeswax-candle-seed. Or pass any id with specificGravityOverride. Default: soy-container-seed.",
    },
    specificGravityOverride: {
      type: "number",
      description:
        "Your supplier's SG for the wax SKU; overrides the library value when > 0. Default: 0 (use library).",
    },
    headspacePercent: {
      type: "number",
      description: "Unfilled space at the top, % of the water-fill volume. Default: 10.",
    },
    wastePercent: {
      type: "number",
      description:
        "Extra melt allowance for kettle heel / spills, %. Applies to the melt only, not the fill. Default: 3.",
    },
    foBasis: {
      type: "string",
      enum: ["wax", "finished"],
      description:
        "What foLoadPercent is a percent OF: the wax weight, or the finished (wax + fragrance) weight. The result always prints both. Default: wax.",
    },
    foLoadPercent: {
      type: "number",
      description: "Fragrance load percent, expressed in foBasis. Default: 8.",
    },
    maxFoPercentOfWax: {
      type: "number",
      description:
        "Optional user cap (% of wax weight); the result flags overMaxFo when exceeded. 0 = no cap. Default: 0.",
    },
    ifraCapPercentOfFinished: {
      type: "number",
      description:
        "Optional user IFRA cap for the fragrance oil (% of finished weight); the result flags overIfraCap when exceeded. 0 = no cap. Default: 0.",
    },
  },
};

export const MOLD_FILL_INPUT_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    shape: {
      type: "string",
      enum: ["loaf", "slab", "cylinder", "water_fill"],
      description: "Mold shape. Dimensions describe ONE cavity. Default: loaf.",
    },
    unit: {
      type: "string",
      enum: ["in", "cm"],
      description: "Unit for the dimensions. Default: in.",
    },
    length: { type: "number", description: "Loaf/slab length. Default: 10." },
    width: { type: "number", description: "Loaf/slab width. Default: 3.5." },
    height: { type: "number", description: "Mold height/depth. Default: 3.5." },
    diameter: { type: "number", description: "Cylinder diameter. Default: 3." },
    waterGrams: {
      type: "number",
      description: "For water_fill: weighed water the WHOLE mold holds, grams (= cm³). Default: 0.",
    },
    fill: {
      type: "string",
      enum: ["brim", "headspace"],
      description: "brim = fill to the top; headspace = leave the mold engine's 10% headspace. Default: headspace.",
    },
    cavities: {
      type: "number",
      description: "Cavity count for cavity molds; dimensions are per cavity. Default: 1.",
    },
    cureLossPercent: {
      type: "number",
      description: "Percent of batter weight lost as water during cure, for the cured weights. Default: 10.",
    },
    bars: {
      type: "number",
      description: "Bars the batch is cut into for the per-bar cured weight; 0 = use the cavity count. Default: 0.",
    },
  },
};

export const COST_INPUT_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    rows: {
      type: "array",
      description:
        "Ingredient cost rows. Weight mode: line cost = amountGrams / purchasedGrams × pricePaid. Flat mode: flatCost per batch (mica, embeds). Omit rows entirely to cost the built-in SAMPLE recipe (olive/coconut/shea/NaOH/water/fragrance/mica — sample prices, not market data).",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Row label. Default: Ingredient." },
          amountGrams: { type: "number", description: "Grams in the batch (weight mode). Default: 0." },
          pricePaid: { type: "number", description: "Dollars paid for purchasedGrams. Default: 0." },
          purchasedGrams: { type: "number", description: "Grams purchased for pricePaid. Default: 0." },
          mode: { type: "string", enum: ["weight", "flat"], description: "Default: weight." },
          flatCost: { type: "number", description: "Dollars per batch (flat mode). Default: 0." },
        },
      },
    },
    packagingPerBar: { type: "number", description: "Packaging dollars per bar. Default: 0.45." },
    laborMinutes: { type: "number", description: "Hands-on minutes per batch. Default: 45." },
    laborRatePerHour: { type: "number", description: "Labor dollars per hour. Default: 15." },
    overheadPerBatch: { type: "number", description: "Overhead dollars per batch. Default: 2.50." },
    yieldBars: { type: "number", description: "Bars poured per batch. Default: 12." },
    shrinkBars: {
      type: "number",
      description: "Unusable/shrink bars. Cost divides by GOOD bars only (yield − shrink). Default: 0.",
    },
    targetMarginPercent: {
      type: "number",
      description: "Target margin ON PRICE for the suggested retail: retail = unitCost / (1 − margin%). Default: 65.",
    },
    carryingRatePercent: {
      type: "number",
      description: "Cure-time carrying cost: annual rate % applied to the ingredient subtotal for cureWeeks. 0 = off. Default: 0.",
    },
    cureWeeks: { type: "number", description: "Weeks on the cure shelf. Default: 4." },
    channelFeePercent: {
      type: "number",
      description: "Optional channel fee % (e.g. a marketplace), netted against suggested retail. Default: 0.",
    },
    channelFeeFixed: {
      type: "number",
      description: "Optional fixed channel fee dollars per sale. Default: 0.",
    },
  },
};

export const AGENT_TOOLS: AgentTool[] = [
  {
    name: "soap_calculate",
    description:
      "Compute a cold-process soap batch with the Saponis soap engine — the same math as the /soap bench. All inputs optional; omitted fields use the bench defaults (grams, 5% superfat, all-NaOH, 33% lye concentration).",
    inputSchema: SOAP_INPUT_SCHEMA,
    outputDescription:
      "Returns { input, result }: the normalized recipe, and the batch result — total oil weight, dry lye split (NaOH/KOH/total), liquid weight, total batch weight, lye concentration %, water:lye ratio, water as % of oils, the fatty-acid profile, quality scores (hardness, cleansing, conditioning, bubbly, creamy, longevity, iodine, INS), and safety alerts.",
    http: {
      method: "POST",
      path: "/soap/calculate",
      example_body: {
        oils: [
          { oilId: "coconut-76", amount: 340 },
          { oilId: "olive", amount: 330 },
          { oilId: "palm-rspo", amount: 330 },
        ],
        superfatPercentage: 5,
        liquidConfig: { mode: "concentration", value: 33 },
      },
    },
  },
  {
    name: "balm_calculate",
    description:
      "Compute a balm or salve formula with the Saponis balm engine — the same math as the /balms bench. Percents are normalized to 100; every mass derives from batchGrams.",
    inputSchema: BALM_INPUT_SCHEMA,
    outputDescription:
      "Returns { input, result }: the normalized input, and per-component rows (normalized %, grams), the wax/butter/liquid-oil split, weighted-average melt point (°C and °F), firmness (soft/balanced/firm/very_firm), graininess risk (low/moderate/high), warnings, and unknownIds.",
    http: {
      method: "POST",
      path: "/balm/calculate",
      example_body: {
        batchGrams: 100,
        coolMethod: "fast",
        components: [
          { id: "beeswax-yellow", percent: 20 },
          { id: "shea-unrefined", percent: 30 },
          { id: "sweet-almond-balm", percent: 50 },
        ],
      },
    },
  },
  {
    name: "emulsion_calculate",
    description:
      "Compute an oil-in-water emulsion (lotion/cream) with the Saponis emulsion engine — the same math as the /emulsions bench. Matches the emulsifier blend's HLB to the oil phase's required HLB and checks the preservative against its maximum.",
    inputSchema: EMULSION_INPUT_SCHEMA,
    outputDescription:
      "Returns { input, result }: the normalized input, and phase percents (oil/emulsifier/preservative/water), required HLB vs blend HLB with gap and verdict (good/acceptable/mismatch/unknown), preservative verdict and max, per-oil and per-emulsifier rows with grams, water grams plus evaporation makeup, warnings, and unknownIds.",
    http: {
      method: "POST",
      path: "/emulsion/calculate",
      example_body: {
        batchGrams: 200,
        oilPhasePercent: 20,
        oils: [
          { id: "sweet-almond-hlb", percent: 70 },
          { id: "shea-hlb", percent: 30 },
        ],
        emulsifiers: [{ id: "glyceryl-stearate-peg100", percent: 4 }],
        preservativeId: "germaben-ii",
        preservativePercent: 1,
        evaporationPercent: 10,
      },
    },
  },
  {
    name: "candle_calculate",
    description:
      "Compute a candle batch with the Saponis Candle Studio engine — the same math as the /candles bench. Sizes the vessel fill from weighed water × wax specific gravity, and splits wax vs fragrance under an explicitly named load basis, printing the load both ways.",
    inputSchema: CANDLE_INPUT_SCHEMA,
    outputDescription:
      "Returns { input, result }: the normalized input, and the batch — SG used (library or custom), finished/wax/fragrance per vessel and in total, wax to melt and fragrance to weigh (waste allowance included), the load as % of wax and as % of finished weight, over-cap flags, and warnings.",
    http: {
      method: "POST",
      path: "/candle/calculate",
      example_body: {
        waterMassGramsPerVessel: 240,
        vesselCount: 4,
        waxId: "soy-container-seed",
        headspacePercent: 10,
        wastePercent: 3,
        foBasis: "wax",
        foLoadPercent: 8,
      },
    },
  },
  {
    name: "mold_fill_calculate",
    description:
      "Size a soap batch to a mold with the Saponis mold engine — the same math as the free mold-fill front door on the /costing bench (volume × batter density 1.05 × oil fraction 0.69, the mold engine's own constants). Standalone: no recipe needed. Supports cavity molds and cured bar weights.",
    inputSchema: MOLD_FILL_INPUT_SCHEMA,
    outputDescription:
      "Returns { input, result }: the normalized input, and per-cavity volume, total volume, usable (filled) volume, batter grams, oil charge grams (the headline), cured batch grams after water loss, and per-bar cured grams.",
    http: {
      method: "POST",
      path: "/mold-fill/calculate",
      example_body: {
        shape: "loaf",
        unit: "in",
        length: 10,
        width: 3.5,
        height: 3.5,
        fill: "headspace",
        cavities: 1,
        cureLossPercent: 10,
      },
    },
  },
  {
    name: "cost_calculate",
    description:
      "Compute the true cost per bar (or unit) with the Saponis costing engine — the same math as the /costing bench. Ingredients by weight or flat per batch, plus packaging, labor, overhead, and an optional cure-time carrying cost; the batch total divides by GOOD bars only (yield minus shrink), and a suggested retail at the target margin is printed with any channel fees netted.",
    inputSchema: COST_INPUT_SCHEMA,
    outputDescription:
      "Returns { input, result }: the normalized input, and per-line costs, the ingredient subtotal, carrying/packaging/labor/overhead totals, the batch total, good bars, unit cost, ingredients-only per bar, suggested retail, channel fee at that retail, net after fees, margin dollars, and the cost-stack shares.",
    http: {
      method: "POST",
      path: "/cost/calculate",
      example_body: {
        yieldBars: 12,
        shrinkBars: 0,
        packagingPerBar: 0.45,
        laborMinutes: 45,
        laborRatePerHour: 15,
        targetMarginPercent: 65,
      },
    },
  },
  {
    name: "oils_list",
    description:
      "List the full Saponis oil library — the database behind the soap engine and the /oils pages. Use an oil's id as oilId in soap_calculate, and its slug with oil_get.",
    inputSchema: { type: "object", properties: {} },
    outputDescription:
      "Returns { oils: [...] } — every oil record: id, slug, name, botanical name, SAP values (sap_naoh, sap_koh), iodine, INS, fatty_acids profile, recommended_max_percentage, hardness_profile, INCI names, trace_speed_impact, aliases, workhorse flag.",
    http: { method: "GET", path: "/oils" },
  },
  {
    name: "oil_get",
    description:
      "Fetch one oil from the Saponis library by slug (the id and listed aliases also resolve).",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "Oil slug — e.g. coconut-oil-76, olive-oil, shea-butter-unrefined.",
        },
      },
      required: ["slug"],
    },
    outputDescription:
      "Returns the full oil record (same fields as oils_list), or an error when no oil matches.",
    http: { method: "GET", path: "/oils/{slug}" },
  },
];

export function isAgentTool(name: string): boolean {
  return AGENT_TOOLS.some((tool) => tool.name === name);
}

/** Tool-call failure that maps to an MCP isError result, not a protocol error. */
export class AgentToolFailure extends Error {}

export function callAgentTool(name: string, args: unknown): unknown {
  switch (name) {
    case "soap_calculate":
      return runSoapCalculate(args);
    case "balm_calculate":
      return runBalmCalculate(args);
    case "emulsion_calculate":
      return runEmulsionCalculate(args);
    case "candle_calculate":
      return runCandleCalculate(args);
    case "mold_fill_calculate":
      return runMoldFillCalculate(args);
    case "cost_calculate":
      return runCostCalculate(args);
    case "oils_list":
      return listOils();
    case "oil_get": {
      const slug = asRecord(args).slug;
      if (typeof slug !== "string" || slug.length === 0) {
        throw new AgentToolFailure("oil_get requires a non-empty 'slug'.");
      }
      const oil = getOil(slug);
      if (!oil) {
        throw new AgentToolFailure(
          `No oil found for '${slug}'. List valid slugs with oils_list.`,
        );
      }
      return oil;
    }
    default:
      throw new AgentToolFailure(`Unknown tool: ${name}`);
  }
}
