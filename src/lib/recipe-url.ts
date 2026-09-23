import type { LiquidMode, RecipeConfig } from "../types/soap.ts";

const LIQUID_TO_CODE: Record<LiquidMode, string> = {
  concentration: "c",
  ratio: "r",
  water_percent_oils: "w",
};

const CODE_TO_LIQUID: Record<string, LiquidMode> = {
  c: "concentration",
  r: "ratio",
  w: "water_percent_oils",
};

function compact(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return String(Number(value.toFixed(4)));
}

export function encodeRecipe(config: RecipeConfig): string {
  const oils = config.oils
    .filter((row) => row.oilId && row.amount > 0)
    .map((row) => `${row.oilId}:${compact(row.amount)}`)
    .join(",");
  return [
    config.unit,
    compact(config.superfatPercentage),
    compact(config.lyeChoice.naohRatio),
    compact(config.lyeChoice.naohPurity),
    compact(config.lyeChoice.kohPurity),
    LIQUID_TO_CODE[config.liquidConfig.mode],
    compact(config.liquidConfig.value),
    oils,
    compact(config.additives?.fragranceGrams ?? 0),
    compact(config.additives?.sodiumLactateGrams ?? 0),
  ].join("|");
}

export function decodeRecipe(raw: string | null | undefined): RecipeConfig | null {
  if (!raw) return null;
  const parts = raw.split("|");
  if (parts.length < 8) return null;
  const unit = parts[0] === "oz" ? "oz" : parts[0] === "g" ? "g" : null;
  if (!unit) return null;
  const mode = CODE_TO_LIQUID[parts[5] ?? ""];
  if (!mode) return null;

  const oils = (parts[7] ?? "")
    .split(",")
    .map((token) => {
      const [oilId, amountRaw] = token.split(":");
      const amount = Number(amountRaw);
      if (!oilId || !Number.isFinite(amount) || amount < 0) return null;
      return { oilId, amount };
    })
    .filter((row): row is { oilId: string; amount: number } => row !== null);

  const num = (index: number, fallback: number) => {
    const value = Number(parts[index]);
    return Number.isFinite(value) ? value : fallback;
  };

  return {
    unit,
    oils,
    // Clamp superfat to [0, 100]: a negative value from a crafted URL would
    // produce lye excess (safety-relevant direction); >100% is meaningless.
    superfatPercentage: Math.min(100, Math.max(0, num(1, 5))),
    lyeChoice: {
      naohRatio: Math.min(1, Math.max(0, num(2, 1))),
      // C1: bound purity — an unbounded value from a crafted URL silently
      // multiplies lye (purity 0.1 = 10x lye) while the app shows "Safe."
      // Nothing sold is below ~0.85 NaOH / ~0.80 KOH.
      naohPurity: Math.min(1, Math.max(0.85, num(3, 1) || 1)),
      kohPurity: Math.min(1, Math.max(0.8, num(4, 0.9) || 0.9)),
    },
    liquidConfig: {
      mode,
      value: num(6, 33),
    },
    additives: {
      fragranceGrams: num(8, 0),
      sodiumLactateGrams: num(9, 0),
    },
  };
}

export function recipeSearchString(config: RecipeConfig): string {
  return `?r=${encodeURIComponent(encodeRecipe(config))}`;
}

export function writeRecipeToUrl(config: RecipeConfig): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("r", encodeRecipe(config));
  url.searchParams.delete("add");
  url.searchParams.delete("oil");
  url.searchParams.delete("wt");
  const next = `${url.pathname}${url.search}${url.hash}`;
  if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
    window.history.replaceState(window.history.state, "", next);
  }
}

export interface UrlRecipeRead {
  recipe: RecipeConfig | null;
  addOilId: string | null;
  loadOil: { slug: string; weight: number } | null;
}

export function readRecipeFromUrl(
  search = typeof window === "undefined" ? "" : window.location.search,
): UrlRecipeRead {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const oil = params.get("oil");
  const wtRaw = params.get("wt");
  const wt = wtRaw == null || wtRaw === "" ? 500 : Number(wtRaw);
  return {
    recipe: decodeRecipe(params.get("r")),
    addOilId: params.get("add"),
    loadOil: oil
      ? {
          slug: oil,
          weight: Number.isFinite(wt) && wt > 0 ? wt : 500,
        }
      : null,
  };
}
