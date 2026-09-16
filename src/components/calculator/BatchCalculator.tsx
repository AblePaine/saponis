import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Link2, RotateCcw } from "lucide-react";
import { OIL_DATABASE, getOilBySlug } from "@/data/oils";
import { computeBatch } from "@/lib/calcEngine";
import {
  PRESETS,
  STORAGE_KEY,
  UI_STORAGE_KEY,
  oilTotal,
  parseStoredRecipe,
  useRecipeStore,
} from "@/lib/recipe-store";
import { readRecipeFromUrl, writeRecipeToUrl } from "@/lib/recipe-url";
import { safetyLabel, safetyLevel } from "@/lib/safety";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthSlot } from "@/components/auth-slot";
import { BrandMark } from "@/components/brand-mark";
import { StepOils } from "@/components/calculator/step-oils";
import { StepLye } from "@/components/calculator/step-lye";
import { StepMetrics } from "@/components/calculator/step-metrics";
import { StepOutput } from "@/components/calculator/step-output";
import { StickyBar } from "@/components/calculator/sticky-bar";
import { PrintSheet } from "@/components/calculator/print-sheet";

export function BatchCalculator() {
  const config = useRecipeStore((s) => s.config);
  const entryMode = useRecipeStore((s) => s.entryMode);
  const setConfig = useRecipeStore((s) => s.setConfig);
  const setUnit = useRecipeStore((s) => s.setUnit);
  const setEntryMode = useRecipeStore((s) => s.setEntryMode);
  const addOil = useRecipeStore((s) => s.addOil);
  const loadSingleOil = useRecipeStore((s) => s.loadSingleOil);
  const reset = useRecipeStore((s) => s.reset);
  const loadPreset = useRecipeStore((s) => s.loadPreset);
  const [booted, setBooted] = useState(false);
  const [copied, setCopied] = useState(false);

  useLayoutEffect(() => {
    const { recipe, addOilId, loadOil } = readRecipeFromUrl();
    const stored = parseStoredRecipe(localStorage.getItem(STORAGE_KEY));
    try {
      const ui = JSON.parse(localStorage.getItem(UI_STORAGE_KEY) ?? "null") as {
        entryMode?: "weight" | "percent";
      } | null;
      if (ui?.entryMode === "weight" || ui?.entryMode === "percent") {
        setEntryMode(ui.entryMode);
      }
    } catch {
      /* ignore */
    }
    if (loadOil) {
      const record = getOilBySlug(loadOil.slug);
      if (record) loadSingleOil(record.id, loadOil.weight);
      else if (recipe) setConfig(recipe);
      else if (stored) setConfig(stored);
    } else if (recipe) setConfig(recipe);
    else if (stored) setConfig(stored);
    if (addOilId && !loadOil) addOil(addOilId);
    setBooted(true);
  }, [addOil, loadSingleOil, setConfig, setEntryMode]);

  useEffect(() => {
    if (!booted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    localStorage.setItem(UI_STORAGE_KEY, JSON.stringify({ entryMode }));
    writeRecipeToUrl(config);
  }, [config, entryMode, booted]);

  const result = useMemo(() => computeBatch(config, OIL_DATABASE), [config]);
  const level = safetyLevel(result);

  async function copyShareLink() {
    writeRecipeToUrl(config);
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pt-6 pb-8 sm:px-6 lg:px-8 lg:pb-12">
      <header className="no-print flex flex-col gap-5 border-b border-line pb-5">
        <div className="flex items-start justify-between gap-3">
          <Link to="/" search={{}} className="flex min-w-0 items-center gap-3">
            <BrandMark />
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
                Cold-process bench
              </p>
              <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
                Saponis
              </h1>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "hidden h-12 items-center rounded-full px-3 text-xs font-medium tracking-wide uppercase sm:inline-flex",
                level === "safe" && "bg-ok-soft text-ok",
                level === "caution" && "bg-warn-soft text-warn",
                level === "hazard" && "bg-danger-soft text-danger",
              )}
            >
              {safetyLabel(level)}
            </span>
            <div className="flex rounded-md bg-bg-subtle p-1">
              {(["g", "oz"] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setUnit(unit)}
                  className={cn(
                    "h-12 min-w-12 rounded-sm px-3 text-sm font-medium transition-colors duration-150",
                    config.unit === unit
                      ? "bg-surface text-ink shadow-sm"
                      : "text-muted hover:text-ink",
                  )}
                >
                  {unit}
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-12"
              aria-label="Reset formula"
              onClick={reset}
            >
              <RotateCcw />
            </Button>
          </div>
        </div>
        <p className="hidden max-w-xl text-sm text-muted sm:block">
          Thumb-first formulation. Percent or weight, live lye, and a shareable recipe link —
          all on-device.
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant="secondary"
              className="h-12 whitespace-nowrap"
              onClick={() => {
                const factor = config.unit === "oz" ? 1 / 28.349523125 : 1;
                loadPreset({
                  ...preset.config,
                  unit: config.unit,
                  oils: preset.config.oils.map((row) => ({
                    ...row,
                    amount: row.amount * factor,
                  })),
                  additives: {
                    fragranceGrams:
                      (preset.config.additives?.fragranceGrams ?? 0) * factor,
                    sodiumLactateGrams:
                      (preset.config.additives?.sodiumLactateGrams ?? 0) * factor,
                  },
                });
              }}
            >
              {preset.name}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            className="h-12"
            onClick={copyShareLink}
          >
            {copied ? <Check /> : <Link2 />}
            {copied ? "Link copied" : "Share recipe"}
          </Button>
          <Button asChild variant="outline" className="h-12">
            <Link to="/" search={{}}>Hub</Link>
          </Button>
          <Button asChild variant="outline" className="h-12">
            <Link to="/oils">Oil library</Link>
          </Button>
          <Button asChild variant="outline" className="h-12">
            <Link to="/app" search={{}}>Pro bench</Link>
          </Button>
          <AuthSlot />
        </div>
      </header>

      <div className="mt-6 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)] lg:gap-8">
        <div className="flex flex-col gap-4">
          <StepOils />
          <StepLye />
        </div>
        <div className="flex flex-col gap-4 lg:sticky lg:top-4">
          <p className="hidden font-mono text-sm tabular-nums text-muted lg:block">
            {oilTotal(config).toFixed(config.unit === "oz" ? 3 : 0)} {config.unit} oils
          </p>
          <StepMetrics result={result} />
          <StepOutput config={config} result={result} />
        </div>
      </div>

      <div className="pointer-events-none h-28 shrink-0 lg:hidden" aria-hidden="true" />
      <StickyBar config={config} result={result} />
      <PrintSheet config={config} result={result} />
    </div>
  );
}
