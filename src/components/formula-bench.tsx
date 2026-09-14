import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { OIL_DATABASE, getOilById } from "@/data/oils";
import { computeBatch } from "@/lib/calcEngine";
import {
  PRESETS,
  STORAGE_KEY,
  parseStoredRecipe,
  useRecipeStore,
} from "@/lib/recipe-store";
import { formatMass, formatPercent } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { OilFormula } from "@/components/oil-formula";
import { BatchResults } from "@/components/batch-results";
import { cn } from "@/lib/utils";
import type { RecipeConfig } from "@/types/soap";

function recipePlainText(config: RecipeConfig): string {
  const result = computeBatch(config, OIL_DATABASE);
  const lines = [
    "Saponis — cold-process formula",
    `Unit: ${config.unit}  ·  Superfat: ${config.superfatPercentage}%`,
    "",
    "Oils",
    ...config.oils.map((row) => {
      const oil = getOilById(row.oilId);
      return `  ${oil?.name ?? row.oilId}: ${formatMass(row.amount, config.unit)}`;
    }),
    "",
    "Alkali",
    `  NaOH: ${formatMass(result.dryLyeWeight.naoh, config.unit)}`,
    `  KOH: ${formatMass(result.dryLyeWeight.koh, config.unit)}`,
    `  Liquid: ${formatMass(result.liquidWeight, config.unit)} (${formatPercent(result.lyeConcentrationPercent)} lye)`,
    `  Batch: ${formatMass(result.totalBatchWeight, config.unit)}`,
  ];
  if (result.safetyAlerts.length) {
    lines.push("", "Alerts", ...result.safetyAlerts.map((alert) => `  ${alert}`));
  }
  return lines.join("\n");
}

function Mark() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="size-8 shrink-0"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" className="text-primary" />
      <path
        d="M10 20c0-5 6-9 6-13 0 4 6 8 6 13 0 3.3-2.7 6-6 6s-6-2.7-6-6z"
        fill="currentColor"
        className="text-primary-fg"
      />
      <path
        d="M16 9c.4 2.2-.2 4-1.4 5.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        className="text-primary"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FormulaBench() {
  const config = useRecipeStore((s) => s.config);
  const setConfig = useRecipeStore((s) => s.setConfig);
  const setUnit = useRecipeStore((s) => s.setUnit);
  const reset = useRecipeStore((s) => s.reset);
  const loadPreset = useRecipeStore((s) => s.loadPreset);
  const [booted, setBooted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activePreset, setActivePreset] = useState("everyday");

  useLayoutEffect(() => {
    const stored = parseStoredRecipe(localStorage.getItem(STORAGE_KEY));
    if (stored) setConfig(stored);
    setBooted(true);
  }, [setConfig]);

  useEffect(() => {
    if (!booted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config, booted]);

  const result = useMemo(() => computeBatch(config, OIL_DATABASE), [config]);

  async function copyFormula() {
    const text = recipePlainText(config);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-5 border-b border-line pb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Mark />
            <div className="min-w-0">
              <p className="text-[11px] font-medium tracking-[0.22em] text-muted uppercase">
                Cold-process bench
              </p>
              <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
                Saponis
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md bg-bg-subtle p-1">
              {(["g", "oz"] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setUnit(unit)}
                  className={cn(
                    "h-9 min-w-10 rounded-sm px-3 text-sm font-medium transition-colors duration-150",
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
              aria-label="Reset formula"
              onClick={() => {
                reset();
                setActivePreset("everyday");
              }}
            >
              <RotateCcw />
            </Button>
          </div>
        </div>
        <p className="max-w-xl text-sm text-muted sm:text-base">
          Weigh the oils. The engine returns dry lye, liquid, and a quality fingerprint — entirely in the browser, with no network round-trip.
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant={activePreset === preset.id ? "default" : "secondary"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => {
                const next =
                  config.unit === "g"
                    ? preset.config
                    : {
                        ...preset.config,
                        unit: "oz" as const,
                        oils: preset.config.oils.map((row) => ({
                          ...row,
                          amount: row.amount / 28.349523125,
                        })),
                        additives: {
                          fragranceGrams:
                            (preset.config.additives?.fragranceGrams ?? 0) /
                            28.349523125,
                          sodiumLactateGrams:
                            (preset.config.additives?.sodiumLactateGrams ?? 0) /
                            28.349523125,
                        },
                      };
                loadPreset(next);
                setActivePreset(preset.id);
              }}
            >
              {preset.name}
            </Button>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={copyFormula}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy formula"}
          </Button>
        </div>
      </header>

      <div className="lg:hidden sticky top-3 z-10 mt-4 rounded-xl bg-surface/95 px-3 py-3 shadow-[var(--shadow-border)] backdrop-blur-sm">
        <dl className="grid grid-cols-3 gap-2 text-center">
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-muted uppercase">NaOH</dt>
            <dd className="font-mono text-sm tabular-nums text-ink">
              {formatMass(result.dryLyeWeight.naoh, config.unit)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-muted uppercase">Liquid</dt>
            <dd className="font-mono text-sm tabular-nums text-ink">
              {formatMass(result.liquidWeight, config.unit)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-muted uppercase">Conc.</dt>
            <dd className="font-mono text-sm tabular-nums text-ink">
              {formatPercent(result.lyeConcentrationPercent)}
            </dd>
          </div>
        </dl>
        {result.safetyAlerts.length > 0 ? (
          <p className="mt-2 text-center text-xs text-warn">
            {result.safetyAlerts.length} safety flag{result.safetyAlerts.length === 1 ? "" : "s"} — see the batch below
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)]">
        <OilFormula />
        <aside className="lg:sticky lg:top-4">
          <BatchResults config={config} result={result} />
        </aside>
      </div>
    </div>
  );
}
